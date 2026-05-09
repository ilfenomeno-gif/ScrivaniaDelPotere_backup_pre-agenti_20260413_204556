/*
  POWER OF POLITICS - Systems Pseudocode Blueprint
  Purpose: provide implementation-ready pseudocode for advanced political systems.
  Status: blueprint only (not auto-mounted in runtime).

  Integration pattern:
  1) Copy each module into real runtime files (e.g. js/systems/*.js).
  2) Replace pseudo calls with concrete engine calls where needed.
  3) Register modules via Game.on('new-day', ...) and UI actions.
*/

const SystemsBlueprint = (() => {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (min, max) => Math.random() * (max - min) + min;

  function ensureRootState() {
    if (!Game.state.systems) {
      Game.state.systems = {
        deepState: null,
        socialCrisis: null,
        intelOps: null,
        narrative: null,
        powerInfra: null,
        npcNetwork: null,
        chains: null,
        personalHistory: null,
        globalCrisis: null,
      };
    }
  }

  /* =========================================================
     1) APPARATO DI STATO PROFONDO (ministeri, lobby, enti)
     ========================================================= */
  const DeepState = {
    initState() {
      ensureRootState();
      if (Game.state.systems.deepState) return;
      Game.state.systems.deepState = {
        deepStateMinisters: [
          { id: 'justice', loyalty: 55, ideology: 'istituzionale', corruption: 28, influence: 62, entanglement: 24 },
          { id: 'interior', loyalty: 48, ideology: 'ordine', corruption: 35, influence: 58, entanglement: 31 },
          { id: 'economy', loyalty: 52, ideology: 'liberale', corruption: 22, influence: 66, entanglement: 18 },
          { id: 'health', loyalty: 50, ideology: 'sociale', corruption: 15, influence: 54, entanglement: 14 },
        ],
        lobbyGroups: [
          { id: 'banks', influence: 65, patience: 45, aggression: 52, relation: 46 },
          { id: 'industry', influence: 60, patience: 50, aggression: 48, relation: 50 },
          { id: 'church', influence: 50, patience: 65, aggression: 20, relation: 55 },
          { id: 'ngo', influence: 40, patience: 58, aggression: 15, relation: 52 },
        ],
        moralistCredibility: 0,
        incoherenceCount: 0,
      };
    },

    // Formula: newInfluence = baseInfluence * (1 + corruption * 0.016)
    influenceModifier(baseInfluence, corruption) {
      return baseInfluence * (1 + corruption * 0.016);
    },

    // Formula: penaltyCoerenza = numeroIncoerenze * 5
    propagandaCoherencePenalty() {
      const ds = Game.state.systems.deepState;
      return (ds.incoherenceCount || 0) * 5;
    },

    lobbyPressureTrigger(lobby) {
      const consensoPolitico = Game.state.reputazione || 0;
      return lobby.influence > 60 && consensoPolitico < 50;
    },

    onNewDay() {
      const ds = Game.state.systems.deepState;

      ds.deepStateMinisters.forEach((m) => {
        const infl = this.influenceModifier(m.influence, m.corruption);
        const pressureScore = infl * 0.45 + m.entanglement * 0.35 + (60 - m.loyalty) * 0.55;
        const prob = clamp(pressureScore / 220, 0, 0.6);
        if (Math.random() < prob) {
          this.emitMinisterDisloyaltyEvent(m.id);
        }
      });

      ds.lobbyGroups.forEach((l) => {
        if (!this.lobbyPressureTrigger(l)) return;
        const prob = clamp((l.influence + l.aggression) / 220, 0, 0.5);
        if (Math.random() < prob) this.emitLobbyPressureEvent(l.id);
      });

      const cPenalty = this.propagandaCoherencePenalty();
      if (cPenalty > 0) {
        Game.changeStat('coherence', -Math.min(10, Math.floor(cPenalty / 3)));
      }
    },

    emitMinisterDisloyaltyEvent(ministerId) {
      const ds = Game.state.systems.deepState;
      const m = ds.deepStateMinisters.find((x) => x.id === ministerId);
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
        _resolve: (choiceKey) => {
          if (choiceKey === 'accept') {
            m.loyalty = clamp(m.loyalty + 10, 0, 100);
            m.corruption = clamp(m.corruption + 15, 0, 100);
            ds.incoherenceCount += 1;
          } else {
            m.loyalty = clamp(m.loyalty - 15, 0, 100);
            if ((Game.state.character && Game.state.character.ideology) === 'populista') {
              Game.changeStat('morale', 5);
            }
          }
        },
      });
    },

    emitLobbyPressureEvent(lobbyId) {
      const ds = Game.state.systems.deepState;
      const l = ds.lobbyGroups.find((x) => x.id === lobbyId);
      if (!l) return;

      Events.showUrgentChoice({
        type: 'urgent',
        title: 'Lobby in pressione',
        body: 'Un gruppo di lobbisti vuole un accordo.',
        from: 'Network Lobby',
        urgentType: 'info',
        choices: {
          accept: { label: 'Accetta regali elettorali', effects: { money: 100, reputazione: 8, coherence: -12, rischioIndagini: 10 } },
          refuse: { label: 'Rifiuta', effects: { coherence: 4, reputazione: -2, stress: 3 } },
        },
        _resolve: (choiceKey) => {
          if (choiceKey === 'accept') {
            l.relation = clamp(l.relation + 12, 0, 100);
            ds.incoherenceCount += 1;
          } else {
            l.relation = clamp(l.relation - 20, 0, 100);
            ds.moralistCredibility += 1;
          }
        },
      });
    },
  };

  /* =========================================================
     2) CRISI DI FIDUCIA E PROTESTE DI MASSA
     ========================================================= */
  const SocialCrisis = {
    initState() {
      ensureRootState();
      if (Game.state.systems.socialCrisis) return;
      Game.state.systems.socialCrisis = {
        socialTension: 35,
        movementTrust: 55,
        statoDiDirittoScore: 60,
        keepsConsensusShortTermMalus: 0,
        opinionLeaders: [
          { id: 'union', ideology: 'sociale', audienceSize: 55, aggression: 38, patience: 60 },
          { id: 'digital', ideology: 'anti-establishment', audienceSize: 62, aggression: 58, patience: 30 },
          { id: 'religious', ideology: 'moderata', audienceSize: 44, aggression: 20, patience: 72 },
        ],
      };
    },

    dailyDrift() {
      const s = Game.state.systems.socialCrisis;
      const repN = Game.state.reputazioneNazionale || 0;
      const coherence = Game.state.stats ? (Game.state.stats.coherence || 50) : 50;

      s.socialTension = clamp(
        s.socialTension + (repN < 40 ? 4 : -1) + (coherence < 40 ? 3 : 0) + rand(-1.5, 1.5),
        0,
        100
      );

      s.movementTrust = clamp(
        s.movementTrust + (coherence >= 60 ? 2 : -2) - (s.socialTension > 70 ? 2 : 0),
        0,
        100
      );

      s.opinionLeaders.forEach((m) => {
        m.aggression = clamp(m.aggression + (s.socialTension > 65 ? 1 : -0.5), 0, 100);
      });

      if (s.keepsConsensusShortTermMalus > 0) {
        s.keepsConsensusShortTermMalus = Math.max(0, s.keepsConsensusShortTermMalus - 1);
      }
    },

    onNewDay() {
      this.dailyDrift();
      this.tryProtestBase();
      this.tryMovementInsurgence();
    },

    tryProtestBase() {
      const s = Game.state.systems.socialCrisis;
      const repN = Game.state.reputazioneNazionale || 0;
      if (!(s.socialTension > 65 && repN < 40)) return;

      Events.showUrgentChoice({
        type: 'urgent',
        title: 'Protesta di base',
        body: 'Sciopero e protesta in aumento. Decidi la linea di governo.',
        from: 'Piazza',
        urgentType: 'enemy',
        choices: {
          accept: { label: 'Riforma popolare', effects: { reputazione: 6, money: -180 } },
          refuse: { label: 'Repressione dura', effects: { reputazione: -14, stress: 10 } },
        },
        _resolve: (choiceKey) => {
          if (choiceKey === 'accept') {
            s.socialTension = clamp(s.socialTension - 12, 0, 100);
            Game.state.debt = (Game.state.debt || 0) + 80;
            s.opinionLeaders.forEach((m) => {
              m.aggression = clamp(m.aggression - 10, 0, 100);
            });
          } else {
            s.socialTension = clamp(s.socialTension - 8, 0, 100);
            s.statoDiDirittoScore = clamp(s.statoDiDirittoScore - 15, 0, 100);
            if (!Game.state.mafia) Game.state.mafia = { rischioIndagini: 0, rispettoCriminale: 0 };
            Game.state.mafia.rischioIndagini = clamp((Game.state.mafia.rischioIndagini || 0) + 10, 0, 100);
            s.socialTension = clamp(s.socialTension + 10, 0, 100); // medium-term backlash
            s.keepsConsensusShortTermMalus = 5; // -30% campaign effectiveness for next days
          }
        },
      });
    },

    tryMovementInsurgence() {
      const s = Game.state.systems.socialCrisis;
      s.opinionLeaders.forEach((m) => {
        const score = m.audienceSize * 0.5 + m.aggression * 0.7 + s.socialTension * 0.6 - m.patience * 0.25;
        const p = clamp(score / 260, 0, 0.5);
        if (Math.random() < p) {
          ChainEvents.start('movement_' + m.id, {
            movementId: m.id,
            step: 0,
            impact: 0,
          });
        }
      });
    },
  };

  /* =========================================================
     3) CAMPAGNE DI SPIONAGGIO E DISINFORMAZIONE
     ========================================================= */
  const IntelligenceOps = {
    initState() {
      ensureRootState();
      if (Game.state.systems.intelOps) return;
      Game.state.systems.intelOps = {
        intelligenceCampaigns: [],
      };
    },

    startCampaign(type, targetId, difficulty) {
      const st = Game.state.systems.intelOps;
      st.intelligenceCampaigns.push({
        id: 'op_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        active: true,
        type,
        target: targetId,
        difficulty: clamp(difficulty || 1, 1, 5),
        progress: 0,
        threshold: 100,
        costPerTick: 25,
      });
    },

    onNewDay() {
      const st = Game.state.systems.intelOps;
      st.intelligenceCampaigns.forEach((op) => {
        if (!op.active) return;
        if ((Game.state.money || 0) < op.costPerTick) return;
        Game.changeMoney(-op.costPerTick);

        const rischio = Game.state.mafia ? (Game.state.mafia.rischioIndagini || 0) : 0;
        const mafiaLevel = Game.state.mafia ? ((Game.state.mafia.rispettoCriminale || 0) / 20) : 0;

        // progress += 4 - random(0,4) modified by risk and mafia level
        const base = 4 - rand(0, 4);
        const mod = mafiaLevel * 0.6 - rischio * 0.02;
        op.progress = clamp(op.progress + base + mod, 0, 200);

        if (op.progress >= op.threshold) {
          this.emitCompromisingEvidenceEvent(op.id);
          op.active = false;
        }
      });
    },

    emitCompromisingEvidenceEvent(opId) {
      const st = Game.state.systems.intelOps;
      const op = st.intelligenceCampaigns.find((x) => x.id === opId);
      if (!op) return;

      Events.showUrgentChoice({
        type: 'urgent',
        title: 'Documento compromettente ottenuto',
        body: 'Hai una prova forte. Come la usi?',
        from: 'Unit Intelligence',
        urgentType: 'info',
        choices: {
          accept: { label: 'Ricatto politico', effects: { reputazione: 7, stress: 6 } },
          refuse: { label: 'Consegna ai media', effects: { reputazione: 4, coherence: 5 } },
        },
        _resolve: (choiceKey) => {
          const difficulty = op.difficulty || 1;
          const delta = 30 + 20 * difficulty; // requested formula
          if (choiceKey === 'accept') {
            Game.state.influence = (Game.state.influence || 0) + 20;
            Game.state.targetReputationDelta = (Game.state.targetReputationDelta || 0) - delta;
          }

          const rischio = Game.state.mafia ? (Game.state.mafia.rischioIndagini || 0) : 0;
          if (rischio > 70 && Math.random() < 0.45) {
            Game.changeReputazione(-18);
            Game.changeStat('stress', 15);
            Game.addWorkNotif('Indagine preliminare aperta', 'La campagna sporca e emersa.', 'Giorno ' + Game.state.day);
          }
        },
      });
    },
  };

  /* =========================================================
     4) DISCORSO PUBBLICO E NARRAZIONE IDEOLOGICA
     ========================================================= */
  const NarrativeSystem = {
    initState() {
      ensureRootState();
      if (Game.state.systems.narrative) return;
      Game.state.systems.narrative = {
        ideologicalNarrative: {
          coreNarrative: 'la legge e sacra',
          narrativeStability: 58,
          narrativeTrust: 52,
        },
      };
    },

    onCampaignEvent(deltaCoerenza) {
      const n = Game.state.systems.narrative.ideologicalNarrative;
      n.narrativeStability = clamp(n.narrativeStability + deltaCoerenza * 0.3, 0, 100);
      n.narrativeTrust = clamp(n.narrativeTrust + deltaCoerenza * 0.2, 0, 100);
    },

    onNewDay() {
      const n = Game.state.systems.narrative.ideologicalNarrative;
      if (n.narrativeStability < 40) {
        Events.showUrgentChoice({
          type: 'urgent',
          title: 'Crisi narrativa',
          body: 'La stampa dice che non sai cosa vuoi.',
          from: 'Media Desk',
          urgentType: 'enemy',
          choices: {
            accept: { label: 'Rifare linea editoriale', effects: { coherence: 10, reputazione: -5 } },
            refuse: { label: 'Rafforza retorica', effects: { reputazione: 8, coherence: -12 } },
          },
        });
      }
      if (n.narrativeStability > 80 && Math.random() < 0.25) {
        Game.changeReputazione(12);
        if (!Game.state.social) Game.state.social = {};
        Game.state.social.followersBonus = (Game.state.social.followersBonus || 0) + 15;
      }
    },
  };

  /* =========================================================
     5) INFRASTRUTTURE DI POTERE (casa-ufficio-territorio)
     ========================================================= */
  const PowerInfrastructure = {
    initState() {
      ensureRootState();
      if (Game.state.systems.powerInfra) return;
      Game.state.systems.powerInfra = {
        palace: { owned: false, protection: 12, influenceRadius: 20, maintenanceCost: 120, neglectedDays: 0 },
        securityCenter: { owned: false, protection: 30, influenceRadius: 10, maintenanceCost: 80, neglectedDays: 0 },
        propagandaOffice: { owned: false, protection: 8, influenceRadius: 26, maintenanceCost: 90, neglectedDays: 0 },
      };
    },

    // Formula: dailyInfluence = (base + sum(structureEffect)) * (1 + mafiaRank * 0.1)
    dailyInfluence() {
      const p = Game.state.systems.powerInfra;
      const base = 6;
      const structureEffect =
        (p.palace.owned ? p.palace.influenceRadius : 0) +
        (p.securityCenter.owned ? p.securityCenter.influenceRadius : 0) +
        (p.propagandaOffice.owned ? p.propagandaOffice.influenceRadius : 0);
      const mafiaRank = (Game.state.mafia ? (Game.state.mafia.rispettoCriminale || 0) : 0) / 20;
      return (base + structureEffect) * (1 + mafiaRank * 0.1);
    },

    onNewDay() {
      const p = Game.state.systems.powerInfra;
      const inf = this.dailyInfluence();
      Game.state.territorialInfluence = (Game.state.territorialInfluence || 0) + inf;

      Object.keys(p).forEach((k) => {
        const infra = p[k];
        if (!infra.owned) return;
        Game.changeMoney(-infra.maintenanceCost);
        if ((Game.state.money || 0) < 0) infra.neglectedDays += 1;
        else infra.neglectedDays = Math.max(0, infra.neglectedDays - 1);
      });

      if (p.palace.owned) Game.changeReputazione(5);

      // If security center is neglected, mafia attack chance +20%
      if (p.securityCenter.owned && p.securityCenter.neglectedDays >= 3) {
        Game.state.mafiaAttackBoost = 0.2;
      } else {
        Game.state.mafiaAttackBoost = 0;
      }
    },
  };

  /* =========================================================
     6) CATEGORIE NPC E FRIEND-FOE NETWORK
     ========================================================= */
  const NPCNetwork = {
    initState() {
      ensureRootState();
      if (Game.state.systems.npcNetwork) return;
      Game.state.systems.npcNetwork = {
        typedContactsInitialized: false,
      };
    },

    tagContactsIfMissing() {
      const contacts = Game.state.contacts || [];
      contacts.forEach((c) => {
        if (c.type) return;
        c.type = 'politician';
      });
      Game.state.systems.npcNetwork.typedContactsInitialized = true;
    },

    onNewDay() {
      if (!Game.state.systems.npcNetwork.typedContactsInitialized) {
        this.tagContactsIfMissing();
      }

      const contacts = Game.state.contacts || [];
      contacts.forEach((c) => {
        if (c.type === 'giornalista' && c.relation > 70 && Math.random() < 0.05) {
          Game.changeReputazione(6);
          Game.addWorkNotif('Titolo di copertina', c.name + ' ha pubblicato un pezzo favorevole.', 'Giorno ' + Game.state.day);
        }
        if (c.type === 'mafioso' && (c.favorRank || 0) > 40 && Math.random() < 0.08) {
          Events.showUrgentChoice({
            type: 'urgent',
            title: 'Offerta del boss',
            body: 'Scambio rapido con contropartita politica.',
            from: c.name,
            urgentType: 'mafia',
            choices: {
              accept: { label: 'Accetta scambio', effects: { rispettoCriminale: 10, coherence: -8 } },
              refuse: { label: 'Rifiuta', effects: { reputazione: 3, stress: 3 } },
            },
            _resolve: (choiceKey) => {
              if (choiceKey === 'accept') {
                const sc = Game.state.systems.socialCrisis;
                if (sc) sc.statoDiDirittoScore = clamp(sc.statoDiDirittoScore - 15, 0, 100);
              }
            },
          });
        }
      });
    },
  };

  /* =========================================================
     7) EVENTI-CATENA NARRATIVI (dramma politico)
     ========================================================= */
  const ChainEvents = {
    initState() {
      ensureRootState();
      if (Game.state.systems.chains) return;
      Game.state.systems.chains = {
        activeChains: [],
      };
    },

    start(chainId, payload) {
      const c = Game.state.systems.chains;
      if (c.activeChains.some((x) => x.chainId === chainId)) return;
      c.activeChains.push({ chainId, step: 0, currentImpact: 0, payload: payload || {} });
    },

    tickAll() {
      const c = Game.state.systems.chains;
      c.activeChains.forEach((ch) => {
        if (ch.chainId.startsWith('movement_')) {
          this.tickMovementChain(ch);
        } else if (ch.chainId === 'scandalo_ministeriale') {
          this.tickMinisterScandal(ch);
        }
      });
      c.activeChains = c.activeChains.filter((ch) => !ch.done);
    },

    tickMovementChain(ch) {
      if (ch.step === 0) {
        Game.addWorkNotif('Mobilitazione annunciata', 'La piazza prepara una protesta estesa.', 'Giorno ' + Game.state.day);
        ch.currentImpact += -2;
        ch.step = 1;
        return;
      }
      if (ch.step === 1) {
        Game.addWorkNotif('Sciopero generale', 'Servizi ridotti e pressione politica.', 'Giorno ' + Game.state.day);
        Game.changeMoney(-120);
        ch.currentImpact += -4;
        ch.step = 2;
        return;
      }
      if (ch.step === 2) {
        const isMinister = !!(Game.state.career && Game.state.career.level >= 3);
        if (isMinister && Math.random() < 0.2) {
          Game.addWorkNotif('Crisi di governo', 'La tua maggioranza rischia il collasso.', 'Giorno ' + Game.state.day);
        }
        ch.done = true;
      }
    },

    tickMinisterScandal(ch) {
      if (ch.step === 0) {
        Game.addWorkNotif('Scandalo ministeriale', 'Notizia di presunta corruzione.', 'Giorno ' + Game.state.day);
        ch.currentImpact += -4;
        ch.step = 1;
        return;
      }
      if (ch.step === 1) {
        Game.addWorkNotif('Inchiesta annunciata', 'La procura apre un fascicolo.', 'Giorno ' + Game.state.day);
        ch.currentImpact += -6;
        ch.step = 2;
        return;
      }
      if (ch.step === 2) {
        // Outcome formula: outcomeReputazione = reputazione + sum(stepImpact)
        Game.changeReputazione(ch.currentImpact);
        ch.done = true;
      }
    },
  };

  /* =========================================================
     8) RIVALI PERSONALI E STORIA PERSONALE
     ========================================================= */
  const PersonalHistory = {
    initState() {
      ensureRootState();
      if (Game.state.systems.personalHistory) return;
      Game.state.systems.personalHistory = {
        enemiesKnown: [],
        dealsSigned: [],
        betrayals: 0,
        stigma: 0,
      };
    },

    registerBetrayal(enemyId) {
      const p = Game.state.systems.personalHistory;
      p.betrayals += 1;
      if (!p.enemiesKnown.includes(enemyId)) p.enemiesKnown.push(enemyId);
    },

    onNewDay() {
      const p = Game.state.systems.personalHistory;
      if (p.betrayals > 3 && Math.random() < 0.2) {
        Events.showUrgentChoice({
          type: 'urgent',
          title: 'Ritorno della fiamma',
          body: 'Un ex alleato riappare con una proposta ambigua.',
          from: 'Ex Alleato',
          urgentType: 'enemy',
          choices: {
            accept: { label: 'Accetta incarico', effects: { money: 150, coherence: -10 } },
            refuse: { label: 'Rifiuta', effects: { reputazione: -3, stress: 2 } },
          },
          _resolve: (choiceKey) => {
            if (choiceKey === 'refuse') p.stigma += 10;
          },
        });
      }
    },
  };

  /* =========================================================
     9) MACRO-EVENTI GLOBALI (economia, pandemia, guerra)
     ========================================================= */
  const GlobalCrisis = {
    initState() {
      ensureRootState();
      if (Game.state.systems.globalCrisis) return;
      Game.state.systems.globalCrisis = {
        active: null, // { type, severity, duration }
      };
    },

    maybeStartCrisis() {
      const gc = Game.state.systems.globalCrisis;
      if (gc.active) return;
      if (Math.random() > 0.08) return;

      const types = ['economico', 'sanitario', 'militare'];
      const type = types[Math.floor(Math.random() * types.length)];
      const severity = 1 + Math.floor(Math.random() * 5);
      const duration = 4 + Math.floor(Math.random() * 8);
      gc.active = { type, severity, duration };

      Game.addWorkNotif('Macro-crisi globale', 'Iniziata crisi ' + type + ' (gravita ' + severity + ').', 'Giorno ' + Game.state.day);
    },

    tickCrisis() {
      const gc = Game.state.systems.globalCrisis;
      if (!gc.active) return;
      const c = gc.active;

      if (c.type === 'economico') {
        Game.changeMoney(-40 * c.severity);
        Game.state.debt = (Game.state.debt || 0) + 10 * c.severity;
      }

      if (c.type === 'sanitario') {
        // Formula: salute = salute * (1 - 0.03 * severity)
        const health = Game.state.stats ? (Game.state.stats.salute || 100) : 100;
        const next = Math.round(health * (1 - 0.03 * c.severity));
        if (Game.state.stats) Game.state.stats.salute = clamp(next, 0, 100);
        Game.changeStat('stress', 2 * c.severity);
      }

      if (c.type === 'militare') {
        Game.changeReputazione(-2 * c.severity, 'nazionale');
        Game.changeStat('stress', 3 * c.severity);
      }

      c.duration -= 1;
      if (c.duration <= 0) {
        Game.addWorkNotif('Fine macro-crisi', 'La crisi globale e rientrata.', 'Giorno ' + Game.state.day);
        gc.active = null;
      }
    },

    coalitionMalusIfAuthoritarianResponse(severity) {
      // Formula requested: coalitionMalus = -15 + 0.1 * severity
      return -15 + 0.1 * severity;
    },
  };

  /* =========================================================
     BOOTSTRAP
     ========================================================= */
  function initAll() {
    DeepState.initState();
    SocialCrisis.initState();
    IntelligenceOps.initState();
    NarrativeSystem.initState();
    PowerInfrastructure.initState();
    NPCNetwork.initState();
    ChainEvents.initState();
    PersonalHistory.initState();
    GlobalCrisis.initState();

    Game.on('new-day', () => {
      DeepState.onNewDay();
      SocialCrisis.onNewDay();
      IntelligenceOps.onNewDay();
      NarrativeSystem.onNewDay();
      PowerInfrastructure.onNewDay();
      NPCNetwork.onNewDay();
      ChainEvents.tickAll();
      PersonalHistory.onNewDay();
      GlobalCrisis.maybeStartCrisis();
      GlobalCrisis.tickCrisis();
    });

    // Example hook: keep narrative tied to coherence deltas.
    Game.on('stat-change', (d) => {
      if (d && d.stat === 'coherence') {
        NarrativeSystem.onCampaignEvent(d.delta || 0);
        if ((d.delta || 0) < 0) {
          const ds = Game.state.systems.deepState;
          if (ds) ds.incoherenceCount += 1;
        }
      }
    });
  }

  return {
    initAll,
    modules: {
      DeepState,
      SocialCrisis,
      IntelligenceOps,
      NarrativeSystem,
      PowerInfrastructure,
      NPCNetwork,
      ChainEvents,
      PersonalHistory,
      GlobalCrisis,
    },
  };
})();

/*
  Suggested runtime mount (example):

  if (typeof SystemsBlueprint !== 'undefined') {
    SystemsBlueprint.initAll();
  }
*/
