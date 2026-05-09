# Skill: deck-template-taskboard-sync

## Descrizione
Sincronizza task di creazione, revisione e gestione template/deck con la task board (es. Notion), garantendo tracciabilità e aggiornamento stato.

## Flusso di lavoro
1. Ricevi task da sincronizzare (creazione, revisione, esportazione, ecc.).
2. Aggiorna lo stato del task sulla task board (assegnato, in corso, completato).
3. Allegare output e log delle attività al task.
4. Restituisce conferma di sincronizzazione e stato aggiornato.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Stato task board aggiornato
- Log attività (md, txt)

---

### Esempio di prompt per l'utente
"Sincronizza la creazione del deck strategia_Q3.pptx con la task board marketing su Notion."
