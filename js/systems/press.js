/* ============================================
   PRESS SYSTEM — "La Stampa"
   Immersion Pack: Journalists, Newspapers, Press Conferences, Narratives
   ============================================ */

const Press = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.press) {
            Game.state.press = {
                newspapers: [
                    { id: 'corriere', name: 'Corriere della Sera', director: 'Dir. Colombo', ideology: 'liberal', influence: 80, relation: 50, scandalsCovered: 0 },
                    { id: 'repubblica', name: 'La Repubblica', director: 'Dir. Rossi', ideology: 'left', influence: 75, relation: 45, scandalsCovered: 0 },
                    { id: 'il_sole', name: 'Il Sole 24 Ore', director: 'Dir. Bianchi', ideology: 'business', influence: 70, relation: 55, scandalsCovered: 0 },
                    { id: 'il_giorno', name: 'Il Giorno', director: 'Dir. Verdi', ideology: 'regional', influence: 50, relation: 60, scandalsCovered: 0 },
                    { id: 'libero', name: 'Libero', director: 'Dir. Ferrari', ideology: 'right', influence: 60, relation: 40, scandalsCovered: 0 },
                    { id: 'manifesto', name: 'Il Manifesto', director: 'Dir. Russo', ideology: 'radical', influence: 35, relation: 35, scandalsCovered: 0 },
                    { id: 'ansa', name: 'ANSA News', director: 'Dir. Gallo', ideology: 'neutral', influence: 90, relation: 50, scandalsCovered: 0 },
                    { id: 'adnkronos', name: 'Adnkronos', director: 'Dir. Leone', ideology: 'center', influence: 65, relation: 48, scandalsCovered: 0 },
                ],
                pressConferences: [],         // Upcoming press conferences
                narratives: [],               // Active media narratives about player
                mediaReputation: 50,          // 0-100, how press views you
                pressRelationships: {},       // Key:newspaperId => closeness (0-100)
                activeScandals: [],           // Scandals that press is investigating
                pressAgenda: 'neutral',      // 'positive', 'neutral', 'negative'
                lastPressEventDay: -99,
                lastConferenceDay: -99,
            };

            // Initialize press relationships
            Game.state.press.newspapers.forEach(np => {
                Game.state.press.pressRelationships[np.id] = np.relation;
            });
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_stampa_media');
    },

    // Base-game DNA: ticker notifications remain but without press management
    runBaseEvents() {
        const day = Game.state.day || 0;

        if (Math.random() < 0.12) {
            const headlines = [
                'Un articolo su di te esce sul giornale locale.',
                'Le agenzie di stampa discutono delle tue recenti azioni.',
                'Un titolo prominente sui tuoi affari.',
            ];
            const h = headlines[Math.floor(Math.random() * headlines.length)];
            Game.addWorkNotif('Notizia dalla Stampa', h, `Giorno ${day}`);
        }
    },

    // DLC-only: full press management
    runDlcEvents() {
        const day = Game.state.day || 0;
        const press = Game.state.press;

        // Active scandal progression
        press.activeScandals.forEach((scandal, idx) => {
            scandal.daysActive = (scandal.daysActive || 0) + 1;

            if (scandal.daysActive >= 5) {
                // Scandal reaches critical mass, press runs story
                const newspaper = press.newspapers.find(np => np.id === scandal.newspaper);
                if (newspaper) {
                    newspaper.scandalsCovered++;
                    Game.addWorkNotif(
                        'Scandalo in Prima Pagina',
                        `${newspaper.name} ha pubblicato uno scandalo su di te. Reputazione -20.`,
                        `Giorno ${day}`
                    );
                    Game.changeStat('coherence', -20);
                    press.activeScandals.splice(idx, 1);
                }
            }
        });

        // Random press event
        if (day - press.lastPressEventDay >= 6 && Math.random() < 0.18) {
            this.triggerPressEvent(day);
        }

        // Media reputation drift based on scandals and coverage
        const scandalsActive = press.activeScandals.length;
        press.mediaReputation -= scandalsActive * 2;
        press.mediaReputation = Math.max(0, Math.min(100, press.mediaReputation));
    },

    triggerPressEvent(day) {
        const press = Game.state.press;
        press.lastPressEventDay = day;

        const events = [
            { text: 'Un giornalista chiede un\'intervista esclusiva su di te.', type: 'interview' },
            { text: 'Una testata pubblica un\'inchiesta sui tuoi affari.', type: 'investigation' },
            { text: 'I media dipingono una narrative negativa su di te.', type: 'negative_narrative' },
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        Game.addWorkNotif('Evento Stampa', event.text, `Giorno ${day}`);
    },

    // Player calls a press conference
    holdPressConference(topic) {
        const press = Game.state.press;
        const day = Game.state.day || 0;

        if (day - press.lastConferenceDay < 7) {
            return { success: false, msg: 'Devi attendere 7 giorni prima di un\'altra conferenza stampa.' };
        }

        press.lastConferenceDay = day;

        const successChance = press.mediaReputation / 100;
        const success = Math.random() < successChance;

        if (success) {
            const reputationGain = 15 + Math.floor(press.mediaReputation * 0.1);
            Game.changeStat('coherence', reputationGain);
            Game.addWorkNotif(
                'Conferenza Stampa Efficace',
                `La tua conferenza sul ${topic} è stata ben ricevuta dai media. Coerenza +${reputationGain}`,
                `Giorno ${day}`
            );
            return { success: true, gain: reputationGain };
        } else {
            Game.changeStat('stress', 15);
            Game.addWorkNotif(
                'Conferenza Stampa Fallita',
                `La stampa ha criticato il tuo discorso. Stress +15.`,
                `Giorno ${day}`
            );
            return { success: false, msg: 'La conferenza è andata male.' };
        }
    },

    // Bribe a newspaper to control narrative
    playNewspaper(newspaperId, narrative, cost) {
        const press = Game.state.press;
        const newspaper = press.newspapers.find(np => np.id === newspaperId);

        if (!newspaper || Game.state.money < cost) return false;

        Game.changeMoney(-cost);
        press.pressRelationships[newspaperId] += 15;
        press.narratives.push({
            id: `narr_${Date.now()}`,
            newspaper: newspaperId,
            narrative,
            startDay: Game.state.day,
            duration: 10,
        });

        Game.addWorkNotif(
            'Narrativa Controllata',
            `Hai influenzato la narrativa di ${newspaper.name}. Hai speso €${cost}.`,
            `Giorno ${Game.state.day}`
        );
        Game.changeStat('coherence', -10); // Slightly damages coherence for manipulation
        return true;
    },

    // Leaker scandals to newspapers to damage rivals
    leakScandal(newspaperId, targetName, severity) {
        const press = Game.state.press;
        const newspaper = press.newspapers.find(np => np.id === newspaperId);

        if (!newspaper) return false;

        press.activeScandals.push({
            id: `scandal_${Date.now()}`,
            newspaper: newspaperId,
            target: targetName,
            severity,
            daysActive: 0,
        });

        Game.addWorkNotif(
            'Scandalo Trapelato',
            `Hai fatto trapelare uno scandalo su ${targetName} a ${newspaper.name}.`,
            `Giorno ${Game.state.day}`
        );
        return true;
    },

    onNewDay() {
        const day = Game.state.day || 0;

        // Clean up expired narratives
        if (Game.state.press) {
            Game.state.press.narratives = Game.state.press.narratives.filter(n => {
                if (day >= n.startDay + n.duration) {
                    return false;
                }
                return true;
            });
        }

        if (!this.isActive()) {
            this.runBaseEvents();
            return;
        }

        this.runDlcEvents();
    },
};

if (typeof window !== 'undefined') window.Press = Press;
