# Skill: deck-visual-analyzer

## Descrizione
Analizza elementi decorativi e ricorrenti di un template di presentazione: forme, icone, grafiche, loghi, footer, numeri di pagina.

## Flusso di lavoro
1. Ricevi il percorso del template pptx da analizzare.
2. Identifica e descrivi tutti gli elementi visivi oltre a testo e dati.
3. Indica quali elementi sono riproducibili fedelmente e quali vanno semplificati.
4. Elenca elementi ricorrenti (footer, loghi, numeri di pagina, ecc.), posizione e dimensione.
5. Restituisce un report dettagliato degli elementi visivi.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Report elementi visivi (md, txt, json)

---

### Esempio di prompt per l'utente
"Analizza gli elementi decorativi e ricorrenti del template /_templates/deck_template.pptx e restituisci un report dettagliato."
