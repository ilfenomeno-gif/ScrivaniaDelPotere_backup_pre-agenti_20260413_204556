/* ============================================
   HOUSING EXTENDED — "Radici"
   Expansion Pack: Villa, Attico, Seconda Proprietà
   ============================================ */

const HousingExtended = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.housingExtended) {
            Game.state.housingExtended = {
                // New housing types available
                housingTypes: [
                    { id: 'stanza', label: 'Stanza', maxLevel: 3, rentBase: 50, image: '🏠' },
                    { id: 'periferia', label: 'Casa Periferia', maxLevel: 3, rentBase: 150, image: '🏘️' },
                    { id: 'centro', label: 'Casa Centro', maxLevel: 3, rentBase: 400, image: '🏙️' },
                    { id: 'villa', label: 'Villa Suburbana', maxLevel: 2, rentBase: 600, image: '🏡', dlcOnly: true },
                    { id: 'attico', label: 'Attico Prestigio', maxLevel: 2, rentBase: 1200, image: '🏢', dlcOnly: true },
                ],
                // Primary residence (existing)
                primaryResidence: null,
                // Secondary residence (new)
                secondaryResidence: null,
                secondaryActivated: false,
                // Improvement catalog extended
                improvementsCatalog: [
                    { id: 'scrivania', name: 'Scrivania Lussuosa', cost: 300, effect: 'intelligenza +5', owned: false },
                    { id: 'isolamento', name: 'Isolamento Acustico', cost: 250, effect: 'stress -2 al giorno', owned: false },
                    { id: 'biblioteca', name: 'Biblioteca Privata', cost: 400, effect: 'culturale +10', owned: false },
                    { id: 'home_gym', name: 'Palestra Privata', cost: 350, effect: 'salute +5 al giorno', owned: false },
                    { id: 'wine_cellar', name: 'Cantina Vini', cost: 500, effect: 'lifestyle +15', owned: false },
                    { id: 'art_gallery', name: 'Galleria Arte', cost: 800, effect: 'collezionista nota, reputazione +20', owned: false, dlcOnly: true },
                    { id: 'safe_room', name: 'Stanza Blindata', cost: 1000, effect: 'sicurezza +50', owned: false, dlcOnly: true },
                ],
                // Penthouse meeting room
                penthouseActive: false,
                penthouseMeetingsScheduled: [],
                // Inspection events
                lastInspectionDay: -99,
                inspectionRisks: 0,
                scandalsFromSecondProperty: 0,
            };
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_radici_housing');
    },

    // FREE TIER: new improvements level 4 for existing housing
    runBaseEvents() {
        const day = Game.state.day || 0;

        if (Math.random() < 0.08) {
            Game.addWorkNotif('Migliorie Casa', 'Nuove opzioni di personalizzazione sono disponibili per la tua casa.', `Giorno ${day}`);
        }

        if (Math.random() < 0.05) {
            Game.addWorkNotif('Eredità Famigliare', 'Un ricordo della tua casa emerge nei pensieri.', `Giorno ${day}`);
        }
    },

    // PAID TIER: Villa, Attico, seconda proprietà
    runDlcEvents() {
        const day = Game.state.day || 0;
        const hx = Game.state.housingExtended;

        // Secondary residence rent payment
        if (hx.secondaryActivated && day % 7 === 0) {
            const secondRent = hx.secondaryResidence ? (hx.secondaryResidence.rentMonthly || 300) : 300;
            Game.changeMoney(-secondRent);
            Game.addWorkNotif('Affitto Seconda Proprietà', `Hai pagato €${secondRent} per la seconda casa.`, `Giorno ${day}`);
        }

        // Inspection risk for secondary property
        if (hx.secondaryActivated && Math.random() < 0.05) {
            hx.inspectionRisks++;
        }

        // Tax inspection event
        if (hx.inspectionRisks > 0 && Math.random() < 0.08) {
            const severity = Math.floor(Math.random() * 50) + 20;
            hx.inspectionRisks = Math.max(0, hx.inspectionRisks - 1);
            Game.addWorkNotif(
                'Ispezione Fiscale Annunciata',
                `L'Agenzia delle Entrate ha annunciato un'ispezione sulla tua seconda proprietà. Rischio: €${severity * 10}.`,
                `Giorno ${day}`
            );
            Game.changeStat('stress', 15);
        }

        // Scandal from secondary property
        if (hx.secondaryActivated && Math.random() < 0.04) {
            Game.addWorkNotif(
                'Scandalo dalla Seconda Casa',
                `Un paparazzi ha beccato una visita compromettente alla tua casa segreta. Stampa ne parla.`,
                `Giorno ${day}`
            );
            hx.scandalsFromSecondProperty++;
            Game.changeStat('coherence', -20);
        }
    },

    // Acquire Villa or Attico
    buySecondaryResidence(type, level) {
        const hx = Game.state.housingExtended;
        const housing = hx.housingTypes.find(h => h.id === type);

        if (!housing || !housing.dlcOnly || !this.isActive()) {
            return false;
        }

        const cost = housing.rentBase * level * 50; // Large upfront cost
        if (Game.state.money < cost) return false;

        Game.changeMoney(-cost);
        hx.secondaryResidence = {
            type,
            level: Math.min(level, housing.maxLevel),
            rentMonthly: housing.rentBase * level,
            boughtDay: Game.state.day,
        };
        hx.secondaryActivated = true;

        if (type === 'attico') {
            hx.penthouseActive = true;
            Game.addWorkNotif('Attico Acquistato', `Hai acquisito un prestigioso Attico in centro con sala riunioni privata. Stress: -5.`, `Giorno ${Game.state.day}`);
            Game.changeStat('stress', -5);
        } else {
            Game.addWorkNotif('Villa Acquistata', `Hai acquisito una Villa Suburbana. Salute +5, ma isolamento sociale.`, `Giorno ${Game.state.day}`);
            Game.changeStat('salute', 5);
        }

        return true;
    },

    // Schedule penthouse meeting
    schedulePenthouseMeeting(guestName, guestType) {
        const hx = Game.state.housingExtended;
        if (!hx.penthouseActive) return false;

        const meeting = {
            id: `mtg_${Date.now()}`,
            guest: guestName,
            type: guestType, // 'boss', 'amante', 'politico', 'giornalista'
            day: Game.state.day,
            attended: false,
        };

        hx.penthouseMeetingsScheduled.push(meeting);
        Game.addWorkNotif(
            'Incontro Riservato Programmato',
            `Hai programmato un incontro privato con ${guestName} all'Attico.`,
            `Giorno ${Game.state.day}`
        );

        return meeting;
    },

    // Buy improvement
    buyImprovement(improvementId) {
        const hx = Game.state.housingExtended;
        const improvement = hx.improvementsCatalog.find(i => i.id === improvementId);

        if (!improvement || improvement.owned) return false;
        if (improvement.dlcOnly && !this.isActive()) return false;
        if (Game.state.money < improvement.cost) return false;

        Game.changeMoney(-improvement.cost);
        improvement.owned = true;

        Game.addWorkNotif(
            'Miglioria Installata',
            `Hai installato: ${improvement.name}. ${improvement.effect}. Speso: €${improvement.cost}`,
            `Giorno ${Game.state.day}`
        );

        return true;
    },

    onNewDay() {
        const day = Game.state.day || 0;

        this.runBaseEvents();

        if (!this.isActive()) return;

        this.runDlcEvents();
    },
};

if (typeof window !== 'undefined') window.HousingExtended = HousingExtended;
