# Skill: deck-template-archiver

## Descrizione
Archivia template di presentazione e deck, organizzandoli per data, versione, tipologia e progetto.

## Flusso di lavoro
1. Ricevi file pptx/deck da archiviare e metadati (data, versione, tipologia, progetto).
2. Organizza e salva i file in struttura di archiviazione.
3. Restituisce log di archiviazione e percorso file.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Log archiviazione (md, txt)
- Percorso file archiviato

---

### Esempio di prompt per l'utente
"Archivia il deck /output/strategia_Q3.pptx come versione 1.0, progetto Q3 2026."
