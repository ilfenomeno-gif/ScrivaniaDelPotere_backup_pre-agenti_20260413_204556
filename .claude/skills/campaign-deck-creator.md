# Skill: campaign-deck-creator

## Descrizione
Crea deck di strategia e presentazioni di campagna brandizzate, partendo da template e analisi design.

## Flusso di lavoro
1. Ricevi brief, obiettivi e parametri della campagna.
2. Recupera il template di presentazione da /_templates/ e l'analisi design da /_templates/deck_template_analysis.md.
3. Genera il deck rispettando colori, font, layout e stile del template.
4. Inserisce visualizzazioni dati (budget, audience, timeline, ecc.) secondo le specifiche del brief.
5. Restituisce il file deck (pptx, pdf) nella cartella di output.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- File deck (pptx, pdf)
- Specifiche di presentazione (opzionale)

---

### Esempio di prompt per l'utente
"Crea un deck di strategia per la campagna Q3 lancio estivo, includendo obiettivi, audience, canali, budget e timeline."
