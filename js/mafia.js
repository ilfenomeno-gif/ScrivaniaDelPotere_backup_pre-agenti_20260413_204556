/* ============================================
   MAFIA — La Zona Grigia (Corruzione & Mafia)
   ============================================ */

const Mafia = {

    // === RANKS ===
    RANKS: [
        { id: 0, label: 'Nessuno', icon: '' },
        { id: 1, label: 'Picciotto', icon: '🤫', dailyMoney: 100, dailyStress: 5, riskBase: 5 },
        { id: 2, label: 'Uomo d\'Onore', icon: '🤝', dailyMoney: 300, dailyStress: 8, riskBase: 10 },
        { id: 3, label: 'Capodecina', icon: '💀', dailyMoney: 800, dailyStress: 15, riskBase: 30 },
        { id: 4, label: 'Capo Mandamento', icon: '👑', dailyMoney: 2000, dailyStress: 20, riskBase: 50 },
    ],

    // === FAVORI POOL (Livello 2) ===
    FAVORS: [
        {
            id: 'pratica_edilizia',
            title: 'Pratica Edilizia Sospetta',
            text: '"Fai passare questa pratica edilizia. Nessuno controllerà."',
            accept: { money: 500, career: 5, coherence: -8, riskAdd: 5 },
            refuse: { totoRelation: -10, rispetto: -5 },
            discoveryChance: 0.15,
            discoveryPenalty: { reputazione: -20, stress: 15 },
        },
        {
            id: 'nipote',
            title: 'Il Nipote di Totò',
            text: '"Assumi mio nipote in ufficio. È bravo, fidati."',
            accept: { money: 200, totoRelation: 10, stressDelayed: 15 },
            refuse: { totoRelation: -15 },
            discoveryChance: 0,
            delayedEvent: { day: 3, text: 'Il nipote di Totò ha rubato documenti dal tuo ufficio!', stress: 15, reputazione: -5 },
        },
        {
            id: 'riunione_quartiere',
            title: 'Saltare la Riunione',
            text: '"Non andare a quella riunione di quartiere. Fidati."',
            accept: { money: 100, stanchezza: -10 },
            refuse: { totoRelation: -5 },
            discoveryChance: 0,
            delayedEvent: { day: 2, text: 'Un tuo rivale ha preso il controllo del territorio mentre eri assente.', reputazione: -10 },
        },
        {
            id: 'firma_cieca',
            title: 'Il Foglio Misterioso',
            text: '"Firma questo foglio, non leggere. È una formalità."',
            accept: { money: 1000, totoRelation: 15, riskAdd: 10 },
            refuse: { totoRelation: -20, rispetto: -10 },
            discoveryChance: 0.25,
            discoveryPenalty: { reputazione: -30, stress: 20, coherence: -15 },
            delayedEvent: { day: 5, text: 'Hai autorizzato una discarica abusiva! I giornalisti indagano.', reputazione: -30, rischioIndagini: 15 },
        },
        {
            id: 'voto_consiglio',
            title: 'Il Voto in Consiglio',
            text: '"Vota a favore della variante urbanistica. I miei amici ne hanno bisogno."',
            accept: { money: 400, coherence: -10, riskAdd: 8 },
            refuse: { totoRelation: -12 },
            discoveryChance: 0.1,
            discoveryPenalty: { reputazione: -15 },
        },
        {
            id: 'informazioni',
            title: 'Informazioni Riservate',
            text: '"Passami i nomi dei proprietari di quel terreno. Solo i nomi."',
            accept: { money: 300, totoRelation: 10, riskAdd: 3 },
            refuse: { totoRelation: -8 },
            discoveryChance: 0.05,
            discoveryPenalty: { reputazione: -10, career: -5 },
        },
        {
            id: 'appalto',
            title: 'L\'Appalto Pilotato',
            text: '"Fai vincere la ditta di un mio amico. È tutto regolare... quasi."',
            accept: { money: 800, coherence: -12, riskAdd: 12 },
            refuse: { totoRelation: -15, rispetto: -8 },
            discoveryChance: 0.2,
            discoveryPenalty: { reputazione: -25, rischioIndagini: 10 },
        },
        {
            id: 'testimone',
            title: 'Il Testimone Scomodo',
            text: '"C\'è uno che parla troppo al bar. Convincilo a stare zitto."',
            accept: { money: 250, totoRelation: 15, stress: 12, riskAdd: 5 },
            refuse: { totoRelation: -10 },
            discoveryChance: 0.08,
            discoveryPenalty: { reputazione: -15, stress: 10 },
        },
    ],

    // === EVENTI CASUALI MAFIOSI (Se sei nel giro) ===
    MAFIA_EVENTS: [
        {
            id: 'retata',
            title: 'La Retata',
            body: 'La polizia ha arrestato 5 tuoi contatti. Sei coinvolto?',
            minRank: 2,
            choices: {
                accept: { label: '🏃 Scappa e nasconditi', effects: { stress: 20, stanchezza: 15 }, riskAdd: -5 },
                refuse: { label: '🧊 Resta calmo e nega', effects: { stress: 10 }, riskAdd: 15, rispetto: 10 },
            },
        },
        {
            id: 'faida',
            title: 'La Faida',
            body: 'Un clan rivale ti attacca. Devi spendere €2.000 o rischiare la vita.',
            minRank: 2,
            choices: {
                accept: { label: '💰 Paga €2.000', effects: { money: -2000 } },
                refuse: { label: '💪 Resisti', effects: { salute: -30, stress: 25 }, rispetto: 20 },
            },
        },
        {
            id: 'pentito',
            title: 'Il Pentito',
            body: 'Un ex socio parla con i magistrati. Il tuo nome è nelle carte.',
            minRank: 1,
            choices: {
                accept: { label: '🤐 Minaccia il pentito', effects: { stress: 15 }, riskAdd: 20, rispetto: 15 },
                refuse: { label: '🙏 Spera che non parli di te', effects: { stress: 25 }, riskAdd: 10, rispetto: -5 },
            },
        },
        {
            id: 'omicidio',
            title: 'L\'Omicidio Eccellente',
            body: 'Ti chiedono di eliminare un politico onesto che indaga sulla tua zona. Se rifiuti, sei fuori dal giro.',
            minRank: 3,
            choices: {
                accept: { label: '☠️ Accetta l\'ordine', effects: { stress: 30, morale: -30 }, riskAdd: 30, rispetto: 30, coherenceHit: -50 },
                refuse: { label: '🚫 Rifiuta (sei fuori)', effects: { stress: 20 }, exitMafia: true },
            },
        },
        {
            id: 'pizzo_ribellione',
            title: 'Ribellione al Pizzo',
            body: 'Un commerciante si rifiuta di pagare il pizzo e minaccia di denunciare.',
            minRank: 3,
            choices: {
                accept: { label: '👊 Mandagli un messaggio', effects: { stress: 10 }, riskAdd: 8, rispetto: 10, money: 500 },
                refuse: { label: '🤷 Lascia perdere', effects: {}, rispetto: -15, pizzoLoss: 200 },
            },
        },
        {
            id: 'giudice_corrotto',
            title: 'Il Giudice Amico',
            body: 'Un giudice in difficoltà finanziarie è disposto a chiudere un occhio. Costa €3.000.',
            minRank: 2,
            choices: {
                accept: { label: '💰 Corrompi il giudice', effects: { money: -3000 }, riskAdd: -20, rispetto: 10 },
                refuse: { label: '🙅 Troppo rischioso', effects: { stress: 5 } },
            },
        },
    ],

    init() {
        Game.on('mafia-daily', (d) => this.onDaily(d));
        Game.on('time-advance', (d) => this.onTimeAdvance(d));

        // Bridge to Politics advanced stats
        Game.on('mafia-daily', () => this._syncPoliticsStats());
    },

    /** Sync mafia state into Politics advanced criminal stats */
    _syncPoliticsStats() {
        if (typeof Politics === 'undefined' || !Politics.applyOutcome) return;
        const m = Game.state.mafia;
        if (!m.active) return;

        // Derive deltas from current mafia state
        const targetMafiaRep = Math.min(1, m.rispettoCriminale / 100);
        const targetSuspicion = Math.min(1, m.rischioIndagini / 100);
        const adv = Politics.getAdvancedStats();

        // Smooth convergence (don't slam values, converge 10% per day)
        const mafiaRepDelta = (targetMafiaRep - adv.criminal.mafiaReputation) * 0.1;
        const suspDelta = (targetSuspicion - adv.criminal.policeSuspicion) * 0.1;

        if (Math.abs(mafiaRepDelta) > 0.001 || Math.abs(suspDelta) > 0.001) {
            Politics.applyOutcome({
                mafiaRep: mafiaRepDelta,
                policeSuspicion: suspDelta,
            });
        }
    },

    /** Get effective investigation risk, scaled by national law */
    _getEffectiveRiskGrowth(baseRisk) {
        let repression = 0.5;
        if (typeof Nations !== 'undefined' && Nations.getCurrentNation) {
            const nation = Nations.getCurrentNation();
            if (nation && nation.lawModifiers) {
                repression = nation.lawModifiers.mafiaRepression || 0.5;
            }
        }
        // Higher repression = faster risk growth
        return baseRisk * (0.5 + repression);
    },

    // === DAILY PROCESSING ===
    onDaily(data) {
        const m = Game.state.mafia;
        const day = Game.state.day;

        // Livello 1: Il Primo Contatto (giorno 5-7)
        if (!m.firstContactShown && day >= 5 && day <= 10 && Math.random() < 0.4) {
            this.triggerFirstContact();
            return;
        }

        // Se segnalato alla polizia: Totò lo sa (evento punitivo 1 volta)
        if (m.segnalatoPolizia && !m._poliziaRevengeShown && day >= m.firstContactDay + 3) {
            m._poliziaRevengeShown = true;
            this.showMafiaChoice({
                title: '🔪 Totò Ti Ha Trovato',
                body: 'Hai segnalato alla polizia? Totò lo ha scoperto. "Speravo fossi più furbo." Trovi la macchina rigata e un biglietto: "La prossima volta non sarà la macchina."',
                from: 'Anonimo',
                choices: {
                    accept: { label: '😰 Subisci in silenzio', effects: { stress: 25, morale: -15 } },
                    refuse: { label: '🚔 Denuncia anche questo', effects: { stress: 15, reputazione: 5 }, riskAdd: -5 },
                },
            });
            return;
        }

        // Se non attivo nel giro, stop
        if (!m.active) return;

        // Uscita alternativa: collaborazione con le autorita se sei ancora credibile.
        if (!m._collabProposalShown && m.rank >= 1 && m.rischioIndagini >= 40 && Game.state.coherence >= 70 && Game.state.reputazione >= 55) {
            m._collabProposalShown = true;
            this.triggerPoliceCollaboration();
            return;
        }

        // Rank daily effects
        const rankInfo = this.RANKS[m.rank] || this.RANKS[0];
        if (rankInfo.dailyMoney) Game.changeMoney(rankInfo.dailyMoney);
        if (rankInfo.dailyStress) Game.changeStat('stress', rankInfo.dailyStress);

        // Pizzo settimanale (rank 3+)
        if (m.rank >= 3 && m.pizzoWeekly > 0 && day % 7 === 0) {
            Game.changeMoney(m.pizzoWeekly);
            Game.addWorkNotif('💰 Pizzo', `Hai riscosso €${m.pizzoWeekly} di pizzo questa settimana.`, `Giorno ${day}`);
        }

        // Rischio indagini cresce — scalato da leggi nazionali
        if (m.rank >= 1) {
            const baseGrowth = rankInfo.riskBase ? rankInfo.riskBase * 0.1 : 0;
            const effectiveGrowth = this._getEffectiveRiskGrowth(baseGrowth);
            m.rischioIndagini = Math.min(100, m.rischioIndagini + effectiveGrowth);
        }

        // Conseguenze giornaliere reali del rischio indagini
        if (m.rischioIndagini >= 70 && Math.random() < 0.35) {
            Game.addUrgentMessage('Procura', 'Ti stanno monitorando: dossier aperto sulle tue attivita.', 'enemy');
            Game.changeReputazione(-4);
            Game.changeStat('stress', 6);
        }
        if (m.rischioIndagini >= 90 && Math.random() < 0.18) {
            Game.changeMoney(-400);
            Game.addWorkNotif('⚖️ Spese legali', 'Indagine calda: hai pagato consulenze e avvocati (-€400).', `Giorno ${day}`);
        }
        if (m.rischioIndagini >= 98 && Math.random() < 0.3) {
            Game.triggerGameOver('🚔 Arresto per associazione mafiosa: il rischio indagini e arrivato al punto di non ritorno.');
            return;
        }

        // Socio: contatore giorni
        if (m.path === 'socio') {
            m.daysAsSocio++;
        }

        // Livello 2: Favori ogni 3-4 giorni
        if (m.rank >= 1 && m.rank < 4 && !m.pendingFavor && (day - m.lastFavorDay) >= 3 + Math.floor(Math.random() * 2)) {
            this.proposeFavor();
        }

        // Livello 3: La Scelta di Campo (dopo 10+ favori)
        if (m.favorsCompleted >= 10 && !m.pathChoiceShown) {
            this.triggerPathChoice();
        }

        // Rank promotion checks
        this.checkRankUp();

        // Random mafia events (rank 1+, ~15% chance per day)
        if (m.rank >= 1 && Math.random() < 0.15) {
            this.triggerMafiaEvent();
        }

        // Delayed events
        this.processDelayedEvents();
    },

    onTimeAdvance(data) {
        // Pending favors reminder (pomeriggio)
        const m = Game.state.mafia;
        if (m.pendingFavor && data.timeOfDay === 1) {
            Phone.showPushNotif('📱 Totò', 'Non dimenticare il favore che ti ho chiesto...');
        }
    },

    // === LIVELLO 1: PRIMO CONTATTO ===
    triggerFirstContact() {
        const m = Game.state.mafia;
        m.firstContactShown = true;
        m.firstContactDay = Game.state.day;

        this.showMafiaChoice3({
            title: '📱 Messaggio Anonimo',
            body: '"Ho visto che sei in gamba. Al bar dietro la stazione, domani alle 18. Chiedi di Totò."',
            from: 'Numero Sconosciuto',
            choices: [
                {
                    label: '✅ Vai all\'incontro',
                    callback: () => {
                        m.active = true;
                        m.rank = 1;
                        m.totoRelation = 40;
                        m.rispettoCriminale = 10;
                        m.rischioIndagini = 5;
                        Game.changeMoney(300);
                        // Add Totò as contact
                        Game.state.contacts.push({
                            name: 'Totò', role: 'Uomo d\'affari', emoji: '🕶️',
                            ideology: Game.state.character.ideology,
                            bio: 'Sorriso largo, stretta di mano ferma. "Posso aiutarti."',
                            relation: 40, loyalty: 60, betrayed: false, favorite: false,
                            canAlly: true, isMafia: true,
                        });
                        Game.addWorkNotif('🕶️ Totò', 'Hai incontrato Totò. +€300. Un nuovo mondo si apre.', `Giorno ${Game.state.day}`);
                        Phone.showPushNotif('🕶️ Totò', 'Benvenuto nel giro. Ti farò sapere.');
                    },
                },
                {
                    label: '❌ Ignora il messaggio',
                    callback: () => {
                        Game.addWorkNotif('📱 Ignorato', 'Hai ignorato il messaggio anonimo. La vita continua.', `Giorno ${Game.state.day}`);
                    },
                },
                {
                    label: '📞 Segnala alla Polizia',
                    callback: () => {
                        m.segnalatoPolizia = true;
                        Game.changeReputazione(10);
                        Game.addWorkNotif('🚔 Segnalazione', 'Hai segnalato il messaggio alla polizia. +10 Reputazione. Ma Totò lo saprà...', `Giorno ${Game.state.day}`);
                    },
                },
            ],
        });
    },

    // === LIVELLO 2: FAVORI ===
    proposeFavor() {
        const m = Game.state.mafia;
        const available = this.FAVORS.filter(f => !m['_favor_' + f.id + '_done']);
        if (available.length === 0) return;

        const favor = available[Math.floor(Math.random() * available.length)];
        m.pendingFavor = favor;
        m.lastFavorDay = Game.state.day;

        this.showMafiaChoice({
            title: `🕶️ Totò — ${favor.title}`,
            body: favor.text,
            from: 'Totò',
            choices: {
                accept: {
                    label: '✅ Fai il favore',
                    effects: {},
                    callback: () => this.acceptFavor(favor),
                },
                refuse: {
                    label: '❌ Rifiuta',
                    effects: {},
                    callback: () => this.refuseFavor(favor),
                },
            },
        });
    },

    acceptFavor(favor) {
        const m = Game.state.mafia;
        m.favorsCompleted++;
        m.pendingFavor = null;
        m['_favor_' + favor.id + '_done'] = true;

        const a = favor.accept;
        if (a.money) Game.changeMoney(a.money);
        if (a.career) Game.state.career.promotionProgress = Math.min(100, Game.state.career.promotionProgress + a.career);
        if (a.coherence) Game.changeStat('coherence', a.coherence);
        if (a.totoRelation) m.totoRelation = Math.min(100, m.totoRelation + a.totoRelation);
        if (a.riskAdd) m.rischioIndagini = Math.min(100, m.rischioIndagini + a.riskAdd);
        if (a.stress) Game.changeStat('stress', a.stress);
        if (a.stanchezza) Game.changeStat('stanchezza', a.stanchezza);
        if (a.rispetto) m.rispettoCriminale = Math.min(100, m.rispettoCriminale + a.rispetto);

        // Discovery check
        if (favor.discoveryChance && Math.random() < favor.discoveryChance) {
            const p = favor.discoveryPenalty;
            if (p.reputazione) Game.changeReputazione(p.reputazione);
            if (p.stress) Game.changeStat('stress', p.stress);
            if (p.coherence) Game.changeStat('coherence', p.coherence);
            if (p.rischioIndagini) m.rischioIndagini = Math.min(100, m.rischioIndagini + p.rischioIndagini);
            if (p.career) Game.state.career.promotionProgress = Math.max(0, Game.state.career.promotionProgress + p.career);
            Game.addUrgentMessage('Giornalista', `Scoperto! ${favor.title} — la stampa ha saputo tutto.`, 'enemy');
        }

        // Delayed event
        if (favor.delayedEvent) {
            if (!m._delayedEvents) m._delayedEvents = [];
            m._delayedEvents.push({
                triggerDay: Game.state.day + favor.delayedEvent.day,
                ...favor.delayedEvent,
            });
        }

        // Rispetto cresce con favori
        m.rispettoCriminale = Math.min(100, m.rispettoCriminale + 5);

        const moneyStr = a.money ? ` +€${a.money}` : '';
        Game.addWorkNotif('🕶️ Favore Completato', `${favor.title}${moneyStr}`, `Giorno ${Game.state.day}`);

        // Update Totò contact relation
        const toto = Game.state.contacts.find(c => c.name === 'Totò');
        if (toto) toto.relation = Math.min(100, toto.relation + 5);
    },

    refuseFavor(favor) {
        const m = Game.state.mafia;
        m.favorsDeclined++;
        m.pendingFavor = null;

        const r = favor.refuse;
        if (r.totoRelation) m.totoRelation = Math.max(0, m.totoRelation + r.totoRelation);
        if (r.rispetto) m.rispettoCriminale = Math.max(0, m.rispettoCriminale + r.rispetto);

        Game.addWorkNotif('🕶️ Favore Rifiutato', `Hai rifiutato: ${favor.title}`, `Giorno ${Game.state.day}`);

        // Update Totò contact relation
        const toto = Game.state.contacts.find(c => c.name === 'Totò');
        if (toto) toto.relation = Math.max(0, toto.relation - 8);

        if (m.favorsDeclined >= 2 && Math.random() < 0.35) {
            Game.changeMoney(-120);
            Game.changeStat('stress', 8);
            Game.addUrgentMessage('Zona Grigia', 'Racket di ritorsione: paghi per i "disguidi" con il clan.', 'enemy');
        }
        if (m.favorsDeclined >= 4 && Math.random() < 0.25) {
            Game.changeStat('salute', -10);
            Game.changeStat('stress', 10);
            Game.addUrgentMessage('Avvertimento', 'Subisci un avvertimento violento dopo troppi rifiuti.', 'enemy');
        }

        // Too many refusals → kicked out
        if (m.favorsDeclined >= 5 && m.totoRelation < 20) {
            m.active = false;
            m.rank = 0;
            Game.addUrgentMessage('Totò', '"Non sei abbastanza affidabile. Sparisci." Sei fuori dal giro.', 'enemy');
        }
    },

    triggerPoliceCollaboration() {
        const m = Game.state.mafia;
        this.showMafiaChoice({
            title: '⚖️ Proposta della DDA',
            body: 'Un magistrato ti offre una via d\'uscita: collabora, consegna prove e abbandona il clan. Rischio ritorsioni, ma recuperi credibilita.',
            from: 'Direzione Distrettuale Antimafia',
            choices: {
                accept: {
                    label: '🧾 Collabora con la giustizia',
                    effects: { stress: 12 },
                    callback: () => {
                        this.leaveMafia('collaborazione');
                        Game.changeReputazione(15);
                        Game.changeStat('coherence', 12);
                        Game.addWorkNotif('🛡️ Collaboratore', 'Hai lasciato il giro mafioso e consegnato prove alla magistratura.', `Giorno ${Game.state.day}`);
                    },
                },
                refuse: {
                    label: '🤐 Resta nel clan',
                    effects: { stress: 6 },
                    callback: () => {
                        m.rischioIndagini = Math.min(100, m.rischioIndagini + 12);
                        Game.addWorkNotif('🔒 Silenzio', 'Hai rifiutato la collaborazione: le indagini si intensificano.', `Giorno ${Game.state.day}`);
                    },
                },
            },
        });
    },

    leaveMafia(reason) {
        const m = Game.state.mafia;
        m.active = false;
        m.rank = 0;
        m.path = null;
        m.pizzoWeekly = 0;
        m.pendingFavor = null;
        m.rispettoCriminale = Math.max(0, m.rispettoCriminale - 25);
        m.rischioIndagini = Math.max(0, m.rischioIndagini - 25);
        if (reason === 'collaborazione') m.segnalatoPolizia = true;
    },

    processDelayedEvents() {
        const m = Game.state.mafia;
        if (!m._delayedEvents) return;
        const day = Game.state.day;
        const triggered = m._delayedEvents.filter(e => day >= e.triggerDay);
        m._delayedEvents = m._delayedEvents.filter(e => day < e.triggerDay);

        triggered.forEach(e => {
            if (e.text) Game.addUrgentMessage('⚠️ Conseguenze', e.text, 'enemy');
            if (e.stress) Game.changeStat('stress', e.stress);
            if (e.reputazione) Game.changeReputazione(e.reputazione);
            if (e.rischioIndagini) {
                m.rischioIndagini = Math.min(100, m.rischioIndagini + e.rischioIndagini);
            }
        });
    },

    // === LIVELLO 3: SCELTA DI CAMPO ===
    triggerPathChoice() {
        const m = Game.state.mafia;
        m.pathChoiceShown = true;

        this.showMafiaChoice({
            title: '🕶️ La Scelta di Campo',
            body: '"Sei dei nostri ormai. Ma ora devi scegliere: vuoi restare un semplice \'amico\' o vuoi diventare un \'socio\'?"',
            from: 'Totò',
            choices: {
                accept: {
                    label: '🤝 "Amico" — Corruzione Passiva',
                    effects: {},
                    callback: () => {
                        m.path = 'amico';
                        Game.addWorkNotif('🤝 Amico della Mafia', 'Continuerai a ricevere soldi e favori. Rischi moderati.', `Giorno ${Game.state.day}`);
                        Phone.showPushNotif('🕶️ Totò', 'Bene. Resterai un amico. Più tranquillo così.');
                    },
                },
                refuse: {
                    label: '💀 "Socio" — Scalata Criminale',
                    effects: {},
                    callback: () => {
                        m.path = 'socio';
                        m.rispettoCriminale += 20;
                        m.rischioIndagini += 15;
                        m.pizzoWeekly = 500;
                        Game.addWorkNotif('💀 Socio di Cosa Nostra', 'Nuovo obiettivo: diventare Capo Mandamento. Il pizzo inizia a entrare.', `Giorno ${Game.state.day}`);
                        Phone.showPushNotif('🕶️ Totò', 'Benvenuto nel vero gioco. D\'ora in poi si fa sul serio.');
                    },
                },
            },
        });
    },

    // === RANK PROMOTION ===
    checkRankUp() {
        const m = Game.state.mafia;
        if (!m.active || m.path !== 'socio') return;

        if (m.rank === 1 && m.favorsCompleted >= 10) {
            m.rank = 2;
            m.pizzoWeekly = 800;
            Game.addUrgentMessage('Totò', '🤝 Sei diventato Uomo d\'Onore. Il giro si allarga.', 'ally');
            Phone.showPushNotif('🏴 Promozione', 'Uomo d\'Onore');
        } else if (m.rank === 2 && m.favorsCompleted >= 30 && m.rispettoCriminale >= 60) {
            // Capodecina: requires eliminating a rival (triggered as special event)
            this.triggerRivalElimination();
        } else if (m.rank === 3 && m.rispettoCriminale >= 90 && m.favorsCompleted >= 50) {
            // Capo Mandamento: corrupt a judge + control territory
            this.triggerCapoMandamento();
        }
    },

    triggerRivalElimination() {
        const m = Game.state.mafia;
        if (m._rivalEventShown) return;
        m._rivalEventShown = true;

        this.showMafiaChoice({
            title: '💀 Eliminare il Rivale',
            body: '"C\'è un capo-zona che ti blocca la strada. O lo fai fuori dal giro, o resti dov\'è."',
            from: 'Totò',
            choices: {
                accept: {
                    label: '☠️ Elimina il rivale',
                    effects: { stress: 25, morale: -20 },
                    callback: () => {
                        m.rank = 3;
                        m.rispettoCriminale = Math.min(100, m.rispettoCriminale + 20);
                        m.rischioIndagini = Math.min(100, m.rischioIndagini + 20);
                        m.pizzoWeekly = 1500;
                        Game.changeStat('coherence', -20);
                        Game.addUrgentMessage('Totò', '💀 Capodecina. Il quartiere ora è tuo.', 'ally');
                    },
                },
                refuse: {
                    label: '🙅 Non posso farlo',
                    effects: { stress: 10 },
                    callback: () => {
                        m.rispettoCriminale = Math.max(0, m.rispettoCriminale - 15);
                        Game.addWorkNotif('🕶️ Totò', 'Totò è deluso. La promozione dovrà aspettare.', `Giorno ${Game.state.day}`);
                        m._rivalEventShown = false; // can try again later
                    },
                },
            },
        });
    },

    triggerCapoMandamento() {
        const m = Game.state.mafia;
        if (m._capoEventShown) return;
        m._capoEventShown = true;

        this.showMafiaChoice({
            title: '👑 Capo Mandamento',
            body: '"Corrompi il giudice De Magistris e il quartiere è tuo per sempre. Costa €5.000."',
            from: 'Totò',
            choices: {
                accept: {
                    label: '💰 Corrompi il giudice (€5.000)',
                    effects: { money: -5000 },
                    callback: () => {
                        if (Game.state.money < 0) {
                            Game.addWorkNotif('❌ Fondi insufficienti', 'Non hai abbastanza soldi.', `Giorno ${Game.state.day}`);
                            m._capoEventShown = false;
                            return;
                        }
                        m.rank = 4;
                        m.pizzoWeekly = 3000;
                        m.rispettoCriminale = 100;
                        Game.state.coherence = 0;
                        Game.addUrgentMessage('Totò', '👑 Capo Mandamento. La città è tua. Nessuno può toccarti.', 'ally');
                        Phone.showPushNotif('👑 CAPO MANDAMENTO', 'Controlli tutto. Ma per quanto?');
                    },
                },
                refuse: {
                    label: '🙅 Troppo rischioso',
                    effects: {},
                    callback: () => {
                        m._capoEventShown = false;
                    },
                },
            },
        });
    },

    // === RANDOM MAFIA EVENTS ===
    triggerMafiaEvent() {
        const m = Game.state.mafia;
        const available = this.MAFIA_EVENTS.filter(e => m.rank >= e.minRank);
        if (available.length === 0) return;

        const event = available[Math.floor(Math.random() * available.length)];

        this.showMafiaChoice({
            title: event.title,
            body: event.body,
            from: 'Zona Grigia',
            choices: {
                accept: {
                    ...event.choices.accept,
                    callback: () => this.applyMafiaEventChoice(event.choices.accept),
                },
                refuse: {
                    ...event.choices.refuse,
                    callback: () => this.applyMafiaEventChoice(event.choices.refuse),
                },
            },
        });
    },

    applyMafiaEventChoice(choice) {
        const m = Game.state.mafia;
        if (choice.effects) {
            if (choice.effects.stress) Game.changeStat('stress', choice.effects.stress);
            if (choice.effects.stanchezza) Game.changeStat('stanchezza', choice.effects.stanchezza);
            if (choice.effects.morale) Game.changeStat('morale', choice.effects.morale);
            if (choice.effects.salute) Game.changeStat('salute', choice.effects.salute);
            if (choice.effects.reputazione) Game.changeReputazione(choice.effects.reputazione);
            if (choice.effects.money) Game.changeMoney(choice.effects.money);
        }
        if (choice.riskAdd) m.rischioIndagini = Math.max(0, Math.min(100, m.rischioIndagini + choice.riskAdd));
        if (choice.rispetto) m.rispettoCriminale = Math.max(0, Math.min(100, m.rispettoCriminale + choice.rispetto));
        if (choice.coherenceHit) Game.changeStat('coherence', choice.coherenceHit);
        if (choice.pizzoLoss) m.pizzoWeekly = Math.max(0, m.pizzoWeekly - choice.pizzoLoss);
        if (choice.exitMafia) {
            m.active = false;
            m.rank = 0;
            m.path = null;
            m.pizzoWeekly = 0;
            Game.addUrgentMessage('Totò', '"Sei fuori. Non farti più vedere." La tua carriera criminale è finita.', 'enemy');
        }
    },

    // === PENTIMENTO (Collaboratore di Giustizia) ===
    canPentirsi() {
        const m = Game.state.mafia;
        return m.active && m.rank >= 2;
    },

    triggerPentimento() {
        const m = Game.state.mafia;
        this.showMafiaChoice({
            title: '⚖️ Collaboratore di Giustizia',
            body: '"Puoi denunciare tutto ai magistrati. Sarai sotto scorta per sempre, ma libero. La tua vecchia vita è finita."',
            from: 'Magistrato Antimafia',
            choices: {
                accept: {
                    label: '🕊️ Pentiti e denuncia tutti',
                    effects: {},
                    callback: () => {
                        Game.triggerVictory('⚖️ IL COLLABORATORE DI GIUSTIZIA — Sei salvo, ma vivi sotto scorta. La tua vecchia vita è finita. Hai scelto la legalità.');
                    },
                },
                refuse: {
                    label: '🤐 Non parlare',
                    effects: { stress: 20 },
                    callback: () => {
                        Game.addWorkNotif('🤐 Silenzio', 'Hai scelto di non collaborare. Il rischio cresce.', `Giorno ${Game.state.day}`);
                        m.rischioIndagini = Math.min(100, m.rischioIndagini + 10);
                    },
                },
            },
        });
    },

    // === UI: MODAL A 2 SCELTE (riusa urgent-choice-overlay) ===
    showMafiaChoice(event) {
        const _triggerEl = document.activeElement;
        let overlay = document.getElementById('urgent-choice-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'urgent-choice-overlay';
            overlay.className = 'urgent-choice-overlay';
            document.body.appendChild(overlay);
        }
        const headingId = `mafia-choice-h-${Date.now()}`;
        overlay.innerHTML = `
            <div class="urgent-choice-modal mafia-modal" role="dialog" aria-modal="true" aria-labelledby="${headingId}">
                <div id="${headingId}" class="urgent-choice-header mafia-header">🔫 ${Game.esc(event.title)}</div>
                <div class="urgent-choice-from">Da: ${Game.esc(event.from)}</div>
                <div class="urgent-choice-body">${Game.esc(event.body)}</div>
                <div class="urgent-choice-buttons">
                    <button class="urgent-btn urgent-btn-accept mafia-btn-accept" data-choice="accept">${event.choices.accept.label}</button>
                    <button class="urgent-btn urgent-btn-refuse mafia-btn-refuse" data-choice="refuse">${event.choices.refuse.label}</button>
                </div>
            </div>
        `;
        overlay.classList.add('visible');

        const modalEl = overlay.querySelector('[role="dialog"]');
        if (window.SR) SR.openModal(modalEl, event.title, event.body);

        overlay.querySelectorAll('.urgent-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const choiceKey = btn.dataset.choice;
                const choice = event.choices[choiceKey];
                // Apply effects
                if (choice.effects) {
                    if (choice.effects.stress) Game.changeStat('stress', choice.effects.stress);
                    if (choice.effects.stanchezza) Game.changeStat('stanchezza', choice.effects.stanchezza);
                    if (choice.effects.morale) Game.changeStat('morale', choice.effects.morale);
                    if (choice.effects.salute) Game.changeStat('salute', choice.effects.salute);
                    if (choice.effects.reputazione) Game.changeReputazione(choice.effects.reputazione);
                    if (choice.effects.money) Game.changeMoney(choice.effects.money);
                }
                // Callback
                if (choice.callback) choice.callback();
                overlay.classList.remove('visible');
                if (window.SR) SR.closeModal(_triggerEl, `Scelta mafia: ${choice.label}.`);
            }, { once: true });
        });
    },

    // === UI: MODAL A 3 SCELTE (primo contatto) ===
    showMafiaChoice3(event) {
        const _triggerEl = document.activeElement;
        let overlay = document.getElementById('urgent-choice-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'urgent-choice-overlay';
            overlay.className = 'urgent-choice-overlay';
            document.body.appendChild(overlay);
        }
        const headingId = `mafia-choice3-h-${Date.now()}`;
        const buttonsHTML = event.choices.map((c, i) =>
            `<button class="urgent-btn mafia-btn-opt" data-idx="${i}">${c.label}</button>`
        ).join('');

        overlay.innerHTML = `
            <div class="urgent-choice-modal mafia-modal" role="dialog" aria-modal="true" aria-labelledby="${headingId}">
                <div id="${headingId}" class="urgent-choice-header mafia-header">🔫 ${Game.esc(event.title)}</div>
                <div class="urgent-choice-from">Da: ${Game.esc(event.from)}</div>
                <div class="urgent-choice-body">${Game.esc(event.body)}</div>
                <div class="urgent-choice-buttons mafia-buttons-3">${buttonsHTML}</div>
            </div>
        `;
        overlay.classList.add('visible');

        const modalEl = overlay.querySelector('[role="dialog"]');
        if (window.SR) SR.openModal(modalEl, event.title, event.body);

        overlay.querySelectorAll('.mafia-btn-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx, 10);
                const chosen = event.choices[idx];
                if (chosen && chosen.callback) chosen.callback();
                overlay.classList.remove('visible');
                if (window.SR) SR.closeModal(_triggerEl, `Scelta mafia: ${(chosen && chosen.label) || 'opzione confermata'}.`);
            }, { once: true });
        });
    },
};
