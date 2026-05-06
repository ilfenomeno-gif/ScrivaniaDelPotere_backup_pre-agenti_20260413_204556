/* ============================================
   BALANCE AGENT — Lightweight Monte Carlo Tuning
   ============================================ */

(function (root) {
    'use strict';

    const BalanceAgent = {
        simulate(runs) {
            const cfg = root.GameConstants && root.GameConstants.BALANCE ? root.GameConstants.BALANCE : {};
            const totalRuns = Math.max(10, Number(runs) || cfg.DEFAULT_SIMULATION_RUNS || 100);
            let repPolitical = 0;
            let repWork = 0;
            let stressFire = 0;

            for (let i = 0; i < totalRuns; i++) {
                repPolitical += 8 + Math.random() * 8;
                repWork += 4 + Math.random() * 6;
                stressFire += 8 + Math.random() * 7;
            }

            const avgPolitical = repPolitical / totalRuns;
            const avgWork = repWork / totalRuns;
            const ratio = avgWork > 0 ? avgPolitical / avgWork : 1;
            const suggestedRepMult = ratio > 1.4 ? 0.85 : (ratio > 1.2 ? 0.9 : 1);
            const suggestedFireStressMult = stressFire / totalRuns > 10 ? 0.85 : 0.95;

            return {
                runs: totalRuns,
                averages: {
                    politicalReputation: Number(avgPolitical.toFixed(2)),
                    workReputation: Number(avgWork.toFixed(2)),
                    fireStress: Number((stressFire / totalRuns).toFixed(2)),
                },
                suggestions: {
                    politicalReputationMultiplier: suggestedRepMult,
                    firePostStressMultiplier: suggestedFireStressMult,
                },
            };
        },
    };

    root.BalanceAgent = BalanceAgent;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BalanceAgent;
    }
})(typeof window !== 'undefined' ? window : globalThis);
