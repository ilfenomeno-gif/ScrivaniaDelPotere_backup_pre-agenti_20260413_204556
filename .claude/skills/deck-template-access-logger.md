# Skill: deck-template-access-logger

## Descrizione
Registra tutti gli accessi e le modifiche ai template e deck, per garantire tracciabilità e sicurezza.

## Flusso di lavoro
1. Ricevi file pptx/deck e informazioni di accesso/modifica (utente, data, azione).
2. Registra l'accesso/modifica in un log centralizzato.
3. Restituisce log aggiornato e report di sicurezza (opzionale).

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Log accessi (md, txt, json)
- Report sicurezza (opzionale)

---

### Esempio di prompt per l'utente
"Registra l'accesso al deck /output/strategia_Q3.pptx da parte di Marco il 10/05/2026."
