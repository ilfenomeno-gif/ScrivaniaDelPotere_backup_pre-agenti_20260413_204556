/* ============================================
   NATION PROFILE SYSTEM
   Bonuses/maluses by nation + party + mentor
   ============================================ */

const NationProfileSystem = {
    NOTIFY_EVERY_DAYS: 7,

    NATION_BASE_EFFECTS: {
        italy: { stress: 1, reputazione: 1 },
        france: { reputazioneNazionale: 1, coherence: 1 },
        germany: { money: 30, stress: -1 },
        uk: { reputazioneNazionale: 1, morale: 1 },
        spain: { carisma: 1, reputazione: 1 },
        portugal: { morale: 2, stress: -1 },
        benelux: { networking: 2, reputazioneNazionale: 1 },
        switzerland: { money: 50, coherence: 1 },
    },

    PARTY_EFFECTS: {
        it_pd: { reputazione: 2, coherence: 1 },
        it_fdi: { reputazioneNazionale: 2, stress: 1 },
        it_lega: { followers: 60, coherence: -1 },
        it_m5s: { morale: 2, reputazione: 1 },
        it_fi: { money: 35, networking: 1 },
        it_avs: { morale: 2, coherence: 1 },
        es_psoe: { reputazione: 2, carisma: 1 },
        es_pp: { money: 30, reputazioneNazionale: 1 },
        es_vox: { followers: 80, stress: 1 },
        pt_ps: { morale: 2, reputazione: 1 },
        pt_psd: { money: 25, networking: 1 },
        pt_chega: { followers: 70, coherence: -1 },
        bx_epp_union: { networking: 2, reputazioneNazionale: 2 },
        bx_green_pact: { morale: 3, reputazione: 1 },
        bx_national_frontier: { followers: 60, stress: 1 },
        ch_fdp: { money: 40, intelligenza: 1 },
        ch_sp: { reputazione: 2, coherence: 1 },
        ch_svp: { reputazioneNazionale: 1, followers: 40 },
    },

    COMBO_EFFECTS: {
        'italy|it_pd': { reputazione: 2, coherence: 1 },
        'italy|it_fdi': { reputazioneNazionale: 2, stress: 1 },
        'spain|es_psoe': { carisma: 1, reputazione: 2 },
        'spain|es_pp': { money: 20, reputazioneNazionale: 1 },
        'portugal|pt_ps': { morale: 2, stress: -1 },
        'benelux|bx_green_pact': { morale: 3, reputazione: 1 },
        'switzerland|ch_fdp': { money: 60, intelligenza: 1 },
        'switzerland|ch_sp': { coherence: 2, reputazione: 1 },
    },

    MENTOR_ARCHETYPE_EFFECTS: {
        marta: { coherence: 2, reputazione: 1 },
        roberto: { networking: 2, money: 20 },
        beppe: { followers: 90, carisma: 1 },
        elena: { intelligenza: 1, money: 25 },
        massimo: { reputazioneNazionale: 1, stress: 1 },
        anziano: { coherence: 1, stress: -1 },
    },

    MENTOR_PARTY_ALIGNMENT: {
        marta: ['it_avs', 'it_pd', 'bx_green_pact', 'ch_sp'],
        roberto: ['it_fi', 'pt_psd', 'bx_epp_union', 'ch_fdp'],
        beppe: ['it_m5s', 'pt_chega', 'es_vox', 'bx_national_frontier'],
        massimo: ['it_fdi', 'it_lega', 'es_pp', 'ch_svp'],
        elena: ['it_pd', 'es_psoe', 'pt_ps', 'bx_epp_union'],
    },

    init() {
        Game.on('new-day', () => this.onNewDay());
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('il_vecchio_mondo_expansion') || active.includes('cambio_nazione_pro');
    },

    runBaseEvents() {
        return true;
    },

    runDlcEvents() {
        return this.isActive();
    },

    onNewDay() {
        if (!this.isActive()) return;

        const nationId = (Game.state.nation && Game.state.nation.id) || 'italy';
        const party = Game.state.party || {};
        const mentor = Game.state.flags && Game.state.flags.mentor ? Game.state.flags.mentor : {};
        const mentorArchetype = mentor.id || '';
        const partyId = party.id || '';
        const summary = [];

        this.applyEffects(this.NATION_BASE_EFFECTS[nationId], summary, `nazione ${nationId}`);
        this.applyEffects(this.PARTY_EFFECTS[partyId], summary, `partito ${partyId}`);
        this.applyEffects(this.COMBO_EFFECTS[`${nationId}|${partyId}`], summary, 'sinergia nazione+partito');
        this.applyEffects(this.MENTOR_ARCHETYPE_EFFECTS[mentorArchetype], summary, `mentore ${mentorArchetype || 'nessuno'}`);

        if (mentor.active && mentor.selectedId && partyId) {
            const allowed = this.MENTOR_PARTY_ALIGNMENT[mentorArchetype] || [];
            if (allowed.includes(partyId)) {
                this.applyEffects({ reputazione: 1, coherence: 1 }, summary, 'allineamento mentore-partito');
            } else if (allowed.length > 0) {
                this.applyEffects({ stress: 2, coherence: -2, reputazione: -1 }, summary, 'conflitto mentore-partito');
            }
        }

        const partyNation = party.country || party.nationId || (party._partyData && party._partyData.country);
        if (partyId && partyNation && partyNation !== nationId) {
            Game.changeStat('stress', 2);
            Game.changeReputazione(-1);
            summary.push('malus coerenza geografica');
        }

        if ((Game.state.day || 0) % this.NOTIFY_EVERY_DAYS === 0 && summary.length > 0) {
            const details = summary.slice(0, 3).join(', ');
            Game.addWorkNotif('🧬 Profilo Nazione', `Effetti attivi: ${details}${summary.length > 3 ? ', ...' : ''}.`, `Giorno ${Game.state.day}`);
        }
    },

    applyEffects(effects, summary, label) {
        if (!effects) return;
        if (effects.reputazione) Game.changeReputazione(effects.reputazione);
        if (effects.reputazioneNazionale) {
            Game.state.reputazioneNazionale = Math.max(0, Math.min(100, (Game.state.reputazioneNazionale || 0) + effects.reputazioneNazionale));
            Game.emit('stat-change', {
                stat: 'reputazioneNazionale',
                old: (Game.state.reputazioneNazionale || 0) - effects.reputazioneNazionale,
                value: Game.state.reputazioneNazionale,
            });
        }
        if (effects.money) Game.changeMoney(effects.money);
        if (effects.followers) {
            if (!Game.state.social) Game.state.social = { followers: 80 };
            Game.state.social.followers = Math.max(0, (Game.state.social.followers || 0) + effects.followers);
        }

        ['morale', 'stress', 'coherence', 'carisma', 'intelligenza', 'networking'].forEach(stat => {
            if (effects[stat]) Game.changeStat(stat, effects[stat]);
        });

        if (summary && label) summary.push(label);
    },
};

if (typeof window !== 'undefined') window.NationProfileSystem = NationProfileSystem;
