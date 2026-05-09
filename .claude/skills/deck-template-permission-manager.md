# Skill: deck-template-permission-manager

## Descrizione
Gestisce permessi di accesso e modifica per template e deck, assegnando ruoli e restrizioni agli utenti del team.

## Flusso di lavoro
1. Ricevi file pptx/deck e richieste di permesso (lettura, scrittura, amministrazione).
2. Assegna permessi agli utenti secondo le policy definite.
3. Restituisce log permessi e stato aggiornato.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Log permessi (md, txt, json)
- Stato permessi aggiornato

---

### Esempio di prompt per l'utente
"Assegna permesso di modifica sul deck /output/strategia_Q3.pptx all'utente Marco."
