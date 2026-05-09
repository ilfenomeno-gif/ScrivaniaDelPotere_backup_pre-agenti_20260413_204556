# CLAUDE.md — Istruzioni Progetto Marketing AI (FitCore)

## Struttura del Workspace
- **_context/**: File fondamentali del brand (linee guida, valori, voice, visual, ecc.)
- **_sop/**: Procedure operative standard per i flussi di marketing
- **_templates/**: Template riutilizzabili (deck, social, email, ecc.)
- **Altre cartelle**: Output finiti, organizzati per tipologia (es. /deck, /social, /report)

## Regole Chiave
- **Tutti gli output** devono rispettare le linee guida sulla voce del brand in _context/.
- Carica file di contesto aggiuntivi da _context/ solo se direttamente rilevanti per il task.
- **Skill Claude**: Devono essere brand-agnostic. Definiscono solo flusso di lavoro e processo, mai dettagli specifici del brand. Recuperano il contesto brand a runtime.
- **Agenti AI**: Anche gli agenti sono brand-agnostic. Recuperano il contesto brand a runtime. Ogni agente ha un ruolo chiaro e non sovrapposto.

## Flusso Consigliato
1. **Crea skill riutilizzabili** per deck, contenuti, creatività e landing page. Mantieni le skill generiche e carica il contesto brand solo quando serve.
2. **Crea agenti AI specializzati** (es. data analyst, content creator, market researcher, creative designer, campaign strategist). Ogni agente ha un ruolo unico e recupera il contesto brand a runtime.
3. **Fai collaborare agenti e skill** su campagne marketing complete: ogni task viene suddiviso e assegnato all'agente/skill più adatto.
4. **Collega una task board Notion**: la task board gestisce i task reali del team AI. Gli agenti aggiornano lo stato dei task e allegano output.

## Esempio di Collaborazione
- La task board Notion elenca i task "Da Fare".
- Gli agenti AI li prendono in carico, aggiornano lo stato a "In Corso", eseguono il task usando le skill, poi aggiornano a "Completato" e allegano i file di output.
- Tutti i processi e output rispettano le linee guida brand in _context/.

## Note
- Per ogni nuova skill o agente, assicurati che sia brand-agnostic e recuperi il contesto brand a runtime.
- Aggiorna questa documentazione se la struttura o le regole cambiano.