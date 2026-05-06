/* ============================================
   DESK — Main Desktop Controller (v2)
   ============================================ */

const Desk = {
    panels: {},
    _initialized: false,
    _autosaveTick: 0,
    _phoneClockInterval: null,

    init() {
        if (this._initialized) return;
        this._initialized = true;

        this.panels = {
            phone: document.getElementById('panel-phone'),
            tasks: document.getElementById('panel-tasks'),
            house: document.getElementById('panel-house'),
            stats: document.getElementById('panel-stats'),
        };

        document.getElementById('item-phone').addEventListener('click', () => this.openPanel('phone'));
        document.getElementById('item-tasks').addEventListener('click', () => this.openPanel('tasks'));
        document.getElementById('item-house').addEventListener('click', () => this.openPanel('house'));
        document.getElementById('item-stats').addEventListener('click', () => this.openPanel('stats'));


        document.getElementById('phone-close').addEventListener('click', () => this.closePanel('phone'));
        document.getElementById('tasks-close').addEventListener('click', () => this.closePanel('tasks'));
        document.getElementById('house-close').addEventListener('click', () => this.closePanel('house'));
        document.getElementById('stats-close').addEventListener('click', () => this.closePanel('stats'));


        document.getElementById('btn-advance-day').addEventListener('click', () => {
            Game.advanceTime();
        });

        document.getElementById('screen-desk').addEventListener('click', (e) => {
            if (e.target.id === 'screen-desk' || e.target.id === 'desk') {
                this.closeAllPanels();
            }
        });

        // Coffee cup consumable
        const coffeeCup = document.querySelector('.desk-coffeecup');
        if (coffeeCup) {
            coffeeCup.addEventListener('click', (e) => {
                e.stopPropagation();
                this.drinkCoffee();
            });
        }

        // Random rotations for desk items
        this.applyRandomRotations();

        // Update coffee display
        Game.on('coffee-update', () => this.updateCoffeeDisplay());
        Game.on('time-advance', () => this.updateCoffeeDisplay());

        // Cork board update on phone open (relazioni tab)
        Game.on('panel-open', (data) => {
            if (data.panel === 'phone') this.renderCorkBoard();
        });

        // Silent autosave every 2 time slots and at each new morning
        Game.on('time-advance', (d) => {
            this._autosaveTick++;
            if (d.timeOfDay === 0 || this._autosaveTick % 2 === 0) {
                this.saveGame(true);
            }
        });

        this.updatePhoneTime();
        this.updateCoffeeDisplay();
        if (typeof Scheduler !== 'undefined') {
            this._phoneClockInterval = Scheduler.interval(() => this.updatePhoneTime(), 60000, { group: 'desk', label: 'phone-clock' });
        } else {
            setInterval(() => this.updatePhoneTime(), 60000);
        }

        // ESC key: close panels, or open options menu
        document.addEventListener('keydown', (e) => {
            // Ignore when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

            // Only work on desk screen
            const deskScreen = document.getElementById('screen-desk');
            if (!deskScreen || !deskScreen.classList.contains('active')) return;

            // If options menu is open, let it handle keys
            if (typeof Options !== 'undefined' && Options.isVisible()) {
                if (e.key === 'Escape') return; // options.js handles this
                return;
            }

            // Budget overlay open? Ignore shortcuts
            const budgetOverlay = document.getElementById('budget-overlay');
            if (budgetOverlay && !budgetOverlay.classList.contains('hidden')) return;

            if (e.key === 'Escape') {
                const anyOpen = Object.values(this.panels).some(p => !p.classList.contains('hidden'));
                if (anyOpen) {
                    this.closeAllPanels();
                } else {
                    if (typeof Options !== 'undefined') {
                        Options.show();
                        e.stopImmediatePropagation();
                    } else {
                        this.saveGame();
                    }
                }
                return;
            }

            // Check which panel is open
            const phoneOpen = !this.panels.phone.classList.contains('hidden');
            const tasksOpen = !this.panels.tasks.classList.contains('hidden');
            const houseOpen = !this.panels.house.classList.contains('hidden');
            const statsOpen = !this.panels.stats.classList.contains('hidden');
            const anyPanelOpen = phoneOpen || tasksOpen || houseOpen || statsOpen;

            // === PHONE OPEN: number keys switch tabs ===
            if (phoneOpen && e.key >= '1' && e.key <= '9') {
                const tabs = document.querySelectorAll('.phone-tab');
                const idx = parseInt(e.key) - 1;
                if (idx < tabs.length) {
                    tabs[idx].click();
                    e.preventDefault();
                }
                return;
            }

            // === TASKS OPEN: number keys switch task tabs ===
            if (tasksOpen && e.key >= '1' && e.key <= '3') {
                const tabs = document.querySelectorAll('.task-tab');
                const idx = parseInt(e.key) - 1;
                if (idx < tabs.length) {
                    tabs[idx].click();
                    e.preventDefault();
                }
                return;
            }

            // === HOUSE OPEN: number keys switch house tabs ===
            if (houseOpen && e.key >= '1' && e.key <= '3') {
                const tabs = document.querySelectorAll('.house-tab');
                const idx = parseInt(e.key) - 1;
                if (idx < tabs.length) {
                    tabs[idx].click();
                    e.preventDefault();
                }
                return;
            }

            // === NO PANEL OPEN: desk shortcuts ===
            if (!anyPanelOpen) {
                switch (e.key) {
                    case '1': this.openPanel('phone'); e.preventDefault(); break;
                    case '2': this.openPanel('tasks'); e.preventDefault(); break;
                    case '3': this.openPanel('house'); e.preventDefault(); break;
                    case '4': this.openPanel('stats'); e.preventDefault(); break;
                    case ' ': // Space = advance time
                        e.preventDefault();
                        document.getElementById('btn-advance-day').click();
                        break;
                }
            }
        });
    },

    applyRandomRotations() {
        const items = document.querySelectorAll('.desk-item');
        items.forEach(item => {
            const angle = (Math.random() - 0.5) * 5; // ±2.5 degrees
            item.classList.add('rotated');
            item.style.transform = `rotate(${angle.toFixed(1)}deg)`;
        });
        // Slightly tilt the advance area too
        const advArea = document.getElementById('advance-day-area');
        if (advArea) {
            advArea.style.transform = `rotate(${((Math.random() - 0.5) * 2).toFixed(1)}deg)`;
        }
    },

    drinkCoffee() {
        const state = Game.state.coffee;
        if (state.uses <= 0) {
            HUD.showToast('☕ Caffettiera vuota: nessun caffè disponibile per questo giorno.');
            return;
        }

        if (typeof state.drankToday !== 'number') state.drankToday = 0;
        const usedBefore = state.drankToday;
        const effectiveness = usedBefore >= 2 ? 0.5 : 1.0;
        const fatigueReduction = Math.max(1, Math.round(8 * effectiveness));
        const stressAdd = Math.round(8 * effectiveness);
        const healthHit = -3;

        state.uses--;
        state.drankToday += 1;
        Game.changeStat('stanchezza', -fatigueReduction);
        Game.changeStat('stress', stressAdd);
        Game.changeStat('salute', healthHit);

        let apInfo = '';
        if (usedBefore === 0) {
            const cap = Game.getActionPointCap ? Game.getActionPointCap() : 3;
            const oldAp = Game.state.actionPoints || 0;
            Game.state.actionPoints = Math.min(cap, oldAp + 1);
            if (Game.state.actionPoints !== oldAp) {
                Game.emit('ap-change', { ap: Game.state.actionPoints });
                apInfo = ', +1 PA';
            }
        }

        Game.addWorkNotif('☕ Caffè', `Hai bevuto un caffè! Stanchezza -${fatigueReduction}, Stress +${stressAdd}, Salute ${healthHit}${apInfo}.`, `Giorno ${Game.state.day}`);

        // Sip animation & sound
        const cup = document.querySelector('.desk-coffeecup');
        if (cup) {
            cup.classList.add('sipping');
            if (typeof Scheduler !== 'undefined') {
                Scheduler.timeout(() => cup.classList.remove('sipping'), 500, { group: 'desk', label: 'coffee-animation' });
            } else {
                setTimeout(() => cup.classList.remove('sipping'), 500);
            }
        }
        if (typeof Audio !== 'undefined' && Audio.playSip) Audio.playSip();
        this.updateCoffeeDisplay();
        Game.emit('coffee-update', { uses: state.uses });
    },

    updateCoffeeDisplay() {
        const cup = document.querySelector('.desk-coffeecup');
        if (!cup) return;
        const uses = Game.state.coffee.uses;
        cup.classList.toggle('empty', uses <= 0);
        // Show uses count
        let label = cup.querySelector('.coffee-uses');
        if (!label) {
            label = document.createElement('span');
            label.className = 'coffee-uses';
            cup.appendChild(label);
        }
        label.textContent = uses > 0 ? `${uses}/${Game.state.coffee.maxPerDay}` : 'vuota';
    },

    openPanel(name) {
        // Check phone lockout
        if (name === 'phone' && Game.state.flags.phoneLocked) {
            HUD.showToast('📵 Niente internet! Paga le bollette scadute.');
            return;
        }

        Object.keys(this.panels).forEach(k => {
            if (k !== name) this.panels[k].classList.add('hidden');
        });
        this.panels[name].classList.remove('hidden');
        Game.emit('panel-open', { panel: name });

        // Paper shuffle sound
        if (typeof Audio !== 'undefined' && Audio.playPaperShuffle) Audio.playPaperShuffle();
    },

    closePanel(name) {
        this.panels[name].classList.add('hidden');
    },

    closeAllPanels() {
        Object.values(this.panels).forEach(p => p.classList.add('hidden'));
    },

    updatePhoneTime() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const time = `${h}:${m}`;
        const el = document.getElementById('phone-time-preview');
        if (el) el.textContent = time;
        const clock = document.getElementById('phone-clock');
        if (clock) clock.textContent = time;
    },

    // ====== SAVE / LOAD ======
    saveGame(silent) {
        try {
            const saveData = JSON.stringify(Game.state);
            localStorage.setItem('scrivaniaDelPotere_save', saveData);
            if (!silent) this.showSaveToast('💾 Partita salvata!');
        } catch (e) {
            if (!silent) this.showSaveToast('❌ Errore nel salvataggio.');
        }
    },

    loadGame() {
        try {
            const raw = localStorage.getItem('scrivaniaDelPotere_save');
            if (!raw) return false;
            const saved = JSON.parse(raw);
            // Restore state
            Object.assign(Game.state, saved);
            if (Game.ensureDebtStructures) Game.ensureDebtStructures();
            if (Game.ensureAllianceStructures) Game.ensureAllianceStructures();
            if (Game.ensureDelayedStructures) Game.ensureDelayedStructures();
            if (Game.ensurePoliticalCareerStructures) Game.ensurePoliticalCareerStructures();
            if (Game.ensureSocialStructures) Game.ensureSocialStructures();
            if (Game.ensureElectionStructures) Game.ensureElectionStructures();
            if (Array.isArray(Game.state.contacts)) {
                Game.state.contacts.forEach(c => {
                    if (typeof c.relation !== 'number') c.relation = 40;
                    c.relation = Math.max(0, Math.min(100, c.relation));
                    if (typeof c.loyalty !== 'number') c.loyalty = 50;
                    c.loyalty = Math.max(0, Math.min(100, c.loyalty));
                });
            }
            // Refresh core UI
            HUD.refreshAll();
            HUD.updateHealthEffects();
            if (typeof Budget !== 'undefined') Budget.refresh();
            // Restore new systems
            if (typeof DeskDecor !== 'undefined') DeskDecor._render();
            if (typeof Advisor !== 'undefined') Advisor.toggle(Game.state.options?.advisorEnabled !== false);
            if (typeof Ticker !== 'undefined') Ticker.toggle(Game.state.options?.tickerEnabled !== false);
            if (typeof Options !== 'undefined') Options._initToggles();
            Game.emit('game-loaded', { day: Game.state.day });
            return true;
        } catch (e) {
            return false;
        }
    },

    showSaveToast(msg) {
        let toast = document.getElementById('save-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'save-toast';
            toast.className = 'save-toast hidden';
            document.getElementById('screen-desk').appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.remove('hidden');
        if (this._saveToastTimer) {
            if (typeof Scheduler !== 'undefined') Scheduler.clear(this._saveToastTimer);
            else clearTimeout(this._saveToastTimer);
        }
        if (typeof Scheduler !== 'undefined') {
            this._saveToastTimer = Scheduler.timeout(() => toast.classList.add('hidden'), 2000, { group: 'desk', label: 'save-toast' });
        } else {
            this._saveToastTimer = setTimeout(() => toast.classList.add('hidden'), 2000);
        }
    },

    // ====== CORK BOARD — Relationship Network (in Phone) ======
    renderCorkBoard() {
        const container = document.getElementById('relazioni-content');
        if (!container) return;

        const contacts = Game.state.contacts;
        const partner = Game.state.partner;
        const playerName = Game.state.character.name || 'Tu';
        const playerAvatar = Game.state.character.avatar || '🫵';

        let html = `<div class="cork-center">
            <div class="cork-node cork-player">
                <span class="cork-avatar">${playerAvatar}</span>
                <span class="cork-name">${this.esc(playerName)}</span>
            </div>
        </div>`;

        html += '<div class="cork-connections">';

        contacts.forEach((c, i) => {
            const strength = c.relation > 60 ? 'strong' : (c.relation > 30 ? 'medium' : 'weak');
            const favoriteClass = c.favorite ? 'cork-favorite' : '';
            const betrayedClass = c.betrayed ? 'cork-betrayed' : '';
            html += `
                <div class="cork-node cork-contact ${strength} ${favoriteClass} ${betrayedClass}" style="--i:${i}; --total:${contacts.length}">
                    <span class="cork-avatar">${c.emoji}</span>
                    <span class="cork-name">${this.esc(c.name.split(' ')[0])}</span>
                    <span class="cork-relation">${c.relation}%</span>
                    <div class="cork-string ${strength}"></div>
                </div>
            `;
        });

        if (partner) {
            html += `
                <div class="cork-node cork-partner">
                    <span class="cork-avatar">❤️</span>
                    <span class="cork-name">${this.esc(partner.name.split(' ')[0])}</span>
                    <span class="cork-relation">${partner.support}% supporto</span>
                    <div class="cork-string strong"></div>
                </div>
            `;
        }

        html += '</div>';

        // Power level indicator
        const avgRelation = contacts.length > 0
            ? Math.round(contacts.reduce((s, c) => s + c.relation, 0) / contacts.length) : 0;
        const favCount = contacts.filter(c => c.favorite).length;
        html += `
            <div class="cork-summary">
                <div class="cork-stat">📊 Relazione media: <strong>${avgRelation}%</strong></div>
                <div class="cork-stat">⭐ Preferiti: <strong>${favCount}</strong></div>
                <div class="cork-stat">👥 Contatti: <strong>${contacts.length}</strong></div>
                ${partner ? `<div class="cork-stat">❤️ Partner: <strong>${this.esc(partner.name)}</strong> ${partner.isBurden ? '(Fardello)' : '(Asset)'}</div>` : ''}
            </div>
        `;

        container.innerHTML = html;
    },

    esc(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },
};
