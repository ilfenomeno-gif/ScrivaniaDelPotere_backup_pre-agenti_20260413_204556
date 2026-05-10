/* eslint-disable no-console */
'use strict';

const path = require('path');
const chokidar = require('chokidar');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const WATCH_GLOBS = [
    path.join(ROOT, 'js', '**', '*.js').replace(/\\/g, '/'),
    path.join(ROOT, 'data', '**', '*.json').replace(/\\/g, '/'),
];

const IGNORE_GLOBS = [
    '**/node_modules/**',
    '**/.git/**',
    '**/scripts/**',
];

let running = false;
let rerunPending = false;
let debounceTimer = null;
let lastReason = 'startup';
let initialRunStarted = false;
let suppressEventsUntil = 0;
let analysisRuns = 0;
let runtimeRunning = false;
let matrixRunning = false;

function parseRuntimeEveryArg() {
    const idx = process.argv.findIndex(v => v === '--runtime-every');
    if (idx < 0) return null;
    const raw = Number(process.argv[idx + 1]);
    if (!Number.isFinite(raw) || raw < 0) return null;
    return Math.floor(raw);
}

const runtimeEveryFromArg = parseRuntimeEveryArg();
const runtimeCheckEvery = runtimeEveryFromArg !== null
    ? runtimeEveryFromArg
    : Math.max(0, Number(process.env.RUNTIME_CHECK_EVERY || 10) || 10);

function ts() {
    const d = new Date();
    return d.toISOString().replace('T', ' ').slice(0, 19);
}

function summarize(output) {
    const lines = output.split(/\r?\n/).filter(Boolean);
    const metrics = lines.find(l => l.includes('Metriche:')) || 'Metriche non disponibili';
    const top1 = lines.find(l => /^1\.\s/.test(l)) || 'Top problema non disponibile';
    const timerCount = lines.filter(l => l.includes('timer-leak-risk') || l.includes('interval-leak-risk')).length;
    return { metrics, top1, timerCount };
}

function summarizeRuntime(output) {
    const lines = output.split(/\r?\n/).filter(Boolean);
    const summary = lines.find(l => l.includes('Checks:')) || 'Runtime report non trovato';
    const fail = lines.find(l => l.includes('[FAIL]')) || 'Nessun FAIL rilevato';
    return { summary, fail };
}

function runRuntimeCheck(triggerReason) {
    if (runtimeRunning) return;
    runtimeRunning = true;
    const startedAt = Date.now();
    const prefix = `[WATCH ${ts()}]`;

    console.log(`${prefix} Avvio runtime checker (${triggerReason})...`);
    const child = spawn(process.execPath, [path.join(__dirname, 'runtimeChecker.js')], {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    let out = '';
    let err = '';
    child.stdout.on('data', d => { out += String(d); });
    child.stderr.on('data', d => { err += String(d); });

    child.on('close', code => {
        const elapsed = Date.now() - startedAt;
        const sum = summarizeRuntime(`${out}\n${err}`);
        console.log(`${prefix} Runtime check terminato in ${elapsed} ms (exit ${code})`);
        console.log(`${prefix} ${sum.summary}`);
        if (sum.fail && !sum.fail.includes('Nessun FAIL')) console.log(`${prefix} ${sum.fail}`);
        process.stdout.write('\u0007');
        runtimeRunning = false;
    });
}

function runDlcMatrixCheck(triggerReason) {
    if (matrixRunning) return;
    matrixRunning = true;
    const startedAt = Date.now();
    const prefix = `[WATCH ${ts()}]`;

    console.log(`${prefix} Avvio DLC matrix check (${triggerReason})...`);
    const child = spawn(process.execPath, [path.join(__dirname, 'dlcIntegrationMatrix.js'), '--days', '20'], {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    let out = '';
    let err = '';
    child.stdout.on('data', d => { out += String(d); });
    child.stderr.on('data', d => { err += String(d); });

    child.on('close', code => {
        const elapsed = Date.now() - startedAt;
        const summaryLine = `${out}\n${err}`.split(/\r?\n/).find(l => l.includes('Passed:')) || 'Summary non disponibile';
        console.log(`${prefix} DLC matrix terminata in ${elapsed} ms (exit ${code})`);
        console.log(`${prefix} ${summaryLine}`);
        process.stdout.write('\u0007');
        matrixRunning = false;
    });
}

function runFastAnalysis(reason) {
    if (running) {
        rerunPending = true;
        lastReason = reason;
        return;
    }

    running = true;
    const startedAt = Date.now();

    const args = [
        path.join(__dirname, 'agentAnalyzer.js'),
        '--fast',
        '--dry-run',
        '--runs', '2',
        '--day', '5',
    ];

    const child = spawn(process.execPath, args, {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    let out = '';
    let err = '';

    child.stdout.on('data', d => { out += String(d); });
    child.stderr.on('data', d => { err += String(d); });

    child.on('close', code => {
        const elapsed = Date.now() - startedAt;
        const summary = summarize(`${out}\n${err}`);

        const prefix = `[WATCH ${ts()}]`;
        const changed = reason ? `, trigger: ${reason}` : '';
        console.log(`\n${prefix} Analisi completata in ${elapsed} ms${changed}`);
        console.log(`${prefix} ${summary.metrics}`);
        console.log(`${prefix} ${summary.top1}`);
        console.log(`${prefix} Timer risk rilevati: ${summary.timerCount}`);

        if (code !== 0) {
            console.log(`${prefix} ERRORE: analyzer exit code ${code}`);
            if (err.trim()) console.log(err.trim());
        }

        // terminal bell as lightweight notification
        process.stdout.write('\u0007');

        analysisRuns += 1;
        runDlcMatrixCheck(`analisi #${analysisRuns}`);
        const shouldRunRuntime = runtimeCheckEvery > 0
            && reason !== 'initial'
            && analysisRuns % runtimeCheckEvery === 0;
        if (shouldRunRuntime) {
            runRuntimeCheck(`analisi #${analysisRuns}`);
        }

        running = false;
        if (rerunPending) {
            rerunPending = false;
            runFastAnalysis(lastReason || 'queued-change');
        }
    });
}

function schedule(reason) {
    lastReason = reason;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runFastAnalysis(reason), 500);
}

function main() {
    console.log('AI Watcher avviato');
    console.log(`Root: ${ROOT}`);
    console.log('Monitoro: js/**/*.js, data/**/*.json');
    console.log(`Runtime checker periodico: ${runtimeCheckEvery > 0 ? `ogni ${runtimeCheckEvery} analisi` : 'disattivato'}`);

    const watcher = chokidar.watch(WATCH_GLOBS, {
        ignored: IGNORE_GLOBS,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 250,
            pollInterval: 100,
        },
    });

    suppressEventsUntil = Date.now() + 1200;

    watcher.on('all', (event, filePath) => {
        if (Date.now() < suppressEventsUntil) return;
        const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
        schedule(`${event}: ${rel}`);
    });

    watcher.on('ready', () => {
        if (initialRunStarted) return;
        initialRunStarted = true;
        console.log('Watcher pronto. Eseguo prima analisi veloce...');
        runFastAnalysis('initial');
    });

    watcher.on('error', (e) => {
        console.error('Watcher error:', e);
    });

    process.on('SIGINT', async () => {
        console.log('\nChiusura watcher...');
        try { await watcher.close(); } catch (_) {}
        process.exit(0);
    });
}

main();
