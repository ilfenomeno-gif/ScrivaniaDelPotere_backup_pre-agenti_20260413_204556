document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // Export/Import anche dal menu Opzioni
    const optExportBtn = document.getElementById('opt-export');
    if (optExportBtn) {
        optExportBtn.addEventListener('click', () => {
            try {
                const saveData = JSON.stringify(Game.state, null, 2);
                const blob = new Blob([saveData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'scrivania_save.json';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            } catch (e) {
                alert('Errore durante l\'esportazione del salvataggio.');
            }
        });
    }
    const optImportBtn = document.getElementById('opt-import');
    const optImportInput = document.getElementById('opt-import-file');
    if (optImportBtn && optImportInput) {
        optImportBtn.addEventListener('click', () => optImportInput.click());
        optImportInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (typeof data !== 'object' || !data.character) throw new Error('Formato non valido');
                    localStorage.setItem('scrivaniaDelPotere_save', JSON.stringify(data));
                    alert('Salvataggio importato! Ricarica la pagina per continuare.');
                } catch (err) {
                    alert('Errore: file di salvataggio non valido.');
                }
            };
            reader.readAsText(file);
        });
    }

    /* ----- Screen Management ----- */
    function showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('active');
    }

    Game.on('screen-change', (d) => {
        if (typeof Scheduler !== 'undefined') {
            Scheduler.clearGroup('screen-temporary');
        }
        if (d.screen === 'desk') {
            showScreen('screen-desk');
        } else if (d.screen === 'gameover') {
            showGameOver();
        } else if (d.screen === 'letter') {
            showScreen('screen-letter');
        } else if (d.screen === 'mentor') {
            showScreen('screen-mentor');
        } else if (d.screen === 'cityselect') {
            showScreen('screen-cityselect');
        }
    });

    Game.on('gameover', (d) => {
        if (typeof Scheduler !== 'undefined') {
            Scheduler.clearAll();
        }
        document.getElementById('gameover-title').textContent = 'GAME OVER';
        document.getElementById('gameover-reason').textContent = d.reason || '';
        const epitaphEl = document.getElementById('gameover-epitaph');
        if (epitaphEl) epitaphEl.textContent = Diary.generateEpitaph();
        showGameOver();
    });

    /* ----- Victory ----- */
    Game.on('victory', (d) => {
        if (typeof Scheduler !== 'undefined') {
            Scheduler.clearAll();
        }
        document.getElementById('gameover-title').textContent = '🏆 VITTORIA!';
        document.getElementById('gameover-reason').textContent = d.reason || '';
        const epitaphEl = document.getElementById('gameover-epitaph');
        if (epitaphEl) epitaphEl.textContent = Diary.generateEpitaph();
        showGameOver();
    });

    /* ----- Game Over ----- */
    function showGameOver() {
        showScreen('screen-gameover');
        const st = Game.state;
        const el = document.getElementById('gameover-stats');
        if (!el) return;
        el.innerHTML = `
            <p><strong>${Game.esc(st.character.name)}</strong> — ${Game.esc(st.character.ideology)}</p>
            <p>📅 Giorni sopravvissuti: <strong>${st.day}</strong></p>
            <hr>
            <h4>Attributi</h4>
            <p>🧠 Intelligenza: ${st.attributes.intelligenza}</p>
            <p>🪞 Estetica: ${st.attributes.estetica}</p>
            <p>🗣️ Autenticità: ${st.attributes.autenticita}</p>
            <p>💪 Muscoli: ${st.attributes.muscoli}</p>
            <p>✨ Carisma: ${st.attributes.carisma}</p>
            <hr>
            <h4>Stato Finale</h4>
            <p>😴 Stanchezza: ${st.stats.stanchezza}/100</p>
            <p>😰 Stress: ${st.stats.stress}/100</p>
            <p>😊 Morale: ${st.stats.morale}/100</p>
            <p>❤️ Salute: ${st.stats.salute}/100</p>
            <p>📊 Reputazione Locale: ${st.reputazione}/100</p>
            <p>🌐 Reputazione Nazionale: ${st.reputazioneNazionale}/100</p>
            <p>💰 Soldi: ${st.money}€</p>
        `;
    }

    /* ----- Game Over Conditions (extra, beyond game.js checks) ----- */
    Game.on('stat-change', () => {
        if (Game.state.stats.stress >= 100 && Game.state.stats.morale <= 0) {
            Game.triggerGameOver('Lo stress e il morale azzerato ti hanno distrutto. Non puoi continuare.');
        }
    });

    /* ----- Time Advance Effects ----- */
    Game.on('time-advance', (d) => {
        // Entering a new time slot — decay effects
        if (d.timeOfDay === 0) {
            // New day: sleeping reset some fatigue (nerfed, was -30, now in game.js at -15)
            // Do NOT add extra regen here — all regen is in game.js advanceTime()
            Game.changeStat('morale', 3);
        }

        // Random stress from daily life
        if (Math.random() < 0.3) {
            Game.changeStat('stress', 5);
        }

        // Stanchezza accumulates lightly
        Game.changeStat('stanchezza', 3);

        // Health degrades if overly stressed and exhausted
        if (Game.state.stats.stanchezza > 80 && Game.state.stats.stress > 70) {
            Game.changeStat('salute', -5);
        }

        // Contacts decay if neglected
        if (Game.state.contacts) {
            Game.state.contacts.forEach(c => {
                c.relation = Math.max(0, c.relation - 1);
            });
        }

        // Partner tension rises over time
        if (Game.state.partner) {
            Game.state.partner.tension = Math.min(100, Game.state.partner.tension + 2);
            Game.state.partner.support = Math.max(0, Game.state.partner.support - 1);
        }

        // Regenerate tasks occasionally
        if (d.timeOfDay === 0 && Game.state.taskPools) {
            Game.state.taskPools = { work: [], political: [] };
        }
    });

    /* ----- Restart & Export/Import Save ----- */
    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => location.reload());
    }
    const exportBtn = document.getElementById('btn-export-save');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            try {
                const saveData = JSON.stringify(Game.state, null, 2);
                const blob = new Blob([saveData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'scrivania_save.json';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            } catch (e) {
                alert('Errore durante l\'esportazione del salvataggio.');
            }
        });
    }
    const importBtn = document.getElementById('btn-import-save');
    const importInput = document.getElementById('import-save-file');
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (typeof data !== 'object' || !data.character) throw new Error('Formato non valido');
                    localStorage.setItem('scrivaniaDelPotere_save', JSON.stringify(data));
                    alert('Salvataggio importato! Ricarica la pagina per continuare.');
                } catch (err) {
                    alert('Errore: file di salvataggio non valido.');
                }
            };
            reader.readAsText(file);
        });
    }

    /* ----- Init All Modules ----- */
    if (typeof GameMap !== 'undefined' && GameMap.init) {
        GameMap.init();
        if (typeof window !== 'undefined') window.GameMap = GameMap;
    }
    Character.init();
    if (typeof window !== 'undefined') window.Character = Character;
    Desk.init();
    Tasks.init();
    Phone.init();
    House.init();
    if (typeof Bank !== 'undefined') Bank.init();
    Territory.init();
    Stats.init();
    HUD.init();
    Events.init();
    Mafia.init();
    Dilemmas.init();
    Lifestyle.init();
    Budget.init();
    Agents.init();
    Factions.init();
    if (typeof Parties !== 'undefined') Parties.init();
    Intel.init();
    Favors.init();
    Diary.init();

    // New systems
    Compass.init();
    Ticker.init();
    Advisor.init();
    Timeline.init();
    Options.init();
    DeskDecor.init();
    Memento.init();
    if (typeof WorkTasks !== 'undefined') WorkTasks.init();
    if (typeof Tutorial !== 'undefined' && Tutorial.init) Tutorial.init();

    /* ----- Diary entries for achievements ----- */
    Game.on('career-promotion', (d) => {
        Game.addDiaryEntry(`Promosso a ${Game.getCareerLevel().label}!`, '🎉');
    });
    Game.on('housing-change', () => {
        Game.addDiaryEntry(`Nuovo alloggio: ${Game.state.housing.label}`, '🏠');
    });
    Game.on('city-change', () => {
        if (Game.state.city) Game.addDiaryEntry(`Trasferito a ${Game.state.city.name}`, '📍');
    });
    Game.on('task-completed', (d) => {
        if (d.type === 'political' && Math.random() < 0.3) {
            Game.addDiaryEntry('Impresa politica completata!', '🏛️');
        }
    });

    /* ----- Partner Profession Daily Bonuses ----- */
    Game.on('time-advance', (d) => {
        if (d.timeOfDay !== 0) return; // Only on new day (mattina)
        const partner = Game.state.partner;
        if (!partner || partner.isBurden) return;
        const effect = partner.professionEffect;
        if (effect === 'legalShield') {
            // Passive: scandal stress halved (applied in events.js when scandal hits)
        } else if (effect === 'socialBoost') {
            // Passive: applied in phone.js publishPost
        } else if (effect === 'eduBoost') {
            Game.changeAttribute('intelligenza', 2);
        } else if (effect === 'moneyBoost') {
            Game.changeMoney(20);
        }
    });

    /* ----- Eviction: cure when all rent is paid ----- */
    Game.on('bill-paid', () => {
        if (Game.state.flags.evicted) {
            const unpaidRent = Game.state.bills.filter(b => b.name === 'Affitto' && !b.paid);
            if (unpaidRent.length === 0) {
                Game.state.flags.evicted = false;
                Game.state.flags.consecutiveUnpaidRent = 0;
                Game.addWorkNotif('🏠 Casa recuperata!', 'Hai pagato gli arretrati. Torni a casa tua!', `Giorno ${Game.state.day}`);
            }
        }
    });

    function bootstrapNewGame() {
        Game.init();
        if (typeof HUD !== 'undefined' && HUD.refreshAll) HUD.refreshAll();
    }

    /* ----- Load saved game if exists ----- */
    const hasSave = localStorage.getItem('scrivaniaDelPotere_save');
    if (hasSave) {
        const loadMenu = document.createElement('div');
        loadMenu.id = 'load-menu';
        loadMenu.className = 'load-menu';
        loadMenu.innerHTML = `
            <div class="load-panel">
                <h2>💾 Salvataggio Trovato</h2>
                <p>Vuoi riprendere la partita precedente?</p>
                <div class="load-actions">
                    <button id="btn-load-yes" class="load-btn-yes">▶️ Continua</button>
                    <button id="btn-load-no" class="load-btn-no">🔄 Nuova Partita</button>
                </div>
            </div>
        `;
        document.body.appendChild(loadMenu);
        document.getElementById('btn-load-yes').addEventListener('click', () => {
            loadMenu.remove();
            if (Desk.loadGame()) {
                showScreen('screen-desk');
                Game.emit('game-started', {
                    cityId: Game.state.city && Game.state.city.id,
                    nationId: Game.state.nation && Game.state.nation.id,
                });
                HUD.refreshAll();
            } else {
                bootstrapNewGame();
                showScreen('screen-character');
            }
        });
        document.getElementById('btn-load-no').addEventListener('click', () => {
            loadMenu.remove();
            localStorage.removeItem('scrivaniaDelPotere_save');
            bootstrapNewGame();
            showScreen('screen-character');
        });
    } else {
        bootstrapNewGame();
        showScreen('screen-character');
    }
});
