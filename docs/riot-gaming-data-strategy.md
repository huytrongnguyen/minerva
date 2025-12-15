# Riot Games Gaming Data Strategy: Data-Informed, Player-Centric Decision-Making

Riot Games (League of Legends, VALORANT, TFT: $2B+ revenue 2024, 180M+ MAU) builds data as a **"player-first" foundation**—telemetry powers anti-cheat (Vanguard), matchmaking, and live ops (patches/events). Petabyte-scale on AWS/Databricks, with dbt for governance. No full taxonomy public, but events focus on gameplay/behavior (e.g., Swarm minions). Privacy: Strict policy, no raw PII. Scale: 2,000+ databases migrated to RDS; Vanguard processes millions of sessions.

Riot Games emphasizes being **data-informed rather than data-driven**, ensuring data enhances creativity, player joy, and long-term engagement without overriding human judgment or game design vision. This approach prioritizes player experience in areas like matchmaking, personalization, and abuse detection, while supporting ethical use (e.g., detecting chat toxicity in ~2% of games).

## Core Data Strategies and Use Cases

1. **Personalization & Monetization (e.g., "Your Shop" in LoL)**  
   Uses collaborative filtering ML models:  
   - Neighborhood-based (cosine similarity).  
   - Matrix factorization (latent factors like "cute" vs. "dark" skins).  
   - Sparse Linear Models (SLIM) for efficiency.  
   Data: Implicit signals (ownership, playtime, purchases) in sparse utility matrices.  
   Processed on Databricks (~1,000 compute hours per run); balances accuracy, novelty, serendipity. Hybrid content-based models in development.

2. **Game Balancing & Metagame Analysis**  
   Data snapshots inform patches (e.g., LoR 1.14); tracks win rates, play patterns for "fun over fair" adjustments.

3. **Anti-Cheat & Security (Vanguard)**  
   ML on Databricks for cheat detection; arms race with client-side limits. Presented at Data + AI Summit 2025.

4. **Content Pipeline Optimization**  
   "Data debt" cleanup in LoL: Assetization (WAD files + Game Data Server) converted 107 champions/1,240 skins, slashing import times (20-30 min → 3-5 min), enabling hot reloads/shaders for faster iteration/creativity.

5. **Player Experience Monitoring**  
   - Voyager: Search engine for real-time forum/player issues (severity/frequency scoring).  
   - Abuse detection in chat.

6. **Esports & Broadcasting**  
   Exclusive GRID partnership for real-time data distribution; AWS win-probability models trained on live data.

7. **Experimentation & External Tools**  
   Rift Rewind hackathon (2025) with AWS: Build experiences from LoL match data.

## Teams and Culture

- **Insights Tech**: Builds/shares the central data platform.
- **Data Science/Engineering**: ML Bots (AI Foundations), Central Product Insights (pipelines for onboarding, esports), Game Intelligence & Analytics (recommenders, bots).
- **Culture**: Cross-functional (e.g., data + artists); stewardship for governance; internships/mentorship.

## 1. Telemetry & Event Ingestion (Gameplay-Focused, Server-Authoritative)

Events from clients/servers via custom SDKs. Unified via Riot Account (hashed IDs). Focus: Behavior for anti-cheat/matchmaking.

| Layer | Tech/Details | Scale |
|-------|--------------|-------|
| **Client/Gameplay** | Custom SDK (Unity/Unreal for LoL/VAL) | Gameplay telemetry (kills, minion actions in Swarm), crashes, behavior (for Vanguard anti-cheat). Encrypted, consent-gated. |
| **Server/Backend** | AWS Kinesis/S3 ingestion | Millions of matches/day; real-time for live ops (patches). |
| **ID Backbone** | Riot Account ID | Cross-game hashed (privacy policy: no raw PII). Links LoL → VAL. |

## 2. Architecture (Databricks Lakehouse + AWS Hybrid, dbt Governance)

Centralized petabytes of telemetry on Databricks (from bespoke notebooks → dbt/Spark). AWS for infra (RDS migration 2025).

```
Clients (LoL/VAL/TFT) → Custom SDK → AWS Game Servers (RDS + EC2)
                     ↓
Databricks Lakehouse (telemetry raw → dbt models → unified player 360)
                     ↓
ML/Analytics: Anti-cheat (Vanguard ML), matchmaking, live ops
                     ↓
Activation: Patches/events, dashboards (dbt Cloud)
Observability: AWS CloudWatch
```

| Layer | Tech | Why Riot Choice |
|-------|------|-----------------|
| **Ingestion** | AWS Kinesis + Custom SDK | Low-latency for global servers; auto-scaling for peaks (e.g., Worlds events). |
| **Storage** | Databricks Delta Lake + S3/RDS (2K DBs migrated) | Petabytes telemetry; resilient (99.99% uptime post-migration). |
| **Processing** | dbt Cloud + Spark | Modular transformations; 29% compute savings, faster dev cycles. |
| **ML/Serving** | Databricks ML | Anti-cheat (DMA/CV hacks), enjoyment metrics (behavioral). |
| **Governance** | dbt + Data Catalog | Ownership process; lineage/docs for trust. |

## 3. Key Metrics & Golden Funnel

**Player-First Analytics**: Telemetry → "enjoyment" (not just revenue). Vanguard: RT detection.
- Retention: Matchmaking behavior data (toxicity/churn).
- Monet: Live ops (patches, events like Arcane tie-ins).
- Funnel: Launch → match → progression (e.g., Swarm roguelike). **Enjoyment Score**: ML on kills/minions for balancing.

## 4. Governance & Privacy (Enterprise-Wide Ownership)

- **PII**: No collection beyond Riot ID; consent for telemetry (policy 2025 update).
- **Council**: Data governance team (catalog + user ownership process).
- **Ethics**: Anti-cheat ethics (kernel drivers + ML); creator data updates.

## 5. Roadmap (Databricks/dbt Modernization 2024-2025)

From tech blog/AWS: On-prem → AWS → Lakehouse.

| Phase | Timeline | Milestone |
|-------|----------|-----------|
| **Legacy** | Pre-2024 | On-prem MySQL (13 DCs). |
| **Cloud Migration** | 2024 | 2K DBs to RDS; AWS auto-scaling. |
| **Lakehouse** | 2025 | Databricks + dbt (Coalesce/DAIS talks); Vanguard AI anti-cheat. |
| **Maturity** | 2026+ | Enterprise AI platform (roadmap/prioritization). |

**Org**: Insights Tech (data eng/ML); embedded per-game. Interns on telemetry (e.g., Swarm).

## Artifacts Integrated
- **Tech Blog Posts**: Swarm telemetry diagrams; intern projects (VAL capture).
- **Privacy Notice**: Telemetry scope (2025 update).
- **AWS Case Study**: RDS migration charts.
- **Coalesce/DAIS Slides**: dbt architecture (savings metrics).
- **Job Specs**: Enterprise AI roadmap details.
