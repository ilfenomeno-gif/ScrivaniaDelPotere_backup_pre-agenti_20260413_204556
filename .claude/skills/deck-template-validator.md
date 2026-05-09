# Skill: deck-template-validator

## Descrizione
Valida la coerenza di un template di presentazione rispetto alle linee guida di brand e alle specifiche di design (colori, font, layout, elementi visivi).

## Flusso di lavoro
1. Ricevi template pptx e file di specifiche/linee guida.
2. Confronta colori, font, layout, elementi visivi con le specifiche.
3. Segnala eventuali discrepanze e suggerisce correzioni.
4. Restituisce un report di validazione dettagliato.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Report di validazione (md, txt, json)

---

### Esempio di prompt per l'utente
"Valida il template /_templates/deck_template.pptx rispetto alle linee guida in /_context/brand-guidelines.md."
