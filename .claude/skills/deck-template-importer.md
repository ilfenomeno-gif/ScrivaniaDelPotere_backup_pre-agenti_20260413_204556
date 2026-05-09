# Skill: deck-template-importer

## Descrizione
Importa template di presentazione da file esterni, li analizza e li integra nel sistema di skill per l'utilizzo e la personalizzazione.

## Flusso di lavoro
1. Ricevi file pptx esterno da importare.
2. Analizza colori, font, layout, elementi visivi.
3. Genera file di analisi e integra il template tra quelli disponibili.
4. Restituisce conferma di import e file di analisi.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- File di analisi (md, txt, json)
- Template integrato

---

### Esempio di prompt per l'utente
"Importa il template /import/nuovo_template.pptx e genera il file di analisi."
