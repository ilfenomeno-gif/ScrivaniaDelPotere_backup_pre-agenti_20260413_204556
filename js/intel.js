/* ============================================
   INTEL — La Soffiata
   Sistema di intelligence e pettegolezzi
   ============================================ */

const Intel = {
    // Known upcoming events (pre-discovered via NPCs)
    // Each: { eventIndex, source, text, day, prepared }

    init() {
        if (!Game.state.intel) {
            Game.state.intel = [];
        }

        // Intercept random events to check intel
        Game.on('random-event', (d) => {
            this.checkIntel(d);
        });
    },

    // Called from Territory bar/giornalaio actions
    askAround(source) {
        if (!Game.spendActionPoint(1)) {
            Game.emit('no-ap', { reason: 'Punti azione esauriti!' });
            return false;
        }

        const cost = source === 'giornalaio' ? 5 : 10;
        if (Game.state.money < cost) {
            Game.addWorkNotif('🔍 Soffiata', `Non hai €${cost} per la soffiata.`, `Giorno ${Game.state.day}`);
            Game.state.actionPoints++;
            Game.emit('ap-change', { ap: Game.state.actionPoints });
            return false;
        }

        Game.changeMoney(-cost);

        // Pick a random upcoming event and preview it
        const pool = Events.getFilteredPool();
        if (pool.length === 0) {
            Game.addWorkNotif('🔍 Soffiata', 'Niente di interessante oggi...', `Giorno ${Game.state.day}`);
            return true;
        }

        const event = pool[Math.floor(Math.random() * pool.length)];
        const tipText = this.generateTip(event);

        Game.state.intel.push({
            eventTitle: event.title,
            source: source,
            tip: tipText,
            day: Game.state.day,
            prepared: false,
            eventType: event.type,
        });

        // Show post-it on desk
        this.showPostIt(tipText, source);

        // Track NPC relation
        if (Game.state.lifestyle?.npcRelations) {
            if (source === 'giornalaio') Game.state.lifestyle.npcRelations.giornalaio.asked++;
            if (source === 'barista') Game.state.lifestyle.npcRelations.barista.visits++;
        }

        Game.addWorkNotif('🔍 Soffiata', `${source === 'giornalaio' ? 'Il Giornalaio' : 'Il Barista'} ti ha dato una dritta.`, `Giorno ${Game.state.day}`);
        return true;
    },

    generateTip(event) {
        const hints = {
            news: [
                `Domani potrebbe uscire una notizia: "${event.title}". Stai all'erta.`,
                `Ho sentito che i giornali hanno qualcosa su "${event.title}". Preparati.`,
            ],
            phone: [
                `Qualcuno potrebbe chiamarti riguardo "${event.title}".`,
                `Gira voce di un contatto che vuole parlarti di "${event.title}".`,
            ],
            urgent: [
                `⚠️ ATTENZIONE: "${event.title}" — qualcuno sta per metterti alle strette.`,
                `Fonte anonima: "${event.title}". Preparati a scegliere.`,
            ],
        };
        const pool = hints[event.type] || hints.news;
        return pool[Math.floor(Math.random() * pool.length)];
    },

    // Prepare for a known intel (costs 1 PA + money, reduces event impact)
    prepareCountermeasure(intelIndex) {
        const tip = Game.state.intel[intelIndex];
        if (!tip || tip.prepared) return false;

        if (!Game.spendActionPoint(1)) {
            Game.emit('no-ap', { reason: 'Punti azione esauriti!' });
            return false;
        }

        const cost = 20;
        if (Game.state.money < cost) {
            Game.addWorkNotif('🛡️ Contromossa', 'Non hai abbastanza soldi (€20).', `Giorno ${Game.state.day}`);
            Game.state.actionPoints++;
            Game.emit('ap-change', { ap: Game.state.actionPoints });
            return false;
        }

        Game.changeMoney(-cost);
        Game.changeStat('stanchezza', 8);
        tip.prepared = true;

        Game.addWorkNotif('🛡️ Contromossa', `Contromossa preparata per "${tip.eventTitle}". Effetti dimezzati.`, `Giorno ${Game.state.day}`);
        this.refreshPostIts();
        return true;
    },

    // Called when a random event fires — check if we have intel on it
    checkIntel(eventData) {
        // Find matching intel
        const match = Game.state.intel.find(i => !i.used && i.day <= Game.state.day);
        if (match) {
            match.used = true;
            if (match.prepared) {
                // Halve all negative effects of the event
                Game.state._intelShield = true;
                if (this._shieldTimer) Scheduler.clear(this._shieldTimer);
                this._shieldTimer = Scheduler.timeout(() => {
                    Game.state._intelShield = false;
                    this._shieldTimer = null;
                }, 2000, { group: 'intel', label: 'shield' });
                Game.addWorkNotif('🛡️ Preparato!', `La contromossa ha funzionato! Effetti negativi dimezzati.`, `Giorno ${Game.state.day}`);
            }
        }
    },

    // Show post-it note on desk
    showPostIt(text, source) {
        const desk = document.getElementById('desk');
        if (!desk) return;

        // Remove old post-its
        desk.querySelectorAll('.intel-postit').forEach(p => p.remove());

        const postit = document.createElement('div');
        postit.className = 'intel-postit';
        postit.innerHTML = `
            <div class="postit-pin">📌</div>
            <div class="postit-source">${source === 'giornalaio' ? '📰' : '🍺'} Soffiata</div>
            <div class="postit-text">${text}</div>
            <div class="postit-actions">
                ${Game.state.intel.length > 0 && !Game.state.intel[Game.state.intel.length - 1].prepared
                    ? '<button class="postit-prepare-btn" id="intel-prepare">🛡️ Prepara Contromossa (1 PA, €20)</button>'
                    : '<span class="postit-prepared">✅ Preparato</span>'}
            </div>
        `;
        desk.appendChild(postit);

        // Bind prepare button
        const prepBtn = postit.querySelector('#intel-prepare');
        if (prepBtn) {
            prepBtn.addEventListener('click', () => {
                this.prepareCountermeasure(Game.state.intel.length - 1);
            });
        }

        // Auto-dismiss after 2 time advances
        Game.on('time-advance', function dismiss() {
            if (postit.parentNode) postit.remove();
            Game.listeners['time-advance'] = Game.listeners['time-advance'].filter(fn => fn !== dismiss);
        });
    },

    refreshPostIts() {
        const desk = document.getElementById('desk');
        if (!desk) return;
        desk.querySelectorAll('.intel-postit').forEach(p => {
            const prepBtn = p.querySelector('#intel-prepare');
            if (prepBtn) {
                prepBtn.outerHTML = '<span class="postit-prepared">✅ Preparato</span>';
            }
        });
    },

    // Get active (unused) intel count for badge
    getActiveCount() {
        return (Game.state.intel || []).filter(i => !i.used && !i.prepared).length;
    },
};
