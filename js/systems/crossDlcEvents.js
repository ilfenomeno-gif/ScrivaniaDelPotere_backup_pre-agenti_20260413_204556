/**
 * CROSS-DLC EVENTS
 * Events triggered when 2+ DLC are active simultaneously
 * Follows pattern: isActive('id1') && isActive('id2') => run event
 */

const CrossDlcEvents = {
    init() {
        if (typeof Game === 'undefined' || !Game.on) return;
        Game.on('new-day', () => this.checkAndFireEvents());
    },

    isActive(dlcId) {
        const active = (Game.state?.flags?.activeDlc) || [];
        return Array.isArray(active) && active.includes(dlcId);
    },

    checkAndFireEvents() {
        const day = Game.state.day || 0;

        // EVENT 1: Party-Lobby synergy
        // If both Correnti Interne + Lobby active
        if (this.isActive('dlc_correnti_interne_party') && this.isActive('dlc_lobby_pressure')) {
            if (day % 14 === 0 && Math.random() < 0.4) {
                const msg = 'Una lobby esterna prova a influenzare le correnti interne del partito.';
                Game.addWorkNotif('🔗 Sinergia', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'polite');
            }
        }

        // EVENT 2: Ministry-Backstory synergy
        // If Ministry + Backstory active, family member in government
        if (this.isActive('dlc_ministero_governo') && this.isActive('dlc_sangue_memoria_backstory')) {
            if (day % 20 === 0 && Math.random() < 0.3) {
                const msg = 'Un membro della tua famiglia richiede un favore dal ministero dove lavori.';
                Game.addWorkNotif('👨‍👩‍👧 Famiglia', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'assertive');
            }
        }

        // EVENT 3: Campaign-Party synergy
        // If Campaign + Correnti Interne active, internal party contests help campaign
        if (this.isActive('dlc_campagna_elettorale') && this.isActive('dlc_correnti_interne_party')) {
            if (Game.state.campaign?.campaignActive && day % 10 === 0 && Math.random() < 0.5) {
                const bonus = 5 + Math.floor(Math.random() * 5);
                Game.state.campaign.momentum = Math.min(100, Game.state.campaign.momentum + bonus);
                const msg = `Supporto dalla tua corrente di partito. Momentum campagna: +${bonus}.`;
                Game.addWorkNotif('🚀 Aiuto', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'polite');
            }
        }

        // EVENT 4: Lobby-Ministry conflict
        // If both Lobby + Ministry active, lobbyists pressure minister
        if (this.isActive('dlc_lobby_pressure') && this.isActive('dlc_ministero_governo')) {
            if (Game.state.ministry?.hasMinistry && day % 12 === 0 && Math.random() < 0.4) {
                const pressure = 3 + Math.floor(Math.random() * 7);
                Game.state.ministry.auditRisks = Math.min(100, Game.state.ministry.auditRisks + pressure);
                const msg = `Lobbisti pressano il ministero per decisioni favorevoli. Rischio audit: +${pressure}.`;
                Game.addWorkNotif('💼 Pressione', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'polite');
            }
        }

        // EVENT 5: Backstory-Campaign synergy
        // If Backstory + Campaign active, personal past affects campaign
        if (this.isActive('dlc_sangue_memoria_backstory') && this.isActive('dlc_campagna_elettorale')) {
            if (Game.state.campaign?.campaignActive && day % 15 === 0) {
                const ghost = Game.state.backstory?.ghosts?.[Math.floor(Math.random() * 4)];
                if (ghost && ghost.lastMet > day - 50) {
                    const impact = ghost.relation > 0 ? 8 : -5;
                    Game.state.campaign.momentum = Math.max(-100, Math.min(100, Game.state.campaign.momentum + impact));
                    const dir = impact > 0 ? 'positivamente' : 'negativamente';
                    const msg = `${ghost.name} appare sui media durante la campagna, influendo ${dir}. Momentum: ${impact > 0 ? '+' : ''}${impact}.`;
                    Game.addWorkNotif('👥 Media', msg, `Giorno ${day}`);
                    if (window.SR) SR.announce(msg, 'polite');
                }
            }
        }

        // EVENT 6: Triple synergy: Party + Ministry + Campaign
        // If all three active, internal political stability matters for elections
        if (this.isActive('dlc_correnti_interne_party') && 
            this.isActive('dlc_ministero_governo') && 
            this.isActive('dlc_campagna_elettorale')) {
            if (Game.state.campaign?.campaignActive && day % 25 === 0) {
                const tension = Game.state.partyInternals?.internalTension || 0;
                const bonusFromStability = Math.max(0, 30 - tension) / 10;  // 0-3 bonus if stable
                Game.state.campaign.momentum = Math.min(100, Game.state.campaign.momentum + bonusFromStability);
                const msg = `Stabilità governativa aiuta la campagna. Momentum: +${bonusFromStability.toFixed(1)}.`;
                Game.addWorkNotif('🏛️ Governo', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'polite');
            }
        }

        // EVENT 7: Lobby-Backstory scandal
        // If Lobby + Backstory active, old skeleton exposed by lobbyist enemies
        if (this.isActive('dlc_lobby_pressure') && this.isActive('dlc_sangue_memoria_backstory')) {
            if (Game.state.lobbies?.conflictOfInterestRisk >= 50 && 
                Game.state.backstory?.skeletons >= 60 && 
                Math.random() < 0.06 && day % 10 === 0) {
                const msg = 'Un lobby nemico divulga scheletri dal tuo passato come arma di ricatto.';
                Game.addWorkNotif('🔴 Scandalo', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'assertive');
                Game.changeReputazione(-15, 'nazionale');
                Game.state.backstory.skeletons = Math.max(0, Game.state.backstory.skeletons - 25);  // Exposed
            }
        }

        // EVENT 8: Ministry-Backstory positive:  Old mentor in government
        // If both active and old_mentor relation > 40, ministry decisions favor you
        if (this.isActive('dlc_ministero_governo') && this.isActive('dlc_sangue_memoria_backstory')) {
            if (Game.state.ministry?.hasMinistry && 
                Game.state.backstory?.ghosts?.[3]?.relation > 40 && 
                Math.random() < 0.08 && day % 20 === 0) {
                const bonus = 50 + Math.floor(Math.random() * 100);
                Game.state.ministry.budget = Math.min(Game.state.ministry.budget + bonus, 500);
                const msg = `Il tuo vecchio mentore nel governo ti procura €${bonus}M di budget speciale.`;
                Game.addWorkNotif('💰 Aiuto', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'assertive');
            }
        }
    }
};

if (typeof window !== 'undefined') window.CrossDlcEvents = CrossDlcEvents;
