/* ============================================
   DIPLOMACY SYSTEM — "Oltre i Confini"
   Expansion Pack: International Relations, Bilateral Deals, Offshore Funds
   ============================================ */

const Diplomacy = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.diplomacy) {
            Game.state.diplomacy = {
                foreignRelations: [
                    { nation: 'france', relation: 50, tradeVolume: 1000, influence: 30, crisis: false },
                    { nation: 'germany', relation: 55, tradeVolume: 1200, influence: 35, crisis: false },
                    { nation: 'uk', relation: 45, tradeVolume: 900, influence: 25, crisis: false },
                    { nation: 'spain', relation: 50, tradeVolume: 800, influence: 20, crisis: false },
                ],
                bilateralDeals: [],           // Active trade/political deals
                diplomats: [
                    { id: 'amb_fr', nation: 'france', name: 'Ambasciatore Rossi', loyalty: 60, skill: 70 },
                    { id: 'amb_de', nation: 'germany', name: 'Ambasciatore Bianchi', loyalty: 55, skill: 65 },
                    { id: 'amb_uk', nation: 'uk', name: 'Ambasciatore Verdi', loyalty: 50, skill: 60 },
                ],
                euFundsAccess: 0,             // 0-100, how much EU funding character can access
                offshoreAccounts: [],         // Hidden capital stored abroad
                geopoliticAlignments: {
                    nato: 50,                  // Alignment with NATO/Western bloc
                    eu: 55,                    // EU integration score
                    brics: 20,                 // Alignment with BRICS
                },
                lastDealDay: -99,
                lastCrisisDay: -99,
            };
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_oltre_confini_diplomacy');
    },

    // Base-game DNA: generic foreign news events
    runBaseEvents() {
        const day = Game.state.day || 0;

        if (Math.random() < 0.06) {
            Game.addWorkNotif('Notizie Estere', 'Un paese europeo ha cambiato governo. Potrebbe influenzare i mercati.', `Giorno ${day}`);
        }

        if (Math.random() < 0.04) {
            Game.addWorkNotif('Equilibri Internazionali', 'I rapporti tra potenze cambiano. L\'Italia osserva attentamente.', `Giorno ${day}`);
        }
    },

    // DLC-only: full diplomatic system
    runDlcEvents() {
        const day = Game.state.day || 0;
        const dip = Game.state.diplomacy;

        // Check for new bilateral deals
        if (day - dip.lastDealDay >= 10 && Math.random() < 0.12) {
            this.proposeBilateralDeal(day);
        }

        // Foreign relations drift and crises
        dip.foreignRelations.forEach(rel => {
            // Slow drift
            if (Math.random() < 0.05) {
                rel.relation += Math.random() < 0.5 ? 1 : -1;
                rel.relation = Math.max(0, Math.min(100, rel.relation));
            }

            // Random crisis
            if (rel.relation < 40 && Math.random() < 0.08 && !rel.crisis) {
                rel.crisis = true;
                Game.addWorkNotif(
                    'Crisi Diplomatica',
                    `Le relazioni con la ${rel.nation.toUpperCase()} si sono deteriorate. Diplomazia necessaria.`,
                    `Giorno ${day}`
                );
            }

            // Crisis resolution
            if (rel.crisis && Math.random() < 0.15) {
                rel.crisis = false;
                Game.addWorkNotif('Tregua Diplomatica', `Le tensioni con la ${rel.nation.toUpperCase()} si sono calmate.`, `Giorno ${day}`);
            }
        });

        // EU funds fluctuation
        if (Math.random() < 0.08) {
            const change = Math.random() < 0.5 ? 5 : -5;
            dip.euFundsAccess = Math.max(0, Math.min(100, dip.euFundsAccess + change));
        }
    },

    proposeBilateralDeal(day) {
        const dip = Game.state.diplomacy;
        dip.lastDealDay = day;

        const dealTypes = [
            { name: 'Accordo Commerciale', reward: 500, duration: 30 },
            { name: 'Cooperazione Politica', reward: 300, duration: 20 },
            { name: 'Accordo Culturale', reward: 200, duration: 15 },
        ];
        const dealType = dealTypes[Math.floor(Math.random() * dealTypes.length)];
        const nation = dip.foreignRelations[Math.floor(Math.random() * dip.foreignRelations.length)];

        const deal = {
            id: `deal_${day}_${Math.random() * 1000}`,
            nation: nation.nation,
            type: dealType.name,
            reward: dealType.reward,
            startDay: day,
            duration: dealType.duration,
            completed: false,
        };

        dip.bilateralDeals.push(deal);
        Game.addWorkNotif(
            'Proposta Accordo',
            `La ${nation.nation.toUpperCase()} propone: ${dealType.name}. Ricompensa: €${dealType.reward}`,
            `Giorno ${day}`
        );
    },

    // Accept a bilateral deal
    acceptDeal(dealId) {
        const dip = Game.state.diplomacy;
        const deal = dip.bilateralDeals.find(d => d.id === dealId);
        if (!deal) return false;

        deal.accepted = true;
        deal.endDay = (Game.state.day || 0) + deal.duration;
        Game.addWorkNotif(
            'Accordo Sottoscritto',
            `Hai sottoscritto il ${deal.type} con la ${deal.nation.toUpperCase()}. Ricompensa in €${deal.reward} tra ${deal.duration} giorni.`,
            `Giorno ${Game.state.day}`
        );
        return true;
    },

    // Claim EU funding
    claimEuFunding() {
        const dip = Game.state.diplomacy;
        const euBonus = Math.floor(dip.euFundsAccess * 10);
        Game.changeMoney(euBonus);
        dip.euFundsAccess -= 20;
        dip.euFundsAccess = Math.max(0, dip.euFundsAccess);
        Game.addWorkNotif('Fondi UE Rivendicati', `Hai ricevuto €${euBonus} dai fondi di coesione europei.`, `Giorno ${Game.state.day}`);
        return euBonus;
    },

    // Create offshore account to hide capital
    createOffshoreAccount(amount) {
        const dip = Game.state.diplomacy;
        if (Game.state.money < amount) return false;

        Game.changeMoney(-amount);
        dip.offshoreAccounts.push({
            id: `offshore_${Date.now()}`,
            amount,
            nation: 'switzerland',
            day: Game.state.day,
            risk: 10,
        });

        Game.addWorkNotif(
            'Conto Estero Aperto',
            `Hai nascosto €${amount} in un conto in Svizzera. Rischio di scoperta: 10%. Stress: +5`,
            `Giorno ${Game.state.day}`
        );
        Game.changeStat('stress', 5);
        return true;
    },

    onNewDay() {
        const day = Game.state.day || 0;

        // Clean up expired deals
        if (Game.state.diplomacy) {
            Game.state.diplomacy.bilateralDeals = Game.state.diplomacy.bilateralDeals.filter(d => {
                if (d.accepted && (day >= d.endDay)) {
                    Game.changeMoney(d.reward);
                    Game.addWorkNotif('Accordo Completato', `L'accordo con la ${d.nation.toUpperCase()} è stato completato. Ricompensa: €${d.reward}`, `Giorno ${day}`);
                    return false;
                }
                return true;
            });
        }

        if (!this.isActive()) {
            this.runBaseEvents();
            return;
        }

        this.runDlcEvents();
    },
};

if (typeof window !== 'undefined') window.Diplomacy = Diplomacy;
