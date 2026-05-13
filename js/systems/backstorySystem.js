/**
 * SANGUE E MEMORIA - Storia Personale del Personaggio
 * ID DLC: dlc_sangue_memoria_backstory
 * Categoria: Flavor
 * 
 * Aggiunge: backstory procedurale, famiglia d'origine, vecchie amicizie/nemicizie.
 * Base game: riferimenti narrativi vaghi.
 * DLC attivo: NPCs del passato, riconciliazioni, vendette, bonus/malus coerenza.
 */

const BackstorySystem = {
    init() {
        this.ensureState();
        if (typeof Game === 'undefined' || !Game.on) return;
        Game.on('new-day', () => this.onNewDay());
    },

    isActive() {
        return Game?.state?.flags?.activeDlc?.includes('dlc_sangue_memoria_backstory');
    },

    ensureState() {
        if (!Game.state.backstory) {
            Game.state.backstory = {
                // Free tier: info base
                familyOrigin: null,        // 'working', 'bourgeois', 'aristocratic', 'rural'
                childhoodRegion: null,     // Regione infanzia
                
                // Paid tier: NPCs persistenti, relazioni
                ghosts: [
                    // NPCs del passato che possono riemergere
                    { id: 'university_friend', name: 'Vecchio amico universitario', lastMet: -99, relation: 0, events: 0 },
                    { id: 'ex_partner', name: 'Ex compagno/a romantico/a', lastMet: -99, relation: 0, events: 0 },
                    { id: 'family_rival', name: 'Parente di famiglia rivale', lastMet: -99, relation: -20, events: 0 },
                    { id: 'old_mentor', name: 'Vecchio maestro/insegnante', lastMet: -99, relation: 40, events: 0 }
                ],
                identityBonus: {},         // { traitId: coherenceBonus }
                emotionalMemories: [],     // Memorizzazioni di eventi significativi
                skeletons: 0,             // Scheletri nell'armadio (0-100) — rischio ricatto
            };
        }
        return Game.state.backstory;
    },

    // FREE TIER: accenni narrativi del passato
    runBaseEvents() {
        const s = this.ensureState();
        const day = Game.state.day || 0;

        if (day % 20 === 0) {
            const memories = [
                'Pensi a un momento della tua infanzia che ha segnato il tuo percorso.',
                'Una canzone alla radio ti ricorda il tuo passato.',
                'Ricordo di un vecchio amico che non vedi da anni.'
            ];
            const mem = memories[Math.floor(Math.random() * memories.length)];
            if (window.SR) SR.announce(mem, 'polite');
        }
    },

    // PAID TIER: riemergenza NPCs, riconciliazioni, vendette, scheletri nell'armadio
    runDlcEvents() {
        if (!this.isActive()) return;
        const s = Game.state.backstory;
        const day = Game.state.day || 0;

        // Evento: Riemergenza di un fantasma dal passato (ogni 12 giorni)
        if (day % 12 === 0 && Math.random() < 0.5) {
            const ghost = s.ghosts[Math.floor(Math.random() * s.ghosts.length)];
            const msg = `${ghost.name} riemerge dal tuo passato. Relazione: ${ghost.relation > 0 ? '+' : ''}${ghost.relation}.`;
            Game.addWorkNotif('👻 Memoria', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'polite');
            ghost.lastMet = day;
            ghost.events++;
        }

        // Evento: Riconciliazione (se ghost.relation < 0 e incontri spesso)
        if (day % 15 === 0) {
            const negGhost = s.ghosts.find(g => g.events > 2 && g.relation < 0);
            if (negGhost && Math.random() < 0.4) {
                const msg = `Riconciliazione possibile con ${negGhost.name}. Coerenza +5.`;
                Game.addWorkNotif('🤝 Pace', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'assertive');
                negGhost.relation = Math.min(0, negGhost.relation + 30);
                Game.changeStat('coherence', 5);
            }
        }

        // Evento: Scandalo da scheletro nell'armadio (se skeletons alto)
        if (s.skeletons >= 70 && Math.random() < 0.04 && day % 10 === 0) {
            const msg = 'Stampa scopre un segreto scomodo del tuo passato. Reputazione -10.';
            Game.addWorkNotif('🔴 Scandalo', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'assertive');
            Game.changeReputazione(-10, 'nazionale');
            s.skeletons = Math.max(0, s.skeletons - 30);  // Esposto il segreto
            Game.changeStat('stress', 8);
        }

        // Evento: Vendetta da nemico del passato (se family_rival.relation < -30)
        if (s.ghosts[2].relation < -30 && Math.random() < 0.02 && day % 20 === 0) {
            const msg = `${s.ghosts[2].name} intralcia una tua iniziativa politica. Relazione -15.`;
            Game.addWorkNotif('⚔️ Vendetta', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'assertive');
            s.ghosts[2].relation -= 15;
            Game.changeReputazione(-5, 'nazionale');
        }

        // Bonus coerenza da identità positiva (se ghost positivo agisce da mentore)
        const mentor = s.ghosts[3];
        if (mentor.lastMet > day - 30 && mentor.relation > 30) {
            Game.changeStat('coherence', 1);  // Bonus giornaliero
        }
    },

    onNewDay() {
        this.ensureState();
        this.runBaseEvents();
        if (this.isActive()) {
            this.runDlcEvents();
        }
    },

    // Funzione pubblica: inizializza backstory
    initBackstory(familyOrigin, region) {
        const s = this.ensureState();
        s.familyOrigin = familyOrigin;
        s.childhoodRegion = region;
        Game.changeStat('coherence', 5);  // Senso di identità
        const msg = `Backstory inizializzato: Origini ${familyOrigin}, Infanzia in ${region}.`;
        if (window.SR) SR.announce(msg, 'polite');
        return true;
    },

    // Funzione pubblica: aggiungi scheletro nell'armadio
    addSkeleton(amount) {
        const s = this.ensureState();
        s.skeletons = Math.min(100, s.skeletons + amount);
        return true;
    }
};

if (typeof window !== 'undefined') window.BackstorySystem = BackstorySystem;
