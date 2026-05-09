# Skill: deck-layout-analyzer

## Descrizione
Analizza i layout delle slide di un template di presentazione, identificando tipologie di layout, posizionamento degli elementi e pattern ricorrenti.

## Flusso di lavoro
1. Ricevi il percorso del template pptx da analizzare.
2. Estrai e descrivi ogni tipo di layout slide (titolo, contenuto, tabella, griglia, ecc.).
3. Per ogni layout, descrivi la posizione di titoli, testo, immagini, icone, footer.
4. Restituisce un report dettagliato dei layout identificati.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Report layout slide (md, txt, json)

---

### Esempio di prompt per l'utente
"Analizza i layout del template /_templates/deck_template.pptx e restituisci un report dettagliato."
