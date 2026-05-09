/* ============================================
   DILEMMAS — Scelte Morali Quotidiane
   ============================================ */

const Dilemmas = {

    // Pool of daily moral dilemmas (non-mafia)
    POOL: [
        // 1. Il Parcheggio Abusivo
        {
            id: 'parcheggio',
            title: '🚗 Il Parcheggio Abusivo',
            body: 'Sei in ritardo a un comizio. L\'unico posto è sul marciapiede.',
            from: 'Coscienza',
            cooldown: 10,
            condition: () => Game.state.day >= 3,
            choices: [
                {
                    label: '🅿️ Parcheggi lo stesso',
                    effects: { reputazione: 5 },
                    delayed: { chance: 0.6, text: 'Un giornalista ti ha fotografato sul marciapiede!', reputazione: -3 },
                    outcome: 'Arrivi in tempo al comizio. +5 Reputazione.',
                },
                {
                    label: '🔍 Cerchi parcheggio regolare',
                    effects: { reputazione: -5, coherence: 2 },
                    outcome: 'Arrivi tardi, comizio rovinato. Ma coscienza pulita.',
                },
                {
                    label: '📞 Chiami un vigile amico',
                    effects: { reputazione: 5 },
                    delayed: { chance: 0.6, text: 'Il vigile ti chiede un favore: "Ricordati di me quando serve..."', stress: 4 },
                    debtFlag: 'vigile_favor',
                    outcome: 'Arrivi in tempo, nessuna multa. Ma ora devi un favore.',
                },
            ],
        },
        // 2. La Raccomandazione dell'Amico
        {
            id: 'raccomandazione',
            title: '🤝 La Raccomandazione',
            body: 'Un vecchio amico ti chiede di assumere suo figlio nel tuo ufficio. Il ragazzo è palesemente incapace.',
            from: 'Vecchio Amico',
            cooldown: 15,
            condition: () => Game.state.day >= 5,
            choices: [
                {
                    label: '✅ Lo assumi',
                    effects: { coherence: -8 },
                    contactBoost: 15,
                    outcome: '+15 Relazione con l\'amico. -8 Coerenza.',
                },
                {
                    label: '❌ Rifiuti gentilmente',
                    effects: { coherence: 5 },
                    contactLoss: 10,
                    outcome: '-10 Relazione. +5 Coerenza.',
                },
                {
                    label: '🎭 Posto fittizio (inesistente)',
                    effects: {},
                    contactBoost: 10,
                    delayed: { chance: 0.3, text: 'L\'amico ha scoperto che il posto era fittizio! Sei un bugiardo.', reputazione: -25, coherence: -10 },
                    outcome: '+10 Relazione, nessun malus ufficio... per ora.',
                },
            ],
        },
        // 3. La Busta Anonima
        {
            id: 'busta',
            title: '✉️ La Busta Anonima',
            body: 'Trovi una busta con €500 nella cassetta delle lettere. Nessun mittente.',
            from: 'Sconosciuto',
            cooldown: 20,
            condition: () => Game.state.day >= 7,
            choices: [
                {
                    label: '💰 Tieni i soldi',
                    effects: { money: 500, coherence: -10, stress: 3 },
                    outcome: '+€500. -10 Coerenza. Stress +3 (paranoia).',
                },
                {
                    label: '🚔 Denunci alla polizia',
                    effects: { reputazione: 8 },
                    delayed: { chance: 0.5, text: 'L\'imprenditore che ti ha mandato la busta ora ti ostacola.', reputazione: -3, stress: 2 },
                    outcome: '+8 Reputazione (onestà). Ma il mittente si offenderà...',
                },
                {
                    label: '🎗️ Beneficenza pubblica',
                    effects: { reputazione: 12, coherence: 5 },
                    delayed: { chance: 0.7, text: '"Quei soldi erano per un favore. Ora me lo devi." — l\'imprenditore si fa vivo.', stress: 7 },
                    debtFlag: 'imprenditore_favor',
                    outcome: '+12 Reputazione, +5 Coerenza. Ma qualcuno si farà vivo...',
                },
            ],
        },
        // 4. Il Vicino Rumoroso
        {
            id: 'vicino',
            title: '🔊 Il Vicino Rumoroso',
            body: 'Il vicino fa festa fino a tardi. Domani hai una riunione importante.',
            from: 'Vita Quotidiana',
            cooldown: 10,
            condition: () => Game.state.day >= 4,
            choices: [
                {
                    label: '🚔 Chiami la polizia',
                    effects: { stanchezza: -10 },
                    delayed: { chance: 0.6, text: 'Il vicino è un giornalista locale. Ha scritto un articolo contro di te.', reputazione: -5 },
                    outcome: 'Dormi bene. -10 Stanchezza.',
                },
                {
                    label: '🚪 Bussi e chiedi gentilmente',
                    effects: {},
                    randomOutcome: [
                        { chance: 0.5, text: 'Il vicino abbassa la musica. Dormita tranquilla.', stanchezza: -5, morale: 5 },
                        { chance: 0.5, text: 'Ti mandano a quel paese. Notte rovinata.', stress: 5, morale: -5 },
                    ],
                    outcome: '50% funziona, 50% no.',
                },
                {
                    label: '😤 Sopporti in silenzio',
                    effects: { stanchezza: 15 },
                    delayed: { chance: 0.3, text: 'Il vicino ti ha visto in TV e si ricorda di te. Ti voterà!', reputazione: 3 },
                    outcome: '+15 Stanchezza domani. Pazienza.',
                },
            ],
        },
        // 5. L'Offerta del Giornalista
        {
            id: 'giornalista',
            title: '📰 L\'Offerta del Giornalista',
            body: 'Un giornalista ti offre €200 per un\'intervista "piccante" su un tuo collega di partito.',
            from: 'Giornalista',
            cooldown: 12,
            condition: () => Game.state.day >= 8 && Game.state.contacts.length > 3,
            choices: [
                {
                    label: '💣 Sputtana il collega',
                    effects: { money: 200, coherence: -20 },
                    contactLossAll: 8,
                    outcome: '+€200. Il collega perde -15 Rep. Ma tutti ti odiano. -20 Coerenza.',
                },
                {
                    label: '🙅 Rifiuti sdegnato',
                    effects: { coherence: 10 },
                    contactBoost: 5,
                    delayed: { chance: 0.4, text: 'Il giornalista scrive che "non hai nulla da dire". Pessima figura.', reputazione: -3 },
                    outcome: '+10 Coerenza, +5 Relazione col collega.',
                },
                {
                    label: '🎤 Difendi il collega nell\'intervista',
                    effects: { reputazione: 5, money: 200 },
                    delayed: { chance: 0.5, text: 'Il giornalista ha tagliato male il pezzo. Sembri un ipocrita.', coherence: -5 },
                    outcome: '+€200, +5 Rep (lealtà). Ma il montaggio...',
                },
            ],
        },
        // 6. La Telefonata del Costruttore
        {
            id: 'costruttore',
            title: '🏗️ La Telefonata del Costruttore',
            body: 'Un costruttore locale ti invita a cena: "Solo per parlare, eh. Niente di strano."',
            from: 'Costruttore',
            cooldown: 15,
            condition: () => Game.state.day >= 10,
            choices: [
                {
                    label: '🍽️ Vai a cena',
                    effects: { money: 300, stress: 5 },
                    delayed: { chance: 0.4, text: 'Un fotografo vi ha beccati a cena. "Chi paga?"', reputazione: -8 },
                    outcome: '+€300 (cena pagata). Ma chi vi ha visto?',
                },
                {
                    label: '🙅 Declina educatamente',
                    effects: { coherence: 5 },
                    outcome: '+5 Coerenza. Nessun rischio.',
                },
                {
                    label: '🍽️ Vai ma paghi tu',
                    effects: { money: -80, coherence: 3 },
                    outcome: 'Cena pagata di tasca tua. -€80, +3 Coerenza. Almeno sei pulito.',
                },
            ],
        },
        // 7. Il Volantino Diffamatorio
        {
            id: 'volantino',
            title: '📄 Il Volantino Diffamatorio',
            body: 'Qualcuno ha distribuito volantini con accuse false contro di te nel quartiere.',
            from: 'Anonimo',
            cooldown: 12,
            condition: () => Game.state.day >= 6 && Game.state.reputazione > 30,
            choices: [
                {
                    label: '⚖️ Querela per diffamazione',
                    effects: { money: -200, stress: 10 },
                    delayed: { chance: 0.6, text: 'La querela ha avuto effetto. L\'autore si è scusato pubblicamente.', reputazione: 10 },
                    outcome: '-€200 avvocato, +Stress. Ma forse vincerai.',
                },
                {
                    label: '📢 Rispondi pubblicamente',
                    effects: { reputazione: 3, stress: 8 },
                    outcome: '+3 Rep, +8 Stress. Almeno la gente sente la tua versione.',
                },
                {
                    label: '🤷 Ignora',
                    effects: { reputazione: -5 },
                    outcome: '-5 Rep. Il silenzio a volte parla male.',
                },
            ],
        },
        // 8. L'Elemosina Elettorale
        {
            id: 'elemosina',
            title: '🗳️ L\'Elemosina Elettorale',
            body: 'Un capofamiglia del quartiere ti chiede €100 "per la festa del santo". In cambio, 20 voti garantiti.',
            from: 'Capofamiglia',
            cooldown: 15,
            condition: () => Game.state.day >= 8,
            choices: [
                {
                    label: '💰 Paga per i voti',
                    effects: { money: -100, reputazione: 6, coherence: -12 },
                    outcome: '-€100, +6 Rep, -12 Coerenza. Voto di scambio classico.',
                },
                {
                    label: '🙅 Rifiuta con dignità',
                    effects: { coherence: 8, reputazione: -2 },
                    outcome: '+8 Coerenza, -2 Rep. Hai perso 20 voti ma non la faccia.',
                },
                {
                    label: '🎤 Offri un comizio al posto dei soldi',
                    effects: { stanchezza: 10, reputazione: 4, coherence: 3 },
                    outcome: '+4 Rep, +3 Coerenza, +10 Stanchezza. Sudato ma onesto.',
                },
            ],
        },
    ],

    // State tracking
    _lastShown: {},      // { dilemmaId: dayShown }
    _delayedQueue: [],   // pending delayed consequences
    _debts: {},          // active debt flags

    init() {
        Game.on('time-advance', (d) => this.onTimeAdvance(d));
        Game.on('mafia-daily', () => this.processDelayed());
    },

    onTimeAdvance(data) {
        // Trigger dilemma at pomeriggio, ~30% chance
        if (data.timeOfDay !== 1) return;
        if (Math.random() > 0.30) return;

        const day = Game.state.day;
        const available = this.POOL.filter(d => {
            if (d.condition && !d.condition()) return false;
            const lastDay = this._lastShown[d.id] || 0;
            return (day - lastDay) >= d.cooldown;
        });

        if (available.length === 0) return;
        const dilemma = available[Math.floor(Math.random() * available.length)];
        this._lastShown[dilemma.id] = day;
        this.showDilemma(dilemma);
    },

    showDilemma(dilemma) {
        const _triggerEl = document.activeElement;
        let overlay = document.getElementById('urgent-choice-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'urgent-choice-overlay';
            overlay.className = 'urgent-choice-overlay';
            document.body.appendChild(overlay);
        }

        const buttonsHTML = dilemma.choices.map((c, i) =>
            `<button class="urgent-btn dilemma-btn" data-idx="${i}">${c.label}</button>`
        ).join('');

        const headingId = 'dilemma-heading-' + Date.now();
        overlay.innerHTML = `
            <div class="urgent-choice-modal dilemma-modal" role="dialog" aria-modal="true" aria-labelledby="${headingId}">
                <div id="${headingId}" class="urgent-choice-header dilemma-header">⚖️ ${Game.esc(dilemma.title)}</div>
                <div class="urgent-choice-from">Da: ${Game.esc(dilemma.from)}</div>
                <div class="urgent-choice-body">${Game.esc(dilemma.body)}</div>
                <p class="visually-hidden">Dilemma etico: scegli un'opzione. Usa Tab per muoverti, Invio per scegliere.</p>
                <div class="urgent-choice-buttons dilemma-buttons">${buttonsHTML}</div>
            </div>
        `;
        overlay.classList.add('visible');

        const modalEl = overlay.querySelector('[role="dialog"]');
        if (window.SR) SR.openModal(modalEl, dilemma.title, dilemma.body);

        overlay.querySelectorAll('.dilemma-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const choice = dilemma.choices[idx];
                overlay.classList.remove('visible');
                if (window.SR) SR.closeModal(_triggerEl, `Scelta effettuata: ${choice.label}.`);
                this.applyChoice(dilemma, choice);
            }, { once: true });
        });
    },

    applyChoice(dilemma, choice) {
        const e = choice.effects || {};
        if (e.money) Game.changeMoney(e.money);
        if (e.reputazione) Game.changeReputazione(e.reputazione);
        if (e.coherence) Game.changeStat('coherence', e.coherence);
        if (e.stress) Game.changeStat('stress', e.stress);
        if (e.stanchezza) Game.changeStat('stanchezza', e.stanchezza);
        if (e.morale) Game.changeStat('morale', e.morale);
        if (e.salute) Game.changeStat('salute', e.salute);

        // Contact boost (random favorite or first contact)
        if (choice.contactBoost) {
            const target = Game.state.contacts.find(c => c.favorite) || Game.state.contacts[0];
            if (target) target.relation = Math.min(100, target.relation + choice.contactBoost);
        }
        if (choice.contactLoss) {
            const target = Game.state.contacts.find(c => c.favorite) || Game.state.contacts[0];
            if (target) target.relation = Math.max(0, target.relation - choice.contactLoss);
        }
        if (choice.contactLossAll) {
            Game.state.contacts.forEach(c => {
                c.relation = Math.max(0, c.relation - choice.contactLossAll);
            });
        }

        // Random outcome (50/50)
        if (choice.randomOutcome) {
            const roll = Math.random();
            let cumulative = 0;
            for (const ro of choice.randomOutcome) {
                cumulative += ro.chance;
                if (roll <= cumulative) {
                    if (ro.stanchezza) Game.changeStat('stanchezza', ro.stanchezza);
                    if (ro.stress) Game.changeStat('stress', ro.stress);
                    if (ro.morale) Game.changeStat('morale', ro.morale);
                    if (ro.reputazione) Game.changeReputazione(ro.reputazione);
                    Game.addWorkNotif(`⚖️ ${dilemma.title}`, ro.text, `Giorno ${Game.state.day}`);
                    return;
                }
            }
        }

        // Delayed consequence
        if (choice.delayed) {
            this._delayedQueue.push({
                triggerDay: Game.state.day + 1 + Math.floor(Math.random() * 3),
                ...choice.delayed,
                dilemmaTitle: dilemma.title,
            });
        }

        // Debt flag
        if (choice.debtFlag) {
            this._debts[choice.debtFlag] = true;
        }

        // Outcome notification
        Game.addWorkNotif(`⚖️ ${dilemma.title}`, choice.outcome, `Giorno ${Game.state.day}`);
    },

    processDelayed() {
        const day = Game.state.day;
        const triggered = this._delayedQueue.filter(d => day >= d.triggerDay && Math.random() < (d.chance || 1));
        this._delayedQueue = this._delayedQueue.filter(d => day < d.triggerDay);

        triggered.forEach(d => {
            if (d.text) Game.addUrgentMessage('⚖️ Conseguenze', d.text, 'enemy');
            if (d.reputazione) Game.changeReputazione(d.reputazione);
            if (d.stress) Game.changeStat('stress', d.stress);
            if (d.coherence) Game.changeStat('coherence', d.coherence);
            if (d.stanchezza) Game.changeStat('stanchezza', d.stanchezza);
            if (d.morale) Game.changeStat('morale', d.morale);
        });
    },
};
