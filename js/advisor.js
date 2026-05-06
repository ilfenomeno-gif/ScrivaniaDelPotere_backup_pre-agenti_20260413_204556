/* ============================================
   CONSIGLIERE FANTASMA — Adaptive Hint System
   ============================================ */

const Advisor = {
    _lastHintDay: 0,
    _lastHintTime: -1,
    _dismissed: false,

    HINTS: [
        {
            id: 'rest',
            check: s => s.stats.stanchezza >= 70,
            text: 'Dovresti riposare o bere un caffè. La stanchezza rallenta tutto.',
            icon: '😴',
        },
        {
            id: 'stress',
            check: s => s.stats.stress >= 65 && s.stats.stanchezza < 70,
            text: 'Lo stress è alto. Prova la meditazione (Abitudini) o parla con qualcuno.',
            icon: '😰',
        },
        {
            id: 'money-low',
            check: s => s.money < 50 && s.money >= 0,
            text: 'Soldi bassi. Prova un lavoretto extra (Mansioni → Vita Quotidiana → Lavoretti).',
            icon: '💸',
        },
        {
            id: 'money-critical',
            check: s => s.money < 0,
            text: 'Sei in debito! Fai lavoretti o completa compiti lavorativi per guadagnare.',
            icon: '🚨',
        },
        {
            id: 'health',
            check: s => s.stats.salute < 50,
            text: 'La salute è bassa. Compra integratori in farmacia o fai sport (Abitudini → Corsa).',
            icon: '🏥',
        },
        {
            id: 'morale',
            check: s => s.stats.morale < 35,
            text: 'Il morale è basso. Esci in territorio, incontra persone, mangia con colleghi.',
            icon: '😞',
        },
        {
            id: 'coherence',
            check: s => s.coherence < 40,
            text: 'La coerenza cala. Leggi un romanzo politico (Libreria) o medita.',
            icon: '🧩',
        },
        {
            id: 'bills',
            check: s => (s.bills || []).some(b => !b.paid && s.day >= b.dueDay - 1),
            text: 'Hai bollette in scadenza! Vai in Casa → Economia per pagare.',
            icon: '📮',
        },
        {
            id: 'contacts-neglect',
            check: s => s.contacts.length > 0 && s.contacts.every(c => c.relation < 40),
            text: 'I tuoi contatti ti dimenticano. Scrivi a qualcuno dal Telefono!',
            icon: '📱',
        },
        {
            id: 'partner-tension',
            check: s => s.partner && s.partner.tension > 60,
            text: `Il/la partner è teso/a. Compra fiori dalla fioraia Rosa!`,
            icon: '💔',
        },
        {
            id: 'no-habit',
            check: s => s.lifestyle && !s.lifestyle.habitToday && s.calendar.timeOfDay === 0,
            text: 'Non hai scelto un\'abitudine per oggi. Vai in Mansioni → Abitudini.',
            icon: '🏃',
        },
        {
            id: 'career-stuck',
            check: s => s.career.promotionProgress > 60 && s.career.level < 3,
            text: 'Sei vicino alla promozione! Completa compiti lavorativi per salire.',
            icon: '📈',
        },
        {
            id: 'no-lunch',
            check: s => s.lifestyle && !s.lifestyle.lunchToday && s.calendar.timeOfDay === 1,
            text: 'È ora di pranzo! Scegli cosa mangiare in Vita Quotidiana.',
            icon: '🍽️',
        },
        {
            id: 'mafia-risk',
            check: s => s.mafia && s.mafia.rischioIndagini >= 50,
            text: 'Il rischio indagini sale. Stai attento con la mafia!',
            icon: '🔫',
        },
        {
            id: 'rep-low',
            check: s => s.reputazione < 25,
            text: 'La reputazione è bassa. Fai gazebo o posta sui social.',
            icon: '⭐',
        },
    ],

    init() {
        if (!Game.state.options || Game.state.options.advisorEnabled === false) return;
        Game.on('time-advance', () => this._evaluate());
        Game.on('stat-change', () => this._scheduleEval());
        Game.on('money-change', () => this._scheduleEval());
    },

    _evalTimer: null,
    _scheduleEval() {
        if (this._evalTimer) return;
        if (typeof Scheduler !== 'undefined') {
            this._evalTimer = Scheduler.timeout(() => {
                this._evalTimer = null;
                this._evaluate();
            }, 500, { group: 'advisor', label: 'evaluate' });
            return;
        }
        this._evalTimer = setTimeout(() => {
            this._evalTimer = null;
            this._evaluate();
        }, 500);
    },

    _evaluate() {
        if (!Game.state.options || Game.state.options.advisorEnabled === false) {
            this._hideHint();
            return;
        }
        // Don't spam: max 1 hint per time period
        const s = Game.state;
        const key = s.day * 10 + s.calendar.timeOfDay;
        if (key === this._lastHintTime && this._dismissed) return;
        if (key !== this._lastHintTime) this._dismissed = false;

        // Find first matching hint
        const hint = this.HINTS.find(h => h.check(s));
        if (hint) {
            this._showHint(hint);
            this._lastHintTime = key;
        } else {
            this._hideHint();
        }
    },

    _showHint(hint) {
        const el = document.getElementById('advisor-hint');
        if (!el) return;
        el.querySelector('.advisor-icon').textContent = hint.icon || '💡';
        el.querySelector('.advisor-text').textContent = hint.text;
        el.classList.remove('hidden');
        el.classList.add('advisor-pulse');
        if (typeof Scheduler !== 'undefined') {
            Scheduler.timeout(() => el.classList.remove('advisor-pulse'), 2000, { group: 'advisor', label: 'pulse' });
        } else {
            setTimeout(() => el.classList.remove('advisor-pulse'), 2000);
        }
    },

    _hideHint() {
        const el = document.getElementById('advisor-hint');
        if (el) el.classList.add('hidden');
    },

    dismiss() {
        this._dismissed = true;
        this._hideHint();
    },

    toggle(enabled) {
        if (enabled) {
            this._dismissed = false;
            this._evaluate();
        } else {
            this._hideHint();
        }
    },
};
