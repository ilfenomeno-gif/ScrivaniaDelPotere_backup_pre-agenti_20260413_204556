/* ============================================
   DAILY EXPENSES — "Il Prezzo del Potere"
   Immersion Pack: Granular Economy, Daily Costs, Representation
   ============================================ */

const DailyExpenses = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.dailyExpenses) {
            Game.state.dailyExpenses = {
                // Base expenses (always present)
                baseExpenses: {
                    rent: 150,          // From house.js (dormant)
                    utilities: 50,      // Power, water, gas
                    internet: 20,
                    phone: 15,
                },
                // Food & nutrition (base tier)
                foodExpenses: {
                    cheapFood: 20,
                    normalFood: 50,
                    qualityFood: 150,
                    currentLevel: 'normal', // affects health
                },
                // Extended expenses (DLC only)
                subscriptions: [
                    { id: 'gym', name: 'Palestra', cost: 50, perMonth: true, active: false, effect: 'salute +2/giorno' },
                    { id: 'club', name: 'Club Privato', cost: 200, perMonth: true, active: false, effect: 'reputazione +5, networking' },
                    { id: 'magazine', name: 'Abbonamenti Riviste', cost: 30, perMonth: true, active: false, effect: 'cultura +3' },
                    { id: 'wine', name: 'Abbonamento Vini', cost: 100, perMonth: true, active: false, effect: 'lifestyle +10' },
                ],
                // Vehicle expenses (if owned)
                carExpenses: {
                    owned: false,
                    model: null,
                    insuranceMonthly: 80,
                    fuelDaily: 15,
                    maintenanceMonthly: 100,
                },
                // Representation expenses (DLC only)
                representationExpenses: [],  // Political/business dining, events
                representationFund: 0,      // Tax-deductible pool
                representationUsed: 0,      // Cumulative usage
                representationTaxBenefit: 0.3, // 30% tax benefit
                // Unexpected expenses
                unexpectedExpenses: [],     // Random events
                lastUnexpectedDay: -99,
                // Budget tracking
                monthlyBudget: 0,
                monthlySpent: 0,
                monthlyStart: 0,
                emergencyFund: 0,
                insuranceOptional: {
                    homeInsurance: { cost: 50, active: false },
                    liabilityInsurance: { cost: 100, active: false },
                },
            };
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_prezzo_potere_expenses');
    },

    // FREE TIER: 3 new casual expenses, daily notifications
    runBaseEvents() {
        const day = Game.state.day || 0;
        const de = Game.state.dailyExpenses;

        // Food expense
        const foodCosts = {
            cheap: 20,
            normal: 50,
            quality: 150,
        };
        const foodCost = foodCosts[de.foodExpenses.currentLevel] || foodCosts.normal;
        Game.changeMoney(-foodCost);

        // Random small expense
        if (Math.random() < 0.25) {
            const smallExpense = Math.floor(Math.random() * 30) + 10;
            Game.changeMoney(-smallExpense);
            Game.addWorkNotif('Spesa Giornaliera', `Spesa alimentare: €${foodCost + smallExpense}`, `Giorno ${day}`);
        }

        // Food quality effect on health
        if (de.foodExpenses.currentLevel === 'quality' && Math.random() < 0.6) {
            Game.changeStat('salute', 2);
        } else if (de.foodExpenses.currentLevel === 'cheap' && Math.random() < 0.5) {
            Game.changeStat('salute', -2);
        }
    },

    // PAID TIER: full economy, representation, unexpected expenses
    runDlcEvents() {
        const day = Game.state.day || 0;
        const de = Game.state.dailyExpenses;

        // Subscription costs (monthly)
        if (day % 30 === 0) {
            de.subscriptions.forEach(sub => {
                if (sub.active) {
                    Game.changeMoney(-sub.cost);
                    Game.addWorkNotif('Abbonamento Mensile', `Pagato: ${sub.name} (€${sub.cost})`, `Giorno ${day}`);
                }
            });

            // Car expenses
            if (de.carExpenses.owned) {
                const carCost = de.carExpenses.insuranceMonthly + de.carExpenses.maintenanceMonthly + (de.carExpenses.fuelDaily * 30);
                Game.changeMoney(-carCost);
                Game.addWorkNotif('Spese Auto', `Manutenzione auto: €${carCost}`, `Giorno ${day}`);
            }
        }

        // Daily fuel (if car owned)
        if (de.carExpenses.owned) {
            Game.changeMoney(-de.carExpenses.fuelDaily);
        }

        // Representation expenses opportunity
        if (Math.random() < 0.12) {
            this.triggerRepresentationExpense(day);
        }

        // Unexpected random expense
        if (day - de.lastUnexpectedDay >= 8 && Math.random() < 0.15) {
            de.lastUnexpectedDay = day;
            this.triggerUnexpectedExpense(day);
        }

        // Insurance claim opportunity
        if (de.insuranceOptional.homeInsurance.active && Math.random() < 0.02) {
            Game.addWorkNotif('Evento Assicurazione', 'Un evento minore è coperto dalla tua assicurazione casa.', `Giorno ${day}`);
        }
    },

    triggerRepresentationExpense(day) {
        const de = Game.state.dailyExpenses;

        const expenses = [
            { name: 'Cena Business', cost: 300 },
            { name: 'Golf Club Politico', cost: 250 },
            { name: 'Aperitivo VIP', cost: 150 },
            { name: 'Evento di Gala', cost: 600 },
            { name: 'Riunione Privata', cost: 200 },
        ];

        const expense = expenses[Math.floor(Math.random() * expenses.length)];
        Game.addWorkNotif(
            'Spesa di Rappresentanza',
            `Opportunità: ${expense.name}. Costo: €${expense.cost} (detraibile: €${Math.floor(expense.cost * de.representationTaxBenefit)}).`,
            `Giorno ${day}`
        );
    },

    triggerUnexpectedExpense(day) {
        const de = Game.state.dailyExpenses;

        const unexpectedEvents = [
            { name: 'Guasto Caldaia', cost: 400 },
            { name: 'Fuga Acqua', cost: 600 },
            { name: 'Furto in Casa', cost: 500 },
            { name: 'Multa Traffico', cost: 100 },
            { name: 'Riparazione Auto', cost: 300 },
            { name: 'Medico Urgenza', cost: 200 },
            { name: 'Danno Proprietà', cost: 800 },
        ];

        const event = unexpectedEvents[Math.floor(Math.random() * unexpectedEvents.length)];
        Game.changeMoney(-event.cost);
        Game.changeStat('stress', 10);

        Game.addWorkNotif(
            'Spesa Imprevista',
            `${event.name}: -€${event.cost}. Stress +10.`,
            `Giorno ${day}`
        );

        de.unexpectedExpenses.push({
            id: `unexpected_${day}`,
            name: event.name,
            cost: event.cost,
            day,
        });
    },

    // Buy or activate a subscription
    activateSubscription(subscriptionId) {
        const de = Game.state.dailyExpenses;
        const sub = de.subscriptions.find(s => s.id === subscriptionId);
        if (!sub || sub.active) return false;

        sub.active = true;
        Game.addWorkNotif(
            'Abbonamento Attivato',
            `Hai attivato: ${sub.name}. Costo mensile: €${sub.cost}. ${sub.effect}`,
            `Giorno ${Game.state.day}`
        );

        return true;
    },

    // Cancel subscription
    cancelSubscription(subscriptionId) {
        const de = Game.state.dailyExpenses;
        const sub = de.subscriptions.find(s => s.id === subscriptionId);
        if (!sub || !sub.active) return false;

        sub.active = false;
        Game.addWorkNotif('Abbonamento Cancellato', `Hai cancellato: ${sub.name}`, `Giorno ${Game.state.day}`);

        return true;
    },

    // Buy car
    buyCar(model) {
        const de = Game.state.dailyExpenses;
        const carCost = 10000;

        if (Game.state.money < carCost) return false;

        Game.changeMoney(-carCost);
        de.carExpenses.owned = true;
        de.carExpenses.model = model;

        Game.addWorkNotif(
            'Auto Acquistata',
            `Hai comprato una ${model}. Spese mensili: €${de.carExpenses.insuranceMonthly + de.carExpenses.maintenanceMonthly}.`,
            `Giorno ${Game.state.day}`
        );

        return true;
    },

    // Buy insurance
    buyInsurance(type) {
        const de = Game.state.dailyExpenses;
        const insurance = de.insuranceOptional[type];

        if (!insurance || insurance.active) return false;

        insurance.active = true;
        Game.addWorkNotif(
            'Polizza Attivata',
            `Hai attivato assicurazione ${type}. Protezione attiva.`,
            `Giorno ${Game.state.day}`
        );

        return true;
    },

    // Use representation budget
    useRepresentationBudget(amount) {
        const de = Game.state.dailyExpenses;
        de.representationUsed += amount;

        const taxBenefit = Math.floor(amount * de.representationTaxBenefit);
        Game.addWorkNotif(
            'Spesa di Rappresentanza Registrata',
            `Spesa: €${amount}. Benefit fiscale: €${taxBenefit}.`,
            `Giorno ${Game.state.day}`
        );

        return taxBenefit;
    },

    // Get monthly budget report
    getMonthlyReport() {
        const de = Game.state.dailyExpenses;
        const fixedCosts = de.baseExpenses.rent + de.baseExpenses.utilities + de.baseExpenses.internet + de.baseExpenses.phone;
        const subscriptionCosts = de.subscriptions.filter(s => s.active).reduce((sum, s) => sum + s.cost, 0);
        const carCosts = de.carExpenses.owned ? (de.carExpenses.insuranceMonthly + de.carExpenses.maintenanceMonthly) : 0;

        return {
            fixed: fixedCosts,
            subscriptions: subscriptionCosts,
            car: carCosts,
            total: fixedCosts + subscriptionCosts + carCosts,
        };
    },

    onNewDay() {
        const day = Game.state.day || 0;

        this.runBaseEvents();

        if (!this.isActive()) return;

        this.runDlcEvents();
    },
};

if (typeof window !== 'undefined') window.DailyExpenses = DailyExpenses;
