# Skill: deck-template-brand-checker

## Descrizione
Verifica che template e deck rispettino le linee guida di brand (colori, font, stile, logo, ecc.).

## Flusso di lavoro
1. Ricevi file pptx/deck e linee guida brand da _context/.
2. Confronta colori, font, stile, logo, elementi visivi con le linee guida.
3. Segnala eventuali discrepanze e suggerisce correzioni.
4. Restituisce un report di verifica dettagliato.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Report verifica brand (md, txt, json)

---

### Esempio di prompt per l'utente
"Verifica che il deck /output/strategia_Q3.pptx rispetti le linee guida brand in /_context/brand-guidelines.md."
