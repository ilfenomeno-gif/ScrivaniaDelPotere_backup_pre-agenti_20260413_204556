# Autonomous Full Test Report

- Date: 2026-05-10T10:17:13.653Z
- Modes tested: sandbox, campaign_sindaco, campaign_famoso, campaign_ricco
- Online mode detected: no
- Custom mode detected: no
- Leaderboard detected: yes

## Mode Results

### sandbox
- Outcome: superato
- Bugs found: 0
- Fixes applied: No fix needed in this mode after codebase fixes
- Latency avg/max: 4.84ms / 38.6ms
- Final day: 11, restarts: 2
- Balance: money mean=21998.07, var=61806.77; stress mean=61.18, var=840.62; coherence mean=78.84, var=251.78

### campaign_sindaco
- Outcome: superato
- Bugs found: 0
- Fixes applied: No fix needed in this mode after codebase fixes
- Latency avg/max: 3.32ms / 12.1ms
- Final day: 10, restarts: 2
- Balance: money mean=23034.81, var=83814.05; stress mean=84.11, var=79.95; coherence mean=88.75, var=38.74

### campaign_famoso
- Outcome: superato
- Bugs found: 0
- Fixes applied: No fix needed in this mode after codebase fixes
- Latency avg/max: 3.26ms / 23.1ms
- Final day: 9, restarts: 2
- Balance: money mean=23609.57, var=13686.35; stress mean=95.23, var=21.24; coherence mean=96.88, var=15.97

### campaign_ricco
- Outcome: superato
- Bugs found: 0
- Fixes applied: No fix needed in this mode after codebase fixes
- Latency avg/max: 2.28ms / 11.2ms
- Final day: 9, restarts: 2
- Balance: money mean=24040.43, var=48873.8; stress mean=91.18, var=46.9; coherence mean=97.72, var=3.88

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