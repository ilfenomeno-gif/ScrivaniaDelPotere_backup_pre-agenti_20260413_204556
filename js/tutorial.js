/* ============================================
   TUTORIAL — Guida Interattiva Primi 3 Giorni
   ============================================ */

const Tutorial = {
    _reminderTimeout: null,
    _stepHints: [
        {
            id: 1,
            element: 'item-tasks',
            notif: 'Apri Mansioni e completa un task di lavoro per stabilizzare il budget.',
            tooltip: 'Clicca qui per vedere le Mansioni. Completa almeno un task per proseguire.',
        },
        {
            id: 2,
            element: 'item-phone',
            notif: 'Apri SmartPolitica e interagisci con i contatti per far crescere reputazione e relazioni.',
            tooltip: 'Clicca qui per accedere al telefono. Prova a inviare un messaggio o pubblicare un post.',
        },
        {
            id: 3,
            element: 'item-house',
            notif: 'Apri Casa e controlla Economia/Bollette per evitare blocchi e sanzioni.',
            tooltip: 'Clicca qui per vedere la situazione economica e le bollette.',
        },
    ],

    init() {
        if (!Game.state.flags) Game.state.flags = {};
        if (typeof Game.state.flags.tutorialStep !== 'number') Game.state.flags.tutorialStep = 1;
        if (typeof Game.state.flags.tutorialDone !== 'boolean') Game.state.flags.tutorialDone = false;

        Game.on('new-day', () => this.onDayStart());
        Game.on('panel-open', (data) => this.onPanelOpen(data));
        Game.on('bill-paid', () => this.onBillPaid());
        Game.on('time-advance', () => this.checkReminder());
        Game.on('ap-change', () => this.checkReminder());

        this.onDayStart();
    },

    onDayStart() {
        if (Game.state.flags.tutorialDone) return;
        if (Game.state.day > 3) {
            this.finishTutorial();
            return;
        }
        const step = Game.state.day;
        this.setStep(step);
        const hint = this._stepHints[step - 1];
        if (hint) {
            this.highlight(hint.element);
            Game.addWorkNotif(`🎓 Tutorial (${step}/3)`, hint.notif, `Giorno ${Game.state.day}`);
            this.showTooltip(hint.element, hint.tooltip);
            this.setReminder(hint);
        }
    },

    onPanelOpen(data) {
        if (Game.state.flags.tutorialDone) return;
        const step = Game.state.flags.tutorialStep || 1;
        const hint = this._stepHints[step - 1];
        if (hint && data.panel && hint.element.includes(data.panel)) {
            this.clearHighlight();
            this.hideTooltip(hint.element);
            HUD.showToast('✅ Ottimo! Ora segui le istruzioni a schermo.');
            this.clearReminder();
        }
        // Step completato: reminder per azione successiva
        if (step === 1 && data.panel === 'tasks') {
            this.setReminder({
                element: 'item-tasks',
                notif: 'Completa almeno un task di lavoro per proseguire.',
                tooltip: 'Clicca su un task e portalo a termine.'
            });
        }
        if (step === 2 && data.panel === 'phone') {
            this.setReminder({
                element: 'item-phone',
                notif: 'Prova social o contatti per far crescere consenso.',
                tooltip: 'Invia un messaggio o pubblica un post.'
            });
        }
        if (step === 3 && data.panel === 'house') {
            this.setReminder({
                element: 'item-house',
                notif: 'Controlla Economia/Bollette e paga almeno una bolletta.',
                tooltip: 'Clicca su una bolletta e paga.'
            });
        }
    },

    onBillPaid() {
        if (Game.state.flags.tutorialDone) return;
        if ((Game.state.flags.tutorialStep || 1) === 3) {
            this.finishTutorial();
        }
    },

    setStep(step) {
        Game.state.flags.tutorialStep = step;
    },

    finishTutorial() {
        this.clearHighlight();
        this.hideAllTooltips();
        this.clearReminder();
        Game.state.flags.tutorialDone = true;
        Game.addWorkNotif('🎓 Tutorial completato', 'Hai completato la guida iniziale. Ora giochi senza assistenza.', `Giorno ${Game.state.day}`);
    },

    highlight(elementId) {
        this.clearHighlight();
        const el = document.getElementById(elementId);
        if (el) el.classList.add('tutorial-highlight');
    },

    clearHighlight() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
    },

    showTooltip(elementId, text) {
        const el = document.getElementById(elementId);
        if (!el) return;
        let tip = el.querySelector('.tutorial-tooltip');
        if (!tip) {
            tip = document.createElement('div');
            tip.className = 'tutorial-tooltip';
            el.appendChild(tip);
        }
        tip.textContent = text;
        tip.style.display = 'block';
    },

    hideTooltip(elementId) {
        const el = document.getElementById(elementId);
        if (!el) return;
        const tip = el.querySelector('.tutorial-tooltip');
        if (tip) tip.style.display = 'none';
    },

    hideAllTooltips() {
        document.querySelectorAll('.tutorial-tooltip').forEach(tip => tip.style.display = 'none');
    },

    setReminder(hint) {
        this.clearReminder();
        this._reminderTimeout = setTimeout(() => {
            Game.addWorkNotif('💡 Suggerimento', hint.notif, `Tutorial`);
            this.showTooltip(hint.element, hint.tooltip);
        }, 35000); // reminder ogni 35s se inattivo
    },

    clearReminder() {
        if (this._reminderTimeout) {
            clearTimeout(this._reminderTimeout);
            this._reminderTimeout = null;
        }
    },

    checkReminder() {
        // Se il giocatore resta bloccato (no task completati, no bollette pagate, no azioni), ripropone il reminder
        if (Game.state.flags.tutorialDone) return;
        const step = Game.state.flags.tutorialStep || 1;
        if (step === 1 && Game.state.taskPools && Game.state.taskPools.work && Game.state.taskPools.work.length > 0) {
            this.setReminder(this._stepHints[0]);
        }
        if (step === 2 && Game.state.contacts && Game.state.contacts.length > 0) {
            this.setReminder(this._stepHints[1]);
        }
        if (step === 3 && Game.state.bills && Game.state.bills.some(b => !b.paid)) {
            this.setReminder(this._stepHints[2]);
        }
    },
};
