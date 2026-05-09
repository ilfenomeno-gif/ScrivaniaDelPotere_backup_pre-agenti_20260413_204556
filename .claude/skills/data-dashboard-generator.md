# Skill: data-dashboard-generator

## Descrizione
Genera dashboard dati e visualizzazioni delle performance per campagne marketing, a partire da dati forniti o raccolti dagli agenti.

## Flusso di lavoro
1. Ricevi dati di campagna e parametri di visualizzazione (KPI, periodo, canali, ecc.).
2. Recupera linee guida brand a runtime da _context/.
3. Genera dashboard e visual (grafici, tabelle, infografiche) coerenti con il brand.
4. Restituisce file dashboard (PNG, PDF, HTML, ecc.).

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Dashboard dati (PNG, PDF, HTML, ecc.)
- Visualizzazioni KPI

---

### Esempio di prompt per l'utente
"Genera la dashboard delle performance della campagna Q3 lancio estivo, con breakdown per canale e timeline."
