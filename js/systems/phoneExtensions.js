/* ============================================
   PHONE EXTENSIONS — "Potere in Tasca"
   Immersion Pack: Social Media, Dating App, Social Events
   ============================================ */

const PhoneExtensions = {
    init() {
        this.ensureState();
        Game.on('new-day', () => {
            this.ensureState();
            this.onNewDay();
        });
    },

    ensureState() {
        if (!Game.state.phoneExtensions) {
            Game.state.phoneExtensions = {
                socialMedia: {
                    app: 'SoloMedia',
                    followers: 0,
                    posts: [],
                    engagement: 0,
                },
                datingApp: {
                    app: 'CupidoItaly',
                    matches: [],
                    relationships: [],
                    scandals: 0,
                },
                socialEvents: {
                    invitations: [],
                    attended: 0,
                    declined: 0,
                },
                cosmetics: [
                    { id: 'iphone_gold', name: 'iPhone Oro 24K', cost: 5000, owned: false, effect: 'carisma +5' },
                    { id: 'armani_watch', name: 'Orologio Armani', cost: 2000, owned: false, effect: 'estetica +3' },
                    { id: 'rolex', name: 'Rolex Submariner', cost: 8000, owned: false, effect: 'reputazione +10' },
                ],
                lastSocialEventDay: -99,
            };
        }
    },

    isActive() {
        const active = (Game.state.flags && Array.isArray(Game.state.flags.activeDlc)) ? Game.state.flags.activeDlc : [];
        return active.includes('dlc_potere_tasca_lifestyle');
    },

    // FREE TIER: minimal phone app events even without DLC
    runBaseEvents() {
        const day = Game.state.day || 0;
        if (Math.random() < 0.05) {
            Game.addWorkNotif('App Telefono', 'Un\'app sul tuo telefono notifica una novita.', `Giorno ${day}`);
        }
    },

    // PAID TIER: full lifestyle loop (follower growth, invitations, relationship risk)
    runDlcEvents() {
        const day = Game.state.day || 0;
        const ext = Game.state.phoneExtensions;

        if (Math.random() < 0.08) {
            ext.socialMedia.followers += Math.floor(Math.random() * 50) + 10;
            Game.addWorkNotif('Nuovi Follower', `Hai guadagnato ${Math.floor(Math.random() * 50) + 10} nuovi follower.`, `Giorno ${day}`);
        }

        if (day - ext.lastSocialEventDay >= 10 && Math.random() < 0.12) {
            ext.lastSocialEventDay = day;
            this.getSocialEventInvitation();
        }

        ext.datingApp.relationships.forEach(rel => {
            rel.intimacy += Math.floor(Math.random() * 5) + 1;
            if (Math.random() < 0.1) {
                this.exposureRisk(rel.id);
            }
        });
    },

    // Social Media functions
    postOnSocialMedia(content, hashtags) {
        const ext = Game.state.phoneExtensions;
        const post = {
            id: `post_${Date.now()}`,
            content,
            hashtags,
            day: Game.state.day,
            likes: Math.floor(Math.random() * 1000) + ext.socialMedia.followers * 0.5,
            comments: Math.floor(Math.random() * 100),
        };

        ext.socialMedia.posts.push(post);
        ext.socialMedia.followers += Math.floor(post.likes / 100);
        ext.socialMedia.engagement += post.likes / 10;

        return post;
    },

    // Get social media boost to reputation
    collectSocialMediaBenefit() {
        const ext = Game.state.phoneExtensions;
        const benefit = Math.floor(ext.socialMedia.followers * 0.01);
        Game.changeStat('coherence', benefit);
        Game.addWorkNotif('Buzz Mediatico', `Hai guadagnato ${benefit} punti reputazione dai social media.`, `Giorno ${Game.state.day}`);
        return benefit;
    },

    // Dating app features
    swipeMatches() {
        const ext = Game.state.phoneExtensions;
        const matches = [
            { id: `match_${Date.now()}`, name: 'Sophia', profession: 'Giornalista', relation: 0 },
            { id: `match_${Date.now()}`, name: 'Giulia', profession: 'Avvocata', relation: 0 },
            { id: `match_${Date.now()}`, name: 'Francesca', profession: 'Politica', relation: 0 },
        ];

        const newMatch = matches[Math.floor(Math.random() * matches.length)];
        ext.datingApp.matches.push(newMatch);
        Game.addWorkNotif('Nuovo Match', `${newMatch.name} (${newMatch.profession}) è interessata a te!`, `Giorno ${Game.state.day}`);
        return newMatch;
    },

    // Start a relationship from dating app
    startRelationship(matchId) {
        const ext = Game.state.phoneExtensions;
        const match = ext.datingApp.matches.find(m => m.id === matchId);
        if (!match) return false;

        const relationship = {
            id: `rel_${Date.now()}`,
            matchId,
            name: match.name,
            profession: match.profession,
            intimacy: 10,
            startDay: Game.state.day,
            scandal: false,
        };

        ext.datingApp.relationships.push(relationship);
        Game.addWorkNotif('Relazione Iniziata', `Stai frequentando ${match.name}. Cosa scoprirà di te?`, `Giorno ${Game.state.day}`);
        return relationship;
    },

    // Scandal from relationship exposure
    exposureRisk(relationshipId) {
        const ext = Game.state.phoneExtensions;
        const rel = ext.datingApp.relationships.find(r => r.id === relationshipId);
        if (!rel || rel.scandal) return false;

        const exposed = Math.random() < 0.15; // 15% chance
        if (exposed) {
            rel.scandal = true;
            ext.datingApp.scandals++;
            Game.changeStat('stress', 20);
            Game.changeStat('coherence', -25);
            Game.addWorkNotif(
                'Scandalo Romantico',
                `La relazione con ${rel.name} è diventata pubblica! I media ne parlano. Stress +20, Coerenza -25.`,
                `Giorno ${Game.state.day}`
            );
            return true;
        }
        return false;
    },

    // Social events (parties, galas, inaugurations)
    getSocialEventInvitation() {
        const ext = Game.state.phoneExtensions;
        const events = [
            { name: 'Gala Benefico', type: 'charity', prestige: 20, cost: 500 },
            { name: 'Inaugurazione Museo', type: 'culture', prestige: 15, cost: 200 },
            { name: 'Cena Diplomatica', type: 'diplomatic', prestige: 30, cost: 800 },
            { name: 'Party VIP', type: 'social', prestige: 10, cost: 300 },
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        event.id = `event_${Date.now()}`;
        event.day = Game.state.day;
        ext.socialEvents.invitations.push(event);

        Game.addWorkNotif('Invito Mondano', `Sei invitato a: ${event.name}. Prestigio: +${event.prestige}, Costo: €${event.cost}`, `Giorno ${Game.state.day}`);
        return event;
    },

    // Attend a social event
    attendEvent(eventId) {
        const ext = Game.state.phoneExtensions;
        const event = ext.socialEvents.invitations.find(e => e.id === eventId);
        if (!event || Game.state.money < event.cost) return false;

        Game.changeMoney(-event.cost);
        Game.changeStat('coherence', event.prestige);
        ext.socialEvents.attended++;
        ext.socialEvents.invitations = ext.socialEvents.invitations.filter(e => e.id !== eventId);

        Game.addWorkNotif(
            'Evento Frequentato',
            `Hai partecipato a: ${event.name}. Reputation +${event.prestige}. Speso: €${event.cost}`,
            `Giorno ${Game.state.day}`
        );
        return true;
    },

    // Buy cosmetic luxury items
    buyCosmetic(cosmeticId) {
        const ext = Game.state.phoneExtensions;
        const cosmetic = ext.cosmetics.find(c => c.id === cosmeticId);
        if (!cosmetic || Game.state.money < cosmetic.cost || cosmetic.owned) return false;

        Game.changeMoney(-cosmetic.cost);
        cosmetic.owned = true;

        // Apply effect based on cosmetic
        if (cosmeticId === 'iphone_gold') {
            Game.changeStat('carisma', 5);
        } else if (cosmeticId === 'armani_watch') {
            Game.changeStat('estetica', 3);
        } else if (cosmeticId === 'rolex') {
            Game.changeStat('coherence', 10);
        }

        Game.addWorkNotif('Acquisto Lusso', `Hai comprato: ${cosmetic.name}. ${cosmetic.effect}. Speso: €${cosmetic.cost}`, `Giorno ${Game.state.day}`);
        return true;
    },

    onNewDay() {
        this.runBaseEvents();

        if (!this.isActive()) return;

        this.runDlcEvents();
    },
};

if (typeof window !== 'undefined') window.PhoneExtensions = PhoneExtensions;
