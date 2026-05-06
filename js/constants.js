/* ============================================
   GAME CONSTANTS — Centralized Tuning
   ============================================ */

(function (root) {
    'use strict';

    const GameConstants = {
        ECONOMY: {
            TRANSFER_COST_SAME_REGION: 200,
            TRANSFER_COST_INTERREGIONAL: 400,
            TRANSFER_COST_INTERNATIONAL_FALLBACK: 2000,
            TRANSFER_ACTION_POINTS_INTERNATIONAL: 2,
            PHONE_DINNER_BASE_COST: 25,
            FAMILY_DINNER_COST: 10,
            BETRAY_CONTACT_CASHOUT: 100,
        },
        BALANCE: {
            POLITICAL_REPUTATION_MULTIPLIER: 0.85,
            FIRE_POST_STRESS_MULTIPLIER: 0.85,
            DEFAULT_SIMULATION_RUNS: 100,
        },
        DEBT: {
            BUDGET_CYCLE_INTEREST_RATE: 0.10,
            INSTALLMENT_DUE_STEP_DAYS: 3,
            MORTGAGE_DUE_STEP_DAYS: 5,
        },
    };

    root.GameConstants = GameConstants;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = GameConstants;
    }
})(typeof window !== 'undefined' ? window : globalThis);
