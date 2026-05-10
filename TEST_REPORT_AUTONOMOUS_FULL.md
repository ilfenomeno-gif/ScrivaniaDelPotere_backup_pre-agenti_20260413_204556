# Autonomous Full Test Report

- Date: 2026-05-10T10:48:50.797Z
- Modes tested: sandbox, campaign_sindaco, campaign_famoso, campaign_ricco
- Online mode detected: no
- Custom mode detected: no
- Leaderboard detected: yes

## Mode Results

### sandbox
- Outcome: superato
- Bugs found: 0
- Fixes applied: No fix needed in this mode after codebase fixes
- Latency avg/max: 4.5ms / 35ms
- Final day: 11, restarts: 2
- Balance: money mean=22064.34, var=261283.84; stress mean=89.56, var=21.98; coherence mean=77.15, var=283.78

### campaign_sindaco
- Outcome: superato
- Bugs found: 0
- Fixes applied: No fix needed in this mode after codebase fixes
- Latency avg/max: 2.88ms / 12.2ms
- Final day: 9, restarts: 2
- Balance: money mean=24163.2, var=8974.54; stress mean=57.25, var=395.51; coherence mean=98.48, var=3.57

### campaign_famoso
- Outcome: superato
- Bugs found: 0
- Fixes applied: No fix needed in this mode after codebase fixes
- Latency avg/max: 3.39ms / 22.8ms
- Final day: 10, restarts: 2
- Balance: money mean=23829.73, var=32064.76; stress mean=91.99, var=31.97; coherence mean=98.16, var=4.91

### campaign_ricco
- Outcome: superato
- Bugs found: 0
- Fixes applied: No fix needed in this mode after codebase fixes
- Latency avg/max: 3.3ms / 19.1ms
- Final day: 10, restarts: 2
- Balance: money mean=23654.24, var=60828.22; stress mean=92.26, var=36.53; coherence mean=96.97, var=16.92

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