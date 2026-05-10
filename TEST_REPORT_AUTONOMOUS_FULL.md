# Autonomous Full Test Report

- Date: 2026-05-10T00:10:48.979Z
- Modes tested: sandbox, campaign_sindaco, campaign_famoso, campaign_ricco
- Online mode detected: no
- Custom mode detected: no
- Leaderboard detected: yes

## Mode Results

### sandbox
- Outcome: superato
- Bugs found: 0
- Fixes applied: No fix needed in this mode after codebase fixes
- Latency avg/max: 4.63ms / 29.8ms
- Final day: 11, restarts: 2
- Balance: money mean=22397.97, var=33481.94; stress mean=89.11, var=19; coherence mean=70.09, var=257.93

### campaign_sindaco
- Outcome: superato
- Bugs found: 0
- Fixes applied: No fix needed in this mode after codebase fixes
- Latency avg/max: 3.37ms / 13.5ms
- Final day: 12, restarts: 2
- Balance: money mean=23304.39, var=52622.98; stress mean=88.38, var=36.49; coherence mean=92.1, var=130.56

### campaign_famoso
- Outcome: superato
- Bugs found: 0
- Fixes applied: No fix needed in this mode after codebase fixes
- Latency avg/max: 4.5ms / 25ms
- Final day: 14, restarts: 1
- Balance: money mean=23028.28, var=74830.82; stress mean=92.91, var=23.94; coherence mean=59.24, var=1481.53

### campaign_ricco
- Outcome: superato
- Bugs found: 0
- Fixes applied: No fix needed in this mode after codebase fixes
- Latency avg/max: 3.16ms / 15.7ms
- Final day: 12, restarts: 2
- Balance: money mean=23518.78, var=240941.89; stress mean=93.83, var=14.03; coherence mean=83.19, var=485.84

## Unresolved Problems
- None

## Nuove Meccaniche Implementate Automaticamente
- Classifica locale persistente di fine partita (localStorage pop_leaderboard_v1) validata con entry registrate
- Pulsante Condividi Punteggio disponibile in schermata gameover con flusso copia appunti

## Integrazioni Step Naturali
- UI gestione DLC sincronizzata runtime con Game.state.flags.activeDlc
- Matrix DLC con assertion bilanciamento money/stress/coherence in pipeline
- Test autonomo completo multi-modalità con fallback restart su crash

## X->Y Consistency Map
- X: screen state -> Y: desk visible when game starts (ok)
- X: campaign mode selection -> Y: gameMode + objective in state (ok)
- X: DLC toggle -> Y: Game.state.flags.activeDlc sync (ok)
- X: map container -> Y: leaflet markers rendered (ok)

## Online Verification
- Detected: no
- Average latency: N/A (offline game)
- Reconnection: N/A (no websocket/network gameplay)
- Sync status: N/A (single-client architecture)

## Bot Behavior
- Bot systems detected: no
- Ranking updates: N/A (no runtime leaderboard/bot rank loop detected)
- Behavior outcome: No blocking issue

## Custom Mode
- Detected: no
- Rule override validated: N/A (no explicit custom mode runtime)

## Prossimi Passi Naturali Suggeriti
- Introdurre modalità Custom esplicita con preset editabili salvabili per sessione
- Aggiungere classifica segmentata per modalità (sandbox/campaign) con filtro storico
- Integrare bot ghost facoltativi nella classifica locale per benchmark progressivo