# Changelog

## vNext

**Processor**

- Add `vars` to `source`

## 1.3.0
> 2026-01-28

**Processor**

- Load, transform then save data via sql model
- Load, transform then save data via json model
- Load data in date range

## 1.2.0
> 2026-01-23

**Platform**

- Add `spark-defaults.conf` to `spark-master` container to supports Jupyter read data from MinIO
- Add XGBoost, Pandas, Scikit-learn to Airflow, Jupyter

**Pipelines**

- Ingest data stored in Airflow server to MinIO lakehouse in parquet format

**Models**

- Add models
  - Curated
    - Master: `curated/user_profile`
    - Analytical: `curated/daily_installs`, `curated/daily_activity`, `curated/daily_retention`, `curated/daily_ltv`
    - Feature: `curated/reload_feature_group_ltv`
- Update models:
  - Curated: `curated/reload_user_profile`

## 1.1.0
> 2026-01-16

**Platform**

- Initial platform

**Models**

- Add models
  - Raw: `raw/installs_report`, `raw/in_app_events_report`
  - Enriched: `enriched/user_registration`, `enriched/user_activity`, `enriched/user_purchase`
  - Curated: `curated/reload_user_profile`

## 1.0.1
> 2026-01-10

**Processor**

- Update `ModelSettings`
- Save data to external db
- Run sql query in external db as a postprocess
- Aggregate data with Window functions

## 1.0.0
> 2025-10-25

**Processor**

- Release sql models

## v0.0.5
> 2025-10-24

**Processor**

- Load, transform then save data via sql model

## v0.0.4
> 2025-10-18

**Processor**

- Query data via json configuration
- Aggregate data via json configuration
- Merge source into target

## v0.0.3
> 2025-10-15

**Processor**

- Transform data via json configuration
- Restructure codebase

## v0.0.2
> 2025-10-11

**Processor**

- Load and save data via json configuration

## v0.0.1
> 2025-10-04

**Processor**

- Initial project
- Implement sample pyspark app
- Define concept
