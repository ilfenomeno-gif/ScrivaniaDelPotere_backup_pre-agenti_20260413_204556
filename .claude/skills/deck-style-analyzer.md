# Skill: deck-style-analyzer

## Descrizione
Analizza colori, tipografia e stile di un template di presentazione, restituendo codici colore, font, pattern stilistici e regole di design.

## Flusso di lavoro
1. Ricevi il percorso del template pptx da analizzare.
2. Estrai colori di sfondo, accenti, pattern d'uso (con codici hex se possibile).
3. Analizza font, dimensioni, stili, spaziature e pattern testuali.
4. Restituisce un report dettagliato su colori, font e regole di stile.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Report stile (md, txt, json)

---

### Esempio di prompt per l'utente
"Analizza colori e font del template /_templates/deck_template.pptx e restituisci un report dettagliato."
