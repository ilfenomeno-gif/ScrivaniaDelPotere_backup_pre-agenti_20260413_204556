/* ============================================
   SOCIAL CRISIS SYSTEM
   Crisi di fiducia e proteste di massa
   ============================================ */

const SocialCrisis = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.socialCrisis) {
            Game.state.socialCrisis = {
                socialTension: 35,
                movementTrust: 55,
                statoDiDirittoScore: 60,
                keepsConsensusShortTermMalusDays: 0,
                insurgenceStep: 0,
                opinionLeaders: [
                    { id: 'sindacati', ideology: 'sociale', audienceSize: 55, aggression: 36, patience: 60 },
                    { id: 'movimento-digitale', ideology: 'anti-establishment', audienceSize: 62, aggression: 58, patience: 32 },
                    { id: 'rete-civica', ideology: 'moderata', audienceSize: 42, aggression: 22, patience: 70 },
                ],
            };
        }
    },

    onNewDay() {
        this.dailyDrift();
        this.tryProtestBase();
        this.tryMovementInsurgence();
        this.tickShortTermPenalty();
    },

    dailyDrift() {
        const s = Game.state.socialCrisis;
        const repN = Game.state.reputazioneNazionale || 0;
        const coherence = (Game.state.stats && typeof Game.state.stats.coherence === 'number') ? Game.state.stats.coherence : 50;
        const stress = (Game.state.stats && typeof Game.state.stats.stress === 'number') ? Game.state.stats.stress : 50;

        s.socialTension = this.clamp(
            s.socialTension + (repN < 40 ? 4 : -1) + (coherence < 40 ? 3 : 0) + (stress > 70 ? 2 : 0) + this.randomInt(-1, 1),
            0,
            100
        );

        s.movementTrust = this.clamp(
            s.movementTrust + (coherence >= 60 ? 2 : -2) - (s.socialTension > 70 ? 2 : 0),
            0,
            100
        );

        s.opinionLeaders.forEach((m) => {
            m.aggression = this.clamp(m.aggression + (s.socialTension > 65 ? 1 : -1), 0, 100);
        });
    },

    tryProtestBase() {
        const s = Game.state.socialCrisis;
        const repN = Game.state.reputazioneNazionale || 0;

        if (!(s.socialTension > 65 && repN < 40)) return;
        if (Math.random() > 0.35) return;

        Events.showUrgentChoice({
            type: 'urgent',
            title: 'Protesta di base',
            body: 'Sciopero e protesta in crescita: riforma o repressione?',
            from: 'Piazza Nazionale',
            urgentType: 'enemy',
            choices: {
                accept: { label: 'Riforma popolare', effects: { reputazione: 6, money: -180 } },
                refuse: { label: 'Repressione dura', effects: { reputazione: -14, stress: 10 } },
            },
            onResolve: (choiceKey) => {
                if (choiceKey === 'accept') {
                    s.socialTension = this.clamp(s.socialTension - 12, 0, 100);
                    Game.state.debt = (Game.state.debt || 0) + 80;
                    s.opinionLeaders.forEach((m) => {
                        m.aggression = this.clamp(m.aggression - 10, 0, 100);
                    });
                } else {
                    s.socialTension = this.clamp(s.socialTension - 8, 0, 100);
                    s.statoDiDirittoScore = this.clamp(s.statoDiDirittoScore - 15, 0, 100);
                    if (!Game.state.mafia) Game.state.mafia = { rischioIndagini: 0, rispettoCriminale: 0 };
                    Game.state.mafia.rischioIndagini = this.clamp((Game.state.mafia.rischioIndagini || 0) + 10, 0, 100);
                    s.socialTension = this.clamp(s.socialTension + 10, 0, 100);
                    s.keepsConsensusShortTermMalusDays = 5;
                }
            },
        });
    },

    tryMovementInsurgence() {
        const s = Game.state.socialCrisis;

        const movement = s.opinionLeaders.find((m) => {
            const score = m.audienceSize * 0.5 + m.aggression * 0.7 + s.socialTension * 0.6 - m.patience * 0.25;
            const p = this.clamp(score / 260, 0, 0.5);
            return Math.random() < p;
        });

        if (!movement) return;

        if (s.insurgenceStep === 0) {
            s.insurgenceStep = 1;
            Game.addWorkNotif('Movimento insorgente', `Il gruppo ${movement.id} avvia mobilitazioni coordinate.`, `Giorno ${Game.state.day}`);
            return;
        }

        if (s.insurgenceStep === 1) {
            s.insurgenceStep = 2;
            Game.changeMoney(-120);
            Game.changeStat('stress', 6);
            Game.addWorkNotif('Sciopero generale', 'Servizi rallentati e pressione politica in aumento.', `Giorno ${Game.state.day}`);
            return;
        }

        if (s.insurgenceStep === 2) {
            s.insurgenceStep = 0;
            const isMinister = Game.state.career && Game.state.career.level >= 3;
            if (isMinister && s.socialTension > 75 && Math.random() < 0.25) {
                Game.addWorkNotif('Crisi di governo', 'La tua maggioranza entra in crisi dopo le proteste.', `Giorno ${Game.state.day}`);
            } else {
                Game.addWorkNotif('Mobilitazioni in calo', 'La piazza rallenta ma resta volatile.', `Giorno ${Game.state.day}`);
            }
        }
    },

    tickShortTermPenalty() {
        const s = Game.state.socialCrisis;
        if (s.keepsConsensusShortTermMalusDays > 0) {
            s.keepsConsensusShortTermMalusDays -= 1;
            // -30% short-term campaign effectiveness approximation.
            if (Math.random() < 0.35) {
                Game.changeReputazione(-1);
            }
        }
    },

    clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
};
