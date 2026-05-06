/* ============================================
   EVENTS — Random Events & Breaking News
   ============================================ */

const Events = {
    init() {
        Game.on('random-event', () => this.triggerRandomEvent());
        document.getElementById('bn-dismiss').addEventListener('click', () => this.dismissNews());
    },

    eventPool: [
        // Breaking News - negative
        {
            type: 'news',
            title: 'Scandalo al Partito!',
            body: 'Un tuo collega è stato beccato a fare il doppio gioco. La stampa ti chiede un commento. Stress +15, Coerenza -10.',
            effects: { stress: 15, reputazione: -10 },
        },
        {
            type: 'news',
            title: 'Fango Mediatico!',
            body: 'Un giornale locale ha pubblicato un articolo diffamatorio su di te. "Chi è davvero questo politico?" Stress +20.',
            effects: { stress: 20 },
        },
        {
            type: 'news',
            title: 'Crisi Economica Locale',
            body: 'La fabbrica principale della zona chiude. I cittadini si rivoltano contro la classe politica. Coerenza -8, Stress +10.',
            effects: { stress: 10, reputazione: -8 },
        },
        {
            type: 'news',
            title: 'Protesta Sotto Casa',
            body: 'Un gruppo di attivisti manifesta davanti al tuo palazzo. I vicini non sono contenti. Stress +12.',
            effects: { stress: 12 },
        },
        {
            type: 'news',
            title: 'Indagine della Corte dei Conti',
            body: 'Si vocifera di un\'indagine sui fondi del partito. Nulla di concreto, ma l\'ansia sale. Stress +18, Coerenza -5.',
            effects: { stress: 18, reputazione: -5 },
        },
        // Breaking News - positive
        {
            type: 'news',
            title: 'Successo della Campagna!',
            body: 'Il tuo ultimo intervento è diventato virale. La gente ti ferma per strada per complimentarsi! Coerenza +10, Stress -5.',
            effects: { stress: -5, reputazione: 10 },
        },
        {
            type: 'news',
            title: 'Donazione Anonima',
            body: 'Un benefattore ha versato €200 alla sezione locale. Fondi +€200.',
            effects: { money: 200 },
        },
        {
            type: 'news',
            title: 'Articolo Positivo!',
            body: 'Il quotidiano locale elogia il tuo impegno sul territorio. Coerenza +8.',
            effects: { reputazione: 8 },
        },
        // Phone notification events
        {
            type: 'phone',
            title: 'Messaggio dal Capo',
            body: 'Il segretario di sezione ti chiede di presentarti domani. Sarà importante.',
            effects: { stress: 8 },
        },
        {
            type: 'phone',
            title: 'Messaggio da un Amico',
            body: 'Marco ti scrive: "Ci dobbiamo vedere, sono giorni che non ti fai sentire..."',
            effects: { stress: 3 },
        },
        {
            type: 'phone',
            title: 'Notifica Banca',
            body: 'Addebito automatico respinto: fondi insufficienti. Controlla il saldo!',
            effects: { stress: 10 },
            condition: () => Game.state.money < 200,
        },
        // Life events
        {
            type: 'phone',
            title: 'Offerta di Lavoro Extra',
            body: 'Un amico ti propone un lavoretto da €150. Ti costerà energia ma aiuterà le finanze.',
            effects: { money: 150, stanchezza: 20 },
        },
        {
            type: 'news',
            title: 'Elezioni Anticipate!',
            body: 'Il governo è caduto. Si vocifera di elezioni anticipate. Il partito ha bisogno di te al 100%. Coerenza +5, Stress +15.',
            effects: { reputazione: 5, stress: 15 },
        },
        // Urgent WhatsApp-style events — now with binary choices
        {
            type: 'urgent',
            title: 'Alleato in Difficoltà',
            body: 'Un alleato ti chiede aiuto urgente: "Ho bisogno del tuo sostegno in consiglio!"',
            from: 'Alleato',
            urgentType: 'ally',
            effects: { stress: 5 },
            condition: () => Game.state.contacts.some(c => c.favorite && c.relation > 50),
            choices: {
                accept: { label: '🤝 Aiuta (+Stress, +Relazione)', effects: { stress: 10, morale: 5 }, relationBoost: 15 },
                refuse: { label: '🚫 Ignora (-Relazione, -Stress)', effects: { stress: -3 }, relationLoss: 10, reputazioneLoss: 3 },
            },
        },
        {
            type: 'urgent',
            title: 'Attacco Politico',
            body: 'Un avversario ha lanciato accuse contro di te sui social. Devi rispondere!',
            from: 'Avversario',
            urgentType: 'enemy',
            effects: {},
            choices: {
                accept: { label: '⚔️ Rispondi pubblicamente (+Stress, +Rep)', effects: { stress: 12, reputazione: 5 } },
                refuse: { label: '🙈 Ignora (-Reputazione)', effects: { reputazione: -5 } },
            },
        },
        {
            type: 'urgent',
            title: 'Il Capo vuole spiegazioni',
            body: 'Il tuo capo ha scoperto che usi l\'orario di lavoro per la politica. Convocazione urgente.',
            from: 'Capo Ufficio',
            urgentType: 'boss',
            effects: {},
            condition: () => Game.state.career.level > 0,
            choices: {
                accept: { label: '😰 Scusati e lavora duro (+Stanchezza, salva carriera)', effects: { stress: 10, stanchezza: 15 } },
                refuse: { label: '😤 Difendi la politica (-Carriera)', effects: { stress: 5 }, careerHit: 10 },
            },
        },
        {
            type: 'urgent',
            title: 'Richiesta dal Partito',
            body: 'Il segretario regionale vuole parlarti. Sembra una proposta importante.',
            from: 'Segretario',
            urgentType: 'ally',
            effects: {},
            choices: {
                accept: { label: '🏛️ Vai subito (+Morale, +Rep, +Stanchezza)', effects: { morale: 10, reputazione: 5, stanchezza: 10 } },
                refuse: { label: '📵 Rimanda (-Morale)', effects: { morale: -5 } },
            },
        },
        // ---- MICRO-EVENTI CASUALI (Vita Quotidiana) ----
        // 7 Positivi
        { type: 'phone', title: '💶 Banconota per terra!', body: 'Hai trovato €20 per strada. Giornata fortunata!', effects: { money: 20 } },
        { type: 'phone', title: '👴 Gentilezza ripagata', body: 'Un anziano che hai aiutato settimane fa ti ringrazia pubblicamente al mercato. +5 Rep.', effects: { reputazione: 5 } },
        { type: 'phone', title: '☕ Caffè offerto!', body: 'Il barista ti offre il caffè: "Oggi offre la casa!" +3 Morale.', effects: { morale: 3 } },
        { type: 'news', title: '🏅 Premio Civico di Quartiere', body: 'Un comitato cittadino ti premia per l\'impegno sociale. Reputazione +6, Morale +4.', effects: { reputazione: 6, morale: 4 } },
        { type: 'phone', title: '📱 Like a valanga', body: 'Un tuo vecchio post è diventato virale. +8 Rep., -3 Stress.', effects: { reputazione: 8, stress: -3 } },
        { type: 'phone', title: '🅿️ Parcheggio Gratis!', body: 'Trovi un parcheggio perfetto proprio sotto l\'ufficio. -5 Stress.', effects: { stress: -5 } },
        { type: 'news', title: '🌤️ Intervista Andata Benissimo', body: 'Un\'intervista locale gira bene: appari competente e vicino ai cittadini. Reputazione nazionale +4.', effects: { reputazioneNazionale: 4, reputazione: 3 } },
        { type: 'phone', title: '🛒 Sconto al Super', body: 'Alla cassa ti applicano uno sconto del 30%. Risparmi €15!', effects: { money: 15 } },
        { type: 'phone', title: '🤳 Selfie con un Bambino', body: 'Un bambino ti chiede un selfie: "Sei quello della TV!" +5 Morale, +3 Rep.', effects: { morale: 5, reputazione: 3 } },
        // 7 Negativi
        { type: 'phone', title: '🚔 Multa per divieto di sosta', body: 'Hai parcheggiato male: €80 di multa! -€80, +5 Stress.', effects: { money: -80, stress: 5 }, condition: () => Game.state.money >= 80 },
        { type: 'phone', title: '🏤 Coda alle Poste', body: '45 minuti di coda alle poste per un francobollo. +8 Stress, +5 Stanchezza.', effects: { stress: 8, stanchezza: 5 } },
        { type: 'phone', title: '🔑 Chiavi nel tombino', body: 'Le chiavi ti cadono nel tombino. 20 minuti a recuperarle. +10 Stress.', effects: { stress: 10 } },
        { type: 'phone', title: '🚗 Vicino sul passo carraio', body: 'Il vicino ti blocca il passo carraio. Discussione accesa. +8 Stress, -3 Rep.', effects: { stress: 8, reputazione: -3 } },
        { type: 'phone', title: '☕ Caffè sulla camicia', body: 'Ti rovesci il caffè sulla camicia bianca. Giornata storta. +5 Stress, -5 Morale.', effects: { stress: 5, morale: -5 } },
        { type: 'phone', title: '📶 Wi-Fi Rotto', body: 'Il Wi-Fi di casa non funziona. Niente lavoro da remoto oggi. +10 Stanchezza.', effects: { stanchezza: 10 } },
        { type: 'news', title: '🧾 Dossier Incompleto', body: 'Un errore amministrativo finisce sui giornali locali. Reputazione -6, Stress +8.', effects: { reputazione: -6, stress: 8 } },
        { type: 'phone', title: '🚲 Bicicletta Rubata', body: 'Ti hanno rubato la bicicletta. Addio, vecchia amica. +10 Stress, -5 Morale.', effects: { stress: 10, morale: -5 } },
        // 4 urgenti addizionali
        {
            type: 'urgent',
            title: 'Scandalo Mediatico',
            body: 'Un video tagliato ad arte ti dipinge in cattiva luce. La pressione mediatica è altissima.',
            from: 'Redazione Nazionale',
            urgentType: 'enemy',
            choices: {
                accept: { label: '🎙️ Vai subito in TV', effects: { reputazioneNazionale: -4, stress: 12 } },
                refuse: { label: '🕶️ Nessun commento', effects: { reputazioneNazionale: -8, reputazione: -5, politicalBlockedTurns: 2, scandal: true } },
            },
        },
        {
            type: 'urgent',
            title: 'Comizio Notturno Improvvisato',
            body: 'I militanti chiedono un comizio alle 23:00 in un quartiere caldo.',
            from: 'Coordinatore Locale',
            urgentType: 'ally',
            choices: {
                accept: { label: '📢 Vai al comizio', effects: { reputazione: 9, stress: 6, stanchezza: 12 } },
                refuse: { label: '🛌 Resti a casa', effects: { reputazione: -4, stress: -2 } },
            },
        },
        {
            type: 'urgent',
            title: 'Ricatto su Testimone',
            body: 'Un testimone chiave può ritrattare in cambio di denaro. Scelta sporca ma efficace.',
            from: 'Intermediario',
            urgentType: 'mafia',
            choices: {
                accept: { label: '💸 Compra il silenzio (€300)', effects: { money: -300, rischioIndagini: -8, coherence: -10 } },
                refuse: { label: '⚖️ Rifiuta', effects: { reputazione: 4, rischioIndagini: 4 } },
            },
        },
        {
            type: 'urgent',
            title: 'Nomine di Maggioranza',
            body: 'Dopo la vittoria, la coalizione pretende una scelta rapida sulle nomine.',
            from: 'Segreteria di Governo',
            urgentType: 'boss',
            choices: {
                accept: { label: '🧩 Accetta compromesso', effects: { reputazioneNazionale: 5, coherence: -4, stress: 5 } },
                refuse: { label: '🛡️ Difendi la linea', effects: { reputazioneNazionale: -3, coherence: 4, stress: 7 } },
            },
        },
    ],

    // ========== EVENTI NAZIONALI (specifici per nazione) ==========
    NATION_EVENTS: {
        italy: [
            {
                type: 'news',
                title: 'Crisi di Governo',
                body: 'Il governo è caduto. Il Presidente della Repubblica avvia le consultazioni. Stress +15, reputazione -5.',
                effects: { stress: 15, reputazione: -5 },
            },
            {
                type: 'urgent',
                title: 'Mafia al Voto',
                body: 'Totò vuole incontrarti per discutere delle candidature. Accetti?',
                from: 'Totò',
                urgentType: 'mafia',
                choices: {
                    accept: { label: '✅ Vado all\'incontro', effects: { rispettoCriminale: 10, rischioIndagini: 5 } },
                    refuse: { label: '❌ Rifiuto', effects: { rispettoCriminale: -5 } },
                },
            },
            {
                type: 'news',
                title: 'Terremoto in Centro Italia',
                body: 'La tua regione è stata colpita. Partecipa alla raccolta fondi. Reputazione +8, stanchezza +15.',
                effects: { reputazione: 8, stanchezza: 15, morale: 5 },
            },
        ],
        france: [
            {
                type: 'news',
                title: 'Manifestation des Gilets Jaunes',
                body: 'Il y a des émeutes à Paris. Votre position est scrutée. Stress +12, réputation -3.',
                effects: { stress: 12, reputazione: -3 },
            },
            {
                type: 'urgent',
                title: 'Grève SNCF',
                body: 'Les syndicats appellent à la grève. Soutenez-vous les cheminots?',
                from: 'CGT',
                urgentType: 'ally',
                choices: {
                    accept: { label: '✅ Je soutiens', effects: { reputazione: 8, stress: 10 } },
                    refuse: { label: '❌ Je condamne', effects: { reputazione: -5, stress: 5 } },
                },
            },
            {
                type: 'phone',
                title: 'Dîner avec un Lobbyiste',
                body: 'Un lobbyiste vous invite à dîner à l\'Assemblée. +€200 mais -10 cohérence.',
                effects: { money: 200, coherence: -10 },
            },
        ],
        germany: [
            {
                type: 'news',
                title: 'Bundestagswahlkampf',
                body: 'Die Wahlkampfphase beginnt. Ihre Partei benötigt Ihre volle Unterstützung.',
                effects: { reputazione: 5, stress: 15, stanchezza: 10 },
            },
            {
                type: 'urgent',
                title: 'Energiekrise',
                body: 'Die Energiepreise explodieren. Die Bürger fordern staatliche Hilfen.',
                from: 'Wirtschaftsministerium',
                urgentType: 'boss',
                choices: {
                    accept: { label: '✅ Subventionen vorschlagen', effects: { reputazione: 12, stress: 8 } },
                    refuse: { label: '❌ Markt regeln lassen', effects: { reputazione: -8, stress: 5 } },
                },
            },
            {
                type: 'news',
                title: 'Länderkonferenz',
                body: 'Die Ministerpräsidenten tagen in Berlin. Ihre Teilnahme wird erwartet.',
                effects: { reputazione: 10, reputazioneNazionale: 5, stanchezza: 12 },
            },
        ],
        uk: [
            {
                type: 'news',
                title: 'Westminster Scandal',
                body: 'A minister resigns after a scandal. The press links you to the affair. Stress +20, reputation -10.',
                effects: { stress: 20, reputazione: -10 },
            },
            {
                type: 'urgent',
                title: 'Brexit Fallout',
                body: 'Trade deals are collapsing. Your constituency is angry.',
                from: 'Constituent',
                urgentType: 'enemy',
                choices: {
                    accept: { label: '✅ Call for emergency debate', effects: { reputazione: 8, stress: 12 } },
                    refuse: { label: '❌ Stay silent', effects: { reputazione: -12, stress: 5 } },
                },
            },
            {
                type: 'phone',
                title: 'Pub Talk',
                body: 'You meet a former MP in a pub. He offers you a backroom deal: £500 for a vote.',
                effects: { money: 500, coherence: -15, stress: 10 },
            },
        ],
    },

    getNationEvents() {
        const nationId = Game.state.nation?.id || 'italy';
        return this.NATION_EVENTS[nationId] || [];
    },

    // ========== EVENTI CITTADINI (specifici per citta/comune) ==========
    CITY_EVENTS: {
        roma: [
            { type: 'news', title: 'Settimana Civica', body: 'Roma lancia la Settimana Civica. Ti esponi in prima linea. Reputazione +8, stress +4.', effects: { reputazione: 8, stress: 4 } },
            { type: 'urgent', title: 'Emergenza Mobilita', body: 'Traffico in tilt nei quartieri centrali. Intervieni subito?', from: 'Comitato Quartiere', urgentType: 'ally', choices: { accept: { label: '✅ Coordina la risposta', effects: { reputazione: 10, stanchezza: 8 } }, refuse: { label: '❌ Rimanda al Comune', effects: { reputazione: -6, stress: 4 } } } },
        ],
        milano: [
            { type: 'news', title: 'Forum Innovazione Urbana', body: 'Milano ospita un forum su trasporti e imprese. Networking +12, stress +3.', effects: { reputazione: 5, stress: 3 } },
            { type: 'urgent', title: 'Sciopero Metro', body: 'Servizi ridotti e cittadini furiosi. Prendi posizione?', from: 'Sindacato Trasporti', urgentType: 'boss', choices: { accept: { label: '✅ Media e comunica', effects: { reputazione: 8, stress: 7 } }, refuse: { label: '❌ Evita il confronto', effects: { reputazione: -5, stress: 2 } } } },
        ],
        napoli: [
            { type: 'news', title: 'Festival dei Quartieri', body: 'Una rete civica locale rilancia il territorio. Morale +8, reputazione +6.', effects: { morale: 8, reputazione: 6 } },
            { type: 'urgent', title: 'Rete Opaca Locale', body: 'Un gruppo informale vuole appoggiarti in cambio di favori. Accetti?', from: 'Intermediario', urgentType: 'mafia', choices: { accept: { label: '✅ Accetta il sostegno', effects: { money: 180, coherence: -8, stress: 5 } }, refuse: { label: '❌ Rifiuta pubblicamente', effects: { reputazione: 7, stress: 6 } } } },
        ],
        paris: [
            { type: 'news', title: 'Grande Manifestazione Civique', body: 'Le piazze si riempiono e la tua voce pesa. Reputazione +7, stress +8.', effects: { reputazione: 7, stress: 8 } },
            { type: 'urgent', title: 'Vertice Metropolitano', body: 'Sei invitato a un tavolo su sicurezza e servizi. Vai?', from: 'Prefecture Locale', urgentType: 'ally', choices: { accept: { label: '✅ Partecipa', effects: { reputazioneNazionale: 6, stanchezza: 7 } }, refuse: { label: '❌ Delega', effects: { reputazione: -4, stress: 3 } } } },
        ],
        marseille: [
            { type: 'news', title: 'Porto in Espansione', body: 'Nuovi investimenti nel porto cittadino. Money +120, stress +4.', effects: { money: 120, stress: 4 } },
            { type: 'urgent', title: 'Pressione nei Docks', body: 'Un network criminale locale ti propone protezione politica.', from: 'Rete Portuale', urgentType: 'mafia', choices: { accept: { label: '✅ Tratta in privato', effects: { money: 200, coherence: -10, stress: 6 } }, refuse: { label: '❌ Denuncia la pressione', effects: { reputazione: 8, stress: 7 } } } },
        ],
        lyon: [
            { type: 'news', title: 'Settimana delle Cooperative', body: 'Le cooperative cittadine ti sostengono. Reputazione +6, morale +5.', effects: { reputazione: 6, morale: 5 } },
            { type: 'urgent', title: 'Crisi Rifiuti Urbani', body: 'Quartieri in protesta per la gestione rifiuti. Intervieni?', from: 'Conseil Local', urgentType: 'boss', choices: { accept: { label: '✅ Piano rapido', effects: { reputazione: 7, stress: 6 } }, refuse: { label: '❌ Attendi dati', effects: { reputazione: -5, stress: 2 } } } },
        ],
        berlin: [
            { type: 'news', title: 'Notte della Cultura Civica', body: 'Eventi diffusi in citta: morale +7, reputazione +4.', effects: { morale: 7, reputazione: 4 } },
            { type: 'urgent', title: 'Hack Leak Comunale', body: 'Documenti interni trapelano online. Come reagisci?', from: 'Stadtkanzlei', urgentType: 'enemy', choices: { accept: { label: '✅ Conferenza trasparenza', effects: { reputazione: 8, stress: 9 } }, refuse: { label: '❌ Nessun commento', effects: { reputazione: -7, stress: 3 } } } },
        ],
        munich: [
            { type: 'news', title: 'Summit Industria Verde', body: 'Imprese e ricerca convergono in citta. Intelligenza +4, money +90.', effects: { intelligenza: 4, money: 90 } },
            { type: 'urgent', title: 'Vertenza Occupazionale', body: 'Una grande azienda minaccia tagli. Ti esponi?', from: 'Consiglio Lavoro', urgentType: 'ally', choices: { accept: { label: '✅ Mediazione pubblica', effects: { reputazione: 9, stress: 8 } }, refuse: { label: '❌ Mantieni distanza', effects: { reputazione: -6, stress: 2 } } } },
        ],
        london: [
            { type: 'news', title: 'Civic Transparency Week', body: 'A Londra cresce l attenzione su etica e appalti. Reputazione +6.', effects: { reputazione: 6, stress: 4 } },
            { type: 'urgent', title: 'Leak a Westminster', body: 'Un dossier confidenziale sta circolando. Intervieni?', from: 'Parliament Desk', urgentType: 'enemy', choices: { accept: { label: '✅ Prendi il controllo', effects: { reputazioneNazionale: 7, stress: 10 } }, refuse: { label: '❌ Aspetta e osserva', effects: { reputazione: -5, stress: 3 } } } },
        ],
        manchester: [
            { type: 'news', title: 'Assemblea dei Distretti', body: 'Buona partecipazione civica nei quartieri. Morale +6, reputazione +5.', effects: { morale: 6, reputazione: 5 } },
            { type: 'urgent', title: 'Trasporto Notturno in Crisi', body: 'Tagli alle corse serali creano tensione sociale.', from: 'Civic Union', urgentType: 'boss', choices: { accept: { label: '✅ Fondo emergenza', effects: { reputazione: 8, money: -70 } }, refuse: { label: '❌ Nessun fondo', effects: { reputazione: -6, stress: 5 } } } },
        ],
        edinburgh: [
            { type: 'news', title: 'Forum Istituzionale Locale', body: 'Dibattito acceso sulle autonomie cittadine. Coerenza +5, reputazione +4.', effects: { coherence: 5, reputazione: 4 } },
            { type: 'urgent', title: 'Sciopero Servizi Pubblici', body: 'Scuole e trasporti rallentano. Serve una scelta rapida.', from: 'Civic Council', urgentType: 'ally', choices: { accept: { label: '✅ Tavolo immediato', effects: { reputazione: 7, stress: 7 } }, refuse: { label: '❌ Nessuna mediazione', effects: { reputazione: -5, stress: 3 } } } },
        ],
    },

    triggerRandomEvent() {
        // Filtra eventi globali + eventi della nazione corrente + eventi della citta corrente
        const nationId = Game.state.nation?.id || 'italy';
        const cityId = Game.state.city?.id;
        const nationEvents = this.getNationEvents();
        const cityEvents = cityId ? (this.CITY_EVENTS[cityId] || []) : [];
        const allEvents = [...this.eventPool, ...nationEvents, ...cityEvents];
        const available = allEvents.filter(e => !e.condition || e.condition());
        if (available.length === 0) return;

        const event = available[Math.floor(Math.random() * available.length)];

        // Apply base effects (urgent with choices defer effects to choice)
        if (!event.choices) {
            let eff = Object.assign({}, event.effects);
            // Intel shield: halve all negative effects
            if (Game.state._intelShield) {
                if (eff.stress > 0) eff.stress = Math.round(eff.stress / 2);
                if (eff.stanchezza > 0) eff.stanchezza = Math.round(eff.stanchezza / 2);
                if (eff.morale < 0) eff.morale = Math.round(eff.morale / 2);
                if (eff.salute < 0) eff.salute = Math.round(eff.salute / 2);
                if (eff.reputazione < 0) eff.reputazione = Math.round(eff.reputazione / 2);
                if (eff.money < 0) eff.money = Math.round(eff.money / 2);
                Game.state._intelShield = false;
            }
            this.applyGenericEffects(eff);
        }

        if (event.type === 'news') {
            this.showBreakingNews(event.title, event.body);
        } else if (event.type === 'urgent') {
            if (event.choices) {
                // Binary choice urgent — show modal
                this.showUrgentChoice(event);
            } else {
                Game.addUrgentMessage(event.from || 'Sconosciuto', event.body, event.urgentType || 'info');
                Game.addWorkNotif(`📩 ${event.title}`, event.body, `Giorno ${Game.state.day}`);
            }
        } else {
            Phone.showPushNotif(`📱 ${event.title}`, event.body);
            Game.addWorkNotif(event.title, event.body, `Giorno ${Game.state.day}`);
        }
    },

    triggerMentorEvent(payload) {
        const mentorState = Game.state.flags && Game.state.flags.mentor;
        if (!mentorState || !mentorState.active) return;
        if (!payload) return;

        const eventTag = payload.eventTag || payload.tag;
        const selectedMentorId = payload.selectedMentorId || mentorState.selectedId || mentorState.id;
        const mentorData = (typeof Character !== 'undefined' && Character.getMentorData)
            ? Character.getMentorData(selectedMentorId)
            : null;
        if (!mentorData) return;
        if ((payload.mentorId || mentorData.archetype) !== mentorState.id) return;

        const ev = (mentorData.events || []).find(e => e.tag === eventTag);
        if (!ev) return;
        const titleKey = `mentor.${ev.tag}.title`;
        const bodyKey = `mentor.${ev.tag}.body`;
        const translatedTitle = (typeof Localization !== 'undefined' && Localization.translate)
            ? Localization.translate(titleKey)
            : ev.title;
        const translatedBody = (typeof Localization !== 'undefined' && Localization.translate)
            ? Localization.translate(bodyKey)
            : ev.body;
        this.showMentorChoice(mentorData, {
            ...ev,
            title: translatedTitle === titleKey ? ev.title : translatedTitle,
            body: translatedBody === bodyKey ? ev.body : translatedBody,
        });
    },

    showMentorChoice(mentorData, event) {
        let overlay = document.getElementById('urgent-choice-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'urgent-choice-overlay';
            overlay.className = 'urgent-choice-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="urgent-choice-modal">
                <div class="urgent-choice-header">📞 ${Game.esc(event.title)}</div>
                <div class="urgent-choice-from">Da: ${Game.esc(mentorData.icon + ' ' + mentorData.shortName)}</div>
                <div class="urgent-choice-body">${Game.esc(event.body)}</div>
                <div class="urgent-choice-buttons">
                    ${event.choices.map(c => `<button class="urgent-btn urgent-btn-accept" data-mentor="${mentorData.id}" data-tag="${event.tag}" data-choice="${c.id}">${Game.esc(c.label)}</button>`).join('')}
                </div>
            </div>
        `;
        overlay.classList.add('visible');

        overlay.querySelectorAll('.urgent-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.resolveMentorChoice(btn.dataset.mentor, btn.dataset.tag, btn.dataset.choice);
                overlay.classList.remove('visible');
            }, { once: true });
        });
    },

    applyMentorChoiceEffects(effects, mentorState) {
        if (!effects) return;
        if (effects.stress) Game.changeStat('stress', effects.stress);
        if (effects.stanchezza) Game.changeStat('stanchezza', effects.stanchezza);
        if (effects.morale) Game.changeStat('morale', effects.morale);
        if (effects.salute) Game.changeStat('salute', effects.salute);
        if (effects.coherence) Game.changeStat('coherence', effects.coherence);
        if (effects.reputazione) Game.changeReputazione(effects.reputazione);
        if (effects.reputazioneNazionale) Game.changeReputazione(effects.reputazioneNazionale, 'nazionale');
        if (effects.money) Game.changeMoney(effects.money);
        if (effects.intelligenza) Game.changeAttribute('intelligenza', effects.intelligenza);
        if (effects.carisma) Game.changeAttribute('carisma', effects.carisma);
        if (effects.muscoli) Game.changeAttribute('muscoli', effects.muscoli);
        if (effects.autenticita) Game.changeAttribute('autenticita', effects.autenticita);
        if (effects.followers) {
            if (!Game.state.social) Game.state.social = {};
            Game.state.social.followers = (Game.state.social.followers || 0) + effects.followers;
        }
        if (effects.relazioneMentore) {
            mentorState.relationship = Math.max(0, Math.min(100, mentorState.relationship + effects.relazioneMentore));
        }
        if (effects.relationContacts) {
            (Game.state.contacts || []).forEach(c => {
                c.relation = Math.max(0, Math.min(100, (c.relation || 0) + effects.relationContacts));
            });
        }
        if (effects.careerProgress) {
            Game.state.career.promotionProgress = Math.min(100, (Game.state.career.promotionProgress || 0) + effects.careerProgress);
        }
    },

    updateMentorArc(mentorState, mentorData, ev, chosen) {
        mentorState.arc = mentorState.arc || {
            loyalty: 0,
            activism: 0,
            institution: 0,
            trusted: false,
            rival: false,
        };

        const relationshipDelta = (chosen.effects && chosen.effects.relazioneMentore) || 0;
        mentorState.arc.loyalty += relationshipDelta;

        const activismChoices = ['parla', 'denuncia', 'autonomo', 'ascolta', 'falla'];
        const institutionChoices = ['silenzio', 'firma', 'copri', 'aggancio', 'perfetto'];
        if (activismChoices.includes(chosen.id)) mentorState.arc.activism += 1;
        if (institutionChoices.includes(chosen.id)) mentorState.arc.institution += 1;

        if (!mentorState.arc.trusted && mentorState.arc.loyalty >= 18) {
            mentorState.arc.trusted = true;
            mentorState.trustedAlly = true;
            Game.addWorkNotif('🤝 Mentore Fidato', `${mentorData.name} ti considera un alleato strategico.`, `Giorno ${Game.state.day}`);
        }

        if (!mentorState.arc.rival && mentorState.arc.loyalty <= -12) {
            mentorState.arc.rival = true;
            mentorState.rival = true;
            mentorState.active = false;
            mentorState.specialUnlocked = false;
            Game.addUrgentMessage('Mentore', `${mentorData.name} passa nel fronte avverso: da oggi è un rivale.`, 'enemy');
        }
    },

    injectMentorMission(mentorState, mentorData, ev, chosen) {
        if ((chosen.effects && chosen.effects.relazioneMentore) < 0) return;
        if (!Game.state.taskPools) Game.state.taskPools = { work: [], political: [] };
        if (!Array.isArray(Game.state.taskPools.political)) Game.state.taskPools.political = [];

        const missionId = `mentor_${mentorState.id}_${ev.tag}_${Game.state.day}`;
        if (Game.state.taskPools.political.some(t => t.id === missionId)) return;

        const missionMap = {
            marta: {
                title: 'Missione Mentore: Raccogli Firme Civiche',
                desc: 'Porta in consiglio la campagna civica del tuo mentore.',
                reward: { reputazione: 8, coherence: 5, stress: 4 },
            },
            roberto: {
                title: 'Missione Mentore: Tavolo Istituzionale',
                desc: 'Chiudi una mediazione e consolida la tua rete.',
                reward: { reputazione: 6, money: 40, carisma: 2 },
            },
            beppe: {
                title: 'Missione Mentore: Comizio Lampo',
                desc: 'Sfrutta la piazza per una spinta di consenso rapida.',
                reward: { reputazione: 10, stress: 7, coherence: -3 },
            },
            elena: {
                title: 'Missione Mentore: Dossier Tecnico',
                desc: 'Prepara un documento impeccabile per la commissione.',
                reward: { reputazioneNazionale: 4, intelligenza: 2, stress: 3 },
            },
            massimo: {
                title: 'Missione Mentore: Presidio di Sicurezza',
                desc: 'Coordina una presenza territoriale ad alta visibilità.',
                reward: { reputazione: 7, muscoli: 2, stress: 5 },
            },
            anziano: {
                title: 'Missione Mentore: Forum Civico',
                desc: 'Conduci un confronto pubblico senza perdere coerenza.',
                reward: { reputazione: 6, coherence: 6, carisma: 1 },
            },
        };

        const m = missionMap[mentorState.id] || {
            title: 'Missione Mentore',
            desc: 'Completa un obiettivo speciale suggerito dal mentore.',
            reward: { reputazione: 5, coherence: 3 },
        };

        Game.state.taskPools.political.push({
            id: missionId,
            title: m.title,
            desc: m.desc,
            reward: m.reward,
            apCost: 1,
            mentorMission: true,
            done: false,
        });

        Game.addWorkNotif('🧭 Missione Mentore', `${m.title} disponibile nelle Mansioni politiche.`, `Giorno ${Game.state.day}`);
    },

    resolveMentorChoice(mentorId, tag, choice) {
        const mentorState = Game.state.flags && Game.state.flags.mentor;
        if (!mentorState || !mentorState.active) return;

        const mentorData = (typeof Character !== 'undefined' && Character.getMentorData)
            ? Character.getMentorData(mentorId)
            : null;
        if (!mentorData) return;
        const ev = (mentorData.events || []).find(e => e.tag === tag);
        if (!ev) return;
        const chosen = (ev.choices || []).find(c => c.id === choice);
        if (!chosen) return;

        this.applyMentorChoiceEffects(chosen.effects, mentorState);

        mentorState.eventsDone = mentorState.eventsDone || {};
        mentorState.eventsDone[tag] = choice;
        mentorState.step = (mentorState.step || 0) + 1;

        this.updateMentorArc(mentorState, mentorData, ev, chosen);
        this.injectMentorMission(mentorState, mentorData, ev, chosen);

        if (chosen.effects && chosen.effects.unlockAction) {
            mentorState.unlockedActionIds = mentorState.unlockedActionIds || [];
            if (!mentorState.unlockedActionIds.includes(chosen.effects.unlockAction)) {
                mentorState.unlockedActionIds.push(chosen.effects.unlockAction);
            }
            mentorState.specialUnlocked = true;
            Game.addWorkNotif('🧭 Agenda Mentore', 'Nuova azione speciale sbloccata.', `Giorno ${Game.state.day}`);
        }
        if ((chosen.effects && chosen.effects.unlockAllSpecial) || ev.unlockSpecial || mentorState.step >= 2) {
            if (!mentorState.specialUnlocked) {
                mentorState.specialUnlocked = true;
                Game.addWorkNotif('🧭 Agenda Mentore', 'Hai sbloccato le azioni speciali del mentore.', `Giorno ${Game.state.day}`);
            }
        }

        if (mentorState.relationship < 20) {
            mentorState.active = false;
            mentorState.specialUnlocked = false;
            Game.addUrgentMessage('Mentore', `${mentorData.name} ti ha abbandonato.`, 'enemy');
        }

        Game.addWorkNotif('📞 Evento Mentore', `${ev.title} • scelta: ${chosen.label}`, `Giorno ${Game.state.day}`);
        if (Game.addDiaryEntry) {
            Game.addDiaryEntry(`Mentore: ${ev.title} (${chosen.label})`, mentorState.icon || '📞');
        }
    },

    showUrgentChoice(event) {
        // Guard: event must have choices with accept/refuse
        if (!event.choices || !event.choices.accept || !event.choices.refuse) {
            Game.addUrgentMessage(event.from || 'Sconosciuto', event.body, event.urgentType || 'info');
            return;
        }
        // Create choice overlay
        let overlay = document.getElementById('urgent-choice-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'urgent-choice-overlay';
            overlay.className = 'urgent-choice-overlay';
            document.body.appendChild(overlay);
        }
        overlay.innerHTML = `
            <div class="urgent-choice-modal">
                <div class="urgent-choice-header">📩 ${Game.esc(event.title)}</div>
                <div class="urgent-choice-from">Da: ${Game.esc(event.from)}</div>
                <div class="urgent-choice-body">${Game.esc(event.body)}</div>
                <div class="urgent-choice-buttons">
                    <button class="urgent-btn urgent-btn-accept" data-choice="accept">${event.choices.accept.label}</button>
                    <button class="urgent-btn urgent-btn-refuse" data-choice="refuse">${event.choices.refuse.label}</button>
                </div>
            </div>
        `;
        overlay.classList.add('visible');

        overlay.querySelectorAll('.urgent-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const choiceKey = btn.dataset.choice;
                const choice = event.choices[choiceKey];
                // Apply chosen effects
                if (choice.effects) {
                    let ce = Object.assign({}, choice.effects);
                    if (Game.state._intelShield) {
                        if (ce.stress > 0) ce.stress = Math.round(ce.stress / 2);
                        if (ce.stanchezza > 0) ce.stanchezza = Math.round(ce.stanchezza / 2);
                        if (ce.morale < 0) ce.morale = Math.round(ce.morale / 2);
                        if (ce.salute < 0) ce.salute = Math.round(ce.salute / 2);
                        if (ce.reputazione < 0) ce.reputazione = Math.round(ce.reputazione / 2);
                        if (ce.money < 0) ce.money = Math.round(ce.money / 2);
                        Game.state._intelShield = false;
                    }
                    this.applyGenericEffects(ce);

                    // Agent-bound urgent choices can affect relationship/trust directly.
                    if (event.agentId && typeof Agents !== 'undefined') {
                        const agent = (Game.state.agents || []).find(a => a.id === event.agentId);
                        if (agent) {
                            if (typeof ce.relationship === 'number') {
                                agent.relationship = Math.max(0, Math.min(100, (agent.relationship || 0) + ce.relationship));
                            }
                            if (typeof ce.trust === 'number') {
                                agent.trust = Math.max(0, Math.min(100, (agent.trust || 0) + ce.trust));
                            }
                        }
                    }
                }
                // Special effects
                if (choice.relationBoost) {
                    Game.state.contacts.forEach(c => { if (c.favorite) c.relation = Math.min(100, c.relation + choice.relationBoost); });
                }
                if (choice.relationLoss) {
                    Game.state.contacts.forEach(c => { if (c.favorite) c.relation = Math.max(0, c.relation - choice.relationLoss); });
                }
                if (choice.reputazioneLoss) {
                    Game.changeReputazione(-choice.reputazioneLoss);
                }
                if (choice.careerHit) {
                    Game.state.career.promotionProgress = Math.max(0, Game.state.career.promotionProgress - choice.careerHit);
                }
                if (event.agentId && typeof Agents !== 'undefined' && Agents.recordAgentMemory) {
                    const memoryImpact = choiceKey === 'accept' ? 10 : -10;
                    Agents.recordAgentMemory(event.agentId, `urgent-${event.urgentType || 'agent'}-${choiceKey}`, memoryImpact);
                    if (Agents.syncAgentsToContacts) Agents.syncAgentsToContacts();
                }
                // Log
                const choiceLabel = choiceKey === 'accept' ? 'Accettato' : 'Rifiutato';
                Game.addWorkNotif(`📩 ${event.title}`, `${choiceLabel}: ${event.body}`, `Giorno ${Game.state.day}`);
                Game.addUrgentMessage(event.from, event.body + ` [${choiceLabel}]`, event.urgentType || 'info');
                overlay.classList.remove('visible');
            }, { once: true });
        });
    },

    triggerAgentEvent() {
        const eligible = (Game.state.agents || []).filter(a => a.relationship > 50 && !a.isMentor);
        if (eligible.length === 0) return;

        const agent = eligible[Math.floor(Math.random() * eligible.length)];
        const event = {
            type: 'urgent',
            title: `${agent.name} ha bisogno di te`,
            body: `${agent.name} ti chiede un favore: "Puoi sostenere la mia mozione in consiglio?"`,
            from: agent.name,
            urgentType: 'ally',
            agentId: agent.id,
            choices: {
                accept: {
                    label: '✅ Sostieni',
                    effects: { relationship: 10, trust: 5, stress: 5 },
                },
                refuse: {
                    label: '❌ Rifiuta',
                    effects: { relationship: -10, trust: -5 },
                },
            },
        };

        this.showUrgentChoice(event);
    },

    showBreakingNews(title, body) {
        const el = document.getElementById('breaking-news');
        document.getElementById('bn-body').textContent = body;
        el.querySelector('.bn-header').textContent = `⚡ ${title}`;
        el.classList.remove('hidden');
    },

    applyGenericEffects(effects) {
        if (!effects) return;
        if (effects.stress) Game.changeStat('stress', effects.stress);
        if (effects.stanchezza) Game.changeStat('stanchezza', effects.stanchezza);
        if (effects.morale) Game.changeStat('morale', effects.morale);
        if (effects.salute) Game.changeStat('salute', effects.salute);
        if (effects.coherence) Game.changeStat('coherence', effects.coherence);
        if (effects.reputazione) Game.changeReputazione(effects.reputazione);
        if (effects.reputazioneNazionale) Game.changeReputazione(effects.reputazioneNazionale, 'nazionale');
        if (effects.repNazionale) Game.changeReputazione(effects.repNazionale, 'nazionale');
        if (effects.money) Game.changeMoney(effects.money);
        if (effects.intelligenza) Game.changeAttribute('intelligenza', effects.intelligenza);
        if (effects.carisma) Game.changeAttribute('carisma', effects.carisma);
        if (effects.muscoli) Game.changeAttribute('muscoli', effects.muscoli);
        if (effects.autenticita) Game.changeAttribute('autenticita', effects.autenticita);
        if (effects.followers) {
            if (!Game.state.social) Game.state.social = {};
            Game.state.social.followers = (Game.state.social.followers || 0) + effects.followers;
        }
        if (effects.politicalBlockedTurns) {
            Game.state.flags.politicalBlockedTurns = Math.max(
                Game.state.flags.politicalBlockedTurns || 0,
                Math.max(0, effects.politicalBlockedTurns)
            );
        }
        if (typeof effects.rischioIndagini === 'number') {
            if (!Game.state.mafia) Game.state.mafia = { rischioIndagini: 0, rispettoCriminale: 0 };
            Game.state.mafia.rischioIndagini = Math.max(0, Math.min(100, (Game.state.mafia.rischioIndagini || 0) + effects.rischioIndagini));
        }
        if (typeof effects.rispettoCriminale === 'number') {
            if (!Game.state.mafia) Game.state.mafia = { rischioIndagini: 0, rispettoCriminale: 0 };
            Game.state.mafia.rispettoCriminale = Math.max(0, Math.min(100, (Game.state.mafia.rispettoCriminale || 0) + effects.rispettoCriminale));
        }
        if (effects.scandal && Game.markPoliticalScandal) {
            Game.markPoliticalScandal();
        }
    },

    dismissNews() {
        document.getElementById('breaking-news').classList.add('hidden');
    },
};
