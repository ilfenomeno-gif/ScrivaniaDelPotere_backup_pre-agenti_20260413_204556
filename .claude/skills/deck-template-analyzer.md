# Skill: deck-template-analyzer

## Descrizione
Analizza un template di presentazione aziendale (pptx) e restituisce un report dettagliato su:
- Sistema colori (sfondi, accenti, pattern)
- Tipografia (font, stili, dimensioni)
- Pattern di layout (tipi di slide, posizionamento elementi)
- Elementi decorativi (forme, icone, grafiche)
- Elementi ricorrenti (footer, loghi, numeri di pagina)

## Flusso di lavoro
1. Ricevi il percorso del template pptx da analizzare.
2. Estrai e analizza i dati visivi e strutturali.
3. Restituisci un report strutturato secondo le 5 sezioni richieste.

## Brand-agnostic
Questa skill non contiene riferimenti a brand specifici. Recupera le linee guida del brand da _context/ solo se richiesto dal task.

## Output
Restituisce un file di report (es. deck_template_analysis.md) nella cartella di output specificata.

---

### Esempio di prompt per l'utente
"Analizza il template /_templates/deck_template.pptx e genera un report dettagliato su colori, font, layout, elementi decorativi e ricorrenti."
