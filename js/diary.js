/* ============================================
   DIARY — Il Fantasma del Passato
   Diario narrativo della carriera politica
   ============================================ */

const Diary = {
    INTERVAL: 10, // ogni 10 giorni

    QUESTIONS_POOL: [
        // Work vs Family
        {
            trigger: 'general',
            question: 'La scorsa settimana hai dovuto scegliere tra lavoro e vita personale. Come ti sei sentito?',
            choices: [
                { text: 'Ero al posto giusto. Il Partito prima di tutto.', effects: { coherence: 5, morale: -5 }, tag: 'ambizioso' },
                { text: 'Mi sono sentito in colpa. Devo trovare un equilibrio.', effects: { morale: 5, coherence: -3 }, tag: 'umano' },
                { text: 'Non me ne fregava niente. Sono diventato insensibile.', effects: { stress: -5, morale: -3 }, tag: 'cinico' },
            ],
        },
        // Money
        {
            trigger: 'money_low',
            condition: () => Game.state.money < 50,
            question: 'I soldi scarseggiano. La povertà ti fa pensare...',
            choices: [
                { text: 'La povertà è il prezzo dell\'idealismo. Ne vale la pena.', effects: { coherence: 8, stress: 5 }, tag: 'idealista' },
                { text: 'Forse dovrei essere più furbo con i soldi.', effects: { intelligenza: 2 }, tag: 'pragmatico' },
                { text: 'Devo trovare una scorciatoia. A qualsiasi costo.', effects: { stress: -3, coherence: -5 }, tag: 'disperato' },
            ],
        },
        // High stress
        {
            trigger: 'stress_high',
            condition: () => Game.state.stats.stress > 70,
            question: 'Lo stress ti sta divorando. Cosa pensi nelle notti insonni?',
            choices: [
                { text: 'Questo è il prezzo del potere. Lo accetto.', effects: { morale: -5, carisma: 2 }, tag: 'stoico' },
                { text: 'Forse dovrei mollare tutto e tornare alla vita normale.', effects: { stress: -10, coherence: -5 }, tag: 'dubbioso' },
                { text: 'Non dormo, ma pianifico. La vendetta sarà dolce.', effects: { stress: 5, reputazione: 3 }, tag: 'vendicativo' },
            ],
        },
        // Mafia
        {
            trigger: 'mafia',
            condition: () => Game.state.mafia.active,
            question: 'Hai accettato certi compromessi. Cosa scrivi nel diario?',
            choices: [
                { text: 'Sono un uomo d\'affari. È solo business.', effects: { rispettoCriminale: 5 }, tag: 'corrotto' },
                { text: 'È un male necessario. Ma non lo rifarò.', effects: { stress: 5, rischioIndagini: -3 }, tag: 'pentito' },
                { text: 'Mi fa schifo. Ma non ho alternative.', effects: { morale: -8, coherence: 3 }, tag: 'intrappolato' },
            ],
        },
        // High reputation
        {
            trigger: 'reputation_high',
            condition: () => Game.state.reputazione > 70,
            question: 'Sei diventato famoso. La fama ti cambia?',
            choices: [
                { text: 'Meritavo questo successo. Sono fatto per guidare.', effects: { carisma: 3, autenticita: -2 }, tag: 'narcisista' },
                { text: 'Non sono cambiato. Resto con i piedi per terra.', effects: { autenticita: 3, coherence: 3 }, tag: 'autentico' },
                { text: 'La fama è una gabbia dorata. Mi manca l\'anonimato.', effects: { stress: 5, morale: 3 }, tag: 'nostalgico' },
            ],
        },
        // Partner
        {
            trigger: 'partner',
            condition: () => Game.state.partner != null,
            question: 'La tua relazione sentimentale in mezzo alla politica...',
            choices: [
                { text: 'È il mio pilastro. Senza di lei/lui crollerei.', effects: { morale: 5, stress: -3 }, tag: 'innamorato' },
                { text: 'A volte mi chiedo se mi ama o ama il potere.', effects: { stress: 3, intelligenza: 1 }, tag: 'paranoico' },
                { text: 'La relazione è un\'alleanza strategica, come le altre.', effects: { carisma: 2, morale: -3 }, tag: 'calcolatore' },
            ],
        },
        // Contacts
        {
            trigger: 'contacts',
            condition: () => Game.state.contacts.length >= 3,
            question: 'Hai costruito una rete di contatti. Di chi ti fidi veramente?',
            choices: [
                { text: 'Di nessuno. In politica la fiducia è debolezza.', effects: { intelligenza: 2, morale: -3 }, tag: 'solitario' },
                { text: 'Di pochi eletti. La lealtà si conquista.', effects: { autenticita: 2, coherence: 2 }, tag: 'selettivo' },
                { text: 'Di tutti. Fino a prova contraria.', effects: { carisma: 3, coherence: -3 }, tag: 'ingenuo' },
            ],
        },
        // Generic reflection
        {
            trigger: 'general',
            question: 'Ripensi al motivo per cui sei entrato in politica...',
            choices: [
                { text: 'Per cambiare le cose. E ci sto riuscendo.', effects: { coherence: 5, morale: 5 }, tag: 'idealista' },
                { text: 'Per il potere. E non me ne vergogno.', effects: { carisma: 3, autenticita: -3 }, tag: 'ambizioso' },
                { text: 'Non me lo ricordo più. Forse è questo il problema.', effects: { morale: -5, stress: 3 }, tag: 'smarrito' },
            ],
        },
    ],

    init() {
        if (!Game.state.diaryEntries) {
            Game.state.diaryEntries = []; // { day, question, answer, tag }
        }
        if (!Game.state.flags) Game.state.flags = {};

        Game.on('time-advance', (d) => {
            if (d.timeOfDay === 0 && Game.state.day > 1 && Game.state.day % this.INTERVAL === 0) {
                Scheduler.timeout(() => this.triggerDiaryEntry(), 1200, { group: 'diary', label: 'entry-interval' });
            }
        });

        Game.on('new-day', ({ day }) => {
            if (day >= 5 && !Game.state.flags.diaryIntroShown) {
                Game.state.flags.diaryIntroShown = true;
                Scheduler.timeout(() => this.triggerDiaryEntry(), 900, { group: 'diary', label: 'entry-newday' });
            }
        });

        // Inject into stats panel
        Game.on('panel-open', (data) => {
            if (data.panel === 'stats') {
                Scheduler.timeout(() => this.injectDiarySection(), 100, { group: 'diary', label: 'inject-stats' });
            }
        });
    },

    getAvailableQuestions() {
        return this.QUESTIONS_POOL.filter(q => {
            if (q.condition && !q.condition()) return false;
            return true;
        });
    },

    triggerDiaryEntry() {
        const questions = this.getAvailableQuestions();
        if (questions.length === 0) return;

        const question = questions[Math.floor(Math.random() * questions.length)];
        this.showDiaryPopup(question);
    },

    showDiaryPopup(question) {
        const overlay = document.getElementById('diary-overlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="diary-panel">
                <div class="diary-header">
                    <div class="diary-icon">📖</div>
                    <h2>Diario della Carriera</h2>
                    <p class="diary-date">Giorno ${Game.state.day} — Riflessione personale</p>
                </div>
                <div class="diary-question">
                    <p>${question.question}</p>
                </div>
                <div class="diary-choices">
                    ${question.choices.map((c, i) => `
                        <button class="diary-choice" data-idx="${i}">
                            <span class="diary-choice-text">${c.text}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        overlay.classList.remove('hidden');

        overlay.querySelectorAll('.diary-choice').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                this.applyDiaryChoice(question, idx);
                overlay.classList.add('hidden');
            }, { once: true });
        });
    },

    applyDiaryChoice(question, choiceIdx) {
        const choice = question.choices[choiceIdx];

        // Apply effects
        if (choice.effects.coherence) Game.changeStat('coherence', choice.effects.coherence);
        if (choice.effects.morale) Game.changeStat('morale', choice.effects.morale);
        if (choice.effects.stress) Game.changeStat('stress', choice.effects.stress);
        if (choice.effects.reputazione) Game.changeReputazione(choice.effects.reputazione);
        if (choice.effects.intelligenza) Game.changeAttribute('intelligenza', choice.effects.intelligenza);
        if (choice.effects.carisma) Game.changeAttribute('carisma', choice.effects.carisma);
        if (choice.effects.autenticita) Game.changeAttribute('autenticita', choice.effects.autenticita);
        if (choice.effects.rispettoCriminale) Game.state.mafia.rispettoCriminale += choice.effects.rispettoCriminale;
        if (choice.effects.rischioIndagini) Game.state.mafia.rischioIndagini += choice.effects.rischioIndagini;

        // Save to diary
        Game.state.diaryEntries.push({
            day: Game.state.day,
            question: question.question,
            answer: choice.text,
            tag: choice.tag,
        });

        Game.emit('diary-entry', { day: Game.state.day, tag: choice.tag, answer: choice.text });

        Game.addWorkNotif('📖 Diario', `Hai scritto nel diario: "${choice.text.substring(0, 50)}..."`, `Giorno ${Game.state.day}`);

        const statsBody = document.getElementById('stats-body');
        if (statsBody && statsBody.innerHTML.trim()) this.injectDiarySection();
    },

    // Generate epitaph for game over screen
    generateEpitaph() {
        const entries = Game.state.diaryEntries || [];
        const name = Game.state.character.name || 'L\'ignoto';
        const tags = entries.map(e => e.tag);

        if (entries.length === 0) {
            return `${name} passò come un'ombra. Nessuno ricorda il suo nome.`;
        }

        // Count dominant tags
        const tagCount = {};
        tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; });
        const dominant = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
        const mainTag = dominant[0]?.[0];
        const secondTag = dominant[1]?.[0];

        const epitaphs = {
            ambizioso: `${name} era un animale del potere, temuto e rispettato. Ha scalato la vetta, ma ha dimenticato perché aveva iniziato a scalare.`,
            umano: `${name} cercava l'equilibrio in un mondo che non ne ha. A volte ci riuscì. Spesso no. Ma non smise mai di provarci.`,
            cinico: `${name} smise di sentire molto tempo fa. Il palazzo lo masticò e lo sputò fuori, ma lui non se ne accorse nemmeno.`,
            idealista: `${name} credeva. In un'epoca di cinismo, credeva ancora. E forse, in qualche angolo d'Italia, qualcuno ancora se lo ricorda per questo.`,
            pragmatico: `${name} capì il gioco e lo giocò meglio di tutti. Non era il più amato, ma era il più furbo nella stanza.`,
            disperato: `${name} annegava e cercava una corda. A volte la trovava. A volte era un serpente.`,
            stoico: `${name} sopportò tutto in silenzio. Il palazzo lo rispettava per questo. Nessuno sapeva quanto gli costava quel silenzio.`,
            dubbioso: `${name} si chiedeva sempre "e se...?". Non era debolezza. Era l'unica forma di onestà rimasta.`,
            vendicativo: `${name} non dimenticava mai. Ogni torto era un debito. E i debiti, prima o poi, li riscuoteva.`,
            corrotto: `${name} sapeva il prezzo di ogni cosa e il valore di niente. Ma il suo conto in banca non aveva dubbi.`,
            pentito: `${name} fece cose terribili con le migliori intenzioni. Nelle notti insonni, sperava che qualcuno capisse.`,
            intrappolato: `${name} era una mosca nell'ambra del palazzo. Vedeva tutto, capiva tutto, non poteva fare niente.`,
            narcisista: `${name} si guardò allo specchio del potere e gli piacque quello che vide. Il riflesso, però, non sorrideva.`,
            autentico: `${name} restò fedele a se stesso in un palazzo di maschere. Non tutti lo apprezzarono. Ma tutti lo rispettarono.`,
            nostalgico: `${name} rimpiangeva la vita prima del palazzo. Ma nel palazzo trovò qualcosa che fuori non aveva: uno scopo.`,
            innamorato: `${name} amava in un mondo dove l'amore è debolezza. E quella debolezza fu la sua forza più grande.`,
            paranoico: `${name} non si fidava di nessuno. Alla fine, aveva ragione. Ma la solitudine fu la punizione.`,
            calcolatore: `${name} vedeva le persone come pedine. Le pedine, però, a volte si ribellano.`,
            solitario: `${name} camminava solo nei corridoi del potere. Le ombre gli facevano compagnia.`,
            selettivo: `${name} scelse pochi alleati e li difese con tutto. Quei pochi, alla fine, fecero la differenza.`,
            ingenuo: `${name} credeva nel meglio di ogni persona. A volte veniva tradito. Ma a volte, quella fiducia cambiava le persone.`,
            smarrito: `${name} cercava qualcosa che non trovava. Forse non lo trovò mai. Ma la ricerca, in fondo, era il viaggio.`,
        };

        let epitaph = epitaphs[mainTag] || `${name} visse e lottò nel palazzo del potere.`;

        if (secondTag && epitaphs[secondTag]) {
            const secondSentence = epitaphs[secondTag].split('.').slice(-2).join('.').trim();
            if (secondSentence) {
                epitaph += ` ${secondSentence}`;
            }
        }

        return epitaph;
    },

    // Inject diary entries into stats panel
    injectDiarySection() {
        const statsBody = document.getElementById('stats-body');
        if (!statsBody) return;

        const old = statsBody.querySelector('.diary-section');
        if (old) old.remove();

        const entries = Game.state.diaryEntries || [];
        if (entries.length === 0) return;

        const section = document.createElement('div');
        section.className = 'diary-section';
        section.innerHTML = `
            <h4 class="stats-section-title">📖 Diario della Carriera</h4>
            ${entries.slice(-5).reverse().map(e => `
                <div class="diary-entry-card">
                    <div class="diary-entry-day">Giorno ${e.day}</div>
                    <div class="diary-entry-q">${e.question}</div>
                    <div class="diary-entry-a">"${e.answer}"</div>
                </div>
            `).join('')}
        `;
        statsBody.appendChild(section);
    },
};
