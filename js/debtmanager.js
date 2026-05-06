/* ============================================
   DEBT MANAGER — Unified Debt Operations
   ============================================ */

(function (root) {
    'use strict';

    const DebtManager = {
        ensureState(state) {
            const s = state || (root.Game && root.Game.state);
            if (!s) return null;
            if (!Object.prototype.hasOwnProperty.call(s, 'debt')) s.debt = 0;
            if (!Array.isArray(s.debtHistory)) s.debtHistory = [];
            if (!s._debtLedger) s._debtLedger = {};
            return s;
        },

        _pushHistory(state, type, amount, reason) {
            if (!Array.isArray(state.debtHistory)) state.debtHistory = [];
            state.debtHistory.push({ day: state.day, type, amount, reason });
        },

        addDebt(amount, reason, type) {
            const state = this.ensureState();
            if (!state) return 0;
            const delta = Math.max(0, Math.round(Number(amount) || 0));
            if (delta <= 0) return state.debt;
            state.debt += delta;
            this._pushHistory(state, type || 'debt-add', delta, reason || 'Debito aggiunto');
            return state.debt;
        },

        payDebt(amount, reason, type) {
            const state = this.ensureState();
            if (!state) return 0;
            const delta = Math.max(0, Math.round(Number(amount) || 0));
            if (delta <= 0) return state.debt;
            state.debt = Math.max(0, state.debt - delta);
            this._pushHistory(state, type || 'debt-pay', delta, reason || 'Debito ridotto');
            return state.debt;
        },

        applyInterest(rate, reason) {
            const state = this.ensureState();
            if (!state || state.debt <= 0) return 0;
            const pct = Math.max(0, Number(rate) || 0);
            if (pct <= 0) return 0;
            const interest = Math.ceil(state.debt * pct);
            state.debt += interest;
            this._pushHistory(state, 'interest', interest, reason || `Interessi debito (${Math.round(pct * 100)}%)`);
            return interest;
        },

        canProcessOnDay(debtId, day) {
            const state = this.ensureState();
            if (!state || !debtId) return true;
            const key = String(debtId);
            return state._debtLedger[key] !== day;
        },

        markProcessed(debtId, day) {
            const state = this.ensureState();
            if (!state || !debtId) return;
            state._debtLedger[String(debtId)] = day;
        },
    };

    root.DebtManager = DebtManager;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = DebtManager;
    }
})(typeof window !== 'undefined' ? window : globalThis);
