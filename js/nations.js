/* ============================================
   NATIONS — Sistema Politico Multi-Nazionale
   ============================================ */

const Nations = {
    nationsData: null,
    universalIdeologies: null,
    currentNation: null,
    ideologyAliases: {
        'radical_left': 'radical_left',
        'left': 'left',
        'center_left': 'center_left',
        'center': 'center',
        'center_right': 'center_right',
        'right': 'right',
        'radical_right': 'radical_right',
        'radicale': 'radical_left',
        'estrema-sinistra': 'radical_left',
        'sinistra': 'left',
        'populista': 'center_left',
        'centro': 'center',
        'tecnocrate': 'center_right',
        'destra': 'right',
        'estremistra': 'radical_right',
        'estrema-destra': 'radical_right',
    },

    ideologyReverseAliases: {
        'radical_left': 'estrema-sinistra',
        'radical_right': 'estrema-destra',
    },

    canonicalToNationIdeologyKey: {
        radical_left: 'radicale',
        left: 'sinistra',
        center_left: 'populista',
        center: 'centro',
        center_right: 'tecnocrate',
        right: 'destra',
        radical_right: 'estremistra',
    },

    normalizeIdeologyKey(ideologyKey) {
        return this.ideologyAliases[ideologyKey] || ideologyKey;
    },

    denormalizeIdeologyKey(ideologyKey) {
        return this.ideologyReverseAliases[ideologyKey] || ideologyKey;
    },

    async init() {
        await this.loadNations();
        await this.loadUniversalIdeologies();
        // Se non è impostata una nazione, usa Italia come default
        if (!Game.state.nation) {
            Game.state.nation = {
                id: 'italy',
                name: 'Italia',
                language: 'italiano',
            };
        }
        this.currentNation = this.nationsData[Game.state.nation.id] || this.nationsData.italy;
        this.ensureDualNationalityState();

        if (!this._dailyHooksRegistered && typeof Game !== 'undefined' && Game.on) {
            this._dailyHooksRegistered = true;
            Game.on('new-day', () => {
                if (!this.isNationChangeProActive()) return;
                const dual = this.getDualNationalityState();
                if (!dual || !dual.active) return;

                const expiryDay = Number(dual.startedDay || 0) + Number(dual.durationDays || 60);
                if ((Game.state.day || 0) > expiryDay) {
                    this.deactivateDualNationality('timer-expired');
                    return;
                }

                const daily = this.getDualNationalityDailyCosts();
                Game.changeStat('coherence', -Math.abs(daily.coherence));
                Game.changeMoney(-Math.abs(daily.money));
            });
        }
    },

    async loadUniversalIdeologies() {
        if (Array.isArray(this.universalIdeologies) && this.universalIdeologies.length > 0) {
            return this.universalIdeologies;
        }
        try {
            const resp = await fetch('data/ideologies.json');
            const data = await resp.json();
            this.universalIdeologies = Array.isArray(data.ideologies) ? data.ideologies : [];
        } catch (e) {
            this.universalIdeologies = [];
        }
        return this.universalIdeologies;
    },

    toNationIdeologyKey(ideologyKey) {
        const canonical = this.normalizeIdeologyKey(ideologyKey);
        return this.canonicalToNationIdeologyKey[canonical] || canonical;
    },

    ensureDualNationalityState() {
        if (!Game.state.flags) Game.state.flags = {};
        if (!Game.state.flags.dualNationality || typeof Game.state.flags.dualNationality !== 'object') {
            Game.state.flags.dualNationality = {
                active: false,
                secondaryNationId: null,
                startedDay: 0,
                durationDays: 60,
            };
            return;
        }
        const d = Game.state.flags.dualNationality;
        if (typeof d.active !== 'boolean') d.active = false;
        if (!Number.isFinite(d.startedDay)) d.startedDay = 0;
        if (!Number.isFinite(d.durationDays) || d.durationDays <= 0) d.durationDays = 60;
        if (typeof d.secondaryNationId !== 'string' && d.secondaryNationId !== null) d.secondaryNationId = null;
    },

    getDualNationalityState() {
        this.ensureDualNationalityState();
        return Game.state.flags.dualNationality;
    },

    getDualNationalityRemainingDays() {
        const d = this.getDualNationalityState();
        if (!d.active) return 0;
        const currentDay = Number(Game.state.day || 0);
        const endDay = Number(d.startedDay || 0) + Number(d.durationDays || 60);
        return Math.max(0, endDay - currentDay);
    },

    activateDualNationality(secondaryNationId) {
        if (!this.isNationChangeProActive()) {
            return { ok: false, reason: 'nation-change-pro-required' };
        }
        if (!secondaryNationId || secondaryNationId === (Game.state.nation && Game.state.nation.id)) {
            return { ok: false, reason: 'invalid-secondary-nation' };
        }
        if (!this.canTransferToNation(Game.state.nation && Game.state.nation.id, secondaryNationId)) {
            return { ok: false, reason: 'nation-locked-by-dlc' };
        }

        const d = this.getDualNationalityState();
        d.active = true;
        d.secondaryNationId = secondaryNationId;
        d.startedDay = Number(Game.state.day || 0);
        d.durationDays = 60;
        if (typeof Game.addWorkNotif === 'function') {
            Game.addWorkNotif('🛂 Doppia Cittadinanza', `Attivata con ${secondaryNationId.toUpperCase()}: durata 60 giorni.`, `Giorno ${Game.state.day}`);
        }
        return { ok: true };
    },

    deactivateDualNationality(reason) {
        const d = this.getDualNationalityState();
        d.active = false;
        d.secondaryNationId = null;
        d.startedDay = 0;
        d.durationDays = 60;
        if (typeof Game.addWorkNotif === 'function') {
            const why = reason === 'timer-expired' ? 'Timer 60 giorni scaduto.' : 'Disattivata manualmente.';
            Game.addWorkNotif('🛂 Doppia Cittadinanza', why, `Giorno ${Game.state.day}`);
        }
        return { ok: true };
    },

    isOldWorldExpansionActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('il_vecchio_mondo_expansion');
    },

    isNationChangeProActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('cambio_nazione_pro');
    },

    getUnlockedNationSet() {
        const base = ['italy', 'france', 'germany', 'uk'];
        if (!this.isOldWorldExpansionActive()) return base;
        return [...base, 'spain', 'portugal', 'benelux', 'switzerland'];
    },

    canTransferToNation(fromNationId, toNationId) {
        if (!toNationId || fromNationId === toNationId) return true;
        return this.getUnlockedNationSet().includes(toNationId);
    },

    getApprovalWindowDays() {
        return 7;
    },

    getDualNationalityDailyCosts() {
        return { coherence: 20, money: 5000 };
    },

    async loadNations() {
        if (this.nationsData) return this.nationsData;
        try {
            const resp = await fetch('data/nations.json');
            this.nationsData = await resp.json();
            Object.values(this.nationsData || {}).forEach(n => {
                if (!n) return;
                if (!n.defaultCity && n.startingCity) n.defaultCity = n.startingCity;
                if (!n.startingCity && n.defaultCity) n.startingCity = n.defaultCity;
            });
        } catch (e) {
            console.warn('Failed to load nations.json, using fallback');
            this.nationsData = this._fallbackNations();
        }
        return this.nationsData;
    },

    _fallbackNations() {
        return {
            italy: {
                id: 'italy',
                name: 'Italia',
                language: 'italiano',
                code: 'IT',
                politicalSystem: 'parlamentare_proporzionale',
                electionThreshold: 3,
                coalitionRequired: true,
                headOfState: 'Presidente della Repubblica',
                headOfGov: 'Presidente del Consiglio',
                currency: '€',
                salaryMultiplier: 1.0,
                rentMultiplier: 1.0,
                taxRate: 0.25,
                careerRoles: ['Consigliere comunale', 'Assessore', 'Sindaco', 'Deputato', 'Ministro', 'Presidente del Consiglio'],
                ideologies: {
                    radicale: { localName: 'Sinistra Radicale', icon: '🚩', desc: 'AVS, Sinistra extraparlamentare' },
                    sinistra: { localName: 'Sinistra', icon: '🔴', desc: 'PD, Europa Verde' },
                    centro: { localName: 'Centro', icon: '⚖️', desc: 'Italia Viva, Azione, +Europa' },
                    populista: { localName: 'Populista', icon: '📢', desc: 'M5S, antisistema' },
                    tecnocrate: { localName: 'Tecnocrate', icon: '📊', desc: 'PD governista' },
                    destra: { localName: 'Destra', icon: '🔵', desc: 'FI moderata' },
                    estremistra: { localName: 'Destra Sovranista', icon: '🦅', desc: 'FdI, Lega' }
                },
                mentors: {
                    radicale: ['marta_sinistra', 'luca_radicale'],
                    sinistra: ['paolo_pd', 'maria_sinistra'],
                    centro: ['roberto_azione', 'francesca_centro'],
                    populista: ['beppe_m5s', 'alessandra_pop'],
                    tecnocrate: ['elena_tecno', 'vittorio_economista'],
                    destra: ['silvio_fi', 'cesare_moderato'],
                    estremistra: ['massimo_fdi', 'giorgia_lega']
                },
                startingCity: 'roma',
                startingMoney: 100,
                stability: 0.55,
                corruptionLevel: 0.65,
                lawModifiers: {
                    mafiaRepression: 0.45,
                    taxEvasionTolerance: 0.60,
                    mediaPressure: 0.70,
                    politicalImmunity: 0.50,
                    lobbyRegulation: 0.30,
                },
            },
            france: {
                id: 'france',
                name: 'France',
                language: 'francese',
                code: 'FR',
                politicalSystem: 'semi_presidenziale',
                electionThreshold: 0,
                coalitionRequired: false,
                headOfState: 'Président de la République',
                headOfGov: 'Premier Ministre',
                currency: '€',
                salaryMultiplier: 1.1,
                rentMultiplier: 1.05,
                taxRate: 0.28,
                careerRoles: ['Conseiller municipal', 'Adjoint au maire', 'Député', 'Ministre', 'Premier Ministre', 'Président'],
                ideologies: {
                    radicale: { localName: 'Gauche radicale', icon: '🚩', desc: 'LFI, NPA, PCF' },
                    sinistra: { localName: 'Socialiste', icon: '🔴', desc: 'PS' },
                    centro: { localName: 'Centre libéral', icon: '⚖️', desc: 'Renaissance' },
                    populista: { localName: 'Populiste', icon: '📢', desc: 'RN' },
                    tecnocrate: { localName: 'Technocrate', icon: '📊', desc: 'PS réformiste' },
                    destra: { localName: 'Centre-droit', icon: '🔵', desc: 'LR' },
                    estremistra: { localName: 'Droite souverainiste', icon: '🦅', desc: 'ER hardline' }
                },
                mentors: {
                    radicale: ['melenchon_lfi'],
                    sinistra: ['olivier_ps'],
                    centro: ['macron_renaissance'],
                    populista: ['lepen_rn'],
                    tecnocrate: ['attali_expert'],
                    destra: ['wauquiez_lr'],
                    estremistra: ['marion_marion']
                },
                startingCity: 'paris',
                startingMoney: 120,
                stability: 0.60,
                corruptionLevel: 0.40,
                lawModifiers: {
                    mafiaRepression: 0.65,
                    taxEvasionTolerance: 0.35,
                    mediaPressure: 0.80,
                    politicalImmunity: 0.60,
                    lobbyRegulation: 0.50,
                },
            },
            germany: {
                id: 'germany',
                name: 'Deutschland',
                language: 'tedesco',
                code: 'DE',
                politicalSystem: 'cancellierato_federale',
                electionThreshold: 5,
                coalitionRequired: true,
                headOfState: 'Bundespräsident',
                headOfGov: 'Bundeskanzler',
                currency: '€',
                salaryMultiplier: 1.25,
                rentMultiplier: 1.2,
                taxRate: 0.32,
                careerRoles: ['Gemeinderat', 'Bürgermeister', 'Landtag', 'Bundesminister', 'Bundeskanzler', 'Kanzler'],
                ideologies: {
                    radicale: { localName: 'Radikale Linke', icon: '🚩', desc: 'Die Linke' },
                    sinistra: { localName: 'Sozialdemokraten', icon: '🔴', desc: 'SPD' },
                    centro: { localName: 'Liberale Mitte', icon: '⚖️', desc: 'FDP, Grüne' },
                    populista: { localName: 'Populistisch', icon: '📢', desc: 'AfD, BSW' },
                    tecnocrate: { localName: 'Technokrat', icon: '📊', desc: 'CDU/CSU Wirtschaft' },
                    destra: { localName: 'Christdemokraten', icon: '🔵', desc: 'CDU/CSU' },
                    estremistra: { localName: 'Rechtspopulist', icon: '🦅', desc: 'AfD hardcore' }
                },
                mentors: {
                    radicale: ['wagenknecht_linke'],
                    sinistra: ['scholz_spd'],
                    centro: ['lindner_fdp'],
                    populista: ['weidel_afd'],
                    tecnocrate: ['merz_cdu'],
                    destra: ['friedrich_merz'],
                    estremistra: ['hoecke_afd']
                },
                startingCity: 'berlin',
                startingMoney: 140,
                stability: 0.80,
                corruptionLevel: 0.20,
                lawModifiers: {
                    mafiaRepression: 0.85,
                    taxEvasionTolerance: 0.15,
                    mediaPressure: 0.75,
                    politicalImmunity: 0.35,
                    lobbyRegulation: 0.70,
                },
            },
            uk: {
                id: 'uk',
                name: 'United Kingdom',
                language: 'inglese',
                code: 'GB',
                politicalSystem: 'westminster_maggioritario',
                electionThreshold: 0,
                coalitionRequired: false,
                headOfState: 'Monarch',
                headOfGov: 'Prime Minister',
                currency: '£',
                salaryMultiplier: 1.2,
                rentMultiplier: 1.2,
                taxRate: 0.24,
                careerRoles: ['Councillor', 'Mayor', 'MP', 'Minister', 'Shadow Secretary', 'Prime Minister'],
                ideologies: {
                    radicale: { localName: 'Radical Left', icon: '🚩', desc: 'Corbynista' },
                    sinistra: { localName: 'Labour', icon: '🔴', desc: 'Labour Party' },
                    centro: { localName: 'Liberal Centre', icon: '⚖️', desc: 'Lib Dems' },
                    populista: { localName: 'Populist', icon: '📢', desc: 'Reform UK, UKIP' },
                    tecnocrate: { localName: 'Technocrat', icon: '📊', desc: 'Blairites' },
                    destra: { localName: 'Conservative', icon: '🔵', desc: 'Tory' },
                    estremistra: { localName: 'Hard Right', icon: '🦅', desc: 'ERG, Brexit-hard' }
                },
                mentors: {
                    radicale: ['corbyn_labour'],
                    sinistra: ['starmer_labour'],
                    centro: ['davey_libdem'],
                    populista: ['farage_reform'],
                    tecnocrate: ['blair_expert'],
                    destra: ['sunak_tory'],
                    estremistra: ['braverman_hard']
                },
                startingCity: 'london',
                startingMoney: 130,
                stability: 0.70,
                corruptionLevel: 0.30,
                lawModifiers: {
                    mafiaRepression: 0.70,
                    taxEvasionTolerance: 0.25,
                    mediaPressure: 0.90,
                    politicalImmunity: 0.45,
                    lobbyRegulation: 0.65,
                },
            }
        };
    },

    getNation(nationId) {
        if (!this.nationsData) return null;
        return this.nationsData[nationId || Game.state.nation.id];
    },

    getCurrentNation() {
        return this.nationsData ? this.nationsData[Game.state.nation.id] : this._fallbackNations().italy;
    },

    /**
     * Restituisce la citta di default per una nazione (compatibile con defaultCity/startingCity)
     */
    getDefaultCityId(nationId) {
        const nation = this.getNation(nationId);
        if (!nation) return null;
        return nation.defaultCity || nation.startingCity || null;
    },

    /**
     * Mappa un'ideologia italiana a quella della nazione corrente
     * @param {string} italianIdeology - es. 'sinistra', 'populista', 'tecnocrate'
     * @param {string} nationId - ID della nazione (opzionale, usa quella corrente)
     * @returns {string} - Nome del partito nella nazione
     */
    mapIdeologyToNation(italianIdeology, nationId) {
        const nation = this.getNation(nationId || Game.state.nation.id);
        if (!nation) return italianIdeology;
        
        // Tenta prima con la nuova struttura "ideologies"
        if (nation.ideologies && nation.ideologies[italianIdeology]) {
            return nation.ideologies[italianIdeology].localName;
        }
        
        // Fallback alla vecchia "ideologyMap" per compatibilità
        if (nation.ideologyMap) {
            return nation.ideologyMap[italianIdeology] || italianIdeology;
        }
        
        return italianIdeology;
    },

    /**
     * Ottieni dati completi di un'ideologia (localName, icon, desc) per una nazione
     */
    getIdeologyData(ideologyKey, nationId) {
        const nation = this.getNation(nationId);
        if (!nation || !nation.ideologies) return null;
        const localKey = this.toNationIdeologyKey(ideologyKey);
        return nation.ideologies[localKey] || null;
    },

    /**
     * Ottieni il nome localizzato di un'ideologia
     */
    getIdeologyLocalName(ideologyKey, nationId) {
        const data = this.getIdeologyData(ideologyKey, nationId);
        return data ? data.localName : ideologyKey;
    },

    /**
     * Ottieni l'icon emoji di un'ideologia
     */
    getIdeologyIcon(ideologyKey, nationId) {
        const data = this.getIdeologyData(ideologyKey, nationId);
        return data ? data.icon : '➖';
    },

    /**
     * Ottieni la descrizione di un'ideologia
     */
    getIdeologyDesc(ideologyKey, nationId) {
        const data = this.getIdeologyData(ideologyKey, nationId);
        return data ? data.desc : '';
    },

    /**
     * Ottieni i mentori disponibili per un'ideologia in una nazione
     */
    getMentorsForIdeology(ideologyKey, nationId) {
        const nation = this.getNation(nationId);
        if (!nation || !nation.mentors) return [];
        const localKey = this.toNationIdeologyKey(ideologyKey);
        return nation.mentors[localKey] || [];
    },

    /**
     * Ottieni tutti i dati ideologici per una nazione (per UI di selezione)
     */
    getIdeologiesList(nationId) {
        const nation = this.getNation(nationId);
        const source = Array.isArray(this.universalIdeologies) && this.universalIdeologies.length > 0
            ? this.universalIdeologies
            : [
                { id: 'radical_left', name: 'Sinistra radicale', color: 'crimson', position: -3 },
                { id: 'left', name: 'Sinistra', color: 'red', position: -2 },
                { id: 'center_left', name: 'Centro-sinistra', color: 'orange', position: -1 },
                { id: 'center', name: 'Centro', color: 'green', position: 0 },
                { id: 'center_right', name: 'Centro-destra', color: 'yellow', position: 1 },
                { id: 'right', name: 'Destra', color: 'blue', position: 2 },
                { id: 'radical_right', name: 'Destra radicale', color: 'purple', position: 3 },
            ];

        return source.map((ideo) => {
            const localized = nation && nation.ideologies
                ? nation.ideologies[this.toNationIdeologyKey(ideo.id)]
                : null;
            return {
                id: ideo.id,
                localName: (localized && localized.localName) || ideo.name,
                icon: (localized && localized.icon) || '•',
                desc: (localized && localized.desc) || ideo.name,
                color: ideo.color,
                position: ideo.position,
            };
        });
    },

    /**
     * Ottieni il moltiplicatore di stipendio per la nazione
     */
    getSalaryMultiplier(nationId) {
        const nation = this.getNation(nationId);
        return nation ? nation.salaryMultiplier : 1.0;
    },

    /**
     * Ottieni il moltiplicatore di affitto per la nazione
     */
    getRentMultiplier(nationId) {
        const nation = this.getNation(nationId);
        return nation ? nation.rentMultiplier : 1.0;
    },

    /**
     * Ottieni l'aliquota fiscale per la nazione
     */
    getTaxRate(nationId) {
        const nation = this.getNation(nationId);
        return nation ? nation.taxRate : 0.25;
    },

    /**
     * Ottieni i ruoli di carriera per la nazione (localizzati)
     */
    getCareerRoles(nationId) {
        const nation = this.getNation(nationId);
        return nation ? nation.careerRoles : [];
    },

    /**
     * Ottieni il ruolo di carriera localizzato per il livello
     */
    getCareerRoleForLevel(level, nationId) {
        const roles = this.getCareerRoles(nationId);
        return roles[Math.min(level, roles.length - 1)] || 'Politico';
    },

    /**
     * Informazioni sul sistema elettorale della nazione
     */
    getElectionRules(nationId) {
        const nation = this.getNation(nationId);
        if (!nation) return {};
        return {
            system: nation.politicalSystem,
            threshold: nation.electionThreshold,
            coalitionRequired: nation.coalitionRequired,
            headOfState: nation.headOfState,
            headOfGov: nation.headOfGov,
        };
    },

    /**
     * Descrive il sistema politico (per tutorial/UI)
     */
    getSystemDescription(nationId) {
        const nation = this.getNation(nationId);
        return nation ? nation.description : 'Sistema politico europeo';
    },

    /**
     * Costo di trasferimento internazionale (base per la nazione di destinazione)
     */
    getInternationalTransferCost(fromNationId, toNationId) {
        const matrix = {
            italy: { france: 1500, germany: 1800, uk: 2000 },
            france: { italy: 1400, germany: 1200, uk: 1700 },
            germany: { italy: 1700, france: 1200, uk: 1800 },
            uk: { italy: 2100, france: 1700, germany: 1800 },
            spain: { portugal: 900, france: 1200, italy: 1600, benelux: 1700, switzerland: 1750, germany: 1800, uk: 1900 },
            portugal: { spain: 900, france: 1400, italy: 1700, benelux: 1800, switzerland: 1800, germany: 1900, uk: 2000 },
            benelux: { france: 1000, germany: 1100, uk: 1300, italy: 1550, spain: 1700, portugal: 1800, switzerland: 1250 },
            switzerland: { france: 1000, germany: 1100, italy: 1200, benelux: 1250, spain: 1750, portugal: 1800, uk: 1650 },
        };
        const baseCost = (matrix[fromNationId] && matrix[fromNationId][toNationId]) || 1800;

        // Se la nazione è già stata visitata almeno una volta, piccolo sconto di familiarità.
        const visited = (Game.state && Array.isArray(Game.state.visitedNations)) ? Game.state.visitedNations : [];
        const revisitDiscount = visited.includes(toNationId) ? 0.9 : 1;

        return Math.round(baseCost * revisitDiscount);
    },

    getInternationalTransferTaxRate(fromNationId, toNationId) {
        const matrix = {
            italy: { france: 0.05, germany: 0.08, uk: 0.10 },
            france: { italy: 0.05, germany: 0.05, uk: 0.08 },
            germany: { italy: 0.08, france: 0.05, uk: 0.08 },
            uk: { italy: 0.10, france: 0.08, germany: 0.08 },
        };
        return (matrix[fromNationId] && matrix[fromNationId][toNationId]) || 0.08;
    },

    /**
     * Genera i bonus/malus di trasferimento tra nazioni
     */
    getTransferBonus(fromNationId, toNationId) {
        const from = this.getNation(fromNationId);
        const to = this.getNation(toNationId);
        if (!from || !to) return {};

        const moralePenalty = -10; // Shock culturale iniziale
        const coherenceLoss = -15;  // Perdita di coerenza per adattamento

        // Bonus se la nazione di destinazione ha economia migliore
        const economicBonus = (to.salaryMultiplier > from.salaryMultiplier) ? 8 : 0;

        return {
            morale: moralePenalty,
            coherence: coherenceLoss,
            economicBonus,
            stressInitial: 15, // Stress da trasferimento
        };
    },

    /**
     * Testo descrittivo per il trasferimento internazionale
     */
    getTransferDescription(toNationId) {
        const nation = this.getNation(toNationId);
        if (!nation) return '';
        return `Trasferimento internazionale a ${nation.name}. Sistema politico: ${nation.politicalSystem.replace(/_/g, ' ')}.`;
    },

    /**
     * Restituisce Array di nazioni disponibili (per UI di selezione nazione)
     */
    getAvailableNations() {
        if (!this.nationsData) return [];
        return Object.values(this.nationsData).map(n => ({
            id: n.id,
            name: n.name,
            language: n.language,
            code: n.code,
            description: n.description,
            system: n.politicalSystem,
            currency: n.currency,
            startingCity: n.startingCity,
            startingMoney: n.startingMoney,
            economicTier: n.salaryMultiplier > 1.2 ? 'high' : (n.salaryMultiplier > 1.05 ? 'medium' : 'low'),
            ideologiesCount: n.ideologies ? Object.keys(n.ideologies).length : 0
        }));
    },

    /**
     * Calcola il costo di vita generale per una nazione
     */
    getCostOfLivingScore(nationId) {
        const nation = this.getNation(nationId);
        if (!nation) return 1.0;
        return (nation.rentMultiplier + (nation.salaryMultiplier * 0.5)) / 1.5;
    },

    /**
     * Restituisce il nome del leader/capo governo per la nazione
     */
    getGovernmentLeader(nationId) {
        const nation = this.getNation(nationId);
        return nation ? nation.headOfGov : 'Leader';
    },

    /**
     * Restituisce il nome dello stato (capo di stato) della nazione
     */
    getStateHead(nationId) {
        const nation = this.getNation(nationId);
        return nation ? nation.headOfState : 'Head of State';
    },

    /**
     * Verifica se una nazione richiede coalizioni
     */
    requiresCoalition(nationId) {
        const nation = this.getNation(nationId);
        return nation ? nation.coalitionRequired : false;
    },

    /**
     * Restituisce la soglia di elezione per una nazione
     */
    getElectionThreshold(nationId) {
        const nation = this.getNation(nationId);
        return nation ? nation.electionThreshold : 0;
    }
};
