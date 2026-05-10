/* ============================================
   HOBBY SYSTEM — "Tempo Libero"
   Immersion Pack: Hobbies, Public Identity, Scandal Risk
   ============================================ */

const HobbySystem = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.hobbies) {
            Game.state.hobbies = {
                // Base tier hobbies (always available)
                baseHobbies: [
                    { id: 'lettura', name: 'Lettura', icon: '📚', skill: 0, effect: 'intelligenza +3, stress -5', costPerUse: 0 },
                    { id: 'calcetto', name: 'Calcetto', icon: '⚽', skill: 0, effect: 'salute +8, networking +2', costPerUse: 20 },
                ],
                // DLC hobbies (full hobby system)
                dlcHobbies: [
                    { id: 'fotografia', name: 'Fotografia', icon: '📷', skill: 0, cost: 500, connections: ['artisti', 'giornalisti'], scandal: 'foto compromettenti' },
                    { id: 'caccia', name: 'Caccia', icon: '🔫', skill: 0, cost: 1000, connections: ['nobili', 'mafiosi'], scandal: 'illegalità' },
                    { id: 'vela', name: 'Vela', icon: '⛵', skill: 0, cost: 2000, connections: ['politici_internazionali', 'armatori'], scandal: 'yacht costoso' },
                    { id: 'collezionismo', name: 'Collezionismo Arte', icon: '🎨', skill: 0, cost: 3000, connections: ['ricchi', 'criminali'], scandal: 'riciclaggio' },
                    { id: 'poker', name: 'Poker Privato', icon: '♠️', skill: 0, cost: 500, connections: ['mafiosi', 'ricchi'], scandal: 'debiti di gioco' },
                    { id: 'cucina', name: 'Cucina Raffinata', icon: '👨‍🍳', skill: 0, cost: 800, connections: ['gourmet', 'ospiti_vip'], scandal: 'nessuno' },
                    { id: 'lettura_avanzata', name: 'Lettura Classica', icon: '📖', skill: 0, cost: 100, connections: ['intellettuali', 'accademici'], scandal: 'nessuno' },
                    { id: 'sport_estremi', name: 'Sport Estremi', icon: '🏔️', skill: 0, cost: 1500, connections: ['giovani', 'avventurieri'], scandal: 'infortuni pubblici' },
                ],
                // Active hobbies
                activeHobbies: [],          // Currently practiced
                hobbyEvents: [],            // Upcoming hobby events
                publicIdentity: [],         // How hobbies shape public image
                lastHobbyEventDay: -99,
                hobbyRelationships: {},     // Connections made via hobbies
                hobbySkills: {},            // Skill progression per hobby
            };
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_tempo_libero_hobbies');
    },

    // FREE TIER: 2 base hobbies + generic hobby events
    runBaseEvents() {
        const day = Game.state.day || 0;

        if (Math.random() < 0.08) {
            Game.addWorkNotif('Tempo Libero', 'Hai del tempo per dedicarti ai tuoi hobby.', `Giorno ${day}`);
        }

        if (Math.random() < 0.06) {
            Game.addWorkNotif('Passione Coltivata', 'I tuoi hobby ti aiutano a staccare dalla pressione politica.', `Giorno ${day}`);
        }
    },

    // PAID TIER: full hobby system, connections, scandals
    runDlcEvents() {
        const day = Game.state.day || 0;
        const hs = Game.state.hobbies;

        // Hobby skill progression
        hs.activeHobbies.forEach(hobbyId => {
            if (!hs.hobbySkills[hobbyId]) hs.hobbySkills[hobbyId] = 0;
            hs.hobbySkills[hobbyId] = Math.min(100, hs.hobbySkills[hobbyId] + Math.random() * 5);
        });

        // Hobby events
        if (day - hs.lastHobbyEventDay >= 7 && hs.activeHobbies.length > 0 && Math.random() < 0.15) {
            hs.lastHobbyEventDay = day;
            this.triggerHobbyEvent(day);
        }

        // Hobby-based networking
        hs.activeHobbies.forEach(hobbyId => {
            if (Math.random() < 0.06) {
                const hobby = hs.dlcHobbies.find(h => h.id === hobbyId);
                if (hobby && hobby.connections.length > 0) {
                    const connection = hobby.connections[Math.floor(Math.random() * hobby.connections.length)];
                    Game.addWorkNotif(
                        'Connessione Hobby',
                        `Tramite il tuo hobby di ${hobby.name}, conosci ${connection}.`,
                        `Giorno ${day}`
                    );
                }
            }
        });

        // Scandal risk for expensive hobbies
        hs.activeHobbies.forEach(hobbyId => {
            const hobby = hs.dlcHobbies.find(h => h.id === hobbyId);
            if (hobby && hobby.cost > 1000 && Math.random() < 0.08) {
                Game.addWorkNotif(
                    'Scandalo Hobby',
                    `La stampa commenta il tuo costoso hobby: ${hobby.name}. Potrebbe diventare controverso.`,
                    `Giorno ${day}`
                );
            }
        });
    },

    triggerHobbyEvent(day) {
        const hs = Game.state.hobbies;
        const hobbyId = hs.activeHobbies[Math.floor(Math.random() * hs.activeHobbies.length)];
        const hobby = hs.dlcHobbies.find(h => h.id === hobbyId);

        if (!hobby) return;

        const events = {
            fotografia: [
                'Un tuo scatto vince un concorso fotografico.',
                'Scopri una prospettiva nuova attraverso la fotografia.',
            ],
            caccia: [
                'Una battuta di caccia con nobili locali.',
                'Una partita di caccia va storto — ferimento leggero.',
            ],
            vela: [
                'Una regata privata con politici internazionali.',
                'Una tempesta durante una uscita in barca.',
            ],
            collezionismo: [
                'Acquisti un\'opera rara che aumenta di valore.',
                'Scopri un falso nella tua collezione — imbarazzo.',
            ],
            poker: [
                'Una partita redditizia con boss mafiosi.',
                'Perdi una grande somma a poker. Debito.',
            ],
            cucina: [
                'Organizzi un\'importante cena che piace a tutti.',
                'Un piatto fallisce — leggera umiliazione.',
            ],
        };

        const hobbyEvents = events[hobby.id];
        if (hobbyEvents) {
            const event = hobbyEvents[Math.floor(Math.random() * hobbyEvents.length)];
            Game.addWorkNotif('Evento Hobby', event, `Giorno ${day}`);
        }
    },

    // Start practicing a hobby
    startHobby(hobbyId) {
        const hs = Game.state.hobbies;
        
        // Check if base hobby
        const baseHobby = hs.baseHobbies.find(h => h.id === hobbyId);
        if (baseHobby) {
            if (!hs.activeHobbies.includes(hobbyId)) {
                hs.activeHobbies.push(hobbyId);
                Game.addWorkNotif('Hobby Avviato', `Hai iniziato: ${baseHobby.name}`, `Giorno ${Game.state.day}`);
            }
            return true;
        }

        // Check if DLC hobby
        if (!this.isActive()) return false;
        const dlcHobby = hs.dlcHobbies.find(h => h.id === hobbyId);
        if (!dlcHobby) return false;

        // Pay hobby cost (equipment, membership, etc.)
        if (Game.state.money < dlcHobby.cost) return false;

        if (!hs.activeHobbies.includes(hobbyId)) {
            hs.activeHobbies.push(hobbyId);
            Game.changeMoney(-dlcHobby.cost);
            hs.hobbySkills[hobbyId] = 10;

            Game.addWorkNotif(
                'Hobby Iniziato',
                `Hai iniziato: ${dlcHobby.name}. Speso: €${dlcHobby.cost}. Ora conoscerai: ${dlcHobby.connections.join(', ')}`,
                `Giorno ${Game.state.day}`
            );

            // Add to public identity
            hs.publicIdentity.push({
                hobby: dlcHobby.name,
                startDay: Game.state.day,
                dangerLevel: dlcHobby.scandal === 'nessuno' ? 'safe' : 'risky',
            });
        }

        return true;
    },

    // Stop practicing a hobby
    stopHobby(hobbyId) {
        const hs = Game.state.hobbies;
        hs.activeHobbies = hs.activeHobbies.filter(h => h !== hobbyId);
        Game.addWorkNotif('Hobby Abbandonato', `Hai smesso di praticare questo hobby.`, `Giorno ${Game.state.day}`);
        return true;
    },

    // Get hobby public perception
    getPublicIdentity() {
        const hs = Game.state.hobbies;
        const perception = {
            prestigious: [],    // Positive hobbies
            risky: [],          // Controversial hobbies
        };

        hs.publicIdentity.forEach(item => {
            if (item.dangerLevel === 'safe') {
                perception.prestigious.push(item.hobby);
            } else {
                perception.risky.push(item.hobby);
            }
        });

        return perception;
    },

    // Conduct a skill check (use hobby skill for something)
    useHobbySkill(hobbyId, difficulty) {
        const hs = Game.state.hobbies;
        const skill = hs.hobbySkills[hobbyId] || 0;
        const success = skill > difficulty;

        if (success) {
            Game.addWorkNotif('Successo Hobby', 'La tua abilità ha pagato!', `Giorno ${Game.state.day}`);
        } else {
            Game.addWorkNotif('Insuccesso', 'Non avevi abbastanza esperienza.', `Giorno ${Game.state.day}`);
        }

        return success;
    },

    onNewDay() {
        const day = Game.state.day || 0;

        this.runBaseEvents();

        if (!this.isActive()) return;

        this.runDlcEvents();
    },
};

if (typeof window !== 'undefined') window.HobbySystem = HobbySystem;
