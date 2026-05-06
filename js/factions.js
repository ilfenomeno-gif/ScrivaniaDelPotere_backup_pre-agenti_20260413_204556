/* ============================================
   FACTIONS — Il Comitato Centrale
   Correnti interne al Partito
   ============================================ */

const Factions = {
    CURRENTS: {
        giovani: {
            id: 'giovani',
            name: 'I Giovani Turchi',
            icon: '⚡',
            desc: 'Rottamatori. Puntano a far fuori i vecchi dirigenti.',
            bonus: 'Task Politici +20% efficacia',
            malus: '-15 Relazione con Mentori e Anziani',
            unlock: { reputazione: 30, coherence: 40 },
            effects: {
                politicalBonus: 1.2,
                mentorPenalty: -15,
            },
        },
        apparato: {
            id: 'apparato',
            name: "L'Apparato",
            icon: '🏛️',
            desc: 'La vecchia guardia. Nomenklatura del palazzo.',
            bonus: 'Incarichi speciali ben pagati (+€40/giorno)',
            malus: 'Azioni rivoluzionarie costano Coerenza',
            unlock: { reputazione: 40, coherence: 50 },
            effects: {
                dailyMoney: 40,
                revolutionCoherenceCost: 8,
            },
        },
        morali: {
            id: 'morali',
            name: 'I Morali',
            icon: '⚖️',
            desc: 'La coscienza critica. La minoranza etica del partito.',
            bonus: 'Dilemmi morali "giusti" danno 2x Coerenza',
            malus: 'Interagire con la Mafia = espulsione immediata',
            unlock: { reputazione: 25, coherence: 60 },
            effects: {
                dilemmaBonus: 2.0,
                mafiaGameOver: true,
            },
        },
    },

    init() {
        // Add faction state
        if (!Game.state.faction) {
            Game.state.faction = { current: null, joinedDay: 0 };
        }

        Game.on('panel-open', (data) => {
            if (data.panel === 'stats') this.injectFactionSection();
        });

        // Daily faction effects
        Game.on('time-advance', (d) => {
            if (d.timeOfDay !== 0) return;
            this.applyDailyEffects();
        });

        // Mafia interaction check for Morali
        Game.on('mafia-interaction', () => {
            if (this.getCurrentFaction()?.id === 'morali') {
                Game.triggerGameOver('I Morali ti hanno espulso per aver collaborato con la Mafia. La tua carriera politica è finita.');
            }
        });
    },

    getCurrentFaction() {
        if (!Game.state.faction?.current) return null;
        return this.CURRENTS[Game.state.faction.current] || null;
    },

    canUnlock(factionId) {
        const f = this.CURRENTS[factionId];
        if (!f) return false;
        return Game.state.reputazione >= f.unlock.reputazione &&
               Game.state.coherence >= f.unlock.coherence;
    },

    joinFaction(factionId) {
        if (!this.canUnlock(factionId)) return;
        Game.state.faction.current = factionId;
        Game.state.faction.joinedDay = Game.state.day;

        const f = this.CURRENTS[factionId];

        // Giovani Turchi: penalize mentor contacts
        if (factionId === 'giovani') {
            Game.state.contacts.forEach(c => {
                if (c.role && (c.role.includes('Mentore') || c.role.includes('Segretario') || c.role.includes('Funzionario'))) {
                    c.relation = Math.max(0, c.relation + f.effects.mentorPenalty);
                }
            });
        }

        Game.addWorkNotif(`${f.icon} Corrente`, `Ti sei unito a "${f.name}". ${f.bonus}.`, `Giorno ${Game.state.day}`);
        Game.addUrgentMessage('Comitato Centrale', `Benvenuto nella corrente "${f.name}". Le regole sono chiare.`, 'info');
    },

    leaveFaction() {
        const old = this.getCurrentFaction();
        Game.state.faction.current = null;
        if (old) {
            Game.changeStat('stress', 10);
            Game.changeReputazione(-5);
            Game.addWorkNotif('🚪 Corrente', `Hai lasciato "${old.name}". Stress +10, Reputazione -5.`, `Giorno ${Game.state.day}`);
        }
    },

    applyDailyEffects() {
        const f = this.getCurrentFaction();
        if (!f) return;

        // Apparato: daily money bonus
        if (f.id === 'apparato') {
            Game.changeMoney(f.effects.dailyMoney);
        }
    },

    // Inject faction UI into stats panel
    injectFactionSection() {
        const statsBody = document.getElementById('stats-body');
        if (!statsBody) return;

        // Remove old injection
        const old = statsBody.querySelector('.faction-section');
        if (old) old.remove();

        const section = document.createElement('div');
        section.className = 'faction-section';
        const current = this.getCurrentFaction();

        let html = `<h4 class="stats-section-title">🏛️ Comitato Centrale</h4>`;

        if (current) {
            html += `
                <div class="faction-current">
                    <div class="faction-badge">${current.icon}</div>
                    <div class="faction-info">
                        <div class="faction-name">${current.name}</div>
                        <div class="faction-bonus">✅ ${current.bonus}</div>
                        <div class="faction-malus">⚠️ ${current.malus}</div>
                        <div class="faction-joined">Membro dal giorno ${Game.state.faction.joinedDay}</div>
                    </div>
                </div>
                <button class="faction-leave-btn" id="faction-leave">🚪 Lascia Corrente</button>
            `;
        } else {
            html += `<p class="faction-hint">Raggiungi le soglie di Reputazione e Coerenza per unirti a una corrente.</p>`;
            Object.values(this.CURRENTS).forEach(f => {
                const canJoin = this.canUnlock(f.id);
                html += `
                    <div class="faction-card ${canJoin ? 'faction-available' : 'faction-locked'}">
                        <div class="faction-badge">${f.icon}</div>
                        <div class="faction-info">
                            <div class="faction-name">${f.name}</div>
                            <div class="faction-desc">${f.desc}</div>
                            <div class="faction-bonus">✅ ${f.bonus}</div>
                            <div class="faction-malus">⚠️ ${f.malus}</div>
                            <div class="faction-req">${canJoin ? '✅' : '🔒'} Rep ≥${f.unlock.reputazione}, Coerenza ≥${f.unlock.coherence}</div>
                        </div>
                        ${canJoin ? `<button class="faction-join-btn" data-faction="${f.id}">Unisciti</button>` : ''}
                    </div>
                `;
            });
        }

        section.innerHTML = html;
        statsBody.appendChild(section);

        // Bind buttons
        if (current) {
            const leaveBtn = section.querySelector('#faction-leave');
            if (leaveBtn) leaveBtn.addEventListener('click', () => { this.leaveFaction(); this.injectFactionSection(); });
        } else {
            section.querySelectorAll('.faction-join-btn').forEach(btn => {
                btn.addEventListener('click', () => { this.joinFaction(btn.dataset.faction); this.injectFactionSection(); });
            });
        }
    },

    // Public API for other modules
    getPoliticalBonus() {
        const f = this.getCurrentFaction();
        return (f?.id === 'giovani') ? f.effects.politicalBonus : 1.0;
    },

    getDilemmaBonus() {
        const f = this.getCurrentFaction();
        return (f?.id === 'morali') ? f.effects.dilemmaBonus : 1.0;
    },

    getRevolutionCost() {
        const f = this.getCurrentFaction();
        return (f?.id === 'apparato') ? f.effects.revolutionCoherenceCost : 0;
    },
};
