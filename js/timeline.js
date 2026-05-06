/* ============================================
   DIARIO VISIVO — Timeline delle Scelte
   ============================================ */

const Timeline = {
    init() {
        // Initialize timeline array if not present
        if (!Game.state.timeline) Game.state.timeline = [];

        // Track key events
        Game.on('career-promotion', (d) => {
            this.add('🎉', 'Promozione', `Promosso a ${Game.getCareerLevel().label}!`, 'career');
        });
        Game.on('housing-change', () => {
            this.add('🏠', 'Nuovo Alloggio', `Trasferito: ${Game.state.housing.label}`, 'housing');
        });
        Game.on('city-change', () => {
            if (Game.state.city) this.add('📍', 'Trasferimento', `Trasferito a ${Game.state.city.name}`, 'city');
        });
        Game.on('bill-paid', (d) => {
            if (d && d.name) this.add('💳', 'Pagamento', `Pagato: ${d.name}`, 'finance');
        });
        Game.on('improvement-bought', (d) => {
            const item = Game.HOME_IMPROVEMENTS_CATALOG.find(i => i.id === d.id);
            if (item) this.add('🛠️', 'Miglioria', `Acquistato: ${item.name}`, 'housing');
        });
        Game.on('task-completed', (d) => {
            if (d && d.type === 'political') {
                this.add('🏛️', 'Politica', `Compito completato: ${d.name || 'Impresa politica'}`, 'political');
            }
        });
        Game.on('mafia-daily', () => {
            // Track mafia rank changes
            if (Game.state.mafia.active && !this._lastMafiaRank) this._lastMafiaRank = 0;
            if (Game.state.mafia.rank > (this._lastMafiaRank || 0)) {
                const ranks = ['Nessuno', 'Picciotto', "Uomo d'Onore", 'Capodecina', 'Capo Mandamento'];
                this.add('🔫', 'Mafia', `Promosso a ${ranks[Game.state.mafia.rank] || '???'}`, 'mafia');
                this._lastMafiaRank = Game.state.mafia.rank;
            }
        });
        Game.on('urgent-message', (msg) => {
            if (msg && msg.type === 'boss') {
                this.add('📩', 'Messaggio', `Da ${msg.from}: "${msg.text.substring(0, 50)}..."`, 'event');
            }
        });
        Game.on('eviction', () => {
            this.add('🏚️', 'Sfratto', 'Sei stato sfrattato! Dormi in ufficio al partito.', 'crisis');
        });

        // Bind open button
        const openBtn = document.getElementById('timeline-open-btn');
        if (openBtn) openBtn.addEventListener('click', () => this.show());

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const overlay = document.getElementById('timeline-overlay');
            if (overlay && !overlay.classList.contains('hidden')) this.hide();
        });
    },

    _lastMafiaRank: 0,

    add(icon, title, description, type) {
        if (!Game.state.timeline) Game.state.timeline = [];
        Game.state.timeline.push({
            day: Game.state.day,
            time: Game.getTimeLabel(),
            icon: icon,
            title: title,
            desc: description,
            type: type || 'generic',
        });
        // Limit to last 100 entries
        if (Game.state.timeline.length > 100) Game.state.timeline.shift();
    },

    show() {
        const overlay = document.getElementById('timeline-overlay');
        if (!overlay) return;
        overlay.classList.remove('hidden');

        const entries = (Game.state.timeline || []).slice().reverse();
        let html = `<div class="timeline-header">
            <h2>📖 La Tua Storia</h2>
            <button class="timeline-close" id="timeline-close-btn">✕</button>
        </div>`;

        if (entries.length === 0) {
            html += '<div class="timeline-empty">Nessun evento ancora. Gioca per creare la tua storia!</div>';
        } else {
            html += '<div class="timeline-track">';
            let lastDay = -1;
            entries.forEach(e => {
                if (e.day !== lastDay) {
                    html += `<div class="timeline-day-marker">Giorno ${e.day}</div>`;
                    lastDay = e.day;
                }
                html += `<div class="timeline-entry timeline-${e.type}">
                    <div class="timeline-dot">${e.icon}</div>
                    <div class="timeline-content">
                        <div class="timeline-title">${Game.esc(e.title)}</div>
                        <div class="timeline-desc">${Game.esc(e.desc)}</div>
                        <div class="timeline-meta">${e.time}</div>
                    </div>
                </div>`;
            });
            html += '</div>';
        }

        // Also show diary entries (from diary.js diaryEntries)
        const diaryEntries = (Game.state.diaryEntries || []).slice().reverse();
        if (diaryEntries.length > 0) {
            html += `<div class="timeline-diary-section">
                <h3>📓 Riflessioni Personali</h3>`;
            diaryEntries.forEach(de => {
                html += `<div class="timeline-entry timeline-diary">
                    <div class="timeline-dot">📝</div>
                    <div class="timeline-content">
                        <div class="timeline-title">Giorno ${de.day || '?'}: ${Game.esc(de.question || de.title || '')}</div>
                        <div class="timeline-desc">"${Game.esc(de.answer || de.text || '')}"</div>
                        <div class="timeline-effects">${(de.effects || []).map(e => Game.esc(e)).join(' | ')}</div>
                    </div>
                </div>`;
            });
            html += '</div>';
        }

        overlay.querySelector('.timeline-body').innerHTML = html;
        const closeBtn = document.getElementById('timeline-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', () => this.hide(), { once: true });
    },

    hide() {
        const overlay = document.getElementById('timeline-overlay');
        if (overlay) overlay.classList.add('hidden');
    },
};
