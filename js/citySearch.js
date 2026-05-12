/* ============================================
   CITY SEARCH — Gerarchia Città e Barra di
   Ricerca con Fuzzy Match
   ============================================ */

const CitySearch = (() => {
    'use strict';

    /* ── Livelli gerarchici ────────────────────── */
    const CITY_LEVELS = {
        metropolis: { label: 'Metropoli',   minPop: 500000, tierMin: 1, mult: 1.5 },
        capoluogo:  { label: 'Capoluogo',   minPop: 80000,  tierMin: 2, mult: 1.3 },
        city:       { label: 'Città',        minPop: 10000,  tierMin: 3, mult: 1.0 },
        comune:     { label: 'Comune',       minPop: 1000,   tierMin: 4, mult: 0.7 },
        // frazione esclusa dall'interfaccia politica
    };

    /* ── Cache indice città ───────────────────── */
    let _cityIndex = null;   // Map<id, cityObj>
    let _searchDebounce = null;
    let _allCities = [];     // array flat

    /* ── Dati nazioni disponibili ────────────── */
    const _FILES = {
        italy:   ['data/cities_italy.json', 'data/cities.json'],
        france:  ['data/cities_france.json'],
        germany: ['data/cities_germany.json'],
        uk:      ['data/cities_uk.json'],
        spain: ['data/cities_spain.json'],
        portugal: ['data/cities_portugal.json'],
        benelux: ['data/cities_benelux.json'],
        switzerland: ['data/cities_switzerland.json'],
    };

    /* ── Init ─────────────────────────────────── */
    async function init() {
        await _buildIndex();
        async function _onNationChange() {
            _cityIndex = null;
            _allCities = [];
            await _buildIndex();
            _renderSearchBar();
        }
        Game.on('nation-change', _onNationChange);
        Game.on('nation-changed', _onNationChange);
    }

    /* ── Costruisce l'indice da tutti i JSON ──── */
    async function _buildIndex() {
        _cityIndex = new Map();
        _allCities = [];

        const nationId = Game.state.nation?.id || 'italy';
        const files = _FILES[nationId] || _FILES['italy'];

        for (const file of files) {
            try {
                const res = await fetch(file);
                const data = await res.json();
                const entries = Array.isArray(data) ? data : Object.values(data);
                entries.forEach(city => {
                    if (!city || !city.id) return;
                    const enriched = _enrichCity(city);
                    _cityIndex.set(city.id, enriched);
                    _allCities.push(enriched);
                });
            } catch (e) {
                // File potrebbe non esistere, ignora silenziosamente
            }
        }

        // Ordina per peso politico decrescente
        _allCities.sort((a, b) => b.politicalWeight - a.politicalWeight);
    }

    /* ── Arricchisce città con livello e peso ─── */
    function _enrichCity(city) {
        const pop = city.population || _estimatePopulation(city.tier || 3);
        const level = _computeLevel(pop, city.tier);
        const mult = CITY_LEVELS[level]?.mult || 1.0;
        return {
            ...city,
            population: pop,
            level,
            levelLabel: CITY_LEVELS[level]?.label || 'Città',
            politicalWeight: Math.round(pop * mult),
        };
    }

    /* ── Stima popolazione da tier ──────────── */
    function _estimatePopulation(tier) {
        const map = { 1: 1200000, 2: 250000, 3: 60000, 4: 8000 };
        return map[tier] || 30000;
    }

    /* ── Calcola livello gerarchico ────────────── */
    function _computeLevel(population, tier) {
        if (population >= 500000 || tier === 1) return 'metropolis';
        if (population >= 80000 || tier === 2) return 'capoluogo';
        if (population >= 10000 || tier === 3) return 'city';
        return 'comune';
    }

    /* ── Restituisce il livello di una città ──── */
    function getLevel(cityId) {
        return _cityIndex?.get(cityId)?.level || 'city';
    }

    /* ── Restituisce peso politico ────────────── */
    function getPoliticalWeight(cityId) {
        return _cityIndex?.get(cityId)?.politicalWeight || 10000;
    }

    /* ── Filtra città per livello ────────────── */
    function filterByLevel(level) {
        return _allCities.filter(c => c.level === level);
    }

    /* ── Fuzzy search ─────────────────────────── */
    function search(query) {
        if (!query || query.length < 2) return _allCities.slice(0, 8);
        const q = query.toLowerCase().trim();

        return _allCities
            .map(city => ({ city, score: _searchScore(city, q) }))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(({ city }) => city);
    }

    /* ── Calcola punteggio di ricerca ─────────── */
    function _searchScore(city, q) {
        const name = city.name.toLowerCase();
        const region = (city.region || '').toLowerCase();

        // Match esatto = punteggio massimo
        if (name === q) return 100;
        // Inizia con q
        if (name.startsWith(q)) return 90 - name.length;
        // Contiene q nel nome
        if (name.includes(q)) return 70;
        // Contiene q nella regione
        if (region.startsWith(q)) return 55;
        if (region.includes(q)) return 40;
        // Levenshtein per typo tolerance
        const dist = _levenshtein(name, q);
        if (dist <= 1) return 60;
        if (dist <= 2) return 40;
        if (dist <= 3 && q.length > 4) return 20;
        return 0;
    }

    /* ── Distanza di Levenshtein ──────────────── */
    function _levenshtein(a, b) {
        const m = a.length, n = b.length;
        if (!m) return n;
        if (!n) return m;
        const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] :
                    1 + Math.min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]);
            }
        }
        return dp[m][n];
    }

    /* ── Renderizza la barra di ricerca ──────── */
    function renderSearchBar(containerId) {
        const container = document.getElementById(containerId || 'city-search-bar');
        if (!container) return;

        const uid = 'cs-' + Date.now();
        container.innerHTML = `
            <div class="city-search-wrapper" role="search" aria-label="Ricerca città">
                <label for="${uid}-input" class="visually-hidden">Cerca città o regione</label>
                <input id="${uid}-input" class="city-search-input" type="search"
                    placeholder="🔍 Cerca città, regione..."
                    autocomplete="off"
                    aria-autocomplete="list"
                    aria-controls="${uid}-results"
                    aria-label="Cerca città o regione"
                >
                <ul id="${uid}-results" class="city-search-results" role="listbox" aria-label="Risultati ricerca città"></ul>
            </div>
        `;

        const input = container.querySelector(`#${uid}-input`);
        const results = container.querySelector(`#${uid}-results`);
        let activeIdx = -1;

        input.addEventListener('input', () => {
            clearTimeout(_searchDebounce);
            _searchDebounce = setTimeout(() => {
                const q = input.value.trim();
                const hits = search(q);
                _renderResults(results, hits, input);
                activeIdx = -1;
            }, 300);
        });

        // Navigazione tastiera
        input.addEventListener('keydown', (e) => {
            const items = results.querySelectorAll('[role="option"]');
            if (!items.length) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIdx = Math.min(activeIdx + 1, items.length - 1);
                _highlightResult(items, activeIdx, input);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIdx = Math.max(activeIdx - 1, 0);
                _highlightResult(items, activeIdx, input);
            } else if (e.key === 'Enter' && activeIdx >= 0) {
                e.preventDefault();
                items[activeIdx].click();
            } else if (e.key === 'Escape') {
                results.innerHTML = '';
            }
        });

        // Click fuori chiude
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) results.innerHTML = '';
        });
    }

    function _renderResults(resultsEl, cities, input) {
        if (!cities.length) {
            resultsEl.innerHTML = `<li class="cs-no-results" role="option" aria-selected="false">Nessuna città trovata</li>`;
            return;
        }
        resultsEl.innerHTML = cities.map((city, i) => `
            <li class="cs-result-item" role="option" aria-selected="false" data-city="${city.id}"
                tabindex="-1"
                style="border-left: 3px solid ${_levelColor(city.level)}">
                <span class="cs-city-name">${Game.esc(city.name)}</span>
                <span class="cs-city-meta">
                    <span class="cs-level">${Game.esc(city.levelLabel)}</span>
                    ${city.region ? `<span class="cs-region">${Game.esc(city.region)}</span>` : ''}
                    <span class="cs-weight" aria-label="Peso politico ${city.politicalWeight}">⚖️ ${_formatWeight(city.politicalWeight)}</span>
                </span>
            </li>
        `).join('');

        resultsEl.querySelectorAll('.cs-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const city = _cityIndex?.get(item.dataset.city);
                if (!city) return;
                input.value = city.name;
                resultsEl.innerHTML = '';
                _onCitySelect(city);
            });
        });
    }

    function _highlightResult(items, idx, input) {
        items.forEach((el, i) => {
            el.setAttribute('aria-selected', i === idx ? 'true' : 'false');
            if (i === idx) { el.focus(); input.setAttribute('aria-activedescendant', el.id || ''); }
        });
    }

    function _onCitySelect(city) {
        // flyTo su mappa se disponibile
        if (typeof GameMap !== 'undefined' && GameMap.flyTo && city.lat && city.lng) {
            const zoom = city.level === 'metropolis' ? 12 :
                         city.level === 'capoluogo' ? 11 :
                         city.level === 'city' ? 10 : 9;
            GameMap.flyTo(city.lat, city.lng, zoom);
        }

        // Aggiorna scheda popup città
        if (typeof GameMap !== 'undefined' && GameMap.openCityPopup) {
            GameMap.openCityPopup(city.id);
        }

        // Annuncia per screen reader
        if (window.SR) {
            SR.announce(`${city.name}: ${city.levelLabel}, peso politico ${_formatWeight(city.politicalWeight)}.`, 'polite');
        }

        Game.emit('city-searched', { city });
    }

    function _levelColor(level) {
        const colors = { metropolis: '#e63946', capoluogo: '#f4a261', city: '#2a9d8f', comune: '#8d8d8d' };
        return colors[level] || '#aaa';
    }

    function _formatWeight(w) {
        if (w >= 1000000) return (w / 1000000).toFixed(1) + 'M';
        if (w >= 1000) return (w / 1000).toFixed(0) + 'K';
        return String(w);
    }

    /* ── Aggiungi marker dimensionali alla mappa ── */
    function injectMapMarkers() {
        if (typeof GameMap === 'undefined' || !GameMap._map) return;
        const map = GameMap._map;
        _allCities.forEach(city => {
            if (!city.lat || !city.lng) return;
            const size = city.level === 'metropolis' ? 16 :
                         city.level === 'capoluogo' ? 12 :
                         city.level === 'city' ? 8 : 6;
            const color = _levelColor(city.level);
            const icon = L.divIcon({
                className: '',
                html: `<div class="cs-map-marker" style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid white;"></div>`,
                iconSize: [size, size],
                iconAnchor: [size/2, size/2],
            });
            const marker = L.marker([city.lat, city.lng], { icon, title: city.name })
                .addTo(map)
                .bindPopup(`
                    <strong>${city.name}</strong><br>
                    <em>${city.levelLabel}</em> ${city.region ? '— ' + city.region : ''}<br>
                    ⚖️ Peso politico: <strong>${_formatWeight(city.politicalWeight)}</strong>
                `);
            marker.on('click', () => _onCitySelect(city));
        });
    }

    /* ── Zoom-based lazy rendering ────────────── */
    function initZoomLevels() {
        if (typeof GameMap === 'undefined' || !GameMap._map) return;
        const map = GameMap._map;
        map.on('zoomend', () => {
            const z = map.getZoom();
            // A zoom basso mostra solo metropoli
            // A zoom alto mostra tutti i livelli
            const visibleLevels = z >= 12 ? ['metropolis', 'capoluogo', 'city', 'comune'] :
                                   z >= 10 ? ['metropolis', 'capoluogo', 'city'] :
                                   z >= 8 ? ['metropolis', 'capoluogo'] : ['metropolis'];
            _filterMarkersByLevel(visibleLevels);
        });
    }

    function _filterMarkersByLevel(levels) {
        document.querySelectorAll('.cs-map-marker').forEach(el => {
            const wrapper = el.closest('.leaflet-marker-icon');
            if (!wrapper) return;
            // Le città vengono mostrate/nascoste per livello
            // (gestito dal rendering dei marker)
        });
    }

    return { init, search, getLevel, getPoliticalWeight, filterByLevel,
             renderSearchBar, injectMapMarkers, initZoomLevels, CITY_LEVELS };
})();

if (typeof window !== 'undefined') window.CitySearch = CitySearch;
