/* ============================================
   BUSSOLA POLITICA — Dashboard Sidebar
   ============================================ */

const Compass = {
    _refreshTimer: null,

    init() {
        Game.on('time-advance', () => this.refresh());
        Game.on('stat-change', () => this._scheduleRefresh());
        Game.on('money-change', () => this._scheduleRefresh());
        Game.on('new-day', () => this.refresh());
        Game.on('task-completed', () => this.refresh());
        Game.on('bill-paid', () => this.refresh());
        Game.on('panel-open', (d) => { if (d.panel === 'phone') this.refresh(); });
        this.refresh();
    },

    _scheduleRefresh() {
        if (this._refreshTimer) return;
        if (typeof Scheduler !== 'undefined') {
            this._refreshTimer = Scheduler.timeout(() => {
                this._refreshTimer = null;
                this.refresh();
            }, 250, { group: 'compass', label: 'refresh' });
            return;
        }
        this._refreshTimer = setTimeout(() => {
            this._refreshTimer = null;
            this.refresh();
        }, 250);
    },

    refresh() {
        const el = document.getElementById('compass-body');
        if (!el) return;

        const s = Game.state;
        const snap = HUD._daySnapshot;

        // 1. Obiettivo del giorno
        const obj = s.lifestyle ? s.lifestyle.dailyObjective : null;
        let objHTML;
        if (obj && !obj.completed) {
            objHTML = `<div class="compass-section">
                <div class="compass-label">🎯 Obiettivo</div>
                <div class="compass-obj">${Game.esc(obj.title)}</div>
            </div>`;
        } else if (obj && obj.completed) {
            objHTML = `<div class="compass-section">
                <div class="compass-label">🎯 Obiettivo</div>
                <div class="compass-obj done">✅ Completato!</div>
            </div>`;
        } else {
            objHTML = `<div class="compass-section">
                <div class="compass-label">🎯 Obiettivo</div>
                <div class="compass-obj faded">Mansioni → Sfida</div>
            </div>`;
        }

        // 2. Urgenza principale
        const urg = this._getUrgency();
        const urgHTML = `<div class="compass-section">
            <div class="compass-label">⚠️ Urgenza</div>
            <div class="compass-urgency ${urg.level}">${urg.text}</div>
        </div>`;

        // 3. Trend stats (confronto con inizio giornata)
        let trendsHTML = '<div class="compass-section"><div class="compass-label">📊 Trend</div><div class="compass-trends">';
        if (snap) {
            const items = [
                { icon: '😴', cur: s.stats.stanchezza, prev: snap.stats.stanchezza, inv: true },
                { icon: '😰', cur: s.stats.stress, prev: snap.stats.stress, inv: true },
                { icon: '😊', cur: s.stats.morale, prev: snap.stats.morale, inv: false },
                { icon: '❤️', cur: s.stats.salute, prev: snap.stats.salute, inv: false },
                { icon: '💶', cur: s.money, prev: snap.money, inv: false },
            ];
            items.forEach(t => {
                const d = t.cur - t.prev;
                let arrow, cls;
                if (d > 0) {
                    arrow = '▲' + Math.abs(d);
                    cls = t.inv ? 'trend-bad' : 'trend-good';
                } else if (d < 0) {
                    arrow = '▼' + Math.abs(d);
                    cls = t.inv ? 'trend-good' : 'trend-bad';
                } else {
                    arrow = '—';
                    cls = 'trend-flat';
                }
                trendsHTML += `<span class="compass-trend ${cls}">${t.icon}${arrow}</span>`;
            });
        } else {
            trendsHTML += '<span class="compass-trend trend-flat">In attesa...</span>';
        }
        trendsHTML += '</div></div>';

        // 4. Roadmap esplicita medio-lungo periodo
        const goals = Game.getLongTermGoals ? Game.getLongTermGoals().slice(0, 3) : [];
        const goalsHTML = `<div class="compass-section">
            <div class="compass-label">🛣️ Roadmap</div>
            <div class="compass-trends">
                ${goals.map(g => `<span class="compass-trend ${g.completed ? 'trend-good' : 'trend-flat'}">${g.completed ? '✅' : '🎯'} ${g.label}: ${g.progress}%</span>`).join('')}
            </div>
        </div>`;

        // 5. Info rapide
        const apCap = Game.getActionPointCap ? Game.getActionPointCap() : 2;
        const quickHTML = `<div class="compass-section compass-quick">
            <div>🏛️ ${Game.getCareerLevel().label}</div>
            <div>⭐ ${s.reputazione} | 🧩 ${s.coherence}</div>
            <div>🌐 ${s.reputazioneNazionale} | PA: ${s.actionPoints}/${apCap}</div>
        </div>`;

        el.innerHTML = objHTML + urgHTML + trendsHTML + goalsHTML + quickHTML;
    },

    _getUrgency() {
        const s = Game.state;
        // Critical
        if (s.stats.stanchezza >= 85) return { text: '💀 Esausto! Riposa!', level: 'critical' };
        if (s.stats.stress >= 85) return { text: '💀 Stress critico!', level: 'critical' };
        if (s.stats.salute <= 20) return { text: '💀 Salute in pericolo!', level: 'critical' };
        if (s.coherence <= 15) return { text: '💀 Coerenza al minimo!', level: 'critical' };
        if (s.money < -300) return { text: '💀 Debiti enormi!', level: 'critical' };

        // Warning - bills
        const overdue = (s.bills || []).filter(b => !b.paid && s.day > b.dueDay);
        if (overdue.length > 0) return { text: `📮 ${overdue.length} bollette scadute!`, level: 'warning' };
        const dueSoon = (s.bills || []).filter(b => !b.paid && b.dueDay - s.day <= 2 && b.dueDay >= s.day);
        if (dueSoon.length > 0) return { text: '📮 Bolletta in scadenza!', level: 'warning' };

        // Warning - mafia
        if (s.mafia && s.mafia.rischioIndagini >= 70) return { text: '🚨 Rischio arresto!', level: 'warning' };

        // Info
        if (s.stats.stanchezza >= 70) return { text: '😴 Dovresti riposare', level: 'info' };
        if (s.stats.stress >= 60) return { text: '😰 Stress in aumento', level: 'info' };
        if (s.money < 50 && s.money >= 0) return { text: '💸 Soldi bassi', level: 'info' };
        if (s.partner && s.partner.tension > 70) return { text: `💔 ${Game.esc(s.partner.name)} è teso/a`, level: 'info' };

        // Mafia pending
        if (s.mafia && s.mafia.pendingFavor) return { text: '🔫 Totò vuole parlarti', level: 'info' };

        // Urgent messages unhandled
        const unhandled = (s.urgentMessages || []).filter(m => !m.handled);
        if (unhandled.length > 0) return { text: `📩 ${unhandled.length} messaggi urgenti`, level: 'info' };

        return { text: '✅ Tutto tranquillo', level: 'ok' };
    }
};
