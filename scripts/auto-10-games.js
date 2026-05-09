/**
 * AUTO-10-GAMES.JS (SIMPLIFIED - DIRECT API)
 * Bypasses wizard UI, directly initializes game state and runs 10 games
 * Executes 1-2 realistic tasks per day + advance time for 10 days
 */

async function autoPlay10Games() {
    if (typeof Game === 'undefined') {
        console.error("❌ Game object not available");
        return { success: false, error: "Game not initialized" };
    }
    
    const results = [];
    const NUM_GAMES = 10;
    const DAYS_PER_GAME = 10;
    
    console.log(`🎮 Starting auto-play: ${NUM_GAMES} games × ${DAYS_PER_GAME} days each (DIRECT API)`);
    
    for (let gameNum = 1; gameNum <= NUM_GAMES; gameNum++) {
        console.log(`\n⏱️  GAME ${gameNum}/${NUM_GAMES}`);
        
        const gameResult = {
            run: gameNum,
            startMoney: 0,
            startStress: 0,
            startSalute: 0,
            startCoherence: 0,
            daysCompleted: 0,
            finalMoney: 0,
            finalStress: 0,
            finalSalute: 0,
            finalCoherence: 0,
            gameOverReason: null,
            tasksCompleted: 0,
            errors: []
        };
        
        try {
            // === DIRECT STATE INITIALIZATION (skip wizard) ===
            initializeGameDirectly(gameNum);
            console.log(`  ✓ Game initialized (direct API)`);
            
            gameResult.startMoney = Game.state.money;
            gameResult.startStress = Game.state.stress;
            gameResult.startSalute = Game.state.salute;
            gameResult.startCoherence = Game.state.coherence;
            
            console.log(`  💰 €${gameResult.startMoney} | 😰 Stress=${gameResult.startStress} | ❤️ Health=${gameResult.startSalute}`);
            
            // === 10-DAY GAMEPLAY LOOP ===
            for (let day = 1; day <= DAYS_PER_GAME; day++) {
                // Check game-over conditions BEFORE playing the day
                if (Game.state.screen === "gameover" || Game.state.salute <= 0 || Game.state.coherence <= 0) {
                    gameResult.gameOverReason = `Day ${day}: health/coherence critical`;
                    break;
                }
                
                try {
                    // Play the day: 2 simple tasks + advance time
                    playDayDirectly();
                    gameResult.tasksCompleted += 2;
                    gameResult.daysCompleted = day;
                    
                    // Status check every 3 days
                    if (day % 3 === 0) {
                        console.log(`    Day ${day}: €${Game.state.money} | Stress=${Game.state.stress} | Health=${Game.state.salute}`);
                    }
                } catch (e) {
                    console.warn(`    ⚠️  Day ${day}: ${e.message}`);
                    gameResult.errors.push(`Day ${day}: ${e.message}`);
                    // Continue to next day
                }
                
                await delay(50);
            }
            
        } catch (e) {
            console.error(`  ✗ Game initialization failed: ${e.message}`);
            gameResult.errors.push(`Init: ${e.message}`);
        }
        
        // === RECORD FINAL STATE ===
        gameResult.finalMoney = Game.state.money;
        gameResult.finalStress = Game.state.stress;
        gameResult.finalSalute = Game.state.salute;
        gameResult.finalCoherence = Game.state.coherence;
        
        const status = gameResult.daysCompleted >= 10 ? "✅" : "⚠️";
        console.log(`  ${status} Completed day ${gameResult.daysCompleted}/10 | Final: €${gameResult.finalMoney}`);
        
        results.push(gameResult);
        
        // === RESET FOR NEXT GAME ===
        if (gameNum < NUM_GAMES) {
            Game.init(); // Soft reset in memory
            await delay(100);
        }
    }
    
    // === SUMMARY REPORT ===
    console.log("\n" + "=".repeat(70));
    console.log("📊 FINAL REPORT - 10 GAME AUTO-PLAY");
    console.log("=".repeat(70));
    
    const completedGames = results.filter(r => r.daysCompleted >= 10).length;
    const failedGames = results.filter(r => r.daysCompleted < 10).length;
    const avgStartMoney = (results.reduce((a, r) => a + r.startMoney, 0) / results.length).toFixed(2);
    const avgFinalMoney = (results.reduce((a, r) => a + r.finalMoney, 0) / results.length).toFixed(2);
    const moneyDiff = (parseFloat(avgFinalMoney) - parseFloat(avgStartMoney)).toFixed(2);
    const totalTasksCompleted = results.reduce((a, r) => a + r.tasksCompleted, 0);
    const avgStress = (results.reduce((a, r) => a + r.finalStress, 0) / results.length).toFixed(1);
    const avgHealth = (results.reduce((a, r) => a + r.finalSalute, 0) / results.length).toFixed(1);
    
    console.log(`
✅ SUCCESS RATE: ${completedGames}/${NUM_GAMES} games completed (${Math.round(completedGames * 10)}%)
❌ Failed: ${failedGames}

💰 ECONOMY:
   Avg Starting: €${avgStartMoney}
   Avg Final:    €${avgFinalMoney}
   Daily Change: €${moneyDiff}

📋 TASKS:
   Total Completed: ${totalTasksCompleted}
   Avg per Game: ${(totalTasksCompleted / results.length).toFixed(1)}

📊 STATS:
   Avg Final Stress: ${avgStress}
   Avg Final Health: ${avgHealth}

GAME-BY-GAME BREAKDOWN:
`);
    
    results.forEach(r => {
        const indicator = r.daysCompleted >= 10 ? "✅" : "❌";
        const reason = r.gameOverReason ? ` (${r.gameOverReason})` : "";
        console.log(`  ${indicator} Run ${r.run}: €${r.startMoney}→€${r.finalMoney} (${r.daysCompleted}/10 days, ${r.tasksCompleted} tasks)${reason}`);
    });
    
    return {
        success: completedGames === NUM_GAMES,
        completedGames,
        failedGames,
        results,
        summary: {
            avgStartMoney,
            avgFinalMoney,
            moneyDiff,
            totalTasksCompleted,
            avgStress,
            avgHealth
        }
    };
}

/**
 * Initialize game state directly (skip UI wizard)
 */
function initializeGameDirectly(gameNum) {
    // Call Game.init() first to clear everything
    if (typeof Game.init === 'function') {
        Game.init();
    }
    
    // Set minimal character state
    Game.state.character = {
        name: `Auto_${gameNum}`,
        gender: 'F',
        ideology: 'Tecnocrate'
    };
    
    // Set city (Roma)
    Game.state.city = {
        id: 'roma',
        name: 'Roma',
        country: 'italy',
        rentMultiplier: 1.4,
        salaryMultiplier: 1.4,
        bonus: { morale: 0 },
        malus: {}
    };
    
    // Initialize nation
    Game.state.nation = { id: 'italy', name: 'Italia' };
    if (typeof Game.changeNation === 'function') {
        Game.changeNation('italy');
    }
    
    // === HARDCODED STARTING STATE (proven balanced) ===
    Game.state.money = 400;  // Confirmed working baseline
    Game.state.day = 1;
    Game.state.timeSlot = 'mattina';
    Game.state.actionPointsCurrent = 4; // 2 per mattina, 2 per pomeriggio
    Game.state.screen = 'desk';
    
    // Stats (base for Tecnocrate)
    Game.state.stats = {
        stanchezza: 0,
        stress: 10,
        morale: 60,
        salute: 100
    };
    Game.state.coherence = 100;
    
    // Ideology bonuses (Tecnocrate: +50€, +respetto)
    Game.state.attributes = {
        intelligenza: 10,
        estetica: 50,
        autenticita: 50,
        muscoli: 50,
        carisma: 10
    };
    
    // Reputation
    Game.state.reputazione = 39;
    Game.state.reputazioneLocale = 39;
    Game.state.reputazioneNazionale = 5;
    Game.state.notorieta = 0;
    
    // Housing/Expenses
    Game.state.housing = { 
        rent: Math.round(250 * 1.4), // 350€ for Roma
        bonuses: [],
        maluses: []
    };
    
    // Game mode
    Game.state.gameMode = 'Normale';
    Game.state.campaignObjective = null;
    
    // Initialize other subsystems
    if (typeof Game.initCityFlags === 'function') {
        Game.initCityFlags();
    }
    
    // Flags
    Game.state.flags = { onboardingShown: true };
    Game.state.contacts = [];
    Game.state.visitedCities = ['roma'];
}

/**
 * Play one day: do 2 tasks + advance time
 */
function playDayDirectly() {
    // Task 1: Work
    if (typeof Tasks !== 'undefined' && typeof Tasks.generateWorkTasks === 'function') {
        const workTasks = Tasks.generateWorkTasks() || [];
        if (workTasks.length > 0) {
            const task = workTasks[0];
            // Simulate completion without UI
            if (typeof Game.spendActionPoint === 'function') {
                Game.spendActionPoint();
            }
            if (typeof Game.applyReward === 'function' && task.reward) {
                Game.applyReward(task.reward);
            }
        }
    }
    
    // Task 2: Political
    if (typeof Tasks !== 'undefined' && typeof Tasks.generatePoliticalTasks === 'function') {
        const polTasks = Tasks.generatePoliticalTasks() || [];
        if (polTasks.length > 0) {
            const task = polTasks[0];
            // Simulate completion
            if (typeof Game.spendActionPoint === 'function') {
                Game.spendActionPoint();
            }
            if (typeof Game.applyReward === 'function' && task.reward) {
                Game.applyReward(task.reward);
            }
        }
    }
    
    // Advance time
    if (typeof Game.advanceTime === 'function') {
        Game.advanceTime();
    }
}

/**
 * Utility: Sleep function
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// === ENTRY POINT ===
console.log("✅ Auto-Play 10 Games script loaded (DIRECT API)");
console.log("   Run: autoPlay10Games()");

