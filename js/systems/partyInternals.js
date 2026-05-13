/**
 * CORRENTI INTERNE - Sistema Partito e Fazioni
 * ID DLC: dlc_correnti_interne_party
 * Categoria: Expansion
 * 
 * Aggiunge: gestione interna del partito, correnti con leader, tensioni, voti di fiducia interni.
 * Base game: notizie congressuali sporadiche.
 * DLC attivo: fazioni con peso numerico, leader rivali, scalata al segretariato, scissioni.
 */

const PartyInternals = {
    init() {
        this.ensureState();
        if (typeof Game === 'undefined' || !Game.on) return;
        Game.on('new-day', () => this.onNewDay());
    },

    isActive() {
        return Game?.state?.flags?.activeDlc?.includes('dlc_correnti_interne_party');
    },

    ensureState() {
        if (!Game.state.partyInternals) {
            Game.state.partyInternals = {
                // Free tier: tensioni generiche
                internalTension: 0,      // 0-100
                lastCongressDay: -99,
                
                // Paid tier: fazioni strutturate
                factions: [
                    { id: 'centristi', name: 'Corrente Centrista', leader: 'Ursini', members: 45, loyalty: 60 },
                    { id: 'progressisti', name: 'Ala Progressista', leader: 'Rossi', members: 38, loyalty: 55 },
                    { id: 'conservatori', name: 'Ala Conservatrice', leader: 'Bianchi', members: 27, loyalty: 65 }
                ],
                playerFaction: null,      // Quale corrente supporta il player
                playerInfluence: 0,       // Influenza dentro la corrente (0-100)
                secretariatVotesNext: 0,  // Giorni al prossimo voto segretariato
                splitsRisk: 0,           // Rischio scissione (0-100)
            };
        }
        return Game.state.partyInternals;
    },

    // FREE TIER: evento base congresso
    runBaseEvents() {
        const s = this.ensureState();
        const day = Game.state.day || 0;

        // Evento: Notizie generiche di congresso
        if (day % 7 === 0 && day - s.lastCongressDay > 6) {
            const tensions = [
                'Il partito registra tensioni sulla linea economica.',
                'Dibattito interno sulla strategia di coalizione.',
                'Correnti discusse su tema ambientale.'
            ];
            const msg = tensions[Math.floor(Math.random() * tensions.length)];
            Game.addWorkNotif('Partito', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'polite');
            s.internalTension = Math.min(100, s.internalTension + 5);
            s.lastCongressDay = day;
        }

        // Base formula: tensione diminuisce lentamente
        s.internalTension = Math.max(0, s.internalTension - 1);
    },

    // PAID TIER: fazioni, leader rivali, scalata segretariato
    runDlcEvents() {
        if (!this.isActive()) return;
        const s = this.ensureState();
        const day = Game.state.day || 0;
        const playerRep = Game.state.reputazione || 50;

        // Evento: Riunione corrente (ogni 10 giorni)
        if (day % 10 === 0) {
            const faction = s.factions[Math.floor(Math.random() * s.factions.length)];
            const msg = `Riunione della corrente '${faction.name}'. Leader: ${faction.leader}`;
            Game.addWorkNotif('🏛️ Fazione', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'polite');
        }

        // Evento: Offerta di adesione corrente (ogni 15 giorni, se no faction yet)
        if (day % 15 === 0 && !s.playerFaction && playerRep >= 40) {
            const faction = s.factions[Math.floor(Math.random() * s.factions.length)];
            const msg = `La corrente '${faction.name}' ti offre adesione. +20 influenza se accetti.`;
            Game.addWorkNotif('📢 Offerta', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'assertive');
        }

        // Evento: Scalata al segretariato (ogni 30 giorni, se leader e influenza alta)
        if (s.playerFaction && s.playerInfluence >= 70) {
            s.secretariatVotesNext = Math.max(0, s.secretariatVotesNext - 1);
            if (s.secretariatVotesNext === 0 && day % 30 === 0) {
                const msg = 'Prossimo voto per il segretariato tra 7 giorni. Hai supporto della corrente.';
                Game.addWorkNotif('🔴 Elezione', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'assertive');
                s.secretariatVotesNext = 7;
            }
        }

        // Evento: Rischio scissione (se tensione molto alta)
        if (s.internalTension >= 80) {
            s.splitsRisk = Math.min(100, s.splitsRisk + 2);
            if (s.splitsRisk >= 90 && day % 5 === 0) {
                const msg = 'Rischio imminente di scissione nel partito. Il partito è frammentato.';
                Game.addWorkNotif('⚠️ Crisi', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'assertive');
            }
        } else {
            s.splitsRisk = Math.max(0, s.splitsRisk - 1);
        }
    },

    onNewDay() {
        this.ensureState();
        this.runBaseEvents();
        if (this.isActive()) {
            this.runDlcEvents();
        }
    },

    // Funzione pubblica: unisci una corrente
    joinFaction(factionId) {
        const s = this.ensureState();
        const faction = s.factions.find(f => f.id === factionId);
        if (!faction) return false;
        s.playerFaction = factionId;
        s.playerInfluence = 20;
        Game.changeStat('coherence', 3);
        const msg = `Hai aderito alla corrente '${faction.name}'. Leader: ${faction.leader}`;
        Game.addWorkNotif('✅ Adesione', msg, `Giorno ${Game.state.day}`);
        if (window.SR) SR.announce(msg, 'assertive');
        return true;
    },

    // Funzione pubblica: incrementa influenza
    increaseInfluence(points) {
        const s = this.ensureState();
        if (!s.playerFaction) return false;
        s.playerInfluence = Math.min(100, s.playerInfluence + points);
        return true;
    }
};

if (typeof window !== 'undefined') window.PartyInternals = PartyInternals;
