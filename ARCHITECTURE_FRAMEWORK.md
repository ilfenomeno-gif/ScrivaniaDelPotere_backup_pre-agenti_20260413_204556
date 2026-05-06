# Framework Architetturale - La Scrivania del Potere

Questo documento consolida l'architettura modulare multi-nazione (Italia, Francia, Germania, Regno Unito) e i contratti dati condivisi.

## Struttura modulo-responsabilita
- `js/game.js`: stato globale, nazione corrente, modificatori paese, helper ideologie.
- `js/character.js`: creazione personaggio, nazione/ideologia/mentore, onboarding citta.
- `js/map.js`: caricamento `cities_<nation>.json`, trasferimenti citta/paese.
- `js/events.js`: pool globale + pool nazione + pool citta.
- `js/phone.js`: azioni specifiche citta (tab Territorio/Mondo).
- `js/localization.js`: traduzioni per lingua nazione e helper `translate`.
- `js/contracts.js`: typedef JSDoc centrali (Nation, City, Mentor, GameEvent).

## Contratti dati
I contratti ufficiali sono definiti in `js/contracts.js`.

## Flusso runtime
1. Start partita -> selezione personaggio/nazione in `character.js`.
2. `Game.loadNation(id)` carica metadata nazione e mentori.
3. Selezione mentore per ideologia da DB nazione.
4. `GameMap.loadCities()` carica `data/cities_<nation>.json`.
5. In gioco, `Events.triggerRandomEvent()` combina eventi globali+nazione+citta.
6. Nel telefono, `Phone.renderCityActions()` espone azioni della citta corrente.

## Compatibilita dati
- Nazioni: supportati entrambi i campi `defaultCity` e `startingCity`.
- Mentori: supportati `reputazioneNazionale` e alias `repNazionale`.
- Citta: se manca `country/nationId`, il loader normalizza con la nazione attiva.

## Checklist stato implementazione
- [x] Caricamento nazione dinamico in `game.js`.
- [x] Mentori per ideologia e nazione via DB JSON.
- [x] Citta per nazione con fallback Italia legacy.
- [x] Eventi cittadini uniti nel trigger random.
- [x] Azioni citta nel telefono (Territorio).
- [x] Localizzazione base per UI/eventi/task.
- [x] Contratti dati centralizzati in JSDoc.
