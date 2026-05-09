/* ============================================
   INVESTMENTS — Economia Personale (v1.0)
   ============================================ */

const Investments = {
    _activeTab: 'mercato',

    init() {
        Game.on('investment-change', () => this.render());
        Game.on('time-advance', () => {
            const container = document.getElementById('investments-container');
            if (container && container.closest('#tab-finanza') && !container.closest('#tab-finanza').classList.contains('active')) return;
            this.render();
        });
        Game.on('panel-open', (data) => {
            if (data.panel === 'phone') this.render();
        });
    },

    render() {
        const container = document.getElementById('investments-container');
        if (!container) return;

        const money = Game.state.money || 0;
        const portfolio = Game.state.investments || [];
        const catalog = Game.INVESTMENT_CATALOG || {};

        // Sub-tabs
        let html = `<div class="phone-work-tabs" role="tablist" aria-label="Sezioni finanza">
            <button class="phone-work-tab${this._activeTab === 'mercato' ? ' active' : ''}" data-itab="mercato" role="tab" aria-selected="${this._activeTab === 'mercato'}">📊 Mercato</button>
            <button class="phone-work-tab${this._activeTab === 'portafoglio' ? ' active' : ''}" data-itab="portafoglio" role="tab" aria-selected="${this._activeTab === 'portafoglio'}">💼 Portafoglio</button>
        </div>`;

        html += `<div class="investment-balance">💶 Disponibile: <strong>€${money}</strong></div>`;

        if (this._activeTab === 'mercato') {
            html += '<div class="improvements-grid" style="margin-top:10px;">';
            Object.entries(catalog).forEach(([type, cat]) => {
                const riskColor = cat.riskLevel === 'high' ? '#ff4444' : cat.riskLevel === 'medium' ? '#ffa726' : cat.riskLevel === 'none' ? '#43a047' : '#90caf9';
                const riskLabel = { high: '🔴 Alto', medium: '🟡 Medio', low: '🟢 Basso', none: '✅ Nessuno' }[cat.riskLevel] || cat.riskLevel;
                const canAfford = money >= cat.minAmount;
                html += `<div class="improvement-card">
                    <div class="improvement-header">
                        <span class="improvement-name">${cat.name}</span>
                    </div>
                    <div class="improvement-desc">${cat.desc}</div>
                    <div style="font-size:0.72em;color:${riskColor};margin:4px 0">Rischio: ${riskLabel} — Min: €${cat.minAmount}</div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">
                        ${[cat.minAmount, cat.minAmount * 2, cat.minAmount * 5].map(amt => `
                            <button class="improvement-buy-btn invest-btn" data-type="${type}" data-amount="${amt}"
                                ${canAfford && money >= amt ? '' : 'disabled'} aria-label="Investi €${amt} in ${cat.name}">
                                €${amt}
                            </button>
                        `).join('')}
                    </div>
                </div>`;
            });
            html += '</div>';
        } else {
            // Portfolio tab
            if (portfolio.length === 0) {
                html += `<div style="padding:20px;text-align:center;color:#888">Nessun investimento attivo.<br>Vai su Mercato per iniziare.</div>`;
            } else {
                html += '<div class="improvements-grid" style="margin-top:10px;">';
                portfolio.forEach(inv => {
                    const daysHeld = Math.max(0, (Game.state.day || 0) - inv.purchaseDay);
                    const estReturn = Math.round(inv.amount * (1 + inv.returnRate * daysHeld / 365));
                    const gain = estReturn - inv.amount;
                    const gainColor = gain >= 0 ? '#43a047' : '#e53935';
                    html += `<div class="improvement-card">
                        <div class="improvement-header">
                            <span class="improvement-name">${inv.name}</span>
                        </div>
                        <div class="improvement-desc">Investito: €${inv.amount} — ${daysHeld} giorni fa</div>
                        <div style="font-size:0.8em;color:${gainColor};margin:4px 0">
                            Valore stimato: ~€${estReturn} (${gain >= 0 ? '+' : ''}€${gain})
                        </div>
                        <button class="improvement-buy-btn liquidate-btn" data-invid="${inv.id}"
                            style="background:#6b1a1a;margin-top:6px" aria-label="Vendi ${inv.name}">
                            💸 Vendi
                        </button>
                    </div>`;
                });
                html += '</div>';
            }
        }

        container.innerHTML = html;

        // Tab switching
        container.querySelectorAll('.phone-work-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                this._activeTab = btn.dataset.itab;
                this.render();
            });
        });

        // Invest buttons — show amount input for custom amounts
        container.querySelectorAll('.invest-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const amount = parseInt(btn.dataset.amount, 10);
                if (Game.investMoney(type, amount)) {
                    if (window.SR) SR.announce(`Investimento di €${amount} effettuato.`, 'polite');
                    this._activeTab = 'portafoglio';
                    this.render();
                }
            });
        });

        // Liquidate buttons
        container.querySelectorAll('.liquidate-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const result = Game.liquidateInvestment(btn.dataset.invid);
                if (result) {
                    const gain = result.returned - result.original;
                    if (window.SR) SR.announce(`Investimento venduto. Ricevuti €${result.returned} (${gain >= 0 ? '+' : ''}€${gain}).`, 'polite');
                    this.render();
                }
            });
        });
    },
};
