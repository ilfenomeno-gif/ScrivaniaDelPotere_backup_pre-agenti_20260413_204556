/* ============================================
   BUDGET — La Manovra di Bilancio
   Macro-gestione risorse ogni 5 giorni
   ============================================ */

const Budget = {
    INTERVAL: 5, // ogni 5 giorni

    init() {
        Game.on('time-advance', (d) => {
            if (d.timeOfDay === 0 && Game.state.day > 1 && Game.state.day % this.INTERVAL === 0) {
                Scheduler.timeout(() => this.triggerManovra(), 600, { group: 'budget', label: 'manovra' });
            }
        });
    },

    triggerManovra() {
        const salary = Game.getCareerLevel().salary;
        const rent = Game.state.housing.rent;
        if (Game.ensureDebtStructures) Game.ensureDebtStructures();
        if (!Game.state.debt) Game.state.debt = 0;
        const overlay = document.getElementById('budget-overlay');
        if (!overlay) return;

        // State
        this._salary = salary;
        this._rent = rent;
        this._alloc = {
            casa: Math.min(rent, salary),
            vitto: Math.min(50, Math.max(0, salary - Math.min(rent, salary))),
            investimenti: 0,
            nero: 0,
            rate: 0,
        };

        this.render();
        overlay.classList.remove('hidden');
    },

    render() {
        const overlay = document.getElementById('budget-overlay');
        const salary = this._salary;
        const a = this._alloc;
        const spent = a.casa + a.vitto + a.investimenti + a.nero + a.rate;
        const remaining = salary - spent;
        const rent = this._rent;
        const casaPremium = a.casa >= Math.round(rent * 1.3);

        overlay.innerHTML = `
            <div class="budget-panel">
                <div class="budget-header">
                    <h2>📊 Manovra di Bilancio</h2>
                    <p class="budget-subtitle">Stipendio: <strong>€${salary}</strong> — Giorno ${Game.state.day}</p>
                </div>
                <div class="budget-remaining ${remaining < 0 ? 'budget-negative' : ''}">
                    Rimanente: <strong>€${remaining}</strong>
                </div>
                ${Game.state.debt > 0 ? `<div class="budget-debt-bar">⚠️ Debito: <strong>€${Game.state.debt}</strong> <small>(+10% interessi/ciclo)</small></div>` : ''}

                <div class="budget-chapters">
                    <div class="budget-chapter">
                        <div class="budget-ch-header">
                            <span class="budget-ch-icon">🏠</span>
                            <span class="budget-ch-title">Casa e Utenze</span>
                            <span class="budget-ch-tag ${casaPremium ? 'tag-premium' : ''}">
                                ${casaPremium ? '✨ PREMIUM' : 'Base'}
                            </span>
                        </div>
                        <div class="budget-ch-desc">Affitto: €${rent}. Puoi pagare a rate (il resto diventa debito). Premium (+30%) = bonus.</div>
                        ${a.casa < rent ? `<div class="budget-rata-info">📋 Rata: paghi €${a.casa}/${rent} — debito +€${rent - a.casa}</div>` : ''}
                        <div class="budget-slider-row">
                            <input type="range" class="budget-slider" id="bslider-casa"
                                min="0" max="${Math.round(rent * 1.5)}" value="${a.casa}" step="10">
                            <span class="budget-slider-val" id="bval-casa">€${a.casa}</span>
                        </div>
                    </div>

                    <div class="budget-chapter">
                        <div class="budget-ch-header">
                            <span class="budget-ch-icon">🍕</span>
                            <span class="budget-ch-title">Vitto e Socialità</span>
                        </div>
                        <div class="budget-ch-desc">€0: digiuno (Salute -15). &lt;€30: fame. €80+: mangi bene (Salute +5, Stress -3).</div>
                        <div class="budget-slider-row">
                            <input type="range" class="budget-slider" id="bslider-vitto"
                                min="0" max="150" value="${a.vitto}" step="10">
                            <span class="budget-slider-val" id="bval-vitto">€${a.vitto}</span>
                        </div>
                    </div>

                    <div class="budget-chapter">
                        <div class="budget-ch-header">
                            <span class="budget-ch-icon">📈</span>
                            <span class="budget-ch-title">Investimento Personale</span>
                        </div>
                        <div class="budget-ch-desc">Risparmio per migliorie e corsi. Ogni €50 = +1 Intelligenza.</div>
                        <div class="budget-slider-row">
                            <input type="range" class="budget-slider" id="bslider-invest"
                                min="0" max="${salary}" value="${a.investimenti}" step="10">
                            <span class="budget-slider-val" id="bval-invest">€${a.investimenti}</span>
                        </div>
                    </div>

                    <div class="budget-chapter">
                        <div class="budget-ch-header">
                            <span class="budget-ch-icon">📆</span>
                            <span class="budget-ch-title">Rate e Debiti</span>
                        </div>
                        <div class="budget-ch-desc">Fondo dedicato a rate bollette e mutuo. Se insufficiente, scattano penalità.</div>
                        <div class="budget-slider-row">
                            <input type="range" class="budget-slider" id="bslider-rate"
                                min="0" max="${salary}" value="${a.rate}" step="10">
                            <span class="budget-slider-val" id="bval-rate">€${a.rate}</span>
                        </div>
                    </div>

                    <div class="budget-chapter ${Game.state.mafia.active ? '' : 'budget-ch-locked'}">
                        <div class="budget-ch-header">
                            <span class="budget-ch-icon">🎁</span>
                            <span class="budget-ch-title">Fondo Nero</span>
                            ${!Game.state.mafia.active ? '<span class="budget-ch-tag tag-locked">🔒</span>' : ''}
                        </div>
                        <div class="budget-ch-desc">${Game.state.mafia.active
                            ? 'Soldi per pizzo, mance e corruzione. +Rispetto, +Rischio Indagini.'
                            : 'Sbloccato quando entri in contatto con certi ambienti...'}</div>
                        ${Game.state.mafia.active ? `
                        <div class="budget-slider-row">
                            <input type="range" class="budget-slider" id="bslider-nero"
                                min="0" max="${salary}" value="${a.nero}" step="10">
                            <span class="budget-slider-val" id="bval-nero">€${a.nero}</span>
                        </div>` : ''}
                    </div>
                </div>

                <div class="budget-preview">
                    <h4>Effetti Previsti:</h4>
                    <div class="budget-effects" id="budget-effects"></div>
                </div>

                <button class="budget-confirm" id="budget-confirm">
                    ✅ Approva Manovra
                </button>
            </div>
        `;

        // Bind sliders
        ['casa', 'vitto', 'invest', 'nero', 'rate'].forEach(key => {
            const slider = document.getElementById(`bslider-${key}`);
            if (!slider) return;
            const allocKey = key === 'invest' ? 'investimenti' : key;
            slider.addEventListener('input', () => {
                this._alloc[allocKey] = parseInt(slider.value);
                this.render();
            });
        });

        // Preview effects
        this.renderEffects();

        // Confirm button
        const btn = document.getElementById('budget-confirm');
        if (btn) {
            btn.addEventListener('click', () => this.confirmManovra());
        }
    },

    renderEffects() {
        const el = document.getElementById('budget-effects');
        if (!el) return;
        const a = this._alloc;
        const rent = this._rent;
        const effects = [];

        // Casa
        if (a.casa >= Math.round(rent * 1.3)) {
            effects.push('🏠 Premium: Morale +8, Reputazione +3');
        } else if (a.casa >= rent) {
            effects.push('🏠 Base: Bollette pagate, nessun bonus');
        } else if (a.casa > 0) {
            effects.push(`🏠 Rate: paghi €${a.casa}/${rent}, debito +€${rent - a.casa}, Stress +${Math.min(10, Math.ceil((rent - a.casa) / 40))}`);
        } else {
            effects.push(`🏠 Insolvente: non paghi l'affitto! Debito +€${rent}, Stress +10`);
        }

        // Debito esistente
        if (Game.state.debt > 0) {
            effects.push(`⚠️ Debito accumulato: €${Game.state.debt} (+10% interessi/ciclo)`);
        }

        // Vitto
        if (a.vitto >= 80) {
            effects.push('🍕 Buona alimentazione: Salute +5, Stress -3');
        } else if (a.vitto >= 50) {
            effects.push('🍕 Pasti normali: nessun effetto');
        } else if (a.vitto >= 30) {
            effects.push('🍕 Pane e cipolle: Salute -8, Stress +5');
        } else if (a.vitto > 0) {
            effects.push('🍕 Quasi digiuno: Salute -12, Stress +8');
        } else {
            effects.push('🍕 Digiuno totale: Salute -15, Stress +12');
        }

        // Investimenti
        if (a.investimenti >= 50) {
            const intBonus = Math.floor(a.investimenti / 50);
            effects.push(`📈 Studio: +${intBonus} Intelligenza`);
        }

        // Nero
        if (a.nero > 0 && Game.state.mafia.active) {
            effects.push(`🎁 Fondo nero: +${Math.floor(a.nero / 20)} Rispetto, +${Math.floor(a.nero / 30)} Rischio Indagini`);
        }

        // Rate/mutuo in scadenza
        const installments = (Game.state.loans && Game.state.loans.activeInstallments) ? Game.state.loans.activeInstallments : [];
        const dueInst = installments
            .filter(i => Game.state.day >= i.nextDue)
            .reduce((sum, i) => sum + i.monthly, 0);
        const mortgage = Game.state.loans ? Game.state.loans.mortgage : null;
        const dueMortgage = (mortgage && Game.state.day >= mortgage.nextDue) ? mortgage.monthly : 0;
        const totalDue = dueInst + dueMortgage;
        if (totalDue > 0) {
            effects.push(`📆 Rate in scadenza: €${totalDue} (fondo rate allocato: €${a.rate})`);
        }

        const salary = this._salary;
        const spent = a.casa + a.vitto + a.investimenti + a.nero + a.rate;
        const savings = salary - spent;
        if (savings > 0) {
            effects.push(`💰 Risparmi: +€${savings} in tasca`);
        }

        el.innerHTML = effects.map(e => `<div class="budget-effect-line">${e}</div>`).join('');
    },

    confirmManovra() {
        if (Game.ensureDebtStructures) Game.ensureDebtStructures();
        const a = this._alloc;
        const rent = this._rent;
        const salary = this._salary;
        const spent = a.casa + a.vitto + a.investimenti + a.nero + a.rate;

        // Pay non-rateized utility bills (rent is managed by 'casa' allocation)
        Game.state.bills.forEach(b => {
            if (b.paid) return;
            if (b.name === 'Affitto') return;
            if (b.installmentPlan) return;
            b.paid = true;
        });

        // Casa effects
        if (a.casa >= Math.round(rent * 1.3)) {
            Game.changeStat('morale', 8);
            Game.changeReputazione(3);
            Game.addWorkNotif('🏠 Premium', 'Casa Premium! Morale +8, Reputazione +3.', `Giorno ${Game.state.day}`);
        }

        // Vitto effects
        if (a.vitto >= 80) {
            Game.changeStat('salute', 5);
            Game.changeStat('stress', -3);
        } else if (a.vitto >= 50) {
            // Pasti normali, nessun effetto
        } else if (a.vitto >= 30) {
            Game.changeStat('salute', -8);
            Game.changeStat('stress', 5);
            Game.addWorkNotif('🍕 Dieta', 'Pane e cipolle... Salute -8.', `Giorno ${Game.state.day}`);
        } else if (a.vitto > 0) {
            Game.changeStat('salute', -12);
            Game.changeStat('stress', 8);
            Game.addWorkNotif('🍕 Fame', 'Quasi digiuno... Salute -12.', `Giorno ${Game.state.day}`);
        } else {
            Game.changeStat('salute', -15);
            Game.changeStat('stress', 12);
            Game.addWorkNotif('🍕 Digiuno', 'Non mangi niente! Salute -15.', `Giorno ${Game.state.day}`);
        }

        // Investimenti
        if (a.investimenti >= 50) {
            const intBonus = Math.floor(a.investimenti / 50);
            Game.changeAttribute('intelligenza', intBonus);
            Game.addWorkNotif('📈 Studio', `Investimento personale: +${intBonus} Intelligenza.`, `Giorno ${Game.state.day}`);
        }

        // Fondo nero
        if (a.nero > 0 && Game.state.mafia.active) {
            const rispetto = Math.floor(a.nero / 20);
            const rischio = Math.floor(a.nero / 30);
            Game.state.mafia.rispettoCriminale += rispetto;
            Game.state.mafia.rischioIndagini += rischio;
            Game.addWorkNotif('🎁 Fondo Nero', `+${rispetto} Rispetto Criminale, +${rischio} Rischio Indagini.`, `Giorno ${Game.state.day}`);
        }

        // Net income: salary minus allocations (single operation — fixes triple money bug)
        Game.changeMoney(salary - spent);

        // Housing debt tracking (rate/installments)
        if (a.casa < rent) {
            const shortfall = rent - a.casa;
            Game.state.debt = (Game.state.debt || 0) + shortfall;
            Game.changeStat('stress', Math.min(10, Math.ceil(shortfall / 40)));
            Game.changeReputazione(-Math.ceil(shortfall / 100));
            if (Array.isArray(Game.state.debtHistory)) {
                Game.state.debtHistory.push({ day: Game.state.day, type: 'rent-shortfall', amount: shortfall, reason: 'Affitto pagato parzialmente in manovra' });
            }
            Game.addWorkNotif('🏠 Rate', `Paghi a rate. Debito: +€${shortfall} (totale: €${Game.state.debt}).`, `Giorno ${Game.state.day}`);
        }

        // Rate attive bollette + mutuo
        let rateBudget = a.rate;
        const installments = (Game.state.loans && Array.isArray(Game.state.loans.activeInstallments)) ? Game.state.loans.activeInstallments : [];
        for (let i = 0; i < installments.length; i++) {
            const inst = installments[i];
            if (Game.state.day < inst.nextDue) continue;

            if (rateBudget >= inst.monthly) {
                rateBudget -= inst.monthly;
                inst.remaining = Math.max(0, inst.remaining - inst.monthly);
                inst.monthsPaid += 1;
                inst.nextDue = Game.state.day + 3;
                inst.missedConsecutive = 0;
                Game.state.debt = Math.max(0, (Game.state.debt || 0) - inst.monthly);
                if (Array.isArray(Game.state.debtHistory)) {
                    Game.state.debtHistory.push({ day: Game.state.day, type: 'installment-pay-budget', amount: inst.monthly, reason: `Pagamento rata ${inst.billName} da manovra` });
                }

                if (inst.remaining <= 0 || inst.monthsPaid >= inst.monthsTotal) {
                    const bill = Game.state.bills.find(b => b.id === inst.billId);
                    if (bill) {
                        bill.paid = true;
                        bill.installmentPlan = null;
                    }
                    installments.splice(i, 1);
                    i--;
                    Game.addWorkNotif('✅ Saldato', `${inst.billName} completamente pagato!`, `Giorno ${Game.state.day}`);
                }
            } else {
                Game.changeStat('stress', 8);
                Game.changeReputazione(-2);
                Game.addWorkNotif('⚠️ Rata saltata', `Non hai pagato la rata di ${inst.billName}.`, `Giorno ${Game.state.day}`);
            }
        }

        const mortgage = Game.state.loans ? Game.state.loans.mortgage : null;
        if (mortgage && Game.state.day >= mortgage.nextDue) {
            if (rateBudget >= mortgage.monthly) {
                rateBudget -= mortgage.monthly;
                mortgage.remaining = Math.max(0, mortgage.remaining - mortgage.monthly);
                mortgage.paidMonths += 1;
                mortgage.nextDue = Game.state.day + 5;
                mortgage.missedConsecutive = 0;
                Game.state.debt = Math.max(0, (Game.state.debt || 0) - mortgage.monthly);
                if (Array.isArray(Game.state.debtHistory)) {
                    Game.state.debtHistory.push({ day: Game.state.day, type: 'mortgage-pay-budget', amount: mortgage.monthly, reason: 'Rata mutuo pagata da manovra' });
                }

                if (mortgage.remaining <= 0 || mortgage.paidMonths >= mortgage.monthsTotal) {
                    Game.state.loans.mortgage = null;
                    Game.addWorkNotif('🏠 Mutuo estinto', 'Mutuo completamente estinto dalla manovra.', `Giorno ${Game.state.day}`);
                }
            } else {
                Game.changeStat('stress', 10);
                Game.changeReputazione(-3);
                Game.addWorkNotif('⚠️ Mutuo', 'Rata mutuo non pagata in manovra.', `Giorno ${Game.state.day}`);
            }
        }

        // Recompute utility lock flags after possible bill changes
        const overdueBills = Game.state.bills.filter(b => !b.paid && !b.installmentPlan && Game.state.day > b.dueDay);
        Game.state.flags.billsUnpaid = overdueBills.length;
        Game.state.flags.lightDimmed = overdueBills.length >= 2;
        Game.state.flags.phoneLocked = overdueBills.length >= 2;
        if (overdueBills.length === 0) Game.state.flags.consecutiveUnpaidRent = 0;

        // Debt interest (10% per budget cycle)
        if (Game.state.debt > 0) {
            const interest = Math.ceil(Game.state.debt * 0.1);
            Game.state.debt += interest;
            if (Array.isArray(Game.state.debtHistory)) {
                Game.state.debtHistory.push({ day: Game.state.day, type: 'interest', amount: interest, reason: 'Interessi debito manovra (10%)' });
            }
            if (Game.state.debt > 1000) {
                Game.changeStat('stress', 10);
                Game.changeReputazione(-5);
                Game.addWorkNotif('⚠️ Debito', `Debito critico: €${Game.state.debt}! Stress e reputazione in calo.`, `Giorno ${Game.state.day}`);
            }
        }

        const savings = salary - spent;
        // Close
        document.getElementById('budget-overlay').classList.add('hidden');
        Game.addWorkNotif('📊 Manovra', `Manovra approvata. Stipendio €${salary}, speso €${spent} (rate €${a.rate})${savings > 0 ? ', risparmiato €' + savings : ''}.`, `Giorno ${Game.state.day}`);
    },
};
