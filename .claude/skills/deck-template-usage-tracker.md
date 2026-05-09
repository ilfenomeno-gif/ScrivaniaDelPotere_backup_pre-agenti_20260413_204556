# Skill: deck-template-usage-tracker

## Descrizione
Traccia l'utilizzo di template e deck nel tempo, registrando chi li ha usati, per quali progetti e con quali output.

## Flusso di lavoro
1. Ricevi file pptx/deck e informazioni di utilizzo (utente, progetto, data, output).
2. Registra l'utilizzo in un log centralizzato.
3. Restituisce log aggiornato e statistiche di utilizzo.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Log utilizzo (md, txt, json)
- Statistiche di utilizzo (opzionale)

---

### Esempio di prompt per l'utente
"Registra l'utilizzo del deck /output/strategia_Q3.pptx per la campagna Q3 lancio estivo."
