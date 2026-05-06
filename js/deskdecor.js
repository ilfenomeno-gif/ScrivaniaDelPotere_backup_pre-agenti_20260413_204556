/* ============================================
   DESK DECORATIONS — Unlockable Desk Objects
   ============================================ */

const DeskDecor = {
    DECORATIONS: [
        {
            id: 'quadro-partito',
            name: '🖼️ Quadro del Partito',
            desc: 'Simbolo del tuo impegno politico.',
            check: s => s.career.level >= 2, // Dirigente
            css: 'decor-quadro',
            position: 'top-left',
        },
        {
            id: 'foto-alleati',
            name: '📸 Foto degli Alleati',
            desc: 'I volti di chi ti sostiene.',
            check: s => s.contacts.filter(c => c.relation >= 70).length >= 5,
            css: 'decor-foto',
            position: 'top-right',
        },
        {
            id: 'pugnale',
            name: '🔪 Pugnale Decorativo',
            desc: 'Un segno di rispetto... o paura.',
            check: s => s.mafia && s.mafia.rank >= 2,
            css: 'decor-pugnale',
            position: 'mid-right',
        },
        {
            id: 'trofeo-oro',
            name: '🏆 Trofeo d\'Oro',
            desc: 'Hai raggiunto il massimo.',
            check: s => s.reputazione >= 80,
            css: 'decor-trofeo',
            position: 'mid-left',
        },
        {
            id: 'pianta',
            name: '🌿 Pianta Rigogliosa',
            desc: 'Segno di una mente sana.',
            check: s => s.stats.morale >= 70 && s.stats.salute >= 70,
            css: 'decor-pianta',
            position: 'bottom-left',
        },
        {
            id: 'lampada-lusso',
            name: '💡 Lampada di Lusso',
            desc: 'Puoi permetterti il meglio.',
            check: s => s.money >= 1500,
            css: 'decor-lampada',
            position: 'bottom-right',
        },
        {
            id: 'medaglia-coerenza',
            name: '🎖️ Medaglia della Coerenza',
            desc: 'Mai tradito i tuoi principi.',
            check: s => s.coherence >= 90 && s.day >= 15,
            css: 'decor-medaglia',
            position: 'top-center',
        },
        {
            id: 'radio-vintage',
            name: '📻 Radio Vintage',
            desc: 'Per ascoltare le notizie con stile.',
            check: s => s.day >= 30,
            css: 'decor-radio',
            position: 'mid-center',
        },
    ],

    init() {
        if (!Game.state.deskDecor) Game.state.deskDecor = [];
        Game.on('time-advance', () => this._checkUnlocks());
        Game.on('new-day', () => this._checkUnlocks());
        Game.on('stat-change', () => this._scheduleCheck());
        this._render();
    },

    _checkTimer: null,
    _scheduleCheck() {
        if (this._checkTimer) return;
        this._checkTimer = Scheduler.timeout(() => {
            this._checkTimer = null;
            this._checkUnlocks();
        }, 500, { group: 'deskdecor', label: 'check' });
    },

    _checkUnlocks() {
        const s = Game.state;
        let newUnlock = false;
        this.DECORATIONS.forEach(d => {
            if (!s.deskDecor.includes(d.id) && d.check(s)) {
                s.deskDecor.push(d.id);
                newUnlock = true;
                // Notify
                if (typeof HUD !== 'undefined') {
                    HUD.showToast(`🎨 Nuovo oggetto: ${d.name}`);
                }
                // Add to timeline
                if (typeof Timeline !== 'undefined') {
                    Timeline.add('🎨', 'Personalizzazione', `Sbloccato: ${d.name}`, 'reward');
                }
            }
        });
        if (newUnlock) this._render();
    },

    _render() {
        const container = document.getElementById('desk-decorations');
        if (!container) return;
        const unlocked = Game.state.deskDecor || [];

        let html = '';
        this.DECORATIONS.forEach(d => {
            if (unlocked.includes(d.id)) {
                html += `<div class="desk-decor-item ${d.css}" data-pos="${d.position}" title="${Game.esc(d.name)}: ${Game.esc(d.desc)}">
                    <span>${d.name.split(' ')[0]}</span>
                </div>`;
            }
        });
        container.innerHTML = html;
    },
};
