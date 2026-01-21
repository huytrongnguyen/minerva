# Changelog

## vNext

**Improvements**

- Load multiple sources then process with sql file to target
- Ingest data stored in Airflow server to MinIO lakehouse in parquet format
- Add `spark-defaults.conf` to `spark-master` container to supports Jupyter read data from MinIO
- Load data in date range

## 1.0.1
> 2026-01-10

**Features**

- Update `ModelSettings`
- Save data to external db
- Run sql query in external db as a postprocess
- Aggregate data with Window functions

## 1.0.0
> 2025-10-25

**Features**

- Release sql models

## v0.0.5
> 2025-10-24

**Features**

- Load, transform then save data via sql model

## v0.0.4
> 2025-10-18

**Features**

- Query data via json configuration
- Aggregate data via json configuration
- Merge source into target

## v0.0.3
> 2025-10-15

**Features**

- Transform data via json configuration
- Restructure codebase

## v0.0.2
> 2025-10-11

**Features**

- Load and save data via json configuration

## v0.0.1
> 2025-10-04

**Features**

- Initial project
- Implement sample pyspark app
- Define concept
