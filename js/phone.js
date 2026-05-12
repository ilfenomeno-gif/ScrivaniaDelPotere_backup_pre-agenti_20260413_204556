/* ============================================
   PHONE — Smartphone Interface (v2.1)
   ============================================ */

const Phone = {
    _initialized: false,
    _activeApp: null,
    _navTransitionTimer: null,

    clearNavTransitionTimer() {
        if (this._navTransitionTimer) {
            clearTimeout(this._navTransitionTimer);
            this._navTransitionTimer = null;
        }
    },

    clearNavTransitionClasses() {
        const home = document.getElementById('phone-home');
        const content = document.querySelector('#panel-phone .phone-content');
        [home, content].forEach((el) => {
            if (!el || !el.classList) return;
            el.classList.remove('phone-slide-out-left', 'phone-slide-out-right', 'phone-slide-in-left', 'phone-slide-in-right');
        });
    },

    replayHomeAnimation() {
        const home = document.getElementById('phone-home');
        if (!home) return;
        home.classList.remove('entering');
        requestAnimationFrame(() => home.classList.add('entering'));
    },

    init() {
        if (this._initialized) return;
        this._initialized = true;

        document.querySelectorAll('.phone-tab').forEach(tab => {
            if (!tab) return;
            tab.addEventListener('click', () => this.openApp(tab.dataset.tab));
        });

        this.initAppLauncher();

        const appBack = document.getElementById('phone-app-back');
        if (appBack) appBack.addEventListener('click', () => this.goPhoneHome());

        const contactsHamburger = document.getElementById('contacts-hamburger');
        if (contactsHamburger) {
            contactsHamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openContactsOverlay();
            });
        }

        const contactsClose = document.getElementById('contacts-overlay-close');
        if (contactsClose) {
            contactsClose.addEventListener('click', () => this.closeContactsOverlay());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this._activeApp) {
                    this.goPhoneHome();
                    return;
                }
                const overlay = document.getElementById('contacts-overlay-panel');
                if (overlay && !overlay.classList.contains('hidden')) {
                    this.closeContactsOverlay();
                }
            }
        });

        Game.on('panel-open', (data) => {
            if (data.panel === 'phone') {
                // Opening the phone acknowledges and clears visual push notifications.
                document.querySelectorAll('.phone-push-notif').forEach(n => n.remove());
                this.refresh();
                this.goPhoneHome();
            }
        });
        Game.on('stat-change', () => this.updateRelationBar());
        Game.on('time-advance', () => {
            document.querySelectorAll('.phone-push-notif').forEach(n => n.remove());
            this.generateWorkMessages();
            this.refresh();
        });
        Game.on('urgent-message', (msg) => this.onUrgentMessage(msg));

        Game.on('phone-ap-change', () => this.updatePhoneAPDots());

        this.initWorkSubTabs();
        this.initTerritorioSubTabs();
        this.initSocialBuzzButtons();
        this.initElectionButtons();
    },

    refresh() {
        this.closeContactsOverlay();
        this.normalizeContacts();
        const activeTab = document.querySelector('.phone-tab-content.active');
        const scrollPos = activeTab && typeof activeTab.scrollTop === 'number' ? activeTab.scrollTop : 0;
        this.renderContacts();
        this.renderPartner();
        this.renderWorkNotifs();
        this.renderWorkMessages();
        this.renderFavori();
        this.renderSocial();
        this.renderSocialTrend();
        this.renderElectionHQ();
        this.renderUrgenti();
        this.renderArchivio();
        this.renderPhoneTerritory();
        if (this._activeApp === 'politica') this.renderPolitica();
        if (typeof Factions !== 'undefined' && Factions.renderPhoneCommittee) Factions.renderPhoneCommittee();
        this.updateBadge();
        this.updatePhoneAPDots();
        Desk.renderCorkBoard();
        if (activeTab && typeof activeTab.scrollTop === 'number') requestAnimationFrame(() => { activeTab.scrollTop = scrollPos; });
    },

    initAppLauncher() {
        document.querySelectorAll('.phone-app-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const app = btn.dataset.app;
                if (app === 'app_europalink' || app === 'app_parlamento_live' || app === 'app_borsa_europea') {
                    this.openDlcUtilityApp(app);
                    return;
                }
                if (app === 'more') {
                    const main = document.getElementById('phone-app-grid-main');
                    const more = document.getElementById('phone-app-grid-more');
                    if (main) main.classList.add('hidden');
                    if (more) more.classList.remove('hidden');
                    this.replayHomeAnimation();
                    return;
                }
                if (app === 'home') {
                    this.goPhoneHome();
                    return;
                }
                this.openApp(app);
            });
        });
    },

    openDlcUtilityApp(appId) {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        if (!active.includes('il_vecchio_mondo_expansion')) {
            Game.addUrgentMessage('Store DLC', 'Questa app richiede Il Vecchio Mondo Expansion attivo.', 'info');
            if (window.SR) SR.announce('App bloccata. Attiva prima Il Vecchio Mondo Expansion.', 'assertive');
            return;
        }

        if (appId === 'app_europalink') {
            Game.changeReputazione(2, 'nazionale');
            Game.addWorkNotif('🇪🇺 EuroLink', 'Nuovo canale diplomatico attivato: reputazione nazionale +2.', `Giorno ${Game.state.day}`);
            this.openApp('mondo');
            return;
        }

        if (appId === 'app_parlamento_live') {
            Game.changeStat('coherence', 2);
            Game.addWorkNotif('🎙️ Parlamento Live', 'Segui il dibattito europeo: coerenza +2.', `Giorno ${Game.state.day}`);
            this.openApp('politica');
            return;
        }

        if (appId === 'app_borsa_europea') {
            const gain = 30 + Math.floor(Math.random() * 80);
            Game.changeMoney(gain);
            Game.changeStat('stress', 2);
            Game.addWorkNotif('📈 Borsa Europea', `Operazione finanziaria chiusa: +€${gain}, stress +2.`, `Giorno ${Game.state.day}`);
            this.openApp('finanza');
        }
    },

    _activateTab(tabId) {
        this.closeContactsOverlay && this.closeContactsOverlay();
        document.querySelectorAll('.phone-tab').forEach(t => {
            if (t && t.classList) {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            }
        });
        document.querySelectorAll('.phone-tab-content').forEach(c => c && c.classList && c.classList.remove('active'));
        const tabBtn = document.querySelector(`.phone-tab[data-tab="${tabId}"]`);
        if (tabBtn && tabBtn.classList) {
            tabBtn.classList.add('active');
            tabBtn.setAttribute('aria-selected', 'true');
        }
        const content = document.getElementById(`tab-${tabId}`);
        if (content && content.classList) content.classList.add('active');

        if (tabId === 'mondo' && this.initTerritorioSubTabs) this.initTerritorioSubTabs();
        if (tabId === 'attivita' && this.initWorkSubTabs) this.initWorkSubTabs();
        if (tabId === 'profilo' && typeof Stats !== 'undefined') Stats.renderPhoneProfile();
        if (tabId === 'politica') {
            this.renderPolitica();
            setTimeout(() => { if (window.SR) SR._applyPoliticaARIA && SR._applyPoliticaARIA(); }, 200);
        }
        if (tabId === 'comitato' && typeof Factions !== 'undefined' && Factions.renderPhoneCommittee) Factions.renderPhoneCommittee();
        if (tabId === 'favori') {
            this.renderFavori && this.renderFavori();
            if (window.SR) SR.announce('Tab Favori attivata. Elenco favori e crediti disponibile.', 'polite');
        } else if (window.SR && tabBtn) {
            SR.announce(`Tab attiva: ${tabBtn.textContent.trim()}`, 'polite');
        }
        // Move SR focus to tab panel for screen readers (NVDA/JAWS)
        if (window.SR && SR.focusPhoneTabPanel) setTimeout(() => SR.focusPhoneTabPanel(tabId), 200);
    },

    openApp(tabId) {
        const home = document.getElementById('phone-home');
        const content = document.querySelector('#panel-phone .phone-content');
        const appBack = document.getElementById('phone-app-back');
        const title = document.querySelector('#panel-phone .phone-title');
        const reduceMotion = document.documentElement.classList.contains('reduce-motion');

        this.clearNavTransitionTimer();
        this.clearNavTransitionClasses();

        if (home) home.classList.remove('entering');
        if (content) content.classList.remove('hidden');
        if (appBack) appBack.classList.remove('hidden');
        if (title) {
            const labelMap = {
                friends: 'Contatti',
                social: 'Social',
                attivita: 'Attivita',
                mondo: 'Mondo',
                politica: 'Politica',
                comitato: 'Comitato',
                finanza: 'Finanza',
                partner: 'Vita',
            };
            title.textContent = labelMap[tabId] || 'SmartPolitica';
        }
        this._activeApp = tabId;
        this._activateTab(tabId);

        if (!home || !content || reduceMotion || home.classList.contains('hidden')) {
            if (home) home.classList.add('hidden');
            if (content) content.classList.remove('hidden');
            return;
        }

        home.classList.add('phone-slide-out-left');
        this._navTransitionTimer = setTimeout(() => {
            home.classList.add('hidden');
            home.classList.remove('phone-slide-out-left');
            content.classList.remove('hidden');
            content.classList.add('phone-slide-in-right');
            this._navTransitionTimer = setTimeout(() => {
                content.classList.remove('phone-slide-in-right');
                this._navTransitionTimer = null;
            }, 220);
        }, 180);
    },

    goPhoneHome() {
        const home = document.getElementById('phone-home');
        const content = document.querySelector('#panel-phone .phone-content');
        const appBack = document.getElementById('phone-app-back');
        const title = document.querySelector('#panel-phone .phone-title');
        const main = document.getElementById('phone-app-grid-main');
        const more = document.getElementById('phone-app-grid-more');
        const reduceMotion = document.documentElement.classList.contains('reduce-motion');

        this.clearNavTransitionTimer();
        this.clearNavTransitionClasses();

        if (appBack) appBack.classList.add('hidden');
        if (title) title.textContent = 'SmartPolitica';
        if (main) main.classList.remove('hidden');
        if (more) more.classList.add('hidden');

        this._activeApp = null;

        // Annuncia che si è tornati alla home del telefono
        if (window.SR) SR.announce('Home telefono. Premi Esc per chiudere il telefono.', 'polite');

        if (!home || !content || reduceMotion || content.classList.contains('hidden')) {
            if (home) home.classList.remove('hidden');
            if (content) content.classList.add('hidden');
            this.replayHomeAnimation();
            return;
        }

        content.classList.add('phone-slide-out-right');
        this._navTransitionTimer = setTimeout(() => {
            content.classList.add('hidden');
            content.classList.remove('phone-slide-out-right');
            home.classList.remove('hidden');
            home.classList.add('phone-slide-in-left');
            this.replayHomeAnimation();
            this._navTransitionTimer = setTimeout(() => {
                home.classList.remove('phone-slide-in-left');
                this._navTransitionTimer = null;
            }, 220);
        }, 180);
    },

    normalizeContacts() {
        const contacts = Game.state.contacts || [];
        contacts.forEach(contact => {
            if (typeof contact.relation !== 'number') contact.relation = 40;
            contact.relation = Math.max(0, Math.min(100, contact.relation));
            if (typeof contact.loyalty !== 'number') {
                contact.loyalty = Math.max(20, Math.round(contact.relation * 0.8));
            }
            contact.loyalty = Math.max(0, Math.min(100, contact.loyalty));
        });
    },

    updateRelationBar() {
        const contacts = Game.state.contacts;
        const avg = contacts.length > 0
            ? contacts.reduce((sum, c) => sum + c.relation, 0) / contacts.length : 50;
        const fill = document.getElementById('relation-global-fill');
        if (fill) fill.style.width = `${avg}%`;
    },

    getAllianceMeta(contact) {
        const role = String(contact.role || '').toLowerCase();
        if (/politic|assessor|consiglier|deputat|senator/.test(role)) {
            return { key: 'politico', label: '+15% efficacia task politici' };
        }
        if (/imprenditor|manager|industriale/.test(role)) {
            return { key: 'imprenditore', label: '+€15 per ogni task lavoro completato' };
        }
        if (/giornal|reporter|cronista/.test(role)) {
            return { key: 'giornalista', label: '+10 reputazione per ogni post social' };
        }
        if (/sindacal/.test(role)) {
            return { key: 'sindacalista', label: '-20% stanchezza da task lavoro' };
        }
        if (/pensionat/.test(role)) {
            return { key: 'pensionato', label: '+5 morale ogni mattina' };
        }
        if (/student|universitar/.test(role)) {
            return { key: 'studente', label: '+2 intelligenza permanente' };
        }
        if (/infermier|medic|oss/.test(role)) {
            return { key: 'infermiere', label: '+5 salute ogni giorno' };
        }
        if (/mafia|uomo d\'affari|totò|toto/.test(role) || contact.isMafia) {
            return { key: 'mafia', label: '+€50 da ogni task "ombra"' };
        }
        return { key: 'politico', label: '+15% efficacia task politici' };
    },

    getAllianceStatusText(contact) {
        if (contact.alliance && contact.alliance.active) {
            if (contact.alliance.expiresDay && contact.alliance.expiresDay >= Game.state.day) {
                return `ATTIVA ✅ (fino al giorno ${contact.alliance.expiresDay})`;
            }
            return 'ATTIVA ✅';
        }
        if (contact.alliance && contact.alliance.everFormed) return 'TERMINATA ❌';
        return 'NON ALLEATO';
    },

    getAllianceTypeCatalog(contact) {
        const role = String(contact && contact.role ? contact.role : '').toLowerCase();
        const preferred = /giornal|reporter|cronista/.test(role)
            ? 'media'
            : (/imprenditor|manager|industriale/.test(role)
                ? 'finanziaria'
                : (/sindacal/.test(role) ? 'sindacale' : 'elettorale'));

        return {
            preferred,
            types: {
                elettorale: {
                    id: 'elettorale',
                    label: 'Elettorale (+10% consenso elezioni)',
                    reqRelation: 70,
                    reqLoyalty: 60,
                    moneyCost: 30,
                    duration: 14,
                },
                finanziaria: {
                    id: 'finanziaria',
                    label: 'Finanziaria (+€20 task lavoro)',
                    reqRelation: 65,
                    reqLoyalty: 55,
                    moneyCost: 80,
                    duration: 10,
                },
                media: {
                    id: 'media',
                    label: 'Media (+12 reputazione per post)',
                    reqRelation: 60,
                    reqLoyalty: 50,
                    moneyCost: 50,
                    duration: 12,
                },
                sindacale: {
                    id: 'sindacale',
                    label: 'Sindacale (-25% stanchezza lavoro)',
                    reqRelation: 75,
                    reqLoyalty: 65,
                    moneyCost: 40,
                    duration: 16,
                },
            },
        };
    },

    getLocalizedIdeology(ideologyKey) {
        if (typeof Nations !== 'undefined' && Nations.getIdeologyLocalName) {
            const localized = Nations.getIdeologyLocalName(ideologyKey, Game.state.nation?.id);
            if (localized && localized !== ideologyKey) return localized;
        }

        const nationData = Game.state.nation?.data;
        if (!nationData || !nationData.ideologies) {
            // fallback all'italiano
            const italianMap = {
                'estrema-sinistra': 'Sinistra Radicale',
                'centro': 'Centro Liberale',
                'populista': 'Populista',
                'tecnocrate': 'Tecnocrate',
                'estrema-destra': 'Destra Sovranista'
            };
            return italianMap[ideologyKey] || ideologyKey;
        }
        return nationData.ideologies[ideologyKey].localName;
    },

    // ====== UNIFIED CONTACTS TAB (favorites first, then others) ======
    renderContacts() {
        this.updateContactsStats(Game.state.contacts || []);
    },

    buildContactItem(contact, isFavView) {
        const playerIdeology = Game.state.character.ideology;
        const neglected = contact.relation < 20;
        const noPA = !Game.hasPhoneActions(1);
        const sameIdeology = contact.ideology === playerIdeology;
        const stance = Game.getCoalitionStance(playerIdeology, contact.ideology);
        const canAlly = stance !== 'nemico';
        const allianceMeta = this.getAllianceMeta(contact);
        const allianceCatalog = this.getAllianceTypeCatalog(contact);
        const allianceActive = !!(contact.alliance && contact.alliance.active);
        const allianceEver = !!(contact.alliance && contact.alliance.everFormed);
        const allianceReady = !allianceActive && !allianceEver && canAlly && contact.relation >= 70 && contact.loyalty >= 60 && !contact.betrayed;
        const preferredAllianceType = allianceCatalog.preferred;
        const activeType = (contact.alliance && contact.alliance.typeId) || preferredAllianceType;
        const activeTypeMeta = allianceCatalog.types[activeType] || allianceCatalog.types.elettorale;
        const canRenew = allianceActive && contact.alliance.expiresDay > 0 && (contact.alliance.expiresDay - Game.state.day) <= 2;
        const localizedIdeology = this.getLocalizedIdeology(contact.ideology);

        const item = document.createElement('div');
        item.className = `contact-item ${contact.favorite ? 'contact-favorite' : ''} ${neglected ? 'neglected' : ''} ${contact.betrayed ? 'contact-betrayed' : ''} ${!canAlly ? 'contact-blocked' : ''}`;

        const IDEOLOGY_LABELS = {
            'populista': '📢 Populista', 'tecnocrate': '📊 Tecnocrate',
            'estrema-sinistra': '🚩 Sin. Radicale', 'estrema-destra': '🦅 Destra Sovr.',
            'centro': '⚖️ Centro Lib.'
        };
        const STANCE_LABELS = { 'amico': '🤝 Amico', 'possibile': '🔀 Possibile', 'diffidente': '😒 Diffidente', 'nemico': '🚫 Nemico' };
        const affinityText = sameIdeology ? '🤝 Affine' : (STANCE_LABELS[stance] || '🔀 Diverso');

        item.innerHTML = `
            <div class="contact-header-row">
                <div class="contact-avatar">${contact.emoji}</div>
                <div class="contact-info">
                    <div class="contact-name">
                        ${this.esc(contact.name)} ${contact.betrayed ? '⚠️' : ''}
                        <span class="contact-fav-btn" data-contact="${this.esc(contact.name)}">${contact.favorite ? '⭐' : '☆'}</span>
                    </div>
                    <div class="contact-status">${this.esc(contact.role)}</div>
                </div>
            </div>
            <div class="contact-profile">
                <span class="contact-ideology">${this.esc(localizedIdeology || IDEOLOGY_LABELS[contact.ideology] || contact.ideology)}</span>
                <span class="contact-affinity ${sameIdeology ? 'affine' : (canAlly ? 'diverso' : 'blocked')}">${affinityText}</span>
            </div>
            <div class="contact-bio">${this.esc(contact.bio || '')}</div>
            <div class="contact-loyalty-row">
                <span class="contact-loyalty-label">Fiducia:</span>
                <div class="contact-loyalty-bar"><div class="contact-loyalty-fill" style="width:${contact.loyalty}%"></div></div>
                <span class="contact-loyalty-val">${contact.loyalty}%</span>
            </div>
            <div class="contact-bar">
                <div class="contact-bar-fill" style="width: ${contact.relation}%"></div>
            </div>
            <div class="contact-actions">
                <button class="contact-action-btn contact-msg-btn" data-contact="${this.esc(contact.name)}" ${noPA || contact.betrayed || !canAlly ? 'disabled' : ''}
                    data-preview="1 📱 | Relazione +${sameIdeology ? 8 : 4} | ✨ Carisma +1">
                    💬 Messaggio <span class="phone-cost-badge">1 📱</span>
                </button>
                <button class="contact-action-btn contact-dinner-btn" data-contact="${this.esc(contact.name)}" ${noPA || contact.betrayed || !canAlly ? 'disabled' : ''}
                    data-preview="1 📱 | €25 | Relazione +${sameIdeology ? 25 : 15} | 😴+10 | 😊+8 | ✨+1">
                    🍽️ Cena <span class="phone-cost-badge">1 📱</span>
                </button>
                <button class="contact-action-btn contact-gift-btn" data-contact="${this.esc(contact.name)}" ${noPA || contact.relation < 40 ? 'disabled' : ''}
                    data-preview="1 📱 | €15 | Relazione +10 | Lealtà +5">
                    🎁 Regalo <span class="phone-cost-badge">1 📱</span>
                </button>
                <button class="contact-action-btn contact-tip-btn" data-contact="${this.esc(contact.name)}" ${noPA || !(/giornal|informator|analista/i.test(contact.role || '')) ? 'disabled' : ''}
                    data-preview="1 📱 | Possibile soffiata evento">
                    🕵️ Soffiata <span class="phone-cost-badge">1 📱</span>
                </button>
                <button class="contact-action-btn contact-betray-btn" data-contact="${this.esc(contact.name)}" ${contact.relation < 60 ? 'disabled' : ''}
                    data-preview="+€100 | Relazione -30 | Lealtà -40">
                    💔 Tradimento
                </button>
            </div>
            <div class="contact-alliance-box ${allianceActive ? 'active' : ''}">
                <div class="contact-alliance-title">🤝 ALLEANZA</div>
                <div class="contact-alliance-status">Stato: ${this.getAllianceStatusText(contact)}</div>
                ${allianceActive
                          ? `<div class="contact-alliance-bonus">Bonus: ${this.esc(contact.alliance.bonusLabel || activeTypeMeta.label || allianceMeta.label)}</div>
                              <div class="contact-alliance-req">Tipo: <strong>${this.esc((contact.alliance.typeId || 'elettorale').toUpperCase())}</strong></div>
                              ${canRenew ? `<button class="contact-action-btn contact-renew-ally-btn" data-contact="${this.esc(contact.name)}">🔁 Rinnova Alleanza</button>` : ''}
                              <button class="contact-action-btn contact-break-ally-btn" data-contact="${this.esc(contact.name)}">💔 Rompi Alleanza</button>`
                          : `<select class="contact-alliance-type" data-contact="${this.esc(contact.name)}">
                                     ${Object.values(allianceCatalog.types).map(t => `<option value="${this.esc(t.id)}" ${t.id === preferredAllianceType ? 'selected' : ''}>${this.esc(t.label)}</option>`).join('')}
                              </select>
                              <button class="contact-action-btn contact-ally-btn" data-contact="${this.esc(contact.name)}" ${(!allianceReady || noPA || !Game.hasActionPoints(1)) ? 'disabled' : ''}
                                     data-preview="1 📱 + 1 ⚡ | ${this.esc(allianceMeta.label)}">
                            🤝 Propici Alleanza <span class="phone-cost-badge">1 📱</span> <span class="task-ap-cost">1 ⚡</span>
                       </button>
                              <div class="contact-alliance-req">Richiede: Relazione alta, Lealtà alta, ideologia non nemica e budget firma.</div>`}
            </div>
        `;

        // Favorite toggle
        const favBtn = item.querySelector('.contact-fav-btn');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                contact.favorite = !contact.favorite;
                this.refresh();
            });
        }

        // Message action (1 phone action)
        const msgBtn = item.querySelector('.contact-msg-btn');
        if (msgBtn && !noPA && !contact.betrayed && canAlly) {
            msgBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sendMessage(contact);
            });
        }

        // Dinner action (1 phone action, costs money)
        const dinnerBtn = item.querySelector('.contact-dinner-btn');
        if (dinnerBtn && !noPA && !contact.betrayed && canAlly) {
            dinnerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.inviteToDinner(contact);
            });
        }

        const giftBtn = item.querySelector('.contact-gift-btn');
        if (giftBtn && !giftBtn.disabled) {
            giftBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.giftContact(contact);
            });
        }

        const allyBtn = item.querySelector('.contact-ally-btn');
        if (allyBtn && !allyBtn.disabled) {
            allyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const selector = item.querySelector('.contact-alliance-type');
                const chosenType = selector ? selector.value : null;
                this.formAlliance(contact, chosenType);
            });
        }

        const renewBtn = item.querySelector('.contact-renew-ally-btn');
        if (renewBtn) {
            renewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.renewAlliance(contact);
            });
        }

        const breakBtn = item.querySelector('.contact-break-ally-btn');
        if (breakBtn) {
            breakBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!Game.spendPhoneAction(1)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                Game.breakAlliance(contact, 'scelta personale');
                if (Game.evaluatePoliticalCareerPromotion) Game.evaluatePoliticalCareerPromotion();
                this.refresh();
            });
        }

        const tipBtn = item.querySelector('.contact-tip-btn');
        if (tipBtn && !tipBtn.disabled) {
            tipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.requestTip(contact);
            });
        }

        const betrayBtn = item.querySelector('.contact-betray-btn');
        if (betrayBtn && !betrayBtn.disabled) {
            betrayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.betrayContact(contact);
            });
        }

        return item;
    },

    sendMessage(contact) {
        if (!Game.spendPhoneAction(1)) {
            Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
            return;
        }
        const sameIdeology = contact.ideology === Game.state.character.ideology;
        const bonus = sameIdeology ? 8 : 4;
        contact.relation = Math.min(100, contact.relation + bonus);
        contact.loyalty = Math.min(100, contact.loyalty + 1);
        Game.changeAttribute('carisma', 1);
        if (typeof Agents !== 'undefined' && Agents.recordByContact) {
            Agents.recordByContact(contact, 'message', sameIdeology ? 8 : 4);
            if (Agents.syncAgentsToContacts) Agents.syncAgentsToContacts();
        }
        Game.addWorkNotif('💬 Messaggio', `Hai scritto a ${contact.name}. Relazione +${bonus}, +1 Carisma.`, `Giorno ${Game.state.day}`);
        this.showPushNotif(`💬 ${contact.name}`, `Ha risposto! +${bonus} relazione`);
        this.refresh();
    },

    inviteToDinner(contact) {
        if (!Game.spendPhoneAction(1)) {
            Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
            return;
        }

        // Dinner cost (Centro ideology gets discount)
        const ideoClass = Game.getIdeologyClass();
        const baseDinnerCost = (typeof GameConstants !== 'undefined' && GameConstants.ECONOMY)
            ? GameConstants.ECONOMY.PHONE_DINNER_BASE_COST
            : 25;
        let dinnerCost = baseDinnerCost;
        if (ideoClass.dinnerDiscount) {
            dinnerCost = Math.round(dinnerCost * (1 - ideoClass.dinnerDiscount));
        }

        if (Game.state.money < dinnerCost) {
            Game.addWorkNotif('🍽️ Cena', `Non hai abbastanza soldi per la cena (€${dinnerCost}).`, `Giorno ${Game.state.day}`);
            // Refund the phone action
            Game.state.phoneActions++;
            Game.emit('phone-ap-change', { phoneAP: Game.state.phoneActions });
            return;
        }

        Game.changeMoney(-dinnerCost);

        const sameIdeology = contact.ideology === Game.state.character.ideology;
        const allianceBonus = ideoClass.allianceBonus || 1;
        const bonus = Math.round((sameIdeology ? 25 : 15) * allianceBonus);
        contact.relation = Math.min(100, contact.relation + bonus);
        contact.loyalty = Math.min(100, contact.loyalty + 5);
        if (typeof Agents !== 'undefined' && Agents.recordByContact) {
            Agents.recordByContact(contact, 'dinner', sameIdeology ? 12 : 8);
            if (Agents.syncAgentsToContacts) Agents.syncAgentsToContacts();
        }
        Game.changeStat('stanchezza', 10);
        Game.changeStat('morale', 8);
        Game.changeAttribute('carisma', 1);
        Game.addWorkNotif('🍽️ Cena', `Cena con ${contact.name}. Relazione +${bonus}! €${dinnerCost} spesi.`, `Giorno ${Game.state.day}`);
        this.showPushNotif(`🍽️ ${contact.name}`, `Cena fantastica! +${bonus} relazione`);
        this.refresh();
    },

    giftContact(contact) {
        if (!Game.spendPhoneAction(1)) {
            Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
            return;
        }
        if (Game.state.money < 15) {
            Game.state.phoneActions++;
            Game.emit('phone-ap-change', { phoneAP: Game.state.phoneActions });
            Game.addWorkNotif('🎁 Regalo', 'Non hai abbastanza soldi (€15).', `Giorno ${Game.state.day}`);
            return;
        }

        Game.changeMoney(-15);
        contact.relation = Math.min(100, contact.relation + 10);
        contact.loyalty = Math.min(100, contact.loyalty + 5);
        if (typeof Agents !== 'undefined' && Agents.recordByContact) {
            Agents.recordByContact(contact, 'gift', 10);
            if (Agents.syncAgentsToContacts) Agents.syncAgentsToContacts();
        }
        Game.addWorkNotif('🎁 Regalo', `Hai fatto un regalo a ${contact.name}. Relazione +10.`, `Giorno ${Game.state.day}`);
        this.refresh();
    },

    formAlliance(contact, chosenTypeId) {
        Game.ensureAllianceStructures();
        const stance = Game.getCoalitionStance(Game.state.character.ideology, contact.ideology);
        const already = contact.alliance && contact.alliance.active;
        const everFormed = contact.alliance && contact.alliance.everFormed;
        const catalog = this.getAllianceTypeCatalog(contact);
        const chosen = catalog.types[chosenTypeId] || catalog.types[catalog.preferred] || catalog.types.elettorale;
        if (already) {
            Game.addWorkNotif('🤝 Alleanza', `${contact.name} è già tuo alleato.`, `Giorno ${Game.state.day}`);
            return;
        }
        if (everFormed) {
            Game.addWorkNotif('🤝 Alleanza', `Con ${contact.name} non puoi rifare un'alleanza (cooldown permanente).`, `Giorno ${Game.state.day}`);
            return;
        }
        if (contact.relation < chosen.reqRelation || contact.loyalty < chosen.reqLoyalty || stance === 'nemico' || contact.betrayed) {
            Game.addWorkNotif('🤝 Alleanza', `Requisiti non soddisfatti con ${contact.name}.`, `Giorno ${Game.state.day}`);
            return;
        }
        if (!Game.spendPhoneAction(1)) {
            Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
            return;
        }
        if (!Game.spendActionPoint(1)) {
            Game.state.phoneActions++;
            Game.emit('phone-ap-change', { phoneAP: Game.state.phoneActions });
            Game.emit('no-ap', { reason: 'Serve 1 PA normale per formalizzare l\'alleanza.' });
            return;
        }

        if (Game.state.money < chosen.moneyCost) {
            Game.state.phoneActions++;
            Game.emit('phone-ap-change', { phoneAP: Game.state.phoneActions });
            Game.state.actionPoints = (Game.state.actionPoints || 0) + 1;
            Game.emit('ap-change', { ap: Game.state.actionPoints });
            Game.addWorkNotif('🤝 Alleanza', `Servono €${chosen.moneyCost} per formalizzare il patto ${chosen.id}.`, `Giorno ${Game.state.day}`);
            return;
        }
        Game.changeMoney(-chosen.moneyCost);

        const meta = this.getAllianceMeta(contact);
        contact.canAlly = true;
        contact.alliance = {
            active: true,
            typeId: chosen.id,
            bonusKey: meta.key,
            bonusLabel: chosen.label,
            sinceDay: Game.state.day,
            expiresDay: Game.state.day + chosen.duration,
            renewals: 0,
            endedDay: 0,
            everFormed: true,
        };
        contact.loyalty = Math.min(100, contact.loyalty + 10);
        if (typeof Agents !== 'undefined' && Agents.recordByContact) {
            Agents.recordByContact(contact, 'alliance-formed', 12);
            if (Agents.syncAgentsToContacts) Agents.syncAgentsToContacts();
        }
        if (meta.key === 'studente') {
            Game.changeAttribute('intelligenza', 2);
        }

        // If new alliance conflicts with old allies, keep one side and break the weaker relation side.
        const currentAllies = Game.getActiveAlliances().filter(c => c.name !== contact.name);
        currentAllies.forEach(c => {
            const conflict = Game.getCoalitionStance(c.ideology, contact.ideology) === 'nemico'
                || Game.getCoalitionStance(contact.ideology, c.ideology) === 'nemico';
            if (conflict) {
                const supportNew = (contact.relation || 0) >= (c.relation || 0);
                if (supportNew) {
                    Game.breakAlliance(c, `conflitto con ${contact.name}`);
                    Game.addWorkNotif('⚔️ Conflitto Alleati', `Hai sostenuto ${contact.name} nel conflitto con ${c.name}.`, `Giorno ${Game.state.day}`);
                } else {
                    Game.breakAlliance(contact, `conflitto con ${c.name}`);
                    Game.addWorkNotif('⚔️ Conflitto Alleati', `Hai sostenuto ${c.name} nel conflitto con ${contact.name}.`, `Giorno ${Game.state.day}`);
                }
            }
        });

        Game.changeReputazione(4);
        Game.addWorkNotif('🤝 Alleanza', `${contact.name} ora è alleato attivo (${chosen.id}). Bonus: ${chosen.label}. Durata ${chosen.duration} giorni.`, `Giorno ${Game.state.day}`);
        if (Game.evaluatePoliticalCareerPromotion) Game.evaluatePoliticalCareerPromotion();
        this.refresh();
    },

    renewAlliance(contact) {
        Game.ensureAllianceStructures();
        if (!contact || !contact.alliance || !contact.alliance.active) return;
        const typeId = contact.alliance.typeId || 'elettorale';
        const catalog = this.getAllianceTypeCatalog(contact);
        const chosen = catalog.types[typeId] || catalog.types.elettorale;
        const renewalCost = Math.round(chosen.moneyCost * 0.8);

        if (!Game.spendPhoneAction(1)) {
            Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
            return;
        }
        if (Game.state.money < renewalCost) {
            Game.state.phoneActions++;
            Game.emit('phone-ap-change', { phoneAP: Game.state.phoneActions });
            Game.addWorkNotif('🔁 Rinnovo Alleanza', `Servono €${renewalCost} per rinnovare il patto con ${contact.name}.`, `Giorno ${Game.state.day}`);
            return;
        }

        Game.changeMoney(-renewalCost);
        contact.alliance.expiresDay = Math.max(contact.alliance.expiresDay || Game.state.day, Game.state.day) + Math.round(chosen.duration * 0.6);
        contact.alliance.renewals = (contact.alliance.renewals || 0) + 1;
        contact.loyalty = Math.min(100, (contact.loyalty || 0) + 4);
        Game.addWorkNotif('🔁 Rinnovo Alleanza', `Patto ${typeId} rinnovato con ${contact.name} (-€${renewalCost}).`, `Giorno ${Game.state.day}`);
        this.refresh();
    },

    requestTip(contact) {
        if (!Game.spendPhoneAction(1)) {
            Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
            return;
        }
        const tips = [
            'Domani potrebbe uscire uno scandalo edilizio in Comune.',
            'Un assessore sta perdendo consenso nel quartiere nord.',
            'Si parla di un posto vacante in commissione bilancio.',
            'Arriva una visita ministeriale tra pochi giorni.',
        ];
        const tip = tips[Math.floor(Math.random() * tips.length)];
        Game.addUrgentMessage(`🕵️ ${contact.name}`, tip, 'info');
        contact.relation = Math.min(100, contact.relation + 3);
        if (typeof Agents !== 'undefined' && Agents.recordByContact) {
            Agents.recordByContact(contact, 'tip-requested', 3);
            if (Agents.syncAgentsToContacts) Agents.syncAgentsToContacts();
        }
        this.showPushNotif(`🕵️ ${contact.name}`, 'Ti ha girato una soffiata.');
        this.refresh();
    },

    betrayContact(contact) {
        const executeBetrayal = () => {
            const cashout = (typeof GameConstants !== 'undefined' && GameConstants.ECONOMY)
                ? GameConstants.ECONOMY.BETRAY_CONTACT_CASHOUT
                : 100;
            const hadAlliance = !!(contact && contact.alliance && (contact.alliance.active || contact.alliance.everFormed));
            Game.changeMoney(cashout);
            contact.relation = Math.max(0, contact.relation - 30);
            contact.loyalty = Math.max(0, contact.loyalty - 40);
            contact.betrayed = true;
            if (contact.alliance && contact.alliance.active) {
                Game.breakAlliance(contact, 'tradimento');
            }
            if (typeof Agents !== 'undefined' && Agents.recordByContact) {
                Agents.recordByContact(contact, 'betrayed', -20);
                if (Agents.syncAgentsToContacts) Agents.syncAgentsToContacts();
            }
            Game.changeReputazione(-4);
            if (hadAlliance) {
                Game.changeReputazione(6);
                Game.changeStat('coherence', -8);
            }
            Game.addWorkNotif('💔 Tradimento', `Hai venduto ${contact.name} per €${cashout}.`, `Giorno ${Game.state.day}`);
            if (Game.evaluatePoliticalCareerPromotion) Game.evaluatePoliticalCareerPromotion();
            this.refresh();
        };

        if (typeof ConfirmAction !== 'undefined') {
            ConfirmAction.ask({
                title: 'Tradire questo contatto?',
                body: `Tradire ${contact.name} avrà effetti permanenti sulla relazione e sulla rete politica.`,
                acceptLabel: 'Sì, tradisci',
                cancelLabel: 'Annulla',
                onAccept: executeBetrayal,
            });
            return;
        }

        executeBetrayal();
    },

    // ====== PARTNER TAB ======
    renderPartner() {
        const container = document.getElementById('partner-content');
        const p = Game.state.partner;
        if (!p) {
            container.innerHTML = `<p style="color:#666">Nessun partner al momento.</p>
                <p class="partner-tip">💡 Puoi incontrare qualcuno uscendo al Parco o alla Palestra!</p>`;
            return;
        }
        const noPA = !Game.hasPhoneActions(1);
        const partnerType = p.isBurden ? '😤 Fardello' : '✨ Asset';
        const profInfo = p.professionLabel || p.profession || '';
        const profBonus = p.professionBonus || '';
        container.innerHTML = `
            <div class="partner-card">
                <div class="partner-name">❤️ ${this.esc(p.name)} <span class="partner-type ${p.isBurden ? 'burden' : 'asset'}">${partnerType}</span></div>
                ${profInfo ? `<div class="partner-profession">${this.esc(profInfo)}</div>` : ''}
                ${profBonus ? `<div class="partner-bonus">💎 ${this.esc(profBonus)}</div>` : ''}
                <div class="partner-stat">
                    <span class="partner-stat-label">Tensione</span>
                    <div class="partner-stat-bar"><div class="partner-stat-fill tension" style="width:${p.tension}%"></div></div>
                </div>
                <div class="partner-stat">
                    <span class="partner-stat-label">Supporto</span>
                    <div class="partner-stat-bar"><div class="partner-stat-fill support" style="width:${p.support}%"></div></div>
                </div>
                <div class="partner-warning ${p.tension > 70 ? '' : 'hidden'}">⚠️ Attenzione: se trascuri il/la partner, la rottura sarà pubblica!</div>
                <button class="partner-action ${noPA ? 'task-no-ap' : ''}" id="partner-date"
                    data-preview="1 📱 | €30 | -20 Tensione | +15 Supporto | 😊+10 | 🪞+2">🌹 Appuntamento <span class="phone-cost-badge">1 📱</span></button>
                <button class="partner-action ${noPA ? 'task-no-ap' : ''}" id="partner-talk"
                    data-preview="1 📱 | -10 Tensione | +8 Supporto | 😊+5">💬 Parla <span class="phone-cost-badge">1 📱</span></button>
                <button class="partner-action ${noPA || Game.state.money < 20 ? 'task-no-ap' : ''}" id="partner-gift"
                    data-preview="1 📱 | €20 | +20 Supporto | -15 Tensione">🎁 Regalo <span class="phone-cost-badge">1 📱</span></button>
                <button class="partner-action ${!Game.hasActionPoints(1) ? 'task-no-ap' : ''}" id="partner-home-dinner"
                    data-preview="1 ⚡ | +10 Supporto | +5 Stanchezza">🏠 Cena a casa <span class="task-ap-cost">1 ⚡</span></button>
                <button class="partner-action ${noPA || Game.state.money < 200 ? 'task-no-ap' : ''}" id="partner-promise"
                    data-preview="1 📱 | €200 | +50 Supporto">💍 Promessa <span class="phone-cost-badge">1 📱</span></button>
                <button class="partner-action" id="partner-fight"
                    data-preview="0 | -5 Tensione | -10 Supporto">😤 Litiga</button>
            </div>
        `;

        if (!noPA) {
            document.getElementById('partner-date').addEventListener('click', () => {
                if (!Game.spendPhoneAction(1)) { Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' }); return; }
                p.tension = Math.max(0, p.tension - 20);
                p.support = Math.min(100, p.support + 15);
                p.isBurden = false;
                Game.changeStat('stanchezza', 15);
                Game.changeMoney(-30);
                Game.changeStat('morale', 10);
                Game.changeAttribute('estetica', 2);
                Game.addWorkNotif('Vita privata', `Appuntamento con ${p.name}. Tensione ridotta.`, `Giorno ${Game.state.day}`);
                this.renderPartner();
                if (window.SR && SR.afterActionFocus) requestAnimationFrame(() => SR.afterActionFocus(document.getElementById('partner-date')));
            });

            document.getElementById('partner-talk').addEventListener('click', () => {
                if (!Game.spendPhoneAction(1)) { Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' }); return; }
                p.tension = Math.max(0, p.tension - 10);
                p.support = Math.min(100, p.support + 8);
                Game.changeStat('stanchezza', 5);
                Game.changeStat('morale', 5);
                Game.addWorkNotif('Vita privata', `Chiacchierata con ${p.name}.`, `Giorno ${Game.state.day}`);
                this.renderPartner();
                if (window.SR && SR.afterActionFocus) requestAnimationFrame(() => SR.afterActionFocus(document.getElementById('partner-talk')));
            });

            const giftBtn = document.getElementById('partner-gift');
            if (giftBtn && !giftBtn.classList.contains('task-no-ap')) {
                giftBtn.addEventListener('click', () => {
                    if (!Game.spendPhoneAction(1)) return;
                    if (Game.state.money < 20) { Game.state.phoneActions++; Game.emit('phone-ap-change', { phoneAP: Game.state.phoneActions }); return; }
                    Game.changeMoney(-20);
                    p.support = Math.min(100, p.support + 20);
                    p.tension = Math.max(0, p.tension - 15);
                    Game.addWorkNotif('💕 Regalo', `Hai fatto un regalo a ${p.name}.`, `Giorno ${Game.state.day}`);
                    this.renderPartner();
                    if (window.SR && SR.afterActionFocus) requestAnimationFrame(() => SR.afterActionFocus(document.getElementById('partner-gift')));
                });
            }

            const homeBtn = document.getElementById('partner-home-dinner');
            if (homeBtn && !homeBtn.classList.contains('task-no-ap')) {
                homeBtn.addEventListener('click', () => {
                    if (!Game.spendPhoneAction(1)) {
                        Game.emit('no-ap', { reason: 'Serve 1 azione telefono per organizzare la cena a casa.' });
                        return;
                    }
                    if (!Game.spendActionPoint(1)) { Game.emit('no-ap', { reason: 'Serve 1 PA per la cena a casa.' }); return; }
                    p.support = Math.min(100, p.support + 10);
                    Game.changeStat('stanchezza', 5);
                    Game.addWorkNotif('🏠 Cena a casa', `${p.name} apprezza il tempo insieme.`, `Giorno ${Game.state.day}`);
                    this.renderPartner();
                    if (window.SR && SR.afterActionFocus) requestAnimationFrame(() => SR.afterActionFocus(document.getElementById('partner-home-dinner')));
                });
            }

            const promiseBtn = document.getElementById('partner-promise');
            if (promiseBtn && !promiseBtn.classList.contains('task-no-ap')) {
                promiseBtn.addEventListener('click', () => {
                    if (!Game.spendPhoneAction(1)) return;
                    if (Game.state.money < 200) { Game.state.phoneActions++; Game.emit('phone-ap-change', { phoneAP: Game.state.phoneActions }); return; }
                    Game.changeMoney(-200);
                    p.support = Math.min(100, p.support + 50);
                    p.promised = true;
                    Game.addWorkNotif('💍 Promessa', `Hai fatto una promessa importante a ${p.name}.`, `Giorno ${Game.state.day}`);
                    this.renderPartner();
                    if (window.SR && SR.afterActionFocus) requestAnimationFrame(() => SR.afterActionFocus(document.getElementById('partner-promise')));
                });
            }

            const fightBtn = document.getElementById('partner-fight');
            if (fightBtn) {
                fightBtn.addEventListener('click', () => {
                    if (!Game.spendPhoneAction(1)) {
                        Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                        return;
                    }
                    p.tension = Math.max(0, p.tension - 5);
                    p.support = Math.max(0, p.support - 10);
                    Game.addWorkNotif('😤 Discussione', `Hai litigato con ${p.name}.`, `Giorno ${Game.state.day}`);
                    this.renderPartner();
                    if (window.SR && SR.afterActionFocus) requestAnimationFrame(() => SR.afterActionFocus(document.getElementById('partner-fight')));
                });
            }
        }
    },

    // ====== WORK NOTIFICATIONS TAB ======
    renderWorkNotifs() {
        const container = document.getElementById('work-notifications');
        if (!container) return;
        const notifs = Game.state.workNotifs;
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Notifiche di lavoro');

        const heading = '<h4 class="visually-hidden">Elenco notifiche lavoro</h4>';
        if (notifs.length === 0) {
            container.innerHTML = `${heading}<p style="color:#666">Nessuna notifica.</p>`;
            return;
        }
        container.innerHTML = `${heading}${notifs.map(n => `
            <div class="work-notif">
                <div class="work-notif-title">${this.esc(n.title)}</div>
                <div class="work-notif-body">${this.esc(n.body)}</div>
                <div class="work-notif-time">${this.esc(n.time)}</div>
            </div>
        `).join('')}`;
    },

    renderFavori() {
        const container = document.getElementById('favori-list');
        if (!container) return;

        const favorsState = Game.state.favors || { pending: [], credits: [] };
        const pending = favorsState.pending || [];
        const credits = (favorsState.credits || []).filter(c => !c.used);

        if (pending.length === 0 && credits.length === 0) {
            container.innerHTML = '<p class="empty-list">Nessun favore o credito disponibile.</p>';
            return;
        }

        let html = '';
        if (pending.length > 0) {
            html += pending.map((favor, index) => `
                <div class="work-msg">
                    <div class="work-msg-title">🤝 ${this.esc(favor.contactName)}</div>
                    <div class="work-msg-body">${this.esc(favor.text)}</div>
                    <div class="work-msg-info">
                        <span class="work-msg-reward">⏰ Scade: Giorno ${favor.expires}</span>
                    </div>
                    <div class="urgent-choices-row">
                        <button class="urgent-choice favor-run" data-favorid="${this.esc(favor.id)}">✅ Esegui</button>
                        <button class="urgent-choice favor-decline" data-favorid="${this.esc(favor.id)}">❌ Rifiuta</button>
                    </div>
                </div>
            `).join('');
        }

        if (credits.length > 0) {
            html += `
                <div class="contacts-section-header">🎁 Crediti Disponibili</div>
                ${credits.map((credit, index) => `
                    <div class="work-msg">
                        <div class="work-msg-title">${this.esc(credit.type)}</div>
                        <div class="work-msg-body">${this.esc(credit.desc)}${credit.from ? ` • da ${this.esc(credit.from)}` : ''}</div>
                        <div class="urgent-choices-row">
                            <button class="urgent-choice credit-use" data-creditindex="${index}">⚡ Usa credito</button>
                        </div>
                    </div>
                `).join('')}
            `;
        }

        container.innerHTML = html;

        container.querySelectorAll('.favor-run').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!Game.spendPhoneAction(1)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                if (typeof Favors !== 'undefined' && Favors.fulfillFavor) {
                    const ok = Favors.fulfillFavor(btn.dataset.favorid);
                    if (ok && window.SR) SR.announce('Favore riscosso con successo.', 'assertive');
                    this.renderFavori();
                    this.renderUrgenti();
                }
            });
        });

        container.querySelectorAll('.favor-decline').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!Game.spendPhoneAction(1)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                if (typeof Favors !== 'undefined' && Favors.declineFavor) {
                    Favors.declineFavor(btn.dataset.favorid);
                    if (window.SR) SR.announce('Favore rifiutato.', 'assertive');
                    this.renderFavori();
                    this.renderUrgenti();
                }
            });
        });

        container.querySelectorAll('.credit-use').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!Game.spendPhoneAction(1)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                const availableCredits = (Game.state.favors?.credits || []).filter(c => !c.used);
                const credit = availableCredits[parseInt(btn.dataset.creditindex, 10)];
                if (!credit || typeof Favors === 'undefined' || !Favors.spendCredit) return;
                const realIndex = (Game.state.favors?.credits || []).findIndex(c => c === credit);
                if (realIndex >= 0) {
                    Favors.spendCredit(realIndex);
                    if (window.SR) SR.announce('Credito usato.', 'assertive');
                    this.renderFavori();
                }
            });
        });
    },

    // ====== WORK SUB-TABS ======
    initWorkSubTabs() {
        const labels = {
            urgenti: 'Urgenti',
            lavoro: 'Lavoro',
            favori: 'Favori',
        };

        const tabList = document.querySelector('#tab-attivita .phone-work-tabs');
        if (tabList) {
            tabList.setAttribute('role', 'tablist');
            tabList.setAttribute('aria-label', 'Sezioni attivita');
        }

        document.querySelectorAll('.phone-work-tab').forEach((tab, idx) => {
            const key = tab.dataset.wtab;
            const panelId = `phone-wtab-${key}`;
            if (!tab.id) tab.id = `phone-work-tab-${key || idx}`;
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-controls', panelId);
            tab.setAttribute('aria-selected', tab.classList.contains('active') ? 'true' : 'false');
            tab.setAttribute('aria-label', `Sezione ${labels[key] || key || 'attivita'}`);

            const content = document.getElementById(panelId);
            if (content) {
                content.setAttribute('role', 'tabpanel');
                content.setAttribute('aria-labelledby', tab.id);
            }

            tab.addEventListener('click', () => {
                document.querySelectorAll('.phone-work-tab').forEach(t => {
                    if (!t) return;
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                document.querySelectorAll('.phone-work-content').forEach(c => c && c.classList.remove('active'));

                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                if (content) {
                    content.classList.add('active');
                    this._focusWorkSubSection(content, labels[key] || key);
                }
                if (window.SR) SR.announce(`Sezione lavoro: ${labels[key] || key}.`, 'polite');
            });
        });

        const activeTab = document.querySelector('.phone-work-tab.active') || document.querySelector('.phone-work-tab');
        if (activeTab) {
            document.querySelectorAll('.phone-work-content').forEach(c => c && c.classList.remove('active'));
            const target = document.getElementById(`phone-wtab-${activeTab.dataset.wtab}`);
            if (target) {
                target.classList.add('active');
                activeTab.setAttribute('aria-selected', 'true');
            }
        }
    },

    _focusWorkSubSection(content, label) {
        if (!content) return;
        let heading = content.querySelector('[data-sr-work-heading]');
        if (!heading) {
            heading = document.createElement('h4');
            heading.className = 'visually-hidden';
            heading.setAttribute('data-sr-work-heading', '1');
            heading.setAttribute('tabindex', '-1');
            content.insertBefore(heading, content.firstChild);
        }
        heading.textContent = `Sezione ${label || 'lavoro'}`;
        requestAnimationFrame(() => heading.focus({ preventScroll: false }));
    },

    // ====== WORK MESSAGES (Opportunities) ======
    WORK_MSG_TEMPLATES: [
        { title: '📰 Intervista TV locale', body: 'Un giornalista vuole intervistarti. Visibilità assicurata!', reward: { reputazione: 8, reputazioneNazionale: 2 }, malus: { stress: 5 }, money: 0, political: true },
        { title: '🏛️ Commissione urgente', body: 'Hai una convocazione per una commissione speciale. Partecipa per guadagnare credibilità.', reward: { reputazione: 5 }, malus: { stanchezza: 8 }, money: 50, political: true },
        { title: '📢 Comizio in piazza', body: 'I militanti hanno organizzato un comizio. La tua presenza è richiesta!', reward: { reputazione: 10, morale: 5 }, malus: { stanchezza: 10, stress: 3 }, money: 0, political: true },
        { title: '🤝 Mediazione tra fazioni', body: 'Due correnti del partito litigano. Puoi mediare e guadagnare favori.', reward: { reputazione: 6 }, malus: { stress: 8 }, money: 30, political: true },
        { title: '📋 Firma petizione popolare', body: 'Una raccolta firme nel tuo quartiere. Poco impegno, buona visibilità.', reward: { reputazione: 4 }, malus: { stanchezza: 3 }, money: 0, political: true },
        { title: '💼 Straordinario in ufficio', body: 'Il capo chiede straordinari. Paga extra ma stancante.', reward: {}, malus: { stanchezza: 12, stress: 5 }, money: 60, political: false },
        { title: '📊 Progetto speciale', body: 'Un progetto extra-lavorativo con bonus. Richiede concentrazione.', reward: {}, malus: { stanchezza: 8 }, money: 80, political: false },
        { title: '🎓 Formazione aziendale', body: 'Corso di aggiornamento. Noioso ma utile per la carriera.', reward: {}, malus: { stanchezza: 5, morale: -3 }, money: 20, political: false },
        { title: '🔧 Aiuto collega', body: 'Un collega ti chiede una mano. Buona impressione sul capo.', reward: { morale: 5 }, malus: { stanchezza: 6 }, money: 25, political: false },
        { title: '📞 Consulenza esterna', body: 'Un\'azienda privata ti chiede un parere professionale.', reward: {}, malus: { stress: 4 }, money: 45, political: false },
        { title: '🗞️ Articolo su di te', body: 'Un blog locale vuole scrivere un pezzo su di te. Gratis, solo un po\' di tempo.', reward: { reputazione: 6, reputazioneNazionale: 1 }, malus: { stanchezza: 4 }, money: 0, political: true },
        { title: '🎤 Dibattito radiofonico', body: 'Invitato a un dibattito in radio. Ottima esposizione ma stressante.', reward: { reputazione: 7, reputazioneNazionale: 3 }, malus: { stress: 10 }, money: 0, political: true },
    ],

    generateWorkMessages() {
        if (!Game.state.workMessages) Game.state.workMessages = [];
        // Generate 1-2 messages per time advance, max 5 pending
        if (Game.state.workMessages.filter(m => !m.handled).length >= 5) return;
        const count = Math.random() < 0.4 ? 2 : 1;
        for (let i = 0; i < count; i++) {
            const tmpl = this.WORK_MSG_TEMPLATES[Math.floor(Math.random() * this.WORK_MSG_TEMPLATES.length)];
            Game.state.workMessages.push({
                ...tmpl,
                id: Date.now() + i,
                handled: false,
                time: `${Game.getTimeLabel()} - Giorno ${Game.state.day}`,
            });
        }
    },

    renderWorkMessages() {
        const container = document.getElementById('work-messages');
        if (!container) return;
        if (!Game.state.workMessages) Game.state.workMessages = [];
        const msgs = Game.state.workMessages.filter(m => !m.handled);

        container.setAttribute('role', 'region');
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-label', 'Messaggi e opportunita di lavoro');

        const heading = '<h4 class="visually-hidden">Elenco opportunita lavoro</h4><p class="visually-hidden">Prima di scegliere, ascolta costo in azioni, denaro e impatto su stress o reputazione.</p>';
        if (msgs.length === 0) {
            container.innerHTML = `${heading}<p style="color:#666">Nessun messaggio di lavoro.</p>`;
            return;
        }
        const noPA = !Game.hasPhoneActions(1);
        container.innerHTML = `${heading}${msgs.map(m => {
            const parts = [];
            if (m.money > 0) parts.push(`+€${m.money}`);
            Object.entries(m.reward).forEach(([k, v]) => {
                if (k === 'reputazione') parts.push(`Rep +${v}`);
                else if (k === 'reputazioneNazionale') parts.push(`Rep Naz +${v}`);
                else if (k === 'morale') parts.push(`😊+${v}`);
            });
            const malusParts = [];
            Object.entries(m.malus).forEach(([k, v]) => {
                if (v > 0) {
                    if (k === 'stanchezza') malusParts.push(`😴+${v}`);
                    else if (k === 'stress') malusParts.push(`😰+${v}`);
                } else if (v < 0) {
                    if (k === 'morale') malusParts.push(`😊${v}`);
                }
            });
            return `
                <div class="work-msg ${m.political ? 'work-msg-political' : 'work-msg-normal'}">
                    <div class="work-msg-title">${m.title}</div>
                    <div class="work-msg-body">${m.body}</div>
                    <div class="work-msg-info">
                        <span class="work-msg-reward">${parts.join(' | ')}</span>
                        ${malusParts.length ? `<span class="work-msg-malus">${malusParts.join(' ')}</span>` : ''}
                    </div>
                    <button class="work-msg-accept" data-msgid="${m.id}" ${noPA ? 'disabled' : ''}>
                        ${noPA ? '📱 Esaurite' : '✅ Accetta'} <span class="task-ap-cost">1 📱</span>
                    </button>
                </div>`;
        }).join('')}`;

        container.querySelectorAll('.work-msg-accept').forEach(btn => {
            btn.addEventListener('click', () => {
                const msgId = parseInt(btn.dataset.msgid);
                this.acceptWorkMessage(msgId);
            });
        });
    },

    acceptWorkMessage(msgId) {
        if (!Game.spendPhoneAction(1)) {
            Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
            return;
        }
        const msg = (Game.state.workMessages || []).find(m => m.id === msgId);
        if (!msg || msg.handled) return;
        msg.handled = true;

        // Apply rewards
        if (msg.money > 0) Game.changeMoney(msg.money);
        Object.entries(msg.reward).forEach(([k, v]) => {
            if (k === 'reputazione') Game.changeReputazione(v);
            else if (k === 'reputazioneNazionale') {
                Game.state.reputazioneNazionale = Math.min(100, Math.max(0, Game.state.reputazioneNazionale + v));
                Game.emit('stat-change', { stat: 'reputazioneNazionale' });
            }
            else if (Game.state.stats[k] !== undefined) Game.changeStat(k, v);
        });
        // Apply maluses
        Object.entries(msg.malus).forEach(([k, v]) => {
            if (Game.state.stats[k] !== undefined) Game.changeStat(k, v);
        });

        const rewardText = msg.money > 0 ? `+€${msg.money}` : Object.entries(msg.reward).map(([k,v]) => `${k}+${v}`).join(', ');
        Game.addWorkNotif(msg.title, `Completato! ${rewardText}`, `Giorno ${Game.state.day}`);
        this.showPushNotif(msg.title, `Completato! ${rewardText}`);
        this.refresh();
    },

    updateBadge() {
        const badge = document.getElementById('phone-badge');
        if (!badge) return;
        const urgentCount = Game.state.urgentMessages.filter(m => !m.handled).length;
        const workCount = Game.state.workNotifs.length;
        const msgCount = (Game.state.workMessages || []).filter(m => !m.handled).length;
        const count = urgentCount + workCount + msgCount;
        if (count > 0) {
            badge.classList.remove('hidden');
            badge.textContent = count > 9 ? '9+' : count;
        } else {
            badge.classList.add('hidden');
        }
    },

    updatePhoneAPDots() {
        const ap = Game.state.phoneActions;
        const d1 = document.getElementById('phone-ap-1');
        const d2 = document.getElementById('phone-ap-2');
        if (d1) d1.classList.toggle('filled', ap >= 1);
        if (d2) d2.classList.toggle('filled', ap >= 2);
    },

    // ====== SOCIAL BUZZ TAB ======
    SOCIAL_POSTS_TEMPLATE: [
        { author: 'Giornale Locale', text: 'La politica locale è in crisi: i cittadini chiedono risposte concrete.', likes: 124 },
        { author: '@MarcoB_politica', text: 'Stamattina gazebo in piazza. La gente è stanca di promesse vuote!', likes: 45 },
        { author: '@GiuliaR_news', text: 'ESCLUSIVA: fondi pubblici usati per cene di partito. Indagini in corso.', likes: 312 },
        { author: 'Il Corriere del Sud', text: 'Elezioni comunali: il centrosinistra perde terreno nei sondaggi.', likes: 89 },
        { author: '@Citizen_IT', text: 'Le buche per strada sono una vergogna. Chi governa sta dormendo?', likes: 201 },
        { author: '@PaoloT_senato', text: 'Il compromesso non è tradimento. È politica adulta.', likes: 56 },
        { author: 'La Gazzetta', text: 'Proteste davanti al municipio: i commercianti chiedono meno tasse.', likes: 167 },
        { author: '@Elena_diritti', text: 'I diritti non si negoziano. Mai un passo indietro.', likes: 445 },
    ],

    // Ideology-specific NPC posts that appear in feed
    IDEOLOGY_POSTS: {
        'estrema-sinistra': [
            { author: '🔴 AVS Locale', text: 'Solidarietà ai lavoratori! La transizione ecologica non può aspettare!', likes: 890 },
            { author: '@FridaysItalia', text: 'Mentre la destra nega il clima, noi scendiamo in piazza. Ogni venerdì.', likes: 1200 },
            { author: '⚡ Collettivo Rosso-Verde', text: 'Salario minimo, diritti, ambiente. Non ci fermiamo. Chi non scende è complice.', likes: 650 },
        ],
        'estrema-destra': [
            { author: '🦅 FdI_Sezione', text: 'Difendiamo la nostra identità. Prima gli italiani, sempre.', likes: 980 },
            { author: '@LegaTerritori', text: 'Autonomia differenziata ORA. I nostri soldi restino sul territorio.', likes: 1100 },
            { author: '⚔️ Ordine e Sovranità', text: 'Sicurezza, confini, tradizione. Chi governa deve comandare davvero.', likes: 720 },
        ],
        'centro': [
            { author: '⚖️ AzioneViva', text: 'Il riformismo serio non fa rumore, ma cambia le cose. Agenda Draghi.', likes: 340 },
            { author: '@Renzi_fan', text: 'Né destra né sinistra: competenza e merito. Il populismo è il vero nemico.', likes: 280 },
            { author: '🤝 LibDem Italia', text: 'Incontro col think-tank europeo. Partnership strategiche in corso.', likes: 190 },
        ],
        'populista': [
            { author: '📢 M5S_Base', text: 'I palazzi del potere TREMANO! Il reddito di cittadinanza lo rivogliamo!', likes: 2400 },
            { author: '@GiùLeCaste', text: 'Stipendi dei parlamentari DIMEZZATI! Dieci anni e non hanno fatto NULLA!', likes: 3100 },
            { author: '🔊 V-Day Forever', text: 'LIVE dalla piazza: la democrazia diretta è l\'unica vera democrazia!', likes: 1800 },
        ],
        'tecnocrate': [
            { author: '📊 PNRR_Monitor', text: 'Analisi costi-benefici del PNRR: 42% dei fondi in ritardo. Thread 🧵', likes: 120 },
            { author: '@EconomistaGov', text: 'Lo spread è sotto controllo. Servono riforme strutturali, non slogan elettorali.', likes: 95 },
            { author: '🔬 PolicyLab_PD', text: 'Studio peer-reviewed sulle politiche abitative. Il pragmatismo paga.', likes: 78 },
        ],
    },

    FIRE_POST_OUTCOMES: [
        { text: 'BASTA! Il sistema è marcio e chi comanda sa solo rubare! È ORA DI REAGIRE! 🔥', effects: { reputazione: 10, stress: 12 }, outcome: '🔥 Post virale! +1200 condivisioni! Ma il partito ti guarda male...' },
        { text: 'I politici di questa città dovrebbero vergognarsi! Noi siamo il cambiamento!', effects: { reputazione: 8, stress: 8, coherence: -5 }, outcome: '💥 Boom di interazioni! Ma qualcuno nota incoerenze...' },
        { text: 'Chi non è con noi è contro il popolo! Non esistono mezze misure!', effects: { reputazione: 12, stress: 15, coherence: -8 }, outcome: '🔥🔥 Polemiche a non finire! Stress alle stelle.' },
        { text: 'Stanotte non ho dormito pensando a quanto fa schifo questo paese. MA NOI CAMBIEREMO TUTTO.', effects: { reputazione: 6, stress: 10, morale: -5 }, outcome: '😤 Reazioni miste. I tuoi nemici gongolano.' },
    ],

    FORMAL_POST_OUTCOMES: [
        { text: 'Oggi abbiamo presentato una proposta concreta per migliorare i servizi comunali.', effects: { reputazione: 4, stress: 2 }, outcome: '🏛️ Post apprezzato dai moderati. +4 Consenso.' },
        { text: 'La trasparenza è un dovere, non un optional. Rendicontiamo ogni euro speso.', effects: { reputazione: 5, stress: 3, coherence: 5 }, outcome: '📊 Credibilità in aumento. +5 Coerenza.' },
        { text: 'Ringrazio i cittadini che hanno partecipato all\'incontro. Il dialogo è fondamentale.', effects: { reputazione: 3, morale: 5 }, outcome: '🤝 Tono istituzionale apprezzato. +3 Consenso.' },
        { text: 'Il nostro programma prevede interventi mirati su infrastrutture e welfare locale.', effects: { reputazione: 6, stress: 4, coherence: 3 }, outcome: '📋 Post serio e competente. Pochi like ma tanta credibilità.' },
    ],

    EMOTIONAL_POST_OUTCOMES: [
        { text: 'Oggi ho incontrato una famiglia che fatica a pagare l\'affitto. Non possiamo voltare lo sguardo.', effects: { reputazione: 5, morale: 4, stress: 2 }, outcome: '😢 Post toccante: molti cittadini si sentono ascoltati.' },
        { text: 'Dietro ogni numero c\'è una persona. La politica deve tornare umana.', effects: { reputazione: 4, coherence: 4 }, outcome: '❤️ Molti commenti positivi sul tono empatico.' },
        { text: 'Non sono perfetto, ma ci metto la faccia ogni giorno per voi.', effects: { reputazione: 6, morale: 3, stress: 3 }, outcome: '🙏 Apprezzata l\'onestà, cresce la fiducia.' },
    ],

    COLLAB_POST_OUTCOMES: [
        { text: 'Incontro costruttivo con associazioni e comitati: lavoriamo insieme su soluzioni concrete.', effects: { reputazione: 5, coherence: 5 }, outcome: '🤝 Clima positivo: reputazione e credibilità in salita.' },
        { text: 'Collaborare non è un compromesso al ribasso: è responsabilità verso la città.', effects: { reputazione: 4, coherence: 6, stress: 2 }, outcome: '🧩 Messaggio maturo, consenso trasversale.' },
        { text: 'Tavolo aperto con tutte le forze civiche: porte aperte alle idee migliori.', effects: { reputazione: 3, morale: 5 }, outcome: '🏗️ Buona risposta dalla società civile.' },
    ],

    ANNOUNCIO_POST_OUTCOMES: [
        { text: 'Domani presenteremo il piano mobilità: meno traffico, più trasporto pubblico.', effects: { reputazione: 6, stress: 3 }, outcome: '📢 Annuncio forte: cresce l\'attesa dei media.' },
        { text: 'Ho convocato una conferenza stampa urgente per chiarire la situazione.', effects: { reputazione: 5, stress: 4 }, outcome: '🎙️ Attenzione alta: narrativa sotto il tuo controllo.' },
        { text: 'Settimana prossima lanciamo un pacchetto misure su casa e lavoro.', effects: { reputazione: 4, coherence: 3 }, outcome: '🗞️ Copertura mediatica favorevole.' },
    ],

    RICORDO_POST_OUTCOMES: [
        { text: 'Ricordiamo oggi chi ha costruito questa comunità con sacrificio e dignità.', effects: { reputazione: 4, morale: 6 }, outcome: '🕯️ Post sentito, comunità commossa.' },
        { text: 'La memoria non è nostalgia: è bussola per decisioni più giuste.', effects: { reputazione: 3, coherence: 5 }, outcome: '📚 Apprezzato il tono profondo e rispettoso.' },
        { text: 'Un pensiero alle vittime dimenticate: la politica deve custodire la memoria.', effects: { reputazione: 5, stress: 2, morale: 4 }, outcome: '🤍 Reazioni molto positive e partecipazione alta.' },
    ],

    INVESTIGATIVO_POST_OUTCOMES: [
        { text: 'Documenti alla mano: ecco come sono stati spesi davvero i fondi pubblici.', effects: { reputazione: 8, stress: 6 }, outcome: '🔍 Inchiesta forte: l\'opinione pubblica ti premia.' },
        { text: 'Ho raccolto prove su appalti opachi: pretendo chiarezza immediata.', effects: { reputazione: 10, stress: 8 }, outcome: '🗂️ Rumore mediatico altissimo.' },
        { text: 'Chi governa deve rendere conto. Pubblico tutto nelle prossime ore.', effects: { reputazione: 7, stress: 5, coherence: 3 }, outcome: '📣 Pressione pubblica crescente.' },
    ],

    EVENTO_POST_OUTCOMES: [
        { text: 'Evento civico in piazza: famiglie, giovani, associazioni. Partecipazione incredibile!', effects: { reputazione: 12, morale: 15, stress: 3 }, outcome: '🎉 Evento riuscitissimo: entusiasmo alle stelle.' },
        { text: 'Assemblea pubblica sold out. Abbiamo raccolto idee concrete da tutto il quartiere.', effects: { reputazione: 10, morale: 12, coherence: 4 }, outcome: '🏛️ Grande mobilitazione dal territorio.' },
        { text: 'Serata di confronto aperto: tanti volontari pronti a dare una mano.', effects: { reputazione: 11, morale: 10, carisma: 2 }, outcome: '🤝 Community in crescita.' },
    ],

    AFFONDO_POPULISTA_OUTCOMES: [
        { text: 'Il palazzo trema. Basta privilegi, ora decide il popolo.', effects: { reputazione: 15, stress: 10, coherence: -5 }, outcome: '📢 Affondo riuscito: base galvanizzata e feed in fiamme.' },
        { text: 'Siete stanchi di promesse. Oggi facciamo nomi e cognomi.', effects: { reputazione: 14, stress: 11, coherence: -5 }, outcome: '📢 Post divisivo ma potentissimo: copertura altissima.' },
    ],

    CITY_SPECIFIC_ACTIONS: {
        roma: [
            { id: 'roma_udienza_civica', label: '🏛️ Udienza Civica in Campidoglio', cost: 90, effects: { reputazione: 12, morale: 8 } },
            { id: 'roma_rete_volontari', label: '🤝 Rete Volontari di Quartiere', cost: 40, effects: { reputazione: 6, coherence: 4 } },
        ],
        milano: [
            { id: 'milano_tavolo_impresa', label: '💼 Tavolo con Imprese Urbane', cost: 120, effects: { money: 180, coherence: -4 } },
            { id: 'milano_forum_mobilita', label: '🚇 Forum Mobilita Sostenibile', cost: 60, effects: { reputazione: 8, intelligenza: 3 } },
        ],
        napoli: [
            { id: 'napoli_presidio_porto', label: '⚓ Presidio Civico al Porto', cost: 50, effects: { reputazione: 9, stress: 5 } },
            { id: 'napoli_rete_comitati', label: '📣 Assemblea dei Comitati', cost: 20, effects: { morale: 7, coherence: 3 } },
        ],
        paris: [
            { id: 'paris_soiree_civique', label: '📖 Soiree Civique', cost: 70, effects: { intelligenza: 4, reputazione: 7 } },
            { id: 'paris_salon_reformes', label: '🗞️ Salon des Reformes', cost: 95, effects: { reputazioneNazionale: 6, stress: 4 } },
        ],
        marseille: [
            { id: 'marseille_reseau_portuaire', label: '🚢 Reseau Portuaire Local', cost: 80, effects: { money: 140, coherence: -3 } },
            { id: 'marseille_comites_quai', label: '🌊 Comites des Quais', cost: 25, effects: { reputazione: 6, morale: 4 } },
        ],
        lyon: [
            { id: 'lyon_laboratoire_coop', label: '🧪 Laboratoire Cooperatif', cost: 65, effects: { intelligenza: 3, reputazione: 6 } },
            { id: 'lyon_patto_quartieri', label: '🏘️ Patto dei Quartieri', cost: 35, effects: { coherence: 5, morale: 5 } },
        ],
        berlin: [
            { id: 'berlin_open_data', label: '💻 Open Data Hacknight', cost: 55, effects: { intelligenza: 5, reputazione: 5 } },
            { id: 'berlin_forum_civico', label: '🎤 Forum Civico Serale', cost: 30, effects: { morale: 6, reputazione: 4 } },
        ],
        munich: [
            { id: 'munich_circle_invest', label: '🏦 Circle Invest Locale', cost: 110, effects: { money: 170, coherence: -4 } },
            { id: 'munich_officina_policy', label: '📊 Officina Policy', cost: 45, effects: { intelligenza: 4, reputazione: 5 } },
        ],
        london: [
            { id: 'london_civic_gala', label: '🎩 Civic Gala', cost: 130, effects: { reputazioneNazionale: 8, morale: 6 } },
            { id: 'london_commons_briefing', label: '📚 Commons Briefing', cost: 75, effects: { intelligenza: 4, reputazione: 6 } },
        ],
        manchester: [
            { id: 'manchester_assembly', label: '🏟️ District Assembly', cost: 45, effects: { reputazione: 7, morale: 5 } },
            { id: 'manchester_labor_lab', label: '🧰 Labor Policy Lab', cost: 50, effects: { coherence: 4, intelligenza: 3 } },
        ],
        edinburgh: [
            { id: 'edinburgh_civic_forum', label: '🏰 Civic Forum', cost: 60, effects: { reputazione: 6, coherence: 5 } },
            { id: 'edinburgh_public_debate', label: '🎙️ Public Debate Night', cost: 35, effects: { carisma: 3, reputazioneNazionale: 4 } },
        ],
    },

    getCitySpecificActions() {
        const cityId = Game.state.city ? Game.state.city.id : null;
        if (!cityId) return [];
        return this.CITY_SPECIFIC_ACTIONS[cityId] || [];
    },

    renderCityActions() {
        return this.getCitySpecificActions();
    },

    applyCityActionEffects(effects) {
        if (!effects) return;
        if (effects.stress) Game.changeStat('stress', effects.stress);
        if (effects.stanchezza) Game.changeStat('stanchezza', effects.stanchezza);
        if (effects.morale) Game.changeStat('morale', effects.morale);
        if (effects.salute) Game.changeStat('salute', effects.salute);
        if (effects.coherence) Game.changeStat('coherence', effects.coherence);
        if (effects.reputazione) Game.changeReputazione(effects.reputazione);
        if (effects.reputazioneNazionale) Game.changeReputazione(effects.reputazioneNazionale, 'nazionale');
        if (effects.repNazionale) Game.changeReputazione(effects.repNazionale, 'nazionale');
        if (effects.money) Game.changeMoney(effects.money);
        if (effects.intelligenza) Game.changeAttribute('intelligenza', effects.intelligenza);
        if (effects.carisma) Game.changeAttribute('carisma', effects.carisma);
        if (effects.muscoli) Game.changeAttribute('muscoli', effects.muscoli);
        if (effects.autenticita) Game.changeAttribute('autenticita', effects.autenticita);
        if (effects.followers) {
            if (!Game.state.social) Game.state.social = {};
            Game.state.social.followers = (Game.state.social.followers || 0) + effects.followers;
        }
    },

    runCitySpecificAction(actionId) {
        const action = this.getCitySpecificActions().find(a => a.id === actionId);
        if (!action) return;
        if (!Game.spendPhoneAction(1)) {
            Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
            return;
        }
        if ((action.cost || 0) > 0 && Game.state.money < action.cost) {
            Game.state.phoneActions++;
            Game.emit('phone-ap-change', { phoneAP: Game.state.phoneActions });
            Game.addWorkNotif('📵 Azione citta', `Fondi insufficienti per "${action.label}".`, `Giorno ${Game.state.day}`);
            return;
        }
        if (action.cost) Game.changeMoney(-action.cost);
        this.applyCityActionEffects(action.effects);
        Game.addWorkNotif('🌆 Azione citta', `${action.label} completata con successo.`, `Giorno ${Game.state.day}`);
        this.showPushNotif('🌆 Azione citta', action.label);
        this.refresh();
    },

    renderSocialTrend() {
        const box = document.getElementById('social-trend-box');
        if (!box) return;
        const s = Game.state.social || {};
        const labels = {
            crisi: '🔥 Crisi politica',
            ambiente: '💚 Ambiente',
            economia: '💼 Economia',
            solidarieta: '❤️ Solidarietà',
        };
        box.innerHTML = `
            <div class="trend-title">Trend del momento</div>
            <div class="trend-value">${s.trendKnown ? (labels[s.trendOfDay] || s.trendOfDay) : '❓ Sconosciuto'}</div>
            <div class="trend-followers">Followers: ${s.followers || 0}</div>
        `;
    },

    renderElectionHQ() {
        const box = document.getElementById('election-hq');
        if (!box) return;
        const e = Game.state.election || {};
        if (!e.active) {
            box.innerHTML = `
                <div class="election-title">🗳️ Election HQ</div>
                <div class="election-row"><button class="social-post-btn" data-eaction="start-comunali">Avvia Comunali</button>
                <button class="social-post-btn" data-eaction="start-regionali">Avvia Regionali</button>
                <button class="social-post-btn" data-eaction="start-nazionali">Avvia Nazionali</button></div>
            `;
            return;
        }

        const staff = e.staff || {};
        const pollInfo = staff.pollster ? `<div class="election-line">Sondaggi: Tu ${e.consensus.toFixed(1)}% | Rivale ${e.rivalConsensus.toFixed(1)}%</div>` : '';
        let controls = '';
        if (e.phase === 'prep') {
            controls = `
                <div class="election-row">
                    <button class="social-post-btn" data-eaction="prep-fundraise">💰 Fundraising</button>
                    <button class="social-post-btn" data-eaction="prep-build-list">📋 Costruisci lista</button>
                    <button class="social-post-btn" data-eaction="prep-slogan">🪧 Slogan</button>
                </div>
                <div class="election-row">
                    <button class="social-post-btn" data-eaction="hire-social" ${staff.socialManager ? 'disabled' : ''}>SMM €100</button>
                    <button class="social-post-btn" data-eaction="hire-organizer" ${staff.eventOrganizer ? 'disabled' : ''}>Organizz. €150</button>
                    <button class="social-post-btn" data-eaction="hire-spin" ${staff.spinDoctor ? 'disabled' : ''}>Spin €200</button>
                    <button class="social-post-btn" data-eaction="hire-pollster" ${staff.pollster ? 'disabled' : ''}>Pollster €100</button>
                </div>`;
        } else if (e.phase === 'campagna') {
            controls = `
                <div class="election-line">PA campagna: ${e.campaignAP}</div>
                <div class="election-row">
                    <button class="social-post-btn" data-eaction="camp-comizio">🎤 Comizio</button>
                    <button class="social-post-btn" data-eaction="camp-volantinaggio">📢 Volantinaggio</button>
                    <button class="social-post-btn" data-eaction="camp-tv">📺 TV</button>
                </div>
                <div class="election-row">
                    <button class="social-post-btn" data-eaction="camp-post">📱 Post virale</button>
                    <button class="social-post-btn" data-eaction="camp-elettori">🤝 Elettori</button>
                    <button class="social-post-btn" data-eaction="camp-attacco">⚔️ Attacco</button>
                </div>`;
        } else if (e.phase === 'dibattito') {
            controls = `
                <div class="election-line">Domande risposte: ${e.debateAnswered}/3</div>
                <div class="election-row">
                    <button class="social-post-btn" data-eaction="debate-program">A) Piano concreto</button>
                    <button class="social-post-btn" data-eaction="debate-attack">B) Attacco rivale</button>
                    <button class="social-post-btn" data-eaction="debate-facts">C) Lascio parlare i fatti</button>
                </div>`;
        } else if (e.phase === 'voto') {
            controls = `<div class="election-line">Urne aperte: risultato domani.</div>`;
        } else {
            controls = `<div class="election-line">Post-elezione in corso.</div>`;
        }

        box.innerHTML = `
            <div class="election-title">🗳️ Election HQ</div>
            <div class="election-line">Fase: ${e.phase} (giorno ${e.dayInPhase})</div>
            <div class="election-line">Consenso base: ${e.baseConsensus.toFixed(1)}%</div>
            ${pollInfo}
            ${controls}
        `;
    },

    initElectionButtons() {
        if (this._electionButtonsBound) return;
        this._electionButtonsBound = true;

        document.addEventListener('click', (ev) => {
            const btn = ev.target.closest('[data-eaction]');
            if (!btn) return;
            const action = btn.dataset.eaction;

            if (!Game.spendPhoneAction(1)) {
                Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                return;
            }

            if (action === 'start-comunali') Game.startElectionCampaign('comunali');
            else if (action === 'start-regionali') Game.startElectionCampaign('regionali');
            else if (action === 'start-nazionali') Game.startElectionCampaign('nazionali');
            else if (action === 'prep-fundraise') Game.runPreparationAction('fundraise');
            else if (action === 'prep-build-list') Game.runPreparationAction('build-list');
            else if (action === 'prep-slogan') Game.runPreparationAction('slogan');
            else if (action === 'hire-social') Game.hireCampaignStaff('socialManager');
            else if (action === 'hire-organizer') Game.hireCampaignStaff('eventOrganizer');
            else if (action === 'hire-spin') Game.hireCampaignStaff('spinDoctor');
            else if (action === 'hire-pollster') Game.hireCampaignStaff('pollster');
            else if (action === 'camp-comizio') Game.runCampaignAction('comizio');
            else if (action === 'camp-volantinaggio') Game.runCampaignAction('volantinaggio');
            else if (action === 'camp-tv') Game.runCampaignAction('tv');
            else if (action === 'camp-post') Game.runCampaignAction('post-virale');
            else if (action === 'camp-elettori') Game.runCampaignAction('elettori');
            else if (action === 'camp-attacco') Game.runCampaignAction('attacco');
            else if (action === 'debate-program') Game.runDebateChoice('program');
            else if (action === 'debate-attack') Game.runDebateChoice('attack');
            else if (action === 'debate-facts') Game.runDebateChoice('facts');

            this.refresh();
        });
    },

    renderSocial() {
        const feed = document.getElementById('social-feed');
        if (!feed) return;
        this.updateCitySocialMode();

        const posts = Game.state.socialPosts.slice(0, 8);

        // Fill with ideology-specific + general NPC posts
        if (posts.length < 6) {
            const ideology = Game.state.character.ideology;
            const ideoPosts = (this.IDEOLOGY_POSTS[ideology] || []).map(p => ({ ...p, isNPC: true, isIdeology: true }));
            const generalPosts = [...this.SOCIAL_POSTS_TEMPLATE].sort(() => Math.random() - 0.5);

            // Mix: 2 ideology posts + 2 general, shuffled
            const filler = [];
            filler.push(...ideoPosts.sort(() => Math.random() - 0.5).slice(0, 2));
            filler.push(...generalPosts.slice(0, 4 - filler.length));
            filler.sort(() => Math.random() - 0.5);
            filler.forEach(p => { if (posts.length < 6) posts.push(p); });
        }

        feed.innerHTML = posts.map(p => `
            <div class="social-post ${p.isPlayer ? 'player-post' : ''} ${p.postType === 'fire' ? 'fire-post' : ''} ${p.postType === 'formal' ? 'formal-post' : ''}">
                <div class="social-post-author">${this.esc(p.isPlayer ? '🫵 Tu' : p.author)}</div>
                <div class="social-post-text">${this.esc(p.text)}</div>
                <div class="social-post-meta">${p.outcome ? this.esc(p.outcome) : `❤️ ${p.likes || 0} like`}</div>
            </div>
        `).join('');

        // Update buttons
        const noPA = !Game.hasPhoneActions(1);
        document.querySelectorAll('.social-post-btn').forEach(btn => {
            btn.classList.toggle('task-no-ap', noPA);
        });
    },

    updateCitySocialMode() {
        const flags = Game.state.cityFlags || {};
        const settlement = flags.settlementType || 'city';

        const panelComune = document.getElementById('radio-locale-panel');
        const panelCity = document.getElementById('city-regional-panel');
        const panelMetro = document.getElementById('metropolis-media-panel');
        const panelCapital = document.getElementById('capital-regional-panel');

        if (panelComune) panelComune.classList.toggle('hidden', settlement !== 'comune');
        if (panelCity) panelCity.classList.toggle('hidden', settlement !== 'city');
        if (panelMetro) panelMetro.classList.toggle('hidden', settlement !== 'metropolis');
        if (panelCapital) panelCapital.classList.toggle('hidden', settlement !== 'capital');

        const commonSocial = ['btn-post-fire', 'btn-post-formal', 'btn-post-affondo'];
        commonSocial.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (settlement === 'comune') el.style.display = 'none';
            else el.style.display = '';
        });
    },

    initSocialBuzzButtons() {
        const btnFire = document.getElementById('btn-post-fire');
        const btnFormal = document.getElementById('btn-post-formal');
        if (btnFire && !btnFire._bound) {
            btnFire._bound = true;
            btnFire.addEventListener('click', () => this.publishPost('fire'));
        }
        if (btnFormal && !btnFormal._bound) {
            btnFormal._bound = true;
            btnFormal.addEventListener('click', () => this.publishPost('formal'));
        }
        const extraButtons = [
            { id: 'btn-post-emotional', type: 'emotional' },
            { id: 'btn-post-collab', type: 'collab' },
            { id: 'btn-post-annuncio', type: 'annuncio' },
            { id: 'btn-post-ricordo', type: 'ricordo' },
            { id: 'btn-post-investigativo', type: 'investigativo' },
            { id: 'btn-post-evento', type: 'evento' },
            { id: 'btn-post-affondo', type: 'affondo' },
        ];
        extraButtons.forEach(({ id, type }) => {
            const btn = document.getElementById(id);
            if (id === 'btn-post-affondo' && btn) {
                const enabled = !!(Game.state.flags && Game.state.flags.mentorPopulistPost);
                btn.style.display = enabled ? '' : 'none';
                if (!enabled) return;
            }
            if (btn && !btn._bound) {
                btn._bound = true;
                btn.addEventListener('click', () => this.publishPost(type));
            }
        });

        const specialButtons = [
            { id: 'btn-passaparola-comune', action: 'passaparola-comune', fail: 'Passaparola non disponibile ora.' },
            { id: 'btn-quotidiano-regionale', action: 'quotidiano-regionale', fail: 'Servono €30 o una citta media.' },
            { id: 'btn-inchiesta-civica', action: 'inchiesta-civica', fail: 'Inchiesta civica non disponibile qui.' },
            { id: 'btn-metropolis-manager', action: 'metropolis-media-manager', fail: 'Servono €200 e una metropoli.' },
            { id: 'btn-tgr-intervista', action: 'tgr-intervista', fail: 'Intervista TGR disponibile ogni 5 giorni.' },
            { id: 'btn-lobby-regionale', action: 'lobby-regionale', fail: 'Lobby regionale non disponibile o fondi insufficienti.' },
        ];
        specialButtons.forEach(({ id, action, fail }) => {
            const btn = document.getElementById(id);
            if (!btn || btn._bound) return;
            btn._bound = true;
            btn.addEventListener('click', () => {
                if (!Game.spendPhoneAction(1)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                const ok = Game.runCityPhoneAction ? Game.runCityPhoneAction(action) : false;
                if (!ok) {
                    Game.state.phoneActions++;
                    Game.emit('phone-ap-change', { phoneAP: Game.state.phoneActions });
                    Game.addWorkNotif('📵 Azione non riuscita', fail, `Giorno ${Game.state.day}`);
                }
                this.renderSocial();
            });
        });

        const askTrend = document.getElementById('btn-trend-ask');
        if (askTrend && !askTrend._bound) {
            askTrend._bound = true;
            askTrend.addEventListener('click', () => {
                if (!Game.spendPhoneAction(1)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                Game.revealTrend('giornalaio');
                this.renderSocialTrend();
            });
        }

        const paperTrend = document.getElementById('btn-trend-paper');
        if (paperTrend && !paperTrend._bound) {
            paperTrend._bound = true;
            paperTrend.addEventListener('click', () => {
                if (!Game.spendPhoneAction(1)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                if (Game.state.money < 2) {
                    Game.state.phoneActions++;
                    Game.emit('phone-ap-change', { phoneAP: Game.state.phoneActions });
                    Game.addWorkNotif('🗞️ Giornale', 'Non hai €2 per comprare il giornale.', `Giorno ${Game.state.day}`);
                    return;
                }
                Game.changeMoney(-2);
                Game.revealTrend('giornale');
                this.renderSocialTrend();
            });
        }
    },

    publishPost(type) {
        if (!Game.spendPhoneAction(1)) {
            Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
            return;
        }

        if (Game.applyIdeologyConsistencyPenalty) {
            Game.applyIdeologyConsistencyPenalty(`social:${type}`);
        }

        const pools = {
            fire: this.FIRE_POST_OUTCOMES,
            formal: this.FORMAL_POST_OUTCOMES,
            emotional: this.EMOTIONAL_POST_OUTCOMES,
            collab: this.COLLAB_POST_OUTCOMES,
            annuncio: this.ANNOUNCIO_POST_OUTCOMES,
            ricordo: this.RICORDO_POST_OUTCOMES,
            investigativo: this.INVESTIGATIVO_POST_OUTCOMES,
            evento: this.EVENTO_POST_OUTCOMES,
            affondo: this.AFFONDO_POPULISTA_OUTCOMES,
        };
        const pool = pools[type] || this.FORMAL_POST_OUTCOMES;
        const outcome = pool[Math.floor(Math.random() * pool.length)];
        const targetEl = document.getElementById('social-target');
        const target = targetEl ? targetEl.value : 'all';

        if (!Game.state.socialMemory) {
            Game.state.socialMemory = {
                typeCounts: {},
                recentTypes: [],
                narrativeLabel: 'in evoluzione',
                loyalFollowerUnlocked: {},
            };
        }

        if (type === 'evento') {
            if (Game.state.money < 50) {
                Game.state.phoneActions++;
                Game.emit('phone-ap-change', { phoneAP: Game.state.phoneActions });
                Game.addWorkNotif('🎉 Evento', 'Servono €50 per organizzare un evento.', `Giorno ${Game.state.day}`);
                return;
            }
            Game.changeMoney(-50);
        }

        // Ideology + election staff social multipliers
        const ideoClass = Game.getIdeologyClass();
        let socialMultiplier = ideoClass.socialBonus || 1;
        if (Game.state.election && Game.state.election.active && Game.state.election.staff && Game.state.election.staff.socialManager) {
            socialMultiplier *= 1.3;
        }

        // Populista malus: formal posts get -50% rep and -10 coherence
        const isPopulistaFormal = (Game.state.character.ideology === 'populista' && type === 'formal');
        const repMultiplier = isPopulistaFormal ? 0.5 : socialMultiplier;

        let repDelta = outcome.effects.reputazione ? Math.round(outcome.effects.reputazione * repMultiplier) : 0;
        let natDelta = outcome.effects.reputazioneNazionale || 0;

        const cityFlags = Game.state.cityFlags || {};
        const settlement = cityFlags.settlementType || 'city';
        if (settlement === 'comune') {
            repDelta = Math.round(repDelta * 2);
            natDelta = 0;
        } else if (settlement === 'metropolis') {
            natDelta = Math.round(natDelta * 1.5);
        }
        if (settlement === 'metropolis' && Game.state.flags && Game.state.flags.metroSocialManagerUntil >= Game.state.day) {
            if (!Game.state.social) Game.state.social = { followers: 80 };
            Game.state.social._metroFollowerBoost = true;
        } else if (Game.state.social) {
            Game.state.social._metroFollowerBoost = false;
        }

        if (target === 'contacts') {
            repDelta = 0;
            (Game.state.contacts || []).forEach(c => {
                c.relation = Math.min(100, c.relation + 10);
            });
        } else if (target === 'moderates') {
            if (type === 'formal') repDelta = Math.round(repDelta * 1.5);
        } else if (target === 'base') {
            if (type === 'fire' || type === 'formal' || type === 'ricordo') {
                Game.changeStat('coherence', 10);
            }
        } else if (target === 'journalists') {
            natDelta += 5;
            if (Math.random() < 0.35) {
                Game.addWorkNotif('📰 Rimbalzo Media', 'Un giornalista riprende il tuo post: reputazione nazionale +8.', `Giorno ${Game.state.day}`);
                natDelta += 8;
            }
        }

        const followersBonus = Game.getFollowersViralBonus ? Game.getFollowersViralBonus() : { viral: 0, rep: 0 };
        if (repDelta !== 0) {
            repDelta = Math.round(repDelta * (1 + followersBonus.rep));
            Game.changeReputazione(repDelta);
        }
        if (natDelta !== 0) Game.changeReputazione(natDelta, 'nazionale');
        const allianceBonus = Game.getAllianceBonusSummary ? Game.getAllianceBonusSummary() : null;
        if (allianceBonus && allianceBonus.socialRepFlat > 0) {
            Game.changeReputazione(allianceBonus.socialRepFlat);
            Game.addWorkNotif('📰 Alleati Media', `I tuoi alleati giornalisti amplificano il post: Reputazione +${allianceBonus.socialRepFlat}.`, `Giorno ${Game.state.day}`);
        }
        const metroMitigation = (Game.state.flags && Game.state.flags.metroSocialManagerUntil >= Game.state.day) ? 0.8 : 1;
        let stressDelta = outcome.effects.stress || 0;
        if (type === 'fire') {
            const fireStressMult = (typeof GameConstants !== 'undefined' && GameConstants.BALANCE)
                ? GameConstants.BALANCE.FIRE_POST_STRESS_MULTIPLIER
                : 0.85;
            stressDelta = Math.round(stressDelta * fireStressMult);
        }
        if (stressDelta) Game.changeStat('stress', Math.round(stressDelta * metroMitigation));
        if (outcome.effects.morale) Game.changeStat('morale', outcome.effects.morale);
        if (outcome.effects.stanchezza) Game.changeStat('stanchezza', outcome.effects.stanchezza);
        if (outcome.effects.coherence) Game.changeStat('coherence', outcome.effects.coherence);
        if (outcome.effects.carisma) Game.changeAttribute('carisma', outcome.effects.carisma);

        // Contact reactions to posts
        const contacts = Game.state.contacts || [];
        if (contacts.length > 0) {
            const sample = contacts.slice().sort(() => Math.random() - 0.5).slice(0, Math.min(3, contacts.length));
            sample.forEach(c => {
                const stance = Game.getCoalitionStance(Game.state.character.ideology, c.ideology);
                const delta = stance === 'amico' ? 2 : (stance === 'nemico' ? -3 : 0);
                if (delta !== 0) c.relation = Math.max(0, Math.min(100, c.relation + delta));
            });
        }

        // Viral propagation formula (base 5% + modifiers, clamped 1%-40%)
        const timeMod = Game.state.calendar.timeOfDay === 2 ? 0.1 : (Game.state.calendar.timeOfDay === 0 ? -0.05 : 0);
        const typeMods = { fire: 0.3, formal: -0.1, emotional: 0.1, collab: 0.05, annuncio: 0.1, ricordo: 0.05, investigativo: 0.25, evento: 0.15, affondo: 0.32 };
        const controversyMod = (type === 'investigativo' || type === 'fire') ? 0.2 : (type === 'formal' ? -0.05 : 0);

        const trend = (Game.state.social && Game.state.social.trendOfDay) || 'crisi';
        let trendMod = 0;
        if (trend === 'crisi' && type === 'fire') trendMod = 0.2;
        else if (trend === 'ambiente' && (type === 'collab' || type === 'formal')) trendMod = 0.3;
        else if (trend === 'economia' && (type === 'annuncio' || type === 'investigativo')) trendMod = 0.2;
        else if (trend === 'solidarieta' && type === 'emotional') trendMod = 0.25;

        let viralChance = 0.05 + (typeMods[type] || 0) + timeMod + (followersBonus.viral || 0) + controversyMod + trendMod;
        viralChance = Math.max(0.01, Math.min(0.4, viralChance));

        const roll = Math.random();
        let viralLevel = 'normale';
        let multiplier = 1;
        if (roll < viralChance * 0.35) {
            viralLevel = 'virale';
            multiplier = 10;
        } else if (roll < viralChance * 0.8) {
            viralLevel = 'tendenza';
            multiplier = 5;
        } else if (roll > 0.9) {
            viralLevel = 'flop';
            multiplier = 0.5;
        }

        const bonusRep = Math.round((repDelta || 0) * (multiplier - 1));
        const bonusNat = Math.round((natDelta || 0) * (multiplier - 1));
        const baseStress = outcome.effects.stress || 0;
        const viralStressDelta = Math.max(0, Math.round(baseStress * multiplier) - baseStress);
        const cohBase = outcome.effects.coherence || 0;
        const cohDelta = Math.round(cohBase * multiplier) - cohBase;

        if (bonusRep) Game.changeReputazione(bonusRep);
        if (bonusNat) Game.changeReputazione(bonusNat, 'nazionale');
        if (viralStressDelta) Game.changeStat('stress', Math.round(viralStressDelta * metroMitigation));
        if (cohDelta) Game.changeStat('coherence', cohDelta);

        if (Game.state.social) {
            const followerMult = Game.state.social._metroFollowerBoost ? 1.5 : 1;
            if (viralLevel === 'virale') Game.state.social.followers += Math.round((200 + Math.floor(Math.random() * 301)) * followerMult);
            else if (viralLevel === 'tendenza') Game.state.social.followers += Math.round((50 + Math.floor(Math.random() * 51)) * followerMult);
            else Game.state.social.followers += Math.round((5 + Math.floor(Math.random() * 16)) * followerMult);
        }

        if (viralLevel === 'virale') {
            if (Math.random() < 0.4) Game.addWorkNotif('📰 Intervista Richiesta', 'Una TV nazionale ti invita in studio.', `Giorno ${Game.state.day}`);
            if (Math.random() < 0.3) Game.addUrgentMessage('Nuovo sostenitore', 'Voglio unirmi alla tua squadra. Parliamone.', 'ally');
            if (Math.random() < 0.25) Game.addUrgentMessage('Rivale politico', 'Ti demolirò in pubblico dopo questo post.', 'enemy');
            if (Math.random() < 0.2) {
                const donation = 200 + Math.floor(Math.random() * 801);
                Game.changeMoney(donation);
                Game.addWorkNotif('💰 Donazione', `Un sostenitore ha donato €${donation}.`, `Giorno ${Game.state.day}`);
            }
            if (Math.random() < 0.15 && !(Game.state.mafia && Game.state.mafia.active)) {
                Game.addUrgentMessage('Numero sconosciuto', 'Totò ha notato la tua visibilità. Vuole incontrarti.', 'mafia');
            }
            if ((type === 'fire' || type === 'investigativo') && Math.random() < 0.1) {
                Game.changeMoney(-150);
                Game.addWorkNotif('🚔 Indagine', 'Un esposto è stato presentato dopo il post estremo.', `Giorno ${Game.state.day}`);
            }
        }

        if (type === 'affondo') {
            const mentor = Game.state.flags && Game.state.flags.mentor;
            if (mentor && mentor.id === 'beppe') {
                mentor.populistPosts = (mentor.populistPosts || 0) + 1;
                if (mentor.populistPosts >= 3 && !mentor.oneShot.inchiestaPopulista) {
                    mentor.oneShot.inchiestaPopulista = true;
                    Game.addUrgentMessage('Giornalista d\'inchiesta', 'Dopo diversi affondi populisti parte un\'inchiesta su di te.', 'enemy');
                    if (Math.random() < 0.5) Game.changeReputazione(-12);
                    else Game.changeMoney(-350);
                }
            }
        }

        const sm = Game.state.socialMemory;
        sm.typeCounts[type] = (sm.typeCounts[type] || 0) + 1;
        sm.recentTypes.push(type);
        if (sm.recentTypes.length > 8) sm.recentTypes.shift();

        const fireCount = (sm.typeCounts.fire || 0) + (sm.typeCounts.affondo || 0);
        const formalCount = (sm.typeCounts.formal || 0) + (sm.typeCounts.collab || 0) + (sm.typeCounts.annuncio || 0);
        if (fireCount >= 10) sm.narrativeLabel = 'populista';
        else if (formalCount >= 10) sm.narrativeLabel = 'istituzionale';
        if (fireCount >= 5 && formalCount >= 5) {
            sm.narrativeLabel = 'inaffidabile';
            Game.changeStat('coherence', -2);
            Game.addWorkNotif('🧩 Linea editoriale confusa', 'Alterni toni opposti: la tua coerenza pubblica ne risente.', `Giorno ${Game.state.day}`);
        }

        if ((sm.typeCounts[type] || 0) >= 10 && !sm.loyalFollowerUnlocked[type]) {
            sm.loyalFollowerUnlocked[type] = true;
            const followerByType = {
                fire: { name: 'Ruggiero Fiamma', role: 'Attivista Social', emoji: '🔥', ideology: 'populista', bio: 'Ti segue per i post piu aggressivi e difende ogni tua uscita.' },
                affondo: { name: 'Dora Affondo', role: 'Commentatrice', emoji: '📢', ideology: 'populista', bio: 'Ama i tuoi attacchi frontali e ti supporta nei dibattiti online.' },
                formal: { name: 'Avv. Silvia Carta', role: 'Professionista', emoji: '🏛️', ideology: 'centro', bio: 'Apprezza toni istituzionali e precisione nei messaggi pubblici.' },
                collab: { name: 'Marco Ponte', role: 'Mediatore Civico', emoji: '🤝', ideology: 'centro', bio: 'Crede nelle collaborazioni trasversali e diffonde i tuoi post concilianti.' },
                annuncio: { name: 'Elisa Programma', role: 'Organizzatrice', emoji: '📣', ideology: 'centro', bio: 'Condivide ogni annuncio pratico e mobilita piccoli gruppi locali.' },
                emotional: { name: 'Chiara Cuore', role: 'Volontaria', emoji: '💗', ideology: 'estrema-sinistra', bio: 'Resta colpita dai messaggi personali e porta nuovi simpatizzanti.' },
                ricordo: { name: 'Pietro Memoria', role: 'Storico Locale', emoji: '🕯️', ideology: 'centro', bio: 'Valorizza memoria civica e racconta in giro la tua continuita ideale.' },
                investigativo: { name: 'Nadia Verita', role: 'Blogger', emoji: '🔍', ideology: 'tecnocrate', bio: 'Condivide inchieste e smonta i tuoi avversari con i dettagli.' },
                evento: { name: 'Gigi Piazza', role: 'Volontario Eventi', emoji: '🎉', ideology: 'centro', bio: 'Dopo i tuoi eventi organizza una rete di presenze ricorrenti.' },
            };
            const follower = followerByType[type] || {
                name: 'Follower Leale',
                role: 'Sostenitore',
                emoji: '📱',
                ideology: Game.state.character.ideology,
                bio: 'Ti segue con costanza e amplifica i tuoi messaggi.',
            };
            const existing = (Game.state.contacts || []).some(c => c.name === follower.name);
            if (!existing) {
                const stance = Game.getCoalitionStance(Game.state.character.ideology, follower.ideology);
                Game.state.contacts.push({
                    ...follower,
                    relation: 45,
                    loyalty: 55,
                    betrayed: false,
                    favorite: false,
                    canAlly: stance !== 'nemico',
                    coalitionStance: stance,
                    source: 'social-loyal-follower',
                    hiddenGoal: Math.random() < 0.2 ? 'carriera' : 'lealta',
                });
                Game.addWorkNotif('🧑‍💻 Follower Leale', `${follower.name} entra nella tua rete contatti grazie alla tua linea ${type}.`, `Giorno ${Game.state.day}`);
                this.showPushNotif(`Nuovo contatto: ${follower.name}`, 'Un follower costante vuole aiutarti dietro le quinte.');
            }
        }

        // Populista formal post penalty
        if (isPopulistaFormal) {
            Game.changeStat('coherence', -10);
            Game.addWorkNotif('😤 Base Tradita!', 'I tuoi elettori non capiscono questi toni istituzionali. Coerenza -10.', `Giorno ${Game.state.day}`);
        }

        Game.state.socialPosts.unshift({
            author: 'Tu',
            text: outcome.text,
            outcome: `${outcome.outcome} • Target: ${target} • Esito: ${viralLevel.toUpperCase()} x${multiplier}`,
            isPlayer: true,
            postType: type,
            likes: Math.floor(Math.random() * 500),
        });

        if (Game.state.socialPosts.length > 15) Game.state.socialPosts.pop();

        if (typeof Audio !== 'undefined' && Audio.playPost) Audio.playPost();
        const iconMap = {
            affondo: '📢',
            fire: '🔥',
            formal: '🏛️',
            emotional: '😢',
            collab: '🤝',
            annuncio: '📢',
            ricordo: '🕯️',
            investigativo: '🔍',
            evento: '🎉',
        };
        Game.addWorkNotif(`📱 Social Buzz (${iconMap[type] || '📰'})`, outcome.outcome, `Giorno ${Game.state.day}`);
        this.renderSocial();
    },

    // ====== URGENTI TAB ======
    renderUrgenti() {
        const container = document.getElementById('urgenti-list');
        if (!container) return;
        const msgs = Game.state.urgentMessages;
        if (msgs.length === 0) {
            container.innerHTML = '<p class="empty-list">📭 Nessun messaggio urgente.</p>';
            // Still show pending favors even without urgent messages
            if (typeof Favors !== 'undefined' && Favors.renderFavorsInUrgenti) {
                Favors.renderFavorsInUrgenti(container);
            }
            return;
        }
        container.innerHTML = msgs.map(m => {
            const choices = this.getUrgentChoices(m);
            const buttons = !m.handled
                ? choices.map(ch => `<button class="urgent-choice" data-id="${m.id}" data-choice="${ch.id}">${ch.label}<span class="urgent-choice-preview">${this.esc(ch.preview || '')}</span></button>`).join('')
                : '<span class="urgent-read">✓ Gestito</span>';
            return `
            <div class="urgent-msg ${m.handled ? 'handled' : ''} urgent-${m.type}">
                <div class="urgent-header">
                    <span class="urgent-from">${this.esc(m.from)}</span>
                    <span class="urgent-day">Giorno ${m.day}</span>
                </div>
                <div class="urgent-text">${this.esc(m.text)}</div>
                <div class="urgent-choices-row">${buttons}</div>
            </div>`;
        }).join('');

        container.querySelectorAll('.urgent-choice').forEach(btn => {
            btn.addEventListener('click', () => {
                const msg = msgs.find(m => String(m.id) === String(btn.dataset.id));
                if (!msg || msg.handled) return;
                if (!Game.spendPhoneAction(1)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                this.applyUrgentChoice(msg, btn.dataset.choice);
                msg.handled = true;
                this.renderUrgenti();
                this.updateBadge();
            });
        });

        // Hook: append pending favors
        if (typeof Favors !== 'undefined' && Favors.renderFavorsInUrgenti) {
            Favors.renderFavorsInUrgenti(container);
        }
    },

    getUrgentChoices(msg) {
        const from = String(msg.from || '').toLowerCase();
        const allied = (Game.state.contacts || []).find(c => c.name === msg.from && c.alliance && c.alliance.active);

        if (/toto|totò/.test(from) || msg.type === 'mafia') {
            return [
                { id: 'go', label: '🚶 Vado', preview: 'Rispetto Criminale +10 | Rischio Indagini +5' },
                { id: 'refuse', label: '🙅 Non posso', preview: 'Relazione con Totò -15' },
                { id: 'police', label: '🚔 Segnalo alla polizia', preview: 'Reputazione +15 | Rischio scoperta' },
            ];
        }
        if (msg.type === 'boss' || /capo/.test(from)) {
            return [
                { id: 'boss-ok', label: '✅ Ok, lo faccio', preview: 'Stanchezza +10 | Carriera +5' },
                { id: 'boss-no', label: '❌ Non posso, ho un comizio', preview: 'Relazione capo -15 | Politica bloccata 2 turni' },
                { id: 'boss-pay', label: '💸 Pago qualcuno (€50)', preview: '-€50 | Nessun malus ora | controllo qualità dopo 3 giorni' },
            ];
        }
        if (allied || msg.type === 'ally') {
            return [
                { id: 'ally-deny', label: '🗣️ Smentisco pubblicamente', preview: 'Reputazione +5 | Stress +8' },
                { id: 'ally-ignore', label: '🤫 Ignoriamo, passerà', preview: 'Reputazione -3 | Stress -5' },
                { id: 'ally-sue', label: '⚖️ Querelo per diffamazione', preview: '-€150 | 40% vinci: Rep +15 | 60% perdi: -€300' },
            ];
        }
        if (msg.type === 'enemy') {
            return [
                { id: 'enemy-panic', label: '😰 Panico', preview: 'Stress +15 | Coerenza -5' },
                { id: 'enemy-ignore', label: '🧊 Ignoro, è un bluff', preview: 'Stress +5 | rischio effetti tra 5 giorni' },
                { id: 'enemy-counter', label: '⚔️ Contro-minaccia', preview: '-€100 | 70% si calma | 30% stress +20' },
            ];
        }
        return [{ id: 'read', label: '✓ Letto', preview: 'Nessun effetto' }];
    },

    applyUrgentChoice(msg, choiceId) {
        const from = String(msg.from || '').toLowerCase();
        if (choiceId === 'boss-ok') {
            Game.changeStat('stanchezza', 10);
            Game.state.career.promotionProgress = Math.min(100, Game.state.career.promotionProgress + 5);
            Game.addWorkNotif('📩 Urgente (Capo)', 'Hai preso in carico il report: carriera +5.', `Giorno ${Game.state.day}`);
            return;
        }
        if (choiceId === 'boss-no') {
            const boss = (Game.state.contacts || []).find(c => /capo/i.test(c.role || ''));
            if (boss) boss.relation = Math.max(0, boss.relation - 15);
            Game.state.flags.politicalBlockedTurns = Math.max(Game.state.flags.politicalBlockedTurns || 0, 2);
            Game.state.flags.politicalBlocked = true;
            Game.addWorkNotif('📩 Urgente (Capo)', 'Hai rifiutato: politica bloccata per 2 turni.', `Giorno ${Game.state.day}`);
            return;
        }
        if (choiceId === 'boss-pay') {
            if (Game.state.money < 50) {
                Game.addWorkNotif('📩 Urgente (Capo)', 'Non hai €50 per delegare il report.', `Giorno ${Game.state.day}`);
                return;
            }
            Game.changeMoney(-50);
            Game.scheduleDelayedConsequence(3, 'Controllo qualità report', 'urgent-paid-someone-quality', { from: msg.from });
            Game.addWorkNotif('📩 Urgente (Capo)', 'Hai pagato qualcuno: esito qualità tra 3 giorni.', `Giorno ${Game.state.day}`);
            return;
        }

        if (choiceId === 'ally-deny') {
            Game.changeReputazione(5);
            Game.changeStat('stress', 8);
            return;
        }
        if (choiceId === 'ally-ignore') {
            Game.changeReputazione(-3);
            Game.changeStat('stress', -5);
            return;
        }
        if (choiceId === 'ally-sue') {
            if (Game.state.money < 150) {
                Game.addWorkNotif('⚖️ Diffamazione', 'Non hai fondi per la querela (€150).', `Giorno ${Game.state.day}`);
                return;
            }
            Game.changeMoney(-150);
            if (Math.random() < 0.4) {
                Game.changeReputazione(15);
                Game.addWorkNotif('⚖️ Vittoria legale', 'Hai vinto la causa per diffamazione.', `Giorno ${Game.state.day}`);
            } else {
                Game.changeMoney(-300);
                Game.addWorkNotif('⚖️ Causa persa', 'Hai perso la causa: spese legali extra -€300.', `Giorno ${Game.state.day}`);
            }
            return;
        }

        if (choiceId === 'enemy-panic') {
            Game.changeStat('stress', 15);
            Game.changeStat('coherence', -5);
            return;
        }
        if (choiceId === 'enemy-ignore') {
            Game.changeStat('stress', 5);
            Game.scheduleDelayedConsequence(5, 'Ritorno prove rivale', 'urgent-enemy-ignore-rebound', { from: msg.from });
            return;
        }
        if (choiceId === 'enemy-counter') {
            if (Game.state.money < 100) {
                Game.addWorkNotif('⚔️ Contro-minaccia', 'Ti servono €100 per avvocato/contatti.', `Giorno ${Game.state.day}`);
                return;
            }
            Game.changeMoney(-100);
            if (Math.random() >= 0.7) {
                Game.changeStat('stress', 20);
            }
            Game.scheduleDelayedConsequence(2, 'Reazione del rivale', 'urgent-enemy-counter-react', { from: msg.from });
            return;
        }

        if (/toto|totò/.test(from) || choiceId === 'go' || choiceId === 'refuse' || choiceId === 'police') {
            const m = Game.state.mafia;
            const toto = (Game.state.contacts || []).find(c => /toto|totò/i.test(c.name || ''));
            if (choiceId === 'go') {
                m.rispettoCriminale = Math.min(100, (m.rispettoCriminale || 0) + 10);
                m.rischioIndagini = Math.min(100, (m.rischioIndagini || 0) + 5);
                return;
            }
            if (choiceId === 'refuse') {
                if (toto) toto.relation = Math.max(0, toto.relation - 15);
                m.favorsDeclined = (m.favorsDeclined || 0) + 1;
                if (m.favorsDeclined >= 3) {
                    m.active = false;
                    m.rank = 0;
                    Game.addWorkNotif('🕳️ Espulso dal giro', 'Hai rifiutato troppe convocazioni mafiose.', `Giorno ${Game.state.day}`);
                }
                return;
            }
            if (choiceId === 'police') {
                Game.changeReputazione(15);
                m.segnalatoPolizia = true;
                if (Math.random() < 0.4) {
                    Game.triggerGameOver('Totò scopre la tua soffiata alla polizia. La vendetta è immediata.');
                }
                return;
            }
        }
    },

    onUrgentMessage(msg) {
        this.showPushNotif(`📩 ${msg.from}`, msg.text);
        this.updateBadge();
        // Phone vibration animation
        const phoneItem = document.getElementById('item-phone');
        if (phoneItem) {
            phoneItem.classList.add('phone-vibrating');
            Scheduler.timeout(() => phoneItem.classList.remove('phone-vibrating'), 800, { group: 'phone', label: 'vibrate' });
        }
    },

    // ====== PUSH NOTIFICATION ======
    showPushNotif(title, body) {
        document.querySelectorAll('.phone-push-notif').forEach(n => n.remove());
        const notif = document.createElement('div');
        notif.className = 'phone-push-notif';
        notif.innerHTML = `
            <div class="push-title">${this.esc(title)}</div>
            <div class="push-body">${this.esc(body)}</div>
        `;
        // If the phone panel is open, show notification inside the panel
        const panel = document.getElementById('panel-phone');
        if (panel && !panel.classList.contains('hidden')) {
            panel.appendChild(notif);
        } else {
            const phoneDevice = document.querySelector('#item-phone .phone-device');
            if (phoneDevice) {
                phoneDevice.appendChild(notif);
            } else {
                document.getElementById('screen-desk').appendChild(notif);
            }
        }
        notif.addEventListener('click', () => notif.remove());
        Scheduler.timeout(() => { if (notif.parentNode) notif.remove(); }, 4000, { group: 'phone', label: 'notif-dismiss' });
    },

    // ====== TAB POLITICA — Centro Politico Avanzato ======
    renderPolitica() {
        const container = document.getElementById('politica-content');
        if (!container) return;

        const adv = (typeof Politics !== 'undefined' && Politics.getAdvancedStats)
            ? Politics.getAdvancedStats()
            : { political: {}, social: {}, criminal: {} };
        const pol = adv.political || {};
        const soc = adv.social || {};
        const crim = adv.criminal || {};

        const party = Game.state.party;
        const partyName = party ? (party.name || party.id || '—') : '—';
        const partyIcon = party ? (party.icon || '🏛️') : '🏛️';
        const partyLogoPath = party && party._partyData && party._partyData.logo ? party._partyData.logo : (party && party.logo ? party.logo : null);
        const career = Game.state.politicalCareer || {};
        const careerLevels = ['Militante', 'Capo Sezione', 'Consigliere', 'Assessore', 'Sindaco / Deputato'];
        const careerLabel = careerLevels[career.level || 0] || 'Militante';
        const progress = Math.round(career.progress || 0);

        const trustPen = (typeof Politics !== 'undefined' && Politics.getCurrentTrustPenalty)
            ? Math.round(Politics.getCurrentTrustPenalty() * 100) : 0;
        const speedPen = (typeof Politics !== 'undefined' && Politics.getCurrentSpeedPenalty)
            ? Math.round(Politics.getCurrentSpeedPenalty() * 100) : 0;

        const noPA = !Game.hasPhoneActions(1);
        const noAP = !Game.hasActionPoints(1);
        const dualState = (typeof Nations !== 'undefined' && Nations.getDualNationalityState)
            ? Nations.getDualNationalityState()
            : { active: false, secondaryNationId: null, durationDays: 60, startedDay: 0 };
        const dualRemaining = (typeof Nations !== 'undefined' && Nations.getDualNationalityRemainingDays)
            ? Nations.getDualNationalityRemainingDays()
            : 0;
        const dualCosts = (typeof Nations !== 'undefined' && Nations.getDualNationalityDailyCosts)
            ? Nations.getDualNationalityDailyCosts()
            : { coherence: 20, money: 5000 };
        const dualEndDay = Number(dualState.startedDay || 0) + Number(dualState.durationDays || 60);
        const dualCriticalClass = dualState.active
            ? (dualRemaining <= 3 ? 'politica-dual-critical-danger' : (dualRemaining <= 10 ? 'politica-dual-critical-warning' : ''))
            : '';
        const canUseDual = (typeof Nations !== 'undefined' && Nations.isNationChangeProActive)
            ? Nations.isNationChangeProActive()
            : false;
        const currentNationId = Game.state.nation && Game.state.nation.id ? Game.state.nation.id : 'italy';
        const unlockedNationIds = (typeof Nations !== 'undefined' && Nations.getUnlockedNationSet)
            ? Nations.getUnlockedNationSet()
            : ['italy', 'france', 'germany', 'uk'];
        const dualCandidates = unlockedNationIds
            .filter(nid => nid && nid !== currentNationId)
            .map(nid => {
                const nMeta = (typeof Nations !== 'undefined' && Nations.getNation) ? Nations.getNation(nid) : null;
                return { id: nid, label: (nMeta && nMeta.name) ? nMeta.name : nid.toUpperCase() };
            });
        const activeDualNationName = dualState.secondaryNationId
            ? ((typeof Nations !== 'undefined' && Nations.getNation && Nations.getNation(dualState.secondaryNationId)) || { name: dualState.secondaryNationId.toUpperCase() }).name
            : '—';

        const fallbackMechanicsCatalog = [
            { id: 'ngo_pressure', label: 'Pressione NGO', logo: 'photos/mechanics/ngo_pressure.svg' },
            { id: 'ngo_deals', label: 'Accordi NGO', logo: 'photos/mechanics/ngo_deals.svg' },
            { id: 'ngo_reputation', label: 'Reputazione NGO', logo: 'photos/mechanics/ngo_reputation.svg' },
            { id: 'ngo_scandal', label: 'Scandalo NGO', logo: 'photos/mechanics/ngo_scandal.svg' },
            { id: 'ngo_lobby', label: 'Lobby NGO', logo: 'photos/mechanics/ngo_lobby.svg' },
        ];
        const mechanicsCatalog = this._getMechanicsCatalog(fallbackMechanicsCatalog);

        const _pct = (v) => Math.round((v || 0) * 100);
        const _bar = (icon, label, pct, color) => `
            <div class="politica-stat-row">
                <span class="politica-stat-icon">${icon}</span>
                <div class="politica-stat-info">
                    <div class="politica-stat-header">
                        <span class="politica-stat-label">${label}</span>
                        <span class="politica-stat-val">${pct}%</span>
                    </div>
                    <div class="stats-bar-track">
                        <div class="stats-bar-fill" style="width:${pct}%;background:${color}"></div>
                    </div>
                </div>
            </div>`;

        let html = `
        <div class="politica-section">
            <div class="politica-section-title">🏛️ Carriera Politica</div>
            <div class="politica-party-badge">
                ${partyIcon} <strong>${this.esc(partyName)}</strong>
                <span class="politica-career-level">${this.esc(careerLabel)}</span>
                <span id="politica-party-logo-slot"></span>
            </div>
            <div class="politica-progress-row">
                <span>Avanzamento:</span>
                <div class="stats-bar-track" style="flex:1;margin:0 8px">
                    <div class="stats-bar-fill" style="width:${progress}%;background:#8b5cf6"></div>
                </div>
                <span>${progress}%</span>
            </div>
            ${trustPen > 0 ? `<div class="politica-malus-banner">🔄 Adattamento nazione: -${trustPen}% fiducia, -${speedPen}% velocità</div>` : ''}
        </div>

        <div class="politica-section">
            <div class="politica-section-title">📊 Profilo Avanzato</div>
            ${_bar('🎯', 'Influenza nel Partito', _pct(pol.partyInfluence), '#8b5cf6')}
            ${_bar('📢', 'Supporto Pubblico', _pct(pol.publicSupport), '#3b82f6')}
            ${_bar('🌍', 'Rep. Internazionale', _pct(pol.internationalReputation), '#06b6d4')}
            ${_bar('📜', 'Abilità Legislativa', _pct(pol.legislativeSkill), '#10b981')}
            ${_bar('✨', 'Carisma Sociale', _pct(soc.charisma), '#f59e0b')}
            ${_bar('🗣️', 'Negoziazione', _pct(soc.negotiation), '#ef4444')}
            ${_bar('🔗', 'Rete di Lealtà', _pct(soc.loyaltyNetwork), '#ec4899')}
        </div>

        <div class="politica-section">
            <div class="politica-section-title">⚡ Azioni Politiche</div>
            <div class="politica-actions-grid">
                <button class="politica-action-btn" id="pol-act-meeting" ${noPA || noAP ? 'disabled' : ''}
                    data-preview="1 📱 + 1 ⚡ | +4% Influenza | +2 Rep. locale">
                    🤝 Riunione di Partito
                    <span class="phone-cost-badge">1 📱</span><span class="task-ap-cost">1 ⚡</span>
                </button>
                <button class="politica-action-btn" id="pol-act-speech" ${noPA || noAP ? 'disabled' : ''}
                    data-preview="1 📱 + 1 ⚡ | +6% Supporto Pubblico | ±Stress">
                    🎤 Discorso Pubblico
                    <span class="phone-cost-badge">1 📱</span><span class="task-ap-cost">1 ⚡</span>
                </button>
                <button class="politica-action-btn" id="pol-act-lobby" ${noPA ? 'disabled' : ''}
                    data-preview="1 📱 | +3% Influenza | -€50">
                    🏛️ Lobbying (€50)
                    <span class="phone-cost-badge">1 📱</span>
                </button>
                <button class="politica-action-btn" id="pol-act-legislation" ${noPA || noAP || _pct(pol.partyInfluence) < 20 ? 'disabled' : ''}
                    data-preview="Richiede ≥20% influenza | +5% Abilità Legis. | +3 Rep.">
                    📜 Proponi Proposta
                    <span class="phone-cost-badge">1 📱</span><span class="task-ap-cost">1 ⚡</span>
                </button>
                <button class="politica-action-btn" id="pol-act-intl" ${noPA || _pct(pol.internationalReputation) < 10 ? 'disabled' : ''}
                    data-preview="Richiede ≥10% Rep. Intl | +4% Rep. Intl | +2 Rep. Naz.">
                    🌍 Contatto Internazionale
                    <span class="phone-cost-badge">1 📱</span>
                </button>
                <button class="politica-action-btn" id="pol-act-network" ${noPA ? 'disabled' : ''}
                    data-preview="1 📱 | +4% Rete Lealtà | +5 Morale">
                    🔗 Consolida Rete
                    <span class="phone-cost-badge">1 📱</span>
                </button>
            </div>
        </div>

        <div class="politica-section politica-section-dual">
            <div class="politica-section-title">🛂 Doppia Cittadinanza</div>
            ${canUseDual ? `
            <div class="politica-dual-row"><span>Stato</span><strong>${dualState.active ? 'Attiva' : 'Disattiva'}</strong></div>
            <div class="politica-dual-row"><span>Nazione secondaria</span><strong>${this.esc(activeDualNationName)}</strong></div>
            <div class="politica-dual-row ${dualCriticalClass}"><span>Timer</span><strong>${dualState.active ? `${dualRemaining} giorni rimanenti` : '60 giorni (alla prossima attivazione)'}</strong></div>
            <div class="politica-dual-row ${dualCriticalClass}"><span>Scadenza</span><strong>${dualState.active ? `Giorno ${dualEndDay}` : 'Da definire all\'attivazione'}</strong></div>
            <div class="politica-dual-costs">Costo giornaliero: <strong>-${Math.abs(dualCosts.coherence)} Coerenza</strong> e <strong>-€${Math.abs(dualCosts.money)}</strong></div>
            ${!dualState.active ? `
            <div class="politica-dual-controls">
                <select id="pol-dual-nation-select" class="politica-dual-select">
                    ${dualCandidates.map(n => `<option value="${this.esc(n.id)}">${this.esc(n.label)}</option>`).join('')}
                </select>
                <button class="politica-action-btn" id="pol-dual-activate" ${noPA || dualCandidates.length === 0 ? 'disabled' : ''}>Attiva (1 📱)</button>
            </div>
            ` : `
            <div class="politica-dual-controls">
                <button class="politica-action-btn" id="pol-dual-deactivate" ${noPA ? 'disabled' : ''}>Disattiva (1 📱)</button>
            </div>
            `}
            ` : `
            <div class="politica-dual-locked">Richiede DLC Cambio Nazione Pro (dipendenza: Il Vecchio Mondo Expansion).</div>
            `}
            <div id="politica-mechanics-icons" class="politica-mechanics-icons" aria-label="Icone meccaniche politiche"></div>
        </div>
        ${crim.mafiaReputation > 0 || crim.policeSuspicion > 0 ? `
        <div class="politica-section politica-section-criminal">
            <div class="politica-section-title">🕵️ Zona Grigia</div>
            ${_bar('🔫', 'Reputazione Mafiosa', _pct(crim.mafiaReputation), '#dc2626')}
            ${_bar('🚔', 'Sospetto Polizia', _pct(crim.policeSuspicion), '#b45309')}
            ${crim.financialOpacity > 0 ? _bar('💼', 'Opacità Finanziaria', _pct(crim.financialOpacity), '#7c3aed') : ''}
        </div>` : ''}
        `;

        container.innerHTML = html;

        const logoSlot = container.querySelector('#politica-party-logo-slot');
        if (logoSlot && partyLogoPath) {
            const partyLogo = this.loadPartyLogo({ name: partyName, logo: partyLogoPath, icon: partyIcon });
            if (partyLogo) logoSlot.appendChild(partyLogo);
        }

        const mechanicsIcons = container.querySelector('#politica-mechanics-icons');
        if (mechanicsIcons) {
            mechanicsCatalog.forEach(m => {
                const icon = this.loadMechanicIcon(m);
                if (!icon) return;
                icon.title = m.label;
                mechanicsIcons.appendChild(icon);
            });
        }

        if (dualState.active && dualRemaining <= 10) {
            const bucket = dualRemaining <= 3 ? 'danger' : 'warning';
            const key = `dual-expiry-${bucket}-${dualEndDay}`;
            if (this._lastDualExpiryAnnounceKey !== key) {
                this._lastDualExpiryAnnounceKey = key;
                if (window.SR && SR.announce) {
                    const msg = dualRemaining <= 3
                        ? `Attenzione critica: doppia cittadinanza in scadenza tra ${dualRemaining} giorni.`
                        : `Avviso: doppia cittadinanza in scadenza tra ${dualRemaining} giorni.`;
                    SR.announce(msg, dualRemaining <= 3 ? 'assertive' : 'polite');
                }
            }
        }

        // Wire action buttons
        this._bindPoliticaActions();
    },

    _bindPoliticaActions() {
        const _act = (id, cost, apCost, fn) => {
            const btn = document.getElementById(id);
            if (!btn || btn.disabled) return;
            btn.addEventListener('click', () => {
                if (apCost && !Game.hasActionPoints(apCost)) {
                    if (window.SR) SR.announce('Azioni scrivania esaurite per questo turno.', 'assertive');
                    return;
                }
                if (!Game.spendPhoneAction(cost)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                if (apCost) Game.spendActionPoint(apCost);
                fn();
                this.renderPolitica();
                if (window.SR && SR.afterActionFocus) requestAnimationFrame(() => SR.afterActionFocus(document.getElementById(id)));
            }, { once: true });
        };

        _act('pol-act-meeting', 1, 1, () => {
            if (typeof Politics !== 'undefined') Politics.applyOutcome({ partyInfluence: 0.04, loyaltyNetwork: 0.02 });
            Game.changeReputazione(2);
            Game.changeStat('stress', 5);
            Game.changeStat('stanchezza', 8);
            Game.addWorkNotif('🤝 Riunione', 'Hai partecipato a una riunione di partito. +4% influenza.', `Giorno ${Game.state.day}`);
            if (window.SR) SR.announce('Riunione di partito completata. Influenza aumentata.', 'polite');
        });

        _act('pol-act-speech', 1, 1, () => {
            const success = Math.random() < 0.6 + (Game.state.attributes.carisma || 10) / 200;
            if (typeof Politics !== 'undefined') Politics.applyOutcome({ publicSupport: success ? 0.06 : -0.02, charisma: 0.01 });
            Game.changeStat('stress', success ? 5 : 10);
            Game.changeStat('stanchezza', 12);
            const msg = success ? 'Discorso ben accolto! +6% supporto pubblico.' : 'Il discorso non ha convinto. -2% supporto.';
            Game.addWorkNotif('🎤 Discorso', msg, `Giorno ${Game.state.day}`);
            if (window.SR) SR.announce(msg, 'polite');
        });

        _act('pol-act-lobby', 1, 0, () => {
            if (Game.state.money < 50) {
                Game.addWorkNotif('🏛️ Lobbying', 'Fondi insufficienti per fare lobbying (€50).', `Giorno ${Game.state.day}`);
                if (window.SR) SR.announce('Fondi insufficienti per il lobbying.', 'assertive');
                return;
            }
            Game.changeMoney(-50);
            if (typeof Politics !== 'undefined') Politics.applyOutcome({ partyInfluence: 0.03, legislativeSkill: 0.02 });
            Game.addWorkNotif('🏛️ Lobbying', 'Investimento in lobbying: +3% influenza. (-€50)', `Giorno ${Game.state.day}`);
            if (window.SR) SR.announce('Lobbying effettuato. Influenza nel partito aumentata.', 'polite');
        });

        _act('pol-act-legislation', 1, 1, () => {
            const skill = typeof Politics !== 'undefined' ? Politics.getStat('political', 'legislativeSkill') : 0;
            const success = Math.random() < 0.4 + skill * 0.4;
            if (typeof Politics !== 'undefined') Politics.applyOutcome({ legislativeSkill: 0.05, publicSupport: success ? 0.03 : -0.01 });
            if (success) { Game.changeReputazione(3); Game.emit('stat-change', { stat: 'reputazioneNazionale', value: (Game.state.reputazioneNazionale || 0) + 2, old: Game.state.reputazioneNazionale }); Game.state.reputazioneNazionale = (Game.state.reputazioneNazionale || 0) + 2; }
            const msg = success ? 'Proposta approvata! +3 Rep. +2 Rep. Naz.' : 'Proposta respinta. Buona esperienza però.';
            Game.addWorkNotif('📜 Proposta', msg, `Giorno ${Game.state.day}`);
            Game.changeStat('stress', 8);
            Game.changeStat('stanchezza', 10);
            if (window.SR) SR.announce(msg, 'polite');
        });

        _act('pol-act-intl', 1, 0, () => {
            if (typeof Politics !== 'undefined') Politics.applyOutcome({ internationalReputation: 0.04 });
            Game.state.reputazioneNazionale = Math.min(100, (Game.state.reputazioneNazionale || 0) + 2);
            Game.emit('stat-change', { stat: 'reputazioneNazionale', value: Game.state.reputazioneNazionale, old: Game.state.reputazioneNazionale - 2 });
            Game.addWorkNotif('🌍 Internazionale', 'Contatto stabilito. +4% Rep. Internazionale, +2 Rep. Naz.', `Giorno ${Game.state.day}`);
            if (window.SR) SR.announce('Contatto internazionale stabilito.', 'polite');
        });

        _act('pol-act-network', 1, 0, () => {
            if (typeof Politics !== 'undefined') Politics.applyOutcome({ loyaltyNetwork: 0.04 });
            Game.changeStat('morale', 5);
            Game.addWorkNotif('🔗 Rete', 'Rete di lealtà consolidata. +4% lealtà, +5 Morale.', `Giorno ${Game.state.day}`);
            if (window.SR) SR.announce('Rete di lealtà consolidata.', 'polite');
        });

        const dualActivateBtn = document.getElementById('pol-dual-activate');
        if (dualActivateBtn && !dualActivateBtn.disabled) {
            dualActivateBtn.addEventListener('click', () => {
                if (!Game.spendPhoneAction(1)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                const sel = document.getElementById('pol-dual-nation-select');
                const secondaryNationId = sel ? sel.value : null;
                const result = (typeof Nations !== 'undefined' && Nations.activateDualNationality)
                    ? Nations.activateDualNationality(secondaryNationId)
                    : { ok: false, reason: 'system-missing' };
                if (!result.ok) {
                    const reason = result.reason || 'errore';
                    Game.addWorkNotif('🛂 Doppia Cittadinanza', `Attivazione fallita: ${reason}.`, `Giorno ${Game.state.day}`);
                    if (window.SR) SR.announce('Attivazione doppia cittadinanza fallita.', 'assertive');
                } else if (window.SR) {
                    SR.announce('Doppia cittadinanza attivata.', 'polite');
                }
                this.renderPolitica();
            }, { once: true });
        }

        _act('pol-dual-deactivate', 1, 0, () => {
            if (typeof Nations !== 'undefined' && Nations.deactivateDualNationality) {
                Nations.deactivateDualNationality('manual');
            }
            if (window.SR) SR.announce('Doppia cittadinanza disattivata.', 'polite');
        });
    },

    loadPartyLogo(party) {
        if (!party || !party.logo) return null;
        const img = document.createElement('img');
        img.src = party.logo;
        img.alt = `Logo ${party.name || party.id || 'partito'}`;
        img.className = 'party-logo';
        img.onerror = () => {
            img.replaceWith(document.createTextNode(party.icon || '🏛️'));
        };
        return img;
    },

    loadMechanicIcon(mechanic) {
        if (!mechanic || !mechanic.logo) return null;
        const img = document.createElement('img');
        img.src = mechanic.logo;
        img.alt = mechanic.label || mechanic.id || 'Icona meccanica';
        img.className = 'mechanic-icon';
        img.onerror = () => {
            img.style.display = 'none';
        };
        return img;
    },

    _getMechanicsCatalog(fallbackCatalog) {
        if (Array.isArray(this._mechanicsCatalog) && this._mechanicsCatalog.length > 0) {
            return this._mechanicsCatalog;
        }
        if (!this._mechanicsFetchPromise) {
            this._mechanicsFetchPromise = fetch('data/mechanics.json')
                .then(r => (r && r.ok ? r.json() : []))
                .then(items => {
                    if (Array.isArray(items) && items.length > 0) {
                        this._mechanicsCatalog = items.map(m => ({ id: m.id, label: m.name || m.id, logo: m.logo }));
                        this.renderPolitica();
                    }
                })
                .catch(() => null);
        }
        return fallbackCatalog;
    },

    esc(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    // ====== ARCHIVIO TAB — Lost Contacts ======
    renderArchivio() {
        const container = document.getElementById('archivio-list');
        if (!container) return;
        const lost = Game.state.contactsLost || [];
        if (lost.length === 0) {
            container.innerHTML = '<p class="empty-list">📭 Nessun contatto perso. I trasferimenti causeranno la perdita dei contatti non preferiti.</p>';
            return;
        }

        const currentCity = Game.state.city ? Game.state.city.id : null;

        container.innerHTML = lost.map(c => {
            const canRecover = currentCity && c.originalCity === currentCity;
            return `
                <div class="archivio-contact">
                    <div class="archivio-name">${this.esc(c.name)}</div>
                    <div class="archivio-city">📍 Perso a: ${this.esc(c.originalCity || 'Sconosciuta')} — Giorno ${c.lostDay || '?'}</div>
                    <div class="archivio-relation">❤️ Relazione al momento: ${c.relation}</div>
                    ${canRecover
                        ? `<button class="archivio-recover" data-id="${this.esc(c.id || c.name)}">🔄 Ricontatta (sei nella stessa città)</button>`
                        : '<span style="font-size:10px;color:#A1887F;">Torna in questa città per ricontattarlo.</span>'}
                </div>
            `;
        }).join('');

        container.querySelectorAll('.archivio-recover').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!Game.spendPhoneAction(1)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                if (typeof GameMap !== 'undefined' && GameMap.recoverContacts) {
                    GameMap.recoverContacts(currentCity);
                    this.renderArchivio();
                    this.renderContacts();
                }
            }, { once: true });
        });
    },

    // ====== RIEPILOGO TAB — Daily Summary ======
    renderRiepilogo() {
        const container = document.getElementById('phone-riepilogo');
        if (!container) return;
        const s = Game.state;
        const statLabels = { stanchezza: '😴 Stanch.', stress: '😰 Stress', morale: '😊 Morale', salute: '❤️ Salute' };
        const attrLabels = { intelligenza: '🧠 Int.', carisma: '✨ Car.', muscoli: '💪 Musc.', estetica: '🪞 Est.', autenticita: '🗣️ Aut.' };

        let html = '<div class="riepilogo-section"><div class="riepilogo-title">📈 Statistiche</div>';
        for (const [k, label] of Object.entries(statLabels)) {
            const v = s.stats[k];
            const cls = v >= 70 ? 'rp-high' : v >= 40 ? 'rp-mid' : 'rp-low';
            html += `<div class="riepilogo-row"><span>${label}</span><span class="${cls}">${v}</span></div>`;
        }
        html += '</div>';

        html += '<div class="riepilogo-section"><div class="riepilogo-title">🧬 Attributi</div>';
        for (const [k, label] of Object.entries(attrLabels)) {
            html += `<div class="riepilogo-row"><span>${label}</span><span>${s.attributes[k]}</span></div>`;
        }
        html += '</div>';

        html += '<div class="riepilogo-section"><div class="riepilogo-title">🏛️ Stato</div>';
        html += `<div class="riepilogo-row"><span>⭐ Rep. Locale</span><span>${s.reputazione}</span></div>`;
        html += `<div class="riepilogo-row"><span>🌐 Rep. Naz.</span><span>${s.reputazioneNazionale}</span></div>`;
        html += `<div class="riepilogo-row"><span>🧩 Coerenza</span><span>${s.coherence}</span></div>`;
        html += `<div class="riepilogo-row"><span>💶 Soldi</span><span>€${s.money}</span></div>`;
        html += `<div class="riepilogo-row"><span>⚡ PA</span><span>${s.actionPoints}/2</span></div>`;
        const cl = Game.getCareerLevel ? Game.getCareerLevel() : { label: '—' };
        html += `<div class="riepilogo-row"><span>💼 Carriera</span><span>${cl.label}</span></div>`;
        html += '</div>';

        // Dangers
        const dangers = [];
        if (s.stats.stanchezza >= 80) dangers.push('🔴 Esausto');
        if (s.stats.stress >= 70) dangers.push('⚠️ Stress alto');
        if (s.stats.morale <= 30) dangers.push('😞 Morale basso');
        if (s.stats.salute <= 50) dangers.push('🤒 Salute bassa');
        if (s.money < 30) dangers.push('💸 Soldi bassi');
        if (s.coherence < 30) dangers.push('🧩 Crisi coerenza');
        if (dangers.length > 0) {
            html += `<div class="riepilogo-dangers">${dangers.join('<br>')}</div>`;
        }

        container.innerHTML = html;
    },

    // ====== TERRITORIO TAB — Territory from Phone ======
    renderPhoneTerritory() {
        const container = document.getElementById('phone-territory');
        if (!container) return;
        if (typeof Territory === 'undefined') { container.innerHTML = '<p>Non disponibile.</p>'; return; }

        const s = Game.state;
        const cityActions = this.getCitySpecificActions();
        const cityActionsHtml = cityActions.length
            ? `
                <div class="phone-city-actions-wrap">
                    <div class="contacts-section-header">🌆 Azioni Uniche Citta</div>
                    <div class="phone-city-actions-grid">
                        ${cityActions.map(action => `
                            <button class="phone-city-action-btn" data-city-action="${this.esc(action.id)}" ${!Game.hasPhoneActions(1) ? 'disabled' : ''}>
                                <div class="phone-city-action-title">${this.esc(action.label)}</div>
                                <div class="phone-city-action-meta">${action.cost ? `Costo €${action.cost} • ` : ''}1 📱</div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `
            : '';

        const locationsHtml = Territory.LOCATIONS.map(loc => {
            const canAfford = s.money >= (loc.moneyCost || 0);
            const needsAP = loc.apCost || 1;
            const disabled = !Game.hasActionPoints(needsAP) || !canAfford;

            if (loc.hasSubActions) {
                let visibleSubActions = [];
                if (loc.id === 'mentore' && typeof Territory.getMentorSubActions === 'function') {
                    visibleSubActions = Territory.getMentorSubActions();
                } else {
                    visibleSubActions = (loc.subActions || []).filter(sub => {
                        if (!sub.mentorRequirement) return true;
                        return !!(Game.state.flags && Game.state.flags[sub.mentorRequirement]);
                    });
                    if (visibleSubActions.length === 0) return '';
                }
                return `
                    <div class="phone-loc ${disabled ? 'phone-loc-disabled' : ''}">
                        <div class="phone-loc-header">
                            <span class="phone-loc-name">${loc.name}</span>
                            <span class="task-ap-cost">${needsAP} PA</span>
                        </div>
                        <div class="phone-loc-desc">${loc.desc}</div>
                        ${loc.id === 'mentore' && visibleSubActions.length === 0 ? '<div class="phone-loc-effects">Completa gli eventi del mentore per sbloccare azioni speciali.</div>' : ''}
                        <div class="phone-loc-subs">
                            ${visibleSubActions.map(sub => `
                                <button class="phone-loc-sub-btn" data-loc="${loc.id}" data-sub="${sub.id}" ${disabled || (sub._cooldownRemaining > 0) ? 'disabled' : ''}>
                                    ${sub.label}${sub._cooldownRemaining > 0 ? ` (CD ${sub._cooldownRemaining}g)` : ''}
                                </button>
                            `).join('')}
                        </div>
                    </div>`;
            }

            const preview = Territory._locPreview ? Territory._locPreview(loc) : '';
            return `
                <div class="phone-loc ${disabled ? 'phone-loc-disabled' : ''}">
                    <div class="phone-loc-header">
                        <span class="phone-loc-name">${loc.name}</span>
                        <span class="task-ap-cost">${needsAP} PA</span>
                        ${loc.moneyCost ? `<span class="location-money">€${loc.moneyCost}</span>` : ''}
                    </div>
                    <div class="phone-loc-desc">${loc.desc}</div>
                    ${preview ? `<div class="phone-loc-effects">${preview}</div>` : ''}
                    <button class="phone-loc-go-btn" data-loc="${loc.id}" ${disabled ? 'disabled' : ''}>
                        ${disabled ? (!Game.hasActionPoints(needsAP) ? '⚠️ No PA' : '💸 No fondi') : '🚶 Vai'}
                    </button>
                </div>`;
        }).join('');

        container.innerHTML = `${cityActionsHtml}${locationsHtml}`;

        container.querySelectorAll('.phone-loc-go-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!Game.spendPhoneAction(1)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                Territory.visitLocation(btn.dataset.loc);
                this.renderPhoneTerritory();
            });
        });
        container.querySelectorAll('.phone-loc-sub-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!Game.spendPhoneAction(1)) {
                    Game.emit('no-ap', { reason: 'Azioni telefono esaurite!' });
                    return;
                }
                Territory.visitLocationSubAction(btn.dataset.loc, btn.dataset.sub);
                this.renderPhoneTerritory();
            });
        });

        container.querySelectorAll('.phone-city-action-btn').forEach(btn => {
            btn.addEventListener('click', () => this.runCitySpecificAction(btn.dataset.cityAction));
        });
    },

    renderPhoneMap() {
        if (typeof GameMap !== 'undefined') {
            GameMap.renderMapPanel('phone-map-body');
        }
    },

    initTerritorioSubTabs() {
        document.querySelectorAll('.phone-terr-tab').forEach(tab => {
            if (!tab) return;
            tab.onclick = () => {
                document.querySelectorAll('.phone-terr-tab').forEach(t => t && t.classList && t.classList.remove('active'));
                document.querySelectorAll('.phone-terr-content').forEach(c => c && c.classList && c.classList.remove('active'));
                if (tab && tab.classList) tab.classList.add('active');
                const terrContent = document.getElementById(`phone-ttab-${tab.dataset.ttab}`);
                if (terrContent && terrContent.classList) terrContent.classList.add('active');
                if (tab.dataset.ttab === 'mappa' && this.renderPhoneMap) this.renderPhoneMap();
            };
        });

        const activeTab = document.querySelector('.phone-terr-tab.active') || document.querySelector('.phone-terr-tab');
        if (activeTab) {
            document.querySelectorAll('.phone-terr-content').forEach(c => c && c.classList && c.classList.remove('active'));
            const target = document.getElementById(`phone-ttab-${activeTab.dataset.ttab}`);
            if (target && target.classList) target.classList.add('active');
            if (activeTab.dataset.ttab === 'mappa' && this.renderPhoneMap) this.renderPhoneMap();
        }
    },

    // ====== CONTACTS OVERLAY (Full-screen hamburger menu) ======
    openContactsOverlay() {
        const overlay = document.getElementById('contacts-overlay-panel');
        if (!overlay) return;
        overlay.classList.remove('hidden');
        this.renderContactsOverlay();
    },

    closeContactsOverlay() {
        const overlay = document.getElementById('contacts-overlay-panel');
        if (!overlay) return;
        overlay.classList.add('hidden');
    },

    renderContactsOverlay() {
        const tree = document.getElementById('contacts-tree-overlay');
        if (!tree) return;
        tree.innerHTML = '';

        const contacts = Game.state.contacts || [];
        if (contacts.length === 0) {
            tree.innerHTML = '<p style="text-align:center;color:#8B949E;">Nessun contatto disponibile. Apri Territorio o Social per conoscere nuove persone.</p>';
            this.updateContactsStats([]);
            return;
        }

        // Split in favorites and others
        const favorites = contacts.filter(c => c.favorite);
        const others = contacts.filter(c => !c.favorite);

        // Render favorites first
        if (favorites.length > 0) {
            const favHeader = document.createElement('div');
            favHeader.style.cssText = 'text-align:center;font-size:13px;color:#FFD54F;font-weight:bold;margin-bottom:10px;padding-top:10px;border-bottom:1px dashed #6C63FF;padding-bottom:8px;';
            favHeader.textContent = '⭐ PREFERITI';
            tree.appendChild(favHeader);

            favorites.forEach(contact => {
                tree.appendChild(this.buildContactBranch(contact));
            });
        }

        // Render others
        if (others.length > 0) {
            const otherHeader = document.createElement('div');
            otherHeader.style.cssText = 'text-align:center;font-size:13px;color:#8B949E;font-weight:bold;margin-bottom:10px;padding-top:16px;border-bottom:1px dashed #6C63FF;padding-bottom:8px;';
            otherHeader.textContent = '👥 TUTTI I CONTATTI';
            tree.appendChild(otherHeader);

            others.forEach(contact => {
                tree.appendChild(this.buildContactBranch(contact));
            });
        }

        this.updateContactsStats(contacts);
    },

    buildContactBranch(contact) {
        const branch = document.createElement('div');
        branch.className = 'contact-branch';

        const header = document.createElement('div');
        header.className = 'contact-branch-header';
        header.innerHTML = `
            <div class="contact-emoji">${contact.emoji}</div>
            <div class="contact-branch-title">${this.esc(contact.name)}</div>
            <div class="contact-branch-relation">${contact.relation}%</div>
        `;
        branch.appendChild(header);

        const role = document.createElement('div');
        role.className = 'contact-branch-role';
        role.textContent = this.esc(contact.role || 'Contatto');
        branch.appendChild(role);

        // Loyalty and relation bars
        const bars = document.createElement('div');
        bars.className = 'contact-branch-bars';

        const relBar = document.createElement('div');
        relBar.className = 'contact-bar-small';
        relBar.innerHTML = `
            <span class="contact-bar-small-label">🤝 Rel.</span>
            <div class="bar-track"><div class="bar-fill" style="width:${contact.relation}%"></div></div>
        `;
        bars.appendChild(relBar);

        const loyBar = document.createElement('div');
        loyBar.className = 'contact-bar-small';
        loyBar.innerHTML = `
            <span class="contact-bar-small-label">💪 Loy.</span>
            <div class="bar-track"><div class="bar-fill" style="width:${contact.loyalty}%"></div></div>
        `;
        bars.appendChild(loyBar);

        branch.appendChild(bars);

        // Alliance info if active
        if (contact.alliance && contact.alliance.active) {
            const allianceInfo = document.createElement('div');
            allianceInfo.style.cssText = 'font-size:11px;color:#FFD54F;margin-top:6px;padding:4px 8px;background:rgba(255,213,79,0.1);border-radius:3px;';
            allianceInfo.innerHTML = `🤝 Alleato attivo • ${this.esc(contact.alliance.bonusLabel || 'Bonus')}`;
            branch.appendChild(allianceInfo);
        }

        return branch;
    },

    updateContactsStats(contacts) {
        const total = contacts.length;
        const avg = total > 0 ? contacts.reduce((sum, c) => sum + c.relation, 0) / total : 0;

        const fillOverlay = document.getElementById('relation-global-fill-overlay');
        if (fillOverlay) fillOverlay.style.width = `${avg}%`;

        const descOverlay = document.getElementById('relation-desc-overlay');
        if (descOverlay) {
            if (avg >= 70) descOverlay.textContent = 'Le tue relazioni sono solide. Continua così! 💪';
            else if (avg >= 40) descOverlay.textContent = 'Le tue relazioni sono nella media.';
            else descOverlay.textContent = '⚠️ Le tue relazioni si stanno deteriorando!';
        }
    }
};
