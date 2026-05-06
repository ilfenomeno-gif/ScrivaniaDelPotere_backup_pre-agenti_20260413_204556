/* ============================================
   GAME ENGINE — Core State Manager (v2)
   ============================================ */

const Game = {
    // === ITALIAN DATE HELPERS ===
    DAYS_IT: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
    MONTHS_IT: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
    TIME_LABELS: ['Mattina', 'Pomeriggio', 'Sera'],
    TIME_ICONS: ['🌅', '☀️', '🌙'],

    // === STATE ===
    state: {
        screen: 'character',
        day: 1,
        calendar: {
            baseDate: new Date(2025, 0, 6), // 6 Gennaio 2025, Lunedì
            dayOffset: 0,
            timeOfDay: 0, // 0=mattina, 1=pomeriggio, 2=sera
        },
        actionPoints: 2,
        phoneActions: 2,

        character: { name: '', gender: '', ideology: '', avatar: '' },

        // 🌍 Nazione e Sistema Politico
        nation: {
            id: 'italy',
            name: 'Italia',
            language: 'italiano',
        },
        mentorsDB: null,

        // 🧠 Competenze e Immagine
        attributes: {
            intelligenza: 10,
            estetica: 50,
            autenticita: 50,
            muscoli: 50,
            carisma: 10,
        },

        // 😰 Stato Psicofisico
        stats: {
            stanchezza: 0,   // 0=riposato, 100=esausto
            stress: 10,
            morale: 60,
            salute: 100,
        },

        // 🏛️ Social & Financial
        reputazione: 39,          // alias per reputazioneLocale (retrocompatibilità)
        reputazioneLocale: 39,    // fama nella città attuale
        reputazioneNazionale: 5,  // fama nazionale (TV, articoli)
        money: 150,
        coherence: 100,

        // 📍 Città attuale
        city: null, // set during character creation { id, name, lat, lng, region, bonus, malus, rentMultiplier }
        cityFlags: {
            settlementType: 'city',
            politicalRelevance: 'regional',
            economyType: 'administrative',
            culture: 'moderate',
        },
        contactsLost: [], // contatti persi dopo trasferimenti { ...contact, originalCity, lostDay }

        // 💼 Career Evolution
        career: {
            level: 0,          // 0=impiegato, 1=capo-reparto, 2=dirigente, 3=direttore
            promotionProgress: 0, // 0-100
            corruptionRisk: 0,    // 0-100
            corrupted: false,
        },

        // 🏛️ Carriera Politica (Scala del Potere)
        politicalCareer: {
            level: 0, // 0=Militante, 1=Capo Sezione, 2=Consigliere, 3=Assessore, 4=Sindaco/Deputato
            progress: 0,
            politicalTasksCompleted: 0,
            signaturesCollected: 0,
            campaignFunds: 0,
            campaignStreak: 0,
            campaignLastDay: 0,
            nationalTasksCompleted: 0,
            localElectionWon: false,
            cooptedByParty: false,
            debateWins: 0,
            scandalDays: [],
            politicalBonusAP: 0,
            municipalMomentum: 0,
        },

        // 🏠 Home Improvements
        homeImprovements: [],   // e.g. ['scrivania', 'isolamento', ...]

        // 📓 Diario dei Ricordi
        diary: [],  // { id, title, icon, day, coherenceRecover }

        // 📩 Urgent Messages
        urgentMessages: [], // { id, from, text, type, day, handled }

        housing: {
            type: 'stanza',
            label: 'Stanza in Affitto',
            rent: 300,
            bonuses: ['Economica'],
            maluses: ['Paranoia da coinquilini'],
        },
        bills: [],
        tasks: { work: [], political: [] },
        contacts: [],
        agents: [],
        partner: null,
        workNotifs: [],
        newsQueue: [],
        flags: {
            billsUnpaid: 0,
            lightDimmed: false,
            candleLit: false,
            phoneLocked: false,
            consecutiveUnpaidRent: 0,
            evicted: false,          // sleeping at party office
            politicalBlockedTurns: 0,
            debtPressure: 0,
            lastDebtSocialHitDay: 0,
            onboardingStep: 0,
        },
        coffee: { uses: 3, maxPerDay: 3, drankToday: 0 },
        socialPosts: [],
        social: {
            followers: 80,
            trendOfDay: 'crisi', // crisi | ambiente | economia | solidarieta
            trendKnown: false,
            socialManager: false,
        },

        election: {
            active: false,
            type: 'comunali',
            phase: 'none', // prep | campagna | dibattito | voto | post
            dayInPhase: 0,
            campaignDays: 5,
            campaignAP: 0,
            baseConsensus: 15,
            consensus: 15,
            rivalConsensus: 45,
            campaignBonus: 0,
            debateBonus: 0,
            scandalMalus: 0,
            staff: {
                socialManager: false,
                eventOrganizer: false,
                spinDoctor: false,
                pollster: false,
            },
            debateAnswered: 0,
            debateScore: 0,
            office: {
                active: false,
                role: '',
                dailyMoney: 0,
                dailyRepLocal: 0,
                dailyRepNational: 0,
            },
        },

        // � Vita Quotidiana
        lifestyle: {
            lastMercatinoDay: 0,
            lastRipetizioniDay: 0,
            lastSondaggioDay: 0,
            habitStreak: {},       // { habitId: consecutiveDays }
            habitToday: null,      // chosen habit for today
            lunchToday: false,     // already chosen lunch
            dailyObjective: null,  // { id, title, reward, tracked, completed }
            consumables: [],       // active consumables { id, expiresDay, expiresTime }
            upgrades: [],          // permanent upgrades purchased
            npcRelations: {        // micro-NPC tracking
                barista: { visits: 0, tipped: 0, complained: false },
                fioraia: { bought: 0 },
                giornalaio: { bought: 0, asked: 0, cashCount: 0 },
            },
            debts: {},             // pending favors owed
        },

        // 💰 Manovra di Bilancio
        budgetLastDay: 0,
        debt: 0,

        // 🏦 Prestiti e Rate
        loans: {
            mortgage: null,        // { type, total, remaining, monthly, startDay, interestRate, paidMonths, monthsTotal, nextDue }
            activeInstallments: [], // [{ id, billId, billName, totalWithInterest, remaining, monthly, monthsTotal, monthsPaid, nextDue, startDay }]
        },
        debtHistory: [],           // { day, type, amount, reason }

        // 🏦 Conto Bancario
        bank: {
            accountBalance:  500,   // saldo conto corrente (separato dai contanti)
            loans:           [],    // prestiti attivi { id, amount, remaining, monthly, monthsTotal, monthsPaid, nextDue, interestRate }
            checks:          [],    // assegni emessi { id, to, amount, day, cashed }
            creditScore:     50,    // 0-100
            lastInterestDay: 0,
            _baseRent:       null,  // affitto base prima degli sconti bancari
        },

        // 🤝 Alleanze / conseguenze ritardate
        delayedConsequences: [],   // [{ id, dueDay, label, handler, payload }]
        allianceLastIdeology: '',

        // 🏛️ Fazione / Corrente Politica
        faction: { current: null, joinedDay: 0 },

        // 🕵️ Intelligence / Soffiate
        intel: [],
        _intelShield: false,

        // 🤝 Favori e Crediti
        favors: { pending: [], credits: [], completed: 0 },

        // 📖 Diario di Carriera
        diaryEntries: [],

        // 🧭 Options & New Systems
        options: {
            advisorEnabled: true,
            tickerEnabled: true,
        },
        timeline: [],
        deskDecor: [],

        // 🔫 Zona Grigia — Mafia & Corruzione
        mafia: {
            active: false,          // primo contatto accettato
            firstContactDay: 0,     // giorno del primo messaggio anonimo
            firstContactShown: false,
            path: null,             // null | 'amico' | 'socio'
            rank: 0,                // 0=nessuno, 1=picciotto, 2=uomo d'onore, 3=capodecina, 4=capo mandamento
            favorsCompleted: 0,
            favorsDeclined: 0,
            rispettoCriminale: 0,   // 0-100, come reputazione mafiosa
            rischioIndagini: 0,     // 0-100, probabilità arresto
            pizzoWeekly: 0,         // entrate settimanali dal pizzo
            pathChoiceShown: false,  // livello 3 proposta fatta
            daysAsSocio: 0,         // giorni sopravvissuti come socio
            lastFavorDay: 0,        // ultimo giorno favore proposto
            pendingFavor: null,     // favore in attesa di risposta
            totoRelation: 0,        // relazione con Totò
            segnalatoPolizia: false,// hai segnalato alla polizia
        },
    },

    // === IDEOLOGY CLASS DEFINITIONS — "Governo Italiano 2025" ===
    IDEOLOGY_CLASSES: {
        'estrema-sinistra': {
            label: 'Sinistra Radicale',
            icon: '🚩',
            realRef: 'AVS, movimenti, sinistra extra-parlamentare',
            socialBonus: 1.2,
            parliamentMalus: 0.5,      // -50% efficacia parlamentare
            allyFilter: ideo => ideo !== 'estrema-destra',
            mediaTarget: true,
            consensusFloor: 20,        // base fedelissima
            lawDifficulty: 2.0,
            stressFromCompromise: true, // stress costante da compromessi
            desc: 'Base fedele (min 20%). Irrilevanza nelle decisioni (-50% Parlamento). Stress da compromesso.',
            motto: 'Difendi i diritti, l\'ambiente, i lavoratori. Ma il tuo voto è dato per scontato.',
        },
        'centro': {
            label: 'Centro Liberale',
            icon: '⚖️',
            realRef: 'Italia Viva, Azione, +Europa',
            socialBonus: 0.8,
            parliamentMalus: 1.0,
            allyFilter: () => true,    // tutti ti corteggiano
            volatileVoters: true,
            voltagabbanaRisk: 0.15,
            dinnerDiscount: 0.5,       // 50% sconto networking
            allianceBonus: 1.3,        // +30% efficacia alleanze
            desc: 'Flessibilità e networking (+30%). Sconti cene. Rischio estinzione elettorale.',
            motto: 'Sei l\'ago della bilancia. Tutti ti corteggiano, ma alle elezioni rischi di restare fuori.',
        },
        'populista': {
            label: 'Populista',
            icon: '📢',
            realRef: 'M5S, partiti personali, antisistema',
            socialBonus: 1.8,          // +80% reputazione social
            parliamentMalus: 0.5,      // -50% efficacia leggi
            allyFilter: ideo => ideo !== 'tecnocrate',
            coherenceDrain: true,      // coerenza cala con alleanze "impure"
            desc: 'Consenso social immediato (+80%). Coerenza in caduta libera con compromessi.',
            motto: 'Sei nato contro la casta. Governare significa sporcarsi le mani.',
        },
        'tecnocrate': {
            label: 'Tecnocrate',
            icon: '📊',
            realRef: 'PD governista, figure tecniche, ex Draghi',
            socialBonus: 0.6,
            parliamentMalus: 1.5,
            allyFilter: ideo => ideo !== 'populista',
            workSalaryMultiplier: 1.5, // +50% incarichi
            barPenalty: true,           // la gente ti trova noioso
            desc: 'Stipendio +50%. Rispettato dalle istituzioni. Inviso ai populisti e distante dal "paese reale".',
            motto: 'I mercati ti amano, i cittadini ti trovano noioso. Ma senza di te, il paese andrebbe a gambe all\'aria.',
        },
        'estrema-destra': {
            label: 'Destra Sovranista',
            icon: '🦅',
            realRef: 'FdI, Lega, ala destra FI',
            socialBonus: 1.2,
            parliamentMalus: 0.7,
            allyFilter: ideo => ideo !== 'estrema-sinistra',
            mediaTarget: true,
            consensusFloor: 20,         // base identitaria fedele
            lawDifficulty: 2.0,         // ostacoli istituzionali/mediatici
            coalitionStress: true,      // stress da gestione alleati
            desc: 'Potere e controllo. Base fedele (min 20%). Coalizione ingovernabile (+Stress alleati).',
            motto: 'Governi, decidi, comandi. Ma la tua coalizione è una polveriera di ego e ricatti.',
        },
    },

    // === COALITION ALLIANCE MATRIX ===
    // Levels: 'amico' (ally), 'possibile' (possible), 'diffidente' (wary), 'nemico' (enemy)
    COALITION_MATRIX: {
        'estrema-sinistra': { 'estrema-sinistra': 'amico', 'centro': 'diffidente', 'populista': 'possibile', 'tecnocrate': 'nemico', 'estrema-destra': 'nemico' },
        'centro':           { 'estrema-sinistra': 'diffidente', 'centro': 'amico', 'populista': 'possibile', 'tecnocrate': 'amico', 'estrema-destra': 'diffidente' },
        'populista':        { 'estrema-sinistra': 'possibile', 'centro': 'possibile', 'populista': 'amico', 'tecnocrate': 'nemico', 'estrema-destra': 'possibile' },
        'tecnocrate':       { 'estrema-sinistra': 'nemico', 'centro': 'amico', 'populista': 'nemico', 'tecnocrate': 'amico', 'estrema-destra': 'diffidente' },
        'estrema-destra':   { 'estrema-sinistra': 'nemico', 'centro': 'diffidente', 'populista': 'possibile', 'tecnocrate': 'diffidente', 'estrema-destra': 'amico' },
    },

    // Relation modifier based on coalition stance
    COALITION_RELATION_MOD: {
        'amico': 15,
        'possibile': 5,
        'diffidente': -5,
        'nemico': -15,
    },

    getCoalitionStance(playerIdeology, otherIdeology) {
        const row = this.COALITION_MATRIX[playerIdeology];
        return row ? (row[otherIdeology] || 'diffidente') : 'diffidente';
    },

    CAREER_LEVELS: [
        { label: 'Impiegato', salary: 80, polTimeMalus: 0 },
        { label: 'Capo Reparto', salary: 150, polTimeMalus: -1 },
        { label: 'Dirigente', salary: 220, polTimeMalus: -2 },
        { label: 'Direttore', salary: 340, polTimeMalus: -3 },
    ],

    POLITICAL_LEVELS: [
        { label: 'Militante di Base', dailySalary: 0 },
        { label: 'Capo di Sezione', dailySalary: 0 },
        { label: 'Consigliere Comunale', dailySalary: 50 },
        { label: 'Assessore', dailySalary: 100 },
        { label: 'Sindaco / Deputato', dailySalary: 150 },
    ],

    HOME_IMPROVEMENTS_CATALOG: [
        { id: 'scrivania', name: '🪑 Nuova Scrivania', desc: '-10% Stress da lavoro', cost: 300, effect: 'stressWork' },
        { id: 'isolamento', name: '🔇 Isolamento Acustico', desc: '+1 Riposo aggiuntivo', cost: 500, effect: 'bonusRest' },
        { id: 'palestra-casa', name: '🏋️ Attrezzi Palestra', desc: '+2 Muscoli al riposo', cost: 600, effect: 'bonusMuscoli' },
        { id: 'libreria', name: '📚 Libreria Completa', desc: '+2 Intelligenza al riposo', cost: 450, effect: 'bonusIntelligenza' },
        { id: 'specchio', name: '🪞 Specchio Illuminato', desc: '+1 Estetica al riposo', cost: 200, effect: 'bonusEstetica' },
        { id: 'macchina-caffe', name: '☕ Macchina Caffè Pro', desc: '-5 Stanchezza extra ogni turno', cost: 350, effect: 'bonusCaffe' },
        { id: 'libreria-leggi', name: '📖 Libreria Legislativa', desc: '+Coerenza da compiti politici', cost: 500, effect: 'bonusLeggi' },
        { id: 'orto-casa', name: '🥕 Orto di Casa', desc: '+3 Salute al nuovo giorno (solo comuni)', cost: 260, effect: 'bonusOrto', allowedSettlement: ['comune'] },
        { id: 'camino-casa', name: '🔥 Camino', desc: '-4 Stress al nuovo giorno (solo comuni)', cost: 320, effect: 'bonusCamino', allowedSettlement: ['comune'] },
        { id: 'cantina-casa', name: '🍷 Cantina', desc: '+4 Morale al nuovo giorno (solo comuni)', cost: 280, effect: 'bonusCantina', allowedSettlement: ['comune'] },
        { id: 'balcone-fiorito', name: '🌺 Balcone Fiorito', desc: '+5 Estetica e +3 Morale (solo citta)', cost: 420, effect: 'bonusBalcone', allowedSettlement: ['city'] },
        { id: 'casa-blindata', name: '🛡️ Casa Blindata', desc: 'Riduce il rischio indagini mafiose del 50% (metropoli)', cost: 900, effect: 'shieldMafia', allowedSettlement: ['metropolis'] },
        { id: 'sala-riunioni', name: '🗂️ Sala Riunioni', desc: '+15 relazione con un contatto influente al giorno (capitali regionali)', cost: 700, effect: 'bonusMeeting', allowedSettlement: ['capital'] },
    ],

    getIdeologyClass() {
        return this.IDEOLOGY_CLASSES[this.state.character.ideology] || this.IDEOLOGY_CLASSES['centro'];
    },

    getCareerLevel() {
        const base = this.CAREER_LEVELS[this.state.career.level] || this.CAREER_LEVELS[0];
        const city = this.state.city || {};
        const cityMult = typeof city.salaryMultiplier === 'number'
            ? city.salaryMultiplier
            : (typeof city.rentMultiplier === 'number' ? city.rentMultiplier : 1);
        return {
            ...base,
            baseSalary: base.salary,
            salaryMultiplier: cityMult,
            salary: Math.max(10, Math.round(base.salary * cityMult)),
        };
    },

    getPoliticalRoleLabel(level) {
        const fallback = [
            'Militante di Base',
            'Capo di Sezione',
            'Consigliere Comunale',
            'Assessore',
            'Sindaco / Deputato',
        ];
        const nationRoles = (typeof Nations !== 'undefined' && Nations.getCareerRoles)
            ? Nations.getCareerRoles(this.state.nation.id)
            : [];

        if (level <= 1 || !Array.isArray(nationRoles) || nationRoles.length < 3) {
            return fallback[level] || fallback[0];
        }

        const mapping = {
            2: nationRoles[0],
            3: nationRoles[1],
            4: nationRoles[2],
        };
        return mapping[level] || fallback[level] || fallback[0];
    },

    getElectionOfficeRole(type) {
        const nationRoles = (typeof Nations !== 'undefined' && Nations.getCareerRoles)
            ? Nations.getCareerRoles(this.state.nation.id)
            : [];
        if (!Array.isArray(nationRoles) || nationRoles.length < 4) {
            if (type === 'comunali') return 'Sindaco';
            if (type === 'regionali') return 'Assessore';
            return 'Deputato';
        }
        if (type === 'comunali') return nationRoles[2] || 'Sindaco';
        if (type === 'regionali') return nationRoles[1] || 'Assessore';
        return nationRoles[3] || 'Deputato';
    },

    getPoliticalLevel() {
        const base = this.POLITICAL_LEVELS[this.state.politicalCareer.level] || this.POLITICAL_LEVELS[0];
        return {
            ...base,
            label: this.getPoliticalRoleLabel(this.state.politicalCareer.level),
        };
    },

    getLongTermGoals() {
        this.ensurePoliticalCareerStructures();
        const pc = this.state.politicalCareer;
        const goals = [
            {
                id: 'career-director',
                label: 'Diventa Direttore',
                current: this.state.career.level,
                target: 3,
            },
            {
                id: 'political-peak',
                label: 'Raggiungi vertice politico',
                current: pc.level,
                target: 4,
            },
            {
                id: 'national-rep',
                label: 'Reputazione nazionale',
                current: this.state.reputazioneNazionale,
                target: 60,
            },
            {
                id: 'coherence-core',
                label: 'Mantieni coerenza alta',
                current: this.state.coherence,
                target: 80,
            },
        ];
        return goals.map(g => ({
            ...g,
            progress: Math.max(0, Math.min(100, Math.round((g.current / g.target) * 100))),
            completed: g.current >= g.target,
        }));
    },

    applyIdeologyConsistencyPenalty(actionTag) {
        const ideology = this.state.character.ideology;
        if (!ideology) return 0;

        const map = {
            populista: {
                supportive: [/comizio|piazza|volantin|fire|affondo|attacco|evento/i],
                conflicting: [/formal|programma|facts|audit|bilancio|istituzionale/i],
            },
            tecnocrate: {
                supportive: [/formal|programma|facts|analisi|report|bilancio|audit|investigativo/i],
                conflicting: [/fire|affondo|attacco|rissa|urla|populista/i],
            },
            centro: {
                supportive: [/collab|mediazione|negozia|coalizione|accordo/i],
                conflicting: [/fire|affondo|estremo|muro contro muro/i],
            },
            'estrema-sinistra': {
                supportive: [/solidar|ambiente|presidio|sociale|sindac/i],
                conflicting: [/lobby|appalto|privat|pizzo|mafia/i],
            },
            'estrema-destra': {
                supportive: [/sicurezza|ordine|presidio|pattuglia/i],
                conflicting: [/collab|mediazione morbida|compromesso totale/i],
            },
        };

        const cfg = map[ideology];
        if (!cfg) return 0;
        const text = String(actionTag || '').toLowerCase();

        const supportive = cfg.supportive.some(rx => rx.test(text));
        const conflicting = cfg.conflicting.some(rx => rx.test(text));
        if (!conflicting || supportive) return 0;

        const penalty = ideology === 'populista' ? -6 : -4;
        this.changeStat('coherence', penalty);
        this.addWorkNotif('🧭 Coerenza Ideologica', `Scelta poco allineata alla tua linea politica (${penalty}).`, `Giorno ${this.state.day}`);
        return penalty;
    },

    ensurePoliticalCareerStructures() {
        const pc = this.state.politicalCareer || {};
        this.state.politicalCareer = {
            level: pc.level || 0,
            progress: pc.progress || 0,
            politicalTasksCompleted: pc.politicalTasksCompleted || 0,
            signaturesCollected: pc.signaturesCollected || 0,
            campaignFunds: pc.campaignFunds || 0,
            campaignStreak: pc.campaignStreak || 0,
            campaignLastDay: pc.campaignLastDay || 0,
            nationalTasksCompleted: pc.nationalTasksCompleted || 0,
            localElectionWon: !!pc.localElectionWon,
            cooptedByParty: !!pc.cooptedByParty,
            debateWins: pc.debateWins || 0,
            scandalDays: Array.isArray(pc.scandalDays) ? pc.scandalDays : [],
            politicalBonusAP: pc.politicalBonusAP || 0,
            municipalMomentum: pc.municipalMomentum || 0,
        };
    },

    initCityFlags() {
        const city = this.state.city || {};
        const legacySettlement = city.type === 'municipality' ? 'comune' : 'city';
        const settlementType = city.settlementType || legacySettlement || 'city';
        this.state.cityFlags = {
            settlementType,
            politicalRelevance: city.politicalRelevance || (settlementType === 'metropolis' ? 'national' : (settlementType === 'comune' ? 'local' : 'regional')),
            economyType: city.economyType || 'administrative',
            culture: city.culture || 'moderate',
        };
    },

    applyCitySpecificEffects() {
        this.initCityFlags();
        const settlement = (this.state.cityFlags && this.state.cityFlags.settlementType) || 'city';
        if (settlement === 'comune') {
            this.changeStat('morale', 2);
            this.changeStat('stress', -2);
        } else if (settlement === 'city') {
            this.changeStat('coherence', 1);
        } else if (settlement === 'metropolis') {
            this.changeStat('stress', 2);
            this.changeReputazione(1, 'nazionale');
        } else if (settlement === 'capital') {
            this.changeStat('coherence', 2);
            this.changeReputazione(2);
        }
    },

    runCityPhoneAction(actionId) {
        this.initCityFlags();
        const settlement = (this.state.cityFlags && this.state.cityFlags.settlementType) || 'city';

        if (actionId === 'passaparola-comune') {
            if (settlement !== 'comune') return false;
            (this.state.contacts || []).forEach(c => {
                const stance = this.getCoalitionStance(this.state.character.ideology, c.ideology);
                c.relation = Math.max(0, Math.min(100, c.relation + (stance === 'nemico' ? -5 : 5)));
            });
            this.changeReputazione(3);
            this.addWorkNotif('📻 Passaparola', 'La voce gira in paese: consenso locale in aumento.', `Giorno ${this.state.day}`);
            return true;
        }

        if (actionId === 'quotidiano-regionale') {
            if (settlement !== 'city' || this.state.money < 30) return false;
            this.changeMoney(-30);
            this.changeReputazione(8);
            this.changeReputazione(2, 'nazionale');
            this.addWorkNotif('🗞️ Quotidiano Regionale', 'Il pezzo su di te circola nei territori vicini.', `Giorno ${this.state.day}`);
            return true;
        }

        if (actionId === 'inchiesta-civica') {
            if (settlement !== 'city') return false;
            const issues = ['strade rotte', 'verde pubblico trascurato', 'trasporti in crisi', 'servizi sociali lenti'];
            const issue = issues[Math.floor(Math.random() * issues.length)];
            this.state.flags.cityIssue = { issue, discoveredDay: this.state.day, resolved: false };
            if (this.state.taskPools) this.state.taskPools = { work: [], political: [] };
            this.addWorkNotif('🔎 Inchiesta Civica', `Problema individuato: ${issue}. Cerca il task di risoluzione.`, `Giorno ${this.state.day}`);
            return true;
        }

        if (actionId === 'metropolis-media-manager') {
            if (settlement !== 'metropolis' || this.state.money < 200) return false;
            this.changeMoney(-200);
            this.state.flags.metroSocialManagerUntil = this.state.day + 5;
            this.addWorkNotif('📡 Gestione Comunicazione', 'Media manager attivo per 5 giorni.', `Giorno ${this.state.day}`);
            return true;
        }

        if (actionId === 'tgr-intervista') {
            if (settlement !== 'capital') return false;
            const last = this.state.flags.lastTgrInterviewDay || 0;
            if (this.state.day - last < 5) return false;
            this.state.flags.lastTgrInterviewDay = this.state.day;
            this.changeReputazione(10);
            this.changeReputazione(5, 'nazionale');
            this.changeStat('stress', -5);
            this.addWorkNotif('📺 TGR', 'Intervista regionale completata con successo.', `Giorno ${this.state.day}`);
            return true;
        }

        if (actionId === 'lobby-regionale') {
            if (settlement !== 'capital' || this.state.money < 150) return false;
            this.changeMoney(-150);
            this.state.flags.regionalLobbyPower = Math.min(10, (this.state.flags.regionalLobbyPower || 0) + 2);
            this.changeReputazione(4);
            this.addWorkNotif('🏛️ Lobby Regionale', 'Il tuo peso politico nella giunta cresce.', `Giorno ${this.state.day}`);
            return true;
        }

        if (actionId === 'cena-famiglia') {
            const familyDinnerCost = (typeof GameConstants !== 'undefined' && GameConstants.ECONOMY)
                ? GameConstants.ECONOMY.FAMILY_DINNER_COST
                : 10;
            if (settlement !== 'comune' || !this.state.partner || this.state.money < familyDinnerCost) return false;
            this.changeMoney(-familyDinnerCost);
            this.state.partner.support = Math.min(100, (this.state.partner.support || 0) + 20);
            this.changeStat('stress', -10);
            this.addWorkNotif('🍲 Cena in Famiglia', 'Supporto del partner in crescita, stress in calo.', `Giorno ${this.state.day}`);
            return true;
        }

        if (actionId === 'consiglio-comunale-aperto') {
            if (settlement !== 'comune') return false;
            if (!this.spendActionPoint(2)) return false;
            if ((this.state.politicalCareer.signaturesCollected || 0) < 5) {
                this.state.actionPoints += 2;
                this.emit('ap-change', { ap: this.state.actionPoints });
                this.addWorkNotif('🏛️ Consiglio Aperto', 'Servono almeno 5 firme raccolte.', `Giorno ${this.state.day}`);
                return false;
            }
            if (Math.random() < 0.55) {
                this.changeReputazione(12);
                this.state.flags.localCouncilTitle = true;
                this.addWorkNotif('✅ Mozione Approvata', 'La proposta passa: prestigio locale permanente.', `Giorno ${this.state.day}`);
            } else {
                this.changeReputazione(-3);
                this.changeStat('stress', 4);
                this.addWorkNotif('❌ Mozione Respinta', 'La tua proposta non passa in consiglio.', `Giorno ${this.state.day}`);
            }
            return true;
        }

        return false;
    },

    markPoliticalScandal() {
        this.ensurePoliticalCareerStructures();
        const pc = this.state.politicalCareer;
        pc.scandalDays.push(this.state.day);
        pc.scandalDays = pc.scandalDays.filter(d => this.state.day - d <= 10);
    },

    hasRecentScandal(days) {
        this.ensurePoliticalCareerStructures();
        const windowDays = days || 10;
        return this.state.politicalCareer.scandalDays.some(d => this.state.day - d <= windowDays);
    },

    registerPoliticalTaskProgress(task) {
        this.ensurePoliticalCareerStructures();
        const pc = this.state.politicalCareer;
        const title = String(task && task.title ? task.title : '').toLowerCase();

        pc.politicalTasksCompleted += 1;

        if (/gazebo/.test(title)) pc.progress += 5;
        if (/volantin/.test(title)) pc.progress += 3;
        if (/firme|raccolta firme/.test(title)) {
            pc.progress += 8;
            pc.signaturesCollected += 50;
        }
        if (/discorso|comizio|piazza/.test(title)) pc.progress += 12;
        if (pc.progress > 100) pc.progress = 100;

        if (/nazionale|tv|radio|quotidiano|dibattito/.test(title)) {
            pc.nationalTasksCompleted += 1;
        }
        if (/tv/.test(title) && this.state.social) this.state.social.followers += 100;
        if (/quotidiano|articolo/.test(title) && this.state.social) this.state.social.followers += 50;

        if (/dibattito/.test(title)) {
            if (Math.random() < 0.6) {
                pc.debateWins += 1;
                this.changeReputazione(8, 'nazionale');
                this.addWorkNotif('🎤 Dibattito Vinto', 'Hai sconfitto il rivale nel dibattito pubblico.', `Giorno ${this.state.day}`);
            } else {
                this.changeStat('stress', 8);
                this.addWorkNotif('🎤 Dibattito Difficile', 'Nessuna vittoria netta nel confronto pubblico.', `Giorno ${this.state.day}`);
            }
        }

        if (/raccolta fondi|fundraising/.test(title)) {
            pc.campaignFunds += 120;
        }

        if (/campagna|comizio|volantin|gazebo|firme/.test(title)) {
            if (pc.campaignLastDay === this.state.day - 1 || pc.campaignLastDay === this.state.day) {
                pc.campaignStreak += 1;
            } else {
                pc.campaignStreak = 1;
            }
            pc.campaignLastDay = this.state.day;
        }

        this.evaluatePoliticalCareerPromotion();
    },

    evaluatePoliticalCareerPromotion() {
        this.ensurePoliticalCareerStructures();
        const pc = this.state.politicalCareer;
        const repL = this.state.reputazioneLocale;
        const repN = this.state.reputazioneNazionale;
        const allies = this.getActiveAlliances ? this.getActiveAlliances().length : 0;

        if (pc.level === 0 && repL >= 30 && pc.politicalTasksCompleted >= 10 && pc.progress >= 100 && pc.signaturesCollected >= 500) {
            pc.level = 1;
            this.addWorkNotif('🏛️ Promozione Politica', `Sei diventato ${this.getPoliticalRoleLabel(pc.level)}.`, `Giorno ${this.state.day}`);
            this.emit('political-career-promotion', { level: pc.level });
            return;
        }

        if (pc.level === 1) {
            const hasList = (this.state.contacts || []).filter(c => c.relation >= 50 && !c.betrayed).length >= 3;
            if (repL >= 50 && repN >= 20 && allies >= 2 && hasList && pc.campaignFunds >= 500 && pc.campaignStreak >= 5) {
                pc.localElectionWon = true;
                pc.level = 2;
                this.addWorkNotif('🗳️ Elezioni Locali', `Hai vinto le elezioni: ora sei ${this.getPoliticalRoleLabel(pc.level)}.`, `Giorno ${this.state.day}`);
                this.emit('political-career-promotion', { level: pc.level });
                return;
            }
        }

        if (pc.level === 2) {
            const factionSupport = !!(this.state.faction && this.state.faction.current);
            if (repL >= 70 && repN >= 40 && pc.nationalTasksCompleted >= 3 && factionSupport && !this.hasRecentScandal(10)) {
                pc.cooptedByParty = true;
                pc.level = 3;
                this.addWorkNotif('🏛️ Cooptazione', `Il partito ti co-opta: sei diventato ${this.getPoliticalRoleLabel(pc.level)}.`, `Giorno ${this.state.day}`);
                this.emit('political-career-promotion', { level: pc.level });
                return;
            }
        }

        if (pc.level === 3) {
            if (repL >= 90 && repN >= 60 && pc.campaignFunds >= 2000 && allies >= 5 && pc.debateWins >= 1) {
                pc.level = 4;
                this.addWorkNotif('🏆 Vittoria Elettorale', `Hai raggiunto il vertice: ${this.getPoliticalRoleLabel(pc.level)}.`, `Giorno ${this.state.day}`);
                this.emit('political-career-promotion', { level: pc.level });
            }
        }
    },

    ensureSocialStructures() {
        const s = this.state.social || {};
        this.state.social = {
            followers: typeof s.followers === 'number' ? s.followers : 80,
            trendOfDay: s.trendOfDay || 'crisi',
            trendKnown: !!s.trendKnown,
            socialManager: !!s.socialManager,
        };
    },

    ensureElectionStructures() {
        const e = this.state.election || {};
        const staff = e.staff || {};
        const office = e.office || {};
        this.state.election = {
            active: !!e.active,
            type: e.type || 'comunali',
            phase: e.phase || 'none',
            dayInPhase: e.dayInPhase || 0,
            campaignDays: e.campaignDays || 5,
            campaignAP: e.campaignAP || 0,
            baseConsensus: typeof e.baseConsensus === 'number' ? e.baseConsensus : 15,
            consensus: typeof e.consensus === 'number' ? e.consensus : 15,
            rivalConsensus: typeof e.rivalConsensus === 'number' ? e.rivalConsensus : 45,
            campaignBonus: e.campaignBonus || 0,
            debateBonus: e.debateBonus || 0,
            scandalMalus: e.scandalMalus || 0,
            staff: {
                socialManager: !!staff.socialManager,
                eventOrganizer: !!staff.eventOrganizer,
                spinDoctor: !!staff.spinDoctor,
                pollster: !!staff.pollster,
            },
            debateAnswered: e.debateAnswered || 0,
            debateScore: e.debateScore || 0,
            office: {
                active: !!office.active,
                role: office.role || '',
                dailyMoney: office.dailyMoney || 0,
                dailyRepLocal: office.dailyRepLocal || 0,
                dailyRepNational: office.dailyRepNational || 0,
            },
        };
    },

    rollTrendOfDay() {
        this.ensureSocialStructures();
        const trends = ['crisi', 'ambiente', 'economia', 'solidarieta'];
        this.state.social.trendOfDay = trends[Math.floor(Math.random() * trends.length)];
        this.state.social.trendKnown = false;
    },

    revealTrend(source) {
        this.ensureSocialStructures();
        this.state.social.trendKnown = true;
        const labels = {
            crisi: '🔥 Crisi politica',
            ambiente: '💚 Ambiente',
            economia: '💼 Economia',
            solidarieta: '❤️ Solidarietà',
        };
        this.addWorkNotif('📈 Trend del Giorno', `${labels[this.state.social.trendOfDay] || this.state.social.trendOfDay} (${source || 'analisi'}).`, `Giorno ${this.state.day}`);
    },

    getFollowersViralBonus() {
        this.ensureSocialStructures();
        const f = this.state.social.followers;
        if (f >= 2000) return { viral: 0.2, rep: 0.15 };
        if (f >= 500) return { viral: 0.1, rep: 0.1 };
        if (f >= 100) return { viral: 0.05, rep: 0.05 };
        return { viral: 0, rep: 0 };
    },

    getElectionSystemModifiers(type) {
        const rules = (typeof Nations !== 'undefined' && Nations.getElectionRules)
            ? Nations.getElectionRules(this.state.nation.id)
            : {};
        const system = rules.system || 'parlamentare_proporzionale';
        const coalitionRequired = !!rules.coalitionRequired;
        const modifiers = {
            system,
            coalitionRequired,
            thresholdFloor: type === 'nazionali' ? (rules.threshold || 0) : 0,
            rivalBaseAdj: 0,
            debateMultiplier: 1,
            prepDaysAdj: 0,
            campaignDaysAdj: 0,
        };

        if (system === 'semi_presidenziale') {
            modifiers.rivalBaseAdj = 4;
            modifiers.debateMultiplier = 1.35;
            modifiers.campaignDaysAdj = 1;
        } else if (system === 'westminster') {
            modifiers.rivalBaseAdj = 3;
            modifiers.debateMultiplier = 1.2;
            modifiers.prepDaysAdj = -1;
        } else if (system === 'cancellierato') {
            modifiers.rivalBaseAdj = -2;
            modifiers.debateMultiplier = 0.95;
            modifiers.prepDaysAdj = 1;
        }

        return modifiers;
    },

    getElectionCityProfile(type) {
        const city = this.state.city || {};
        const cityType = city.type || 'city';
        const population = city.population || (city.tier === 1 ? 'large' : (city.tier === 2 ? 'medium' : 'small'));
        const systemMods = this.getElectionSystemModifiers(type);
        const profile = {
            threshold: type === 'comunali' ? 50 : 40,
            baseConsensusAdj: 0,
            rivalBase: type === 'comunali' ? 45 : 40,
            prepDays: 3 + (systemMods.prepDaysAdj || 0),
            campaignDays: 5 + (systemMods.campaignDaysAdj || 0),
        };

        if (type === 'comunali') {
            if (cityType === 'municipality') {
                profile.threshold = population === 'small' ? 35 : (population === 'medium' ? 40 : 42);
                profile.baseConsensusAdj = population === 'small' ? 7 : (population === 'medium' ? 4 : 2);
                profile.rivalBase = population === 'small' ? 32 : (population === 'medium' ? 36 : 38);
                profile.campaignDays = population === 'small' ? 4 : 5;
            } else {
                profile.threshold = population === 'large' ? 50 : (population === 'medium' ? 45 : 40);
                profile.baseConsensusAdj = population === 'small' ? 2 : 0;
                profile.rivalBase = population === 'large' ? 48 : (population === 'medium' ? 43 : 39);
            }
        }

        if (type === 'regionali') {
            const momentum = this.state.politicalCareer.municipalMomentum || 0;
            profile.baseConsensusAdj += momentum;
            if (cityType === 'municipality' && momentum <= 0) profile.baseConsensusAdj -= 3;
            profile.threshold = 40;
        }
        if (type === 'nazionali' && cityType === 'municipality') {
            profile.baseConsensusAdj -= 4;
        }

        profile.threshold = Math.max(profile.threshold, systemMods.thresholdFloor || 0);
        profile.rivalBase += systemMods.rivalBaseAdj || 0;
        profile.prepDays = Math.max(2, profile.prepDays);
        profile.campaignDays = Math.max(4, profile.campaignDays);
        return profile;
    },

    startElectionCampaign(type) {
        this.ensureElectionStructures();
        this.ensurePoliticalCareerStructures();
        const e = this.state.election;
        if (e.active) return false;
        const rep = this.state.reputazioneLocale;
        let base = 15;
        if (rep >= 90) base = 75;
        else if (rep >= 70) base = 60;
        else if (rep >= 50) base = 45;
        else if (rep >= 30) base = 30;
        const cityProfile = this.getElectionCityProfile(type || 'comunali');
        base = Math.max(10, Math.min(90, base + cityProfile.baseConsensusAdj));

        e.active = true;
        e.type = type || 'comunali';
        e.phase = 'prep';
        e.dayInPhase = 0;
        e.prepDays = cityProfile.prepDays;
        e.campaignDays = cityProfile.campaignDays;
        e.campaignAP = 0;
        e.requiredThreshold = cityProfile.threshold;
        e.baseConsensus = base;
        e.consensus = base;
        e.rivalConsensus = Math.max(20, Math.min(80, cityProfile.rivalBase + Math.floor(Math.random() * 19)));
        e.campaignBonus = 0;
        e.debateBonus = 0;
        e.scandalMalus = 0;
        e.debateAnswered = 0;
        e.debateScore = 0;
        e.system = this.getElectionSystemModifiers(e.type).system;
        e.coalitionRequired = this.getElectionSystemModifiers(e.type).coalitionRequired;
        e.staff = { socialManager: false, eventOrganizer: false, spinDoctor: false, pollster: false };
        const coalitionNote = e.coalitionRequired ? ' Coalizioni decisive.' : ' Leadership personale centrale.';
        this.addWorkNotif('🗳️ Campagna Avviata', `Fase 1: Preparazione (${e.prepDays} giorni). Soglia vittoria: ${e.requiredThreshold}%. Sistema: ${e.system.replace(/_/g, ' ')}.${coalitionNote}`, `Giorno ${this.state.day}`);
        return true;
    },

    hireCampaignStaff(role) {
        this.ensureElectionStructures();
        const e = this.state.election;
        if (!e.active || e.phase !== 'prep') return false;
        const catalog = {
            socialManager: { cost: 100, label: 'Social Media Manager' },
            eventOrganizer: { cost: 150, label: 'Organizzatore eventi' },
            spinDoctor: { cost: 200, label: 'Spin doctor' },
            pollster: { cost: 100, label: 'Pollster' },
        };
        const item = catalog[role];
        if (!item || e.staff[role] || this.state.money < item.cost) return false;
        this.changeMoney(-item.cost);
        e.staff[role] = true;
        if (role === 'socialManager') this.state.social.socialManager = true;
        this.addWorkNotif('👥 Staff Campagna', `${item.label} assunto (-€${item.cost}).`, `Giorno ${this.state.day}`);
        return true;
    },

    runPreparationAction(actionId) {
        this.ensureElectionStructures();
        const e = this.state.election;
        if (!e.active || e.phase !== 'prep') return false;

        this.applyIdeologyConsistencyPenalty(`prep:${actionId}`);

        if (actionId === 'fundraise') {
            const gain = 50 + Math.floor(Math.random() * 151);
            this.changeMoney(gain);
            this.state.politicalCareer.campaignFunds += gain;
            this.addWorkNotif('💰 Fundraising', `Raccolti €${gain} per la campagna.`, `Giorno ${this.state.day}`);
            return true;
        }
        if (actionId === 'build-list') {
            const allies = (this.getActiveAlliances() || []).length;
            const systemMods = this.getElectionSystemModifiers(e.type);
            const bonus = systemMods.coalitionRequired
                ? (allies * 6) + (allies >= 2 ? 4 : 0)
                : Math.max(2, (allies * 3) + 3);
            e.consensus = Math.min(100, e.consensus + bonus);
            const contextLabel = systemMods.coalitionRequired
                ? `${allies} alleati utili alla coalizione`
                : `${allies} alleati, ma conta soprattutto il profilo del leader`;
            this.addWorkNotif('📋 Lista Elettorale', `Lista costruita: bonus consenso +${bonus}% (${contextLabel}).`, `Giorno ${this.state.day}`);
            return true;
        }
        if (actionId === 'slogan') {
            const coherent = this.state.coherence >= 60;
            if (coherent) {
                this.changeStat('coherence', 5);
                e.consensus = Math.min(100, e.consensus + 4);
                this.addWorkNotif('🪧 Slogan', 'Slogan coerente con la tua linea: Coerenza +5.', `Giorno ${this.state.day}`);
            } else {
                this.changeStat('coherence', -3);
                this.addWorkNotif('🪧 Slogan', 'Slogan poco credibile: Coerenza -3.', `Giorno ${this.state.day}`);
            }
            return true;
        }
        return false;
    },

    runCampaignAction(actionId) {
        this.ensureElectionStructures();
        const e = this.state.election;
        if (!e.active || e.phase !== 'campagna') return false;
        if (e.campaignAP <= 0) return false;
        e.campaignAP -= 1;

        this.applyIdeologyConsistencyPenalty(`campaign:${actionId}`);

        const spin = e.staff.spinDoctor ? 0.5 : 1;
        const org = e.staff.eventOrganizer ? 1.2 : 1;
        const socialMgr = e.staff.socialManager ? 1.5 : 1;
        let delta = 0;

        if (actionId === 'comizio') {
            delta = Math.round(5 * org);
            e.consensus += delta;
            this.changeStat('stanchezza', 10);
        } else if (actionId === 'volantinaggio') {
            delta = 2;
            e.consensus += delta;
            this.addWorkNotif('📢 Campagna', 'Volantinaggio completato: +1 rete locale.', `Giorno ${this.state.day}`);
        } else if (actionId === 'tv') {
            delta = 8;
            e.consensus += delta;
            this.changeStat('stress', Math.round(15 * spin));
            this.changeReputazione(4, 'nazionale');
        } else if (actionId === 'post-virale') {
            const roll = 3 + Math.floor(Math.random() * 13);
            delta = Math.round(roll * socialMgr);
            e.consensus += delta;
        } else if (actionId === 'elettori') {
            delta = 3;
            e.consensus += delta;
            (this.state.contacts || []).slice(0, 3).forEach(c => c.relation = Math.min(100, c.relation + 2));
        } else if (actionId === 'attacco') {
            delta = 4;
            e.consensus += delta;
            const boomerangChance = e.staff.spinDoctor ? 0.1 : 0.2;
            if (Math.random() < boomerangChance) {
                e.consensus -= 6;
                this.changeReputazione(-4);
                this.addWorkNotif('⚠️ Boomerang', 'L\'attacco all\'avversario ti si ritorce contro.', `Giorno ${this.state.day}`);
            }
        }

        if (e.consensus > 100) e.consensus = 100;
        if (e.consensus < 0) e.consensus = 0;
        this.addWorkNotif('🗳️ Azione Campagna', `Azione ${actionId}: consenso +${delta}.`, `Giorno ${this.state.day}`);
        return true;
    },

    runDebateChoice(choice) {
        this.ensureElectionStructures();
        const e = this.state.election;
        if (!e.active || e.phase !== 'dibattito') return false;
        if (e.debateAnswered >= 3) return false;

        this.applyIdeologyConsistencyPenalty(`debate:${choice}`);

        if (choice === 'program') {
            e.debateScore += 2;
            e.consensus += 5;
            this.changeStat('coherence', 3);
        } else if (choice === 'attack') {
            e.debateScore += 1;
            e.consensus += 8;
            this.changeStat('coherence', -5);
            if (Math.random() < 0.3) e.consensus -= 5;
        } else {
            e.debateScore += 2;
            e.consensus += 3;
            this.changeStat('coherence', 10);
            e.consensus -= 2;
        }
        e.debateAnswered += 1;
        if (e.consensus > 100) e.consensus = 100;
        if (e.consensus < 0) e.consensus = 0;

        if (e.debateAnswered >= 3) {
            const debateMultiplier = this.getElectionSystemModifiers(e.type).debateMultiplier || 1;
            if (e.debateScore >= 6) {
                e.debateBonus = 0.1 * debateMultiplier;
                this.addWorkNotif('🎤 Dibattito', `Hai vinto il dibattito pubblico. Consenso +${Math.round(e.debateBonus * 100)}%.`, `Giorno ${this.state.day}`);
            } else if (e.debateScore >= 4) {
                e.debateBonus = 0.03 * debateMultiplier;
                this.addWorkNotif('🎤 Dibattito', `Pareggio nel dibattito. Consenso +${Math.round(e.debateBonus * 100)}%.`, `Giorno ${this.state.day}`);
            } else {
                e.debateBonus = -0.08 * debateMultiplier;
                this.changeStat('stress', 15);
                this.addWorkNotif('🎤 Dibattito', `Dibattito perso. Consenso ${Math.round(e.debateBonus * 100)}%, Stress +15.`, `Giorno ${this.state.day}`);
            }
        }
        return true;
    },

    resolveElectionVote() {
        this.ensureElectionStructures();
        const e = this.state.election;
        const system = this.getElectionSystem();
        const threshold = this.state.nation?.data?.electionThreshold || 40;
        const coalitionRequired = this.state.nation?.data?.coalitionRequired || false;

        const campaignBonus = Math.max(0, (e.consensus - e.baseConsensus) / 100);
        e.campaignBonus = campaignBonus;
        e.scandalMalus = this.hasRecentScandal(10) ? (e.staff?.spinDoctor ? 0.06 : 0.12) : 0;
        const allies = this.getActiveAlliances ? this.getActiveAlliances().length : 0;
        const systemBonus = coalitionRequired
            ? Math.min(0.15, allies * 0.03)
            : (allies === 0 ? 0.06 : 0.02);

        const finalScore = e.baseConsensus * (1 + campaignBonus) * (1 + e.debateBonus) * (1 - e.scandalMalus) * (1 + systemBonus);
        const rivalScore = e.rivalConsensus;
        let won = false;

        switch (system) {
            case 'parlamentare_proporzionale':
                if (finalScore >= threshold && finalScore >= rivalScore) {
                    won = !(coalitionRequired && allies < 2);
                }
                break;
            case 'semi_presidenziale':
                if (finalScore >= 50) won = true;
                else if (finalScore > rivalScore) won = true;
                break;
            case 'cancellierato_federale':
                if (finalScore >= 5 && finalScore >= rivalScore) {
                    won = !coalitionRequired || allies >= 1;
                }
                break;
            case 'westminster_maggioritario':
                // Simula il vantaggio territoriale del first-past-the-post.
                won = finalScore > (rivalScore * 0.9);
                break;
            default:
                won = finalScore >= threshold && finalScore >= rivalScore;
        }

        if (won) {
            let office;
            if (system === 'semi_presidenziale') office = { role: 'Président', dailyMoney: 200, dailyRepLocal: 10, dailyRepNational: 15 };
            else if (system === 'cancellierato_federale') office = { role: 'Bundeskanzler', dailyMoney: 180, dailyRepLocal: 8, dailyRepNational: 12 };
            else if (system === 'westminster_maggioritario') office = { role: 'Prime Minister', dailyMoney: 170, dailyRepLocal: 7, dailyRepNational: 14 };
            else office = { role: 'Presidente del Consiglio', dailyMoney: 150, dailyRepLocal: 5, dailyRepNational: 10 };
            e.office = { ...office, active: true };
            const winMsg = (typeof Localization !== 'undefined' && Localization.translate)
                ? Localization.translate('election.won', { role: office.role })
                : `Hai vinto! Ruolo: ${office.role}.`;
            this.addWorkNotif('🏆 Elezioni', winMsg, `Giorno ${this.state.day}`);
            this.changeReputazione(10);
            this.changeReputazione(8, 'nazionale');
        } else {
            const gap = Math.max(0, rivalScore - finalScore);
            if (gap < 5) {
                this.changeReputazione(-5);
                this.changeStat('morale', -10);
            } else if (gap <= 15) {
                this.changeReputazione(-12);
                this.changeStat('stress', 15);
            } else {
                this.changeReputazione(-25);
                if (Math.random() < 0.2) this.state.flags.politicalBlockedTurns = Math.max(this.state.flags.politicalBlockedTurns, 3);
            }
            const loseMsg = (typeof Localization !== 'undefined' && Localization.translate)
                ? Localization.translate('election.lost', { score: finalScore.toFixed(1), rival: rivalScore.toFixed(1) })
                : `Hai perso (${finalScore.toFixed(1)}% vs ${rivalScore.toFixed(1)}%).`;
            this.addWorkNotif('📉 Elezioni', loseMsg, `Giorno ${this.state.day}`);
        }
    },

    advanceElectionPhaseDaily() {
        this.ensureElectionStructures();
        const e = this.state.election;
        if (!e.active) return;

        e.dayInPhase += 1;
        if (e.phase === 'prep' && e.dayInPhase >= (e.prepDays || 3)) {
            e.phase = 'campagna';
            e.dayInPhase = 0;
            e.campaignAP = 2;
            this.addWorkNotif('🗳️ Fase 2', `Inizia la campagna elettorale (${e.campaignDays || 5} giorni).`, `Giorno ${this.state.day}`);
        } else if (e.phase === 'campagna') {
            e.campaignAP = 2;
            if (e.dayInPhase >= e.campaignDays) {
                e.phase = 'dibattito';
                e.dayInPhase = 0;
                e.debateAnswered = 0;
                e.debateScore = 0;
                this.addWorkNotif('🎤 Fase 3', 'Giorno del dibattito pubblico.', `Giorno ${this.state.day}`);
            }
        } else if (e.phase === 'dibattito' && e.dayInPhase >= 1) {
            e.phase = 'voto';
            e.dayInPhase = 0;
            this.addWorkNotif('🗳️ Fase 4', 'Giorno del voto.', `Giorno ${this.state.day}`);
        } else if (e.phase === 'voto' && e.dayInPhase >= 1) {
            this.resolveElectionVote();
            e.phase = 'post';
            e.dayInPhase = 0;
            this.addWorkNotif('📌 Post-Elezione', 'Campagna terminata.', `Giorno ${this.state.day}`);
        } else if (e.phase === 'post' && e.dayInPhase >= 1) {
            e.active = false;
            e.phase = 'none';
            e.dayInPhase = 0;
        }
    },

    hasImprovement(id) {
        return this.state.homeImprovements.includes(id);
    },

    buyImprovement(id) {
        const item = this.HOME_IMPROVEMENTS_CATALOG.find(i => i.id === id);
        if (!item || this.hasImprovement(id) || this.state.money < item.cost) return false;
        this.changeMoney(-item.cost);
        this.state.homeImprovements.push(id);
        this.emit('improvement-bought', { id });
        return true;
    },

    addDiaryEntry(title, icon) {
        const entry = {
            id: `diary_${this.state.day}_${Date.now()}`,
            title,
            icon,
            day: this.state.day,
            coherenceRecover: 5 + Math.floor(Math.random() * 6),
            used: false,
        };
        this.state.diary.push(entry);
        this.emit('diary-entry', entry);
    },

    useDiaryEntry(entryId) {
        const entry = this.state.diary.find(e => e.id === entryId);
        if (!entry || entry.used) return false;
        entry.used = true;
        this.changeStat('coherence', entry.coherenceRecover);
        this.changeStat('morale', 5);
        this.emit('diary-used', entry);
        return true;
    },

    addUrgentMessage(from, text, type) {
        const msg = {
            id: `urg_${Date.now()}`,
            from,
            text,
            type: type || 'info', // 'ally', 'enemy', 'boss', 'info'
            day: this.state.day,
            handled: false,
        };
        this.state.urgentMessages.unshift(msg);
        if (this.state.urgentMessages.length > 20) this.state.urgentMessages.pop();
        if (msg.type === 'enemy') this.markPoliticalScandal();
        this.emit('urgent-message', msg);
        return msg;
    },

    promoteCareer() {
        const c = this.state.career;
        if (c.level >= this.CAREER_LEVELS.length - 1) return false;
        c.level++;
        c.promotionProgress = 0;
        this.addDiaryEntry(`Promosso a ${this.getCareerLevel().label}!`, '🎉');
        this.emit('career-promotion', { level: c.level });
        return true;
    },

    // === LISTENERS ===
    listeners: {},
    on(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
    },
    emit(event, data) {
        (this.listeners[event] || []).forEach(fn => fn(data));
    },

    // === DATE HELPERS ===
    getCurrentDate() {
        const d = new Date(this.state.calendar.baseDate);
        d.setDate(d.getDate() + this.state.calendar.dayOffset);
        return d;
    },
    getDateString() {
        const d = this.getCurrentDate();
        const dayName = this.DAYS_IT[d.getDay()];
        const dayNum = d.getDate();
        const month = this.MONTHS_IT[d.getMonth()];
        const year = d.getFullYear();
        return `${dayName} ${dayNum} ${month} ${year}`;
    },
    getTimeLabel() { return this.TIME_LABELS[this.state.calendar.timeOfDay]; },
    getTimeIcon() { return this.TIME_ICONS[this.state.calendar.timeOfDay]; },

    // === ACTION POINTS ===
    hasActionPoints(cost) { return this.state.actionPoints >= (cost || 1); },
    spendActionPoint(cost) {
        cost = cost || 1;
        if (this.state.actionPoints < cost) return false;
        this.state.actionPoints -= cost;
        this.emit('ap-change', { ap: this.state.actionPoints });
        return true;
    },

    // === PHONE ACTIONS (2 per time slot) ===
    hasPhoneActions(cost) { return this.state.phoneActions >= (cost || 1); },
    spendPhoneAction(cost) {
        cost = cost || 1;
        if (this.state.phoneActions < cost) return false;
        this.state.phoneActions -= cost;
        this.emit('phone-ap-change', { phoneAP: this.state.phoneActions });
        return true;
    },

    // === STATS HELPERS ===
    changeStat(stat, delta) {
        if (this.state.stats[stat] !== undefined) {
            const old = this.state.stats[stat];
            this.state.stats[stat] = Math.max(0, Math.min(100, old + delta));
            this.emit('stat-change', { stat, old, value: this.state.stats[stat], delta });
        } else if (stat === 'coherence') {
            const old = this.state.coherence;
            this.state.coherence = Math.max(0, Math.min(100, old + delta));
            this.emit('stat-change', { stat, old, value: this.state.coherence, delta });
        } else if (stat === 'reputazione') {
            const old = this.state.reputazione;
            this.state.reputazione = Math.max(0, Math.min(100, old + delta));
            this.emit('stat-change', { stat, old, value: this.state.reputazione, delta });
        }
        this.checkGameOver();
    },

    changeAttribute(attr, delta) {
        if (this.state.attributes[attr] !== undefined) {
            const old = this.state.attributes[attr];
            this.state.attributes[attr] = Math.max(0, Math.min(100, old + delta));
            this.emit('attr-change', { attr, old, value: this.state.attributes[attr], delta });
        }
    },

    changeReputazione(delta, scope) {
        const ideoClass = this.getIdeologyClass();
        const floor = ideoClass.consensusFloor || 0;

        if (scope === 'nazionale') {
            const old = this.state.reputazioneNazionale;
            this.state.reputazioneNazionale = Math.max(0, Math.min(100, old + delta));
            this.emit('stat-change', { stat: 'reputazioneNazionale', old, value: this.state.reputazioneNazionale, delta });
        } else {
            // Default: locale (also updates reputazione alias)
            const old = this.state.reputazioneLocale;
            this.state.reputazioneLocale = Math.max(floor, Math.min(100, old + delta));
            this.state.reputazione = this.state.reputazioneLocale; // keep alias in sync
            this.emit('stat-change', { stat: 'reputazione', old, value: this.state.reputazioneLocale, delta });
        }
    },

    changeMoney(delta) {
        this.state.money += delta;
        this.emit('money-change', { value: this.state.money, delta });
        this.checkGameOver();
    },

    changeNation(nationId) {
        if (!nationId || typeof Nations === 'undefined' || !Nations.getNation) return false;
        const oldNation = this.state.nation.id;
        const newNationObj = Nations.getNation(nationId);
        if (!newNationObj) return false;

        this.state.nation.id = nationId;
        this.state.nation.name = newNationObj.name;
        this.state.nation.language = newNationObj.language;

        Nations.currentNation = newNationObj;
        this.emit('nation-change', { oldNation, newNation: nationId, nationObj: newNationObj });
        this.addWorkNotif('🌍 Trasferimento', `Trasferito in ${newNationObj.name}.`, `Giorno ${this.state.day}`);
        return true;
    },

    esc(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    checkGameOver() {
        const s = this.state.stats;
        if (s.stanchezza >= 100) {
            this.triggerGameOver('Sei crollato per la stanchezza. Non hai più energia per andare avanti.');
        } else if (s.stress >= 100) {
            this.triggerGameOver('Lo stress ti ha sopraffatto. Hai avuto un esaurimento nervoso.');
        } else if (this.state.money < -800) {
            this.triggerGameOver('I debiti sono troppi. I creditori bussano alla porta. Game Over finanziario.');
        } else if (s.salute <= 0) {
            this.triggerGameOver('La tua salute è crollata. Sei stato ricoverato in ospedale.');
        } else if (this.state.coherence <= 0) {
            this.triggerGameOver('Hai perso ogni coerenza. Il partito ti ha espulso per inaffidabilità totale.');
        }

        // === CONDIZIONI DI VITTORIA ===
        if (this.state.career.level >= 3) {
            this.triggerVictory('Sei stato nominato Direttore! Hai scalato la vetta del potere aziendale. La tua influenza è inarrestabile.');
        } else if (this.state.reputazione >= 95 && this.state.money >= 2000) {
            this.triggerVictory('Sei ricco e amato dal popolo. Le prossime elezioni sono tue! Il Partito ti acclama come leader.');
        } else if (this.state.reputazione >= 90 && this.state.coherence >= 90 && this.state.day >= 30) {
            this.triggerVictory('Coerenza e consenso altissimi! Il segretario nazionale ti vuole come candidato alle elezioni regionali.');
        }
        // === FINALI MAFIA ===
        const m = this.state.mafia;
        if (m.rischioIndagini >= 100) {
            this.triggerGameOver('Le manette scattano all\'alba. La Guardia di Finanza ti arresta per associazione mafiosa. La tua carriera politica finisce in cella.');
        }
        if (m.rank >= 4 && m.daysAsSocio >= 100) {
            this.triggerVictory('🏴 IL BOSS RISPETTATO — Nessuno osa più toccarti. Controlli la città dall\'ombra. Ma a quale prezzo?');
        }
    },

    triggerGameOver(reason) {
        this.state.screen = 'gameover';
        this.emit('gameover', { reason, day: this.state.day, stats: { ...this.state.stats }, money: this.state.money, attributes: { ...this.state.attributes }, reputazione: this.state.reputazione });
    },

    triggerVictory(reason) {
        this.state.screen = 'victory';
        this.emit('victory', { reason, day: this.state.day, stats: { ...this.state.stats }, money: this.state.money, attributes: { ...this.state.attributes }, reputazione: this.state.reputazione, coherence: this.state.coherence });
    },

    // === TIME ADVANCEMENT ===
    getActionPointCap() {
        const st = this.state.stats || {};
        const habitTraits = (this.state.lifestyle && this.state.lifestyle.habitTraits) || {};
        let cap = 3;
        if (this.state.flags && this.state.flags.healthPenalty) cap -= 1;
        if ((st.stanchezza || 0) >= 78) cap -= 1;
        if ((st.stress || 0) >= 80) cap -= 1;
        if ((st.morale || 0) >= 78) cap += 1;
        if (habitTraits.disciplina && habitTraits.disciplina.active) cap += 1;
        return Math.max(1, Math.min(4, cap));
    },

    getPhoneActionCap() {
        const st = this.state.stats || {};
        let cap = 2;
        if ((st.stanchezza || 0) >= 80) cap -= 1;
        if ((st.stress || 0) >= 85) cap -= 1;
        if ((this.state.social && this.state.social.followers || 0) >= 1500) cap += 1;
        if ((st.morale || 0) >= 80) cap += 1;
        return Math.max(1, Math.min(3, cap));
    },

    advanceTime() {
        const cal = this.state.calendar;
        cal.timeOfDay++;
        if (cal.timeOfDay > 2) {
            cal.timeOfDay = 0;
            cal.dayOffset++;
            this.state.day++;
            this.onNewDay();
        }

        // Reset action points every time slot
        this.state.actionPoints = this.getActionPointCap();
        this.emit('ap-change', { ap: this.state.actionPoints });
        if (cal.timeOfDay === 0 && this.state.actionPoints < 2) {
            this.addWorkNotif('🤒 Ritmo in Calo', `Condizione psicofisica fragile: oggi parti con ${this.state.actionPoints} PA.`, `Giorno ${this.state.day}`);
        }

        // Time-of-day effects (balanced: morning recovery increased)
        if (cal.timeOfDay === 0) {
            this.changeStat('stanchezza', -30);
            this.changeStat('stress', -10);
            this.changeStat('salute', 3);
        } else if (cal.timeOfDay === 1) {
            this.changeStat('stanchezza', 3);
        } else if (cal.timeOfDay === 2) {
            this.changeStat('stanchezza', 5);
            // Spese quotidiane (cibo, trasporti)
            const dailyCost = 8;
            if (this.state.money >= dailyCost) {
                this.changeMoney(-dailyCost);
            } else {
                // Se non hai soldi per mangiare, perdi salute
                this.changeStat('salute', -5);
                this.changeStat('stress', 8);
                this.addWorkNotif('🍽️ Fame', 'Non hai soldi per la cena. Salute -5, Stress +8.', `Giorno ${this.state.day}`);
            }
        }

        // Reset phone actions every time slot
        this.state.phoneActions = this.getPhoneActionCap();
        this.emit('phone-ap-change', { phoneAP: this.state.phoneActions });

        if (this.state.flags.politicalBlockedTurns > 0) {
            this.state.flags.politicalBlockedTurns = Math.max(0, this.state.flags.politicalBlockedTurns - 1);
            if (this.state.flags.politicalBlockedTurns === 0) {
                this.addWorkNotif('✅ Blocco Politico Terminato', 'Puoi tornare a svolgere incarichi politici.', `Giorno ${this.state.day}`);
            }
        }

        this.emit('time-advance', {
            day: this.state.day,
            timeOfDay: cal.timeOfDay,
            dateString: this.getDateString(),
            timeLabel: this.getTimeLabel(),
        });

        if (Math.random() < 0.25) {
            this.emit('random-event', { day: this.state.day });
        }
    },

    onNewDay() {
        this.ensureDebtStructures();
        this.ensureAllianceStructures();
        this.ensureDelayedStructures();
        this.ensurePoliticalCareerStructures();
        this.ensureSocialStructures();
        this.ensureElectionStructures();
        this.initCityFlags();
        this.processDelayedConsequences();
        this.reevaluateAlliancesForIdeologyChange();

        // Guided onboarding for first days to reduce cognitive overload.
        if ((this.state.flags.onboardingStep || 0) < 3) {
            const step = this.state.flags.onboardingStep || 0;
            if (step === 0) {
                this.addWorkNotif('🧭 Guida Giorno 1', 'Priorita: completa 1 task lavoro e controlla Casa > Economia.', `Giorno ${this.state.day}`);
            } else if (step === 1) {
                this.addWorkNotif('🧭 Guida Giorno 2', 'Apri SmartPolitica: manda un messaggio a un contatto e pubblica un post.', `Giorno ${this.state.day}`);
            } else if (step === 2) {
                this.addWorkNotif('🧭 Guida Giorno 3', 'Vai su Mondo > Luoghi per costruire rete e sbloccare opportunita territoriali.', `Giorno ${this.state.day}`);
            }
            this.state.flags.onboardingStep = step + 1;
        }

        this.rollTrendOfDay();
        if (this.state.lifestyle && Array.isArray(this.state.lifestyle.upgrades) && this.state.lifestyle.upgrades.includes('bussola-politica')) {
            this.revealTrend('Bussola Politica');
        }
        this.advanceElectionPhaseDaily();
        this.state.contacts.forEach(c => {
            if (c.relation > 0) c.relation = Math.max(0, c.relation - 2);
            // Favorites auto-demote: if favorited but relation drops below 25
            if (c.favorite && c.relation < 25) {
                c.favorite = false;
                this.addUrgentMessage(c.name, `${c.name} non si sente più tra i tuoi preferiti. Relazione trascurata!`, 'info');
            }
        });
        if (this.state.partner) {
            this.state.partner.support = Math.max(0, this.state.partner.support - 3);
            this.state.partner.tension = Math.min(100, this.state.partner.tension + 2);
            // Partner becomes burden if tension too high
            if (this.state.partner.tension > 80 && this.state.partner.support < 20) {
                this.state.partner.isBurden = true;
                this.changeStat('stress', 5);
            }
            // Partner neglect → public scandal & breakup
            if (this.state.partner.tension >= 95 && this.state.partner.support <= 5) {
                this.addUrgentMessage(this.state.partner.name, 'Ti ha lasciato! Lo scandalo della rottura è finito sui giornali.', 'enemy');
                this.changeReputazione(-12);
                this.changeStat('stress', 20);
                this.changeStat('morale', -15);
                this.state.partner = null;
            }
        }
        const overdueBills = this.state.bills.filter(b => !b.paid && !b.installmentPlan && this.state.day > b.dueDay);
        if (overdueBills.length > 0) {
            this.state.flags.billsUnpaid = overdueBills.length;
            if (overdueBills.length >= 2) {
                this.state.flags.lightDimmed = true;
                this.state.flags.phoneLocked = true;
            }
            // +8 stress, -3 rep, -5 coherence per overdue bill
            overdueBills.forEach(() => {
                this.changeStat('stress', 8);
                this.changeReputazione(-3);
                this.changeStat('coherence', -5);
            });

            // Eviction: if rent unpaid 2+ consecutive billing cycles
            const unpaidRent = overdueBills.filter(b => b.name === 'Affitto');
            if (unpaidRent.length > 0) {
                this.state.flags.consecutiveUnpaidRent++;
            }
            if (this.state.flags.consecutiveUnpaidRent >= 2 && !this.state.flags.evicted) {
                this.state.flags.evicted = true;
                this.addUrgentMessage('Padrone di Casa', 'SFRATTO! Non paghi da 2 mesi. Dormi in ufficio al partito.', 'boss');
                this.emit('eviction', {});
            }

            if (!this.hasDelayedConsequence('admin-fine-overdue')) {
                const fine = 80 + (overdueBills.length * 25);
                this.scheduleDelayedConsequence(2, 'Sanzione amministrativa utenze', 'admin-fine-overdue', { amount: fine });
            }
        } else {
            this.state.flags.phoneLocked = false;
            this.state.flags.consecutiveUnpaidRent = 0;
        }

        const debtLoad = (this.state.debt || 0) + (overdueBills.length * 120);
        if (debtLoad > 0) {
            this.state.flags.debtPressure = Math.min(6, (this.state.flags.debtPressure || 0) + 1);

            if (debtLoad >= 450 && this.state.day !== this.state.flags.lastDebtSocialHitDay) {
                const contacts = (this.state.contacts || []).slice().sort(() => Math.random() - 0.5).slice(0, 2);
                contacts.forEach(c => {
                    c.relation = Math.max(0, c.relation - 2);
                });
                if (contacts.length > 0) {
                    this.addWorkNotif('📉 Voce di Debiti', 'In citta girano voci sui tuoi pagamenti in ritardo. Alcuni contatti si allontanano.', `Giorno ${this.state.day}`);
                    this.state.flags.lastDebtSocialHitDay = this.state.day;
                }
            }

            if (this.state.flags.debtPressure >= 2 && !this.hasDelayedConsequence('debt-collector-visit')) {
                this.scheduleDelayedConsequence(1 + Math.floor(Math.random() * 2), 'Pressione creditori', 'debt-collector-visit', { minAmount: 120 });
            }
            if (this.state.flags.debtPressure >= 4 && !this.hasDelayedConsequence('utility-legal-notice')) {
                this.scheduleDelayedConsequence(2, 'Preavviso legale utenze', 'utility-legal-notice', {});
            }
        } else {
            this.state.flags.debtPressure = Math.max(0, (this.state.flags.debtPressure || 0) - 2);
        }

        // Evicted: sleeping at party office penalties
        if (this.state.flags.evicted) {
            this.changeStat('stanchezza', 15);
            this.changeStat('stress', 10);
            this.changeReputazione(-3);
        }
        // Reset coffee
        this.state.coffee.maxPerDay = 3;
        this.state.coffee.uses = this.state.coffee.maxPerDay;
        this.state.coffee.drankToday = 0;
        this.emit('coffee-update', { uses: this.state.coffee.uses });

        // Home improvement bonuses on rest
        if (this.hasImprovement('isolamento')) this.changeStat('stanchezza', -5);
        if (this.hasImprovement('palestra-casa')) this.changeAttribute('muscoli', 2);
        if (this.hasImprovement('libreria')) this.changeAttribute('intelligenza', 2);
        if (this.hasImprovement('specchio')) this.changeAttribute('estetica', 1);
        if (this.hasImprovement('orto-casa')) this.changeStat('salute', 3);
        if (this.hasImprovement('camino-casa')) this.changeStat('stress', -4);
        if (this.hasImprovement('cantina-casa')) this.changeStat('morale', 4);
        if (this.hasImprovement('balcone-fiorito')) {
            this.changeAttribute('estetica', 1);
            this.changeStat('morale', 3);
        }
        if (this.hasImprovement('sala-riunioni')) {
            const c = (this.state.contacts || []).slice().sort((a, b) => (b.relation || 0) - (a.relation || 0))[0];
            if (c) c.relation = Math.min(100, (c.relation || 0) + 15);
        }
        if (this.hasImprovement('macchina-caffe')) {
            this.changeStat('stanchezza', -5);
            this.state.coffee.maxPerDay = 4; // extra coffee use
        }

        // 📍 City daily bonuses/maluses
        const city = this.state.city;
        if (city && city.bonus) {
            if (city.bonus.reputazione) this.changeReputazione(city.bonus.reputazione);
            if (city.bonus.money) this.changeMoney(city.bonus.money);
            if (city.bonus.carisma) this.changeAttribute('carisma', city.bonus.carisma);
            if (city.bonus.intelligenza) this.changeAttribute('intelligenza', city.bonus.intelligenza);
        }
        if (city && city.malus) {
            if (city.malus.stress) this.changeStat('stress', city.malus.stress);
        }
        this.applyCitySpecificEffects();

        if (city && (city.type || 'city') === 'municipality') {
            const roll = Math.random();
            if (roll < 0.06) {
                this.changeStat('morale', 4);
                this.changeReputazione(2);
                this.addWorkNotif('🎪 Fiera Paesana', 'Partecipi alla fiera locale: morale e consenso di prossimita aumentano.', `Giorno ${this.state.day}`);
                const c = (this.state.contacts || [])[Math.floor(Math.random() * (this.state.contacts || []).length)];
                if (c) c.relation = Math.min(100, c.relation + 3);
            } else if (roll < 0.09) {
                this.changeStat('stress', 8);
                this.addUrgentMessage('Protezione Civile', 'Allerta locale: servono volontari e presenza pubblica nel tuo comune.', 'info');
            }
        }

        // Ideology class daily effects
        const ideoClass = this.getIdeologyClass();
        if (ideoClass.mediaTarget && Math.random() < 0.2) {
            this.changeStat('stress', 8);
            this.addUrgentMessage('Giornalista', 'I media ti hanno preso di mira oggi. Stress +8.', 'enemy');
        }
        if (ideoClass.volatileVoters && Math.random() < 0.15) {
            const loss = -3 - Math.floor(Math.random() * 5);
            this.changeReputazione(loss);
            this.addUrgentMessage('Sondaggista', `Elettori volatili: hai perso ${Math.abs(loss)} punti consenso!`, 'info');
        }
        if (ideoClass.voltagabbanaRisk && Math.random() < ideoClass.voltagabbanaRisk) {
            this.changeStat('coherence', -8);
            this.addWorkNotif('⚠️ Voltagabbana', 'Ti accusano di incoerenza! Coerenza -8.', `Giorno ${this.state.day}`);
        }

        // Mentor risks
        if (this.state.flags && this.state.flags.lobbyFavors >= 3) {
            if (this.state.money >= 500) {
                this.changeMoney(-500);
                this.addWorkNotif('⚖️ Comitato Etico', 'Hai pagato €500 di sanzione per troppi favori lobbisti.', `Giorno ${this.state.day}`);
            } else {
                this.changeReputazione(-20);
                this.addWorkNotif('⚖️ Comitato Etico', 'Sanzione reputazionale: -20 reputazione.', `Giorno ${this.state.day}`);
            }
            this.state.flags.lobbyFavors = 0;
        }

        if (this.state.flags && this.state.flags.independentBoost && Math.random() < 0.12) {
            this.changeReputazione(-6);
            this.addWorkNotif('🛤️ Nessuna Copertura', 'Senza alleati forti, la crisi ti colpisce piu duramente.', `Giorno ${this.state.day}`);
        }

        const mentorState = this.state.flags && this.state.flags.mentor;
        if (mentorState && mentorState.trustedAlly) {
            this.changeReputazione(1, 'nazionale');
            this.changeStat('morale', 1);
        }
        if (mentorState && mentorState.rival && Math.random() < 0.35) {
            this.changeStat('stress', 4);
            this.changeReputazione(-2);
            this.addUrgentMessage('Ex Mentore', 'Il tuo ex mentore ti attacca pubblicamente: la tensione sale.', 'enemy');
        }

        this.applyMentorPassiveEffects();

        // Timed alliances can expire at day start if not renewed.
        this.expireTimedAlliances();

        // Alliance daily passive effects
        const allianceBonus = this.getAllianceBonusSummary();
        if (allianceBonus.morningMorale > 0) this.changeStat('morale', allianceBonus.morningMorale);
        if (allianceBonus.dailyHealth > 0) this.changeStat('salute', allianceBonus.dailyHealth);

        // Political daily perks
        const polLevel = this.getPoliticalLevel();
        if (polLevel.dailySalary > 0) {
            this.changeMoney(polLevel.dailySalary);
            this.addWorkNotif('🏛️ Stipendio Politico', `+€${polLevel.dailySalary} (${polLevel.label}).`, `Giorno ${this.state.day}`);
        }
        if (this.state.flags && this.state.flags.mentorBookPassive) {
            this.changeStat('coherence', 2);
        }
        if (this.state.election.office && this.state.election.office.active) {
            const office = this.state.election.office;
            if (office.dailyMoney > 0) this.changeMoney(office.dailyMoney);
            if (office.dailyRepLocal > 0) this.changeReputazione(office.dailyRepLocal);
            if (office.dailyRepNational > 0) this.changeReputazione(office.dailyRepNational, 'nazionale');
        }
        this.state.politicalCareer.politicalBonusAP = this.state.politicalCareer.level >= 1 ? 1 : 0;
        this.state.politicalCareer.scandalDays = this.state.politicalCareer.scandalDays.filter(d => this.state.day - d <= 10);
        this.evaluatePoliticalCareerPromotion();

        // Career: corruption check
        if (this.state.career.corrupted && Math.random() < 0.1) {
            this.changeStat('stress', 15);
            this.changeReputazione(-10);
            this.addUrgentMessage('Magistrato', 'Indagine per corruzione! La tua reputazione crolla.', 'enemy');
        }

        // 🔫 Mafia daily processing
        this.emit('mafia-daily', { day: this.state.day });
        if (this.hasImprovement('casa-blindata') && this.state.mafia && typeof this.state.mafia.rischioIndagini === 'number') {
            this.state.mafia.rischioIndagini = Math.max(0, Math.floor(this.state.mafia.rischioIndagini * 0.5));
        }

        // 🤝 Favors: expire old + maybe generate new
        if (typeof Favors !== 'undefined') {
            if (Favors.expireOldFavors) Favors.expireOldFavors();
            if (Favors.maybeGenerateFavor) Favors.maybeGenerateFavor();
        }

        this.emit('generate-tasks', { day: this.state.day });
        if (this.state.day % 5 === 0) {
            this.emit('generate-bills', { day: this.state.day });
        }
        // ====== DANGER THRESHOLD EFFECTS ======
        const st = this.state.stats;
        // Coerenza < 30: crisi d'identità → +10 stress/giorno
        if (this.state.coherence < 30 && this.state.coherence > 0) {
            this.changeStat('stress', 10);
            this.addWorkNotif('🧩 Crisi d\'Identità', 'La tua incoerenza ti tormenta. Stress +10.', `Giorno ${this.state.day}`);
        }
        // Salute <= 30: malessere critico → -1 PA al giorno
        if (st.salute <= 30) {
            this.state.flags.healthPenalty = true;
        } else {
            this.state.flags.healthPenalty = false;
        }
        // Morale < 30: contatti ti evitano, -20% relazione boost
        if (st.morale < 30) {
            this.state.contacts.forEach(c => {
                if (c.relation > 0) c.relation = Math.max(0, c.relation - 3);
            });
            this.addWorkNotif('😞 Morale Basso', 'I contatti ti evitano. Relazioni -3 extra.', `Giorno ${this.state.day}`);
        }
        // Reputazione < 20: partito ti isola
        if (this.state.reputazione < 20 || this.state.flags.politicalBlockedTurns > 0) {
            this.state.flags.politicalBlocked = true;
        } else {
            this.state.flags.politicalBlocked = false;
        }

        const avgRel = this.state.contacts.length > 0
            ? this.state.contacts.reduce((s, c) => s + c.relation, 0) / this.state.contacts.length : 50;
        if (avgRel < 30) this.changeStat('morale', -3);
        if (this.state.attributes.muscoli < 20) this.changeStat('salute', -2);

        this.evolveContactsDaily();

        // Emit new-day for daily summary
        this.emit('new-day', { day: this.state.day });
    },

    applyMentorPassiveEffects() {
        const mentorState = this.state.flags && this.state.flags.mentor;
        if (!mentorState || !mentorState.active) return;
        if (typeof Character === 'undefined' || !Character.getMentorData) return;

        const mentor = Character.getMentorData(mentorState.selectedId || mentorState.id);
        if (!mentor) return;

        if (typeof mentor.passiveEffect === 'function') {
            mentor.passiveEffect(this.state, mentorState);
        }

        if (typeof mentor.riskCondition === 'function' && mentor.riskCondition(this.state, mentorState)) {
            const pen = mentor.riskPenalty || {};
            if (pen.relazioneMentore) mentorState.relationship = Math.max(0, Math.min(100, mentorState.relationship + pen.relazioneMentore));
            if (pen.stress) this.changeStat('stress', pen.stress);
            if (pen.salute) this.changeStat('salute', pen.salute);
            if (pen.reputazione) this.changeReputazione(pen.reputazione);
            if (pen.coherence) this.changeStat('coherence', pen.coherence);
        }

        if (mentorState.relationship < 20) {
            mentorState.active = false;
            mentorState.specialUnlocked = false;
            mentorState.unlockedActionIds = [];
            this.addUrgentMessage('Mentore', `${mentor.name} ti ha abbandonato. Non riceverai più i suoi bonus.`, 'enemy');
        }
    },

    // Alias
    advanceDay() { this.advanceTime(); },

    // === SCREEN MANAGEMENT ===
    switchScreen(screen) {
        this.state.screen = screen;
        this.emit('screen-change', { screen });
    },

    // === INITIALIZATION ===
    init() {
        this.ensureDebtStructures();
        this.ensureAllianceStructures();
        this.ensureDelayedStructures();
        this.ensurePoliticalCareerStructures();
        this.ensureSocialStructures();
        this.ensureElectionStructures();
        this.initCityFlags();
        this.setupInitialContacts();
        this.setupInitialTasks();
        this.setupInitialBills();
        this.setupPartner();
               if (typeof Nations !== 'undefined' && Nations.init) {
                   Nations.init().catch(err => console.error('Nations init error:', err));
               }
        this.addWorkNotif('Benvenuto!', 'Il tuo primo giorno. Non deludere il partito.', 'Ora');
    },

    ensureDebtStructures() {
        if (!this.state.loans) {
            this.state.loans = { mortgage: null, activeInstallments: [] };
        }
        if (!Array.isArray(this.state.loans.activeInstallments)) {
            this.state.loans.activeInstallments = [];
        }
        if (!Object.prototype.hasOwnProperty.call(this.state, 'debt')) {
            this.state.debt = 0;
        }
        if (!Array.isArray(this.state.debtHistory)) {
            this.state.debtHistory = [];
        }
    },

    ensureAllianceStructures() {
        if (!Array.isArray(this.state.contacts)) return;
        this.state.contacts.forEach(c => {
            if (!c.alliance) {
                c.alliance = {
                    active: false,
                    typeId: null,
                    bonusKey: null,
                    bonusLabel: '',
                    sinceDay: 0,
                    expiresDay: 0,
                    renewals: 0,
                    endedDay: 0,
                    everFormed: false,
                };
            }
            if (typeof c.alliance.active !== 'boolean') c.alliance.active = false;
            if (c.alliance.active && !c.alliance.typeId) c.alliance.typeId = 'elettorale';
            if (!Number.isFinite(c.alliance.expiresDay)) c.alliance.expiresDay = 0;
            if (!Number.isFinite(c.alliance.renewals)) c.alliance.renewals = 0;
            if (!Number.isFinite(c.alliance.endedDay)) c.alliance.endedDay = 0;
            if (!Object.prototype.hasOwnProperty.call(c.alliance, 'everFormed')) c.alliance.everFormed = !!c.alliance.active;
        });
        if (!this.state.allianceLastIdeology) {
            this.state.allianceLastIdeology = this.state.character.ideology || '';
        }
    },

    ensureDelayedStructures() {
        if (!Array.isArray(this.state.delayedConsequences)) {
            this.state.delayedConsequences = [];
        }
    },

    scheduleDelayedConsequence(daysFromNow, label, handler, payload) {
        this.ensureDelayedStructures();
        this.state.delayedConsequences.push({
            id: `dc_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
            dueDay: this.state.day + Math.max(1, daysFromNow || 1),
            label: label || 'Conseguenza',
            handler: handler || 'none',
            payload: payload || {},
        });
    },

    hasDelayedConsequence(handler) {
        this.ensureDelayedStructures();
        return this.state.delayedConsequences.some(e => e.handler === handler);
    },

    processDelayedConsequences() {
        this.ensureDelayedStructures();
        const due = this.state.delayedConsequences.filter(e => e.dueDay <= this.state.day);
        if (due.length === 0) return;

        due.forEach(e => {
            if (e.handler === 'urgent-paid-someone-quality') {
                if (Math.random() < 0.3) {
                    this.state.career.promotionProgress = Math.max(0, this.state.career.promotionProgress - 5);
                    this.addWorkNotif('📉 Qualità Scarsa', 'Il report pagato a terzi era scadente. Carriera -5.', `Giorno ${this.state.day}`);
                } else {
                    this.addWorkNotif('✅ Qualità OK', 'Il report esterno è stato consegnato senza problemi.', `Giorno ${this.state.day}`);
                }
            } else if (e.handler === 'urgent-enemy-ignore-rebound') {
                if (Math.random() < 0.35) {
                    this.changeReputazione(-10);
                    this.addWorkNotif('🗞️ Prove Emesse', 'Il bluff non era un bluff: emergono prove contro di te. Reputazione -10.', `Giorno ${this.state.day}`);
                }
            } else if (e.handler === 'urgent-enemy-counter-react') {
                if (Math.random() < 0.3) {
                    this.changeStat('stress', 20);
                    this.addWorkNotif('⚔️ Escalation', 'Il rivale ha reagito alla contro-minaccia. Stress +20.', `Giorno ${this.state.day}`);
                }
            } else if (e.handler === 'mentor-event') {
                if (typeof Events !== 'undefined' && Events.triggerMentorEvent) {
                    Events.triggerMentorEvent(e.payload || {});
                }
            } else if (e.handler === 'admin-fine-overdue') {
                const stillOverdue = (this.state.bills || []).filter(b => !b.paid && !b.installmentPlan && this.state.day > b.dueDay);
                const fine = (e.payload && e.payload.amount) || 100;
                if (stillOverdue.length > 0) {
                    this.state.debt += fine;
                    this.changeStat('stress', 8);
                    this.changeReputazione(-4);
                    this.addWorkNotif('📮 Sanzione Utenze', `Arriva una sanzione da €${fine} per morosita.`, `Giorno ${this.state.day}`);
                } else {
                    this.changeStat('coherence', 2);
                    this.addWorkNotif('✅ Utenze Regolarizzate', 'Hai evitato la sanzione pagando in tempo.', `Giorno ${this.state.day}`);
                }
            } else if (e.handler === 'debt-collector-visit') {
                const ask = Math.max((e.payload && e.payload.minAmount) || 120, Math.ceil((this.state.debt || 0) * 0.08));
                if (this.state.money >= ask && Math.random() < 0.6) {
                    this.changeMoney(-ask);
                    this.state.debt = Math.max(0, this.state.debt - ask);
                    this.addWorkNotif('🤝 Accordo Creditori', `Paghi €${ask} e ottieni una tregua temporanea sui debiti.`, `Giorno ${this.state.day}`);
                } else {
                    this.state.debt += 90;
                    this.changeStat('stress', 12);
                    this.changeReputazione(-5);
                    this.addUrgentMessage('Recupero Crediti', 'Non hai coperto il dovuto: i creditori aumentano la pressione.', 'enemy');
                }
            } else if (e.handler === 'utility-legal-notice') {
                const stillCritical = (this.state.flags && this.state.flags.billsUnpaid >= 2) || (this.state.debt || 0) >= 700;
                if (stillCritical) {
                    this.changeStat('coherence', -6);
                    this.changeReputazione(-8);
                    this.changeStat('stress', 10);
                    this.state.flags.phoneLocked = true;
                    this.addWorkNotif('⚖️ Preavviso Legale', 'La tua situazione debitoria finisce in precontenzioso.', `Giorno ${this.state.day}`);
                } else {
                    this.addWorkNotif('📄 Pratica Archiviata', 'Il preavviso legale viene ritirato: situazione sotto controllo.', `Giorno ${this.state.day}`);
                }
            } else if (e.handler === 'agent-revenge') {
                const agent = (this.state.agents || []).find(a => a.id === (e.payload && e.payload.agentId));
                if (agent) {
                    this.addUrgentMessage(agent.name, `${agent.name} ha diffuso voci false su di te.`, 'enemy');
                    this.changeReputazione(-5);
                    if (typeof Agents !== 'undefined' && Agents.recordAgentMemory) {
                        Agents.recordAgentMemory(agent.id, 'revenge-executed', -2);
                    }
                }
            }
        });

        this.state.delayedConsequences = this.state.delayedConsequences.filter(e => e.dueDay > this.state.day);
    },

    getElectionSystem() {
        const nation = this.state.nation?.data;
        if (!nation) return 'parlamentare_proporzionale';
        return nation.politicalSystem || 'parlamentare_proporzionale';
    },

    getActiveAlliances() {
        this.ensureAllianceStructures();
        return (this.state.contacts || []).filter(c => c.alliance && c.alliance.active && !c.betrayed);
    },

    getAllianceBonusSummary() {
        const active = this.getActiveAlliances();
        const summary = {
            politicalMultiplier: 1,
            workFlatMoney: 0,
            socialRepFlat: 0,
            workFatigueReduction: 0,
            morningMorale: 0,
            dailyHealth: 0,
            shadowMoney: 0,
        };
        active.forEach(c => {
            const typeId = c.alliance.typeId;
            const key = c.alliance.bonusKey;

            if (typeId === 'elettorale') summary.politicalMultiplier *= 1.10;
            else if (typeId === 'finanziaria') summary.workFlatMoney += 20;
            else if (typeId === 'media') summary.socialRepFlat += 12;
            else if (typeId === 'sindacale') summary.workFatigueReduction += 0.25;
            else if (key === 'politico') summary.politicalMultiplier *= 1.15;
            else if (key === 'imprenditore') summary.workFlatMoney += 15;
            else if (key === 'giornalista') summary.socialRepFlat += 10;
            else if (key === 'sindacalista') summary.workFatigueReduction += 0.2;
            else if (key === 'pensionato') summary.morningMorale += 5;
            else if (key === 'infermiere') summary.dailyHealth += 5;
            else if (key === 'mafia') summary.shadowMoney += 50;
        });
        if (summary.workFatigueReduction > 0.8) summary.workFatigueReduction = 0.8;
        return summary;
    },

    expireTimedAlliances() {
        this.ensureAllianceStructures();
        (this.state.contacts || []).forEach(c => {
            if (!c.alliance || !c.alliance.active) return;
            if (!Number.isFinite(c.alliance.expiresDay) || c.alliance.expiresDay <= 0) return;
            if (this.state.day > c.alliance.expiresDay) {
                this.breakAlliance(c, 'scadenza accordo');
            }
        });
    },

    // ============================
    // MULTI-NATION SUPPORT METHODS
    // ============================

    /**
     * Carica i dati di una nazione e applica i modificatori globali
     * @param {string} nationId - ID della nazione (italy, france, germany, uk)
     */
    async loadNation(nationId) {
        if (typeof Nations === 'undefined') {
            console.warn('Nations module not available, skipping loadNation');
            return;
        }

        try {
            await Nations.init();
            const nation = Nations.getNation(nationId);
            if (!nation) {
                console.warn(`Nation ${nationId} not found, fallback to italy`);
                this.state.nation = { id: 'italy', name: 'Italia', language: 'italiano' };
                await this.loadMentorsForNation();
                return;
            }

            this.state.nation = {
                id: nation.id,
                name: nation.name,
                language: nation.language,
                code: nation.code,
                defaultCity: nation.defaultCity || nation.startingCity || null,
                data: nation,
            };

            if (!Array.isArray(this.state.visitedNations)) this.state.visitedNations = [];
            if (!this.state.visitedNations.includes(nation.id)) this.state.visitedNations.push(nation.id);

            this.applyNationModifiers();
            this.localizeIdeologies();
            await this.loadMentorsForNation();

            console.info(`Nation loaded: ${nation.name} (${nation.id})`);
        } catch (err) {
            console.error('Error loading nation:', err);
        }
    },

    async loadMentorsForNation() {
        try {
            const resp = await fetch('data/mentors.json');
            const allMentors = await resp.json();
            const nationId = (this.state.nation && this.state.nation.id) || 'italy';
            this.state.mentorsDB = allMentors[nationId] || allMentors.italy || null;
        } catch (err) {
            console.warn('Mentors DB load failed:', err);
            this.state.mentorsDB = null;
        }
    },

    applyNationModifiers() {
        const n = this.state.nation && this.state.nation.data;
        if (!n) return;
        const salaryMult = n.salaryMultiplier || 1;
        const rentMult = n.rentMultiplier || 1;
        const taxRate = n.taxRate || 0;
        this.state.salaryMultiplier = salaryMult;
        this.state.rentMultiplier = rentMult;
        this.state.taxRate = taxRate;
        // Backward compatibility for existing getters/usages.
        this.state._nationSalaryMultiplier = salaryMult;
        this.state._nationRentMultiplier = rentMult;
        this.state._nationTaxRate = taxRate;
        this.state.politicalSystem = n.politicalSystem || 'parlamentare_proporzionale';
    },

    localizeIdeologies() {
        const n = this.state.nation && this.state.nation.data;
        if (!n || !n.ideologies) return;

        for (let contact of (this.state.contacts || [])) {
            const ideologyKey = contact.ideology;
            const localized = n.ideologies[ideologyKey];
            if (localized) {
                contact.localIdeology = localized.localName;
                contact.localIcon = localized.icon;
                contact.ideologyDesc = localized.desc;
            }
        }
    },

    /**
     * Restituisce il nome localizzato di un'ideologia in base alla nazione corrente
     * @param {string} ideologyKey
     * @returns {string}
     */
    getLocalizedIdeology(ideologyKey) {
        const n = this.state.nation && this.state.nation.data;
        if (!n || !n.ideologies) return ideologyKey;

        const aliases = {
            'estrema-sinistra': 'radicale',
            'estrema-destra': 'estremistra',
        };
        const key = aliases[ideologyKey] || ideologyKey;
        const localized = n.ideologies[key];
        return (localized && localized.localName) ? localized.localName : ideologyKey;
    },

    /**
     * Cambia la nazione attuale (trasferimento internazionale)
     * Applica costi e conseguenze
     * @param {string} newNationId - ID della nazione di destinazione
     */
    changeNation(newNationId) {
        if (newNationId === this.state.nation.id) {
            console.warn('Already in that nation');
            return false;
        }

        const oldNationId = this.state.nation.id;

        const transferCost = typeof Nations !== 'undefined' && Nations.getInternationalTransferCost
            ? Nations.getInternationalTransferCost(this.state.nation.id, newNationId)
            : 2000;

        // Controlla se hai abbastanza soldi
        if (this.state.money < transferCost) {
            this.addWorkNotif('💼 Trasferimento Bloccato', `Servono €${transferCost} per trasferirsi.`, `Giorno ${this.state.day}`);
            return false;
        }

        // Applica costi e conseguenze
        this.changeMoney(-transferCost);
        this.changeStat('morale', -10); // Shock culturale
        this.changeStat('coherence', -15); // Adattamento

        // Trasferisciti nella nuova nazione
        this.loadNation(newNationId);

        // Perde contatti nella vecchia nazione
        const oldNationContacts = (this.state.contacts || []).filter(c => c.city);
        oldNationContacts.forEach(c => {
            c.relation = Math.max(0, c.relation - 20);
            if (c.relation === 0) {
                (this.state.contactsLost || []).push({
                    ...c,
                    originalCity: c.city,
                    lostDay: this.state.day,
                });
            }
        });

        this.addWorkNotif(
            '🌍 Trasferimento Internazionale',
            `Trasferito a ${this.state.nation.name}. Costo: €${transferCost}. Morale -10, Coerenza -15.`,
            `Giorno ${this.state.day}`
        );

        this.emit('nation-changed', { fromNation: oldNationId, toNation: newNationId });
        return true;
    },

    /**
     * Ottieni il moltiplicatore di stipendio della nazione attuale
     */
    getNationSalaryMultiplier() {
        return this.state._nationSalaryMultiplier || 1.0;
    },

    /**
     * Ottieni il moltiplicatore di affitto della nazione attuale
     */
    getNationRentMultiplier() {
        return this.state._nationRentMultiplier || 1.0;
    },

    /**
     * Ottieni l'aliquota fiscale della nazione attuale
     */
    getNationTaxRate() {
        return this.state._nationTaxRate || 0.25;
    },

    /**
     * Restituisce i ruoli di carriera localizzati della nazione attuale
     */
    getNationCareerRoles() {
        const n = this.state.nation.data;
        return n && n.careerRoles ? n.careerRoles : [];
    },

    /**
     * Restituisce la voce di carriera localizzata per il livello attuale
     */
    getNationCareerRoleForLevel(level) {
        const roles = this.getNationCareerRoles();
        return roles[Math.min(level || 0, roles.length - 1)] || 'Politico';
    },

    /**
     * Restituisce il nome localizzato del capo governo della nazione
     */
    getNationHeadOfGov() {
        const n = this.state.nation.data;
        return n ? n.headOfGov : 'Leader';
    },

    /**
     * Restituisce il nome localizzato dello stato della nazione
     */
    getNationHeadOfState() {
        const n = this.state.nation.data;
        return n ? n.headOfState : 'Head of State';
    },

    breakAlliance(contact, reason) {
        if (!contact || !contact.alliance || !contact.alliance.active) return;
        contact.alliance.active = false;
        contact.alliance.endedDay = this.state.day;
        const why = reason ? ` (${reason})` : '';
        this.addWorkNotif('💔 Alleanza Persa', `Alleanza con ${contact.name} terminata${why}.`, `Giorno ${this.state.day}`);
    },

    handleFavorNeglect(contact) {
        if (!contact || !contact.alliance || !contact.alliance.active) return;
        if (contact.relation < 50) {
            this.breakAlliance(contact, 'favore non ricambiato');
        }
    },

    reevaluateAlliancesForIdeologyChange() {
        this.ensureAllianceStructures();
        const current = this.state.character.ideology || '';
        const previous = this.state.allianceLastIdeology || '';
        if (current === previous) return;

        this.getActiveAlliances().forEach(c => {
            const stance = this.getCoalitionStance(current, c.ideology);
            if (stance === 'nemico') {
                this.breakAlliance(c, 'ideologia incompatibile');
            }
        });

        this.state.allianceLastIdeology = current;
        this.addWorkNotif('🧭 Riallineamento', 'Cambio ideologico: alleanze rivalutate automaticamente.', `Giorno ${this.state.day}`);
    },

    setupInitialContacts() {
        // Contacts start empty — you'll meet people through work, territory, and events
        this.state.contacts = [];
    },
    setupPartner() {
        // No partner at start — meet someone through territory exploration
        this.state.partner = null;
    },
    setupInitialTasks() {
        this.state.tasks.work = [
            { id: 'w1', name: 'Fai 8 ore di turno', reward: 80, energyCost: 20, done: false },
            { id: 'w2', name: 'Completa il report mensile', reward: 50, energyCost: 10, done: false },
            { id: 'w3', name: 'Riunione con il capo', reward: 30, energyCost: 15, done: false, stressAdd: 10 },
        ];
        this.state.tasks.political = [
            { id: 'p1', name: 'Organizza gazebo', reward: 0, energyCost: 25, done: false, coherenceBonus: 5 },
            { id: 'p2', name: 'Raccogli 100 firme', reward: 0, energyCost: 30, done: false, coherenceBonus: 8 },
            { id: 'p3', name: 'Volantinaggio serale', reward: 0, energyCost: 15, done: false, coherenceBonus: 3 },
        ];
    },
    setupInitialBills() {
        this.state.bills = [
            { id: 'b1', name: 'Affitto', amount: 250, dueDay: 7, paid: false, installmentPlan: null },
            { id: 'b2', name: 'Bolletta luce', amount: 45, dueDay: 9, paid: false, installmentPlan: null },
            { id: 'b3', name: 'Bolletta gas', amount: 35, dueDay: 9, paid: false, installmentPlan: null },
        ];
    },

    evolveContactsDaily() {
        const contacts = this.state.contacts || [];
        if (contacts.length === 0) return;

        contacts.forEach(c => {
            if (typeof c.loyalty !== 'number') c.loyalty = 50;
            if (c.relation >= 80) {
                c.loyalty = Math.min(100, c.loyalty + 1);
            } else if (c.relation <= 20) {
                c.loyalty = Math.max(0, c.loyalty - 2);
            }

            if (c.relation <= 10 && !c.betrayed && Math.random() < 0.2) {
                c.betrayed = true;
                this.addUrgentMessage(c.name, `${c.name} è diventato tuo rivale e ti sabota in giro.`, 'enemy');
            }
        });

        if (Math.random() < 0.25) {
            const target = contacts[Math.floor(Math.random() * contacts.length)];
            const swing = Math.random() < 0.5 ? -4 : 4;
            target.relation = Math.max(0, Math.min(100, target.relation + swing));
        }
    },

    addWorkNotif(title, body, time) {
        this.state.workNotifs.unshift({ title, body, time: time || `Giorno ${this.state.day}` });
        if (this.state.workNotifs.length > 10) this.state.workNotifs.pop();
        this.emit('work-notif', {});
    },

    // === TASK COMPLETION ===
    completeTask(type, taskId) {
        const list = this.state.tasks[type];
        const task = list.find(t => t.id === taskId);
        if (!task || task.done) return false;

        if (!this.spendActionPoint(1)) {
            this.emit('no-ap', { reason: 'Punti azione esauriti! Avanza il turno.' });
            return false;
        }

        task.done = true;
        this.changeStat('stanchezza', task.energyCost);

        if (task.reward > 0) {
            // Career salary bonus
            const careerBonus = this.getCareerLevel().salary > 80 ? Math.floor(task.reward * 0.3) : 0;
            // Tecnocrate work salary multiplier
            const ideoClass = this.getIdeologyClass();
            const techMultiplier = (type === 'work' && ideoClass.workSalaryMultiplier) ? ideoClass.workSalaryMultiplier : 1;
            const totalReward = Math.round((task.reward + careerBonus) * techMultiplier);
            this.changeMoney(totalReward);
            this.addWorkNotif('Stipendio parziale', `+€${totalReward} per "${task.name}"${careerBonus > 0 ? ` (bonus carriera +€${careerBonus})` : ''}${techMultiplier > 1 ? ' (bonus tecnocrate)' : ''}`, `Giorno ${this.state.day}`);
        }
        if (task.stressAdd) {
            let stressVal = task.stressAdd;
            // Home improvement: desk reduces work stress by 10%
            if (type === 'work' && this.hasImprovement('scrivania')) {
                stressVal = Math.round(stressVal * 0.9);
            }
            this.changeStat('stress', stressVal);
        }
        if (task.coherenceBonus) {
            // Ideology: parliament malus affects political coherence gain
            let cohBonus = task.coherenceBonus;
            if (type === 'political') {
                cohBonus = Math.round(cohBonus * this.getIdeologyClass().parliamentMalus);
                // Libreria legislativa bonus
                if (this.hasImprovement('libreria-leggi')) {
                    cohBonus += 3;
                }
            }
            this.changeStat('coherence', cohBonus);
            this.changeStat('reputazione', Math.ceil(cohBonus / 2));
        }

        if (type === 'work') {
            this.changeAttribute('intelligenza', 1);
            // Career promotion progress tuned down for slower progression.
            this.state.career.promotionProgress += 2 + Math.floor(Math.random() * 3);
            if (this.state.career.promotionProgress >= 100) {
                this.promoteCareer();
            }
        } else {
            this.changeAttribute('carisma', 1);
            this.changeAttribute('carisma', 1);
            this.changeAttribute('autenticita', 1);
        }

        this.emit('task-completed', { type, taskId });
        return true;
    },

    // === BILL PAYMENT ===
    payBill(billId) {
        const bill = this.state.bills.find(b => b.id === billId);
        if (!bill || bill.paid) return;
        if (this.state.money < bill.amount) return false;

        bill.paid = true;
        this.changeMoney(-bill.amount);

        // Per-bill stat effects
        if (bill.name === 'Affitto') {
            this.changeStat('stress', -5);
            this.changeStat('morale', 3);
        } else if (bill.name.includes('Luce')) {
            this.changeStat('stress', -2);
        } else if (bill.name.includes('Gas')) {
            this.changeStat('stress', -2);
        } else {
            this.changeStat('stress', -3);
        }

        const overdueBills = this.state.bills.filter(b => !b.paid && !b.installmentPlan && this.state.day > b.dueDay);
        if (overdueBills.length < 2) {
            this.state.flags.lightDimmed = false;
            this.state.flags.phoneLocked = false;
        }
        if (overdueBills.length === 0) this.state.flags.billsUnpaid = 0;

        this.emit('bill-paid', { billId });
        return true;
    },

    // === HOUSING ===
    upgradeHousing(type) {
        const upgrades = {
            periferia: { label: 'Appartamento in Periferia', rent: 550, cost: 800, bonuses: ['Indipendenza'], maluses: ['Lontano dal centro'] },
            centro: { label: 'Appartamento in Centro', rent: 900, cost: 2000, bonuses: ['Networking +2', 'Credibilità +3'], maluses: ['Costi alti'] },
        };
        const u = upgrades[type];
        if (!u || this.state.money < u.cost) return false;
        this.changeMoney(-u.cost);
        this.state.housing = { type, label: u.label, rent: u.rent, bonuses: u.bonuses, maluses: u.maluses };
        this.emit('housing-change', {});
        return true;
    },
};
