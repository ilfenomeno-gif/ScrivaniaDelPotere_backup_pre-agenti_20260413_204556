/* ============================================
   NATIONS — Sistema Politico Multi-Nazionale
   ============================================ */

const Nations = {
    nationsData: null,
    currentNation: null,
    ideologyAliases: {
        'estrema-sinistra': 'radicale',
        'estrema-destra': 'estremistra',
        'sinistra': 'sinistra',
        'centro': 'centro',
        'populista': 'populista',
        'tecnocrate': 'tecnocrate',
        'destra': 'destra',
    },

    ideologyReverseAliases: {
        'radicale': 'estrema-sinistra',
        'estremistra': 'estrema-destra',
    },

    normalizeIdeologyKey(ideologyKey) {
        return this.ideologyAliases[ideologyKey] || ideologyKey;
    },

    denormalizeIdeologyKey(ideologyKey) {
        return this.ideologyReverseAliases[ideologyKey] || ideologyKey;
    },

    async init() {
        await this.loadNations();
        // Se non è impostata una nazione, usa Italia come default
        if (!Game.state.nation) {
            Game.state.nation = {
                id: 'italy',
                name: 'Italia',
                language: 'italiano',
            };
        }
        this.currentNation = this.nationsData[Game.state.nation.id] || this.nationsData.italy;
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
        const normalized = this.normalizeIdeologyKey(ideologyKey);
        return nation.ideologies[normalized] || null;
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
        const normalized = this.normalizeIdeologyKey(ideologyKey);
        return nation.mentors[normalized] || [];
    },

    /**
     * Ottieni tutti i dati ideologici per una nazione (per UI di selezione)
     */
    getIdeologiesList(nationId) {
        const nation = this.getNation(nationId);
        if (!nation || !nation.ideologies) return [];
        return Object.entries(nation.ideologies).map(([key, data]) => ({
            id: this.denormalizeIdeologyKey(key),
            ...data
        }));
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
