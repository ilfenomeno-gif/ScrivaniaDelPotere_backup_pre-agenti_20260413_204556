/* ============================================
   BANK — Sistema Bancario (Conto, Prestiti, Mutui, Assegni)
   ============================================ */

const Bank = {

    // ─────────────────────────────────────────
    // Inizializzazione
    // ─────────────────────────────────────────
    init() {
        this.ensureState();

        // Ascolta i nuovi giorni
        Game.on('new-day', () => this.processDaily());

        // Resetta baseRent se l'abitazione cambia
        Game.on('housing-change', () => {
            if (Game.state.bank) {
                Game.state.bank._baseRent = Game.state.housing.rent;
            }
        });
    },

    ensureState() {
        if (!Game.state.bank) {
            Game.state.bank = {
                accountBalance: 500,
                loans: [],      // { id, amount, remaining, monthly, monthsTotal, monthsPaid, nextDue, interestRate }
                checks: [],     // { id, to, amount, day, cashed }
                creditScore: 50,
                lastInterestDay: 0,
                _baseRent: null,    // rent originale prima dello sconto
            };
        }
        // Migrazione: campi mancanti su save precedenti
        const b = Game.state.bank;
        if (typeof b.accountBalance !== 'number') b.accountBalance = 0;
        if (!Array.isArray(b.loans)) b.loans = [];
        if (!Array.isArray(b.checks)) b.checks = [];
        if (typeof b.creditScore !== 'number') b.creditScore = 50;
        if (typeof b.lastInterestDay !== 'number') b.lastInterestDay = 0;
        if (b._baseRent == null) b._baseRent = Game.state.housing ? Game.state.housing.rent : 200;  // Ridotto da 300 per evitare deficit
    },

    // ─────────────────────────────────────────
    // Loop giornaliero
    // ─────────────────────────────────────────
    processDaily() {
        this.ensureState();
        const bank = Game.state.bank;
        const day  = Game.state.day;

        // Interessi passivi sulle rate dei prestiti
        this._processLoanInstallments();

        // Interessi attivi sul conto (0.1 %/giorno se saldo > 0)
        if (bank.accountBalance > 0 && day > bank.lastInterestDay) {
            const interest = Math.floor(bank.accountBalance * 0.001);
            if (interest > 0) {
                bank.accountBalance += interest;
                Game.addWorkNotif('🏦 Interessi bancari', `+€${interest} accreditati sul conto corrente.`, `Giorno ${day}`);
            }
            bank.lastInterestDay = day;
        }

        // Canone mensile (€5) se saldo conto < 100
        if (day % 30 === 0 && bank.accountBalance < 100 && bank.accountBalance > 0) {
            const fee = 5;
            bank.accountBalance = Math.max(0, bank.accountBalance - fee);
            Game.addWorkNotif('🏦 Canone mensile', `€${fee} addebitati sul conto (saldo basso).`, `Giorno ${day}`);
        }

        this.applyRentDiscount();
        this.updateCreditScore();
    },

    _processLoanInstallments() {
        const bank = Game.state.bank;
        const day  = Game.state.day;
        bank.loans.forEach(loan => {
            if (loan.remaining <= 0) return;
            if (day < loan.nextDue) return;

            if (bank.accountBalance >= loan.monthly) {
                bank.accountBalance -= loan.monthly;
                loan.remaining      -= loan.monthly;
                loan.monthsPaid++;
                loan.nextDue = day + 30;
                if (loan.remaining <= 0) {
                    Game.addWorkNotif('🏦 Prestito estinto', `Il prestito di €${loan.amount} è stato rimborsato completamente.`, `Giorno ${day}`);
                }
            } else {
                // Rata non pagata → penalità
                Game.changeStat('stress', 6);
                Game.changeReputazione(-2);
                loan.nextDue = day + 5;   // riprova tra 5 giorni
                bank.creditScore = Math.max(0, bank.creditScore - 5);
                Game.addWorkNotif('🏦 Rata non pagata', `Saldo insufficiente per la rata di €${loan.monthly}. Riprogrammata tra 5 giorni.`, `Giorno ${day}`);
            }
        });

        // Rimuovi prestiti estinti
        bank.loans = bank.loans.filter(l => l.remaining > 0);
    },

    // ─────────────────────────────────────────
    // Sconto affitto
    // ─────────────────────────────────────────
    applyRentDiscount() {
        this.ensureState();
        const bank    = Game.state.bank;
        const housing = Game.state.housing;
        if (!housing) return;

        // Assicura che baseRent sia sempre il valore di partenza
        if (!bank._baseRent || bank._baseRent <= 0) {
            bank._baseRent = housing.rent;
        }

        let discountPct = 0;
        if (bank.accountBalance >= 5000)      discountPct = 0.20;
        else if (bank.accountBalance >= 2000) discountPct = 0.10;
        else if (bank.accountBalance >= 1000) discountPct = 0.05;

        const newRent = Math.floor(bank._baseRent * (1 - discountPct));
        if (newRent !== housing.rent) {
            housing.rent = newRent;
            if (discountPct > 0) {
                Game.addWorkNotif(
                    '🏦 Sconto Affitto',
                    `Grazie al saldo bancario, l'affitto è ora €${newRent} (-${Math.round(discountPct * 100)}%).`,
                    `Giorno ${Game.state.day}`
                );
            }
            Game.emit('housing-change', {});
        }
    },

    // ─────────────────────────────────────────
    // Punteggio di credito
    // ─────────────────────────────────────────
    updateCreditScore() {
        this.ensureState();
        const bank = Game.state.bank;
        let score  = 50;
        const activeLoans = bank.loans.filter(l => l.remaining > 0).length;
        score -= activeLoans * 5;
        if (bank.accountBalance >= 2000) score += 15;
        else if (bank.accountBalance >= 500) score += 5;
        bank.creditScore = Math.max(0, Math.min(100, score));
    },

    // ─────────────────────────────────────────
    // Operazioni sul conto
    // ─────────────────────────────────────────
    deposit(amount) {
        this.ensureState();
        amount = Math.floor(Number(amount));
        if (!amount || amount <= 0) return false;
        if (Game.state.money < amount) {
            Game.addWorkNotif('🏦 Deposito fallito', 'Non hai abbastanza contanti.', `Giorno ${Game.state.day}`);
            return false;
        }
        Game.changeMoney(-amount);
        Game.state.bank.accountBalance += amount;
        Game.addWorkNotif('🏦 Deposito', `€${amount} depositati sul conto corrente.`, `Giorno ${Game.state.day}`);
        this.applyRentDiscount();
        return true;
    },

    withdraw(amount) {
        this.ensureState();
        amount = Math.floor(Number(amount));
        if (!amount || amount <= 0) return false;
        if (Game.state.bank.accountBalance < amount) {
            Game.addWorkNotif('🏦 Prelievo fallito', 'Saldo insufficiente sul conto.', `Giorno ${Game.state.day}`);
            return false;
        }
        Game.state.bank.accountBalance -= amount;
        Game.changeMoney(amount);
        Game.addWorkNotif('🏦 Prelievo', `€${amount} prelevati dal conto.`, `Giorno ${Game.state.day}`);
        this.applyRentDiscount();
        return true;
    },

    // ─────────────────────────────────────────
    // Prestiti
    // ─────────────────────────────────────────
    requestLoan(amount, months) {
        this.ensureState();
        amount = Math.floor(Number(amount));
        months = Math.floor(Number(months));
        if (!amount || amount <= 0 || !months || months <= 0) return false;

        const bank = Game.state.bank;
        const credit = bank.creditScore;

        if (bank.loans.filter(l => l.remaining > 0).length >= 3) {
            Game.addWorkNotif('🏦 Prestito negato', 'Hai già 3 prestiti attivi. Estinguine uno prima.', `Giorno ${Game.state.day}`);
            return false;
        }
        if (credit < 20) {
            Game.addWorkNotif('🏦 Prestito negato', `Punteggio di credito troppo basso (${credit}/100).`, `Giorno ${Game.state.day}`);
            return false;
        }

        const interestRate = 0.05 + (100 - credit) / 1000;
        const total   = Math.ceil(amount * (1 + interestRate));
        const monthly = Math.ceil(total / months);

        bank.loans.push({
            id:           Date.now(),
            amount:       amount,
            remaining:    total,
            monthly:      monthly,
            monthsTotal:  months,
            monthsPaid:   0,
            nextDue:      Game.state.day + 30,
            interestRate: interestRate,
        });
        bank.accountBalance += amount;
        Game.addWorkNotif(
            '🏦 Prestito approvato',
            `€${amount} accreditati. Rata mensile: €${monthly} × ${months} mesi (tasso ${(interestRate * 100).toFixed(1)}%).`,
            `Giorno ${Game.state.day}`
        );
        return true;
    },

    // Pagamento manuale anticipato di una rata
    payLoanInstallment(loanId) {
        this.ensureState();
        const loan = Game.state.bank.loans.find(l => l.id === loanId);
        if (!loan || loan.remaining <= 0) return false;
        if (Game.state.bank.accountBalance < loan.monthly) {
            Game.addWorkNotif('🏦 Rata non pagata', `Saldo insufficiente per la rata di €${loan.monthly}.`, `Giorno ${Game.state.day}`);
            return false;
        }
        Game.state.bank.accountBalance -= loan.monthly;
        loan.remaining  -= loan.monthly;
        loan.monthsPaid++;
        loan.nextDue = Game.state.day + 30;
        if (loan.remaining <= 0) {
            Game.state.bank.loans = Game.state.bank.loans.filter(l => l.id !== loanId);
            Game.addWorkNotif('🏦 Prestito estinto', 'Hai completato il rimborso del prestito!', `Giorno ${Game.state.day}`);
        }
        return true;
    },

    // ─────────────────────────────────────────
    // Assegni
    // ─────────────────────────────────────────
    issueCheck(contactName, amount) {
        this.ensureState();
        amount = Math.floor(Number(amount));
        if (!amount || amount <= 0) return false;
        // L'importo viene bloccato subito (non disponibile, ma non ancora uscito dal saldo)
        // Semplificazione: lo scaliamo direttamente all'emissione
        if (Game.state.bank.accountBalance < amount) {
            Game.addWorkNotif('🏦 Assegno non emesso', 'Saldo insufficiente.', `Giorno ${Game.state.day}`);
            return false;
        }
        Game.state.bank.accountBalance -= amount;
        const check = {
            id:     Date.now(),
            to:     contactName,
            amount: amount,
            day:    Game.state.day,
            cashed: false,
        };
        Game.state.bank.checks.push(check);
        Game.addWorkNotif(
            '🏦 Assegno emesso',
            `Assegno di €${amount} intestato a ${contactName}. L'importo è già stato addebitato sul conto.`,
            `Giorno ${Game.state.day}`
        );
        return check.id;
    },

    // ─────────────────────────────────────────
    // UI — pannello Casa > Economia
    // ─────────────────────────────────────────
    renderBankPanel() {
        this.ensureState();
        const container = document.getElementById('bank-panel');
        if (!container) return;

        const bank  = Game.state.bank;
        const loans = bank.loans.filter(l => l.remaining > 0);

        let loansHtml = '';
        if (loans.length > 0) {
            loansHtml = '<div class="bank-loans-list">';
            loans.forEach(loan => {
                const pct = Math.round((1 - loan.remaining / (loan.monthly * loan.monthsTotal)) * 100);
                loansHtml += `
                    <div class="bank-loan-item">
                        <div class="bank-loan-info">
                            <span class="bank-loan-amount">Prestito €${loan.amount}</span>
                            <span class="bank-loan-progress">Residuo: €${loan.remaining} | Rata: €${loan.monthly} | ${loan.monthsPaid}/${loan.monthsTotal} rate</span>
                            <div class="bank-loan-bar"><div class="bank-loan-fill" style="width:${pct}%"></div></div>
                        </div>
                        <button class="bank-btn bank-btn-small" data-loan-id="${loan.id}">💳 Paga rata</button>
                    </div>`;
            });
            loansHtml += '</div>';
        } else {
            loansHtml = '<p class="bank-no-loans">Nessun prestito attivo.</p>';
        }

        const rentBase  = bank._baseRent || Game.state.housing.rent;
        const rentNow   = Game.state.housing.rent;
        const discount  = rentBase > rentNow ? rentBase - rentNow : 0;

        container.innerHTML = `
            <div class="bank-section">
                <div class="bank-header">
                    <span class="bank-icon">🏦</span>
                    <span class="bank-title">Conto Corrente Bancario</span>
                </div>
                <div class="bank-balance-row">
                    <span class="bank-balance-label">Saldo:</span>
                    <span class="bank-balance-value">€${bank.accountBalance.toLocaleString('it-IT')}</span>
                </div>
                <div class="bank-credit-row">
                    <span>Punteggio di credito:</span>
                    <span class="bank-credit-score" style="color:${bank.creditScore >= 60 ? '#66BB6A' : bank.creditScore >= 30 ? '#FFA726' : '#EF5350'}">${bank.creditScore}/100</span>
                </div>
                ${discount > 0 ? `<div class="bank-discount-row">🏠 Sconto affitto attivo: -€${discount}/periodo</div>` : ''}
                <div class="bank-actions">
                    <button class="bank-btn" id="bank-deposit-btn">💰 Deposita contanti</button>
                    <button class="bank-btn" id="bank-withdraw-btn">💸 Preleva</button>
                    <button class="bank-btn" id="bank-loan-btn">📈 Richiedi prestito</button>
                </div>
                <div class="bank-loans-section">
                    <div class="bank-subtitle">📋 Prestiti attivi</div>
                    ${loansHtml}
                </div>
            </div>
        `;

        // Bottone deposito
        container.querySelector('#bank-deposit-btn').addEventListener('click', () => {
            const raw = window.prompt('Quanto vuoi depositare? (disponibile: €' + Game.state.money + ')');
            const amt = parseInt(raw, 10);
            if (amt > 0) {
                Bank.deposit(amt);
                Bank.renderBankPanel();
                if (typeof House !== 'undefined' && House.refresh) House.refresh();
            }
        });

        // Bottone prelievo
        container.querySelector('#bank-withdraw-btn').addEventListener('click', () => {
            const raw = window.prompt('Quanto vuoi prelevare? (sul conto: €' + bank.accountBalance + ')');
            const amt = parseInt(raw, 10);
            if (amt > 0) {
                Bank.withdraw(amt);
                Bank.renderBankPanel();
                if (typeof House !== 'undefined' && House.refresh) House.refresh();
            }
        });

        // Bottone prestito
        container.querySelector('#bank-loan-btn').addEventListener('click', () => {
            const rawAmt = window.prompt('Importo del prestito? (max €5000)');
            const amount = parseInt(rawAmt, 10);
            if (!amount || amount <= 0 || amount > 5000) return;
            const rawMo = window.prompt('Numero di mesi per rimborsarlo? (6, 12, 24, 36)');
            const months = parseInt(rawMo, 10);
            if (!months || months <= 0) return;
            Bank.requestLoan(amount, months);
            Bank.renderBankPanel();
        });

        // Bottoni paga rata
        container.querySelectorAll('[data-loan-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                Bank.payLoanInstallment(Number(btn.dataset.loanId));
                Bank.renderBankPanel();
            });
        });
    },
};
