# Skill: notion-taskboard-sync

## Descrizione
Collega e sincronizza una task board Notion con il team AI, permettendo di:
- Scansionare i task con stato "Da Fare"
- Ordinarli per scadenza, priorità e complessità
- Aggiornare lo stato dei task ("In Corso", "Completato")
- Allegare output e percorsi file ai task completati

## Flusso di lavoro
1. Scansiona la task board Notion per i task "Da Fare".
2. Ordina i task secondo le regole di priorità.
3. Aggiorna lo stato a "In Corso" quando un agente prende in carico il task.
4. Esegui il task con agenti/skill appropriati.
5. Aggiorna lo stato a "Completato" e allega output.

## Brand-agnostic
Nessun riferimento a brand specifici. Recupera il contesto brand a runtime.

---

### Esempio di prompt per l'utente
"Scansiona la Task Board Marketing su Notion per tutti i task con stato 'Da Fare', ordinali per priorità e lavoraci uno alla volta."
