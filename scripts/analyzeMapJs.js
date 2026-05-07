// Script di analisi struttura graffe di map.js
const fs = require('fs');
const content = fs.readFileSync('js/map.js', 'utf8');
const lines = content.split('\n');
let depth = 0;
let inSingleStr = false;
let inDoubleStr = false;
let templateDepth = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevDepth = depth;
    for (let j = 0; j < line.length; j++) {
        const c = line[j];
        const prev = j > 0 ? line[j-1] : '';
        // Skip line comments
        if (!inSingleStr && !inDoubleStr && c === '/' && line[j+1] === '/') break;
        if (inSingleStr) { if (c === "'" && prev !== '\\') inSingleStr = false; continue; }
        if (inDoubleStr) { if (c === '"' && prev !== '\\') inDoubleStr = false; continue; }
        if (templateDepth > 0) { if (c === '`') templateDepth--; continue; }
        if (c === "'") { inSingleStr = true; continue; }
        if (c === '"') { inDoubleStr = true; continue; }
        if (c === '`') { templateDepth++; continue; }
        if (c === '{') depth++;
        if (c === '}') { depth--; }
    }
    if (i < 30 || depth !== prevDepth && depth <= 2) {
        console.log(`L${i+1} depth=${depth} | ${line.substring(0,80)}`);
    }
}
console.log('\nFinal brace depth:', depth);
if (depth !== 0) console.log('ERROR: Unbalanced braces! Expected 0, got', depth);
