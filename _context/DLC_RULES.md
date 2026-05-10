# DLC RULES — Scrivania del Potere
## Architettura Victoria 3-Style con Free Tier Garantito

### Regola Fondamentale
**Ogni DLC DEVE fornire contenuti significativi nel tier gratuito.**

Il modello Victoria 3 non è "compra DLC per avere qualsiasi cosa" — è "DLC amplifica e completa un'area già presente nel gioco base."

### Free Tier (Sempre Disponibile)
Ogni DLC deve includere almeno UNO di:
- Nuovi eventi (5+)
- Nuove UI/cosmetic (visibile a tutti)
- Nuove meccaniche semplici (formula base, funzione essenziale)
- Nuovi contenuti narrativi (storie, dialoghi)

### Paid Tier (DLC Attivo)
Amplifica il free tier con:
- Versioni complete del sistema (formule avanzate)
- Eventi aggiuntivi (10+)
- Interfacce dedicate
- Personaggi ricorrenti
- Sistemi di progresso

### Architettura Tecnica

**Pattern di Implementazione**
```javascript
// Ogni sistema DLC ha questa struttura:

const MyDLC = {
    init() { /* hook nel game loop */ },
    
    isActive() { 
        // Controlla flag DLC
        return Game.state.flags?.activeDlc?.includes('dlc_id');
    },

    // FREE TIER: sempre eseguito
    runBaseEvents() { /* 5+ eventi semplici */ },

    // PAID TIER: solo se isActive()
    runDlcEvents() { /* 10+ eventi avanzati, formule complete */ },

    onNewDay() {
        // Sempre
        this.runBaseEvents();
        
        // Solo se DLC attivo
        if (this.isActive()) {
            this.runDlcEvents();
        }
    },
};
```

**Game State Initialization**
```javascript
// Dormant variables sono SEMPRE presenti in Game.state
// Formule base sono SEMPRE calcolate
// Logica avanzata è protetta da isActive()

Game.state.mySystem = {
    baseVariable: 0,        // Base game
    dlcAdvanced: {},        // DLC extension
    dormantFormula: 0,      // Calcolato sempre
    dlcOnlyEvent: false,    // Usa isActive() prima di usarlo
};
```

---

## Verifica DLC Precedenti (Prima Ondata)

### ✅ Espansions
1. **"Le Toghe"** (judiciary.js)
   - ✅ Free: 2+ eventi generici su processi/inchieste
   - ✅ Paid: 3 giudici, 3 avvocati, sistema corruzione completo

2. **"Oltre i Confini"** (diplomacy.js)
   - ✅ Free: notizie generiche estere (2+ eventi)
   - ✅ Paid: 4 nazioni, accordi bilaterali, conti offshore completi

### ✅ Flavor Packs
3. **"La Cupola"** (mafiaExtensions.js)
   - ✅ Free: eventi mafiosi base (runBaseEvents)
   - ✅ Paid: 3 famiglie complete, successioni, rituali 40+ eventi

4. **"La Prima Repubblica"** (scenario.js)
   - ✅ Free: 5 eventi storici generici
   - ✅ Paid: scenario completo 1970-1992, Mani Pulite, Anni di Piombo

### ✅ Immersion Packs
5. **"Potere in Tasca"** (phoneExtensions.js)
   - ✅ Free: 3 decorazioni, 1 app
   - ✅ Paid: social media, dating app, 15+ eventi sociali

6. **"La Stampa"** (press.js)
   - ✅ Free: 2+ eventi stampa generici
   - ✅ Paid: 8 giornalisti, press conference, narrative control

**VERDICT**: Tutti i 6 DLC rispettano la regola. ✅

---

## Implementazione Nuova Ondata (Meccaniche Quotidiane)

### Categorie

| DLC | Tipo | Sistema | Free Tier | Paid Tier |
|-----|------|--------|-----------|-----------|
| Radici | Expansion | house → housing-extended | Nuove migliorie, 4° livello stanze | Villa + Attico, seconda proprietà, scandali |
| Agenda Piena | Expansion | calendar → dailySlots | Slot visibili, 3/giorno | Attività personali strutturate, fatigue, burnout |
| Corpo e Mente | Flavor | character → wellnessSystem | Tab benessere, 5 abitudini | Medico, crisi mediche, dipendenze escalation |
| Casa, Dolce Casa | Flavor | house → houseNarrative | Anniversari, 5 staff base | Visite domiciliari, 12 oggetti speciali, gossip |
| Il Prezzo del Potere | Immersion | budget → dailyExpenses | 3 spese casuali, notifiche | 15 categorie spese, evasione grigia, assicurazione |
| Tempo Libero | Immersion | lifestyle → hobbySystem | 2 hobby base, eventi generici | 8 hobby completi, 5 eventi/hobby, connessioni |

---

## Regola di Selezione DLC per Feature

Quando implementi una feature nuova, chiediti:

1. **È già presente in forma semplice?** → Flavor Pack (approfondisce)
2. **È un nuovo sistema meccanico?** → Expansion Pack (introduce)
3. **È atmosfera/cosmetic/colore?** → Immersion Pack (embelleshing)

### Esempi

- "Aggiungere hobby al gioco" → Flavor (lifestyle esiste, lo enrichisco) ❌ SBAGLIATO
- "Creare un sistema di hobby autonomo con integrazioni trasversali" → Immersion ✅ CORRETTO
- "Aggiungere un nuovo sistema di attività quotidiane strutturate" → Expansion ✅ CORRETTO
- "Aggiungere un medico come NPC corrompibile" → Flavor ✅ CORRETTO

---

## Checklist Implementazione

Per ogni nuovo DLC:
- [ ] Free tier implementato (runBaseEvents)
- [ ] Paid tier implementato (runDlcEvents)
- [ ] Verifica isActive() prima di paid logic
- [ ] Aggiunto a DLC_CATALOG in main.js
- [ ] Script tag aggiunto a index.html
- [ ] init() chiamato nel bootstrap di main.js
- [ ] Testato con headless simulation
- [ ] Events registrati con Game.addWorkNotif()
- [ ] Game.state dormienti inizializzate
- [ ] Documentazione nel _context/DLC_RULES.md aggiornata

---

## Note di Design

**Free Tier Non Deve Essere Banale**
- "Gratis: 1 evento ogni 100 giorni" ❌ è troppo poco
- "Gratis: 5+ eventi regolari, UI visibile, meccanica base" ✅ equilibrio

**DLC Deve Cambiare il Gioco**
- Se accendi/spegni un DLC e nulla cambia → fallimento
- Se accendi/spegni un DLC e vedi differenza netta → successo

**Integrazione ≠ Duplicazione**
- Non creare 2 sistemi paralleli (uno base, uno DLC)
- Estendi il sistema esistente con isActive() gates
- Usa dormant variables nel base game

---

**Aggiornato**: 2026-05-10
**Autore**: Orchestrator AI
**Status**: Active (governa tutti gli 8 DLC)
