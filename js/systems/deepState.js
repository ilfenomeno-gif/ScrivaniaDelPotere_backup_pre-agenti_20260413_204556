/* ============================================
   DEEP STATE SYSTEM
   Apparato di Stato profondo: ministri, lobby, enti
   ============================================ */

const DeepState = {
    init() {
        this.ensureState();

        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });

        Game.on('stat-change', (d) => {
            if (!d || d.stat !== 'coherence') return;
            if (d.delta < 0) {
                Game.state.deepState.incoherenceCount = (Game.state.deepState.incoherenceCount || 0) + 1;
            }
        });
    },

    ensureState() {
        if (!Game.state.deepState) {
            Game.state.deepState = {
                deepStateMinisters: [
                    { id: 'justice', loyalty: 55, ideology: 'istituzionale', corruption: 30, influence: 62, entanglement: 22 },
                    { id: 'interior', loyalty: 50, ideology: 'ordine', corruption: 35, influence: 58, entanglement: 28 },
                    { id: 'economy', loyalty: 48, ideology: 'liberale', corruption: 25, influence: 66, entanglement: 18 },
                    { id: 'health', loyalty: 52, ideology: 'sociale', corruption: 15, influence: 54, entanglement: 14 },
                ],
                lobbyGroups: [
                    { id: 'banche', influence: 65, patience: 45, aggression: 50, relation: 46 },
                    { id: 'ordini', influence: 52, patience: 56, aggression: 30, relation: 50 },
                    { id: 'chiesa', influence: 48, patience: 66, aggression: 20, relation: 54 },
                    { id: 'ong', influence: 40, patience: 60, aggression: 16, relation: 52 },
                ],
                moralistCredibility: 0,
                incoherenceCount: 0,
                lastMinisterEventDay: -99,
                lastLobbyEventDay: -99,
            };
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_stato_diritto_crimine');
    },

    influenceModifier(baseInfluence, corruption) {
        return baseInfluence * (1 + corruption * 0.016);
    },

    coherencePenalty() {
        return (Game.state.deepState.incoherenceCount || 0) * 5;
    },

    ministerPressureScore(m) {
        const infl = this.influenceModifier(m.influence, m.corruption);
        const lowLoyalty = Math.max(0, 60 - m.loyalty);
        return infl * 0.5 + lowLoyalty * 0.8 + (m.entanglement || 0) * 0.6;
    },

    lobbyPressureTrigger(lobby) {
        const consensoPolitico = Game.state.reputazione || 0;
        return lobby.influence > 60 && consensoPolitico < 50;
    },

    onNewDay() {
        const day = Game.state.day || 0;
        const ds = Game.state.deepState;

        if (!this.isActive()) {
            if (Math.random() < 0.09) {
                Game.addWorkNotif('Apparato di Stato', 'Ministeri e lobby osservano le tue mosse, ma restano sullo sfondo.', `Giorno ${day}`);
            }
            return;
        }

        const pen = this.coherencePenalty();
        if (pen > 0) {
            Game.changeStat('coherence', -Math.min(6, Math.floor(pen / 4)));
        }

        if (day - ds.lastMinisterEventDay >= 4) {
            const sorted = ds.deepStateMinisters
                .map((m) => ({ m, score: this.ministerPressureScore(m) }))
                .sort((a, b) => b.score - a.score);
            if (sorted.length && Math.random() < Math.min(0.6, sorted[0].score / 210)) {
                ds.lastMinisterEventDay = day;
                this.emitMinisterEvent(sorted[0].m.id);
            }
        }

        if (day - ds.lastLobbyEventDay >= 5) {
            const l = ds.lobbyGroups.find((x) => this.lobbyPressureTrigger(x));
            if (l && Math.random() < 0.45) {
                ds.lastLobbyEventDay = day;
                this.emitLobbyEvent(l.id);
            }
        }
    },

    emitMinisterEvent(ministerId) {
        const m = Game.state.deepState.deepStateMinisters.find((x) => x.id === ministerId);
        if (!m) return;

        Events.showUrgentChoice({
            type: 'urgent',
            title: 'Revoca di fiducia informale',
            body: 'Hanno parlato di te male al Consiglio dei Ministri.',
            from: 'Apparato Centrale',
            urgentType: 'boss',
            choices: {
                accept: { label: 'Corrompi', effects: { coherence: -10, stress: -4, rischioIndagini: 8 } },
                refuse: { label: 'Ferisci il loro ego', effects: { stress: 6, reputazione: -5 } },
            },
            onResolve: (choiceKey) => {
                if (choiceKey === 'accept') {
                    m.loyalty = Math.min(100, m.loyalty + 10);
                    m.corruption = Math.min(100, m.corruption + 15);
                    Game.state.deepState.incoherenceCount += 1;
                } else {
                    m.loyalty = Math.max(0, m.loyalty - 15);
                    if ((Game.state.character && Game.state.character.ideology) === 'populista') {
                        Game.changeStat('morale', 5);
                    }
                }
            },
        });
    },

    emitLobbyEvent(lobbyId) {
        const l = Game.state.deepState.lobbyGroups.find((x) => x.id === lobbyId);
        if (!l) return;

        Events.showUrgentChoice({
            type: 'urgent',
            title: 'Lobby pressione',
            body: 'Un gruppo di lobbisti vuole incontrarti per un accordo.',
            from: 'Network Lobby',
            urgentType: 'info',
            choices: {
                accept: { label: 'Accetta regali elettorali', effects: { money: 100, reputazione: 8, coherence: -12, rischioIndagini: 10 } },
                refuse: { label: 'Rifiuta', effects: { coherence: 4, reputazione: -2, stress: 3 } },
            },
            onResolve: (choiceKey) => {
                if (choiceKey === 'accept') {
                    l.relation = Math.min(100, l.relation + 12);
                    l.aggression = Math.min(100, l.aggression + 5);
                } else {
                    l.relation = Math.max(0, l.relation - 20);
                    Game.state.deepState.moralistCredibility += 1;
                }
            },
        });
    },
};
