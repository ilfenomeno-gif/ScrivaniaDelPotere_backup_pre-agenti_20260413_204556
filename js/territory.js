/* ============================================
   TERRITORY — Uscita sul Territorio (v2)
   ============================================ */

const Territory = {
    LOCATIONS: [
        {
            id: 'mentore',
            name: '🧭 Agenda Mentore',
            desc: 'Azioni speciali sbloccate dal tuo mentore.',
            apCost: 1,
            moneyCost: 0,
            hasSubActions: true,
            subActions: [
                {
                    id: 'assemblea_centro',
                    label: '🚩 Assemblea al Centro Sociale',
                    desc: '+5 Morale, +3 Autenticita, -5 Stress',
                    mentorRequirement: 'mentorActionAssemblea',
                    custom: true,
                },
                {
                    id: 'aperitivo_lobbisti',
                    label: '⚖️ Aperitivo con Lobbisti',
                    desc: 'Costa €30, +5 Reputazione, +3 Carisma, 1 contatto',
                    mentorRequirement: 'mentorActionLobbyAperitivo',
                    custom: true,
                },
                {
                    id: 'simulazione_bilancio',
                    label: '📊 Simulazione di Bilancio',
                    desc: '+5 Intelligenza, +3 Reputazione',
                    mentorRequirement: 'mentorActionBilancio',
                    custom: true,
                },
                {
                    id: 'pattuglia_quartiere',
                    label: '🦅 Pattuglia di Quartiere',
                    desc: '+5 Reputazione, +3 Stress, riduci rischio locale',
                    mentorRequirement: 'mentorActionPattuglia',
                    custom: true,
                },
                {
                    id: 'lettura_meditazione',
                    label: '🛤️ Lettura e Meditazione',
                    desc: '-10 Stress, +5 Intelligenza, +3 Coerenza',
                    mentorRequirement: 'mentorActionMeditazione',
                    custom: true,
                },
                {
                    id: 'cena_autofinanziamento',
                    label: '🍝 Cena di autofinanziamento',
                    desc: '+10 Reputazione, +5 Morale (ogni 5 giorni)',
                    mentorRequirement: 'mentorActionAutofinanziamento',
                    custom: true,
                },
            ],
        },
        {
            id: 'bar',
            name: '🍺 Bar del Quartiere',
            desc: 'Il centro nevralgico dei pettegolezzi e degli umori popolari.',
            apCost: 1,
            moneyCost: 5,
            hasSubActions: true,
            subActions: [
                {
                    id: 'ascolta',
                    label: '👂 Ascolta i discorsi',
                    desc: 'Raccogli info e possibili contatti. Rischio: ti riconoscono.',
                    effects: { stress: -5, morale: 5 },
                    alwaysTryContact: true,
                    riskChance: 0.1,
                    riskText: 'Qualcuno ti ha riconosciuto come politico. Ti guardano con sospetto.',
                    riskEffects: { reputazione: -2 },
                },
                {
                    id: 'offri_giro',
                    label: '🍻 Offri un giro a tutti',
                    desc: 'Popolarità +8, ma costa €30. Bonus: giro gratis!',
                    extraMoneyCost: 30,
                    effects: { reputazione: 8, morale: 10, stanchezza: 6 },
                    bonusChance: 0.3,
                    bonusText: 'Il barista ti offre il giro successivo! +€15, Morale +5.',
                    bonusEffects: { money: 15, morale: 5 },
                },
                {
                    id: 'lamentela',
                    label: '😤 Unisciti alle lamentele',
                    desc: 'Cavalca il malcontento. Rischio: ti credono estremista.',
                    effects: { reputazione: 5, stress: -5 },
                    riskChance: 0.3,
                    riskText: 'Hai esagerato con le critiche. Sembri un estremista.',
                    riskEffects: { reputazione: -3, coherence: -10 },
                },
                {
                    id: 'chiedi_in_giro',
                    label: '🔍 Chiedi in giro',
                    desc: 'Raccogli voci e soffiate dal barista. Costa €5.',
                    custom: true,
                },
            ],
        },
        {
            id: 'parrocchia',
            name: '⛪ Parrocchia / Centro Sociale',
            desc: 'Consenso tra gente con valori forti. L\'ideologia conta molto qui per il "rimorchio" politico.',
            apCost: 2,
            moneyCost: 0,
            effects: { stress: -8, morale: 10, stanchezza: 5 },
            reputazioneBonus: 5,
            risks: [
                { chance: 0.1, text: 'Il parroco ti ha fatto una ramanzina. Stress +10.', effects: { stress: 10 } },
            ],
            bonuses: [
                { chance: 0.3, text: 'I parrocchiani ti adorano! Reputazione +6.', effects: { reputazione: 6, autenticita: 2 } },
                { chance: 0.2, text: 'Hai trovato pace interiore. Coerenza +5.', effects: { coherence: 5 } },
            ],
            ideologyMatters: true, // ideology affects relationship gains here
            canMeetPartner: true,
        },
        {
            id: 'palestra',
            name: '🏋️ Palestra / Parco',
            desc: 'Salute, muscoli, nuove conoscenze. Possibilità di incontrare qualcuno di speciale...',
            apCost: 1,
            moneyCost: 15,
            effects: { salute: 8, stanchezza: 10, stress: -5 },
            attributeBonus: { muscoli: 3 },
            risks: [
                { chance: 0.05, text: 'Ti sei fatto male in palestra! Salute -10.', effects: { salute: -10 } },
            ],
            bonuses: [
                { chance: 0.2, text: 'Hai conosciuto un nuovo alleato in palestra!', effects: { carisma: 2 }, newContact: true },
                { chance: 0.15, text: 'Allenamento perfetto! Muscoli +5, Salute +5.', effects: { muscoli: 5, salute: 5 } },
            ],
            canMeetPartner: true,
        },
        {
            id: 'lavoro',
            name: '💼 Posto di Lavoro',
            desc: 'Scegli: Straordinari per soldi, o Pausa Caffè Politica per convincere i colleghi.',
            apCost: 1,
            moneyCost: 0,
            hasSubActions: true,
            subActions: [
                {
                    id: 'straordinari',
                    label: '💰 Straordinari',
                    desc: '+€70, Stanchezza +15. Rischio: Stress +10.',
                    effects: { stanchezza: 15, stress: 3 },
                    moneyReward: 70,
                    riskChance: 0.4,
                    riskText: 'Straordinari pesantissimi. Stress +10.',
                    riskEffects: { stress: 10 },
                    bonusChance: 0.2,
                    bonusText: 'Il capo è impressionato! Carriera +10.',
                    careerProgress: 10,
                },
                {
                    id: 'pausa-caffe',
                    label: '☕ Pausa Caffè Politica',
                    desc: 'Convinci i colleghi (Carisma). Rischio: il capo ti becca.',
                    effects: { stanchezza: 5 },
                    moneyReward: 0,
                    usesCompetenza: true,
                    riskChance: 0.25,
                    riskText: 'Il capo ti becca! "Qui si lavora, non si fa politica!" Stress +15.',
                    riskEffects: { stress: 15 },
                    bonusChance: 0.3,
                    bonusText: 'Hai convinto un collega! Reputazione +5, Carisma +1.',
                    bonusEffects: { reputazione: 5, carisma: 1 },
                },
            ],
        },
        {
            id: 'piazza_comune',
            name: '🏘️ Piazza del Paese',
            desc: 'Il cuore del comune: incontri quasi certi e consenso faccia a faccia.',
            apCost: 1,
            moneyCost: 0,
            effects: { morale: 4, reputazione: 3 },
            alwaysTryContact: true,
            condition: () => Game.state.cityFlags && Game.state.cityFlags.settlementType === 'comune',
        },
        {
            id: 'chiesa_comune',
            name: '⛪ Chiesa del Borgo',
            desc: 'Silenzio, rete locale e coerenza politica.',
            apCost: 1,
            moneyCost: 0,
            effects: { stress: -10, coherence: 4 },
            condition: () => Game.state.cityFlags && Game.state.cityFlags.settlementType === 'comune',
        },
        {
            id: 'campo_sportivo',
            name: '⚽ Campo Sportivo',
            desc: 'Allenamento e relazioni con i giovani del territorio.',
            apCost: 1,
            moneyCost: 5,
            effects: { muscoli: 3, reputazione: 2, stanchezza: 4 },
            condition: () => Game.state.cityFlags && Game.state.cityFlags.settlementType === 'comune',
        },
        {
            id: 'consiglio_aperto',
            name: '🏛️ Consiglio Comunale Aperto',
            desc: 'Proponi una mozione pubblica (richiede firme, costa 2 PA).',
            apCost: 2,
            moneyCost: 0,
            hasSubActions: true,
            condition: () => Game.state.cityFlags && Game.state.cityFlags.settlementType === 'comune',
            subActions: [
                {
                    id: 'proponi_mozione',
                    label: '📜 Proponi mozione civica',
                    desc: 'Serve almeno 5 firme. Se passa ottieni prestigio locale permanente.',
                    custom: true,
                },
            ],
        },
    ],

    BAR_CONTACTS_POOL: [
        { name: 'Giuseppe Ferretti', role: 'Operaio', emoji: '🔧', ideology: 'populista', bio: 'Ex elettore M5S. Mani callose e opinioni forti al bancone.' },
        { name: 'Pino Caruso', role: 'Pensionato', emoji: '👴', ideology: 'centro', bio: 'Al bar dalle 7. Vota chi governa meglio, cambia ogni volta.' },
        { name: 'Marta Galli', role: 'Barista', emoji: '🍸', ideology: 'estrema-sinistra', bio: 'Tessera CGIL e spilletta AVS. Ascolta tutti, non dimentica nulla.' },
        { name: 'Tonino Bassi', role: 'Artigiano', emoji: '🪚', ideology: 'estrema-destra', bio: 'Bottega storica. "Prima gli artigiani italiani", ripete sempre.' },
        { name: 'Carmela Russo', role: 'Casalinga', emoji: '🏠', ideology: 'centro', bio: 'Conosce tutti in parrocchia. Vota "chi sembra serio".' },
    ],

    NEW_CONTACTS_POOL: [
        { name: 'Matteo Greco', role: 'Personal Trainer', emoji: '💪', ideology: 'centro', bio: 'Fisico perfetto, podcast liberale. Cita Draghi in palestra.' },
        { name: 'Claudia Ricci', role: 'Runner', emoji: '🏃\u200d♀️', ideology: 'estrema-sinistra', bio: 'Maratoneta e attivista Fridays. Non si ferma mai.' },
        { name: 'Simone Vitale', role: 'Studente', emoji: '🎓', ideology: 'populista', bio: 'Giovane e idealista. "Apriremo il Parlamento come una scatoletta."' },
        { name: 'Laura Colombo', role: 'Infermiera', emoji: '🏥', ideology: 'centro', bio: 'Sempre stanca, sempre presente. Vota chi promette sanità.' },
    ],

    PARTNER_POOL: {
        M: [
            { name: 'Valentina Santi', emoji: '💃', profession: 'avvocata' },
            { name: 'Martina De Luca', emoji: '🌺', profession: 'influencer' },
            { name: 'Silvia Fabbri', emoji: '🌸', profession: 'insegnante' },
        ],
        F: [
            { name: 'Andrea Marchetti', emoji: '🏃\u200d♂️', profession: 'avvocato' },
            { name: 'Tommaso Villa', emoji: '💪', profession: 'imprenditore' },
            { name: 'Nicola Pellegrini', emoji: '🎸', profession: 'influencer' },
        ],
        X: [
            { name: 'Sam Rinaldi', emoji: '🌟', profession: 'avvocato' },
            { name: 'Alex Fontana', emoji: '🎭', profession: 'influencer' },
        ],
    },

    // Profession bonuses for partners
    PARTNER_PROFESSIONS: {
        'avvocato': { label: '⚖️ Avvocato/a', bonus: 'Scandali costano -50% stress', effect: 'legalShield' },
        'avvocata': { label: '⚖️ Avvocato/a', bonus: 'Scandali costano -50% stress', effect: 'legalShield' },
        'influencer': { label: '📱 Influencer', bonus: '+30% reputazione da social', effect: 'socialBoost' },
        'insegnante': { label: '📚 Insegnante', bonus: '+2 Intelligenza al riposo', effect: 'eduBoost' },
        'imprenditore': { label: '💼 Imprenditore', bonus: '+€20 al giorno', effect: 'moneyBoost' },
    },

    init() {
        Game.on('panel-open', (data) => {
            if (data.panel === 'territory') this.render();
        });

        // Territory tab switching (Luoghi / Mappa)
        document.querySelectorAll('.territory-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.territory-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.territory-tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.dataset.ttab;
                document.getElementById(`ttab-${target}`).classList.add('active');
                if (target === 'mappa') GameMap.renderMapPanel();
            });
        });
    },

    getMentorSubActions() {
        const mentorState = Game.state.flags && Game.state.flags.mentor;
        if (!mentorState || !mentorState.active || !mentorState.specialUnlocked) return [];
        if (typeof Character === 'undefined' || !Character.getMentorData) return [];

        const mentorData = Character.getMentorData(mentorState.selectedId || mentorState.id);
        if (!mentorData) return [];

        let actions = (mentorData.specialActions || []).slice();
        const unlocked = mentorState.unlockedActionIds || [];
        if (unlocked.length > 0) {
            actions = actions.filter(a => unlocked.includes(a.id) || a.id === 'assemblea_centro' || a.id === 'lettura_meditazione');
        }

        return actions.map(a => {
            const last = (mentorState.lastActionDay && mentorState.lastActionDay[a.id]) || -9999;
            const remaining = Math.max(0, (a.cooldown || 0) - (Game.state.day - last));
            return {
                ...a,
                _cooldownRemaining: remaining,
            };
        });
    },

    render() {
        const container = document.getElementById('territory-locations');
        if (!container) return;
        const noAP = !Game.hasActionPoints(1);
        const visibleLocations = this.LOCATIONS.filter(loc => !loc.condition || loc.condition());

        container.innerHTML = visibleLocations.map(loc => {
            const canAfford = Game.state.money >= (loc.moneyCost || 0);
            const needsAP = loc.apCost || 1;
            const disabled = !Game.hasActionPoints(needsAP) || !canAfford;

            if (loc.hasSubActions) {
                let visibleSubActions = [];
                if (loc.id === 'mentore') {
                    visibleSubActions = this.getMentorSubActions();
                } else {
                    visibleSubActions = loc.subActions.filter(sub => {
                        if (!sub.mentorRequirement) return true;
                        return !!(Game.state.flags && Game.state.flags[sub.mentorRequirement]);
                    });
                    if (visibleSubActions.length === 0) return '';
                }
                return `
                    <div class="territory-location ${disabled ? 'location-disabled' : ''}" data-loc="${loc.id}">
                        <div class="location-header">
                            <span class="location-name">${loc.name}</span>
                            <span class="location-cost">
                                <span class="task-ap-cost">${needsAP} PA</span>
                            </span>
                        </div>
                        <div class="location-desc">${loc.desc}</div>
                        ${loc.id === 'mentore' && visibleSubActions.length === 0 ? '<div class="location-effects">Completa gli eventi del mentore per sbloccare azioni speciali.</div>' : ''}
                        <div class="location-subactions">
                            ${visibleSubActions.map(sub => `
                                <button class="location-sub-btn" data-loc="${loc.id}" data-sub="${sub.id}" ${disabled || (sub._cooldownRemaining > 0) ? 'disabled' : ''}>
                                    <span class="sub-label">${sub.label}</span>
                                    <span class="sub-desc">${sub.desc}${sub._cooldownRemaining > 0 ? ` (CD ${sub._cooldownRemaining}g)` : ''}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            return `
                <div class="territory-location ${disabled ? 'location-disabled' : ''}" data-loc="${loc.id}">
                    <div class="location-header">
                        <span class="location-name">${loc.name}</span>
                        <span class="location-cost">
                            <span class="task-ap-cost">${needsAP} PA</span>
                            ${loc.moneyCost ? `<span class="location-money">€${loc.moneyCost}</span>` : ''}
                        </span>
                    </div>
                    <div class="location-desc">${loc.desc}</div>
                    <div class="location-effects">${this._locPreview(loc)}</div>
                    <button class="location-go-btn" data-loc="${loc.id}" ${disabled ? 'disabled' : ''}>
                        ${disabled ? (!Game.hasActionPoints(needsAP) ? '⚠️ No PA' : '💸 No fondi') : '🚶 Vai'}
                    </button>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.location-go-btn').forEach(btn => {
            btn.addEventListener('click', () => this.visitLocation(btn.dataset.loc));
        });
        container.querySelectorAll('.location-sub-btn').forEach(btn => {
            btn.addEventListener('click', () => this.visitLocationSubAction(btn.dataset.loc, btn.dataset.sub));
        });
    },

    visitLocation(locId) {
        const loc = this.LOCATIONS.find(l => l.id === locId);
        if (!loc || loc.hasSubActions) return;
        if (loc.condition && !loc.condition()) return;
        if (!Game.spendActionPoint(loc.apCost)) {
            Game.emit('no-ap', { reason: 'Punti azione esauriti!' });
            return;
        }
        if (loc.moneyCost && Game.state.money < loc.moneyCost) return;
        if (loc.moneyCost) Game.changeMoney(-loc.moneyCost);

        // Base effects
        this.applyEffects(loc.effects);
        if (loc.reputazioneBonus) Game.changeReputazione(loc.reputazioneBonus);
        if (loc.moneyReward) Game.changeMoney(loc.moneyReward);
        if (loc.attributeBonus) {
            Object.entries(loc.attributeBonus).forEach(([attr, val]) => {
                Game.changeAttribute(attr, val);
            });
        }

        let resultText = `Sei andato a ${loc.name.replace(/^[^\s]+\s/, '')}.`;

        // Bar: "Ascolta i discorsi" — always try to add a contact
        if (loc.alwaysTryContact) {
            const added = this.addBarContact();
            if (added) {
                resultText += ' 👂 Hai ascoltato i discorsi e conosciuto qualcuno di nuovo!';
            } else {
                resultText += ' 👂 Hai ascoltato, ma nessuna faccia nuova oggi.';
            }
        }

        // Ideology matters at parrocchia: same ideology = bonus relation with all contacts
        if (loc.ideologyMatters) {
            const ideoClass = Game.getIdeologyClass();
            Game.state.contacts.forEach(c => {
                if (c.ideology === Game.state.character.ideology) {
                    c.relation = Math.min(100, c.relation + 3);
                }
            });
            resultText += ' Rispetto guadagnato tra chi condivide i tuoi valori.';
        }

        // Tecnocrate bar penalty
        if (locId === 'bar' && Game.getIdeologyClass().barPenalty) {
            Game.changeStat('morale', -5);
            resultText += ' 📊 Sei un tecnocrate... la gente al bar ti trova noioso.';
        }

        // Check risks
        for (const risk of (loc.risks || [])) {
            if (Math.random() < risk.chance) {
                resultText += ` ${risk.text}`;
                this.applyEffects(risk.effects);
                break;
            }
        }

        // Check bonuses
        for (const bonus of (loc.bonuses || [])) {
            if (Math.random() < bonus.chance) {
                resultText += ` ${bonus.text}`;
                if (bonus.effects) this.applyEffects(bonus.effects);
                if (bonus.newContact) this.addRandomContact();
                break;
            }
        }

        // Partner "rimorchio" mechanic
        if (loc.canMeetPartner && !Game.state.partner && Math.random() < 0.2) {
            this.meetPartner();
            resultText += ' 💕 Hai conosciuto qualcuno di speciale!';
        }

        Game.addWorkNotif(`🏘️ ${loc.name}`, resultText, `Giorno ${Game.state.day}`);
        this.render();
    },

    visitLocationSubAction(locId, subId) {
        const loc = this.LOCATIONS.find(l => l.id === locId);
        if (!loc || !loc.hasSubActions) return;
        if (loc.condition && !loc.condition()) return;

        if (subId === 'proponi_mozione') {
            const ok = Game.runCityPhoneAction ? Game.runCityPhoneAction('consiglio-comunale-aperto') : false;
            if (!ok) Game.addWorkNotif('🏛️ Consiglio Aperto', 'Azione non disponibile o requisiti non soddisfatti.', `Giorno ${Game.state.day}`);
            this.render();
            return;
        }

        if (locId === 'mentore') {
            const mentorState = Game.state.flags && Game.state.flags.mentor;
            if (!mentorState || !mentorState.active || !mentorState.specialUnlocked) {
                Game.addWorkNotif('🧭 Agenda Mentore', 'Nessuna azione speciale disponibile.', `Giorno ${Game.state.day}`);
                return;
            }
            const sub = this.getMentorSubActions().find(s => s.id === subId);
            if (!sub) return;
            if (sub._cooldownRemaining > 0) {
                Game.addWorkNotif('⏳ Cooldown', `${sub.label} disponibile tra ${sub._cooldownRemaining} giorni.`, `Giorno ${Game.state.day}`);
                return;
            }

            const apCost = sub.costPA || loc.apCost || 1;
            if (!Game.spendActionPoint(apCost)) {
                Game.emit('no-ap', { reason: 'Punti azione esauriti!' });
                return;
            }
            const moneyCost = sub.costMoney || 0;
            if (moneyCost > 0 && Game.state.money < moneyCost) {
                Game.state.actionPoints += apCost;
                Game.emit('ap-change', { ap: Game.state.actionPoints });
                Game.addWorkNotif('💸 Fondi insufficienti', `Servono €${moneyCost} per questa azione.`, `Giorno ${Game.state.day}`);
                return;
            }
            if (moneyCost > 0) Game.changeMoney(-moneyCost);

            this.applyEffects(sub.effect || {});
            if (sub.effect && sub.effect.followers) {
                if (!Game.state.social) Game.state.social = {};
                Game.state.social.followers = (Game.state.social.followers || 0) + sub.effect.followers;
            }
            if (sub.effect && sub.effect.careerProgress) {
                Game.state.career.promotionProgress = Math.min(100, (Game.state.career.promotionProgress || 0) + sub.effect.careerProgress);
            }

            mentorState.lastActionDay = mentorState.lastActionDay || {};
            mentorState.lastActionDay[sub.id] = Game.state.day;
            Game.addWorkNotif('🧭 Agenda Mentore', `${sub.label} completata.`, `Giorno ${Game.state.day}`);
            this.render();
            return;
        }

        const sub = loc.subActions.find(s => s.id === subId);
        if (!sub) return;

        // Custom action: delegate to Intel module
        if (sub.custom && subId === 'chiedi_in_giro') {
            if (typeof Intel !== 'undefined') Intel.askAround('barista');
            return;
        }

        if (sub.custom && locId === 'mentore') {
            if (!Game.spendActionPoint(loc.apCost)) {
                Game.emit('no-ap', { reason: 'Punti azione esauriti!' });
                return;
            }

            if (subId === 'assemblea_centro') {
                Game.changeStat('morale', 5);
                Game.changeAttribute('autenticita', 3);
                Game.changeStat('stress', -5);
            } else if (subId === 'aperitivo_lobbisti') {
                if (Game.state.money < 30) {
                    Game.state.actionPoints++;
                    Game.emit('ap-change', { ap: Game.state.actionPoints });
                    Game.addWorkNotif('⚖️ Lobby', 'Servono €30 per l\'aperitivo.', `Giorno ${Game.state.day}`);
                    return;
                }
                Game.changeMoney(-30);
                Game.changeReputazione(5);
                Game.changeAttribute('carisma', 3);
                this.addRandomContact();
                Game.state.flags.lobbyFavors = (Game.state.flags.lobbyFavors || 0) + 1;
            } else if (subId === 'simulazione_bilancio') {
                Game.changeAttribute('intelligenza', 5);
                Game.changeReputazione(3);
            } else if (subId === 'pattuglia_quartiere') {
                Game.changeReputazione(5);
                Game.changeStat('stress', 3);
                if (Game.state.mafia) {
                    Game.state.mafia.rischioIndagini = Math.max(0, (Game.state.mafia.rischioIndagini || 0) - 3);
                }
            } else if (subId === 'lettura_meditazione') {
                Game.changeStat('stress', -10);
                Game.changeAttribute('intelligenza', 5);
                Game.changeStat('coherence', 3);
            } else if (subId === 'cena_autofinanziamento') {
                const lastDay = Game.state.flags.lastAutofinanziamentoDay || 0;
                if (Game.state.day - lastDay < 5) {
                    Game.state.actionPoints++;
                    Game.emit('ap-change', { ap: Game.state.actionPoints });
                    Game.addWorkNotif('🍝 Centro Sociale', 'Questa azione e disponibile ogni 5 giorni.', `Giorno ${Game.state.day}`);
                    return;
                }
                Game.state.flags.lastAutofinanziamentoDay = Game.state.day;
                Game.changeReputazione(10);
                Game.changeStat('morale', 5);
            }

            Game.addWorkNotif('🧭 Agenda Mentore', `${sub.label} completata.`, `Giorno ${Game.state.day}`);
            this.render();
            return;
        }

        if (!Game.spendActionPoint(loc.apCost)) {
            Game.emit('no-ap', { reason: 'Punti azione esauriti!' });
            return;
        }

        // Extra money cost for specific sub-actions (e.g. "Offri un giro")
        if (sub.extraMoneyCost) {
            if (Game.state.money < sub.extraMoneyCost) {
                Game.addWorkNotif('💸 Fondi insufficienti', `Servono €${sub.extraMoneyCost} per questa azione.`, `Giorno ${Game.state.day}`);
                // Refund AP
                Game.state.actionPoints++;
                Game.emit('ap-change', { ap: Game.state.actionPoints });
                return;
            }
            Game.changeMoney(-sub.extraMoneyCost);
        }

        // Base effects
        this.applyEffects(sub.effects);
        if (sub.moneyReward) {
            let reward = sub.moneyReward;
            // Tecnocrate bonus
            const ideoClass = Game.getIdeologyClass();
            if (ideoClass.workSalaryMultiplier) {
                reward = Math.round(reward * ideoClass.workSalaryMultiplier);
            }
            Game.changeMoney(reward);
        }

        let resultText = `${sub.label}: `;

        // Pausa Caffè Politica: success based on competenza
        if (sub.usesCompetenza) {
            const competenza = Game.state.attributes.intelligenza + Game.state.attributes.carisma;
            const successChance = Math.min(0.8, competenza / 150);
            if (Math.random() < successChance) {
                resultText += 'Hai convinto qualcuno! ';
                Game.changeReputazione(4);
                Game.changeAttribute('carisma', 1);
            } else {
                resultText += 'Non sei stato convincente. ';
                Game.changeStat('stress', 5);
            }
        }

        // Flat risk/bonus system (mutually exclusive)
        if (sub.riskChance && Math.random() < sub.riskChance) {
            resultText += ' ' + sub.riskText;
            if (sub.riskEffects) this.applyEffects(sub.riskEffects);
        } else if (sub.bonusChance && Math.random() < sub.bonusChance) {
            resultText += ' ' + (sub.bonusText || '');
            if (sub.bonusEffects) this.applyEffects(sub.bonusEffects);
            if (sub.careerProgress) {
                Game.state.career.promotionProgress += sub.careerProgress;
                if (Game.state.career.promotionProgress >= 100) Game.promoteCareer();
            }
        }

        // "Ascolta i discorsi" — try to add bar contact
        if (sub.alwaysTryContact) {
            const added = this.addBarContact();
            resultText += added ? ' 👂 Nuovo contatto!' : ' 👂 Nessuna faccia nuova.';
        }

        // Tecnocrate bar penalty
        if (locId === 'bar' && Game.getIdeologyClass().barPenalty) {
            Game.changeStat('morale', -5);
            resultText += ' 📊 Sei un tecnocrate... la gente al bar ti trova noioso.';
        }

        Game.addWorkNotif(`🏘️ ${loc.name}`, resultText, `Giorno ${Game.state.day}`);
        this.render();
    },

    applyEffects(effects) {
        if (effects.stress) Game.changeStat('stress', effects.stress);
        if (effects.morale) Game.changeStat('morale', effects.morale);
        if (effects.stanchezza) Game.changeStat('stanchezza', effects.stanchezza);
        if (effects.salute) Game.changeStat('salute', effects.salute);
        if (effects.reputazione) Game.changeReputazione(effects.reputazione);
        if (effects.coherence) Game.changeStat('coherence', effects.coherence);
        if (effects.intelligenza) Game.changeAttribute('intelligenza', effects.intelligenza);
        if (effects.muscoli) Game.changeAttribute('muscoli', effects.muscoli);
        if (effects.carisma) Game.changeAttribute('carisma', effects.carisma);
        if (effects.autenticita) Game.changeAttribute('autenticita', effects.autenticita);
        if (effects.estetica) Game.changeAttribute('estetica', effects.estetica);
    },

    addBarContact() {
        const pool = this.BAR_CONTACTS_POOL.filter(c =>
            !Game.state.contacts.some(existing => existing.name === c.name)
        );
        if (pool.length === 0) return false;
        // Base 50% chance, boosted by city networking bonus
        const networkBonus = (typeof GameMap !== 'undefined') ? GameMap.getNetworkingBonus() : 1;
        if (Math.random() > 0.5 * networkBonus) return false;
        const newC = pool[Math.floor(Math.random() * pool.length)];
        const playerIdeology = Game.state.character.ideology;
        const stance = Game.getCoalitionStance(playerIdeology, newC.ideology);
        const canAlly = stance !== 'nemico';
        const stanceMod = Game.COALITION_RELATION_MOD[stance] || 0;

        Game.state.contacts.push({
            ...newC,
            relation: Math.max(5, 30 + stanceMod + Math.floor(Math.random() * 20)),
            loyalty: 30 + Math.floor(Math.random() * 20),
            betrayed: false,
            favorite: false,
            canAlly,
            coalitionStance: stance,
        });
        Game.addWorkNotif('👂 Ascolta i discorsi', `Hai conosciuto ${newC.name} (${newC.role}) al bar!`, `Giorno ${Game.state.day}`);
        Phone.showPushNotif(`👋 ${newC.name}`, `Nuovo contatto dal bar!`);
        return true;
    },

    addRandomContact() {
        const pool = this.NEW_CONTACTS_POOL.filter(c =>
            !Game.state.contacts.some(existing => existing.name === c.name)
        );
        if (pool.length === 0) return;
        const newC = pool[Math.floor(Math.random() * pool.length)];
        const playerIdeology = Game.state.character.ideology;
        const stance = Game.getCoalitionStance(playerIdeology, newC.ideology);
        const canAlly = stance !== 'nemico';
        const stanceMod = Game.COALITION_RELATION_MOD[stance] || 0;

        Game.state.contacts.push({
            ...newC,
            relation: Math.max(5, 40 + stanceMod + Math.floor(Math.random() * 20)),
            loyalty: 40 + Math.floor(Math.random() * 20),
            betrayed: false,
            favorite: false,
            canAlly,
            coalitionStance: stance,
        });
        Game.addWorkNotif('👋 Nuovo contatto', `Hai conosciuto ${newC.name}!`, `Giorno ${Game.state.day}`);
        Phone.showPushNotif(`👋 ${newC.name}`, `Nuovo contatto aggiunto!`);
    },

    meetPartner() {
        const gender = Game.state.character.gender;
        const pool = this.PARTNER_POOL[gender] || this.PARTNER_POOL['X'];
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        const profInfo = this.PARTNER_PROFESSIONS[chosen.profession] || {};
        Game.state.partner = {
            name: chosen.name,
            emoji: chosen.emoji,
            profession: chosen.profession,
            professionLabel: profInfo.label || chosen.profession,
            professionBonus: profInfo.bonus || '',
            professionEffect: profInfo.effect || null,
            tension: 10 + Math.floor(Math.random() * 15),
            support: 50 + Math.floor(Math.random() * 20),
            isBurden: false,
        };
        Game.addDiaryEntry(`Incontro con ${chosen.name}`, '💕');
        Phone.showPushNotif('💕 Rimorchio!', `Hai conosciuto ${chosen.name} (${profInfo.label || chosen.profession})!`);
    },

    _effectLabel: { stress: '😰', morale: '😊', stanchezza: '😴', salute: '❤️', reputazione: '⭐', coherence: '🧩' },

    _subPreview(sub) {
        const p = [];
        if (sub.effects) {
            Object.entries(sub.effects).forEach(([k, v]) => {
                p.push((this._effectLabel[k] || k) + (v > 0 ? '+' : '') + v);
            });
        }
        if (sub.extraMoneyCost) p.push('€-' + sub.extraMoneyCost);
        if (sub.moneyReward) p.push('€+' + sub.moneyReward);
        if (sub.riskChance) p.push('⚠️' + Math.round(sub.riskChance * 100) + '% rischio');
        if (sub.bonusChance) p.push('✨' + Math.round(sub.bonusChance * 100) + '% bonus');
        return p.join(' | ').replace(/"/g, '&quot;');
    },

    _locPreview(loc) {
        const p = [];
        if (loc.effects) {
            Object.entries(loc.effects).forEach(([k, v]) => {
                p.push((this._effectLabel[k] || k) + (v > 0 ? '+' : '') + v);
            });
        }
        if (loc.reputazioneBonus) p.push('⭐+' + loc.reputazioneBonus);
        if (loc.attributeBonus) {
            const al = { muscoli: '💪', intelligenza: '🧠', carisma: '✨', estetica: '🪞', autenticita: '🗣️' };
            Object.entries(loc.attributeBonus).forEach(([k, v]) => p.push((al[k] || k) + '+' + v));
        }
        if (loc.canMeetPartner) p.push('💕 possibile incontro');
        return p.join(' | ').replace(/"/g, '&quot;');
    },

    offerCorruption() {
        if (Game.state.career.corrupted) return;
        // Show as urgent message — player can decide passively
        Game.addUrgentMessage('Collega Sospetto', 'Ti propongono di deviare fondi pubblici verso il partito. €200 subito, ma rischi grosso...', 'boss');
        // Auto-accept for now (simplified): money + corruption risk
        Game.changeMoney(200);
        Game.state.career.corruptionRisk += 20;
        if (Game.state.career.corruptionRisk >= 50) {
            Game.state.career.corrupted = true;
        }
        Game.changeStat('stress', 10);
    },
};
