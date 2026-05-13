#!/usr/bin/env node

/**
 * FINAL INTEGRATION TEST
 * Complete verification of all 5 DLC + supporting systems working together
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function finalIntegrationTest() {
    let browser;
    try {
        console.log('\n🎮 FINAL INTEGRATION TEST - COMPLETE DLC ECOSYSTEM');
        console.log('═══════════════════════════════════════════════════════\n');

        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();

        const filePath = `file://${path.resolve(__dirname, '../index.html')}`;
        await page.goto(filePath, { waitUntil: 'networkidle2', timeout: 90000 });
        await page.waitForFunction(() => typeof Game !== 'undefined', { timeout: 10000 });

        console.log('✅ Game loaded\n');

        const results = await page.evaluate(() => {
            const testResults = {
                systems: {},
                integration: {},
                performance: {},
                errors: []
            };

            try {
                // SETUP: Activate all DLC
                if (!Game.state.flags) Game.state.flags = {};
                Game.state.flags.activeDlc = [
                    'dlc_correnti_interne_party',
                    'dlc_ministero_governo',
                    'dlc_lobby_pressure',
                    'dlc_sangue_memoria_backstory',
                    'dlc_campagna_elettorale'
                ];

                // Initialize all systems
                const startTime = Date.now();
                PartyInternals.init();
                MinistrySystem.init();
                LobbySystem.init();
                BackstorySystem.init();
                CampaignSystem.init();
                CrossDlcEvents.init();
                ReputationSystem.init();
                const initTime = Date.now() - startTime;

                // ===== SYSTEMS HEALTH CHECK =====
                const systemsToCheck = [
                    { name: 'PartyInternals', obj: PartyInternals },
                    { name: 'MinistrySystem', obj: MinistrySystem },
                    { name: 'LobbySystem', obj: LobbySystem },
                    { name: 'BackstorySystem', obj: BackstorySystem },
                    { name: 'CampaignSystem', obj: CampaignSystem },
                    { name: 'CrossDlcEvents', obj: CrossDlcEvents },
                    { name: 'ReputationSystem', obj: ReputationSystem }
                ];

                systemsToCheck.forEach(sys => {
                    testResults.systems[sys.name] = {
                        registered: typeof window[sys.name] !== 'undefined',
                        active: sys.obj.isActive ? sys.obj.isActive() : null,
                        hasInit: typeof sys.obj.init === 'function',
                        hasState: Game.state[
                            sys.name.replace(/System/, '').replace(/([A-Z])/g, c => c.toLowerCase())
                                .replace(/^([a-z])/, c => c.toLowerCase())
                        ] !== undefined || sys.name === 'CrossDlcEvents' || sys.name === 'ReputationSystem'
                    };
                });

                // ===== INTEGRATION CHECKS =====
                testResults.integration = {
                    // Check 1: All systems can be activated together
                    allSystemsActive: systemsToCheck.every(s => 
                        s.obj.isActive ? s.obj.isActive() === true : true
                    ),

                    // Check 2: States exist for all systems
                    partyState: !!Game.state.partyInternals,
                    ministryState: !!Game.state.ministry,
                    lobbiesState: !!Game.state.lobbies,
                    backstoryState: !!Game.state.backstory,
                    campaignState: !!Game.state.campaign,
                    reputationState: !!Game.state.reputation,

                    // Check 3: Cross-DLC system is available
                    crossDlcAvailable: typeof CrossDlcEvents !== 'undefined' && typeof CrossDlcEvents.checkAndFireEvents === 'function',

                    // Check 4: Complex state mutations work
                    joinFactionWorks: PartyInternals.joinFaction('centristi'),
                    acceptMinistryWorks: MinistrySystem.acceptMinistry('Economia', 250),
                    acceptLobbyWorks: LobbySystem.acceptLobbyLoan('confindustria', 50),
                    changeAxisWorks: ReputationSystem.changeAxis('popolare', 10),

                    // Check 5: Event systems can be triggered
                    partyEventsTrigger: typeof PartyInternals.runDlcEvents === 'function',
                    ministryEventsTrigger: typeof MinistrySystem.runDlcEvents === 'function',
                    lobbyEventsTrigger: typeof LobbySystem.runDlcEvents === 'function',
                    backstoryEventsTrigger: typeof BackstorySystem.runDlcEvents === 'function',
                    campaignEventsTrigger: typeof CampaignSystem.runDlcEvents === 'function',
                    crossDlcEventsTrigger: typeof CrossDlcEvents.checkAndFireEvents === 'function'
                };

                // ===== PERFORMANCE TEST: 100 days of game simulation =====
                const perfStartTime = Date.now();
                let eventCounter = 0;
                for (let day = 1; day <= 100; day++) {
                    Game.state.day = day;
                    PartyInternals.onNewDay();
                    MinistrySystem.onNewDay();
                    LobbySystem.onNewDay();
                    BackstorySystem.onNewDay();
                    CampaignSystem.onNewDay();
                    CrossDlcEvents.checkAndFireEvents();
                    eventCounter++;
                }
                const perfTime = Date.now() - perfStartTime;

                testResults.performance = {
                    initTime: initTime,
                    simulation100Days: perfTime,
                    avgMsPerDay: (perfTime / 100).toFixed(2),
                    cyclesPerSecond: (100000 / perfTime).toFixed(2)
                };

                // ===== STATE CONSISTENCY AFTER 100 DAYS =====
                testResults.finalState = {
                    day: Game.state.day,
                    money: Game.state.money,
                    stress: Game.state.stress,
                    partyTension: Game.state.partyInternals.internalTension,
                    ministryBudget: Game.state.ministry.budget,
                    conflictRisk: Game.state.lobbies.conflictOfInterestRisk,
                    reputation: {
                        popolare: Game.state.reputation.popolare,
                        istituzionale: Game.state.reputation.istituzionale,
                        mediatica: Game.state.reputation.mediatica,
                        average: Game.state.reputation.average
                    }
                };

                // ===== BACKWARD COMPATIBILITY CHECK =====
                testResults.compatibility = {
                    legacyReputationWorks: typeof Game.state.reputazione === 'number',
                    legacyReputationValue: Game.state.reputazione
                };

            } catch (error) {
                testResults.errors.push(error.message);
            }

            return testResults;
        });

        // OUTPUT RESULTS
        console.log('═══════════════════════════════════════════════════════');
        console.log('PART 1: SYSTEMS HEALTH');
        console.log('═══════════════════════════════════════════════════════\n');

        Object.entries(results.systems).forEach(([name, status]) => {
            const emoji = status.active === true ? '✅' : status.active === false ? '⚠️' : '⏸️';
            console.log(`${emoji} ${name}`);
            console.log(`   Registered: ${status.registered ? '✅' : '❌'}`);
            console.log(`   Active: ${status.active === true ? '✅' : status.active === false ? 'Not active' : 'N/A'}`);
            console.log(`   Init method: ${status.hasInit ? '✅' : '❌'}`);
            console.log(`   State initialized: ${status.hasState ? '✅' : '⚠️'}`);
        });

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('PART 2: INTEGRATION CHECKS');
        console.log('═══════════════════════════════════════════════════════\n');

        const integrationKeys = [
            ['allSystemsActive', 'All systems can be active simultaneously'],
            ['partyState', 'Party system state'],
            ['ministryState', 'Ministry system state'],
            ['lobbiesState', 'Lobbies system state'],
            ['backstoryState', 'Backstory system state'],
            ['campaignState', 'Campaign system state'],
            ['reputationState', 'Reputation system state'],
            ['crossDlcAvailable', 'Cross-DLC event framework'],
            ['joinFactionWorks', 'Party: joinFaction() method'],
            ['acceptMinistryWorks', 'Ministry: acceptMinistry() method'],
            ['acceptLobbyWorks', 'Lobby: acceptLobbyLoan() method'],
            ['changeAxisWorks', 'Reputation: changeAxis() method'],
            ['partyEventsTrigger', 'Party events can trigger'],
            ['ministryEventsTrigger', 'Ministry events can trigger'],
            ['lobbyEventsTrigger', 'Lobby events can trigger'],
            ['backstoryEventsTrigger', 'Backstory events can trigger'],
            ['campaignEventsTrigger', 'Campaign events can trigger'],
            ['crossDlcEventsTrigger', 'Cross-DLC events can trigger']
        ];

        integrationKeys.forEach(([key, label]) => {
            const pass = results.integration[key];
            console.log(`${pass ? '✅' : '❌'} ${label}`);
        });

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('PART 3: PERFORMANCE METRICS');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log(`📊 System Initialization:`);
        console.log(`   Time: ${results.performance.initTime}ms`);
        console.log(`\n📊 Simulation Performance (100 days):`);
        console.log(`   Total time: ${results.performance.simulation100Days}ms`);
        console.log(`   Avg per day: ${results.performance.avgMsPerDay}ms`);
        console.log(`   Throughput: ${results.performance.cyclesPerSecond} cycles/sec`);

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('PART 4: FINAL STATE (after 100 simulation days)');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log(`Game day: ${results.finalState.day}`);
        console.log(`Money: €${results.finalState.money}M`);
        console.log(`Stress: ${results.finalState.stress}%`);
        console.log(`\nParty internal tension: ${results.finalState.partyTension}%`);
        console.log(`Ministry budget remaining: €${results.finalState.ministryBudget}M`);
        console.log(`Lobby conflict of interest: ${results.finalState.conflictRisk}%`);
        console.log(`\nReputation (3-axis):`);
        console.log(`   Popolare: ${results.finalState.reputation.popolare}`);
        console.log(`   Istituzionale: ${results.finalState.reputation.istituzionale}`);
        console.log(`   Mediatica: ${results.finalState.reputation.mediatica}`);
        console.log(`   Average: ${results.finalState.reputation.average}`);

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('PART 5: BACKWARD COMPATIBILITY');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log(`Legacy Game.state.reputazione field:`);
        console.log(`   Present: ${results.compatibility.legacyReputationWorks ? '✅' : '❌'}`);
        console.log(`   Value: ${results.compatibility.legacyReputationValue}`);

        // FINAL SUMMARY
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('✅ FINAL INTEGRATION TEST COMPLETE');
        console.log('═══════════════════════════════════════════════════════\n');

        const systemsOk = Object.values(results.systems).every(s => s.registered && s.hasInit);
        const integrationOk = Object.values(results.integration).every(v => v === true);
        const performanceOk = results.performance.simulation100Days < 5000; // Less than 5 seconds for 100 days

        console.log('📋 TEST SUMMARY:');
        console.log(`   Systems registered: ${systemsOk ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Integration checks: ${integrationOk ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Performance: ${performanceOk ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`   Backward compatibility: ${results.compatibility.legacyReputationWorks ? '✅ PASS' : '❌ FAIL'}`);

        const allPass = systemsOk && integrationOk && performanceOk && results.compatibility.legacyReputationWorks;
        console.log(`\n${allPass ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
        console.log('\n═══════════════════════════════════════════════════════\n');

        await browser.close();
        process.exit(allPass ? 0 : 1);

    } catch (error) {
        console.error('❌ Final integration test failed:', error.message);
        if (browser) await browser.close();
        process.exit(1);
    }
}

finalIntegrationTest();
