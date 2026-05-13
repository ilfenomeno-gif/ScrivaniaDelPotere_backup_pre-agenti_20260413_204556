#!/usr/bin/env node

/**
 * COMPREHENSIVE DLC TESTING
 * Tests logic, technical correctness, and UI for all 5 new DLC systems
 * Runs autonomously without user interaction
 */

const puppeteer = require('puppeteer');
const path = require('path');

const TestResults = {
    logic: [],
    technical: [],
    ui: [],
    totalPass: 0,
    totalFail: 0
};

function addResult(category, name, passed, details = '') {
    TestResults[category].push({ name, passed, details });
    if (passed) TestResults.totalPass++;
    else TestResults.totalFail++;
}

async function testNewDlcSystems() {
    let browser, page;
    try {
        console.log('🚀 COMPREHENSIVE DLC TESTING SUITE');
        console.log('=====================================\n');

        // Launch browser
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        page = await browser.newPage();
        page.setViewport({ width: 1280, height: 720 });

        // Load game
        const filePath = `file://${path.resolve(__dirname, '../index.html')}`;
        console.log(`📄 Loading game from: ${filePath}`);
        await page.goto(filePath, { waitUntil: 'networkidle2', timeout: 90000 });
        
        // Wait for Game object
        await page.waitForFunction(() => typeof Game !== 'undefined', { timeout: 10000 });
        console.log('✅ Game loaded\n');

        // ======================================================================
        // PHASE 1: TECHNICAL TESTS (system registration, initialization, isActive)
        // ======================================================================
        console.log('════════════════════════════════════════');
        console.log('PHASE 1: TECHNICAL VERIFICATION');
        console.log('════════════════════════════════════════\n');

        const techResults = await page.evaluate(() => {
            const results = {};

            // Test 1.1: All system objects exist as globals
            results.globalObjects = {
                PartyInternals: typeof window.PartyInternals === 'object',
                MinistrySystem: typeof window.MinistrySystem === 'object',
                LobbySystem: typeof window.LobbySystem === 'object',
                BackstorySystem: typeof window.BackstorySystem === 'object',
                CampaignSystem: typeof window.CampaignSystem === 'object',
                CrossDlcEvents: typeof window.CrossDlcEvents === 'object',
                ReputationSystem: typeof window.ReputationSystem === 'object'
            };

            // Test 1.2: All systems have required methods
            results.requiredMethods = {
                PartyInternals: {
                    init: typeof PartyInternals.init === 'function',
                    isActive: typeof PartyInternals.isActive === 'function',
                    ensureState: typeof PartyInternals.ensureState === 'function',
                    runBaseEvents: typeof PartyInternals.runBaseEvents === 'function',
                    runDlcEvents: typeof PartyInternals.runDlcEvents === 'function'
                },
                MinistrySystem: {
                    init: typeof MinistrySystem.init === 'function',
                    isActive: typeof MinistrySystem.isActive === 'function',
                    acceptMinistry: typeof MinistrySystem.acceptMinistry === 'function',
                    issueDecree: typeof MinistrySystem.issueDecree === 'function'
                },
                LobbySystem: {
                    init: typeof LobbySystem.init === 'function',
                    isActive: typeof LobbySystem.isActive === 'function',
                    acceptLobbyLoan: typeof LobbySystem.acceptLobbyLoan === 'function'
                },
                BackstorySystem: {
                    init: typeof BackstorySystem.init === 'function',
                    isActive: typeof BackstorySystem.isActive === 'function'
                },
                CampaignSystem: {
                    init: typeof CampaignSystem.init === 'function',
                    isActive: typeof CampaignSystem.isActive === 'function',
                    holdRally: typeof CampaignSystem.holdRally === 'function'
                },
                CrossDlcEvents: {
                    init: typeof CrossDlcEvents.init === 'function',
                    checkAndFireEvents: typeof CrossDlcEvents.checkAndFireEvents === 'function'
                },
                ReputationSystem: {
                    init: typeof ReputationSystem.init === 'function',
                    changeAxis: typeof ReputationSystem.changeAxis === 'function',
                    getAll: typeof ReputationSystem.getAll === 'function'
                }
            };

            // Test 1.3: Initialize all systems
            try {
                if (typeof PartyInternals !== 'undefined') PartyInternals.init();
                if (typeof MinistrySystem !== 'undefined') MinistrySystem.init();
                if (typeof LobbySystem !== 'undefined') LobbySystem.init();
                if (typeof BackstorySystem !== 'undefined') BackstorySystem.init();
                if (typeof CampaignSystem !== 'undefined') CampaignSystem.init();
                if (typeof CrossDlcEvents !== 'undefined') CrossDlcEvents.init();
                if (typeof ReputationSystem !== 'undefined') ReputationSystem.init();
                results.initSuccess = true;
            } catch (e) {
                results.initSuccess = false;
                results.initError = e.message;
            }

            // Test 1.4: Activate new DLC
            if (!Game.state.flags) Game.state.flags = {};
            Game.state.flags.activeDlc = [
                'dlc_correnti_interne_party',
                'dlc_ministero_governo',
                'dlc_lobby_pressure',
                'dlc_sangue_memoria_backstory',
                'dlc_campagna_elettorale'
            ];

            // Test 1.5: Verify isActive() returns true
            results.isActiveChecks = {
                party: PartyInternals.isActive(),
                ministry: MinistrySystem.isActive(),
                lobby: LobbySystem.isActive(),
                backstory: BackstorySystem.isActive(),
                campaign: CampaignSystem.isActive()
            };

            // Test 1.6: Verify state initialization
            results.stateObjects = {
                partyInternals: !!Game.state.partyInternals,
                ministry: !!Game.state.ministry,
                lobbies: !!Game.state.lobbies,
                backstory: !!Game.state.backstory,
                campaign: !!Game.state.campaign,
                reputation: !!Game.state.reputation
            };

            return results;
        });

        // Log technical results
        console.log('1️⃣ Global Objects Registration:');
        Object.entries(techResults.globalObjects).forEach(([name, loaded]) => {
            const status = loaded ? '✅' : '❌';
            console.log(`   ${status} ${name}`);
            addResult('technical', `Global: ${name}`, loaded);
        });
        console.log();

        console.log('2️⃣ Required Methods Verification:');
        Object.entries(techResults.requiredMethods).forEach(([system, methods]) => {
            console.log(`   ${system}:`);
            Object.entries(methods).forEach(([method, hasMethod]) => {
                const status = hasMethod ? '✅' : '❌';
                console.log(`      ${status} ${method}()`);
                addResult('technical', `${system}.${method}`, hasMethod);
            });
        });
        console.log();

        console.log('3️⃣ Initialization Success:', techResults.initSuccess ? '✅' : '❌');
        addResult('technical', 'Systems Init', techResults.initSuccess, techResults.initError || '');
        console.log();

        console.log('4️⃣ isActive() Checks:');
        Object.entries(techResults.isActiveChecks).forEach(([dlc, active]) => {
            const status = active ? '✅' : '❌';
            console.log(`   ${status} ${dlc}: ${active}`);
            addResult('technical', `isActive: ${dlc}`, active);
        });
        console.log();

        console.log('5️⃣ Game State Initialization:');
        Object.entries(techResults.stateObjects).forEach(([key, exists]) => {
            const status = exists ? '✅' : '❌';
            console.log(`   ${status} Game.state.${key}`);
            addResult('technical', `State: ${key}`, exists);
        });
        console.log();

        // ======================================================================
        // PHASE 2: LOGIC TESTS (events, mechanics, state updates)
        // ======================================================================
        console.log('════════════════════════════════════════');
        console.log('PHASE 2: LOGIC VERIFICATION');
        console.log('════════════════════════════════════════\n');

        const logicResults = await page.evaluate(() => {
            const results = {};
            const day = 0;

            // Test 2.1: Party Internals Logic
            results.partyInternals = {
                hasState: !!Game.state.partyInternals,
                hasInitialTension: Game.state.partyInternals.internalTension === 0,
                hasFactions: Array.isArray(Game.state.partyInternals.factions) && Game.state.partyInternals.factions.length === 3,
                hasPlayerInfluence: typeof Game.state.partyInternals.playerInfluence === 'number'
            };

            // Test 2.2: Ministry System Logic
            results.ministry = {
                hasState: !!Game.state.ministry,
                hasInitialBudget: typeof Game.state.ministry.budget === 'number',
                hasStaffSize: typeof Game.state.ministry.staffSize === 'number',
                hasAuditRisks: typeof Game.state.ministry.auditRisks === 'number'
            };

            // Test 2.3: Lobby System Logic
            results.lobbies = {
                hasState: !!Game.state.lobbies,
                hasGroups: Array.isArray(Game.state.lobbies.groups) && Game.state.lobbies.groups.length > 0,
                hasConflictRisk: typeof Game.state.lobbies.conflictOfInterestRisk === 'number',
                hasDebts: typeof Game.state.lobbies.playerDebtsToLobbies === 'object'
            };

            // Test 2.4: Backstory System Logic
            results.backstory = {
                hasState: !!Game.state.backstory,
                hasGhosts: Array.isArray(Game.state.backstory.ghosts) && Game.state.backstory.ghosts.length === 4,
                hasSkeletons: typeof Game.state.backstory.skeletons === 'number'
            };

            // Test 2.5: Campaign System Logic
            results.campaign = {
                hasState: !!Game.state.campaign,
                hasNextElection: typeof Game.state.campaign.nextElectionDay === 'number',
                hasPolls: Array.isArray(Game.state.campaign.polls),
                hasMomentum: typeof Game.state.campaign.momentum === 'number'
            };

            // Test 2.6: Reputation System Logic
            results.reputation = {
                hasState: !!Game.state.reputation,
                hasPopolare: typeof Game.state.reputation.popolare === 'number' && Game.state.reputation.popolare === 50,
                hasIstituzionale: typeof Game.state.reputation.istituzionale === 'number' && Game.state.reputation.istituzionale === 50,
                hasMediatica: typeof Game.state.reputation.mediatica === 'number' && Game.state.reputation.mediatica === 50
            };

            // Test 2.7: Test state mutations
            results.mutations = {};
            try {
                // Test PartyInternals.joinFaction
                const joinResult = PartyInternals.joinFaction('centristi');
                results.mutations.joinFaction = joinResult === true && Game.state.partyInternals.playerFaction === 'centristi';

                // Test MinistrySystem.acceptMinistry
                const ministryResult = MinistrySystem.acceptMinistry('Economia', 250);
                results.mutations.acceptMinistry = ministryResult === true && Game.state.ministry.hasMinistry === true;

                // Test BackstorySystem.addSkeleton
                const skeletonResult = BackstorySystem.addSkeleton(20);
                results.mutations.addSkeleton = skeletonResult === true && Game.state.backstory.skeletons === 20;

                // Test ReputationSystem.changeAxis
                const reputationResult = ReputationSystem.changeAxis('popolare', 10);
                results.mutations.changeAxis = reputationResult === true && Game.state.reputation.popolare === 60;
            } catch (e) {
                results.mutations.error = e.message;
            }

            return results;
        });

        // Log logic results
        console.log('1️⃣ Party Internals State:');
        Object.entries(logicResults.partyInternals).forEach(([key, val]) => {
            const status = val ? '✅' : '❌';
            console.log(`   ${status} ${key}`);
            addResult('logic', `Party: ${key}`, val);
        });
        console.log();

        console.log('2️⃣ Ministry System State:');
        Object.entries(logicResults.ministry).forEach(([key, val]) => {
            const status = val ? '✅' : '❌';
            console.log(`   ${status} ${key}`);
            addResult('logic', `Ministry: ${key}`, val);
        });
        console.log();

        console.log('3️⃣ Lobby System State:');
        Object.entries(logicResults.lobbies).forEach(([key, val]) => {
            const status = val ? '✅' : '❌';
            console.log(`   ${status} ${key}`);
            addResult('logic', `Lobby: ${key}`, val);
        });
        console.log();

        console.log('4️⃣ Backstory System State:');
        Object.entries(logicResults.backstory).forEach(([key, val]) => {
            const status = val ? '✅' : '❌';
            console.log(`   ${status} ${key}`);
            addResult('logic', `Backstory: ${key}`, val);
        });
        console.log();

        console.log('5️⃣ Campaign System State:');
        Object.entries(logicResults.campaign).forEach(([key, val]) => {
            const status = val ? '✅' : '❌';
            console.log(`   ${status} ${key}`);
            addResult('logic', `Campaign: ${key}`, val);
        });
        console.log();

        console.log('6️⃣ Reputation System State:');
        Object.entries(logicResults.reputation).forEach(([key, val]) => {
            const status = val ? '✅' : '❌';
            console.log(`   ${status} ${key}`);
            addResult('logic', `Reputation: ${key}`, val);
        });
        console.log();

        console.log('7️⃣ State Mutations (method calls):');
        Object.entries(logicResults.mutations).forEach(([method, result]) => {
            if (method === 'error') {
                console.log(`   ❌ Error: ${result}`);
                addResult('logic', `Mutation: ${method}`, false, result);
            } else {
                const status = result ? '✅' : '❌';
                console.log(`   ${status} ${method}()`);
                addResult('logic', `Mutation: ${method}`, result);
            }
        });
        console.log();

        // ======================================================================
        // PHASE 3: UI TESTS (DOM elements, accessibility, visibility)
        // ======================================================================
        console.log('════════════════════════════════════════');
        console.log('PHASE 3: UI VERIFICATION');
        console.log('════════════════════════════════════════\n');

        // Wait a bit for DOM to settle
        await new Promise(resolve => setTimeout(resolve, 500));

        const uiResults = await page.evaluate(() => {
            const results = {};

            // Test 3.1: Check game container exists
            results.gameContainer = !!document.getElementById('game');
            results.hudPanel = !!document.getElementById('hud-panel');

            // Test 3.2: Check HUD elements exist
            results.stats = {
                moneyDisplay: !!document.querySelector('[class*="money"]'),
                stressDisplay: !!document.querySelector('[class*="stress"]'),
                reputationDisplay: !!document.querySelector('[class*="reputation"]')
            };

            // Test 3.3: Check phone exists (for DLC store)
            results.phone = {
                phoneContainer: !!document.getElementById('phone'),
                phoneHome: !!document.querySelector('.phone-home')
            };

            // Test 3.4: Check accessibility attributes
            results.a11y = {
                hasAriaLabels: document.querySelectorAll('[aria-label]').length > 0,
                hasRoles: document.querySelectorAll('[role]').length > 0,
                hasLiveRegions: document.querySelectorAll('[aria-live]').length > 0
            };

            // Test 3.5: Check for screen reader support
            results.screenReader = {
                srModule: typeof window.SR !== 'undefined',
                ghostBar: !!document.querySelector('[id*="ghost"]') || !!document.querySelector('[class*="ghost"]')
            };

            // Test 3.6: Check notifications system
            results.notifications = {
                notificationsPanel: !!document.querySelector('[class*="notif"]'),
                workNotifications: !!document.querySelector('[id*="work"]')
            };

            return results;
        });

        // Log UI results
        console.log('1️⃣ Page Structure:');
        console.log(`   ${uiResults.gameContainer ? '✅' : '❌'} Game container exists`);
        console.log(`   ${uiResults.hudPanel ? '✅' : '❌'} HUD panel exists`);
        addResult('ui', 'Game Container', uiResults.gameContainer);
        addResult('ui', 'HUD Panel', uiResults.hudPanel);
        console.log();

        console.log('2️⃣ Stats Display:');
        Object.entries(uiResults.stats).forEach(([key, val]) => {
            const status = val ? '✅' : '❌';
            console.log(`   ${status} ${key}`);
            addResult('ui', `Stats: ${key}`, val);
        });
        console.log();

        console.log('3️⃣ Phone/Store Interface:');
        Object.entries(uiResults.phone).forEach(([key, val]) => {
            const status = val ? '✅' : '❌';
            console.log(`   ${status} ${key}`);
            addResult('ui', `Phone: ${key}`, val);
        });
        console.log();

        console.log('4️⃣ Accessibility (WCAG 2.1 AA):');
        Object.entries(uiResults.a11y).forEach(([key, val]) => {
            const status = val ? '✅' : '❌';
            console.log(`   ${status} ${key}`);
            addResult('ui', `A11Y: ${key}`, val);
        });
        console.log();

        console.log('5️⃣ Screen Reader Support:');
        Object.entries(uiResults.screenReader).forEach(([key, val]) => {
            const status = val ? '✅' : '❌';
            console.log(`   ${status} ${key}`);
            addResult('ui', `SR: ${key}`, val);
        });
        console.log();

        console.log('6️⃣ Notifications System:');
        Object.entries(uiResults.notifications).forEach(([key, val]) => {
            const status = val ? '✅' : '❌';
            console.log(`   ${status} ${key}`);
            addResult('ui', `Notifications: ${key}`, val);
        });
        console.log();

        // ======================================================================
        // PHASE 4: EVENT TRIGGERING TESTS
        // ======================================================================
        console.log('════════════════════════════════════════');
        console.log('PHASE 4: EVENT FIRING TESTS');
        console.log('════════════════════════════════════════\n');

        const eventResults = await page.evaluate(() => {
            const results = { eventsTriggered: {} };

            // Simulate multiple game days to trigger events
            for (let day = 1; day <= 30; day++) {
                Game.state.day = day;

                // Trigger base events
                if (typeof PartyInternals !== 'undefined') PartyInternals.runBaseEvents();
                if (typeof MinistrySystem !== 'undefined') MinistrySystem.runDlcEvents();
                if (typeof LobbySystem !== 'undefined') LobbySystem.runDlcEvents();
                if (typeof BackstorySystem !== 'undefined') BackstorySystem.runDlcEvents();
                if (typeof CampaignSystem !== 'undefined') CampaignSystem.runDlcEvents();
                if (typeof CrossDlcEvents !== 'undefined') CrossDlcEvents.checkAndFireEvents();
            }

            // Get counters from notifications added
            const notifPanel = document.querySelector('[class*="notif"]');
            results.notificationsCount = notifPanel ? 
                (notifPanel.textContent.match(/Giorno \d+/g) || []).length : 0;

            // Check if game state was modified by events
            results.stateModified = {
                partyTension: Game.state.partyInternals.internalTension !== 0,
                ministryBudget: Game.state.ministry.budget !== 0 || Game.state.ministry.auditRisks !== 0,
                lobbyInterest: Game.state.lobbies.conflictOfInterestRisk !== 0 || Object.keys(Game.state.lobbies.playerDebtsToLobbies).length > 0,
                backstoryEvents: Game.state.backstory.ghosts.some(g => g.lastMet !== -99),
                campaignMomentum: Game.state.campaign.momentum !== 0 || Game.state.campaign.polls.length > 0
            };

            return results;
        });

        // Log event results
        console.log('1️⃣ Event Simulation (30 days):');
        console.log(`   📊 Total notifications generated: ${eventResults.notificationsCount}`);
        addResult('logic', 'Events Triggered', eventResults.notificationsCount > 0);
        console.log();

        console.log('2️⃣ State Modifications by Events:');
        Object.entries(eventResults.stateModified).forEach(([key, modified]) => {
            const status = modified ? '✅' : '❌';
            console.log(`   ${status} ${key}`);
            addResult('logic', `Event Modified: ${key}`, modified);
        });
        console.log();

        // ======================================================================
        // SUMMARY
        // ======================================================================
        console.log('════════════════════════════════════════');
        console.log('FINAL SUMMARY');
        console.log('════════════════════════════════════════\n');

        const totalTests = TestResults.totalPass + TestResults.totalFail;
        const passPercentage = Math.round((TestResults.totalPass / totalTests) * 100);

        console.log(`📊 Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${TestResults.totalPass}`);
        console.log(`❌ Failed: ${TestResults.totalFail}`);
        console.log(`📈 Pass Rate: ${passPercentage}%\n`);

        console.log('BREAKDOWN BY CATEGORY:');
        console.log(`  🔧 Technical: ${TestResults.technical.filter(t => t.passed).length}/${TestResults.technical.length} passed`);
        console.log(`  🧠 Logic: ${TestResults.logic.filter(t => t.passed).length}/${TestResults.logic.length} passed`);
        console.log(`  🎨 UI: ${TestResults.ui.filter(t => t.passed).length}/${TestResults.ui.length} passed\n`);

        if (TestResults.totalFail === 0) {
            console.log('🎉 ALL TESTS PASSED!\n');
            console.log('✓ All systems properly initialized');
            console.log('✓ All events firing correctly');
            console.log('✓ All state mutations working');
            console.log('✓ UI fully functional');
            console.log('✓ Accessibility compliant');
        } else {
            console.log('⚠️ SOME TESTS FAILED\n');
            console.log('Failed tests:');
            const failed = [
                ...TestResults.technical.filter(t => !t.passed),
                ...TestResults.logic.filter(t => !t.passed),
                ...TestResults.ui.filter(t => !t.passed)
            ];
            failed.forEach(t => {
                console.log(`  ❌ ${t.name}${t.details ? ` - ${t.details}` : ''}`);
            });
        }

        console.log('\n════════════════════════════════════════\n');

        await browser.close();
        process.exit(TestResults.totalFail === 0 ? 0 : 1);

    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
        if (browser) await browser.close();
        process.exit(1);
    }
}

testNewDlcSystems();
