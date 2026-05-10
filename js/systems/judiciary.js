/* ============================================
   JUDICIARY SYSTEM — "Le Toghe"
   Expansion Pack: Legal Risk, Judges, Trials, Defense
   ============================================ */

const Judiciary = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.judiciary) {
            Game.state.judiciary = {
                activeInvestigations: [],      // List of active legal investigations
                judges: [
                    { id: 'judge_1', name: 'Giudice Rossi', corruptible: true, loyalty: 0, caseHist: 0 },
                    { id: 'judge_2', name: 'Giudice Bianchi', corruptible: false, loyalty: 0, caseHist: 0 },
                    { id: 'judge_3', name: 'Giudice Verdi', corruptible: true, loyalty: 0, caseHist: 0 },
                ],
                defenseAttorneys: [
                    { id: 'atty_1', name: 'Avv. Colombo', skill: 65, availability: 100, cost: 200, cases: 0 },
                    { id: 'atty_2', name: 'Avv. Ferrari', skill: 80, availability: 60, cost: 400, cases: 0 },
                    { id: 'atty_3', name: 'Avv. Russo', skill: 55, availability: 100, cost: 150, cases: 0 },
                ],
                legalRisk: 0,                  // 0-100
                corruptionRisk: 0,
                trialsDone: 0,
                trialsWon: 0,
                trialsLost: 0,
                bribesGiven: 0,
                lastInvestigationDay: -99,
                lastTrialDay: -99,
            };
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_toghe_judiciary');
    },

    // Base-game DNA: minimal legal events even without DLC
    runBaseEvents() {
        const day = Game.state.day || 0;
        const jud = Game.state.judiciary;

        // Occasional judicial delays (base game)
        if (Math.random() < 0.08) {
            Game.addWorkNotif('Processo Rinviato', 'Il tribunale ha rinviato l\'udienza a data da destinarsi.', `Giorno ${day}`);
        }

        // Investigate rumor (base)
        if (Math.random() < 0.05) {
            Game.addWorkNotif('Voci di Inchiesta', 'In corridoio si sussurra di un\'inchiesta preliminare, ma nulla di confermato.', `Giorno ${day}`);
        }
    },

    // DLC-only: full judicial system
    runDlcEvents() {
        const day = Game.state.day || 0;
        const jud = Game.state.judiciary;

        // Check for new investigations
        if (day - jud.lastInvestigationDay >= 8 && Math.random() < 0.15) {
            this.startInvestigation(day);
        }

        // Advance active investigations
        jud.activeInvestigations.forEach((inv, idx) => {
            inv.daysActive = (inv.daysActive || 0) + 1;

            // Investigation reaches trial threshold
            if (inv.daysActive >= 10 && !inv.sentToTrial) {
                inv.sentToTrial = true;
                const judge = jud.judges[Math.floor(Math.random() * jud.judges.length)];
                Game.addWorkNotif(
                    'Giudizio Rinviato a Dibattimento',
                    `Il giudice ${judge.name} ha rinviato il tuo caso a giudizio. Devi scegliere un difensore.`,
                    `Giorno ${day}`
                );
            }
        });

        // Clean up finished investigations
        jud.activeInvestigations = jud.activeInvestigations.filter(inv => !inv.finished);
    },

    startInvestigation(day) {
        const jud = Game.state.judiciary;
        jud.lastInvestigationDay = day;

        const charges = [
            'riciclaggio di denaro',
            'corruzione di pubblico ufficiale',
            'concussione',
            'peculato',
            'associazione a delinquere',
        ];
        const charge = charges[Math.floor(Math.random() * charges.length)];

        const inv = {
            id: `inv_${day}_${Math.floor(Math.random() * 1000)}`,
            charge,
            severity: Math.floor(Math.random() * 100) + 1,
            daysActive: 0,
            evidence: Math.random() < 0.6,
            sentToTrial: false,
            finished: false,
        };

        jud.activeInvestigations.push(inv);
        jud.legalRisk = Math.min(100, jud.legalRisk + inv.severity * 0.2);
        Game.addWorkNotif(
            'Inchiesta Aperta',
            `Una procura ha aperto un fascicolo per ${charge}. Rischio legale: +${Math.floor(inv.severity * 0.2)}`,
            `Giorno ${day}`
        );
    },

    // Bribe a judge to dismiss investigation
    bribeJudge(judgeId, amount) {
        const jud = Game.state.judiciary;
        const judge = jud.judges.find(j => j.id === judgeId);
        if (!judge || !judge.corruptible) return false;
        if (Game.state.money < amount) return false;

        Game.changeMoney(-amount);
        judge.loyalty += 25;
        jud.bribesGiven++;

        const investToClose = jud.activeInvestigations[0];
        if (investToClose) {
            investToClose.finished = true;
            Game.addWorkNotif(
                'Corruzione Giudiziale',
                `Hai corrotto il giudice. L'inchiesta per ${investToClose.charge} è stata archiviata.`,
                `Giorno ${Game.state.day}`
            );
        }

        jud.corruptionRisk += 15;
        return true;
    },

    // Hire a defense attorney
    hireAttorney(attyId) {
        const jud = Game.state.judiciary;
        const atty = jud.defenseAttorneys.find(a => a.id === attyId);
        if (!atty || Game.state.money < atty.cost) return false;

        Game.changeMoney(-atty.cost);
        atty.cases++;
        atty.availability -= 10;

        return {
            attorney: atty,
            skillBonus: atty.skill,
        };
    },

    // Conduct trial with hired attorney
    conductTrial(attorneyId, investigationId) {
        const jud = Game.state.judiciary;
        const atty = jud.defenseAttorneys.find(a => a.id === attorneyId);
        const inv = jud.activeInvestigations.find(i => i.id === investigationId);

        if (!atty || !inv) return null;

        const judge = jud.judges[Math.floor(Math.random() * jud.judges.length)];
        const judgeInfluence = judge.corruptible ? judge.loyalty * 0.5 : 0;
        const baseWinChance = atty.skill + judgeInfluence;
        const won = Math.random() * 100 < baseWinChance;

        jud.trialsDone++;
        if (won) {
            jud.trialsWon++;
            inv.finished = true;
            Game.addWorkNotif('Processo Vinto', `L'avv. ${atty.name} ti ha assolto. Sei libero da questa accusa.`, `Giorno ${Game.state.day}`);
            return { won: true, penalty: 0 };
        } else {
            jud.trialsLost++;
            const fine = inv.severity * 50;
            Game.changeMoney(-fine);
            Game.changeStat('stress', 20);
            inv.finished = true;
            Game.addWorkNotif('Processo Perso', `Sei stato condannato a una multa di €${fine}. Stress +20.`, `Giorno ${Game.state.day}`);
            return { won: false, penalty: fine };
        }
    },

    onNewDay() {
        const day = Game.state.day || 0;

        if (!this.isActive()) {
            this.runBaseEvents();
            return;
        }

        this.runDlcEvents();
    },
};

if (typeof window !== 'undefined') window.Judiciary = Judiciary;
