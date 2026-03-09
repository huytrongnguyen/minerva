# Project Memory — thinker (Data-Informed Decision Platform)

## Project Overview
Mobile game studio ML platform. LTV prediction using D3 behavioral features → D30 revenue label.
Game: `ballistar`. Launched: 2025-05-08.

## Key Repos / Paths
- `thinker/models/` — Spark SQL models (spark_processor.py framework)
- `thinker/vibe/` — ML layer (train, predict, evaluate, Airflow DAGs)
- `thinker/docs/` — Platform docs (authoritative spec)
- `minerva/processor/spark_processor.py` — existing Spark job runner (DO NOT MODIFY)
- `minerva/processor/spark-process.sh` — bash launcher (DO NOT MODIFY)

## Infrastructure Constraints
- Data from Trino (Iceberg tables) via JDBC — never re-ingest raw events
- spark_processor.py framework: Jinja2 SQL, source() registers temp view, create_or_replace_table() sets output
- No extra args can be added to spark-process.sh (fixed: product_id event_date models libs)
- Each window gets its own SQL file (features_d1.sql, features_d3.sql, features_d7.sql) with `{% set window = N %}` at top

## Current State (as of 2026-03-06)
Pipeline stage: **Layer 3 complete — curated features + labels done. Next: ML training.**

### Completed files
- `models/shared/raw/preprocess/user_identity.sql` — cohort identity + is_organic, row_number() dedup
- `models/ballistar/raw/preprocess/user_session.sql` — session events from etl_logout
- `models/ballistar/raw/preprocess/user_activity.sql` — purchases/levels/tutorials from etl_inapp_event
- `models/shared/curated/features_d3.sql` — D3 feature table (see Feature Catalog §3)
- `models/shared/curated/ltv_labels.sql` — D30 label table (total_spend_usd_d30, total_trans_d30)

### Key SQL patterns
- `days_to_substract - days_to_add` = cohort install offset (D3: 4-1=3, LTV: 33-1=32)
- `user_activity.sql` line 17-18: cohort filter = exact day, event filter = between 0 and N
- features_d3 drives from `user_identity` LEFT JOIN feature_session USING(user_id) LEFT JOIN feature_activity USING(user_id) — includes zero-session users
- Progression features (max_level_reached_d3, tutorial_completion_flag_d3) and first_purchase_hours_from_install_d3 are NULL-retained (no COALESCE)

### D0 convention
D0 = NRU install day. D3 = 3 days after D0. Window filter `between 0 and 3` = 4 days inclusive. CORRECT.

### FEATURE_COLS_D3 (see 2.04 §7 for full list)
Attribution: country_code, platform, is_organic, media_source, campaign_id, appsflyer_id
Session cumulative: session_count_d3, total_playtime_seconds_d3, avg_session_seconds_d3, days_active_d3, days_active_ratio_d3
Session temporal: session_count_d0, total_playtime_seconds_d0, session_count_d1, total_playtime_seconds_d1
Progression (NULL-retained): max_level_reached_d3, tutorial_completion_flag_d3
Monetisation: total_trans_d3, total_spend_usd_d3
Stage 2 only: first_purchase_hours_from_install_d3 (NULL for non-payers)
Training-time derived: d1_retained_flag=(session_count_d1>0), has_purchased_d3=(total_trans_d3>0)

## Next Step: ML Training (Layer 4B)
- Read curated/features_d3 + curated/ltv_labels from MinIO, join on user_id + part_date
- Two-stage LightGBM: Stage 1 = payer classifier, Stage 2 = payer LTV regressor (payers only)
- Target: log_ltv_d30 = LOG1P(total_spend_usd_d30), back-transform with EXPM1
- Time-series split: train on part_date < T-90, validate on T-90 to T-30 (NEVER shuffle)
- Min 60 days cohort history before first training run (ballistar: earliest ~2025-07-08)
- Artifacts: model_stage1.pkl, model_stage2.pkl, label_encoder.pkl, feature_names.json, metrics.json
- Output path: {lakehouse.location}/{product_id}/models/d3/{run_date}/
- Also log to MLflow + upsert to ltv.model_registry in Postgres

## Model Card
- Go/no-go: Pearson r >= 0.65 on held-out cohorts before production
- Target: r >= 0.75 after 180-day cohort window
- Regression guard: fail if RMSE regresses > 15% vs prior model
- Segment thresholds: High >$15, Mid $5-15, Low $0.50-5

## Airflow DAG Pattern
- `from airflow import DAG` import is REQUIRED in every DAG file — Airflow's file scanner looks for this string to identify DAG modules. It is NOT a dead import even if DAG is not referenced directly.
- `create_dag()` in functions/shared.py hardcodes `catchup=True`, `depends_on_past=True`, `wait_for_downstream=True`, `max_active_runs=1`
- `spark_submit_operator_with_trino` → uses trino-jdbc-368.jar; `spark_submit_operator_with_postgres` → uses postgresql-42.7.8.jar

## User Preferences
- Do not modify spark_processor.py or spark-process.sh
- Do not add extra arguments to spark-process.sh
- Keep features_d3.sql independent (no shared template reuse via Jinja2 at runtime)
- NULL-retained features: do NOT coalesce to 0 where semantics would be wrong
- Docs are kept authoritative: 2.04 Feature Catalog > 1.02 Architecture for feature details

## Docs Authority Order
2.05 LTV Model Card > 2.04 Feature Catalog > 1.02 Architecture (for ML/feature details)
2.02 Metrics Definition is the single source of truth for KPI formulas
2.06 Metric Catalog is the authoritative YAML + FastAPI spec for governed metric definitions

## Platform Terminology (enforced — use these exact terms)
- "upstream event tables" — NOT "must-have raw tables". Central team's Iceberg tables: installs, sessions, purchases, AF DataLocker events.
- "game-specific ingestion" — this team owns batch (Airflow + game APIs) and streaming (Kafka only). DataLocker is NOT this team's responsibility.
- "MinIO Iceberg" — NOT "MinIO parquet". All zones use Iceberg format as of architecture v3.0.
- "Phase N" — NOT "Horizon N". Roadmap uses Initiative → Phase → Deliverable (3.01 v2.0).
- Metric Catalog = standalone FastAPI HTTP service (NOT a shared Python library). ASP.NET Dashboard Builder calls it over HTTP.
- "Horizon" references are stale — replace with Phase numbers when encountered.

## Dashboard Builder — Key Design Decisions (for implementation)
- Tech: ASP.NET 10 (C#) backend + React 18 + Bootstrap 5 + C3.js (NOT Recharts)
- Two modes: Metrics mode (→ Metric Catalog Service HTTP) and Raw Data mode (→ Trino JDBC)
- **Semantic layer** (v1.1 addition): Raw Data mode has two table schema types:
  - `consistent`: AppsFlyer DataLocker, MMP reports, curated shared tables — physical column names same across all games; templates use `table` + `column`
  - `game_specific`: `etl_inapp_event`, `etl_logout`, `raw_ingestion.{product_id}_*` — schemas differ per game; templates use `semantic_table` + `semantic_field`
- `configs/event_mapping/{product_id}.yaml` is shared between 2.08 (dashboard) and 2.10 (ingestion):
  - `sources` section → ingestion validation (null rates, types)
  - `semantic_tables` section → maps semantic table IDs to physical table + column names per game
  - `events` section → raw event_name → display label + category
  - `dimensions` section → column value display mapping
- `semantic_tables.{id}.semantic_fields` maps standard field names → game-specific physical column names; supports optional `transform` (e.g. `duration_ms / 1000.0`)
- `event_category` filter shorthand in templates: expands `event_name IN (...)` by looking up category from `dashboard.event_mappings` — avoids hardcoding game event names in templates
- Postgres tables: `dashboard.configs` (JSONB layout), `dashboard.event_mappings` (display), `dashboard.semantic_table_mappings` (physical resolution)
- `EventMappingSync` .NET tool syncs both YAML sections → Postgres on each deployment
- Table catalog: `catalog/raw_tables.yaml` — lists allowed queryable tables with `schema_type` field
- Templates: `configs/templates/{name}.yaml` — consistent tables use physical refs, game_specific tables use semantic refs
- Query guardrails: SELECT only, date range mandatory, PII excluded, 30s timeout, LIMIT auto-append, parameterized values

## Report System Architecture (minerva/DataManager)
Key files:
- `DataManager/Product/ReportDefinition.cs` — domain model (ReportDefinition, MeasureDefinition, ViewDefinition, ReportResult)
- `DataManager/Product/ProductReportService.cs` — partial ProductService with GetDashboardDefinition + ExecuteReport
- `DataManager/Product/ReportQueryBuilder.cs` — converts ReportDefinition → Trino SQL
- `ClientApp/.../core/product/product-report.ts` — TS types + DashboardDefinitionModel + ReportResultModel
- `ClientApp/.../views/reports/dashboard.view.tsx` — generic DashboardView + ReportComponent

Design decisions (confirmed, do not re-propose alternatives):
- ReportDefinition is pure domain — not C3 config, not SQL. SQL is built by ReportQueryBuilder, columns format built by BuildResult.
- Measure Name is used as-is as SQL alias (`AS "Name"`) and as column key in result — no slug/transform for data processing.
- RouteId (lowercase+hyphens) used ONLY for URL routing, never in SQL or data logic.
- ReportResult returns columnar `List<List<object>> Data` (C3 columns format) + `List<string>? Groups` (breakdown pivot values for C3 stacking).
- BuildResult is a single method: breakdown path returns Groups; flat path returns Groups=null.
- API: GET `/api/products/{productId}/dashboard/{dashboardId}` → DashboardDefinition (full definition incl. layout + chart hints). POST `/api/products/{productId}/reports/execute` body={report:ReportDefinition} → ReportResult.
- Client receives full DashboardDefinition; ReportComponent POSTs each ReportDefinition independently (no singleton conflict — uses fetch not subscribe).
- DashboardView groups reports by rowIndex/colIndex → Bootstrap grid. ReportComponent derives y.fields from groups (breakdown) or measure names (flat); y2.fields from secondaryAxis flag; stacked from groups presence or measure.stacked.
- MeasureDefinition.ChartType + Stacked + SecondaryAxis are rendering hints passed through to client — not used server-side.
- Do NOT use static readonly for dashboard definitions (hard to debug). Use inline switch expression called at request time.
- do NOT use Slug() to transform measure names — user names measures explicitly.

## Platform Architecture Summary (docs reference)
- 1.01 v4.1 — Vision & Strategy (north star)
- 1.02 v3.0 — Architecture (6 layers: Ingestion → Preprocess → Storage → Analytics/ML → AI Intelligence → Decision)
- 2.06 v1.0 — Metric Catalog (YAML schema, FastAPI spec, 17 metrics, governance)
- 2.07 v1.0 — MCP Server and Claude Data Agent (8 tools, 2 scopes, 8 guardrails, Python 3.11+)
- 2.08 v1.1 — Dashboard Builder (ASP.NET 10 + React 18; Metrics mode + Raw Data mode; semantic layer for game-specific tables)
- 2.09 v1.0 — Campaign Optimization Engine (Thompson Sampling, Beta(α,β), ±15% cap, audit log lifecycle, Phase 3 human-in-loop → Phase 4 semi-automated)
- 2.10 v1.0 — Game-Specific Ingestion (batch Airflow DAG pattern + Kafka Structured Streaming; Iceberg raw zone; onboarding checklist; event field mapping YAML at configs/event_mapping/{product_id}.yaml)
- 3.01 v2.1 — Execution Roadmap (Initiative → Phase → Deliverable; added D1.8 Metric Catalog, D1.9 Dashboard Builder, D2.6 MCP Server, D3.9 Campaign Opt Engine v1, D3.10 Dashboard Builder Raw mode, D4.3 Campaign Opt Engine v2)
