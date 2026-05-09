# 🎯 SYSTEM OVERVIEW - Come Funziona il Tuo Team AI

## Architettura del Sistema

```
                          ┌─────────────────┐
                          │   NOTION BOARD  │
                          │  (Task Tracking)│
                          └────────┬────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
            ┌───────▼────────┐          ┌────────▼────────┐
            │   TASK INPUT   │          │  ORCHESTRATOR   │ ⭐
            │ (Campaign Brief)          │ (Coordinator)   │
            └────────────────┘          └────────┬────────┘
                                                 │
                        ┌────────────┬───────────┼────────────┬──────────┐
                        │            │           │            │          │
                ┌───────▼──────┐  ┌──▼──────┐  ┌─▼──────┐  ┌──▼──────┐ ┌──▼──────┐
                │  MARKET      │  │CAMPAIGN │  │CONTENT │  │CREATIVE  │ │  DATA   │
                │ RESEARCHER   │  │STRATEGIST  │CREATOR  │  │DESIGNER  │ │ANALYST  │
                │              │  │         │  │        │  │          │ │         │
                │ - Analyze    │  │ - Define│  │- Write │  │- Design  │ │- Monitor│
                │   market     │  │   strategy  │  copy  │  │  visual  │ │  KPI    │
                │ - Competitor │  │ - Plan  │  │- Social│  │- Brand   │ │- A/B    │
                │   analysis   │  │   channels │ │ post  │  │  identity│ │  test   │
                │ - Persona    │  │ - Allocate │- Email │  │- Design  │ │- Report │
                │              │  │   budget   │  script│  │  system  │ │         │
                │ Output:      │  │ Output: │  │        │  │ Output:  │ │ Output: │
                │ - Report     │  │ - Strategy  │- Copy  │  │- Visual  │ │- Report │
                │ - Insight    │  │ - Briefs   │- A/B   │  │- Mockup  │ │- Dash   │
                │ - Personas   │  │ - KPI dash │ vars   │  │- Specs   │ │- Rec    │
                └──────────────┘  └──────────┘  └────────┘  └──────────┘ └─────────┘
                       ▲                    │         │         │           │
                       │                    └─────────┴─────────┴───────────┘
                       │                              │
                       │ Input                        │ Output
                       │ (Market Intel)               │ (Integrated Campaign)
                       │                              │
                       └──────────────┬───────────────┘
                                      │
                            ┌─────────▼──────────┐
                            │ INTEGRATED OUTPUT  │
                            │ (All deliverables) │
                            └────────────────────┘
                                      │
                            ┌─────────▼──────────┐
                            │  CAMPAIGN LIVE     │
                            │  (Launch & Monitor)│
                            └────────────────────┘
```

---

## Flusso di Lavoro Passo-Passo (Campagna Completa)

```
GIORNO 1: INTAKE
┌─────────────────────────┐
│ Brief di Campagna       │
├─────────────────────────┤
│ - Obiettivi             │
│ - Budget                │
│ - Timeline              │
│ - Target audience       │
│ - Brand context         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ ORCHESTRATOR            │
├─────────────────────────┤
│ Analizza brief          │
│ Crea orchestration plan │
│ Assegna task a agenti   │
└────────┬────────────────┘
         │
    ┌────┴────┬──────────┬────────┬──────────┬──────────┐
    │ Send to  │          │        │          │          │
    ▼          ▼          ▼        ▼          ▼          ▼

GIORNI 2-3: MARKET INTELLIGENCE
┌─────────────────────────┐
│ MARKET RESEARCHER       │
├─────────────────────────┤
│ ✓ Competitive analysis  │
│ ✓ Trend research        │
│ ✓ Audience insights     │
│ ✓ Market sizing         │
└────────┬────────────────┘
         │ Report
         ▼
    ┌─────────────────────┐
    │ Market Report       │
    │ Personas            │
    │ Opportunities       │
    └────────┬────────────┘
             │
        to: Campaign Strategist
             │
             ▼
GIORNI 3-4: STRATEGIA
┌──────────────────────────┐
│ CAMPAIGN STRATEGIST      │
├──────────────────────────┤
│ Riceve: Market intel     │
│ ✓ Define key messages   │
│ ✓ Multi-channel plan    │
│ ✓ Budget allocation     │
│ ✓ Create briefs         │
└────────┬─────────────────┘
         │
    ┌────┴──────────────┬─────────────────┐
    │ Content Brief     │ Creative Brief  │
    │ - Messaging       │ - Visual style  │
    │ - Topics          │ - Color palette │
    │ - Tone            │ - Format        │
    │ - KPI             │ - Reference     │
    │                   │                 │
    ▼                   ▼
GIORNI 4-6: CREAZIONE CONTENUTI (IN PARALLELO)

┌──────────────────────────┐      ┌──────────────────────────┐
│ CONTENT CREATOR          │      │ CREATIVE DESIGNER        │
├──────────────────────────┤      ├──────────────────────────┤
│ Riceve: Content Brief    │      │ Riceve: Creative Brief   │
│ ✓ Social copy            │      │ ✓ Social graphics        │
│ ✓ Email copy             │      │ ✓ Email template         │
│ ✓ Landing page copy      │      │ ✓ Landing page mockup    │
│ ✓ Video scripts          │      │ ✓ Ad creative            │
│ ✓ A/B variations         │      │ ✓ Design specs           │
└────────┬─────────────────┘      └────────┬─────────────────┘
         │                                 │
         │ Copy Files                      │ Design Files
         │                                 │
         └────────────────┬────────────────┘
                          │
                          ▼
GIORNO 7: INTEGRAZIONE & QA
┌────────────────────────────┐
│ ORCHESTRATOR               │
├────────────────────────────┤
│ ✓ Verifica coerenza copy/  │
│   design                   │
│ ✓ Brand compliance check   │
│ ✓ Technical readiness      │
│ ✓ Launch readiness         │
└────────┬───────────────────┘
         │
         ▼
    ┌──────────────────┐
    │ LAUNCH READY ✓   │
    └────────┬─────────┘
             │
             ▼
GIORNO 8+: LANCIO & MONITORAGGIO
┌──────────────────────────┐
│ CAMPAIGN LIVE             │
├──────────────────────────┤
│ All channels activated    │
│ Content publishing        │
│ Ads go live               │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ DATA ANALYST             │
├──────────────────────────┤
│ ✓ Daily monitoring       │
│ ✓ KPI tracking           │
│ ✓ A/B test analysis      │
│ ✓ Performance reporting  │
│ ✓ Optimization recs      │
└────────┬────────────────┘
         │ Daily Reports
         ▼
┌──────────────────────────┐
│ ORCHESTRATOR             │
├──────────────────────────┤
│ Riceve daily reports     │
│ Escalates issues         │
│ Coordinates optimization │
│ Updates task board       │
└──────────────────────────┘
```

---

## Task Assignment (Chi Fa Cosa)

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR                             │
│   (Direttore d'Orchestra - Coordina tutto)                 │
├─────────────────────────────────────────────────────────────┤
│ Responsabilità:                                             │
│ ✓ Riceve brief di campagna                                │
│ ✓ Crea orchestration plan (timeline + task sequencing)    │
│ ✓ Assegna task a agenti specializzati                     │
│ ✓ Monitora progress vs timeline                           │
│ ✓ Valida quality deliverable                              │
│ ✓ Coordina integrazione tra agenti                        │
│ ✓ Fornisce status reports                                 │
│ ✓ Escalates blocchi/rischi                                │
│ ✓ Sincronizza con task board (Notion)                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│   MARKET RESEARCHER      │
│  (Expert ricerca mercato)│
├──────────────────────────┤
│ Analizza:                │
│ ✓ Competitive landscape  │
│ ✓ Market trends          │
│ ✓ Consumer behavior      │
│ ✓ Audience segments      │
│ ✓ Growth opportunities   │
└──────────────────────────┘
        ↓ Output: Market Report

┌──────────────────────────┐
│   CAMPAIGN STRATEGIST    │
│   (Stratega campagne)    │
├──────────────────────────┤
│ Riceve: Market intel     │
│ Definisce:               │
│ ✓ Key messaging          │
│ ✓ Multi-channel plan     │
│ ✓ Budget allocation      │
│ ✓ Timeline milestones    │
│ ✓ KPI targets            │
│ Crea:                    │
│ ✓ Content briefs         │
│ ✓ Creative briefs        │
└──────────────────────────┘
     ↙ briefs          ↘

┌──────────────────────┐  ┌──────────────────────┐
│  CONTENT CREATOR     │  │  CREATIVE DESIGNER   │
│ (Copywriter/editor)  │  │  (Visual Designer)   │
├──────────────────────┤  ├──────────────────────┤
│ Riceve: Content      │  │ Riceve: Creative     │
│ brief                │  │ brief                │
│ Genera:              │  │ Genera:              │
│ ✓ Social posts       │  │ ✓ Social graphics    │
│ ✓ Email copy         │  │ ✓ Email templates    │
│ ✓ Landing page       │  │ ✓ Landing mockup     │
│ ✓ Video scripts      │  │ ✓ Ad creative        │
│ ✓ A/B variations     │  │ ✓ Design specs       │
└──────────────────────┘  └──────────────────────┘
         ↓ Copy                    ↓ Design
         │                         │
         └────────────┬────────────┘
                      │
                      ↓
         ┌──────────────────────┐
         │ INTEGRATED CAMPAIGN  │
         │ (Copy + Design)      │
         └────────────┬─────────┘
                      │
                      ↓
        ┌─────────────────────────┐
        │  DATA ANALYST           │
        │ (Performance Monitor)   │
        ├─────────────────────────┤
        │ Post-Launch (Day 8+):   │
        │ ✓ Monitor KPI daily     │
        │ ✓ A/B test analysis     │
        │ ✓ ROI calculation       │
        │ ✓ Performance reports   │
        │ ✓ Optimization recs     │
        └─────────────────────────┘
             ↓ Daily Reports
         Back to: Orchestrator
         → Coordinates optimization
```

---

## Comunicazione tra Agenti

```
Sequential Communication (Asincrono):

Market Researcher
    ↓ (Report: Market Intelligence)
Campaign Strategist
    ↓ (Briefs: Content + Creative)
    ├─→ Content Creator
    │      ↓ (Copy files)
    │      └─→ Integration/QA
    │
    └─→ Creative Designer
           ↓ (Design files)
           └─→ Integration/QA
                  ↓ (Integrated Campaign)
              Data Analyst
                  ↓ (Daily Reports)
              Orchestrator
                  → Coordinates optimization
```

---

## Skill Utilizzate dagli Agenti

```
MARKET RESEARCHER usa:
├─ market-researcher.md (skill propria)
└─ [Analisi dati, research, persona dev]

CAMPAIGN STRATEGIST usa:
├─ campaign-strategist.md
├─ campaign-deck-creator.md
└─ deck-content-generator.md

CONTENT CREATOR usa:
├─ content-generator.md
├─ deck-content-generator.md
└─ notion-taskboard-sync.md (per updates)

CREATIVE DESIGNER usa:
├─ social-creative-designer.md
├─ creative-designer.md
├─ deck-template-analyzer.md
└─ landing-page-creator.md

DATA ANALYST usa:
├─ data-dashboard-generator.md
├─ deck-template-exporter.md
└─ notion-taskboard-sync.md (per updates)

ORCHESTRATOR usa:
├─ team-collaboration.md
├─ notion-taskboard-sync.md
└─ mobile-taskboard-control.md
```

---

## Input/Output per Agente

```
┌─────────────────────────────────────┬────────────────────────────────────┐
│ AGENT                               │ INPUT / OUTPUT                     │
├─────────────────────────────────────┼────────────────────────────────────┤
│ ORCHESTRATOR                        │ IN:  Campaign brief                │
│ (Coordinator)                       │ OUT: Orchestration plan + briefs   │
├─────────────────────────────────────┼────────────────────────────────────┤
│ MARKET RESEARCHER                   │ IN:  Market/audience focus         │
│ (Analyst)                           │ OUT: Report + personas + insights  │
├─────────────────────────────────────┼────────────────────────────────────┤
│ CAMPAIGN STRATEGIST                 │ IN:  Market intel + objectives     │
│ (Strategist)                        │ OUT: Strategy doc + briefs + KPI   │
├─────────────────────────────────────┼────────────────────────────────────┤
│ CONTENT CREATOR                     │ IN:  Content brief + brand voice   │
│ (Copywriter)                        │ OUT: Copy files + A/B variations   │
├─────────────────────────────────────┼────────────────────────────────────┤
│ CREATIVE DESIGNER                   │ IN:  Creative brief + brand visual │
│ (Designer)                          │ OUT: Design files + specs + mockup │
├─────────────────────────────────────┼────────────────────────────────────┤
│ DATA ANALYST                        │ IN:  Campaign data + KPI targets   │
│ (Analyst)                           │ OUT: Report + dashboard + recs     │
└─────────────────────────────────────┴────────────────────────────────────┘
```

---

## Timeline Tipico (Campagna da 12 Settimane)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SETTIMANA 1                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  MON  │  Brief input → Orchestrator analysis → Plan creato                 │
│  TUE  │  Market Research kickoff                                           │
│  WED  │  Market Research in progress                                       │
│  THU  │  Market Research completes → Report available                      │
│  FRI  │  Strategy creation kickoff (usando market intel)                    │
│        │  End of Week 1 Status: Market research done, strategy in progress  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  SETTIMANA 2                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  MON  │  Strategy finalizes → Content brief + Creative brief sent           │
│  TUE  │  Content Creator + Designer kickoff (in parallel)                   │
│  WED  │  Content creation in progress (copy, social, email, script)        │
│  WED  │  Design creation in progress (graphics, mockup, specs)             │
│  THU  │  Content + Design largely completed                                │
│  FRI  │  Integration + QA phase starts                                     │
│        │  End of Week 2 Status: All content + design ready, QA in progress  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  SETTIMANA 3                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  MON  │  QA + Integration completes → Launch readiness check               │
│  TUE  │  Final approvals + asset organization                              │
│  WED  │  ✅ LAUNCH DAY (Campaign goes live across all channels)             │
│  THU  │  Data Analyst monitoring begins                                    │
│  FRI  │  First daily performance report received                           │
│        │  End of Week 3 Status: Campaign LIVE, monitoring active            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  SETTIMANE 4-12 (9 Settimane Rimanenti)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Every Day  │  Data Analyst monitors KPI vs target                          │
│  Every Day  │  Daily performance reports (if needed)                        │
│  Weekly     │  Weekly optimization review                                   │
│  Weekly     │  Orchestrator coordinates any optimizations/adjustments      │
│  As Needed  │  Content Creator / Designer implement optimizations          │
│  End        │  Post-campaign analysis + learnings report                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Metriche di Successo

```
ORCHESTRATOR Performance:
✓ Timeline adherence (on schedule)
✓ Quality gates passed (all checkpoints)
✓ Agente deliverable quality
✓ Stakeholder satisfaction

MARKET RESEARCHER:
✓ Market insights accuracy
✓ Persona relevance
✓ Competitive analysis depth
✓ Actionable recommendations

CAMPAIGN STRATEGIST:
✓ Strategy clarity & coherence
✓ Brief quality for downstream agenti
✓ KPI definition & realism
✓ Budget allocation efficiency

CONTENT CREATOR:
✓ Copy persuasiveness
✓ Brand voice alignment
✓ Channel-specific optimization
✓ A/B variation relevance

CREATIVE DESIGNER:
✓ Visual impact & appeal
✓ Brand consistency
✓ Design quality & polish
✓ Asset usability

DATA ANALYST:
✓ KPI accuracy
✓ A/B test statistical rigor
✓ Insights actionability
✓ Report clarity
```

---

## Scalability (Multiple Campaigns)

```
Se gestisci multiple campaigns in parallelo:

Campaign A: ─── Orchestrator A ─── Agenti Team ─── Lancio ───
                                          ↓
Campaign B: ─── Orchestrator B ─── Agenti Team ─── Lancio ───
                                          ↓
Campaign C: ─── Orchestrator C ─── Agenti Team ─── Lancio ───

Orchestrator principale (Master) coordina i 3 sub-orchestrator:
- Sequenzia agenti per ottimizzare workload
- Prioritizza base su deadline/budget
- Escalates blocchi/rischi al team
- Tracker overall portfolio health
```

---

## 🎯 Conclusione

Questo sistema trasforma una campagna marketing standard da **weeks of coordination** a **8-12 giorni di esecuzione automatica**.

**Key strengths**:
✅ Orchestration automatica (no manual coordination)
✅ Agenti specializzati (expertise focused)
✅ Comunicazione strutturata (via brief, async)
✅ Quality gates (QA checkpoints)
✅ Real-time monitoring (daily data-driven)
✅ Scalable (works for 1 or 10 campaigns)

**Time savings**: 50-70% meno coordinazione manuale rispetto a team tradizionale.

---

**Status**: 🟢 Sistema pronto  
**Ultimi aggiornamenti**: 09/05/2026  
**Versione**: 1.0
