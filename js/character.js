/* ============================================
   CHARACTER — Character Creation (v3)
   "Colloquio con il Partito" — Immersive Anagrafe
   ============================================ */

const Character = {
    MENTORS_BY_IDEOLOGY: {
        'estrema-sinistra': [
            { id: 'marta1', archetype: 'marta', name: 'Marta Rossi', shortName: 'compagna Marta', icon: '🚩', ideology: 'sinistra radicale', quote: 'Porta la voce reale dentro le istituzioni.', bonusText: '+15 Coerenza, rete operaia, Assemblea Centro Sociale', effects: { coherence: 15, action: 'assemblea' } },
            { id: 'marta2', archetype: 'marta', name: 'Luca Verdi', shortName: 'compagno Luca', icon: '🚩', ideology: 'sinistra radicale', quote: 'Lotta e resistenza, ogni giorno.', bonusText: '+10 Muscoli, +5 Autenticità, azione Presidio', effects: { muscoli: 10, autenticita: 5, action: 'presidio' } },
            { id: 'marta3', archetype: 'marta', name: 'Sofia Neri', shortName: 'compagna Sofia', icon: '🚩', ideology: 'sinistra radicale', quote: 'Il sindacato è la nostra arma.', bonusText: '+20 relazione con sindacati, +€50 su task politici', effects: { sindacati: true, moneyPerTask: 50 } },
            { id: 'marta4', archetype: 'marta', name: 'Antonio Bianchi', shortName: 'compagno Antonio', icon: '🚩', ideology: 'sinistra radicale', quote: 'Ambiente e lavoro, stessa battaglia.', bonusText: '+5 Intelligenza, sblocca Comitato Ecologico', effects: { intelligenza: 5, action: 'ecologico' } },
            { id: 'marta5', archetype: 'marta', name: 'Elena Gialli', shortName: 'compagna Elena', icon: '🚩', ideology: 'sinistra radicale', quote: 'La piazza è la nostra voce.', bonusText: '+10 Carisma, +3 reputazione per comizio', effects: { carisma: 10, repPerComizio: 3 } },
            { id: 'marta6', archetype: 'marta', name: 'Paolo Blu', shortName: 'compagno Paolo', icon: '🚩', ideology: 'sinistra radicale', quote: 'Formazione e coscienza di classe.', bonusText: '+15 Coerenza, sblocca Scuola Politica', effects: { coherence: 15, action: 'scuola' } },
        ],
        'centro': [
            { id: 'roberto1', archetype: 'roberto', name: 'Roberto Marchetti', shortName: 'compagno Roberto', icon: '⚖️', ideology: 'centro liberale', quote: 'Il compromesso è l\'arte della politica.', bonusText: '+20 Networking, +€100, Aperitivo con Lobbisti', effects: { networking: 20, money: 100, action: 'aperitivo' } },
            { id: 'roberto2', archetype: 'roberto', name: 'Giulia Serra', shortName: 'compagna Giulia', icon: '⚖️', ideology: 'centro liberale', quote: 'La mediazione evita guerre inutili.', bonusText: '+8 Carisma, -5 Stress da coalizione', effects: { carisma: 8, stressMitigation: 5 } },
            { id: 'roberto3', archetype: 'roberto', name: 'Carlo Vitali', shortName: 'compagno Carlo', icon: '⚖️', ideology: 'centro liberale', quote: 'Parla con tutti, prometti a pochi.', bonusText: '+12 Relazioni trasversali, +2 rep nazionale', effects: { relationAll: 12, repNazionale: 2 } },
            { id: 'roberto4', archetype: 'roberto', name: 'Miriam Lodi', shortName: 'compagna Miriam', icon: '⚖️', ideology: 'centro liberale', quote: 'Bilanci in ordine, nervi saldi.', bonusText: '+€80, -10 rischio bollette', effects: { money: 80, debtRelief: 10 } },
            { id: 'roberto5', archetype: 'roberto', name: 'Dario Fontana', shortName: 'compagno Dario', icon: '⚖️', ideology: 'centro liberale', quote: 'I ponti valgono più dei muri.', bonusText: '+10 Networking, sblocca Tavolo Strategico', effects: { networking: 10, action: 'tavolo' } },
            { id: 'roberto6', archetype: 'roberto', name: 'Silvia Nobile', shortName: 'compagna Silvia', icon: '⚖️', ideology: 'centro liberale', quote: 'Vinci quando nessuno si sente sconfitto.', bonusText: '+6 Intelligenza, +6 Carisma', effects: { intelligenza: 6, carisma: 6 } },
        ],
        'populista': [
            { id: 'beppe1', archetype: 'beppe', name: 'Beppe Rinaldi', shortName: 'compagno Beppe', icon: '📢', ideology: 'populista', quote: 'Serve sangue nuovo per sfondare il palazzo.', bonusText: '+500 Followers, Affondo Populista, boost gazebo/volantinaggio', effects: { followers: 500, action: 'affondo' } },
            { id: 'beppe2', archetype: 'beppe', name: 'Nadia Fabbri', shortName: 'compagna Nadia', icon: '📢', ideology: 'populista', quote: 'Parla semplice, colpisci forte.', bonusText: '+350 Followers, +8 Carisma', effects: { followers: 350, carisma: 8 } },
            { id: 'beppe3', archetype: 'beppe', name: 'Rocco Milani', shortName: 'compagno Rocco', icon: '📢', ideology: 'populista', quote: 'Ogni piazza è un referendum.', bonusText: '+10 Muscoli, +5 rep locale', effects: { muscoli: 10, reputazione: 5 } },
            { id: 'beppe4', archetype: 'beppe', name: 'Sara Bruni', shortName: 'compagna Sara', icon: '📢', ideology: 'populista', quote: 'Un video vale più di cento volantini.', bonusText: '+400 Followers, -5 Coerenza iniziale', effects: { followers: 400, coherence: -5 } },
            { id: 'beppe5', archetype: 'beppe', name: 'Mauro Gatti', shortName: 'compagno Mauro', icon: '📢', ideology: 'populista', quote: 'Il sistema teme chi urla la verità.', bonusText: '+€60 da comizi, +6 stress', effects: { moneyPerComizio: 60, stress: 6 } },
            { id: 'beppe6', archetype: 'beppe', name: 'Irene Costa', shortName: 'compagna Irene', icon: '📢', ideology: 'populista', quote: 'Trasforma la rabbia in consenso.', bonusText: '+300 Followers, +10 Autenticità', effects: { followers: 300, autenticita: 10 } },
        ],
        'tecnocrate': [
            { id: 'elena1', archetype: 'elena', name: 'Elena Ferri', shortName: 'compagna Elena', icon: '📊', ideology: 'tecnocrate', quote: 'I numeri guidano, gli slogan distraggono.', bonusText: '+10 Intelligenza, +20% analisi/report, Simulazione Bilancio', effects: { intelligenza: 10, taskTechBoost: 1.2, action: 'bilancio' } },
            { id: 'elena2', archetype: 'elena', name: 'Marco Dati', shortName: 'compagno Marco', icon: '📊', ideology: 'tecnocrate', quote: 'Le decisioni senza dati sono superstizione.', bonusText: '+8 Intelligenza, -8 stress da task tecnici', effects: { intelligenza: 8, stressMitigation: 8 } },
            { id: 'elena3', archetype: 'elena', name: 'Chiara Numeri', shortName: 'compagna Chiara', icon: '📊', ideology: 'tecnocrate', quote: 'Prima misura, poi prometti.', bonusText: '+5 Coerenza, +€70 da report', effects: { coherence: 5, moneyPerReport: 70 } },
            { id: 'elena4', archetype: 'elena', name: 'Riccardo Metriche', shortName: 'compagno Riccardo', icon: '📊', ideology: 'tecnocrate', quote: 'Ogni piano deve reggere ai numeri.', bonusText: '+6 Intelligenza, +3 reputazione nazionale', effects: { intelligenza: 6, repNazionale: 3 } },
            { id: 'elena5', archetype: 'elena', name: 'Paola Conti', shortName: 'compagna Paola', icon: '📊', ideology: 'tecnocrate', quote: 'La competenza convince nel lungo periodo.', bonusText: '+5 Carisma tecnico, sblocca Audit Civico', effects: { carisma: 5, action: 'audit' } },
            { id: 'elena6', archetype: 'elena', name: 'Davide Algoritmo', shortName: 'compagno Davide', icon: '📊', ideology: 'tecnocrate', quote: 'Ottimizzare è governare meglio.', bonusText: '+10 Intelligenza, +€40 al giorno', effects: { intelligenza: 10, dailyMoney: 40 } },
        ],
        'estrema-destra': [
            { id: 'massimo1', archetype: 'massimo', name: 'Massimo Leone', shortName: 'compagno Massimo', icon: '🦅', ideology: 'destra sovranista', quote: 'Ordine e presenza decidono la partita.', bonusText: '+10 Muscoli, rete forze dell\'ordine, Pattuglia di Quartiere', effects: { muscoli: 10, action: 'pattuglia' } },
            { id: 'massimo2', archetype: 'massimo', name: 'Greta Forte', shortName: 'compagna Greta', icon: '🦅', ideology: 'destra sovranista', quote: 'Disciplina prima di tutto.', bonusText: '+8 Muscoli, -5 Stress in crisi', effects: { muscoli: 8, stressMitigation: 5 } },
            { id: 'massimo3', archetype: 'massimo', name: 'Enrico Feroce', shortName: 'compagno Enrico', icon: '🦅', ideology: 'destra sovranista', quote: 'Il territorio si conquista sul campo.', bonusText: '+6 Carisma, +6 reputazione locale', effects: { carisma: 6, reputazione: 6 } },
            { id: 'massimo4', archetype: 'massimo', name: 'Laura Riva', shortName: 'compagna Laura', icon: '🦅', ideology: 'destra sovranista', quote: 'Sicurezza e identità fanno consenso.', bonusText: '+7 Muscoli, +2 rep nazionale', effects: { muscoli: 7, repNazionale: 2 } },
            { id: 'massimo5', archetype: 'massimo', name: 'Tommaso Grani', shortName: 'compagno Tommaso', icon: '🦅', ideology: 'destra sovranista', quote: 'Presidio costante, risultati certi.', bonusText: '+5 Muscoli, +€50 da attività territorio', effects: { muscoli: 5, moneyPerTerritory: 50 } },
            { id: 'massimo6', archetype: 'massimo', name: 'Vera Neri', shortName: 'compagna Vera', icon: '🦅', ideology: 'destra sovranista', quote: 'Comando chiaro, squadra compatta.', bonusText: '+10 Muscoli, +5 Coerenza', effects: { muscoli: 10, coherence: 5 } },
        ],

    },

    MENTOR_AUTONOMO: {
        id: 'anziano',
        archetype: 'anziano',
        name: 'L\'Anziano Filosofo',
        shortName: 'tu',
        icon: '🛤️',
        ideology: 'autonomo',
        quote: 'Pensa con la tua testa, poi scegli la tua strada.',
        bonusText: '+1 PA per 5 giorni, Quaderno, Lettura e Meditazione',
        effects: { extraPA: 5, notebook: true, action: 'meditazione' },
        risk: 'nessuna_protezione',
        riskDesc: 'Non avere un mentore potente significa nessuna difesa nelle crisi. Le penalità di reputazione aumentano del 20%.',
    },

    MENTOR_ARCHETYPES: {
        marta: {
            events: [
                {
                    dayOffset: [2, 4],
                    tag: 'marta_presidio',
                    title: 'Presidio ambientale',
                    body: 'Marta ti chiama a un presidio contro la discarica. La piazza aspetta una tua presa di posizione.',
                    choices: [
                        { id: 'parla', label: 'Partecipa e parla', effects: { reputazione: 8, stanchezza: 10, coherence: 2, relazioneMentore: 6 } },
                        { id: 'silenzio', label: 'Partecipa ma stai in silenzio', effects: { reputazione: 3, coherence: 5, relazioneMentore: 2 } },
                        { id: 'rifiuta', label: 'Rifiuta per impegni di partito', effects: { relazioneMentore: -15, coherence: -5 } },
                    ],
                },
                {
                    dayOffset: [7, 10],
                    tag: 'marta_industriale',
                    title: 'Offerta dell\'industriale',
                    body: 'Un industriale ti offre €500 per calmare il centro sociale. Marta lo ha scoperto.',
                    unlockSpecial: true,
                    choices: [
                        { id: 'accetta', label: 'Accetti e metti tutto a tacere', effects: { money: 500, coherence: -20, relazioneMentore: -30 } },
                        { id: 'denuncia', label: 'Rifiuti e denunci l\'industriale', effects: { reputazione: 15, coherence: 10, relazioneMentore: 20, unlockAllSpecial: true } },
                        { id: 'finanzia', label: 'Usi i soldi per finanziare il centro', effects: { money: -500, relazioneMentore: 25, unlockAction: 'cena_autofinanziamento' } },
                    ],
                },
            ],
            specialActions: [
                { id: 'assemblea_centro', label: '🚩 Assemblea al Centro Sociale', desc: '+5 Morale, +3 Autenticita, -5 Stress', costPA: 1, costMoney: 0, cooldown: 2, effect: { morale: 5, autenticita: 3, stress: -5 } },
                { id: 'cena_autofinanziamento', label: '🍝 Cena di autofinanziamento', desc: '+10 Reputazione, +5 Morale', costPA: 1, costMoney: 50, cooldown: 5, effect: { reputazione: 10, morale: 5 } },
            ],
            passiveEffect: (state, mentorState) => {
                if (state.reputazioneNazionale > 60) mentorState.relationship = Math.max(0, mentorState.relationship - 2);
            },
            riskCondition: (state) => state.reputazioneNazionale > 60,
            riskPenalty: { relazioneMentore: -3, stress: 5 },
        },
        roberto: {
            events: [
                {
                    dayOffset: [2, 4],
                    tag: 'roberto_cena',
                    title: 'Cena con i costruttori',
                    body: 'Roberto ti invita a una cena informale con i lobbisti locali.',
                    choices: [
                        { id: 'accetta', label: 'Accetti', effects: { money: 120, relazioneMentore: 8, stress: 3 } },
                        { id: 'rifiuta', label: 'Rifiuti per etica', effects: { relazioneMentore: -8, coherence: 6 } },
                    ],
                },
                {
                    dayOffset: [7, 10],
                    tag: 'roberto_variante',
                    title: 'Variante urbanistica',
                    body: 'Ti propongono una variante in cambio di favori economici.',
                    unlockSpecial: true,
                    choices: [
                        { id: 'firma', label: 'Firmi la variante', effects: { money: 400, coherence: -12, relazioneMentore: 6, unlockAllSpecial: true } },
                        { id: 'blocca', label: 'Blocchi la pratica', effects: { reputazione: 8, relazioneMentore: -10 } },
                    ],
                },
            ],
            specialActions: [
                { id: 'aperitivo_lobbisti', label: '⚖️ Aperitivo con Lobbisti', desc: '€30: +5 Reputazione, +3 Carisma', costPA: 1, costMoney: 30, cooldown: 3, effect: { reputazione: 5, carisma: 3 } },
                { id: 'tavolo_strategico', label: '🗂️ Tavolo Strategico', desc: '+8 Progressione carriera', costPA: 1, costMoney: 0, cooldown: 4, effect: { careerProgress: 8 } },
            ],
            passiveEffect: (state) => {
                if (state.money < 100) state.money = Math.min(999999, state.money + 20);
            },
            riskCondition: (state) => (state.flags && state.flags.lobbyFavors >= 3),
            riskPenalty: { relazioneMentore: -4, reputazione: -5 },
        },
        beppe: {
            events: [
                {
                    dayOffset: [2, 4],
                    tag: 'beppe_live',
                    title: 'Live incendiaria',
                    body: 'Beppe vuole una diretta d\'attacco contro un avversario.',
                    choices: [
                        { id: 'falla', label: 'Fai la live', effects: { reputazione: 12, stress: 10, coherence: -8, followers: 300, relazioneMentore: 8 } },
                        { id: 'rifiuta', label: 'Rifiuta', effects: { relazioneMentore: -12 } },
                    ],
                },
                {
                    dayOffset: [7, 10],
                    tag: 'beppe_querela',
                    title: 'Querela per diffamazione',
                    body: 'Arriva una querela, devi scegliere la linea difensiva.',
                    unlockSpecial: true,
                    choices: [
                        { id: 'scuse', label: 'Scuse pubbliche', effects: { reputazione: -6, coherence: 8, relazioneMentore: -10 } },
                        { id: 'rilancio', label: 'Rilanci la narrativa', effects: { followers: 450, stress: 12, coherence: -10, unlockAllSpecial: true } },
                    ],
                },
            ],
            specialActions: [
                { id: 'affondo_populista', label: '📢 Affondo Populista', desc: '+10 Reputazione, +8 Stress, -5 Coerenza', costPA: 1, costMoney: 0, cooldown: 2, effect: { reputazione: 10, stress: 8, coherence: -5 } },
                { id: 'tour_piazza', label: '🎤 Tour in Piazza', desc: '+6 Reputazione, +200 followers', costPA: 1, costMoney: 20, cooldown: 4, effect: { reputazione: 6, followers: 200 } },
            ],
            passiveEffect: (state) => {
                if (!state.social) state.social = {};
                state.social.followers = (state.social.followers || 0) + 15;
            },
            riskCondition: (state) => state.coherence < 35,
            riskPenalty: { relazioneMentore: -3, stress: 4 },
        },
        elena: {
            events: [
                {
                    dayOffset: [2, 4],
                    tag: 'elena_ottimizzazione',
                    title: 'Ottimizzazione fiscale',
                    body: 'Elena ti affida un dossier complesso da rifinire entro stasera.',
                    choices: [
                        { id: 'perfetto', label: 'Consegna impeccabile', effects: { intelligenza: 2, reputazione: 6, relazioneMentore: 8 } },
                        { id: 'etico', label: 'Segnali irregolarita', effects: { coherence: 10, relazioneMentore: -8 } },
                    ],
                },
                {
                    dayOffset: [7, 10],
                    tag: 'elena_fondi',
                    title: 'Fondi opachi',
                    body: 'Scopri che parte dei fondi e stata dirottata su una societa privata.',
                    unlockSpecial: true,
                    choices: [
                        { id: 'copri', label: 'Copri Elena', effects: { money: 250, coherence: -12, relazioneMentore: 12, unlockAllSpecial: true } },
                        { id: 'denuncia', label: 'Denunci tutto', effects: { reputazione: 12, coherence: 12, relazioneMentore: -20 } },
                    ],
                },
            ],
            specialActions: [
                { id: 'simulazione_bilancio', label: '📊 Simulazione di Bilancio', desc: '+5 Intelligenza, +3 Reputazione', costPA: 1, costMoney: 0, cooldown: 3, effect: { intelligenza: 5, reputazione: 3 } },
                { id: 'audit_civico', label: '🧾 Audit Civico', desc: '+6 Coerenza, -4 Stress', costPA: 1, costMoney: 0, cooldown: 4, effect: { coherence: 6, stress: -4 } },
            ],
            passiveEffect: (state) => {
                state.stats.stress = Math.max(0, (state.stats.stress || 0) - 1);
            },
            riskCondition: (state) => state.stats.stress > 75,
            riskPenalty: { relazioneMentore: -4, salute: -2 },
        },
        massimo: {
            events: [
                {
                    dayOffset: [2, 4],
                    tag: 'massimo_retata',
                    title: 'Retata simbolica',
                    body: 'Massimo vuole una dimostrazione di forza sul territorio.',
                    choices: [
                        { id: 'vai', label: 'Vai in prima fila', effects: { reputazione: 8, stress: 8, coherence: -8, relazioneMentore: 8 } },
                        { id: 'evita', label: 'Eviti la retata', effects: { relazioneMentore: -12 } },
                    ],
                },
                {
                    dayOffset: [7, 10],
                    tag: 'massimo_giornalista',
                    title: 'Dossier sul giornalista',
                    body: 'Massimo propone una campagna aggressiva contro un giornalista.',
                    unlockSpecial: true,
                    choices: [
                        { id: 'spingi', label: 'Spingi la campagna', effects: { reputazione: 10, coherence: -15, relationContacts: -4, unlockAllSpecial: true } },
                        { id: 'frena', label: 'Frena la campagna', effects: { relazioneMentore: -15, coherence: 8 } },
                    ],
                },
            ],
            specialActions: [
                { id: 'pattuglia_quartiere', label: '🦅 Pattuglia di Quartiere', desc: '+5 Reputazione, +3 Stress', costPA: 1, costMoney: 0, cooldown: 3, effect: { reputazione: 5, stress: 3 } },
                { id: 'presidio_sicurezza', label: '🚨 Presidio Sicurezza', desc: '+8 Reputazione locale, -4 Morale', costPA: 1, costMoney: 20, cooldown: 4, effect: { reputazione: 8, morale: -4 } },
            ],
            passiveEffect: (state) => {
                state.stats.stress = Math.min(100, (state.stats.stress || 0) + 1);
            },
            riskCondition: (state) => state.coherence < 30,
            riskPenalty: { relazioneMentore: -5, reputazione: -4 },
        },
        anziano: {
            events: [
                {
                    dayOffset: [3, 4],
                    tag: 'anziano_dibattito',
                    title: 'Dibattito con studenti',
                    body: 'Un incontro riflessivo con studenti e cittadini ti mette alla prova.',
                    choices: [
                        { id: 'ascolta', label: 'Ascolta prima di parlare', effects: { intelligenza: 2, morale: 4, relazioneMentore: 8 } },
                        { id: 'arringa', label: 'Fai un\'arringa', effects: { carisma: 2, stress: 4, relazioneMentore: 2 } },
                    ],
                },
                {
                    dayOffset: [8, 10],
                    tag: 'anziano_correnti',
                    title: 'Scelta delle correnti',
                    body: 'Tre correnti provano a reclutarti: resti libero o scegli copertura politica?',
                    unlockSpecial: true,
                    choices: [
                        { id: 'autonomo', label: 'Rimani autonomo', effects: { coherence: 10, reputazione: 4, unlockAllSpecial: true } },
                        { id: 'aggancio', label: 'Accetti una copertura leggera', effects: { money: 150, coherence: -5, relazioneMentore: -5 } },
                    ],
                },
            ],
            specialActions: [
                { id: 'lettura_meditazione', label: '🛤️ Lettura e Meditazione', desc: '-10 Stress, +5 Intelligenza, +3 Coerenza', costPA: 1, costMoney: 0, cooldown: 2, effect: { stress: -10, intelligenza: 5, coherence: 3 } },
            ],
            passiveEffect: (state) => {
                state.stats.morale = Math.min(100, (state.stats.morale || 0) + 1);
            },
            riskCondition: () => false,
            riskPenalty: {},
        },
    },

    AVATARS: {
        M: [
            { value: '👨‍🏭' },
            { value: '👨‍🏫' },
            { value: '👨‍⚖️' },
            { value: '🕺' },
            { value: '🕵️‍♂️' },
        ],
        F: [
            { value: '👩‍💼' },
            { value: '👩‍🏫' },
            { value: '👩‍⚖️' },
            { value: '💃' },
            { value: '🕵️‍♀️' },
        ],
        X: [
            { value: '🧑‍💼' },
            { value: '🧑‍🏫' },
            { value: '🧑‍⚖️' },
            { value: '🧑‍🎤' },
            { value: '🕵️' },
        ],
    },

    getMentorById(mentorId) {
        const runtimeMentor = (this._currentMentorPool || []).find(m => m.id === mentorId);
        if (runtimeMentor) return runtimeMentor;
        for (const list of Object.values(this.MENTORS_BY_IDEOLOGY)) {
            const found = (list || []).find(m => m.id === mentorId);
            if (found) return found;
        }
        if (this.MENTOR_AUTONOMO.id === mentorId) return this.MENTOR_AUTONOMO;
        return null;
    },

    getMentorData(mentorId) {
        const selected = this.getMentorById(mentorId) || this.getMentorById((Game.state.flags && Game.state.flags.mentor && Game.state.flags.mentor.selectedId) || '');
        if (!selected) return null;
        const archetype = selected.archetype || selected.id;
        const details = this.MENTOR_ARCHETYPES[archetype] || {};
        return {
            ...selected,
            archetype,
            events: details.events || [],
            specialActions: details.specialActions || [],
            passiveEffect: details.passiveEffect,
            riskCondition: details.riskCondition,
            riskPenalty: details.riskPenalty || {},
        };
    },

    getMentorBonusText(mentorId) {
        const mentor = this.getMentorById(mentorId);
        return mentor && mentor.bonusText ? mentor.bonusText : 'Nessun bonus';
    },

    getAvailableMentors() {
        const ideology = Game.state.character.ideology;
        const ideologyMentors = this.MENTORS_BY_IDEOLOGY[ideology] || [];
        return [...ideologyMentors, this.MENTOR_AUTONOMO];
    },

    getDefaultArchetypeForIdeology(ideology) {
        const map = {
            'estrema-sinistra': 'marta',
            'centro': 'roberto',
            'populista': 'beppe',
            'tecnocrate': 'elena',
            'estrema-destra': 'massimo',
        };
        return map[ideology] || 'anziano';
    },

    buildGenericNationMentors(nation, ideology) {
        const nationName = (nation && nation.name) || 'Nazione';
        const names = ['A', 'B', 'C'];
        const templates = [
            { icon: '🏛️', quote: `Una rete locale in ${nationName} vale quanto una campagna.`, bonusText: '+6 Reputazione, +4 Coerenza', effects: { reputazione: 6, coherence: 4 } },
            { icon: '📊', quote: `In ${nationName}, i numeri decidono le carriere.`, bonusText: '+6 Intelligenza, -4 Stress', effects: { intelligenza: 6, stress: -4 } },
            { icon: '📢', quote: 'Parla il linguaggio del territorio e crescerai.', bonusText: '+6 Carisma, +5 Networking', effects: { carisma: 6, networking: 5 } },
        ];
        return templates.map((t, idx) => ({
            id: `mentor_${(nation && nation.id) || 'generic'}_${ideology}_${idx + 1}`,
            archetype: 'custom',
            name: `Mentore ${nationName} ${names[idx]}`,
            shortName: `Mentore ${names[idx]}`,
            ideology,
            ...t,
        }));
    },

    normalizeNationMentorEntry(entry, ideology, fallbackMentor, index, nation) {
        if (entry && typeof entry === 'object') {
            const safeId = entry.id || `mentor_${(nation && nation.id) || 'generic'}_${ideology}_${index + 1}`;
            return {
                id: safeId,
                archetype: entry.archetype || 'custom',
                name: entry.name || `Mentore ${index + 1}`,
                shortName: entry.shortName || entry.name || `Mentore ${index + 1}`,
                icon: entry.icon || (fallbackMentor && fallbackMentor.icon) || '🎓',
                ideology: entry.ideology || ideology,
                quote: entry.quote || (fallbackMentor && fallbackMentor.quote) || 'Ogni carriera inizia da una scelta netta.',
                bonusText: entry.bonusText || (fallbackMentor && fallbackMentor.bonusText) || 'Bonus locale',
                effects: entry.effects || (fallbackMentor && fallbackMentor.effects) || {},
            };
        }

        const prettyName = String(entry || '')
            .replace(/[_-]+/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
            .trim();

        return {
            ...(fallbackMentor || {}),
            id: (fallbackMentor && fallbackMentor.id) || `mentor_${(nation && nation.id) || 'generic'}_${ideology}_${index + 1}`,
            archetype: (fallbackMentor && fallbackMentor.archetype) || this.getDefaultArchetypeForIdeology(ideology),
            name: prettyName || (fallbackMentor && fallbackMentor.name) || `Mentore ${index + 1}`,
            shortName: (prettyName.split(' ')[0] || (fallbackMentor && fallbackMentor.shortName) || `Mentore ${index + 1}`),
            ideology: (fallbackMentor && fallbackMentor.ideology) || ideology,
            quote: (fallbackMentor && fallbackMentor.quote) || 'Ogni carriera inizia da una scelta netta.',
            bonusText: (fallbackMentor && fallbackMentor.bonusText) || 'Bonus locale',
            effects: (fallbackMentor && fallbackMentor.effects) || {},
        };
    },

    getAvailableMentorsForNation() {
        const mentorsByIdeology = Game.state.mentorsDB;
        if (!mentorsByIdeology) return this.getAvailableMentors();

        const ideology = Game.state.character.ideology;
        const nationMentors = mentorsByIdeology[ideology] || [];
        return [...nationMentors, this.MENTOR_AUTONOMO];
    },

    // A. Ideology → protocol color codes
    IDEOLOGY_CODES: {
        'estrema-sinistra': 'RS',
        'centro': 'CE',
        'populista': 'PO',
        'tecnocrate': 'TC',
        'estrema-destra': 'RD',
    },

    // I. Burocrate phrases
    BUROCRATE_PHRASES: [
        'Allora? Ci siamo addormentati? Il Partito aspetta.',
        'Ehi, compilare i moduli non è facoltativo.',
        'Il segretario ha chiesto di te. Muoviti.',
        'Un altro che ci mette un\'eternità...',
        'Se non ti sbrighi, chiudo l\'ufficio.',
        'Ho visto muri compilare moduli più in fretta.',
    ],

    _idleTimer: null,
    _coffeeTimer: null,
    _idleCount: 0,
    _currentMentorPool: [],

    getNationState(nationId) {
        const fallback = {
            italy: { id: 'italy', name: 'Italia', language: 'italiano' },
            france: { id: 'france', name: 'Francia', language: 'francese' },
            germany: { id: 'germany', name: 'Germania', language: 'tedesco' },
            uk: { id: 'uk', name: 'Regno Unito', language: 'inglese' },
        };
        if (typeof Nations !== 'undefined' && Nations.getNation) {
            return Nations.getNation(nationId) || fallback[nationId] || fallback.italy;
        }
        return fallback[nationId] || fallback.italy;
    },

    init() {
        const nameInput = document.getElementById('char-name');
        const genderBtns = document.querySelectorAll('.stamp-btn[data-group="gender"]');
        const ideologyCards = document.querySelectorAll('.ideology-card');
        const nationBtns = document.querySelectorAll('.stamp-btn[data-group="nation"]');
        const approveBtn = document.getElementById('btn-approve');

        nameInput.addEventListener('input', () => {
            const clean = this.sanitizeName(nameInput.value);
            if (clean !== nameInput.value) nameInput.value = clean;
            this.checkReady();
            this.updatePreview();
            this.resetIdleTimer();
        });

        genderBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                genderBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                Game.state.character.gender = btn.dataset.value;
                this.showAvatarSelection(btn.dataset.value);
                this.checkReady();
                this.updatePreview();
                this.updateProtocol();
                this.resetIdleTimer();
            });
        });

        ideologyCards.forEach(card => {
            card.addEventListener('click', () => {
                ideologyCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                Game.state.character.ideology = card.dataset.value;
                this.checkReady();
                this.updatePreview();
                this.updateProtocol();
                this.resetIdleTimer();
            });
        });

        nationBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                nationBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                Game.state.nation = { ...this.getNationState(btn.dataset.value) };
                this.updateIdeologyDisplay(btn.dataset.value);
                this.checkReady();
                this.updatePreview();
                this.resetIdleTimer();
            });
        });

        approveBtn.addEventListener('click', () => this.approve());

        // I. Start idle timer for "burocrate impaziente"
        this.startIdleTimer();

        // B. Coffee stain after 45 seconds of inactivity
        this._coffeeTimer = Scheduler.timeout(() => this.showCoffeeStain(), 45000, { group: 'character', label: 'coffee' });

        // Set default nation to italy if not already set
        if (!Game.state.nation.id) {
            Game.state.nation = { ...this.getNationState('italy') };
            const defaultNationBtn = document.querySelector('.stamp-btn[data-group="nation"][data-value="italy"]');
            if (defaultNationBtn) defaultNationBtn.classList.add('selected');
        }

        this.updateIdeologyDisplay(Game.state.nation.id);

        Game.on('new-day', ({ day }) => this.handleMentorProgression(day));
    },

    /**
     * Aggiorna i nomi e descrizioni delle ideologie in base alla nazione selezionata
     */
    updateIdeologyDisplay(nationId) {
        if (typeof Nations === 'undefined' || !Nations.getIdeologiesList) return;

        const ideologyCards = document.querySelectorAll('.ideology-card');
        const ideologies = Nations.getIdeologiesList(nationId);

        const ideologyMap = {};
        ideologies.forEach(ideo => {
            ideologyMap[ideo.id] = ideo;
        });

        ideologyCards.forEach(card => {
            const ideologyKey = card.dataset.value;
            const localized = ideologyMap[ideologyKey];
            if (localized) {
                const nameEl = card.querySelector('.ideology-name');
                const descEl = card.querySelector('.ideology-desc');
                const iconEl = card.querySelector('.ideology-icon');

                if (nameEl) nameEl.textContent = localized.localName || ideologyKey;
                if (descEl) descEl.textContent = localized.desc || '';
                if (iconEl) iconEl.textContent = localized.icon || '';
            }
        });
    },

    sanitizeName(raw) {
        return String(raw || '')
            .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'\-\s]/g, '')
            .replace(/\s{2,}/g, ' ')
            .trimStart();
    },

    // === I. BUROCRATE IMPAZIENTE ===
    startIdleTimer() {
        this._idleTimer = Scheduler.timeout(() => this.showBurocrate(), 20000, { group: 'character', label: 'idle' });
    },

    resetIdleTimer() {
        Scheduler.clear(this._idleTimer);
        Scheduler.clear(this._coffeeTimer);
        this._coffeeTimer = Scheduler.timeout(() => this.showCoffeeStain(), 45000, { group: 'character', label: 'coffee' });
        this.startIdleTimer();
        const msg = document.getElementById('burocrate-msg');
        if (msg) msg.classList.add('hidden');
    },

    showBurocrate() {
        const msg = document.getElementById('burocrate-msg');
        if (!msg) return;
        const phrase = this.BUROCRATE_PHRASES[this._idleCount % this.BUROCRATE_PHRASES.length];
        msg.textContent = `💬 "${phrase}"`;
        msg.classList.remove('hidden');
        msg.classList.add('burocrate-animate');
        setTimeout(() => msg.classList.remove('burocrate-animate'), 500);
        this._idleCount++;
        // Schedule next one
        this._idleTimer = Scheduler.timeout(() => this.showBurocrate(), 15000, { group: 'character', label: 'idle-next' });
    },

    // === B. MACCHIA DI CAFFÈ ===
    showCoffeeStain() {
        const stain = document.getElementById('doc-coffee-stain');
        if (stain) stain.classList.remove('hidden');
    },

    // === A. PROTOCOLLO DINAMICO ===
    updateProtocol() {
        const el = document.getElementById('doc-protocol-num');
        if (!el) return;
        const ideology = Game.state.character.ideology;
        const code = this.IDEOLOGY_CODES[ideology] || 'XX';
        const num = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
        el.textContent = `PVQ-${code}-${num}`;

        // A. Riservato stamp color per ideology
        const riservato = document.getElementById('doc-riservato');
        if (riservato) {
            riservato.className = 'doc-riservato';
            if (ideology) riservato.classList.add(`riservato-${ideology}`);
        }
    },

    // === H. ANTEPRIMA TESSERA IN TEMPO REALE ===
    updatePreview() {
        const name = document.getElementById('char-name').value.trim();
        const ideology = Game.state.character.ideology;
        const avatar = Game.state.character.avatar;
        const ideoClass = Game.IDEOLOGY_CLASSES[ideology];

        const previewName = document.getElementById('preview-name');
        const previewIdeology = document.getElementById('preview-ideology');
        const previewAvatar = document.getElementById('preview-avatar');
        const previewNumber = document.getElementById('preview-number');
        const protocolEl = document.getElementById('doc-protocol-num');

        if (previewName) previewName.textContent = name || '—';
        if (previewIdeology) previewIdeology.textContent = ideoClass ? `${ideoClass.icon} ${ideoClass.label}` : '—';
        if (previewAvatar) previewAvatar.textContent = avatar || '?';
        if (previewNumber && protocolEl) previewNumber.textContent = protocolEl.textContent;
    },

    showAvatarSelection(gender) {
        const row = document.getElementById('avatar-selection');
        const container = document.getElementById('avatar-stamps');
        if (!row || !container) return;

        const avatars = this.AVATARS[gender] || this.AVATARS['X'];
        container.innerHTML = avatars.map((a, i) => `
            <button class="stamp-btn avatar-stamp" data-group="avatar" data-value="${a.value}">
                <span class="stamp-icon">${a.value}</span>
            </button>
        `).join('');

        row.classList.remove('hidden');

        // Select first by default
        const firstBtn = container.querySelector('.avatar-stamp');
        if (firstBtn) {
            firstBtn.classList.add('selected');
            Game.state.character.avatar = firstBtn.dataset.value;
            this.updateAvatar(firstBtn.dataset.value);
        }

        // Bind avatar stamp clicks
        container.querySelectorAll('.avatar-stamp').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.avatar-stamp').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                Game.state.character.avatar = btn.dataset.value;
                this.updateAvatar(btn.dataset.value);
                this.updatePreview();
            });
        });
    },

    updateAvatar(emoji) {
        const avatar = document.getElementById('char-avatar');
        avatar.innerHTML = `<span style="font-size:48px">${emoji}</span>`;
        avatar.classList.add('avatar-set');
    },

    checkReady() {
        const name = this.sanitizeName(document.getElementById('char-name').value.trim());
        const gender = Game.state.character.gender;
        const ideology = Game.state.character.ideology;
        const btn = document.getElementById('btn-approve');
        const nation = Game.state.nation.id;
        const allValid = !!(name && gender && ideology && nation);
        btn.disabled = !allValid;

        // B. Timbro APPROVATO: grigio sbiadito → rosso vivo
        if (allValid) {
            btn.classList.add('stamp-ready');
        } else {
            btn.classList.remove('stamp-ready');
        }
    },

    approve() {
        const name = this.sanitizeName(document.getElementById('char-name').value.trim());
        if (!name || !Game.state.character.gender || !Game.state.character.ideology || !Game.state.nation.id) return;

        // Stop idle timers
        Scheduler.clear(this._idleTimer);
        Scheduler.clear(this._coffeeTimer);
        const burocrate = document.getElementById('burocrate-msg');
        if (burocrate) burocrate.classList.add('hidden');

        const approveBtn = document.getElementById('btn-approve');

        // G. Timbro che "sbatte" — animation + sound
        approveBtn.classList.add('stamping');

        // Ink splatter effect
        const splatter = document.createElement('div');
        splatter.className = 'stamp-ink-splatter';
        splatter.style.top = `${approveBtn.offsetTop - 30}px`;
        splatter.style.left = `${approveBtn.offsetLeft - 30}px`;
        approveBtn.parentElement.appendChild(splatter);
        setTimeout(() => splatter.remove(), 800);

        // Stamp sound effect
        if (typeof Audio !== 'undefined' && Audio.playStamp) Audio.playStamp();

        Game.state.character.name = name;
        
        // 🌍 Load nation and apply its modifiers
        if (typeof Game.loadNation === 'function') {
            Game.loadNation(Game.state.nation.id).catch(err => console.error('Failed to load nation:', err));
        }
        
        // D. Silent tutorial — ideology adjusts starting stats
        this.applyIdeologyBonuses(Game.state.character.ideology);
        this.generateContacts();
        this.maybeGeneratePartner();

        // F. Desk background focus transition
        const deskBg = document.getElementById('anagrafe-desk-bg');
        if (deskBg) deskBg.classList.add('desk-focusing');

        // Delay: stamp animation → letter screen
        setTimeout(() => {
            approveBtn.classList.remove('stamping');
            approveBtn.classList.add('stamped');
            Game.emit('character-created', Game.state.character);
            // E. Show Secretary's letter instead of going straight to desk
            this.showSecretaryLetter();
        }, 700);
    },

    // === E. LETTERA DEL SEGRETARIO ===
    showSecretaryLetter() {
        const name = Game.state.character.name;
        const ideology = Game.state.character.ideology;
        const ideoClass = Game.getIdeologyClass();
        const letterContent = document.getElementById('letter-content');
        if (!letterContent) { this.showMentorScreen(); return; }

        letterContent.innerHTML = `
            <p class="letter-date">Roma, 6 Gennaio 2025</p>
            <p class="letter-greeting">Caro/a <strong>${Game.esc(name)}</strong>,</p>
            <p>benvenuto nella sezione locale del Partito. Qui non si fanno promesse. Si sopravvive.</p>
            <p>Il tuo fascicolo è stato registrato sotto la corrente <em>${ideoClass.icon} ${ideoClass.label}</em>.
            Non fraintendere: non è una medaglia. È un bersaglio.</p>
            <p>Il tuo primo incarico è sulla scrivania. Non deludermi.</p>
            <p class="letter-sign">Il Segretario di Sezione<br><em>On. Franco Merighi</em></p>
            <hr class="letter-divider">
            <p class="letter-pact">⚠️ <strong>PATTO DI COERENZA</strong><br>
            Ogni volta che agirai contro la tua ideologia, la tua Coerenza calerà.<br>
            Se arriva a zero, il Partito ti espellerà. Non c'è appello.</p>
        `;

        // Show letter screen with typewriter animation
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-letter').classList.add('active');

        // Typewriter reveal
        const paragraphs = letterContent.querySelectorAll('p, hr');
        paragraphs.forEach((p, i) => {
            p.style.opacity = '0';
            p.style.transform = 'translateY(8px)';
            setTimeout(() => {
                p.style.transition = 'opacity 0.5s, transform 0.5s';
                p.style.opacity = '1';
                p.style.transform = 'translateY(0)';
            }, 300 + i * 500);
        });

        const continueBtn = document.getElementById('letter-continue');
        continueBtn.style.opacity = '0';
        setTimeout(() => {
            continueBtn.style.transition = 'opacity 0.5s';
            continueBtn.style.opacity = '1';
        }, 300 + paragraphs.length * 500);

        continueBtn.addEventListener('click', () => this.showMentorScreen(), { once: true });
    },

    // === J. SCELTA DEL MENTORE ===
    showMentorScreen() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-mentor').classList.add('active');

        const container = document.getElementById('mentor-choices');
        if (!container) return;

        container.innerHTML = '';
        const mentors = this.getAvailableMentorsForNation();
        this._currentMentorPool = mentors;

        mentors.forEach((mentor) => {
            const card = document.createElement('div');
            card.className = 'mentor-card';
            card.dataset.mentor = mentor.id;
            card.innerHTML = `
                <div class="mentor-avatar">${mentor.icon}</div>
                <div class="mentor-ideology">${Game.esc(mentor.ideology)}</div>
                <div class="mentor-name">${Game.esc(mentor.shortName)}</div>
                <div class="mentor-quote">"${Game.esc(mentor.quote)}"</div>
                <div class="mentor-bonus">${Game.esc(mentor.bonusText || this.getMentorBonusText(mentor.id))}</div>
            `;
            card.addEventListener('click', () => {
                container.querySelectorAll('.mentor-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                setTimeout(() => this.applyMentorChoice(mentor.id), 400);
            }, { once: true });
            container.appendChild(card);
        });
    },

    applyMentorVariantEffects(pick) {
        const canonicalIds = new Set(['marta1', 'roberto1', 'beppe1', 'elena1', 'massimo1', 'anziano']);
        if (canonicalIds.has(pick.id)) return;

        const e = pick.effects || {};

        if (e.coherence) Game.changeStat('coherence', e.coherence);
        if (e.muscoli) Game.changeAttribute('muscoli', e.muscoli);
        if (e.carisma) Game.changeAttribute('carisma', e.carisma);
        if (e.intelligenza) Game.changeAttribute('intelligenza', e.intelligenza);
        if (e.autenticita) Game.changeAttribute('autenticita', e.autenticita);
        if (e.money) Game.changeMoney(e.money);
        if (e.reputazione) Game.changeReputazione(e.reputazione);
        if (e.repNazionale) Game.changeReputazione(e.repNazionale, 'nazionale');
        if (e.followers) {
            if (!Game.state.social) Game.state.social = {};
            Game.state.social.followers = (Game.state.social.followers || 0) + e.followers;
        }
        if (e.stress) Game.changeStat('stress', e.stress);

        if (e.networking) {
            Game.state.career.promotionProgress = Math.min(
                100,
                (Game.state.career.promotionProgress || 0) + Math.round(e.networking / 2)
            );
        }
        if (e.relationAll) {
            (Game.state.contacts || []).forEach(c => {
                c.relation = Math.max(0, Math.min(100, (c.relation || 0) + e.relationAll));
            });
        }

        // Persist optional passives/actions for future systems.
        if (e.action) Game.state.flags.mentorExtraAction = e.action;
        if (e.dailyMoney) Game.state.flags.mentorDailyMoney = e.dailyMoney;
        if (e.moneyPerTask) Game.state.flags.mentorMoneyPerPoliticalTask = e.moneyPerTask;
        if (e.moneyPerReport) Game.state.flags.mentorMoneyPerReport = e.moneyPerReport;
        if (e.moneyPerComizio) Game.state.flags.mentorMoneyPerComizio = e.moneyPerComizio;
        if (e.moneyPerTerritory) Game.state.flags.mentorMoneyPerTerritory = e.moneyPerTerritory;
        if (e.stressMitigation) Game.state.flags.mentorStressMitigation = e.stressMitigation;
    },

    applyMentorChoice(mentor) {
        const pick = this.getMentorById(mentor);
        if (!pick) return;
        const mentorArchetype = pick.archetype || pick.id;

        if (!Game.state.flags) Game.state.flags = {};
        Game.state.flags.mentor = {
            id: mentorArchetype,
            selectedId: pick.id,
            name: pick.name,
            icon: pick.icon,
            ideology: pick.ideology,
            quote: pick.quote,
            active: true,
            relationship: 70,
            step: 0,
            populistPosts: 0,
            eventsDone: {},
            specialUnlocked: false,
            unlockedActionIds: [],
            lastActionDay: {},
            oneShot: {},
            penalties: {},
        };

        this.applyMentorVariantEffects(pick);

        switch (mentorArchetype) {
            case 'marta':
                Game.changeStat('coherence', 15);
                (Game.state.contacts || []).forEach(c => {
                    const role = String(c.role || '').toLowerCase();
                    if (/operaio|sindacal|attivista/.test(role)) c.relation = Math.min(100, c.relation + 10);
                });
                Game.state.flags.mentorActionAssemblea = true;
                Game.addDiaryEntry('Marta ti apre le porte del centro sociale.', '🚩');
                break;
            case 'roberto':
                Game.state.career.promotionProgress = Math.min(100, Game.state.career.promotionProgress + 10);
                Game.changeMoney(100);
                Game.state.flags.mentorActionLobbyAperitivo = true;
                Game.addDiaryEntry('Roberto ti inserisce nel circuito dei lobbisti.', '⚖️');
                break;
            case 'beppe':
                if (!Game.state.social) Game.state.social = {};
                Game.state.social.followers = (Game.state.social.followers || 0) + 500;
                Game.state.flags.mentorPopulistPost = true;
                Game.state.flags.mentorTaskBoost = { volantinaggio: 1, gazebo: 1 };
                Game.addDiaryEntry('Beppe ti porta un pubblico social immediato.', '📢');
                break;
            case 'elena':
                Game.changeAttribute('intelligenza', 10);
                Game.state.flags.mentorTechTaskBoost = 1.2;
                Game.state.flags.mentorActionBilancio = true;
                Game.addDiaryEntry('Elena ti affida report e simulazioni.', '📊');
                break;
            case 'massimo':
                Game.changeAttribute('muscoli', 10);
                (Game.state.contacts || []).forEach(c => {
                    const role = String(c.role || '').toLowerCase();
                    if (/militar|polizi|carabin/.test(role)) c.relation = Math.min(100, c.relation + 15);
                });
                Game.state.flags.mentorActionPattuglia = true;
                Game.addDiaryEntry('Massimo ti addestra alla presenza pubblica.', '🦅');
                break;
            case 'anziano':
                Game.state.flags.mentorExtraPAUntilDay = Game.state.day + 4;
                Game.state.flags.mentorNotebook = { available: true, used: false };
                Game.state.flags.mentorActionMeditazione = true;
                Game.addDiaryEntry('Il Filosofo ti consegna il Quaderno degli Appunti.', '🛤️');
                break;
        }

            this.scheduleMentorEvents(pick.id);

        // Transition to city selection
        this.showCitySelection();
    },

    scheduleMentorEvents(mentorId) {
        const mentorData = this.getMentorData(mentorId);
        if (!mentorData) return;

        (mentorData.events || []).forEach(ev => {
            const dayOffset = Array.isArray(ev.dayOffset)
                ? (ev.dayOffset[0] + Math.floor(Math.random() * (ev.dayOffset[1] - ev.dayOffset[0] + 1)))
                : (ev.dayOffset || 3);
            Game.scheduleDelayedConsequence(dayOffset, `Mentore ${mentorData.archetype}`, 'mentor-event', {
                mentorId: mentorData.archetype,
                selectedMentorId: mentorData.id,
                eventTag: ev.tag,
            });
        });
    },

    handleMentorProgression(day) {
        const m = Game.state.flags && Game.state.flags.mentor;
        if (!m || !m.active) return;

        if (m.id === 'anziano' && Game.state.flags.mentorExtraPAUntilDay && day <= Game.state.flags.mentorExtraPAUntilDay) {
            Game.state.actionPoints = Math.min(3, (Game.state.actionPoints || 0) + 1);
            Game.emit('ap-change', { ap: Game.state.actionPoints });
        }

        if (m.id === 'anziano' && !m.oneShot.bookPassive) {
            m.oneShot.bookPassive = true;
            Game.state.flags.mentorBookPassive = true;
        }

        if (m.id === 'massimo' && day >= 20 && !m.oneShot.magistraturaWarning) {
            m.oneShot.magistraturaWarning = true;
            Game.addUrgentMessage('Procura', 'Attenzione massima: stai entrando nel radar della magistratura.', 'enemy');
            Game.state.mafia.rischioIndagini = Math.min(100, (Game.state.mafia.rischioIndagini || 0) + 30);
        }
    },

    // === SELEZIONE CITTÀ ===
    async showCitySelection() {
        const nation = (typeof Nations !== 'undefined' && Nations.getCurrentNation)
            ? Nations.getCurrentNation()
            : (Game.state.nation || { id: 'italy' });

        if (!Game.state.nation || Game.state.nation.id !== (nation.id || 'italy')) {
            Game.state.nation = {
                ...(Game.state.nation || {}),
                ...(nation || {}),
                id: nation.id || 'italy',
            };
        }

        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screen-cityselect').classList.add('active');

        await GameMap.renderCitySelection('city-select-container', (cityId) => {
            this.applyCityChoice(cityId);
        }, {
            nationId: nation.id || 'italy',
            preferredCityId: (typeof Nations !== 'undefined' && Nations.getDefaultCityId)
                ? Nations.getDefaultCityId(nation.id || 'italy')
                : (nation.defaultCity || nation.startingCity || null),
        });
    },

    async applyCityChoice(cityId) {
        const cities = await GameMap.loadCities();
        const city = cities[cityId];
        const nation = (typeof Nations !== 'undefined' && Nations.getCurrentNation)
            ? Nations.getCurrentNation()
            : (Game.state.nation || { id: 'italy' });
        if (!city) return;

        // Set city in state
        Game.state.city = {
            id: city.id,
            name: city.name,
            country: city.country || city.nationId || 'italy',
            lat: city.lat,
            lng: city.lng,
            region: city.region,
            type: city.type,
            population: city.population,
            tier: city.tier,
            settlementType: city.settlementType,
            politicalRelevance: city.politicalRelevance,
            economyType: city.economyType,
            culture: city.culture,
            bonus: city.bonus,
            malus: city.malus,
            rentMultiplier: city.rentMultiplier,
            salaryMultiplier: typeof city.salaryMultiplier === 'number' ? city.salaryMultiplier : (city.rentMultiplier || 1),
        };
        if (Game.changeNation) Game.changeNation(city.country || city.nationId || 'italy');
        if (Game.initCityFlags) Game.initCityFlags();

        // Base starting money comes from the selected nation, with city fallback.
        if (typeof nation.startingMoney === 'number') {
            Game.state.money = nation.startingMoney;
        } else if (city.startingMoney) {
            Game.state.money = city.startingMoney;
        }

        // Adjust starting rent based on city multiplier
        Game.state.housing.rent = Math.round(300 * city.rentMultiplier);

        // Track starting city as visited
        if (!Game.state.visitedCities) Game.state.visitedCities = [];
        if (!Game.state.visitedCities.includes(city.id)) Game.state.visitedCities.push(city.id);

        // City morale bonus (e.g. L'Aquila)
        if (city.bonus.morale) {
            Game.changeStat('morale', city.bonus.morale);
        }

        // Transition to desk
        Game.emit('screen-change', { screen: 'desk' });
        Game.emit('game-started', {
            cityId: Game.state.city && Game.state.city.id,
            nationId: Game.state.nation && Game.state.nation.id,
        });

        if (!Game.state.flags.onboardingShown) {
            Game.state.flags.onboardingShown = true;
            Game.addWorkNotif('🎓 Tutorial', 'Inizia da Mansioni per guadagnare stabilita economica nei primi giorni.', `Giorno ${Game.state.day}`);
            Game.addWorkNotif('🎓 Tutorial', 'Usa SmartPolitica per contatti e social: ti servono per reputazione e alleanze.', `Giorno ${Game.state.day}`);
            Game.addWorkNotif('🎓 Tutorial', 'Controlla Casa > Economia prima delle scadenze per evitare blocchi e sanzioni.', `Giorno ${Game.state.day}`);
        }
    },

    // D. Silent tutorial — ideology adjusts starting stats
    applyIdeologyBonuses(ideology) {
        switch (ideology) {
            case 'estrema-sinistra': // Sinistra Radicale / AVS
                Game.state.attributes.carisma += 10;
                Game.state.attributes.muscoli += 10;
                Game.state.attributes.autenticita += 10;
                Game.changeReputazione(6);
                Game.state.stats.stress += 12;
                Game.state.money -= 15; // L'idealismo costa
                break;
            case 'centro': // Centro Liberale / IV+Azione
                Game.state.attributes.intelligenza += 8;
                Game.state.attributes.estetica += 5;
                Game.state.money += 35; // Networking = denaro
                Game.state.coherence = Math.min(100, (Game.state.coherence || 100) + 4);
                Game.state.stats.stress += 5;
                break;
            case 'populista': // M5S / Antisistema
                Game.state.attributes.carisma += 20;
                Game.state.attributes.estetica += 5;
                Game.changeReputazione(8);
                Game.state.stats.stress += 12;
                Game.state.money -= 10; // Promesse costose
                break;
            case 'tecnocrate': // PD governista / tecnici
                Game.state.attributes.intelligenza += 20;
                Game.state.attributes.autenticita += 5;
                Game.state.money += 25; // Incarichi ben pagati
                Game.state.reputazioneNazionale = Math.min(100, (Game.state.reputazioneNazionale || 0) + 2);
                Game.state.stats.stress += 5;
                break;
            case 'estrema-destra': // Destra Sovranista / FdI+Lega
                Game.state.attributes.carisma += 10;
                Game.state.attributes.muscoli += 10;
                Game.state.attributes.autenticita += 10;
                Game.changeReputazione(6);
                Game.state.stats.stress += 12;
                Game.state.money -= 15; // Le campagne identitarie costano
                break;
        }
    },

    generateContacts() {
        // No starting contacts — meet people through work, territory, and events
        Game.state.contacts = [];
    },

    maybeGeneratePartner() {
        // No partner at start — meet someone through territory exploration
    },
};

// Espone Character su window per test automatici e bootstrap headless
if (typeof window !== 'undefined') {
    window.Character = Character;
}
