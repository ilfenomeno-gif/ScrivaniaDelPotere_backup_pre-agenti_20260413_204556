/**
 * IL MINISTERO - Sistema Ruolo Governativo
 * ID DLC: dlc_ministero_governo
 * Categoria: Expansion
 * 
 * Aggiunge: gestione di un ministero, portafoglio, stanziamenti, staff, cordate burocratiche.
 * Base game: nomine generiche, bonus flat.
 * DLC attivo: pipeline decisionale ministeriale, lobbyisti, scandali, Corte dei Conti.
 */

const MinistrySystem = {
    init() {
        this.ensureState();
        if (typeof Game === 'undefined' || !Game.on) return;
        Game.on('new-day', () => this.onNewDay());
    },

    isActive() {
        return Game?.state?.flags?.activeDlc?.includes('dlc_ministero_governo');
    },

    ensureState() {
        if (!Game.state.ministry) {
            Game.state.ministry = {
                // Free tier: nominative base
                hasMinistry: false,
                ministryName: null,
                dayAppointed: -99,
                
                // Paid tier: gestione completa
                budget: 0,                    // Budget disponibile in milioni €
                staffSize: 0,                 // Numero staff (100-500)
                decrees: [],                  // Decreti promulgati
                scandals: [],                 // Scandali in sospeso
                auditRisks: 0,               // Rischio ispezione Corte Conti (0-100)
                lobbyistInfluence: {},       // { lobbyistId: influence_points }
                approvalRating: 50,          // Approvazione ministero (0-100)
                lastDecreeDay: -99,
                lastAuditDay: -99
            };
        }
        return Game.state.ministry;
    },

    // FREE TIER: evento nomina generica
    runBaseEvents() {
        const s = this.ensureState();
        const day = Game.state.day || 0;

        if (!s.hasMinistry && Math.random() < 0.02 && day > 20) {
            const ministries = [
                'Interno', 'Economia', 'Ambiente', 'Trasporti', 'Giustizia'
            ];
            const min = ministries[Math.floor(Math.random() * ministries.length)];
            const msg = `Hai ricevuto un'offerta di ministro di ${min}.`;
            Game.addWorkNotif('📋 Nomina', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'assertive');
        }
    },

    // PAID TIER: gestione ministero, budget, scandali, lobbyisti
    runDlcEvents() {
        if (!this.isActive() || !Game.state.ministry.hasMinistry) return;
        const s = Game.state.ministry;
        const day = Game.state.day || 0;

        // Evento: Richiesta di stanziamento da ufficio (ogni 5 giorni)
        if (day % 5 === 0) {
            const amount = 50 + Math.floor(Math.random() * 150);
            const msg = `Richiesta di stanziamento: €${amount}M per progetto. Budget disponibile: €${s.budget}M.`;
            Game.addWorkNotif('💰 Bilancio', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'polite');
        }

        // Evento: Lobbyisti che premono (ogni 7 giorni)
        if (day % 7 === 0 && Math.random() < 0.5) {
            const lobbyists = ['Confindustria', 'Sindacati', 'Associazioni Imprenditoriali'];
            const lobby = lobbyists[Math.floor(Math.random() * lobbyists.length)];
            const msg = `${lobby} chiede udienza al ministero. Influenza lobbyista aumentata.`;
            Game.addWorkNotif('🤝 Lobby', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'polite');
            s.lobbyistInfluence[lobby] = (s.lobbyistInfluence[lobby] || 0) + 5;
        }

        // Evento: Scandalo di spesa pubblica (rare, se audit risk alto)
        if (s.auditRisks >= 70 && Math.random() < 0.03 && day % 10 === 0) {
            const msg = 'Scandalo: fondi pubblici destinati a gare d\'appalto irregolari. Stampa vs ministero.';
            Game.addWorkNotif('🔴 Scandalo', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'assertive');
            s.scandals.push({ date: day, title: 'Appalti irregolari' });
            Game.changeStat('stress', 5);
            s.approvalRating = Math.max(0, s.approvalRating - 15);
        }

        // Evento: Ispezione Corte dei Conti (se audit risk >= 80)
        if (s.auditRisks >= 80 && day - s.lastAuditDay > 30) {
            const msg = 'Corte dei Conti avvia ispezione sulla gestione del ministero.';
            Game.addWorkNotif('⚖️ Audit', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'assertive');
            s.auditRisks = Math.max(0, s.auditRisks - 40);
            s.lastAuditDay = day;
            Game.changeStat('stress', 8);
        }

        // Degradazione approvazione se troppi scandali
        if (s.scandals.length > 3) {
            s.approvalRating = Math.max(0, s.approvalRating - 2);
        }

        // Rischio audit aumenta lentamente
        s.auditRisks = Math.min(100, s.auditRisks + 0.5);
    },

    onNewDay() {
        this.ensureState();
        this.runBaseEvents();
        if (this.isActive()) {
            this.runDlcEvents();
        }
    },

    // Funzione pubblica: accetta nomina a ministro
    acceptMinistry(ministryName, initialBudget) {
        const s = this.ensureState();
        s.hasMinistry = true;
        s.ministryName = ministryName;
        s.budget = initialBudget || 200;
        s.staffSize = 150;
        s.dayAppointed = Game.state.day;
        Game.changeStat('coherence', 5);
        Game.changeStat('stress', 3);
        const msg = `Sei diventato Ministro di ${ministryName}. Budget iniziale: €${s.budget}M.`;
        Game.addWorkNotif('✅ Nomina', msg, `Giorno ${Game.state.day}`);
        if (window.SR) SR.announce(msg, 'assertive');
        return true;
    },

    // Funzione pubblica: emetti un decreto
    issueDecree(title, cost) {
        const s = this.ensureState();
        if (s.budget < cost) return false;
        s.budget -= cost;
        s.decrees.push({ date: Game.state.day, title, cost });
        s.auditRisks = Math.min(100, s.auditRisks + 5);
        s.lastDecreeDay = Game.state.day;
        const msg = `Decreto emesso: '${title}'. Costo: €${cost}M. Budget rimanente: €${s.budget}M.`;
        Game.addWorkNotif('📜 Decreto', msg, `Giorno ${Game.state.day}`);
        if (window.SR) SR.announce(msg, 'polite');
        return true;
    }
};

if (typeof window !== 'undefined') window.MinistrySystem = MinistrySystem;
