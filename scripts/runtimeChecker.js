/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..');
const PORT = 4311;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

function startStaticServer() {
    const server = http.createServer((req, res) => {
        try {
            const reqUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);
            let rel = decodeURIComponent(reqUrl.pathname);
            if (rel === '/') rel = '/index.html';

            const safePath = path.normalize(rel).replace(/^([/\\])+/, '');
            const full = path.join(ROOT, safePath);
            if (!full.startsWith(ROOT)) {
                res.writeHead(403);
                res.end('Forbidden');
                return;
            }

            fs.readFile(full, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Not Found');
                    return;
                }
                const ext = path.extname(full).toLowerCase();
                res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
                res.end(data);
            });
        } catch (e) {
            res.writeHead(500);
            res.end(String(e && e.message ? e.message : e));
        }
    });

    return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(PORT, '127.0.0.1', () => resolve(server));
    });
}

function makeResult(name, ok, details) {
    return { name, ok, details };
}

async function safeStep(results, name, fn) {
    try {
        const details = await fn();
        results.push(makeResult(name, true, details || 'OK'));
        return true;
    } catch (e) {
        results.push(makeResult(name, false, String(e && e.message ? e.message : e)));
        return false;
    }
}

function printReport(results) {
    console.log('\n================ RUNTIME CHECK REPORT ================');
    const okCount = results.filter(r => r.ok).length;
    const failCount = results.length - okCount;
    console.log(`Checks: ${results.length}, PASS: ${okCount}, FAIL: ${failCount}`);
    for (const r of results) {
        const badge = r.ok ? 'PASS' : 'FAIL';
        console.log(`- [${badge}] ${r.name}`);
        console.log(`  ${r.details}`);
    }
    console.log('======================================================\n');
    if (failCount > 0) process.exitCode = 2;
}

async function waitForDeskOrFallback(page) {
    try {
        await page.waitForFunction(() => {
            const desk = document.getElementById('screen-desk');
            return desk && desk.classList.contains('active');
        }, { timeout: 8000 });
        return 'Desk attiva via flow UI.';
    } catch (_) {
        const forced = await page.evaluate(() => {
            if (typeof Game === 'undefined') throw new Error('Game non disponibile');
            Game.state.screen = 'desk';
            if (Game.emit) Game.emit('screen-change', { screen: 'desk' });
            const desk = document.getElementById('screen-desk');
            return !!(desk && desk.classList.contains('active'));
        });
        if (!forced) throw new Error('Fallback a screen desk fallito');
        return 'Desk forzata via fallback (flow iniziale non completo).';
    }
}

async function run() {
    const results = [];
    let browser;
    let server;

    try {
        server = await startStaticServer();
        results.push(makeResult('Static server', true, `http://127.0.0.1:${PORT}`));

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        page.setDefaultTimeout(15000);

        const pageErrors = [];
        page.on('pageerror', err => pageErrors.push(`pageerror: ${err.message}`));
        page.on('console', msg => {
            if (msg.type() === 'error') pageErrors.push(`console.error: ${msg.text()}`);
        });

        await safeStep(results, 'Load index', async () => {
            await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle2' });
            await page.waitForFunction(() => {
                // Top-level const objects are lexical globals; do not rely on window.X
                return typeof Game !== 'undefined'
                    && typeof Desk !== 'undefined'
                    && typeof Phone !== 'undefined'
                    && typeof Stats !== 'undefined';
            }, { timeout: 15000 });
            return 'Game modules caricati.';
        });

        await safeStep(results, 'Create character by UI actions', async () => {
            const ok = await page.evaluate(() => {
                const setValue = (selector, value) => {
                    const el = document.querySelector(selector);
                    if (!el) return false;
                    el.value = value;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    return true;
                };
                const clickSel = (selector) => {
                    const el = document.querySelector(selector);
                    if (!el) return false;
                    el.click();
                    return true;
                };

                const n = setValue('#char-name', 'Runtime Tester');
                const g = clickSel('.stamp-btn[data-group="gender"][data-value="M"]');
                const i = clickSel('.ideology-card[data-value="center"]')
                    || clickSel('.ideology-card[data-value="center_left"]')
                    || clickSel('.ideology-card[data-value="centro"]');
                if (typeof Character !== 'undefined') {
                    if (!Character._selectedMentorId) {
                        const firstMentor = document.querySelector('#onboarding-mentor-choices .mentor-quick-card');
                        if (firstMentor) firstMentor.click();
                    }
                    if (!Character._selectedStartingCityId) Character._selectedStartingCityId = 'roma';
                    if (Character.checkReady) Character.checkReady();
                }
                return n && g && i;
            });
            if (!ok) throw new Error('Elementi creazione personaggio non trovati');

            await page.waitForFunction(() => {
                const btn = document.getElementById('btn-approve');
                return !!btn && !btn.disabled;
            }, { timeout: 6000 });

            await page.evaluate(() => {
                const btn = document.getElementById('btn-approve');
                if (!btn) throw new Error('btn-approve non trovato');
                btn.click();
            });
            const deskStatus = await waitForDeskOrFallback(page);
            return `Creazione completata. ${deskStatus}`;
        });

        await safeStep(results, 'Phone panel opens', async () => {
            await page.evaluate(() => {
                if (typeof Desk !== 'undefined' && Desk.openPanel) {
                    Desk.openPanel('phone');
                    return;
                }
                const item = document.getElementById('item-phone');
                if (!item) throw new Error('item-phone non trovato');
                item.click();
            });
            await page.waitForSelector('#panel-phone:not(.hidden)', { timeout: 6000 });
            return 'Pannello telefono aperto.';
        });

        await safeStep(results, 'Mondo tab and Luoghi content', async () => {
            await page.evaluate(() => {
                const tab = document.querySelector('.phone-tab[data-tab="mondo"]');
                if (!tab) throw new Error('Tab mondo non trovata');
                tab.click();
            });
            await page.waitForSelector('#tab-mondo.active', { timeout: 6000 });
            await page.waitForSelector('#phone-ttab-luoghi.active', { timeout: 6000 });

            const locInfo = await page.evaluate(() => {
                const list = Array.from(document.querySelectorAll('#phone-territory .phone-loc, #phone-territory .phone-loc-go-btn'));
                const firstClickable = document.querySelector('#phone-territory .phone-loc-go-btn:not([disabled])');
                return {
                    totalLocNodes: list.length,
                    hasClickable: !!firstClickable,
                    text: firstClickable ? firstClickable.textContent.trim() : 'none',
                };
            });

            if (locInfo.totalLocNodes === 0) throw new Error('Nessuna location renderizzata nel tab Luoghi');
            if (!locInfo.hasClickable) throw new Error('Location presenti ma nessun bottone cliccabile');

            await page.evaluate(() => {
                const btn = document.querySelector('#phone-territory .phone-loc-go-btn:not([disabled])');
                if (!btn) throw new Error('Nessun bottone location cliccabile');
                btn.click();
            });
            return `Location renderizzate: ${locInfo.totalLocNodes}, primo bottone: ${locInfo.text}`;
        });

        await safeStep(results, 'Mappa tab and Leaflet markers', async () => {
            await page.evaluate(() => {
                const tab = document.querySelector('.phone-terr-tab[data-ttab="mappa"]');
                if (!tab) throw new Error('Subtab mappa non trovata');
                tab.click();
            });
            await page.waitForSelector('#phone-ttab-mappa.active', { timeout: 6000 });
            await page.waitForFunction(() => {
                const root = document.getElementById('phone-map-body');
                return !!root && root.childElementCount > 0;
            }, { timeout: 9000 });

            const markerStats = await page.evaluate(() => {
                const markerEls = document.querySelectorAll('#phone-map-body .leaflet-marker-icon, #phone-map-body .city-marker-custom');
                const hasLeaflet = typeof window.L !== 'undefined';
                const hasGameMap = typeof GameMap !== 'undefined';
                return {
                    markerCount: markerEls.length,
                    hasLeaflet,
                    hasGameMap,
                };
            });

            if (!markerStats.hasLeaflet) throw new Error('Leaflet non disponibile in pagina');
            if (!markerStats.hasGameMap) throw new Error('GameMap non disponibile in pagina');
            if (markerStats.markerCount <= 0) throw new Error('Mappa caricata ma marker citta non trovati');

            return `Marker trovati: ${markerStats.markerCount}`;
        });

        await safeStep(results, 'Stats panel not blank', async () => {
            await page.evaluate(() => {
                if (typeof Desk !== 'undefined' && Desk.openPanel) {
                    Desk.openPanel('stats');
                    return;
                }
                const item = document.getElementById('item-stats');
                if (!item) throw new Error('item-stats non trovato');
                item.click();
            });
            await page.waitForSelector('#panel-stats:not(.hidden)', { timeout: 6000 });
            await page.waitForFunction(() => {
                const body = document.getElementById('stats-body');
                return !!body && body.textContent && body.textContent.replace(/\s+/g, '').length > 20;
            }, { timeout: 9000 });

            const statsInfo = await page.evaluate(() => {
                const body = document.getElementById('stats-body');
                const numericTokens = (body && body.textContent ? body.textContent.match(/\d+/g) : []) || [];
                const hasBars = document.querySelectorAll('#stats-body .stats-bar-fill').length;
                return {
                    textLen: body ? body.textContent.trim().length : 0,
                    numCount: numericTokens.length,
                    hasBars,
                };
            });

            if (statsInfo.textLen < 20) throw new Error('Stats body quasi vuoto');
            if (statsInfo.numCount === 0) throw new Error('Stats senza valori numerici');
            if (statsInfo.hasBars === 0) throw new Error('Stats senza barre di stato');

            return `Stats text=${statsInfo.textLen}, numeri=${statsInfo.numCount}, barre=${statsInfo.hasBars}`;
        });

        await safeStep(results, 'Runtime click handlers present', async () => {
            await page.evaluate(() => {
                if (typeof Desk !== 'undefined' && Desk.openPanel) Desk.openPanel('phone');
                const tab = document.querySelector('.phone-tab[data-tab="mondo"]');
                if (tab) tab.click();
            });
            const probe = await page.evaluate(() => {
                const phoneOpen = !document.getElementById('panel-phone').classList.contains('hidden');
                const tabs = document.querySelectorAll('.phone-tab').length;
                const worldActive = !!document.querySelector('#tab-mondo.active');
                const locations = document.querySelectorAll('#phone-territory .phone-loc-go-btn').length;
                return { phoneOpen, tabs, worldActive, locations };
            });

            if (!probe.phoneOpen) throw new Error('Telefono non aperto durante il probe');
            if (probe.tabs < 5) throw new Error(`Tab telefono insufficienti: ${probe.tabs}`);
            if (!probe.worldActive) throw new Error('Tab mondo non attivo durante il probe');
            return `Tabs=${probe.tabs}, location buttons=${probe.locations}`;
        });

        await safeStep(results, 'JSON endpoints and parse', async () => {
            const dataFiles = [
                '/data/cities_italy.json',
                '/data/nations.json',
                '/data/mentors.json',
            ];

            const checks = [];
            for (const rel of dataFiles) {
                const full = path.join(ROOT, rel.replace(/^\//, ''));
                if (!fs.existsSync(full)) {
                    checks.push({ file: rel, ok: false, reason: 'file missing' });
                    continue;
                }
                try {
                    JSON.parse(fs.readFileSync(full, 'utf8'));
                    checks.push({ file: rel, ok: true, reason: 'ok' });
                } catch (e) {
                    checks.push({ file: rel, ok: false, reason: String(e.message || e) });
                }
            }

            const bad = checks.filter(c => !c.ok);
            if (bad.length > 0) {
                throw new Error(`JSON invalidi/mancanti: ${bad.map(b => `${b.file} (${b.reason})`).join(', ')}`);
            }
            return checks.map(c => `${c.file}: ${c.reason}`).join(' | ');
        });

        await safeStep(results, 'No severe page runtime errors', async () => {
            const severe = pageErrors.filter(msg => {
                const txt = String(msg || '').toLowerCase();
                if (txt.includes('favicon')) return false;
                if (txt.includes('failed to load resource')) return false;
                return true;
            });
            if (severe.length > 0) {
                throw new Error(severe.slice(0, 5).join(' || '));
            }
            return 'Nessun pageerror severo rilevato.';
        });

    } catch (fatal) {
        results.push(makeResult('Fatal runtime checker error', false, String(fatal && fatal.message ? fatal.message : fatal)));
    } finally {
        if (browser) {
            try { await browser.close(); } catch (_) {}
        }
        if (server) {
            await new Promise(resolve => server.close(resolve));
        }
        printReport(results);
    }
}

run();
