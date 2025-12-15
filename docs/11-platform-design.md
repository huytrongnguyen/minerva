# Real-Time LTV & Campaign Optimization Platform Design

In an industry where player acquisition costs are skyrocketing (often $5-10+ per install for mobile titles), a unified real-time data platform isn't just a nice-to-have; it's essential for turning raw telemetry into actionable intelligence. This setup can indeed predict lifetime value (LTV) with 80-95% accuracy in mature models, automate UA (user acquisition) and retention campaigns, and drive ROAS uplifts of 20-50% while improving retention by identifying at-risk players early. 

## Core Objectives

- Enabling real-time Lifetime Value (LTV) predictions to inform dynamic decisions across user acquisition (UA), engagement, and monetization, while integrating campaign optimization for measurable ROI
- Building a scalable, resilient system that handles high-velocity game data (e.g., player events, sessions, purchases) with low-latency processing, machine learning (ML) inference, and actionable insights
- Unified architecture to avoid silos between batch and real-time workflows, as traditional setups often lead to delays in syncing historical and live data, which can hinder timely optimizations

## High-Level Architecture Principles

- **Modularity and Scalability**: Use cloud-native services (e.g., AWS, GCP, or Azure) for elasticity, handling spikes in player activity during launches or events. Aim for a lambda architecture variant: a speed layer for real-time, a batch layer for deep historical analysis, and a serving layer for unified queries.
- **Data Governance**: Ensure compliance with privacy regs (e.g., GDPR, CCPA) via anonymization, access controls, and auditing. Player data is sensitive—focus on aggregated insights to minimize risks.
- **Real-Time Focus**: LTV prediction isn't static; it evolves with player behavior. Shift from batch-only (e.g., weekly runs) to streaming inference for intra-day updates, enabling proactive interventions like personalized offers.
- **Integration with Business Logic**: The platform should feed into UA tools (e.g., via APIs to ad platforms like Google Ads or Unity Ads) and game engines for in-app adjustments.
- **Cost Efficiency**: Optimize for query costs in real-time systems; use tiered storage (hot for recent data, cold for archives).

## Key Components and Tech Stack

| Component | Description | Recommended Technologies | Rationale |
|-----------|-------------|---------------------------|-----------|
| **Data Ingestion** | Capture real-time events (e.g., logins, purchases, ad views) and batch imports (e.g., historical logs, UA campaign data). Handle millions of events/sec with schema evolution for game updates. | - Streaming: Apache Kafka or Amazon Kinesis<br>- Batch: AWS Glue or Apache Airflow | Kafka for durable, partitioned streams ensures no data loss; integrates with game SDKs like Unity Analytics. This supports real-time LTV updates by feeding live data into models. |
| **Data Storage** | Hybrid storage for structured (player profiles), semi-structured (events), and unstructured (logs). Enable fast queries for LTV cohorts. | - Data Lake: Amazon S3 or Google Cloud Storage with Apache Iceberg for table formats<br>- Real-Time OLAP: ClickHouse, Apache Pinot, or StarRocks<br>- Warehouse: Snowflake or BigQuery for batch analytics | Iceberg provides ACID transactions and schema flexibility; Pinot for sub-second queries on fresh data, crucial for real-time dashboards. Separate hot/cold tiers to control costs. |
| **Data Processing** | Transform raw data into features (e.g., session counts, spend velocity). Support stream processing for live aggregations and batch for deep ETL. | - Stream: Apache Flink or Spark Streaming<br>- Batch: Apache Spark or AWS Glue | Flink for stateful, low-latency processing (e.g., windowed aggregations over 24-hour player activity). This enables features like early LTV signals from sequential data. |
| **ML for LTV Prediction** | Two-stage model: (1) Classify spenders vs. non-spenders, (2) Regress LTV for spenders. Train on historical data, infer in real-time. Handle skewness with transformations (e.g., Box-Cox). Incorporate sequential models for early predictions (e.g., within first 48 hours). | - Frameworks: LightGBM or AutoGluon for tabular; LSTM/Transformers for sequences<br>- MLOps: Amazon SageMaker, MLflow, or Kubeflow<br>- Inference: SageMaker Endpoints or TensorFlow Serving | LightGBM excels on imbalanced, high-dimensional game data; real-time endpoints allow per-player predictions on event triggers. Retrain models daily/weekly with fresh data to adapt to game meta changes. |
| **Campaign Optimization** | Use LTV predictions to optimize UA bids, A/B tests, and in-game offers. Employ reinforcement learning (e.g., multi-armed bandits) for dynamic ad targeting. Measure ROAS (Return on Ad Spend) in real-time. | - Tools: Google Optimize, Optimizely, or custom RL with TensorFlow<br>- Integration: APIs to UA platforms; feedback loops via Kafka | Bandits adjust campaigns on-the-fly based on predicted LTV vs. acquisition cost, maximizing high-value users. Track metrics like D7 retention and ARPU for closed-loop optimization. |
| **Decision Platform** | Interactive dashboards for strategists to query LTV cohorts, simulate campaigns, and monitor KPIs (e.g., engagement rates, churn risk). | - BI Tools: Tableau, Looker, or Superset<br>- Real-Time Viz: Integrated with Pinot for live updates | Embed ML outputs (e.g., player segments: whales, mid-spenders) with drill-downs. Alerts for anomalies, like dropping LTV in a cohort. |

## Core Components of the Platform

Overall, this platform could transform your studio into a data powerhouse, similar to how top players like Supercell or Zynga use analytics for dominance. It needs to handle massive scale—millions of events per minute from gameplay, in-app purchases, ads, and external sources like app stores or ad networks—while ensuring real-time (sub-second) insights for decisions like personalized offers or bid adjustments.

### Data Ingestion and Unification

- Start with real-time streaming to capture player events (e.g., sessions, purchases, churn signals) across titles. Use tools like Apache Kafka or AWS Kinesis for ingestion, integrated with SDKs from Unity, Unreal, or custom ones.
- Unify data sources: Combine in-game telemetry, CRM (e.g., from Braze or Amplitude), ad platforms (Google Ads, Facebook, ironsource), and external APIs (e.g., for cohort analysis). Aim for a single player profile that merges IDs across devices and games, using something like Segment or Snowplow for ETL (extract, transform, load).
- Why real-time? Batch processing is too slow for live campaigns—e.g., detecting a player's frustration mid-session and triggering a retention boost.

### Storage and Processing

- A data lake/warehouse hybrid: Use Snowflake, BigQuery, or Databricks for scalable storage. These handle petabyte-scale data with SQL/ML integrations.
- For real-time querying, layer on something like Apache Druid or ClickHouse to enable sub-second analytics on streaming data.
- Ensure compliance (GDPR, COPPA) with anonymization and consent tracking built-in.

### Predictive Analytics for LTV and Retention

- LTV prediction: Build ML models using survival analysis (e.g., Kaplan-Meier estimators) or regression (e.g., XGBoost, neural nets) on features like day-1 retention, spend velocity, engagement depth, and demographics. Train on historical data to forecast 30/90/180-day LTV.
  - High accuracy comes from feature engineering: Include behavioral signals (e.g., levels completed, social interactions) and external factors (e.g., ad channel quality).
  - Tools: Integrate with TensorFlow, PyTorch, or managed services like Google Vertex AI or AWS SageMaker. For gaming-specific, platforms like Scoop Analytics use AI to auto-discover patterns and predict churn without heavy coding.
- Retention boosting: Use clustering (e.g., K-means) to segment players (whales, grinders, casuals) and predict churn risk in real-time. Automate interventions like push notifications or in-game rewards via rules engines.

### Campaign Optimization and Automation

- Automate with AI-driven decisioning: For UA, use reinforcement learning to optimize bids across channels, maximizing ROAS by predicting post-install value.
  - Example: A system that adjusts Facebook bids based on real-time LTV forecasts, shutting off underperforming creatives automatically.
- Tools: Madgicx offers an AI-powered engine for this, with a 30-day roadmap to implement automation that scales campaigns while cutting waste. Optimove provides unified profiles and real-time triggers for gamified campaigns, like leaderboards tied to retention.
- Integrate A/B testing frameworks (e.g., Optimizely) to iterate on campaigns, feeding results back into ML models for continuous improvement.

### Dashboards and Decision-Making Layer

- Visualize everything in a central BI tool like Tableau, Looker, or Power BI, with real-time dashboards for ROAS, retention curves, and LTV cohorts.
- Empower non-technical users: Use no-code interfaces for querying (e.g., natural language via ThoughtSpot) so designers or marketers can run "what-if" scenarios without data scientists.

## Implementation Roadmap

- **Phase 1 (1-3 months: Foundation)**: Audit current data silos, pick a core platform (e.g., start with Unity Analytics for ingestion if you're on Unity, or Amplitude for cross-title tracking). Set up real-time pipelines and basic LTV models using off-the-shelf tools like Intelitics for predictive marketing.
- **Phase 2 (3-6 months: Intelligence)**: Train custom ML models on your data. Partner with services like Stepico or 3ALICA for tailored analytics to boost retention and monetization. Test automation on one title.
- **Phase 3 (6+ months: Scale)**: Roll out across all titles, integrate AI for full automation (e.g., ICatalyft for funnel tracking). Measure success via KPIs like 20% ROAS lift, 15% retention increase.
- **Budget/Costs**: Expect $50K-$500K initial setup (tools + engineering), plus ongoing cloud costs. ROI pays off fast—e.g., better LTV prediction can add millions in revenue.

## Potential Challenges and Mitigations

- **Data Quality/Volume**: Games generate noisy data; use anomaly detection to clean it. Start with high-volume titles to train models effectively.
- **Privacy/Ethics**: Avoid over-personalization that feels creepy—focus on aggregate insights.
- **Team Buy-In**: Involve cross-functional teams early; data strategists like you should lead workshops to demo quick wins.
- **Edge Cases**: For hyper-casual vs. AAA titles, customize models—e.g., session-based LTV for casuals.

Your current setup is a strong foundation for building that unified real-time data intelligence platform we discussed—it's already geared toward handling high-velocity game data with streaming, processing, storage, and orchestration. Kafka excels at ingesting real-time events from your SDKs and S2S pushes, MinIO provides cost-effective S3-like storage for raw logs or ML artifacts, Spark handles batch/streaming analytics for things like LTV modeling, Airflow orchestrates ETL/ML pipelines, and Postgres serves as a reliable metadata store or for querying aggregated insights. This stack aligns well with gaming needs, where you might process millions of events daily for player behavior, retention signals, and ad attribution. I'll break down my thoughts on enhancements, SDK additions, S2S expansions, and how to tie it all together for LTV prediction, campaign automation, ROAS maximization, and retention boosts.

## Leveraging Technical Stack for Key Goals

- **Real-Time Ingestion and Unification**: With Kafka already in place, route events from your own SDK (e.g., in-game telemetry like sessions, purchases) and AppsFlyer SDK (attribution data) into topics. This creates a unified stream—e.g., a "player_events" topic merging device IDs, behaviors, and ad sources. For S2S pushes from ad platforms (AppsFlyer, Facebook, etc.), use Kafka Connect to sink them directly, ensuring low-latency unification without silos.
  
- **Processing and Analytics**: Spark is perfect for real-time (via Spark Streaming) or batch jobs on Kafka data. For LTV prediction, run ML pipelines here: Use Spark MLlib for models like XGBoost on features from player cohorts (e.g., day-1 spend, engagement). Store raw data in MinIO for cheap, scalable access, and use Postgres for storing model outputs or user profiles. Airflow can schedule daily retraining or campaign eval jobs, triggering alerts if ROAS dips below a threshold.

- **Automation and Decisioning**: To automate campaigns, build rules in Spark or integrate with Airflow DAGs—for example, real-time scoring of churn risk to trigger personalized offers via S2S to ad platforms. This could boost retention by 10-20% by identifying at-risk players early, based on patterns like session drop-offs.

### SDK Integrations: Adding ThinkingData

Adding ThinkingData SDK makes sense for deeper behavioral analytics—it's gaming-specific, with features like real-time player journey mapping, custom retention defs (beyond D1/D7), and unified ID stitching across devices.

**Pros**: Enhances LTV accuracy by modeling in-game funnels and ad-LTV predictions. It's customizable for genres like hyper-casual or AAA, with no-code queries for quick insights.

**Cons**: Adds another SDK, potentially increasing app size or privacy concerns (though it avoids PII).

**GA vs. ThinkingData vs. In-House Stack**

| Aspect                  | GameAnalytics (2025)                                                                 | ThinkingData (Your Planned)                                                  | Your Stack (Spark + Postgres + AppsFlyer)                                   |
|-------------------------|--------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| **Core Fit for Goals** | Basic retention/funnels/benchmarks; real-time dashboards but no AI LTV/churn preds. | AI-driven LTV/churn from session 1; real-time LiveOps automation. | Custom XGBoost LTV (80%+ accuracy); full control for campaigns.              |
| **Real-Time**          | Live events/dashboards; good for monitoring.                                         | Sub-second player journeys; triggers for retention pushes.                  | Kafka → Spark Streaming: Matches/exceeds.                                   |
| **LTV/Retention**      | Manual calcs (rev/users); custom retention triggers but no ML preds. | Auto 85%+ accuracy; segments whales/at-risk. | Your Phase 2 models: pLTV180 + churn_risk_7d.                                |
| **Campaigns/ROAS**     | MarketIQ for ad creatives/benchmarks (30% monetization lift claims); A/B/remote configs. | UA optimization + real-time bidding via S2S.                                 | Airflow automates audiences to AppsFlyer/FB/etc.                            |
| **Integrations**       | Unity/Unreal SDKs; ad networks; limited S2S/API exports (1MB POST limits). | S2S/Kafka-native; AppsFlyer stitch.                                          | Native: Your taxonomy → S2S everywhere.                                     |
| **Scalability/Custom** | Free to 10M MAU/events?; caps/throttling; iOS/Android silos. | Enterprise (1,500+ studios like FunPlus/SEGA); RPG-custom KPIs. | Unlimited; genre-agnostic player_360 table.                                  |
| **Pricing**            | Free core; Pro $29/mo; Enterprise $499+/mo (10 seats). | Paid but predictable; ROI via 20%+ ROAS.                                     | Cloud costs only (~$50K setup).                                             |
| **Best For**           | Indies budgeting basics/benchmarks (100k studios).                                                     | Mid-large like yours: Automation + growth.                                   | Full ownership.                                                             |

### S2S Pushes: ThinkingData vs. GameAnalytics

Pushing S2S to AppsFlyer/Facebook/Google/TikTok is standard for closed-loop attribution—e.g., sending purchase events back to optimize bids and ROAS. Adding another analytics platform here would enrich insights without heavy lifting, as S2S is server-side and can use existing Airflow jobs to batch/send data.

| Aspect              | ThinkingData                                                                 | GameAnalytics                                                                |
|---------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| **Core Strengths** | Real-time core metrics, player paths, custom SQL queries, LTV/churn prediction with AI-driven modeling. | Pre-built gaming KPIs (DAU, ARPDAU, cohorts), benchmarking against industry averages, ad monetization insights. |
| **Integration Fit** | S2S SDKs (Java/Python/C#) align with your stack; unifies UA/in-game data for full-funnel views. Easy Kafka/Airflow push. | Lightweight SDKs for mobile/Unity; integrates with ad networks. S2S via APIs, good for quick setup with Spark jobs. |
| **Scalability & Customization** | Enterprise-grade, with private/hybrid deployment for data control; highly customizable for complex games (e.g., 4X strategy KPIs). Serves 1,500+ studios like FunPlus/SEGA. | Free tier for indies/small studios; less customizable but plug-and-play for basics. Popular for mobile, with 60,000+ games. |
| **Cost & Use Case** | Paid (flexible pricing); ideal for mid-large studios needing deep, actionable insights and LiveOps integration. | Free core, pro from $299/mo; suits startups or cost-sensitive teams focusing on benchmarks/monetization. |
| **Potential Drawbacks** | Steeper learning curve for advanced features; more oriented to Asia-Pacific markets but global. | Limited for enterprise-scale customization; some data delays (up to 24h). |

### Next Steps and Potential Enhancements

- **Quick Wins**: Integrate ThinkingData SDK/S2S in a pilot title—use Airflow to orchestrate pushes, Spark to blend data for an initial LTV model. Test on a small cohort to measure retention uplift.
- **Gaps to Fill**: For visualization, add something like Superset on Postgres for dashboards. If ML scales, integrate Spark with TensorFlow for advanced predictions.
- **Risks**: Ensure data privacy (GDPR) with anonymization in MinIO/Kafka. Monitor latency—real-time is key, so tune Spark jobs.
- **ROI Outlook**: This could yield 20-30% better ROAS by optimizing S2S feedback loops and 15% retention gains via targeted insights.

## Implementation Roadmap

### Phase 0 – Week 1: Define the 3 North-Star Metrics

Lock these in Tableau (and agree with UA, LiveOps, and monetization leads):
1. Predicted 180-day LTV (pLTV180) – your single source of truth for UA value
2. Predicted 7-day churn risk score (0–100) – for retention automation
3. Dynamic ROAS D30 (blended from AppsFlyer + in-game revenue S2S)

### Phase 1 – Weeks 2-4: Build the Unified Player 360 Table (the heart of the platform)

Create one single denormalized table in Postgres (or Spark → Postgres) that refreshes every 15–60 min and contains one row per player with ~80 columns:

| Category                  | Example columns (sample)                                                                 |
|---------------------------|------------------------------------------------------------------------------------------|
| Identity & Attribution   | user_id, appsflyer_id, install_date, channel, campaign, adset, creative, country         |
| Predicted values          | pLTV180, pLTV30, churn_risk_7d, player_segment (whale / dolphin / minnow / at-risk)      |
| Behavioral (last 24h-7d)  | sessions, playtime_min, levels_completed, quests_done, gacha_pulls, boss_kills          |
| Monet (cumulative + recent)| total_revenue, revenue_d0-d1-d3-d7-d14, last_purchase_ts, days_since_last_purchase       |
| Progression & funnels     | current_main_story_chapter, %_to_next_chapter, arena_rank, guild_join_date               |
| LiveOps exposure          | events_attended_last_7d, offers_shown, offers_converted                                   |

How to build:
- Kafka → Spark Structured Streaming jobs (or batch every 15 min) → write to MinIO as Parquet + materialized view in Postgres
- Airflow DAG runs every hour: 1) aggregate new events 2) run the latest LTV/churn model 3) overwrite the player_360 table
- Tableau connects live to this Postgres table → all dashboards update in <1 hour (you’ll make it real-time later)

### Phase 2 – Weeks 3-6: Ship the first usable LTV & churn models (80% accuracy is enough to start)

1. LTV model (quick & dirty → improves every week)
  - Target: real revenue D0–D30 observed so far
  - Features: install channel, country, D0–D3 revenue, D1 retention, sessions D0–D7, levels reached D7, first gacha time, etc.
  - Model: Spark ML → XGBoost regressor (or even a simple linear model first week)
  - Back-test on the last 6 months → you’ll hit ~0.82–0.87 R² quickly for an RPG
  - Output → pLTV180 = predicted D0–D180 revenue

2. Churn-risk model
  - Binary classification: did the player return D+7 after last login?
  - Features: playtime drop last 3 days, quest stagnation, days since last login, etc.
  - Same XGBoost → output churn_risk_7d score 0–100

### Phase 3 – Weeks 4-8: Close the loop – automate UA & retention with the predictions

A. UA / ROAS automation (immediate 15-30% ROAS lift)
  - Export pLTV180 hourly from Postgres → CSV → AppsFlyer Audience → create “High LTV” audience
  - In every ad account (Facebook, Google, TikTok), create look-alike audiences from your “High LTV” users
  - Set value-based bidding rules: bid = pLTV180 × target ROAS (e.g., 1.2×)
  - Bonus: create “Low LTV / High churn” suppression audiences to stop wasting money

B. Retention automation (10-25% D7 lift)
  - In Tableau → create calculated field: IF churn_risk_7d > 75 AND revenue_d0<5 THEN “Re-engage”
  - Export that list hourly → Braze / OneSignal / your own push system → send targeted bonus (gems, stamina, hero summon ticket)
  - Week 6: add in-game pop-up via your SDK when a high-risk player logs in

### Phase 4 – Weeks 6-10: Decide on ThinkingData (or stay self-built)

Keep the current Spark/Postgres pipeline as the source of truth, but add ThinkingData as the “fast insights & visualization” layer on top. 

- Push the exact same events via S2S to ThinkingData (takes <1 day to set up)
- Compare their out-of-the-box LTV accuracy, churn prediction, and segmentation speed against your Spark models

Decision matrix (for an RPG studio planning multiple genres):

| Criteria                     | Keep building in-house (Spark + Postgres) | Switch core analytics to ThinkingData |
|------------------------------|-------------------------------------------|---------------------------------------|
| Need deepest RPG custom KPIs | ★★★★★ (you own everything)               | ★★★★ (very customizable but still a platform) |
| Speed to insights            | ★★★ (you have to build dashboards)       | ★★★★★ (drag-and-drop + gaming templates) |
| Future genre expansion      | ★★★★ (you reuse the same pipeline)       | ★★★★★ (they already support 20+ genres) |
| Team bandwidth               | ★★ (requires data engineers)             | ★★★★ (less engineering time) |
| Cost (next 12–18 months)     | Lower if you already pay cloud bills     | Higher but predictable               |

### Deliverables Checklist

- Week 1 – North-star metrics agreed + Tableau dashboard skeletons  
- Week 2-4 – player_360 table live in Postgres + hourly refresh  
- Week 3-5 – First LTV & churn models scoring every player  
- Week 5-7 – High-LTV audiences live in all ad accounts + value bidding on  
- Week 6-8 – Automated re-engagement campaigns for high churn-risk players  
- Week 7-9 – ThinkingData proof-of-concept (ingest + compare predictions)  
- Week 10-12 – Decision: stay self-built or migrate dashboards to ThinkingData

**Yes — 100%. Do it now, before you go one step further.**

If you don’t lock a **single, unified event taxonomy + payload standard** today, you will waste 30-50% of your data team’s time over the next 12–24 months on mapping hell, broken LTV models, mismatched ROAS calculations, and constant “why does AppsFlyer show different revenue from ThinkingData?” fights.

In practice, studios that skip this step end up with 4–6 different versions of the same event (purchase, level_up, mission_complete…) and can never trust a cross-platform dashboard. Studios that enforce one taxonomy from day one (Supercell, Playrix, Moonton, FunPlus, etc.) get accurate LTV predictions 2-3× faster and 20-40% higher ROAS.

## Unified Event Taxonomy & Payload Standard

### Core Universal Events (mandatory for every title)

| Event Name            | When it fires                          | Required Properties (always present)                              | Optional / RPG-specific (examples)                     |
|-----------------------|----------------------------------------|------------------------------------------------------------------|-------------------------------------------------------|
| game_start            | App foreground OR new session          | user_id, session_id, timestamp, platform, app_version          | is_returning_player, days_since_install               |
| install               | First ever game_start (deduped)        | user_id, install_timestamp, campaign, channel, adset, creative  | organic/paid flag                                     |
| purchase              | IAP completed                          | user_id, transaction_id, revenue_usd, currency, item_name, item_type | bundle_name, is_first_purchase                        |
| ad_revenue            | Rewarded / interstitial / banner shown | user_id, ad_network, revenue_usd, placement                     | ad_type, mediation_waterfall_position                 |
| level_complete        | Player finishes a main-story level     | user_id, level_id, level_number, time_spent_sec                 | difficulty, attempts_count                            |
| progression_milestone | Key story/character/power milestone    | user_id, milestone_id, milestone_name                           | chapter_id, hero_power                                |
| mission_start / complete | Daily/weekly/event mission           | user_id, mission_id, mission_type                               | rewards_claimed                                       |
| resource_spent        | Gold, gems, stamina, etc. spent        | user_id, resource_type, amount, reason                          | sink (shop, upgrade, revive…)                         |
| resource_earned       | Any resource gained                    | user_id, resource_type, amount, source                          | source (quest, login_bonus, gacha…)                   |
| gacha_pull            | Single or 10× summon                           | user_id, gacha_type, cost, items_received[]                     | rarity_distribution                                   |
| churn_risk_signal     | Internal heuristic (optional at first) | user_id, signal_type (stuck_3days, playtime_drop_80%…)          |                                                       |

→ Every future genre (match-3, idle, strategy, shooter…) can be covered by just adding 5-10 new optional events. The core 12 above stay identical.

### Enforce the standard at three layers

| Layer                  | How you enforce it                                                                 | Tool in your stack                     |
|------------------------|------------------------------------------------------------------------------------|----------------------------------------|
| Client (SDK)           | Your internal SDK only exposes functions that output the exact schema               | Unity/Unreal wrapper + schema validation |
| Ingestion gateway      | Lightweight Kafka proxy (or Connect transformer) that validates + normalizes every event before it hits Kafka | Kafka + Schema Registry (Avro) + ksqlDB or custom validator |
| S2S outbound           | All S2S pushes (AppsFlyer, Facebook CAPI, Google, TikTok, ThinkingData, GA) are generated from the canonical event, never from raw client logs | Airflow PythonOperator + mapping layer |

### Mapping table for every external partner

| Canonical Event     | AppsFlyer Event Name | AppsFlyer Parameters Mapping                               | Facebook CAPI | Google | TikTok | ThinkingData | GameAnalytics |
|---------------------|----------------------|------------------------------------------------------------|---------------|--------|--------|--------------|---------------|
| purchase            | af_purchase          | revenue → revenue, currency → currency, item_name → af_content_id | Purchase      | purchase | InAppPurchase | purchase     | iap           |
| level_complete      | af_level_achieved    | level_number → af_level                                    | LevelAchieved | level_up | LevelUp      | level_up     | design        |
| ad_revenue          | af_ad_revenue        | revenue → af_revenue, ad_network → ad_source               | –             | ad_revenue | –      | ad_revenue   | ad            |
