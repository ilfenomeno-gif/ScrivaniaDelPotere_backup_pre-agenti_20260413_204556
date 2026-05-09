/* ============================================
   DLC CORE LAYER
   Base hooks for all DLCs + active DLC behaviors
   ============================================ */

const DlcCore = {
    init() {
        this.ensureBaseState();
        Game.on('new-day', () => {
            this.ensureBaseState();
            this.applyDormantFormulas();
            this.runBaseEvents();
            this.runActiveDlcLayers();
        });
    },

    ensureBaseState() {
        if (!Game.state.flags) Game.state.flags = {};

        if (!Game.state.justiceSystem) {
            Game.state.justiceSystem = { integrity: 50, corruptionRisk: 0, justiceCorruption: 0, lastBaseEventDay: -99 };
        }

        if (!Game.state.election) Game.state.election = {};
        if (!Game.state.election.sys) {
            Game.state.election.sys = { type: 'italian', expansionLevel: 0, consensoBase: 0, consensoDlc: 0 };
        }

        if (!Game.state.media) {
            Game.state.media = { channels: 0, impact: 0, trust: 0, mediaImpact: 0 };
        }

        if (!Game.state.nationalHistory) {
            Game.state.nationalHistory = { archives: [], ongoing: '', leggi: [], scandali: [], ele: [], historyMode: false };
        }

        if (!Game.state.globalNation) {
            Game.state.globalNation = {
                list: ['italy', 'france', 'germany', 'uk'],
                activeNation: (Game.state.nation && Game.state.nation.id) || 'italy',
                relations: 50,
                coalitionNumber: 0,
                foreignInfluence: 0,
                diplomaticValue: 0,
            };
        }

        if (!Game.state.dlcFlags) {
            Game.state.dlcFlags = {
                dirittoMafia: false,
                elezioniGlobali: false,
                mediaInfodemia: false,
                storiaItalia: false,
                geopoliticaDiplomazia: false,
                mediaLobby: false,
                diplomacySystem: false,
            };
        }
    },

    isDlcActive(id) {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes(id);
    },

    applyDormantFormulas() {
        const mafiaRank = Math.round(((Game.state.mafia && Game.state.mafia.rispettoCriminale) || 0) / 10);
        const followers = (Game.state.social && Game.state.social.followers) || 0;

        Game.state.justiceSystem.justiceCorruption = mafiaRank * 0.1;
        Game.state.election.sys.consensoBase = (Game.state.reputazione || 0) * 0.5;
        Game.state.media.mediaImpact = followers * 0.05;
        Game.state.globalNation.foreignInfluence = (Game.state.globalNation.relations || 0) * 0.1;
    },

    runBaseEvents() {
        const day = Game.state.day || 0;

        if ((day - (Game.state.justiceSystem.lastBaseEventDay || -99)) >= 15 && Math.random() < 0.45) {
            Game.state.justiceSystem.lastBaseEventDay = day;
            Game.addWorkNotif('giudiceIndeciso', 'Il giudice temporeggia. Le istituzioni osservano.', `Giorno ${day}`);
        }

        if (Math.random() < 0.16) {
            Game.addWorkNotif('eventiElettorali', 'Le elezioni stanno cambiando gli equilibri, ma senza scossoni visibili.', `Giorno ${day}`);
        }

        if (Math.random() < 0.18) {
            Game.addWorkNotif('titoloDiGiornale', 'Un titolo di giornale plasma l umore pubblico.', `Giorno ${day}`);
        }

        if (Math.random() < 0.12) {
            Game.addWorkNotif('storiaItalia', 'Un richiamo alla storia riemerge nel dibattito nazionale.', `Giorno ${day}`);
        }

        if (Math.random() < 0.1) {
            Game.addWorkNotif('nazioneEstera', 'Da una nazione estera arriva un segnale politico ambiguo.', `Giorno ${day}`);
        }
    },

    runActiveDlcLayers() {
        const mafiaRank = Math.round(((Game.state.mafia && Game.state.mafia.rispettoCriminale) || 0) / 10);

        const dirittoMafia = this.isDlcActive('dlc_stato_diritto_crimine');
        const elezioniGlobali = this.isDlcActive('dlc_elezioni_globali_europa');
        const mediaInfodemia = this.isDlcActive('dlc_media_infodemia');
        const storiaItalia = this.isDlcActive('dlc_storia_italia');
        const geopolitica = this.isDlcActive('dlc_geopolitica_diplomazia');

        Game.state.dlcFlags.dirittoMafia = dirittoMafia;
        Game.state.dlcFlags.elezioniGlobali = elezioniGlobali;
        Game.state.dlcFlags.mediaInfodemia = mediaInfodemia;
        Game.state.dlcFlags.storiaItalia = storiaItalia;
        Game.state.dlcFlags.geopoliticaDiplomazia = geopolitica;

        if (dirittoMafia) {
            Game.state.justiceSystem.corruptionRisk = Math.min(100, Game.state.justiceSystem.corruptionRisk + Math.max(0, mafiaRank - 2));
            const riskTrial = Math.max(0, 100 - Game.state.justiceSystem.integrity) * mafiaRank;
            Game.state.justiceSystem.riskTrial = riskTrial;

            if (riskTrial > 120 && Math.random() < 0.2) {
                Events.showUrgentChoice({
                    type: 'urgent',
                    title: 'processoInBagno',
                    body: 'Pressioni sul processo: una scelta puo cambiare tutto.',
                    from: 'Palazzo di Giustizia',
                    urgentType: 'mafia',
                    choices: {
                        accept: { label: 'Fai pressione', effects: { rischioIndagini: 15, coherence: -10 } },
                        refuse: { label: 'Lascia fare la giustizia', effects: { coherence: 5, reputazione: -10 } },
                    },
                });
            }
        }

        if (elezioniGlobali) {
            Game.state.election.sys.expansionLevel = 1;
            Game.state.election.sys.consensoDlc = (Game.state.reputazione || 0) * (1 + mafiaRank * 0.02);
            if (Math.random() < 0.14) {
                Game.addWorkNotif('coalizioneNecessaria', 'Con il sistema elettorale espanso, le coalizioni diventano centrali.', `Giorno ${Game.state.day}`);
            }
        }

        if (mediaInfodemia) {
            Game.state.dlcFlags.mediaLobby = true;
            if (Game.state.dlcFlags.mediaLobby) {
                Game.state.media.trust = Game.state.media.impact * 0.4;
            }
            if (Math.random() < 0.16) {
                const fake = Math.random() < 0.5;
                if (fake) {
                    Game.state.media.impact += 30;
                    Game.changeReputazione(-15);
                    Game.addWorkNotif('fakeNewsScoppia', 'Una fake news esplode in rete e altera il consenso.', `Giorno ${Game.state.day}`);
                } else {
                    Game.changeReputazione(10);
                    Game.state.media.trust += 15;
                    Game.addWorkNotif('fattoVerificato', 'Un fact-check ti favorisce e ripulisce l ambiente mediatico.', `Giorno ${Game.state.day}`);
                }
            }
        } else {
            Game.state.dlcFlags.mediaLobby = false;
        }

        if (storiaItalia) {
            Game.state.nationalHistory.historyMode = true;
            if (Math.random() < 0.12) {
                const ev = Math.random() < 0.5 ? 'leggeMalata' : 'scandaloClasseAlta';
                Game.state.nationalHistory.ongoing = ev;
                Game.state.nationalHistory.archives.push({ ev, day: Game.state.day });
                Game.addWorkNotif(ev, 'Un evento storico-narrativo condiziona la fase politica.', `Giorno ${Game.state.day}`);
            }
        } else {
            Game.state.nationalHistory.historyMode = false;
        }

        if (geopolitica) {
            Game.state.dlcFlags.diplomacySystem = true;
            Game.state.globalNation.diplomaticValue = (Game.state.globalNation.relations || 0) * (1 + 0.05 * (Game.state.globalNation.coalitionNumber || 0));
            if (Math.random() < 0.14) {
                const ev = Math.random() < 0.5 ? 'alleanzaUsa' : 'coalizioneUE';
                Game.addWorkNotif(ev, 'La diplomazia internazionale ridefinisce margini e alleanze.', `Giorno ${Game.state.day}`);
            }
        } else {
            Game.state.dlcFlags.diplomacySystem = false;
        }
    },
};
