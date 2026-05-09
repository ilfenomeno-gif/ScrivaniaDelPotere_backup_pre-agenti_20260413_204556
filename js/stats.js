/* ============================================
   STATS — Character Profile / Scheda Personaggio
   ============================================ */

const Stats = {
    ATTR_META: {
        intelligenza: { icon: '🧠', label: 'Intelligenza (Competenza)', desc: 'Preparazione tecnica. Bassa = fatica nei dibattiti.' },
        estetica: { icon: '🪞', label: 'Estetica (Immagine)', desc: 'Immagine pubblica. Utile per social e media.' },
        autenticita: { icon: '🗣️', label: 'Autenticità (Credibilità)', desc: 'Parlare al popolo. Credibilità in periferia e centro.' },
        muscoli: { icon: '💪', label: 'Muscoli (Salute/Presenza)', desc: 'Resistenza fisica a comizi lunghi. Palestra!' },
        carisma: { icon: '✨', label: 'Carisma', desc: 'Convincere le folle e scalare il partito.' },
    },

    STAT_META: {
        stanchezza: { icon: '😴', label: 'Stanchezza (Energia)', desc: '0 = riposato, 100 = esausto', invert: true, danger: 80, dangerLabel: '⚠️ Scrivania trema, task +5 Stanch.' },
        stress: { icon: '😰', label: 'Stress', desc: 'Macchie di caffè e bruciature sulla scrivania', danger: 70, dangerLabel: '⚠️ >70: -10% efficacia | >90: -20%' },
        morale: { icon: '😊', label: 'Morale (Equilibrio)', desc: 'Relazioni e vita privata', dangerBelow: 30, dangerLabel: '⚠️ Contatti ti evitano, -20% rel.' },
        salute: { icon: '❤️', label: 'Salute', desc: 'Forma fisica generale', dangerBelow: 50, dangerLabel: '⚠️ <50: -1 PA | <20: Game Over' },
    },

    // Track deltas for arrow display
    _prevAttrs: null,
    _prevStats: null,
    _prevRep: null,
    _prevRepNaz: null,
    _prevCoherence: null,
    _prevMoney: null,
    _prevNotorieta: null,

    init() {
        Game.on('panel-open', (data) => {
            if (data.panel === 'stats') this.renderFull();
        });
        Game.on('stat-change', () => { if (document.getElementById('stats-body').innerHTML) this.renderFull(); });
        Game.on('attr-change', () => { if (document.getElementById('stats-body').innerHTML) this.renderFull(); });

        // Snapshot for delta tracking
        this.snapshotPrev();
        Game.on('stat-change', () => this.scheduleSnapshot());
        Game.on('attr-change', () => this.scheduleSnapshot());
        Game.on('money-change', () => this.scheduleSnapshot());
    },

    /** Save current values as "previous" for delta arrows — debounced */
    scheduleSnapshot() {
        clearTimeout(this._snapTimer);
        this._snapTimer = setTimeout(() => this.snapshotPrev(), 3000);
    },

    snapshotPrev() {
        const s = Game.state;
        this._prevAttrs = { ...s.attributes };
        this._prevStats = { ...s.stats };
        this._prevRep = s.reputazione;
        this._prevRepNaz = s.reputazioneNazionale;
        this._prevCoherence = s.coherence;
        this._prevMoney = s.money;
        this._prevNotorieta = s.notorieta || 0;
    },

    renderFull() {
        const container = document.getElementById('stats-body');
        container.innerHTML = this.buildStatsHTML();
        // Inject dynamic sections from new modules
        if (typeof Factions !== 'undefined' && Factions.injectFactionSection) Factions.injectFactionSection();
        if (typeof Favors !== 'undefined' && Favors.renderCreditsInStats) Favors.renderCreditsInStats();
        if (typeof Diary !== 'undefined' && Diary.injectDiarySection) Diary.injectDiarySection();
    },

    buildStatsHTML() {
        const attrs = Game.state.attributes;
        const stats = Game.state.stats;
        const rep = Game.state.reputazione;
        const money = Game.state.money;
        const name = Game.state.character.name || 'Sconosciuto';
        const ideology = Game.state.character.ideology;
        const ideoClass = Game.IDEOLOGY_CLASSES[ideology];
        const career = Game.getCareerLevel();
        const coherence = Game.state.coherence;

        let html = `<div class="stats-profile-name">${this.esc(name)}</div>`;

        // Ideology class badge
        if (ideoClass) {
            html += `<div class="stats-ideology-badge">
                <span class="ideology-icon">${ideoClass.icon}</span>
                <span class="ideology-label">${ideoClass.label}</span>
                <span class="ideology-desc">${ideoClass.desc}</span>
            </div>`;
        }

        // Career badge
        html += `<div class="stats-career-badge">
            <span>💼 ${career.label}</span>
            <span class="career-salary-badge">Stipendio: €${career.salary}</span>
            ${Game.state.career.corrupted ? '<span class="career-corrupt-badge">⚠️ Corrotto</span>' : ''}
        </div>`;

        // Campaign mode badge
        if (Game.state.gameMode === 'campaign' && Game.state.campaignObjective) {
            const obj = Game.state.campaignObjective;
            const daysLeft = Math.max(0, (obj.deadline || 365) - (Game.state.day || 0));
            html += `<div class="stats-career-badge" style="background:rgba(60,20,80,0.6);border-color:#a855f7">
                🎯 Campagna: ${this.esc(obj.label || obj.type)}
                <span style="color:${daysLeft < 30 ? '#ff4444' : '#ffd700'};margin-left:8px">⏱ ${daysLeft} giorni</span>
                ${obj.achieved ? '<span style="color:#00ff88;margin-left:8px">✅ OBIETTIVO RAGGIUNTO!</span>' : ''}
            </div>`;
        }

        // === Obiettivi di Progressione ===
        const workProgress = Math.max(0, Math.min(100, Math.round(Game.state.career.promotionProgress || 0)));
        const polProgress = Math.max(0, Math.min(100, Math.round((Game.state.politicalCareer && Game.state.politicalCareer.progress) || 0)));
        const factionProgress = this.getFactionUnlockProgress();
        html += `<div class="stats-section">
            <div class="stats-section-title">🎯 Obiettivi</div>
            ${this.goalProgressRow('💼', 'Promozione Lavorativa', workProgress, `${workProgress}% verso il prossimo livello`) }
            ${this.goalProgressRow('🏛️', 'Livello Politico', polProgress, `${polProgress}% verso la prossima carica`) }
            ${this.goalProgressRow('🤝', 'Sblocco Corrente', factionProgress.value, factionProgress.label) }
        </div>`;

        // City
        if (Game.state.city) {
            html += `<div class="stats-career-badge"><span>📍 ${this.esc(Game.state.city.name)} — ${this.esc(Game.state.city.region)}</span></div>`;
        }

        // === Active danger warnings banner ===
        const dangers = this.getActiveDangers();
        if (dangers.length > 0) {
            html += `<div class="stats-danger-banner">`;
            dangers.forEach(d => {
                html += `<div class="stats-danger-item">${d}</div>`;
            });
            html += `</div>`;
        }

        // === Attributes ===
        html += `<div class="stats-section"><div class="stats-section-title">🧠 Competenze e Immagine</div>`;
        for (const [key, meta] of Object.entries(this.ATTR_META)) {
            const val = attrs[key];
            const prev = this._prevAttrs ? this._prevAttrs[key] : val;
            const delta = val - prev;
            html += this.barRow(meta.icon, meta.label, val, 100, meta.desc, this.attrColor(val), delta);
        }
        html += `</div>`;

        // === Dynamic Stats ===
        html += `<div class="stats-section"><div class="stats-section-title">😰 Stato Psicofisico</div>`;
        for (const [key, meta] of Object.entries(this.STAT_META)) {
            const val = stats[key];
            const prev = this._prevStats ? this._prevStats[key] : val;
            const delta = val - prev;
            const color = meta.invert ? this.invertColor(val) : this.attrColor(val);
            const inDanger = (meta.danger && val >= meta.danger) || (meta.dangerBelow && val <= meta.dangerBelow);
            html += this.barRow(meta.icon, meta.label, val, 100, meta.desc, color, delta, inDanger, meta.dangerLabel);
        }
        html += `</div>`;

        // === Social & Financial ===
        html += `<div class="stats-section"><div class="stats-section-title">🏛️ Indicatori Sociali e Finanziari</div>`;
        const repDelta = rep - (this._prevRep ?? rep);
        const cohDelta = coherence - (this._prevCoherence ?? coherence);
        const monDelta = money - (this._prevMoney ?? money);
        const repNaz = Game.state.reputazioneNazionale;
        const repNazDelta = repNaz - (this._prevRepNaz ?? repNaz);
        const repDanger = rep < 20;
        const cohDanger = coherence < 30;
        html += this.barRow('⭐', 'Reputazione Locale', rep, 100, 'Consenso nella tua città.', this.attrColor(rep), repDelta, repDanger, repDanger ? '🚫 Isolato dal partito' : '');
        html += this.barRow('🌐', 'Reputazione Nazionale', repNaz, 100, 'Fama politica a livello nazionale.', this.attrColor(repNaz), repNazDelta);
        const notorieta = Game.state.notorieta || 0;
        const notorietaDelta = notorieta - (this._prevNotorieta ?? notorieta);
        html += this.barRow('⭐', 'Notorietà Pubblica', notorieta, 100, 'Fama mediatica — paparazzi e talk show si attivano a 60+.', '#d4af37', notorietaDelta);
        html += this.barRow('🧩', 'Coerenza', coherence, 100, 'Agisci in linea con la tua ideologia.', this.attrColor(coherence), cohDelta, cohDanger, cohDanger ? '🧩 Crisi d\'identità (+10 stress/giorno)' : '');
        html += `
            <div class="stats-row">
                <span class="stats-row-icon">💶</span>
                <div class="stats-row-info">
                    <div class="stats-row-header">
                        <span class="stats-row-label">Soldi</span>
                        <span class="stats-row-num ${money < 50 ? 'critical' : ''}">${money}€${this.deltaTag(monDelta)}</span>
                    </div>
                </div>
            </div>
        `;
        html += `</div>`;

        // === Home Improvements ===
        const improvements = Game.state.homeImprovements;
        if (improvements.length > 0) {
            html += `<div class="stats-section"><div class="stats-section-title">🏠 Migliorie Casa</div>`;
            improvements.forEach(id => {
                const item = Game.HOME_IMPROVEMENTS_CATALOG.find(i => i.id === id);
                if (item) html += `<div class="stats-improvement">${item.name} — ${item.desc}</div>`;
            });
            html += `</div>`;
        }

        // === Statistiche Avanzate (Politics module) ===
        if (typeof Politics !== 'undefined' && Politics.getAdvancedStats) {
            html += this.buildAdvancedStatsHTML();
        }

        // === Fascicolo Casa (stanze + staff) ===
        const homeRooms = Game.state.homeRooms;
        const homeStaff = Game.state.homeStaff;
        const hasUpgradedRooms = homeRooms && Object.values(homeRooms).some(v => v > 1);
        const hasHiredStaff = homeStaff && Object.values(homeStaff).some(Boolean);
        if (hasUpgradedRooms || hasHiredStaff) {
            html += `<div class="stats-section"><div class="stats-section-title">🏠 Fascicolo Casa</div>`;
            if (hasUpgradedRooms && Game.ROOM_CATALOG) {
                Object.entries(homeRooms).forEach(([id, level]) => {
                    const cat = Game.ROOM_CATALOG[id];
                    if (cat && level > 1) {
                        html += this.barRow(cat.name.split(' ')[0], cat.name.split(' ').slice(1).join(' '), level, cat.maxLevel, cat.desc, '#8b6914', 0);
                    }
                });
            }
            if (hasHiredStaff && Game.DOMESTIC_STAFF_CATALOG) {
                Object.entries(homeStaff).filter(([, hired]) => hired).forEach(([id]) => {
                    const cat = Game.DOMESTIC_STAFF_CATALOG[id];
                    if (cat) html += `<div class="stats-improvement">${cat.name} — ${cat.desc}</div>`;
                });
            }
            html += `</div>`;
        }

        // === Portafoglio Investimenti ===
        const investments = Game.state.investments;
        if (investments && investments.length > 0) {
            html += `<div class="stats-section"><div class="stats-section-title">💰 Portafoglio Investimenti</div>`;
            investments.forEach(inv => {
                const daysHeld = Math.max(0, (Game.state.day || 0) - inv.purchaseDay);
                const estReturn = Math.round(inv.amount * (1 + inv.returnRate * daysHeld / 365));
                html += `<div class="stats-improvement">${inv.name} — €${inv.amount} investiti, valore stimato ~€${estReturn} (${daysHeld} giorni)</div>`;
            });
            html += `</div>`;
        }

        // === Placeholder divs for injected sections ===
        html += `<div id="faction-section-anchor"></div>`;
        html += `<div id="credits-section-anchor"></div>`;
        html += `<div id="diary-section-anchor"></div>`;

        return html;
    },

    /** Get list of active danger warnings */
    getActiveDangers() {
        const s = Game.state.stats;
        const dangers = [];
        if (s.stanchezza >= 80) dangers.push('🔴 Esausto — Scrivania trema, task +5 stanchezza');
        if (s.stress >= 90) dangers.push('🔥 Burnout — Efficacia task -20%');
        else if (s.stress >= 70) dangers.push('⚠️ Sovraccarico — Efficacia task -10%');
        if (s.morale <= 30) dangers.push('😞 Depresso — Contatti ti evitano, -20% relazioni');
        if (s.salute <= 20) dangers.push('💀 Critico — Rischio Game Over!');
        else if (s.salute <= 50) dangers.push('🤒 Malato — PA ridotti (-1 al giorno)');
        if (Game.state.reputazione < 20) dangers.push('🚫 Isolato — Nessun task politico disponibile');
        if (Game.state.coherence < 30) dangers.push('🧩 Crisi — +10 Stress ogni giorno');
        return dangers;
    },

    /** Generate delta indicator HTML */
    deltaTag(delta) {
        if (!delta || delta === 0) return '';
        if (delta > 0) return ` <span class="stat-delta stat-delta-up">▲+${delta}</span>`;
        return ` <span class="stat-delta stat-delta-down">▼${delta}</span>`;
    },

    barRow(icon, label, value, max, desc, color, delta, inDanger, dangerLabel) {
        const dangerClass = inDanger ? ' stats-row-danger' : '';
        const dangerHTML = (inDanger && dangerLabel) ? `<div class="stats-danger-label">${dangerLabel}</div>` : '';
        return `
            <div class="stats-row${dangerClass}">
                <span class="stats-row-icon">${icon}</span>
                <div class="stats-row-info">
                    <div class="stats-row-header">
                        <span class="stats-row-label">${label}</span>
                        <span class="stats-row-num">${value}/${max}${this.deltaTag(delta)}</span>
                    </div>
                    <div class="stats-bar-track">
                        <div class="stats-bar-fill" style="width:${value}%; background:${color}"></div>
                    </div>
                    <div class="stats-row-desc">${desc}</div>
                    ${dangerHTML}
                </div>
            </div>
        `;
    },

    goalProgressRow(icon, label, value, note) {
        const pct = Math.max(0, Math.min(100, Math.round(value || 0)));
        const variant = icon === '🏛️' ? 'political' : (icon === '🤝' ? 'faction' : 'work');
        return `
            <div class="goal-progress-row">
                <span class="stats-row-icon">${icon}</span>
                <span class="goal-progress-label">${label}</span>
                <div class="goal-progress-track">
                    <div class="goal-progress-fill ${variant}" style="width:${pct}%"></div>
                </div>
                <span class="goal-progress-value">${pct}%</span>
            </div>
            <div class="stats-row-desc">${note}</div>
        `;
    },

    getFactionUnlockProgress() {
        if (typeof Factions === 'undefined' || !Factions.CURRENTS) {
            return { value: 0, label: 'Modulo correnti non disponibile' };
        }
        const entries = Object.values(Factions.CURRENTS || {});
        const locked = entries.filter(f => !Game.state.faction || Game.state.faction.current !== f.id)
            .map(f => {
                const repNeed = f.unlock && f.unlock.reputazione ? f.unlock.reputazione : 1;
                const cohNeed = f.unlock && f.unlock.coherence ? f.unlock.coherence : 1;
                const repRatio = Math.max(0, Math.min(1, Game.state.reputazione / repNeed));
                const cohRatio = Math.max(0, Math.min(1, Game.state.coherence / cohNeed));
                return {
                    faction: f,
                    progress: Math.round(((repRatio + cohRatio) / 2) * 100),
                };
            })
            .sort((a, b) => b.progress - a.progress);

        if (locked.length === 0) {
            return { value: 100, label: 'Corrente già attiva/sbloccata' };
        }
        const best = locked[0];
        return { value: best.progress, label: `Prossima: ${best.faction.name}` };
    },

    attrColor(val) {
        if (val >= 70) return '#43A047';
        if (val >= 40) return '#FFA726';
        return '#E53935';
    },

    invertColor(val) {
        // For stanchezza: low = good (green), high = bad (red)
        if (val <= 30) return '#43A047';
        if (val <= 60) return '#FFA726';
        return '#E53935';
    },

    esc(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    /** Qualitative label for 0-1 values */
    _qualLabel(val) {
        if (val >= 0.8) return { text: 'Dominante', cls: 'stat-qual-high' };
        if (val >= 0.5) return { text: 'Alta', cls: 'stat-qual-mid-high' };
        if (val >= 0.25) return { text: 'Media', cls: 'stat-qual-mid' };
        if (val > 0) return { text: 'Bassa', cls: 'stat-qual-low' };
        return { text: 'Nulla', cls: 'stat-qual-none' };
    },

    _qualRow(icon, label, val, desc) {
        const q = this._qualLabel(val);
        const pct = Math.round(val * 100);
        return `
            <div class="stats-row">
                <span class="stats-row-icon">${icon}</span>
                <div class="stats-row-info">
                    <div class="stats-row-header">
                        <span class="stats-row-label">${label}</span>
                        <span class="stats-row-num ${q.cls}">${q.text}</span>
                    </div>
                    <div class="stats-bar-track">
                        <div class="stats-bar-fill" style="width:${pct}%; background:${this.attrColor(pct)}"></div>
                    </div>
                    <div class="stats-row-desc">${desc}</div>
                </div>
            </div>
        `;
    },

    buildAdvancedStatsHTML() {
        const adv = Politics.getAdvancedStats();
        let html = '';

        // Political
        html += `<div class="stats-section"><div class="stats-section-title">🏛️ Profilo Politico</div>`;
        html += this._qualRow('🎯', 'Influenza nel Partito', adv.political.partyInfluence, 'Quanto conti nelle decisioni interne.');
        html += this._qualRow('📊', 'Supporto Pubblico', adv.political.publicSupport, 'Consenso percepito tra i cittadini.');
        html += this._qualRow('🌍', 'Reputazione Internazionale', adv.political.internationalReputation, 'Visibilità oltre confine.');
        html += this._qualRow('📜', 'Abilità Legislativa', adv.political.legislativeSkill, 'Capacità di far passare leggi e proposte.');

        // Conversion malus indicator
        const trustPen = Politics.getCurrentTrustPenalty();
        if (trustPen > 0) {
            html += `<div class="stats-danger-item">🔄 Adattamento in corso: penalità fiducia -${Math.round(trustPen * 100)}%</div>`;
        }
        html += `</div>`;

        // Social
        html += `<div class="stats-section"><div class="stats-section-title">🤝 Rete Sociale</div>`;
        html += this._qualRow('✨', 'Carisma Sociale', adv.social.charisma, 'Capacità di attirare persone e alleati.');
        html += this._qualRow('🗣️', 'Negoziazione', adv.social.negotiation, 'Capacità di mediare e ottenere accordi.');
        html += this._qualRow('🔗', 'Rete di Lealtà', adv.social.loyaltyNetwork, 'Solidità della tua cerchia di fiducia.');
        html += `</div>`;

        // Criminal (only if player has any criminal stat > 0)
        const hasCriminal = adv.criminal.mafiaReputation > 0 ||
            adv.criminal.policeSuspicion > 0 || adv.criminal.financialOpacity > 0;
        if (hasCriminal) {
            html += `<div class="stats-section"><div class="stats-section-title">🕵️ Zona Grigia</div>`;
            html += this._qualRow('🔫', 'Reputazione Mafiosa', adv.criminal.mafiaReputation, 'Quanto sei conosciuto nel sottobosco.');
            html += this._qualRow('🚔', 'Sospetto Polizia', adv.criminal.policeSuspicion, 'Quanto le forze dell\'ordine ti osservano.');
            html += this._qualRow('💼', 'Opacità Finanziaria', adv.criminal.financialOpacity, 'Quanti dei tuoi soldi sono "sporchi".');
            html += `</div>`;
        }

        return html;
    },

    // ...existing code...
};
