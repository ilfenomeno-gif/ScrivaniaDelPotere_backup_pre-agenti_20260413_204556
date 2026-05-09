# Skill: social-creative-designer

## Descrizione
Progetta caroselli social o grafiche singole per piattaforme social, generando immagini PNG tramite server MCP Nano Banana.

## Flusso di lavoro
1. Ricevi topic/contenuto e parametri (numero slide, formato, piattaforma, stile).
2. Se non specificato, leggi /_templates/social-creatives/STYLE-GUIDE.md per le direzioni stilistiche disponibili.
3. Progetta:
   - Carosello: Slide 1 = headline bold, slide centrali = valore/insight, finale = CTA.
   - Immagine singola: headline e visual coerente.
4. Genera immagini tramite MCP Nano Banana. Se non disponibile, segnala che le immagini non sono state generate.

## Parametri supportati
- Numero slide (default 3)
- Formato (default 4:5, supporta 1:1, 3:4, 1.91:1)
- Piattaforma (default Instagram, supporta LinkedIn, Facebook, ecc.)
- Stile (se non specificato, recupera da STYLE-GUIDE)

## Brand-agnostic
La skill non contiene riferimenti a brand specifici. Recupera le linee guida brand a runtime da _context/ e _templates/.

## Output
Restituisce immagini PNG e, se richiesto, un file di specifiche del design.

---

### Esempio di prompt per l'utente
"Crea un carosello Instagram di 5 slide su 'I 5 Errori che Stai Facendo in Palestra', stile illustrato e dinamico."
