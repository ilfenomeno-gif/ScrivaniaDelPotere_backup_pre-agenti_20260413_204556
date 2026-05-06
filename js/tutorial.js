/* ============================================
   TUTORIAL — Guida Interattiva Primi 3 Giorni
   ============================================ */

const Tutorial = {
    init() {
        if (!Game.state.flags) Game.state.flags = {};
        if (typeof Game.state.flags.tutorialStep !== 'number') Game.state.flags.tutorialStep = 1;
        if (typeof Game.state.flags.tutorialDone !== 'boolean') Game.state.flags.tutorialDone = false;

        Game.on('new-day', () => this.onDayStart());
        Game.on('panel-open', (data) => this.onPanelOpen(data));
        Game.on('bill-paid', () => this.onBillPaid());

        this.onDayStart();
    },

    onDayStart() {
        if (Game.state.flags.tutorialDone) return;
        if (Game.state.day > 3) {
            this.finishTutorial();
            return;
        }

        if (Game.state.day === 1) {
            this.setStep(1);
            this.highlight('item-tasks');
            Game.addWorkNotif('🎓 Tutorial (1/3)', 'Apri Mansioni e completa un task di lavoro per stabilizzare il budget.', `Giorno ${Game.state.day}`);
        } else if (Game.state.day === 2) {
            this.setStep(2);
            this.highlight('item-phone');
            Game.addWorkNotif('🎓 Tutorial (2/3)', 'Apri SmartPolitica e interagisci con i contatti per far crescere reputazione e relazioni.', `Giorno ${Game.state.day}`);
        } else if (Game.state.day === 3) {
            this.setStep(3);
            this.highlight('item-house');
            Game.addWorkNotif('🎓 Tutorial (3/3)', 'Apri Casa e controlla Economia/Bollette per evitare blocchi e sanzioni.', `Giorno ${Game.state.day}`);
        }
    },

    onPanelOpen(data) {
        if (Game.state.flags.tutorialDone) return;
        const step = Game.state.flags.tutorialStep || 1;
        if (step === 1 && data.panel === 'tasks') {
            this.clearHighlight();
            HUD.showToast('✅ Ottimo. Ora completa almeno un task di lavoro.');
        }
        if (step === 2 && data.panel === 'phone') {
            this.clearHighlight();
            HUD.showToast('✅ Perfetto. Prova social o contatti per far crescere consenso.');
        }
        if (step === 3 && data.panel === 'house') {
            this.clearHighlight();
            HUD.showToast('✅ Bene. Tieni d\'occhio bollette e debiti.');
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
};
