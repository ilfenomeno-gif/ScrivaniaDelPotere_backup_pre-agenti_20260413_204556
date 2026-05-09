/* ============================================
   PARTIES — Sistema Partiti Avanzato con
   Correnti Interne e Matrice Ideologica
   ============================================ */

const Parties = (() => {
    'use strict';

    /* ── Cache partiti caricati ──────────────── */
    const _cache = {};          // { italy: [...], france: [...], ... }
    const _NATION_MAP = {
        italy: 'parties_italy.json',
        france: 'parties_france.json',
        germany: 'parties_germany.json',
        uk: 'parties_uk.json',
    };

    /* ── Inizializzazione ────────────────────── */
    function init() {
        if (!Game.state.party) {
            Game.state.party = {
                id: null,
                name: null,
                nationId: null,
                currentId: null,          // corrente interna
                joinedDay: 0,
                ideologyMatrix: { tasse: 0, immigrazione: 0, ambiente: 0, difesa: 0, diritti: 0 },
                currentInfluence: 0,      // influenza nella corrente 0-100
                formerParties: [],        // storico partiti
                partyEvents: [],          // eventi partito pendenti
            };
        }
        // Se il giocatore ha già un partito, applica effetti
        if (Game.state.party.id) _applyActiveEffects();

        Game.on('time-advance', (d) => {
            if (d.timeOfDay === 0) _dailyPartyEffects();
        });
        Game.on('city-change', () => _checkCareerAccess());

        // Resetta partito e mentori quando il giocatore cambia nazione
        async function _onNationChange() {
            Game.state.party = {
                id: null, name: null, nationId: null, currentId: null,
                joinedDay: 0,
                ideologyMatrix: { tasse: 0, immigrazione: 0, ambiente: 0, difesa: 0, diritti: 0 },
                currentInfluence: 0,
                formerParties: (Game.state.party && Game.state.party.formerParties) ? Game.state.party.formerParties : [],
                partyEvents: [],
                _partyData: null,
            };
            Game.state.partyMentors = [];
            // Carica partiti e mentori aggiornati per la nuova nazione
            const nationId = Game.state.nation?.id || 'italy';
            await loadPartiesForNation(nationId);
            if (typeof Game.loadMentorsForNation === 'function') {
                await Game.loadMentorsForNation();
            }
            Game.addWorkNotif('🏛️ Partito', 'Sei in un nuovo paese. Scegli un nuovo partito politico.', `Giorno ${Game.state.day}`);
            if (window.SR) SR.announce('Cambiato paese. Seleziona un nuovo partito politico nella sezione Politica del telefono.', 'polite');
        }
        Game.on('nation-change', _onNationChange);
        Game.on('nation-changed', _onNationChange);
    }

    /* ── Caricamento dati partiti per nazione ── */
    async function loadPartiesForNation(nationId) {
        if (_cache[nationId]) return _cache[nationId];
        const file = _NATION_MAP[nationId];
        if (!file) return [];
        try {
            const res = await fetch(`data/${file}`);
            const data = await res.json();
            _cache[nationId] = data;
            return data;
        } catch (e) {
            console.warn(`[Parties] Impossibile caricare ${file}:`, e);
            return [];
        }
    }

    /* ── Ottieni partiti disponibili per la nazione corrente ── */
    async function getAvailableParties() {
        const nationId = Game.state.nation?.id || 'italy';
        return loadPartiesForNation(nationId);
    }

    /* ── Il giocatore sceglie un partito ──────── */
    async function joinParty(partyId, nationId) {
        const nId = nationId || Game.state.nation?.id || 'italy';
        const parties = await loadPartiesForNation(nId);
        const party = parties.find(p => p.id === partyId);
        if (!party) return false;

        // Salva storico
        if (Game.state.party.id) {
            Game.state.party.formerParties.push({
                id: Game.state.party.id,
                name: Game.state.party.name,
                nationId: Game.state.party.nationId,
                leftDay: Game.state.day,
            });
        }

        // Applica partito
        Game.state.party.id = party.id;
        Game.state.party.name = party.name;
        Game.state.party.nationId = nId;
        Game.state.party.ideologyMatrix = { ...party.ideologyMatrix };
        Game.state.party.currentId = null;
        Game.state.party.currentInfluence = 0;
        Game.state.party.joinedDay = Game.state.day;

        // Bonus di ingresso
        if (party.startingBonus) {
            Object.entries(party.startingBonus).forEach(([stat, val]) => {
                _applyStat(stat, val);
            });
        }

        // Genera 3 mentori dal pool del partito
        await _assignMentorsForParty(party, nId);

        Game.addWorkNotif(`${party.icon} Partito`, `Ti sei iscritto a "${party.name}". ${party.ideology.toUpperCase()}.`, `Giorno ${Game.state.day}`);
        Game.addUrgentMessage('Segreteria Partito', `Benvenuto in ${party.name}. Le correnti interne ti attendono.`, 'info');
        _applyActiveEffects();
        if (window.SR) SR.announce(`Iscritto al partito ${party.name}.`, 'assertive');
        _injectPartyUI();
        return true;
    }

    /* ── Il giocatore si unisce a una corrente ─ */
    async function joinCurrent(currentId) {
        const parties = await getAvailableParties();
        const party = parties.find(p => p.id === Game.state.party.id);
        if (!party) return false;
        const current = party.currents?.find(c => c.id === currentId);
        if (!current) return false;

        Game.state.party.currentId = currentId;
        Game.state.party.currentInfluence = 10;

        Game.addWorkNotif(`${current.icon} Corrente`, `Ti sei unito alla corrente "${current.name}". ${current.bonus}.`, `Giorno ${Game.state.day}`);
        if (window.SR) SR.announce(`Corrente ${current.name} attivata.`, 'assertive');
        _injectPartyUI();
        return true;
    }

    /* ── Il giocatore lascia la corrente ─────── */
    function leaveCurrent() {
        const currentId = Game.state.party.currentId;
        if (!currentId) return;
        Game.state.party.currentId = null;
        Game.state.party.currentInfluence = 0;
        Game.changeStat('stress', 8);
        Game.changeReputazione(-3);
        Game.addWorkNotif('🚪 Corrente', 'Hai lasciato la corrente. Stress +8, Reputazione -3.', `Giorno ${Game.state.day}`);
        _injectPartyUI();
    }

    /* ── Calcola distanza ideologica tra due partiti ── */
    function ideologyDistance(matrixA, matrixB) {
        const axes = ['tasse', 'immigrazione', 'ambiente', 'difesa', 'diritti'];
        const sumSq = axes.reduce((acc, ax) => acc + Math.pow((matrixA[ax] || 0) - (matrixB[ax] || 0), 2), 0);
        return Math.sqrt(sumSq);
    }

    /* ── Ottieni coalizioni possibili ────────── */
    async function getPossibleCoalitions() {
        const parties = await getAvailableParties();
        const myMatrix = Game.state.party.ideologyMatrix;
        return parties
            .filter(p => p.id !== Game.state.party.id)
            .map(p => ({
                party: p,
                distance: ideologyDistance(myMatrix, p.ideologyMatrix),
                compatible: ideologyDistance(myMatrix, p.ideologyMatrix) < 10,
            }))
            .sort((a, b) => a.distance - b.distance);
    }

    /* ── Effetti giornalieri partito/corrente ── */
    async function _dailyPartyEffects() {
        if (!Game.state.party.id) return;
        const parties = await getAvailableParties();
        const party = parties.find(p => p.id === Game.state.party.id);
        if (!party) return;

        // Effetti corrente
        const currentId = Game.state.party.currentId;
        if (currentId) {
            const current = party.currents?.find(c => c.id === currentId);
            if (current) {
                // Influenza cresce lentamente
                Game.state.party.currentInfluence = Math.min(100, Game.state.party.currentInfluence + 1);
            }
        }

        // Bonus partito contestuali
        const city = Game.state.city;
        const cityPop = city?.population || 100000;
        party.bonuses?.forEach(b => {
            if (_evalCondition(b.condition, { cityPop, city })) {
                if (b.stat === 'urbanPopularity') Game.changeReputazione(Math.round(b.value * 10));
                if (b.stat === 'money') Game.changeMoney(b.value);
            }
        });
    }

    /* ── Applica effetti permanenti partito ──── */
    async function _applyActiveEffects() {
        if (!Game.state.party.id) return;
        const parties = await getAvailableParties();
        const party = parties.find(p => p.id === Game.state.party.id);
        if (!party) return;
        // Store reference for other modules
        Game.state.party._partyData = party;
    }

    /* ── Genera mentori per il partito scelto ── */
    async function _assignMentorsForParty(party, nationId) {
        try {
            const res = await fetch('data/mentors.json?v=' + Date.now());
            const allMentors = await res.json();
            const pool = allMentors[nationId] || {};
            // Cerca mentori allineati all'ideologia
            const ideologyKey = party.ideology.split('-')[0]; // 'social', 'conservative', 'green'
            const candidates = Object.values(pool).flat().slice(0, 6);
            // Assegna 3 mentori casuali (seed per riproducibilità)
            const seed = (Game.state.gameId || 0) + nationId.length;
            const selected = candidates
                .sort(() => Math.sin(seed + candidates.indexOf(candidates[0])) - 0.5)
                .slice(0, 3);
            if (!Game.state.partyMentors) Game.state.partyMentors = [];
            Game.state.partyMentors = selected.map(m => ({
                ...m,
                partyId: party.id,
                relation: 50,
                loyalty: 60,
                active: true,
            }));
        } catch (e) {
            console.warn('[Parties] Impossibile assegnare mentori:', e);
        }
    }

    /* ── Verifica accesso progressivo alle città ── */
    function _checkCareerAccess() {
        const careerLevel = Game.state.career?.level || 0;
        const city = Game.state.city;
        if (!city) return;
        const cityLevel = city.tier || 2;
        // Livello 0-1: solo comuni e città (tier <= 2)
        // Livello 2+: capoluoghi (tier 3)
        // Livello 3+: metropoli (tier 4)
        const maxAccessible = careerLevel >= 3 ? 4 : careerLevel >= 2 ? 3 : 2;
        if (cityLevel > maxAccessible) {
            Game.addWorkNotif('🔒 Accesso Limitato', `Non hai ancora la carriera sufficiente per operare attivamente in questa città.`, `Giorno ${Game.state.day}`);
        }
    }

    /* ── Valuta condizione bonus/malus ──────── */
    function _evalCondition(condition, context) {
        if (!condition || condition === 'always') return true;
        if (condition === 'firstJoin') return Game.state.day === Game.state.party.joinedDay;
        if (condition === 'metropolis') return context?.cityPop > 500000;
        if (condition.startsWith('cityLevel')) {
            const op = condition.includes('>=') ? '>=' : '>';
            const val = parseInt(condition.split(op)[1]);
            const cityTier = context?.city?.tier || 2;
            return op === '>=' ? cityTier >= val : cityTier > val;
        }
        if (condition.startsWith('cityPopulation')) {
            const val = parseInt(condition.split('<')[1]);
            return (context?.cityPop || 0) < val;
        }
        return true;
    }

    /* ── Applica statistica generica ─────────── */
    function _applyStat(stat, value) {
        if (stat === 'reputazione') Game.changeReputazione(value);
        else if (stat === 'reputazioneNazionale') Game.changeReputazione(value, 'nazionale');
        else if (stat === 'money') Game.changeMoney(value);
        else if (stat === 'coherence') Game.changeStat('coherence', value);
        else if (stat === 'stress') Game.changeStat('stress', value);
        else if (stat === 'morale') Game.changeStat('morale', value);
    }

    /* ── Inietta UI partito nel pannello stats ── */
    async function _injectPartyUI() {
        const statsBody = document.getElementById('stats-body');
        if (!statsBody) return;

        let section = statsBody.querySelector('.party-section');
        if (!section) {
            section = document.createElement('div');
            section.className = 'party-section';
            statsBody.appendChild(section);
        }

        const partyState = Game.state.party;
        let html = `<h4 class="stats-section-title">🏛️ Partito Politico</h4>`;

        if (!partyState.id) {
            const parties = await getAvailableParties();
            html += `<p class="party-hint">Non sei iscritto ad alcun partito. Scegli la tua affiliazione politica.</p>`;
            html += `<div class="party-list">`;
            parties.forEach(p => {
                html += `
                    <div class="party-card" style="border-left:4px solid ${p.color}">
                        <div class="party-card-header">
                            <span class="party-icon">${p.icon}</span>
                            <span class="party-name">${Game.esc(p.name)}</span>
                            <span class="party-ideology">${Game.esc(p.ideology)}</span>
                        </div>
                        <div class="party-ideology-bar">
                            ${_renderIdeologyBar(p.ideologyMatrix)}
                        </div>
                        <div class="party-bonuses">${p.bonuses.map(b => `✅ ${Game.esc(b.label)}`).join('<br>')}</div>
                        <button class="party-join-btn" data-party="${p.id}">Iscriviti</button>
                    </div>
                `;
            });
            html += `</div>`;
            section.innerHTML = html;

            section.querySelectorAll('.party-join-btn').forEach(btn => {
                btn.addEventListener('click', () => joinParty(btn.dataset.party));
            });
            return;
        }

        // Partito attivo
        const parties = await getAvailableParties();
        const party = parties.find(p => p.id === partyState.id);
        if (!party) { section.innerHTML = html + `<p>Dati partito non disponibili.</p>`; return; }

        const currentData = party.currents?.find(c => c.id === partyState.currentId);
        html += `
            <div class="party-active" style="border-left:4px solid ${party.color}">
                <div class="party-active-header">
                    <span class="party-icon">${party.icon}</span>
                    <strong>${Game.esc(party.name)}</strong>
                    <span class="party-ideology-tag">${Game.esc(party.ideology)}</span>
                </div>
                <div class="party-ideology-bar">${_renderIdeologyBar(party.ideologyMatrix)}</div>
                <div class="party-joined">Iscritto dal giorno ${partyState.joinedDay}</div>
            </div>
        `;

        // Correnti
        html += `<h5 class="party-currents-title">Correnti Interne</h5>`;
        if (!currentData) {
            html += `<p class="party-hint">Scegli una corrente per ottenere bonus specifici.</p>`;
            html += `<div class="party-currents-list">`;
            (party.currents || []).forEach(c => {
                html += `
                    <div class="party-current-card">
                        <span class="current-icon">${c.icon}</span>
                        <div class="current-info">
                            <strong>${Game.esc(c.name)}</strong>
                            <span class="current-leader">Leader: ${Game.esc(c.leader)}</span>
                            <span class="current-influence">Influenza interna: ${c.influence}%</span>
                            <div class="current-bonus">✅ ${Game.esc(c.bonus)}</div>
                            <div class="current-malus">⚠️ ${Game.esc(c.malus)}</div>
                        </div>
                        <button class="current-join-btn" data-current="${c.id}">Unisciti</button>
                    </div>
                `;
            });
            html += `</div>`;
        } else {
            html += `
                <div class="current-active">
                    <span class="current-icon">${currentData.icon}</span>
                    <div class="current-info">
                        <strong>${Game.esc(currentData.name)}</strong>
                        <div class="current-bonus">✅ ${Game.esc(currentData.bonus)}</div>
                        <div class="current-malus">⚠️ ${Game.esc(currentData.malus)}</div>
                        <div class="current-influence-bar">
                            <span>Influenza: ${partyState.currentInfluence}%</span>
                            <progress max="100" value="${partyState.currentInfluence}"></progress>
                        </div>
                    </div>
                    <button class="current-leave-btn">Lascia Corrente</button>
                </div>
            `;
        }

        // Coalizioni possibili
        const coalitions = await getPossibleCoalitions();
        html += `<h5 class="party-currents-title">Coalizioni Possibili</h5><div class="coalition-list">`;
        coalitions.slice(0, 3).forEach(c => {
            html += `
                <div class="coalition-card ${c.compatible ? 'coalition-ok' : 'coalition-far'}">
                    <span>${c.party.icon} ${Game.esc(c.party.name)}</span>
                    <span class="coalition-compat">${c.compatible ? '✅ Compatibile' : '⚠️ Distante'} (${c.distance.toFixed(1)})</span>
                </div>
            `;
        });
        html += `</div>`;

        section.innerHTML = html;

        // Bind events
        section.querySelectorAll('.current-join-btn').forEach(btn => {
            btn.addEventListener('click', () => joinCurrent(btn.dataset.current));
        });
        const leaveBtn = section.querySelector('.current-leave-btn');
        if (leaveBtn) leaveBtn.addEventListener('click', () => leaveCurrent());
    }

    /* ── Render barre assi ideologici ────────── */
    function _renderIdeologyBar(matrix) {
        const labels = { tasse: 'Tasse', immigrazione: 'Immigraz.', ambiente: 'Ambiente', difesa: 'Difesa', diritti: 'Diritti' };
        return Object.entries(labels).map(([key, label]) => {
            const val = matrix[key] || 0;
            const pct = ((val + 10) / 20 * 100).toFixed(0);
            const color = val > 3 ? '#2d6a4f' : val < -3 ? '#e63946' : '#888';
            return `<div class="ideology-axis"><span>${label}</span><div class="ideology-bar-track"><div class="ideology-bar-fill" style="width:${pct}%;background:${color}"></div></div><span>${val > 0 ? '+' : ''}${val}</span></div>`;
        }).join('');
    }

    return { init, joinParty, joinCurrent, leaveCurrent, getAvailableParties,
             getPossibleCoalitions, ideologyDistance, loadPartiesForNation };
})();

if (typeof window !== 'undefined') window.Parties = Parties;
