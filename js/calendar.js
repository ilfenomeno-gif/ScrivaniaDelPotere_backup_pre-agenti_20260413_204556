/* ============================================
   CALENDAR — Appuntamenti Pianificati & SR
   Include integrazione WorkTasks e tipi appunt.
   ============================================ */

const Calendar = {
    appointments: [],

    /* Tipi appuntamento con icona e conseguenze */
    APPOINTMENT_TYPES: {
        meeting:  { label: 'Riunione',       icon: '🤝', color: '#4a90e2' },
        deadline: { label: 'Scadenza',        icon: '⏰', color: '#e63946' },
        event:    { label: 'Evento',          icon: '🎭', color: '#2a9d8f' },
        election: { label: 'Elezione',        icon: '🗳️', color: '#f4a261' },
        worktask: { label: 'Lavoro Agenda',   icon: '🗂️', color: '#8338ec' },
        personal: { label: 'Personale',       icon: '📌', color: '#888'    },
    },

    init() {
        this.load();
        this.render();
        const btn = document.getElementById('btn-add-appointment');
        if (btn) btn.addEventListener('click', () => this.openAddModal());
        Game.on('time-advance', () => this.checkAppointments());
        // Mostra lavori agenda in calendario
        Game.on('panel-open', (d) => { if (d.panel === 'calendar') this.render(); });
    },

    load() {
        try {
            const raw = localStorage.getItem('scrivaniaDelPotere_calendar');
            this.appointments = raw ? JSON.parse(raw) : [];
        } catch {
            this.appointments = [];
        }
    },

    save() {
        localStorage.setItem('scrivaniaDelPotere_calendar', JSON.stringify(this.appointments));
    },

    render() {
        const body = document.getElementById('calendar-body');
        if (!body) return;
        body.setAttribute('role', 'list');
        body.setAttribute('aria-label', 'Lista appuntamenti');
        body.innerHTML = '';

        // --- WorkTasks attivi nel calendario ---
        const activeWorkTasks = (Game.state.workTasks?.active || []).filter(t => t.deadline);
        activeWorkTasks.forEach(task => {
            const item = document.createElement('div');
            item.className = 'calendar-appointment calendar-worktask';
            item.setAttribute('role', 'listitem');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `Lavoro: ${task.title}, scade Giorno ${task.deadline}`);
            item.innerHTML = `
                <span class="calendar-badge" style="background:#8338ec">🗂️ Lavoro</span>
                <span class="calendar-date">Scade Giorno ${task.deadline}</span>
                <span class="calendar-desc">${Game.esc(task.title)} ${'⭐'.repeat(task.difficulty)}</span>
                <button class="calendar-open-task-btn" data-task="${task.id}" aria-label="Apri lavoro ${Game.esc(task.title)}">Apri →</button>
            `;
            item.querySelector('.calendar-open-task-btn').addEventListener('click', () => {
                if (typeof WorkTasks !== 'undefined') WorkTasks.showTaskModal(task.id);
            });
            body.appendChild(item);
        });

        // --- Appuntamenti normali ---
        if (!this.appointments.length && !activeWorkTasks.length) {
            const empty = document.createElement('div');
            empty.textContent = 'Nessun appuntamento.';
            empty.className = 'calendar-empty';
            body.appendChild(empty);
            return;
        }
        this.appointments.forEach((a, i) => {
            const type = this.APPOINTMENT_TYPES[a.type] || this.APPOINTMENT_TYPES.personal;
            const item = document.createElement('div');
            item.className = 'calendar-appointment';
            item.setAttribute('role', 'listitem');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `${a.dateLabel}: ${a.desc} — ${type.label}`);
            item.innerHTML = `
                <span class="calendar-badge" style="background:${type.color}">${type.icon} ${type.label}</span>
                <span class="calendar-date">${Game.esc(a.dateLabel)}</span>
                <span class="calendar-desc">${Game.esc(a.desc)}</span>
                <button aria-label="Elimina appuntamento" class="calendar-del-btn" data-i="${i}">🗑️</button>
            `;
            item.querySelector('.calendar-del-btn').addEventListener('click', e => {
                e.stopPropagation();
                this.delete(i);
            });
            body.appendChild(item);
        });
    },

    /* Apre la modal per aggiungere un appuntamento */
    openAddModal() {
        const _trigger = document.activeElement;
        const headingId = 'cal-modal-h-' + Date.now();

        let overlay = document.getElementById('calendar-add-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'calendar-add-overlay';
            overlay.className = 'calendar-modal-overlay';
            document.body.appendChild(overlay);
        }

        const typeOptions = Object.entries(this.APPOINTMENT_TYPES).map(([id, t]) =>
            `<option value="${id}">${t.icon} ${t.label}</option>`
        ).join('');

        overlay.innerHTML = `
            <div class="calendar-modal" role="dialog" aria-modal="true" aria-labelledby="${headingId}">
                <h2 id="${headingId}" class="calendar-modal-title">📅 Nuovo Appuntamento</h2>
                <p class="visually-hidden">Inserisci i dettagli dell'appuntamento. Usa Tab per navigare tra i campi.</p>
                <div class="calendar-form">
                    <label for="cal-type">Tipo
                        <select id="cal-type" class="calendar-input">${typeOptions}</select>
                    </label>
                    <label for="cal-desc">Descrizione
                        <input id="cal-desc" class="calendar-input" type="text"
                            placeholder="es: Incontro con il sindaco" maxlength="100"
                            aria-required="true">
                    </label>
                    <label for="cal-timeofday">Momento
                        <select id="cal-timeofday" class="calendar-input">
                            <option value="0">Mattina</option>
                            <option value="1">Pomeriggio</option>
                            <option value="2">Sera</option>
                        </select>
                    </label>
                    <label for="cal-day">Giorno (attuale: ${Game.state.day || 1})
                        <input id="cal-day" class="calendar-input" type="number"
                            min="${(Game.state.day || 1) + 1}" value="${(Game.state.day || 1) + 1}"
                            aria-required="true">
                    </label>
                </div>
                <div class="calendar-modal-footer">
                    <button id="cal-save-btn" class="btn-primary">💾 Salva</button>
                    <button id="cal-cancel-btn" class="btn-secondary">Annulla</button>
                </div>
            </div>
        `;

        overlay.style.display = 'flex';
        const modalEl = overlay.querySelector('[role="dialog"]');
        if (window.SR) SR.openModal(modalEl, 'Nuovo Appuntamento', 'Compila i campi per aggiungere un appuntamento al calendario.');

        overlay.querySelector('#cal-save-btn').addEventListener('click', () => {
            const desc = overlay.querySelector('#cal-desc').value.trim();
            const type = overlay.querySelector('#cal-type').value;
            const tod = parseInt(overlay.querySelector('#cal-timeofday').value, 10);
            const day = parseInt(overlay.querySelector('#cal-day').value, 10);
            if (!desc) {
                if (window.SR) SR.announce('Inserisci una descrizione per l\'appuntamento.', 'assertive');
                overlay.querySelector('#cal-desc').focus();
                return;
            }
            const typeData = this.APPOINTMENT_TYPES[type] || this.APPOINTMENT_TYPES.personal;
            const timeLabel = ['Mattina', 'Pomeriggio', 'Sera'][tod] || 'Mattina';
            const dateLabel = `Giorno ${day} — ${timeLabel}`;
            this.appointments.push({ day, timeOfDay: tod, desc, type, dateLabel });
            this.save();
            this.render();
            overlay.style.display = 'none';
            if (window.SR) SR.closeModal(_trigger, `Appuntamento "${desc}" pianificato per ${dateLabel}.`);
        });

        overlay.querySelector('#cal-cancel-btn').addEventListener('click', () => {
            overlay.style.display = 'none';
            if (window.SR) SR.closeModal(_trigger, 'Aggiunta appuntamento annullata.');
        });

        // Focus prima campo
        setTimeout(() => overlay.querySelector('#cal-desc')?.focus(), 50);
    },

    promptNewAppointment() {
        this.openAddModal();
    },

    delete(i) {
        this.appointments.splice(i, 1);
        this.save();
        this.render();
    },

    checkAppointments() {
        const today = Game.state.day || 1;
        const tod = Game.state.calendar?.timeOfDay || 0;
        const due = this.appointments.filter(a => a.day === today && a.timeOfDay === tod);
        due.forEach(a => {
            const type = this.APPOINTMENT_TYPES[a.type] || this.APPOINTMENT_TYPES.personal;
            if (window.SR) SR.announce(`${type.icon} Appuntamento ora: ${a.desc}`, 'assertive');
            Game.addWorkNotif(`${type.icon} ${type.label}`, a.desc, `Giorno ${today}`);

            // Conseguenze appuntamento mancato (se passa il giorno)
            if (a.type === 'deadline') {
                Game.changeReputazione(-3);
                Game.changeStat('stress', 5);
                if (window.SR) SR.announce('Scadenza mancata! Reputazione -3, Stress +5.', 'assertive');
            }
            if (a.type === 'election') {
                Game.addWorkNotif('🗳️ Elezione', 'Il giorno elettorale è arrivato. Controlla i risultati.', `Giorno ${today}`);
            }
            if (a.type === 'worktask' && a.taskId && typeof WorkTasks !== 'undefined') {
                WorkTasks.showTaskModal(a.taskId);
            }
        });
        if (due.length) {
            this.appointments = this.appointments.filter(a => !(a.day === today && a.timeOfDay === tod));
            this.save();
            this.render();
        }

        // Processa anche scadenze WorkTasks
        if (typeof WorkTasks !== 'undefined' && WorkTasks._processDeadlines) {
            // già chiamato da WorkTasks.init() — nessun doppio call
        }
    },
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Game !== 'undefined' && Game.on) {
        Calendar.init();
    } else {
        setTimeout(() => Calendar.init(), 800);
    }
});
