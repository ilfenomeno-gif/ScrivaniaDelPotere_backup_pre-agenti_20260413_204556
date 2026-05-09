# Skill: deck-template-metadata-extractor

## Descrizione
Estrae metadati da template di presentazione e deck: autore, data creazione, versione, tipologia, progetto, ecc.

## Flusso di lavoro
1. Ricevi file pptx/deck da cui estrarre i metadati.
2. Analizza e restituisce i metadati rilevanti.
3. Salva i metadati in file separato o li restituisce come output.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- File metadati (json, md, txt)

---

### Esempio di prompt per l'utente
"Estrai i metadati dal deck /output/strategia_Q3.pptx."
