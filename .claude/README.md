# 🤖 Sistema AI Team Marketing (FitCore)

Benvenuto al tuo **Team Marketing AI**. Questo sistema contiene:
- **5 Agenti specializzati** (content creator, designer, strategist, researcher, analyst)
- **1 Orchestrator** che coordina tutti gli agenti
- **30+ Skill riutilizzabili** per specifici task di marketing

---

## 📂 Struttura delle Cartelle

```
.claude/
├── agents/
│   ├── INDEX.md ⭐ LEGGI QUESTO PRIMA (guida agli agenti)
│   ├── orchestrator.md (coordinatore campagne)
│   ├── team.md (5 agenti specializzati)
│   └── [altri agent files]
│
└── skills/
    ├── deck-template-analyzer.md (analizza template pptx)
    ├── social-creative-designer.md (crea social graphics)
    ├── campaign-deck-creator.md (crea deck strategici)
    ├── content-generator.md (genera contenuti testuali)
    ├── [altri skill files]
    └── [30+ skill riutilizzabili per vari task]
```

---

## 🚀 Quick Start (Come Iniziare)

### Opzione 1: Campagna Completa (Consigliato)
Lascia che l'Orchestrator gestisca tutto:

```
@orchestrator → Gestisci la campagna Q3 Lancio Estivo:
- Obiettivi: Lanciare 3 programmi allenamento (HIIT, Strength, Recovery)
- Budget: €50,000
- Timeline: 12 settimane
- Target: Uomini e donne 25-40 appassionati di fitness
- Brand context: /_context/brand-guidelines.md
```

**L'Orchestrator farà**:
1. ✅ Analizza mercato (Market Researcher)
2. ✅ Crea strategia (Campaign Strategist)
3. ✅ Genera contenuti (Content Creator)
4. ✅ Progetta visual (Creative Designer)
5. ✅ Monitora performance (Data Analyst)
6. ✅ Fornisce report daily

---

### Opzione 2: Step-by-Step (Se vuoi controllare)

```
STEP 1: Analizza mercato
@market-researcher → Analizza trend fitness 2026 e competitor HIIT

STEP 2: Crea strategia  
@campaign-strategist → Crea piano strategico Q3 usando market intel

STEP 3: Scrivi contenuti
@content-creator → Genera social copy per HIIT, Strength, Recovery

STEP 4: Disegna visual
@creative-designer → Crea Instagram carousel e email template

STEP 5: Monitora performance (dopo launch)
@data-analyst → Analizza KPI vs target, A/B test results, ROI
```

---

## 👥 I Tuoi 6 Agenti

### 1. 🎬 **ORCHESTRATOR** (Direttore d'Orchestra)
**Per**: Gestire campagne complete
- Coordina tutti gli agenti
- Crea timeline e task assignment
- Monitora progress e quality
- Fornisce status reports daily

📖 [Vedi: orchestrator.md](agents/orchestrator.md)

### 2. 🔬 **MARKET RESEARCHER**
**Per**: Analizzare mercati, competitor, trend, audience
- Analisi competitiva
- Trend forecasting
- Persona development
- Market sizing

📖 [Vedi: team.md](agents/team.md)

### 3. 🎯 **CAMPAIGN STRATEGIST**
**Per**: Definire strategia campagna, canali, budget, KPI
- Strategic planning
- Multi-channel planning
- Budget allocation
- Messaging architecture

📖 [Vedi: team.md](agents/team.md)

### 4. ✍️ **CONTENT CREATOR**
**Per**: Generare copy, post, email, script
- Copywriting persuasivo
- SEO copywriting
- Video scripting
- A/B content variations

📖 [Vedi: team.md](agents/team.md)

### 5. 🎨 **CREATIVE DESIGNER**
**Per**: Progettare visual, graphics, layout
- UI/UX design
- Visual identity
- Asset generation
- Design responsive

📖 [Vedi: team.md](agents/team.md)

### 6. 📊 **DATA ANALYST**
**Per**: Monitorare KPI, performance, ROI
- KPI analysis
- A/B testing
- Dashboard creation
- ROI calculation

📖 [Vedi: team.md](agents/team.md)

---

## 🛠️ 30+ Skill Riutilizzabili

Ogni skill affronta uno specifico aspetto di marketing:

### Deck & Presentation
- `deck-template-analyzer.md` - Analizza template pptx
- `campaign-deck-creator.md` - Crea deck strategici
- `deck-template-validator.md` - Valida template vs brand
- [+10 più skill per deck]

### Social & Content
- `social-creative-designer.md` - Crea social graphics
- `content-generator.md` - Genera testi
- [+5 più skill per content]

### Landing Page & Marketing
- `landing-page-creator.md` - Crea landing page
- [+5 più skill per landing page]

### Data & Analytics
- `data-dashboard-generator.md` - Crea dashboard
- [+3 più skill per analytics]

### Team Collaboration
- `notion-taskboard-sync.md` - Sincronizza con Notion
- `team-collaboration.md` - Coordina team
- `mobile-taskboard-control.md` - Controllo da mobile

[Vedi lista completa in: skills/]

---

## 📋 Flusso Consigliato per una Campagna Q3

```
GIORNO 1:
└─ @orchestrator → Ricevi plan e assignment

GIORNO 2-3:
├─ @market-researcher → Analizza mercato
└─ @orchestrator → Monitora progress

GIORNO 3-4:
├─ @campaign-strategist → Crea strategia
└─ @orchestrator → Ricevi strategy + briefs

GIORNO 4-7:
├─ @content-creator → Genera copy
├─ @creative-designer → Progetta visual
└─ @orchestrator → Monitora integrazione

GIORNO 8:
└─ @orchestrator → Launch readiness check

GIORNO 9-60:
├─ Campaign LIVE
└─ @data-analyst → Daily performance reports

GIORNO 60:
└─ @orchestrator → Post-campaign analysis
```

**Tempo totale**: 60 giorni (8 settimane)

---

## 📖 Leggi Prima

**Se sei nuovo al sistema**:
1. 📖 [Leggi: INDEX.md](agents/INDEX.md) - Guida completa agli agenti
2. 📖 [Leggi: CLAUDE.md](../CLAUDE.md) - Istruzioni del progetto
3. 🎬 Attiva Orchestrator

**Se vuoi usare uno specifico agente**:
1. 📖 Vedi la descrizione del ruolo in [team.md](agents/team.md)
2. Copia il prompt di base e personalizza
3. Invia il prompt all'agente

---

## 🔗 Collegamento con Notion Task Board

L'Orchestrator sincronizza automaticamente con la tua task board Notion:
- Crea task per ogni agente
- Aggiorna status (Assegnato → In Corso → Completato)
- Allega deliverable ai task
- Traccia dipendenze

**Task board**: [Aggiungi link a Notion]

---

## 🎓 Best Practices

### Per Risultati Migliori:
1. **Usa Orchestrator per campagne complete** - Coordina tutto automaticamente
2. **Brief dettagliati** - Più info = output migliore
3. **Contesto brand sempre disponibile** - In _context/
4. **Timeline realistico** - Non tutto in 1 giorno
5. **Feedback loop** - Dai feedback agli agenti per iterare

### Per Team Collaboration:
1. Assegna un "Campaign Owner" (project manager)
2. Usa Notion task board per tracking
3. Hanno riunioni daily sync con Orchestrator
4. Escalate blocchi/rischi subito

---

## 💡 Esempi di Prompt

### Campagna Completa
```
@orchestrator → Gestisci la campagna Q3 Lancio Estivo:
- Obiettivi: Lanciare 3 programmi (HIIT, Strength, Recovery)
- Budget: €50,000
- Timeline: 12 settimane
- Target: Uomini/donne 25-40 fitness enthusiasts
- Brand context: /_context/brand-guidelines.md
```

### Market Research
```
@market-researcher → Analizza il mercato fitness online Italy 2026:
- Competitori: Peloton, Fitbit Coach, Nike Training Club
- Focus: audience 25-40, online HIIT
- Output: persona, competitor benchmarking, trend forecast
```

### Strategia Campagna
```
@campaign-strategist → Crea strategia per Q3 Lancio Estivo:
- Basato su market intel: [Market Research Report link]
- Canali: Instagram, TikTok, Facebook, Email
- Budget: €50,000 totale
- Output: strategy doc + content brief + creative brief
```

### Generare Contenuti
```
@content-creator → Genera social copy per Q3 Campaign:
- Channel: Instagram Reel captions (HIIT, Strength, Recovery)
- Include: 3 headline variations per programma
- Tone: Energico, motivante, inclusivo
- Format: JSON con variazioni A/B
```

### Progettare Visual
```
@creative-designer → Crea Instagram carousel per Q3 Campaign:
- Topic: "5 Errori che Stai Facendo in Palestra"
- Style: Illustrato e dinamico
- Format: 5 slide, aspect ratio 4:5
- Output: PNG images + design specs
```

### Monitorare Performance
```
@data-analyst → Analizza performance Q3 Campaign dopo launch:
- KPI: Reach, clicks, conversions, cost-per-lead
- Period: [Start date] a [Today]
- Include: A/B test results, forecast, recommendations
```

---

## 🎓 TUTORIAL COMPLETO PER OGNI AGENTE

### 🎬 Tutorial: ORCHESTRATOR (Direttore d'Orchestra)

**Cosa Fa**:
Coordina TUTTI gli agenti, gestisce timeline, assegna task, monitora progress, fornisce status reports.

**Tutorial Base (5 min)**:
```
@orchestrator → Gestisci la campagna [Campaign Name]:
- Obiettivi: [Es. Lanciare 3 programmi, 10k sign-ups]
- Budget: [Es. €50,000]
- Timeline: [Es. 12 settimane, dal 26 maggio al 23 agosto]
- Target: [Es. Uomini/donne 25-40, appassionati fitness]
- Brand context: /_context/brand-guidelines.md
```

**Potenzialità Nascoste** ⭐:
- Chiedi status report quotidiani: "Dammi daily update su progress e blocchi"
- Richiedi optimization recommendations: "Quali agenti dovrei coinvolgere di più?"
- Chiedi escalation di rischi: "Quali sono i 3 principali rischi della campagna?"
- Richiedi timeline accelerata: "Possiamo comprimere a 8 settimane? Come?"
- Chiedi integrazione cross-campaign: "Come coordiniamo questa con la campagna estiva?"

**Chicche** 💡:
1. **Iterazione veloce**: Se timeline non funziona, Orchestrator aggiusta automaticamente
2. **Task overflow**: Orchestrator distribuisce lavoro agli agenti per evitare bottleneck
3. **Comunicazione asincrona**: Non aspetta - assegna task in parallelo per velocità
4. **Auto-escalation**: Segnala automaticamente blocchi critici che bloccano la campagna
5. **Knowledge transfer**: Tiene traccia dei learnings per future campagne

**Comando di Attivazione Automatica**:
```bash
# Attiva orchestrator per una nuova campagna (copy-paste)
@orchestrator → Nuovo progetto campagna marketing:
- Tipo: [Full campaign orchestration]
- Nome campagna: [Campaign Name]
- Obiettivi: [3-5 bullet points]
- Budget: [Amount]
- Timeline: [Weeks]
- Target: [Audience description]
- Context: /_context/brand-guidelines.md
- Auto-start: YES (inizia subito senza approvazione)
```

---

### 🔬 Tutorial: MARKET RESEARCHER (Analista Mercato)

**Cosa Fa**:
Analizza competitor, trend, audience, identifica opportunità, crea persona.

**Tutorial Base (5 min)**:
```
@market-researcher → Analizza il mercato [Segment]:
- Mercato: [Es. Fitness online Italia 2026]
- Target: [Es. Donne 25-40, appassionate HIIT]
- Competitor: [Es. Peloton, Nike Training Club, Fitbit]
- Focus: Trend, consumer behavior, positioning gaps
- Output format: Report + personas + opportunities
```

**Potenzialità Nascoste** ⭐:
- Richiedi audience segmentation: "Dammi 5 micro-segments di audience con messaging personalizzato"
- Richiedi trend forecast: "Quali trend emergeranno nei prossimi 6 mesi?"
- Richiedi sentiment analysis: "Come viene percepito il nostro brand vs competitor?"
- Richiedi pricing strategy: "Quale pricing è competitivo per questo mercato?"
- Richiedi partnership opportunities: "Con chi dovremmo collaborare per reach più ampio?"

**Chicche** 💡:
1. **Multi-level analysis**: Non solo mercato, ma anche micro-communities e niche
2. **Predictive insight**: Market Researcher predice cosa farà il competitor domani
3. **Persona development**: Crea persona super dettagliate (psychographics, pain points, aspirations)
4. **Opportunity mapping**: Identifica white spaces di mercato non occupati
5. **Benchmarking dinamico**: Confronta vs competitor in real-time

**Comando di Attivazione Automatica**:
```bash
# Attiva market research per un nuovo mercato
@market-researcher → Research project - Deep Market Analysis:
- Mercato target: [Market/segment]
- Profondità: FULL (analisi completa 360°)
- Include: Competitor analysis, trend forecast, persona, opportunity mapping
- Output: Report + Dashboard + Strategic recommendations
- Auto-publish: YES (condividi risultati con team)
```

---

### 🎯 Tutorial: CAMPAIGN STRATEGIST (Stratega Campagne)

**Cosa Fa**:
Crea strategia completa, definisce messaggi, pianifica canali, alloca budget, crea brief per altri agenti.

**Tutorial Base (5 min)**:
```
@campaign-strategist → Crea strategia per [Campaign]:
- Ricevi: Market intelligence report (da market-researcher)
- Obiettivi: [Es. 10k sign-ups, €2 cost-per-lead]
- Budget: [Es. €50,000 totale]
- Timeline: [Es. 12 settimane]
- Output: Strategy doc + content brief + creative brief + KPI dashboard
```

**Potenzialità Nascoste** ⭐:
- Richiedi scenario planning: "Dammi 3 strategie diverse: conservative, standard, aggressive"
- Richiedi messaging framework: "Crea messaging architecture per 5 audience segments"
- Richiedi budget optimization: "Dove dovrei allocare più budget per massimizzare ROI?"
- Richiedi channel mix: "Quale mix di canali funziona meglio per questo target?"
- Richiedi competitive positioning: "Come ci difenziamo dai 3 competitor principali?"

**Chicche** 💡:
1. **Scenario planning**: Crea 3 versioni di strategia (conservative/balanced/aggressive)
2. **Dynamic budget allocation**: Suggerisce come redistribuire budget durante campagna basato su performance
3. **Message testing blueprint**: Crea test plan per validare messaggi prima del lancio
4. **Channel sequencing**: Non tutti i canali lanciati insieme - sequenzia per massimizzare learning
5. **Contingency planning**: Crea backup plan se performance è sotto target

**Comando di Attivazione Automatica**:
```bash
# Attiva strategia per una campagna
@campaign-strategist → Strategy Development Project:
- Ricevi input da: @market-researcher (allegare report)
- Deliverables: Strategy doc + 2 creative briefs + KPI targets
- Format: Markdown + JSON (per import automatico in tool)
- Approval chain: Auto-approve and share with Content Creator + Designer
- Timeline: [Days available] days per strategy development
```

---

### ✍️ Tutorial: CONTENT CREATOR (Copywriter/Content Producer)

**Cosa Fa**:
Scrive copy persuasivo, crea post social, email, script video, pagine landing, A/B variations.

**Tutorial Base (5 min)**:
```
@content-creator → Genera contenuti per [Campaign]:
- Ricevi: Content brief (da campaign-strategist)
- Canali: [Es. Instagram, TikTok, Email, Landing page]
- Topic: [Es. Lancio HIIT program]
- Tone: [Es. Energico, motivante, inclusivo]
- Include A/B variations: YES (3-5 per format)
- Output: Copy file + spreadsheet con variations
```

**Potenzialità Nascoste** ⭐:
- Richiedi hook variations: "Dammi 10 differenti hook per catturare attenzione (prime 3 parole)"
- Richiedi CTA testing: "Quale CTA converte meglio? Dammi 5 varianti"
- Richiedi emotion mapping: "Quali emozioni trigger azione? Mappa per audience segment"
- Richiedi narrative structure: "Crea 5 diverse story arc per il messaggio"
- Richiedi localization: "Adatta il copy per 3 regioni geografiche diverse"

**Chicche** 💡:
1. **Neuropsychology copy**: Copy basato su trigger psicologici (scarcity, urgency, social proof)
2. **Voice clone**: Mantiene coerenza voice anche con diversi writer
3. **SEO optimization**: Incorpora keywords naturalmente senza forzare
4. **Conversion optimization**: Ogni copy è testato per massimizzare conversion rate
5. **Multilingual ready**: Copy facile da tradurre mantenendo messaggio/tone

**Comando di Attivazione Automatica**:
```bash
# Attiva content creation per una campagna
@content-creator → Content Production Pipeline:
- Ricevi brief: [Allegare content brief da strategist]
- Output types: Instagram captions + Email sequences + Landing page copy + Video scripts
- Include variations: A/B variations per ogni output (3-5 options)
- Tone guide: /_context/voice-and-tone.md
- Auto-organize: YES (organizza per channel/format in cartelle)
- Publish to: /output/social/, /output/email/, /output/landing/
```

---

### 🎨 Tutorial: CREATIVE DESIGNER (Designer Grafico)

**Cosa Fa**:
Progetta visual, crea graphics, mockup, template design, assicura brand consistency.

**Tutorial Base (5 min)**:
```
@creative-designer → Crea design per [Campaign]:
- Ricevi: Creative brief (da campaign-strategist)
- Canali: [Es. Instagram, Email, Landing page, Ads]
- Topic: [Es. Lancio HIIT program]
- Style: [Es. Moderno, vibrante, illustrativo]
- Include: Mockup + design specs + variations
- Output: PNG + PSD + design system file
```

**Potenzialità Nascoste** ⭐:
- Richiedi design system: "Crea complete design system (colors, typography, components)"
- Richiedi animation concepts: "Suggerisci motion design per video intro"
- Richiedi responsive variations: "Ottimizza design per mobile, tablet, desktop"
- Richiedi accessibility check: "Assicura WCAG AAA compliance (contrasto, font size, etc.)"
- Richiedi cultural adaptation: "Adatta design per 3 mercati geografici diversi"

**Chicche** 💡:
1. **Neuro-design**: Design basato su eye-tracking + cognitive load optimization
2. **Brand consistency AI**: Auto-checks ogni design vs brand guidelines
3. **Conversion-focused**: Design layout ottimizzato per conversion, not just beauty
4. **Animation-ready**: Export design con animation specs (durations, easing, etc.)
5. **Accessibility-first**: Ogni design è WCAG AAA compliant by default

**Comando di Attivazione Automatica**:
```bash
# Attiva design per una campagna
@creative-designer → Design Production Pipeline:
- Ricevi brief: [Allegare creative brief da strategist]
- Design types: Social graphics + Email templates + Landing mockup + Ad creatives
- Brand guideline: /_context/visual-identity.md
- Include variations: 3-5 design variations per format (A/B testing)
- Output formats: PNG (high-res) + PSD (editable) + SVG (scalable)
- Auto-organize: YES (organizza per channel in cartelle)
- Publish to: /output/social/, /output/email/, /output/landing/, /output/ads/
```

---

### 📊 Tutorial: DATA ANALYST (Performance Monitor)

**Cosa Fa**:
Monitora KPI, analizza performance, A/B test, calcola ROI, fornisce recommendations.

**Tutorial Base (5 min)**:
```
@data-analyst → Analizza performance [Campaign]:
- Canale dati: [Es. Google Analytics, Facebook Ads, CRM]
- KPI: [Es. Reach, conversions, cost-per-lead, ROI]
- Periodo: [Es. Ultimi 30 giorni]
- Segmenti: [Es. Per channel, per audience segment]
- Include: A/B test analysis, forecast, optimization recommendations
```

**Potenzialità Nascoste** ⭐:
- Richiedi attribution modeling: "Chi credit get per ogni touchpoint? (first-click, last-click, multi-touch)"
- Richiedi cohort analysis: "Come si comportano coorti diverse nel tempo?"
- Richiedi predictive modeling: "Forecast performance per prossimi 30 giorni"
- Richiedi anomaly detection: "Quali KPI sono anomali? Cosa è causato?"
- Richiedi optimization scoring: "Ranking di tutte le optimization opportunities per impact"

**Chicche** 💡:
1. **Statistical rigor**: A/B test analysis con p-value, confidence intervals, sample size check
2. **Causal inference**: Non solo correlation - identifica relazioni causali
3. **Real-time alerts**: Notifica automaticamente se KPI cala sotto target
4. **Lift calculation**: Calcola incremental impact di ogni change vs control
5. **Automated recommendations**: Ranking di optimization da implementare subito

**Comando di Attivazione Automatica**:
```bash
# Attiva monitoring per una campagna live
@data-analyst → Performance Monitoring System:
- Campagna: [Campaign name]
- KPI target: [Es. 10k sign-ups, €2 CPA, 15% conversion]
- Data sources: Google Analytics, Facebook Ads, CRM (provide access)
- Frequency: DAILY (report quotidiano)
- Include: KPI dashboard + A/B analysis + ROI calculation + recommendations
- Alert threshold: -10% da target (escalate subito)
- Auto-publish: /output/report/daily-{date}.md
- Auto-notify: Orchestrator su performance status daily
```

---

## 🛠️ COME CREARE NUOVI AGENTI CUSTOM

### Metodo 1: Agente Basato su Ruolo Esistente
```
Copia il template di team.md e personalizza:
1. Rinomina il ruolo
2. Modifica competenze + flusso di lavoro
3. Aggiungi input/output specifici
4. Salva in .claude/agents/[nome].md
5. Attiva con @[nome] → [prompt]
```

### Metodo 2: Agente Ibrido (Multi-Ruoli)
```
Combina competenze da 2+ agenti:
@[nome-ibrido] → [Brief]
Es. "marketing-plus-analytics" = content-creator + data-analyst

Salva in .claude/agents/hybrids/[nome].md
```

### Metodo 3: Agente Verticale (Domain Expert)
```
Crea agente specializzato in una nicchia:
Es. "ecommerce-specialist" = strategist specializzato in ecommerce

Ingredienti:
- Competenze: [3-5 skills specifiche verticale]
- Flusso: [Workflow specifico per verticale]
- Tools: [Skills riutilizzabili specifiche]
- Output: [Deliverable vertical-specific]
```

---

## ⚡ COMANDI DI ATTIVAZIONE AUTOMATICA (Copy-Paste)

### 🚀 Attiva Sistema Completo (Orchestrator + Team)
```bash
# Copia tutto nel chat e invia - sistema si autoattiva
@orchestrator → ACTIVATE FULL SYSTEM - Campaign Management:
- Campaign: [Campaign name]
- Mode: FULL_ORCHESTRATION (coordina tutti i 5 agenti)
- Briefing: [Paste the campaign brief here]
- Brand context: /_context/brand-guidelines.md
- Auto-assign: YES (distribuisci task automaticamente)
- Auto-report: YES (daily status updates)
- Timeline: [Weeks] settimane
```

### 📊 Attiva Monitoraggio Real-Time
```bash
@data-analyst → ACTIVATE REAL-TIME MONITORING:
- Campaign: [Campaign name]
- KPI targets: [List KPI + targets]
- Data sources: [GA, Facebook Ads, CRM, etc.]
- Frequency: HOURLY (monitoring real-time)
- Alert threshold: -10% da target
- Auto-escalate: SÌ (escalate blocchi critici)
```

### 📅 Attiva Daily Standup Automatico
```bash
@orchestrator → ACTIVATE DAILY STANDUP:
- Campagna: [Campaign name]
- Orario: 9:00 AM (personalizza)
- Partecipanti: [market-researcher, strategist, content-creator, designer, analyst]
- Agenda: Progress, blocchi, optimization, next actions
- Duration: 15 min (conciso)
- Output: Daily standup summary in /output/daily-standup/{date}.md
```

### 🔄 Attiva Continuous Optimization Loop
```bash
@data-analyst + @campaign-strategist → ACTIVATE OPTIMIZATION LOOP:
- Campaign: [Campaign name]
- Frequency: WEEKLY (analisi performance)
- Trigger: Se KPI cala sotto target
- Action: Recommenda optimization + @strategist approva + @content-creator implementa
- Cycle time: 48 hours (dalla detection a implementation)
```

### 🎯 Attiva Multi-Campaign Orchestration
```bash
@orchestrator → ACTIVATE PORTFOLIO MANAGEMENT:
- Campagne: [Campaign 1, Campaign 2, Campaign 3]
- Total budget: [Budget totale]
- Prioritization: [By deadline / by budget / by ROI potential]
- Resource allocation: AUTO (distribuisci agenti per load balance)
- Cross-campaign learning: SÌ (share insights tra campagne)
```

### 📱 Attiva Mobile Controller Dashboard
```bash
@orchestrator → ACTIVATE MOBILE DASHBOARD:
- Campagne: [Campaign names]
- Interface: MOBILE_OPTIMIZED (iOS/Android friendly)
- Data: KPI summary, blocchi, quick actions
- Sync: REAL_TIME (con Notion task board)
- Shortcut: /output/mobile-dashboard.html (aperto da smartphone)
```

---

## 💎 CHICCHE AVANZATE (Pro Tips)

### Chicca 1: Agenti Intelligenti Si Auto-Corrigono
```
Se un agente produce output non ideale:
"Non mi piace, riprova: [specific feedback]"

Agente auto-migliora iterativamente fino a soddisfazione.
```

### Chicca 2: Agenti Imparano da Feedback
```
Dopo ogni campagna:
@orchestrator → Genera "Campaign Learnings Report"

Include:
- Cosa ha funzionato
- Cosa non ha funzionato
- Recommendations per future campaigns
- Agenti incorporano learnings in future lavoro
```

### Chicca 3: Cross-Agent Knowledge Sharing
```
Abilita knowledge sharing tra agenti:
@orchestrator → Enable cross-agent collaboration:
- Market Researcher condivide insights con Strategist
- Strategist condivide briefs con Creator + Designer
- Creator/Designer condividono output con Analyst
- Analyst condivide learnings con tutti
```

### Chicca 4: Agenti Sanno Quando Escalare
```
Agenti escalate automaticamente se:
- Blocco critico che impatta timeline
- Richiesta outside di competenza
- Feedback ricevuto indicates need per expertise diversa

Escalation va a Orchestrator → risoluzione rapida
```

### Chicca 5: Agenti Producono Auto-Documentation
```
Ogni agente auto-documenta il suo lavoro:
- Decision log: perché ha scelto questo approach
- Assumption log: assunzioni fatte
- Risk log: rischi identificati
- Learnings: cosa imparato per future use

Auto-saved in /output/documentation/[agent-name]/
```

### Chicca 6: Agenti in Modalità "Insegnamento"
```
Se vuoi imparare da agenti:
@[agent] → MODE: TEACHING

Agente spiega ogni decision, non solo output finale.
Perfetto per learning e skill development.
```

### Chicca 7: Agenti Producono Report Esecutivi
```
Chiedi report esecutivo (non tecnico):
@orchestrator → Produce EXECUTIVE SUMMARY:
- Audience: C-level, non marketer
- Length: 1 page max
- Content: Key findings, recommendations, ROI only
- Format: Bullet-point, easy to scan
```

### Chicca 8: Agenti Sanno Lavorare in Parallelo
```
Agenti non aspettano uno-per-uno:
@orchestrator → ENABLE PARALLEL PROCESSING:
- Market Researcher inizia subito
- Strategist inizia research (non aspetta researcher finisca)
- Creator/Designer iniziano ideation in parallelo
- Overlap = tempo risparmiato (6-8 settimane invece di 12)
```

### Chicca 9: Agenti Hanno "Modalità Brainstorm"
```
Abilita brainstorm creativo:
@[agent] → MODE: BRAINSTORM (no filters)

Genera 50 idee crazy/wild, non solo 5 safe ideas.
Perfetto per innovation breakthrough.
```

### Chicca 10: Agenti Producono "Failure Scenarios"
```
Chiedi cosa potrebbe andare male:
@[agent] → Generate FAILURE SCENARIOS:
- Cosa potrebbe far fallire questa campagna?
- Probability + impact di ogni risk
- Mitigation strategy per ogni risk

Perfetto per contingency planning.
```

---

## 📈 METRICHE DI SUCCESSO DEGLI AGENTI

Monitora questi KPI per valutare performance agenti:

| Agente | Metrica Successo | Target |
|--------|------------------|--------|
| **Orchestrator** | On-time delivery | 95%+ |
| **Orchestrator** | Quality gates passed | 100% |
| **Market Researcher** | Insight actionability | 80%+ rated useful |
| **Market Researcher** | Persona accuracy | Validato vs real data |
| **Campaign Strategist** | Strategy alignment vs goals | 100% |
| **Campaign Strategist** | Brief quality (downstream) | 4.5+/5 da content+design |
| **Content Creator** | Copy persuasiveness | A/B test lift >15% |
| **Content Creator** | Brand voice consistency | 95%+ |
| **Creative Designer** | Design impact (engagement) | >2x vs baseline |
| **Creative Designer** | Brand consistency | 100% vs guidelines |
| **Data Analyst** | Accuracy delle previsioni | MAE <5% |
| **Data Analyst** | Actionability recommendations | >70% implementate |

---

## 🎯 Prossimo Passo

**1️⃣ Scegli uno scenario** → Quick start / Full orchestration / Step-by-step  
**2️⃣ Copia il comando di attivazione** → Personalizza  
**3️⃣ Invia all'agente** → Vedi magia accadere  
**4️⃣ Monitora progresso** → Daily reports  
**5️⃣ Dai feedback** → Agenti si auto-migliorano  

---

## ❓ FAQ

**D: Posso usare gli agenti singolarmente?**
R: Sì! Ogni agente è indipendente. Usa solo chi ti serve.

**D: Quanto tempo ci vuole per una campagna completa?**
R: ~60 giorni (8 settimane) con orchestration completa. Puoi ridurre con parallellizzazione.

**D: Gli agenti recuperano il contesto brand automaticamente?**
R: Sì, cercano in _context/. Assicurati che i file siano lì.

**D: Posso avere feedback sulla qualità?**
R: Sì, tutti gli agenti supportano iterazione. Dai feedback e provano di nuovo.

**D: Come integro con il mio CRM/Analytics?**
R: Data Analyst può importare da GA, Facebook Ads, CRM. Fornisci accesso.

---

## 📞 Contatti

**Orchestrator (coordinatore principale)**:
```
@orchestrator → [Your message]
```

**Agenti specializzati**:
```
@market-researcher → [Your message]
@campaign-strategist → [Your message]
@content-creator → [Your message]
@creative-designer → [Your message]
@data-analyst → [Your message]
```

---

## 📚 Documentazione Completa

- **[INDEX.md](agents/INDEX.md)** - Guida agli agenti (READ THIS FIRST!)
- **[orchestrator.md](agents/orchestrator.md)** - Dettagli Orchestrator
- **[team.md](agents/team.md)** - Dettagli 5 agenti
- **[CLAUDE.md](../CLAUDE.md)** - Istruzioni progetto
- **[skills/](skills/)** - 30+ skill riutilizzabili

---

## 🎯 Prossimo Passo

**1️⃣ Leggi [INDEX.md](agents/INDEX.md)** - Guida completaa gli agenti  
**2️⃣ Prepara il tuo brief di campagna**  
**3️⃣ Invia a @orchestrator** - Lascia che coordini tutto  
**4️⃣ Ricevi daily status report**  

---

**Sistema creato**: 09/05/2026  
**Team Marketing AI**: Pronto per l'uso  
**Ultima versione**: 1.0

🚀 **Buona campagna!**
