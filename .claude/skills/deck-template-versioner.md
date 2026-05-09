# Skill: deck-template-versioner

## Descrizione
Gestisce versioni di template di presentazione, permettendo di creare, confrontare e ripristinare versioni precedenti.

## Flusso di lavoro
1. Ricevi template pptx e richiesta di versionamento (crea nuova versione, confronta, ripristina).
2. Salva la versione, confronta differenze o ripristina secondo richiesta.
3. Restituisce log delle versioni e file aggiornati.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Log versioni (md, txt)
- Template aggiornato o ripristinato

---

### Esempio di prompt per l'utente
"Crea una nuova versione del template /_templates/deck_template.pptx prima di applicare modifiche."
