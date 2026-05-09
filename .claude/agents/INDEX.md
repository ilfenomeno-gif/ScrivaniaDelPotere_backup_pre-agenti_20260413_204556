# Indice Completo dei Tuoi Agenti AI (Team Marketing)

## 🎯 Come Usare Questo Indice

Scegli il tuo agente in base al task che devi completare:

---

## 1. ORCHESTRATORE CAMPAGNE (@orchestrator)

**Per**: Gestire una campagna marketing completa da zero a lancio

**Usa quando**:
- Hai un nuovo brief di campagna e devi eseguirla completamente
- Devi coordinare multiple agenti su un progetto
- Vuoi progress tracking e quality assurance automatici

**Prompt di Base**:
```
@orchestrator → Gestisci la campagna [Campaign Name]:
- Obiettivi: [Business Goals]
- Budget: [Total Budget]  
- Timeline: [Launch Date]
- Target: [Audience]
- Brand context: /_context/brand-guidelines.md
```

**Output**:
- Campaign orchestration plan completo
- Assignment per tutti gli agenti
- Daily status reports
- Launch readiness checklist

**Tempo di Esecuzione**: 8-12 giorni (dipende da scope)

---

## 2. MARKET RESEARCHER (@market-researcher)

**Per**: Analizzare mercati, competitor, trend e audience

**Usa quando**:
- Devi capire il mercato prima di una strategia
- Devi identificare audience persona
- Vuoi competitive intelligence
- Devi validare opportunità di posizionamento

**Prompt di Base**:
```
@market-researcher → Analizza il mercato per [target/segmento]:
- Focus: competitor analysis, trend, audience insight
- Mercato: [Geographic market]
- Competitor: [Competitor names, optional]
- Output: report + recommendations
```

**Output**:
- Market analysis report
- Competitor benchmarking
- Audience persona detailed
- Opportunity & positioning recommendations
- Trend forecast

**Tempo di Esecuzione**: 2-3 giorni

---

## 3. CAMPAIGN STRATEGIST (@campaign-strategist)

**Per**: Definire strategia di campagna completa, budget, canali, timeline

**Usa quando**:
- Hai market intelligence e devi creare strategia
- Devi pianificare multi-channel campaign
- Devi allocare budget e KPI
- Devi creare brief per altri agenti

**Prompt di Base**:
```
@campaign-strategist → Crea la strategia per [Campaign]:
- Obiettivi: [Business goals]
- Budget: [Total budget]
- Timeline: [Duration]
- Market intel: [Da market-researcher, optional]
- Output: strategy doc + briefs per content/design
```

**Output**:
- Campaign strategy document
- Multi-channel plan with timeline
- Budget allocation breakdown
- Content briefs per content-creator
- Creative briefs per creative-designer
- KPI & success metrics dashboard

**Tempo di Esecuzione**: 1-2 giorni

---

## 4. CONTENT CREATOR (@content-creator)

**Per**: Creare copy, post, email, script e contenuti testuali

**Usa quando**:
- Hai content brief e devi generare copy
- Devi creare copy per social, email, landing page
- Vuoi variazioni A/B per testing
- Devi scrivere article, script video, whitepaper

**Prompt di Base**:
```
@content-creator → Crea contenuti per [Campaign]:
- Channel: [social, email, landing page, ads, ecc.]
- Topic: [Topic/offering]
- Tone: [Da brand guidelines]
- Format: [post, email, script, ecc.]
- Include A/B variations: yes
```

**Output**:
- Social post copy (multiple variations)
- Email subject + body + CTA
- Landing page headline + body + CTA
- Video script + storyboard
- Blog article / whitepaper
- Ad copy per paid channels

**Tempo di Esecuzione**: 1-3 giorni (dipende da volume)

---

## 5. CREATIVE DESIGNER (@creative-designer)

**Per**: Progettare visual, graphics, layout per campagne

**Usa quando**:
- Hai creative brief e devi generare visual
- Devi creare social graphics, email template, landing page design
- Vuoi mockup, asset grafici, design variations
- Devi mantenere brand consistency nei visual

**Prompt di Base**:
```
@creative-designer → Crea design per [Campaign]:
- Channel: [social, email, landing page, ads, ecc.]
- Topic: [Topic/offering]
- Style: [From brand guidelines or specify]
- Format: [Instagram carousel, email template, ecc.]
- Include mockup + variations
```

**Output**:
- Social media graphics (carousel, single post)
- Email template design
- Landing page mockup
- Ad creative (Facebook, Instagram, LinkedIn, ecc.)
- Hero image / video thumbnail
- Design specifications (colors, fonts, spacing)

**Tempo di Esecuzione**: 2-4 giorni (dipende da volume)

---

## 6. DATA ANALYST (@data-analyst)

**Per**: Analizzare performance, KPI, A/B test, ROI

**Usa quando**:
- Campagna è live e vuoi monitorare performance
- Devi analizzare A/B test results
- Vuoi KPI dashboard e trend forecast
- Devi identificare optimization opportunity

**Prompt di Base**:
```
@data-analyst → Analizza performance della campagna [Campaign]:
- KPI to track: [conversion, reach, engagement, ROI, ecc.]
- Period: [Date range]
- Segments: [By channel, audience, ecc.]
- Include: A/B analysis, forecast, recommendations
```

**Output**:
- Performance report (daily/weekly)
- KPI dashboard with trends
- A/B test analysis & statistical results
- Attribution modeling & ROI calculation
- Predictive forecast
- Optimization recommendations

**Tempo di Esecuzione**: Ongoing (daily reports durante campagna)

---

## 🚀 Workflow Consigliato (End-to-End)

### Scenario 1: Campagna Completa (Consigliato)
```
1. @orchestrator → Gestisci la campagna
   (Orchestratore coordina tutto automaticamente)
```

### Scenario 2: Step-by-Step (Se preferisci controllare)
```
1. @market-researcher → Analizza mercato e audience
2. @campaign-strategist → Crea strategia (usando market intel)
3. @content-creator → Genera copy (usando content brief)
4. @creative-designer → Genera design (usando creative brief)
5. @data-analyst → Monitora performance post-launch
```

### Scenario 3: Ottimizzazione Campagna Existing
```
1. @data-analyst → Analizza performance attuali
2. @campaign-strategist → Proponi optimization (basato su data)
3. @content-creator → Crea copy ottimizzato
4. @creative-designer → Crea design ottimizzato
5. @data-analyst → Monitora A/B test results
```

---

## ⚡ Quick Reference by Task

| Task | Agente | Tempo |
|------|--------|-------|
| Gestire campagna completa | Orchestrator | 8-12 gg |
| Analizzare mercato/competitor | Market Researcher | 2-3 gg |
| Creare strategia campagna | Campaign Strategist | 1-2 gg |
| Scrivere copy/contenuti | Content Creator | 1-3 gg |
| Progettare visual/design | Creative Designer | 2-4 gg |
| Monitorare KPI/performance | Data Analyst | Daily |

---

## 📋 Integrazioni tra Agenti

```
Orchestrator 
├─→ Market Researcher (day 2)
├─→ Campaign Strategist (day 3, riceve market intel)
│  ├─→ Content Creator (day 4-6, riceve content brief)
│  └─→ Creative Designer (day 4-6, riceve creative brief)
├─→ QA Integration (day 7)
└─→ Data Analyst (day 8+, monitoring)
```

**Come comunicano gli agenti?**
- Tramite Orchestrator (asincrono)
- Tramite task board Notion (tracking)
- Via brief strutturati (content, creative, strategy)

---

## 💾 Dove Salvare Output

Crea cartelle per ogni tipo di output:
```
/deck → Presentazioni strategiche
/social → Social content (copy + graphics)
/email → Email campaigns
/landing → Landing page copy + design
/video → Video script + storyboard
/report → Market & performance reports
/output → Tutti i deliverable finali
```

---

## 🔗 Collegamento con Notion Task Board

L'Orchestrator sincronizza automaticamente con Notion:
1. Crea task per ogni agente
2. Aggiorna status quando completi
3. Allega deliverable ai task
4. Traccia dipendenze

**Task board link**: [Aggiungi link a Notion]

---

## 📞 Come Contattare gli Agenti

**Per il tuo agente specializzato:**
```
@market-researcher → [Your prompt]
@campaign-strategist → [Your prompt]
@content-creator → [Your prompt]
@creative-designer → [Your prompt]
@data-analyst → [Your prompt]
@orchestrator → [Your prompt]
```

---

## 📚 Documentazione Agenti

Vedi i file:
- `.claude/agents/orchestrator.md` → Dettagli Orchestrator
- `.claude/agents/team.md` → Dettagli team agents

---

## 🎓 Best Practices

1. **Sempre con Orchestrator**: Se è una campagna completa, usa Orchestrator
2. **Brief Dettagliati**: Più dettagli nel brief = output migliore
3. **Brand Context**: Assicurati che gli agenti accedano a _context/
4. **Feedback Loop**: Se risultati non sono ideali, fornisci feedback agli agenti
5. **Timeline Realistico**: Dai tempo agli agenti di fare buon lavoro (non tutto in 1 giorno)

---

**Ultima modifica**: 09/05/2026
**Team Marketing AI**: 5 agenti specializzati + 1 orchestrator coordinatore
