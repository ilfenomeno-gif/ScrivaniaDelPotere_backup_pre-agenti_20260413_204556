/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SYSTEMS_DIR = path.join(ROOT, 'js', 'systems');
const REPORT_PATH = path.join(ROOT, 'TEST_REPORT_DLC_MATRIX.md');

const DLC_SYSTEMS = [
    { id: 'dlc_toghe_judiciary', symbol: 'Judiciary', file: 'judiciary.js', group: 'political_criminal' },
    { id: 'dlc_oltre_confini_diplomacy', symbol: 'Diplomacy', file: 'diplomacy.js', group: 'political_criminal' },
    { id: 'dlc_stampa_media', symbol: 'Press', file: 'press.js', group: 'political_criminal' },
    { id: 'dlc_prima_repubblica_scenario', symbol: 'Scenario', file: 'scenario.js', group: 'political_criminal' },
    { id: 'dlc_potere_tasca_lifestyle', symbol: 'PhoneExtensions', file: 'phoneExtensions.js', group: 'political_criminal' },
    { id: 'dlc_cupola_mafia', symbol: 'MafiaExtensions', file: 'mafiaExtensions.js', group: 'political_criminal' },
    { id: 'dlc_radici_housing', symbol: 'HousingExtended', file: 'housingExtended.js', group: 'daily_mechanics' },
    { id: 'dlc_agenda_piena_slots', symbol: 'DailySlots', file: 'dailySlots.js', group: 'daily_mechanics' },
    { id: 'dlc_corpo_mente_wellness', symbol: 'WellnessSystem', file: 'wellnessSystem.js', group: 'daily_mechanics' },
    { id: 'dlc_casa_dolce_casa_narrative', symbol: 'HouseNarrative', file: 'houseNarrative.js', group: 'daily_mechanics' },
    { id: 'dlc_prezzo_potere_expenses', symbol: 'DailyExpenses', file: 'dailyExpenses.js', group: 'daily_mechanics' },
    { id: 'dlc_tempo_libero_hobbies', symbol: 'HobbySystem', file: 'hobbySystem.js', group: 'daily_mechanics' },
    { id: 'il_vecchio_mondo_expansion', symbol: 'NationProfileSystem', file: 'nation_profile.js', group: 'nation_expansion' },
];

const DLC_DEPENDENCIES = {
    cambio_nazione_pro: 'il_vecchio_mondo_expansion',
};

function parseArgNumber(flag, fallback) {
    const idx = process.argv.findIndex(v => v === flag);
    if (idx < 0) return fallback;
    const value = Number(process.argv[idx + 1]);
    return Number.isFinite(value) ? value : fallback;
}

function parseThresholds() {
    return {
        minMoney: parseArgNumber('--min-money', -20000),
        maxStress: parseArgNumber('--max-stress', 100),
        minStress: parseArgNumber('--min-stress', 0),
        maxHealth: parseArgNumber('--max-health', 100),
        minHealth: parseArgNumber('--min-health', 0),
        maxCoherence: parseArgNumber('--max-coherence', 100),
        minCoherence: parseArgNumber('--min-coherence', 0),
    };
}

function buildGameStub() {
    const listeners = new Map();
    const notifications = [];

    const Game = {
        state: {},
        notifications,
        init() {
            this.state = {
                day: 1,
                money: 50000,
                screen: 'desk',
                timeSlot: 'mattina',
                flags: { activeDlc: [] },
                stats: {
                    stress: 20,
                    salute: 100,
                    stanchezza: 0,
                    morale: 50,
                },
                attributes: {
                    intelligenza: 50,
                    muscoli: 50,
                    carisma: 50,
                },
                coherence: 100,
                reputazione: 50,
                career: 0,
            };
            notifications.length = 0;
            listeners.clear();
        },
        on(eventName, cb) {
            if (!listeners.has(eventName)) listeners.set(eventName, []);
            listeners.get(eventName).push(cb);
        },
        emit(eventName) {
            const list = listeners.get(eventName) || [];
            for (const cb of list) cb();
        },
        addWorkNotif(title, body, when) {
            notifications.push({ title, body, when, day: this.state.day });
            if (notifications.length > 3000) notifications.shift();
        },
        changeMoney(delta) {
            this.state.money = Number(this.state.money || 0) + Number(delta || 0);
        },
        changeStat(statName, delta) {
            const d = Number(delta || 0);
            if (statName === 'coherence') {
                this.state.coherence = Math.max(0, Math.min(100, Number(this.state.coherence || 0) + d));
                return;
            }
            if (statName in this.state.stats) {
                this.state.stats[statName] = Math.max(0, Math.min(100, Number(this.state.stats[statName] || 0) + d));
                return;
            }
            if (statName in this.state.attributes) {
                this.state.attributes[statName] = Math.max(0, Math.min(100, Number(this.state.attributes[statName] || 0) + d));
                return;
            }
            this.state[statName] = Number(this.state[statName] || 0) + d;
        },
        changeReputazione(delta, scope) {
            const d = Number(delta || 0);
            if (scope === 'nazionale') {
                this.state.reputazioneNazionale = Math.max(0, Math.min(100, Number(this.state.reputazioneNazionale || 0) + d));
                return;
            }
            this.state.reputazione = Math.max(0, Math.min(100, Number(this.state.reputazione || 0) + d));
        },
        advanceDay() {
            this.state.day += 1;
            this.emit('new-day');
        },
    };

    Game.init();
    return Game;
}

function createContext() {
    const ctx = {
        console,
        Math,
        Date,
        JSON,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
    };

    ctx.Game = buildGameStub();
    ctx.window = ctx;
    ctx.globalThis = ctx;

    return vm.createContext(ctx);
}

function loadSystemIntoContext(ctx, systemMeta) {
    const filePath = path.join(SYSTEMS_DIR, systemMeta.file);
    const source = fs.readFileSync(filePath, 'utf8');
    vm.runInContext(source, ctx, { filename: filePath });

    const systemObject = ctx[systemMeta.symbol];
    if (!systemObject) {
        throw new Error(`Missing symbol ${systemMeta.symbol} after loading ${systemMeta.file}`);
    }

    return systemObject;
}

function invokeSmokeActions(systemName, systemObj, game, activeDlc) {
    if (systemName === 'HousingExtended') {
        systemObj.buyImprovement && systemObj.buyImprovement('scrivania');
        if (activeDlc.has('dlc_radici_housing')) {
            systemObj.buySecondaryResidence && systemObj.buySecondaryResidence('villa', 1);
            systemObj.schedulePenthouseMeeting && systemObj.schedulePenthouseMeeting('Ospite Test', 'politico');
        }
    }

    if (systemName === 'DailySlots') {
        systemObj.assignActivity && systemObj.assignActivity('mattina', 'sport');
        if (activeDlc.has('dlc_agenda_piena_slots')) {
            systemObj.assignActivity && systemObj.assignActivity('pomeriggio', 'corso_lingue');
        }
    }

    if (systemName === 'WellnessSystem') {
        systemObj.addAddiction && systemObj.addAddiction('fumo');
        if (activeDlc.has('dlc_corpo_mente_wellness')) {
            game.state.money += 2000;
            systemObj.consultDoctor && systemObj.consultDoctor('referto sensibile');
            systemObj.corruptDoctor && systemObj.corruptDoctor('mock_condition');
        }
    }

    if (systemName === 'HouseNarrative') {
        systemObj.buySpecialObject && systemObj.buySpecialObject('old_family_photo');
    }

    if (systemName === 'DailyExpenses') {
        systemObj.activateSubscription && systemObj.activateSubscription('gym');
        if (activeDlc.has('dlc_prezzo_potere_expenses')) {
            systemObj.buyCar && systemObj.buyCar('berlina');
            systemObj.buyInsurance && systemObj.buyInsurance('homeInsurance');
        }
    }

    if (systemName === 'HobbySystem') {
        systemObj.startHobby && systemObj.startHobby('lettura');
        if (activeDlc.has('dlc_tempo_libero_hobbies')) {
            game.state.money += 3000;
            systemObj.startHobby && systemObj.startHobby('fotografia');
            systemObj.useHobbySkill && systemObj.useHobbySkill('fotografia', 1);
        }
    }
}

function buildScenarios() {
    const all = DLC_SYSTEMS.map(s => s.id);
    const political = DLC_SYSTEMS.filter(s => s.group === 'political_criminal').map(s => s.id);
    const daily = DLC_SYSTEMS.filter(s => s.group === 'daily_mechanics').map(s => s.id);

    const scenarios = [
        { name: 'none', activeDlc: [] },
        { name: 'all', activeDlc: all },
        { name: 'bundle_political_criminal', activeDlc: political },
        { name: 'bundle_daily_mechanics', activeDlc: daily },
        { name: 'old_world_off_cambio_off', activeDlc: [] },
        { name: 'old_world_on_cambio_off', activeDlc: ['il_vecchio_mondo_expansion'] },
        { name: 'old_world_on_cambio_on', activeDlc: ['il_vecchio_mondo_expansion', 'cambio_nazione_pro'] },
        { name: 'old_world_off_cambio_on_dependency_violation', activeDlc: ['cambio_nazione_pro'], expectDependencyViolation: true },
    ];

    for (const system of DLC_SYSTEMS) {
        scenarios.push({ name: `single_${system.id}`, activeDlc: [system.id] });
    }

    return scenarios;
}

function runScenario(scenario, days, thresholds) {
    const ctx = createContext();
    const loaded = [];

    for (const systemMeta of DLC_SYSTEMS) {
        const systemObj = loadSystemIntoContext(ctx, systemMeta);
        loaded.push({ ...systemMeta, obj: systemObj });
    }

    const game = ctx.Game;
    game.state.flags.activeDlc = scenario.activeDlc.slice();

    const missingContracts = [];

    for (const entry of loaded) {
        if (typeof entry.obj.init !== 'function') missingContracts.push(`${entry.symbol}.init`);
        if (typeof entry.obj.runBaseEvents !== 'function') missingContracts.push(`${entry.symbol}.runBaseEvents`);
        if (typeof entry.obj.runDlcEvents !== 'function') missingContracts.push(`${entry.symbol}.runDlcEvents`);
        if (typeof entry.obj.isActive !== 'function') missingContracts.push(`${entry.symbol}.isActive`);
    }

    if (missingContracts.length > 0) {
        return {
            scenario: scenario.name,
            ok: false,
            dayReached: game.state.day,
            notifications: game.notifications.length,
            errors: missingContracts.map(c => `Missing contract: ${c}`),
        };
    }

    for (const entry of loaded) {
        try {
            entry.obj.init();
        } catch (err) {
            return {
                scenario: scenario.name,
                ok: false,
                dayReached: game.state.day,
                notifications: game.notifications.length,
                errors: [`Init failure in ${entry.symbol}: ${String(err.message || err)}`],
            };
        }
    }

    const activeSet = new Set(scenario.activeDlc);
    const errors = [];

    for (let i = 0; i < days; i += 1) {
        for (const entry of loaded) {
            try {
                invokeSmokeActions(entry.symbol, entry.obj, game, activeSet);
            } catch (err) {
                errors.push(`Action failure day ${game.state.day} in ${entry.symbol}: ${String(err.message || err)}`);
                if (errors.length > 30) break;
            }
        }

        try {
            game.advanceDay();
        } catch (err) {
            errors.push(`new-day failure at day ${game.state.day}: ${String(err.message || err)}`);
            break;
        }

        if (errors.length > 30) break;
    }

    const assertionErrors = [];
    const finalMoney = Number(game.state.money || 0);
    const finalStress = Number(game.state.stats.stress || 0);
    const finalHealth = Number(game.state.stats.salute || 0);
    const finalCoherence = Number(game.state.coherence || 0);

    const dependencyErrors = [];
    for (const [child, parent] of Object.entries(DLC_DEPENDENCIES)) {
        if (activeSet.has(child) && !activeSet.has(parent)) {
            dependencyErrors.push(`Dependency violation: ${child} requires ${parent}`);
        }
    }
    if (scenario.expectDependencyViolation) {
        if (dependencyErrors.length === 0) {
            assertionErrors.push('Expected dependency violation was not detected');
        }
    } else {
        assertionErrors.push(...dependencyErrors);
    }

    if (finalMoney < thresholds.minMoney) {
        assertionErrors.push(`Money below threshold: ${finalMoney} < ${thresholds.minMoney}`);
    }
    if (finalStress > thresholds.maxStress) {
        assertionErrors.push(`Stress above threshold: ${finalStress} > ${thresholds.maxStress}`);
    }
    if (finalStress < thresholds.minStress) {
        assertionErrors.push(`Stress below threshold: ${finalStress} < ${thresholds.minStress}`);
    }
    if (finalHealth > thresholds.maxHealth) {
        assertionErrors.push(`Health above threshold: ${finalHealth} > ${thresholds.maxHealth}`);
    }
    if (finalHealth < thresholds.minHealth) {
        assertionErrors.push(`Health below threshold: ${finalHealth} < ${thresholds.minHealth}`);
    }
    if (finalCoherence > thresholds.maxCoherence) {
        assertionErrors.push(`Coherence above threshold: ${finalCoherence} > ${thresholds.maxCoherence}`);
    }
    if (finalCoherence < thresholds.minCoherence) {
        assertionErrors.push(`Coherence below threshold: ${finalCoherence} < ${thresholds.minCoherence}`);
    }

    return {
        scenario: scenario.name,
        ok: errors.length === 0 && assertionErrors.length === 0,
        dayReached: game.state.day,
        notifications: game.notifications.length,
        money: finalMoney,
        stress: finalStress,
        salute: game.state.stats.salute,
        coherence: finalCoherence,
        errors: errors.concat(assertionErrors),
    };
}

function buildMarkdownReport(days, results, elapsedMs, thresholds) {
    const total = results.length;
    const passed = results.filter(r => r.ok).length;
    const failed = total - passed;

    const lines = [];
    lines.push('# DLC Integration Matrix Report');
    lines.push('');
    lines.push(`- Date: ${new Date().toISOString()}`);
    lines.push(`- Days per scenario: ${days}`);
    lines.push(`- Scenarios: ${total}`);
    lines.push(`- Passed: ${passed}`);
    lines.push(`- Failed: ${failed}`);
    lines.push(`- Elapsed: ${elapsedMs} ms`);
    lines.push(`- Thresholds: money >= ${thresholds.minMoney}, ${thresholds.minStress} <= stress <= ${thresholds.maxStress}, ${thresholds.minHealth} <= health <= ${thresholds.maxHealth}, ${thresholds.minCoherence} <= coherence <= ${thresholds.maxCoherence}`);
    lines.push('');
    lines.push('## Scenario Results');
    lines.push('');
    lines.push('| Scenario | Status | Day Reached | Notifications | Money | Stress | Health | Coherence |');
    lines.push('|---|---:|---:|---:|---:|---:|---:|---:|');

    for (const r of results) {
        lines.push(`| ${r.scenario} | ${r.ok ? 'PASS' : 'FAIL'} | ${r.dayReached} | ${r.notifications || 0} | ${Number(r.money || 0).toFixed(0)} | ${Number(r.stress || 0).toFixed(1)} | ${Number(r.salute || 0).toFixed(1)} | ${Number(r.coherence || 0).toFixed(1)} |`);
    }

    const failedRows = results.filter(r => !r.ok);
    if (failedRows.length > 0) {
        lines.push('');
        lines.push('## Failures');
        lines.push('');
        for (const row of failedRows) {
            lines.push(`### ${row.scenario}`);
            for (const err of row.errors || []) {
                lines.push(`- ${err}`);
            }
            lines.push('');
        }
    }

    return lines.join('\n');
}

function main() {
    const start = Date.now();
    const days = Math.max(5, parseArgNumber('--days', 30));
    const thresholds = parseThresholds();
    const scenarios = buildScenarios();

    console.log('DLC integration matrix test started');
    console.log(`Workspace: ${ROOT}`);
    console.log(`Scenarios: ${scenarios.length}, days: ${days}`);

    const results = scenarios.map(s => runScenario(s, days, thresholds));
    const elapsedMs = Date.now() - start;
    const failed = results.filter(r => !r.ok);

    const report = buildMarkdownReport(days, results, elapsedMs, thresholds);
    fs.writeFileSync(REPORT_PATH, report, 'utf8');

    console.log('--- Summary ---');
    console.log(`Passed: ${results.length - failed.length}/${results.length}`);
    console.log(`Failed: ${failed.length}`);
    console.log(`Report: ${path.relative(ROOT, REPORT_PATH)}`);
    console.log(`Elapsed: ${elapsedMs} ms`);

    if (failed.length > 0) {
        console.error('Failure details:');
        for (const row of failed) {
            console.error(`- ${row.scenario}`);
            for (const err of row.errors || []) {
                console.error(`  * ${err}`);
            }
        }
        process.exitCode = 1;
    }
}

main();
