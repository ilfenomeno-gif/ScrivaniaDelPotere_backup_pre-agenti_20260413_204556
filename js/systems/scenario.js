/* ============================================
   SCENARIO SYSTEM — "La Prima Repubblica"
   Flavor Pack: Historical Scenarios (1970-1992), Mani Pulite, Terrorism
   ============================================ */

const Scenario = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.scenario) {
            Game.state.scenario = {
                isHistoricalMode: false,      // True if playing "La Prima Repubblica" scenario
                scenario: null,                // 'dc_dominance', 'socialism', 'pci_left', 'msi_right', 'laici'
                year: 1970,
                decade: '1970s',
                historicalParties: [
                    { id: 'dc', name: 'Democrazia Cristiana', pctVotes: 38, dominance: 100, corruption: 60 },
                    { id: 'psi', name: 'Partito Socialista Italiano', pctVotes: 10, dominance: 30, corruption: 55 },
                    { id: 'pci', name: 'Partito Comunista Italiano', pctVotes: 27, dominance: 40, corruption: 30 },
                    { id: 'msi', name: 'Movimento Sociale Italiano', pctVotes: 8, dominance: 20, corruption: 50 },
                    { id: 'radicali', name: 'Partito Radicale', pctVotes: 1, dominance: 5, corruption: 40 },
                ],
                historicalEvents: [],        // Events that fire during scenario
                maniPuliteProgress: 0,        // 0-100, how close to Tangentopoli trigger
                terrorismLevel: 0,            // 0-100, BR/NAP activity
                dcHegemony: 80,               // DC control of state
                communistThreat: 60,          // Public fear of communism
                europeIntegration: 30,        // EU integration level
                currencyLire: 1936,           // Lire to Euro conversion (base: 1936 lire = 1 euro)
                yearEndIncome: 0,             // Yearly bonus at year-end
                scandalsHappened: [],         // Track Tangentopoli pre-events
                lastHistoricalEventDay: -99,
                lastTerrorismDay: -99,
            };
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_prima_repubblica_scenario');
    },

    // Base-game DNA: generic '70s era flavor events
    runBaseEvents() {
        const day = Game.state.day || 0;

        if (Math.random() < 0.08) {
            Game.addWorkNotif('Ricordo Storico', 'L\'Italia del dopoguerra riflette sui suoi valori fondamentali.', `Giorno ${day}`);
        }

        if (Math.random() < 0.06) {
            Game.addWorkNotif('Cronaca Nera', 'Un crimine ha scosso le cronache italiane.', `Giorno ${day}`);
        }
    },

    // DLC-only: full historical scenario with terrorism, Mani Pulite progression
    runDlcEvents() {
        const day = Game.state.day || 0;
        const scn = Game.state.scenario;

        // Advance year every ~360 days
        if (day % 360 === 0 && day > 0) {
            scn.year++;
            const newDecade = Math.floor(scn.year / 10) * 10;
            scn.decade = `${newDecade}s`;
            Game.addWorkNotif('Nuovo Anno', `Anno ${scn.year}. Una nuova decade inizia.`, `Giorno ${day}`);
        }

        // Mani Pulite progression (1992 endgame)
        if (scn.year >= 1990) {
            scn.maniPuliteProgress = Math.min(100, scn.maniPuliteProgress + Math.random() * 5);

            if (scn.maniPuliteProgress >= 90 && !scn.maniPuliteStarted) {
                scn.maniPuliteStarted = true;
                Game.addWorkNotif(
                    'Tangentopoli — L\'Inchiesta',
                    'Il giudice Di Pietro apre il primo fascicolo. L\'ordine politico vacilla.',
                    `Giorno ${day}`
                );
                Game.changeStat('stress', 25);
            }
        }

        // Terrorism events (BR, NAP)
        if (day - scn.lastTerrorismDay >= 15 && Math.random() < 0.08) {
            scn.terrorismLevel = Math.min(100, scn.terrorismLevel + Math.random() * 10);
            Game.addWorkNotif(
                'Attacco Terroristico',
                'Un attacco brigatista/neofascista colpisce il paese. Tensione sociale +10.',
                `Giorno ${day}`
            );
            Game.changeStat('stress', 10);
            scn.lastTerrorismDay = day;
        }

        // DC dominance events
        if (Math.random() < 0.06) {
            Game.addWorkNotif(
                'Egemonia DC',
                'La Democrazia Cristiana consolida il suo controllo dello Stato.',
                `Giorno ${day}`
            );
        }

        // Communist threat narrative
        if (Math.random() < 0.05) {
            Game.addWorkNotif(
                'Minaccia Comunista',
                'La propaganda anti-comunista circola tra i media. La paura del "sorpasso rosso" cresce.',
                `Giorno ${day}`
            );
        }
    },

    // Start a historical scenario mode
    startScenario(scenarioId) {
        const scn = Game.state.scenario;
        scn.isHistoricalMode = true;
        scn.scenario = scenarioId;

        switch (scenarioId) {
            case 'dc_dominance':
                scn.year = 1975;
                scn.dcHegemony = 95;
                scn.communistThreat = 70;
                Game.state.character.ideology = 'centro';
                Game.addWorkNotif('Scenario: Dominio DC', 'Sei nato nel periodo di massima egemonia della DC. 1975.', `Giorno ${Game.state.day}`);
                break;
            case 'communism_threat':
                scn.year = 1978;
                scn.communistThreat = 85;
                scn.dcHegemony = 70;
                scn.terrorismLevel = 50;
                Game.addWorkNotif('Scenario: Minaccia Comunista', '1978: Il PCI cresce. Gli "Anni di Piombo" infuriano. Scenario: difficile.', `Giorno ${Game.state.day}`);
                break;
            case 'terrorism_years':
                scn.year = 1979;
                scn.terrorismLevel = 80;
                scn.maniPuliteProgress = 0;
                Game.addWorkNotif('Scenario: Anni di Piombo', '1979: L\'apice del terrorismo brigatista. Il paese è sull\'orlo.', `Giorno ${Game.state.day}`);
                break;
            case 'mani_pulite_eve':
                scn.year = 1991;
                scn.maniPuliteProgress = 85;
                scn.dcHegemony = 45;
                Game.addWorkNotif('Scenario: Vigilia di Tangentopoli', '1991: L\'ordine politico crolla. Mani Pulite sta per iniziare.', `Giorno ${Game.state.day}`);
                break;
        }

        return true;
    },

    // Convert currency from lire to display
    convertFromLire(lireAmount) {
        const scn = Game.state.scenario;
        return Math.floor(lireAmount / scn.currencyLire);
    },

    // Add a pre-event to Tangentopoli
    addManiPuliteEvent(day) {
        const scn = Game.state.scenario;
        scn.scandalsHappened.push({
            day,
            event: 'Corruzione scoperta',
            severity: Math.random() * 50 + 30,
        });
        scn.maniPuliteProgress += 5;
    },

    // Trigger Mani Pulite endgame
    triggerManiPulite() {
        const scn = Game.state.scenario;
        if (scn.year >= 1992 && scn.maniPuliteProgress >= 100) {
            Game.addWorkNotif(
                'TANGENTOPOLI — INCHIESTA GENERALE',
                'Il giudice Di Pietro ha aperto il procedimento generale. L\'arresto dei ministri. Lo Stato crolla. GAMESTATE ALTERED.',
                `Giorno ${Game.state.day}`
            );
            scn.dcHegemony = 20;
            scn.europeIntegration = 45;
            return true;
        }
        return false;
    },

    onNewDay() {
        const day = Game.state.day || 0;

        if (!this.isActive()) {
            this.runBaseEvents();
            return;
        }

        if (!Game.state.scenario.isHistoricalMode) {
            this.runBaseEvents();
            return;
        }

        this.runDlcEvents();
    },
};

if (typeof window !== 'undefined') window.Scenario = Scenario;
