# Skill: deck-template-rollbacker

## Descrizione
Permette di ripristinare versioni precedenti di template e deck in caso di errori o modifiche indesiderate.

## Flusso di lavoro
1. Ricevi file pptx/deck e richiesta di rollback (versione da ripristinare).
2. Ripristina la versione selezionata e aggiorna il log delle versioni.
3. Restituisce il file ripristinato e log aggiornato.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- File ripristinato (pptx)
- Log versioni aggiornato

---

### Esempio di prompt per l'utente
"Ripristina la versione 1.0 del deck /output/strategia_Q3.pptx."
