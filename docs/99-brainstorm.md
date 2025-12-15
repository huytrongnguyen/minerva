### What is a Data Strategy in game development?

A Data Strategy is the end-to-end plan that defines:
1. What we measure (and why)
2. How we collect, store, and process data at scale
3. How we turn raw data into actionable insights or automated systems
4. How we govern data (privacy, compliance, ethics, security)
5. How data products (dashboards, ML models, recommendation systems, anti-cheat, etc.) are prioritized, built, and maintained

It’s NOT just “put analytics in the game.” It’s the deliberate alignment of data capabilities with the studio’s business and creative goals.

### Core values

1. Revenue optimization & ROI
   - Identify the exact features/monetization mechanics that drive LTV versus those that cause churn
   - Run hundreds of A/B tests per year with proper statistical rigor → often 5-30% uplift in ARPDAU or conversion rates
   - Build or oversee personalization / recommendation systems (store offers, content, difficulty) that can add millions in incremental revenue

2. Player retention & satisfaction
   - Early warning systems for churn (e.g., players who stopped progressing + dropped session length)
   - Segmentation that reveals which players hate a new feature versus which love it → prevents “one size fits all” disasters
   - Balance tuning using behavioral data (economy, matchmaking fairness, progression pacing)

3. Development efficiency & risk reduction
   - Prioritize roadmap items by actual player value instead of HiPPO (Highest Paid Person’s Opinion)
   - Soft-launch analytics frameworks that kill bad games early or double down on winners (saves tens of millions in some cases)
   - Reduce time spent debugging “feel” issues (e.g., “this boss feels too hard” → show exact attempt distribution and rage-quit spikes)

4. Faster iteration cycles
   - Live-ops calendar optimization: know which event types, themes, and reward structures perform best for each segment
   - Automated reporting that product managers, designers, and executives actually trust and use daily

5. Anti-fraud & platform compliance
   - Detect payment fraud, botting, account sharing, leaderboard manipulation
   - GDPR/CCPA/California deletion pipelines, minors protection, loot box probability disclosure, etc.

6. Long-term studio capability
   - Build a “data flywheel”: the more we use data, the better our predictions and automation become, the more revenue we make, the more we can invest in data → competitive moat
   - Create reusable data assets (player lifetime value models, cohort libraries, attribution solutions) that work across multiple titles

### Stakeholders

| Stakeholder | What they care about most | Concrete value I deliver to them |
|-------------|---------------------------|----------------------------------|
| CEO / Studio Head | Long-term profitability, hit revenue targets, avoid catastrophic launches | Clear monthly/quarterly readouts that show exactly how much additional revenue or saved cost came from data-driven decisions<br>Kill/pivot decisions on new titles backed by LTV & retention forecasts (saved $20M–$150M on failed projects)<br>Confidence that every major decision (roadmap, UA budget, monetization) is backed by evidence, not gut feel |
| Chief Financial Officer (CFO) | Predictable revenueily revenue, ROI on UA spend, fraud prevention | 180–365-day LTV prediction models accurate to ±10% → reliable financial forecasting<br>ROAS-based UA allocation models → 20-50% better blended ROAS<br>Fraud & bot detection systems that protect/save 3-8% of gross revenue annually |
| Chief Product Officer (CPO) / Game Director | Player retention, “fun”, successful feature launches, long-term engagement | Retention & churn prediction models that flag bad updates within 24-48h<br>Feature usage funnels + segmentation → know exactly which players love/hate a new system<br>Progression & economy balance KPIs (grind index, rage-quit rate, win-rate fairness) |
| VP of Marketing / User Acquisition Lead | Lowest possible CPI with highest possible LTV, creative performance | Attribution + MMP + SKAdNetwork models that are trusted by the UA team<br>Creative performance dashboards (ROAS by creative cluster, country, platform)<br>Lookalike audience seeds built from high-LTV behavioral segments |
| Live Ops Director / Lead Producer | Best possible event calendar, maximum revenue from events & seasons | Event performance database + recommendation engine → +30-100% revenue vs gut-feel events<br>“Next best event/offer” suggestions per player segment in real time<br>Post-event automated reports delivered <4h after event ends |
| Monetization Director | Higher conversion, higher whale spend, lower paywall friction | Personalized store offers & dynamic bundles based on predicted willingness-to-pay<br>Paywall A/B testing framework (hundreds of tests per year) → 10-30% conversion uplift<br>Whale journey analysis & dedicated VIP retention programs |
| Lead Game Designers / Economy Designers | Proof that the game “feels” fair and fun | Hard data on difficulty curves, grind perception, matchmaking fairness, rage-quit triggers<br>Economy simulation sandbox so designers can test balance changes before shipping<br>Player sentiment + behavioral clustering (e.g. “grinders” vs “socials” vs “competitives”) |
| Engineering Director / CTO | Scalable, maintainable data infrastructure; no production outages | Data platform roadmap that supports 10× growth in events/users without heroics<br>Self-service analytics tools so engineers aren’t constantly writing ad-hoc queries<br>Observability & alerting on data quality breaks |
| Data Team (Analysts, Scientists, Engineers reporting to me) | Clear priorities, career growth, impact visibility | Quarterly “Data–Business Alignment Map” so everyone sees how their work moves revenue/retention<br>Career paths, training budget, and high-visibility presentations to execs<br>Tools and processes that remove toil (automated testing, dbt, observability) |
| Legal / Compliance / Player Trust teams | Zero regulatory risk (GDPR, CCPA, COPPA, loot-box laws, minors protection) | Automated consent + deletion pipelines, minors flagging, probability disclosure reports<br>Regular compliance audits of all player-facing data usage<br>Single source of truth for “what data did we collect and why” |

The proposed realtime intelligence analytics system aligns well with your goals as a data strategist in a game studio. Tracking user behavior in realtime enables granular insights into engagement patterns, churn risks, and monetization triggers, while predicting lifetime value (LTV) allows for dynamic campaign adjustments—such as bidding strategies or audience segmentation—to lower customer acquisition costs (CAC) and boost ROAS. Your technical stack (MinIO, Spark, Kafka, Airflow, Postgres) is solid for handling high-velocity gaming data: Kafka excels at ingesting streaming events from sources like AppsFlyer (for attribution and marketing metrics) and ThinkingData (for in-game behavioral telemetry), Spark processes them scalably, MinIO stores raw and transformed data cost-effectively, Airflow orchestrates pipelines reliably, and Postgres serves as an efficient mart for query-optimized dashboards and ML inference.

That said, the stack could be enhanced for realtime LTV prediction and campaign optimization without overcomplicating things. Here's my thinking and recommendations:

### Strengths of Your Stack and Approach

- **Realtime Capabilities**: Kafka + Spark Streaming can process events in near-realtime (sub-second to minutes), ideal for behavioral tracking (e.g., session length, in-app purchases). Integrate AppsFlyer S2S (server-to-server) events and ThinkingData's SDK exports directly into Kafka topics for unified ingestion.
- **Scalability**: Spark handles large-scale feature engineering for LTV models (e.g., aggregating user cohorts by acquisition channel), while MinIO's S3-compatible storage supports petabyte-scale lakes without vendor lock-in.
- **Orchestration and Serving**: Airflow can schedule batch jobs for historical LTV training and trigger realtime inferences. Postgres works well for materialized views of key metrics like daily active users (DAU) or ROAS by campaign.
- **Integrations**: AppsFlyer provides attribution data (e.g., install sources, cost per install), and ThinkingData offers deep behavioral events (e.g., level progression, ad views). Combining them creates a 360-degree user view, essential for accurate LTV (e.g., using survival analysis or regression models).

### Potential Gaps and Recommendations

- **ML Integration**: For LTV prediction, add a lightweight ML framework like MLflow (runs on Spark) or integrate with Databricks (if scaling up) for model training on Spark. Use features like recency-frequency-monetary (RFM) scores from behavioral data, blended with AppsFlyer attribution. Recommend starting with simple models (e.g., linear regression on historical cohorts) before advancing to XGBoost or neural nets for realtime scoring via Spark Structured Streaming.
- **Realtime Querying**: Postgres is fine for marts but may bottleneck under high concurrency for dashboards. Consider adding ClickHouse or Druid as a realtime OLAP layer on top of Kafka for sub-second queries on streaming data.
- **Feature Store**: To avoid recomputing features across pipelines, implement a feature store using Feast or a custom Spark-based one stored in MinIO. This ensures consistent inputs for LTV models and campaign optimizers.
- **Monitoring and Alerting**: Add Prometheus + Grafana for stack monitoring, and integrate anomaly detection (e.g., via Spark ML) to alert on ROAS drops or unusual behaviors.
- **Security and Governance**: Use Apache Ranger or similar for access controls on MinIO/Kafka. Ensure GDPR compliance for user data from AppsFlyer/ThinkingData.
- **Optimization Tips**: 
  - Partition data in MinIO by date/app_id/channel for efficient Spark queries.
  - Use Airflow's dynamic tasks for parallel processing of multiple games or campaigns.
  - For ROAS maximization, build a feedback loop: Predict LTV in realtime, feed into AppsFlyer APIs for bid adjustments, and track uplift via A/B tests orchestrated in Airflow.
- **Cost Considerations**: This stack is on-premises friendly but monitor Spark cluster costs; autoscaling with Kubernetes could help.

Overall, this is feasible within 3-6 months with a small team (2-3 data engineers, 1 ML specialist). Start with a proof-of-concept on one game to validate ROAS improvements (aim for 20-30% uplift based on industry benchmarks).

### Stages for Product Development Following the Aha! Framework

The Aha! framework structures product development around strategic alignment, emphasizing ideas, features, and roadmaps to deliver value iteratively. It breaks down into stages that map initiatives (high-level goals) to epics (major themes), features (deliverable capabilities), and requirements (detailed tasks). Below, I've adapted it to your realtime analytics system, assuming a 6-9 month timeline with Agile sprints. Each stage includes key deliverables, responsible roles, and ties to your stack.

1. **Ideation and Strategy (1-2 weeks)**  
   - **Focus**: Define the vision, audience (e.g., marketing team, execs), and hypotheses (e.g., "Realtime LTV will reduce CAC by 15%"). Gather requirements via stakeholder interviews.  
   - **Key Activities**: Brainstorm user stories, prioritize based on impact (ROAS uplift) vs. effort. Use Aha!'s idea portal if available, or Jira/Notion for capture.  
   - **Deliverables**: Product brief, hypothesis canvas (e.g., "If we track behaviors in realtime, then marketers can optimize campaigns, resulting in higher ROAS").  
   - **Roles**: Data Strategist (lead), Marketing/Exec stakeholders.  
   - **Stack Tie-in**: Review existing AppsFlyer/ThinkingData data samples in MinIO to validate feasibility.

2. **Planning and Prioritization (2-4 weeks)**  
   - **Focus**: Break into initiatives (e.g., "Build Realtime LTV System") and epics (e.g., "User Behavior Tracking", "LTV Prediction", "Campaign Optimization"). Score features using Aha!'s WSJF (Weighted Shortest Job First) for ROI.  
   - **Key Activities**: Create roadmap with timelines, risks (e.g., data latency), and dependencies (e.g., Kafka setup before Spark processing).  
   - **Deliverables**: Prioritized backlog, high-level architecture diagram (e.g., data flow from Kafka to Postgres).  
   - **Roles**: Data Strategist, Data Engineers, ML Engineers.  
   - **Stack Tie-in**: Prototype simple Kafka topics for AppsFlyer events to estimate volumes.

3. **Design and Definition (4-6 weeks)**  
   - **Focus**: Detail features (e.g., "Realtime Dashboard for Behavior Metrics") and requirements (e.g., "Ingest ThinkingData events via Kafka with <100ms latency"). Design data models and ML pipelines.  
   - **Key Activities**: Wireframe dashboards, define schemas (e.g., user events in MinIO Parquet), and hypothesize tests (e.g., A/B on LTV-based bidding).  
   - **Deliverables**: Feature specs, ER diagrams, mock ML models (e.g., LTV formula in Spark SQL).  
   - **Roles**: Data Engineers (design pipelines), Analysts (define metrics like ROAS).  
   - **Stack Tie-in**: Use Spark for exploratory data analysis on sample data in MinIO.

4. **Development and Iteration (8-12 weeks)**  
   - **Focus**: Build in sprints, starting with MVPs (e.g., basic behavior tracking before full LTV). Implement epics iteratively with feedback loops.  
   - **Key Activities**: Code pipelines in Airflow/Spark, integrate AppsFlyer/ThinkingData, train LTV models, and test end-to-end (e.g., simulate campaigns).  
   - **Deliverables**: Working prototypes, code repos, initial dashboards in Postgres-fed tools (e.g., Metabase).  
   - **Roles**: Data/ML Engineers (build), QA (test latency/accuracy).  
   - **Stack Tie-in**: Orchestrate Kafka-to-Spark streaming jobs in Airflow; store features in MinIO.

5. **Launch and Validation (4-6 weeks)**  
   - **Focus**: Release features, measure against hypotheses (e.g., track ROAS pre/post-launch). Gather user feedback for refinements.  
   - **Key Activities**: Deploy to production, monitor with alerts, and run experiments (e.g., campaign A/B tests).  
   - **Deliverables**: Launch report, validated metrics (e.g., LTV accuracy >85%), optimization playbook.  
   - **Roles**: All teams, with Data Strategist overseeing metrics.  
   - **Stack Tie-in**: Use Postgres for serving realtime queries; iterate based on Spark-processed insights.

6. **Optimization and Scaling (Ongoing, post-launch)**  
   - **Focus**: Enhance based on data (e.g., add advanced ML if ROAS targets unmet), scale to more games, and retire outdated features.  
   - **Key Activities**: Analyze usage, prioritize enhancements via Aha! scoring, and automate more (e.g., Airflow for dynamic campaigns).  
   - **Deliverables**: Performance reports, scaled architecture (e.g., multi-tenant MinIO buckets).  
   - **Roles**: Data Strategist (strategy), Engineers (maintenance).  
   - **Stack Tie-in**: Leverage Kafka partitioning for growth; retrain models periodically via Airflow.

### 1. High-Level Vision

Goal: Turn raw event streams into sub-5-minute LTV predictions and automatically adjust campaign budgets/bids in AppsFlyer (or ad networks) to hit ROAS targets.

Business impact:
- Typical uplift: 25–40% ROAS improvement in the first 6 months (seen at multiple mid-size studios)
- Payback period: 2–4 months
- Reduces dependency on black-box attribution from AppsFlyer alone

### 2. Recommended Real-Time Architecture (2025–2026 version)

| Layer               | Tool (you already have)       | Role & Real-Time Additions                                                                 |
|---------------------|-------------------------------|--------------------------------------------------------------------------------------------|
| Telemetry           | ThinkingData SDK + AppsFlyer  | Send ALL events to Kafka (not just to ThinkingData) + EternalPlayerID as key               |
| Streaming Ingestion | Kafka + Kafka Connect         | Raw events → MinIO landing (JSON) + direct to Kafka topics (user_events_raw)              |
| Stream Processing   | Spark Structured Streaming   | 5-minute micro-batch enrichment, sessionization, feature engineering                      |
| Feature Store       | Delta Lake (Iceberg) on MinIO | Online features in Postgres (via materialized views) + offline in Iceberg                  |
| Real-Time LTV Model | Spark ML → exported PMML / ONNX → served via Spark Streaming or lightweight Flask API   | Predict LTV at day 0, 1, 3, 7, 14, 30                                                       |
| Serving Layer       | Postgres + Redis (optional)   | Latest LTV + behavioral segments for BI and campaign tools                                |
| Orchestration       | Airflow                       | Daily retraining + backfills + campaign adjustment jobs                                   |
| Visualization       | Tableau                       | Real-time dashboards + predicted LTV funnels + ROAS simulator                             |
| Closed Loop         | AppsFlyer Raw Data API + S2S | Push predicted LTV & segments back as custom audiences or value-based bid adjustments     |

### 3. Product Development Roadmap Using Aha! Framework

#### Product Name (Aha! → Product)

“Phoenix” – Real-Time LTV Intelligence Engine

#### Product Line (Aha! → Product Line)

Game Analytics Suite (you probably already have this)

#### Goals (Aha! → Goals – 12 months)

- Q1–Q2 2026 → Achieve 30% ROAS uplift on UA spend (> $500k/month)
- Q3 2026 → Reduce effective CPI by 25% while maintaining volume
- Q4 2026 → Fully automated value-based bidding (zero manual campaign optimization)

#### Initiatives (Aha! → Initiatives – big efforts)

1. Real-Time Event Pipeline & Player 360
2. Predictive LTV Modeling Suite
3. Closed-Loop Campaign Optimization
4. Self-Serve LTV Intelligence in Tableau

#### Epics & Features (detailed below)

**Initiative 1 – Real-Time Event Pipeline & Player 360 (Month 1-3)**
- Epic 1.1: Kafka-first event ingestion
  - Mirror all ThinkingData & AppsFlyer events to Kafka
  - Build unified user_events_raw topic with EternalPlayerID
- Epic 1.2: Spark Streaming enrichment pipeline
  - Sessionization, geo enrichment, device fingerprinting
  - Output → Iceberg bronze → silver tables in MinIO
- Epic 1.3: Real-time Player 360 table in Postgres
  - Current segment, predicted LTV band, cohort, last seen, revenue to date

**Initiative 2 – Predictive LTV Modeling Suite (Month 2-5)**
- Epic 2.1: Day-0 to Day-30 LTV prediction models
  - Features: first 30 min behavior, install source, geo, device, early progression
  - Model choices: XGBoost → ONNX (fastest inference in Spark)
  - Target: MAE < 15% on Day-7 actual revenue
- Epic 2.2: Daily model retraining pipeline (Airflow + Spark)
- Epic 2.3: Model monitoring dashboard (drift, accuracy decay)

**Initiative 3 – Closed-Loop Campaign Optimization (Month 4-7)**
- Epic 3.1: Predicted LTV → AppsFlyer custom audiences (daily sync)
- Epic 3.2: ROAS simulation & budget recommendation engine
  - “If we cut spend on predicted LTV < $2 users by 50% → +28% ROAS”
- Epic 3.3: Automated campaign adjustment API
  - Option A: AppsFlyer “Value Optimization” rules using predicted LTV
  - Option B: Direct Google/Facebook/TikTok bid adjustments via their APIs (more powerful)

**Initiative 4 – Self-Serve Intelligence (Month 3-6)**
- Epic 4.1: Real-time Tableau dashboards
  - Predicted vs actual LTV funnels
  - ROAS by predicted segment & campaign
  - Live cohort performance
- Epic 4.2: “What-if” ROAS calculator for UA team

#### Releases (Aha! → Releases)

- Release 0.1 (Month 2): Real-time pipeline + basic LTV prediction (historical only)
- Release 1.0 (Month 5): Live predicted LTV in Tableau + manual audience export
- Release 2.0 (Month 7): Fully automated closed-loop optimization

### 4. Critical Success Factors & My Strong Recommendations

1. EternalPlayerID is your golden key – make sure ThinkingData SDK sends it everywhere and you reconcile with AppsFlyer’s IDFA/GAID when available.
2. Do NOT wait for perfect data quality – start with 80% coverage and iterate.
3. First model should be Day-7 LTV using first 30-minute behavior – highest ROI.
4. Use Iceberg time-travel + Spark Streaming checkpointing – you will thank me when you need to reprocess 3 days of bad data.
5. Budget first 3 months: 1 senior data engineer (Spark/Kafka) + 1 data scientist (you or hire) + 0.5 BI engineer for Tableau.

| Component       | Your Current Stack              | Why it’s great for gaming analytics                              |
|-------|---------------------------------|-------------------------------------------------------------------|
| Storage      | MinIO                           | Cheap, S3-compatible, perfect for raw events + parquet partitions |
| Streaming    | Kafka                           | Battle-tested for billions of game events/day                     |
| Processing   | Spark (Structured Streaming?)   | Exactly what top studios (Supercell, Zynga, EA, Tencent) use      |
| Orchestration| Airflow                         | Reliable DAGs for daily LTV model retraining, cohort cuts, etc.  |
| Data Mart    | PostgreSQL                      | Fast analytical queries on user-level aggregates                  |
| Visualization| Tableau                         | Great for marketing + UA teams                                    |
| Attribution  | AppsFlyer                       | Industry standard for mobile UA + cohort data                     |
| Game Analytics| ThinkingData (or ThinkingEngine) | Good in-session event tracking (especially strong in China)      |

### Real-Time Intelligence Architecture

```
Raw events
│
├─→ AppsFlyer (postbacks + raw data) ─────────────────────┐
├─→ ThinkingData SDK events ─────────────────────────────┤
├─→ In-game custom events (Kafka direct or via SDK) ─────┤
                                                         ▼
                                                 Kafka (raw topics)
                                                         │
                             ┌──────────────────────────────────────────────────┐
                             │                                                  ▼
                 ┌─────────────────────┐                ┌──────────────────────┐
                 │   Spark Structured   │                │   Spark Batch/Daily  │
                 │     Streaming        │                │   (LTV model train)  │
                 └─────────────────────┘                └──────────────────────┘
                             │                                      │
                             ▼                                      ▼
                 ┌─────────────────────┐                  ┌─────────────────────┐
                 │   Streaming Features  │                  │  Batch Features +   │
                 │   + Micro-models     │◄──────┬──────────│  Historical Labels │
                 └─────────────────────┘        │          └─────────────────────┘
                             │                  │                    │
                             ▼                  │                    ▼
                 ┌─────────────────────┐        │         ┌─────────────────────┐
                 │  Redis / Aerospike   │◄───────┘         │  Feature Store      │
                 │  (real-time feats)   │                  │  (Feast / MinIO +   │
                 └─────────────────────┘                  │   PostgreSQL)       │
                             │                            └─────────────────────┘
                             ▼                                          │
                 ┌─────────────────────┐                                   │
                 │   Model Server       │◄──────────────────────────────────┘
                 │ (Triton / BentoML /  │
                 │  FastAPI + ONNX)     │
                 └─────────────────────┘
                             │
             Real-time LTV score (per user, updated every 5–15 min)
                             │
        ┌─────────────────────────────────────────────────────────────┐
        │                                                             ▼
┌──────▼───────┐                                         ┌────────────────────┐
│   Airflow    │                                         │   AppsFlyer /      │
│   DAGs       │                                         │   Meta / Google    │
│ (daily retrain│                                         │   / TikTok API     │
│  + uploads)  │                                         │   bid modifiers    │
└──────▲───────┘                                         └────────────────────┘
       │
       ▼
┌─────────────────┐      ┌────────────────────┐
│  LTV Model      │      │  Campaign Optimizer│
│ (LightGBM/XGBoost│      │  (custom or        │
│   or CatBoost)  │      │   Segwise/Molasses)│
└─────────────────┘      └────────────────────┘
```

| Area                        | Recommendation                                                                                 | Why it matters for ROAS |
|-----------------------------|----------------------------------------------------------------------------------------|-------------------------|
| Real-time feature store     | Feast (open-source) on top of Redis + MinIO + PostgreSQL or BytePlus ByteHouse feature store | Sub-second feature lookup for real-time LTV scoring |
| Real-time LTV inference     | Deploy model with BentoML or KServe/Triton. Return predicted 7/30/90/180-day LTV         | Allows value-based bidding in AppsFlyer/Google/Meta |
| Look-alike + value segments | Daily Spark job → upload high-LTV segments to Meta Custom Audiences / Google Customer Match | 2–5× better ROAS on prospecting |
| Incremental LTV modeling    | Use causal inference (DoubleML, Meta’s CausalLift) to isolate paid vs organic LTV       | Know true marginal ROAS, not just blended |
| Bid automation              | Custom script (Python) that pulls predicted LTV from model server and pushes bid multipliers via AppsFlyer Raw Data API or Meta Marketing API | Fully automated value-based bidding |
| Experimentation layer       | Add Eppo or GrowthBook on top of your events for faster UA test analysis            | Reduce time from test → decision from weeks to days |
| Retention prediction        | Separate short-term (D1/D7 retention) model — often more actionable than pure revenue LTV | Optimize for quality, not just volume |

```
AppsFlyer → Kafka topic (raw attribution + postbacks)
ThinkingData → Kafka topic (in-game events)
                ↓
         Kafka Connect (or custom producers)
                ↓
Raw events → MinIO (parquet + partitioned by date/hour)
                ↓
      Spark Structured Streaming
      ↙                  ↘
Real-time features      Daily batch features + model retraining
(LTV predictions,      (full history reprocessing, look-ahead bias safe)
churn risk, next-day   ↘
spend probability) →   Feature store (online: Redis / offline: Delta on MinIO)
                ↓
   PostgreSQL (aggregated KPIs) + Redis (real-time predictions)
                ↓
   Tableau (marketing dashboards) + Custom bidding API
```

### Key Additions

1. **Feature Store** (critical for LTV)
   - Offline store: Delta Lake on MinIO (use Spark)
   - Online store: Redis (or Dragonfly / KeyDB for cost saving) or HBase/Rockset if you go bigger
   - Why? You need point-in-time correct features for training and low-latency lookup for real-time bidding or campaign optimization.

2. **Real-Time Prediction Serving Layer**
   - Spark Streaming → writes 1-minute or 5-minute LTV/churn predictions per user into Redis
   - Build a small FastAPI/Go service that AppsFlyer postbacks or your UA platforms (Google, Meta, TikTok, ironSource) call to get predicted LTV before installing

3. **Model Choices for LTV**
   - Short-term (7-day) LTV → XGBoost / LightGBM on 30–50 behavioral features (very accurate)
   - Long-term (180–360 day) LTV → Survival models (Lifelines + neural nets) or buy-until-you-die (BG/NBD + Gamma-Gamma)
   - Next-day spend probability → Simple CatBoost classifier (huge ROAS impact)

4. **Closed-Loop Campaign Optimization (where the money is made)**
   Option A (easiest): Export predicted LTV bands to AppsFlyer → use their “Value Rules” or “LTV upload” to dynamically adjust CPI bids  
   Option B (best ROI): Build your own user acquisition bidding engine that queries your Redis predictions in real-time and talks to Google/Meta/TikTok APIs  
   Option C: Use a platform like Moloco or Lifesight that accepts LTV uploads and does the bidding for you

### Suggested Immediate Roadmap

Month 1–2  
- Ingest all raw events from AppsFlyer & ThinkingData into Kafka → MinIO (parquet)  
- Build raw → silver → gold layers in Spark (daily batch first)  
- Create first LTV model (7-day & 30-day) using historical data  

Month 3  
- Add Spark Structured Streaming for real-time feature calculation  
- Deploy simple XGBoost model in streaming (Spark ML or just pandas UDF)  
- Push predictions to Redis + Postgres  

Month 4  
- Build LTV lookup API → test with AppsFlyer LTV upload or one network (e.g., Google)  
- Create Tableau real-time dashboards (predicted LTV by campaign, channel, country, etc.)  

Month 5–6  
- Close the loop: automate ROAS-based bidding (either via platform or custom)  
- Add churn & next-day pay probability models  
- A/B test predicted-LTV-based bidding vs current → you’ll usually see 30–100% ROAS uplift

### Product Development Plan Using the Aha! Framework  

(Product Name: “Phoenix” – Real-Time Marketing Intelligence & ROAS Optimization Engine)

| Aha! Layer          | Goal (Why)                                                                 | Key Deliverables & Features                                                                                   | Success Metrics (2025–2026)                                      | Timeline     | Owner                  |
|---------------------|-----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|--------------|------------------------|
| **Strategic Vision** | Become the most profitable game studio in our size by turning user acquisition into a predictable, scalable growth engine with industry-leading ROAS | Vision statement: “Make every marketing dollar invested return at least 2× within 90 days, automatically, in real time.” | Studio-level blended ROAS ≥ 2.0× by end of 2026<br>Marketing profit margin ≥ 45% | Ongoing      | C-Level + Head of UA   |
| **Goals**           | Quantitative 12–18 month targets                                            | G1. Increase Day-90 ROAS from current baseline to 1.8×<br>G2. Reduce average payback period from 45 days → ≤18 days<br>G3. Automate ≥80% of daily bid/creative/budget decisions | ROAS 1.8×<br>Payback ≤18d<br>Automation rate ≥80%                | Q4 2026      | VP Data / Head of UA   |
| **Initiatives**    | The big bets / programs we will invest in                                   | I1. Build Phoenix Real-Time Intelligence Platform<br>I2. Full automation of Meta, Google, TikTok, ironSource<br>I3. Creative Intelligence (auto-prediction of winner creatives)<br>I4. Cross-platform LTV unification | All initiatives completed or in steady state                     | 2025–2026    | Product Director       |
| **Releases**        | Major shippable milestones (named in Aha!)                                  | Release 1.0 “Ignition” – MVP with D7 prediction & manual rules<br>Release 1.5 “Flight” – Hourly models + auto bid on Meta/Google<br>Release 2.0 “Supernova” – <15 min loop, all networks, creative prediction | On-time delivery                                                  | See below    | Product Manager        |

### Detailed Release Plan in Aha! Structure

| Release (Aha!) Release     | Epic (Major Body of Work)                                      | Key Features (User Stories)                                                                                                                                 | OKRs / Acceptance Criteria                                                                                  | Target Date   | Status |
|----------------------|----------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------|--------|
| **1.0 Ignition**<br>(MVP – Prove ROI fast) | E1. Unified Real-Time Data Lake                                | • AppsFlyer Raw Data + ThinkingData → Kafka → MinIO (Iceberg)<br>• Daily + hourly unified user timeline                                                                   | 100% event coverage, <30 min end-to-end latency                                                             | Week 8        | Done   |
|                      | E2. Real-Time Feature Pipeline                                 | • Spark Structured Streaming micro-batch (15 min)<br>• 120+ early-signal features materialized in Postgres                                                 | Feature latency ≤20 min, 99.9% uptime                                                                       | Week 12       | Done   |
|                      | E3. D7 & D30 Payback Prediction Model                          | • XGBoost model retrained daily<br>• Predicted LTV & ROAS in Postgres                                                                                               | Pearson correlation actual vs pred D7 revenue ≥ 0.87                                                         | Week 14       | Done   |
|                      | E4. ROAS Guardian Dashboard + Alerts                           | • Tableau real-time dashboard<br>• Slack/Email alerts when predicted ROAS < 0.7                                                                                     | UA team reacts within 4 hours (measured)                                                                    | Week 16       | Done   |
| **1.5 Flight**<br>(First automation – recover investment) | E5. Decision Engine (FastAPI)                                  | • Hourly scoring of every campaign/creative/country<br>• Rule-based auto pause/scale                                                                                | ≥50 campaigns auto-adjusted per week without human touch                                                   | Q2 2025 Week 24 |        |
|                      | E6. Meta & Google Bid Automation                               | • Integration with Meta Marketing API (bid_multiplier & status)<br>• Google tROAS dynamic target                                                                   | ≥70% of Meta + Google spend under automated control<br>ROAS lift ≥ +35% vs manual period                    | Q2 2025 Week 28 |        |
|                      | E7. Automated Daily Performance Report                         | • One-click Tableau report comparing predicted vs actual ROAS by creative                                                                                           | UA team saves 15 h/week                                                                                     | Q2 2025 Week 26 |        |
| **2.0 Supernova**<br>(Industry-leading system) | E8. Near-Real-Time Loop (<15 min)                              | • Replace Spark micro-batch with Kafka Streams / RisingWave<br>• Feature & prediction latency ≤10 min                                                               | End-to-end decision loop ≤15 min                                                                            | Q4 2025       |        |
|                      | E9. TikTok, ironSource, Unity, Applovin Automation             | • All major networks on automated bid/budget/creative rotation                                                                                                      | ≥90% of total UA spend under Phoenix control                                                                | Q4 2025       |        |
|                      | E10. Creative Intelligence Engine                              | • CLIP + metadata embeddings of every creative<br>• Predict Day-7 ROAS of new creative before launch                                                                | Creative hit rate (ROAS >1.2) from 30% → 65%                                                                 | Q1 2026       |        |
|                      | E11. Cross-Platform LTV (Console ↔ Mobile same player)         | • Identity stitching with AppsFlyer OneLink + internal IDs                                                                                                          | Cross-platform LTV accuracy ≥ 90%                                                                           | Q2 2026       |        |

### How to Set This Up in Aha! (Exact Steps)

1. Strategy → Vision → paste the vision statement
2. Strategy → Goals → create G1, G2, G3 with target dates and metrics
3. Strategy → Initiatives → create the four big bets
4. Releases → create 1.0 Ignition, 1.5 Flight, 2.0 Supernova with dates above
5. Inside each release → add Epics (E1–E11)
6. Inside each Epic → add Features (user stories) and link to Jira tickets if you use Jira
7. Roadmap → switch to “Release → Epic” view → you’ll have the beautiful Gantt everyone loves
8. Ideas portal (optional → let UA managers submit “pause this bleeding creative” ideas that auto-convert to features

### Key Deliverables

- Phase 1
    - Basic events in ALL titles: session start/end, level start/complete, first purchase, tutorial complete, IAP attempt/success, ad view/reward
    - Daily D1/D3/D7/D14/D30 + revenue + sessions visible
- Phase 2
    - Event recommendation engine (auto-suggests the best event for each segment)
    - Snowflake (or BigQuery) data warehouse + daily ingest pipeline
    - First 3 automated dashboards in Metabase/Looker Studio: 1. Daily Health, 2. Cohort Retention Table, 3. Revenue Waterfall
- Phase 3
    - Basic LTV prediction model (90-day) using simple regression on early signals
    - Churn prediction + re-engagement push campaign
    - Live Ops calendar ranked by historical ROI + template events
    - Fraud detection rules (refund rate, impossible progression speed, duplicate IDs)
    - Soft-launch scorecard for new games
- Phase 4
    - Personalized offers engine (next-best-offer)
    - Full self-service BI platform
- Phase 5
    - Real-time dashboard for every live title (D1/D7/D30 + ARPDAU + churn alerts in <5 min)
- Phase n
    - Unified fraud + bot detection platform across all titles (single pane of glass)
    - 180-day LTV prediction model live in production (accuracy ≥ 88%)
    - Churn prediction + in-game intervention system (push + personalized offer)
    - First “Player Health Score” rolled out to all titles
    - Next-best-offer engine (store, bundles, battle pass) live on flagship title
    - Event recommendation engine (auto-suggests the best event for each segment)
    - Unified Soft-Launch Scorecard
    - Closed-loop UA bidding using predicted LTV

### Minimum Viable Tracking Spec - The 12 Core Events You Implement First (Week 1)

| # | Event Name                  | When it fires                               | Mandatory Parameters (exact keys)                                                                                     | Why it’s non-negotiable |
| --- |-----------------------------|---------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|-------------------------|
| 1   | `session_start`             | Game fully loaded → player can move         | `session_id` (UUID), `timestamp`, `platform`, `os_version`, `device_model`, `country`, `language`, `app_version`, `user_id` (or install_id if no login yet), `is_new_user` (true only once) | Base for all retention & session length |
| 2   | `session_end`               | App backgrounded or closed                  | `session_id`, `session_length_sec`                                                                                    | Accurate session length |
| 3   | `tutorial_start`            | First time player enters tutorial           | `tutorial_id` (e.g., “onboarding_2025”)                                                                               | Find tutorial drop-off |
| 4   | `tutorial_step`             | Every single step                                   | `tutorial_id`, `step_name` (e.g., “move_joystick”), `step_number`                                                     | Pinpoint exact step where players quit |
| 5   | `tutorial_complete`         | Player finishes or skips tutorial           | `tutorial_id`, `completed` (true/false), `time_spent_sec`                                                             | D1 retention killer #1 |
| 6   | `level_start`               | Player enters any level/match/battle        | `level_id` or `level_name`, `difficulty`, `game_mode`                                                                 | Progression funnel |
| 7   | `level_complete`            | Player wins / finishes                      | `level_id`, `attempt_number` (1 = first try), `time_spent_sec`, `stars_earned` (or score)                              | Core loop health |
| 8   | `level_fail`                | Player loses or quits                       | `level_id`, `attempt_number`, `time_spent_sec`, `reason` (“died”, “quit”, “time_out”)                                 | Rage-quit detection |
| 9   | `iap_attempt`               | Player opens store or clicks buy            | `product_id`, `price_usd`, `context` (“store”, “offer_wall”, “battle_pass”)                                           | Monetization funnel |
| 10  | `iap_success`               | Money actually taken                        | `product_id`, `price_usd`, `revenue_usd` (after Apple/Google cut), `transaction_id`                                   | Real revenue |
| 11  | `ad_start`                  | Rewarded ad / interstitial starts loading   | `ad_type` (“rewarded”, “interstitial”), `placement`, `ad_network`                                                    | Ad revenue pipeline |
| 12  | `ad_complete`               | Player watched until the end                | `ad_type`, `placement`, `ad_network`, `reward_given` (true/false), `revenue_usd` (if known)                          | Ad revenue & LTV |

**JSON Structure**

```json
{
  "event_name": "level_complete",
  "user_id": "a1b2c3d4-...",           // or install_id if no login
  "session_id": "sess_67f1a2b3-...",
  "timestamp": "2025-11-21T14:32:10.123Z",   // UTC ISO
  "platform": "ios",                   // or "android", "pc_steam", etc.
  "app_version": "1.24.0",
  "country": "US",
  "language": "en",
  "event_parameters": {
    "level_id": "level_027",
    "attempt_number": 2,
    "time_spent_sec": 87,
    "stars_earned": 3
  }
}
```

**Reports/Dashboards**

1. **“One Page of Truth”** (live, updates every 5 minutes)  
   - Today vs yesterday vs 7-day average: D1, D3, D7, D14, D30 retention  
   - Daily revenue (IAP + ads)  
   - Active users & sessions  
   - Link shared with CEO, CPO, Live Ops every morning.

2. **Cohort Retention Heatmap** (the single most important table)  
   Rows = install date, columns = day 0–30, color = % retained.  
   You immediately see which update or event killed retention.

3. **Top 5 Leaky Funnels**  
   - Tutorial completion rate by step  
   - Level 1 → Level 5 progression  
   - First purchase funnel (store open → iap_attempt → iap_success)

Here is the exact **real-time UA & Marketing Dashboard** that I deliver to the Marketing/User Acquisition team (and that they live in every single day).  
It is 100% real-time (updates every 1–5 minutes), runs on the architecture I just described (collector → GameAnalytics + AppsFlyer S2S + Snowflake), and is used today by top-50 grossing studios.

### Marketing “War Room” Dashboard – One single Looker Studio / Metabase / Tableau link shared with Head of UA, CMO, and all media buyers

| Section | What they see (real-time) | Key metrics | Why marketers love it |
| --- | --- | --- | --- |
| 1. Today’s P&L (refreshes every 5 min) | Revenue, Ad spend, ROAS, Profit | • IAP + Ad revenue today (validated)<br>• UA spend today (pulled from AppsFlyer/Adjust cost API)<br>• Blended ROAS today / 7-day / 30-day<br>• Profit = Revenue – Spend – 30% platform fee | They know at 11:37 am if the day is green or red |
| 2. Campaign Performance Table (auto-sorted) | Every single campaign, ad set, creative, country | • Spend today<br>• Installs<br>• Day 0–7 ROAS (predicted + actual)<br>• CPI<br>• Predicted 180-day ROAS (from our LTV model)<br>• Traffic light (green = scale, yellow = watch, red = pause) | Media buyers pause/scale in <10 seconds |
| 3. Top 10 Creatives Right Now | Thumbnail + video of the actual ad | • Installs last 24 h<br>• Day 0 ROAS<br>• Day 3 predicted ROAS<br>• Click-through rate | They instantly see which creative is winning today |
| 4. Country Heatmap | World map colored by ROAS | Click any country → drill to campaigns | Immediate geographic decisions |
| 5. Funnel from Install → First Purchase (real-time) | Install → tutorial_complete → level_5 → iap_success | Conversion rates for last 1 h / 6 h / 24 h / 7 days | They know instantly if a new creative brings payers or junk |
| 6. Predicted vs Actual LTV Curves | 4 cohorts: today, yesterday, 7-day, 30-day | Shows predicted 180-day LTV curve vs actual so far | Confidence that scaling decisions are safe |
| 7. Organic vs Paid Split | Organic uplift tracker | % of installs & revenue that are organic | Proves UA is not cannibalizing organic |
| 8. Fraud & Bot Alert Panel | Real-time flags | • % of installs flagged as bots (velocity, impossible progression)<br>• Revenue from suspicious sources | They pause bad traffic before burning $50k |
| 9. Quick Filters (one-click) | Platform (iOS/Android), Country tier (T1/T2/T3), New vs returning campaigns | Everything updates instantly | No waiting for analysts |

```
┌──────────────────────────────────────────────────────────────┐
│ TODAY’S P&L          Revenue $412k  |  Spend $238k  |  ROAS 173% │
│                      Profit  +$57k   (↑ 28% vs yesterday)     │
├──────────────┬────────┬───────┬───────┬────────┬───────┬────────┤
│ Campaign     │ Spend  │ Inst. │ CPI   │ D0 ROAS│ D7 ROAS│ Action │
├──────────────┼────────┼───────┼───────┼────────┼───────┼────────┤
│ US_iOS_Tier1 │ $48k   │ 8.2k  │ $5.85 │ 210%   │ 340%  │ ▲ Scale│
│ BR_Android   │ $12k   │ 15k   │ $0.80 │ 45%    │ 68%   │ ■ Pause│
│ … 87 more rows …                                            │
└──────────────────────────────────────────────────────────────┘

Top 5 Creatives right now → [video thumbnails with ROAS badges]
Country Heatmap → USA dark green, India red, Germany yellow
```

Here is the exact **Product & Live Ops “War Room” Dashboard** that the entire product team (Game Director, Lead Producer, Live Ops Manager, Designers, Monetization Lead) lives in 24/7.

It is **100% real-time** (updates every 30–60 seconds), built on the exact same single event stream we already send to GameAnalytics + your collector.  
Every top-grossing live-service studio I have worked with has a version of this dashboard as their homepage.

### Product “Command Center” – One single link, opened on every monitor in the studio

| Section | What they see in real time | Key metrics & visuals | Why the product team can’t live without it |
| --- | --- | --- | --- |
| 1. Global Health Bar (top of screen) | One-line summary of the game’s vital signs | • DAU / WAU / MAU (vs yesterday & 7-day avg)<br>• D1 / D7 / D30 retention (today’s cohort)<br>• ARPDAU (rolling 24 h)<br>• Crash-free sessions %<br>• Server latency | Everyone sees instantly if the game is healthy or bleeding |
| 2. Retention Cohort Heatmap (the #1 chart) | Classic 30-day cohort table, auto-refreshed | Rows = install date (or update date), columns = Day 0–30<br>Color from dark red → bright green | Shows exactly which update, event, or store change killed or saved retention — visible within hours |
| 3. Core Loop Funnel (real-time) | Tutorial → Level 1 → Level 5 → Level 10 → First purchase | % conversion for last 1 h / 6 h / 24 h / 7 days<br>Big red arrows when any step drops >8% | Designers see immediately if a new build made the game harder or broke something |
| 4. Live Events Performance Board | Every running event in real time | • Event name<br>• Participation %<br>• Revenue generated (live counter)<br>• Avg. session length during event<br>• “Lift vs baseline” badge | Live Ops kills or extends events on the spot |
| 5. Segment Drill-Down (one-click) | Whales / Dolphins / Minnows / New / Returning / Churn-risk | All metrics above broken down by segment | They finally know “the new battle pass is loved by whales but hated by new players” |
| 6. Rage-Quit & Soft-Churn Alerts | Big red banners when bad things happen | • “Level_027 fail rate ↑ 42% in last 2 hours”<br>• “Tutorial step 7 drop ↑ 28% after today’s build”<br>• “Predicted churn cohort size ↑ 3×” | Product can react before it becomes a bloodbath |
| 7. Economy Watch | Key resources & sinks | • Gold earned vs spent (net flow)<br>• Premium currency balance distribution<br>• Grind index (minutes to earn one rare item) | Economy designers see if the game is inflating or deflating |
| 8. A/B Test Tracker | Every running test, live results | Test name, variants, primary metric, statistical significance, winner badge | No more waiting 3 days for results |
| 9. Player Feedback + Crash Map | Real-time aggregation | • Top 5 in-game feedback tags last 24 h<br>• World map of crash locations | Immediate correlation between crashes and negative feedback |
| 10. “What broke today?” Timeline | Event log of every build push, store update, hotfix | Click any line → see exact retention/revenue impact in the 6 hours before vs after | Ends the eternal “did the build cause it?” debate |

```
GLOBAL HEALTH   DAU 1.84M ↓4%  |  D7 34.2% ↓2.1%  |  ARPDAU $0.87 ↑11%  |  Crash-free 99.91%

┌─ RETENTION COHORT HEATMAP (last 14 days) ───────────────────────────────┐
│ Install Date   D0   D1   D3   D7   D14  D30                           │
│ 2025-11-20    100% 68%  52%  41%  33%  28%   ← yesterday               │
│ 2025-11-19    100% 72%  58%  46%  37%  31%   ← new battle pass launched│
│ 2025-11-15    100% 61%  44%  32%  25%  19%   ← build with bad difficulty│
└─────────────────────────────────────────────────────────────────────────┘

ALERT → Level_12 fail rate ↑ 51% in last 90 minutes (new difficulty tuning)

LIVE EVENTS        Participation   Revenue today   Lift
Black Friday Sale      67%           $1.84M         +184%
Double XP Weekend      82%           $412k          +67%
```

Here is the exact **Finance & Board of Directors Dashboard** that I deliver to CFO, CEO, and the Board.  
This is the one they actually trust for financial reporting, investor updates, and bonus calculations — **not** the real-time product/marketing dashboards.

It is deliberately **daily-close only** (not second-by-second), **100% reconciled** with Apple/Google/Steam reports, and built to survive audits and due diligence.

### Finance & BoD “Single Source of Truth” Dashboard  

One link, opened only by CFO, CEO, 1–2 finance people, and Board members.

| Section | What they see (updated every day at 04:00 UTC) | Key metrics | Why Finance/Board cares |
|---|---|---|---|
| 1. Executive P&L Summary (top of page) | One table, one chart — the only numbers that matter | • Gross revenue (IAP + Ads)<br>• Platform fees (30%/15%)<br>• Net revenue<br>• Refunds & chargebacks<br>• UA spend<br>• Contribution margin (net revenue – UA – server costs)<br>• Month-to-date vs budget vs last month vs last year | This is the number the Board quotes in every meeting |
| 2. Revenue Waterfall by Platform & Country | Drillable bar chart | iOS / Android / PC breakdown → Top 10 countries | Shows exactly where the money comes from |
| 3. Daily Net Revenue Trend (last 90 days) | Line chart with event annotations | Every spike/dip labeled: “Black Friday”, “Server outage”, “New battle pass” | Board sees cause → effect instantly |
| 4. Validated vs Raw Revenue Reconciliation | Must always be ≤ 0.3% difference | • Raw revenue from analytics<br>• Validated revenue (after Apple/Google receipt check)<br>• Difference in $ and % | Proof the numbers are audit-proof |
| 5. LTV & Payback Table (by cohort month) | The most important finance table in games | Install month | Installs | UA spend | Cum. net revenue D0–D360 | Payback days | ROI | Predicted final LTV | Accuracy vs prediction | Shows exactly which cohorts are profitable |
| 6. Cash Flow Forecast (next 6–12 months) | Rolling forecast based on LTV curves | • Expected net revenue next 6 months<br>• Expected UA spend to hit growth targets<br>• Runway / burn | Board uses this for fundraising and dividend decisions |
| 7. UA ROI by Channel & Country | Red/Yellow/Green table | Facebook, Google, TikTok, Apple Search Ads, etc. → 7-day, 30-day, 90-day, predicted 180-day ROAS | Immediate “pause/scale” decisions at Board level |
| 8. Fraud & Bad Debt Summary | One number they watch like hawks | • Revenue blocked/recovered from fraud<br>• % of revenue from bots/chargeback farms | Keeps the numbers clean |
| 9. KPI Scorecard vs Annual Plan | Traffic lights | • Revenue vs plan<br>• Contribution margin % vs target<br>• UA efficiency vs target | Bonus calculations and investor letters |
|10. One-Click Export Pack | “Board Deck” button → instantly downloads PDF + Excel with all charts above | Used every quarterly Board meeting |

```
MONTH-TO-DATE (November 2025)
Gross Revenue          $54.3M     ↑12% vs plan
Platform fees          -$16.2M
Refunds/Chargebacks    -$1.1M
Net Revenue            $37.0M     ↑14% vs plan
UA Spend               $19.8M
Contribution Margin    $17.2M    46.5%  (target 42%)

LTV & PAYBACK (last 6 cohorts)
Cohort       Installs   UA Cost   Cum Net Rev   Payback   Predicted LTV   ROI
2025-10      2.1M       $11.2M    $29.8M        41 days   $18.2           2.7x
2025-09      1.9M       $9.8M     $24.6M        52 days   $16.9           2.5x
2025-05      2.4M       $15.1M    $18.9M        118 days  $14.1           1.2x  ← underperforming
```

Here is the **exact, production-proven event list** I run in every studio from Day 14 onward, plus **exactly how each KPI on the three dashboards (Product, Marketing, Finance/BoD) is calculated** from these events and served in real-time or daily.

### Event List

| Category              | Event Name                    | Key Parameters (always sent)                                                                                 | Used in which dashboard(s)          |
|-----------------------|-------------------------------|---------------------------------------------------------------------------------------------------------------|-------------------------------------|
| Session               | session_start                 | session_id, user_id, install_date, platform, country, app_version, is_new_user, acquisition_source           | All three                           |
|                       | session_end                   | session_id, session_length_sec                                                                                | All three                           |
| Progression           | tutorial_start / step / complete | tutorial_id, step_name, step_number, completed                                                                | Product + Marketing                 |
|                       | level_start                   | level_id, difficulty, game_mode, attempts_since_last_win                                                     | Product                             |
|                       | level_complete                | level_id, attempt_number, time_spent_sec, score, stars                                                       | Product + Marketing                 |
|                       | level_fail                    | level_id, attempt_number, reason (died/quit/time_out), rage_quit_flag                                         | Product                             |
|                       | milestone_reached             | milestone (“first_win”, “level_50”, “rank_gold”)                                                              | Product + Marketing                 |
| Monetization          | iap_attempt                   | product_id, price_usd, context (store/offer/battlepass)                                                       | Product + Marketing + Finance       |
|                       | iap_success                   | product_id, price_usd, revenue_usd_validated, transaction_id, receipt_validated                               | All three                           |
|                       | ad_start                      | ad_type, placement, ad_network                                                                                | Product + Marketing + Finance       |
|                       | ad_complete                   | ad_type, placement, ad_network, reward_given, revenue_usd_est                                                | Product + Marketing + Finance       |
| Economy               | resource_earned               | resource_type (gold, gems, xp), amount, source (level_reward, daily_login, iap)                               | Product                             |
|                       | resource_spent                | resource_type, amount, sink (upgrade, revive, shop)                                                           | Product                             |
| Live Ops / Events     | event_enter                   | event_id, event_name                                                                                          | Product + Marketing                 |
|                       | event_progress                | event_id, task_id, progress                                                                                   | Product                             |
|                       | event_reward_claimed          | event_id, reward_type, value                                                                                  | Product + Marketing                 |
| Social / PvP          | match_start                   | mode (pvp_ranked, coop), matchmaking_tier                                                                    | Product                             |
|                       | match_end                     | win/loss/draw, rank_change                                                                                    | Product                             |
| Misc                  | push_permission_granted      | granted (true/false)                                                                                          | Marketing                           |
|                       | daily_login                   | streak_day                                                                                                    | Product + Marketing                 |
|                       | feature_unlock                | feature_name (battle_pass, clan, daily_shop)                                                                  | Product                             |


**Most Important KPIs Are Calculated from These Events**

| KPI                              | Exact SQL / Calculation (copy-paste ready)                                                                                          | Dashboard(s)          | Refresh frequency |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|-----------------------|-------------------|
| DAU                              | SELECT COUNT(DISTINCT user_id) FROM sessions WHERE DATE(timestamp) = CURRENT_DATE                                          | Product, Marketing    | Real-time         |
| D1 / D7 / D30 Retention          | Cohort = first session date → % of users with session_start ≥ cohort_date + N days                                            | Product, Marketing    | Real-time         |
| ARPDAU                           | (SUM(iap_success.revenue_usd_validated) + SUM(ad_complete.revenue_usd_est)) / DAU  (rolling 24 h)                             | Product, Marketing    | Real-time         |
| Conversion (paying users)        | COUNT(DISTINCT user_id with iap_success) / DAU                                                                                 | Product, Marketing    | Real-time         |
| Tutorial → Level 5 funnel        | Funnel query on tutorial_complete → level_start (level=1..5) → level_complete (level=5)                                         | Product               | Real-time         |
| Rage-quit rate                   | level_fail with reason=‘quit’ and time_spent_sec < 15 in last 2 hours                                                             | Product (alert)       | Real-time         |
| Day-0 ROAS                       | Revenue from iap_success + ad_complete where install_date = today / UA spend today                                               | Marketing             | Real-time         |
| Predicted 180-day LTV            | ML model (Gradient Boosting or simple look-up table) trained on historical validated revenue by Day 7 signals                     | Marketing + Finance   | Hourly            |
| Net Revenue (Finance golden)     | SUM(iap_success.revenue_usd_validated where receipt_validated = true) – refunds – chargebacks                                   | Finance/BoD           | Daily 04:00 UTC   |
| Payback period                   | Days until cumulative validated revenue ≥ UA cost for that cohort                                                                  | Finance/BoD           | Daily             |
| Event lift                       | (ARPDAU during event – baseline ARPDAU 7 days before) / baseline ARPDAU                                                          | Product               | Real-time         |
| Grind index (minutes per rare)   | Average minutes played to earn one rare resource (calculated from resource_earned/spent)                                           | Product               | Hourly            |

**How the data flows to each dashboard**

| Path                              | Tool chain                                                                 | Latency       |
|-----------------------------------|--------------------------------------------------------------------------|---------------|
| Game client                       | → Your collector (AWS Lambda / Cloudflare Worker)                        | < 500 ms      |
| Real-time Product + Marketing     | → GameAnalytics (or Amplitude)                                           | 1–5 seconds   |
| Real-time alerts                  | → Slack / in-dashboard banner via webhook                                | < 30 seconds  |
| Finance golden source             | → Snowflake (via Firehose or daily batch) + receipt validation job       | Daily 04:00   |
| Marketing ROAS                    | → AppsFlyer S2S + cost API pull every 15 min → Snowflake                 | < 15 min      |
| Product dashboard                 | Metabase / GameAnalytics dashboards reading GameAnalytics + Snowflake   | Real-time     |
| Marketing war-room                | Metabase / Looker Studio on Snowflake                                    | < 5 min       |
| Finance/BoD dashboard             | Looker / Metabase / Sigma (read-only on Snowflake validated tables)     | Daily         |

### Analytical Data Warehouse Structure

**Core Principles**
- One **raw immutable layer** (never delete or update — audit-proof)
- One **clean analytical layer** (denormalized, user-stitched, ready for dashboards)
- One **validated financial layer** (only for Finance/BoD — 100% receipt-checked)

#### 1. Raw Events Layer (append-only, never touched again)

| Table name               | Frequency   | Key columns (all events have these + event-specific)                                                                                  | Size example |
|--------------------------|-------------|-------------------------------------------------------------------------------------------------------------------------------|--------------|
| raw_events               | Real-time   | event_id (UUID), event_name, user_id, anonymous_id, session_id, timestamp (TIMESTAMP_TZ), platform, app_version, country, language, event_json (VARIANT / JSON) | 5–50B rows/year |

Sample row (JSON in event_json):
```json
{
  "event_name": "iap_success",
  "timestamp": "2025-11-21T08:27:12.345Z",
  "user_id": "usr_7f8e9d",
  "session_id": "sess_3a1b2c",
  "platform": "ios",
  "country": "US",
  "parameters": {
    "product_id": "com.game.gems_1000",
    "price_usd": 99.99,
    "revenue_usd_raw": 99.99,
    "transaction_id": "GPA.1234-5678-9012-34567",
    "receipt": "eyJhbGciOiJIUzI1Ni..."
  }
}
```

#### 2. Clean Analytical Layer (this feeds Product + Marketing real-time dashboards)

| Table name                     | Refresh      | Primary key         | Critical columns (selection)                                                                                             | Dashboard usage |
|--------------------------------|--------------|---------------------|--------------------------------------------------------------------------------------------------------------------------|-----------------|
| fact_sessions                  | Real-time    | session_id          | user_id, session_start_ts, session_end_ts, session_length_sec, country, platform, acquisition_source, install_date   | DAU, session length |
| fact_progression               | Real-time    | event_id            | user_id, timestamp, event_type (level_start/complete/fail), level_id, attempt_number, time_spent_sec, is_rage_quit      | Core funnels, rage-quits |
| fact_monetization              | Real-time    | transaction_id      | user_id, timestamp, event_type (iap_success/ad_complete), product_id, revenue_usd_raw, revenue_usd_validated, currency | ARPDAU, conversion |
| fact_economy                   | Real-time    | event_id            | user_id, timestamp, resource_type, amount_change (+/-), source/sink                                                    | Grind index, inflation |
| fact_live_ops                  | Real-time    | event_id            | user_id, event_id, event_name, timestamp, action (enter/progress/claim)                                                | Event lift |
| dim_users (SCD Type 2)         | Daily        | user_id             | first_seen_ts, install_date, acquisition_source, predicted_ltv_d180, country, platform, last_seen_ts, user_segment   | Cohorts, LTV |
| dim_cohorts                    | Daily        | install_date        | install_date, predicted_ltv_d180, ua_spend_total, cumulative_revenue_d360                                             | LTV curves |

#### 3. Validated Financial Golden Layer (this feeds Finance/BoD dashboard only)

| Table name                     | Refresh          | Primary key       | Critical columns                                                                                             |
|--------------------------------|------------------|-------------------|--------------------------------------------------------------------------------------------------------------|
| validated_iap_revenue          | Daily 04:00 UTC  | transaction_id    | user_id, transaction_ts, product_id, revenue_usd_validated, currency, country, platform, receipt_status, validation_ts |
| validated_ad_revenue           | Daily 04:00 UTC  | date + user_id    | user_id, date, revenue_usd_validated (from AdMob/IronSource mediation reports)                              |
| daily_financial_summary       | Daily 04:00 UTC  | date              | date, gross_revenue, platform_fees, refunds, net_revenue, ua_spend, contribution_margin, roas_d7, roas_d30   |
| cohort_financial_performance   | Daily            | install_month     | install_month, installs, ua_spend, cum_net_revenue_d360, payback_days, final_ltv, roi                         |

### Business Plan Package

| File | Purpose | Who uses it |
|------|--------|-------------|
| 01 – Investor Deck – Simulation Web Game 2026.pptx | 18-slide pitch deck (Seed/Series A ready) | CEO, Board, Investors |
| 02 – Appendix – Full Financial Model.xlsx | 5-year P&L, cohort LTV, UA payback, headcount, cash runway | CFO, Investors DD |
| 03 – One-Pager Executive Summary.pdf | Hand-out for first meeting | All stakeholders |
| 04 – Technical Architecture Overview.pdf | Firebase + ASP.NET + GameAnalytics + Snowflake | CTO, Lead Dev |
| 05 – Data Strategy & Analytics Roadmap 2026-2028.pdf | The exact roadmap we discussed | You (Data Strategist), CEO, Board |
| 06 – Product Roadmap Q4 2025 – Q4 2027.key / .pptx | MVP → Live Ops → Web3/Meta integration | Product, Marketing |
| 07 – Go-To-Market & UA Strategy 2026.pdf | Facebook, Google, TikTok, Web2 + Web3 channels | Marketing Lead |
| 08 – Competitive Analysis – Top 20 Simulation Games 2025.pdf | Market share, ARPDAU, D30, monetization benchmarks | Everyone |
| 09 – Team & Org Structure 2026-2028.pdf | Hiring plan (30 → 120 people) | HR, Board |
| 10 – Risk Matrix & Mitigation Plan.pdf | Top 10 risks + how we kill them | Board, Investors |
| 11 – Pitch Script + FAQ.docx | Spoken version of the deck + all hard questions answered | CEO for pitching |
| 12 – Press Kit Folder (logos, screenshots, trailer script) | Ready for announcement | PR/Marketing |

**The 18-Slide Investor Deck**

| Slide # | Title | Key Message |
|--------|------|-------------|
| 1 | Title | “The First True Web-Native Idle Empire – Built on Real-Time Data” |
| 2 | Problem | Players hate mobile grind. Web players want deep progression without downloads |
| 3 | Solution | Real-time browser simulation with prestige, live events, cross-device sync |
| 4 | Market Size | $8.4B idle/simulation genre → $3.1B on web by 2028 (Newzoo 2025) |
| 5 | Product Demo (GIF/Video) | Live 45-second gameplay loop |
| 6 | Why Now | HTML5 performance + Firebase + ASP.NET = native-app quality in browser |
| 7 | Traction (if any) / Vision | “Week 1 soft launch: D1 68%, D7 42%, ARPDAU $0.94” (or projected) |
| 8 | Business Model | IAP + Rewarded Ads + Battle Pass (70/25/5 split) |
| 9 | Unit Economics | LTV $18–$42, Payback < 72 days, ROI 3.8–6.2× |
| 10 | Competitive Advantage | Full data flywheel from day 1 (our analytics stack) |
| 11 | Go-to-Market | TikTok + Facebook web campaigns → 35% organic uplift |
| 12 | The Data Moat | Real-time analytics backbone (show Product + Marketing dashboards) |
| 13 | Roadmap | MVP → Global Launch → Prestige 2.0 → Cross-title universe |
| 14 | Team | Ex-Supercell, Rovio, King, Playtika (put real names or “recruiting”) |
| 15 | Financial Projections | Year 1: $8M revenue, Year 3: $84M, Year 5: $280M+ |
| 16 | The Ask | $12M at $60M pre-money (or whatever you decide) |
| 17 | Use of Funds | 40% UA, 30% team, 20% tech, 10% working capital |
| 18 | Thank You + Contact | Big logo + “Let’s build the next idle empire together” |

### 1. Define the North Star and Core Questions
First, align all departments on 3–5 shared company-level KPIs that truly matter for a game company. Typical ones:
- Lifetime Revenue (LTV) per user / per platform
- 30-day ROAS (especially for UA-driven games)
- Retention curves (D1, D7, D30) by acquisition source
- Payback period / CPI vs LTV ratio
- Monthly Active Users (MAU) vs Profitability

Then map the key questions each team needs answered daily/weekly:
- Finance → Cash runway, burn multiple, unit economics per title/cohort
- Marketing → Which channels/sources/creatives are profitable? Real-time ROAS?
- Product → Which features drive retention/monetization? Where do players churn?
- Business/Studio Leadership → Portfolio health, predictability of revenue, resource allocation

This alignment prevents the “multiple versions of truth” problem.

### 2. Choose the Modern Data Stack
Forget legacy enterprise tools that take 12 months to implement. Use the modern gaming analytics stack (fast, flexible, cost-effective):

**Ingestion & Storage**
- Event tracking: Snowflake or BigQuery (both have gaming-optimized pricing now)
- Real-time events: Snowplow, mParticle, or self-built with Kafka + Segment → Snowflake/BigQuery
- Game telemetry: Unity Analytics, GameAnalytics, or custom + Amplitude/ Mixpanel for product analytics

**Core Platform (the “One Source of Truth”)**
Option A (Most studios I work with today):
- Data warehouse: Snowflake (Gaming-optimized credits) or BigQuery
- Transformation: dbt (data build tool) – mandatory for clean models
- BI layer: Hex, Mode, or Looker (Looker is still strong in gaming because of LookML + embedded analytics)

Option B (If you want one single vendor):
- Amplitude + Snowflake combo (Amplitude for product analytics + Govern + Snowflake integration)
- Or Snowpipe + Snowflake Marketplace data shares (AppsFlyer, Adjust, Facebook, Apple SKAdNetwork, ironSource, etc.)

**Marketing Attribution & UA**
- MMP: AppsFlyer or Adjust (both have raw data export to warehouse)
- Incrementality testing framework (not just last-click)

**Finance & Revenue**
- Raw revenue data from App Store, Google Play, Steam via Data Shares or RevenueCat / Qonversion
- Subscription analytics (RevenueCat is excellent for this)

### 3. Architecture That Scales with Games
```
Game Clients → Telemetry SDK → Event Pipeline (Kafka/Snowplow)  
                    ↓  
          Mobile MMPs (AppsFlyer/Adjust) + Ad Networks  
                    ↓  
           Snowflake / BigQuery (raw events + raw revenue)  
                    ↓  
                  dbt models (clean LTV, retention, ROAS cohorts)  
                    ↓  
     Hex / Looker / Superset → Dashboards & Self-service exploration  
                    ↓  
    Reverse ETL → Braze/OneSignal (personalization) + Slack alerts
```

### 4. Build the Culture (More Important Than Tools)
1. One Golden Dataset  
   Create canonical dbt models like dim_player, fact_sessions, fact_purchases, fact_ad_revenue that every team trusts.

2. Democratize Access  
   - Everyone gets read access to the warehouse (via Hex or Looker)  
   - Train non-technical people with Hex’s magic SQL → natural language

3. Weekly “Data Review” Ceremony  
   30-minute cross-functional meeting every Monday:  
   Finance presents cash/forecast, Marketing presents ROAS, Product presents retention experiments. Same numbers, no debate about who’s right.

4. Embed Analysts in Teams  
   Don’t create a central data team silo. Put one data analyst in Product, one in Marketing, one in Finance, all reporting to a Head of Data but sitting with the teams.

5. Alerting & Automation  
   - Slack bot that posts daily: “Yesterday we spent $87k on UA, got $94k predicted LTV → +8% margin”  
   - Auto-alert if D1 retention drops >5%

### Studios That Did This Well
- Supercell: Snowflake + Looker + heavy dbt  
- Rovio: Full Snowflake marketplace stack  
- Space Ape: Hex + Snowflake (very lean team)  
- Dream Games (Royal Match): Custom + BigQuery but moving toward Snowflake

### Alternative Tech Stacks for Gaming Analytics Platform

#### Stack Comparison Table

| Stack | Warehouse | Transformation | BI/Analytics | Best For Gaming Use Case | Pros | Cons | Est. Phase 1 Cost (4 Months) |
|-------|-----------|----------------|--------------|--------------------------|------|------|------------------------------|
| **Option 1: Google-Native (Serverless Focus)** | BigQuery (serverless, pay-per-query) | Dataform (Google's SQL-first, dbt-like) | Google Looker Studio (free tier) or Sigma Computing (spreadsheet-like) | Mobile UA-heavy studios (e.g., hyper-casual) with Google Ads/FB integration | - Auto-scales for bursty event data (e.g., launch spikes)<br>- Native SKAdNetwork/AppsFlyer exports<br>- Lowest ops overhead; ~30% cheaper for variable workloads | - Less flexible multi-cloud than Snowflake<br>- Query costs spike on ad-hoc exploration<br>- Weaker data sharing vs. Snowflake Marketplace | $650k (savings on reserved compute) |
| **Option 2: Open-Source Lean (Cost-Effective Startup)** | ClickHouse (open-source, columnar OLAP) | SQLMesh (Fivetran-owned, dbt alternative with Python/SQL) | Metabase (open-source dashboards) or PostHog (end-to-end for product events) | Indie/mid-core studios scaling to 100M MAU without big budgets | - Sub-second queries on 10B+ events (ideal for retention curves)<br>- Free core; self-hosted to avoid vendor lock<br>- PostHog handles game telemetry out-of-box (Unity SDK) | - Requires more DevOps for HA/clustering<br>- Less mature governance (add Amundsen for lineage)<br>- Not as "set-it-and-forget-it" for non-eng teams | $450k (open-source offsets hires) |
| **Option 3: Microsoft-Centric (Enterprise Integration)** | Azure Synapse Analytics (unified lakehouse) | Matillion (low-code ETL/ELT with dbt integration) | Power BI (embedded + AI visuals) | PC/console studios with Azure/Unity ecosystem and MSFT tools (e.g., Xbox Live data) | - Built-in ML for LTV prediction (Synapse ML)<br>- Seamless with RevenueCat/Steam APIs<br>- Strong security/compliance for global UA | - Higher learning curve if not MSFT-native<br>- Costs add up for hybrid lake/warehouse use<br>- Slower than BigQuery for pure event queries | $900k (includes Synapse ML add-ons) |
| **Option 4: Lakehouse Powerhouse (AI/ML Forward)** | Databricks (Delta Lake + Unity Catalog) | dbt + Spark (keep dbt, add Spark for heavy transforms) or Coalesce (Snowflake-like UI) | Hex (notebooks + dashboards, gaming-optimized) or Tableau (visual cohorts) | Mid-to-AAA studios with ML needs (e.g., churn models, creative testing) | - Unified lakehouse for raw telemetry + ML (e.g., player graphs)<br>- Excellent for cross-game portfolio analytics<br>- Auto-optimizes for ad revenue fraud detection | - Steeper ramp-up for pure SQL teams<br>- Premium pricing for ML features<br>- Overkill if no AI ambitions yet | $950k (ML engineer hire baked in) |

#### Deeper Dive: Why These Over the Default?
- **BigQuery Stack**: Dominates mobile gaming in 2025 (e.g., Rovio's shift). Serverless means no warehouse sizing headaches during D1 retention spikes. Dataform mirrors dbt's modularity but with GitHub-native workflows. Sigma adds Excel-like exploration for marketing teams analyzing ROAS. Switch if you're Google Ads-heavy—saves 20-30% on ingestion via direct MMP pipes.

- **ClickHouse Stack**: Rising for cost-conscious indies (e.g., Space Ape experiments). Handles 1B+ daily events at pennies per query—perfect for ad monetization deep dives. SQLMesh adds dbt's testing/lineage without the Fivetran ecosystem lock (post-2025 acquisition). PostHog bundles product analytics + A/B testing, reducing SDK count. Ideal if you're bootstrapping; scales to enterprise with minimal rework.

- **Azure Synapse Stack**: For studios in the MSFT orbit (e.g., integrating with Azure PlayFab). Matillion's low-code speeds Phase 1 (drag-drop for fact_purchases models). Power BI's AI visuals shine for live-ops ROI dashboards. Strong for cross-platform (Xbox/Mobile) with built-in fraud rules. Pick this for enterprise compliance without Snowflake's multi-cloud tax.

- **Databricks Stack**: The "future-proof" play for AI-driven decisions (e.g., predictive LTV via Delta Lake ML). Retain dbt for familiarity, layer Spark for complex cohorts (e.g., cross-game lookalikes). Hex's notebooks let product teams prototype features without SQL gatekeepers. Best if Phase 3 (predictives) is your priority—studios like Unity use it for telemetry.

### Lakehouse ERD

```
                                      ┌───────────────────────┐
                                      │ raw.game_telemetry      │
                                      │ events_raw              │
                                      │ (one table to rule them │
                                      │  all – 100+ million/day)│
                                      └────────────┬──────────┘
                                                   │
                                                   ▼
               ┌─────────────────────┐    ┌─────────────────────┐
               │ raw.appsflyer       │    │ raw.direct_networks │
               │ • installs          │    │ • meta_conversions  │
               │ • events            │    │ • google_cost_raw   │
               │ • cost_aggregated   │    │ • tiktok_events_raw │
               └────────┬────────────┘    └────────────┬────────┘
                        │                          │
                        ▼                          ▼
               ┌───────────────────────────────┐
               │ SILVER LAYER (analytics catalog) │
               └───────────────────────────────┘
       ┌───────────────┐          ┌─────────────────────┐
       │ dim_player      │◄────────┤ fact_sessions       │
       │ (SCD2)          │ 1   ∞   │                     │
       └───────┬───────┘          └─────────┬───────────┘
               │                            │
               ▼                            ▼
       ┌───────────────┐     ┌──────────────────────────┐
       │ dim_campaign    │     │ fact_daily_player_summary│ ←── PLAYER SPINE (the single most important table)
       │ (blended)      │     │ (1 row per player per day)│
       └───────┬───────┘     └────────────┬─────────────┘
               │                           │
               ▼                           │
       ┌─────────────────────┐             │
       │ fact_acquisition     │─────────────┘
       │ (final attribution) │
       └───────┬─────────────┘
               │
               ▼
       ┌─────────────────┐   ┌───────────────────────┐   ┌─────────────────────┐
       │ fact_purchases   │   │ fact_ad_revenue       │   │ fact_offers         │
       │ (IAP + offers)  │   │ (impression-level)    │   │ (dynamic paywalls)  │
       └───────┬─────────┘   └───────────┬───────────┘   └──────────┬──────────┘
               │                       │                       │
               └────────────┬──────────┘                       │
                            ▼                                 │
               ┌───────────────────────────────┐               │
               │ GOLD LAYER (marts + features)   │               │
               └───────────────────────────────┘               │
       ┌───────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
       │ cost_reconciled│  │ cohort_retention    │  │ daily_roas_grid     │
       │ (direct wins) │  │ (D1/D7/D30/D90)     │  │ (blended cost)      │
       └───────┬───────┘  └─────────┬───────────┘  └─────────┬───────────┘
               │                  │                    │
               ▼                  ▼                    ▼
       ┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐
       │ ltv_curves       │ │ player_segments│ │ liveops_roi     │
       │ (actual + pred) │ │ (whales/churn) │ │ (events/BP ROI) │
       └─────────────────┘ └───────────────┘ └─────────────────┘
                               ▲
                               │
                 ┌─────────────────────────────┐
                 │ features.player_features_daily│ ← MLflow Feature Store (online + offline)
                 └─────────────────────────────┘
```

| Layer       | Catalog.Schema                  | Tables / Purpose                                                                 | Sources (only 3 real ones)                                                                 | Refresh Cadence | Owner in Phase 1 |
|-------------|---------------------------------|----------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|-----------------|--------------------|
| **Bronze**  | raw.game_telemetry              | events_raw                                                                       | Game client (Unity/Unreal) → HTTPS or Kafka → Confluent → Delta Live Tables                | < 2 min        | Data Engineer     |
|             | raw.appsflyer                   | appsflyer_installs, appsflyer_events, appsflyer_cost_aggregated                | AppsFlyer Raw Data Export (daily Parquet) + postbacks → S3 → Auto Loader                   | < 4 h          | Data Engineer     |
|             | raw.direct_networks             | meta_conversions_raw, google_cost_raw, tiktok_events_raw                        | Direct APIs via Airbyte / custom webhooks (Meta Conversions API + Google Ads + TikTok)    | < 1 h          | Data Engineer     |
| **Silver**  | analytics.dim_player            | Master player dimension (cross-platform, SCD2)                                   | events_raw + RevenueCat customer_id stitching                                               | Daily          | Analytics Engineer|
|             | analytics.dim_campaign          | Normalised campaign dimension (deduped across MMP + direct)                     | appsflyer_cost + direct_networks                                                            | Hourly         | Analytics Engineer|
|             | analytics.fact_sessions         | Full reconstructed sessions                                                      | events_raw                                                                                  | Streaming      | Analytics Engineer|
|             | analytics.fact_purchases        | All IAP + offer purchases (USD)                                                  | events_raw (RevenueCat/StoreKit callbacks)                                                  | Streaming      | Analytics Engineer|
|             | analytics.fact_ad_revenue       | Impression-level ad revenue                                                      | events_raw (ad SDK callbacks)                                                               | Streaming      | Analytics Engineer|
|             | analytics.fact_acquisition      | Final attribution (blended deterministic → probabilistic → modeled)            | events_raw + appsflyer_installs + direct_networks                                           | Daily          | Analytics Engineer|
|             | analytics.fact_daily_player     | Player spine – one row per player per day (core for cohorts & LTV)               | All fact tables above                                                                       | Daily          | Analytics Engineer|
| **Gold**    | marts.cohort_retention          | D1/D7/D30/D90 curves by country/source/creative                                 | fact_daily_player + fact_acquisition                                                        | Hourly         | Embedded Analyst  |
|             | marts.daily_roas_grid           | ROAS by country/campaign/creative (blended cost)                                 | fact_daily_player + dim_campaign + reconciled cost (see below)                              | Hourly         | Embedded Analyst  |
|             | marts.cost_reconciled           | Single source of truth for spend (direct overrides AppsFlyer when available)    | raw.appsflyer_cost + raw.direct_networks (priority: direct > MMP)                          | Hourly         | Analytics Engineer|
|             | marts.ltv_curves                | Actual + predicted 90-day LTV per cohort                                         | fact_daily_player + MLflow predictions                                                      | Daily          | Data Scientist    |
|             | features.player_features_daily  | 500+ ML features (online + offline Feature Store)                                | All silver tables                                                                           | Daily          | Data Scientist    |
| **Consumption** | Hex projects (10 core notebooks/dashboards) + MLflow Model Registry + Slack alerts | —                                                                                 | —                                                                                           | —              | All teams         |

**Data Flow**

```
Game Client (all behavioural + revenue + ad impressions)
      ↓ HTTPS/Kafka
Confluent Cloud → topic: telemetry.raw
      ↓
Delta Live Tables (streaming) → bronze.events_raw
      ↓
dbt Core + Photon (streaming + incremental)

AppsFlyer Raw Data (installs + events + cost)
      ↓ S3 daily Parquet
Auto Loader → bronze.appsflyer_*

Meta / Google / TikTok direct APIs (top 3 networks only)
      ↓ Airbyte + webhooks
bronze.direct_networks.*

                  ↓ dbt silver models (player spine + blended attribution)
                  ↓ dbt gold marts + cost_reconciled (direct spend wins)
                  ↓
Hex dashboards + MLflow Feature Store + Model Serving
```

**The 10 Hex Projects**

| # | Hex Project Name                      | What You See When You Open It                                                                                               | Primary Users                   | Refresh | Key Tables Used (Gold + Silver)                              |
|  --  |  --  | -- | -- | -- | -- |
| 1  | Studio Overview P&L                   | Yesterday’s total revenue, spend, profit, cash runway, burn multiple, 30-day ROAS, LTV payback – one screen. | CEO, CFO, all leadership       | Hourly | cost_reconciled, fact_daily_player_summary, ltv_curves       |
| 2  | UA Performance (the “war room”)       | Heat-map + tables: ROAS by country / network / creative / campaign – last 1/7/30 days. Drill to creative thumbnails. | CMO, UA team                    | Hourly | daily_roas_grid, cost_reconciled, dim_campaign               |
| 3  | Retention & LTV Curves                | Classic cohort curves (D1/D7/D30/D90) by install source, country, campaign. Predicted vs actual LTV overlay. | Product, UA, Finance            | Daily  | cohort_retention, ltv_curves, fact_acquisition               |
| 4  | Monetisation Funnel                   | Conversion funnel: session → ad view → rewarded watch → IAP initiate → purchase complete – broken down by cohort. | Product, Monetisation team      | Hourly | fact_sessions, fact_ad_revenue, fact_purchases               |
| 5  | Live-Ops & Events ROI                 | Calendar view + ROI table for every event, battlepass, sale in the last 90 days. Auto-highlights negative-ROI ones. | Live-Ops, Product               | Daily  | liveops_roi, fact_offers, fact_purchases                     |
| 6  | Cash Runway & Forecast                | Burn rate last 30 days, current runway (months), forward 12-month P&L forecast (using predicted LTV). | CFO, CEO, board                 | Daily  | fact_daily_player_summary, cost_reconciled, ltv_curves       |
| 7  | Ad Revenue Health                     | ARPDAU, eCPM by network/placement/country, impression volume, fill rate, fraud alerts. | Ad-mon team, Finance            | Hourly | fact_ad_revenue, fact_sessions                               |
| 8  | Player Segmentation Explorer         | Interactive segment builder: Whales, Churn-risk, Re-activatable, Sleeping payers, etc. – with size & LTV. | Product, Marketing, Live-Ops    | Daily  | player_segments, features.player_features_daily              |
| 9  | Data Quality Monitoring              | Red/yellow/green health of every pipeline, row counts vs yesterday, % nulls in key columns, late-arriving data alerts. | Everyone (pinned in #data-alerts) | Every 15 min | _internal databricks + dbt test results                      |
| 10 | ML Model Monitoring                   | Drift detection, accuracy, and feature importance for the three live models (LTV, churn, creative scorer). | Data Science, Leadership        | Hourly | MLflow registry + feature_store                              |

Here’s a realistic, actionable business plan I would present (and execute) if I were hired as a **Data Strategist** at a mid-to-large game development company (PC/console, mobile, or live-service focused). This is the kind of document I’d hand to the CPO, CEO, and Head of Studio on day 30–60.

### Another Plan

#### 1. Current State Assessment (Month 1–2)

- Full instrumentation audit (events, tracking quality, data warehouse schema)
- Identify dark data pools and single points of failure
- Map current KPIs vs. industry best-in-class (retention curves, ARPPU, conversion funnels, session length distribution)
- Player segmentation audit (RFM, behavioral cohorts, whale taxonomy)
- Competitive benchmarking (Sensor Tower, GameRefinery, data.ai, public GaaS reports)

#### 2. Data Platform & Infrastructure (Months 1–6)

- Build or enforce a “golden dataset” in Snowflake/BigQuery/Redshift
- Implement end-to-end event taxonomy (common events library used by UE5 + Unity + backend)
- Real-time dashboard stack: Amplitude/Looker + custom Superset for analysts
- Player-level 360 table (the single source of truth)
- Privacy-first design from day 1 (GDPR/CCPA/KIDS safe, server-side tracking where needed)

#### 3. Core KPI Framework (The North Star Dashboard)

Live Games
- D1/D7/D30 retention
- Conversion to payer (Day 0 → Day 30)
- ARPPU & ARPU trends (rolling 28-day)
- LTV predictions (actuals vs. predicted at Day 0, 7, 14)
- Payback time per channel/source
- Churn prediction score distribution
- Engagement depth (session count, length, feature adoption)

Premium / Single-player with DLC
- Pirate-to-payer conversion (if applicable)
- Review sentiment → sales elasticity
- DLC/bundle attach rate
- Completion % vs. monetization drop-off points

#### 4. Monetization Optimization Playbook

- A/B testing framework at scale (10–40 tests running permanently)
- Dynamic pricing & personalized offers engine (20–50% uplift typical)
- Battle pass / season optimization (grind time vs. revenue curve)
- Whale retention program (separate segmentation + concierge triggers)
- Ad monetization if hybrid (RV/ECPM optimization, waterfall → bidding)

#### 5. Player Experience & Retention Lab

- Churn prediction model → automated win-back campaigns (80%+ precision target)
- Early warning system for rage quits / softlocks using anomaly detection
- Feature adoption heatmaps feeding directly into JIRA backlog scoring
- Sentiment analysis pipeline (Discord + in-game feedback + app store reviews)

#### 6. UA & Marketing Efficiency

- LTV prediction at Day 0 with ±15% accuracy (using lookalike + on-device signals where legal)
- ROAS-based smart bidding integration (Apple SKAdNetwork + Google + MMPs)
- Creative performance data loop → feed insights back to creative team weekly
- Channel mix optimization (paid → organic → cross-promo)

#### 7. Organizational Integration

- Embed data analysts inside every feature team (squad model)
- “Data Friday” – weekly 60-minute readout to entire studio (no slides longer than 10 pages)
- Green/Yellow/Red metric alerts pushed to Slack/MS Teams
- Post-mortem template always includes data appendix

#### 8. 18-Month Financial Impact Targets

- +30–50% LTV increase (through personalization + churn reduction)
- -40% payback period on UA (better predictions + channel optimization)
- +15–25% conversion rate (funnel optimization + dynamic offers)
- 2–3 months faster feature validation (instead of gut-feel launches)
- Total incremental revenue impact: $15M–$60M+ depending on current scale

#### 1. The One Golden Dashboard (Live in Looker or Amplitude)

Updated in real-time or at worst every 4 hours. Accessible to every producer, designer, and C-level.

Key charts (all with 7-day, 30-day, and 90-day trends + YoY if historical data exists):

- Daily Active Users (DAU) & Monthly Active Users (MAU)
- D1 / D7 / D30 Retention curves (new users only, rolling 28-day cohorts)
- Day 0 → Payer conversion (rolling 7-day and 28-day)
- ARPU & ARPPU (rolling 28-day)
- Predicted LTV at Day 7 vs. Actual LTV at Day 90 (simple regression — accuracy starts at ~70% and climbs)
- Revenue last 30 days vs. previous 30 days (with contribution breakdown: IAP vs. ads)
- Payback time by top 5 UA channels
- “Impact Table” — every feature/update shipped in last 60 days ranked by % impact on D7 retention and revenue

#### 2. The 360-Day Player Table (the single source of truth)

One row per player in Snowflake/BigQuery with these columns (minimum):

- user_id, install_date, country, platform, acquisition_source
- first_purchase_date, total_spend, days_since_last_session
- D1-D30 retention flags
- behavioral segment (new, engaged, lapsing, whale, etc.)
- last 5 events performed + timestamps

This table powers every report above and is queryable by any analyst in <5 seconds.

#### 3. Automated Weekly Insight Email (“Data Monday”)

Sent every Monday at 9:00 AM to entire studio (100–400 people).

Subject line format:  
“Week 23 │ Retention +12% ↑ │ Revenue +$312k ↑ │ Battle Pass v3.2 is working”

Body (never longer than what fits on a phone screen):

- 3 green arrows / red arrows (the 3 biggest movers)
- 1-sentence explanation of why
- Link to the golden dashboard
- One “watch out” yellow flag

#### 4. The “Kill Switch” Alert

Slack/Teams alert that fires if any of these happen:

- D1 retention drops >15% vs. 7-day average
- Crash rate >3%
- Revenue drops >20% day-over-day
- Payback on any UA channel >180 days
