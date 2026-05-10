/* ================================================================
   SCREEN-READER.JS — Modulo Accessibilità Professionale
    Power of Politics — 2026-05-06 | WCAG 2.1 AA
   ================================================================
   - Mantiene 3 live regions nel DOM (polite / assertive / log)
   - Aggancia tutti gli eventi Game.on per annunci SR
   - Applica aria-label dinamici a tutto l'HUD
   - Focus trap WCAG-compliant per modali e pannelli
   - Skip link + :focus-visible + .visually-hidden CSS
   - API pubblica: SR.announce(), SR.trapFocus(), SR.updateHUD()
================================================================ */

const SR = (() => {

    const STAT_LABELS = {
        stanchezza: 'Stanchezza', stress: 'Stress',
        morale: 'Morale', salute: 'Salute', coherence: 'Coerenza',
    };

    const STAT_THRESHOLDS = {
        stanchezza: { warn: 70, crit: 85, dir: 'high' },
        stress:     { warn: 70, crit: 90, dir: 'high' },
        morale:     { warn: 30, crit: 15, dir: 'low'  },
        salute:     { warn: 30, crit: 15, dir: 'low'  },
        coherence:  { warn: 30, crit: 10, dir: 'low'  },
    };

    let _silenced = false, _silenceTimer = null;
    let _focusTrapEl = null, _focusTrapPrev = null;
    let _lastStatAnnounced = {};
    let _prevMoney = null, _prevAP = null;
    let _prevCity = null, _prevDay = null, _prevTimeOfDay = null;

    /* ── Priority announcement queue ──────────────────────── */
    const _queue = [];
    let _queueTimer = null;
    const SR_PRIORITY = { LOW: 0, NORMAL: 1, HIGH: 2, CRITICAL: 3 };

    function _flushQueue() {
        _queueTimer = null;
        if (_queue.length === 0) return;
        // Sort descending by priority; take highest
        _queue.sort((a, b) => b.priority - a.priority);
        const item = _queue.shift();
        if (_silenced && item.urgency !== 'assertive') {
            // Drop polite announcements while silenced but keep queue draining
            if (_queue.length > 0) _queueTimer = setTimeout(_flushQueue, 600);
            return;
        }
        _ensureLiveRegions();
        const el = document.getElementById(item.urgency === 'assertive' ? 'sr-assertive' : 'sr-polite');
        if (el) {
            el.textContent = '';
            requestAnimationFrame(() => requestAnimationFrame(() => { el.textContent = item.message; }));
        }
        if (_queue.length > 0) {
            // Space out announcements: critical/high = 600ms, normal = 900ms, low = 1200ms
            const delay = item.priority >= SR_PRIORITY.HIGH ? 600 : item.priority === SR_PRIORITY.NORMAL ? 900 : 1200;
            _queueTimer = setTimeout(_flushQueue, delay);
        }
    }

    function enqueue(message, urgency, priority) {
        const p = priority !== undefined ? priority : (urgency === 'assertive' ? SR_PRIORITY.HIGH : SR_PRIORITY.NORMAL);
        // Deduplicate: drop if identical message already queued at same or higher priority
        if (_queue.some(q => q.message === message)) return;
        // Cap queue size to prevent flooding
        if (_queue.length >= 8) {
            // Drop lowest priority item
            _queue.sort((a, b) => a.priority - b.priority);
            _queue.shift();
        }
        _queue.push({ message, urgency: urgency || 'polite', priority: p });
        if (!_queueTimer) _queueTimer = setTimeout(_flushQueue, 50);
    }

    /* ── Live regions ──────────────────────────────────────── */
    function _ensureLiveRegions() {
        [
            { id: 'sr-polite',    role: 'status', live: 'polite',    atomic: true  },
            { id: 'sr-assertive', role: 'alert',  live: 'assertive', atomic: true  },
            { id: 'sr-log',       role: 'log',    live: 'polite',    atomic: false },
        ].forEach(({ id, role, live, atomic }) => {
            if (document.getElementById(id)) return;
            const el = document.createElement('div');
            el.id = id;
            el.setAttribute('role', role);
            el.setAttribute('aria-live', live);
            el.setAttribute('aria-atomic', String(atomic));
            el.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;clip:rect(1px,1px,1px,1px);white-space:nowrap;';
            document.body.appendChild(el);
        });
    }

    /* ── Annuncio principale ───────────────────────────────── */
    function announce(message, urgency = 'polite') {
        if (_silenced && urgency !== 'assertive') return;
        enqueue(message, urgency);
    }

    function log(message) {
        _ensureLiveRegions();
        const el = document.getElementById('sr-log');
        if (!el) return;
        const item = document.createElement('p');
        item.textContent = message;
        el.appendChild(item);
        while (el.children.length > 10) el.removeChild(el.firstChild);
    }

    function silence(ms = 3000) {
        _silenced = true;
        clearTimeout(_silenceTimer);
        _silenceTimer = setTimeout(() => { _silenced = false; }, ms);
    }

    /* ── Focus trap ────────────────────────────────────────── */
    const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

    function trapFocus(containerEl) {
        if (!containerEl) return;
        releaseFocus();
        _focusTrapEl = containerEl;
        _focusTrapPrev = document.activeElement;
        const focusable = () => Array.from(containerEl.querySelectorAll(FOCUSABLE))
            .filter(e => !e.closest('[hidden]') && !e.disabled);
        requestAnimationFrame(() => { const f = focusable(); if (f.length) f[0].focus(); });
        containerEl._srTrap = (e) => {
            if (e.key === 'Escape') { releaseFocus(); return; }
            if (e.key !== 'Tab') return;
            const f = focusable(); if (!f.length) { e.preventDefault(); return; }
            if (e.shiftKey && document.activeElement === f[0]) {
                e.preventDefault(); f[f.length - 1].focus();
            } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
                e.preventDefault(); f[0].focus();
            }
        };
        containerEl.addEventListener('keydown', containerEl._srTrap);
    }

    function releaseFocus() {
        if (_focusTrapEl?._srTrap) {
            _focusTrapEl.removeEventListener('keydown', _focusTrapEl._srTrap);
            delete _focusTrapEl._srTrap;
        }
        _focusTrapPrev?.focus?.();
        _focusTrapEl = null; _focusTrapPrev = null;
    }

    /* ── moveFocus: sposta focus di sistema a un elemento ─── */
    function moveFocus(el, announcement, urgency) {
        if (!el) return;
        if (!el.getAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        requestAnimationFrame(() => {
            el.focus({ preventScroll: false });
            if (announcement) announce(announcement, urgency || 'polite');
        });
    }

    /* ── openModal: apre un modal con piena accessibilità ─── */
    // titleId: id dell'elemento h2/h3 dentro il modal (per aria-labelledby)
    // description: testo contestuale annunciato al SR
    function openModal(el, title, description) {
        if (!el) return;
        // ARIA dialog attributes
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        if (title) {
            // cerca o crea il nodo titolo
            let hd = el.querySelector('[data-sr-heading]');
            if (!hd) hd = el.querySelector('.urgent-choice-header,.modal-header,.nation-modal-content h3,.mafia-header,.confirm-header');
            if (hd) {
                if (!hd.id) hd.id = 'sr-modal-heading-' + Date.now();
                el.setAttribute('aria-labelledby', hd.id);
            } else {
                el.setAttribute('aria-label', title);
            }
        }
        if (description) {
            let desc = el.querySelector('[data-sr-desc]');
            if (!desc) {
                desc = document.createElement('p');
                desc.setAttribute('data-sr-desc', '1');
                desc.className = 'visually-hidden';
                desc.textContent = description;
                el.insertBefore(desc, el.firstChild);
            }
            if (!desc.id) desc.id = 'sr-modal-desc-' + Date.now();
            el.setAttribute('aria-describedby', desc.id);
        }
        trapFocus(el);
        const msg = description ? `${title}. ${description}` : title;
        if (msg) announce(msg, 'assertive');
    }

    /* ── closeModal: chiude modal e restituisce focus ──────── */
    function closeModal(triggerEl, announcement) {
        releaseFocus();
        if (triggerEl) requestAnimationFrame(() => triggerEl.focus());
        if (announcement) announce(announcement, 'polite');
    }

    /* ── openPanel: annuncia apertura pannello + sposta focus  */
    const _PANEL_LABELS = {
        phone:  'Telefono — Messaggi, relazioni, notifiche',
        tasks:  'Blocco Note — Compiti politici e di carriera',
        house:  'Casa — Gestione abitazione e stile di vita',
        stats:  'Statistiche — Riepilogo personaggio',
        map:    'Mappa — Città e trasferimenti',
        budget: 'Budget — Entrate, uscite e finanze',
    };
    function openPanel(panelEl, panelName, context) {
        if (!panelEl) return;
        const label = _PANEL_LABELS[panelName] || panelName || 'Pannello';
        if (!panelEl.getAttribute('role')) panelEl.setAttribute('role', 'region');
        if (!panelEl.getAttribute('aria-label')) panelEl.setAttribute('aria-label', label);
        // Ensure there's a visible heading for screen readers
        _ensurePanelHeading(panelEl, label);
        // Move focus to first focusable element (close button, first tab, or heading)
        requestAnimationFrame(() => {
            const closeBtn = panelEl.querySelector('[id$="-close"],[aria-label*="Chiudi"],button[class*="close"]');
            const firstTab = panelEl.querySelector('[role="tab"],[class*="tab-btn"],[class*="-tab"]');
            const heading  = panelEl.querySelector('h1,h2,h3,[data-sr-heading]');
            const target   = closeBtn || firstTab || heading;
            if (target) {
                if (!target.getAttribute('tabindex') && target.tagName !== 'BUTTON' && target.tagName !== 'A') {
                    target.setAttribute('tabindex', '-1');
                }
                target.focus({ preventScroll: false });
            }
        });
        const contextMsg = context ? `. ${context}` : '';
        announce(`${label} aperto${contextMsg}. Premi Escape per chiudere.`, 'assertive');
    }

    function _ensurePanelHeading(panelEl, label) {
        if (panelEl.querySelector('[data-sr-panel-heading]')) return;
        let existingH = panelEl.querySelector('h1,h2,h3');
        if (existingH) { existingH.setAttribute('data-sr-panel-heading', '1'); return; }
        const h = document.createElement('h2');
        h.setAttribute('data-sr-panel-heading', '1');
        h.className = 'visually-hidden';
        h.textContent = label;
        panelEl.insertBefore(h, panelEl.firstChild);
    }

    /* ── closePanel: restituisce focus al trigger ────────────  */
    function closePanel(triggerEl, panelName, announcement) {
        const label = _PANEL_LABELS[panelName] || panelName || 'Pannello';
        if (triggerEl) requestAnimationFrame(() => triggerEl.focus());
        announce(announcement || `${label} chiuso.`, 'polite');
    }

    /* ── sectionHeading: intestazione di sezione con descrizione */
    // Inserisce h3 + p.visually-hidden prima degli elementi di una sezione.
    // level: 2|3|4, text: titolo sezione, description: testo descrittivo opzionale
    function sectionHeading(parentEl, level, text, description) {
        if (!parentEl) return;
        const tag = `h${level || 3}`;
        const h = document.createElement(tag);
        h.setAttribute('data-sr-section', '1');
        h.className = 'visually-hidden';
        h.textContent = text;
        parentEl.insertBefore(h, parentEl.firstChild);
        if (description) {
            const p = document.createElement('p');
            p.setAttribute('data-sr-section-desc', '1');
            p.className = 'visually-hidden';
            p.textContent = description;
            parentEl.insertBefore(p, h.nextSibling);
        }
    }

    /* ── labelList: aria-label su un elemento lista ───────── */
    function labelList(listEl, label) {
        if (!listEl) return;
        if (!listEl.getAttribute('role')) listEl.setAttribute('role', 'list');
        listEl.setAttribute('aria-label', label);
    }

    /* ── ARIA HUD helpers ──────────────────────────────────── */
    function _ariaHudStat(k, v) {
        const wrap = document.getElementById(`hud-${k}`);
        if (!wrap) return;
        const label = STAT_LABELS[k] || k;
        const thr   = STAT_THRESHOLDS[k];
        let note = '';
        if (thr) {
            const bad  = thr.dir === 'high' ? v >= thr.crit : v <= thr.crit;
            const warn = thr.dir === 'high' ? v >= thr.warn : v <= thr.warn;
            if (bad)       note = ', livello critico';
            else if (warn) note = ', attenzione';
        }
        wrap.setAttribute('aria-label', `${label}: ${Math.round(v)} su 100${note}`);
        const fill = wrap.querySelector('.hud-bar-fill');
        if (fill) {
            fill.setAttribute('role', 'progressbar');
            fill.setAttribute('aria-valuenow', Math.round(v));
            fill.setAttribute('aria-valuemin', '0');
            fill.setAttribute('aria-valuemax', '100');
            fill.setAttribute('aria-label', `${label} ${Math.round(v)}%`);
        }
    }

    function _ariaHudMoney(m) {
        const el = document.getElementById('hud-money');
        if (el) el.setAttribute('aria-label',
            m < 0 ? `Saldo: meno ${Math.abs(m)} euro, in rosso` : `Saldo: ${m} euro`);
    }

    function _ariaHudAP(ap) {
        const w = document.getElementById('hud-ap');
        if (w) w.setAttribute('aria-label', `Azioni disponibili: ${ap} su 2`);
        const c = document.getElementById('ap-count');
        if (c) c.setAttribute('aria-hidden', 'true');
    }

    function _ariaHudDateTime(dateString, timeLabel) {
        const d = document.getElementById('hud-date');
        if (d) d.setAttribute('aria-label', `Data: ${dateString}`);
        const t = document.getElementById('hud-time-label');
        if (t) t.setAttribute('aria-label', `Fascia oraria: ${timeLabel}`);
    }

    function _ariaHudCity(name) {
        const el = document.getElementById('hud-city-name');
        if (el) el.setAttribute('aria-label', `Città attuale: ${name}`);
    }

    function _ariaHudRepNaz(val) {
        const el = document.getElementById('hud-rep-nazionale');
        if (!el) return;
        el.setAttribute('role', 'progressbar');
        el.setAttribute('aria-valuenow', Math.round(val));
        el.setAttribute('aria-valuemin', '0');
        el.setAttribute('aria-valuemax', '100');
        el.setAttribute('aria-label', `Reputazione nazionale: ${Math.round(val)} su 100`);
    }

    function _ariaAdvanceBtn() {
        const btn   = document.getElementById('btn-advance');
        if (!btn) return;
        const label = document.getElementById('btn-advance-label')?.textContent?.trim() || 'Avanza Turno';
        const info  = document.getElementById('advance-info')?.textContent?.trim() || '';
        btn.setAttribute('aria-label', info ? `${label} — ${info}` : label);
    }

    function _ariaPhoneBadge() {
        const badge = document.getElementById('phone-notif-badge') || document.getElementById('phone-badge');
        if (!badge) return;
        const count = typeof Game !== 'undefined'
            ? (Game.state.workNotifs || []).filter(n => !n.read).length : 0;
        badge.setAttribute('aria-label',
            count > 0 ? `${count} notifiche non lette` : 'Nessuna notifica');
    }

    function updateHUD() {
        if (typeof Game === 'undefined' || !Game.state) return;
        const s = Game.state, st = s.stats || {};
        _ariaHudStat('stanchezza', st.stanchezza || 0);
        _ariaHudStat('stress',     st.stress     || 0);
        _ariaHudStat('morale',     st.morale     || 50);
        _ariaHudStat('salute',     st.salute     || 100);
        _ariaHudStat('coherence',  s.coherence   || 50);
        _ariaHudMoney(s.money || 0);
        _ariaHudAP(s.actionPoints || 0);
        _ariaHudDateTime(Game.getDateString?.() || '', Game.getTimeLabel?.() || '');
        _ariaHudCity(s.city?.name || '');
        _ariaHudRepNaz(s.reputazioneNazionale || 0);
        _ariaAdvanceBtn();
        _ariaPhoneBadge();
    }

    /* ── Handlers eventi Game ──────────────────────────────── */
    function _onStatChange({ stat, value }) {
        _ariaHudStat(stat, value);
        const thr   = STAT_THRESHOLDS[stat]; if (!thr) return;
        const label = STAT_LABELS[stat] || stat;
        const prev  = _lastStatAnnounced[stat] || 'ok';
        const isCrit = thr.dir === 'high' ? value >= thr.crit : value <= thr.crit;
        const isWarn = thr.dir === 'high' ? value >= thr.warn : value <= thr.warn;
        const curr  = isCrit ? 'crit' : isWarn ? 'warn' : 'ok';
        if (curr === prev) return;
        _lastStatAnnounced[stat] = curr;
        if (curr === 'crit')
            announce(`Attenzione: ${label} al livello critico, ${Math.round(value)} su 100.`, 'assertive');
        else if (curr === 'warn')
            announce(`${label} in zona di attenzione: ${Math.round(value)} su 100.`, 'polite');
        else if (prev !== 'ok')
            announce(`${label} tornato normale: ${Math.round(value)}.`, 'polite');
    }

    function _onMoneyChange() {
        if (typeof Game === 'undefined') return;
        const money = Game.state.money;
        _ariaHudMoney(money);
        if (_prevMoney === null) { _prevMoney = money; return; }
        const delta = money - _prevMoney;
        if (Math.abs(delta) >= 5)
            announce(`Saldo: ${delta > 0 ? '+' : ''}${delta} euro. Totale: ${money} euro.`,
                delta < -200 ? 'assertive' : 'polite');
        _prevMoney = money;
    }

    function _onTimeAdvance(data) {
        if (!data) return;
        _ariaHudDateTime(data.dateString || '', data.timeLabel || '');
        _ariaAdvanceBtn();
        const day = Game?.state?.day || 0;
        if (data.timeOfDay !== _prevTimeOfDay) {
            _prevTimeOfDay = data.timeOfDay;
            announce(`Fascia oraria: ${data.timeLabel}. Giorno ${day}.`, 'polite');
        }
        if (day !== _prevDay && day > 1) {
            _prevDay = day;
            announce(`Nuovo giorno: giorno ${day}.`, 'polite');
        }
    }

    function _onAPChange({ ap }) {
        _ariaHudAP(ap);
        if (_prevAP !== null && ap !== _prevAP) {
            if (ap === 0)
                announce('Nessuna azione disponibile. Avanza il turno per ricaricare.', 'polite');
            else if (ap > _prevAP)
                announce(`Azioni ricaricate: ${ap} disponibili.`, 'polite');
        }
        _prevAP = ap;
    }

    function _onNoAP({ reason }) {
        announce(reason || 'Azioni esaurite per questo turno.', 'assertive');
        const t = document.getElementById('toast-noap');
        if (t) { t.setAttribute('role', 'alert'); t.setAttribute('aria-live', 'assertive'); }
    }

    function _onCityChange() {
        const name = Game?.state?.city?.name || '';
        _ariaHudCity(name);
        if (name && name !== _prevCity) {
            _prevCity = name;
            announce(`Città cambiata: ora sei a ${name}.`, 'assertive');
        }
    }

    function _onWorkNotif()     { _ariaPhoneBadge(); }
    function _onUrgentMessage() { _ariaPhoneBadge(); announce('Nuovo messaggio urgente nel telefono.', 'assertive'); }
    function _onBillPaid()      { announce(`Bolletta pagata. Saldo: ${Game?.state?.money} euro.`, 'polite'); _ariaHudMoney(Game?.state?.money); }

    function _onRepNazChange({ stat, value, old: oldVal }) {
        if (stat !== 'reputazioneNazionale') return;
        _ariaHudRepNaz(value);
        const delta = typeof oldVal === 'number' ? value - oldVal : 0;
        if (Math.abs(delta) >= 3)
            announce(`Reputazione nazionale ${delta > 0 ? 'aumentata' : 'diminuita'}: ora ${Math.round(value)} su 100.`, 'polite');
    }

    function _onNewDay() {
        const s = Game?.state; if (!s) return;
        const st = s.stats || {};
        const parts = [
            `Riepilogo giorno ${s.day - 1}.`,
            `Stanchezza ${Math.round(st.stanchezza)}, Stress ${Math.round(st.stress)},`,
            `Morale ${Math.round(st.morale)}, Salute ${Math.round(st.salute)}.`,
            `Saldo: ${s.money} euro. Reputazione locale: ${Math.round(s.reputazione)}.`,
        ];
        if (st.stanchezza >= 85) parts.push('Attenzione: sei esausto.');
        if (st.stress >= 90)     parts.push('Attenzione: burnout imminente.');
        if (st.morale <= 15)     parts.push('Attenzione: morale molto basso.');
        if (s.money < -500)      parts.push('Attenzione: saldo fortemente negativo.');
        log(parts.join(' '));
        announce(`Giorno ${s.day} iniziato. Saldo ${s.money} euro. Reputazione ${Math.round(s.reputazione)}.`, 'polite');
        updateHUD();
    }

    /* ── Applica ARIA ai pannelli DOM ──────────────────────── */
    function _applyPanelARIA() {
        [
            { id: 'hud-stats',     label: 'Statistiche personaggio',  role: 'region' },
            { id: 'desk',          label: 'Power of Politics',         role: 'main'   },
            { id: 'screen-desk',   label: 'Schermo scrivania',          role: 'region' },
            { id: 'item-phone',    label: 'Telefono di gioco',          role: 'region' },
            { id: 'item-tasks',    label: 'Blocco note compiti',        role: 'region' },
            { id: 'item-calendar', label: 'Calendario',                 role: 'region' },
        ].forEach(({ id, label, role }) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (!el.getAttribute('role'))       el.setAttribute('role', role);
            if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', label);
        });

        // Phone tabs
        const tabList = document.querySelector('.phone-tabs');
        if (tabList && !tabList.getAttribute('role')) {
            tabList.setAttribute('role', 'tablist');
            tabList.setAttribute('aria-label', 'Sezioni del telefono');
        }
        document.querySelectorAll('.phone-tab-btn').forEach((btn, i) => {
            if (!btn.getAttribute('role')) btn.setAttribute('role', 'tab');
            if (!btn.id) btn.id = `phone-tab-${i}`;
        });
        document.querySelectorAll('.phone-tab-panel').forEach((panel, i) => {
            if (!panel.getAttribute('role')) panel.setAttribute('role', 'tabpanel');
            if (!panel.getAttribute('aria-labelledby'))
                panel.setAttribute('aria-labelledby', `phone-tab-${i}`);
        });

        _ariaAdvanceBtn();
    }

    /* ── Keyboard nav globale ─────────────────────────────── */
    function _setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') &&
                e.target.getAttribute('role') === 'button' &&
                e.target.tagName !== 'BUTTON') {
                e.preventDefault(); e.target.click();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const modal = document.getElementById('nation-transfer-modal')
                       || document.getElementById('transfer-modal');
            if (modal && !modal.classList.contains('hidden')) {
                modal.querySelector('[data-action="close"],.modal-close,#modal-cancel')?.click()
                    ?? modal.classList.add('hidden');
                return;
            }
            document.querySelector('.phone-panel.active,.phone-screen.open')
                ?.querySelector('.phone-back-btn,[data-action="back"]')?.click();
        });
    }

    /* ── Skip link ─────────────────────────────────────────── */
    function _ensureSkipLink() {
        if (document.getElementById('sr-skip-link')) return;
        const a = document.createElement('a');
        a.id = 'sr-skip-link'; a.href = '#desk';
        a.textContent = 'Salta alla scrivania di gioco';
        a.style.cssText = 'position:absolute;top:-9999px;left:0;background:#1565C0;color:#fff;padding:8px 16px;z-index:99999;border-radius:0 0 6px 0;font-size:14px;text-decoration:none;';
        a.addEventListener('focus', () => { a.style.top = '0'; });
        a.addEventListener('blur',  () => { a.style.top = '-9999px'; });
        document.body.insertAdjacentElement('afterbegin', a);
    }

    /* ── CSS: .visually-hidden + :focus-visible ────────────── */
    function _ensureCSS() {
        if (document.getElementById('sr-base-style')) return;
        const s = document.createElement('style');
        s.id = 'sr-base-style';
        s.textContent = `
            .visually-hidden {
                position:absolute!important; width:1px!important; height:1px!important;
                padding:0!important; margin:-1px!important; overflow:hidden!important;
                clip:rect(0,0,0,0)!important; white-space:nowrap!important; border:0!important;
            }
            :focus-visible {
                outline: 3px solid #FFD700 !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(s);
    }

    /* ── INIT ──────────────────────────────────────────────── */
    function init() {
        _ensureLiveRegions(); _ensureSkipLink(); _ensureCSS(); _setupKeyboardNav();

        if (typeof Game === 'undefined' || !Game.on) {
            setTimeout(init, 600); return;
        }

        Game.on('stat-change',    _onStatChange);
        Game.on('stat-change',    _onRepNazChange);
        Game.on('money-change',   _onMoneyChange);
        Game.on('time-advance',   _onTimeAdvance);
        Game.on('ap-change',      _onAPChange);
        Game.on('no-ap',          _onNoAP);
        Game.on('city-change',    _onCityChange);
        Game.on('work-notif',     _onWorkNotif);
        Game.on('urgent-message', _onUrgentMessage);
        Game.on('new-day',        _onNewDay);
        Game.on('bill-paid',      _onBillPaid);

        Game.on('game-loaded', () => {
            _applyPanelARIA(); updateHUD();
            _prevMoney     = Game.state.money;
            _prevAP        = Game.state.actionPoints;
            _prevCity      = Game.state.city?.name;
            _prevDay       = Game.state.day;
            _prevTimeOfDay = Game.state.calendar?.timeOfDay;
            announce('Partita caricata. Benvenuto in Power of Politics.', 'polite');
            // Patch phone tab focus after game loaded
            setTimeout(_patchPhoneTabFocus, 500);
        });

        requestAnimationFrame(() => { _applyPanelARIA(); updateHUD(); _patchPhoneTabFocus(); });

        if (Game.state) {
            _prevMoney     = Game.state.money;
            _prevAP        = Game.state.actionPoints;
            _prevCity      = Game.state.city?.name;
            _prevDay       = Game.state.day;
            _prevTimeOfDay = Game.state.calendar?.timeOfDay;
        }

        console.info('[SR] ✅ Screen Reader module inizializzato (WCAG 2.1 AA)');

        // === Hook into UiEvents (new decoupled layer) ===
        if (typeof UiEvents !== 'undefined') {
            UiEvents.on('VIEW_CHANGED', ({ viewId, previousView }) => {
                const labels = {
                    DESK: 'Scrivania', MAP: 'Mappa', PHONE: 'Telefono',
                    STATS: 'Statistiche', TASKS: 'Compiti', HOUSE: 'Casa',
                    BUDGET: 'Budget', CHARACTER: 'Creazione Personaggio',
                };
                const label = labels[viewId] || viewId;
                announce(`Vista cambiata: ${label}.`, 'polite');
            });

            UiEvents.on('MODAL_OPENED', ({ modalId }) => {
                announce(`Finestra aperta: ${modalId || 'dialogo'}.`, 'assertive');
            });

            UiEvents.on('MODAL_CLOSED', ({ modalId }) => {
                announce(`Finestra chiusa.`, 'polite');
            });

            UiEvents.on('PHONE_TAB_CHANGED', ({ tabId }) => {
                const tabLabels = {
                    POLITICA: 'Politica', LAVORO: 'Lavoro',
                    RELAZIONI: 'Relazioni', MESSAGGI: 'Messaggi',
                    SOCIAL: 'Social', NOTIFICHE: 'Notifiche',
                };
                announce(`Tab telefono: ${tabLabels[tabId] || tabId}.`, 'polite');
                // Move focus to panel content for SR navigation
                focusPhoneTabPanel((tabId || '').toLowerCase());
            });

            UiEvents.on('GAME_EVENT', ({ type }) => {
                if (type === 'OUTCOME_APPLIED') {
                    // Silent — individual stat changes already announced via Game events
                }
                if (type === 'POLITICA_RENDERED') {
                    setTimeout(_applyPoliticaARIA, 100);
                }
            });
        }
    }

    // Auto-init
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else { const w = () => typeof Game !== 'undefined' ? init() : setTimeout(w, 400); w(); }

    /* ── NVDA-safe assertive announcement ─────────────────── */
    // NVDA requires content to be cleared between updates to re-announce.
    // Double RAF + delay ensures the DOM mutation is detected.
    function announceNVDA(message) {
        _ensureLiveRegions();
        const el = document.getElementById('sr-assertive');
        if (!el) return;
        // Clear first
        el.textContent = '';
        requestAnimationFrame(() => requestAnimationFrame(() => {
            el.textContent = message;
        }));
    }

    /* ── Phone tab focus management ───────────────────────── */
    // Call after activating a phone tab to move focus to panel heading or first button.
    const _PHONE_TAB_DESCRIPTIONS = {
        friends:  'Sezione Contatti. Visualizza e interagisci con i tuoi contatti politici.',
        partner:  'Sezione Vita Sentimentale. Gestisci le tue relazioni personali.',
        social:   'Sezione Social Buzz. Pubblica post, gestisci l\'immagine pubblica e i trend.',
        attivita: 'Sezione Attività. Compiti urgenti, lavoro e favori da gestire.',
        favori:   'Sezione Favori. Crediti e favori politici in sospeso.',
        mondo:    'Sezione Mondo. Esplora luoghi, territorio e mappa.',
        archivio: 'Sezione Archivio. Contatti perduti nel tempo.',
        finanza:  'Sezione Finanza. Portafoglio investimenti personali.',
        politica: 'Sezione Politica. Azioni di partito, influenza e carriera politica.',
        comitato: 'Sezione Comitato Centrale. Gestione fazioni e coalizioni.',
    };

    function _applyPhoneTabDescription(tabId) {
        const panel = document.getElementById(`tab-${tabId}`);
        if (!panel) return;
        // Check if description already added
        if (panel.querySelector('[data-sr-tab-desc]')) return;
        const desc = _PHONE_TAB_DESCRIPTIONS[tabId];
        if (!desc) return;
        const p = document.createElement('p');
        p.setAttribute('data-sr-tab-desc', '1');
        p.className = 'visually-hidden';
        p.textContent = desc;
        panel.insertBefore(p, panel.firstChild);
        // Ensure panel has aria-describedby linking to desc
        if (!p.id) p.id = `sr-tab-desc-${tabId}`;
        const existing = panel.getAttribute('aria-describedby');
        if (!existing) panel.setAttribute('aria-describedby', p.id);
    }

    function focusPhoneTabPanel(tabId) {
        _applyPhoneTabDescription(tabId);
        const panel = document.getElementById(`tab-${tabId}`);
        if (!panel) return;
        // Find heading or first focusable button in panel
        requestAnimationFrame(() => {
            const heading = panel.querySelector('h1,h2,h3,h4,[data-sr-heading]');
            const firstBtn = panel.querySelector('button:not([disabled]):not(.phone-back):not(#phone-close)');
            const target = heading || firstBtn;
            if (target) {
                if (!target.getAttribute('tabindex') && target.tagName !== 'BUTTON' && target.tagName !== 'A') {
                    target.setAttribute('tabindex', '-1');
                }
                target.focus({ preventScroll: false });
            }
        });
    }

    /* ── Action outcome focus return ──────────────────────── */
    // After a phone action completes, return focus to the button that triggered it
    // or to a meaningful fallback. Call this from phone action handlers.
    function afterActionFocus(triggerEl, announcement, urgency) {
        if (announcement) announce(announcement, urgency || 'polite');
        if (triggerEl && triggerEl.isConnected) {
            requestAnimationFrame(() => {
                const tag = (triggerEl.tagName || '').toUpperCase();
                const naturallyFocusable = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tag);
                if (!naturallyFocusable && !triggerEl.getAttribute('tabindex')) {
                    triggerEl.setAttribute('tabindex', '-1');
                }
                triggerEl.focus({ preventScroll: false });
            });
        } else {
            // Fall back to phone close button
            const closeBtn = document.getElementById('phone-close');
            if (closeBtn) requestAnimationFrame(() => closeBtn.focus());
        }
    }

    /* ── Section heading helper with focus-able target ─────── */
    // Adds an h3 + description to a dynamic section container, then moves focus there.
    function announceSectionEntry(containerEl, heading, description) {
        if (!containerEl) return;
        let h = containerEl.querySelector('[data-sr-section-live]');
        if (!h) {
            h = document.createElement('h3');
            h.setAttribute('data-sr-section-live', '1');
            h.className = 'visually-hidden';
            h.setAttribute('tabindex', '-1');
            containerEl.insertBefore(h, containerEl.firstChild);
        }
        h.textContent = heading;
        if (description) {
            let p = containerEl.querySelector('[data-sr-section-live-desc]');
            if (!p) {
                p = document.createElement('p');
                p.setAttribute('data-sr-section-live-desc', '1');
                p.className = 'visually-hidden';
                containerEl.insertBefore(p, h.nextSibling);
            }
            p.textContent = description;
        }
        announce(`${heading}. ${description || ''}`, 'polite');
        requestAnimationFrame(() => h.focus({ preventScroll: false }));
    }

    /* ── Patch phone._activateTab for focus management ─────── */
    function _patchPhoneTabFocus() {
        if (typeof Phone === 'undefined' || !Phone._activateTab || Phone._activateTab._srPatched) return;
        const _orig = Phone._activateTab.bind(Phone);
        Phone._activateTab = function(tabId) {
            _orig(tabId);
            // Move focus to panel after a short delay (let render complete)
            setTimeout(() => focusPhoneTabPanel(tabId), 150);
        };
        Phone._activateTab._srPatched = true;
    }

    /* ── Politica section: add ARIA descriptions on render ─── */
    function _applyPoliticaARIA() {
        const politicaContent = document.getElementById('politica-content');
        if (!politicaContent) return;
        if (politicaContent.querySelector('[data-sr-politica-done]')) return;
        // Ensure heading for politica content
        const titleEl = politicaContent.querySelector('.politica-section-title');
        if (titleEl && !titleEl.getAttribute('role')) {
            const h = document.createElement('h3');
            h.setAttribute('data-sr-politica-done', '1');
            h.className = 'visually-hidden';
            h.textContent = 'Sezione Politica — Azioni di partito, influenza e carriera.';
            politicaContent.insertBefore(h, politicaContent.firstChild);
        }

        const actionsGrid = politicaContent.querySelector('.politica-actions-grid');
        if (actionsGrid && !actionsGrid.querySelector('[data-sr-politica-actions-desc]')) {
            const p = document.createElement('p');
            p.className = 'visually-hidden';
            p.setAttribute('data-sr-politica-actions-desc', '1');
            p.textContent = 'Prima di scegliere un azione politica, ascolta il costo in azioni, denaro e l impatto su reputazione, stress e stanchezza.';
            actionsGrid.insertBefore(p, actionsGrid.firstChild);
        }

        // Add descriptions to action buttons that only show cost badge
        politicaContent.querySelectorAll('button:not([aria-describedby])').forEach(btn => {
            const costBadges = btn.querySelectorAll('.phone-cost-badge, .task-ap-cost');
            if (costBadges.length === 0) return;
            const costs = Array.from(costBadges).map(b => b.textContent.trim()).join(', ');
            const existing = btn.getAttribute('aria-label') || btn.textContent.trim();
            btn.setAttribute('aria-label', `${existing.replace(/\s+/g, ' ').trim()} — Costo: ${costs}`);
        });
    }

    /* ── Add "al posto di X c'è Y" output checking ─────────── */
    // After game state changes, validate that HUD elements match state
    function _validateHUDConsistency() {
        if (typeof Game === 'undefined' || !Game.state) return;
        const s = Game.state;
        // Check money display vs state
        const moneyEl = document.getElementById('hud-money');
        if (moneyEl) {
            const displayed = parseInt((moneyEl.textContent || '').replace(/[^0-9-]/g, ''), 10);
            if (!isNaN(displayed) && displayed !== s.money) {
                // HUD is stale — re-trigger update
                Game.emit('money-change');
            }
        }
    }

    return { init, announce, enqueue, SR_PRIORITY, log, silence, trapFocus, releaseFocus, updateHUD,
             moveFocus, openModal, closeModal, openPanel, closePanel,
             sectionHeading, labelList,
             announceNVDA, focusPhoneTabPanel, afterActionFocus, announceSectionEntry,
             _applyPoliticaARIA, _validateHUDConsistency, _patchPhoneTabFocus };
})();

if (typeof window !== 'undefined') window.SR = window.SR || SR;
