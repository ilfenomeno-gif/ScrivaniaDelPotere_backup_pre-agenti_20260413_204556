/**
 * LE LOBBY - Gruppi di Pressione
 * ID DLC: dlc_lobby_pressure
 * Categoria: Flavor
 * 
 * Aggiunge: associazioni industriali, ordini professionali, sindacati, Confindustria.
 * Base game: contatti casuali con interesse economico.
 * DLC attivo: relazioni persistenti, favori, prestiti politici, conflitti di interesse.
 */

const LobbySystem = {
    init() {
        this.ensureState();
        if (typeof Game === 'undefined' || !Game.on) return;
        Game.on('new-day', () => this.onNewDay());
    },

    isActive() {
        return Game?.state?.flags?.activeDlc?.includes('dlc_lobby_pressure');
    },

    ensureState() {
        if (!Game.state.lobbies) {
            Game.state.lobbies = {
                // Free tier: contatti generici
                lastLobbyContact: -99,
                
                // Paid tier: relazioni persistenti
                groups: [
                    { id: 'confindustria', name: 'Confindustria', favor: 30, pressure: 20, scandals: 0 },
                    { id: 'cgil', name: 'CGIL Sindacati', favor: 25, pressure: 25, scandals: 0 },
                    { id: 'medici', name: 'Ordine Medici', favor: 40, pressure: 10, scandals: 0 },
                    { id: 'ambientalisti', name: 'Associazioni Ambientaliste', favor: 20, pressure: 30, scandals: 0 }
                ],
                playerDebtsToLobbies: {},     // { lobbyId: amount_money }
                conflictOfInterestRisk: 0,   // 0-100
                mediaScrutiny: 0             // 0-100 — stampa che indaga
            };
        }
        return Game.state.lobbies;
    },

    // FREE TIER: contatto occasionale
    runBaseEvents() {
        const s = this.ensureState();
        const day = Game.state.day || 0;

        if (day % 15 === 0 && day - s.lastLobbyContact > 14) {
            const msg = 'Associazione di categoria ti contatta per discutere di interessi comuni.';
            Game.addWorkNotif('🤝 Contatto', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'polite');
            s.lastLobbyContact = day;
        }
    },

    // PAID TIER: relazioni complesse, favori, scandali
    runDlcEvents() {
        if (!this.isActive()) return;
        const s = Game.state.lobbies;
        const day = Game.state.day || 0;

        // Evento: Richiesta di favore da lobby (ogni 10 giorni)
        if (day % 10 === 0) {
            const group = s.groups[Math.floor(Math.random() * s.groups.length)];
            const favor = [
                `Legge favore per settore ${group.name}`,
                `Finanziamento per progetto di interesse di ${group.name}`,
                `Nomina di esponente in commissione a favore di ${group.name}`
            ];
            const req = favor[Math.floor(Math.random() * favor.length)];
            const msg = `${group.name} chiede un favore: '${req}'.`;
            Game.addWorkNotif('💼 Favore', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'polite');
        }

        // Evento: Pressione economica (prestiti mascherati)
        if (day % 12 === 0 && Math.random() < 0.3) {
            const group = s.groups[Math.floor(Math.random() * s.groups.length)];
            const amount = 50 + Math.floor(Math.random() * 200);
            const msg = `${group.name} offre prestito di €${amount}k per campagna elettorale. (Conflitto di interesse tracciato)`;
            Game.addWorkNotif('💰 Prestito', msg, `Giorno ${day}`);
            if (window.SR) SR.announce(msg, 'polite');
            s.playerDebtsToLobbies[group.id] = (s.playerDebtsToLobbies[group.id] || 0) + amount;
            s.conflictOfInterestRisk = Math.min(100, s.conflictOfInterestRisk + 10);
        }

        // Evento: Scandalo di conflitto di interesse (se risk alto)
        if (s.conflictOfInterestRisk >= 70 && Math.random() < 0.05 && day % 8 === 0) {
            const group = Object.values(s.groups).find(g => s.playerDebtsToLobbies[g.id] > 0);
            if (group) {
                const msg = `Stampa scopre legami finanziari con ${group.name}. Scandalo conflitto di interesse!`;
                Game.addWorkNotif('🔴 Scandalo', msg, `Giorno ${day}`);
                if (window.SR) SR.announce(msg, 'assertive');
                group.scandals++;
                s.mediaScrutiny = Math.min(100, s.mediaScrutiny + 25);
                Game.changeStat('stress', 5);
                Game.changeReputazione(-10, 'nazionale');
            }
        }

        // Evento: Reputazione lobby aumenta se favorisci
        s.groups.forEach(group => {
            group.favor = Math.max(0, group.favor - 0.5);  // Diminuisce lentamente
        });

        // Media scrutiny diminuisce lentamente
        s.mediaScrutiny = Math.max(0, s.mediaScrutiny - 1);
    },

    onNewDay() {
        this.ensureState();
        this.runBaseEvents();
        if (this.isActive()) {
            this.runDlcEvents();
        }
    },

    // Funzione pubblica: accetta prestito da lobby
    acceptLobbyLoan(lobbyId, amount) {
        const s = this.ensureState();
        s.playerDebtsToLobbies[lobbyId] = (s.playerDebtsToLobbies[lobbyId] || 0) + amount;
        s.conflictOfInterestRisk = Math.min(100, s.conflictOfInterestRisk + 15);
        Game.changeMoney(amount * 1000);  // Converti in euro
        const msg = `Prestito accettato da lobby. +€${amount * 1000}. Conflitto di interesse: +15.`;
        Game.addWorkNotif('💵 Prestito', msg, `Giorno ${Game.state.day}`);
        if (window.SR) SR.announce(msg, 'assertive');
        return true;
    },

    // Funzione pubblica: restituisci debito
    repayLoan(lobbyId, amount) {
        const s = this.ensureState();
        const debt = s.playerDebtsToLobbies[lobbyId] || 0;
        if (debt < amount || Game.state.money < amount * 1000) return false;
        s.playerDebtsToLobbies[lobbyId] = debt - amount;
        Game.changeMoney(-amount * 1000);
        s.conflictOfInterestRisk = Math.max(0, s.conflictOfInterestRisk - 5);
        const msg = `Debito a lobby ripagato: €${amount * 1000}.`;
        Game.addWorkNotif('✅ Rimborso', msg, `Giorno ${Game.state.day}`);
        if (window.SR) SR.announce(msg, 'polite');
        return true;
    }
};

if (typeof window !== 'undefined') window.LobbySystem = LobbySystem;
