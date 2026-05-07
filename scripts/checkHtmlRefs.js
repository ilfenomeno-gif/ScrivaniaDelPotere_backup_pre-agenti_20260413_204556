const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptSrcs = [...html.matchAll(/src=['"]([^'"]+\.js)['"]/g)].map(m => m[1]).filter(s => !s.startsWith('http'));
const cssSrcs = [...html.matchAll(/href=['"]([^'"]+\.css)['"]/g)].map(m => m[1]).filter(s => !s.startsWith('http'));
const missing = [...scriptSrcs, ...cssSrcs].filter(f => !fs.existsSync(f));
console.log('Script locali:', scriptSrcs.length, '| CSS locali:', cssSrcs.length);
if (missing.length) {
    console.log('MANCANTI:', missing.join(', '));
} else {
    console.log('Tutti i file referenziati esistono');
}
console.log('Script:', scriptSrcs.join(', '));
