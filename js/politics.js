/* ============================================
   POLITICS — Motore Politico Avanzato
   Conversione ideologica, statistiche avanzate,
   applyOutcome centralizzato
   ============================================ */

const Politics = (() => {
    'use strict';

    /* ── Matrice conversione tra partiti di nazioni diverse ── */
    const CONVERSION_MATRIX = {
        italy: {
            france:  { trustPenalty: 0.25, speedPenalty: 0.20, decayTurns: 24 },
            germany: { trustPenalty: 0.30, speedPenalty: 0.25, decayTurns: 30 },
            uk:      { trustPenalty: 0.35, speedPenalty: 0.30, decayTurns: 36 },
        },
        france: {
            italy:   { trustPenalty: 0.25, speedPenalty: 0.20, decayTurns: 24 },
            germany: { trustPenalty: 0.20, speedPenalty: 0.15, decayTurns: 20 },
            uk:      { trustPenalty: 0.30, speedPenalty: 0.25, decayTurns: 30 },
        },
        germany: {
            italy:   { trustPenalty: 0.30, speedPenalty: 0.25, decayTurns: 30 },
            france:  { trustPenalty: 0.20, speedPenalty: 0.15, decayTurns: 20 },
            uk:      { trustPenalty: 0.25, speedPenalty: 0.20, decayTurns: 24 },
        },
        uk: {
            italy:   { trustPenalty: 0.35, speedPenalty: 0.30, decayTurns: 36 },
            france:  { trustPenalty: 0.30, speedPenalty: 0.25, decayTurns: 30 },
            germany: { trustPenalty: 0.25, speedPenalty: 0.20, decayTurns: 24 },
        },
    };

    /* ── Statistiche avanzate (politiche/sociali/criminali) ── */
    const DEFAULT_ADVANCED_STATS = {
        political: {
            partyInfluence: 0.0,
            publicSupport: 0.1,
            internationalReputation: 0.0,
            legislativeSkill: 0.0,
        },
        social: {
            charisma: 0.3,
            negotiation: 0.2,
            loyaltyNetwork: 0.0,
        },
        criminal: {
            mafiaReputation: 0.0,
            policeSuspicion: 0.0,
            financialOpacity: 0.0,
        },
    };

    /* ── Init: assicura strutture nello state ──────────────── */
    function init() {
        if (!Game.state._politics) {
            Game.state._politics = {
                conversionMalus: null,
                advancedStats: JSON.parse(JSON.stringify(DEFAULT_ADVANCED_STATS)),
                nationHistory: [],
            };
        }
        // Hook giornaliero per tick conversione
        Game.on('time-advance', (d) => {
            if (d.timeOfDay === 0) tickConversion();
        });
        // Hook cambio nazione
        Game.on('nation-change', () => _onNationChange());
        Game.on('nation-changed', () => _onNationChange());
    }

    /* ── Getter statistiche avanzate ──────────────────────── */
    function getAdvancedStats() {
        return Game.state._politics ? Game.state._politics.advancedStats : DEFAULT_ADVANCED_STATS;
    }

    function getStat(category, key) {
        const stats = getAdvancedStats();
        return (stats[category] && typeof stats[category][key] === 'number')
            ? stats[category][key] : 0;
    }

    /* ── Clamp utility ───────────────────────────────────── */
    function _clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    /* ── applyOutcome: punto unico per tutti i cambiamenti ── */
    function applyOutcome(outcome) {
        if (!outcome || typeof outcome !== 'object') return;
        const stats = getAdvancedStats();

        // Political
        if (outcome.partyInfluence) {
            stats.political.partyInfluence = _clamp(
                stats.political.partyInfluence + outcome.partyInfluence, 0, 1);
        }
        if (outcome.publicSupport) {
            stats.political.publicSupport = _clamp(
                stats.political.publicSupport + outcome.publicSupport, 0, 1);
        }
        if (outcome.internationalReputation) {
            stats.political.internationalReputation = _clamp(
                stats.political.internationalReputation + outcome.internationalReputation, 0, 1);
        }
        if (outcome.legislativeSkill) {
            stats.political.legislativeSkill = _clamp(
                stats.political.legislativeSkill + outcome.legislativeSkill, 0, 1);
        }

        // Social
        if (outcome.charisma) {
            stats.social.charisma = _clamp(stats.social.charisma + outcome.charisma, 0, 1);
        }
        if (outcome.negotiation) {
            stats.social.negotiation = _clamp(stats.social.negotiation + outcome.negotiation, 0, 1);
        }
        if (outcome.loyaltyNetwork) {
            stats.social.loyaltyNetwork = _clamp(
                stats.social.loyaltyNetwork + outcome.loyaltyNetwork, 0, 1);
        }

        // Criminal
        if (outcome.mafiaRep) {
            stats.criminal.mafiaReputation = _clamp(
                stats.criminal.mafiaReputation + outcome.mafiaRep, 0, 1);
        }
        if (outcome.policeSuspicion) {
            stats.criminal.policeSuspicion = _clamp(
                stats.criminal.policeSuspicion + outcome.policeSuspicion, 0, 1);
        }
        if (outcome.financialOpacity) {
            stats.criminal.financialOpacity = _clamp(
                stats.criminal.financialOpacity + outcome.financialOpacity, 0, 1);
        }

        // Bridge verso il sistema esistente di Game
        if (outcome.reputazione && typeof Game.changeReputazione === 'function') {
            Game.changeReputazione(outcome.reputazione);
        }
        if (outcome.money && typeof Game.changeMoney === 'function') {
            Game.changeMoney(outcome.money);
        }
        if (outcome.stress && typeof Game.changeStat === 'function') {
            Game.changeStat('stress', outcome.stress);
        }
        if (outcome.morale && typeof Game.changeStat === 'function') {
            Game.changeStat('morale', outcome.morale);
        }
        if (outcome.coherence && typeof Game.changeStat === 'function') {
            Game.changeStat('coherence', outcome.coherence);
        }

        // Emit evento per UI/SR
        if (typeof UiEvents !== 'undefined') {
            UiEvents.emit('GAME_EVENT', {
                type: 'OUTCOME_APPLIED',
                outcome,
            });
        }
    }

    /* ── Conversione politica: applica malus cambio nazione ── */
    function _onNationChange() {
        const pol = Game.state._politics;
        if (!pol) return;
        const oldNation = pol._lastNationId;
        const newNation = Game.state.nation?.id;
        if (!oldNation || oldNation === newNation) {
            pol._lastNationId = newNation;
            return;
        }

        // Cerca malus di conversione
        const matrix = CONVERSION_MATRIX[oldNation];
        if (matrix && matrix[newNation]) {
            const conv = matrix[newNation];
            pol.conversionMalus = {
                trustPenalty: conv.trustPenalty,
                speedPenalty: conv.speedPenalty,
                turnsLeft: conv.decayTurns,
                turnsTotal: conv.decayTurns,
            };
            // Registra nella storia
            pol.nationHistory.push({
                from: oldNation,
                to: newNation,
                day: Game.state.day,
            });
        }
        pol._lastNationId = newNation;
    }

    /* ── Tick giornaliero: riduce malus conversione ────────── */
    function tickConversion() {
        const pol = Game.state._politics;
        if (!pol || !pol.conversionMalus) return;
        const malus = pol.conversionMalus;
        if (malus.turnsLeft <= 0) {
            pol.conversionMalus = null;
            return;
        }
        malus.turnsLeft -= 1;
        // Nessuna notifica: il giocatore lo scopre da solo
    }

    /* ── Getter malus attivo (per altri moduli) ────────────── */
    function getCurrentTrustPenalty() {
        const pol = Game.state._politics;
        if (!pol || !pol.conversionMalus) return 0;
        const m = pol.conversionMalus;
        return m.trustPenalty * (m.turnsLeft / m.turnsTotal);
    }

    function getCurrentSpeedPenalty() {
        const pol = Game.state._politics;
        if (!pol || !pol.conversionMalus) return 0;
        const m = pol.conversionMalus;
        return m.speedPenalty * (m.turnsLeft / m.turnsTotal);
    }

    /* ── Calcolo rischio mafia dinamico ────────────────────── */
    function getMafiaJobRisk(baseRisk) {
        const nation = _getNationData();
        const repression = (nation && nation.lawModifiers)
            ? (nation.lawModifiers.mafiaRepression || 0.5) : 0.5;
        const suspicion = getStat('criminal', 'policeSuspicion');
        const mafiaRep = getStat('criminal', 'mafiaReputation');

        let risk = baseRisk || 0.2;
        risk += repression * 0.3;
        risk += suspicion * 0.4;
        risk -= mafiaRep * 0.2;
        return _clamp(risk, 0, 1);
    }

    /* ── Helper: ottieni dati nazione corrente ─────────────── */
    function _getNationData() {
        if (typeof Nations !== 'undefined' && Nations.getCurrentNation) {
            return Nations.getCurrentNation();
        }
        return null;
    }

    /* ── Calcolo disponibilità lavori politici ─────────────── */
    function isJobAvailable(job) {
        if (job.requiresNation && job.requiresNation !== Game.state.nation?.id) return false;
        if (job.requiresInfluence && getStat('political', 'partyInfluence') < job.requiresInfluence) return false;
        if (job.requiresPublicSupport && getStat('political', 'publicSupport') < job.requiresPublicSupport) return false;
        return true;
    }

    /* ── API pubblica ──────────────────────────────────────── */
    return {
        init,
        getAdvancedStats,
        getStat,
        applyOutcome,
        getCurrentTrustPenalty,
        getCurrentSpeedPenalty,
        getMafiaJobRisk,
        isJobAvailable,
        CONVERSION_MATRIX,
    };
})();

if (typeof window !== 'undefined') window.Politics = Politics;
