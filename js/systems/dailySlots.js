/* ============================================
   DAILY SLOTS — "Agenda Piena"
   Expansion Pack: Time Management & Personal Activities
   ============================================ */

const DailySlots = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.dailySlots) {
            Game.state.dailySlots = {
                // Daily slots structure: mattina, pomeriggio, sera (3 slots/day)
                slots: {
                    mattina: { available: true, activity: null, endDay: null },
                    pomeriggio: { available: true, activity: null, endDay: null },
                    sera: { available: true, activity: null, endDay: null },
                },
                // Activities available
                activities: [
                    { id: 'sport', name: 'Sport Mattutino', slot: 'mattina', duration: 1, effects: { salute: 10, stress: -5 } },
                    { id: 'meditazione', name: 'Meditazione', slot: 'mattina', duration: 1, effects: { stress: -8, coherence: 5 } },
                    { id: 'riunione_lavoro', name: 'Riunione di Lavoro', slot: 'pomeriggio', duration: 1, effects: { career: 5, stress: 10 } },
                    { id: 'lezioni_private', name: 'Lezioni Private', slot: 'pomeriggio', duration: 1, effects: { intelligenza: 8, morale: -5 } },
                    { id: 'cena_business', name: 'Cena di Business', slot: 'sera', duration: 1, effects: { networking: 15, money: -100 } },
                    { id: 'tempo_famiglia', name: 'Tempo in Famiglia', slot: 'sera', duration: 1, effects: { coherence: 15, stress: -10 } },
                ],
                // Extended activities (DLC only)
                dlcActivities: [
                    { id: 'lezione_pianoforte', name: 'Lezione Pianoforte', slot: 'mattina', duration: 1, effects: { culturale: 10, morale: 5 }, dlcOnly: true },
                    { id: 'corso_lingue', name: 'Corso Lingue', slot: 'pomeriggio', duration: 1, effects: { intelligenza: 12, networka: 5 }, dlcOnly: true },
                    { id: 'tea_diplomatico', name: 'Té Diplomatico', slot: 'sera', duration: 1, effects: { reputazione: 10, stress: 5 }, dlcOnly: true },
                    { id: 'terapia', name: 'Seduta Terapia', slot: 'mattina', duration: 1, effects: { stress: -15, salute: 5 }, dlcOnly: true },
                    { id: 'allenamento_intenso', name: 'Allenamento Intenso', slot: 'pomeriggio', duration: 1, effects: { salute: 15, stanchezza: 10 }, dlcOnly: true },
                ],
                // Fatigue tracking
                consecutiveFullDays: 0,
                fatigueLevel: 0,
                burnoutRisk: false,
                // Slot history
                slotsFilledThisWeek: 0,
                lastBurnoutDay: -99,
            };
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_agenda_piena_slots');
    },

    // FREE TIER: calendar shows empty slots visually
    runBaseEvents() {
        const day = Game.state.day || 0;

        if (Math.random() < 0.08) {
            Game.addWorkNotif('Giornata Libera', 'Hai tempo libero in giornata. Puoi usarlo come preferisci.', `Giorno ${day}`);
        }

        if (Math.random() < 0.06) {
            Game.addWorkNotif('Impegni Quotidiani', 'Le tue attività riempiono la giornata, ma non più di tanto.', `Giorno ${day}`);
        }
    },

    // PAID TIER: structured activities, fatigue system, burnout
    runDlcEvents() {
        const day = Game.state.day || 0;
        const ds = Game.state.dailySlots;

        // Check fatigue accumulation
        const slotsFilled = Object.values(ds.slots).filter(s => s.activity).length;
        if (slotsFilled === 3) {
            ds.consecutiveFullDays++;
            ds.fatigueLevel = Math.min(100, ds.fatigueLevel + 10);

            if (ds.consecutiveFullDays >= 5) {
                ds.burnoutRisk = true;
            }
        } else {
            ds.consecutiveFullDays = 0;
            ds.fatigueLevel = Math.max(0, ds.fatigueLevel - 5);
            ds.burnoutRisk = false;
        }

        // Apply fatigue penalty
        if (ds.fatigueLevel > 50) {
            Game.changeStat('stress', 5);
            Game.changeStat('stanchezza', 3);
        }

        // Burnout event
        if (ds.burnoutRisk && Math.random() < 0.15 && day - ds.lastBurnoutDay > 10) {
            ds.lastBurnoutDay = day;
            Game.addWorkNotif(
                'Burnout Imminente',
                `La sovraccarico di lavoro ti sta logorando. Hai bisogno di riposo. Stress: +20, Salute: -10.`,
                `Giorno ${day}`
            );
            Game.changeStat('stress', 20);
            Game.changeStat('salute', -10);
            ds.consecutiveFullDays = 0;
            ds.fatigueLevel = 30;
        }

        // Special opportunity (consumes 1 slot, high reward)
        if (Math.random() < 0.04) {
            const emptySlots = Object.entries(ds.slots).filter(([k, v]) => v.available && !v.activity).map(([k]) => k);
            if (emptySlots.length > 0) {
                Game.addWorkNotif(
                    'Opportunità Speciale',
                    `Un\'occasione rara emerge oggi. Puoi dedicarvi uno slot di tempo.`,
                    `Giorno ${day}`
                );
            }
        }
    },

    // Assign activity to slot
    assignActivity(slotName, activityId) {
        const ds = Game.state.dailySlots;
        const slot = ds.slots[slotName];
        if (!slot || !slot.available || slot.activity) return false;

        let activity = [...ds.activities, ...(this.isActive() ? ds.dlcActivities : [])].find(a => a.id === activityId);
        if (!activity) return false;

        // Check slot compatibility
        if (activity.slot !== slotName) return false;

        slot.activity = activityId;
        slot.endDay = Game.state.day + activity.duration;

        // Apply effects immediately
        const effects = activity.effects;
        if (effects.salute) Game.changeStat('salute', effects.salute);
        if (effects.stress) Game.changeStat('stress', effects.stress);
        if (effects.coherence) Game.changeStat('coherence', effects.coherence);
        if (effects.intelligenza) Game.state.attributes.intelligenza += effects.intelligenza;

        Game.addWorkNotif(
            'Attività Programmata',
            `Hai programmato: ${activity.name} per ${slotName}.`,
            `Giorno ${Game.state.day}`
        );

        return true;
    },

    // Clear slot (cancel activity)
    clearSlot(slotName) {
        const ds = Game.state.dailySlots;
        const slot = ds.slots[slotName];
        if (!slot || !slot.activity) return false;

        slot.activity = null;
        slot.endDay = null;

        Game.addWorkNotif('Attività Cancellata', `Hai cancellato l'attività programmata per ${slotName}.`, `Giorno ${Game.state.day}`);
        return true;
    },

    // Get available activities for a slot
    getAvailableActivities(slotName) {
        let acts = this.ensureState() || Game.state.dailySlots;
        acts = [...acts.activities];
        if (this.isActive()) acts = acts.concat(acts.dlcActivities);
        return acts.filter(a => a.slot === slotName);
    },

    // Get fatigue report
    getFatigueReport() {
        const ds = Game.state.dailySlots;
        return {
            level: ds.fatigueLevel,
            consecutiveDays: ds.consecutiveFullDays,
            burnoutRisk: ds.burnoutRisk,
            slotsFilled: Object.values(ds.slots).filter(s => s.activity).length,
        };
    },

    onNewDay() {
        const day = Game.state.day || 0;

        // Clear completed activities
        const ds = Game.state.dailySlots;
        Object.values(ds.slots).forEach(slot => {
            if (slot.endDay && day >= slot.endDay) {
                slot.activity = null;
                slot.endDay = null;
            }
        });

        this.runBaseEvents();

        if (!this.isActive()) return;

        this.runDlcEvents();
    },
};

if (typeof window !== 'undefined') window.DailySlots = DailySlots;
