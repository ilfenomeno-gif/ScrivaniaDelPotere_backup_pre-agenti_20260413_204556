/* ============================================
   FAVORS — L'Ombra del Palazzo
   Sistema delle Promesse e dei Crediti
   ============================================ */

const Favors = {
    FAVOR_TEMPLATES: [
        {
            id: 'universita',
            text: 'Mia figlia deve entrare all\'Università, ma le mancano 2 punti. Puoi fare una telefonata?',
            cost: { money: 100, ap: 1 },
            relationBonus: 20,
            creditType: 'istituzionale',
            creditDesc: 'Credito istituzionale: sconti migliorie o proposta in consiglio',
        },
        {
            id: 'lavoro',
            text: 'Mio nipote cerca lavoro. Hai qualche contatto in comune?',
            cost: { money: 50, ap: 1 },
            relationBonus: 15,
            creditType: 'sociale',
            creditDesc: 'Credito sociale: alibi in caso di scandalo',
        },
        {
            id: 'permesso',
            text: 'Ho bisogno di un permesso edilizio... diciamo... velocizzato.',
            cost: { money: 150, ap: 1 },
            relationBonus: 25,
            creditType: 'burocratico',
            creditDesc: 'Credito burocratico: velocizza una pratica o blocca un\'indagine',
        },
        {
            id: 'articolo',
            text: 'Puoi far uscire un articolo positivo su di me? Ho un amico giornalista...',
            cost: { money: 80, ap: 1 },
            relationBonus: 18,
            creditType: 'mediatico',
            creditDesc: 'Credito mediatico: +10 reputazione quando vuoi',
        },
        {
            id: 'voto',
            text: 'La prossima votazione in consiglio... potrei aver bisogno del tuo appoggio.',
            cost: { money: 0, ap: 1 },
            relationBonus: 20,
            creditType: 'politico',
            creditDesc: 'Credito politico: voto garantito o alleanza in una crisi',
            coherenceCost: 5,
        },
        {
            id: 'pizzo',
            text: 'Ho un problemino con certi personaggi. Puoi metterci una buona parola?',
            cost: { money: 0, ap: 1 },
            relationBonus: 15,
            creditType: 'protezione',
            creditDesc: 'Credito protezione: riduce il pizzo o blocca un\'estorsione',
            riskReputazione: -3,
        },
    ],

    init() {
        if (!Game.state.favors) {
            Game.state.favors = {
                pending: [],   // active favor requests
                credits: [],   // earned credits
                completed: 0,  // total favors done
            };
        }

        // Generate favor requests when relation milestones are hit
        Game.on('stat-change', () => this.checkFavorTriggers());

        // Every 3 days, maybe a contact asks a favor
        Game.on('time-advance', (d) => {
            if (d.timeOfDay === 0 && Game.state.day % 3 === 0) {
                this.maybeGenerateFavor();
            }
        });
    },

    checkFavorTriggers() {
        // Each contact with relation >= 60 and no active favor might request one
        // Checked passively, actual generation in maybeGenerateFavor
    },

    maybeGenerateFavor() {
        if (Game.state.favors.pending.length >= 3) return; // max 3 active

        const eligible = Game.state.contacts.filter(c =>
            c.relation >= 40 &&
            !c.betrayed &&
            !Game.state.favors.pending.find(f => f.contactName === c.name)
        );

        if (eligible.length === 0) return;
        if (Math.random() > 0.4) return; // 40% chance

        const contact = eligible[Math.floor(Math.random() * eligible.length)];
        const template = this.FAVOR_TEMPLATES[Math.floor(Math.random() * this.FAVOR_TEMPLATES.length)];

        const favor = {
            id: `fav_${Date.now()}`,
            contactName: contact.name,
            contactEmoji: contact.emoji,
            templateId: template.id,
            text: template.text,
            cost: { ...template.cost },
            relationBonus: template.relationBonus,
            creditType: template.creditType,
            creditDesc: template.creditDesc,
            coherenceCost: template.coherenceCost || 0,
            riskReputazione: template.riskReputazione || 0,
            day: Game.state.day,
            expires: Game.state.day + 5, // 5 days to fulfill
        };

        Game.state.favors.pending.push(favor);
        Game.addUrgentMessage(contact.name, `"${template.text}"`, 'info');
        Game.addWorkNotif('🤝 Favore', `${contact.name} ti chiede un favore.`, `Giorno ${Game.state.day}`);
    },

    // Fulfill a favor
    fulfillFavor(favorId) {
        const idx = Game.state.favors.pending.findIndex(f => f.id === favorId);
        if (idx === -1) return false;
        const favor = Game.state.favors.pending[idx];

        // Check costs
        if (favor.cost.ap > 0 && !Game.spendActionPoint(favor.cost.ap)) {
            Game.emit('no-ap', { reason: 'Punti azione esauriti!' });
            return false;
        }
        if (favor.cost.money > 0) {
            if (Game.state.money < favor.cost.money) {
                Game.addWorkNotif('🤝 Favore', `Non hai €${favor.cost.money} per il favore.`, `Giorno ${Game.state.day}`);
                if (favor.cost.ap > 0) { Game.state.actionPoints++; Game.emit('ap-change', { ap: Game.state.actionPoints }); }
                return false;
            }
            Game.changeMoney(-favor.cost.money);
        }

        // Apply effects
        const contact = Game.state.contacts.find(c => c.name === favor.contactName);
        if (contact) {
            contact.relation = Math.min(100, contact.relation + favor.relationBonus);
            contact.loyalty = Math.min(100, contact.loyalty + 8);
        }

        if (favor.coherenceCost > 0) {
            Game.changeStat('coherence', -favor.coherenceCost);
        }
        if (favor.riskReputazione) {
            Game.changeReputazione(favor.riskReputazione);
        }

        // Earn credit
        Game.state.favors.credits.push({
            type: favor.creditType,
            desc: favor.creditDesc,
            from: favor.contactName,
            day: Game.state.day,
            used: false,
        });

        Game.state.favors.completed++;
        Game.state.favors.pending.splice(idx, 1);

        Game.addWorkNotif('🤝 Favore Completato', `Hai aiutato ${favor.contactName}. Credito "${favor.creditType}" guadagnato!`, `Giorno ${Game.state.day}`);
        Game.changeStat('stanchezza', 5);
        return true;
    },

    // Decline a favor (relation loss)
    declineFavor(favorId) {
        const idx = Game.state.favors.pending.findIndex(f => f.id === favorId);
        if (idx === -1) return;
        const favor = Game.state.favors.pending[idx];

        const contact = Game.state.contacts.find(c => c.name === favor.contactName);
        if (contact) {
            contact.relation = Math.max(0, contact.relation - 15);
            contact.loyalty = Math.max(0, contact.loyalty - 10);
            if (Game.handleFavorNeglect) Game.handleFavorNeglect(contact);
        }

        Game.state.favors.pending.splice(idx, 1);
        Game.addWorkNotif('❌ Favore Rifiutato', `Hai rifiutato il favore di ${favor.contactName}. Relazione -15.`, `Giorno ${Game.state.day}`);
    },

    // Spend a credit for a specific benefit
    spendCredit(creditIndex) {
        const credit = Game.state.favors.credits[creditIndex];
        if (!credit || credit.used) return false;

        credit.used = true;

        switch (credit.type) {
            case 'istituzionale':
                // 50% discount on next home improvement (flag)
                Game.state.flags.improvementDiscount = true;
                Game.addWorkNotif('📜 Credito Usato', 'Prossima miglioria casa -50%!', `Giorno ${Game.state.day}`);
                break;
            case 'sociale':
                // Shield from next scandal
                Game.state.flags.scandalShield = true;
                Game.addWorkNotif('🛡️ Credito Usato', 'Hai un alibi pronto per il prossimo scandalo.', `Giorno ${Game.state.day}`);
                break;
            case 'burocratico':
                // Reduce investigation risk
                Game.state.mafia.rischioIndagini = Math.max(0, Game.state.mafia.rischioIndagini - 20);
                Game.addWorkNotif('📋 Credito Usato', 'Rischio Indagini -20.', `Giorno ${Game.state.day}`);
                break;
            case 'mediatico':
                Game.changeReputazione(10);
                Game.addWorkNotif('📰 Credito Usato', 'Articolo positivo pubblicato! Reputazione +10.', `Giorno ${Game.state.day}`);
                break;
            case 'politico':
                Game.changeStat('coherence', 10);
                Game.changeReputazione(5);
                Game.addWorkNotif('🏛️ Credito Usato', 'Alleanza politica attivata! Coerenza +10, Rep +5.', `Giorno ${Game.state.day}`);
                break;
            case 'protezione':
                Game.state.mafia.pizzoWeekly = Math.max(0, Game.state.mafia.pizzoWeekly - 30);
                Game.addWorkNotif('🤫 Credito Usato', 'Pizzo ridotto!', `Giorno ${Game.state.day}`);
                break;
        }
        return true;
    },

    // Expire old favors
    expireOldFavors() {
        const expired = Game.state.favors.pending.filter(f => Game.state.day > f.expires);
        expired.forEach(f => {
            const contact = Game.state.contacts.find(c => c.name === f.contactName);
            if (contact) {
                contact.relation = Math.max(0, contact.relation - 15);
                if (Game.handleFavorNeglect) Game.handleFavorNeglect(contact);
            }
            Game.addWorkNotif('⏰ Favore Scaduto', `Non hai aiutato ${f.contactName} in tempo. Relazione -15.`, `Giorno ${Game.state.day}`);
        });
        Game.state.favors.pending = Game.state.favors.pending.filter(f => Game.state.day <= f.expires);
    },

    // Render favors in the Urgenti phone tab
    renderFavorsInUrgenti() {
        const container = document.getElementById('urgenti-list');
        if (!container) return;

        const pending = Game.state.favors.pending;
        if (pending.length === 0) return;

        // Append after urgenti messages
        const favSection = document.createElement('div');
        favSection.className = 'favors-urgenti-section';
        favSection.innerHTML = `<h4 class="favors-header">🤝 Favori in Sospeso</h4>`;

        pending.forEach((favor, i) => {
            const daysLeft = favor.expires - Game.state.day;
            const el = document.createElement('div');
            el.className = 'favor-card';
            el.innerHTML = `
                <div class="favor-header">
                    <span class="favor-from">${favor.contactEmoji} ${favor.contactName}</span>
                    <span class="favor-expires ${daysLeft <= 1 ? 'favor-urgent' : ''}">⏰ ${daysLeft}g</span>
                </div>
                <div class="favor-text">"${favor.text}"</div>
                <div class="favor-cost">
                    ${favor.cost.money > 0 ? `💰 €${favor.cost.money}` : ''}
                    ${favor.cost.ap > 0 ? `⚡ ${favor.cost.ap} PA` : ''}
                    ${favor.coherenceCost > 0 ? `⚖️ -${favor.coherenceCost} Coerenza` : ''}
                </div>
                <div class="favor-reward">🎁 Credito: ${favor.creditDesc}</div>
                <div class="favor-actions">
                    <button class="favor-fulfill-btn" data-idx="${i}">✅ Esegui</button>
                    <button class="favor-decline-btn" data-idx="${i}">❌ Rifiuta</button>
                </div>
            `;
            favSection.appendChild(el);
        });

        container.appendChild(favSection);

        // Bind buttons
        favSection.querySelectorAll('.favor-fulfill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const favor = Game.state.favors.pending[idx];
                if (favor && this.fulfillFavor(favor.id)) {
                    Phone.renderUrgenti();
                    this.renderFavorsInUrgenti();
                }
            });
        });
        favSection.querySelectorAll('.favor-decline-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                const favor = Game.state.favors.pending[idx];
                if (favor) {
                    this.declineFavor(favor.id);
                    Phone.renderUrgenti();
                    this.renderFavorsInUrgenti();
                }
            });
        });
    },

    // Render credits in stats panel
    renderCreditsInStats() {
        const statsBody = document.getElementById('stats-body');
        if (!statsBody) return;

        const old = statsBody.querySelector('.credits-section');
        if (old) old.remove();

        const credits = (Game.state.favors?.credits || []).filter(c => !c.used);
        if (credits.length === 0) return;

        const section = document.createElement('div');
        section.className = 'credits-section';
        section.innerHTML = `
            <h4 class="stats-section-title">🎁 Crediti Disponibili</h4>
            ${credits.map((c, i) => `
                <div class="credit-card">
                    <div class="credit-type">${this.creditIcon(c.type)} ${c.type}</div>
                    <div class="credit-from">Da: ${c.from}</div>
                    <div class="credit-desc">${c.desc}</div>
                    <button class="credit-use-btn" data-idx="${Game.state.favors.credits.indexOf(c)}">Usa Credito</button>
                </div>
            `).join('')}
        `;
        statsBody.appendChild(section);

        section.querySelectorAll('.credit-use-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.spendCredit(parseInt(btn.dataset.idx));
                this.renderCreditsInStats();
            });
        });
    },

    creditIcon(type) {
        const icons = { istituzionale: '📜', sociale: '🛡️', burocratico: '📋', mediatico: '📰', politico: '🏛️', protezione: '🤫' };
        return icons[type] || '🎁';
    },
};
