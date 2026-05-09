/* ============================================
   CHAIN EVENTS SYSTEM
   Narrative chains and multi-step drama sequences
   ============================================ */

const ChainEvents = {
    init() {
        this.ensureState();

        Game.on('new-day', () => {
            this.ensureState();
            this.tickAll();
        });
    },

    ensureState() {
        if (!Game.state.chains) {
            Game.state.chains = {
                activeChains: [],
            };
        }
    },

    start(chainId, payload) {
        const c = Game.state.chains;
        if (c.activeChains.some((x) => x.chainId === chainId)) return;
        c.activeChains.push({
            chainId,
            step: 0,
            currentImpact: 0,
            payload: payload || {},
            startDay: Game.state.day || 0,
        });
    },

    tickAll() {
        const c = Game.state.chains;
        c.activeChains.forEach((ch) => {
            if (ch.chainId.startsWith('movement_')) {
                this.tickMovementChain(ch);
            } else if (ch.chainId.startsWith('scandal_')) {
                this.tickMinisterScandal(ch);
            }
        });
        c.activeChains = c.activeChains.filter((ch) => !ch.done);
    },

    tickMovementChain(ch) {
        const day = Game.state.day || 0;

        if (ch.step === 0) {
            Game.addWorkNotif('Mobilitazione coordinata', 'Il movimento avvia azioni concertate per la piazza.', `Giorno ${day}`);
            ch.currentImpact += -2;
            ch.step = 1;
            return;
        }

        if (ch.step === 1) {
            Game.addWorkNotif('Sciopero in corso', 'Servizi pubblici rallentati. Pressione politica crescente.', `Giorno ${day}`);
            Game.changeMoney(-120);
            ch.currentImpact += -4;
            ch.step = 2;
            return;
        }

        if (ch.step === 2) {
            const isMinister = !!(Game.state.career && Game.state.career.level >= 3);
            const socialTension = Game.state.socialCrisis ? (Game.state.socialCrisis.socialTension || 0) : 50;

            if (isMinister && socialTension > 75 && Math.random() < 0.25) {
                Game.addWorkNotif('Crisi di governo', 'La maggioranza rischia il collasso dopo le mobilitazioni.', `Giorno ${day}`);
                Game.changeStat('stress', 12);
            } else {
                Game.addWorkNotif('Mobilitazioni calano', 'La piazza rallenta ma resta volatile.', `Giorno ${day}`);
            }

            ch.done = true;
        }
    },

    tickMinisterScandal(ch) {
        const day = Game.state.day || 0;

        if (ch.step === 0) {
            Game.addWorkNotif('Scandalo ministeriale', 'Notizie di presunta corruzione circolano fra i corridoi.', `Giorno ${day}`);
            ch.currentImpact += -4;
            ch.step = 1;
            return;
        }

        if (ch.step === 1) {
            Game.addWorkNotif('Inchiesta annunciata', 'La procura apre un fascicolo preliminare.', `Giorno ${day}`);
            ch.currentImpact += -6;
            ch.step = 2;

            if (!Game.state.mafia) Game.state.mafia = { rischioIndagini: 0, rispettoCriminale: 0 };
            Game.state.mafia.rischioIndagini = Math.min(100, (Game.state.mafia.rischioIndagini || 0) + 8);
            return;
        }

        if (ch.step === 2) {
            const rischioIndagini = Game.state.mafia ? (Game.state.mafia.rischioIndagini || 0) : 0;

            if (rischioIndagini > 70 && Math.random() < 0.35) {
                Game.addWorkNotif('Scandalo esplode', 'Il dossier viene reso pubblico. Pressione massima.', `Giorno ${day}`);
                Game.changeReputazione(-16);
                Game.changeStat('stress', 14);
                ch.currentImpact += -10;
            } else {
                Game.addWorkNotif('Inchiesta archiviata', 'L\'inchiesta prosegue ma senza escalation.', `Giorno ${day}`);
                ch.currentImpact += 2;
            }

            ch.done = true;
        }
    },

    // Helper for deep state to trigger a scandal chain
    triggerMinisterScandal(ministerId) {
        const ministerId_safe = String(ministerId || 'unknown').replace(/[^a-z0-9_-]/gi, '');
        const chainId = 'scandal_' + ministerId_safe + '_' + (Game.state.day || 0);
        this.start(chainId, { ministerId });
    },

    // Helper for social crisis to trigger movement chain
    triggerMovementChain(movementId) {
        const movementId_safe = String(movementId || 'unknown').replace(/[^a-z0-9_-]/gi, '');
        const chainId = 'movement_' + movementId_safe + '_' + (Game.state.day || 0);
        this.start(chainId, { movementId });
    },
};
