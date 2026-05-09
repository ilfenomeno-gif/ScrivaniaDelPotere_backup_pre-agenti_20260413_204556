/* ============================================
   HUD — Heads Up Display & Visual Effects (v2)
   ============================================ */

const HUD = {
    // Track daily stat changes for summary
    _daySnapshot: null,
    _turnSnapshot: null,

    init() {
        Game.on('stat-change', (data) => this.updateStat(data));
        Game.on('stat-change', (data) => this.showStatDelta(data));
        Game.on('money-change', () => this.updateMoney());
        Game.on('time-advance', (data) => this.updateDateTime(data));
        Game.on('ap-change', (data) => this.updateAP(data));
        Game.on('bill-paid', () => this.updateVisualEffects());
        Game.on('time-advance', () => this.updateVisualEffects());
        Game.on('time-advance', () => this.updateHealthEffects());
        Game.on('stat-change', () => this.updateHealthEffects());
        Game.on('no-ap', (data) => this.showToast(data.reason));

        // Coffee cup depletion linked to AP consumption
        Game.on('ap-change', (data) => this.updateCoffeeCupLevel(data));

        // Phone shake on notifications
        Game.on('work-notif', () => this.shakePhone());
        Game.on('urgent-message', () => this.shakePhone());

        // Daily summary on new day
        Game.on('new-day', () => this.showDailySummary());

        // City & national reputation updates
        Game.on('city-change', () => this.updateCityDisplay());
        Game.on('stat-change', (data) => {
            if (data.stat === 'reputazioneNazionale') this.updateRepNazionale();
        });
        Game.on('notorieta-change', () => this.updateNotorieta());
        Game.on('time-advance', (data) => this.showTurnSummary(data));

        // Day/night color cycle disabled
        // this.applyTimeClass(Game.state.calendar.timeOfDay);

        // Take initial day snapshot
        this.takeDaySnapshot();
        this.takeTurnSnapshot();
        this.setupHudTooltips();
    },

    setupHudTooltips() {
        const tips = {
            stanchezza: 'Stanchezza: warning >=80, pericolo imminente >=85, game over >=100.',
            stress: 'Stress: warning >=70 (-10% efficacia task), critico >=90 (-20%), game over >=100.',
            morale: 'Morale: warning <=30 (contatti si allontanano).',
            salute: 'Salute: warning <=30 (-1 PA/giorno), game over <=0.',
            coherence: 'Coerenza: warning <=20 (+10 stress/giorno), espulsione <=0.',
        };
        Object.entries(tips).forEach(([stat, tip]) => {
            const icon = document.querySelector(`#hud-${stat} .hud-icon`);
            if (icon) icon.setAttribute('data-tip', tip);
        });
    },

    /** Snapshot all stats at start of day */
    takeDaySnapshot() {
        const s = Game.state;
        this._daySnapshot = {
            stats: { ...s.stats },
            attributes: { ...s.attributes },
            reputazione: s.reputazione,
            reputazioneNazionale: s.reputazioneNazionale,
            coherence: s.coherence,
            money: s.money,
        };
    },

    /** Snapshot at start/end of each time slot for turn summary */
    takeTurnSnapshot() {
        const s = Game.state;
        this._turnSnapshot = {
            stats: { ...s.stats },
            reputazione: s.reputazione,
            reputazioneNazionale: s.reputazioneNazionale,
            coherence: s.coherence,
            money: s.money,
        };
    },

    /** Floating delta indicator near HUD bars */
    showStatDelta(data) {
        const { stat, value, old } = data;
        if (old === undefined || old === value) return;
        const delta = value - old;
        if (delta === 0) return;

        // Find the parent .hud-bar element
        const fill = document.querySelector(`.hud-bar-fill.${stat}`);
        if (!fill) return;
        const bar = fill.closest('.hud-bar');
        if (!bar) return;

        const indicator = document.createElement('span');
        indicator.className = `hud-delta-float ${delta > 0 ? 'delta-up' : 'delta-down'}`;
        indicator.textContent = delta > 0 ? `+${delta}` : `${delta}`;
        bar.appendChild(indicator);

        setTimeout(() => indicator.remove(), 1800);
    },

    updateStat(data) {
        const { stat, value } = data;

        if (stat === 'stanchezza' || stat === 'stress' || stat === 'morale' || stat === 'salute') {
            const fill = document.querySelector(`.hud-bar-fill.${stat}`);
            if (fill) fill.style.width = `${value}%`;
            const num = document.querySelector(`.hud-value[data-stat="${stat}"]`);
            if (num) num.textContent = Math.round(value);

            const wrap = document.getElementById(`hud-${stat}`);
            if (wrap) {
                let critical = false;
                if (stat === 'stanchezza' || stat === 'stress') critical = value >= 80;
                if (stat === 'morale' || stat === 'salute') critical = value <= 30;
                wrap.classList.toggle('hud-bar-critical', critical);

                let imminent = false;
                if (stat === 'stanchezza' || stat === 'stress') imminent = value >= 85;
                if (stat === 'morale') imminent = value <= 15;
                if (stat === 'salute') imminent = value <= 15;
                wrap.classList.toggle('hud-imminent-danger', imminent);
            }
        }

        // Stanchezza high: shake notepad
        if (stat === 'stanchezza') {
            const taskItem = document.getElementById('item-tasks');
            if (value >= 80) {
                taskItem.classList.add('low-energy');
            } else {
                taskItem.classList.remove('low-energy');
            }
        }

        // Stress high: coffee stains and burns
        if (stat === 'stress') {
            this.updateStressEffects(value);
        }

        // Coherence: coffee reflection
        if (stat === 'coherence') {
            this.updateCoherence(value);
        }
    },

    updateStressEffects(stress) {
        const stain1 = document.getElementById('vfx-stain1');
        const stain2 = document.getElementById('vfx-stain2');
        const burn1 = document.getElementById('vfx-burn1');
        const burn2 = document.getElementById('vfx-burn2');

        stain1.style.opacity = stress >= 30 ? Math.min(1, (stress - 30) / 30) : 0;
        stain2.style.opacity = stress >= 50 ? Math.min(1, (stress - 50) / 25) : 0;
        burn1.style.opacity = stress >= 50 ? Math.min(1, (stress - 50) / 30) : 0;
        burn2.style.opacity = stress >= 70 ? Math.min(1, (stress - 70) / 20) : 0;
    },

    updateCoherence(value) {
        const surface = document.getElementById('coffee-surface');
        if (!surface) return;
        surface.className = 'coffee-surface';
        if (value < 30) surface.classList.add('very-cracked');
        else if (value < 60) surface.classList.add('cracked');
        surface.style.height = `${Math.max(20, value * 0.8)}%`;
    },

    updateDateTime(data) {
        const dateEl = document.getElementById('hud-date');
        const timeLabel = document.getElementById('hud-time-label');
        const timeIcon = document.getElementById('hud-time-icon');
        if (dateEl) dateEl.textContent = data.dateString;
        if (timeLabel) timeLabel.textContent = data.timeLabel;
        if (timeIcon) timeIcon.textContent = Game.getTimeIcon();

        // Day/night cycle disabled
        // this.applyTimeClass(data.timeOfDay);

        // Update advance button info
        this.updateAdvanceInfo();
    },

    /** Apply day/night CSS class to desk screen */
    applyTimeClass(timeOfDay) {
        const desk = document.getElementById('screen-desk');
        if (!desk) return;
        desk.classList.remove('time-mattina', 'time-pomeriggio', 'time-sera');
        const cls = ['time-mattina', 'time-pomeriggio', 'time-sera'];
        if (cls[timeOfDay]) desk.classList.add(cls[timeOfDay]);
    },

    /** Health blur/shake when stanchezza or stress > 80% */
    updateHealthEffects() {
        const desk = document.getElementById('desk');
        const vignette = document.getElementById('hud-vignette');
        if (!desk) return;
        const s = Game.state.stats;
        const worst = Math.max(s.stanchezza, s.stress);
        desk.classList.remove('health-warning', 'health-critical');
        if (vignette) vignette.classList.remove('warning', 'critical');

        if (worst >= 90) {
            desk.classList.add('health-critical');
            if (vignette) vignette.classList.add('critical');
        } else if (worst >= 75) {
            desk.classList.add('health-warning');
            if (vignette) vignette.classList.add('warning');
        }
    },

    updateAP(data) {
        const dot1 = document.getElementById('ap-dot-1');
        const dot2 = document.getElementById('ap-dot-2');
        const count = document.getElementById('ap-count');
        const prevAP = this._prevAP !== undefined ? this._prevAP : 2;
        const newAP = data.ap;

        if (newAP < prevAP) {
            // AP was consumed — animate consumed dots
            if (prevAP >= 2 && newAP < 2 && dot2) {
                dot2.classList.remove('filled', 'refilling');
                dot2.classList.add('consuming');
                setTimeout(() => dot2.classList.remove('consuming'), 600);
            }
            if (prevAP >= 1 && newAP < 1 && dot1) {
                dot1.classList.remove('filled', 'refilling');
                dot1.classList.add('consuming');
                setTimeout(() => dot1.classList.remove('consuming'), 600);
            }
        } else if (newAP > prevAP) {
            // AP refilled — animate refill
            if (dot1 && newAP >= 1) {
                dot1.classList.add('filled', 'refilling');
                setTimeout(() => dot1.classList.remove('refilling'), 400);
            }
            if (dot2 && newAP >= 2) {
                dot2.classList.add('filled', 'refilling');
                setTimeout(() => dot2.classList.remove('refilling'), 400);
            }
        }

        // Final state
        setTimeout(() => {
            if (dot1) dot1.classList.toggle('filled', newAP >= 1);
            if (dot2) dot2.classList.toggle('filled', newAP >= 2);
        }, 620);

        if (count) count.textContent = newAP;
        this._prevAP = newAP;
    },

    updateMoney() {
        const el = document.getElementById('hud-money');
        if (el) {
            el.textContent = `€${Game.state.money}`;
            el.classList.toggle('negative', Game.state.money < 0);
            el.classList.toggle('hud-imminent-danger', Game.state.money < -700);
        }
    },

    updateAdvanceInfo() {
        const info = document.getElementById('advance-info');
        const label = document.getElementById('btn-advance-label');
        if (!info) return;

        const nextTime = Game.state.calendar.timeOfDay + 1;
        if (nextTime > 2) {
            info.textContent = '→ Mattina (giorno dopo)';
            if (label) label.textContent = 'Dormi';
        } else {
            info.textContent = `→ ${Game.TIME_LABELS[nextTime]}`;
            if (label) label.textContent = 'Avanza Turno';
        }
    },

    updateVisualEffects() {
        const flags = Game.state.flags;
        const overlay = document.getElementById('dim-overlay');
        const candle = document.getElementById('candle');

        if (flags.lightDimmed) {
            overlay.classList.add('dimmed');
            candle.classList.remove('hidden');
        } else {
            overlay.classList.remove('dimmed');
            candle.classList.add('hidden');
        }
    },

    showToast(msg) {
        const toast = document.getElementById('toast-noap');
        if (!toast) return;
        toast.textContent = `⚠️ ${msg}`;
        toast.classList.remove('hidden');
        // Screen reader: announce toast message
        if (window.SR) SR.announce(msg, 'assertive');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => toast.classList.add('hidden'), 2500);
    },

    /** Show daily summary popup with all stat deltas */
    showDailySummary() {
        if (!this._daySnapshot) return;
        const snap = this._daySnapshot;
        const s = Game.state;
        const lines = [];

        // Stats
        const statLabels = { stanchezza: '😴 Stanchezza', stress: '😰 Stress', morale: '😊 Morale', salute: '❤️ Salute' };
        for (const [key, label] of Object.entries(statLabels)) {
            const delta = s.stats[key] - snap.stats[key];
            if (delta !== 0) lines.push(this.summaryLine(label, delta));
        }
        // Attributes
        const attrLabels = { intelligenza: '🧠 Int', estetica: '🪞 Est', autenticita: '🗣️ Aut', muscoli: '💪 Musc', carisma: '✨ Car' };
        for (const [key, label] of Object.entries(attrLabels)) {
            const delta = s.attributes[key] - snap.attributes[key];
            if (delta !== 0) lines.push(this.summaryLine(label, delta));
        }
        // Rep, coherence, money
        const repD = s.reputazione - snap.reputazione;
        const repNazD = s.reputazioneNazionale - (snap.reputazioneNazionale || 0);
        const cohD = s.coherence - snap.coherence;
        const monD = s.money - snap.money;
        if (repD !== 0) lines.push(this.summaryLine('⭐ Rep. Locale', repD));
        if (repNazD !== 0) lines.push(this.summaryLine('🌐 Rep. Nazionale', repNazD));
        if (cohD !== 0) lines.push(this.summaryLine('🧩 Coerenza', cohD));
        if (monD !== 0) lines.push(this.summaryLine('💶 Soldi', monD, '€'));

        // Dangers
        const dangers = [];
        if (s.stats.stanchezza >= 80) dangers.push('🔴 Esausto');
        if (s.stats.stress >= 90) dangers.push('🔥 Burnout');
        else if (s.stats.stress >= 70) dangers.push('⚠️ Sovraccarico');
        if (s.stats.morale <= 30) dangers.push('😞 Depresso');
        if (s.stats.salute <= 50) dangers.push('🤒 Malato');
        if (s.reputazione < 20) dangers.push('🚫 Isolato');
        if (s.coherence < 30) dangers.push('🧩 Crisi');

        let popup = document.getElementById('daily-summary-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'daily-summary-popup';
            popup.className = 'daily-summary-popup hidden';
            const phoneDevice = document.querySelector('#item-phone .phone-device');
            if (phoneDevice) {
                phoneDevice.appendChild(popup);
            } else {
                document.getElementById('screen-desk').appendChild(popup);
            }
        }

        let html = `<div class="daily-summary-header">📊 Riepilogo Giorno ${s.day - 1}</div>`;
        if (lines.length === 0) {
            html += `<div class="daily-summary-line">Nessun cambiamento significativo.</div>`;
        } else {
            html += lines.join('');
        }
        if (dangers.length > 0) {
            html += `<div class="daily-summary-dangers">⚠️ ${dangers.join(' | ')}</div>`;
        }

        popup.innerHTML = html;
        popup.classList.remove('hidden');

        // Auto-dismiss after 1 second
        clearTimeout(this._dailySummaryTimer);
        this._dailySummaryTimer = setTimeout(() => {
            popup.classList.add('hidden');
        }, 1000);

        // Take new snapshot for next day
        this.takeDaySnapshot();
    },

    /** Short summary for each completed time slot */
    showTurnSummary(data) {
        if (!this._turnSnapshot) {
            this.takeTurnSnapshot();
            return;
        }

        // Skip at start of new day: daily summary already covers this transition.
        if (data && data.timeOfDay === 0) {
            this.takeTurnSnapshot();
            return;
        }

        const s = Game.state;
        const snap = this._turnSnapshot;
        const lines = [];
        const push = (label, delta, suffix) => {
            if (!delta) return;
            lines.push(this.summaryLine(label, delta, suffix || ''));
        };

        push('💶 Soldi', s.money - snap.money, '€');
        push('⭐ Rep. Locale', s.reputazione - snap.reputazione);
        push('🌐 Rep. Nazionale', s.reputazioneNazionale - (snap.reputazioneNazionale || 0));
        push('🧩 Coerenza', s.coherence - snap.coherence);
        push('😴 Stanchezza', s.stats.stanchezza - snap.stats.stanchezza);
        push('😰 Stress', s.stats.stress - snap.stats.stress);
        push('😊 Morale', s.stats.morale - snap.stats.morale);
        push('❤️ Salute', s.stats.salute - snap.stats.salute);

        if (lines.length === 0) {
            this.takeTurnSnapshot();
            return;
        }

        let popup = document.getElementById('turn-summary-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'turn-summary-popup';
            popup.className = 'turn-summary-popup hidden';
            const desk = document.getElementById('screen-desk');
            if (desk) desk.appendChild(popup);
        }

        const prevTimeIndex = data && typeof data.timeOfDay === 'number'
            ? ((data.timeOfDay + 2) % 3)
            : 0;
        const prevLabel = Game.TIME_LABELS[prevTimeIndex] || 'Turno';

        popup.innerHTML = `<div class="turn-summary-header">⏱️ Riepilogo ${prevLabel}</div>${lines.join('')}`;
        popup.classList.remove('hidden');
        clearTimeout(this._turnSummaryTimer);
        this._turnSummaryTimer = setTimeout(() => popup.classList.add('hidden'), 2200);

        this.takeTurnSnapshot();
    },

    summaryLine(label, delta, suffix) {
        suffix = suffix || '';
        const cls = delta > 0 ? 'summary-up' : 'summary-down';
        const sign = delta > 0 ? '+' : '';
        return `<div class="daily-summary-line ${cls}">${label}: ${sign}${delta}${suffix}</div>`;
    },

    /** Update city name in HUD */
    updateCityDisplay() {
        const el = document.getElementById('hud-city-name');
        if (el && Game.state.city) {
            el.textContent = Game.state.city.name;
        }
    },

    /** Update national reputation bar fill */
    updateRepNazionale() {
        const fill = document.getElementById('hud-rep-nazionale');
        if (fill) fill.style.width = Game.state.reputazioneNazionale + '%';
    },

    /** Update notorietà bar fill */
    updateNotorieta() {
        const fill = document.getElementById('hud-notorieta');
        if (fill) {
            const val = Game.state.notorieta || 0;
            fill.style.width = val + '%';
            const track = fill.closest('[role="progressbar"]');
            if (track) track.setAttribute('aria-valuenow', val);
        }
    },

    refreshAll() {
        const s = Game.state.stats;
        this.updateStat({ stat: 'stanchezza', value: s.stanchezza });
        this.updateStat({ stat: 'stress', value: s.stress });
        this.updateStat({ stat: 'morale', value: s.morale });
        this.updateStat({ stat: 'salute', value: s.salute });
        this.updateStat({ stat: 'coherence', value: Game.state.coherence });
        this.updateDateTime({
            dateString: Game.getDateString(),
            timeLabel: Game.getTimeLabel(),
        });
        this.updateAP({ ap: Game.state.actionPoints });
        this.updateMoney();
        this.updateVisualEffects();
        this.updateAdvanceInfo();
        this.updateCityDisplay();
        this.updateRepNazionale();
        this.updateNotorieta();
    },

    /** Coffee cup visually depletes as AP is consumed during the day */
    updateCoffeeCupLevel(data) {
        const cup = document.querySelector('.desk-coffeecup');
        if (!cup) return;
        const ap = data.ap;
        cup.classList.remove('coffee-full', 'coffee-half', 'coffee-low', 'coffee-empty');
        if (ap >= 2) cup.classList.add('coffee-full');
        else if (ap === 1) cup.classList.add('coffee-half');
        else cup.classList.add('coffee-empty');
    },

    /** Shake phone icon on important notifications */
    shakePhone() {
        const phoneItem = document.getElementById('item-phone');
        if (!phoneItem) return;
        phoneItem.classList.add('phone-vibrating');
        setTimeout(() => phoneItem.classList.remove('phone-vibrating'), 600);
    },
};
