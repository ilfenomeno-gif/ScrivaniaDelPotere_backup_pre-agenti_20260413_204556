/* ============================================
   WORK TASKS — Lavori Ramificati con Scelte
   e Conseguenze a Catena
   ============================================ */

const WorkTasks = (() => {
    'use strict';

    let _templates = null;  // cache templates da JSON

    /* ── INIT ─────────────────────────────────── */
    function init() {
        if (!Game.state.workTasks) {
            Game.state.workTasks = {
                active: [],        // lavori attivi pendenti
                completed: [],     // archivio (ultimi 20)
                failed: [],        // falliti (ultimi 10)
                blockedTurns: 0,   // turni bloccati da penalità
            };
        }
        _loadTemplates();

        Game.on('time-advance', (d) => {
            _processDeadlines();
            if (d.timeOfDay === 0) _generateDailyTask();
        });

        Game.on('panel-open', (d) => {
            if (d.panel === 'tasks') _injectWorkTasksTab();
        });
    }

    /* ── Carica templates da JSON ─────────────── */
    async function _loadTemplates() {
        if (_templates) return _templates;
        try {
            const res = await fetch('data/work_templates.json');
            _templates = await res.json();
            return _templates;
        } catch (e) {
            console.warn('[WorkTasks] Impossibile caricare work_templates.json:', e);
            _templates = [];
            return _templates;
        }
    }

    /* ── Genera un lavoro giornaliero dal pool ── */
    async function _generateDailyTask() {
        const templates = await _loadTemplates();
        if (!templates.length) return;
        const state = Game.state.workTasks;
        if (state.active.length >= 5) return; // max 5 pendenti

        // Filtra per livello città e affinità partito
        const careerLevel = Game.state.career?.level || 0;
        const cityTier = Game.state.city?.tier || 2;
        const partyId = Game.state.party?.id || null;

        const eligible = templates.filter(t => {
            if (t.cityLevel && t.cityLevel > cityTier + 1) return false;
            if (t.partyAffinities?.length && partyId && !t.partyAffinities.includes(partyId)) return false;
            // Non duplicare task già attivi
            if (state.active.some(a => a.templateId === t.id)) return false;
            return true;
        });

        if (!eligible.length) return;

        const tpl = eligible[Math.floor(Math.random() * eligible.length)];
        const task = _instantiateTask(tpl);
        state.active.push(task);
        _saveState();

        Game.addWorkNotif(`${tpl.icon} Nuovo Lavoro`, `"${tpl.title}" è disponibile nel tuo agenda.`, `Giorno ${Game.state.day}`);
        if (window.SR) SR.announce(`Nuovo lavoro disponibile: ${tpl.title}`, 'polite');
        _injectWorkTasksTab();
    }

    /* ── Istanzia una task da template ──────────  */
    function _instantiateTask(tpl) {
        return {
            id: `wt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            templateId: tpl.id,
            title: tpl.title,
            type: tpl.type,
            difficulty: tpl.difficulty,
            icon: tpl.icon || '📋',
            day: Game.state.day,
            deadline: tpl.deadline ? Game.state.day + 3 : null, // 3 giorni per completare
            cityId: tpl.geolocalizedCity ? Game.state.city?.id : null,
            cityName: tpl.geolocalizedCity ? Game.state.city?.name : null,
            options: tpl.options,
            failPenalty: tpl.failPenalty || {},
            chainEvents: tpl.chainEvents || {},
            assignedMentorId: null,
            status: 'pending', // pending | in_progress | completed | failed
        };
    }

    /* ── Aggiungi un lavoro manualmente ─────────  */
    async function addTask(templateId, overrides) {
        const templates = await _loadTemplates();
        const tpl = templates.find(t => t.id === templateId);
        if (!tpl) return null;
        const task = { ..._instantiateTask(tpl), ...(overrides || {}) };
        Game.state.workTasks.active.push(task);
        _saveState();
        _injectWorkTasksTab();
        return task;
    }

    /* ── Il giocatore esegue un'opzione ─────────  */
    function executeOption(taskId, optionId) {
        const state = Game.state.workTasks;
        const taskIdx = state.active.findIndex(t => t.id === taskId);
        if (taskIdx === -1) return;
        const task = state.active[taskIdx];
        const opt = task.options.find(o => o.id === optionId);
        if (!opt) return;

        // Controlla requisiti
        if (!_checkRequirements(opt.requirements)) {
            _showFeedback('⚠️ Requisiti non soddisfatti per questa opzione.', 'warn');
            return;
        }

        // Calcola esito
        const success = (opt.successChance >= 1.0) || (Math.random() < _adjustedChance(opt.successChance, task));
        const effects = success ? opt.success : opt.failure;

        // Applica effetti
        if (effects) _applyEffects(effects, task);

        // Effetti su lavoro
        task.status = success ? 'completed' : 'failed';
        state.active.splice(taskIdx, 1);
        if (success) {
            state.completed.unshift(task);
            if (state.completed.length > 20) state.completed.pop();
            _handleChainEvent(task, optionId + '_success');
        } else {
            state.failed.unshift(task);
            if (state.failed.length > 10) state.failed.pop();
            _handleChainEvent(task, optionId + '_failure');
        }

        _saveState();

        const resultMsg = success
            ? `✅ "${task.title}" completato con successo!`
            : `❌ "${task.title}" fallito.`;
        Game.addWorkNotif(task.icon + ' Lavoro', resultMsg, `Giorno ${Game.state.day}`);
        if (window.SR) SR.announce(resultMsg, 'assertive');

        // Chiudi modal e aggiorna UI
        _closeWorkModal();
        _injectWorkTasksTab();
    }

    /* ── Delega a un mentore ─────────────────── */
    function delegateToMentor(taskId, mentorId) {
        const state = Game.state.workTasks;
        const task = state.active.find(t => t.id === taskId);
        if (!task) return;
        const mentor = (Game.state.partyMentors || []).find(m => m.id === mentorId)
                    || (Game.state.contacts || []).find(c => c.id === mentorId);
        if (!mentor) return;

        task.assignedMentorId = mentorId;
        task.status = 'in_progress';

        // Il mentore tenta l'opzione più semplice con la sua competenza
        const bestOpt = task.options.reduce((best, o) => o.successChance > (best?.successChance || 0) ? o : best, null);
        if (!bestOpt) return;

        const mentorBonus = (mentor.relation || 50) / 100 * 0.15; // fino a +15% per mentore leale
        const effectiveChance = Math.min(0.95, (bestOpt.successChance || 0.5) + mentorBonus);
        const success = Math.random() < effectiveChance;

        if (success) {
            const eff = { ...(bestOpt.success || {}) };
            // Mentore prende credito: +5 relation
            const mIdx = (Game.state.partyMentors || []).findIndex(m => m.id === mentorId);
            if (mIdx >= 0) Game.state.partyMentors[mIdx].relation = Math.min(100, mentor.relation + 5);

            _applyEffects(eff, task);
            task.status = 'completed';
            state.active.splice(state.active.indexOf(task), 1);
            state.completed.unshift(task);
            Game.addWorkNotif(task.icon + ' Lavoro Delegato', `"${task.title}" completato da ${mentor.shortName || mentor.name}.`, `Giorno ${Game.state.day}`);
        } else {
            // Fallimento: mentore perde loyaltà
            const mIdx = (Game.state.partyMentors || []).findIndex(m => m.id === mentorId);
            if (mIdx >= 0) Game.state.partyMentors[mIdx].loyalty = Math.max(0, (mentor.loyalty || 50) - 10);
            _applyEffects(bestOpt.failure || {}, task);
            task.status = 'failed';
            state.active.splice(state.active.indexOf(task), 1);
            state.failed.unshift(task);
            Game.addWorkNotif(task.icon + ' Delega Fallita', `"${task.title}" fallito da ${mentor.shortName || mentor.name}.`, `Giorno ${Game.state.day}`);
        }

        _saveState();
        _injectWorkTasksTab();
    }

    /* ── Processa scadenze ogni turno ───────────  */
    function _processDeadlines() {
        const state = Game.state.workTasks;
        const today = Game.state.day;

        // Turni bloccati
        if (state.blockedTurns > 0) {
            state.blockedTurns--;
            if (state.blockedTurns === 0) {
                Game.addWorkNotif('✅ Blocco Rimosso', 'Puoi di nuovo eseguire lavori politici.', `Giorno ${today}`);
            }
        }

        // Scadenze
        const expired = state.active.filter(t => t.deadline && t.deadline < today);
        expired.forEach(task => {
            _applyEffects(task.failPenalty || {}, task);
            task.status = 'failed';
            state.failed.unshift(task);
            Game.addWorkNotif(`⏰ Scadenza`, `"${task.title}" è scaduto senza essere completato.`, `Giorno ${today}`);
            if (window.SR) SR.announce(`Lavoro scaduto: ${task.title}`, 'assertive');

            // Game over da mozione
            if (task.failPenalty?.gameOver) {
                Game.triggerGameOver('La mozione di sfiducia è passata. La tua carriera politica è finita.');
            }
        });
        state.active = state.active.filter(t => !expired.includes(t));
        if (expired.length) { _saveState(); _injectWorkTasksTab(); }
    }

    /* ── Gestisce eventi a catena ─────────────── */
    function _handleChainEvent(task, key) {
        const chainId = task.chainEvents?.[key];
        if (!chainId) return;
        // Genera il prossimo lavoro in catena
        setTimeout(() => addTask(chainId), 500);
    }

    /* ── Controlla requisiti opzione ─────────── */
    function _checkRequirements(req) {
        if (!req || Object.keys(req).length === 0) return true;
        if (req.reputazione && Game.state.reputazione < req.reputazione) return false;
        if (req.coherence && Game.state.coherence < req.coherence) return false;
        if (req.cityLevel && (Game.state.city?.tier || 1) < req.cityLevel) return false;
        if (req.partySupport && !Game.state.party?.id) return false;
        if (req.mentorAvailable && !(Game.state.partyMentors || []).some(m => m.active)) return false;
        return true;
    }

    /* ── Modifica la probabilità in base al contesto ── */
    function _adjustedChance(base, task) {
        let chance = base;
        // Bonus corrente
        const currentId = Game.state.party?.currentId;
        if (currentId === 'curr_prog_giovani' && task.type === 'legislation') chance += 0.10;
        if (currentId === 'curr_prog_ambientalisti' && task.type === 'legislation') chance += 0.05;
        // Bonus partito
        const partyId = Game.state.party?.id;
        if (partyId && task.partyAffinities?.includes(partyId)) chance += 0.08;
        // Penalità difficoltà
        chance -= (task.difficulty - 1) * 0.05;
        return Math.max(0.05, Math.min(0.95, chance));
    }

    /* ── Applica effetti ──────────────────────── */
    function _applyEffects(effects, task) {
        if (!effects) return;
        if (effects.reputazione) Game.changeReputazione(effects.reputazione);
        if (effects.reputazioneNazionale) Game.changeReputazione(effects.reputazioneNazionale, 'nazionale');
        if (effects.money) Game.changeMoney(effects.money);
        if (effects.coherence) Game.changeStat('coherence', effects.coherence);
        if (effects.stress) Game.changeStat('stress', effects.stress);
        if (effects.morale) Game.changeStat('morale', effects.morale);
        if (effects.stanchezza) Game.changeStat('stanchezza', effects.stanchezza);
        if (effects.salute) Game.changeStat('salute', effects.salute);
        if (effects.localPoliticalWeight && task.cityId) {
            if (!Game.state.cityWeights) Game.state.cityWeights = {};
            Game.state.cityWeights[task.cityId] = Math.min(100,
                (Game.state.cityWeights[task.cityId] || 0) + effects.localPoliticalWeight);
        }
        if (effects.blockedTurns) {
            Game.state.workTasks.blockedTurns = (Game.state.workTasks.blockedTurns || 0) + effects.blockedTurns;
        }
        if (effects.careerHit) {
            Game.state.career.promotionProgress = Math.max(0,
                (Game.state.career.promotionProgress || 0) - effects.careerHit);
        }
        if (effects.rischioIndagini) {
            Game.state.rischioIndagini = Math.min(100,
                (Game.state.rischioIndagini || 0) + effects.rischioIndagini);
        }
        if (effects.mentorBonus && task.assignedMentorId) {
            const m = (Game.state.partyMentors || []).find(m => m.id === task.assignedMentorId);
            if (m && m.effects) Object.entries(m.effects).forEach(([s, v]) => _applyStat(s, v));
        }
        if (effects.strikeRisk) {
            // Aggiungi evento sciopero al calendario
            if (typeof WorkTasks !== 'undefined') WorkTasks.addTask('wt_sciopero_generale');
        }
        if (effects.mozioneStifucia) {
            if (typeof WorkTasks !== 'undefined') WorkTasks.addTask('wt_mozione_sfiducia');
        }
        if (effects.gameOverRisk && Math.random() < 0.5) {
            Game.triggerGameOver('La mozione di sfiducia è passata. La tua carriera è finita.');
        }
        if (effects.unionRelation) {
            if (!Game.state.unionRelation) Game.state.unionRelation = 50;
            Game.state.unionRelation = Math.max(0, Math.min(100, Game.state.unionRelation + effects.unionRelation));
        }
        if (effects.popularityUnder30) {
            if (!Game.state.social) Game.state.social = {};
            Game.state.social.popularityUnder30 = Math.min(100,
                (Game.state.social.popularityUnder30 || 50) + effects.popularityUnder30);
        }
    }

    function _applyStat(stat, value) {
        if (stat === 'networking') Game.changeAttribute && Game.changeAttribute('networking', value);
        else if (stat === 'coherence') Game.changeStat('coherence', value);
    }

    /* ── Mostra la modal scelte lavoro ──────────  */
    function showTaskModal(taskId) {
        const task = (Game.state.workTasks?.active || []).find(t => t.id === taskId);
        if (!task) return;

        const _triggerEl = document.activeElement;
        const headingId = 'wt-modal-heading-' + Date.now();

        const difficultyStars = '⭐'.repeat(task.difficulty) + '☆'.repeat(5 - task.difficulty);
        const deadlineInfo = task.deadline
            ? `<div class="wt-deadline">⏰ Scade: Giorno ${task.deadline}</div>`
            : '<div class="wt-deadline">📌 Nessuna scadenza</div>';
        const cityInfo = task.cityName
            ? `<div class="wt-city">📍 ${Game.esc(task.cityName)}</div>`
            : '';

        // Mentori disponibili per la delega
        const availableMentors = (Game.state.partyMentors || []).filter(m => m.active);
        const mentorsHtml = availableMentors.length
            ? `<div class="wt-delegate-section">
                <h4 class="wt-section-label">Delega a Mentore</h4>
                <p class="visually-hidden">Puoi delegare questo lavoro a uno dei tuoi mentori di partito.</p>
                ${availableMentors.map(m => `
                    <button class="wt-mentor-btn" data-mentor="${m.id}">
                        ${m.icon || '🤝'} ${Game.esc(m.shortName || m.name)}
                        <span class="wt-mentor-rel">Rel: ${m.relation}%</span>
                    </button>
                `).join('')}
               </div>`
            : '';

        const optionsHtml = task.options.map(opt => {
            const meetsReq = _checkRequirements(opt.requirements);
            const reqText = opt.requirements && Object.keys(opt.requirements).length
                ? `<span class="wt-req ${meetsReq ? 'req-met' : 'req-fail'}">${meetsReq ? '✅' : '🔒'} ${_formatRequirements(opt.requirements)}</span>`
                : '';
            return `
                <div class="wt-option ${meetsReq ? '' : 'wt-option-locked'}">
                    <div class="wt-option-text">${Game.esc(opt.text)}</div>
                    <div class="wt-option-hint">💡 ${Game.esc(opt.hint || '')}</div>
                    ${reqText}
                    ${opt.successChance < 1 ? `<div class="wt-option-chance">Probabilità: ${_chanceLabel(opt.successChance, task)}</div>` : ''}
                    <button class="wt-option-btn" data-opt="${opt.id}" ${meetsReq ? '' : 'disabled'}>
                        Scegli questa opzione
                    </button>
                </div>
            `;
        }).join('');

        let overlay = document.getElementById('work-task-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'work-task-overlay';
            overlay.className = 'work-task-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="work-task-modal" role="dialog" aria-modal="true" aria-labelledby="${headingId}">
                <div class="wt-modal-header">
                    <span class="wt-icon">${task.icon}</span>
                    <h2 id="${headingId}" class="wt-title">${Game.esc(task.title)}</h2>
                    <span class="wt-difficulty" aria-label="Difficoltà ${task.difficulty} su 5">${difficultyStars}</span>
                </div>
                <div class="wt-meta">
                    ${deadlineInfo}${cityInfo}
                    <div class="wt-type">Tipo: ${Game.esc(task.type)}</div>
                </div>
                <h3 class="wt-section-label">Scegli come affrontare questa situazione:</h3>
                <p class="visually-hidden">Usa Tab per navigare tra le opzioni, Invio per selezionare. Alcune opzioni potrebbero essere bloccate per requisiti non soddisfatti.</p>
                <div class="wt-options-list">
                    ${optionsHtml}
                </div>
                ${mentorsHtml}
                <button class="wt-close-btn" aria-label="Chiudi senza scegliere">✕ Chiudi</button>
            </div>
        `;
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';

        const modalEl = overlay.querySelector('[role="dialog"]');
        if (window.SR) SR.openModal(modalEl, task.title, `Lavoro di tipo ${task.type}, difficoltà ${task.difficulty} su 5.`);

        // Bind options
        overlay.querySelectorAll('.wt-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                executeOption(taskId, btn.dataset.opt);
                if (window.SR) SR.closeModal(_triggerEl, 'Scelta lavoro eseguita.');
            });
        });

        // Bind mentors
        overlay.querySelectorAll('.wt-mentor-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                delegateToMentor(taskId, btn.dataset.mentor);
                if (window.SR) SR.closeModal(_triggerEl, 'Lavoro delegato al mentore.');
            });
        });

        overlay.querySelector('.wt-close-btn').addEventListener('click', () => {
            _closeWorkModal();
            if (window.SR) SR.closeModal(_triggerEl, 'Lavoro rimandato.');
        });
    }

    function _closeWorkModal() {
        const overlay = document.getElementById('work-task-overlay');
        if (overlay) { overlay.style.display = 'none'; overlay.classList.add('hidden'); }
    }

    /* ── Inietta tab Lavori nel pannello tasks ── */
    function _injectWorkTasksTab() {
        // Cerca o crea il tab Lavori Ramificati
        const taskTabs = document.querySelector('.task-tabs');
        if (!taskTabs) return;

        let wtTab = taskTabs.querySelector('[data-tab="worktasks"]');
        if (!wtTab) {
            wtTab = document.createElement('button');
            wtTab.className = 'task-tab';
            wtTab.dataset.tab = 'worktasks';
            wtTab.textContent = '🗂️ Agenda';
            taskTabs.appendChild(wtTab);

            const content = document.querySelector('.task-content');
            if (content) {
                const pane = document.createElement('div');
                pane.className = 'task-tab-content';
                pane.id = 'tab-worktasks';
                content.appendChild(pane);

                wtTab.addEventListener('click', () => {
                    document.querySelectorAll('.task-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.task-tab-content').forEach(c => c.classList.remove('active'));
                    wtTab.classList.add('active');
                    pane.classList.add('active');
                    _renderWorkTasksPane(pane);
                    if (window.SR) SR.announce('Tab Agenda attiva. Elenco lavori politici ramificati.', 'polite');
                });
            }
        }

        // Aggiorna badge
        const count = (Game.state.workTasks?.active || []).length;
        wtTab.textContent = count > 0 ? `🗂️ Agenda (${count})` : '🗂️ Agenda';

        // Aggiorna pane se è attivo
        const pane = document.getElementById('tab-worktasks');
        if (pane && pane.classList.contains('active')) _renderWorkTasksPane(pane);
    }

    /* ── Render pane lavori ────────────────────── */
    function _renderWorkTasksPane(container) {
        const state = Game.state.workTasks;
        const active = state?.active || [];
        const today = Game.state.day;

        let html = `<h3 class="visually-hidden">Lavori politici in agenda. ${active.length} disponibili.</h3>`;

        if (!active.length) {
            html += `<div class="wt-empty">📭 Nessun lavoro in agenda. Avanza il turno per ricevere nuovi incarichi.</div>`;
        } else {
            html += `<p class="wt-intro">Scegli come affrontare ogni incarico. Alcune scelte apriranno nuovi scenari.</p>`;
            active.forEach(task => {
                const urgency = task.deadline && (task.deadline - today) <= 1 ? ' wt-urgent' : '';
                const daysLeft = task.deadline ? task.deadline - today : null;
                html += `
                    <div class="wt-task-item${urgency}" data-task="${task.id}">
                        <div class="wt-task-header">
                            <span class="wt-task-icon">${task.icon}</span>
                            <span class="wt-task-title">${Game.esc(task.title)}</span>
                            ${'⭐'.repeat(task.difficulty)}
                        </div>
                        <div class="wt-task-meta">
                            <span class="wt-task-type">${Game.esc(task.type)}</span>
                            ${task.cityName ? `<span class="wt-task-city">📍 ${Game.esc(task.cityName)}</span>` : ''}
                            ${daysLeft !== null ? `<span class="wt-task-deadline ${daysLeft <= 1 ? 'wt-deadline-urgent' : ''}">⏰ ${daysLeft === 0 ? 'OGGI!' : daysLeft + ' giorni'}</span>` : ''}
                        </div>
                        <button class="wt-open-btn" data-task="${task.id}" aria-label="Apri lavoro: ${Game.esc(task.title)}">
                            Affronta →
                        </button>
                    </div>
                `;
            });
        }

        // Blocco turni
        if ((state?.blockedTurns || 0) > 0) {
            html += `<div class="wt-blocked">🚫 Bloccato per ${state.blockedTurns} turni a causa di una penalità.</div>`;
        }

        // Recenti completati
        if (state?.completed?.length) {
            html += `<details class="wt-history"><summary>Lavori completati (${state.completed.length})</summary><ul>`;
            state.completed.slice(0, 5).forEach(t => {
                html += `<li>✅ ${Game.esc(t.title)} — Giorno ${t.day}</li>`;
            });
            html += `</ul></details>`;
        }

        container.innerHTML = html;
        container.setAttribute('role', 'list');
        container.setAttribute('aria-label', 'Lavori politici in agenda');

        container.querySelectorAll('.wt-open-btn').forEach(btn => {
            btn.addEventListener('click', () => showTaskModal(btn.dataset.task));
        });
    }

    /* ── Utility ──────────────────────────────── */
    function _formatRequirements(req) {
        return Object.entries(req).map(([k, v]) => {
            if (k === 'reputazione') return `Rep ≥${v}`;
            if (k === 'coherence') return `Coerenza ≥${v}`;
            if (k === 'cityLevel') return `Livello città ≥${v}`;
            if (k === 'partySupport') return `Serve supporto partito`;
            if (k === 'mentorAvailable') return `Mentore disponibile`;
            return `${k} ≥${v}`;
        }).join(', ');
    }

    function _chanceLabel(base, task) {
        const adj = _adjustedChance(base, task);
        if (adj >= 0.80) return '🟢 Alta';
        if (adj >= 0.55) return '🟡 Media';
        if (adj >= 0.35) return '🟠 Bassa';
        return '🔴 Molto bassa';
    }

    function _adjustedChance(base, task) {
        let chance = base;
        const currentId = Game.state.party?.currentId;
        if (currentId === 'curr_prog_giovani' && task.type === 'legislation') chance += 0.10;
        const partyId = Game.state.party?.id;
        if (partyId && task.partyAffinities?.includes(partyId)) chance += 0.08;
        chance -= (task.difficulty - 1) * 0.05;
        return Math.max(0.05, Math.min(0.95, chance));
    }

    function _saveState() {
        // Salvataggio gestito da Desk.saveGame() tramite Game.state
    }

    function _showFeedback(msg, type) {
        if (typeof HUD !== 'undefined' && HUD.showToast) HUD.showToast(msg);
        if (window.SR) SR.announce(msg, type === 'warn' ? 'assertive' : 'polite');
    }

    /* ── API pubblica ─────────────────────────── */
    return { init, addTask, executeOption, delegateToMentor, showTaskModal };
})();

if (typeof window !== 'undefined') window.WorkTasks = WorkTasks;
