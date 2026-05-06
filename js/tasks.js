/* ============================================
   TASKS — Task List with Action Points (v2)
   ============================================ */

const Tasks = {
    CHAIN_TARGET: 3,
    TASK_LOCALIZATION_KEYS: {
        'Revisione Budget': 'task.revisione_budget',
        'Report Trimestrale': 'task.report_trimestrale',
        'Riunione Operativa': 'task.riunione_operativa',
        'Discorso Pubblico': 'task.discorso_pubblico',
        'Volantinaggio': 'task.volantinaggio',
        'Raccolta Firme': 'task.raccolta_firme',
        'Assemblea di Sezione': 'task.assemblea_sezione',
        'Delegazione a Livello Regionale': 'task.delegazione_regionale',
        'Congresso del Partito': 'task.congresso_partito',
        'Pratica Amministrativa': 'task.pratica_amministrativa',
    },

    localizeTask(task) {
        const title = String(task && task.title ? task.title : '');
        const key = this.TASK_LOCALIZATION_KEYS[title];
        if (!key || typeof Localization === 'undefined' || !Localization.translate) return task;
        return { ...task, title: Localization.translate(key) };
    },

    /**
     * Get nation-specific political tasks
     * Adds localized content based on Game.state.nation.id
     */
    getNationSpecificPoliticalTasks() {
        const nationId = Game.state.nation ? Game.state.nation.id : 'italy';
        const tasks = [];

        if (nationId === 'italy') {
            tasks.push({ title: 'Assemblea di Sezione', desc: 'Partecipi alla riunione della corrente locale.', reward: { reputazione: 5, coherence: 3, carisma: 1 }, apCost: 1 });
            tasks.push({ title: 'Delegazione a Livello Regionale', desc: 'Rappresenti la sezione in riunione di federazione.', reward: { reputazioneNazionale: 4, reputazione: 3, stress: 5 }, apCost: 1 });
            if (Game.state.politicalCareer.level >= 2) {
                tasks.push({ title: 'Congresso del Partito', desc: 'Partecipazione al congresso nazionale annuale.', reward: { reputazioneNazionale: 8, coherence: 2, stress: 12 }, apCost: 2, highLevel: true });
            }
        } else if (nationId === 'france') {
            tasks.push({ title: 'Réunion de la Cellule', desc: 'Discussione strategica con i camarades locali.', reward: { reputazione: 5, coherence: 3, carisma: 1 }, apCost: 1 });
            tasks.push({ title: 'Manifestation Autorisée', desc: 'Organizza una manifestazione ufficiale autorizzata.', reward: { reputazione: 8, stanchezza: 14, carisma: 3 }, apCost: 2 });
            tasks.push({ title: 'Débat Parlementaire', desc: 'Breve intervento nel dibattito locale.', reward: { reputazioneNazionale: 5, intelligenza: 2, stress: 8 }, apCost: 1 });
        } else if (nationId === 'germany') {
            tasks.push({ title: 'Sitzung des Ortsverbandes', desc: 'Riunione della sezione locale con dibattito sulla piattaforma.', reward: { reputazione: 5, coherence: 4, intelligenza: 1 }, apCost: 1 });
            tasks.push({ title: 'Bundestag Besuch', desc: 'Visita al Parlamento federale come osservatore.', reward: { reputazioneNazionale: 6, intelligenza: 3, stress: 6 }, apCost: 1 });
            tasks.push({ title: 'Wahlkampf Koordination', desc: 'Coordinamento della campagna federale nel distretto.', reward: { reputazione: 10, reputazioneNazionale: 4, stress: 10 }, apCost: 2, highLevel: true });
        } else if (nationId === 'uk') {
            tasks.push({ title: 'Constituency Meeting', desc: 'Riunione circoscrizionale con i militanti di base.', reward: { reputazione: 5, coherence: 3, carisma: 2 }, apCost: 1 });
            tasks.push({ title: 'PMQs Watching Party', desc: 'Evento pubblico per commentare Question Time.', reward: { reputazione: 6, carisma: 2, stress: 4 }, apCost: 1 });
            if (Game.state.politicalCareer.level >= 2) {
                tasks.push({ title: 'Shadow Cabinet Briefing', desc: 'Preparazione per il briefing ombra.', reward: { reputazioneNazionale: 8, intelligenza: 3, stress: 8 }, apCost: 1, highLevel: true });
            }
        }

        return tasks;
    },

    /**
     * Get nation-specific work tasks (professionali)
     */
    getNationSpecificWorkTasks() {
        const nationId = Game.state.nation ? Game.state.nation.id : 'italy';
        const tasks = [];

        if (nationId === 'italy') {
            // Italian bureaucracy-specific tasks
            tasks.push({ title: 'Pratica Amministrativa', desc: 'Gestisci fascicoli presso ufficio comunale.', reward: { money: 25, intelligenza: 2, stanchezza: 8 }, apCost: 1 });
        } else if (nationId === 'france') {
            // French official tasks
            tasks.push({ title: 'Rapport Administratif', desc: 'Prepara rapporto per la prefettura locale.', reward: { money: 28, intelligenza: 3, stanchezza: 10 }, apCost: 1 });
        } else if (nationId === 'germany') {
            // German efficiency-focused
            tasks.push({ title: 'Amtliches Verfahren', desc: 'Pratiche presso l\'ufficio amministrativo comunale.', reward: { money: 30, intelligenza: 2, carisma: 1, stanchezza: 6 }, apCost: 1 });
        } else if (nationId === 'uk') {
            // British council work
            tasks.push({ title: 'Council Paperwork', desc: 'Documentazione presso l\'ufficio del consiglio locale.', reward: { money: 27, intelligenza: 2, stanchezza: 7 }, apCost: 1 });
        }

        return tasks;
    },

    init() {
        /* Task tab switching */
        document.querySelectorAll('.task-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.task-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.dataset.tab;
                document.querySelectorAll('.task-tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`tab-${target}`).classList.add('active');
                // Refresh lifestyle content when its tab is selected
                if (target === 'lifestyle-tasks' && typeof Lifestyle !== 'undefined') {
                    Lifestyle.refresh();
                }
            });
        });

        this.ensureTaskState();
        Game.on('panel-open', (d) => { if (d.panel === 'tasks') this.refresh(); });
        Game.on('stat-change', () => this.updateBalance());
        Game.on('money-change', () => this.updateBalance());
        Game.on('time-advance', () => this.refresh());
        Game.on('generate-tasks', () => {
            this.ensureTaskState();
            Game.state.taskPools.work = [];
            Game.state.taskPools.political = [];
            this.refresh();
        });
    },

    ensureTaskState() {
        if (!Game.state.taskPools) Game.state.taskPools = { work: [], political: [] };
        if (!Game.state.taskChains) {
            Game.state.taskChains = {
                work: { progress: 0, target: this.CHAIN_TARGET },
                political: { progress: 0, target: this.CHAIN_TARGET },
                territory: { progress: 0, target: this.CHAIN_TARGET },
            };
        }
    },

    refresh() {
        this.ensureTaskState();
        this.renderTasks('work');
        this.renderTasks('political');
        this.renderCareerProgress();
        this.updateBalance();
    },

    renderTasks(category) {
        const pool = this.getPool(category);
        const list = document.getElementById(`${category}-tasks`);
        list.innerHTML = '';

        // Check bills lockout
        if (Game.state.flags.phoneLocked && category === 'work') {
            const lockMsg = document.createElement('div');
            lockMsg.className = 'bills-lockout-msg';
            lockMsg.textContent = '⚠️ Bollette scadute! Alcune mansioni bloccate fino al pagamento.';
            list.appendChild(lockMsg);
        }

        this.renderChainProgressFor(category, list);

        // Political block: reputation too low
        if ((Game.state.flags.politicalBlocked || (Game.state.flags.politicalBlockedTurns || 0) > 0) && category === 'political') {
            const lockMsg = document.createElement('div');
            lockMsg.className = 'bills-lockout-msg';
            lockMsg.textContent = (Game.state.flags.politicalBlockedTurns || 0) > 0
                ? `🏛️ Blocco politico temporaneo: ${Game.state.flags.politicalBlockedTurns} turni rimanenti.`
                : '🏛️ Il partito ti ha isolato! Reputazione troppo bassa per incarichi politici.';
            list.appendChild(lockMsg);
            return;
        }

        pool.forEach(task => {
            const noAP = !Game.hasActionPoints(task.apCost || 1);
            const item = document.createElement('div');
            const isConflicted = task.conflictFailed;
            const previewText = this.rewardLabel(task.reward).replace(/"/g, '&quot;');
            item.className = `task-item task-${category} ${task.highLevel ? 'task-special' : ''} ${task.done ? 'task-done' : ''} ${noAP && !task.done ? 'task-no-ap' : ''} ${task.conflictId ? 'conflicted' : ''} ${isConflicted ? 'conflict-failed' : ''}`;
            item.setAttribute('data-preview', `${task.apCost || 1} ⚡ | ${previewText || 'Nessun effetto'}`);
            item.innerHTML = `
                <div class="task-checkbox">${task.done ? '☑' : (isConflicted ? '✗' : '☐')}</div>
                <div class="task-body">
                    <div class="task-title">${this.esc(task.title)}
                        <span class="task-ap-cost">${task.apCost || 1} PA</span>
                        ${task.conflictId ? '<span class="task-conflict">⚡ Conflitto</span>' : ''}
                    </div>
                    <div class="task-desc">${this.esc(task.desc)}</div>
                    <div class="task-reward">${this.rewardLabel(task.reward)}</div>
                </div>
            `;
            if (!task.done && !noAP && !isConflicted) {
                item.addEventListener('click', () => this.completeTaskAnimated(category, task, item));
            }
            list.appendChild(item);
        });
    },

    completeTaskAnimated(category, task, item) {
        const cost = task.apCost || 1;
        let spentFromBonus = false;
        if (category === 'political' && Game.state.politicalCareer && Game.state.politicalCareer.politicalBonusAP > 0 && cost >= 1) {
            Game.state.politicalCareer.politicalBonusAP -= 1;
            spentFromBonus = true;
        } else {
            if (!Game.spendActionPoint(cost)) {
                Game.emit('no-ap', { reason: `Servono ${cost} PA per completare "${task.title}". PA attuali: ${Game.state.actionPoints}.` });
                return;
            }
        }

        // Completamento immediato — niente barra di progresso
        task.done = true;
        this.applyReward(task.reward, category, task);
        if (task.resolveCityIssue && Game.state.flags && Game.state.flags.cityIssue) {
            Game.state.flags.cityIssue.resolved = true;
            Game.addWorkNotif('🛠️ Problema Risolto', `Hai risolto: ${Game.state.flags.cityIssue.issue}.`, `Giorno ${Game.state.day}`);
        }

        // Mentore populista: +1 PA su Volantinaggio/Gazebo.
        if (Game.state.flags && Game.state.flags.mentorTaskBoost && /volantin|gazebo/i.test(`${task.title || ''} ${task.desc || ''}`)) {
            Game.state.actionPoints = Math.min(2, (Game.state.actionPoints || 0) + 1);
            Game.emit('ap-change', { ap: Game.state.actionPoints });
        }

        task.completedDay = Game.state.day;
        if (category === 'political' && Game.registerPoliticalTaskProgress) {
            Game.registerPoliticalTaskProgress(task);
        }

        // Handle conflicting tasks
        if (task.conflictId) {
            this.resolveConflict(category, task);
        }

        this.updateChainProgress(category);
        Game.emit('task-completed', { type: category, title: task.title });

        // Feedback visivo istantaneo
        const checkbox = item.querySelector('.task-checkbox');
        if (checkbox) {
            checkbox.textContent = '✓';
            checkbox.classList.add('done');
        }
        item.style.pointerEvents = 'none';
        item.style.opacity = '0.7';

        if (typeof Audio !== 'undefined' && Audio.playComplete) Audio.playComplete();

        Game.addWorkNotif('✔️ Task Completato', `${task.title}${spentFromBonus ? ' (usato PA politico bonus)' : ''}`, `Giorno ${Game.state.day}`);

        // Refresh after brief visual feedback
        setTimeout(() => this.refresh(), 300);
    },

    resolveConflict(completedCategory, completedTask) {
        const otherCategory = completedCategory === 'work' ? 'political' : 'work';
        const otherPool = this.getPool(otherCategory);
        let failedCount = 0;
        otherPool.forEach(t => {
            if (t.conflictId === completedTask.conflictId && !t.done) {
                t.conflictFailed = true;
                t.done = true;
                failedCount++;
            }
        });
        // Notification if political overrode work
        if (completedCategory === 'political') {
            Game.addWorkNotif('⚠️ Il capo ti cerca', 'Hai scelto la politica invece del lavoro. Il tuo capo non è contento.', `Giorno ${Game.state.day}`);
            Game.changeStat('stress', 5);
            if (Game.state.partner) {
                Game.state.partner.support = Math.max(0, Game.state.partner.support - 5);
                Game.addWorkNotif('💔 Vita privata', 'Hai trascurato il partner per la politica. Supporto -5.', `Giorno ${Game.state.day}`);
            }
        } else {
            Game.changeReputazione(-2);
            Game.addWorkNotif('📉 Visibilità persa', 'Hai sacrificato un incarico politico per il lavoro.', `Giorno ${Game.state.day}`);
        }

        if (failedCount >= 1 && Math.random() < 0.25) {
            Game.changeStat('coherence', -10);
            Game.addWorkNotif('🧩 Crisi di identità', 'Hai tirato troppo la corda tra priorità opposte. Coerenza -10.', `Giorno ${Game.state.day}`);
        }
    },

    completeTask(category, task) {
        const cost = task.apCost || 1;
        if (category === 'political' && Game.state.politicalCareer && Game.state.politicalCareer.politicalBonusAP > 0 && cost >= 1) {
            Game.state.politicalCareer.politicalBonusAP -= 1;
        } else {
            if (!Game.spendActionPoint(cost)) {
                Game.emit('no-ap', { reason: 'Punti azione esauriti!' });
                return;
            }
        }
        task.done = true;
        this.applyReward(task.reward, category, task);
        task.completedDay = Game.state.day;
        if (category === 'political' && Game.registerPoliticalTaskProgress) {
            Game.registerPoliticalTaskProgress(task);
        }
        this.updateChainProgress(category);
        Game.emit('task-completed', { type: category, title: task.title });
        this.refresh();
    },

    applyReward(reward, category, task) {
        if (!reward) return;

        if (Game.applyIdeologyConsistencyPenalty && task && (category === 'political' || category === 'work')) {
            Game.applyIdeologyConsistencyPenalty(`${category}:${task.title || ''} ${task.desc || ''}`);
        }

        const effective = { ...reward };
        const allianceBonus = Game.getAllianceBonusSummary ? Game.getAllianceBonusSummary() : null;

        // Mentore tecnocrate: +20% efficacia su analisi/report.
        if (Game.state.flags && Game.state.flags.mentorTechTaskBoost && /analisi|report|bilancio|progetto/i.test(`${task?.title || ''} ${task?.desc || ''}`)) {
            const m = Game.state.flags.mentorTechTaskBoost;
            if (effective.money) effective.money = Math.round(effective.money * m);
            if (effective.reputazione) effective.reputazione = Math.round(effective.reputazione * m);
            if (effective.reputazioneNazionale) effective.reputazioneNazionale = Math.round(effective.reputazioneNazionale * m);
            if (effective.coherence && effective.coherence > 0) effective.coherence = Math.round(effective.coherence * m);
        }

        // Rischio Elena: etichetta "tecnico al soldo" riduce impatto politico.
        if (category === 'political' && Game.state.flags && Game.state.flags.elenaBankLabel && effective.reputazione) {
            effective.reputazione = Math.max(0, effective.reputazione - 5);
        }

        // Rischio Marta: oltre 60 reputazione nazionale, i task istituzionali logorano il rapporto.
        if (category === 'political' && Game.state.reputazioneNazionale > 60 && Game.state.flags && Game.state.flags.mentor && Game.state.flags.mentor.id === 'marta') {
            const mentor = Game.state.flags.mentor;
            mentor.relationship = Math.max(0, (mentor.relationship || 65) - 5);
        }

        // Political multipliers from factions/city competition
        if (category === 'political' && effective.reputazione) {
            // Political tasks were overperforming on raw reputation compared to work tasks.
            const repMult = (typeof GameConstants !== 'undefined' && GameConstants.BALANCE)
                ? GameConstants.BALANCE.POLITICAL_REPUTATION_MULTIPLIER
                : 0.85;
            effective.reputazione = Math.round(effective.reputazione * repMult);
            let mult = 1;
            if (typeof Factions !== 'undefined') mult *= Factions.getPoliticalBonus();
            const concorrenzaMult = (typeof GameMap !== 'undefined') ? GameMap.getConcorrenzaMultiplier() : 1;
            mult *= concorrenzaMult;
            if (allianceBonus && allianceBonus.politicalMultiplier) mult *= allianceBonus.politicalMultiplier;
            
            // Notifica se concorrenza ha ridotto il guadagno
            if (concorrenzaMult < 1 && reward.reputazione) {
                const loss = Math.round(reward.reputazione * (1 - concorrenzaMult));
                const city = Game.state.city;
                const cityName = city ? city.name : 'questa città';
                Game.addWorkNotif('⚔️ Effetto Concorrenza', `A ${cityName}, le vostre azioni hanno meno impatto: potevate guadagnare +${loss} rep in più senza la concorrenza locale.`, `Giorno ${Game.state.day}`);
            }
            
            effective.reputazione = Math.round(effective.reputazione * mult);
            if (effective.reputazioneNazionale) effective.reputazioneNazionale = Math.round(effective.reputazioneNazionale * mult);
            if (effective.coherence && effective.coherence > 0) effective.coherence = Math.round(effective.coherence * mult);
        }

        if (category === 'work' && effective.stanchezza && effective.stanchezza > 0 && allianceBonus && allianceBonus.workFatigueReduction > 0) {
            effective.stanchezza = Math.max(0, Math.round(effective.stanchezza * (1 - allianceBonus.workFatigueReduction)));
        }

        // Lifestyle preparation -> task bonuses
        const prepMult = this.getPreparationMultiplier(category, task, effective);

        // Apply danger threshold modifiers
        const stanchMod = (Game.state.stats.stanchezza > 80) ? 1 : 0;
        const stressMod = (Game.state.stats.stress > 70) ? 0.9 : 1; // -10% efficiency at >70
        const stressMod2 = (Game.state.stats.stress > 90) ? 0.8 : stressMod; // -20% at >90
        if (effective.money) Game.changeMoney(Math.round(effective.money * stressMod2 * prepMult));
        if (category === 'work' && allianceBonus && allianceBonus.workFlatMoney > 0) {
            Game.changeMoney(allianceBonus.workFlatMoney);
            Game.addWorkNotif('🤝 Bonus Alleanza', `Supporto imprenditoriale: +€${allianceBonus.workFlatMoney}.`, `Giorno ${Game.state.day}`);
        }
        if (allianceBonus && allianceBonus.shadowMoney > 0 && task && /ombra/i.test(`${task.title || ''} ${task.desc || ''}`)) {
            Game.changeMoney(allianceBonus.shadowMoney);
            Game.addWorkNotif('🕶️ Bonus Ombra', `Rete nell'ombra: +€${allianceBonus.shadowMoney}.`, `Giorno ${Game.state.day}`);
        }
        if (effective.stanchezza) Game.changeStat('stanchezza', effective.stanchezza + (stanchMod > 0 && effective.stanchezza > 0 ? 5 : 0));
        if (effective.stress) Game.changeStat('stress', effective.stress);
        if (effective.morale) Game.changeStat('morale', effective.morale);
        if (effective.salute) Game.changeStat('salute', effective.salute);
        if (effective.reputazione) Game.changeReputazione(Math.round(effective.reputazione * stressMod2 * prepMult));
        if (effective.reputazioneNazionale) Game.changeReputazione(Math.round(effective.reputazioneNazionale * stressMod2 * prepMult), 'nazionale');
        if (effective.coherence) Game.changeStat('coherence', effective.coherence);
        if (effective.intelligenza) Game.changeAttribute('intelligenza', effective.intelligenza);
        if (effective.estetica) Game.changeAttribute('estetica', effective.estetica);
        if (effective.autenticita) Game.changeAttribute('autenticita', effective.autenticita);
        if (effective.muscoli) Game.changeAttribute('muscoli', effective.muscoli);
        if (effective.carisma) Game.changeAttribute('carisma', effective.carisma);
    },

    getPreparationMultiplier(category, task, reward) {
        let mult = 1;
        const ls = Game.state.lifestyle || {};
        const habit = ls.habitToday || null;

        if (habit === 'colazione' && category === 'political' && (reward.reputazione || reward.reputazioneNazionale)) {
            mult *= 1.2;
        }
        if (habit === 'giornale' && category === 'work' && reward.intelligenza) {
            mult *= 1.15;
        }
        if (habit === 'meditazione' && reward.stress && reward.stress > 0) {
            reward.stress = Math.max(0, reward.stress - 2);
        }
        if (habit === 'corsa' && reward.stanchezza && reward.stanchezza > 0) {
            reward.stanchezza = Math.max(0, reward.stanchezza - 2);
        }

        if (Game.state.stats.morale >= 70 && category === 'political') {
            mult *= 1.1;
        }

        if (mult > 1) {
            Game.addWorkNotif('✨ Sinergia', `Preparazione efficace: bonus x${mult.toFixed(2)} su ${task ? task.title : 'task'}.`, `Giorno ${Game.state.day}`);
        }
        return mult;
    },

    rewardLabel(reward) {
        if (!reward) return '';
        const parts = [];
        if (reward.money) parts.push(`${reward.money > 0 ? '+' : ''}${reward.money}€`);
        if (reward.reputazione) parts.push(`${reward.reputazione > 0 ? '+' : ''}${reward.reputazione} Rep`);
        if (reward.reputazioneNazionale) parts.push(`${reward.reputazioneNazionale > 0 ? '+' : ''}${reward.reputazioneNazionale} Rep🌐`);
        if (reward.morale) parts.push(`${reward.morale > 0 ? '+' : ''}${reward.morale} Morale`);
        if (reward.stanchezza) parts.push(`${reward.stanchezza > 0 ? '+' : ''}${reward.stanchezza} Stanch.`);
        if (reward.stress) parts.push(`${reward.stress > 0 ? '+' : ''}${reward.stress} Stress`);
        if (reward.intelligenza) parts.push(`+${reward.intelligenza} Int.`);
        if (reward.carisma) parts.push(`+${reward.carisma} Car.`);
        if (reward.muscoli) parts.push(`+${reward.muscoli} Musc.`);
        if (reward.estetica) parts.push(`+${reward.estetica} Est.`);
        if (reward.autenticita) parts.push(`+${reward.autenticita} Aut.`);
        if (reward.coherence) parts.push(`${reward.coherence > 0 ? '+' : ''}${reward.coherence} Coer.`);
        return parts.join(' | ');
    },

    updateBalance() {
        const el = document.getElementById('tasks-balance');
        if (el) el.textContent = `Saldo: ${Game.state.money}€`;
    },

    renderCareerProgress() {
        const footer = document.querySelector('.financial-footer');
        if (!footer) return;
        const career = Game.state.career;
        const level = Game.getCareerLevel();
        const pol = Game.state.politicalCareer || {};
        const polLevel = Game.getPoliticalLevel ? Game.getPoliticalLevel() : { label: 'Militante di Base', dailySalary: 0 };
        let careerEl = document.getElementById('career-progress-display');
        if (!careerEl) {
            careerEl = document.createElement('div');
            careerEl.id = 'career-progress-display';
            careerEl.className = 'career-progress-section';
            footer.parentNode.insertBefore(careerEl, footer);
        }
        const nextLevel = Game.CAREER_LEVELS[career.level + 1];
        careerEl.innerHTML = `
            <div class="career-info">
                <span class="career-label">💼 ${level.label}</span>
                <span class="career-salary">Stipendio base: €${level.salary}</span>
                ${career.corrupted ? '<span class="career-corrupt">⚠️ Corrotto</span>' : ''}
            </div>
            ${nextLevel ? `
                <div class="career-bar-section">
                    <span class="career-next">Prossimo: ${nextLevel.label}</span>
                    <div class="career-bar-track">
                        <div class="career-bar-fill" style="width:${Math.min(100, career.promotionProgress)}%"></div>
                    </div>
                    <span class="career-pct">${Math.min(100, career.promotionProgress)}%</span>
                </div>
            ` : '<div class="career-max">🏆 Livello massimo raggiunto!</div>'}
            <div class="political-career-box">
                <div class="career-info">
                    <span class="career-label">🏛️ ${polLevel.label}</span>
                    <span class="career-salary">Stipendio politico: €${polLevel.dailySalary}/giorno</span>
                    <span class="career-next">PA politico bonus: ${pol.politicalBonusAP || 0}</span>
                </div>
                <div class="career-bar-section">
                    <span class="career-next">Progressione base</span>
                    <div class="career-bar-track"><div class="career-bar-fill" style="width:${Math.min(100, pol.progress || 0)}%"></div></div>
                    <span class="career-pct">${Math.min(100, pol.progress || 0)}%</span>
                </div>
                <div class="career-next">Task politici: ${pol.politicalTasksCompleted || 0} | Firme: ${pol.signaturesCollected || 0} | Fondi campagna: €${pol.campaignFunds || 0}</div>
            </div>
        `;
    },

    renderChainProgressFor(category, listEl) {
        const chains = Game.state.taskChains || {};
        const c = chains[category];
        if (!c) return;
        const pct = Math.round((c.progress / c.target) * 100);
        const label = category === 'work' ? 'Catena Carriera' : 'Catena Politica';

        const wrap = document.createElement('div');
        wrap.className = 'task-chain-box';
        wrap.innerHTML = `
            <div class="task-chain-head">🔗 ${label} <span>${c.progress}/${c.target}</span></div>
            <div class="task-chain-track"><div class="task-chain-fill ${category}" style="width:${pct}%"></div></div>
        `;
        listEl.appendChild(wrap);
    },

    updateChainProgress(category) {
        const chains = Game.state.taskChains;
        const c = chains && chains[category];
        if (!c) return;

        c.progress = Math.min(c.target, c.progress + 1);
        if (c.progress < c.target) return;

        if (category === 'work') {
            Game.state.career.promotionProgress += 20;
            if (Game.state.career.promotionProgress >= 100 && Game.promoteCareer) {
                Game.promoteCareer();
            }
            Game.addWorkNotif('🏆 Catena Carriera', 'Completati 3 task lavoro: +20 progressione carriera.', `Giorno ${Game.state.day}`);
        } else if (category === 'political') {
            Game.changeReputazione(15);
            if (Game.state.contacts.length > 0) {
                const cIdx = Math.floor(Math.random() * Game.state.contacts.length);
                Game.state.contacts[cIdx].relation = Math.min(100, Game.state.contacts[cIdx].relation + 8);
            }
            Game.addWorkNotif('🏆 Catena Politica', 'Completati 3 task politici: +15 reputazione.', `Giorno ${Game.state.day}`);
        }

        c.progress = 0;
    },

    registerExternalChainProgress(chainKey) {
        this.ensureTaskState();
        const c = Game.state.taskChains[chainKey];
        if (!c) return;
        c.progress = Math.min(c.target, c.progress + 1);
        if (c.progress >= c.target) {
            if (chainKey === 'territory') {
                Game.changeReputazione(8);
                Game.addWorkNotif('🤝 Catena Territorio', 'Hai completato una catena sociale di quartiere! +8 reputazione.', `Giorno ${Game.state.day}`);
            }
            c.progress = 0;
        }
    },

    getPool(category) {
        this.ensureTaskState();

        let pool = Game.state.taskPools[category];
        const allDone = pool.length > 0 && pool.every(t => t.done);
        if (pool.length === 0 || allDone) {
            pool = this.generateTasks(category);
            Game.state.taskPools[category] = pool;
            // Inject conflicts after both pools exist
            if (Game.state.taskPools.work.length > 0 && Game.state.taskPools.political.length > 0) {
                this.injectConflicts();
            }
        }
        return pool;
    },

    /** Mark one random task in each pool as conflicting */
    injectConflicts() {
        const wp = Game.state.taskPools.work;
        const pp = Game.state.taskPools.political;
        const availW = wp.filter(t => !t.done && !t.conflictId);
        const availP = pp.filter(t => !t.done && !t.conflictId);
        if (availW.length === 0 || availP.length === 0) return;
        // 50% chance of a conflict appearing
        if (Math.random() > 0.5) return;
        const conflictId = `conflict_${Game.state.day}_${Date.now()}`;
        const wTask = availW[Math.floor(Math.random() * availW.length)];
        const pTask = availP[Math.floor(Math.random() * availP.length)];
        wTask.conflictId = conflictId;
        pTask.conflictId = conflictId;
    },

    generateTasks(category) {
        if (category === 'work') return this.generateWorkTasks();
        return this.generatePoliticalTasks();
    },

    generateWorkTasks() {
        const st = Game.state.stats;
        const lowMoney = Game.state.money < 50;
        const manyContacts = Game.state.contacts.length > 5;
        const mafiaOn = !!(Game.state.mafia && Game.state.mafia.active);

        const all = [
            { title: 'Revisione Budget', desc: 'Controlla le spese mensili.', reward: { money: 20, stanchezza: 5, intelligenza: 1 }, apCost: 1 },
            { title: 'Report Trimestrale', desc: 'Prepara la relazione per i dirigenti.', reward: { money: 32, stanchezza: 10, stress: 3, intelligenza: 2 }, apCost: 1 },
            { title: 'Riunione Operativa', desc: 'Coordina il team per il progetto.', reward: { money: 26, stanchezza: 6, carisma: 2 }, apCost: 1 },
            { title: 'Analisi Documenti', desc: 'Studia i fascicoli arretrati.', reward: { money: 22, stanchezza: 10, intelligenza: 2 }, apCost: 1 },
            { title: 'Telefonata Importante', desc: 'Chiama il direttore regionale.', reward: { money: 24, stress: 5, reputazione: 3 }, apCost: 1 },
            { title: 'Firma Contratti', desc: 'Rivedi e firma i nuovi contratti.', reward: { money: 40, stanchezza: 6, carisma: 1 }, apCost: 1 },
            { title: 'Organizza Archivio', desc: 'Metti in ordine l\'archivio cartaceo.', reward: { stanchezza: -25, stress: -15, morale: 8 }, apCost: 1 },
            { title: 'Aggiornamento Software', desc: 'Gestisci l\'aggiornamento dei sistemi.', reward: { money: 10, intelligenza: 3, stanchezza: 6 }, apCost: 1 },
            { title: 'Presentazione Strategica', desc: 'Consegna una presentazione al direttivo.', reward: { money: 28, stanchezza: 12, carisma: 2, intelligenza: 2 }, apCost: 1 },
        ];

        if (lowMoney) {
            all.push({ title: 'Consulenza Lampo', desc: 'Supporto urgente a un ufficio esterno.', reward: { money: 70, stanchezza: 10, stress: 4 }, apCost: 1 });
            all.push({ title: 'Turno Straordinario', desc: 'Copri il turno di un collega assente.', reward: { money: 62, stanchezza: 14, stress: 6 }, apCost: 1 });
        }

        if (st.stanchezza > 70) {
            all.push({ title: 'Smista Email', desc: 'Compito leggero ma utile.', reward: { money: 8, stanchezza: 3, stress: -1 }, apCost: 1 });
            all.push({ title: 'Aggiorna Agenda', desc: 'Riorganizza appuntamenti e priorita.', reward: { money: 6, stanchezza: 2, intelligenza: 1 }, apCost: 1 });
        }

        if (manyContacts) {
            all.push({ title: 'Pranzo Networking', desc: 'Sfrutta la rete contatti per nuove opportunita.', reward: { money: 30, reputazione: 4, carisma: 2, stanchezza: 7 }, apCost: 1 });
        }

        if (mafiaOn) {
            all.push({ title: 'Incontro Riservato', desc: 'Un contatto nell\'ombra propone un favore.', reward: { money: 90, stress: 12, reputazione: -2 }, apCost: 1 });
        }

        const settlement = (Game.state.cityFlags && Game.state.cityFlags.settlementType) || 'city';
        if (settlement === 'comune') {
            all.push({ title: 'Aiuta il contadino', desc: 'Dai una mano nei campi e ascolti i problemi reali.', reward: { money: 20, salute: 3, reputazione: 2 }, apCost: 1 });
            all.push({ title: 'Sgombero neve', desc: 'Servizio civile improvvisato nelle vie del paese.', reward: { money: 15, stanchezza: 5, reputazione: 4 }, apCost: 1 });
            all.push({ title: 'Festa patronale', desc: 'Organizzi la festa: comunità e consenso aumentano.', reward: { money: 50, morale: 15, reputazione: 10 }, apCost: 1 });
        } else if (settlement === 'city') {
            all.push({ title: 'Riunione di quartiere', desc: 'Ascolti i residenti e raccogli micro-istanze.', reward: { reputazione: 5, stress: -3, carisma: 1 }, apCost: 1 });
            all.push({ title: 'Confindustria meeting', desc: 'Networking d\'affari: costo alto, ritorni futuri.', reward: { money: 100, reputazione: 2 }, apCost: 1, upfrontCost: 50 });
            all.push({ title: 'Sciopero dei trasporti', desc: 'Mediazione in emergenza urbana ad alta visibilità.', reward: { reputazione: 8, stress: 8, coherence: 3 }, apCost: 1 });
            if (Game.state.flags && Game.state.flags.cityIssue && !Game.state.flags.cityIssue.resolved) {
                all.push({ title: `Risolvi: ${Game.state.flags.cityIssue.issue}`, desc: 'Task speciale legato all\'inchiesta civica.', reward: { reputazione: 20, coherence: 10 }, apCost: 1, resolveCityIssue: true });
            }
        } else if (settlement === 'metropolis') {
            all.push({ title: 'Vertice di pace sindacale', desc: 'Tavolo teso tra parti sociali.', reward: { reputazioneNazionale: 15, stress: 20 }, apCost: 2 });
            all.push({ title: 'Cena con direttore banca', desc: 'Accordo economico ad alto costo reputazionale.', reward: { money: 220, networking: 15, coherence: -10 }, apCost: 1, upfrontCost: 120 });
            all.push({ title: 'Conferenza stampa nazionale', desc: 'Molta esposizione, rischio boomerang mediatico.', reward: { reputazioneNazionale: 12, stress: 12 }, apCost: 2 });
        } else if (settlement === 'capital') {
            all.push({ title: 'Consiglio regionale', desc: 'Sessione legislativa ad alto impatto.', reward: { reputazione: 10, reputazioneNazionale: 4, stress: 10 }, apCost: 2 });
            all.push({ title: 'Incontro con i sindaci', desc: 'Coordinamento territoriale della regione.', reward: { reputazione: 7, carisma: 2 }, apCost: 1 });
            all.push({ title: 'Gestione emergenza regionale', desc: 'Intervento straordinario con fondi dedicati.', reward: { reputazione: 15, reputazioneNazionale: 8, stress: 10 }, apCost: 2, upfrontCost: 500 });
        }

        // Add nation-specific work tasks
        all.push(...this.getNationSpecificWorkTasks());

        if (st.stanchezza > 70) {
            return this.pick(all.filter(t => (t.reward.stanchezza || 0) <= 8), 3);
        }
        return this.pick(all, 3);
    },

    generatePoliticalTasks() {
        const lowMoney = Game.state.money < 50;
        const manyContacts = Game.state.contacts.length > 5;
        const mafiaOn = !!(Game.state.mafia && Game.state.mafia.active);
        const polLevel = (Game.state.politicalCareer && Game.state.politicalCareer.level) || 0;

        const all = [
            { title: 'Discorso Pubblico', desc: 'Prepara un intervento per la piazza.', reward: { reputazione: 8, stanchezza: 10, carisma: 3, stress: 6 }, apCost: 1 },
            { title: 'Incontro con Sindaco', desc: 'Discuti le priorità del quartiere.', reward: { reputazione: 5, money: 12, stanchezza: 6, autenticita: 2 }, apCost: 1 },
            { title: 'Volantinaggio', desc: 'Distribuisci volantini per la campagna.', reward: { reputazione: 4, money: 6, stanchezza: 12, muscoli: 2 }, apCost: 1 },
            { title: 'Raccolta Firme', desc: 'Raccogli firme nel mercato cittadino.', reward: { reputazione: 6, money: 8, stanchezza: 8, carisma: 2 }, apCost: 1 },
            { title: 'Intervista TV Locale', desc: 'Partecipa a un talk show locale.', reward: { reputazione: 10, money: 15, stress: 15, carisma: 4, estetica: 2 }, apCost: 1 },
            { title: 'Proposta di Legge', desc: 'Scrivi una proposta per il consiglio.', reward: { reputazione: 12, money: 10, stanchezza: 15, intelligenza: 5, stress: 6 }, apCost: 1 },
            { title: 'Visita Ospedale', desc: 'Mostra vicinanza alla comunità.', reward: { reputazione: 6, money: 5, morale: 10, stanchezza: 6 }, apCost: 1 },
            { title: 'Negoziazione Sindacale', desc: 'Media tra lavoratori e aziende.', reward: { reputazione: 7, money: 7, stress: 10, autenticita: 3 }, apCost: 1 },
            { title: 'Raccolta Fondi', desc: 'Organizza una cena di beneficenza.', reward: { money: 60, reputazione: 5, stanchezza: 10, carisma: 2 }, apCost: 1 },
            { title: 'Comizio di Quartiere', desc: 'Completa la catena politica locale.', reward: { reputazione: 9, reputazioneNazionale: 2, stanchezza: 12, carisma: 3 }, apCost: 1 },
        ];

        // === HIGH-LEVEL TASKS: unlocked by national reputation ===
        if (Game.state.reputazioneNazionale >= 30) {
            all.push({ title: '🎤 Discorso in Piazza', desc: 'Un grande comizio nella piazza principale. Attiri nuovi contatti.', reward: { reputazione: 12, reputazioneNazionale: 5, money: 40, stanchezza: 18, carisma: 5, stress: 10 }, apCost: 2, highLevel: true });
        }
        if (Game.state.reputazioneNazionale >= 50) {
            all.push({ title: '📺 Intervista Nazionale', desc: 'Partecipa a un talk show in prima serata su RAI.', reward: { reputazioneNazionale: 15, money: 120, stress: 20, carisma: 5, estetica: 3 }, apCost: 2, highLevel: true });
        }
        if (Game.state.reputazioneNazionale >= 40) {
            all.push({ title: '📰 Articolo su Quotidiano', desc: 'Scrivi un editoriale per un giornale nazionale.', reward: { reputazioneNazionale: 10, money: 60, intelligenza: 4, stress: 12, stanchezza: 14 }, apCost: 2, highLevel: true });
        }
        if (Game.state.reputazioneNazionale >= 60 && Game.state.reputazione >= 50) {
            all.push({ title: '🏛️ Incontro Sindaco Altra Città', desc: 'Visita diplomatica al sindaco di un\'altra città.', reward: { reputazioneNazionale: 8, reputazione: 10, money: 45, stanchezza: 15, autenticita: 3 }, apCost: 2, highLevel: true });
        }

        if (manyContacts) {
            all.push({ title: 'Cena Strategica', desc: 'Riunisci sostenitori chiave per un endorsement.', reward: { reputazione: 7, reputazioneNazionale: 3, money: -30, carisma: 2 }, apCost: 1 });
        }

        if (lowMoney) {
            all.push({ title: 'Micro-Fundraising', desc: 'Raccolta fondi rapida in sezione.', reward: { money: 90, reputazione: 3, stress: 5 }, apCost: 1 });
        }

        if (mafiaOn) {
            all.push({ title: 'Patto di Retrovia', desc: 'Accordo opaco per sostegno logistico.', reward: { money: 120, reputazione: -4, stress: 10 }, apCost: 1 });
        }

        if (polLevel >= 2) {
            all.push({ title: 'Commissione Urbanistica', desc: 'Presiedi una commissione locale ad alta esposizione.', reward: { money: 80, stress: 10, reputazione: 4 }, apCost: 1 });
            all.push({ title: 'Delegato alla Sanità', desc: 'Sopralluoghi e mediazione con strutture sanitarie.', reward: { money: 60, reputazione: 5, stress: 6 }, apCost: 1 });
            all.push({ title: 'Relatore di Legge', desc: 'Presenti una proposta in aula con copertura mediatica.', reward: { money: 120, reputazioneNazionale: 10, stress: 15 }, apCost: 2, highLevel: true });
            all.push({ title: 'Mediare Conflitto', desc: 'Risolvi una crisi tra correnti interne.', reward: { money: 100, stress: 8, coherence: 5 }, apCost: 1 });
        }

        if (polLevel >= 3) {
            all.push({ title: 'Dibattito Pubblico Nazionale', desc: 'Confronto televisivo decisivo contro un avversario.', reward: { reputazioneNazionale: 12, stress: 14, carisma: 3 }, apCost: 2, highLevel: true });
        }

        const settlement = (Game.state.cityFlags && Game.state.cityFlags.settlementType) || 'city';
        if (settlement === 'comune') {
            all.push({ title: 'Consiglio comunale aperto', desc: 'Proponi una mozione e difendila davanti ai cittadini.', reward: { reputazione: 10, coherence: 6 }, apCost: 2 });
        } else if (settlement === 'city') {
            all.push({ title: 'Passeggiata elettorale', desc: 'Giro nei quartieri per testare il consenso reale.', reward: { reputazione: 6, carisma: 2 }, apCost: 1 });
            all.push({ title: 'Fiera campionaria', desc: 'Presidio politico con stand ufficiale.', reward: { reputazione: 12, reputazioneNazionale: 2 }, apCost: 1, upfrontCost: 100 });
        } else if (settlement === 'metropolis') {
            all.push({ title: 'Gestione distretti metropolitani', desc: 'Coordini agenda tra centro e periferie.', reward: { reputazioneNazionale: 8, stress: 8, coherence: 4 }, apCost: 2 });
        } else if (settlement === 'capital') {
            all.push({ title: 'Conferenza dei servizi', desc: 'Mediazione tra assessorati su sanita e trasporti.', reward: { reputazione: 10, coherence: 8, stress: 6 }, apCost: 2 });
        }

        // Add nation-specific political tasks
        all.push(...this.getNationSpecificPoliticalTasks());

        return this.pick(all, 3);
    },

    pick(arr, n) {
        const normalized = arr.filter(t => {
            if (!t.upfrontCost) return true;
            return Game.state.money >= t.upfrontCost;
        }).map(t => ({
            ...t,
            reward: {
                ...(t.reward || {}),
                money: (t.reward && t.reward.money ? t.reward.money : 0) - (t.upfrontCost || 0),
            },
        }));
        const shuffled = normalized.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n).map(t => ({ ...this.localizeTask(t), done: false }));
    },

    esc(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },
};
