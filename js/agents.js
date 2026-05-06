/* ============================================
   AGENTS — NPC dinamici con memoria e agenda
   ============================================ */

const Agents = {
    AGENT_TEMPLATES: {
        politico: {
            possibleRoles: ['Consigliere', 'Assessore', 'Deputato', 'Senatore', 'Sindaco'],
            traits: ['Ambizioso', 'Carismatico', 'Corrotto', 'Idealista', 'Opportunista', 'Vendicativo'],
            baseWealth: 50,
            baseInfluence: 40,
            agendas: ['Carriera politica', 'Alleanze di potere', 'Legge e ordine'],
        },
        imprenditore: {
            possibleRoles: ['Imprenditore', 'Banchiere', 'Commerciante', 'Industriale'],
            traits: ['Pragmatico', 'Avido', 'Filantropo', 'Corrotto', 'Vendicativo'],
            baseWealth: 200,
            baseInfluence: 30,
            agendas: ['Profitto', 'Espansione aziendale', 'Evasione fiscale'],
        },
        giornalista: {
            possibleRoles: ['Giornalista', 'Editore', 'Influencer', 'Blogger'],
            traits: ['Curioso', 'Senza scrupoli', 'Idealista', 'Pragmatico', 'Vendicativo'],
            baseWealth: 30,
            baseInfluence: 60,
            agendas: ['Scandalo', 'Verita', 'Audience'],
        },
        sindacalista: {
            possibleRoles: ['Sindacalista', 'Attivista', 'Coordinatore'],
            traits: ['Combattivo', 'Leale', 'Testardo', 'Carismatico', 'Vendicativo'],
            baseWealth: 20,
            baseInfluence: 35,
            agendas: ['Diritti dei lavoratori', 'Sciopero generale', 'Politica sociale'],
        },
        cittadino: {
            possibleRoles: ['Cittadino', 'Artigiano', 'Commerciante', 'Pensionato'],
            traits: ['Modesto', 'Leale', 'Sospettoso', 'Aperto', 'Vendicativo'],
            baseWealth: 15,
            baseInfluence: 5,
            agendas: ['Stabilita', 'Vita tranquilla', 'Giustizia locale'],
        },
    },

    FAKE_NAMES: {
        italy: {
            first: ['Alessandro', 'Giulia', 'Marco', 'Lucia', 'Francesco', 'Elena', 'Matteo', 'Sofia'],
            last: ['Rossi', 'Bianchi', 'Verdi', 'Ferrari', 'Romano', 'Conti', 'Esposito'],
        },
        france: {
            first: ['Antoine', 'Claire', 'Philippe', 'Sophie', 'Luc', 'Camille', 'Jean', 'Marie'],
            last: ['Dupont', 'Moreau', 'Lefebvre', 'Simon', 'Laurent', 'Michel', 'Garcia'],
        },
        germany: {
            first: ['Klaus', 'Sabine', 'Lukas', 'Hannah', 'Felix', 'Lea', 'Jonas', 'Mia'],
            last: ['Schmidt', 'Mueller', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner'],
        },
        uk: {
            first: ['Eleanor', 'William', 'Thomas', 'Charlotte', 'James', 'Amelia', 'Henry', 'Victoria'],
            last: ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson'],
        },
    },

    ROLE_TYPES: ['politico', 'imprenditore', 'giornalista', 'sindacalista', 'cittadino'],

    init() {
        if (!Array.isArray(Game.state.agents)) Game.state.agents = [];

        Game.on('game-started', () => {
            const cityId = Game.state.city && Game.state.city.id;
            const nationId = Game.state.nation && Game.state.nation.id;
            if (!cityId || !nationId) return;
            if (!Game.state.agents || Game.state.agents.length === 0) {
                this.generateInitialAgents(cityId, nationId);
            }
        });

        Game.on('new-day', () => {
            this.updateAgentsDaily();
            this.syncAgentsToContacts();
            this.tryTriggerDailyAgentEvent();
        });

        Game.on('nation-changed', () => {
            this.syncAgentsToContacts();
        });
    },

    randomItem(arr) {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    },

    randomKey(obj) {
        return this.randomItem(Object.keys(obj || {}));
    },

    randomIdeology() {
        const options = ['estrema-sinistra', 'centro', 'populista', 'tecnocrate', 'estrema-destra'];
        return this.randomItem(options);
    },

    generateFakeName(nationId) {
        const bank = this.FAKE_NAMES[nationId] || this.FAKE_NAMES.italy;
        return `${this.randomItem(bank.first)} ${this.randomItem(bank.last)}`;
    },

    getAgentType(agent) {
        if (!agent || !agent.roleType) return 'cittadino';
        return agent.roleType;
    },

    generateBio(agent) {
        const trait = this.randomItem(agent.traits || []) || 'Pragmatico';
        return `${agent.role} ${trait.toLowerCase()} con agenda: ${agent.agenda.primary}.`;
    },

    getEmojiForRole(role) {
        const r = String(role || '').toLowerCase();
        if (r.includes('consig') || r.includes('assessor') || r.includes('deput') || r.includes('senator') || r.includes('sindaco')) return '🏛️';
        if (r.includes('imprend') || r.includes('banch') || r.includes('industr')) return '💼';
        if (r.includes('giornal') || r.includes('edit') || r.includes('blog') || r.includes('influencer')) return '📰';
        if (r.includes('sindacal') || r.includes('attiv')) return '✊';
        if (r.includes('pension')) return '👴';
        return '👤';
    },

    generateAgent(cityId, nationId, ideology = null, roleType = null) {
        const type = roleType || this.randomKey(this.AGENT_TEMPLATES);
        const template = this.AGENT_TEMPLATES[type] || this.AGENT_TEMPLATES.cittadino;
        const role = this.randomItem(template.possibleRoles);
        const t1 = this.randomItem(template.traits);
        let t2 = this.randomItem(template.traits);
        if (t2 === t1) t2 = this.randomItem(template.traits);
        const traits = [t1, t2];
        const agendaType = this.randomItem(template.agendas);
        const name = this.generateFakeName(nationId);

        return {
            id: `agent_${Date.now()}_${Math.floor(Math.random() * 999999)}`,
            name,
            role,
            roleType: type,
            ideology: ideology || this.randomIdeology(),
            nation: nationId,
            city: cityId,
            traits,
            relationship: 30 + Math.floor(Math.random() * 40),
            trust: 20 + Math.floor(Math.random() * 50),
            influence: template.baseInfluence + Math.floor(Math.random() * 30),
            wealth: template.baseWealth + Math.floor(Math.random() * 100),
            agenda: {
                primary: agendaType,
                progress: 0,
                active: true,
            },
            memory: {},
            lastInteractionDay: Game.state.day,
            isMentor: false,
            isContact: true,
        };
    },

    generateInitialAgents(cityId, nationId) {
        const agents = [];

        const mentorFlag = Game.state.flags && Game.state.flags.mentor;
        if (mentorFlag && mentorFlag.selectedId) {
            const mentorName = mentorFlag.name || 'Mentore';
            agents.push({
                id: `agent_mentor_${mentorFlag.selectedId}`,
                name: mentorName,
                role: 'Mentore',
                roleType: 'politico',
                ideology: mentorFlag.ideology || Game.state.character.ideology || 'centro',
                nation: nationId,
                city: cityId,
                traits: ['Leale', 'Pragmatico'],
                relationship: 65,
                trust: 70,
                influence: 60,
                wealth: 80,
                agenda: { primary: 'Crescita allievo', progress: 0, active: true },
                memory: {},
                lastInteractionDay: Game.state.day,
                isMentor: true,
                mentorData: { id: mentorFlag.selectedId, name: mentorName },
                isContact: false,
            });
        }

        for (let i = 0; i < 8; i++) {
            const type = this.ROLE_TYPES[Math.floor(Math.random() * this.ROLE_TYPES.length)];
            agents.push(this.generateAgent(cityId, nationId, null, type));
        }

        for (let i = 0; i < 2; i++) {
            const rival = this.generateAgent(cityId, nationId);
            rival.relationship = 5 + Math.floor(Math.random() * 15);
            rival.trust = 10;
            if (!rival.traits.includes('Vendicativo')) rival.traits[0] = 'Vendicativo';
            agents.push(rival);
        }

        Game.state.agents = agents;
        this.syncAgentsToContacts();
        Game.addWorkNotif('🧠 Rete Locale', `${agents.filter(a => !a.isMentor).length} agenti locali sono entrati in scena.`, `Giorno ${Game.state.day}`);
    },

    syncAgentsToContacts() {
        const agents = (Game.state.agents || []).filter(a => a.isContact && !a.isMentor);
        const existing = Game.state.contacts || [];
        const byAgentId = new Map(existing.filter(c => c.agentId).map(c => [c.agentId, c]));
        const externalContacts = existing.filter(c => !c.agentId);

        const agentContacts = agents.map(a => {
            const prev = byAgentId.get(a.id) || {};
            return {
            name: a.name,
            role: a.role,
            emoji: this.getEmojiForRole(a.role),
            ideology: a.ideology,
            bio: a.bio || this.generateBio(a),
            relation: Math.max(0, Math.min(100, Math.round(a.relationship || 0))),
            loyalty: Math.max(0, Math.min(100, Math.round(a.trust || 0))),
            betrayed: !!prev.betrayed,
            favorite: !!prev.favorite,
            canAlly: (a.relationship || 0) >= 70 && (a.trust || 0) >= 60,
            city: a.city,
            agentId: a.id,
            alliance: prev.alliance || {
                active: false,
                bonusKey: null,
                bonusLabel: '',
                sinceDay: 0,
                everFormed: false,
            },
        };
        });

        Game.state.contacts = [...externalContacts, ...agentContacts];
    },

    syncContactsToAgents() {
        const contacts = Game.state.contacts || [];
        const map = new Map((Game.state.agents || []).map(a => [a.id, a]));
        contacts.forEach(c => {
            if (!c.agentId) return;
            const a = map.get(c.agentId);
            if (!a) return;
            a.relationship = Math.max(0, Math.min(100, c.relation || a.relationship || 0));
            a.trust = Math.max(0, Math.min(100, c.loyalty || a.trust || 0));
            a.lastInteractionDay = Game.state.day;
        });
    },

    findAgentByContact(contact) {
        if (!contact || !contact.agentId) return null;
        return (Game.state.agents || []).find(a => a.id === contact.agentId) || null;
    },

    recordAgentMemory(agentId, eventType, impact) {
        const agent = (Game.state.agents || []).find(a => a.id === agentId);
        if (!agent) return;

        agent.memory[eventType] = {
            day: Game.state.day,
            impact,
        };
        agent.lastInteractionDay = Game.state.day;
        agent.relationship = Math.max(0, Math.min(100, (agent.relationship || 0) + impact));

        if (impact >= 8) {
            agent.trust = Math.min(100, (agent.trust || 0) + 4);
        } else if (impact <= -8) {
            agent.trust = Math.max(0, (agent.trust || 0) - 6);
        }

        if (impact <= -15 && (agent.traits || []).includes('Vendicativo')) {
            this.scheduleRevenge(agent);
        }
    },

    recordByContact(contact, eventType, impact) {
        const agent = this.findAgentByContact(contact);
        if (!agent) return;
        this.recordAgentMemory(agent.id, eventType, impact);
    },

    scheduleRevenge(agent) {
        const delay = 2 + Math.floor(Math.random() * 5);
        if (!Game.hasDelayedConsequence('agent-revenge')) {
            Game.scheduleDelayedConsequence(delay, `Ritorsione di ${agent.name}`, 'agent-revenge', { agentId: agent.id });
        }
    },

    updateAgentsDaily() {
        const agents = Game.state.agents || [];
        agents.forEach(agent => {
            const daysSince = Game.state.day - (agent.lastInteractionDay || Game.state.day);
            if (daysSince > 5) {
                agent.relationship = Math.max(0, (agent.relationship || 0) - 2);
                agent.trust = Math.max(0, (agent.trust || 0) - 1);
            }

            if (agent.agenda && agent.agenda.active && Math.random() < 0.10) {
                agent.agenda.progress += Math.floor(Math.random() * 10);
                if (agent.agenda.progress >= 100) {
                    this.resolveAgentAgenda(agent);
                }
            }

            if ((agent.traits || []).includes('Ambizioso') && Math.random() < 0.2) {
                agent.influence = Math.min(100, (agent.influence || 0) + 2);
            }

            if (agent.agenda && !agent.agenda.active && agent.agenda.resumeDay && Game.state.day >= agent.agenda.resumeDay) {
                const template = this.AGENT_TEMPLATES[this.getAgentType(agent)] || this.AGENT_TEMPLATES.cittadino;
                agent.agenda.primary = this.randomItem(template.agendas);
                agent.agenda.progress = 0;
                agent.agenda.active = true;
                delete agent.agenda.resumeDay;
            }
        });

        this.syncAgentsToContacts();
    },

    upgradeRole(role) {
        const ladder = ['Consigliere', 'Assessore', 'Deputato', 'Senatore', 'Sindaco'];
        const idx = ladder.indexOf(role);
        if (idx < 0) return role;
        return ladder[Math.min(ladder.length - 1, idx + 1)];
    },

    resolveAgentAgenda(agent) {
        if (!agent || !agent.agenda) return;

        if (agent.agenda.primary === 'Carriera politica') {
            agent.role = this.upgradeRole(agent.role);
            agent.influence = Math.min(100, (agent.influence || 0) + 20);
            Game.addWorkNotif('📢 Notizia', `${agent.name} e stato promosso a ${agent.role}!`, `Giorno ${Game.state.day}`);
        } else if (agent.agenda.primary === 'Profitto') {
            agent.wealth = (agent.wealth || 0) + 500;
            Game.addWorkNotif('💰 Economia', `${agent.name} ha fatto un ottimo affare.`, `Giorno ${Game.state.day}`);
        } else {
            agent.influence = Math.min(100, (agent.influence || 0) + 8);
        }

        agent.agenda.active = false;
        agent.agenda.resumeDay = Game.state.day + 3 + Math.floor(Math.random() * 4);
    },

    tryTriggerDailyAgentEvent() {
        if (typeof Events === 'undefined' || !Events.triggerAgentEvent) return;
        if (Math.random() < 0.22) {
            Events.triggerAgentEvent();
        }
    },
};
