// Script per correggere la struttura di map.js
const fs = require('fs');
let content = fs.readFileSync('js/map.js', 'utf8');

// Fix 1: Correggi la chiusura dell'array uk e rimuovi showNationTransferUI da CITY_SEEDS
// Cerca il pattern: fine array uk con },  + riga vuota + async showNationTransferUI() {
const oldPattern = /\['oxford','Oxford','South East',51\.752,-1\.2577,'municipality','small',3\]\s*\n\s*\},\s*\n\s*\n\s*async showNationTransferUI\(\) \{/;
const newPattern = "['oxford','Oxford','South East',51.752,-1.2577,'municipality','small',3]\n    ],\n};\n";

if (oldPattern.test(content)) {
    content = content.replace(oldPattern, newPattern);
    console.log('Fix 1 applicato: array uk corretto, CITY_SEEDS chiuso, showNationTransferUI rimosso da CITY_SEEDS');
} else {
    console.log('Fix 1 FALLITO: pattern non trovato');
    // Trova manualmente
    const idx1 = content.indexOf("'oxford','Oxford','South East',51.752,-1.2577,'municipality','small',3]");
    if (idx1 !== -1) {
        const chunk = content.substring(idx1, idx1 + 200);
        console.log('Contesto trovato:', JSON.stringify(chunk));
    }
}

fs.writeFileSync('js/map.js', content, 'utf8');
console.log('File scritto.');
