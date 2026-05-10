/* ============================================
   HOUSE NARRATIVE — "Casa, Dolce Casa"
   Flavor Pack: Anniversaries, Visits, Staff Stories
   ============================================ */

const HouseNarrative = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.houseNarrative) {
            Game.state.houseNarrative = {
                // House anniversaries (base tier)
                anniversaries: [
                    { id: 'bought_day', type: 'purchase', date: null, celebrated: false },
                    { id: 'evicted_day', type: 'eviction', date: null, celebrated: false },
                    { id: 'first_upgrade', type: 'upgrade', date: null, celebrated: false },
                ],
                // Room stories (base tier)
                roomStories: {},           // { roomId: "story text" }
                // Staff personalities (base tier: 5 NPCs)
                staff: [
                    { id: 'maggiordomo', name: 'Giuseppe', role: 'Maggiordomo', loyalty: 60, gossip: [], caseNum: 0 },
                    { id: 'governante', name: 'Maria', role: 'Governante', loyalty: 50, gossip: [], caseNum: 0 },
                    { id: 'chef', name: 'Antonio', role: 'Chef', loyalty: 55, gossip: [], caseNum: 0 },
                    { id: 'giardiniere', name: 'Paolo', role: 'Giardiniere', loyalty: 45, gossip: [], caseNum: 0 },
                    { id: 'driver', name: 'Luigi', role: 'Autista', loyalty: 70, gossip: [], caseNum: 0 },
                ],
                // DLC-only: house visits
                visits: [],                // { visitor, date, type, dialogue }
                visitHistory: [],
                specialObjects: [],        // { id, name, cost, emotionalValue, backstory }
                lastVisitDay: -99,
                lastGossipDay: -99,
            };
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_casa_dolce_casa_narrative');
    },

    // FREE TIER: anniversaries visible, staff base personality
    runBaseEvents() {
        const day = Game.state.day || 0;
        const hn = Game.state.houseNarrative;

        // Check for anniversaries
        hn.anniversaries.forEach(ann => {
            if (ann.date && !ann.celebrated) {
                const dayOfYear = new Date(Game.state.calendar.baseDate).getTime() + ann.date * 86400000;
                const today = new Date(Game.state.calendar.baseDate).getTime() + day * 86400000;

                if (Math.abs(today - dayOfYear) < 86400000) {
                    Game.addWorkNotif(
                        'Anniversario Domestico',
                        `Ricordi il giorno in cui ${ann.type} della tua casa. Coerenza +10.`,
                        `Giorno ${day}`
                    );
                    Game.changeStat('coherence', 10);
                    ann.celebrated = true;
                }
            }
        });

        // Random staff comment
        if (Math.random() < 0.08) {
            const staffMember = hn.staff[Math.floor(Math.random() * hn.staff.length)];
            Game.addWorkNotif(
                'Osservazione dello Staff',
                `${staffMember.name} fa una considerazione sulla tua casa.`,
                `Giorno ${day}`
            );
        }
    },

    // PAID TIER: visits, gossip, special objects
    runDlcEvents() {
        const day = Game.state.day || 0;
        const hn = Game.state.houseNarrative;

        // Staff gossip
        if (day - hn.lastGossipDay >= 5 && Math.random() < 0.12) {
            hn.lastGossipDay = day;
            this.triggerStaffGossip(day);
        }

        // Random visit invitation
        if (day - hn.lastVisitDay >= 10 && Math.random() < 0.08) {
            hn.lastVisitDay = day;
            this.createVisitInvitation(day);
        }

        // Staff loyalty drift
        hn.staff.forEach(member => {
            if (Math.random() < 0.05) {
                member.loyalty += Math.random() < 0.5 ? 1 : -1;
                member.loyalty = Math.max(0, Math.min(100, member.loyalty));
            }
        });
    },

    triggerStaffGossip(day) {
        const hn = Game.state.houseNarrative;
        const staffMember = hn.staff[Math.floor(Math.random() * hn.staff.length)];

        const gossips = [
            'Ha visto una riunione strana in salotto ieri sera.',
            'Ha trovato bottiglie nascoste nel seminterrato.',
            'Ha sentito telefonate molto importanti durante la notte.',
            'Ha notato un ospite misterioso entrare dalla porta laterale.',
            'Ha visto documenti riservati sul tuo tavolo.',
        ];

        const gossip = gossips[Math.floor(Math.random() * gossips.length)];
        staffMember.gossip.push({ day, text: gossip });

        Game.addWorkNotif(
            'Gossip dello Staff',
            `${staffMember.name}: ${gossip} (Rischio: potrebbe diffondersi)`,
            `Giorno ${day}`
        );

        // Risk of gossip spreading
        if (staffMember.loyalty < 50 && Math.random() < 0.2) {
            Game.changeStat('coherence', -10);
            Game.addWorkNotif('Scandalo Domestico', `La stampa ha saputo del gossip. Reputazione -10.`, `Giorno ${day}`);
        }
    },

    createVisitInvitation(day) {
        const hn = Game.state.houseNarrative;

        const visitors = [
            { name: 'Il Sindaco', type: 'politico', dialogue: 'Una visita ufficiale alla tua casa.' },
            { name: 'Un Rivale', type: 'rivale', dialogue: 'Un confronto teso dietro le porte di casa.' },
            { name: 'Un Alleato Mafioso', type: 'boss', dialogue: 'Un incontro riservato e molto pericoloso.' },
            { name: 'Una Collega', type: 'amicale', dialogue: 'Una cena informale ma piena di significato.' },
            { name: 'Un Giornalista', type: 'giornalista', dialogue: 'Un\'intervista a sorpresa nella tua casa.' },
        ];

        const visitor = visitors[Math.floor(Math.random() * visitors.length)];
        const visit = {
            id: `visit_${day}_${Math.random() * 1000}`,
            visitor: visitor.name,
            type: visitor.type,
            day,
            dialogue: visitor.dialogue,
            attended: false,
        };

        hn.visits.push(visit);
        Game.addWorkNotif('Visita Programmata', `${visitor.name} ha chiesto di visitarti. ${visitor.dialogue}`, `Giorno ${day}`);
    },

    // Attend a visit
    attendVisit(visitId) {
        const hn = Game.state.houseNarrative;
        const visit = hn.visits.find(v => v.id === visitId);
        if (!visit) return false;

        visit.attended = true;
        hn.visitHistory.push(visit);
        hn.visits = hn.visits.filter(v => v.id !== visitId);

        let outcome = '';
        switch (visit.type) {
            case 'politico':
                Game.changeStat('coherence', 15);
                outcome = 'La visita ufficiale è andata bene.';
                break;
            case 'rivale':
                Game.changeStat('stress', 15);
                Game.changeStat('coherence', -10);
                outcome = 'Un incontro teso ha peggiorato le cose.';
                break;
            case 'boss':
                Game.changeStat('stress', 10);
                Game.changeStat('coherence', -15);
                outcome = 'Un incontro pericoloso. Hai accettato favori oscuri.';
                break;
            case 'amicale':
                Game.changeStat('stress', -10);
                Game.changeStat('coherence', 10);
                outcome = 'Una serata piacevole e rilassante.';
                break;
            case 'giornalista':
                Game.changeStat('coherence', -20);
                outcome = 'L\'intervista potrebbe causare problemi domani.';
                break;
        }

        Game.addWorkNotif('Visita Completata', outcome, `Giorno ${Game.state.day}`);
        return true;
    },

    // Buy special decorative object with emotional value
    buySpecialObject(objectName, cost, backstory) {
        const hn = Game.state.houseNarrative;
        if (Game.state.money < cost) return false;

        Game.changeMoney(-cost);
        const obj = {
            id: `obj_${Date.now()}`,
            name: objectName,
            cost,
            backstory,
            boughtDay: Game.state.day,
            emotionalValue: Math.floor(cost / 100),
        };

        hn.specialObjects.push(obj);
        Game.addWorkNotif(
            'Oggetto Speciale Acquisito',
            `Hai comprato: ${objectName}. Coerenza +${obj.emotionalValue}.`,
            `Giorno ${Game.state.day}`
        );
        Game.changeStat('coherence', obj.emotionalValue);

        return obj;
    },

    // Increase staff loyalty
    improveStaffMorale(staffId, bonus = 10) {
        const hn = Game.state.houseNarrative;
        const member = hn.staff.find(s => s.id === staffId);
        if (!member) return false;

        member.loyalty = Math.min(100, member.loyalty + bonus);
        Game.addWorkNotif(
            'Staff Più Fedele',
            `${member.name} è più leale verso di te (+${bonus} loyalty).`,
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

if (typeof window !== 'undefined') window.HouseNarrative = HouseNarrative;
