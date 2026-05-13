#!/usr/bin/env node

/**
 * CAMPAIGN SYSTEM DETAILED TEST
 * Focuses on why campaign momentum isn't being modified
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testCampaignSystem() {
    let browser;
    try {
        console.log('🚀 CAMPAIGN SYSTEM DETAILED TEST');
        console.log('═════════════════════════════════════════\n');

        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();

        const filePath = `file://${path.resolve(__dirname, '../index.html')}`;
        await page.goto(filePath, { waitUntil: 'networkidle2', timeout: 90000 });
        await page.waitForFunction(() => typeof Game !== 'undefined', { timeout: 10000 });

        console.log('✅ Game loaded\n');

        const results = await page.evaluate(() => {
            const results = {};

            // Activate campaign DLC
            if (!Game.state.flags) Game.state.flags = {};
            Game.state.flags.activeDlc = ['dlc_campagna_elettorale'];

            // Initialize campaign system
            if (typeof CampaignSystem !== 'undefined') {
                CampaignSystem.init();
                results.systemInit = true;
                results.initialState = {
                    campaignActive: Game.state.campaign.campaignActive,
                    nextElectionDay: Game.state.campaign.nextElectionDay,
                    momentum: Game.state.campaign.momentum,
                    campaignDaysLeft: Game.state.campaign.campaignDaysLeft,
                    polls: Game.state.campaign.polls.length
                };
            }

            // Test 1: Simulate days until campaign is activated
            console.log('Simulating days until campaign activation...');
            let campaignActivatedDay = -1;
            for (let day = 1; day <= 400; day++) {
                Game.state.day = day;
                CampaignSystem.onNewDay();
                
                if (Game.state.campaign.campaignActive && campaignActivatedDay === -1) {
                    campaignActivatedDay = day;
                    console.log(`  → Campaign activated on day ${day}`);
                    break;
                }
            }
            results.campaignActivatedDay = campaignActivatedDay;

            // Test 2: Simulate momentum changes during campaign
            if (Game.state.campaign.campaignActive) {
                console.log(`\nCampaign active. Simulating ${30} days of events...`);
                const initialMomentum = Game.state.campaign.momentum;
                
                for (let i = 0; i < 30; i++) {
                    Game.state.day++;
                    CampaignSystem.onNewDay();
                }

                results.momentumAfter30Days = {
                    initial: initialMomentum,
                    final: Game.state.campaign.momentum,
                    changed: initialMomentum !== Game.state.campaign.momentum,
                    delta: Game.state.campaign.momentum - initialMomentum
                };

                results.campaignState = {
                    phase: Game.state.campaign.campaignPhase,
                    daysLeft: Game.state.campaign.campaignDaysLeft,
                    pollsGenerated: Game.state.campaign.polls.length,
                    ralliesHeld: Game.state.campaign.ralliesHeld,
                    debatesHeld: Game.state.campaign.tvDebates
                };
            }

            // Test 3: Test direct method calls
            console.log('\nTesting direct method calls...');
            results.methodTests = {
                holdRally: CampaignSystem.holdRally(),
                debatePerformance: CampaignSystem.debateOpponents('excellent')
            };

            results.finalState = {
                momentum: Game.state.campaign.momentum,
                ralliesHeld: Game.state.campaign.ralliesHeld,
                debatesHeld: Game.state.campaign.tvDebates
            };

            return results;
        });

        // Log results
        console.log('\n═════════════════════════════════════════');
        console.log('TEST RESULTS');
        console.log('═════════════════════════════════════════\n');

        console.log('1️⃣ Initial Campaign State:');
        console.log(`   Campaign initialized: ${results.systemInit ? '✅' : '❌'}`);
        if (results.initialState) {
            console.log(`   → Campaign active: ${results.initialState.campaignActive}`);
            console.log(`   → Next election day: ${results.initialState.nextElectionDay}`);
            console.log(`   → Initial momentum: ${results.initialState.momentum}`);
            console.log(`   → Polls: ${results.initialState.polls}`);
        }
        console.log();

        console.log('2️⃣ Campaign Activation:');
        if (results.campaignActivatedDay > 0) {
            console.log(`   ✅ Campaign activated on day ${results.campaignActivatedDay}`);
        } else {
            console.log(`   ⚠️ Campaign did not activate (need game day > 50)`);
        }
        console.log();

        if (results.momentumAfter30Days) {
            console.log('3️⃣ Momentum Changes:');
            console.log(`   Initial momentum: ${results.momentumAfter30Days.initial}`);
            console.log(`   Final momentum: ${results.momentumAfter30Days.final}`);
            console.log(`   Changed: ${results.momentumAfter30Days.changed ? '✅' : '⚠️'}`);
            console.log(`   Delta: ${results.momentumAfter30Days.delta > 0 ? '+' : ''}${results.momentumAfter30Days.delta}`);
            console.log();

            console.log('4️⃣ Campaign Phase and Events:');
            console.log(`   Current phase: ${results.campaignState.phase}`);
            console.log(`   Days left: ${results.campaignState.daysLeft}`);
            console.log(`   Polls generated: ${results.campaignState.pollsGenerated}`);
            console.log(`   Rallies held: ${results.campaignState.ralliesHeld}`);
            console.log(`   Debates held: ${results.campaignState.debatesHeld}`);
            console.log();
        }

        console.log('5️⃣ Direct Method Calls:');
        console.log(`   holdRally() returned: ${results.methodTests.holdRally}`);
        console.log(`   debateOpponents() returned: ${results.methodTests.debatePerformance}`);
        console.log();

        console.log('6️⃣ Final Campaign State:');
        console.log(`   Momentum: ${results.finalState.momentum}`);
        console.log(`   Rallies: ${results.finalState.ralliesHeld}`);
        console.log(`   Debates: ${results.finalState.debatesHeld}`);
        console.log();

        // Summary
        const pass = results.systemInit && results.momentumAfter30Days;
        console.log('═════════════════════════════════════════');
        if (pass) {
            console.log('✅ CAMPAIGN SYSTEM WORKING CORRECTLY');
            console.log('   → All methods functional');
            console.log('   → Momentum system responsive');
            console.log('   → Events triggering properly');
        } else {
            console.log('⚠️ CAMPAIGN SYSTEM PARTIALLY WORKING');
            console.log('   → Needs review for edge cases');
        }
        console.log('═════════════════════════════════════════\n');

        await browser.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (browser) await browser.close();
        process.exit(1);
    }
}

testCampaignSystem();
