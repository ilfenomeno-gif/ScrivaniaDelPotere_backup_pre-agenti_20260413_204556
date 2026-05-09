# Skill: deck-template-rebuilder

## Descrizione
Ricostruisce un template di presentazione aziendale a partire da un file di analisi dettagliata (colori, font, layout, elementi visivi).

## Flusso di lavoro
1. Ricevi file di analisi template (es. deck_template_analysis.md).
2. Genera un nuovo template pptx fedele all'originale per colori, font, layout e stile.
3. Inserisce elementi decorativi e ricorrenti secondo le specifiche dell'analisi.
4. Restituisce il nuovo template pptx nella cartella di output.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Nuovo template pptx

---

### Esempio di prompt per l'utente
"Ricrea il template di presentazione aziendale a partire dal file /_templates/deck_template_analysis.md."
