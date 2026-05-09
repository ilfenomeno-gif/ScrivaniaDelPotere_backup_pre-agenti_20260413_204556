/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const readline = require('readline');

const ROOT = path.resolve(__dirname, '..');
const JS_DIR = path.join(ROOT, 'js');
const DATA_DIR = path.join(ROOT, 'data');

// Set to true to always apply economic balance patches (salary, task rewards, stress)
// regardless of whether the simulation thresholds are exceeded.
const autoBalance = true;

function nowMs() {
    return Date.now();
}

function readText(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, text) {
    fs.writeFileSync(filePath, text, 'utf8');
}

function walkFiles(dirPath, exts, out) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            walkFiles(full, exts, out);
        } else if (exts.includes(path.extname(entry.name))) {
            out.push(full);
        }
    }
}

function getGameFiles() {
    const all = [];
    walkFiles(ROOT, ['.js', '.json'], all);
    return all.filter(f => {
        const rel = path.relative(ROOT, f).replace(/\\/g, '/');
        if (rel.startsWith('.git/')) return false;
        if (rel.startsWith('node_modules/')) return false;
        if (rel.startsWith('scripts/')) return false;
        return rel.startsWith('js/') || rel.startsWith('data/');
    });
}

function lineOf(text, idx) {
    return text.slice(0, idx).split('\n').length;
}

function stripCommentsAndStrings(text) {
    return text
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/\/\/.*$/gm, ' ')
        .replace(/`(?:\\.|[^`\\])*`/g, ' ')
        .replace(/'(?:\\.|[^'\\])*'/g, ' ')
        .replace(/"(?:\\.|[^"\\])*"/g, ' ');
}

function addFinding(out, type, severity, filePath, line, message) {
    out.push({ type, severity, file: filePath, line, message });
}

function findLongFunctions(filePath) {
    const out = [];
    const lines = readText(filePath).split('\n');
    let fnStart = -1;
    let fnName = 'anonymous';
    let braces = 0;

    for (let i = 0; i < lines.length; i++) {
        const ln = lines[i];
        const open = (ln.match(/\{/g) || []).length;
        const close = (ln.match(/\}/g) || []).length;

        if (fnStart < 0) {
            const m = ln.match(/function\s+([A-Za-z_][\w]*)/) || ln.match(/^\s*([A-Za-z_][\w]*)\s*\([^)]*\)\s*\{/);
            if (m) {
                fnStart = i;
                fnName = m[1] || 'anonymous';
                braces = open - close;
            }
            continue;
        }

        braces += open - close;
        if (braces <= 0) {
            const len = i - fnStart + 1;
            if (len > 80) {
                addFinding(out, 'long-function', 'warning', filePath, fnStart + 1, `Funzione ${fnName} lunga ${len} righe`);
            }
            fnStart = -1;
            fnName = 'anonymous';
            braces = 0;
        }
    }

    return out;
}

function findWindowGlobals(filePath) {
    const out = [];
    const text = readText(filePath);
    const rx = /window\.([A-Za-z_$][\w$]*)\s*=/g;
    let m;
    while ((m = rx.exec(text)) !== null) {
        addFinding(out, 'window-global', 'info', filePath, lineOf(text, m.index), `Assegnazione globale window.${m[1]}`);
    }
    return out;
}

function findTimerRisks(filePath) {
    const out = [];
    // Skip the Scheduler implementation itself — it intentionally wraps setInterval/setTimeout
    if (path.basename(filePath) === 'scheduler.js') return out;

    const text = readText(filePath);
    const stripped = stripCommentsAndStrings(text);
    // A file using Scheduler.timeout / Scheduler.interval / Scheduler.clear is considered managed
    const hasScheduler = /Scheduler\.(timeout|interval|clear)/.test(stripped);

    // setTimeout: match stored IDs (this.xxx or let/const/var xxx) and verify each is cleared
    if (/setTimeout\s*\(/.test(stripped) && !hasScheduler) {
        const storeRx = /(?:this\.(\w+)|(?:let|const|var)\s+(\w+))\s*=\s*setTimeout\s*\(/g;
        const storedIds = [];
        let m;
        while ((m = storeRx.exec(stripped)) !== null) {
            storedIds.push(m[1] || m[2]);
        }

        if (storedIds.length > 0) {
            // Warn only for stored IDs that have no matching clearTimeout
            for (const id of storedIds) {
                const clearRx = new RegExp(`clearTimeout\\s*\\(\\s*(?:this\\.)?${id}\\s*\\)`);
                if (!clearRx.test(stripped)) {
                    addFinding(out, 'timer-leak-risk', 'warning', filePath, 1,
                        `setTimeout assegnato a "${id}" senza clearTimeout corrispondente`);
                }
            }
        } else if (!/clearTimeout\s*\(/.test(stripped)) {
            // Fire-and-forget setTimeout with no clearTimeout anywhere in the file
            addFinding(out, 'timer-leak-risk', 'warning', filePath, 1,
                'Uso setTimeout senza clearTimeout o Scheduler.timeout');
        }
    }

    // setInterval: same logic
    if (/setInterval\s*\(/.test(stripped) && !hasScheduler) {
        const storeRx = /(?:this\.(\w+)|(?:let|const|var)\s+(\w+))\s*=\s*setInterval\s*\(/g;
        const storedIds = [];
        let m;
        while ((m = storeRx.exec(stripped)) !== null) {
            storedIds.push(m[1] || m[2]);
        }

        if (storedIds.length > 0) {
            for (const id of storedIds) {
                const clearRx = new RegExp(`clearInterval\\s*\\(\\s*(?:this\\.)?${id}\\s*\\)`);
                if (!clearRx.test(stripped)) {
                    addFinding(out, 'interval-leak-risk', 'warning', filePath, 1,
                        `setInterval assegnato a "${id}" senza clearInterval corrispondente`);
                }
            }
        } else if (!/clearInterval\s*\(/.test(stripped)) {
            addFinding(out, 'interval-leak-risk', 'warning', filePath, 1,
                'Uso setInterval senza clearInterval o Scheduler.interval');
        }
    }

    return out;
}

function findUnhandledPromises(filePath) {
    const out = [];
    const text = readText(filePath);
    const rx = /\.then\s*\(/g;
    let m;
    while ((m = rx.exec(text)) !== null) {
        const near = text.slice(m.index, m.index + 240);
        if (!/\.catch\s*\(/.test(near)) {
            addFinding(out, 'promise-no-catch', 'warning', filePath, lineOf(text, m.index), 'Promise chain senza catch vicino');
        }
    }
    return out;
}

function findPotentialUndefinedCalls(filePath) {
    const out = [];
    const text = readText(filePath);
    const stripped = stripCommentsAndStrings(text);

    const declared = new Set();
    const fnDecl = /function\s+([A-Za-z_][\w]*)\s*\(/g;
    const methodDecl = /\n\s*([A-Za-z_][\w]*)\s*\([^)]*\)\s*\{/g;

    let m;
    while ((m = fnDecl.exec(stripped)) !== null) declared.add(m[1]);
    while ((m = methodDecl.exec(stripped)) !== null) declared.add(m[1]);

    const skip = new Set([
        'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof', 'new', 'await',
        'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
        'requestAnimationFrame', 'fetch', 'alert', 'confirm', 'open', 'async', 'of',
    ]);

    const callRx = /\b([A-Za-z_][\w]*)\s*\(/g;
    while ((m = callRx.exec(stripped)) !== null) {
        const name = m[1];
        if (skip.has(name)) continue;
        if (declared.has(name)) continue;
        if (/^[A-Z]/.test(name)) continue;

        const prev = stripped[m.index - 1] || '';
        if (prev === '.' || prev === ':') continue;

        const nextSlice = stripped.slice(m.index, m.index + 60);
        if (/=>/.test(nextSlice)) continue;

        addFinding(out, 'undefined-call-risk', 'warning', filePath, lineOf(text, m.index), `Chiamata potenzialmente non definita: ${name}()`);
    }

    return out;
}

function findDuplicateBlocks(jsFiles) {
    const out = [];
    const seen = new Map();

    for (const filePath of jsFiles) {
        const lines = readText(filePath).split('\n');
        for (let i = 0; i <= lines.length - 10; i++) {
            const block = lines.slice(i, i + 10).map(l => l.trim()).filter(Boolean).join('\n');
            if (block.length < 200) continue;
            const key = block.replace(/\s+/g, ' ');
            if (seen.has(key)) {
                const prev = seen.get(key);
                addFinding(out, 'duplication', 'info', filePath, i + 1, `Blocco simile a ${path.relative(ROOT, prev.file)}:${prev.line}`);
            } else {
                seen.set(key, { file: filePath, line: i + 1 });
            }
        }
    }

    return out;
}

function validateJsonSyntax(filePath) {
    try {
        JSON.parse(readText(filePath));
        return [];
    } catch (err) {
        return [{
            type: 'json-parse-error',
            severity: 'error',
            file: filePath,
            line: 1,
            message: `JSON non valido: ${String(err.message || err)}`,
        }];
    }
}

function loadJson(filePath) {
    return JSON.parse(readText(filePath));
}

function validateCityJson(filePath) {
    const out = [];
    const raw = loadJson(filePath);
    const required = ['id', 'name', 'region', 'lat', 'lng', 'bonus', 'malus', 'rentMultiplier', 'salaryMultiplier', 'tier'];

    let hasCountry = false;
    let hasNationId = false;

    for (const [cityKey, city] of Object.entries(raw || {})) {
        if (!city || typeof city !== 'object') {
            addFinding(out, 'contract', 'error', filePath, 1, `Record ${cityKey} non e object`);
            continue;
        }
        for (const field of required) {
            if (!Object.prototype.hasOwnProperty.call(city, field)) {
                addFinding(out, 'contract', 'error', filePath, 1, `${cityKey} manca campo ${field}`);
            }
        }
        if (Object.prototype.hasOwnProperty.call(city, 'country')) hasCountry = true;
        if (Object.prototype.hasOwnProperty.call(city, 'nationId')) hasNationId = true;
    }

    if (hasCountry && hasNationId) {
        addFinding(out, 'data-inconsistency', 'warning', filePath, 1, 'Uso misto di country e nationId nello stesso file');
    }

    return out;
}

function validateNationsJson(filePath) {
    const out = [];
    const raw = loadJson(filePath);
    const required = ['id', 'name', 'politicalSystem', 'currency', 'salaryMultiplier', 'rentMultiplier', 'ideologies'];

    for (const [nationKey, nation] of Object.entries(raw || {})) {
        for (const field of required) {
            if (!nation || typeof nation !== 'object' || !Object.prototype.hasOwnProperty.call(nation, field)) {
                addFinding(out, 'contract', 'error', filePath, 1, `Nazione ${nationKey} manca ${field}`);
            }
        }
    }

    return out;
}

function validateMentorsJson(filePath) {
    const out = [];
    const raw = loadJson(filePath);
    const required = ['id', 'name', 'shortName', 'icon', 'quote', 'bonusText', 'effects'];

    for (const [nationId, byIdeology] of Object.entries(raw || {})) {
        if (!byIdeology || typeof byIdeology !== 'object') {
            addFinding(out, 'contract', 'error', filePath, 1, `Nodo mentors.${nationId} non e object`);
            continue;
        }

        for (const [ideologyKey, mentors] of Object.entries(byIdeology)) {
            if (!Array.isArray(mentors)) {
                addFinding(out, 'contract', 'error', filePath, 1, `mentors.${nationId}.${ideologyKey} non e array`);
                continue;
            }

            mentors.forEach((mentor, idx) => {
                for (const field of required) {
                    if (!mentor || typeof mentor !== 'object' || !Object.prototype.hasOwnProperty.call(mentor, field)) {
                        addFinding(out, 'contract', 'error', filePath, 1, `Mentore ${nationId}.${ideologyKey}[${idx}] manca ${field}`);
                    }
                }
            });
        }
    }

    return out;
}

function runStaticAnalysis() {
    const start = nowMs();
    const files = getGameFiles();
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const findings = [];

    for (const filePath of jsFiles) {
        findings.push(...findLongFunctions(filePath));
        findings.push(...findWindowGlobals(filePath));
        findings.push(...findTimerRisks(filePath));
        findings.push(...findUnhandledPromises(filePath));
        findings.push(...findPotentialUndefinedCalls(filePath));
    }

    findings.push(...findDuplicateBlocks(jsFiles));

    for (const filePath of jsonFiles) {
        findings.push(...validateJsonSyntax(filePath));
        const base = path.basename(filePath);
        if (base.startsWith('cities')) findings.push(...validateCityJson(filePath));
        if (base === 'nations.json') findings.push(...validateNationsJson(filePath));
        if (base === 'mentors.json') findings.push(...validateMentorsJson(filePath));
    }

    return {
        findings,
        jsCount: jsFiles.length,
        jsonCount: jsonFiles.length,
        elapsedMs: nowMs() - start,
    };
}

function createHeadlessContext() {
    const fakeNode = () => ({
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        style: {},
        innerHTML: '',
        textContent: '',
        addEventListener() {},
        removeEventListener() {},
        appendChild() {},
        remove() {},
        querySelector() { return fakeNode(); },
        querySelectorAll() { return []; },
        setAttribute() {},
        getAttribute() { return null; },
        focus() {},
        click() {},
        scrollIntoView() {},
        dataset: {},
    });

    const ctx = {
        console,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        Math,
        Date,
        JSON,
        Promise,
        localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
        sessionStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
        navigator: { userAgent: 'headless' },
        document: {
            body: fakeNode(),
            addEventListener() {},
            getElementById() { return fakeNode(); },
            querySelector() { return fakeNode(); },
            querySelectorAll() { return []; },
            createElement() { return fakeNode(); },
        },
        fetch: async () => ({ ok: true, json: async () => ({}) }),
        alert() {},
        confirm() { return true; },
        L: {
            map() {
                return {
                    setView() { return this; },
                    addLayer() { return this; },
                    removeLayer() { return this; },
                    on() { return this; },
                    off() { return this; },
                    hasLayer() { return false; },
                    invalidateSize() {},
                    getZoom() { return 6; },
                };
            },
            tileLayer() { return { addTo() {} }; },
            layerGroup() { return { addTo() {}, addLayer() {}, removeLayer() {}, hasLayer() { return false; } }; },
            marker() { return { addTo() {}, bindTooltip() { return this; }, on() {} }; },
            polyline() { return { addTo() {} }; },
            divIcon() { return {}; },
        },
    };

    ctx.window = ctx;
    ctx.globalThis = ctx;
    return vm.createContext(ctx);
}

function loadModuleToContext(ctx, filePath, symbolName) {
    const src = readText(filePath);
    const wrapped = `${src}\n;globalThis.${symbolName}=${symbolName};`;
    vm.runInContext(wrapped, ctx, { filename: filePath });
}

function runSingleSimulation(targetDay) {
    const ctx = createHeadlessContext();
    loadModuleToContext(ctx, path.join(JS_DIR, 'game.js'), 'Game');
    loadModuleToContext(ctx, path.join(JS_DIR, 'tasks.js'), 'Tasks');
    loadModuleToContext(ctx, path.join(JS_DIR, 'mafia.js'), 'Mafia');

    const Game = ctx.Game;
    const Tasks = ctx.Tasks;

    Game.init();

    let completed = 0;
    let potentialActions = 0;
    let gameover = 0;
    let gameOverReason = null;

    while (Game.state.day < targetDay) {
        const health = Game.state.stats && typeof Game.state.stats.salute === 'number'
            ? Game.state.stats.salute : Infinity;
        const money = Number(Game.state.money || 0);

        if (Game.state.screen === 'gameover') { gameover += 1; gameOverReason = 'screen'; break; }
        if (health <= 0)  { gameover += 1; gameOverReason = 'salute'; break; }
        if (money < -800) { gameover += 1; gameOverReason = 'debito'; break; }

        const startActions = Math.max(0, Number(Game.state.actionPoints || 0));
        potentialActions += startActions;

        const workTasks = Tasks.generateWorkTasks();
        const politicalTasks = Tasks.generatePoliticalTasks();

        while ((Game.state.actionPoints || 0) > 0) {
            const usePolitical = Math.random() < 0.45;
            const task = usePolitical ? politicalTasks[0] : workTasks[0];
            if (!task) break;

            const cost = task.apCost || 1;
            if (!Game.spendActionPoint(cost)) break;

            const category = usePolitical ? 'political' : 'work';
            Tasks.applyReward(task.reward || {}, category, task);
            if (category === 'political' && typeof Game.registerPoliticalTaskProgress === 'function') {
                Game.registerPoliticalTaskProgress(task);
            }
            completed += 1;

            if (Game.state.screen === 'gameover') break;
        }

        Game.advanceTime();

        const healthAfter = Game.state.stats && typeof Game.state.stats.salute === 'number'
            ? Game.state.stats.salute : Infinity;
        const moneyAfter = Number(Game.state.money || 0);

        if (Game.state.screen === 'gameover') { gameover += 1; gameOverReason = 'screen'; break; }
        if (healthAfter <= 0)  { gameover += 1; gameOverReason = 'salute'; break; }
        if (moneyAfter < -800) { gameover += 1; gameOverReason = 'debito'; break; }
    }

    return {
        money: Number(Game.state.money || 0),
        stress: Number(Game.state.stats && Game.state.stats.stress ? Game.state.stats.stress : 0),
        health: Game.state.stats && typeof Game.state.stats.salute === 'number' ? Game.state.stats.salute : null,
        dayReached: Number(Game.state.day || 0),
        completed,
        potentialActions,
        gameover,
        gameOverReason,
    };
}

function runRegression(runs, targetDay) {
    const start = nowMs();
    const sampleRuns = Math.max(1, Number(runs) || 1);
    const endDay = Math.max(2, Number(targetDay) || 10);

    const totals = { money: 0, stress: 0, health: 0, healthCount: 0, completed: 0, potentialActions: 0, gameover: 0 };
    const gameOverReasons = { screen: 0, salute: 0, debito: 0 };

    for (let i = 0; i < sampleRuns; i++) {
        const sample = runSingleSimulation(endDay);
        totals.money += sample.money;
        totals.stress += sample.stress;
        if (sample.health !== null) { totals.health += sample.health; totals.healthCount += 1; }
        totals.completed += sample.completed;
        totals.potentialActions += sample.potentialActions;
        totals.gameover += sample.gameover;
        if (sample.gameOverReason) gameOverReasons[sample.gameOverReason] = (gameOverReasons[sample.gameOverReason] || 0) + 1;
    }

    const completionRate = totals.potentialActions > 0
        ? Math.min(100, (totals.completed / totals.potentialActions) * 100)
        : 0;

    return {
        runs: sampleRuns,
        targetDay: endDay,
        elapsedMs: nowMs() - start,
        metrics: {
            avgMoneyDayN: Number((totals.money / sampleRuns).toFixed(2)),
            avgStress: Number((totals.stress / sampleRuns).toFixed(2)),
            avgHealth: totals.healthCount > 0 ? Number((totals.health / totals.healthCount).toFixed(1)) : null,
            taskCompletionRate: Number(completionRate.toFixed(2)),
            gameOverRate: Number(((totals.gameover / sampleRuns) * 100).toFixed(2)),
            gameOverReasons,
        },
    };
}

function computeTopProblems(staticReport, regression) {
    const top = [];

    if (regression.metrics.avgStress > 65) {
        top.push({ severity: 'high', title: 'Stress sale troppo in fretta', detail: `Stress medio ${regression.metrics.avgStress}` });
    }
    if (regression.metrics.avgMoneyDayN < 0) {
        top.push({ severity: 'high', title: 'Economia troppo punitiva', detail: `Soldi medi giorno ${regression.targetDay}: ${regression.metrics.avgMoneyDayN}` });
    }

    const timerFindings = staticReport.findings.filter(f => f.type.includes('timer') || f.type.includes('interval'));
    if (timerFindings.length > 0) {
        top.push({ severity: 'medium', title: 'Rischio leak timer', detail: `${timerFindings.length} segnali setTimeout/setInterval` });
    }

    const contractErrors = staticReport.findings.filter(f => f.type === 'contract' && f.severity === 'error');
    if (contractErrors.length > 0) {
        top.push({ severity: 'medium', title: 'Contratti dati violati', detail: `${contractErrors.length} errori su JSON` });
    }

    while (top.length < 3) {
        top.push({ severity: 'low', title: 'Miglioria strutturale', detail: 'Nessuna criticita bloccante addizionale' });
    }

    return top.slice(0, 3);
}

function textPatch(id, title, filePath, findText, replaceText, rationale, severity) {
    return { id, title, filePath, findText, replaceText, rationale, severity, mode: 'text' };
}

function jsonPatch(id, title, filePath, mutator, rationale, severity) {
    return { id, title, filePath, mutator, rationale, severity, mode: 'json' };
}

function buildPatchCandidates(regression) {
    const patches = [];
    const tasksPath = path.join(JS_DIR, 'tasks.js');
    const phonePath = path.join(JS_DIR, 'phone.js');
    const agentsPath = path.join(JS_DIR, 'agents.js');
    const nationsPath = path.join(DATA_DIR, 'nations.json');
    const citiesItalyPath = path.join(DATA_DIR, 'cities_italy.json');

    if (regression.metrics.avgStress > 40) {
        patches.push(textPatch(
            'stress-fire-post',
            'Riduci stress da post incendiari',
            path.join(JS_DIR, 'constants.js'),
            'FIRE_POST_STRESS_MULTIPLIER: 0.45,',
            'FIRE_POST_STRESS_MULTIPLIER: 0.35,',
            'Stress troppo alto nei run: abbasso moltiplicatore stress post fire.',
            'high'
        ));

        patches.push(jsonPatch(
            'city-stress-smoothing',
            'Riduci malus stress su città',
            citiesItalyPath,
            data => {
                for (const city of Object.values(data || {})) {
                    if (!city || typeof city !== 'object') continue;
                    if (!city.malus || typeof city.malus !== 'object') continue;
                    if (typeof city.malus.stress !== 'number') continue;
                    city.malus.stress = Number(Math.max(0, city.malus.stress - 1).toFixed(2));
                }
                return data;
            },
            'Bilanciamento automatico: riduzione graduale attrito stress nelle città.',
            'high'
        ));
    }

    if (regression.metrics.avgMoneyDayN < 200) {
        patches.push(textPatch(
            'work-money-boost',
            'Aumenta reward turno straordinario',
            tasksPath,
            "all.push({ title: 'Turno Straordinario', desc: 'Copri il turno di un collega assente.', reward: { money: 62, stanchezza: 14, stress: 6 }, apCost: 1 });",
            "all.push({ title: 'Turno Straordinario', desc: 'Copri il turno di un collega assente.', reward: { money: 75, stanchezza: 14, stress: 6 }, apCost: 1 });",
            'Se i soldi medi vanno sotto zero, aumento reward turno straordinario.',
            'high'
        ));

        patches.push(jsonPatch(
            'nation-salary-smoothing',
            'Aumenta salaryMultiplier nazioni',
            nationsPath,
            data => {
                for (const nation of Object.values(data || {})) {
                    if (!nation || typeof nation !== 'object') continue;
                    const curr = Number(nation.salaryMultiplier || 1);
                    nation.salaryMultiplier = Number((curr * 1.04).toFixed(3));
                }
                return data;
            },
            'Bilanciamento automatico: incremento leggero dei salari nazionali.',
            'high'
        ));
    }

    patches.push(textPatch(
        'agent-relation-floor',
        'Soglia minima relation agenti in sync',
        agentsPath,
        'relation: Math.max(0, Math.min(100, Math.round(a.relationship || 0))),',
        'relation: Math.max(10, Math.min(100, Math.round(a.relationship || 0))),',
        'Impedisce che la relation scenda sotto 10 al sync contatti: riduce churn agenti.',
        'medium'
    ));

    return patches;
}

function generateUnifiedDiff(filePath, before, after) {
    const a = before.split('\n');
    const b = after.split('\n');

    let start = 0;
    while (start < a.length && start < b.length && a[start] === b[start]) start += 1;

    let endA = a.length - 1;
    let endB = b.length - 1;
    while (endA >= start && endB >= start && a[endA] === b[endB]) {
        endA -= 1;
        endB -= 1;
    }

    const oldChunk = a.slice(start, endA + 1);
    const newChunk = b.slice(start, endB + 1);

    const out = [];
    out.push(`--- ${path.relative(ROOT, filePath)}`);
    out.push(`+++ ${path.relative(ROOT, filePath)}`);
    out.push(`@@ -${start + 1},${oldChunk.length} +${start + 1},${newChunk.length} @@`);
    for (const ln of oldChunk) out.push(`-${ln}`);
    for (const ln of newChunk) out.push(`+${ln}`);

    return out.join('\n');
}

function applyPatchProposal(patch) {
    const before = readText(patch.filePath);

    if (patch.mode === 'json') {
        let parsed;
        try {
            parsed = JSON.parse(before);
        } catch (err) {
            return { ok: false, reason: `JSON invalido: ${String(err.message || err)}` };
        }

        const afterObj = patch.mutator(parsed);
        const after = `${JSON.stringify(afterObj, null, 2)}\n`;
        if (before === after) {
            return { ok: false, reason: 'Nessuna differenza prodotta dalla mutazione JSON' };
        }

        writeText(patch.filePath, after);
        return { ok: true, diff: generateUnifiedDiff(patch.filePath, before, after) };
    }

    if (!before.includes(patch.findText)) {
        return { ok: false, reason: 'Pattern non trovato nel file target' };
    }

    const after = before.replace(patch.findText, patch.replaceText);
    writeText(patch.filePath, after);
    return { ok: true, diff: generateUnifiedDiff(patch.filePath, before, after) };
}

function ask(rl, question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function interactiveApply(patches, autoMode) {
    const applied = [];
    const skipped = [];

    if (patches.length === 0) return { applied, skipped };

    if (autoMode) {
        for (const patch of patches) {
            const result = applyPatchProposal(patch);
            if (result.ok) applied.push({ patch, diff: result.diff });
            else skipped.push({ patch, reason: result.reason });
        }
        return { applied, skipped };
    }

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        for (const patch of patches) {
            console.log('\n------------------------------------------------------------');
            console.log(`[${patch.severity.toUpperCase()}] ${patch.title}`);
            console.log(`File: ${path.relative(ROOT, patch.filePath)}`);
            console.log(`Razionale: ${patch.rationale}`);
            if (patch.mode === 'text') {
                console.log('Preview sostituzione:');
                console.log(`- ${patch.findText}`);
                console.log(`+ ${patch.replaceText}`);
            } else {
                console.log('Preview: mutazione JSON con diff mostrata dopo apply.');
            }

            const answer = (await ask(rl, 'Applico questa patch? [y/N] ')).trim().toLowerCase();
            if (answer !== 'y' && answer !== 'yes') {
                skipped.push({ patch, reason: 'rifiutata utente' });
                continue;
            }

            const result = applyPatchProposal(patch);
            if (result.ok) {
                applied.push({ patch, diff: result.diff });
                console.log('Patch applicata.');
            } else {
                skipped.push({ patch, reason: result.reason });
                console.log(`Patch non applicata: ${result.reason}`);
            }
        }
    } finally {
        rl.close();
    }

    return { applied, skipped };
}

function printFindings(findings) {
    const weight = { error: 3, warning: 2, info: 1 };
    const sorted = findings.slice().sort((a, b) => (weight[b.severity] || 0) - (weight[a.severity] || 0));

    for (const f of sorted) {
        const rel = path.relative(ROOT, f.file).replace(/\\/g, '/');
        console.log(`[${f.severity.toUpperCase()}] ${f.type} | ${rel}:${f.line} | ${f.message}`);
    }
}

function printSummary(staticReport, regression, topProblems, patchResult) {
    console.log('\n================== REPORT ==================');
    console.log(`Analisi statica: ${staticReport.jsCount} JS + ${staticReport.jsonCount} JSON in ${staticReport.elapsedMs} ms`);
    console.log(`Simulazione: ${regression.runs} run (target day ${regression.targetDay}) in ${regression.elapsedMs} ms`);
    const healthStr = regression.metrics.avgHealth !== null ? `, salute media=${regression.metrics.avgHealth}` : '';
    const reasons = regression.metrics.gameOverReasons;
    const reasonParts = Object.entries(reasons).filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`);
    const reasonStr = reasonParts.length > 0 ? ` (${reasonParts.join(', ')})` : '';
    console.log(`Metriche: soldi medi=${regression.metrics.avgMoneyDayN}, stress medio=${regression.metrics.avgStress}${healthStr}, completamento task=${regression.metrics.taskCompletionRate}%, game over=${regression.metrics.gameOverRate}%${reasonStr}`);

    console.log('\nTop 3 problemi:');
    topProblems.forEach((p, i) => {
        console.log(`${i + 1}. [${p.severity}] ${p.title} - ${p.detail}`);
    });

    console.log('\nPatch applicate:');
    if (patchResult.applied.length === 0) {
        console.log('Nessuna patch applicata.');
    } else {
        for (const item of patchResult.applied) {
            console.log(`- ${item.patch.title} (${path.relative(ROOT, item.patch.filePath)})`);
            console.log(item.diff);
        }
    }

    if (patchResult.skipped.length > 0) {
        console.log('\nPatch saltate:');
        for (const item of patchResult.skipped) {
            console.log(`- ${item.patch.title}: ${item.reason}`);
        }
    }
}

async function main() {
    const autoMode = process.argv.includes('--auto');
    const dryRunMode = process.argv.includes('--dry-run');
    const fastMode = process.argv.includes('--fast');

    const runsIdx = process.argv.findIndex(v => v === '--runs');
    const dayIdx = process.argv.findIndex(v => v === '--day');
    const runs = runsIdx >= 0 ? Number(process.argv[runsIdx + 1] || 10) : 10;
    const targetDay = dayIdx >= 0 ? Number(process.argv[dayIdx + 1] || 10) : 10;

    console.log('AI: Analizza e migliora gioco');
    console.log('Fase 1/5: Analisi statica...');
    const staticReport = runStaticAnalysis();
    printFindings(staticReport.findings);

    if (fastMode) {
        const fastRuns = Number.isFinite(runs) ? Math.max(1, Math.min(runs, 3)) : 2;
        const fastDay = Number.isFinite(targetDay) ? Math.max(3, Math.min(targetDay, 8)) : 5;
        console.log('\nModalita FAST attiva: skip patch generation/apply, regression breve.');
        const regressionFast = runRegression(fastRuns, fastDay);
        const topProblemsFast = computeTopProblems(staticReport, regressionFast);
        printSummary(staticReport, regressionFast, topProblemsFast, { applied: [], skipped: [] });
        return;
    }

    console.log('\nFase 2/5: Simulazione partite ghost...');
    const regression = runRegression(runs, targetDay);

    console.log('Fase 3/5: Individuazione top problemi...');
    const topProblems = computeTopProblems(staticReport, regression);

    console.log('Fase 4/5: Generazione diff proposte...');
    const patchCandidates = buildPatchCandidates(regression);

    if (dryRunMode) {
        console.log('Dry-run attivo: nessuna patch verra applicata.');
        printSummary(staticReport, regression, topProblems, {
            applied: [],
            skipped: patchCandidates.map(p => ({ patch: p, reason: 'dry-run' })),
        });
        return;
    }

    console.log('Fase 5/5: Applica patch (con conferma)...');
    const patchResult = await interactiveApply(patchCandidates, autoMode);

    if (patchResult.applied.length > 0) {
        console.log('\nRiesecuzione simulazione dopo patch...');
        const postRegression = runRegression(runs, targetDay);
        printSummary(staticReport, postRegression, topProblems, patchResult);
    } else {
        printSummary(staticReport, regression, topProblems, patchResult);
    }
}

if (require.main === module) {
    main().catch(err => {
        console.error('Errore agente:', err);
        process.exitCode = 1;
    });
}

module.exports = {
    runStaticAnalysis,
    runRegression,
    computeTopProblems,
    buildPatchCandidates,
    applyPatchProposal,
};
