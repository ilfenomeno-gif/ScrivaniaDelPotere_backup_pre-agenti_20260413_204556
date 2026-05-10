/* ============================================
   WELLNESS SYSTEM — "Corpo e Mente"
   Flavor Pack: Health, Habits, Medical Crises
   ============================================ */

const WellnessSystem = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.wellness) {
            Game.state.wellness = {
                // Wellness tab data (always visible)
                healthHistory: [],          // Track health over time
                stressHistory: [],          // Track stress over time
                // Base habits (free tier)
                baseHabits: [
                    { id: 'sonno', name: 'Sonno Regolare', level: 50, effect: 'salute +5, stress -3' },
                    { id: 'esercizio', name: 'Esercizio Leggero', level: 0, effect: 'salute +8, muscoli +2' },
                    { id: 'dieta', name: 'Dieta Equilibrata', level: 30, effect: 'salute +4, stanchezza -2' },
                    { id: 'alcol', name: 'Consumo Alcol', level: 20, effect: 'morale +10, salute -3, stress -5' },
                    { id: 'fumo', name: 'Abitudine al Fumo', level: 0, effect: 'stress -8, salute -4/giorno' },
                ],
                // Doctor NPC (DLC only)
                doctor: null,               // { id, name, loyalty, corruptible, cost }
                doctorRelation: 0,          // 0-100
                doctorVisits: 0,
                // Medical conditions (DLC only)
                conditions: [],             // Active health conditions
                secrets: [],                // Medical secrets player wants hidden
                // Addiction escalation (DLC only)
                addictions: {},             // { habit: progression (0-100) }
                addictionCrisisDay: -99,
                // Health crisis events
                lastHealthCrisisDay: -99,
                healthCrisesExperienced: 0,
            };
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_corpo_mente_wellness');
    },

    // FREE TIER: habits visible, tab benessere available
    runBaseEvents() {
        const day = Game.state.day || 0;
        const well = Game.state.wellness;

        // Track history
        if (day % 7 === 0) {
            well.healthHistory.push({ day, value: Game.state.stats.salute });
            well.stressHistory.push({ day, value: Game.state.stats.stress });
        }

        // Habit effects on base level
        well.baseHabits.forEach(habit => {
            if (habit.id === 'sonno' && habit.level > 40) {
                Game.changeStat('stress', -2);
            }
            if (habit.id === 'esercizio' && habit.level > 50) {
                Game.changeStat('salute', 3);
            }
            if (habit.id === 'dieta' && habit.level > 50) {
                Game.changeStat('stanchezza', -1);
            }
        });

        if (Math.random() < 0.08) {
            Game.addWorkNotif('Salute in Equilibrio', 'Il tuo corpo e la tua mente sono in buone condizioni.', `Giorno ${day}`);
        }
    },

    // PAID TIER: doctor, addictions escalation, health crises
    runDlcEvents() {
        const day = Game.state.day || 0;
        const well = Game.state.wellness;

        // Initialize doctor if needed
        if (!well.doctor && this.isActive()) {
            well.doctor = {
                id: 'dr_rossi',
                name: 'Dr. Marco Rossi',
                loyalty: 0,
                corruptible: true,
                cost: 500,
                cases: 0,
            };
        }

        // Addiction progression
        Object.keys(well.addictions).forEach(habit => {
            well.addictions[habit] = Math.min(100, well.addictions[habit] + Math.random() * 5);

            if (well.addictions[habit] > 50 && well.addictions[habit] < 60) {
                Game.addWorkNotif(
                    'Dipendenza in Crescita',
                    `La tua ${habit} sta diventando una dipendenza seria. Considera di cercare aiuto.`,
                    `Giorno ${day}`
                );
            }

            if (well.addictions[habit] >= 100) {
                Game.addWorkNotif(
                    'Dipendenza Clinica',
                    `La tua ${habit} ha raggiunto un livello clinico. Salute: -10, Stress: +15.`,
                    `Giorno ${day}`
                );
                Game.changeStat('salute', -10);
                Game.changeStat('stress', 15);
            }
        });

        // Health crisis event
        if (Math.random() < 0.06 && day - well.lastHealthCrisisDay > 20) {
            well.lastHealthCrisisDay = day;
            this.triggerHealthCrisis(day);
        }

        // Addiction crisis
        const maxAddiction = Math.max(...Object.values(well.addictions), 0);
        if (maxAddiction > 85 && Math.random() < 0.12 && day - well.addictionCrisisDay > 15) {
            well.addictionCrisisDay = day;
            Game.addWorkNotif(
                'Crisi di Dipendenza',
                `Una dipendenza ti ha travolgente. Hai bisogno di aiuto medico urgente. Stress: +25.`,
                `Giorno ${day}`
            );
            Game.changeStat('stress', 25);
            Game.changeStat('salute', -15);
        }
    },

    triggerHealthCrisis(day) {
        const well = Game.state.wellness;
        const crises = [
            { name: 'Infarto', days: 5, stress: 30, health: -30 },
            { name: 'Psoriasi', days: 3, stress: 20, health: -15 },
            { name: 'Gastrite Acuta', days: 2, stress: 15, health: -10 },
            { name: 'Esaurimento Nervoso', days: 4, stress: 25, health: -20 },
        ];

        const crisis = crises[Math.floor(Math.random() * crises.length)];
        well.conditions.push({
            id: `crisis_${day}`,
            name: crisis.name,
            severity: 'grave',
            startDay: day,
            recoveryDays: crisis.days,
            daysLeft: crisis.days,
        });

        well.healthCrisesExperienced++;
        Game.addWorkNotif(
            'Crisi Medica',
            `Hai subìto un episodio di ${crisis.name}. Devi riposare per ${crisis.days} giorni. Salute: ${crisis.health}, Stress: ${crisis.stress}.`,
            `Giorno ${day}`
        );
        Game.changeStat('salute', crisis.health);
        Game.changeStat('stress', crisis.stress);
    },

    // Hire doctor or bribe for confidentiality
    consultDoctor(secret = null) {
        const well = Game.state.wellness;
        if (!this.isActive() || !well.doctor) return false;
        if (Game.state.money < well.doctor.cost) return false;

        Game.changeMoney(-well.doctor.cost);
        well.doctorVisits++;
        well.doctorRelation += 10;

        if (secret) {
            well.secrets.push({
                id: `secret_${Date.now()}`,
                description: secret,
                day: Game.state.day,
                discoveryRisk: 10,
            });
            Game.addWorkNotif(
                'Consultazione Medica Riservata',
                `Il Dr. ${well.doctor.name} ha mantenuto il tuo segreto medico. Costo: €${well.doctor.cost}.`,
                `Giorno ${Game.state.day}`
            );
        }

        Game.changeStat('stress', -10);
        return true;
    },

    // Bribe doctor to cover up condition
    corruptDoctor(conditionId) {
        const well = Game.state.wellness;
        if (!this.isActive() || !well.doctor || !well.doctor.corruptible) return false;

        const bribeCost = 1000;
        if (Game.state.money < bribeCost) return false;

        Game.changeMoney(-bribeCost);
        well.doctorRelation += 20;
        well.doctor.loyalty += 30;

        Game.addWorkNotif(
            'Corruzione Medica',
            `Il Dr. ${well.doctor.name} ha accettato di coprire una tua condizione medica. Speso: €${bribeCost}.`,
            `Giorno ${Game.state.day}`
        );
        return true;
    },

    // Add addiction tracking
    addAddiction(habitName) {
        const well = Game.state.wellness;
        if (!well.addictions[habitName]) {
            well.addictions[habitName] = 20;
        }
    },

    // Get wellness report
    getWellnessReport() {
        const well = Game.state.wellness;
        return {
            health: Game.state.stats.salute,
            stress: Game.state.stats.stress,
            conditions: well.conditions,
            addictions: Object.keys(well.addictions),
            secrets: well.secrets.length,
            healthCrises: well.healthCrisesExperienced,
        };
    },

    onNewDay() {
        const day = Game.state.day || 0;

        // Clear resolved health conditions
        const well = Game.state.wellness;
        well.conditions.forEach(cond => {
            cond.daysLeft--;
        });
        well.conditions = well.conditions.filter(c => c.daysLeft > 0);

        this.runBaseEvents();

        if (!this.isActive()) return;

        this.runDlcEvents();
    },
};

if (typeof window !== 'undefined') window.WellnessSystem = WellnessSystem;
