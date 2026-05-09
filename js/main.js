document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // Export/Import anche dal menu Opzioni
    const optExportBtn = document.getElementById('opt-export');
    if (optExportBtn) {
        optExportBtn.addEventListener('click', () => {
            try {
                const saveData = JSON.stringify(Game.state, null, 2);
                const blob = new Blob([saveData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'scrivania_save.json';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            } catch (e) {
                alert('Errore durante l\'esportazione del salvataggio.');
            }
        });
    }
    const optImportBtn = document.getElementById('opt-import');
    const optImportInput = document.getElementById('opt-import-file');
    if (optImportBtn && optImportInput) {
        optImportBtn.addEventListener('click', () => optImportInput.click());
        optImportInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (typeof data !== 'object' || !data.character) throw new Error('Formato non valido');
                    localStorage.setItem('scrivaniaDelPotere_save', JSON.stringify(data));
                    alert('Salvataggio importato! Ricarica la pagina per continuare.');
                } catch (err) {
                    alert('Errore: file di salvataggio non valido.');
                }
            };
            reader.readAsText(file);
        });
    }

    /* ----- Screen Management ----- */
    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('active');
    }

    const STORAGE = {
        accounts: 'pop_accounts_v1',
        session: 'pop_session_v1',
        legacySave: 'scrivaniaDelPotere_save',
        pendingLoad: 'pop_pending_load_v1',
    };

    const DLC_CATALOG = [
        {
            id: 'dlc_stato_diritto_crimine',
            title: 'Stato di Diritto vs Maestri del Crimine',
            desc: 'Indagini, processi, corruzione istituzionale e conseguenze legali multilivello.',
        },
        {
            id: 'dlc_elezioni_globali_europa',
            title: 'Elezioni Globali - Europa',
            desc: 'Nuove nazioni, sistemi elettorali differenti e scalata verso istituzioni europee.',
        },
        {
            id: 'dlc_media_infodemia',
            title: 'Media e Infodemia',
            desc: 'Redazioni schierate, viralita, disinformazione e trading di scoop politici.',
        },
        {
            id: 'dlc_storia_italia',
            title: 'Storia d\'Italia - Epoca Specifica',
            desc: 'Campagne storiche con eventi contestuali, vincoli reali e modalita sandbox storico.',
        },
        {
            id: 'dlc_geopolitica_diplomazia',
            title: 'Mondo Globale - Geopolitica e Diplomazia',
            desc: 'Blocchi, trattati, crisi internazionali e impatti su economia, reputazione e stabilita.',
        },
    ];

    function nowIso() { return new Date().toISOString(); }

    function loadAccounts() {
        try {
            const raw = localStorage.getItem(STORAGE.accounts);
            const list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list : [];
        } catch (_) {
            return [];
        }
    }

    function saveAccounts(accounts) {
        localStorage.setItem(STORAGE.accounts, JSON.stringify(accounts || []));
    }

    function getSession() {
        try {
            const raw = localStorage.getItem(STORAGE.session);
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    }

    function setSession(session) {
        if (!session) localStorage.removeItem(STORAGE.session);
        else localStorage.setItem(STORAGE.session, JSON.stringify(session));
    }

    function hashPassword(input) {
        return btoa(unescape(encodeURIComponent(`pop:${String(input || '')}`)));
    }

    function getCurrentUser() {
        const s = getSession();
        if (!s || !s.userId) return null;
        return loadAccounts().find(a => a.id === s.userId) || null;
    }

    function updateCurrentUser(mutator) {
        const s = getSession();
        if (!s || !s.userId) return null;
        const accounts = loadAccounts();
        const idx = accounts.findIndex(a => a.id === s.userId);
        if (idx < 0) return null;
        mutator(accounts[idx]);
        saveAccounts(accounts);
        return accounts[idx];
    }

    function ensureCampaignForSession(mode) {
        const s = getSession();
        if (!s || !s.userId) return null;
        let campaignId = null;
        updateCurrentUser((user) => {
            if (!Array.isArray(user.campaigns)) user.campaigns = [];
            campaignId = `cmp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const labelMode = mode === 'sandbox' ? 'Sandbox' : 'Campagna';
            user.campaigns.unshift({
                id: campaignId,
                name: `${labelMode} ${new Date().toLocaleDateString('it-IT')}`,
                mode,
                createdAt: nowIso(),
                lastPlayedAt: nowIso(),
                saves: [],
            });
            if (!user.dlcState) user.dlcState = {};
        });
        if (!campaignId) return null;
        setSession({ ...s, currentCampaignId: campaignId, selectedMode: mode });
        return campaignId;
    }

    function persistCurrentSave(label) {
        const s = getSession();
        if (!s || !s.userId || !s.currentCampaignId) return;
        if (!Game || !Game.state || !Game.state.character) return;
        try {
            const snapshot = JSON.parse(JSON.stringify(Game.state));
            localStorage.setItem(STORAGE.legacySave, JSON.stringify(snapshot));
            updateCurrentUser((user) => {
                const c = (user.campaigns || []).find(x => x.id === s.currentCampaignId);
                if (!c) return;
                if (!Array.isArray(c.saves)) c.saves = [];
                const entry = {
                    id: `save_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    slot: 'autosave',
                    label: label || 'Autosave',
                    state: snapshot,
                    updatedAt: nowIso(),
                };
                const old = c.saves.findIndex(x => x.slot === 'autosave');
                if (old >= 0) c.saves.splice(old, 1);
                c.saves.unshift(entry);
                c.lastPlayedAt = nowIso();
            });
        } catch (_) {
            // no-op
        }
    }

    function hydrateSaveState(savedState) {
        if (!savedState || typeof savedState !== 'object') return false;
        try {
            Object.assign(Game.state, savedState);

            if (Game.ensureDebtStructures) Game.ensureDebtStructures();
            if (Game.ensureAllianceStructures) Game.ensureAllianceStructures();
            if (Game.ensureDelayedStructures) Game.ensureDelayedStructures();
            if (Game.ensurePoliticalCareerStructures) Game.ensurePoliticalCareerStructures();
            if (Game.ensureSocialStructures) Game.ensureSocialStructures();
            if (Game.ensureElectionStructures) Game.ensureElectionStructures();

            try { if (HUD && HUD.refreshAll) HUD.refreshAll(); } catch (_) { /* no-op */ }
            try { if (HUD && HUD.updateHealthEffects) HUD.updateHealthEffects(); } catch (_) { /* no-op */ }
            try { if (Budget && Budget.refresh) Budget.refresh(); } catch (_) { /* no-op */ }
            try { if (DeskDecor && DeskDecor._render) DeskDecor._render(); } catch (_) { /* no-op */ }
            try { if (Advisor && Advisor.toggle) Advisor.toggle(Game.state.options?.advisorEnabled !== false); } catch (_) { /* no-op */ }
            try { if (Ticker && Ticker.toggle) Ticker.toggle(Game.state.options?.tickerEnabled !== false); } catch (_) { /* no-op */ }
            try { if (Options && Options._initToggles) Options._initToggles(); } catch (_) { /* no-op */ }

            try { Game.emit('game-loaded', { day: Game.state.day }); } catch (_) { /* no-op */ }
            return true;
        } catch (_) {
            return false;
        }
    }

    function applyCharacterModeSelection(mode) {
        const buttons = document.querySelectorAll('#gamemode-choices .stamp-btn[data-group="gamemode"]');
        buttons.forEach((b) => {
            const isSandbox = b.dataset.value === 'sandbox';
            const shouldSelect = mode === 'sandbox' ? isSandbox : !isSandbox;
            b.classList.toggle('selected', shouldSelect);
            b.classList.toggle('active', shouldSelect);
            b.setAttribute('aria-pressed', shouldSelect ? 'true' : 'false');
        });
    }

    function getCurrentUserActiveDlcIds() {
        const user = getCurrentUser();
        const state = (user && user.dlcState) || {};
        return Object.keys(state).filter((id) => !!state[id]);
    }

    function syncActiveDlcToGameState() {
        if (!Game || !Game.state) return;
        if (!Game.state.flags) Game.state.flags = {};
        Game.state.flags.activeDlc = getCurrentUserActiveDlcIds();
    }

    Game.on('screen-change', (d) => {
        if (typeof Scheduler !== 'undefined') {
            Scheduler.clearGroup('screen-temporary');
        }
        if (d.screen === 'desk') {
            showScreen('screen-desk');
        } else if (d.screen === 'gameover') {
            showGameOver();
        } else if (d.screen === 'letter') {
            showScreen('screen-letter');
        } else if (d.screen === 'mentor') {
            showScreen('screen-mentor');
        } else if (d.screen === 'cityselect') {
            showScreen('screen-cityselect');
        }
    });

    Game.on('gameover', (d) => {
        if (typeof Scheduler !== 'undefined') {
            Scheduler.clearAll();
        }
        document.getElementById('gameover-title').textContent = 'GAME OVER';
        document.getElementById('gameover-reason').textContent = d.reason || '';
        const epitaphEl = document.getElementById('gameover-epitaph');
        if (epitaphEl) epitaphEl.textContent = Diary.generateEpitaph();
        showGameOver();
    });

    /* ----- Victory ----- */
    Game.on('victory', (d) => {
        if (typeof Scheduler !== 'undefined') {
            Scheduler.clearAll();
        }
        document.getElementById('gameover-title').textContent = '🏆 VITTORIA!';
        document.getElementById('gameover-reason').textContent = d.reason || '';
        const epitaphEl = document.getElementById('gameover-epitaph');
        if (epitaphEl) epitaphEl.textContent = Diary.generateEpitaph();
        showGameOver();
    });

    /* ----- Game Over ----- */
    function showGameOver() {
        showScreen('screen-gameover');
        const st = Game.state;
        const el = document.getElementById('gameover-stats');
        if (!el) return;
        el.innerHTML = `
            <p><strong>${Game.esc(st.character.name)}</strong> — ${Game.esc(st.character.ideology)}</p>
            <p>📅 Giorni sopravvissuti: <strong>${st.day}</strong></p>
            <hr>
            <h4>Attributi</h4>
            <p>🧠 Intelligenza: ${st.attributes.intelligenza}</p>
            <p>🪞 Estetica: ${st.attributes.estetica}</p>
            <p>🗣️ Autenticità: ${st.attributes.autenticita}</p>
            <p>💪 Muscoli: ${st.attributes.muscoli}</p>
            <p>✨ Carisma: ${st.attributes.carisma}</p>
            <hr>
            <h4>Stato Finale</h4>
            <p>😴 Stanchezza: ${st.stats.stanchezza}/100</p>
            <p>😰 Stress: ${st.stats.stress}/100</p>
            <p>😊 Morale: ${st.stats.morale}/100</p>
            <p>❤️ Salute: ${st.stats.salute}/100</p>
            <p>📊 Reputazione Locale: ${st.reputazione}/100</p>
            <p>🌐 Reputazione Nazionale: ${st.reputazioneNazionale}/100</p>
            <p>💰 Soldi: ${st.money}€</p>
        `;
    }

    /* ----- Game Over Conditions (extra, beyond game.js checks) ----- */
    Game.on('stat-change', () => {
        if (Game.state.stats.stress >= 100 && Game.state.stats.morale <= 0) {
            Game.triggerGameOver('Lo stress e il morale azzerato ti hanno distrutto. Non puoi continuare.');
        }
    });

    /* ----- Time Advance Effects ----- */
    Game.on('time-advance', (d) => {
        // Entering a new time slot — decay effects
        if (d.timeOfDay === 0) {
            // New day: sleeping reset some fatigue (nerfed, was -30, now in game.js at -15)
            // Do NOT add extra regen here — all regen is in game.js advanceTime()
            Game.changeStat('morale', 3);
        }

        // Random stress from daily life
        if (Math.random() < 0.3) {
            Game.changeStat('stress', 5);
        }

        // Stanchezza accumulates lightly
        Game.changeStat('stanchezza', 3);

        // Health degrades if overly stressed and exhausted
        if (Game.state.stats.stanchezza > 80 && Game.state.stats.stress > 70) {
            Game.changeStat('salute', -5);
        }

        // Contacts decay if neglected
        if (Game.state.contacts) {
            Game.state.contacts.forEach(c => {
                c.relation = Math.max(0, c.relation - 1);
            });
        }

        // Partner tension rises over time
        if (Game.state.partner) {
            Game.state.partner.tension = Math.min(100, Game.state.partner.tension + 2);
            Game.state.partner.support = Math.max(0, Game.state.partner.support - 1);
        }

        // Regenerate tasks occasionally
        if (d.timeOfDay === 0 && Game.state.taskPools) {
            Game.state.taskPools = { work: [], political: [] };
        }
    });

    /* ----- Restart & Export/Import Save ----- */
    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => location.reload());
    }
    const exportBtn = document.getElementById('btn-export-save');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            try {
                const saveData = JSON.stringify(Game.state, null, 2);
                const blob = new Blob([saveData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'scrivania_save.json';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            } catch (e) {
                alert('Errore durante l\'esportazione del salvataggio.');
            }
        });
    }
    const importBtn = document.getElementById('btn-import-save');
    const importInput = document.getElementById('import-save-file');
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (typeof data !== 'object' || !data.character) throw new Error('Formato non valido');
                    localStorage.setItem('scrivaniaDelPotere_save', JSON.stringify(data));
                    alert('Salvataggio importato! Ricarica la pagina per continuare.');
                } catch (err) {
                    alert('Errore: file di salvataggio non valido.');
                }
            };
            reader.readAsText(file);
        });
    }

    /* ----- Init All Modules ----- */
    if (typeof GameMap !== 'undefined' && GameMap.init) {
        GameMap.init();
        if (typeof window !== 'undefined') window.GameMap = GameMap;
    }
    Character.init();
    if (typeof window !== 'undefined') window.Character = Character;
    Desk.init();
    Tasks.init();
    Phone.init();
    House.init();
    if (typeof Bank !== 'undefined') Bank.init();
    Territory.init();
    Stats.init();
    HUD.init();
    Events.init();
    Mafia.init();
    Dilemmas.init();
    Lifestyle.init();
    Budget.init();
    Agents.init();
    Factions.init();
    if (typeof Politics !== 'undefined') Politics.init();
    if (typeof Parties !== 'undefined') Parties.init();
    Intel.init();
    Favors.init();
    Diary.init();
    if (typeof Calendar !== 'undefined') Calendar.init();

    // New systems
    Compass.init();
    Ticker.init();
    Advisor.init();
    Timeline.init();
    Options.init();
    DeskDecor.init();
    Memento.init();
    if (typeof WorkTasks !== 'undefined') WorkTasks.init();
    if (typeof Tutorial !== 'undefined' && Tutorial.init) Tutorial.init();
    if (typeof Investments !== 'undefined') Investments.init();
    if (typeof DlcCore !== 'undefined' && DlcCore.init) DlcCore.init();
    if (typeof DeepState !== 'undefined' && DeepState.init) DeepState.init();
    if (typeof SocialCrisis !== 'undefined' && SocialCrisis.init) SocialCrisis.init();

    /* ----- Campaign Win/Loss ----- */
    Game.on('campaign-won', (d) => {
        if (typeof Scheduler !== 'undefined') Scheduler.clearAll();
        document.getElementById('gameover-title').textContent = '🏆 OBIETTIVO RAGGIUNTO!';
        document.getElementById('gameover-reason').textContent =
            `Hai completato la campagna "${(d.objective && d.objective.label) || ''}" con successo!`;
        const epitaphEl = document.getElementById('gameover-epitaph');
        if (epitaphEl) epitaphEl.textContent = 'La storia ricorderà il tuo successo.';
        showGameOver();
    });
    Game.on('campaign-lost', (d) => {
        if (typeof Scheduler !== 'undefined') Scheduler.clearAll();
        document.getElementById('gameover-title').textContent = '⏱ TEMPO SCADUTO';
        document.getElementById('gameover-reason').textContent =
            `Non hai completato l'obiettivo "${(d.objective && d.objective.label) || ''}" in tempo.`;
        const epitaphEl = document.getElementById('gameover-epitaph');
        if (epitaphEl) epitaphEl.textContent = 'La storia non dimentica i fallimenti.';
        showGameOver();
    });

    /* ----- Diary entries for achievements ----- */
    Game.on('career-promotion', (d) => {
        Game.addDiaryEntry(`Promosso a ${Game.getCareerLevel().label}!`, '🎉');
    });
    Game.on('housing-change', () => {
        Game.addDiaryEntry(`Nuovo alloggio: ${Game.state.housing.label}`, '🏠');
    });
    Game.on('city-change', () => {
        if (Game.state.city) Game.addDiaryEntry(`Trasferito a ${Game.state.city.name}`, '📍');
    });
    Game.on('task-completed', (d) => {
        if (d.type === 'political' && Math.random() < 0.3) {
            Game.addDiaryEntry('Impresa politica completata!', '🏛️');
        }
    });

    /* ----- Partner Profession Daily Bonuses ----- */
    Game.on('time-advance', (d) => {
        if (d.timeOfDay !== 0) return; // Only on new day (mattina)
        const partner = Game.state.partner;
        if (!partner || partner.isBurden) return;
        const effect = partner.professionEffect;
        if (effect === 'legalShield') {
            // Passive: scandal stress halved (applied in events.js when scandal hits)
        } else if (effect === 'socialBoost') {
            // Passive: applied in phone.js publishPost
        } else if (effect === 'eduBoost') {
            Game.changeAttribute('intelligenza', 2);
        } else if (effect === 'moneyBoost') {
            Game.changeMoney(20);
        }
    });

    /* ----- Eviction: cure when all rent is paid ----- */
    Game.on('bill-paid', () => {
        if (Game.state.flags.evicted) {
            const unpaidRent = Game.state.bills.filter(b => b.name === 'Affitto' && !b.paid);
            if (unpaidRent.length === 0) {
                Game.state.flags.evicted = false;
                Game.state.flags.consecutiveUnpaidRent = 0;
                Game.addWorkNotif('🏠 Casa recuperata!', 'Hai pagato gli arretrati. Torni a casa tua!', `Giorno ${Game.state.day}`);
            }
        }
    });

    function bootstrapNewGame() {
        Game.init();
        syncActiveDlcToGameState();
        if (typeof HUD !== 'undefined' && HUD.refreshAll) HUD.refreshAll();
    }

    const loginTab = document.getElementById('auth-tab-login');
    const registerTab = document.getElementById('auth-tab-register');
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const authMessage = document.getElementById('auth-message');
    const homeMessage = document.getElementById('home-message');
    const homeUsername = document.getElementById('home-username');
    const homeCampaignBtn = document.getElementById('home-campaign');
    const homeLoadCampaignBtn = document.getElementById('home-load-campaign');
    const homeDlcBtn = document.getElementById('home-dlc');
    const homeSettingsBtn = document.getElementById('home-settings');
    const homeExitBtn = document.getElementById('home-exit');
    const panelCampaign = document.getElementById('home-panel-campaign');
    const panelLoad = document.getElementById('home-panel-load');
    const panelDlc = document.getElementById('home-panel-dlc');
    const campaignTypeButtons = document.getElementById('campaign-type-buttons');
    const btnTypeSandbox = document.getElementById('campaign-type-sandbox');
    const btnTypeCampaign = document.getElementById('campaign-type-campaign');
    const btnTypeContinue = document.getElementById('campaign-type-continue');
    const btnTypeBack = document.getElementById('campaign-type-back');
    const homeCampaignList = document.getElementById('home-campaign-list');
    const homeDlcList = document.getElementById('home-dlc-list');

    let selectedCampaignType = null;

    function setAuthMessage(msg) {
        if (authMessage) authMessage.textContent = msg || '';
    }

    function setHomeMessage(msg) {
        if (homeMessage) homeMessage.textContent = msg || '';
    }

    function hideHomePanels() {
        panelCampaign && panelCampaign.classList.add('hidden');
        panelLoad && panelLoad.classList.add('hidden');
        panelDlc && panelDlc.classList.add('hidden');
    }

    function switchAuthTab(kind) {
        const login = kind !== 'register';
        loginTab && loginTab.classList.toggle('active', login);
        registerTab && registerTab.classList.toggle('active', !login);
        loginTab && loginTab.setAttribute('aria-selected', login ? 'true' : 'false');
        registerTab && registerTab.setAttribute('aria-selected', login ? 'false' : 'true');
        loginForm && loginForm.classList.toggle('hidden', !login);
        registerForm && registerForm.classList.toggle('hidden', login);
        setAuthMessage('');
    }

    function renderCampaignHomeButton() {
        const s = getSession();
        if (!homeCampaignBtn) return;
        if (!s || !s.selectedMode) {
            homeCampaignBtn.textContent = 'Campagna';
            return;
        }
        const mode = s.selectedMode === 'sandbox' ? 'Sandbox' : 'Campagna';
        homeCampaignBtn.textContent = `Avvia ${mode}`;
    }

    function renderCampaignList() {
        if (!homeCampaignList) return;
        const user = getCurrentUser();
        const campaigns = (user && user.campaigns) || [];
        if (!campaigns.length) {
            homeCampaignList.innerHTML = '<div class="home-list-item">Nessuna campagna salvata.</div>';
            return;
        }
        homeCampaignList.innerHTML = campaigns.map((c) => {
            const saves = Array.isArray(c.saves) ? c.saves : [];
            const savesHtml = saves.slice(0, 5).map((sv) => {
                const label = `${sv.label || 'Salvataggio'} • ${new Date(sv.updatedAt || nowIso()).toLocaleString('it-IT')}`;
                return `
                    <div class="home-list-item-actions">
                        <span class="home-list-tag">${label}</span>
                        <button class="home-action-btn" data-load-campaign="${c.id}" data-load-save="${sv.id}">Carica</button>
                    </div>
                `;
            }).join('') || '<div class="home-list-tag">Nessun salvataggio</div>';
            return `
                <div class="home-list-item">
                    <div><strong>${c.name}</strong></div>
                    <div class="home-list-tag">Modalità: ${c.mode === 'sandbox' ? 'Sandbox' : 'Campagna'} • Aggiornata: ${new Date(c.lastPlayedAt || c.createdAt).toLocaleString('it-IT')}</div>
                    ${savesHtml}
                </div>
            `;
        }).join('');
    }

    function loadCampaignSave(campaignId, saveId) {
        const userNow = getCurrentUser();
        const campaign = userNow && (userNow.campaigns || []).find(x => x.id === campaignId);
        const save = campaign && (campaign.saves || []).find(x => x.id === saveId);
        if (!save || !save.state) return;

        bootstrapNewGame();
        localStorage.setItem(STORAGE.legacySave, JSON.stringify(save.state));
        if (hydrateSaveState(save.state)) {
            syncActiveDlcToGameState();
            const s = getSession() || {};
            setSession({ ...s, currentCampaignId: campaignId, selectedMode: campaign.mode || s.selectedMode || 'sandbox' });
            showScreen('screen-desk');
            Game.emit('game-started', {
                cityId: Game.state.city && Game.state.city.id,
                nationId: Game.state.nation && Game.state.nation.id,
            });
            HUD.refreshAll();
            setHomeMessage('Campagna caricata con successo.');
        } else {
            localStorage.setItem(STORAGE.pendingLoad, JSON.stringify({ campaignId, saveId }));
            location.reload();
        }
    }

    function renderDlcList() {
        if (!homeDlcList) return;
        const user = getCurrentUser();
        if (!user) { homeDlcList.innerHTML = ''; return; }
        if (!user.dlcState) user.dlcState = {};

        homeDlcList.innerHTML = DLC_CATALOG.map((d) => {
            const active = !!user.dlcState[d.id];
            return `
                <div class="home-list-item">
                    <div><strong>${d.title}</strong></div>
                    <div class="home-list-tag">${d.desc}</div>
                    <div class="home-list-item-actions">
                        <span class="home-list-tag">Stato: ${active ? 'Attivo' : 'Disattivato'}</span>
                        <button class="home-action-btn" data-dlc-id="${d.id}">${active ? 'Disattiva' : 'Attiva'}</button>
                    </div>
                </div>
            `;
        }).join('');

        homeDlcList.querySelectorAll('[data-dlc-id]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-dlc-id');
                updateCurrentUser((u) => {
                    if (!u.dlcState) u.dlcState = {};
                    u.dlcState[id] = !u.dlcState[id];
                });
                renderDlcList();
                setHomeMessage('Stato DLC aggiornato.');
            });
        });
    }

    function showHome() {
        const user = getCurrentUser();
        if (!user) {
            showScreen('screen-login');
            return;
        }
        hideHomePanels();
        if (campaignTypeButtons) campaignTypeButtons.classList.remove('hidden');
        selectedCampaignType = null;
        btnTypeContinue && (btnTypeContinue.disabled = true);
        btnTypeSandbox && btnTypeSandbox.classList.remove('selected');
        btnTypeCampaign && btnTypeCampaign.classList.remove('selected');
        if (homeUsername) homeUsername.textContent = user.username;
        renderCampaignHomeButton();
        setHomeMessage('');
        showScreen('screen-home');
    }

    function launchNewCampaignFromSelection() {
        const s = getSession();
        if (!s || !s.selectedMode) return;
        ensureCampaignForSession(s.selectedMode);
        localStorage.removeItem(STORAGE.legacySave);
        bootstrapNewGame();
        applyCharacterModeSelection(s.selectedMode);
        setHomeMessage('Campagna pronta. Completa la scheda personaggio.');
        showScreen('screen-character');
    }

    // Hooks: account-aware autosave while preserving original save behavior
    const _baseDeskSave = Desk.saveGame.bind(Desk);
    Desk.saveGame = function patchedSave(silent) {
        _baseDeskSave(silent);
        persistCurrentSave('Autosave');
    };

    window.addEventListener('beforeunload', () => {
        try { Desk.saveGame(true); } catch (_) { /* no-op */ }
    });

    Game.on('new-day', () => {
        try { Desk.saveGame(true); } catch (_) { /* no-op */ }
    });

    // Auth UI events
    loginTab && loginTab.addEventListener('click', () => switchAuthTab('login'));
    registerTab && registerTab.addEventListener('click', () => switchAuthTab('register'));

    loginForm && loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = String(document.getElementById('auth-login-username').value || '').trim();
        const password = String(document.getElementById('auth-login-password').value || '');
        const account = loadAccounts().find(a => a.username.toLowerCase() === username.toLowerCase());
        if (!account || account.passwordHash !== hashPassword(password)) {
            setAuthMessage('Credenziali non valide.');
            return;
        }
        setSession({ userId: account.id, username: account.username, currentCampaignId: null, selectedMode: null });
        showHome();
    });

    registerForm && registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = String(document.getElementById('auth-register-username').value || '').trim();
        const email = String(document.getElementById('auth-register-email').value || '').trim();
        const password = String(document.getElementById('auth-register-password').value || '');
        if (!username || !email || password.length < 4) {
            setAuthMessage('Compila tutti i campi. Password minima: 4 caratteri.');
            return;
        }
        const accounts = loadAccounts();
        if (accounts.some(a => a.username.toLowerCase() === username.toLowerCase())) {
            setAuthMessage('Username già in uso.');
            return;
        }
        const account = {
            id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            username,
            email,
            passwordHash: hashPassword(password),
            createdAt: nowIso(),
            campaigns: [],
            dlcState: {},
        };
        accounts.push(account);
        saveAccounts(accounts);
        setSession({ userId: account.id, username: account.username, currentCampaignId: null, selectedMode: null });
        showHome();
    });

    homeCampaignBtn && homeCampaignBtn.addEventListener('click', () => {
        const s = getSession();
        if (s && s.selectedMode) {
            launchNewCampaignFromSelection();
            return;
        }
        hideHomePanels();
        panelCampaign && panelCampaign.classList.remove('hidden');
    });

    const selectCampaignType = (mode) => {
        selectedCampaignType = mode;
        btnTypeSandbox && btnTypeSandbox.classList.toggle('selected', mode === 'sandbox');
        btnTypeCampaign && btnTypeCampaign.classList.toggle('selected', mode === 'campaign');
        if (btnTypeContinue) btnTypeContinue.disabled = false;
    };

    btnTypeSandbox && btnTypeSandbox.addEventListener('click', () => selectCampaignType('sandbox'));
    btnTypeCampaign && btnTypeCampaign.addEventListener('click', () => selectCampaignType('campaign'));

    btnTypeContinue && btnTypeContinue.addEventListener('click', () => {
        if (!selectedCampaignType) return;
        const s = getSession();
        if (!s) return;
        setSession({ ...s, selectedMode: selectedCampaignType });
        if (campaignTypeButtons) campaignTypeButtons.classList.add('hidden');
        hideHomePanels();
        renderCampaignHomeButton();
        setHomeMessage(`Modalità ${selectedCampaignType === 'sandbox' ? 'Sandbox' : 'Campagna'} selezionata.`);
    });

    btnTypeBack && btnTypeBack.addEventListener('click', () => {
        hideHomePanels();
    });

    homeLoadCampaignBtn && homeLoadCampaignBtn.addEventListener('click', () => {
        hideHomePanels();
        renderCampaignList();
        panelLoad && panelLoad.classList.remove('hidden');
    });

    homeCampaignList && homeCampaignList.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-load-save]');
        if (!btn) return;
        loadCampaignSave(btn.getAttribute('data-load-campaign'), btn.getAttribute('data-load-save'));
    });

    document.getElementById('home-load-back')?.addEventListener('click', () => {
        hideHomePanels();
    });

    homeDlcBtn && homeDlcBtn.addEventListener('click', () => {
        hideHomePanels();
        renderDlcList();
        panelDlc && panelDlc.classList.remove('hidden');
    });

    document.getElementById('home-dlc-back')?.addEventListener('click', () => {
        hideHomePanels();
    });

    homeSettingsBtn && homeSettingsBtn.addEventListener('click', () => {
        if (typeof Options !== 'undefined') {
            Options.show();
            setHomeMessage('Impostazioni aperte.');
        }
    });

    homeExitBtn && homeExitBtn.addEventListener('click', () => {
        setSession(null);
        localStorage.removeItem(STORAGE.pendingLoad);
        switchAuthTab('login');
        setAuthMessage('Sessione chiusa.');
        showScreen('screen-login');
    });

    // Initial app entrypoint: session -> home, else login
    const pendingLoadRaw = localStorage.getItem(STORAGE.pendingLoad);
    if (pendingLoadRaw) {
        try {
            const pending = JSON.parse(pendingLoadRaw);
            const user = getCurrentUser();
            const campaign = user && (user.campaigns || []).find(c => c.id === pending.campaignId);
            const save = campaign && (campaign.saves || []).find(sv => sv.id === pending.saveId);
            if (save && save.state) {
                bootstrapNewGame();
                if (hydrateSaveState(save.state)) {
                    syncActiveDlcToGameState();
                    const s = getSession() || {};
                    setSession({ ...s, currentCampaignId: campaign.id, selectedMode: campaign.mode || s.selectedMode || 'sandbox' });
                    showScreen('screen-desk');
                    Game.emit('game-started', {
                        cityId: Game.state.city && Game.state.city.id,
                        nationId: Game.state.nation && Game.state.nation.id,
                    });
                    HUD.refreshAll();
                    localStorage.removeItem(STORAGE.pendingLoad);
                    return;
                }
            }
        } catch (_) {
            // no-op
        }
        localStorage.removeItem(STORAGE.pendingLoad);
    }

    if (getCurrentUser()) {
        showHome();
    } else {
        switchAuthTab('login');
        showScreen('screen-login');
    }
});
