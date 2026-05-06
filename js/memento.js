/* ============================================
   MEMENTO — Per-Turn Summary Popup
   ============================================ */

const Memento = {
    _turnSnapshot: null,

    init() {
        // Take initial snapshot
        this.takeSnapshot();

        // Before each time advance, we take a snapshot via a pre-hook
        // We patch Game.advanceTime to capture pre-state
        const originalAdvance = Game.advanceTime.bind(Game);
        Game.advanceTime = () => {
            this.takeSnapshot();
            originalAdvance();
        };

        // After time advance, show turn summary
        Game.on('time-advance', (d) => this.showTurnSummary(d));
    },

    takeSnapshot() {
        const s = Game.state;
        this._turnSnapshot = {
            stats: { ...s.stats },
            attributes: { ...s.attributes },
            reputazione: s.reputazione,
            reputazioneNazionale: s.reputazioneNazionale,
            coherence: s.coherence,
            money: s.money,
            timeOfDay: s.calendar.timeOfDay,
        };
    },

    showTurnSummary(d) {
        if (!this._turnSnapshot) return;
        const snap = this._turnSnapshot;
        const s = Game.state;

        const lines = [];

        // Stats
        const statLabels = {
            stanchezza: '😴 Stanchezza',
            stress: '😰 Stress',
            morale: '😊 Morale',
            salute: '❤️ Salute',
        };
        for (const [key, label] of Object.entries(statLabels)) {
            const delta = s.stats[key] - snap.stats[key];
            if (delta !== 0) lines.push(this._line(label, delta));
        }

        // Key attributes (only show if changed)
        const attrLabels = {
            intelligenza: '🧠 Int.',
            carisma: '✨ Carisma',
            autenticita: '🗣️ Aut.',
            muscoli: '💪 Muscoli',
            estetica: '🪞 Estetica',
        };
        for (const [key, label] of Object.entries(attrLabels)) {
            const delta = s.attributes[key] - snap.attributes[key];
            if (delta !== 0) lines.push(this._line(label, delta));
        }

        // Rep, coherence, money
        const repD = s.reputazione - snap.reputazione;
        const repND = s.reputazioneNazionale - (snap.reputazioneNazionale || 0);
        const cohD = s.coherence - snap.coherence;
        const monD = s.money - snap.money;
        if (repD !== 0) lines.push(this._line('⭐ Rep. Locale', repD));
        if (repND !== 0) lines.push(this._line('🌐 Rep. Naz.', repND));
        if (cohD !== 0) lines.push(this._line('🧩 Coerenza', cohD));
        if (monD !== 0) lines.push(this._line('💶 Soldi', monD, '€'));

        // Only show if something changed
        if (lines.length === 0) return;

        // Determine the period label (what just ended)
        const prevLabels = ['Mattina', 'Pomeriggio', 'Sera'];
        const prevTime = snap.timeOfDay;
        const periodLabel = prevLabels[prevTime] || 'Turno';

        // Build popup
        let popup = document.getElementById('memento-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'memento-popup';
            popup.className = 'memento-popup hidden';
            const phoneDevice = document.querySelector('#item-phone .phone-device');
            if (phoneDevice) {
                phoneDevice.appendChild(popup);
            } else {
                document.getElementById('screen-desk').appendChild(popup);
            }
        }
        popup.onclick = () => popup.classList.add('hidden');

        // Dangers
        const dangers = [];
        if (s.stats.stanchezza >= 80) dangers.push('🔴 Esausto');
        if (s.stats.stress >= 90) dangers.push('🔥 Burnout');
        else if (s.stats.stress >= 70) dangers.push('⚠️ Sovraccarico');
        if (s.stats.morale <= 30) dangers.push('😞 Depresso');
        if (s.stats.salute <= 50) dangers.push('🤒 Malato');

        let html = `<div class="memento-header">📋 ${periodLabel.toUpperCase()}</div>`;
        html += '<div class="memento-lines">' + lines.join('') + '</div>';
        if (dangers.length > 0) {
            html += `<div class="memento-dangers">${dangers.join(' | ')}</div>`;
        }

        popup.innerHTML = html;
        popup.classList.remove('hidden');

        // Auto-hide after 3 seconds
        clearTimeout(this._autoHide);
        this._autoHide = setTimeout(() => {
            if (popup) popup.classList.add('hidden');
        }, 3000);
    },

    _line(label, delta, suffix) {
        suffix = suffix || '';
        const cls = delta > 0 ? 'memento-up' : 'memento-down';
        const sign = delta > 0 ? '+' : '';
        return `<div class="memento-line ${cls}">${label}: <strong>${sign}${delta}${suffix}</strong></div>`;
    },
};
