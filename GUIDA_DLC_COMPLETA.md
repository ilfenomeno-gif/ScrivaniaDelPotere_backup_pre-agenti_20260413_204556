# GUIDA DLC COMPLETA - Scrivania del Potere

## Panoramica
Questa guida riassume tutti i DLC del progetto in modo pratico e tecnico:
- cosa trovi nel gioco base (senza DLC attivo)
- cosa aggiunge il DLC quando e attivo
- quali meccaniche vengono abilitate
- cosa cambia concretamente durante una partita
- cosa migliora rispetto al base game

Il progetto usa una logica "Victoria-style":
- ogni sistema ha un livello base sempre presente
- il DLC attivo abilita il livello avanzato
- il controllo e fatto da `Game.state.flags.activeDlc`

## Come funziona tecnicamente
Ogni sistema DLC segue questo schema:
1. `ensureState()` inizializza strutture stato (anche dormienti).
2. `runBaseEvents()` gira sempre o quando DLC e spento.
3. `isActive()` controlla se l'ID DLC e in `activeDlc`.
4. `runDlcEvents()` gira solo se DLC attivo.
5. `onNewDay()` applica eventi e progressione giornaliera.

Effetto pratico:
- DLC OFF: ricevi flavor/eventi base, senza sistemi avanzati.
- DLC ON: si attivano loop completi (economia, rischi, UI estesa, narrativa, progressione).

## Categorie DLC
- Expansion: nuovi sistemi/meccaniche estese.
- Flavor: profondita narrativa/sistemica su aree specifiche.
- Immersion: vita quotidiana, atmosfera, relazioni, ecosistemi.

---

## 1) Le Toghe - Sistema Giudiziario (Expansion)
ID: `dlc_toghe_judiciary`

### Base game (sempre presente)
- Voci di inchiesta e rinvii processuali occasionali.
- Presenza narrativa della giustizia, ma senza pipeline legale completa.

### Con DLC attivo
- Inchieste vere con gravita, prove e passaggio a dibattimento.
- Giudici con profilo (corruttibili o meno).
- Avvocati difensori con skill/costo.
- Processi con esito probabilistico e impatti economici/statistici.
- Possibilita di corrompere giudici (rischio/beneficio).

### Cosa cambia in partita
- Aumenta il rischio legale reale.
- Nuovo asse strategico: difesa legale vs corruzione.
- Possibili multe pesanti, stress alto, variazioni coerenza.

### Cosa migliora
- Trasforma eventi legali da flavor a sistema decisionale completo.

---

## 2) Oltre i Confini - Diplomazia e Geopolitica (Expansion)
ID: `dlc_oltre_confini_diplomacy`

### Base game
- Notizie estere generiche e variazioni narrative leggere.

### Con DLC attivo
- Relazioni bilaterali con nazioni estere.
- Crisi diplomatiche e risoluzioni.
- Accordi bilaterali con reward temporizzate.
- Accesso fondi UE (claim con consumo punteggio).
- Conti offshore con rischio e stress.

### Cosa cambia in partita
- Nuove entrate (deal, fondi UE) e nuovi rischi (crisi, offshore).
- Maggior peso alle scelte internazionali sul bilancio.

### Cosa migliora
- Aggiunge profondita macro-politica e leva finanziaria estera.

---

## 3) Radici - Sistema Abitativo (Expansion)
ID: `dlc_radici_housing`

### Base game
- Migliorie casa e feedback domestici base.

### Con DLC attivo
- Nuove abitazioni premium (Villa, Attico).
- Seconda proprieta con costi periodici.
- Rischi ispezione fiscale e scandali da doppia casa.
- Sala riunioni privata (attico) e incontri riservati.
- Catalogo migliorie avanzate (es. art gallery, safe room).

### Cosa cambia in partita
- Gestione immobiliare piu ricca: costo, rischio, reputazione.
- Nuovo bilanciamento tra status e esposizione mediatica.

### Cosa migliora
- Estende il housing da solo costo fisso a sistema strategico multi-casa.

---

## 4) Agenda Piena - Gestione del Tempo (Expansion)
ID: `dlc_agenda_piena_slots`

### Base game
- Slot giornalieri visibili e piccoli eventi di routine.

### Con DLC attivo
- Assegnazione attivita per fascia oraria (mattina/pomeriggio/sera).
- Attivita extra DLC con effetti dedicati.
- Sistema fatigue (giorni pieni consecutivi).
- Rischio burnout con penalita forti (stress/salute).

### Cosa cambia in partita
- Il tempo diventa risorsa pianificabile.
- Nuovo trade-off: produttivita immediata vs sostenibilita.

### Cosa migliora
- Introduce game loop giornaliero strutturato e piu profondo.

---

## 5) La Cupola - Profondita Criminale (Flavor)
ID: `dlc_cupola_mafia`

### Base game
- Eventi criminali generici nel sottobosco.

### Con DLC attivo
- 3 famiglie con territori, potere, personaggi, successioni.
- Archi narrativi mafiosi progressivi.
- Crisi di successione e rituali criminali.
- Eventi territoriali e funerali mafiosi.

### Cosa cambia in partita
- Il blocco mafia diventa persistente e narrativamente coerente.
- Aumenta la pressione reputazionale e psicologica.

### Cosa migliora
- Da eventi isolati a ecosistema criminale vivo.

---

## 6) La Prima Repubblica - Scenario Storico (Flavor)
ID: `dlc_prima_repubblica_scenario`

### Base game
- Richiami storici occasionali senza modalita dedicata.

### Con DLC attivo
- Modalita storica 1970-1992.
- Partiti storici e metriche d'epoca.
- Progressione Mani Pulite/Tangentopoli.
- Eventi terrorismo anni di piombo.
- Scenari di avvio tematici (dominanza DC, vigilia Tangentopoli, ecc.).

### Cosa cambia in partita
- Nuovo contesto storico con regole e minacce proprie.
- Aumenta il peso delle macro-dinamiche politiche italiane.

### Cosa migliora
- Introduce una cornice storica completa, non solo flavor testuale.

---

## 7) Corpo e Mente - Salute e Benessere (Flavor)
ID: `dlc_corpo_mente_wellness`

### Base game
- Tab benessere con abitudini base e storico salute/stress.

### Con DLC attivo
- Medico NPC (consulti riservati, relazione, coperture).
- Condizioni mediche e crisi salute.
- Dipendenze con escalation e crisi dedicate.
- Corruzione medica per coprire condizioni.

### Cosa cambia in partita
- Salute non e solo numero: diventa asse di rischio narrativo.
- Stress/salute possono collassare tramite crisi e dipendenze.

### Cosa migliora
- Da monitoraggio passivo a sistema clinico con decisioni morali/economiche.

---

## 8) Casa, Dolce Casa - Narrativa Domestica (Flavor)
ID: `dlc_casa_dolce_casa_narrative`

### Base game
- Anniversari domestici e personalita staff base.

### Con DLC attivo
- Visite in casa (politici, rivali, boss, giornalisti, ecc.).
- Gossip staff con possibili fughe alla stampa.
- Oggetti speciali con valore emotivo e bonus coerenza.
- Dinamica fedelta staff e impatti reputazionali.

### Cosa cambia in partita
- La casa diventa nodo narrativo e di rischio sociale.

### Cosa migliora
- Aggiunge profondita relazionale e conseguenze indirette domestiche.

---

## 9) Potere in Tasca - Lifestyle (Immersion)
ID: `dlc_potere_tasca_lifestyle`

### Base game
- Eventi app/telefono molto leggeri.

### Con DLC attivo
- Social media con follower, post, engagement.
- Dating app con match, relazioni e rischio scandalo.
- Eventi mondani con costo/prestigio.
- Cosmetic luxury con effetti su statistiche.

### Cosa cambia in partita
- Piu fonti di reputazione ma anche piu esposizione mediatica.
- Nuovi sink economici legati a status e lifestyle.

### Cosa migliora
- Potenzia il telefono da utility a sistema di identita pubblica.

---

## 10) La Stampa - Ecosystem Mediatico (Immersion)
ID: `dlc_stampa_media`

### Base game
- Titoli/notizie occasionali senza gestione diretta media.

### Con DLC attivo
- Testate e direttori con relazione dedicata.
- Conferenze stampa con esito e impatto.
- Narrativa pilotata (play newspaper).
- Scandali attivi e leak gestibili.

### Cosa cambia in partita
- Media come attore strategico persistente.
- Possibilita di controllo narrativo (con costo etico/statistico).

### Cosa migliora
- Trasforma la stampa da rumore di fondo a leva centrale.

---

## 11) Il Prezzo del Potere - Economia Quotidiana (Immersion)
ID: `dlc_prezzo_potere_expenses`

### Base game
- Spesa cibo giornaliera e piccoli extra casuali.
- Effetti alimentazione su salute.

### Con DLC attivo
- Abbonamenti mensili con effetti.
- Auto: acquisto + costi fuel/manutenzione/assicurazione.
- Spese di rappresentanza e imprevisti strutturati.
- Polizze opzionali e eventi coperti.

### Cosa cambia in partita
- Economia molto piu granulare, con budget management vero.
- Maggiore variabilita (imprevisti) e necessita di cuscinetto cassa.

### Cosa migliora
- Da economia semplice a sistema quotidiano ricco di decisioni.

---

## 12) Tempo Libero - Sistema Hobby (Immersion)
ID: `dlc_tempo_libero_hobbies`

### Base game
- 2 hobby base (lettura, calcetto) + eventi generici.

### Con DLC attivo
- 8 hobby avanzati con costi, connessioni e rischi scandalo.
- Progressione skill per hobby.
- Eventi hobby dedicati.
- Networking derivato dagli hobby.
- Public identity (hobby prestigiosi vs rischiosi).

### Cosa cambia in partita
- Gli hobby influenzano reputazione, rete sociale e vulnerabilita pubblica.

### Cosa migliora
- Il tempo libero diventa leva di carriera e rischio reputazionale.

---

## Differenze rapide: Base vs DLC attivo
- Base: flavor, segnali, piccoli bonus/malus, sistemi leggeri.
- DLC attivo: loop completi, nuove decisioni, nuovi costi/rischi, progressione profonda.

## Impatto reale sul gameplay
Con DLC attivi aumentano:
- variabili da gestire (stress, coerenza, salute, economia, reputazione)
- trade-off strategici
- eventi persistenti e catene narrative
- specializzazione del playstyle

Con DLC disattivi il gioco resta coerente, ma con minore profondita sistemica.

## Note utili per test/uso
- Verifica runtime: controllare `Game.state.flags.activeDlc`.
- I sistemi DLC espongono `isActive()` per distinguere base e premium.
- I DLC si riflettono soprattutto nel ciclo `new-day` tramite notifiche, eventi, costi e modifiche stat.

## Conclusione
I DLC non sono solo cosmetici: estendono realmente i sistemi core della partita.
Il base game resta giocabile e completo, mentre i DLC aggiungono ampiezza, profondita e nuove strategie in quasi tutte le aree (politica, economia, sociale, narrativa, salute, casa, media, diplomazia).
