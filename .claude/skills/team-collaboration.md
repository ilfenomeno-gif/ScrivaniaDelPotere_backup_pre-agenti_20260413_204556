# Skill: team-collaboration

## Descrizione
Coordina la collaborazione tra agenti AI e skill su task di marketing, garantendo che ogni task sia assegnato all'agente/skill più adatto e che il flusso sia tracciato.

## Flusso di lavoro
1. Ricevi task e parametri (obiettivo, scadenza, priorità, ecc.).
2. Assegna il task all'agente/skill più adatto secondo ruolo e specializzazione.
3. Traccia lo stato del task (assegnato, in corso, completato) e aggiorna la task board (es. Notion).
4. Coordina la collaborazione tra agenti/skill per task multi-step.
5. Restituisce log delle attività e output prodotti.

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera il contesto brand a runtime.

## Output
- Log attività (md, txt)
- Stato task aggiornato
- Output prodotti dai vari agenti/skill

---

### Esempio di prompt per l'utente
"Coordina la collaborazione tra agenti per completare la campagna Q3 lancio estivo, traccia lo stato su Notion."
