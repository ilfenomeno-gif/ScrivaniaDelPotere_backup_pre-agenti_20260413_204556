/* ============================================
   RADIO DEL PARTITO — News Ticker Feed
   ============================================ */

const Ticker = {
    _pool: [],
    _current: 0,
    _interval: null,

    MESSAGES: {
        generic: [
            "La Gazzetta del Sud: 'Nuovo record di astenuti alle comunali.'",
            "Un anziano al bar: 'Ai miei tempi la politica era un'altra cosa...'",
            "Radio Locale: 'Traffico intenso sulla tangenziale.'",
            "Voce dal mercato: 'Stanno chiudendo il negozio di Luigi.'",
            "Il Corriere: 'Sondaggi incerti per le prossime elezioni.'",
            "Un passante: 'Hai visto chi parlava in piazza ieri?'",
            "Radio Locale: 'Previsioni: pioggia nel pomeriggio.'",
            "Un collega: 'Il capo oggi è di pessimo umore.'",
            "La Stampa: 'Economia in stallo, disoccupazione al 12%.'",
            "Un vecchio amico: 'Non ti si vede più in giro!'",
            "Radio 1: 'Nuova legge sulle tasse comunali in discussione.'",
            "Al bar: 'Quello lì promette, ma non mantiene mai.'",
            "Un giornalaio: 'Oggi i giornali vanno a ruba!'",
            "SMS anonimo: 'Occhio a chi ti circonda.'",
            "La Gazzetta: 'Inaugurata la nuova pista ciclabile.'",
            "Una voce in corridoio: 'C'è chi parla bene di te in ufficio.'",
            "Radio Locale: 'Festival di paese nel weekend.'",
            "Notizia flash: 'Incidente in autostrada, code di 5 km.'",
            "Un vicino: 'Quando pulisci le scale, tocca a te!'",
            "Il Sole 24 Ore: 'Spread in aumento, mercati nervosi.'",
        ],
        highRep: [
            "Un tassista: 'Ehi, ti ho visto in TV! Bravo!'",
            "Al bar: 'Quello lì è in gamba, ve lo dico io.'",
            "La Gazzetta: 'Il giovane politico che piace alla gente.'",
            "Un fan: 'Posso farti una foto?'",
            "Radio Locale: 'L'assessore più amato della città.'",
        ],
        lowRep: [
            "Una voce in piazza: 'Ma chi è questo qui?'",
            "Al bar: 'Un altro che non combina niente.'",
            "Un passante: 'I politici sono tutti uguali.'",
            "SMS anonimo: 'Nessuno si fida di te.'",
            "Un collega: 'Forse dovresti cambiare mestiere.'",
        ],
        mafia: [
            "Voce anonima: 'Attento a Totò...'",
            "Al bar, sussurri: 'Dice che è amico degli amici.'",
            "Radio Locale: 'Blitz antimafia nella provincia vicina.'",
            "Un biglietto nel cruscotto: 'Sappiamo dove abiti.'",
            "Una telefonata muta alle 3 di notte.",
        ],
        lowMoney: [
            "Il bancario: 'Il suo conto è in sofferenza.'",
            "Al supermercato: 'Carta rifiutata. Imbarazzo alla cassa.'",
            "Un conoscente: 'Ti posso prestare 20€?'",
            "La banca: 'La rata è in ritardo.'",
        ],
        highStress: [
            "Il medico: 'Dovrebbe rallentare, signore.'",
            "Un collega: 'Hai una faccia terribile oggi.'",
            "Radio Benessere: 'Lo stress è il killer silenzioso.'",
            "Una voce interiore: 'Quanto puoi ancora reggere?'",
        ],
    },

    init() {
        if (!Game.state.options || Game.state.options.tickerEnabled === false) {
            this._hide();
            return;
        }
        this._buildPool();
        this._startScroll();
        Game.on('time-advance', () => this._buildPool());
        Game.on('new-day', () => this._buildPool());
    },

    _buildPool() {
        const s = Game.state;
        const pool = [...this.MESSAGES.generic];

        if (s.reputazione >= 60) pool.push(...this.MESSAGES.highRep);
        if (s.reputazione < 25) pool.push(...this.MESSAGES.lowRep);
        if (s.mafia && s.mafia.active) pool.push(...this.MESSAGES.mafia);
        if (s.money < 30) pool.push(...this.MESSAGES.lowMoney);
        if (s.stats.stress >= 60) pool.push(...this.MESSAGES.highStress);

        // Shuffle
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        this._pool = pool;
        this._current = 0;
    },

    _startScroll() {
        const el = document.getElementById('ticker-text');
        if (!el) return;
        this._showNext();
        if (this._interval) {
            if (typeof Scheduler !== 'undefined') Scheduler.clear(this._interval);
            else clearInterval(this._interval);
        }
        if (typeof Scheduler !== 'undefined') {
            this._interval = Scheduler.interval(() => this._showNext(), 12000, { group: 'ticker', label: 'scroll' });
        } else {
            this._interval = setInterval(() => this._showNext(), 12000);
        }
    },

    _showNext() {
        if (Game.state.options && Game.state.options.tickerEnabled === false) {
            this._hide();
            return;
        }
        const el = document.getElementById('ticker-text');
        if (!el) return;
        if (this._pool.length === 0) return;

        el.classList.remove('ticker-animate');
        void el.offsetWidth; // force reflow
        el.textContent = '📻 ' + this._pool[this._current % this._pool.length];
        el.classList.add('ticker-animate');
        this._current++;
    },

    _hide() {
        const bar = document.getElementById('ticker-bar');
        if (bar) bar.classList.add('hidden');
    },

    show() {
        const bar = document.getElementById('ticker-bar');
        if (bar) bar.classList.remove('hidden');
    },

    toggle(enabled) {
        if (enabled) {
            this.show();
            if (!this._interval) this._startScroll();
        } else {
            this._hide();
            if (this._interval) {
                if (typeof Scheduler !== 'undefined') Scheduler.clear(this._interval);
                else clearInterval(this._interval);
                this._interval = null;
            }
        }
    },
};
