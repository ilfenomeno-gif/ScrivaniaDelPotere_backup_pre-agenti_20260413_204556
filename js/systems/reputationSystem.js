/**
 * MULTI-DIMENSIONAL REPUTATION SYSTEM
 * Splits reputation into 3 axes:
 * - consenso popolare (popular consensus)
 * - credibilità istituzionale (institutional credibility) 
 * - reputazione mediatica (media reputation)
 * 
 * Backward compatibility: Game.state.reputazione maps to average of 3 axes
 */

const ReputationSystem = {
    init() {
        this.ensureState();
        if (typeof Game === 'undefined' || !Game.on) return;
        Game.on('new-day', () => this.ensureState());
    },

    ensureState() {
        if (!Game.state.reputation) {
            Game.state.reputation = {
                popolare: 50,           // Consenso popolare (0-100)
                istituzionale: 50,      // Credibilità istituzionale (0-100)
                mediatica: 50,          // Reputazione mediatica (0-100)
                lastUpdate: -99
            };
        }
        // Backward compatibility: reputazione property maps to average
        if (!Game.state.reputazione) Game.state.reputazione = 50;
        Game.state.reputazione = Math.round((Game.state.reputation.popolare + Game.state.reputation.istituzionale + Game.state.reputation.mediatica) / 3);
    },

    /**
     * Change reputation on a specific axis
     * @param axis 'popolare' | 'istituzionale' | 'mediatica'
     * @param amount change amount (-100 to +100)
     */
    changeAxis(axis, amount) {
        this.ensureState();
        if (!['popolare', 'istituzionale', 'mediatica'].includes(axis)) return false;
        Game.state.reputation[axis] = Math.max(0, Math.min(100, Game.state.reputation[axis] + amount));
        // Update average
        Game.state.reputazione = Math.round((Game.state.reputation.popolare + Game.state.reputation.istituzionale + Game.state.reputation.mediatica) / 3);
        return true;
    },

    /**
     * DLC-specific reputation changes
     * Different DLC affect different axes
     */
    applyDlcInfluence() {
        const active = Game.state.flags?.activeDlc || [];
        
        // dlc_stampa_media -> affects reputazione mediatica
        if (active.includes('dlc_stampa_media') && Math.random() < 0.15) {
            const change = Math.random() < 0.5 ? -2 : 2;
            this.changeAxis('mediatica', change);
        }

        // dlc_toghe_judiciary -> affects reputazione istituzionale
        if (active.includes('dlc_toghe_judiciary') && Math.random() < 0.12) {
            const change = Math.random() < 0.5 ? -1 : 1;
            this.changeAxis('istituzionale', change);
        }

        // dlc_lobby_pressure -> affects consenso popolare (negatively if scandals)
        if (active.includes('dlc_lobby_pressure')) {
            const scandals = Game.state.lobbies?.playerDebtsToLobbies ? Object.keys(Game.state.lobbies.playerDebtsToLobbies).length : 0;
            if (scandals > 0 && Math.random() < 0.1) {
                this.changeAxis('popolare', -3);
            }
        }

        // dlc_campagna_elettorale -> affects consenso popolare (momentum helps)
        if (active.includes('dlc_campagna_elettorale') && Game.state.campaign?.campaignActive) {
            const momentum = Game.state.campaign.momentum || 0;
            const change = Math.round((momentum / 100) * 2);  // Up to +2 if momentum is high
            if (change > 0) this.changeAxis('popolare', change);
        }
    },

    /**
     * Get reputation axis value
     */
    get(axis) {
        this.ensureState();
        return axis ? Game.state.reputation[axis] || 0 : Game.state.reputazione;
    },

    /**
     * Get all axes
     */
    getAll() {
        this.ensureState();
        return {
            popolare: Game.state.reputation.popolare,
            istituzionale: Game.state.reputation.istituzionale,
            mediatica: Game.state.reputation.mediatica,
            average: Game.state.reputazione
        };
    },

    /**
     * Display reputation UI tooltip
     */
    getTooltip() {
        const all = this.getAll();
        return `
Reputazione Nazionale
└─ Consenso Popolare: ${all.popolare}
└─ Credibilità Istituzionale: ${all.istituzionale}
└─ Reputazione Mediatica: ${all.mediatica}
MEDIA: ${all.average}
        `.trim();
    }
};

if (typeof window !== 'undefined') window.ReputationSystem = ReputationSystem;
