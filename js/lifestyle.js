/* ============================================
   LIFESTYLE — Vita Quotidiana (v1)
   S1: Lavoretti Extra
   S2: Abitudini + Pausa Pranzo
   S4: Oggetti Consumabili
   S5: Migliorie Permanenti
   S6: Micro-Relazioni NPC
   S7: Obiettivi Giornalieri
   ============================================ */

const Lifestyle = {

    HABIT_TRAITS: {
        corsa: { label: 'Resistenza', bonus: { salute: 2, stanchezza: -2 } },
        meditazione: { label: 'Mente lucida', bonus: { stress: -10, coherence: 1 } },
        giornale: { label: 'Analista costante', bonus: { intelligenza: 1, reputazione: 1 } },
        colazione: { label: 'Ritmo sociale', bonus: { morale: 2, reputazione: 1 } },
    },

    // ==========================================
    // S1: LAVORETTI EXTRA
    // ==========================================
    SIDE_JOBS: {
        mercatino: {
            label: '🏪 Mercatino dell\'Usato',
            cooldownDays: 5,
            lastDayKey: 'lastMercatinoDay',
            options: [
                { id: 'libri', label: '📚 Libri universitari', money: 30, attr: 'intelligenza', attrDelta: -1, desc: '+€30, -1 Intelligenza' },
                { id: 'vestiti', label: '👔 Vestiti firmati', money: 80, attr: 'estetica', attrDelta: -3, desc: '+€80, -3 Estetica' },
                { id: 'mobili', label: '🪑 Mobili vecchi', money: 150, stat: 'morale', statDelta: -5, desc: '+€150, -5 Morale' },
                { id: 'francobolli', label: '📮 Collezione francobolli', money: 200, contactGain: true, desc: '+€200, nuovo contatto collezionista' },
            ],
        },
        ripetizioni: {
            label: '📖 Ripetizioni',
            cooldownDays: 7,
            lastDayKey: 'lastRipetizioniDay',
            options: [
                { id: 'matematica', label: '🔢 Matematica a un ragazzino', money: 25, reputazione: 5, desc: '+€25, +5 Reputazione (padre giornalista)' },
                { id: 'italiano', label: '🇮🇹 Italiano a uno straniero', money: 20, attr: 'autenticita', attrDelta: 3, desc: '+€20, +3 Autenticità' },
                { id: 'diritto', label: '⚖️ Diritto a uno studente', money: 40, attr: 'intelligenza', attrDelta: 2, desc: '+€40, +2 Intelligenza' },
            ],
        },
        sondaggio: {
            label: '📋 Sondaggio Online',
            cooldownDays: 2,
            lastDayKey: 'lastSondaggioDay',
            options: [
                { id: 'sond5', label: '⏱️ 5 minuti', money: 3, desc: '+€3, nessun effetto' },
                { id: 'sond15', label: '⏱️ 15 minuti', money: 10, stat: 'stress', statDelta: 2, desc: '+€10, +2 Stress' },
                { id: 'sond30', label: '⏱️ 30 minuti', money: 25, stat: 'stress', statDelta: 5, contactGain: true, desc: '+€25, +5 Stress, nuovo contatto azienda sondaggi' },
            ],
        },
    },

    // ==========================================
    // S2: ABITUDINI QUOTIDIANE
    // ==========================================
    HABITS: [
        { id: 'corsa', icon: '👟', label: 'Corsa Mattutina', bookmark: '#6B8E23', daily: { stanchezza: -5, salute: 1 }, streak7: { muscoli: 5, salute: 10, label: '+5 Muscoli, +10 Salute permanente' } },
        { id: 'meditazione', icon: '🧘‍♀️', label: 'Meditazione Guidata', bookmark: '#9370DB', daily: { stress: -10 }, streak7: { coherence: 15, carisma: 2, label: '+15 Coerenza, +2 Carisma permanente' } },
        { id: 'giornale', icon: '📄', label: 'Rassegna Stampa', bookmark: '#4682B4', daily: { intelligenza: 2 }, streak7: { reputazione: 10, label: '+10 Reputazione (sei informato)' } },
        { id: 'colazione', icon: '☕', label: 'Colazione al Bar', bookmark: '#DAA520', daily: { money: -5, morale: 5 }, streak7: { reputazione: 3, label: '+3 Rep locale ("Onorevole")' } },
    ],

    MOTIVATIONAL_QUOTES: [
        '"La disciplina è il ponte tra obiettivi e risultati." — Jim Rohn',
        '"Il successo è la somma di piccoli sforzi ripetuti giorno dopo giorno." — R. Collier',
        '"Non contare i giorni, fai che i giorni contino." — Muhammad Ali',
        '"La costanza è la virtù per la quale tutte le altre danno frutto." — Arturo Graf',
        '"Chi si alza presto, Dio lo aiuta." — Proverbio italiano',
        '"Il segreto del successo è la costanza nel proposito." — B. Disraeli',
        '"Prima forma le abitudini, poi le abitudini formeranno te." — John Dryden',
    ],

    LUNCH_OPTIONS: [
        { id: 'insalata', icon: '🥗', label: 'Insalatona al parco', cost: 8, effects: { salute: 5, stress: -3 }, desc: '+5 Salute, -3 Stress' },
        { id: 'pizza', icon: '🍕', label: 'Pizza con i colleghi', cost: 12, effects: { morale: 8 }, contactBoost: 2, desc: '+8 Morale, +2 Relazione colleghi' },
        { id: 'panino', icon: '🍞', label: 'Panino alla scrivania', cost: 3, effects: { stress: 5 }, desc: '€3 risparmiati ma +5 Stress' },
        { id: 'ristorante', icon: '🍽️', label: 'Ristorante con qualcuno', cost: 30, contactBoostBig: 15, desc: '+15 Relazione con un contatto a scelta' },
    ],

    // ==========================================
    // S4: OGGETTI CONSUMABILI
    // ==========================================
    CONSUMABLES: {
        bar: {
            label: '☕ Bar / Tabacchi',
            items: [
                { id: 'caffe_doppio', label: '☕ Caffè doppio', cost: 2, effects: { stanchezza: -8, stress: 4 }, duration: 1, desc: '-8 Stanch., +4 Stress' },
                { id: 'brioche', label: '🥐 Brioche', cost: 2, effects: { morale: 5, salute: 3 }, duration: 1, desc: '+5 Morale, +3 Salute' },
                { id: 'sigarette', label: '🚬 Sigarette', cost: 6, effects: { stress: -15, salute: -2 }, duration: 3, recurring: { salute: -1 }, desc: '-15 Stress, -2 Salute (habit.)' },
                { id: 'grattaevinci', label: '🎫 Gratta e Vinci', cost: 5, isGamble: true, desc: '10% €50, 30% €10, 60% nulla' },
                { id: 'giornale_locale', label: '📰 Giornale locale', cost: 2, effects: { reputazione: 5 }, duration: 1, desc: '+5 Rep (sei informato)' },
            ],
        },
        farmacia: {
            label: '💊 Farmacia',
            items: [
                { id: 'integratore', label: '💊 Integratore energetico', cost: 12, effects: { stanchezza: -20 }, duration: 2, desc: '-20 Stanchezza' },
                { id: 'camomilla', label: '🌿 Camomilla rilassante', cost: 5, effects: { stress: -15 }, duration: 1, desc: '-15 Stress' },
                { id: 'crema_viso', label: '💄 Crema viso', cost: 20, effects: { estetica: 10 }, duration: 6, desc: '+10 Estetica (2gg)' },
                { id: 'cerotto', label: '🩹 Cerotto vesciche', cost: 3, effects: { salute: 5 }, duration: 3, desc: '+5 Salute' },
            ],
        },
        libreria: {
            label: '📖 Libreria / Edicola',
            items: [
                { id: 'romanzo', label: '📖 Romanzo politico', cost: 18, effects: { intelligenza: 5, coherence: 10 }, duration: 0, desc: '+5 Int., +10 Coerenza (perm.)' },
                { id: 'audiolibro', label: '🎧 Audiolibro', cost: 10, effects: { intelligenza: 3 }, duration: 3, desc: '+3 Intelligenza (1gg)' },
                { id: 'agenda', label: '📝 Agenda elegante', cost: 25, effects: { carisma: 5 }, duration: 21, desc: '+5 Carisma (7gg)' },
            ],
        },
    },

    // ==========================================
    // S5: MIGLIORIE PERMANENTI (Persona + Casa/Ufficio)
    // ==========================================
    PERMANENT_UPGRADES: [
        // Cura della persona
        { id: 'taglio_capelli', label: '💇 Nuovo taglio di capelli', cost: 40, attr: 'estetica', delta: 5, cat: 'persona' },
        { id: 'abito_misura', label: '👔 Abito su misura', cost: 200, attrs: [{ a: 'carisma', d: 10 }, { a: 'estetica', d: 5 }], cat: 'persona' },
        { id: 'sbiancamento', label: '🦷 Sbiancamento denti', cost: 150, attrs: [{ a: 'estetica', d: 8 }, { a: 'carisma', d: 3 }], cat: 'persona' },
        { id: 'palestra_corso', label: '💪 Corso in palestra (10 lez.)', cost: 300, attrs: [{ a: 'muscoli', d: 8 }, { a: 'salute', d: 5 }], cat: 'persona' },
        { id: 'public_speaking', label: '🗣️ Corso public speaking', cost: 250, attrs: [{ a: 'carisma', d: 10 }, { a: 'autenticita', d: 5 }], cat: 'persona' },
        { id: 'master_online', label: '📚 Master breve online', cost: 500, attrs: [{ a: 'intelligenza', d: 12 }], repBonus: 5, cat: 'persona' },
        // Casa/Ufficio
        { id: 'sedia_ergo', label: '🪑 Sedia ergonomica', cost: 150, dailyBonus: { stanchezza: -5 }, cat: 'ufficio' },
        { id: 'quadro_motiv', label: '🖼️ Quadro motivazionale', cost: 30, dailyBonus: { morale: 2 }, cat: 'ufficio' },
        { id: 'pianta_ufficio', label: '🌿 Pianta da ufficio', cost: 20, dailyBonus: { salute: 1 }, cat: 'ufficio' },
        { id: 'wifi_potenz', label: '📶 Wi-Fi potenziato', cost: 100, attr: 'intelligenza', delta: 5, cat: 'ufficio' },
    ],

    // ==========================================
    // S6: MICRO-RELAZIONI NPC
    // ==========================================
    NPC_INTERACTIONS: {
        barista: {
            name: 'Mario (Barista)',
            icon: '☕',
            actions: [
                { id: 'saluta', label: '👋 Saluta Mario', cost: 0, desc: 'Dopo 5gg → caffè gratis' },
                { id: 'mancia', label: '💰 Lascia €1 di mancia', cost: 1, desc: 'Dopo 10 volte → contatto utile' },
                { id: 'lamentati', label: '😤 Lamentati del caffè', cost: 0, desc: '-5 Relazione barista, mai più offerte' },
            ],
        },
        fioraia: {
            name: 'Rosa (Fioraia)',
            icon: '🌸',
            actions: [
                { id: 'fiori_ufficio', label: '🌺 Fiori per l\'ufficio (€15)', cost: 15, effects: { morale: 5 }, duration: 9, desc: '+5 Morale (3gg)' },
                { id: 'fiori_partner', label: '💐 Fiori per il/la partner (€20)', cost: 20, partnerBoost: 15, desc: '+15 Supporto partner' },
                { id: 'fiori_funerale', label: '⚱️ Fiori per un funerale (€30)', cost: 30, effects: { reputazione: 10 }, desc: '+10 Reputazione' },
            ],
        },
        giornalaio: {
            name: 'Gino (Giornalaio)',
            icon: '📰',
            actions: [
                { id: 'compra_giornale', label: '📰 Compra il giornale (€2)', cost: 2, desc: 'Dopo 7gg → retroscena (+5 Rep)' },
                { id: 'chiedi_quartiere', label: '🗣️ "Come va il quartiere?"', cost: 0, desc: 'Info su eventi futuri' },
            ],
        },
    },

    // ==========================================
    // S7: OBIETTIVI GIORNALIERI
    // ==========================================
    DAILY_OBJECTIVES: [
        { id: 'saluta3', title: 'Saluta almeno 3 persone nuove', reward: { carisma: 5, money: 10 }, trackStat: 'contacts_interacted', target: 3 },
        { id: 'nosocial', title: 'Non guardare i social tutto il giorno', reward: { stress: -15, coherence: 10 }, autoComplete: true },
        { id: 'passi', title: 'Fai 10.000 passi (visita il territorio)', reward: { salute: 5, muscoli: 3 }, trackAction: 'territory_visit', target: 1 },
        { id: 'leggi20', title: 'Leggi 20 pagine di un libro', reward: { intelligenza: 5, stress: -5 }, trackAction: 'read_book', autoComplete: true },
        { id: 'risparmia', title: 'Non spendere più di €20 oggi', reward: { coherence: 15, money: 30 }, trackStat: 'money_spent', maxTarget: 20 },
        { id: 'aiuta', title: 'Aiuta qualcuno per strada', reward: { reputazione: 10, morale: 5 }, autoComplete: true },
        { id: 'chiama_amico', title: 'Chiama un vecchio amico', reward: { contactBoost: 15 }, trackAction: 'phone_call', target: 1 },
    ],

    // ==========================================
    // INIT
    // ==========================================
    init() {
        // Tab switching
        document.querySelectorAll('.lifestyle-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.lifestyle-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.lifestyle-tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`ltab-${tab.dataset.ltab}`).classList.add('active');
                // Re-render the sub-tab content when switching
                if (tab.dataset.ltab === 'npcs') this.renderNPCs();
                if (tab.dataset.ltab === 'lavoretti') this.renderLavoretti();
                if (tab.dataset.ltab === 'negozi') this.renderNegozi();
                if (tab.dataset.ltab === 'migliorie') this.renderMigliorie();
                if (tab.dataset.ltab === 'abitudini') this.renderAbitudini();
                if (tab.dataset.ltab === 'obiettivo') this.renderObiettivo();
            });
        });

        // Refresh when tasks panel opens (lifestyle is now inside tasks)
        Game.on('panel-open', (data) => {
            if (data.panel === 'tasks') this.refresh();
        });

        // Daily reset & triggers
        Game.on('time-advance', (d) => this.onTimeAdvance(d));
        Game.on('mafia-daily', () => this.onNewDay());
    },

    // ==========================================
    // TIME HOOKS
    // ==========================================
    onTimeAdvance(data) {
        // Mattina: propose habit + daily objective
        if (data.timeOfDay === 0) {
            const ls = Game.state.lifestyle;
            ls.habitToday = null;
            ls.lunchToday = false;
            this.generateDailyObjective();

            // Habit streak reset if nothing chosen yesterday
            // (handled by not incrementing)
        }

        // Pomeriggio: lunch prompt if not chosen
        if (data.timeOfDay === 1 && !Game.state.lifestyle.lunchToday) {
            this.promptLunch();
        }

        // Process consumable expirations
        this.processConsumables();

        // Apply daily upgrade bonuses (at morning)
        if (data.timeOfDay === 0) {
            this.applyDailyUpgradeBonuses();
        }
    },

    onNewDay() {
        // Apply habit streak bonuses
        this.processHabitStreak();
        // Check NPC milestones
        this.checkNPCMilestones();
        // Check daily objective completion
        this.checkObjectiveCompletion();
    },

    // ==========================================
    // REFRESH (when panel opens)
    // ==========================================
    refresh() {
        const ls = Game.state.lifestyle;
        if (!ls.habitTraits) ls.habitTraits = {};
        if (!ls.habitMissedDays) ls.habitMissedDays = {};
        if (!ls.lastHabitDay) ls.lastHabitDay = {};
        if (!ls.sideJobMemory) ls.sideJobMemory = { optionCount: {}, specialistUnlocked: {} };
        if (!ls.lunchMemory) ls.lunchMemory = { counts: {}, paninoConsecutive: 0, socialCredits: {} };
        if (!ls.npcRelations) {
            ls.npcRelations = {
                barista: { visits: 0, tipped: 0, complained: false },
                fioraia: { bought: 0 },
                giornalaio: { bought: 0, asked: 0, cashCount: 0 },
            };
        }
        this.renderLavoretti();
        this.renderAbitudini();
        this.renderNegozi();
        this.renderMigliorie();
        this.renderNPCs();
        this.renderObiettivo();
    },

    // ==========================================
    // S1: LAVORETTI RENDERING
    // ==========================================
    renderLavoretti() {
        const container = document.getElementById('ltab-lavoretti');
        if (!container) return;
        const ls = Game.state.lifestyle;
        const day = Game.state.day;
        let html = '<div class="ls-section-title">💼 Lavoretti Extra <span class="ls-sub">(nessun PA richiesto)</span></div>';

        Object.entries(this.SIDE_JOBS).forEach(([key, job]) => {
            const lastDay = ls[job.lastDayKey] || 0;
            const available = (day - lastDay) >= job.cooldownDays;
            const cooldownLeft = available ? 0 : job.cooldownDays - (day - lastDay);

            html += `<div class="ls-job-group">
                <div class="ls-job-header">${job.label} ${!available ? `<span class="ls-cooldown">⏳ ${cooldownLeft}gg</span>` : '<span class="ls-ready">✅ Disponibile</span>'}</div>
                <div class="ls-job-options">`;

            job.options.forEach(opt => {
                html += `<button class="ls-job-btn ${!available ? 'ls-disabled' : ''}" data-job="${key}" data-opt="${opt.id}" ${!available ? 'disabled' : ''}>
                    ${opt.label}<br><span class="ls-desc">${opt.desc}</span>
                </button>`;
            });
            html += '</div></div>';
        });

        container.innerHTML = html;
        container.querySelectorAll('.ls-job-btn:not(.ls-disabled)').forEach(btn => {
            btn.addEventListener('click', () => this.doSideJob(btn.dataset.job, btn.dataset.opt));
        });
    },

    doSideJob(jobKey, optId) {
        const job = this.SIDE_JOBS[jobKey];
        const opt = job.options.find(o => o.id === optId);
        if (!opt) return;
        const ls = Game.state.lifestyle;
        ls[job.lastDayKey] = Game.state.day;

        if (opt.money) Game.changeMoney(opt.money);
        if (opt.attr) Game.changeAttribute(opt.attr, opt.attrDelta);
        if (opt.stat) Game.changeStat(opt.stat, opt.statDelta);
        if (opt.reputazione) Game.changeReputazione(opt.reputazione);
        if (opt.contactGain) {
            const names = ['Carlo Santini', 'Piero Belli', 'Luisa Marchi'];
            const roles = ['Collezionista', 'Analista Sondaggi', 'Ricercatore'];
            const n = Math.floor(Math.random() * names.length);
            Game.state.contacts.push({
                name: names[n], role: roles[n], emoji: '🤝',
                ideology: 'centro', bio: 'Conosciuto grazie a un lavoretto.',
                relation: 35, loyalty: 30, betrayed: false, favorite: false, canAlly: true,
            });
            Game.addWorkNotif('👤 Nuovo Contatto', `Hai conosciuto ${names[n]}!`, `Giorno ${Game.state.day}`);
        }

        const mem = ls.sideJobMemory || (ls.sideJobMemory = { optionCount: {}, specialistUnlocked: {} });
        const key = `${jobKey}:${optId}`;
        mem.optionCount[key] = (mem.optionCount[key] || 0) + 1;

        if (mem.optionCount[key] >= 5 && !mem.specialistUnlocked[key]) {
            mem.specialistUnlocked[key] = true;
            if (jobKey === 'ripetizioni' && optId === 'matematica') {
                Game.changeReputazione(10);
                Game.changeStat('coherence', -5);
                Game.addUrgentMessage('📰 Padre giornalista', 'Articolo favorevole per il tuo impegno nelle ripetizioni. (+10 Rep, -5 Coerenza)', 'ally');
            } else if (jobKey === 'mercatino') {
                Game.changeMoney(120);
                Game.changeReputazione(6);
                (Game.state.contacts || []).forEach(c => {
                    if (/insegn|sindacal/i.test(String(c.role || ''))) c.relation = Math.max(0, c.relation - 3);
                });
                Game.addWorkNotif('🏪 Specializzazione', 'Sei noto nel settore del mercatino: più opportunità, ma attriti con una fazione opposta.', `Giorno ${Game.state.day}`);
            }
        }

        Game.addWorkNotif(`💼 ${job.label}`, `${opt.label}: ${opt.desc}`, `Giorno ${Game.state.day}`);
        this.renderLavoretti();
    },

    // ==========================================
    // S2: ABITUDINI
    // ==========================================
    renderAbitudini() {
        const container = document.getElementById('ltab-abitudini');
        if (!container) return;
        const ls = Game.state.lifestyle;
        const chosen = ls.habitToday;
        const dayOfWeek = Game.getCurrentDate().getDay(); // 0=dom, 6=sab
        const quote = this.MOTIVATIONAL_QUOTES[Game.state.day % this.MOTIVATIONAL_QUOTES.length];

        // ── Agenda Cover ──
        let html = `<div class="agenda-cover">
            <div class="agenda-cover-inner">
                <div class="agenda-title">📒 AGENDA QUOTIDIANA</div>
                <div class="agenda-subtitle">"Disciplina e Costanza"</div>
            </div>
        </div>`;

        // ── Motivational quote ──
        html += `<div class="agenda-quote">${this.escHTML(quote)}</div>`;

        // ── Morning Section Header ──
        html += `<div class="agenda-section-header">🌅 MATTINA <span class="agenda-section-sub">— Scegli una abitudine da coltivare oggi</span></div>`;

        // ── Habit Cards Grid ──
        html += '<div class="agenda-habits-grid">';
        this.HABITS.forEach(h => {
            const streak = ls.habitStreak[h.id] || 0;
            const isChosen = chosen === h.id;
            const locked = chosen && !isChosen;
            const streak7Done = streak >= 7 && !!ls['_streak7_' + h.id];
            const pct = Math.min(streak, 7);

            // Progress dots
            let dots = '';
            for (let i = 0; i < 7; i++) {
                dots += i < pct
                    ? `<span class="agenda-dot filled" style="background:${h.bookmark}">●</span>`
                    : `<span class="agenda-dot empty">○</span>`;
            }

            // Daily effects list
            const dailyLines = Object.entries(h.daily).map(([k, v]) => {
                const icon = this.effectIcon(k);
                const sign = v > 0 ? '+' : '';
                return `<span class="agenda-effect">${icon} ${sign}${v}</span>`;
            }).join(' ');

            // Streak7 bonus list
            let bonusHTML = '';
            if (h.streak7) {
                bonusHTML = `<div class="agenda-bonus-block"><div class="agenda-bonus-title">🏆 Bonus al 7° giorno:</div><div class="agenda-bonus-desc">${h.streak7.label}</div></div>`;
            }

            // Card state classes
            let cardCls = 'agenda-habit-card';
            if (isChosen) cardCls += ' agenda-chosen';
            if (locked) cardCls += ' agenda-locked';
            if (streak7Done) cardCls += ' agenda-completed';

            // Stampino
            let stampHTML = '';
            if (streak7Done) {
                stampHTML = `<div class="agenda-stamp">COMPLETATO</div>`;
            } else if (isChosen) {
                stampHTML = `<div class="agenda-stamp-today">OGGI ✓</div>`;
            }

            html += `<div class="${cardCls}">
                <div class="agenda-bookmark" style="background:${h.bookmark}"></div>
                ${stampHTML}
                <div class="agenda-card-icon">${h.icon}</div>
                <div class="agenda-card-label">${h.label.toUpperCase()}</div>
                <div class="agenda-progress">${dots} <span class="agenda-progress-num">${pct}/7</span></div>
                ${streak7Done ? '<div class="agenda-completed-label">✅ Bonus ottenuto</div>' : ''}
                <div class="agenda-daily"><span class="agenda-daily-title">📈 Oggi:</span> ${dailyLines}</div>
                ${bonusHTML}
                ${!chosen && !streak7Done ? `<button class="agenda-choose-btn" data-hid="${h.id}">✓ SCEGLI PER OGGI</button>` : ''}
                ${locked && !streak7Done ? '<div class="agenda-locked-label">— già scelto —</div>' : ''}
            </div>`;
        });
        html += '</div>';

        // ── Pausa Pranzo Section ──
        html += `<div class="agenda-divider"></div>`;
        html += `<div class="agenda-section-header">🍽️ PAUSA PRANZO <span class="agenda-section-sub">— scegli il tuo pasto</span></div>`;
        const lunchDone = ls.lunchToday;
        html += '<div class="agenda-lunch-grid">';
        this.LUNCH_OPTIONS.forEach(l => {
            html += `<button class="agenda-lunch-card ${lunchDone ? 'agenda-locked' : ''}" data-lid="${l.id}" ${lunchDone ? 'disabled' : ''}>
                <div class="agenda-lunch-icon">${l.icon}</div>
                <div class="agenda-lunch-label">${l.label.toUpperCase()}</div>
                <div class="agenda-lunch-cost">€${l.cost}</div>
                <div class="agenda-lunch-desc">${l.desc}</div>
            </button>`;
        });
        html += '</div>';

        // ── Weekly Calendar ──
        html += `<div class="agenda-divider"></div>`;
        html += `<div class="agenda-section-header">📊 PROGRESSI SETTIMANALI</div>`;
        html += this.renderWeeklyCalendar();

        container.innerHTML = html;

        // Event listeners
        container.querySelectorAll('.agenda-choose-btn').forEach(btn => {
            btn.addEventListener('click', () => this.chooseHabit(btn.dataset.hid));
        });
        container.querySelectorAll('.agenda-lunch-card:not(.agenda-locked)').forEach(btn => {
            btn.addEventListener('click', () => this.chooseLunch(btn.dataset.lid));
        });
    },

    /** Weekly mini-calendar with dots per habit */
    renderWeeklyCalendar() {
        const ls = Game.state.lifestyle;
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
        const today = Game.getCurrentDate().getDay();
        // Build header
        let html = '<div class="agenda-weekly">';
        html += '<div class="agenda-weekly-row agenda-weekly-header"><div class="agenda-weekly-label"></div>';
        for (let i = 1; i <= 7; i++) {
            const d = i % 7; // Lun=1 ... Dom=0
            html += `<div class="agenda-weekly-day${d === today ? ' agenda-today' : ''}">${dayNames[d]}</div>`;
        }
        html += '</div>';

        // One row per habit
        this.HABITS.forEach(h => {
            const streak = ls.habitStreak[h.id] || 0;
            const done = streak >= 7 && !!ls['_streak7_' + h.id];
            html += `<div class="agenda-weekly-row"><div class="agenda-weekly-label">${h.icon}</div>`;
            for (let i = 0; i < 7; i++) {
                const filled = i < streak;
                html += `<div class="agenda-weekly-cell"><span class="agenda-dot ${filled ? 'filled' : 'empty'}" ${filled ? `style="background:${h.bookmark}"` : ''}>●</span></div>`;
            }
            html += `<div class="agenda-weekly-status">${done ? '✅' : `${streak}/7`}</div></div>`;
        });
        html += '</div>';
        return html;
    },

    /** Map effect key to emoji */
    effectIcon(key) {
        const map = { stanchezza: '😴', stress: '😰', morale: '😊', salute: '❤️', money: '💶',
            intelligenza: '🧠', estetica: '🪞', autenticita: '🗣️', muscoli: '💪', carisma: '✨', coherence: '🧩', reputazione: '⭐' };
        return map[key] || key;
    },

    escHTML(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },

    chooseHabit(habitId) {
        const ls = Game.state.lifestyle;
        const habit = this.HABITS.find(h => h.id === habitId);
        if (!habit || ls.habitToday) return;

        ls.habitToday = habitId;

        // Apply daily effects
        Object.entries(habit.daily).forEach(([key, val]) => {
            if (key === 'money') Game.changeMoney(val);
            else if (key === 'intelligenza' || key === 'estetica' || key === 'autenticita' || key === 'muscoli' || key === 'carisma') Game.changeAttribute(key, val);
            else if (key === 'salute') Game.changeStat('salute', val);
            else Game.changeStat(key, val);
        });

        // Habit traits: unlocked after 7 days and decays when neglected.
        const trait = this.HABIT_TRAITS[habitId];
        const traitState = ls.habitTraits[habitId];
        if (trait && traitState && traitState.unlocked) {
            const missed = ls.habitMissedDays[habitId] || 0;
            const efficiency = Math.max(0.4, 1 - (Math.max(0, missed - 3) * 0.1));
            Object.entries(trait.bonus).forEach(([key, raw]) => {
                const val = raw > 0 ? Math.floor(raw * efficiency) : Math.ceil(raw * efficiency);
                if (val === 0) return;
                if (key === 'money') Game.changeMoney(val);
                else if (key === 'intelligenza' || key === 'estetica' || key === 'autenticita' || key === 'muscoli' || key === 'carisma') Game.changeAttribute(key, val);
                else if (key === 'reputazione') Game.changeReputazione(val);
                else if (key === 'salute') Game.changeStat('salute', val);
                else Game.changeStat(key, val);
            });
            if (efficiency < 1) {
                Game.addWorkNotif('📉 Routine trascurata', `${habit.label}: efficacia ridotta al ${Math.round(efficiency * 100)}%.`, `Giorno ${Game.state.day}`);
            }
        }

        // Increment streak
        if (!ls.habitStreak[habitId]) ls.habitStreak[habitId] = 0;
        ls.habitStreak[habitId]++;
        ls.habitMissedDays[habitId] = 0;
        ls.lastHabitDay[habitId] = Game.state.day;

        // Brief stamp flash before re-render
        const btn = document.querySelector(`.agenda-choose-btn[data-hid="${habitId}"]`);
        if (btn) {
            const card = btn.closest('.agenda-habit-card');
            if (card) {
                card.classList.add('agenda-stamp-flash');
                Scheduler.timeout(() => {
                    Game.addWorkNotif(`${habit.icon} ${habit.label}`, `Abitudine completata! Streak: ${ls.habitStreak[habitId]}/7`, `Giorno ${Game.state.day}`);
                    this.renderAbitudini();
                }, 400, { group: 'lifestyle', label: 'habit-flash' });
                return;
            }
        }

        Game.addWorkNotif(`${habit.icon} ${habit.label}`, `Abitudine completata! Streak: ${ls.habitStreak[habitId]}/7`, `Giorno ${Game.state.day}`);
        this.renderAbitudini();
    },

    chooseLunch(lunchId) {
        const ls = Game.state.lifestyle;
        const lunch = this.LUNCH_OPTIONS.find(l => l.id === lunchId);
        if (!lunch || ls.lunchToday) return;
        if (Game.state.money < lunch.cost) {
            HUD.showToast('💶 Fondi insufficienti!');
            return;
        }

        ls.lunchToday = true;
        Game.changeMoney(-lunch.cost);

        const lmem = ls.lunchMemory || (ls.lunchMemory = { counts: {}, paninoConsecutive: 0, socialCredits: {} });
        lmem.counts[lunchId] = (lmem.counts[lunchId] || 0) + 1;
        if (lunchId === 'panino') lmem.paninoConsecutive += 1;
        else lmem.paninoConsecutive = 0;

        if (lunch.effects) {
            Object.entries(lunch.effects).forEach(([key, val]) => {
                Game.changeStat(key, val);
            });
        }
        if (lunch.contactBoost) {
            Game.state.contacts.forEach(c => {
                if (Math.random() < 0.3) c.relation = Math.min(100, c.relation + lunch.contactBoost);
            });
        }
        if (lunch.contactBoostBig) {
            const fav = Game.state.contacts.find(c => c.favorite) || Game.state.contacts[0];
            if (fav) {
                fav.relation = Math.min(100, fav.relation + lunch.contactBoostBig);
                const sc = lmem.socialCredits;
                sc[fav.name] = (sc[fav.name] || 0) + 1;
                if (sc[fav.name] >= 3 && !fav._specialFavorUnlocked) {
                    fav._specialFavorUnlocked = true;
                    Game.addUrgentMessage(fav.name, `${fav.name} ti deve un favore speciale dopo le vostre cene.`, 'ally');
                }
            }
        }

        if (lunchId === 'pizza' && lmem.counts.pizza >= 5 && !lmem._pizzaColleghiEvent) {
            lmem._pizzaColleghiEvent = true;
            Game.addWorkNotif('🍕 Colleghi', 'Dopo tante pizze insieme, i colleghi ti invitano a un evento extra.', `Giorno ${Game.state.day}`);
            Game.changeReputazione(6);
        }
        if (lmem.paninoConsecutive >= 10 && !lmem._paninoIsolation) {
            lmem._paninoIsolation = true;
            (Game.state.contacts || []).forEach(c => {
                if (/colleg|ufficio|capo/i.test(String(c.role || ''))) c.relation = Math.max(0, c.relation - 5);
            });
            Game.addUrgentMessage('👔 Capo Ufficio', 'Ti fai vedere sempre da solo: i colleghi ti percepiscono distante.', 'enemy');
        }

        // Better lunch can occasionally restore one AP immediately.
        if ((lunchId === 'insalata' || lunchId === 'ristorante') && Game.state.actionPoints < 2 && !ls._lunchAPRecoveredToday) {
            ls._lunchAPRecoveredToday = true;
            Game.state.actionPoints += 1;
            Game.emit('ap-change', { ap: Game.state.actionPoints });
            Game.addWorkNotif('⚡ Energia', 'Pranzo di qualità: recuperi 1 PA.', `Giorno ${Game.state.day}`);
        }

        Game.addWorkNotif(`${lunch.icon} Pranzo`, `${lunch.label} — ${lunch.desc}`, `Giorno ${Game.state.day}`);
        this.renderAbitudini();
    },

    promptLunch() {
        // Just show a push notification — player can open panel
        Phone.showPushNotif('🍽️ Pausa Pranzo', 'È ora di pranzo! Apri Vita Quotidiana per scegliere.');
    },

    processHabitStreak() {
        const ls = Game.state.lifestyle;
        if (!ls.habitTraits) ls.habitTraits = {};
        if (!ls.habitMissedDays) ls.habitMissedDays = {};
        // If habit was NOT chosen yesterday, reset all streaks to 0
        if (!ls.habitToday) {
            Object.keys(ls.habitStreak).forEach(k => {
                if (ls.habitStreak[k] < 7) ls.habitStreak[k] = 0;
            });
            Object.keys(ls.habitTraits).forEach(k => {
                if (ls.habitTraits[k] && ls.habitTraits[k].unlocked) {
                    ls.habitMissedDays[k] = (ls.habitMissedDays[k] || 0) + 1;
                }
            });
            return;
        }

        // Check for 7-day completion
        const hid = ls.habitToday;
        if (ls.habitStreak[hid] >= 7) {
            const habit = this.HABITS.find(h => h.id === hid);
            if (habit && habit.streak7 && !ls['_streak7_' + hid]) {
                ls['_streak7_' + hid] = true;
                ls.habitTraits[hid] = { unlocked: true, unlockedDay: Game.state.day };
                Game.addUrgentMessage('🏆 Tratto Sbloccato!', `${habit.label}: sblocchi il tratto ${this.HABIT_TRAITS[hid]?.label || 'speciale'}.`, 'ally');
            }
        }

        Object.keys(ls.habitTraits).forEach(k => {
            if (!ls.habitTraits[k] || !ls.habitTraits[k].unlocked) return;
            if (k === hid) ls.habitMissedDays[k] = 0;
            else ls.habitMissedDays[k] = (ls.habitMissedDays[k] || 0) + 1;
        });

        ls._lunchAPRecoveredToday = false;

        // Reset non-chosen streaks (only count consecutive same habit)
        Object.keys(ls.habitStreak).forEach(k => {
            if (k !== hid && ls.habitStreak[k] < 7) ls.habitStreak[k] = 0;
        });
    },

    // ==========================================
    // S4: NEGOZI (CONSUMABILI)
    // ==========================================
    renderNegozi() {
        const container = document.getElementById('ltab-negozi');
        if (!container) return;
        const ls = Game.state.lifestyle;
        let html = '<div class="ls-section-title">🛍️ Negozi <span class="ls-sub">(acquista oggetti consumabili)</span></div>';

        Object.entries(this.CONSUMABLES).forEach(([catKey, cat]) => {
            html += `<div class="ls-shop-group"><div class="ls-shop-header">${cat.label}</div><div class="ls-shop-items">`;
            cat.items.forEach(item => {
                const owned = ls.consumables.some(c => c.id === item.id);
                const canAfford = Game.state.money >= item.cost;
                html += `<button class="ls-shop-btn ${owned ? 'ls-owned' : ''} ${!canAfford && !owned ? 'ls-no-money' : ''}" 
                    data-cat="${catKey}" data-iid="${item.id}" ${owned || !canAfford ? 'disabled' : ''}>
                    <span class="ls-shop-name">${item.label}</span>
                    <span class="ls-shop-cost">${owned ? '✅ Attivo' : `€${item.cost}`}</span>
                    <span class="ls-shop-desc">${item.desc}</span>
                </button>`;
            });
            html += '</div></div>';
        });

        // Active consumables
        if (ls.consumables.length > 0) {
            html += '<div class="ls-active-items"><div class="ls-section-title ls-mt">🧪 Effetti Attivi</div>';
            ls.consumables.forEach(c => {
                const timeLeft = c.expiresTime - Game.state.day;
                html += `<div class="ls-active-item">${c.label} — ${timeLeft > 0 ? `${timeLeft}gg rimasti` : 'permanente'}</div>`;
            });
            html += '</div>';
        }

        container.innerHTML = html;
        container.querySelectorAll('.ls-shop-btn:not(.ls-owned):not(.ls-no-money)').forEach(btn => {
            btn.addEventListener('click', () => this.buyConsumable(btn.dataset.cat, btn.dataset.iid));
        });
    },

    buyConsumable(catKey, itemId) {
        const cat = this.CONSUMABLES[catKey];
        const item = cat.items.find(i => i.id === itemId);
        if (!item || Game.state.money < item.cost) return;
        const ls = Game.state.lifestyle;

        Game.changeMoney(-item.cost);

        // Gratta e Vinci — instant gamble
        if (item.isGamble) {
            const roll = Math.random();
            let win = 0, msg = '';
            if (roll < 0.10) { win = 50; msg = '🎉 HAI VINTO €50!'; }
            else if (roll < 0.40) { win = 10; msg = '😊 Hai vinto €10!'; }
            else { win = 0; msg = '😞 Niente. Meglio la prossima volta.'; }
            if (win > 0) Game.changeMoney(win);
            Game.addWorkNotif('🎫 Gratta e Vinci', msg, `Giorno ${Game.state.day}`);
            this.renderNegozi();
            return;
        }

        // Apply immediate effects
        if (item.effects) {
            const effects = { ...item.effects };

            if (item.id === 'caffe_doppio') {
                const coffee = Game.state.coffee || (Game.state.coffee = { uses: 0, maxPerDay: 3, drankToday: 0 });
                if (typeof coffee.drankToday !== 'number') coffee.drankToday = 0;
                const effectiveness = coffee.drankToday >= 2 ? 0.5 : 1.0;
                if (effects.stanchezza) effects.stanchezza = Math.round(effects.stanchezza * effectiveness);
                if (effects.stress) effects.stress = Math.round(effects.stress * effectiveness);
                coffee.drankToday += 1;
            }

            Object.entries(effects).forEach(([key, val]) => {
                if (key === 'reputazione') Game.changeReputazione(val);
                else if (key === 'coherence') Game.changeStat('coherence', val);
                else if (key === 'intelligenza' || key === 'estetica' || key === 'carisma' || key === 'muscoli' || key === 'autenticita') Game.changeAttribute(key, val);
                else Game.changeStat(key, val);
            });
        }

        // Duration tracking (0 = permanent, no tracking needed)
        if (item.duration > 0) {
            ls.consumables.push({
                id: item.id,
                label: item.label,
                expiresTime: Game.state.day + Math.ceil(item.duration / 3),
                recurring: item.recurring || null,
            });
        }

        Game.addWorkNotif(`🛍️ Acquisto`, `${item.label} — ${item.desc}`, `Giorno ${Game.state.day}`);
        this.renderNegozi();
    },

    processConsumables() {
        const ls = Game.state.lifestyle;
        const day = Game.state.day;

        // Remove expired
        ls.consumables = ls.consumables.filter(c => {
            if (day >= c.expiresTime) {
                Game.addWorkNotif('⏰ Scaduto', `${c.label} ha esaurito il suo effetto.`, `Giorno ${day}`);
                return false;
            }
            // Apply recurring effects
            if (c.recurring && Game.state.calendar.timeOfDay === 0) {
                Object.entries(c.recurring).forEach(([k, v]) => Game.changeStat(k, v));
            }
            return true;
        });
    },

    // ==========================================
    // S5: MIGLIORIE PERMANENTI
    // ==========================================
    renderMigliorie() {
        const container = document.getElementById('ltab-migliorie');
        if (!container) return;
        const ls = Game.state.lifestyle;
        let html = '<div class="ls-section-title">⬆️ Migliorie Permanenti</div>';

        const cats = { persona: '💇 Cura della Persona', ufficio: '🪑 Casa / Ufficio' };
        Object.entries(cats).forEach(([catKey, catLabel]) => {
            html += `<div class="ls-upgrade-cat"><div class="ls-shop-header">${catLabel}</div><div class="ls-upgrades-grid">`;
            this.PERMANENT_UPGRADES.filter(u => u.cat === catKey).forEach(upg => {
                const owned = ls.upgrades.includes(upg.id);
                const canAfford = Game.state.money >= upg.cost;
                const desc = this.getUpgradeDesc(upg);
                html += `<div class="ls-upgrade-card ${owned ? 'ls-owned' : ''} ${!canAfford && !owned ? 'ls-no-money' : ''}">
                    <div class="ls-upgrade-name">${upg.label}</div>
                    <div class="ls-upgrade-desc">${desc}</div>
                    <div class="ls-upgrade-cost">${owned ? '✅ Acquistato' : `€${upg.cost}`}</div>
                    ${!owned ? `<button class="ls-upgrade-btn" data-uid="${upg.id}" ${!canAfford ? 'disabled' : ''}>
                        ${canAfford ? 'Acquista' : '🔒 Fondi'}
                    </button>` : ''}
                </div>`;
            });
            html += '</div></div>';
        });

        container.innerHTML = html;
        container.querySelectorAll('.ls-upgrade-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => this.buyUpgrade(btn.dataset.uid));
        });
    },

    getUpgradeDesc(upg) {
        let parts = [];
        if (upg.attr) parts.push(`+${upg.delta} ${upg.attr}`);
        if (upg.attrs) upg.attrs.forEach(a => parts.push(`+${a.d} ${a.a}`));
        if (upg.repBonus) parts.push(`+${upg.repBonus} Reputazione`);
        if (upg.dailyBonus) Object.entries(upg.dailyBonus).forEach(([k, v]) => parts.push(`${v > 0 ? '+' : ''}${v} ${k}/giorno`));
        return parts.join(', ');
    },

    buyUpgrade(uid) {
        const upg = this.PERMANENT_UPGRADES.find(u => u.id === uid);
        if (!upg) return;
        const ls = Game.state.lifestyle;
        if (ls.upgrades.includes(uid) || Game.state.money < upg.cost) return;

        Game.changeMoney(-upg.cost);
        ls.upgrades.push(uid);

        // Apply permanent bonuses
        if (upg.attr) Game.changeAttribute(upg.attr, upg.delta);
        if (upg.attrs) upg.attrs.forEach(a => {
            if (a.a === 'salute') Game.changeStat('salute', a.d);
            else Game.changeAttribute(a.a, a.d);
        });
        if (upg.repBonus) Game.changeReputazione(upg.repBonus);

        Game.addWorkNotif('⬆️ Miglioria', `${upg.label} acquistata!`, `Giorno ${Game.state.day}`);
        this.renderMigliorie();
    },

    applyDailyUpgradeBonuses() {
        const ls = Game.state.lifestyle;
        ls.upgrades.forEach(uid => {
            const upg = this.PERMANENT_UPGRADES.find(u => u.id === uid);
            if (upg && upg.dailyBonus) {
                Object.entries(upg.dailyBonus).forEach(([key, val]) => {
                    Game.changeStat(key, val);
                });
            }
        });
    },

    // ==========================================
    // S6: MICRO-RELAZIONI NPC
    // ==========================================
    renderNPCs() {
        const container = document.getElementById('ltab-npcs');
        if (!container) return;
        const npc = Game.state.lifestyle.npcRelations;
        let html = '<div class="ls-section-title">👥 Persone del Quartiere</div>';

        Object.entries(this.NPC_INTERACTIONS).forEach(([npcKey, npcData]) => {
            const rel = npc[npcKey] || {};
            html += `<div class="ls-npc-card">
                <div class="ls-npc-header">${npcData.icon} ${npcData.name}</div>
                <div class="ls-npc-actions">`;
            npcData.actions.forEach(action => {
                const canAfford = Game.state.money >= action.cost;
                const hasAP = Game.hasActionPoints(1);
                const disabled = (!canAfford && action.cost > 0) || !hasAP;
                html += `<button class="ls-npc-btn ${disabled ? 'ls-no-money' : ''}" 
                    data-npc="${npcKey}" data-aid="${action.id}" ${disabled ? 'disabled' : ''}>
                    ${action.label} ${action.cost > 0 ? `<span class="ls-cost">€${action.cost}</span>` : ''} <span class="ls-ap-cost">1⚡</span><br><span class="ls-desc">${action.desc}</span>
                </button>`;
            });
            html += '</div></div>';
        });

        container.innerHTML = html;
        container.querySelectorAll('.ls-npc-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => this.interactNPC(btn.dataset.npc, btn.dataset.aid));
        });
    },

    interactNPC(npcKey, actionId) {
        if (!Game.hasActionPoints(1)) {
            if (typeof HUD !== 'undefined') HUD.showToast('⚡ Non hai Punti Azione!');
            return;
        }
        const npc = Game.state.lifestyle.npcRelations;
        const rel = npc[npcKey];
        if (!rel) return;
        const npcData = this.NPC_INTERACTIONS[npcKey];
        const action = npcData.actions.find(a => a.id === actionId);
        if (!action) return;

        if (action.cost > 0) {
            if (Game.state.money < action.cost) {
                if (typeof HUD !== 'undefined') HUD.showToast('💸 Non hai abbastanza soldi!');
                return;
            }
            Game.changeMoney(-action.cost);
        }

        Game.spendActionPoint(1);

        // Apply immediate effects
        if (action.effects) {
            Object.entries(action.effects).forEach(([key, val]) => {
                if (key === 'reputazione') Game.changeReputazione(val);
                else if (key === 'morale' || key === 'stress' || key === 'salute' || key === 'stanchezza') Game.changeStat(key, val);
            });
        }

        // Partner boost
        if (action.partnerBoost && Game.state.partner) {
            Game.state.partner.support = Math.min(100, Game.state.partner.support + action.partnerBoost);
            Game.state.partner.tension = Math.max(0, Game.state.partner.tension - 10);
        }

        // NPC-specific tracking
        switch (npcKey) {
            case 'barista':
                if (actionId === 'saluta') rel.visits++;
                if (actionId === 'mancia') rel.tipped++;
                if (actionId === 'lamentati') {
                    rel.complained = true;
                    Game.addWorkNotif('😤 Mario', 'Il barista non ti offrirà più nulla.', `Giorno ${Game.state.day}`);
                }
                break;
            case 'fioraia':
                rel.bought++;
                break;
            case 'giornalaio':
                if (actionId === 'compra_giornale') {
                    rel.bought++;
                    rel.cashCount++;
                }
                if (actionId === 'chiedi_quartiere') {
                    rel.asked++;
                    // Random hint about near-future events
                    const hints = [
                        'Pare che al municipio ci sia aria di cambiamento...',
                        'Il costruttore della via nuova ha problemi col comune.',
                        'Dicono che arriva un\'ispezione la settimana prossima.',
                        'Il bar di fronte sta per chiudere. Occasione?',
                        'Ho sentito che cercano un nuovo assessore in zona.',
                    ];
                    Game.addWorkNotif('📰 Gino', hints[Math.floor(Math.random() * hints.length)], `Giorno ${Game.state.day}`);
                }
                break;
        }

        // Progress feedback in Persone tab
        if (typeof HUD !== 'undefined') {
            if (npcKey === 'barista' && actionId === 'saluta') {
                HUD.showToast(`☕ Mario: saluti ${rel.visits}/5`);
            } else if (npcKey === 'barista' && actionId === 'mancia') {
                HUD.showToast(`☕ Mario: mance ${rel.tipped}/10`);
            } else if (npcKey === 'giornalaio' && actionId === 'compra_giornale') {
                HUD.showToast(`📰 Gino: giornali ${rel.bought}/7`);
            } else if (npcKey === 'fioraia') {
                HUD.showToast(`🌸 Rosa: acquisti ${rel.bought}`);
            }
        }

        // Immediate milestone check for instant feedback in the Persone tab
        this.checkNPCMilestones();

        // Lifestyle social actions feed territory chain progression in Tasks
        if (typeof Tasks !== 'undefined' && Tasks.registerExternalChainProgress) {
            Tasks.registerExternalChainProgress('territory');
        }

        Game.addWorkNotif(`${npcData.icon} ${npcData.name}`, action.label, `Giorno ${Game.state.day}`);
        if (typeof HUD !== 'undefined') HUD.showToast(`${npcData.icon} ${action.label}`);
        this.renderNPCs();
    },

    checkNPCMilestones() {
        const npc = Game.state.lifestyle.npcRelations;

        // Barista: 5 visite → caffè gratis
        if (npc.barista.visits >= 5 && !npc.barista._cafe5 && !npc.barista.complained) {
            npc.barista._cafe5 = true;
            Game.addUrgentMessage('☕ Mario', '"Onorevole! Oggi offro io!" — Caffè gratis.', 'ally');
            Game.changeStat('morale', 5);
        }
        // Barista: 10 mance → contatto utile
        if (npc.barista.tipped >= 10 && !npc.barista._tip10) {
            npc.barista._tip10 = true;
            Game.state.contacts.push({
                name: 'Enzo (via Mario)', role: 'Artigiano', emoji: '🔨',
                ideology: 'centro', bio: 'Presentato dal barista. Affidabile.',
                relation: 40, loyalty: 40, betrayed: false, favorite: false, canAlly: true,
            });
            Game.addUrgentMessage('☕ Mario', '"Ti presento Enzo, un mio amico. Forse vi può tornare utile."', 'ally');
        }
        // Giornalaio: 7 acquisti → retroscena
        if (npc.giornalaio.bought >= 7 && !npc.giornalaio._ret7) {
            npc.giornalaio._ret7 = true;
            Game.changeReputazione(5);
            Game.addUrgentMessage('📰 Gino', '"Siccome sei un buon cliente, ti dico una cosa... ieri al comune ho visto il sindaco litigare col vicesindaco." +5 Rep', 'ally');
        }
        // Giornalaio: 15 cash → caffè
        if (npc.giornalaio.cashCount >= 15 && !npc.giornalaio._cash15) {
            npc.giornalaio._cash15 = true;
            Game.changeStat('morale', 2);
            Game.addWorkNotif('📰 Gino', '"Tieni, prenditi un caffè da parte mia!" +2 Morale', `Giorno ${Game.state.day}`);
        }
    },

    // ==========================================
    // S7: OBIETTIVI GIORNALIERI
    // ==========================================
    generateDailyObjective() {
        const ls = Game.state.lifestyle;
        if (!ls._seenObjectives || typeof ls._seenObjectives !== 'object') {
            ls._seenObjectives = {};
        }

        let pool = this.DAILY_OBJECTIVES.filter(o => !ls._seenObjectives[o.id]);
        if (pool.length === 0) {
            ls._seenObjectives = {};
            pool = this.DAILY_OBJECTIVES.slice();
        }

        const obj = pool[Math.floor(Math.random() * pool.length)];
        ls.dailyObjective = { ...obj, progress: 0, completed: false };
        ls._seenObjectives[obj.id] = true;
        Phone.showPushNotif('🎯 Sfida del Giorno', obj.title);
    },

    checkObjectiveCompletion() {
        const ls = Game.state.lifestyle;
        const obj = ls.dailyObjective;
        if (!obj || obj.completed) return;

        // Auto-complete objectives are completed by default if not violated
        if (obj.autoComplete) {
            obj.completed = true;
            this.rewardObjective(obj);
        }
        // Track-based objectives check progress
        if (obj.target && obj.progress >= obj.target) {
            obj.completed = true;
            this.rewardObjective(obj);
        }
    },

    rewardObjective(obj) {
        const r = obj.reward;
        if (r.carisma) Game.changeAttribute('carisma', r.carisma);
        if (r.intelligenza) Game.changeAttribute('intelligenza', r.intelligenza);
        if (r.muscoli) Game.changeAttribute('muscoli', r.muscoli);
        if (r.salute) Game.changeStat('salute', r.salute);
        if (r.morale) Game.changeStat('morale', r.morale);
        if (r.stress) Game.changeStat('stress', r.stress);
        if (r.money) Game.changeMoney(r.money);
        if (r.reputazione) Game.changeReputazione(r.reputazione);
        if (r.coherence) Game.changeStat('coherence', r.coherence);
        if (r.contactBoost) {
            const c = Game.state.contacts[Math.floor(Math.random() * Game.state.contacts.length)];
            if (c) c.relation = Math.min(100, c.relation + r.contactBoost);
        }
        Game.addUrgentMessage('🎯 Sfida Completata!', `${obj.title} — Ricompensa ottenuta!`, 'ally');
    },

    renderObiettivo() {
        const container = document.getElementById('ltab-obiettivo');
        if (!container) return;
        const obj = Game.state.lifestyle.dailyObjective;

        let html = '<div class="ls-section-title">🎯 Sfida del Giorno</div>';
        if (!obj) {
            html += '<div class="ls-empty">Nessuna sfida oggi. Torna domani mattina!</div>';
        } else {
            html += `<div class="ls-objective-card ${obj.completed ? 'ls-obj-done' : ''}">
                <div class="ls-obj-title">${obj.title}</div>
                <div class="ls-obj-status">${obj.completed ? '🏆 COMPLETATA!' : '⏳ In corso...'}</div>
                <div class="ls-obj-reward">Ricompensa: ${this.formatReward(obj.reward)}</div>
            </div>`;
        }
        container.innerHTML = html;
    },

    formatReward(r) {
        let parts = [];
        if (r.carisma) parts.push(`+${r.carisma} Carisma`);
        if (r.intelligenza) parts.push(`+${r.intelligenza} Intelligenza`);
        if (r.muscoli) parts.push(`+${r.muscoli} Muscoli`);
        if (r.salute) parts.push(`+${r.salute} Salute`);
        if (r.morale) parts.push(`+${r.morale} Morale`);
        if (r.stress) parts.push(`${r.stress} Stress`);
        if (r.money) parts.push(`€${r.money}`);
        if (r.reputazione) parts.push(`+${r.reputazione} Rep.`);
        if (r.coherence) parts.push(`+${r.coherence} Coerenza`);
        if (r.contactBoost) parts.push(`+${r.contactBoost} Relazione`);
        return parts.join(', ');
    },
};
