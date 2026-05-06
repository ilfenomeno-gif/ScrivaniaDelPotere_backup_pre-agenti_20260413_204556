/* eslint-disable no-console */
'use strict';

const http = require('http');
const path = require('path');
const { EventEmitter } = require('events');

const PORT = 3947;
const { runStaticAnalysis, runRegression, computeTopProblems, buildPatchCandidates, applyPatchProposal } = require('./agentAnalyzer');

// Capture console output during analysis
function captureRun(fn) {
    const lines = [];
    const orig = console.log;
    console.log = (...args) => { lines.push(args.join(' ')); };
    let result;
    let err = null;
    try {
        result = fn();
    } catch (e) {
        err = e;
    } finally {
        console.log = orig;
    }
    if (err) throw err;
    return { lines, result };
}

function runAnalysis(mode, runs, targetDay) {
    const bus = new EventEmitter();
    const emit = (type, data) => bus.emit('event', { type, data });

    setImmediate(() => {
        try {
            emit('phase', 'Analisi statica...');
            const { result: staticReport, lines: staticLines } = captureRun(() => runStaticAnalysis());
            emit('lines', staticLines);

            emit('phase', 'Simulazione partite ghost...');
            const regression = runRegression(runs, targetDay);

            emit('phase', 'Individuazione top problemi...');
            const topProblems = computeTopProblems(staticReport, regression);

            emit('phase', 'Generazione patch candidates...');
            const patches = buildPatchCandidates(regression);

            const reasons = regression.metrics.gameOverReasons || {};
            const reasonParts = Object.entries(reasons).filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`);

            emit('metrics', {
                runs: regression.runs,
                targetDay: regression.targetDay,
                elapsedMs: regression.elapsedMs,
                avgMoney: regression.metrics.avgMoneyDayN,
                avgStress: regression.metrics.avgStress,
                avgHealth: regression.metrics.avgHealth,
                taskRate: regression.metrics.taskCompletionRate,
                gameOverRate: regression.metrics.gameOverRate,
                gameOverReasons: reasonParts.join(', ') || 'nessuno',
            });

            emit('topProblems', topProblems);

            const patchPreviews = patches.map(p => ({
                id: p.id,
                title: p.title,
                severity: p.severity,
                rationale: p.rationale,
                file: path.relative(path.resolve(__dirname, '..'), p.filePath),
                mode: p.mode,
                preview: p.mode === 'text'
                    ? `- ${p.findText.slice(0, 80)}\n+ ${p.replaceText.slice(0, 80)}`
                    : 'Mutazione JSON (diff mostrata dopo apply)',
            }));
            emit('patches', patchPreviews);

            if (mode === 'auto') {
                emit('phase', 'Applicazione patch automatica...');
                const applied = [];
                const skipped = [];
                for (const patch of patches) {
                  const result = applyPatchProposal(patch);
                  if (result.ok) applied.push({ patch, diff: result.diff });
                  else skipped.push({ patch, reason: result.reason });
                }
                emit('applied', applied.map(a => ({
                  title: a.patch.title,
                  file: path.relative(path.resolve(__dirname, '..'), a.patch.filePath),
                  diff: a.diff,
                })));
                emit('skipped', skipped.map(s => ({
                  title: s.patch.title,
                  reason: s.reason,
                })));
                emit('done', { mode });
            } else {
                emit('done', { mode });
            }
        } catch (e) {
            emit('error', String(e.message || e));
        }
    });

    return bus;
}

const HTML = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ScrivaniaDelPotere — Dev Panel</title>
<style>
  :root {
    --bg: #1e1e2e; --surface: #2a2a3e; --border: #3a3a5c;
    --text: #cdd6f4; --subtext: #a6adc8; --green: #a6e3a1;
    --yellow: #f9e2af; --red: #f38ba8; --blue: #89b4fa;
    --mauve: #cba6f7; --teal: #94e2d5;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; font-size: 14px; }
  header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 14px 20px; display: flex; align-items: center; gap: 12px; }
  header h1 { font-size: 16px; font-weight: 600; color: var(--mauve); }
  header span { color: var(--subtext); font-size: 12px; }
  .layout { display: grid; grid-template-columns: 280px 1fr; min-height: calc(100vh - 53px); }
  .sidebar { background: var(--surface); border-right: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; gap: 16px; }
  .main { padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }

  .section-title { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--subtext); margin-bottom: 8px; }
  .input-row { display: flex; flex-direction: column; gap: 4px; }
  .input-row label { font-size: 12px; color: var(--subtext); }
  .input-row input { background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 4px; padding: 5px 8px; width: 100%; font-size: 13px; }
  .input-row input:focus { outline: none; border-color: var(--blue); }

  .btn { border: none; border-radius: 6px; padding: 9px 14px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity .15s; width: 100%; text-align: left; }
  .btn:hover { opacity: .85; }
  .btn:disabled { opacity: .4; cursor: not-allowed; }
  .btn-dryrun { background: var(--blue); color: #1e1e2e; }
  .btn-auto   { background: var(--green); color: #1e1e2e; }
  .btn-sim    { background: var(--mauve); color: #1e1e2e; }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px; }
  .card h3 { font-size: 13px; font-weight: 600; margin-bottom: 10px; color: var(--blue); }

  .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; }
  .metric { background: var(--bg); border-radius: 6px; padding: 10px; }
  .metric .val { font-size: 22px; font-weight: 700; }
  .metric .lbl { font-size: 11px; color: var(--subtext); margin-top: 2px; }
  .metric.ok   .val { color: var(--green); }
  .metric.warn .val { color: var(--yellow); }
  .metric.bad  .val { color: var(--red); }

  .bar-wrap { background: var(--bg); border-radius: 4px; height: 8px; margin-top: 6px; overflow: hidden; }
  .bar { height: 100%; border-radius: 4px; transition: width .4s; }

  .problems ul { list-style: none; display: flex; flex-direction: column; gap: 6px; }
  .problems li { display: flex; gap: 8px; align-items: flex-start; padding: 8px; border-radius: 6px; background: var(--bg); }
  .badge { font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
  .badge.high   { background: var(--red);    color: #1e1e2e; }
  .badge.medium { background: var(--yellow); color: #1e1e2e; }
  .badge.low    { background: var(--border); color: var(--text); }
  .problem-detail { font-size: 12px; color: var(--subtext); }

  .patch-list { display: flex; flex-direction: column; gap: 8px; }
  .patch-item { background: var(--bg); border-radius: 6px; padding: 10px 12px; border-left: 3px solid var(--blue); }
  .patch-item.high   { border-left-color: var(--red); }
  .patch-item.medium { border-left-color: var(--yellow); }
  .patch-item .patch-title { font-weight: 600; margin-bottom: 4px; }
  .patch-item .patch-file  { font-size: 11px; color: var(--teal); font-family: monospace; }
  .patch-item .patch-prev  { font-size: 11px; font-family: monospace; margin-top: 6px; white-space: pre-wrap; color: var(--subtext); }
  .patch-item .patch-why   { font-size: 12px; color: var(--subtext); margin-top: 4px; font-style: italic; }

  .log-box { background: var(--bg); border-radius: 6px; padding: 10px; font-family: monospace; font-size: 12px; max-height: 260px; overflow-y: auto; color: var(--subtext); line-height: 1.6; }
  .log-box .warn  { color: var(--yellow); }
  .log-box .error { color: var(--red); }
  .log-box .info  { color: var(--subtext); }
  .log-box .ok    { color: var(--green); }

  .spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid var(--border); border-top-color: var(--blue); border-radius: 50%; animation: spin .7s linear infinite; margin-right: 6px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .phase-row { display: flex; align-items: center; font-size: 12px; color: var(--blue); min-height: 24px; }

  .applied-list { display: flex; flex-direction: column; gap: 6px; }
  .applied-item { background: var(--bg); border-radius: 6px; padding: 8px 10px; border-left: 3px solid var(--green); font-size: 12px; }
  .applied-item .diff { font-family: monospace; font-size: 11px; white-space: pre; color: var(--subtext); margin-top: 4px; overflow-x: auto; }
  .empty-state { color: var(--subtext); font-size: 13px; font-style: italic; padding: 8px 0; }
</style>
</head>
<body>
<header>
  <h1>🖥 ScrivaniaDelPotere — Dev Panel</h1>
  <span id="status">Pronto</span>
</header>
<div class="layout">
  <aside class="sidebar">
    <div>
      <div class="section-title">Configurazione</div>
      <div class="input-row"><label>Run simulazione</label><input type="number" id="cfg-runs" value="5" min="1" max="50"></div>
      <div style="height:8px"></div>
      <div class="input-row"><label>Giorno target</label><input type="number" id="cfg-day" value="10" min="2" max="60"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      <div class="section-title">Azioni</div>
      <button class="btn btn-dryrun" onclick="run('dryrun')">▶ Dry-run (nessuna modifica)</button>
      <button class="btn btn-auto"   onclick="run('auto')">⚡ Auto-apply patch</button>
      <button class="btn btn-sim"    onclick="run('sim')">💻 Solo simulazione headless</button>
    </div>
    <div style="margin-top:auto;">
      <div class="phase-row" id="phase-row"></div>
    </div>
  </aside>

  <main class="main">
    <div class="card" id="card-metrics" style="display:none">
      <h3>📊 Metriche simulazione</h3>
      <div class="metrics-grid" id="metrics-grid"></div>
    </div>

    <div class="card problems" id="card-problems" style="display:none">
      <h3>⚠️ Top 3 problemi</h3>
      <ul id="problems-list"></ul>
    </div>

    <div class="card" id="card-patches" style="display:none">
      <h3>🔧 Patch candidate</h3>
      <div class="patch-list" id="patch-list"></div>
    </div>

    <div class="card" id="card-applied" style="display:none">
      <h3>✅ Patch applicate</h3>
      <div class="applied-list" id="applied-list"></div>
    </div>

    <div class="card">
      <h3>📋 Log analisi statica</h3>
      <div class="log-box" id="log-box"><span class="info">In attesa di run...</span></div>
    </div>
  </main>
</div>

<script>
const $ = id => document.getElementById(id);
let es = null;

function setStatus(msg) { $('status').textContent = msg; }

function setPhase(msg) {
  $('phase-row').innerHTML = msg
    ? \`<span class="spinner"></span>\${msg}\`
    : '';
}

function metricCard(val, label, cls) {
  return \`<div class="metric \${cls}"><div class="val">\${val}</div><div class="lbl">\${label}</div></div>\`;
}

function appendLog(line) {
  const box = $('log-box');
  const cls = /WARNING/.test(line) ? 'warn' : /ERROR/.test(line) ? 'error' : /INFO/.test(line) ? 'info' : '';
  const div = document.createElement('div');
  if (cls) div.className = cls;
  div.textContent = line;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function run(mode) {
  document.querySelectorAll('.btn').forEach(b => b.disabled = true);
  $('log-box').innerHTML = '';
  $('card-metrics').style.display = 'none';
  $('card-problems').style.display = 'none';
  $('card-patches').style.display = 'none';
  $('card-applied').style.display = 'none';

  if (es) es.close();

  const runs = $('cfg-runs').value || 5;
  const day  = $('cfg-day').value  || 10;
  setStatus('Running...');
  setPhase('Avvio analisi...');

  es = new EventSource(\`/api/run?mode=\${mode}&runs=\${runs}&day=\${day}\`);

  es.onmessage = e => {
    const { type, data } = JSON.parse(e.data);

    if (type === 'phase')  { setPhase(data); }
    if (type === 'lines')  { (data || []).forEach(l => appendLog(l)); }

    if (type === 'metrics') {
      $('card-metrics').style.display = '';
      const g = $('metrics-grid');
      const mCls = v => v < 0 ? 'bad' : v < 200 ? 'warn' : 'ok';
      const sCls = v => v > 65 ? 'bad' : v > 45 ? 'warn' : 'ok';
      const gCls = v => v > 80 ? 'bad' : v > 40 ? 'warn' : 'ok';
      g.innerHTML =
        metricCard('€' + data.avgMoney, \`Soldi medi (g.\${data.targetDay})\`, mCls(data.avgMoney)) +
        metricCard(data.avgStress, 'Stress medio', sCls(data.avgStress)) +
        (data.avgHealth !== null ? metricCard(data.avgHealth, 'Salute media', sCls(100 - data.avgHealth)) : '') +
        metricCard(data.taskRate + '%', 'Task completion', data.taskRate > 90 ? 'ok' : 'warn') +
        metricCard(data.gameOverRate + '%', 'Game over rate', gCls(data.gameOverRate)) +
        (data.gameOverReasons && data.gameOverReasons !== 'nessuno'
          ? \`<div class="metric warn"><div class="val" style="font-size:13px">\${data.gameOverReasons}</div><div class="lbl">Cause game-over</div></div>\`
          : '');
    }

    if (type === 'topProblems') {
      $('card-problems').style.display = '';
      $('problems-list').innerHTML = (data || []).map(p =>
        \`<li><span class="badge \${p.severity}">\${p.severity}</span><div><div>\${p.title}</div><div class="problem-detail">\${p.detail}</div></div></li>\`
      ).join('');
    }

    if (type === 'patches') {
      $('card-patches').style.display = '';
      $('patch-list').innerHTML = (data || []).map(p =>
        \`<div class="patch-item \${p.severity}">
          <div class="patch-title">\${p.title}</div>
          <div class="patch-file">\${p.file}</div>
          <div class="patch-why">\${p.rationale}</div>
          <div class="patch-prev">\${p.preview}</div>
        </div>\`
      ).join('');
    }

    if (type === 'applied') {
      $('card-applied').style.display = '';
      $('applied-list').innerHTML = (data && data.length > 0)
        ? data.map(a => \`<div class="applied-item"><b>\${a.title}</b> <span class="patch-file">\${a.file}</span><div class="diff">\${a.diff || ''}</div></div>\`).join('')
        : '<div class="empty-state">Nessuna patch applicata.</div>';
    }

    if (type === 'error') {
      appendLog('ERROR: ' + data);
      setStatus('Errore');
      setPhase('');
      document.querySelectorAll('.btn').forEach(b => b.disabled = false);
      es.close();
    }

    if (type === 'done') {
      setStatus('Completato');
      setPhase('');
      document.querySelectorAll('.btn').forEach(b => b.disabled = false);
      es.close();
    }
  };

  es.onerror = () => {
    setStatus('Errore connessione SSE');
    setPhase('');
    document.querySelectorAll('.btn').forEach(b => b.disabled = false);
  };
}
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(HTML);
        return;
    }

    if (url.pathname === '/api/run') {
        const mode = url.searchParams.get('mode') || 'dryrun';
        const runs = Math.max(1, Math.min(50, Number(url.searchParams.get('runs') || 5)));
        const day  = Math.max(2, Math.min(60, Number(url.searchParams.get('day')  || 10)));

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        });

        const send = (type, data) => {
            res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
        };

        if (mode === 'sim') {
            // Headless-only: just regression
            send('phase', 'Simulazione headless...');
            try {
                const regression = runRegression(runs, day);
                const reasons = regression.metrics.gameOverReasons || {};
                const reasonParts = Object.entries(reasons).filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`);
                send('metrics', {
                    runs: regression.runs,
                    targetDay: regression.targetDay,
                    elapsedMs: regression.elapsedMs,
                    avgMoney: regression.metrics.avgMoneyDayN,
                    avgStress: regression.metrics.avgStress,
                    avgHealth: regression.metrics.avgHealth,
                    taskRate: regression.metrics.taskCompletionRate,
                    gameOverRate: regression.metrics.gameOverRate,
                    gameOverReasons: reasonParts.join(', ') || 'nessuno',
                });
                send('done', { mode });
            } catch (e) {
                send('error', String(e.message || e));
            }
            res.end();
            return;
        }

        const bus = runAnalysis(mode, runs, day);
        bus.on('event', ({ type, data }) => send(type, data));
        bus.on('event', ({ type }) => {
            if (type === 'done' || type === 'error') res.end();
        });
        req.on('close', () => bus.removeAllListeners());
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`\n  ScrivaniaDelPotere Dev Panel`);
    console.log(`  http://localhost:${PORT}\n`);
    console.log('  Apri il pannello nel browser o nel Simple Browser di VS Code.');
    console.log('  Ctrl+C per fermare.\n');
});
