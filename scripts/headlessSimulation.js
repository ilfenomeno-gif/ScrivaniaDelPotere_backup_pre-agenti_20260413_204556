/* eslint-disable no-console */
'use strict';

const path = require('path');
const { runRegression } = require('./agentAnalyzer');

function parseNumberArg(flag, fallback) {
    const idx = process.argv.findIndex(v => v === flag);
    if (idx < 0) return fallback;
    const raw = Number(process.argv[idx + 1]);
    if (!Number.isFinite(raw)) return fallback;
    return raw;
}

function main() {
    const runs = parseNumberArg('--runs', 10);
    const day = parseNumberArg('--day', 10);

    console.log('Simulazione headless avviata');
    console.log(`Workspace: ${path.resolve(__dirname, '..')}`);
    console.log(`Run: ${runs}, target day: ${day}`);

    const report = runRegression(runs, day);
    console.log('--- Metriche ---');
    console.log(`Soldi medi giorno ${report.targetDay}: ${report.metrics.avgMoneyDayN}`);
    console.log(`Stress medio: ${report.metrics.avgStress}`);
    if (report.metrics.avgHealth !== null) console.log(`Salute media: ${report.metrics.avgHealth}`);
    console.log(`Task completion rate: ${report.metrics.taskCompletionRate}%`);
    const reasons = report.metrics.gameOverReasons || {};
    const reasonParts = Object.entries(reasons).filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`);
    const reasonStr = reasonParts.length > 0 ? ` — cause: ${reasonParts.join(', ')}` : '';
    console.log(`Game over rate: ${report.metrics.gameOverRate}%${reasonStr}`);
    console.log(`Tempo simulazione: ${report.elapsedMs} ms`);
}

main();
