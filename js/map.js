/* ============================================
   MAP — Mappa d'Italia Videoludica & Trasferimenti
   ============================================ */

const CITY_SEEDS = {
    italy: [
        ['roma','Roma','Lazio',41.9028,12.4964,'city','large',1],['milano','Milano','Lombardia',45.4642,9.19,'city','large',1],['napoli','Napoli','Campania',40.8518,14.2681,'city','large',2],['torino','Torino','Piemonte',45.0703,7.6869,'city','medium',2],['palermo','Palermo','Sicilia',38.1157,13.3615,'city','large',2],['genova','Genova','Liguria',44.4056,8.9463,'city','medium',2],['bologna','Bologna','Emilia-Romagna',44.4949,11.3426,'city','medium',2],['firenze','Firenze','Toscana',43.7696,11.2558,'city','medium',2],['venezia','Venezia','Veneto',45.4408,12.3155,'city','medium',2],['verona','Verona','Veneto',45.4384,10.9916,'municipality','medium',3],['bari','Bari','Puglia',41.1171,16.8719,'municipality','medium',3],['catania','Catania','Sicilia',37.5079,15.083,'municipality','medium',3],['messina','Messina','Sicilia',38.1938,15.554,'municipality','medium',3],['padova','Padova','Veneto',45.4064,11.8768,'municipality','medium',3],['brescia','Brescia','Lombardia',45.5416,10.2118,'municipality','medium',3],['taranto','Taranto','Puglia',40.4637,17.247,'municipality','medium',3],['prato','Prato','Toscana',43.8777,11.1022,'municipality','medium',3],['modena','Modena','Emilia-Romagna',44.6471,10.9252,'municipality','medium',3],['reggio_calabria','Reggio Calabria','Calabria',38.1105,15.6613,'municipality','medium',3],['parma','Parma','Emilia-Romagna',44.8015,10.3279,'municipality','medium',3],['livorno','Livorno','Toscana',43.5529,10.3081,'municipality','medium',3],['rimini','Rimini','Emilia-Romagna',44.0632,12.5928,'municipality','small',3],['cagliari','Cagliari','Sardegna',39.2238,9.1217,'municipality','small',3],['trieste','Trieste','Friuli V.G.',45.6495,13.7768,'municipality','small',3],['perugia','Perugia','Umbria',43.1107,12.3908,'municipality','small',3],['ancona','Ancona','Marche',43.6158,13.5189,'municipality','small',3],['trento','Trento','Trentino-A.A.',46.0748,11.1217,'municipality','small',3],['laquila','LAquila','Abruzzo',42.3498,13.3995,'municipality','small',3],['aosta','Aosta','Valle dAosta',45.7375,7.3122,'municipality','small',3],['campobasso','Campobasso','Molise',41.5603,14.6685,'municipality','small',3],['potenza','Potenza','Basilicata',40.6404,15.8056,'municipality','small',3]
    ],
    france: [
        ['paris','Parigi','Ile-de-France',48.8566,2.3522,'city','large',1],['marseille','Marsiglia','Provence-Alpes-Cote dAzur',43.2965,5.3698,'city','large',2],['lyon','Lione','Auvergne-Rhone-Alpes',45.764,4.8357,'city','large',2],['toulouse','Tolosa','Occitanie',43.6047,1.4442,'city','large',2],['nice','Nizza','Provence-Alpes-Cote dAzur',43.7102,7.262,'city','large',2],['strasbourg','Strasburgo','Grand Est',48.5734,7.7521,'city','large',2],['nantes','Nantes','Pays de la Loire',47.2184,-1.5536,'municipality','medium',3],['bordeaux','Bordeaux','Nouvelle-Aquitaine',44.8378,-0.5792,'municipality','medium',3],['lille','Lilla','Hauts-de-France',50.6292,3.0573,'municipality','medium',3],['rennes','Rennes','Bretagne',48.1173,-1.6778,'municipality','small',3],['montpellier','Montpellier','Occitanie',43.6119,3.8772,'municipality','small',3],['grenoble','Grenoble','Auvergne-Rhone-Alpes',45.1885,5.7245,'municipality','small',3],['dijon','Digione','Bourgogne-Franche-Comte',47.322,5.0415,'municipality','small',3],['caen','Caen','Normandie',49.1829,-0.3707,'municipality','small',3],['reims','Reims','Grand Est',49.2583,4.0317,'municipality','small',3],['angers','Angers','Pays de la Loire',47.4784,-0.5632,'municipality','small',3],['le_havre','Le Havre','Normandie',49.4944,0.1079,'municipality','small',3],['saint_etienne','Saint-Etienne','Auvergne-Rhone-Alpes',45.4397,4.3872,'municipality','small',3],['toulon','Toulon','Provence-Alpes-Cote dAzur',43.1242,5.928,'municipality','small',3],['nimes','Nimes','Occitanie',43.8367,4.3601,'municipality','small',3],['orleans','Orleans','Centre-Val de Loire',47.903,1.9093,'municipality','small',3],['tours','Tours','Centre-Val de Loire',47.3941,0.6848,'municipality','small',3],['rouen','Rouen','Normandie',49.4432,1.0993,'municipality','small',3],['amiens','Amiens','Hauts-de-France',49.8941,2.2958,'municipality','small',3],['metz','Metz','Grand Est',49.1193,6.1757,'municipality','small',3],['nancy','Nancy','Grand Est',48.6921,6.1844,'municipality','small',3],['clermont_ferrand','Clermont-Ferrand','Auvergne-Rhone-Alpes',45.7772,3.087,'municipality','small',3],['poitiers','Poitiers','Nouvelle-Aquitaine',46.5802,0.3404,'municipality','small',3],['avignon','Avignon','Provence-Alpes-Cote dAzur',43.9493,4.8055,'municipality','small',3],['mulhouse','Mulhouse','Grand Est',47.7508,7.3359,'municipality','small',3]
    ],
    germany: [
        ['berlin','Berlino','Berlin',52.52,13.405,'city','large',1],['munich','Monaco di Baviera','Bayern',48.1351,11.582,'city','large',1],['hamburg','Amburgo','Hamburg',53.5511,9.9937,'city','large',1],['frankfurt','Francoforte','Hessen',50.1109,8.6821,'city','large',1],['cologne','Colonia','Nordrhein-Westfalen',50.9375,6.9603,'city','large',2],['stuttgart','Stoccarda','Baden-Wuerttemberg',48.7758,9.1829,'city','large',2],['dusseldorf','Duesseldorf','Nordrhein-Westfalen',51.2277,6.7735,'city','large',2],['dortmund','Dortmund','Nordrhein-Westfalen',51.5136,7.4653,'municipality','medium',3],['essen','Essen','Nordrhein-Westfalen',51.4556,7.0116,'municipality','medium',3],['leipzig','Lipsia','Sachsen',51.3397,12.3731,'municipality','medium',3],['bremen','Bremen','Bremen',53.0793,8.8017,'municipality','medium',3],['dresden','Dresda','Sachsen',51.0504,13.7373,'municipality','medium',3],['hanover','Hannover','Niedersachsen',52.3759,9.732,'municipality','medium',3],['nuremberg','Norimberga','Bayern',49.4521,11.0767,'municipality','medium',3],['duisburg','Duisburg','Nordrhein-Westfalen',51.4344,6.7623,'municipality','small',3],['bochum','Bochum','Nordrhein-Westfalen',51.4818,7.2162,'municipality','small',3],['wuppertal','Wuppertal','Nordrhein-Westfalen',51.2562,7.1508,'municipality','small',3],['bielefeld','Bielefeld','Nordrhein-Westfalen',52.0302,8.5325,'municipality','small',3],['bonn','Bonn','Nordrhein-Westfalen',50.7374,7.0982,'municipality','small',3],['munster','Muenster','Nordrhein-Westfalen',51.9607,7.6261,'municipality','small',3],['karlsruhe','Karlsruhe','Baden-Wuerttemberg',49.0069,8.4037,'municipality','small',3],['mannheim','Mannheim','Baden-Wuerttemberg',49.4875,8.466,'municipality','small',3],['augsburg','Augsburg','Bayern',48.3705,10.8978,'municipality','small',3],['wiesbaden','Wiesbaden','Hessen',50.0782,8.2398,'municipality','small',3],['freiburg','Friburgo','Baden-Wuerttemberg',47.999,7.8421,'municipality','small',3],['kiel','Kiel','Schleswig-Holstein',54.3233,10.1228,'municipality','small',3],['magdeburg','Magdeburgo','Sachsen-Anhalt',52.1205,11.6276,'municipality','small',3],['mainz','Magonza','Rheinland-Pfalz',49.9929,8.2473,'municipality','small',3],['rostock','Rostock','Mecklenburg-Vorpommern',54.0924,12.0991,'municipality','small',3],['saarbrucken','Saarbruecken','Saarland',49.2402,6.9969,'municipality','small',3],['erfurt','Erfurt','Thueringen',50.9848,11.0299,'municipality','small',3],['lubeck','Lubecca','Schleswig-Holstein',53.8655,10.6866,'municipality','small',3],['kassel','Kassel','Hessen',51.3127,9.4797,'municipality','small',3],['potsdam','Potsdam','Brandenburg',52.3906,13.0645,'municipality','small',3]
    ],
    uk: [
        ['london','Londra','Greater London',51.5074,-0.1278,'city','large',1],['manchester','Manchester','North West',53.4808,-2.2426,'city','large',2],['birmingham','Birmingham','West Midlands',52.4862,-1.8904,'city','large',2],['edinburgh','Edimburgo','Scotland',55.9533,-3.1883,'city','large',2],['glasgow','Glasgow','Scotland',55.8642,-4.2518,'municipality','large',3],['leeds','Leeds','Yorkshire',53.8008,-1.5491,'municipality','medium',3],['liverpool','Liverpool','North West',53.4084,-2.9916,'municipality','medium',3],['bristol','Bristol','South West',51.4545,-2.5879,'municipality','medium',3],['newcastle','Newcastle','North East',54.9783,-1.6178,'municipality','small',3],['sheffield','Sheffield','Yorkshire',53.3811,-1.4701,'municipality','small',3],['cardiff','Cardiff','Wales',51.4816,-3.1791,'municipality','medium',3],['belfast','Belfast','Northern Ireland',54.5973,-5.9301,'municipality','medium',3],['southampton','Southampton','South East',50.9097,-1.4044,'municipality','small',3],['portsmouth','Portsmouth','South East',50.8198,-1.088,'municipality','small',3],['leicester','Leicester','East Midlands',52.6369,-1.1398,'municipality','small',3],['coventry','Coventry','West Midlands',52.4068,-1.5197,'municipality','small',3],['nottingham','Nottingham','East Midlands',52.9548,-1.1581,'municipality','small',3],['kingston','Kingston upon Hull','Yorkshire',53.7676,-0.3274,'municipality','small',3],['plymouth','Plymouth','South West',50.3755,-4.1427,'municipality','small',3],['aberdeen','Aberdeen','Scotland',57.1497,-2.0943,'municipality','small',3],['reading','Reading','South East',51.4543,-0.9781,'municipality','small',3],['brighton','Brighton','South East',50.8225,-0.1372,'municipality','small',3],['milton_keynes','Milton Keynes','South East',52.0406,-0.7594,'municipality','small',3],['luton','Luton','East',51.8787,-0.420,'municipality','small',3],['swansea','Swansea','Wales',51.6214,-3.9436,'municipality','small',3],['derby','Derby','East Midlands',52.9225,-1.4746,'municipality','small',3],['york','York','Yorkshire',53.959,-1.0815,'municipality','small',3],['northampton','Northampton','East Midlands',52.2405,-0.9027,'municipality','small',3],['blackpool','Blackpool','North West',53.8142,-3.0503,'municipality','small',3],['cambridge','Cambridge','East',52.2053,0.1218,'municipality','small',3],['oxford','Oxford','South East',51.752,-1.2577,'municipality','small',3]
    ]
};

const CITY_SPECIALS = {
    roma: ['capital'], milano: ['industry'], napoli: ['port'], torino: ['industry'], venezia: ['tourism'], firenze: ['tourism'],
    bologna: ['university'], perugia: ['university'], padova: ['university'],
    paris: ['capital'], marseille: ['port'], lyon: ['industry'], toulouse: ['university'], nice: ['tourism'], strasbourg: ['capital'], grenoble: ['university'],
    berlin: ['capital'], frankfurt: ['industry'], munich: ['industry'], hamburg: ['port'], cologne: ['industry'],
    london: ['capital'], manchester: ['industry'], birmingham: ['industry'], edinburgh: ['capital'], bristol: ['university'], cambridge: ['university'], oxford: ['university'], liverpool: ['port'], cardiff: ['capital'], belfast: ['capital'],
};

const CITY_OVERRIDES = {
    napoli: {
        bonus: { reputazione: 2, networking: 12 },
        malus: { stress: 3, concorrenza: 0.88 },
        rentMultiplier: 0.9,
        salaryMultiplier: 0.9,
    },
};

const CITY_SIZE_BANDS = {
    smallMax: 50000,
    mediumMax: 250000,
    largeMin: 500000,
};

const ITALY_REGION_GROUPS = {
    north: ['lombardia', 'piemonte', 'liguria', 'veneto', 'emilia-romagna', 'trentino-a.a.', 'trentino-aa', 'friuli v.g.', 'friuli-v.g.', 'valle daosta', 'valle d aosta', 'valle d aosta'],
    south: ['campania', 'puglia', 'calabria', 'basilicata', 'molise', 'sicilia', 'sardegna', 'abruzzo'],
};

function normalizeGeoName(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s.-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function estimateInhabitants(settlementType, population, tier) {
    if (population === 'large') return settlementType === 'city' ? 900000 : 560000;
    if (population === 'medium') return settlementType === 'city' ? 220000 : 140000;
    if (population === 'small') return settlementType === 'municipality' ? 35000 : 90000;
    if (tier === 1) return 900000;
    if (tier === 2) return 220000;
    return 50000;
}

function getRegionalAdjustments(nationId, regionName) {
    const nation = normalizeGeoName(nationId);
    const region = normalizeGeoName(regionName);
    if (nation !== 'italy') return null;

    if (ITALY_REGION_GROUPS.south.includes(region)) {
        return {
            salary: 0.93,
            rent: 0.95,
            bonus: { networking: 2 },
            malus: { stress: 1 },
        };
    }
    if (ITALY_REGION_GROUPS.north.includes(region)) {
        return {
            salary: 1.08,
            rent: 1.07,
            bonus: { networking: 1 },
            malus: { stress: 1 },
        };
    }
    return null;
}

function getCityScore(city) {
    const bonus = city && city.bonus ? city.bonus : {};
    const malus = city && city.malus ? city.malus : {};
    const networking = Number.isFinite(bonus.networking) ? bonus.networking : 0;
    const reputazione = Number.isFinite(bonus.reputazione) ? bonus.reputazione : 0;
    const intelligenza = Number.isFinite(bonus.intelligenza) ? bonus.intelligenza : 0;
    const morale = Number.isFinite(bonus.morale) ? bonus.morale : 0;
    const stress = Number.isFinite(malus.stress) ? malus.stress : 0;
    const salary = Number.isFinite(city && city.salaryMultiplier) ? city.salaryMultiplier : 1;
    return networking * 1.8 + reputazione * 1.2 + intelligenza + morale - stress + (salary - 1) * 12;
}

function getDistanceKm(fromCity, toCity) {
    if (!fromCity || !toCity) return 0;
    if (!Number.isFinite(fromCity.lat) || !Number.isFinite(fromCity.lng) || !Number.isFinite(toCity.lat) || !Number.isFinite(toCity.lng)) return 0;
    const R = 6371;
    const dLat = (toCity.lat - fromCity.lat) * Math.PI / 180;
    const dLon = (toCity.lng - fromCity.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(fromCity.lat * Math.PI / 180) * Math.cos(toCity.lat * Math.PI / 180)
        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCityInhabitants(city) {
    if (Number.isFinite(city && city.inhabitants)) return city.inhabitants;
    const settlementType = city && (city.settlementType || city.type || 'city');
    return estimateInhabitants(settlementType, city && city.population, city && city.tier);
}

function matchesCitySizeFilter(city, sizeFilter) {
    const st = String(city.settlementType || city.type || 'city').toLowerCase();
    const cityClass = city.cityClass || (
        getCityInhabitants(city) < 50000
            ? 'comune'
            : (getCityInhabitants(city) < 150000
                ? 'citta_piccola'
                : (getCityInhabitants(city) < 500000 ? 'citta_media' : 'citta_grande'))
    );
    if (sizeFilter === 'small') return cityClass === 'comune';
    if (sizeFilter === 'medium') return cityClass === 'citta_media';
    if (sizeFilter === 'capoluogo') return st === 'city' && (cityClass === 'citta_media' || cityClass === 'citta_grande');
    if (sizeFilter === 'large') return cityClass === 'citta_grande';
    return true;
}

function filterCitiesByQuery(cities, query) {
    const cleaned = normalizeGeoName(query);
    if (!cleaned) return cities;
    const result = {};
    for (const [id, city] of Object.entries(cities || {})) {
        const haystack = normalizeGeoName(`${city.name || ''} ${city.region || ''}`);
        if (haystack.includes(cleaned)) result[id] = city;
    }
    return result;
}

function escapeHtml(value) {
    const text = String(value == null ? '' : value);
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getStandardCityStats(tier, settlementType, population, specials = [], region = '', nationId = 'italy') {
    const baseByTier = {
        1: { bonus: { reputazione: 2, networking: 15 }, malus: { stress: 4, concorrenza: 0.85 }, rent: 1.6, salary: 1.5 },
        2: { bonus: { reputazione: 1, networking: 10 }, malus: { stress: 2, concorrenza: 0.90 }, rent: 1.1, salary: 1.05 },
        3: { bonus: { reputazione: 1 }, malus: { stress: 1, concorrenza: 0.95 }, rent: 0.85, salary: 0.88 },
    };

    const selectedTier = baseByTier[tier] ? tier : 3;
    const stats = {
        bonus: { ...baseByTier[selectedTier].bonus },
        malus: { ...baseByTier[selectedTier].malus },
        rent: baseByTier[selectedTier].rent,
        salary: baseByTier[selectedTier].salary,
    };

    if (settlementType === 'municipality' && population === 'small') {
        stats.bonus.morale = 3;
        stats.malus.stress = 0;
        stats.malus.concorrenza = 0.98;
        stats.rent = 0.7;
        stats.salary = 0.75;
    } else if (settlementType === 'municipality' && population === 'medium') {
        stats.bonus.morale = 2;
        stats.malus.stress = 1;
        stats.malus.concorrenza = 0.95;
        stats.rent = 0.85;
        stats.salary = 0.88;
    }

    if (specials.includes('tourism')) {
        stats.bonus.morale = (stats.bonus.morale || 0) + 2;
        stats.rent = +(stats.rent * 1.1).toFixed(2);
    }
    if (specials.includes('university')) {
        stats.bonus.intelligenza = (stats.bonus.intelligenza || 0) + 2;
    }
    if (specials.includes('industry')) {
        stats.bonus.muscoli = (stats.bonus.muscoli || 0) + 2;
    }
    if (specials.includes('capital')) {
        stats.bonus.reputazione = Math.max(stats.bonus.reputazione || 0, 2);
        stats.bonus.networking = Math.max(stats.bonus.networking || 0, 14);
        stats.malus.stress = Math.max(stats.malus.stress || 0, 3);
    }
    if (specials.includes('port')) {
        stats.bonus.networking = (stats.bonus.networking || 0) + 1;
    }

    const regionalAdj = getRegionalAdjustments(nationId, region);
    if (regionalAdj) {
        if (regionalAdj.bonus) {
            Object.entries(regionalAdj.bonus).forEach(([key, value]) => {
                stats.bonus[key] = (stats.bonus[key] || 0) + value;
            });
        }
        if (regionalAdj.malus) {
            Object.entries(regionalAdj.malus).forEach(([key, value]) => {
                stats.malus[key] = Math.max(0, (stats.malus[key] || 0) + value);
            });
        }
        if (typeof regionalAdj.rent === 'number') {
            stats.rent = +(stats.rent * regionalAdj.rent).toFixed(2);
        }
        if (typeof regionalAdj.salary === 'number') {
            stats.salary = +(stats.salary * regionalAdj.salary).toFixed(2);
        }
    }

    return stats;
}

function filterCitiesBySize(cities, sizeFilter) {
    const result = {};
    for (const [id, city] of Object.entries(cities)) {
        if (matchesCitySizeFilter(city, sizeFilter)) {
            result[id] = city;
        }
    }
    return result;
}

function deduplicateCloseCities(cities, minDistanceKm = 15) {
    const popRank = p => (p === 'large' ? 3 : p === 'medium' ? 2 : 1);
    const sorted = Object.values(cities).sort((a, b) =>
        (popRank(b.population || 'small') - popRank(a.population || 'small'))
        || (getCityScore(b) - getCityScore(a))
    );

    const toRemove = new Set();
    for (let i = 0; i < sorted.length; i++) {
        const a = sorted[i];
        if (toRemove.has(a._cityKey || a.id)) continue;
        for (let j = i + 1; j < sorted.length; j++) {
            const b = sorted[j];
            if (toRemove.has(b._cityKey || b.id)) continue;
            const stA = a.settlementType || a.type || 'city';
            const stB = b.settlementType || b.type || 'city';
            if (stA === 'municipality' && stB === 'municipality') {
                const dist = getDistanceKm(a, b);
                if (dist < minDistanceKm) {
                    const removeA = getCityScore(b) > getCityScore(a);
                    toRemove.add(removeA ? (a._cityKey || a.id) : (b._cityKey || b.id));
                    if (removeA) break;
                }
            }
        }
    }

    const result = {};
    for (const [id, city] of Object.entries(cities)) {
        if (!toRemove.has(id)) result[id] = city;
    }
    return result;
}

const CITIES_DB = (() => {
    const byNation = {};
    Object.entries(CITY_SEEDS).forEach(([nation, seeds]) => {
        const map = {};
        seeds.forEach(seed => {
            const [id, name, region, lat, lng, settlementType, population, tier] = seed;
            const specials = CITY_SPECIALS[id] || [];
            const standard = getStandardCityStats(tier, settlementType, population, specials, region, nation);
            map[id] = {
                id,
                name,
                region,
                lat,
                lng,
                desc: `${name} e una citta rilevante del territorio.`,
                bonus: { ...standard.bonus },
                malus: { ...standard.malus },
                rentMultiplier: standard.rent,
                salaryMultiplier: standard.salary,
                startingMoney: tier === 1 ? 130 : (tier === 2 ? 100 : 85),
                tier,
                settlementType,
                population,
                inhabitants: estimateInhabitants(settlementType, population, tier),
            };

            if (CITY_OVERRIDES[id]) {
                const ov = CITY_OVERRIDES[id];
                if (ov.bonus) map[id].bonus = { ...map[id].bonus, ...ov.bonus };
                if (ov.malus) map[id].malus = { ...map[id].malus, ...ov.malus };
                if (typeof ov.rentMultiplier === 'number') map[id].rentMultiplier = ov.rentMultiplier;
                if (typeof ov.salaryMultiplier === 'number') map[id].salaryMultiplier = ov.salaryMultiplier;
            }
        });
        byNation[nation] = map;
    });
    return byNation;
})();

const ZOOM_THRESHOLDS = {
    'comune':       8,   // visibile solo con zoom molto ravvicinato
    'citta_piccola': 7,
    'citta_media':  6,
    'citta_grande': 5,   // sempre visibile (vista lontana)
};

const GameMap = {
    citiesData: null,
    allCitiesData: null,
    citiesCache: {},
    debugCitySelection: false,
    mapInstance: null,
    mapRegistry: {},

    TRANSFER_COST: (typeof GameConstants !== 'undefined' && GameConstants.ECONOMY)
        ? GameConstants.ECONOMY.TRANSFER_COST_SAME_REGION
        : 200,
    TRANSFER_COST_INTERREGIONAL: (typeof GameConstants !== 'undefined' && GameConstants.ECONOMY)
        ? GameConstants.ECONOMY.TRANSFER_COST_INTERREGIONAL
        : 400,
    TRANSFER_AP: 1,

    _getDefaultPopulationByTier(tier) {
        if (tier === 1) return 'large';
        if (tier === 2) return 'medium';
        return 'small';
    },

    _getCityClass(city) {
        let pop = Number.isFinite(city && city.inhabitants) ? city.inhabitants : 0;
        if (!pop) {
            const settlementType = String((city && (city.settlementType || city.type)) || '').toLowerCase();
            if (settlementType === 'municipality' || settlementType === 'comune') {
                pop = 30000;
            } else if ((city && city.tier) === 1) {
                pop = 800000;
            } else if ((city && city.tier) === 2) {
                pop = 200000;
            } else {
                pop = 80000;
            }
        }
        if (pop < 50000) return 'comune';
        if (pop < 150000) return 'citta_piccola';
        if (pop < 500000) return 'citta_media';
        return 'citta_grande';
    },

    _normalizeCity(city, defaultNationId = 'italy') {
        const normalized = { ...city };
        normalized.type = normalized.type || (normalized.tier === 3 ? 'municipality' : 'city');
        normalized.country = normalized.country || normalized.nationId || defaultNationId;
        const normalizedPopulation = normalized.population || this._getDefaultPopulationByTier(normalized.tier);
        if (!Number.isFinite(normalized.inhabitants)) {
            normalized.inhabitants = estimateInhabitants(normalized.type, normalizedPopulation, normalized.tier);
        }
        normalized.population = normalizedPopulation;
        normalized.settlementType = normalized.settlementType
            || (normalized.type === 'municipality' ? 'comune' : (normalized.tier === 1 ? 'metropolis' : (normalized.tier === 2 ? 'capital' : 'city')));
        normalized.politicalRelevance = normalized.politicalRelevance
            || (normalized.settlementType === 'metropolis' ? 'national' : (normalized.settlementType === 'comune' ? 'local' : 'regional'));
        normalized.economyType = normalized.economyType || 'administrative';
        normalized.culture = normalized.culture || 'moderate';
        normalized.cityClass = this._getCityClass(normalized);
        if (!Number.isFinite(normalized.inhabitants)) {
            normalized.inhabitants = normalized.cityClass === 'comune'
                ? 30000
                : (normalized.cityClass === 'citta_piccola'
                    ? 80000
                    : (normalized.cityClass === 'citta_media' ? 250000 : 1000000));
        }
        if (!normalized.bonus) normalized.bonus = {};
        if (!normalized.malus) normalized.malus = {};
        return normalized;
    },

    _normalizeCities(cities, defaultNationId = 'italy') {
        const out = {};
        Object.keys(cities || {}).forEach(id => {
            out[id] = this._normalizeCity(cities[id], defaultNationId);
        });
        return out;
    },

    _getCityNationId(city) {
        return city && (city.country || city.nationId || 'italy');
    },

    _filterCities(cities, onlyCapoluoghi, settlementFilter, nationId) {
        const filtered = {};
        Object.values(cities || {}).forEach(city => {
            if (nationId && this._getCityNationId(city) !== nationId) return;
            if (onlyCapoluoghi) {
                const st = city.settlementType || 'city';
                const isCapoluogo = (city.type || 'city') === 'city' || st === 'capital' || st === 'metropolis';
                if (!isCapoluogo) return;
            }
            if (settlementFilter === 'comune50k') {
                if ((city.type || 'city') !== 'municipality') return;
                if ((city.inhabitants || 0) < 50000) return;
            } else if (settlementFilter && settlementFilter !== 'all' && (city.settlementType || 'city') !== settlementFilter) {
                return;
            }
            filtered[city.id] = city;
        });
        return filtered;
    },

    _computeInternationalTransferWealthTax(fromNationId, toNationId) {
        const taxRate = (typeof Nations !== 'undefined' && Nations.getInternationalTransferTaxRate)
            ? Nations.getInternationalTransferTaxRate(fromNationId, toNationId)
            : 0.08;
        const safeMoney = Math.max(0, Math.round(Game.state.money || 0));
        const wealthTax = Math.round(safeMoney * Math.max(0, taxRate));
        return { taxRate, wealthTax };
    },

    _mergeCityMaps(base, incoming) {
        const out = { ...(base || {}) };
        Object.keys(incoming || {}).forEach(id => {
            out[id] = incoming[id];
        });
        return out;
    },

    _getNationSelectionMeta(nationId) {
        const labels = {
            italy: { name: 'Italia', center: [42.5, 12.5], zoom: 6 },
            france: { name: 'Francia', center: [46.4, 2.4], zoom: 6 },
            germany: { name: 'Germania', center: [51.0, 10.4], zoom: 6 },
            uk: { name: 'Regno Unito', center: [54.3, -2.5], zoom: 6 },
        };
        return labels[nationId] || labels.italy;
    },

    _getCitySalaryMultiplier(city) {
        if (!city) return 1;
        if (typeof city.salaryMultiplier === 'number') return city.salaryMultiplier;
        if (typeof city.rentMultiplier === 'number') return city.rentMultiplier;
        return 1;
    },

    _getTransferEconomy(fromCity, toCity) {
        const fromRent = fromCity ? Math.round(300 * (fromCity.rentMultiplier || 1)) : Math.round(300 * (toCity.rentMultiplier || 1));
        const toRent = Math.round(300 * (toCity.rentMultiplier || 1));
        const baseIncome = (Game.CAREER_LEVELS[Game.state.career.level] || Game.CAREER_LEVELS[0]).salary;
        const currentIncome = Math.round(baseIncome * this._getCitySalaryMultiplier(fromCity));
        const cheapDestination = toRent < Math.round(fromRent * 0.7);
        const richToCheap = currentIncome > 200 && cheapDestination;

        // Tassa progressiva: 10%-30% della liquidita (solo scenario ricco -> citta molto piu economica)
        const pct = richToCheap
            ? Math.max(0.10, Math.min(0.30, 0.10 + ((Game.state.money - 1200) / 3800) * 0.20))
            : 0;
        const wealthTax = richToCheap ? Math.round(Game.state.money * pct) : 0;

        const distanceKm = Math.round(getDistanceKm(fromCity, toCity));
        const distanceCost = fromCity
            ? Math.min(450, Math.max(0, Math.round(distanceKm * 0.35)))
            : 0;

        const fromNationId = this._getCityNationId(fromCity);
        const toNationId = this._getCityNationId(toCity);
        const isInternational = !!(fromCity && fromNationId !== toNationId);

        // Base cost: 200€ intraregionale, 400€ interregionale, costi dedicati per trasferimenti internazionali
        const isInterregional = fromCity && toCity && fromCity.region !== toCity.region;
        const baseCost = isInternational && typeof Nations !== 'undefined' && Nations.getInternationalTransferCost
            ? Nations.getInternationalTransferCost(fromNationId, toNationId)
            : (isInterregional ? this.TRANSFER_COST_INTERREGIONAL : this.TRANSFER_COST);

        return {
            fromRent,
            toRent,
            currentIncome,
            cheapDestination,
            richToCheap,
            isInternational,
            fromNationId,
            toNationId,
            luxuryTaxPct: pct,
            wealthTax,
            distanceKm,
            distanceCost,
            extraTax: wealthTax + distanceCost,
            baseCost,
            totalCost: baseCost + wealthTax + distanceCost,
        };
    },

    async loadCities(forceNation) {
        const nationId = forceNation || (Game.state.nation && Game.state.nation.id) || 'italy';
        
        // Use cached data only if it's for the same nation
        if (this.citiesData && this._lastLoadedNation === nationId) {
            return this.citiesData;
        }

        try {
            const fileName = `data/cities_${nationId}.json`;
            let resp = await fetch(fileName);

            // Backward compatibility for legacy italian data file.
            if (!resp.ok && nationId === 'italy') {
                resp = await fetch('data/cities.json');
            }

            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }

            const citiesJson = await resp.json();
            this.citiesData = this._normalizeCities(citiesJson, nationId);
            this._lastLoadedNation = nationId;
        } catch (e) {
            console.warn(`Failed to load data/cities_${nationId}.json, falling back to data/cities_italy.json`);

            try {
                let fallbackResp = await fetch('data/cities_italy.json');
                if (!fallbackResp.ok) {
                    fallbackResp = await fetch('data/cities.json');
                }
                const fallbackJson = await fallbackResp.json();
                this.citiesData = this._normalizeCities(fallbackJson, 'italy');
                this._lastLoadedNation = 'italy';
            } catch (fallbackErr) {
                console.warn('Failed to load italy fallback, using internal fallback map');
                this.citiesData = this._normalizeCities(this._fallbackCities(), nationId);
                this._lastLoadedNation = nationId;
            }
        }
        return this.citiesData;
    },

    async loadCitiesForNation(nationId) {
        const id = nationId || 'italy';
        if (this.citiesCache[id]) return this.citiesCache[id];
        try {
            let resp = await fetch(`data/cities_${id}.json`);
            if (!resp.ok && id === 'italy') {
                resp = await fetch('data/cities.json');
            }
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const json = await resp.json();
            const normalized = this._normalizeCities(json, id);
            this.citiesCache[id] = normalized;
            if (this.debugCitySelection) {
                console.info('[CitySelection] loaded nation', id, 'cities:', Object.keys(normalized).length);
            }
            return normalized;
        } catch (e) {
            console.warn(`Failed to load cities for ${id}, using integrated fallback`);
            if (this.debugCitySelection) {
                console.warn('[CitySelection] load failed for nation', id, e);
            }
            const fallback = this._normalizeCities(CITIES_DB[id] || {}, id);
            this.citiesCache[id] = fallback;
            return fallback;
        }
    },

    async loadAllCapoluoghi() {
        const nations = ['italy', 'france', 'germany', 'uk'];
        const all = {};
        for (const nation of nations) {
            const cities = await this.loadCitiesForNation(nation);
            Object.entries(cities || {}).forEach(([id, city]) => {
                const isCapoluogo = (city.settlementType === 'city') || ((city.type || 'city') === 'city');
                if (!isCapoluogo) return;
                all[`${nation}_${id}`] = {
                    ...city,
                    _nation: nation,
                    _cityKey: `${nation}_${id}`,
                };
            });
        }
        if (Object.keys(all).length === 0) {
            Object.entries(CITIES_DB).forEach(([nation, cities]) => {
                Object.entries(cities || {}).forEach(([id, city]) => {
                    const isCapoluogo = city.settlementType === 'city';
                    if (!isCapoluogo) return;
                    all[`${nation}_${id}`] = {
                        ...this._normalizeCity(city, nation),
                        _nation: nation,
                        _cityKey: `${nation}_${id}`,
                    };
                });
            });
        }
        if (this.debugCitySelection) {
            console.info('[CitySelection] all nations capoluoghi:', Object.keys(all).length);
        }
        return all;
    },

    async loadAllCities() {
        if (this.allCitiesData) return this.allCitiesData;

        const sources = [
            { file: 'data/cities_italy.json', nationId: 'italy' },
            { file: 'data/cities_france.json', nationId: 'france' },
            { file: 'data/cities_germany.json', nationId: 'germany' },
            { file: 'data/cities_uk.json', nationId: 'uk' },
        ];

        let merged = {};
        for (const src of sources) {
            try {
                let resp = await fetch(src.file);
                if (!resp.ok && src.nationId === 'italy') {
                    resp = await fetch('data/cities.json');
                }
                if (!resp.ok) continue;
                const json = await resp.json();
                const normalized = this._normalizeCities(json, src.nationId);
                merged = this._mergeCityMaps(merged, normalized);
            } catch (e) {
                console.warn(`Failed to load ${src.file}:`, e);
            }
        }

        if (Object.keys(merged).length === 0) {
            merged = this._normalizeCities(this._fallbackCities(), 'italy');
        }

        this.allCitiesData = merged;
        return this.allCitiesData;
    },

    _fallbackCities() {
        return {
            roma: { id:'roma', name:'Roma', region:'Lazio', lat:41.9028,lng:12.4964, desc:'La Capitale. Centro del potere, ma anche della concorrenza spietata.',
                bonus:{reputazione:2,networking:15},malus:{stress:3,concorrenza:0.85},rentMultiplier:1.5,salaryMultiplier:1.40,startingMoney:100,tier:1 },
            milano: { id:'milano', name:'Milano', region:'Lombardia', lat:45.4642,lng:9.19, desc:'Capitale economica. Soldi facili, ma il costo della vita è brutale.',
                bonus:{reputazione:1,networking:10,money:15},malus:{stress:4,concorrenza:0.90},rentMultiplier:1.6,salaryMultiplier:1.50,startingMoney:120,tier:1 },
            napoli: { id:'napoli', name:'Napoli', region:'Campania', lat:40.8518,lng:14.2681, desc:'Passione e caos. Networking facile, ma lo stress è alto.',
                bonus:{reputazione:3,networking:20},malus:{stress:5,concorrenza:0.80},rentMultiplier:0.8,salaryMultiplier:0.92,startingMoney:80,tier:1 },
            torino: { id:'torino', name:'Torino', region:'Piemonte', lat:45.0703,lng:7.6869, desc:'Città operaia con forte tradizione sindacale.',
                bonus:{reputazione:1,networking:8},malus:{stress:2,concorrenza:0.90},rentMultiplier:1.0,salaryMultiplier:1.0,startingMoney:100,tier:2 },
            firenze: { id:'firenze', name:'Firenze', region:'Toscana', lat:43.7696,lng:11.2558, desc:'Cultura e raffinatezza. Bonus carisma.',
                bonus:{reputazione:2,networking:6,carisma:1},malus:{stress:1,concorrenza:0.92},rentMultiplier:1.2,salaryMultiplier:1.2,startingMoney:100,tier:2 },
            bologna: { id:'bologna', name:'Bologna', region:'Emilia-Romagna', lat:44.4949,lng:11.3426, desc:'La rossa. Buon bilanciamento.',
                bonus:{reputazione:2,networking:12},malus:{stress:1,concorrenza:0.90},rentMultiplier:1.1,salaryMultiplier:1.1,startingMoney:100,tier:2 },
            palermo: { id:'palermo', name:'Palermo', region:'Sicilia', lat:38.1157,lng:13.3615, desc:'Sole e ombre. Facile fare rete, ma la mafia è sempre vicina.',
                bonus:{reputazione:3,networking:18},malus:{stress:3,concorrenza:0.75},rentMultiplier:0.7,salaryMultiplier:0.8,startingMoney:70,tier:2 },
            genova: { id:'genova', name:'Genova', region:'Liguria', lat:44.4056,lng:8.9463, desc:'Porto e commercio. Moderata ma stabile.',
                bonus:{reputazione:1,networking:8,money:5},malus:{stress:2,concorrenza:0.92},rentMultiplier:1.0,salaryMultiplier:1.0,startingMoney:100,tier:2 },
            venezia: { id:'venezia', name:'Venezia', region:'Veneto', lat:45.4408,lng:12.3155, desc:'Turismo e artigianato. Isolamento politico.',
                bonus:{reputazione:1,networking:5,carisma:1},malus:{stress:2,concorrenza:0.95},rentMultiplier:1.3,salaryMultiplier:1.28,startingMoney:90,tier:2 },
            bari: { id:'bari', name:'Bari', region:'Puglia', lat:41.1171,lng:16.8719, desc:'Ponte verso il sud. Networking solido.',
                bonus:{reputazione:2,networking:14},malus:{stress:2,concorrenza:0.82},rentMultiplier:0.75,salaryMultiplier:0.87,startingMoney:80,tier:3 },
            catania: { id:'catania', name:'Catania', region:'Sicilia', lat:37.5079,lng:15.083, desc:'Energia vulcanica. Facile emergere.',
                bonus:{reputazione:3,networking:16},malus:{stress:3,concorrenza:0.78},rentMultiplier:0.65,salaryMultiplier:0.75,startingMoney:70,tier:3 },
            cagliari: { id:'cagliari', name:'Cagliari', region:'Sardegna', lat:39.2238,lng:9.1217, desc:'Lontana dal potere centrale, comunità salda.',
                bonus:{reputazione:1,networking:10},malus:{stress:1,concorrenza:0.88},rentMultiplier:0.8,salaryMultiplier:0.92,startingMoney:85,tier:3 },
            trieste: { id:'trieste', name:'Trieste', region:'Friuli V.G.', lat:45.6495,lng:13.7768, desc:'Confine orientale. Intelligenza e geopolitica.',
                bonus:{reputazione:1,networking:6,intelligenza:1},malus:{stress:1,concorrenza:0.93},rentMultiplier:0.9,salaryMultiplier:0.98,startingMoney:95,tier:3 },
            perugia: { id:'perugia', name:'Perugia', region:'Umbria', lat:43.1107,lng:12.3908, desc:'Città universitaria, base giovane.',
                bonus:{reputazione:2,networking:10,intelligenza:1},malus:{stress:1,concorrenza:0.90},rentMultiplier:0.75,salaryMultiplier:0.87,startingMoney:90,tier:3 },
            ancona: { id:'ancona', name:'Ancona', region:'Marche', lat:43.6158,lng:13.5189, desc:'Porto adriatico. Equilibrato.',
                bonus:{reputazione:1,networking:8},malus:{stress:1,concorrenza:0.92},rentMultiplier:0.8,salaryMultiplier:0.92,startingMoney:95,tier:3 },
            potenza: { id:'potenza', name:'Potenza', region:'Basilicata', lat:40.6404,lng:15.8056, desc:'Poca concorrenza, tanta dignità.',
                bonus:{reputazione:2,networking:6},malus:{stress:0,concorrenza:0.80},rentMultiplier:0.55,salaryMultiplier:0.65,startingMoney:75,tier:3 },
            campobasso: { id:'campobasso', name:'Campobasso', region:'Molise', lat:41.5603,lng:14.6685, desc:'Il Molise esiste. Nessuna concorrenza.',
                bonus:{reputazione:3,networking:4},malus:{stress:0,concorrenza:0.70},rentMultiplier:0.5,salaryMultiplier:0.65,startingMoney:70,tier:3 },
            aosta: { id:'aosta', name:'Aosta', region:"Valle d'Aosta", lat:45.7375,lng:7.3122, desc:'Montagna e autonomia. Pochi elettori, ma fedeli.',
                bonus:{reputazione:1,networking:4},malus:{stress:0,concorrenza:0.85},rentMultiplier:0.9,salaryMultiplier:0.98,startingMoney:90,tier:3 },
            laquila: { id:'laquila', name:"L'Aquila", region:'Abruzzo', lat:42.3498,lng:13.3995, desc:'Ricostruzione e resilienza. Bonus morale.',
                bonus:{reputazione:2,networking:8,morale:5},malus:{stress:1,concorrenza:0.85},rentMultiplier:0.65,salaryMultiplier:0.75,startingMoney:80,tier:3 },
            trento: { id:'trento', name:'Trento', region:'Trentino-A.A.', lat:46.0748,lng:11.1217, desc:'Efficienza nordica. Elettorato esigente.',
                bonus:{reputazione:1,networking:6,intelligenza:1},malus:{stress:2,concorrenza:0.95},rentMultiplier:1.1,salaryMultiplier:1.1,startingMoney:100,tier:3 },
            paris: { id:'paris', name:'Parigi', country:'france', region:'Île-de-France', lat:48.8566,lng:2.3522, desc:'Centro politico francese. Visibilita altissima e pressione costante.',
                bonus:{reputazione:2,networking:18,intelligenza:1},malus:{stress:4,concorrenza:0.88},rentMultiplier:1.7,salaryMultiplier:1.5,startingMoney:120,tier:1 },
            lyon: { id:'lyon', name:'Lione', country:'france', region:'Auvergne-Rhône-Alpes', lat:45.764,lng:4.8357, desc:'Reti forti e buona stabilita amministrativa.',
                bonus:{reputazione:1,networking:12,money:6},malus:{stress:2,concorrenza:0.91},rentMultiplier:1.25,salaryMultiplier:1.22,startingMoney:110,tier:2 },
            marseille: { id:'marseille', name:'Marsiglia', country:'france', region:"Provence-Alpes-Côte d'Azur", lat:43.2965,lng:5.3698, desc:'Grande porto, tensioni sociali e alta visibilita locale.',
                bonus:{reputazione:2,networking:14},malus:{stress:3,concorrenza:0.87},rentMultiplier:1.12,salaryMultiplier:1.08,startingMoney:100,tier:2 },
            berlin: { id:'berlin', name:'Berlino', country:'germany', region:'Berlin', lat:52.52,lng:13.405, desc:'Capitale federale efficiente e competitiva.',
                bonus:{reputazione:2,networking:14,intelligenza:2},malus:{stress:3,concorrenza:0.9},rentMultiplier:1.35,salaryMultiplier:1.55,startingMoney:140,tier:1 },
            munich: { id:'munich', name:'Monaco di Baviera', country:'germany', region:'Bavaria', lat:48.1351,lng:11.582, desc:'Ricca, ordinata e molto esigente.',
                bonus:{reputazione:1,networking:12,money:10},malus:{stress:2,concorrenza:0.92},rentMultiplier:1.45,salaryMultiplier:1.45,startingMoney:135,tier:2 },
            hamburg: { id:'hamburg', name:'Amburgo', country:'germany', region:'Hamburg', lat:53.5511,lng:9.9937, desc:'Porto e commercio, rete professionale solida.',
                bonus:{reputazione:1,networking:13,intelligenza:1},malus:{stress:2,concorrenza:0.9},rentMultiplier:1.28,salaryMultiplier:1.32,startingMoney:125,tier:2 },
            london: { id:'london', name:'Londra', country:'uk', region:'Greater London', lat:51.5072,lng:-0.1276, desc:'Westminster e media nazionali: politica brutale e costo altissimo.',
                bonus:{reputazione:2,networking:16,money:12},malus:{stress:4,concorrenza:0.89},rentMultiplier:1.8,salaryMultiplier:1.6,startingMoney:130,tier:1 },
            manchester: { id:'manchester', name:'Manchester', country:'uk', region:'Greater Manchester', lat:53.4808,lng:-2.2426, desc:'Ottima base politica del nord con costi piu sostenibili.',
                bonus:{reputazione:2,networking:12},malus:{stress:2,concorrenza:0.9},rentMultiplier:1.05,salaryMultiplier:1.12,startingMoney:110,tier:2 },
            birmingham: { id:'birmingham', name:'Birmingham', country:'uk', region:'West Midlands', lat:52.4862,lng:-1.8904, desc:'Crocevia urbano pragmatico con concorrenza moderata.',
                bonus:{reputazione:1,networking:11,money:5},malus:{stress:2,concorrenza:0.91},rentMultiplier:1.0,salaryMultiplier:1.08,startingMoney:108,tier:2 },
        };
    },

    init() {
        // Map is rendered on demand via territory tab or city selection
    },

    // ====== Leaflet helpers ======
    _initLeafletMap(containerId, center, zoom) {
        const mapEl = document.getElementById(containerId);
        if (!mapEl) return null;
        const cached = this.mapRegistry[containerId];
        if (cached && cached.map) {
            cached.map.setView(center, zoom, { animate: false });
            cached.map.invalidateSize();
            this.mapInstance = cached.map;
            return cached.map;
        }

        const map = L.map(containerId, {
            zoomControl: true,
            scrollWheelZoom: true,
            attributionControl: false,
        }).setView(center, zoom);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 12, minZoom: 5,
        }).addTo(map);

        this.mapRegistry[containerId] = {
            map,
            markerLayer: null,
            roadsLayer: null,
            zoomHandler: null,
        };
        this.mapInstance = map;
        return map;
    },

    _getMapRegistryEntry(map) {
        const entry = Object.values(this.mapRegistry).find(r => r.map === map) || null;
        if (!entry) return null;
        return entry;
    },

    _getMarkerTypeText(city) {
        const cityClass = (city && city.cityClass) || this._getCityClass(city);
        if (cityClass === 'comune') return 'Comune';
        if (cityClass === 'citta_piccola') return 'Citta piccola';
        if (cityClass === 'citta_media') return 'Citta media';
        if (cityClass === 'citta_grande') return 'Citta grande';
        return 'Citta';
    },

    _getMarkerPopulationRange(city) {
        const cityClass = (city && city.cityClass) || this._getCityClass(city);
        if (cityClass === 'comune') return '< 50.000 ab.';
        if (cityClass === 'citta_piccola') return '50.000 - 150.000 ab.';
        if (cityClass === 'citta_media') return '150.000 - 500.000 ab.';
        if (cityClass === 'citta_grande') return '> 500.000 ab.';
        return 'n/d';
    },

    _addCityMarkers(map, cities, opts = {}) {
        const { onMarkerClick, highlightCurrent, currentCityId } = opts;
        const visited = Game.state.visitedCities || [];
        const cityStyles = {
            comune:        { shape: 'square',   size: 12, innerHtml: '' },
            citta_piccola: { shape: 'triangle',  size: 14, innerHtml: '' },
            citta_media:   { shape: 'circle',   size: 16, innerHtml: '' },
            citta_grande:  { shape: 'circle',   size: 20, innerHtml: '<span class="marker-star">⭐</span>' },
        };

        const getCityClass = (city) => city.cityClass || 'citta_piccola';

        const getShapeCSS = (shape, size, borderColor, borderWidth, bgColor) => {
            if (shape === 'square') {
                return `width:${size}px;height:${size}px;background-color:${bgColor};border:${borderWidth}px solid ${borderColor};border-radius:0;`;
            }
            if (shape === 'circle') {
                return `width:${size}px;height:${size}px;background-color:${bgColor};border:${borderWidth}px solid ${borderColor};border-radius:50%;`;
            }
            if (shape === 'triangle') {
                // clip-path triangle: element keeps w/h so flex and animations still work
                return `width:${size}px;height:${size}px;background-color:${bgColor};border:none;clip-path:polygon(50% 0%,0% 100%,100% 100%);filter:drop-shadow(0 0 ${borderWidth + 1}px ${borderColor});`;
            }
            if (shape === 'diamond') {
                return `width:${size}px;height:${size}px;background-color:${bgColor};border:${borderWidth}px solid ${borderColor};transform:rotate(45deg);`;
            }
            return '';
        };

        const reg = this._getMapRegistryEntry(map);
        if (reg && reg.markerLayer) {
            map.removeLayer(reg.markerLayer);
            reg.markerLayer = null;
        }
        if (reg && reg.roadsLayer) {
            map.removeLayer(reg.roadsLayer);
            reg.roadsLayer = null;
        }
        if (reg && reg.zoomHandler) {
            map.off('zoomend', reg.zoomHandler);
            reg.zoomHandler = null;
        }

        const roadsLayer = L.layerGroup();
        const markerLayer = L.layerGroup();

        // Draw roads first (behind markers)
        this._drawRoads(map, cities, roadsLayer);

        // Build all markers; add them to the map; maintain zoom-based visibility
        const allMarkersData = [];

        Object.values(cities).forEach(city => {
            const isCurrent = highlightCurrent && currentCityId === city.id;
            const isVisited = isCurrent || visited.includes(city.id);
            const cityClass = getCityClass(city);
            const style = cityStyles[cityClass] || cityStyles.citta_media;
            const typeText = this._getMarkerTypeText(city);
            const rangeText = this._getMarkerPopulationRange(city);

            let borderColor = '#000000';
            let borderWidth = 2;
            let bgColor = '#FFFFFF';
            let glow = 'none';

            if (isCurrent) {
                borderColor = '#FFD600';
                borderWidth = 3;
                glow = '0 0 8px rgba(255,214,0,0.8)';
            } else if (isVisited) {
                borderColor = cityClass === 'citta_grande' ? '#000000' : '#888888';
                borderWidth = 2;
            } else if (cityClass === 'citta_grande') {
                borderColor = '#FFFFFF';
                borderWidth = 3;
                glow = '0 0 8px rgba(255,255,255,0.6)';
            }

            const shapeCSS = getShapeCSS(style.shape, style.size, borderColor, borderWidth, bgColor);

            const markerCoreHtml = `
                <div class="city-marker-custom city-shape-${style.shape}" style="
                    ${shapeCSS}
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: ${style.shape !== 'triangle' ? glow : 'none'};
                    ${isCurrent ? 'animation: cityPulse 1.5s infinite;' : ''}
                ">
                    ${style.innerHtml}
                </div>
            `;

            const markerHtml = `${markerCoreHtml}<div class="city-marker-label">${city.name}${isCurrent ? ' ★' : ''}</div>`;

            const icon = L.divIcon({
                className: 'city-marker-wrapper',
                html: markerHtml,
                iconSize: [style.size + 4, style.size + 4],
                iconAnchor: [style.size / 2 + 2, style.size / 2 + 2],
            });
            const tooltipHtml = `<strong>${escapeHtml(city.name || 'Citta')}</strong><br>${escapeHtml(typeText)} - ${escapeHtml(rangeText)}`;
            const marker = L.marker([city.lat, city.lng], { icon })
                .bindTooltip(tooltipHtml, {
                    permanent: false,
                    direction: 'top',
                    offset: [0, -10],
                    opacity: 0.95,
                    className: 'city-map-tooltip',
                    sticky: true,
                });
            if (onMarkerClick && (!highlightCurrent || !isCurrent)) {
                marker.on('click', () => onMarkerClick(city));
            }

            const minZoom = ZOOM_THRESHOLDS[cityClass] || 5;
            allMarkersData.push({ marker, minZoom });
        });

        // Add all markers immediately, then apply zoom filtering
        allMarkersData.forEach(({ marker }) => marker.addTo(markerLayer));

        const updateVisibility = () => {
            const z = map.getZoom();
            allMarkersData.forEach(({ marker, minZoom }) => {
                if (z >= minZoom) {
                    if (!markerLayer.hasLayer(marker)) marker.addTo(markerLayer);
                } else {
                    if (markerLayer.hasLayer(marker)) markerLayer.removeLayer(marker);
                }
            });
        };

        roadsLayer.addTo(map);
        markerLayer.addTo(map);
        map.on('zoomend', updateVisibility);
        if (reg) {
            reg.markerLayer = markerLayer;
            reg.roadsLayer = roadsLayer;
            reg.zoomHandler = updateVisibility;
        }
        updateVisibility();
    },

    // Real Italian highway connections (25-point coords from OSRM full routing)
    ROADS: [
        // A1: Milano-Bologna
        { from:'milano', to:'bologna', waypoints:[[45.4649,9.1893],[45.4708,9.1935],[45.4715,9.2053],[45.4596,9.2061],[45.452,9.2026],[45.4471,9.2098],[45.4401,9.2238],[45.4276,9.2449],[45.4025,9.2609],[45.3434,9.3171],[45.2849,9.4334],[45.1029,9.6952],[44.9738,9.8792],[44.8707,10.2044],[44.766,10.5239],[44.6692,10.8398],[44.6126,10.8982],[44.497,11.2295],[44.4846,11.2601],[44.489,11.2703],[44.4905,11.2845],[44.4979,11.3131],[44.4971,11.3218],[44.498,11.3307],[44.4949,11.3426]] },
        // A1: Bologna-Firenze
        { from:'bologna', to:'firenze', waypoints:[[44.4949,11.3426],[44.5003,11.3345],[44.5014,11.3211],[44.5055,11.3092],[44.488,11.2777],[44.4888,11.268],[44.4848,11.2578],[44.4543,11.281],[44.3869,11.2486],[44.3226,11.2539],[44.2671,11.1874],[44.2016,11.2005],[44.1086,11.2143],[44.0379,11.2257],[43.9747,11.2112],[43.8991,11.1952],[43.8671,11.1747],[43.8273,11.1524],[43.7781,11.162],[43.7715,11.1912],[43.7735,11.2166],[43.7735,11.2312],[43.778,11.2399],[43.7811,11.2522],[43.7709,11.2579],[43.7706,11.2578]] },
        // A1: Firenze-Roma
        { from:'firenze', to:'roma', waypoints:[[43.7706,11.2578],[43.7624,11.2825],[43.7554,11.3015],[43.7393,11.2877],[43.7138,11.3917],[43.6478,11.4656],[43.5313,11.5852],[43.4837,11.7134],[43.4098,11.765],[43.2428,11.7784],[43.1063,11.8821],[42.9125,11.9722],[42.8031,12.0434],[42.6909,12.209],[42.5239,12.2651],[42.4483,12.4141],[42.3417,12.4692],[42.269,12.5494],[42.1808,12.6022],[42.067,12.5353],[41.9907,12.5127],[41.9739,12.5047],[41.9386,12.5087],[41.9195,12.4985],[41.9026,12.496],[41.9029,12.4965]] },
        // A1: Roma-Napoli
        { from:'roma', to:'napoli', waypoints:[[41.9029,12.4965],[41.8997,12.5066],[41.8907,12.5151],[41.891,12.5249],[41.8833,12.5328],[41.8759,12.5555],[41.8726,12.5744],[41.8691,12.5851],[41.8657,12.5988],[41.8546,12.5964],[41.834,12.6501],[41.8285,12.6893],[41.8266,12.7377],[41.8053,12.8154],[41.7494,12.9915],[41.6494,13.2436],[41.5932,13.3385],[41.5433,13.5687],[41.4517,13.8282],[41.3117,14.0873],[41.123,14.2253],[41.0054,14.3233],[40.8742,14.2874],[40.8631,14.271],[40.8521,14.2676],[40.8518,14.2681]] },
        // A4: Milano-Venezia
        { from:'milano', to:'venezia', waypoints:[[45.4649,9.1893],[45.4753,9.1947],[45.4839,9.2025],[45.4864,9.2152],[45.4922,9.2299],[45.5124,9.2599],[45.5235,9.2613],[45.5504,9.2626],[45.5731,9.384],[45.6693,9.6665],[45.5515,10.1103],[45.4946,10.2763],[45.4484,10.5284],[45.4259,10.7634],[45.4051,10.9233],[45.4108,11.0908],[45.4088,11.256],[45.4554,11.3958],[45.5063,11.4687],[45.5126,11.5978],[45.4482,11.8486],[45.4211,11.9525],[45.4738,12.2107],[45.4764,12.2499],[45.4434,12.3151],[45.4408,12.3155]] },
        // A4: Venezia-Trieste
        { from:'venezia', to:'trieste', waypoints:[[45.4408,12.3155],[45.4448,12.3144],[45.4718,12.2696],[45.4866,12.2742],[45.5144,12.2487],[45.5166,12.2501],[45.529,12.2673],[45.6155,12.413],[45.7165,12.6295],[45.7901,12.8176],[45.8105,12.9714],[45.8346,13.1169],[45.8962,13.289],[45.852,13.4595],[45.8311,13.5162],[45.8152,13.5569],[45.7913,13.5901],[45.7732,13.641],[45.7425,13.6916],[45.6927,13.7679],[45.6774,13.7865],[45.6697,13.7914],[45.665,13.7867],[45.6617,13.7732],[45.6496,13.7748],[45.6495,13.7768]] },
        // A7: Milano-Genova
        { from:'milano', to:'genova', waypoints:[[45.4649,9.1893],[45.4676,9.1807],[45.4559,9.1733],[45.4455,9.1764],[45.4223,9.159],[45.2829,9.0604],[45.1685,9.0015],[45.0285,8.9337],[44.8869,8.8395],[44.7273,8.8568],[44.6974,8.8944],[44.6656,8.9371],[44.6441,8.9588],[44.6138,8.9544],[44.5866,8.9413],[44.56,8.9468],[44.538,8.9431],[44.5167,8.9337],[44.5005,8.9204],[44.4852,8.9193],[44.4756,8.9118],[44.4558,8.9038],[44.4346,8.9416],[44.4275,8.9478],[44.4059,8.9477],[44.4056,8.9463]] },
        // A4: Milano-Torino
        { from:'milano', to:'torino', waypoints:[[45.4649,9.1893],[45.4714,9.1841],[45.4753,9.1817],[45.4785,9.1726],[45.4844,9.161],[45.4931,9.1448],[45.5103,9.1292],[45.5132,9.0698],[45.4956,8.8952],[45.4695,8.7853],[45.4692,8.6348],[45.4712,8.5281],[45.4557,8.3383],[45.3776,8.1336],[45.2458,7.9827],[45.1843,7.8336],[45.12,7.7118],[45.112,7.7065],[45.1007,7.6991],[45.0908,7.6935],[45.0788,7.6927],[45.0742,7.6902],[45.0655,7.6943],[45.0702,7.687],[45.0703,7.6868],[45.0703,7.6869]] },
        // A5: Torino-Aosta
        { from:'torino', to:'aosta', waypoints:[[45.0703,7.6869],[45.0707,7.6794],[45.0794,7.6766],[45.0914,7.685],[45.1017,7.6891],[45.1316,7.7034],[45.21,7.7967],[45.3443,7.8289],[45.4294,7.8467],[45.4895,7.8305],[45.5487,7.8229],[45.5997,7.7761],[45.608,7.7393],[45.6583,7.6941],[45.686,7.6685],[45.7218,7.6696],[45.7475,7.6195],[45.7444,7.5666],[45.7425,7.4819],[45.7337,7.4301],[45.7398,7.3855],[45.7409,7.3688],[45.7403,7.3399],[45.7353,7.3259],[45.7355,7.3146],[45.7375,7.3123]] },
        // A22: Trento-Bologna (Brennero)
        { from:'trento', to:'bologna', waypoints:[[46.0749,11.1215],[46.0704,11.1144],[46.077,11.1134],[46.0547,11.1087],[45.929,11.0812],[45.8895,11.0137],[45.7993,11.0198],[45.7397,10.9661],[45.69,10.9089],[45.6242,10.8638],[45.5754,10.8056],[45.5064,10.7841],[45.4346,10.9048],[45.3213,10.9133],[45.1465,10.8673],[45.0413,10.8536],[44.906,10.8481],[44.786,10.8504],[44.6782,10.8482],[44.6439,10.869],[44.4872,11.2552],[44.4892,11.2694],[44.4986,11.3016],[44.4971,11.3236],[44.4954,11.3392],[44.4949,11.3426]] },
        // A14: Bologna-Ancona
        { from:'bologna', to:'ancona', waypoints:[[44.4949,11.3426],[44.489,11.3601],[44.4818,11.3792],[44.4915,11.3905],[44.4799,11.4293],[44.4341,11.5816],[44.3485,11.8326],[44.2943,11.9788],[44.2418,12.1255],[44.1607,12.3058],[44.0768,12.487],[44.0016,12.6055],[43.9526,12.7461],[43.8991,12.8395],[43.8519,12.9504],[43.8082,13.0533],[43.7052,13.2065],[43.6717,13.2835],[43.6013,13.3386],[43.5965,13.3587],[43.6163,13.4018],[43.599,13.4494],[43.6092,13.4597],[43.6072,13.4987],[43.6163,13.5126],[43.6158,13.5189]] },
        // A14: Ancona-Bari
        { from:'ancona', to:'bari', waypoints:[[43.6158,13.5189],[43.5453,13.5149],[43.3918,13.6749],[43.225,13.7684],[43.0243,13.8525],[42.8812,13.9027],[42.7975,13.9298],[42.7142,13.9131],[42.6315,13.9926],[42.5424,14.1102],[42.469,14.1175],[42.3944,14.1802],[42.3992,14.2857],[42.3388,14.3595],[42.2731,14.4352],[42.2051,14.5244],[42.1643,14.6299],[42.0942,14.6976],[42.0558,14.7693],[41.8983,15.2504],[41.442,15.6487],[41.2358,16.1197],[41.1764,16.5714],[41.0928,16.8402],[41.117,16.8703],[41.1172,16.8719]] },
        // A3: Napoli-Potenza
        { from:'napoli', to:'potenza', waypoints:[[40.8518,14.2681],[40.8497,14.2892],[40.8465,14.3186],[40.7949,14.3747],[40.7624,14.4423],[40.7434,14.5076],[40.7325,14.5764],[40.7395,14.6354],[40.7158,14.7001],[40.6897,14.7227],[40.6739,14.7347],[40.6869,14.7715],[40.6923,14.8349],[40.6273,14.9454],[40.6077,15.0681],[40.6284,15.2253],[40.6096,15.3055],[40.6211,15.4213],[40.6233,15.5245],[40.6305,15.6017],[40.6108,15.658],[40.6171,15.7502],[40.6273,15.8015],[40.639,15.8163],[40.6411,15.8065],[40.6404,15.8056]] },
        // A3: Potenza-Catania
        { from:'potenza', to:'catania', waypoints:[[40.6404,15.8056],[40.6171,15.7502],[40.5145,15.6334],[40.4583,15.5435],[40.2626,15.6587],[40.0927,15.8333],[39.9212,15.9675],[39.8714,16.1734],[39.6852,16.224],[39.4405,16.2386],[39.2365,16.294],[39.1114,16.2532],[39.0208,16.1219],[38.8685,16.281],[38.6913,16.1571],[38.5055,16.0377],[38.3448,15.8687],[38.1992,15.6418],[38.1988,15.5457],[38.1197,15.5144],[37.9983,15.4124],[37.8731,15.2999],[37.7481,15.1746],[37.5643,15.1],[37.513,15.0822],[37.5079,15.083]] },
        // A16: Napoli-Bari
        { from:'napoli', to:'bari', waypoints:[[40.8518,14.2681],[40.8643,14.2988],[40.9016,14.4033],[40.947,14.5863],[40.9108,14.6846],[40.9141,14.7493],[40.9621,14.8383],[40.9933,14.8773],[41.0276,14.895],[41.0733,14.9302],[41.063,15.0083],[41.0746,15.093],[41.0896,15.1603],[41.088,15.2215],[41.065,15.2704],[41.079,15.3423],[41.114,15.4094],[41.1505,15.4835],[41.1797,15.7017],[41.2465,16.0261],[41.2621,16.2484],[41.1749,16.579],[41.0868,16.8028],[41.1074,16.8537],[41.1172,16.8719]] },
        // A24: Roma-L'Aquila
        { from:'roma', to:'laquila', waypoints:[[41.9029,12.4965],[41.8997,12.5066],[41.8964,12.5191],[41.8991,12.5394],[41.9144,12.5988],[41.9183,12.6623],[41.9278,12.7566],[41.9153,12.8248],[41.9889,12.88],[42.034,12.9326],[42.0422,13.0126],[42.0784,13.0496],[42.1109,13.0877],[42.1165,13.117],[42.1369,13.1444],[42.1424,13.1879],[42.1481,13.2686],[42.2423,13.3179],[42.2783,13.3124],[42.3128,13.3077],[42.3473,13.3492],[42.3613,13.3682],[42.3601,13.3793],[42.3554,13.3884],[42.3498,13.3995]] },
        // SS: L'Aquila-Campobasso
        { from:'laquila', to:'campobasso', waypoints:[[42.3498,13.3995],[42.3506,13.3915],[42.3593,13.3815],[42.361,13.3633],[42.323,13.3164],[42.2692,13.3186],[42.1777,13.2831],[42.1114,13.3034],[42.0555,13.4083],[41.931,13.4282],[41.8349,13.519],[41.7369,13.6223],[41.682,13.6859],[41.6227,13.7813],[41.5473,13.8579],[41.4862,13.8532],[41.4447,13.9628],[41.4814,14.0421],[41.518,14.1293],[41.581,14.2288],[41.5643,14.2923],[41.5304,14.3932],[41.4713,14.5371],[41.5081,14.6076],[41.5581,14.6633],[41.5602,14.6683]] },
        // E45: Perugia-Roma
        { from:'perugia', to:'roma', waypoints:[[43.1107,12.3908],[43.0976,12.3949],[43.0751,12.4016],[43.0511,12.4074],[42.934,12.4005],[42.8437,12.4086],[42.8049,12.4076],[42.7722,12.448],[42.7488,12.4689],[42.7229,12.5419],[42.6169,12.5539],[42.56,12.5415],[42.5279,12.471],[42.4771,12.4355],[42.4632,12.4199],[42.4496,12.4071],[42.3817,12.4712],[42.3069,12.4934],[42.2105,12.6014],[42.1003,12.5817],[41.9902,12.5135],[41.9755,12.5053],[41.9397,12.5082],[41.9195,12.4985],[41.9025,12.4962],[41.9029,12.4965]] },
        // SS: Firenze-Perugia
        { from:'firenze', to:'perugia', waypoints:[[43.7706,11.2578],[43.7642,11.2816],[43.7564,11.2901],[43.7499,11.2974],[43.7403,11.2793],[43.7275,11.3463],[43.6929,11.4124],[43.6437,11.4657],[43.558,11.5428],[43.5126,11.643],[43.4772,11.7365],[43.4241,11.7765],[43.2941,11.7633],[43.212,11.8079],[43.2231,11.8261],[43.2204,11.9171],[43.1862,12.0364],[43.1956,12.0545],[43.197,12.074],[43.1817,12.1718],[43.145,12.2227],[43.1012,12.3003],[43.0976,12.3687],[43.1041,12.3765],[43.1106,12.386],[43.1107,12.3908]] },
        // A19: Palermo-Catania
        { from:'palermo', to:'catania', waypoints:[[38.1157,13.3615],[38.1071,13.3725],[38.0957,13.401],[38.0814,13.4352],[38.0597,13.5292],[37.9994,13.6385],[37.9753,13.7024],[37.979,13.8239],[37.9381,13.8434],[37.8636,13.8777],[37.8357,13.9378],[37.7921,13.9708],[37.7341,14.0266],[37.6607,14.0747],[37.5954,14.1304],[37.5479,14.1804],[37.579,14.2771],[37.5688,14.3574],[37.5708,14.4844],[37.57,14.6462],[37.5282,14.7463],[37.4683,14.8863],[37.4674,15.0257],[37.5015,15.0687],[37.5079,15.083]] },
        // A12: Genova-Firenze
        { from:'genova', to:'firenze', waypoints:[[44.4056,8.9463],[44.407,8.9792],[44.3947,9.0019],[44.3925,9.0414],[44.3631,9.1854],[44.3271,9.3208],[44.2683,9.4291],[44.2418,9.5524],[44.2366,9.6623],[44.225,9.7446],[44.1971,9.8562],[44.1029,9.9492],[43.9936,10.1495],[43.8872,10.261],[43.8708,10.354],[43.8514,10.438],[43.8285,10.5072],[43.8764,10.7999],[43.9075,10.854],[43.885,11.027],[43.8229,11.1668],[43.7974,11.2113],[43.7872,11.226],[43.7789,11.243],[43.7706,11.2624],[43.7706,11.2578]] },
        // Ferry: Cagliari-Napoli
        { from:'cagliari', to:'napoli', waypoints:[[39.2238,9.1217],[39.50,10.00],[39.90,11.50],[40.30,12.80],[40.8518,14.2681]], ferry:true },
        // Ferry: Palermo-Napoli
        { from:'palermo', to:'napoli', waypoints:[[38.1157,13.3615],[38.80,13.60],[39.50,13.80],[40.20,14.05],[40.8518,14.2681]], ferry:true },
    ],

    _drawRoads(map, cities, targetLayer) {
        const visitedRoads = Game.state.visitedRoads || [];
        const outLayer = targetLayer || map;
        this.ROADS.forEach(road => {
            const fromCity = cities[road.from];
            const toCity = cities[road.to];
            if (!fromCity || !toCity) return;

            const coords = road.waypoints || [[fromCity.lat, fromCity.lng], [toCity.lat, toCity.lng]];
            const roadKey = [road.from, road.to].sort().join('-');
            const isVisited = visitedRoads.includes(roadKey);

            L.polyline(coords, {
                color: isVisited ? '#FFD600' : (road.ferry ? '#CCCCCC' : '#FFFFFF'),
                weight: road.ferry ? 1.2 : 1.5,
                opacity: isVisited ? 0.9 : (road.ferry ? 0.5 : 0.55),
                dashArray: road.ferry ? '4 3' : null,
                smoothFactor: 1.5,
                interactive: false,
            }).addTo(outLayer);
        });
    },

    // === Helper: build city list HTML ===
    _buildCityListHTML(cities, options = {}) {
        const { currentCityId } = options;
        let html = '';
        const byRegion = {};
        Object.values(cities || {}).forEach(city => {
            if (!byRegion[city.region]) byRegion[city.region] = [];
            byRegion[city.region].push(city);
        });
        Object.keys(byRegion).sort((a, b) => a.localeCompare(b)).forEach(region => {
            const regionCities = byRegion[region].slice().sort((a, b) => {
                const at = (a.type || 'city') === 'city' ? 0 : 1;
                const bt = (b.type || 'city') === 'city' ? 0 : 1;
                if (at !== bt) return at - bt;
                const ap = { large: 0, medium: 1, small: 2 }[a.population || this._getDefaultPopulationByTier(a.tier)] || 1;
                const bp = { large: 0, medium: 1, small: 2 }[b.population || this._getDefaultPopulationByTier(b.tier)] || 1;
                if (ap !== bp) return ap - bp;
                return a.name.localeCompare(b.name);
            });
            html += `<div class="city-list-tier"><div class="city-list-tier-label">📍 ${region}</div>`;
            regionCities.forEach(city => {
                const cityKey = city._cityKey || city.id;
                const isCurrent = currentCityId === city.id;
                const cityClass = city.cityClass || this._getCityClass(city);
                const cityTypeLabels = {
                    comune: 'Comune',
                    citta_piccola: 'Citta piccola',
                    citta_media: 'Citta media',
                    citta_grande: 'Citta grande',
                };
                const typeLabel = cityTypeLabels[cityClass] || 'Citta';
                const bonusShort = [];
                if (city.bonus.reputazione) bonusShort.push(`📈+${city.bonus.reputazione}`);
                if (city.bonus.networking) bonusShort.push(`🤝+${city.bonus.networking}%`);
                if (city.bonus.money) bonusShort.push(`💶+€${city.bonus.money}`);
                if (city.bonus.carisma) bonusShort.push(`✨+${city.bonus.carisma}`);
                if (city.bonus.intelligenza) bonusShort.push(`🧠+${city.bonus.intelligenza}`);
                if (city.bonus.morale) bonusShort.push(`😊+${city.bonus.morale}`);
                const malusShort = [];
                if (city.malus.stress) malusShort.push(`😰+${city.malus.stress}`);
                const rent = Math.round(300 * city.rentMultiplier);
                const previewTitle = [
                    `Bonus: ${bonusShort.join(', ') || 'nessuno'}`,
                    `Malus: ${malusShort.join(', ') || 'nessuno'}`,
                    `Affitto stimato: €${rent}/mese`,
                ].join(' | ');
                html += `
                    <div class="city-list-item ${isCurrent ? 'city-list-current' : ''}" data-city="${cityKey}" title="${escapeHtml(previewTitle)}">
                        <div class="city-list-name">${city.name} ${isCurrent ? '★' : ''}</div>
                        <div class="city-list-region">${typeLabel}</div>
                        <div class="city-list-desc">${city.desc}</div>
                        <div class="city-list-stats">
                            <span class="city-list-bonus">${bonusShort.join(' ')}</span>
                            <span class="city-list-malus">${malusShort.join(' ')}</span>
                            <span class="city-list-rent">🏠€${rent}/m</span>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        });
        return html;
    },

    // === CHARACTER CREATION: City Selection Map ===
    async renderCitySelection(containerId, onSelect, options) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const preferredCityId = options && options.preferredCityId ? options.preferredCityId : null;

        let currentMode = 'nation';
        let currentNation = (options && options.nationId) || (Game.state.nation && Game.state.nation.id) || 'italy';
        let showOnlyCapoluoghi = false;
        let currentSizeFilter = 'all';
        let currentSearchQuery = '';
        let currentCities = {};

        const getVisibleCities = async () => {
            let cities;
            if (currentMode === 'all') {
                cities = await this.loadAllCapoluoghi();
            } else {
                const nationCities = await this.loadCitiesForNation(currentNation);
                const full = {};
                Object.entries(nationCities).forEach(([id, city]) => {
                    const isCapoluogo = (city.settlementType === 'city') || ((city.type || 'city') === 'city');
                    if (showOnlyCapoluoghi && !isCapoluogo) return;
                    full[id] = { ...city, _nation: currentNation, _cityKey: id };
                });
                cities = full;
            }
            if (currentSizeFilter !== 'all') {
                cities = filterCitiesBySize(cities, currentSizeFilter);
            }
            if (currentSizeFilter === 'small') {
                cities = deduplicateCloseCities(cities, 15);
            }
            cities = filterCitiesByQuery(cities, currentSearchQuery);
            return cities;
        };

        container.innerHTML = `
            <div class="city-select-header">
                <h2>📍 Scegli la tua Città</h2>
                <p class="city-select-subtitle">Clicca su una città nella mappa o nella lista per vedere i dettagli.</p>
                <div class="city-filters">
                    <label class="city-filter-toggle">
                        <input type="radio" name="cityMode" value="nation" checked>
                        Stato specifico
                    </label>
                    <label class="city-filter-toggle">
                        <input type="radio" name="cityMode" value="all">
                        Tutti gli stati (solo capoluoghi)
                    </label>
                    <select id="nation-selector" class="nation-selector">
                        <option value="italy" ${currentNation === 'italy' ? 'selected' : ''}>Italia</option>
                        <option value="france" ${currentNation === 'france' ? 'selected' : ''}>Francia</option>
                        <option value="germany" ${currentNation === 'germany' ? 'selected' : ''}>Germania</option>
                        <option value="uk" ${currentNation === 'uk' ? 'selected' : ''}>Regno Unito</option>
                    </select>
                    <label class="city-filter-toggle">
                        <input type="checkbox" id="city-filter-capoluoghi">
                        Mostra solo capoluoghi (solo per stato specifico)
                    </label>
                    <select id="city-size-filter" class="city-size-selector">
                        <option value="all">📊 Tutti i tipi</option>
                        <option value="small">🏘️ Solo comuni (small)</option>
                        <option value="medium">🏙️ Città medie (medium)</option>
                        <option value="capoluogo">🏛️ Capoluoghi (large/medium)</option>
                        <option value="large">🌆 Grandi città (large)</option>
                    </select>
                    <input id="city-search-input" class="city-search-input" type="text" placeholder="Cerca città o regione..." list="city-search-suggestions" autocomplete="off">
                    <datalist id="city-search-suggestions"></datalist>
                </div>
                <div class="city-legend" aria-label="Legenda marker città">
                    <div class="legend-title">🗺️ Legenda marker</div>
                    <div class="legend-items">
                        <div class="legend-item">
                            <div class="legend-marker square-marker small-marker"></div>
                            <span>Comune</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-marker triangle-marker"></div>
                            <span>Città piccola</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-marker circle-marker medium-marker"></div>
                            <span>Città media</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-marker circle-marker large-marker legend-large-city star-marker"></div>
                            <span>Città grande</span>
                        </div>
                    </div>
                    <div class="legend-note">★ = città attuale | bordo grigio = visitata | bordo bianco = grande città</div>
                </div>
            </div>
            <div class="city-select-layout">
                <div class="city-select-map-wrap">
                    <div id="city-select-map" class="city-select-map"></div>
                    <div id="city-select-info" class="city-select-info hidden">
                        <div class="city-info-name" id="csi-name"></div>
                        <div class="city-info-region" id="csi-region"></div>
                        <div class="city-info-desc" id="csi-desc"></div>
                        <div class="city-info-stats">
                            <div class="city-info-bonus" id="csi-bonus"></div>
                            <div class="city-info-malus" id="csi-malus"></div>
                            <div class="city-info-rent" id="csi-rent"></div>
                        </div>
                        <button class="city-select-confirm" id="csi-confirm">INIZIA QUI →</button>
                    </div>
                </div>
                <div class="city-list-sidebar" id="city-list-sidebar">
                    <div class="city-list-title">📋 Città e Comuni</div>
                    <div class="city-list-scroll" id="city-select-list"></div>
                </div>
            </div>
        `;

        const modeRadios = document.querySelectorAll('input[name="cityMode"]');
        const nationSelect = document.getElementById('nation-selector');
        const capoluoghiCheck = document.getElementById('city-filter-capoluoghi');
        const sizeFilterSelect = document.getElementById('city-size-filter');
        const citySearchInput = document.getElementById('city-search-input');
        const citySearchSuggestions = document.getElementById('city-search-suggestions');

        const refreshUI = async () => {
            const visible = await getVisibleCities();
            currentCities = visible;
            if (this.debugCitySelection) {
                console.info('[CitySelection] refresh', {
                    mode: currentMode,
                    nation: currentNation,
                    onlyCapoluoghi: showOnlyCapoluoghi,
                    visibleCities: Object.keys(visible || {}).length,
                });
            }
            this._renderCityList(visible, onSelect);
            this._renderCityMap(visible, onSelect, currentMode, currentNation, preferredCityId);
            if (citySearchSuggestions) {
                const options = new Set();
                Object.values(visible || {}).forEach(city => {
                    if (city.name) options.add(city.name);
                    if (city.region) options.add(city.region);
                });
                citySearchSuggestions.innerHTML = Array.from(options)
                    .sort((a, b) => a.localeCompare(b))
                    .slice(0, 120)
                    .map(v => `<option value="${escapeHtml(v)}"></option>`)
                    .join('');
            }
            if (preferredCityId) {
                const preferred = Object.values(currentCities).find(c => c.id === preferredCityId);
                if (preferred) this._selectCity(preferred, currentCities, onSelect, this.mapInstance);
            }
        };

        modeRadios.forEach(radio => {
            radio.addEventListener('change', e => {
                currentMode = e.target.value;
                nationSelect.disabled = currentMode === 'all';
                capoluoghiCheck.disabled = currentMode === 'all';
                if (currentMode === 'all') {
                    capoluoghiCheck.checked = false;
                    showOnlyCapoluoghi = false;
                }
                refreshUI();
            });
        });

        nationSelect.addEventListener('change', e => {
            currentNation = e.target.value;
            refreshUI();
        });

        capoluoghiCheck.addEventListener('change', e => {
            showOnlyCapoluoghi = !!e.target.checked;
            refreshUI();
        });

        sizeFilterSelect.addEventListener('change', e => {
            currentSizeFilter = e.target.value;
            refreshUI();
        });

        if (citySearchInput) {
            citySearchInput.addEventListener('input', e => {
                currentSearchQuery = e.target.value || '';
                refreshUI();
            });
        }

        await refreshUI();
    },

    _renderCityList(cities, onSelect) {
        const listEl = document.getElementById('city-select-list');
        if (!listEl) return;
        listEl.innerHTML = this._buildCityListHTML(cities, { mode: 'select' });
        listEl.querySelectorAll('.city-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const fullId = item.dataset.city;
                const city = cities[fullId];
                if (city) this._selectCity(city, cities, onSelect, this.mapInstance);
            });
        });
    },

    _renderCityMap(cities, onSelect, currentMode, currentNation, preferredCityId) {
        const mapContainer = document.getElementById('city-select-map');
        if (!mapContainer) return null;
        if (typeof L === 'undefined') {
            mapContainer.innerHTML = '<div style="padding:20px;text-align:center;">Mappa non disponibile, usa la lista.</div>';
            return null;
        }

        const nationMeta = this._getNationSelectionMeta(currentNation || 'italy');
        const preferredCity = preferredCityId
            ? Object.values(cities || {}).find(c => c.id === preferredCityId)
            : null;
        const center = preferredCity
            ? [preferredCity.lat, preferredCity.lng]
            : (currentMode === 'all' ? [50.2, 8.5] : nationMeta.center);
        const zoom = preferredCity ? 8 : (currentMode === 'all' ? 5 : nationMeta.zoom);
        const map = this._initLeafletMap('city-select-map', center, zoom);
        if (map) {
            this._addCityMarkers(map, cities, {
                onMarkerClick: (city) => this._selectCity(city, cities, onSelect, map),
            });
        }
        return map;
    },

    _selectCity(city, cities, onSelect, map) {
        const cityKey = city._cityKey || city.id;
        // Highlight in list
        document.querySelectorAll('.city-list-item.selected').forEach(el => el.classList.remove('selected'));
        const listItem = document.querySelector(`.city-list-item[data-city="${cityKey}"]`);
        if (listItem) {
            listItem.classList.add('selected');
            listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        // Pan map
        if (map) map.setView([city.lat, city.lng], 8, { animate: true });

        const realCity = { ...city };
        delete realCity._nation;
        delete realCity._cityKey;

        // Show info
        this._showCityInfo(realCity);
        document.getElementById('csi-confirm').onclick = () => {
            if (city._nation && city._nation !== (Game.state.nation && Game.state.nation.id)) {
                Game.loadNation(city._nation).then(() => onSelect(realCity.id));
            } else {
                onSelect(realCity.id);
            }
        };
    },

    _showCityInfo(city) {
        const info = document.getElementById('city-select-info');
        if (!info) return;
        info.classList.remove('hidden');
        document.getElementById('csi-name').textContent = city.name;
        const cityClass = city.cityClass || this._getCityClass(city);
        const classLabel = {
            comune: 'Comune',
            citta_piccola: 'Citta piccola',
            citta_media: 'Citta media',
            citta_grande: 'Citta grande',
        }[cityClass] || 'Citta';
        const popLabel = this._getMarkerPopulationRange(city);
        const inhabitants = city.inhabitants ? ` • ~${city.inhabitants.toLocaleString('it-IT')} ab.` : '';
        document.getElementById('csi-region').textContent = `${city.region} • ${classLabel} • ${popLabel}${inhabitants}`;
        document.getElementById('csi-desc').textContent = city.desc;

        const bonusParts = [];
        if (city.bonus.reputazione) bonusParts.push(`📈 Rep locale +${city.bonus.reputazione}/giorno`);
        if (city.bonus.networking) bonusParts.push(`🤝 Networking +${city.bonus.networking}%`);
        if (city.bonus.money) bonusParts.push(`💶 Denaro +€${city.bonus.money}/giorno`);
        if (city.bonus.carisma) bonusParts.push(`✨ Carisma +${city.bonus.carisma}/giorno`);
        if (city.bonus.intelligenza) bonusParts.push(`🧠 Intelligenza +${city.bonus.intelligenza}/giorno`);
        if (city.bonus.morale) bonusParts.push(`😊 Morale +${city.bonus.morale} iniziale`);
        document.getElementById('csi-bonus').innerHTML = '<strong>Bonus:</strong> ' + (bonusParts.join(', ') || 'Nessuno');

        const malusParts = [];
        if (city.malus.stress) malusParts.push(`😰 Stress +${city.malus.stress}/giorno`);
        if (city.malus.concorrenza < 1) {
            const concorrenzaLoss = Math.round((1 - city.malus.concorrenza) * 100);
            malusParts.push(`⚔️ Concorrenza: task politici -${concorrenzaLoss}% efficacia`);
        }
        document.getElementById('csi-malus').innerHTML = '<strong>Malus:</strong> ' + (malusParts.join(', ') || 'Nessuno');

        const baseRent = 300;
        const cityRent = Math.round(baseRent * city.rentMultiplier);
        document.getElementById('csi-rent').innerHTML = `<strong>Affitto base:</strong> €${cityRent}/mese`;
    },

    // === DESK PANEL: Map for Transfer ===
    async renderMapPanel(targetId) {
        const panel = document.getElementById(targetId || 'map-body');
        if (!panel) return;
        const cities = await this.loadAllCities();
        const current = Game.state.city;
        let nationFilter = 'all';
        let showOnlyCapoluoghi = false;
        let settlementFilter = 'all';
        const nationOptions = typeof Nations !== 'undefined' && Nations.getAvailableNations
            ? Nations.getAvailableNations()
            : [];

        panel.innerHTML = `
            <div class="map-panel-header">
                <div class="map-current-city">📍 <strong>${current ? current.name : 'Sconosciuta'}</strong> <span class="map-region">${current ? current.region : ''}</span></div>
                <label class="city-filter-toggle">Nazione:
                    <select id="transfer-filter-nation">
                        <option value="all">Europa</option>
                        ${nationOptions.map(n => `<option value="${n.id}" ${current && this._getCityNationId(current) === n.id ? 'selected' : ''}>${n.name}</option>`).join('')}
                    </select>
                </label>
                <label class="city-filter-toggle"><input type="checkbox" id="transfer-filter-capoluoghi"> Mostra solo capoluoghi</label>
                <label class="city-filter-toggle">Tipo:
                    <select id="transfer-filter-settlement">
                        <option value="all">Tutti</option>
                        <option value="comune50k">Comuni > 50k abitanti</option>
                        <option value="comune">Comuni</option>
                        <option value="city">Città</option>
                        <option value="capital">Capoluoghi regionali</option>
                        <option value="metropolis">Metropoli</option>
                    </select>
                </label>
            </div>
            <div class="map-panel-layout">
                <div class="map-panel-map-wrap">
                    <div class="city-legend compact" aria-label="Legenda marker trasferimenti">
                        <div class="legend-title">🗺️ Legenda marker</div>
                        <div class="legend-items">
                            <div class="legend-item"><div class="legend-marker square-marker small-marker"></div><span>Comune</span></div>
                            <div class="legend-item"><div class="legend-marker triangle-marker"></div><span>Città piccola</span></div>
                            <div class="legend-item"><div class="legend-marker circle-marker medium-marker"></div><span>Città media</span></div>
                            <div class="legend-item"><div class="legend-marker circle-marker large-marker legend-large-city star-marker"></div><span>Città grande</span></div>
                        </div>
                        <div class="legend-note">★ = corrente | grigio = visitata | bianco = grande città</div>
                    </div>
                    <div id="desk-map" class="desk-map"></div>
                    <div id="transfer-info" class="transfer-info hidden"></div>
                </div>
                <div class="city-list-sidebar" id="desk-city-list">
                    <div class="city-list-title">🚚 Trasferimenti</div>
                    <div class="city-list-scroll" id="desk-city-list-scroll"></div>
                    <div class="transfer-nation-section">
                        <button id="btn-change-nation" class="transfer-nation-btn">🌍 Cambia Nazione</button>
                    </div>
                </div>
            </div>
        `;
        const isPhoneMap = targetId === 'phone-map-body';
        nationFilter = isPhoneMap
            ? (current ? this._getCityNationId(current) : 'italy')
            : (current ? this._getCityNationId(current) : 'all');
        const getVisibleCities = () => this._filterCities(cities, showOnlyCapoluoghi, settlementFilter, nationFilter === 'all' ? null : nationFilter);

        setTimeout(() => {
        // Sostituisci setTimeout con MutationObserver per robustezza
        const addNationBtnListener = () => {
            const btn = document.getElementById('btn-change-nation');
            if (btn && !btn._nationListenerAdded) {
                btn.addEventListener('click', () => this.showNationTransferUI());
                btn._nationListenerAdded = true;
                return true;
            }
            return false;
        };
        if (!addNationBtnListener()) {
            const observer = new MutationObserver(() => {
                if (addNationBtnListener()) observer.disconnect();
            });
            observer.observe(document.getElementById('map-body') || document.body, { childList: true, subtree: true });
        }

        const renderTransferList = (visibleCities, map) => {
            const listEl = document.getElementById('desk-city-list-scroll');
            if (!listEl) return;
            listEl.innerHTML = this._buildCityListHTML(visibleCities, { currentCityId: current ? current.id : null, mode: 'transfer' });
            listEl.querySelectorAll('.city-list-item:not(.city-list-current)').forEach(item => {
                item.addEventListener('click', () => {
                    const cityId = item.dataset.city;
                    const city = visibleCities[cityId];
                    if (city) {
                        this._showTransferInfo(city);
                        this._highlightListItem(city.id, map, city);
                    }
                });
            });
        };

        const renderTransferMap = (visibleCities) => {
            const currentNationId = current ? this._getCityNationId(current) : 'italy';
            const nationMeta = this._getNationSelectionMeta(nationFilter === 'all' ? currentNationId : nationFilter);
            const center = current ? [current.lat, current.lng] : nationMeta.center;
            const zoom = isPhoneMap ? 6 : (nationFilter === 'all' ? 4 : 6);
            const map = this._initLeafletMap('desk-map', center, zoom);
            if (map) {
                this._addCityMarkers(map, visibleCities, {
                    highlightCurrent: true,
                    currentCityId: current ? current.id : null,
                    onMarkerClick: (city) => {
                        if (current && city.id === current.id) return;
                        this._showTransferInfo(city);
                        this._highlightListItem(city.id, map, city);
                    },
                });
            }
            return map;
        };

        let map = renderTransferMap(getVisibleCities());
        renderTransferList(getVisibleCities(), map);

        const toggle = document.getElementById('transfer-filter-capoluoghi');
        if (toggle) {
            toggle.addEventListener('change', () => {
                showOnlyCapoluoghi = !!toggle.checked;
                const visible = getVisibleCities();
                map = renderTransferMap(visible);
                renderTransferList(visible, map);
            });
        }

        const nationSelect = document.getElementById('transfer-filter-nation');
        if (nationSelect) {
            nationSelect.value = nationFilter;
            nationSelect.addEventListener('change', () => {
                nationFilter = nationSelect.value || 'all';
                const visible = getVisibleCities();
                map = renderTransferMap(visible);
                renderTransferList(visible, map);
            });
        }

        const settlementSelect = document.getElementById('transfer-filter-settlement');
        if (settlementSelect) {
            settlementSelect.addEventListener('change', () => {
                settlementFilter = settlementSelect.value || 'all';
                const visible = getVisibleCities();
                map = renderTransferMap(visible);
                renderTransferList(visible, map);
            });
        }
    },

    _highlightListItem(cityId, map, city) {
        document.querySelectorAll('#desk-city-list .city-list-item.selected').forEach(el => el.classList.remove('selected'));
        const listItem = document.querySelector(`#desk-city-list .city-list-item[data-city="${cityId}"]`);
        if (listItem) {
            listItem.classList.add('selected');
            listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (map && city) map.setView([city.lat, city.lng], 8, { animate: true });
    },

    async showNationTransferUI() {
        const nations = typeof Nations !== 'undefined' && Nations.getAvailableNations
            ? Nations.getAvailableNations()
            : [
                { id: 'italy', name: 'Italia', currency: '€' },
                { id: 'france', name: 'Francia', currency: '€' },
                { id: 'germany', name: 'Germania', currency: '€' },
                { id: 'uk', name: 'Regno Unito', currency: '£' },
            ];
        const currentId = Game.state.nation?.id || 'italy';
        const options = nations
            .filter(n => n.id !== currentId)
            .map(n => `<option value="${n.id}">${n.name} (${n.currency})</option>`)
            .join('');

        const transferTitle = Localization?.translate('transfer.title') || 'Trasferimento all\'Estero';
        const fromNationId = Game.state.nation?.id || 'italy';
        const getTransferQuote = (toNationId) => {
            const baseCost = (typeof Nations !== 'undefined' && Nations.getInternationalTransferCost)
                ? Nations.getInternationalTransferCost(fromNationId, toNationId)
                : ((typeof GameConstants !== 'undefined' && GameConstants.ECONOMY)
                    ? GameConstants.ECONOMY.TRANSFER_COST_INTERNATIONAL_FALLBACK
                    : 2000);
            const taxInfo = this._computeInternationalTransferWealthTax(fromNationId, toNationId);
            return {
                baseCost,
                taxRate: taxInfo.taxRate,
                wealthTax: taxInfo.wealthTax,
                total: baseCost + taxInfo.wealthTax,
            };
        };

        const firstTargetId = (nations.find(n => n.id !== currentId) || {}).id;
        const fallbackInternational = (typeof GameConstants !== 'undefined' && GameConstants.ECONOMY)
            ? GameConstants.ECONOMY.TRANSFER_COST_INTERNATIONAL_FALLBACK
            : 2000;
        const requiredAP = (typeof GameConstants !== 'undefined' && GameConstants.ECONOMY)
            ? GameConstants.ECONOMY.TRANSFER_ACTION_POINTS_INTERNATIONAL
            : 2;
        const initialQuote = firstTargetId ? getTransferQuote(firstTargetId) : { baseCost: fallbackInternational, taxRate: 0.08, wealthTax: 0, total: fallbackInternational };
        const transferCost = `Costo: €${initialQuote.baseCost} + tassa patrimonio ${Math.round(initialQuote.taxRate * 100)}% (totale attuale €${initialQuote.total}) + ${requiredAP} PA`;
        const transferWarning = Localization?.translate('transfer.warning') || 'Perderai tutti i contatti...';
        const transferDestination = Localization?.translate('transfer.destination') || 'Nazione destinazione:';
        const confirmBtn = Localization?.translate('transfer.confirm_btn') || 'Conferma Trasferimento';
        const cancelBtn = Localization?.translate('transfer.cancel_btn') || 'Annulla';

        const modalHtml = `
            <div id="nation-transfer-modal" class="nation-modal">
                <div class="nation-modal-content">
                    <h3>🌍 ${transferTitle}</h3>
                    <p id="nation-transfer-cost">${transferCost}</p>
                    <p>${transferWarning}</p>
                    <label>${transferDestination}</label>
                    <select id="nation-select" style="width:100%; padding:8px; margin:10px 0;">${options}</select>
                    <div class="nation-modal-buttons" style="display:flex; gap:12px; margin-top:16px;">
                        <button id="nation-confirm" style="flex:1; padding:8px; background:#2E7D32; color:white; border:none; border-radius:6px; cursor:pointer;">${confirmBtn}</button>
                        <button id="nation-cancel" style="flex:1; padding:8px; background:#9E9E9E; color:white; border:none; border-radius:6px; cursor:pointer;">${cancelBtn}</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('nation-transfer-modal');
        const selectEl = document.getElementById('nation-select');
        const costEl = document.getElementById('nation-transfer-cost');

        const refreshTransferCost = () => {
            if (!selectEl || !costEl) return;
            const quote = getTransferQuote(selectEl.value);
            costEl.textContent = `Costo: €${quote.baseCost} + tassa patrimonio ${Math.round(quote.taxRate * 100)}% (totale attuale €${quote.total}) + ${requiredAP} PA`;
        };

        if (selectEl) {
            selectEl.addEventListener('change', refreshTransferCost);
            refreshTransferCost();
        }
        
        document.getElementById('nation-cancel').onclick = () => modal.remove();
        document.getElementById('nation-confirm').onclick = async () => {
            const newNationId = document.getElementById('nation-select').value;
            const ok = await this.transferToNation(newNationId);
            modal.remove();
            if (!ok) return;
        };
    },

    async transferToNation(newNationId) {
        const nations = typeof Nations !== 'undefined' && Nations.getAvailableNations
            ? Nations.getAvailableNations()
            : [];
        const fromNationId = Game.state.nation?.id || 'italy';
        if (!newNationId || newNationId === fromNationId) return false;

        const baseCost = (typeof Nations !== 'undefined' && Nations.getInternationalTransferCost)
            ? Nations.getInternationalTransferCost(fromNationId, newNationId)
            : ((typeof GameConstants !== 'undefined' && GameConstants.ECONOMY)
                ? GameConstants.ECONOMY.TRANSFER_COST_INTERNATIONAL_FALLBACK
                : 2000);
        const taxInfo = this._computeInternationalTransferWealthTax(fromNationId, newNationId);
        const wealthTax = taxInfo.wealthTax;
        const total = baseCost + wealthTax;
        const requiredAP = (typeof GameConstants !== 'undefined' && GameConstants.ECONOMY)
            ? GameConstants.ECONOMY.TRANSFER_ACTION_POINTS_INTERNATIONAL
            : 2;

        if (Game.state.money < total || Game.state.actionPoints < requiredAP) {
            const insufficientMsg = Localization?.translate('transfer.insufficient_funds') || 'Fondi o PA insufficienti!';
            const moneyDeficit = Math.max(0, total - (Game.state.money || 0));
            const apDeficit = Math.max(0, requiredAP - (Game.state.actionPoints || 0));
            let details = `Servono €${total} e ${requiredAP} PA. Hai €${Game.state.money} e ${Game.state.actionPoints} PA.`;
            if (moneyDeficit > 0 || apDeficit > 0) {
                details += `\nMancano: €${moneyDeficit}${apDeficit > 0 ? ` e ${apDeficit} PA` : ''}.`;
            }
            alert(`${insufficientMsg}\n${details}`);
            return false;
        }

        Game.changeMoney(-total);
        Game.state.actionPoints -= requiredAP;
        Game.emit('ap-change', { ap: Game.state.actionPoints });

        if (typeof Game.loadNation === 'function') {
            await Game.loadNation(newNationId);
        } else {
            Game.state.nation = { id: newNationId };
        }

        Game.state.contacts = [];
        Game.state.partner = null;
        Game.state.contactsLost = [];
        Game.state.city = null;
        Game.state.reputazione = 20;
        Game.state.reputazioneNazionale = 5;

        if (typeof Desk !== 'undefined' && Desk.closeAllPanels) {
            Desk.closeAllPanels();
        }

        const nationName = nations.find(n => n.id === newNationId)?.name || newNationId;
        const successMsg = Localization?.translate('transfer.success', { nation: nationName }) || `Sei arrivato in ${nationName}. Nuova vita, nuove sfide.`;
        Game.addWorkNotif('🌍 Trasferimento', successMsg, `Giorno ${Game.state.day}`);
        Game.addWorkNotif('🏙️ Nuova Citta', 'Seleziona la tua nuova citta per continuare.', `Giorno ${Game.state.day}`);

        if (typeof Character !== 'undefined' && Character.showCitySelection) {
            Character.showCitySelection();
        }
        return true;
    },

    _showTransferInfo(city) {
        const info = document.getElementById('transfer-info');
        if (!info) return;
        info.classList.remove('hidden');

        const currentCity = Game.state.city || null;
        const transferEco = this._getTransferEconomy(currentCity, city);
        const transferBonus = (transferEco.isInternational && typeof Nations !== 'undefined' && Nations.getTransferBonus)
            ? Nations.getTransferBonus(transferEco.fromNationId, transferEco.toNationId)
            : null;
        const baseRent = 300;
        const newRent = Math.round(baseRent * city.rentMultiplier);
        const nonFavContacts = Game.state.contacts.filter(c => !c.favorite).length;
        const favContacts = Game.state.contacts.filter(c => c.favorite).length;
        const baseCareer = Game.CAREER_LEVELS[Game.state.career.level] || Game.CAREER_LEVELS[0];
        const currSalary = Math.round(baseCareer.salary * this._getCitySalaryMultiplier(currentCity));
        const newSalary = Math.round(baseCareer.salary * this._getCitySalaryMultiplier(city));

        const bonusParts = [];
        if (city.bonus.reputazione) bonusParts.push(`Rep locale +${city.bonus.reputazione}/g`);
        if (city.bonus.networking) bonusParts.push(`Networking +${city.bonus.networking}%`);
        if (city.bonus.money) bonusParts.push(`+€${city.bonus.money}/g`);
        const malusParts = [];
        if (city.malus.stress) malusParts.push(`Stress +${city.malus.stress}/g`);
        if (city.malus.concorrenza < 1) {
            const concorrenzaLoss = Math.round((1 - city.malus.concorrenza) * 100);
            malusParts.push(`Task politici -${concorrenzaLoss}%`);
        }

        info.innerHTML = `
            <div class="transfer-header">🚚 Trasferimento a <strong>${city.name}</strong></div>
            <div class="transfer-details">
                <div>💶 Costo base: <strong>€${transferEco.baseCost}</strong>${transferEco.isInternational ? ' (trasferimento internazionale)' : (transferEco.baseCost === this.TRANSFER_COST_INTERREGIONAL ? ' (trasferimento interregionale)' : ' (stessa regione)')}</div>
                <div>🛣️ Tasse/strada: <strong>€${transferEco.extraTax}</strong> (distanza ${transferEco.distanceKm} km: €${transferEco.distanceCost}${transferEco.richToCheap ? `, contributo patrimonio ${Math.round(transferEco.luxuryTaxPct * 100)}%: €${transferEco.wealthTax}` : ''})</div>
                <div>💳 Totale trasferimento: <strong>€${transferEco.totalCost}</strong></div>
                <div>⚡ PA richiesti: <strong>${this.TRANSFER_AP}</strong></div>
                <div>📍 Nuovo affitto base: <strong>€${newRent}/mese</strong></div>
                <div>💼 Stipendio città: <strong>€${currSalary} → €${newSalary}</strong></div>
                <div>📈 Bonus: ${bonusParts.join(', ') || 'Nessuno'}</div>
                <div>📉 Malus: ${malusParts.join(', ') || 'Nessuno'}</div>
                ${transferEco.isInternational ? `<div>🌍 Cambio paese: <strong>${transferEco.fromNationId}</strong> → <strong>${transferEco.toNationId}</strong></div>` : ''}
                ${transferBonus ? `<div>🧠 Adattamento: Morale ${transferBonus.morale}, Coerenza ${transferBonus.coherence}, Stress +${transferBonus.stressInitial}</div>` : ''}
                ${transferEco.richToCheap ? '<div>🧾 Reddito alto + destinazione molto economica: il comune applica un contributo extra di urbanizzazione.</div>' : ''}
                <hr>
                <div class="transfer-warning">⚠️ <strong>${nonFavContacts}</strong> contatti non preferiti verranno persi!</div>
                <div class="transfer-keep">⭐ <strong>${favContacts}</strong> contatti preferiti ti seguiranno.</div>
            </div>
            <div class="transfer-actions">
                <button class="transfer-confirm-btn" id="transfer-confirm">Conferma Trasferimento</button>
                <button class="transfer-cancel-btn" id="transfer-cancel">Annulla</button>
            </div>
        `;

        // Snapshottiamo city per evitare race condition
        const snapshotCity = { ...city };
        document.getElementById('transfer-confirm').addEventListener('click', () => this.executeTransfer(snapshotCity.id), { once: true });
        document.getElementById('transfer-cancel').addEventListener('click', () => info.classList.add('hidden'), { once: true });
    },

    async executeTransfer(cityId) {
        // Usa loadAllCities per supporto internazionale
        const cities = await this.loadAllCities();
        const city = cities[cityId];
        if (!city) return;

        const fromCity = Game.state.city || null;
        const transferEco = this._getTransferEconomy(fromCity, city);
        const transferBonus = (transferEco.isInternational && typeof Nations !== 'undefined' && Nations.getTransferBonus)
            ? Nations.getTransferBonus(transferEco.fromNationId, transferEco.toNationId)
            : null;
        const firstVisit = !(Game.state.visitedCities || []).includes(cityId);

        if (Game.state.money < transferEco.totalCost) {
            Game.addWorkNotif('💸 Fondi insufficienti', `Servono €${transferEco.totalCost} per trasferirsi (base €${transferEco.baseCost} + tasse €${transferEco.extraTax}).`, `Giorno ${Game.state.day}`);
            return;
        }
        if (Game.state.actionPoints < this.TRANSFER_AP) {
            Game.emit('no-ap', { reason: 'Non hai abbastanza punti azione per trasferirti!' });
            return;
        }

        Game.changeMoney(-transferEco.totalCost);
        Game.state.actionPoints -= this.TRANSFER_AP;
        Game.emit('ap-change', { ap: Game.state.actionPoints });

        // Track visited cities and roads
        if (!Game.state.visitedCities) Game.state.visitedCities = [];
        if (!Game.state.visitedRoads) Game.state.visitedRoads = [];
        const fromId = fromCity ? fromCity.id : null;
        if (fromId && !Game.state.visitedCities.includes(fromId)) Game.state.visitedCities.push(fromId);
        if (!Game.state.visitedCities.includes(cityId)) Game.state.visitedCities.push(cityId);
        // Mark connecting road as visited
        if (fromId) {
            const roadKey = [fromId, cityId].sort().join('-');
            if (!Game.state.visitedRoads.includes(roadKey)) Game.state.visitedRoads.push(roadKey);
        }

        const preferiti = Game.state.contacts.filter(c => c.favorite);
        const persi = Game.state.contacts.filter(c => !c.favorite).map(c => ({
            ...c,
            originalCity: Game.state.city ? Game.state.city.id : 'sconosciuta',
            lostDay: Game.state.day,
            originalRelation: c.relation, // Salva relazione originale per recupero migliore
        }));
        Game.state.contactsLost.push(...persi);
        Game.state.contacts = preferiti;

        const oldCityName = Game.state.city ? Game.state.city.name : 'Sconosciuta';
        Game.state.city = {
            id: city.id,
            name: city.name,
            country: this._getCityNationId(city),
            lat: city.lat,
            lng: city.lng,
            region: city.region,
            type: city.type,
            population: city.population,
            tier: city.tier,
            settlementType: city.settlementType,
            politicalRelevance: city.politicalRelevance,
            economyType: city.economyType,
            culture: city.culture,
            bonus: city.bonus,
            malus: city.malus,
            rentMultiplier: city.rentMultiplier,
            salaryMultiplier: this._getCitySalaryMultiplier(city),
        };
        if (transferEco.isInternational && Game.changeNation) {
            Game.changeNation(this._getCityNationId(city));
        }
        if (Game.initCityFlags) Game.initCityFlags();

        Game.state.housing.rent = Math.round(300 * city.rentMultiplier);
        if (Game.state.housing.type === 'periferia') {
            Game.state.housing.rent = Math.round(550 * city.rentMultiplier);
        } else if (Game.state.housing.type === 'centro') {
            Game.state.housing.rent = Math.round(900 * city.rentMultiplier);
        }

        const localRepBase = Number.isFinite(Game.state.reputazioneLocale)
            ? Game.state.reputazioneLocale
            : (Number.isFinite(Game.state.reputazione) ? Game.state.reputazione : 20);
        Game.state.reputazioneLocale = Math.max(10, Math.round(localRepBase * 0.4));
        Game.state.reputazione = Game.state.reputazioneLocale;

        Game.changeStat('stress', 15);
        Game.changeStat('stanchezza', 20);

        if (transferBonus) {
            Game.changeStat('morale', transferBonus.morale || 0);
            Game.changeStat('coherence', transferBonus.coherence || 0);
            Game.changeStat('stress', transferBonus.stressInitial || 0);
            if (transferBonus.economicBonus) Game.changeMoney(transferBonus.economicBonus);
        }

        // Move from rich city to much cheaper city: pay extra but get a small adaptation morale boost
        if (transferEco.richToCheap) {
            Game.changeStat('morale', 4);
            Game.changeStat('stress', -3);
        }
        if (fromCity && (fromCity.type || 'city') === 'city' && (city.type || 'city') === 'municipality') {
            Game.changeStat('morale', 3);
            Game.changeStat('stress', -2);
            Game.addWorkNotif('🌿 Adattamento Locale', 'Passare da capoluogo a comune ti aiuta a ritrovare ritmo e contatto umano.', `Giorno ${Game.state.day}`);
        }

        // Exploration bonus on first arrival in a new city
        if (firstVisit) {
            Game.changeReputazione(5);
            Game.addWorkNotif('🧭 Esplorazione', `Prima volta a ${city.name}: +5 Reputazione locale.`, `Giorno ${Game.state.day}`);
        }

        Game.advanceTime();

        Game.addWorkNotif('🚚 Trasferimento', `Sei arrivato a ${city.name}! Costo totale €${transferEco.totalCost} (tasse €${transferEco.extraTax}). ${persi.length} contatti persi, ${preferiti.length} preferiti ti hanno seguito.${transferEco.isInternational ? ' Adattamento internazionale applicato.' : ''}`, `Giorno ${Game.state.day}`);
        Game.addUrgentMessage('Segreteria', `Benvenuto a ${city.name}. La sede locale${transferEco.isInternational ? ' e la nuova segreteria nazionale' : ''} sono state avvisate del tuo arrivo.`, 'info');

        Game.emit('city-change', { from: oldCityName, to: city.name });
        Game.emit('stat-change', {});

        Desk.closeAllPanels();
    },

    getCityBonus(type) {
        const city = Game.state.city;
        if (!city || !city.bonus) return 0;
        return city.bonus[type] || 0;
    },

    getCityMalus(type) {
        const city = Game.state.city;
        if (!city || !city.malus) return 0;
        return city.malus[type] || 0;
    },

    getNetworkingBonus() {
        const bonus = this.getCityBonus('networking');
        return 1 + (bonus / 100);
    },

    getConcorrenzaMultiplier() {
        return this.getCityMalus('concorrenza') || 1;
    },

    recoverContacts(cityId) {

        // Normalizza cityId per confronti cross-nazione
        const normalize = id => (id || '').replace(/^[a-z]+_/, '');
        const recoverable = Game.state.contactsLost.filter(c => normalize(c.originalCity) === normalize(cityId));
        if (recoverable.length === 0) return;

        recoverable.forEach(c => {
            // Nuovo sistema: dimezza solo la perdita, non la relazione attuale
            // Se avevi 80 e ora hai 40 (perdita di 40), recupera a 60 (40 + 20)
            if (c.originalRelation && typeof c.originalRelation === 'number') {
                const lossAmount = Math.max(0, c.originalRelation - c.relation);
                c.relation = Math.max(5, Math.round(c.relation + lossAmount / 2));
            } else {
                // Fallback: se originalRelation non esiste, usa il vecchio sistema
                c.relation = Math.max(5, Math.round(c.relation * 0.5));
            }
            delete c.originalCity;
            delete c.lostDay;
            delete c.originalRelation;
            Game.state.contacts.push(c);
        });
        Game.state.contactsLost = Game.state.contactsLost.filter(c => normalize(c.originalCity) !== normalize(cityId));

        if (recoverable.length > 0) {
            Game.addWorkNotif('📞 Contatti Ritrovati', `Hai ritrovato ${recoverable.length} vecchi contatti a ${Game.state.city.name}! (Relazioni parzialmente ripristinate)`, `Giorno ${Game.state.day}`);
        }
    },
};
