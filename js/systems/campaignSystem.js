/**
 * CAMPAGNA ELETTORALE - Cicli Elettorali
 * ID DLC: dlc_campagna_elettorale
 * Categoria: Immersion
 * 
 * Aggiunge: cicli elettorali con fasi, rallies, sondaggi, dibattiti TV, momentum.
 * Base game: elezioni casuali ogni N giorni.
 * DLC attivo: gestione campagna, fase momentum, sondaggi settimanali, effetto visual HUD.
 */

const CampaignSystem = {
    init() {
        this.ensureState();
        if (typeof Game === 'undefined' || !Game.on) return;
        Game.on('new-day', () => this.onNewDay());
    },

    isActive() {
        return Game?.state?.flags?.activeDlc?.includes('dlc_campagna_elettorale');
    },

    ensureState() {
        if (!Game.state.campaign) {
            Game.state.campaign = {
                // Free tier: elezioni trigger base
                nextElectionDay: 365,
                
                // Paid tier: gestione campagna
                campaignActive: false,
                campaignStartDay: -99,
                campaignPhase: null,        // 'preparation', 'momentum', 'closing'
                campaignDaysLeft: 0,
                
                // Polling & momentum
                polls: [],                   // Array di { day, percentage }
                momentum: 0,                 // -100 to +100: effetto su voti finali
                ralliesHeld: 0,
                tvDebates: 0,
                
                // Sfidanti
                opponents: [
                    { id: 'leftist', name: 'Candidato Sinistra', polls: 25, mood: 'neutral' },
                    { id: 'rightwing', name: 'Candidato Destra', polls: 35, mood: 'neutral' }
                ],
                
                // Effetto coerenza
                campaignCoherence: 50       // Quanta coerenza mantieni in campagna
            };
        }
        return Game.state.campaign;
    },

    // FREE TIER: elezioni base ogni N giorni
    runBaseEvents() {
        const s = this.ensureState();
        const day = Game.state.day || 0;

        if (day >= s.nextElectionDay && !s.campaignActive && day > 50) {
            const msg = `Elezioni tra 30 giorni! Avvia una campagna per migliorare le tue chance.`;
            Game.addWorkNotif('🗳️ Elezioni', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'assertive');
            s.campaignActive = true;
            s.campaignStartDay = day;
            s.campaignPhase = 'preparation';
            s.campaignDaysLeft = 30;
        }
    },

    // PAID TIER: campagna attiva con fasi, sondaggi, rallies, dibattiti
    runDlcEvents() {
        if (!this.isActive() || !Game.state.campaign.campaignActive) return;
        const s = Game.state.campaign;
        const day = Game.state.day || 0;

        s.campaignDaysLeft = Math.max(0, s.nextElectionDay - day);

        // FASE 1: Preparazione (giorni 30-20 prima elezione)
        if (s.campaignDaysLeft > 20 && s.campaignPhase === 'preparation') {
            if (day % 5 === 0) {
                const msg = `Fase PREPARAZIONE campagna. Giorni rimanenti: ${s.campaignDaysLeft}.`;
                Game.addWorkNotif('📋 Campagna', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'polite');
            }
        }

        // FASE 2: Momentum (giorni 20-10 prima elezione)
        if (s.campaignDaysLeft <= 20 && s.campaignDaysLeft > 10) {
            s.campaignPhase = 'momentum';
            if (day % 7 === 0) {
                const msg = `Fase MOMENTUM campagna. Rallies e dibattiti ora impattano di più. +${10 + Math.floor(Math.random() * 20)} momentum.`;
                Game.addWorkNotif('🚀 Momentum', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'assertive');
                s.momentum = Math.min(100, s.momentum + 15);
            }
        }

        // FASE 3: Chiusura (ultimi 10 giorni)
        if (s.campaignDaysLeft <= 10) {
            s.campaignPhase = 'closing';
            const msg = `ULTIMI ${s.campaignDaysLeft} GIORNI DI CAMPAGNA! Ogni azione conta.`;
            if (day === s.nextElectionDay - 10) {
                Game.addWorkNotif('⏰ Finale', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'assertive');
            }
        }

        // Evento: Sondaggio settimanale
        if (day % 7 === 0 && s.campaignActive) {
            const baseVotes = 30 + Math.floor(Math.random() * 20);
            const adjustedVotes = baseVotes + Math.floor((s.momentum / 100) * 15);  // Momentum impatta
            s.polls.push({ day, percentage: Math.min(100, adjustedVotes) });
            const msg = `Sondaggio: ${adjustedVotes}% dei voti per te. Momentum: ${s.momentum > 0 ? '+' : ''}${s.momentum}.`;
            Game.addWorkNotif('📊 Sondaggio', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'polite');
        }

        // Evento: Rally (effetto momentum)
        if (day % 8 === 0 && Math.random() < 0.6 && s.campaignActive) {
            const msg = 'Comizio organizzato con successo! +5 momentum, +2 coerenza.';
            Game.addWorkNotif('🎤 Rally', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'polite');
            s.momentum = Math.min(100, s.momentum + 5);
            s.ralliesHeld++;
            Game.changeStat('coherence', 2);
        }

        // Evento: Dibattito TV (effet momentum x2)
        if (day % 14 === 0 && Math.random() < 0.4 && s.campaignActive) {
            const result = Math.random() > 0.5 ? 'bene' : 'male';
            const impact = result === 'bene' ? 10 : -5;
            const msg = `Dibattito TV contro sfidanti. Sei andato ${result}! ${impact > 0 ? '+' : ''}${impact} momentum.`;
            Game.addWorkNotif('📺 Dibattito', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'assertive');
            s.momentum = Math.min(100, Math.max(-100, s.momentum + impact));
            s.tvDebates++;
        }

        // Momentum diminuisce lentamente senza attività
        s.momentum = Math.max(0, s.momentum - 0.5);
    },

    onNewDay() {
        this.ensureState();
        this.runBaseEvents();
        if (this.isActive()) {
            this.runDlcEvents();
        }
    },

    // Funzione pubblica: organizza rally
    holdRally() {
        const s = this.ensureState();
        if (!s.campaignActive) return false;
        s.ralliesHeld++;
        s.momentum = Math.min(100, s.momentum + 5);
        Game.changeStat('stress', 2);
        const msg = `Rally organizzato! Momentum: +5.`;
        Game.addWorkNotif('🎤 Rally', msg, `Giorno ${Game.state.day}`);
        if (window.SR) SR.announce(msg, 'polite');
        return true;
    },

    // Funzione pubblica: partecipa a dibattito
    debateOpponents(performanceLevel) {  // 'excellent', 'good', 'average', 'poor'
        const s = this.ensureState();
        if (!s.campaignActive) return false;
        const impacts = { excellent: 15, good: 10, average: 0, poor: -10 };
        const impact = impacts[performanceLevel] || 0;
        s.momentum = Math.min(100, Math.max(-100, s.momentum + impact));
        s.tvDebates++;
        Game.changeStat('stress', 3);
        const msg = `Dibattito TV: Prestazione ${performanceLevel}. Momentum: ${impact > 0 ? '+' : ''}${impact}.`;
        Game.addWorkNotif('📺 Dibattito', msg, `Giorno ${Game.state.day}`);
        if (window.SR) SR.announce(msg, 'assertive');
        return true;
    }
};

if (typeof window !== 'undefined') window.CampaignSystem = CampaignSystem;
