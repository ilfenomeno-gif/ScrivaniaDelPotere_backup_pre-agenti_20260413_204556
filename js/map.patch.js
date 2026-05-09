/* MAP.PATCH.JS — Bugfix chirurgici per map.js | 2026-05-06 */

(function applyMapPatches() {
    if (typeof GameMap === 'undefined') {
        setTimeout(applyMapPatches, 500);
        return;
    }

    // HELPER: normalizza cityId rimuovendo prefisso nazione
    function normalizeCityId(id) {
        return String(id || '').replace(/^[a-z]+_/, '');
    }

    // ── BUG #1 + loading overlay ──────────────────────────────
    if (typeof GameMap.executeTransfer !== 'function') return;
    const _origExecuteTransfer = GameMap.executeTransfer.bind(GameMap);
    GameMap.executeTransfer = async function(cityId) {
        this._showTransferLoading(true);
        try {
            // BUG #1 FIX: usa loadAllCities invece di loadCities
            const _save = this.loadCities;
            this.loadCities = this.loadAllCities || this.loadCities;
            try { await _origExecuteTransfer.call(this, cityId); }
            finally { this.loadCities = _save; }
        } finally {
            this._showTransferLoading(false);
        }
    };

    // ── BUG #2: snapshot city in _showTransferInfo ────────────
    if (typeof GameMap._showTransferInfo === 'function') {
        const _orig = GameMap._showTransferInfo.bind(GameMap);
        GameMap._showTransferInfo = function(city) {
            const snap = Object.freeze({ ...city }); // snapshot immutabile
            _orig.call(this, snap);
            const btn = document.getElementById('transfer-confirm');
            if (btn) {
                const fresh = btn.cloneNode(true); // rimuove listener vecchi
                btn.parentNode.replaceChild(fresh, btn);
                fresh.addEventListener('click',
                    () => this.executeTransfer(snap.id), { once: true });
                fresh.setAttribute('aria-label',
                    `Conferma trasferimento a ${snap.name}`);
            }
        };
    }

    // ── BUG #3: MutationObserver per btn-change-nation ────────
    if (typeof GameMap.renderMapPanel === 'function') {
        const _orig = GameMap.renderMapPanel.bind(GameMap);
        GameMap.renderMapPanel = function(targetId) {
            _orig.call(this, targetId);
            const panel = document.getElementById(targetId || 'map-body');
            if (!panel) return;
            const bind = (btn) => {
                if (btn._boundNation) return;
                btn._boundNation = true;
                btn.addEventListener('click', () => this.showNationTransferUI());
                btn.setAttribute('aria-label', 'Cambia nazione di residenza');
            };
            const immBtn = document.getElementById('btn-change-nation');
            if (immBtn) { bind(immBtn); return; }
            const obs = new MutationObserver(() => {
                const b = document.getElementById('btn-change-nation');
                if (b) { bind(b); obs.disconnect(); }
            });
            obs.observe(panel, { childList: true, subtree: true });
            setTimeout(() => obs.disconnect(), 5000);
        };
    }

    // ── BUG #4: recoverContacts normalizza cityId ─────────────
    if (typeof GameMap.recoverContacts === 'function') {
        GameMap.recoverContacts = function(cityId) {
            const norm = normalizeCityId(cityId);
            const state = typeof Game !== 'undefined' ? Game.state : null;
            if (!state || !Array.isArray(state.contactsLost)) return;
            const rec = state.contactsLost.filter(
                c => normalizeCityId(c.originalCity) === norm);
            rec.forEach(c => {
                c.relation = Math.max(0, (c.relation || 40) - 10);
                c.loyalty  = Math.max(0, (c.loyalty  || 30) - 5);
                state.contacts = state.contacts || [];
                state.contacts.push(c);
                if (Game.addWorkNotif)
                    Game.addWorkNotif('🔄 Contatto recuperato',
                        `${c.name} ti ha ricontattato.`, `Giorno ${state.day}`);
            });
            state.contactsLost = state.contactsLost.filter(
                c => normalizeCityId(c.originalCity) !== norm);
        };
    }

    // ── BUG #5: transferToNation usa showInGameCitySelection ──
    if (typeof GameMap.transferToNation === 'function') {
        const _orig = GameMap.transferToNation.bind(GameMap);
        GameMap.transferToNation = function(nationId) {
            const r = _orig.call(this, nationId);
            setTimeout(() => {
                if (typeof Character !== 'undefined' && Character.showInGameCitySelection)
                    Character.showInGameCitySelection();
                else if (typeof Desk !== 'undefined' && Desk.openPanel)
                    Desk.openPanel('map');
            }, 300);
            return r;
        };
    }

    // ── HELPER: overlay loading ────────────────────────────────
    if (typeof GameMap._showTransferLoading !== 'function') {
        GameMap._showTransferLoading = function(show) {
            const ID = 'transfer-loading-overlay';
            let el = document.getElementById(ID);
            if (show) {
                if (!el) {
                    el = document.createElement('div');
                    el.id = ID;
                    el.setAttribute('role', 'status');
                    el.setAttribute('aria-live', 'polite');
                    el.setAttribute('aria-label', 'Trasferimento in corso');
                    el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
                        'background:rgba(0,0,0,0.65);display:flex;flex-direction:column;' +
                        'align-items:center;justify-content:center;z-index:9999;' +
                        'color:#fff;font-size:18px;gap:14px;';
                    el.innerHTML = '<span style="font-size:40px" aria-hidden="true">🚗</span>' +
                                   '<span>Trasferimento in corso...</span>';
                    document.body.appendChild(el);
                }
            } else { if (el) el.remove(); }
        };
    }

    // ── Character.showInGameCitySelection ─────────────────────
    if (typeof Character !== 'undefined' &&
        typeof Character.showInGameCitySelection !== 'function') {
        Character.showInGameCitySelection = function() {
            const c = document.getElementById('phone-map-body')
                   || document.getElementById('map-body');
            if (!c) { if (typeof Desk !== 'undefined') Desk.openPanel?.('map'); return; }
            document.getElementById('ingame-nation-banner')?.remove();
            const b = document.createElement('div');
            b.id = 'ingame-nation-banner';
            b.setAttribute('role','alert'); b.setAttribute('aria-live','assertive');
            b.style.cssText = 'background:#1565C0;color:#fff;padding:10px 16px;' +
                'border-radius:6px;margin-bottom:8px;font-size:13px;position:relative;';
            b.innerHTML = '🌍 <strong>Nuova nazione.</strong> Seleziona la tua città.' +
                '<button id="igncb" aria-label="Chiudi" style="position:absolute;right:10px;' +
                'top:8px;background:none;border:none;color:#fff;cursor:pointer;font-size:18px;">✕</button>';
            c.insertAdjacentElement('afterbegin', b);
            document.getElementById('igncb')?.addEventListener('click', () => b.remove());
            if (typeof GameMap !== 'undefined') GameMap.renderMapPanel?.(c.id);
        };
    }

    console.info('[map.patch.js] ✅ BUG#1 BUG#2 BUG#3 BUG#4 BUG#5 applicati.');
})();