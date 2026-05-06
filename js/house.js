/* ============================================
   HOUSE — Fascicolo Casa (v2.1)
   ============================================ */

const House = {
    init() {
        // Tab switching
        document.querySelectorAll('.house-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.house-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.house-tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
            });
        });

        Game.on('panel-open', (data) => {
            if (data.panel === 'house') this.refresh();
        });
        Game.on('bill-paid', () => this.refresh());
        Game.on('housing-change', () => this.refresh());
        Game.on('generate-bills', () => this.generateNewBills());
        Game.on('time-advance', (d) => {
            // Process missed installments once per day in the morning
            if (d && d.timeOfDay === 0) this.processDebtDeadlines();
            this.refresh();
        });
        Game.on('improvement-bought', () => this.refresh());
        Game.on('diary-entry', () => this.refresh());
    },

    refresh() {
        this.ensureLoanState();
        this.renderProperty();
        this.renderPayments();
        this.renderMortgageOptions();
        this.renderDebtSummary();
        this.renderUpgrades();
        this.renderImprovements();
        if (typeof Bank !== 'undefined') Bank.renderBankPanel();
    },

    renderProperty() {
        const container = document.getElementById('property-info');
        const h = Game.state.housing;
        const evicted = Game.state.flags.evicted;
        const settlement = (Game.state.cityFlags && Game.state.cityFlags.settlementType) || 'city';
        const familyDinnerCost = (typeof GameConstants !== 'undefined' && GameConstants.ECONOMY)
            ? GameConstants.ECONOMY.FAMILY_DINNER_COST
            : 10;
        const canFamilyDinner = settlement === 'comune' && !!Game.state.partner;

        let html = '';
        if (evicted) {
            html += `
                <div class="eviction-banner">
                    <div class="eviction-icon">🚪</div>
                    <div class="eviction-text">
                        <strong>SFRATTATO!</strong><br>
                        Dormi in ufficio al partito. Stanchezza e Stress alle stelle ogni giorno.<br>
                        Paga l'affitto arretrato per tornare a casa!
                    </div>
                </div>
            `;
        }
        html += `
            <div class="property-card ${evicted ? 'property-evicted' : ''}">
                <div class="property-type">${evicted ? '🏢 Ufficio del Partito (temporaneo)' : `🏠 ${this.escapeHtml(h.label)}`}</div>
                <p style="font-size:12px; color:#888; margin: 6px 0;">${evicted ? 'Non hai una casa. Paga l\'affitto per tornare!' : `Affitto: €${h.rent}/periodo`}</p>
                <div>
                    ${h.bonuses.map(b => `<span class="property-bonus positive">✓ ${this.escapeHtml(b)}</span>`).join('')}
                    ${h.maluses.map(m => `<span class="property-bonus negative">✗ ${this.escapeHtml(m)}</span>`).join('')}
                    ${evicted ? '<span class="property-bonus negative">✗ Stanchezza ++</span><span class="property-bonus negative">✗ Stress ++</span><span class="property-bonus negative">✗ Reputazione -3/giorno</span>' : ''}
                </div>
            </div>
        `;
        if (!evicted && settlement === 'comune') {
            html += `
                <div class="property-card">
                    <div class="property-type">🍲 Vita di Comunità</div>
                    <p style="font-size:12px; color:#888; margin: 6px 0;">Nel comune puoi organizzare una cena in famiglia per ridurre lo stress.</p>
                    <button id="btn-cena-famiglia" class="upgrade-btn" ${canFamilyDinner && Game.state.money >= familyDinnerCost ? '' : 'disabled'}>
                        Cena in famiglia (€${familyDinnerCost})
                    </button>
                </div>
            `;
        }
        container.innerHTML = html;
        const btnFamily = document.getElementById('btn-cena-famiglia');
        if (btnFamily && !btnFamily._bound) {
            btnFamily._bound = true;
            btnFamily.addEventListener('click', () => {
                const ok = Game.runCityPhoneAction ? Game.runCityPhoneAction('cena-famiglia') : false;
                if (!ok) Game.addWorkNotif('🍲 Cena in Famiglia', 'Azione non disponibile ora.', `Giorno ${Game.state.day}`);
                this.refresh();
            });
        }
    },

    renderPayments() {
        const container = document.getElementById('payments-list');
        if (!container) return;
        const bills = Game.state.bills || [];
        const day = Game.state.day;

        const unpaidNoPlan = bills.filter(b => !b.paid && !b.installmentPlan);
        let html = '<div class="payments-header">📋 PAGAMENTI IN SOSPESO</div>';

        if (unpaidNoPlan.length === 0) {
            html += '<p style="color:#AAA; padding:10px;">Nessuna bolletta libera in sospeso.</p>';
        } else {
            unpaidNoPlan.forEach(bill => {
                const overdue = day > bill.dueDay;
                const canPay = Game.state.money >= bill.amount;
                const rate2 = Math.ceil(bill.amount * 1.08 / 2);
                const rate3 = Math.ceil(bill.amount * 1.12 / 3);
                const rentRate3 = Math.ceil(bill.amount * 1.05 / 3);

                html += `
                    <div class="payment-item ${overdue ? 'overdue' : ''}">
                        <div class="payment-info">
                            <div class="payment-name">${this.escapeHtml(bill.name)}</div>
                            <div class="payment-due">${overdue ? '⚠️ SCADUTA!' : `Scadenza: Giorno ${bill.dueDay}`}</div>
                        </div>
                        <span class="payment-amount">€${bill.amount}</span>
                        <div class="payment-actions">
                            <button class="payment-btn pay-now" data-id="${bill.id}" ${!canPay ? 'disabled title="Fondi insufficienti"' : ''}>💰 Paga subito</button>
                            ${bill.name === 'Affitto' ? `
                            <div class="payment-installments">
                                <button class="inst-btn" data-id="${bill.id}" data-months="3" data-kind="rent">📆 3 rate affitto (€${rentRate3})</button>
                            </div>` : `
                            <div class="payment-installments">
                                <button class="inst-btn" data-id="${bill.id}" data-months="2">📆 2 rate (€${rate2})</button>
                                <button class="inst-btn" data-id="${bill.id}" data-months="3">📆 3 rate (€${rate3})</button>
                            </div>`}
                        </div>
                    </div>
                `;
            });
        }

        const activeInst = Game.state.loans.activeInstallments;
        if (activeInst.length > 0) {
            html += '<div class="installments-section"><div class="payments-header">📆 RATE ATTIVE</div>';
            activeInst.forEach(inst => {
                const overdue = day > inst.nextDue;
                const canPayInst = Game.state.money >= inst.monthly;
                html += `
                    <div class="installment-item ${overdue ? 'overdue' : ''}">
                        <div class="inst-info">
                            <div class="inst-name">${this.escapeHtml(inst.billName)}</div>
                            <div class="inst-progress">${inst.monthsPaid}/${inst.monthsTotal} rate pagate</div>
                            <div class="inst-remaining">Residuo: €${inst.remaining}</div>
                            <div class="payment-due">Prossima scadenza: Giorno ${inst.nextDue}</div>
                        </div>
                        <div class="inst-payment">
                            <span class="inst-monthly">€${inst.monthly}</span>
                            <button class="pay-installment" data-id="${inst.id}" ${!canPayInst ? 'disabled' : ''}>Paga rata</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        container.innerHTML = html;
        this.bindPaymentButtons();
    },

    ensureLoanState() {
        if (!Game.state.loans) Game.state.loans = { mortgage: null, activeInstallments: [] };
        if (!Array.isArray(Game.state.loans.activeInstallments)) Game.state.loans.activeInstallments = [];
        if (!Array.isArray(Game.state.debtHistory)) Game.state.debtHistory = [];
        if (!Object.prototype.hasOwnProperty.call(Game.state, 'debt')) Game.state.debt = 0;
    },

    createInstallmentPlan(billId, months) {
        const bill = Game.state.bills.find(b => b.id === billId);
        if (!bill || bill.paid || bill.installmentPlan) return false;

        const isRent = bill.name === 'Affitto';
        const interest = isRent ? 0.05 : (months === 2 ? 0.08 : 0.12);
        const totalWithInterest = Math.ceil(bill.amount * (1 + interest));
        const monthly = Math.ceil(totalWithInterest / months);

        const plan = {
            id: `inst_${Date.now()}_${Math.floor(Math.random() * 999)}`,
            billId: bill.id,
            billName: bill.name,
            originalAmount: bill.amount,
            totalWithInterest,
            remaining: totalWithInterest,
            monthly,
            monthsTotal: months,
            monthsPaid: 0,
            nextDue: Game.state.day + 3,
            startDay: Game.state.day,
            missedConsecutive: 0,
        };

        bill.installmentPlan = plan.id;
        Game.state.loans.activeInstallments.push(plan);
        Game.state.debt += totalWithInterest;
        Game.state.debtHistory.push({ day: Game.state.day, type: 'installment-create', amount: totalWithInterest, reason: `${bill.name} in ${months} rate` });

        Game.addWorkNotif('📋 Rate', `${bill.name} rateizzato in ${months} rate da €${monthly}.`, `Giorno ${Game.state.day}`);
        this.refresh();
        return true;
    },

    payInstallment(planId) {
        const plan = Game.state.loans.activeInstallments.find(p => p.id === planId);
        if (!plan) return false;
        if (Game.state.money < plan.monthly) return false;

        Game.changeMoney(-plan.monthly);
        plan.remaining = Math.max(0, plan.remaining - plan.monthly);
        plan.monthsPaid += 1;
        plan.nextDue = Game.state.day + 3;
        Game.state.debt = Math.max(0, Game.state.debt - plan.monthly);
        Game.state.debtHistory.push({ day: Game.state.day, type: 'installment-pay', amount: plan.monthly, reason: `Rata ${plan.billName}` });

        if (plan.remaining <= 0 || plan.monthsPaid >= plan.monthsTotal) {
            const bill = Game.state.bills.find(b => b.id === plan.billId);
            if (bill) {
                bill.paid = true;
                bill.installmentPlan = null;
            }
            Game.state.loans.activeInstallments = Game.state.loans.activeInstallments.filter(p => p.id !== plan.id);
            Game.addWorkNotif('✅ Saldato', `${plan.billName} completamente pagato!`, `Giorno ${Game.state.day}`);
        } else {
            Game.addWorkNotif('📆 Rata pagata', `${plan.billName}: pagata rata da €${plan.monthly}.`, `Giorno ${Game.state.day}`);
        }

        this.refresh();
        return true;
    },

    requestMortgage(type) {
        if (Game.state.loans.mortgage) return false;

        const offers = {
            periferia: { total: 800, down: 200, months: 12, interestRate: 0.10, targetType: 'periferia' },
            centro: { total: 2000, down: 500, months: 12, interestRate: 0.10, targetType: 'centro' },
        };
        const offer = offers[type];
        if (!offer) return false;
        if (Game.state.money < offer.down) return false;

        const financed = offer.total - offer.down;
        const financedWithInterest = Math.ceil(financed * (1 + offer.interestRate));
        const monthly = Math.ceil(financedWithInterest / offer.months);
        const housingByType = {
            periferia: { label: 'Appartamento in Periferia', rent: 550, bonuses: ['Indipendenza'], maluses: ['Lontano dal centro'] },
            centro: { label: 'Appartamento in Centro', rent: 900, bonuses: ['Networking +2', 'Credibilità +3'], maluses: ['Costi alti'] },
        };
        const newHousing = housingByType[offer.targetType];
        if (!newHousing) return false;

        Game.changeMoney(-offer.down);
        Game.state.housing = {
            type: offer.targetType,
            label: newHousing.label,
            rent: newHousing.rent,
            bonuses: newHousing.bonuses,
            maluses: newHousing.maluses,
        };
        Game.emit('housing-change', {});

        Game.state.loans.mortgage = {
            type: offer.targetType,
            total: financedWithInterest,
            remaining: financedWithInterest,
            monthly,
            startDay: Game.state.day,
            interestRate: offer.interestRate,
            paidMonths: 0,
            monthsTotal: offer.months,
            nextDue: Game.state.day + 5,
            downPayment: offer.down,
            missedConsecutive: 0,
        };

        Game.state.debt += financedWithInterest;
        Game.state.debtHistory.push({ day: Game.state.day, type: 'mortgage-create', amount: financedWithInterest, reason: `Mutuo ${offer.targetType}` });
        Game.addWorkNotif('🏦 Mutuo approvato', `Mutuo ${offer.targetType}: €${monthly}/mese per ${offer.months} mesi.`, `Giorno ${Game.state.day}`);
        this.refresh();
        return true;
    },

    payMortgageInstallment() {
        const m = Game.state.loans.mortgage;
        if (!m) return false;
        if (Game.state.money < m.monthly) return false;

        Game.changeMoney(-m.monthly);
        m.remaining = Math.max(0, m.remaining - m.monthly);
        m.paidMonths += 1;
        m.nextDue = Game.state.day + 5;
        m.missedConsecutive = 0;

        Game.state.debt = Math.max(0, Game.state.debt - m.monthly);
        Game.state.debtHistory.push({ day: Game.state.day, type: 'mortgage-pay', amount: m.monthly, reason: `Rata mutuo ${m.type}` });

        if (m.remaining <= 0 || m.paidMonths >= m.monthsTotal) {
            Game.state.loans.mortgage = null;
            Game.addWorkNotif('🏠 Mutuo estinto', 'Hai completato tutte le rate del mutuo.', `Giorno ${Game.state.day}`);
        } else {
            Game.addWorkNotif('🏦 Mutuo', `Pagata rata mutuo da €${m.monthly}.`, `Giorno ${Game.state.day}`);
        }
        this.refresh();
        return true;
    },

    extinguishMortgage() {
        const m = Game.state.loans.mortgage;
        if (!m) return false;
        if (Game.state.money < m.remaining) return false;

        Game.changeMoney(-m.remaining);
        Game.state.debt = Math.max(0, Game.state.debt - m.remaining);
        Game.state.debtHistory.push({ day: Game.state.day, type: 'mortgage-close', amount: m.remaining, reason: `Estinzione mutuo ${m.type}` });
        Game.state.loans.mortgage = null;

        Game.addWorkNotif('💸 Estinzione', 'Mutuo estinto anticipatamente.', `Giorno ${Game.state.day}`);
        this.refresh();
        return true;
    },

    renderMortgageOptions() {
        const container = document.getElementById('mortgage-options');
        if (!container) return;

        const hasMortgage = !!Game.state.loans.mortgage;
        const currentHome = Game.state.housing.type;
        const settlement = (Game.state.cityFlags && Game.state.cityFlags.settlementType) || 'city';

        let html = '<div class="mortgage-section"><div class="payments-header">🏦 MUTUI</div>';

        if (settlement === 'comune') {
            html += '<div class="mortgage-card"><div class="mortgage-name">🏘️ Regolamento Comune</div><div class="mortgage-details">Nei comuni piccoli non sono disponibili mutui per alloggi di lusso.</div></div>';
            if (hasMortgage) {
                html += '<div class="mortgage-card"><div class="mortgage-details">Puoi comunque gestire le rate del mutuo gia attivo.</div></div>';
            } else {
                html += '</div>';
                container.innerHTML = html;
                return;
            }
        }

        if (!hasMortgage && currentHome === 'stanza') {
            const canDown = Game.state.money >= 200;
            html += `
                <div class="mortgage-card">
                    <div class="mortgage-name">🏢 Appartamento Periferia</div>
                    <div class="mortgage-details">Prezzo: €800 | Anticipo: €200 | Rata: ~€55 x 12</div>
                    <button class="mortgage-btn" data-type="periferia" ${!canDown ? 'disabled' : ''}>💰 Richiedi Mutuo</button>
                </div>
            `;
        }

        if (!hasMortgage && currentHome === 'periferia') {
            const canDown = Game.state.money >= 500;
            html += `
                <div class="mortgage-card">
                    <div class="mortgage-name">🏛️ Appartamento Centro</div>
                    <div class="mortgage-details">Prezzo: €2000 | Anticipo: €500 | Rata: ~€138 x 12</div>
                    <button class="mortgage-btn" data-type="centro" ${!canDown ? 'disabled' : ''}>💰 Richiedi Mutuo</button>
                </div>
            `;
        }

        if (hasMortgage) {
            const m = Game.state.loans.mortgage;
            html += `
                <div class="mortgage-active ${Game.state.day > m.nextDue ? 'overdue' : ''}">
                    <div class="mortgage-name">${m.type === 'centro' ? '🏛️' : '🏢'} Mutuo ${m.type === 'centro' ? 'Centro' : 'Periferia'}</div>
                    <div class="mortgage-progress">Residuo: €${m.remaining} (${m.paidMonths}/${m.monthsTotal} mesi)</div>
                    <div class="mortgage-details">Rata: €${m.monthly} | Prossima scadenza: Giorno ${m.nextDue}</div>
                    <button class="mortgage-pay-btn" ${Game.state.money < m.monthly ? 'disabled' : ''}>📅 Paga rata</button>
                    <button class="mortgage-extinguish-btn" ${Game.state.money < m.remaining ? 'disabled' : ''}>💸 Estingui</button>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
        this.bindMortgageButtons();
    },

    renderDebtSummary() {
        const container = document.getElementById('debt-summary');
        if (!container) return;

        const m = Game.state.loans.mortgage;
        const installments = Game.state.loans.activeInstallments;
        const instDue = installments.reduce((s, i) => s + (Game.state.day >= i.nextDue ? i.monthly : 0), 0);
        const mortgageDue = m && Game.state.day >= m.nextDue ? m.monthly : 0;
        const nextInstallmentDay = installments.length > 0 ? Math.min(...installments.map(i => i.nextDue)) : null;
        const nextDay = m ? (nextInstallmentDay ? Math.min(nextInstallmentDay, m.nextDue) : m.nextDue) : nextInstallmentDay;

        container.innerHTML = `
            <div class="debt-summary-card">
                <div class="payments-header">📊 RIEPILOGO DEBITI</div>
                <div>💳 Debito totale: <strong>€${Game.state.debt || 0}</strong></div>
                <div>📅 Rate dovute oggi: <strong>€${instDue + mortgageDue}</strong></div>
                <div>⏭️ Prossima scadenza: <strong>${nextDay ? `Giorno ${nextDay}` : 'Nessuna'}</strong></div>
            </div>
        `;
    },

    processDebtDeadlines() {
        this.ensureLoanState();

        // Installment plans: missed due => stress/reputation penalty and reschedule
        Game.state.loans.activeInstallments.forEach(plan => {
            if (Game.state.day < plan.nextDue) return;

            plan.missedConsecutive = (plan.missedConsecutive || 0) + 1;
            plan.nextDue = Game.state.day + 3;
            Game.changeStat('stress', 8);
            Game.changeReputazione(-2);
            if (Array.isArray(Game.state.debtHistory)) {
                Game.state.debtHistory.push({ day: Game.state.day, type: 'installment-missed', amount: plan.monthly, reason: `Rata saltata ${plan.billName}` });
            }
            Game.addWorkNotif('⚠️ Rata saltata', `${plan.billName}: stress +8, reputazione -2.`, `Giorno ${Game.state.day}`);
        });

        // Mortgage: 2 missed consecutive dues => foreclosure
        const m = Game.state.loans.mortgage;
        if (m && Game.state.day >= m.nextDue) {
            m.missedConsecutive = (m.missedConsecutive || 0) + 1;
            m.nextDue = Game.state.day + 5;
            Game.changeStat('stress', 10);
            Game.changeReputazione(-3);
            if (Array.isArray(Game.state.debtHistory)) {
                Game.state.debtHistory.push({ day: Game.state.day, type: 'mortgage-missed', amount: m.monthly, reason: `Rata mutuo saltata (${m.type})` });
            }

            if (m.missedConsecutive >= 2) {
                const anticipoPerso = Math.ceil((m.downPayment || 0) * 0.5);
                if (anticipoPerso > 0) Game.changeMoney(-anticipoPerso);

                Game.state.housing = {
                    type: 'stanza',
                    label: 'Stanza in Affitto',
                    rent: 300,
                    bonuses: ['Economica'],
                    maluses: ['Paranoia da coinquilini'],
                };
                Game.state.loans.mortgage = null;
                Game.addUrgentMessage('🏦 Banca', `Pignoramento eseguito: hai perso la casa e parte dell'anticipo (€${anticipoPerso}).`, 'enemy');
                Game.emit('housing-change', {});
            } else {
                Game.addWorkNotif('⚠️ Mutuo', `Rata mutuo saltata (${m.missedConsecutive}/2).`, `Giorno ${Game.state.day}`);
            }
        }
    },

    bindPaymentButtons() {
        document.querySelectorAll('.pay-now').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const success = Game.payBill(btn.dataset.id);
                if (!success) {
                    btn.style.background = '#E53935';
                    btn.textContent = 'No fondi!';
                    Scheduler.timeout(() => {
                        btn.style.background = '';
                        btn.textContent = '💰 Paga subito';
                    }, 1200, { group: 'house', label: 'btn-reset' });
                }
                this.refresh();
            });
        });

        document.querySelectorAll('.inst-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const months = parseInt(btn.dataset.months, 10);
                this.createInstallmentPlan(btn.dataset.id, months);
            });
        });

        document.querySelectorAll('.pay-installment').forEach(btn => {
            btn.addEventListener('click', () => {
                this.payInstallment(btn.dataset.id);
            });
        });
    },

    bindMortgageButtons() {
        const reqBtn = document.querySelector('.mortgage-btn');
        if (reqBtn) {
            reqBtn.addEventListener('click', () => this.requestMortgage(reqBtn.dataset.type));
        }
        const payBtn = document.querySelector('.mortgage-pay-btn');
        if (payBtn) {
            payBtn.addEventListener('click', () => this.payMortgageInstallment());
        }
        const closeBtn = document.querySelector('.mortgage-extinguish-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.extinguishMortgage());
        }
    },

    renderUpgrades() {
        const container = document.getElementById('upgrade-options');
        const current = Game.state.housing.type;
        const money = Game.state.money;

        const upgrades = [];

        if (current === 'stanza') {
            upgrades.push({
                type: 'periferia',
                name: '🏢 Appartamento in Periferia',
                desc: 'Indipendenza totale! Ma sei lontano dal centro.',
                cost: 800,
            });
        }
        if (current !== 'centro') {
            upgrades.push({
                type: 'centro',
                name: '🏛️ Appartamento in Centro',
                desc: 'Networking e credibilità al massimo. Costi elevati.',
                cost: 2000,
            });
        }

        upgrades.push({
            type: 'office',
            name: '🪑 Arreda Ufficio di Partito',
            desc: '+5 Credibilità, +3 Networking',
            cost: 500,
        });

        if (upgrades.length === 0) {
            container.innerHTML = '<p style="color:#AAA; padding:10px;">Hai già il massimo livello abitativo!</p>';
            return;
        }

        container.innerHTML = upgrades.map(u => {
            const canAfford = money >= u.cost;
            return `
            <div class="upgrade-card ${!canAfford ? 'upgrade-locked' : ''}">
                <div class="upgrade-info">
                    <div class="upgrade-name">${u.name}</div>
                    <div class="upgrade-desc">${u.desc}</div>
                    <div class="upgrade-cost">€${u.cost.toLocaleString('it-IT')} ${!canAfford ? '<span style="color:#E53935;font-size:10px">(fondi insufficienti: hai €' + money + ')</span>' : ''}</div>
                </div>
                <button class="upgrade-btn" data-type="${u.type}" ${!canAfford ? 'disabled' : ''}>${canAfford ? 'Acquista' : '🔒 Non puoi'}</button>
            </div>
            `;
        }).join('');

        container.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                if (type === 'office') {
                    if (Game.state.money >= 500) {
                        Game.changeMoney(-500);
                        Game.changeReputazione(5);
                        Game.addWorkNotif('Ufficio', 'Hai arredato l\'ufficio di partito! +5 Credibilità', `Giorno ${Game.state.day}`);
                        btn.disabled = true;
                        btn.textContent = 'Fatto!';
                    }
                } else {
                    const success = Game.upgradeHousing(type);
                    if (success) {
                        Game.addWorkNotif('Trasloco!', `Ti sei trasferito: ${Game.state.housing.label}`, `Giorno ${Game.state.day}`);
                    }
                }
                this.refresh();
            });
        });
    },

    // ====== HOME IMPROVEMENTS (Migliorie) ======
    renderImprovements() {
        const container = document.getElementById('home-improvements');
        if (!container) return;
        const settlement = (Game.state.cityFlags && Game.state.cityFlags.settlementType) || 'city';
        const catalog = Game.HOME_IMPROVEMENTS_CATALOG.filter(item => {
            if (!item.allowedSettlement) return true;
            return item.allowedSettlement.includes(settlement);
        });
        const owned = Game.state.homeImprovements;
        const money = Game.state.money;

        let html = '<div class="improvements-grid">';
        catalog.forEach(item => {
            const isOwned = owned.includes(item.id);
            const canAfford = money >= item.cost;
            html += `
                <div class="improvement-card ${isOwned ? 'owned' : ''} ${!canAfford && !isOwned ? 'locked' : ''}">
                    <div class="improvement-name">${item.name}</div>
                    <div class="improvement-desc">${item.desc}</div>
                    <div class="improvement-cost">${isOwned ? '✅ Installato' : `€${item.cost}`}</div>
                    ${!isOwned ? `<button class="improvement-buy-btn" data-id="${item.id}" ${!canAfford ? 'disabled' : ''}>
                        ${canAfford ? 'Acquista' : '🔒 Fondi insufficienti'}
                    </button>` : ''}
                </div>
            `;
        });
        html += '</div>';

        if (owned.length > 0) {
            html += '<div class="improvements-active"><h4>🔧 Migliorie Attive</h4><ul>';
            owned.forEach(id => {
                const item = catalog.find(i => i.id === id);
                if (item) html += `<li>${item.name} — ${item.desc}</li>`;
            });
            html += '</ul></div>';
        }

        container.innerHTML = html;

        container.querySelectorAll('.improvement-buy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const success = Game.buyImprovement(btn.dataset.id);
                if (success) {
                    Game.addWorkNotif('🏠 Miglioria', `Hai installato una nuova miglioria!`, `Giorno ${Game.state.day}`);
                    this.renderImprovements();
                }
            });
        });
    },

    // ====== DIARIO DEI RICORDI ======
    renderDiary() {
        const container = document.getElementById('diary-content');
        if (!container) return;
        const diary = Game.state.diary;

        if (diary.length === 0) {
            container.innerHTML = `
                <div class="diary-empty">
                    <p>📓 Il tuo diario è vuoto.</p>
                    <p class="diary-hint">Completa imprese importanti per sbloccare ricordi che potrai rivivere per recuperare Coerenza.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="diary-intro">
                <p>📓 Rivivi i tuoi ricordi per recuperare Coerenza e Morale.</p>
            </div>
            <div class="diary-grid">
                ${diary.map(entry => `
                    <div class="diary-entry ${entry.used ? 'used' : ''}" data-id="${entry.id}">
                        <div class="diary-icon">${entry.icon}</div>
                        <div class="diary-title">${this.escapeHtml(entry.title)}</div>
                        <div class="diary-day">Giorno ${entry.day}</div>
                        ${!entry.used ? `<button class="diary-use-btn" data-id="${entry.id}">🔄 Rivivi (+${entry.coherenceRecover} Coerenza)</button>` : '<span class="diary-spent">Già rivissuto</span>'}
                    </div>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.diary-use-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const success = Game.useDiaryEntry(btn.dataset.id);
                if (success) {
                    Game.addWorkNotif('📓 Ricordo', 'Hai rivissuto un momento importante. Coerenza recuperata!', `Giorno ${Game.state.day}`);
                    this.renderDiary();
                }
            });
        });
    },

    generateNewBills() {
        const day = Game.state.day;
        const rent = Game.state.housing.rent;

        Game.state.bills = Game.state.bills.filter(b => !b.paid);

        Game.state.bills.push(
            { id: `rent_${day}`, name: 'Affitto', amount: rent, dueDay: day + 5, paid: false, installmentPlan: null },
            { id: `luce_${day}`, name: 'Bolletta luce', amount: 40 + Math.floor(Math.random() * 40), dueDay: day + 7, paid: false, installmentPlan: null },
            { id: `gas_${day}`, name: 'Bolletta gas', amount: 30 + Math.floor(Math.random() * 30), dueDay: day + 7, paid: false, installmentPlan: null },
        );

        Game.addWorkNotif('📬 Nuove bollette', 'Sono arrivate le nuove scadenze!', `Giorno ${day}`);
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
};
