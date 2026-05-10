/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');

const ROOT = path.resolve(__dirname, '..');
const PORT = 4314;
const REPORT = path.join(ROOT, 'TEST_REPORT_ACCESSIBILITY.md');

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

function startServer() {
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

function toMdList(items) {
    if (!items || items.length === 0) return '- None';
    return items.map((item) => `- ${item}`).join('\n');
}

async function runAudit() {
    let browser;
    let server;
    const pageErrors = [];

    const findings = {
        critical: [],
        warnings: [],
        info: [],
    };

    try {
        server = await startServer();

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        page.setDefaultTimeout(15000);

        page.on('pageerror', (err) => pageErrors.push(`pageerror: ${err.message}`));
        page.on('console', (msg) => {
            if (msg.type() === 'error') pageErrors.push(`console.error: ${msg.text()}`);
        });

        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'networkidle2' });

        await page.waitForFunction(() => {
            return typeof Game !== 'undefined' && typeof Character !== 'undefined';
        }, { timeout: 15000 });

        await page.evaluate(() => {
            const setValue = (selector, value) => {
                const el = document.querySelector(selector);
                if (!el) return;
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            };
            const clickSel = (selector) => {
                const el = document.querySelector(selector);
                if (el) el.click();
            };

            setValue('#char-name', 'A11y Tester');
            clickSel('.stamp-btn[data-group="gender"][data-value="M"]');
            clickSel('.ideology-card[data-value="center"]')
                || clickSel('.ideology-card[data-value="center_left"]')
                || clickSel('.ideology-card[data-value="centro"]');
            if (Character && !Character._selectedMentorId) {
                const firstMentor = document.querySelector('#onboarding-mentor-choices .mentor-quick-card');
                if (firstMentor) firstMentor.click();
            }
            if (Character && !Character._selectedStartingCityId) Character._selectedStartingCityId = 'roma';
            if (Character && Character.checkReady) Character.checkReady();
            const btn = document.getElementById('btn-approve');
            if (btn && !btn.disabled) btn.click();
        });

        await page.waitForFunction(() => {
            const desk = document.getElementById('screen-desk');
            return desk && desk.classList.contains('active');
        }, { timeout: 8000 });

        await page.evaluate(() => {
            if (typeof Desk !== 'undefined' && Desk.openPanel) {
                Desk.openPanel('phone');
                const tab = document.querySelector('.phone-tab[data-tab="mondo"]');
                if (tab) tab.click();
            }
        });

        await page.waitForSelector('#panel-phone:not(.hidden)', { timeout: 5000 });

        const snapshot = await page.evaluate(() => {
            const isVisible = (el) => {
                if (!el) return false;
                const cs = window.getComputedStyle(el);
                if (cs.display === 'none' || cs.visibility === 'hidden') return false;
                if (el.closest('[hidden], .hidden')) return false;
                return true;
            };

            const interactive = Array.from(document.querySelectorAll(
                'button, a[href], input, select, textarea, [role="button"], [role="tab"], [tabindex]'
            )).filter(isVisible);

            const unnamed = [];
            for (const el of interactive) {
                if (el.getAttribute('aria-hidden') === 'true') continue;
                const role = el.getAttribute('role') || el.tagName.toLowerCase();
                const id = el.id ? `#${el.id}` : '';
                const cls = el.className && typeof el.className === 'string'
                    ? `.${el.className.split(/\s+/).slice(0, 2).join('.')}`
                    : '';
                const text = (el.textContent || '').trim();
                const ariaLabel = (el.getAttribute('aria-label') || '').trim();
                const labelledBy = (el.getAttribute('aria-labelledby') || '').trim();
                let labelledByText = '';
                if (labelledBy) {
                    labelledByText = labelledBy
                        .split(/\s+/)
                        .map((refId) => {
                            const ref = document.getElementById(refId);
                            return ref ? (ref.textContent || '').trim() : '';
                        })
                        .join(' ')
                        .trim();
                }
                let forLabelText = '';
                if (el.id) {
                    const cssEscape = (window.CSS && typeof window.CSS.escape === 'function')
                        ? window.CSS.escape(el.id)
                        : el.id.replace(/([ #;?%&,.+*~':"!^$[\]()=>|/@])/g, '\\$1');
                    const linkedLabel = document.querySelector(`label[for="${cssEscape}"]`);
                    forLabelText = linkedLabel ? (linkedLabel.textContent || '').trim() : '';
                }
                const wrappingLabel = el.closest('label');
                const wrappingLabelText = wrappingLabel ? (wrappingLabel.textContent || '').trim() : '';
                const title = (el.getAttribute('title') || '').trim();
                const value = (el.value || '').trim();
                const hasName = !!(ariaLabel || labelledByText || forLabelText || wrappingLabelText || title || text || value);
                if (!hasName) unnamed.push(`${role}${id}${cls}`);
            }

            const srPolite = document.getElementById('sr-polite');
            const srAssertive = document.getElementById('sr-assertive');
            const srLog = document.getElementById('sr-log');

            const liveRegions = {
                polite: !!srPolite && srPolite.getAttribute('aria-live') === 'polite',
                assertive: !!srAssertive && srAssertive.getAttribute('aria-live') === 'assertive',
                log: !!srLog && srLog.getAttribute('role') === 'log',
            };

            const tabs = Array.from(document.querySelectorAll('.phone-tab-btn, .phone-tab'));
            const tabRoleMissing = tabs.filter((t) => t.getAttribute('role') !== 'tab').length;

            const modalsVisible = Array.from(document.querySelectorAll('.modal, .nation-modal, #nation-transfer-modal'))
                .filter(isVisible);
            const modalRoleIssues = modalsVisible
                .filter((m) => m.getAttribute('role') !== 'dialog')
                .length;

            return {
                unnamed,
                liveRegions,
                tabRoleMissing,
                interactiveCount: interactive.length,
                modalsVisible: modalsVisible.length,
                modalRoleIssues,
            };
        });

        if (snapshot.interactiveCount < 40) {
            findings.warnings.push(`Basso numero di elementi interattivi nel campione: ${snapshot.interactiveCount}`);
        } else {
            findings.info.push(`Elementi interattivi analizzati: ${snapshot.interactiveCount}`);
        }

        if (snapshot.unnamed.length > 0) {
            const capped = snapshot.unnamed.slice(0, 20);
            findings.critical.push(`Elementi interattivi senza nome accessibile: ${snapshot.unnamed.length}`);
            findings.warnings.push(`Campione elementi senza nome: ${capped.join(', ')}`);
        }

        if (!snapshot.liveRegions.polite || !snapshot.liveRegions.assertive || !snapshot.liveRegions.log) {
            findings.critical.push('Live regions screen reader incomplete (polite/assertive/log).');
        } else {
            findings.info.push('Live regions screen reader presenti e coerenti.');
        }

        if (snapshot.tabRoleMissing > 0) {
            findings.warnings.push(`Tab telefono senza role=tab: ${snapshot.tabRoleMissing}`);
        } else {
            findings.info.push('Tab telefono con ruoli ARIA corretti.');
        }

        if (snapshot.modalsVisible > 0 && snapshot.modalRoleIssues > 0) {
            findings.warnings.push(`Modali visibili senza role=dialog: ${snapshot.modalRoleIssues}/${snapshot.modalsVisible}`);
        }

        if (pageErrors.length > 0) {
            findings.warnings.push(`Errori runtime durante audit: ${pageErrors.length}`);
            findings.warnings.push(...pageErrors.slice(0, 8));
        } else {
            findings.info.push('Nessun pageerror/console.error severo durante audit.');
        }

        const now = new Date().toISOString();
        const report = [
            '# Accessibility Audit Report',
            '',
            `- Date: ${now}`,
            `- URL: http://127.0.0.1:${PORT}/index.html`,
            `- Critical findings: ${findings.critical.length}`,
            `- Warnings: ${findings.warnings.length}`,
            '',
            '## Critical',
            toMdList(findings.critical),
            '',
            '## Warnings',
            toMdList(findings.warnings),
            '',
            '## Info',
            toMdList(findings.info),
            '',
            '## Verdict',
            findings.critical.length === 0 ? '- PASS' : '- FAIL',
            '',
        ].join('\n');

        fs.writeFileSync(REPORT, report, 'utf8');

        console.log('Accessibility audit completed');
        console.log(`Critical: ${findings.critical.length}`);
        console.log(`Warnings: ${findings.warnings.length}`);
        console.log(`Report: ${path.relative(ROOT, REPORT)}`);

        if (findings.critical.length > 0) {
            process.exitCode = 2;
        }
    } finally {
        if (browser) await browser.close();
        if (server) await new Promise((resolve) => server.close(resolve));
    }
}

runAudit().catch((err) => {
    console.error('Accessibility audit failed:', err && err.message ? err.message : err);
    process.exitCode = 2;
});
