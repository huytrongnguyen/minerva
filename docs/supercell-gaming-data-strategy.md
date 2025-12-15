# Supercell's Gaming Data Strategy: Data-Informed Creativity and Player Longevity

Supercell (Clash of Clans, Brawl Stars, Squad Busters: €1.7B revenue 2023, 200M+ MAU) treats data as **"informant, not dictator"** (CEO Ilkka Paananen). Their platform powers cross-game social (Supercell ID), real-time live ops, and 40M prereg launches. No public taxonomy, but Snowplow schemas enforce events. Scale: 45B events/day (Kinesis legacy), petabytes in Databricks.

Supercell prioritizes a **data-informed** approach, using analytics to enhance live games, player retention, and personalization while trusting developer intuition, passion, and experience over data for prototyping new titles. Data focuses on unifying cross-platform behaviors (web, mobile, in-game) for privacy-compliant insights, enabling AI-driven superpowers like faster iteration and mass personalization without overriding human creativity. As Data Platform Lead Boris Nechaev notes: “We don’t like [full SaaS] for legal reasons... it’s safer when the data is fully in our control.”

## Core Data Strategies and Use Cases

1. **Cross-Platform Player Analytics**  
   Snowplow unifies web/in-game data via identifiers for full journeys; Databricks enables real-time queries. Used for feedback, engagement (e.g., Brawl Stars community), prereg optimization (40M tracked).

2. **Personalization & ML**  
   AI predicts churn/behavior for tailored retention/monetization (LTV max); in-game recs. MLOps for RL; Snowplow fuels Databricks ML.

3. **Supercell ID Social Network**  
   Real-time chat/presence/friends across games; ScyllaDB stores hierarchical events (tens of K subs/sec), CDC broadcasts changes. Serves 100M+ MAU.

4. **Game Balancing & Live Ops**  
   Kinesis streams to EMR/DynamoDB for balancing, events; data "makes games better daily."

5. **UA & Marketing**  
   Real-time campaign ROI; AI for assets/personalization.

6. **AI Innovation (3 Pillars)**  
   - **Superpowers**: Code/art gen, CI/CD.  
   - **Operate Games**: 24/7 support, UA personalization.  
   - **Portfolio**: AI-native games, player creators. Otto Söderlund: "AI boosts creativity."

7. **Trust & Safety**  
   ML for moderation/fair play.

## Teams and Culture

- **Data, Analytics & AI**: Builds Lakehouse platform; roles include Databricks Platform Eng (IaC, 24/7 on-call), Principal LLM Eng, Senior Game Researcher, FinOps Specialist (Helsinki).
- Small, independent game teams empowered by central data (e.g., Supercell ID by 2 engs); cross-functional with analysts/engineers. Culture: Proactive, scalable tooling; AI Lab integrates data/player feedback.

## 1. Telemetry & Event Ingestion (Snowplow + ScyllaDB Core)

Server-authoritative for games + client-side via Snowplow. Unified via **Supercell ID** (hashed customer IDs, cross-game).

| Layer | Tech | Scale/Details |
|-------|------|---------------|
| **Client/Behavioral** | Snowplow CDI (AWS managed) | Websites, in-game web views, client-side game events. Schemas for consistency. Real-time load to Databricks Delta Lake. 100% capture (no sampling). |
| **Server/Game Events** | Legacy Kinesis → ScyllaDB KV | 45B/day (2018 stat). Real-time social: chat/presence/friends (topics sharded, <10ms latency, millions OPS). Protobuf encoding. |
| **ID Backbone** | Supercell ID | Cross-game hashed IDs. Links web → in-game journeys. |

## 2. Architecture (Databricks Lakehouse + AWS Hybrid)

Petabyte-scale, real-time focus. Evolved: server-only → Snowplow client + Databricks unification (2024-25).

```
Clients/Games → Snowplow (client events) + Game Servers → ScyllaDB (social RT)
                     ↓
Databricks Lakehouse (Delta Lake: raw → unified player 360)
                     ↓
ML/Analytics: Churn pred, recs, A/B (Unity Catalog governance)
                     ↓
Activation: Live ops (events/promos), dashboards
Observability: CloudWatch (AWS)
```

| Layer | Tech | Why Supercell Choice |
|-------|------|----------------------|
| **Ingestion** | Snowplow + ScyllaDB Cloud | Snowplow: Privacy-first (1P data, GDPR), 100% integrity peaks. Scylla: RT KV for social (idempotent, sharded topics). |
| **Storage** | Databricks Delta Lake + S3 | Petabytes, RT streaming. Cross-platform join (web+game). |
| **Processing** | Databricks (Spark/Unity) | Player 360, RT insights. Legacy EMR/Hadoop phased out. |
| **Serving/ML** | Databricks ML | Churn pred, personalized recs. A/B for events (Squad Busters: 40M preregs). |
| **Governance** | Snowplow schemas + Databricks Unity Catalog | Access controls, no silos. Proactive vendor support (e.g., launch scaling). |

## 3. Key Metrics & Golden Funnel

**Player 360**: Unified web → in-game journeys (e.g., marketing → Brawl Stars events).
- Retention: Churn ML on behavioral data.
- Live Ops: RT event tuning (dynamic balancing, promos). 2x faster setup.
- KPIs: Engagement (cross-platform), preregs, CSAT (feedback clustering? Implied).

Funnel: Marketing site → prereg → in-game (tracked via IDs). **Enjoyment Metrics**: Data informs, gut decides (CEO: "Data helps, outliers from creativity").

## 4. Governance & Privacy (Table Stakes)

- **PII**: 1P/zero-party only. No 3P CDPs (GDPR). Managed AWS (Supercell owns account).
- **Council Equivalent**: Data Platform Team (petabyte infra, 24/7 on-call).
- **Ethics**: Proactive scaling (Snowplow engineers on-call for launches).

## 5. Roadmap (Evolved 2023-2025)

From blogs/case studies: Legacy (Kinesis/Redshift) → Modern (Snowplow/Databricks/Scylla).

| Phase | Timeline (Inferred) | Key Milestone |
|-------|---------------------|---------------|
| **Legacy** | Pre-2023 | Kinesis 45B/day → EMR → EC2 DW. Server-only. |
| **Unification** | 2023-24 | Supercell ID social RT (ScyllaDB). Snowplow client data. |
| **Lakehouse** | 2025 | Databricks central: RT Delta, ML churn/recs. Squad Busters success (40M preregs). |
| **Maturity** | 2026+ | Petabyte platform (job post). Cross-game AI engagement. |

**Org**: "Cell" model—autonomous game teams own data (embedded analysts?). Central platform team scales infra.

## Artifacts Integrated

- **Databricks Summit Slides/Video**: Unified architecture diagram (Snowplow → Delta Lake).
- **ScyllaDB Blog Diagram**: Topic sharding flow (proxy → router → Scylla → broadcast).
- **Snowplow Case**: Quotes/metrics (100% integrity, 2x faster tracking).
- No taxonomy PDF (proprietary), but Snowplow schemas mirror ours.
