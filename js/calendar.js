/* ============================================
   CALENDAR — Appuntamenti Pianificati & SR
   ============================================ */

const Calendar = {
    appointments: [],

    init() {
        this.load();
        this.render();
        const btn = document.getElementById('btn-add-appointment');
        if (btn) btn.addEventListener('click', () => this.promptNewAppointment());
        Game.on('time-advance', () => this.checkAppointments());
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
        body.innerHTML = '';
        if (!this.appointments.length) {
            const empty = document.createElement('div');
            empty.textContent = 'Nessun appuntamento.';
            empty.className = 'calendar-empty';
            body.appendChild(empty);
            return;
        }
        this.appointments.forEach((a, i) => {
            const item = document.createElement('div');
            item.className = 'calendar-appointment';
            item.setAttribute('role', 'listitem');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `${a.dateLabel}: ${a.desc}`);
            item.innerHTML = `<span class="calendar-date">${a.dateLabel}</span> <span class="calendar-desc">${a.desc}</span> <button aria-label="Elimina appuntamento" class="calendar-del-btn" data-i="${i}">🗑️</button>`;
            item.querySelector('.calendar-del-btn').addEventListener('click', e => { e.stopPropagation(); this.delete(i); });
            body.appendChild(item);
        });
    },

    promptNewAppointment() {
        const desc = prompt('Descrizione appuntamento (es: Incontro con Mario)');
        if (!desc) return;
        // Prossimo slot: domani mattina
        const day = (Game.state.day || 1) + 1;
        const dateLabel = `Giorno ${day} — Mattina`;
        this.appointments.push({ day, timeOfDay: 0, desc, dateLabel });
        this.save();
        this.render();
        if (window.SR) SR.announce(`Appuntamento pianificato: ${desc} per domani mattina.`, 'polite');
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
            if (window.SR) SR.announce(`Appuntamento ora: ${a.desc}`, 'assertive');
            Game.addWorkNotif('📅 Appuntamento', a.desc, `Giorno ${today}`);
        });
        if (due.length) {
            this.appointments = this.appointments.filter(a => !(a.day === today && a.timeOfDay === tod));
            this.save();
            this.render();
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
