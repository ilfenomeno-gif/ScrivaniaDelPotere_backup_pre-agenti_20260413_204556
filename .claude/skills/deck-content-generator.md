# Skill: deck-content-generator

## Descrizione
Genera contenuti per slide di presentazioni e deck strategici, a partire da brief e obiettivi di campagna.

## Flusso di lavoro
1. Ricevi brief, obiettivi e parametri della presentazione.
2. Recupera linee guida brand da _context/ e template da _templates/ a runtime.
3. Genera testi, titoli, bullet point e visual coerenti con il brand e il template.
4. Restituisce contenuti strutturati per slide (testo, dati, suggerimenti visual).

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Testi e contenuti per slide (md, txt, json)

---

### Esempio di prompt per l'utente
"Genera i contenuti per un deck di strategia Q3 lancio estivo: obiettivi, audience, canali, budget, timeline."
