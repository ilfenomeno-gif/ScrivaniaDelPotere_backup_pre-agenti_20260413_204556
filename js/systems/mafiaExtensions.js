/* ============================================
   MAFIA EXTENSIONS — "La Cupola"
   Flavor Pack: Crime Family Narratives, Succession, Rituals, 40+ Events
   ============================================ */

const MafiaExtensions = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.mafiaExtensions) {
            Game.state.mafiaExtensions = {
                crimeFamilies: [
                    {
                        id: 'family_corleonesi',
                        name: 'Famiglia Corleonesi',
                        region: 'Sicilia',
                        boss: 'Don Salvatore',
                        territory: 65,
                        power: 85,
                        narrative: 'La famiglia dominante, brutale e efficiente.',
                        activeEvents: [],
                        characters: [
                            { id: 'boss_1', name: 'Don Salvatore', role: 'Capo Famiglia', loyalty: 100, age: 65 },
                            { id: 'underboss_1', name: 'Capo Regime Rizzo', role: 'Underboss', loyalty: 85, age: 52 },
                            { id: 'soldier_1', name: 'Picciotto Valenti', role: 'Soldato', loyalty: 70, age: 38 },
                        ],
                        succession: { nextBoss: 'Capo Regime Rizzo', risk: 30 },
                    },
                    {
                        id: 'family_benedetti',
                        name: 'Famiglia Benedetti',
                        region: 'Napoli',
                        boss: 'Don Antonio',
                        territory: 45,
                        power: 65,
                        narrative: 'Una famiglia turbolenta, in lotta con rivali interni.',
                        activeEvents: [],
                        characters: [
                            { id: 'boss_2', name: 'Don Antonio', role: 'Capo Famiglia', loyalty: 80, age: 58 },
                            { id: 'underboss_2', name: 'Capo Regime Mosca', role: 'Underboss', loyalty: 70, age: 48 },
                        ],
                        succession: { nextBoss: 'Capo Regime Mosca', risk: 60 },
                    },
                    {
                        id: 'family_calabresi',
                        name: 'Famiglia Calabresi',
                        region: 'Calabria',
                        boss: 'Don Giovanni',
                        territory: 35,
                        power: 55,
                        narrative: 'Una famiglia emergente, ambiziosa ma fragile.',
                        activeEvents: [],
                        characters: [
                            { id: 'boss_3', name: 'Don Giovanni', role: 'Capo Famiglia', loyalty: 75, age: 52 },
                        ],
                        succession: { nextBoss: null, risk: 80 },
                    },
                ],
                successChains: [],           // Active succession crises
                omertaValue: 0,              // 0-100, code of silence adherence
                respetto: 0,                 // 0-100, street respect
                funerals: [],                // Major funeral events (deaths of bosses)
                rituals: [
                    { id: 'ritual_induction', name: 'Rituale di Affiliazione', description: 'Cerimonia di ammissione nella famiglia', players: 0 },
                    { id: 'ritual_blood', name: 'Patto di Sangue', description: 'Giuramento di fedeltà eterno', players: 0 },
                    { id: 'ritual_vendetta', name: 'Vendetta Rituale', description: 'Esecuzione cerimoniale di un traditore', players: 0 },
                ],
                narrativeArcs: [
                    { id: 'arc_vendetta', family: 'corleonesi', title: 'La Vendetta Corleonese', progress: 0, duration: 50 },
                    { id: 'arc_succession', family: 'benedetti', title: 'La Successione Incerta', progress: 0, duration: 30 },
                    { id: 'arc_uprising', family: 'calabresi', title: 'L\'Ascesa di Don Giovanni', progress: 0, duration: 60 },
                ],
                lastFamilyEventDay: -99,
                lastSuccessionDay: -99,
            };
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_cupola_mafia');
    },

    // Base-game DNA: basic mafia events still trigger
    runBaseEvents() {
        const day = Game.state.day || 0;

        if (Math.random() < 0.08) {
            Game.addWorkNotif('Zona Grigia', 'Voci di affari criminali nel sottobosco cittadino.', `Giorno ${day}`);
        }
    },

    // DLC-only: full family narratives, succession chains, rituals
    runDlcEvents() {
        const day = Game.state.day || 0;
        const mex = Game.state.mafiaExtensions;

        // Family territorial conflicts
        mex.crimeFamilies.forEach(family => {
            if (Math.random() < 0.06) {
                const conflict = [
                    `La famiglia ${family.name} consolida il controllo su ${family.region}.`,
                    `Una faida interna nella ${family.name} causa morti.`,
                    `La ${family.name} negozia nuovi confini territoriali.`,
                ];
                const msg = conflict[Math.floor(Math.random() * conflict.length)];
                Game.addWorkNotif('Conflitto Territoriale', msg, `Giorno ${day}`);
            }
        });

        // Succession crises
        if (day - mex.lastSuccessionDay >= 20 && Math.random() < 0.1) {
            mex.lastSuccessionDay = day;
            this.triggerSuccessionCrisis(day);
        }

        // Advance narrative arcs
        mex.narrativeArcs.forEach(arc => {
            arc.progress = Math.min(100, arc.progress + Math.random() * 3);
            if (arc.progress >= 100 && !arc.completed) {
                arc.completed = true;
                Game.addWorkNotif(
                    'Arco Narrativo Concluso',
                    `${arc.title} si è concluso. La mappa criminale è cambiata.`,
                    `Giorno ${day}`
                );
            }
        });

        // Random ritual event
        if (Math.random() < 0.04) {
            this.triggerRitualEvent(day);
        }
    },

    triggerSuccessionCrisis(day) {
        const mex = Game.state.mafiaExtensions;
        const family = mex.crimeFamilies[Math.floor(Math.random() * mex.crimeFamilies.length)];

        if (!family.succession.nextBoss) {
            Game.addWorkNotif(
                'Crisi di Successione',
                `La morte di ${family.boss} della famiglia ${family.name} ha creato un vuoto di potere. Guerra interna prevedibile.`,
                `Giorno ${day}`
            );
            family.power -= 20;
        } else {
            Game.addWorkNotif(
                'Successione Stabilita',
                `${family.succession.nextBoss} prende il controllo della famiglia ${family.name}.`,
                `Giorno ${day}`
            );
            family.boss = family.succession.nextBoss;
        }

        mex.successChains.push({
            id: `chain_${day}`,
            family: family.id,
            day,
            daysActive: 0,
            resolved: false,
        });
    },

    triggerRitualEvent(day) {
        const mex = Game.state.mafiaExtensions;
        const ritual = mex.rituals[Math.floor(Math.random() * mex.rituals.length)];
        const family = mex.crimeFamilies[Math.floor(Math.random() * mex.crimeFamilies.length)];

        Game.addWorkNotif(
            'Rituale Criminale',
            `Una cerimonia segreta della famiglia ${family.name}: ${ritual.name}. ${ritual.description}`,
            `Giorno ${day}`
        );
        ritual.players++;
    },

    // Witness a funeral (major event)
    witnessFuneral(familyId, bossName) {
        const mex = Game.state.mafiaExtensions;
        const family = mex.crimeFamilies.find(f => f.id === familyId);

        if (!family) return false;

        const funeral = {
            id: `funeral_${Date.now()}`,
            family: familyId,
            bossName,
            day: Game.state.day,
            attended: true,
        };

        mex.funerals.push(funeral);
        Game.addWorkNotif(
            'Funerale Mafiaso',
            `Hai presenziato al funerale di ${bossName}. Un grande spettacolo di potere. Stress +10, Omertà +15.`,
            `Giorno ${Game.state.day}`
        );
        Game.changeStat('stress', 10);
        mex.omertaValue = Math.min(100, mex.omertaValue + 15);

        return funeral;
    },

    // Gain Omertà (code of silence)
    gainOmerta(amount) {
        const mex = Game.state.mafiaExtensions;
        mex.omertaValue = Math.min(100, mex.omertaValue + amount);
        return mex.omertaValue;
    },

    // Gain Street Respect
    gainRispetto(amount) {
        const mex = Game.state.mafiaExtensions;
        mex.respetto = Math.min(100, mex.respetto + amount);
        return mex.respetto;
    },

    // Get narrative about a family
    getFamilyNarrative(familyId) {
        const mex = Game.state.mafiaExtensions;
        const family = mex.crimeFamilies.find(f => f.id === familyId);
        return family ? family.narrative : null;
    },

    // Get active succession chain status
    getSuccessionStatus() {
        const mex = Game.state.mafiaExtensions;
        return mex.successChains.filter(sc => !sc.resolved);
    },

    onNewDay() {
        const day = Game.state.day || 0;

        if (!this.isActive()) {
            this.runBaseEvents();
            return;
        }

        this.runDlcEvents();
    },
};

if (typeof window !== 'undefined') window.MafiaExtensions = MafiaExtensions;
