# Minerva

## Architecture Overview

- **Airflow**: Orchestrates the pipeline with `CeleryExecutor`, PostgreSQL metadata database, and Redis for scalability.
- **PySpark with Iceberg**: Processes raw data (e.g., deduplication, filtering) and writes to an Iceberg table in MinIO for analytics
- **MinIO**: Stores raw CSV and Iceberg table data in an S3-compatible bucket.
- **Docker**: Assumes Airflow, PySpark with Iceberg, and MinIO are running in separate Docker containers.

## Project Structure

```
mercury/
└── README.md                               # Setup instructions
├── docker-compose.yml                      # Docker Compose configuration
├── images/                                 # All Dockerfiles + init-sh (starter) scripts
├── airflow/
|   ├── dags/
|   |   └── sample_bi.py                    # Generates DAGs per app_id
|   ├── config/                             # Airflow config
|   |       └── airflow.cfg
|   ├── logs/                               # Airflow logs
|   └── plugins/                            # Airflow plugins (optional)
├── spark/
|   ├── config/
|   |       └── spark-defaults.conf
|   └── libs/
│       ├── aws-java-sdk-bundle-1.12.761.jar
│       ├── hadoop-aws-3.3.4.jar
│       └── iceberg-spark-runtime-3.5_2.12-1.4.3.jar
└── jobs/
    ├── python/
    |   └── appsflyer-puller/
    │       ├── crawler.py                  # Script to craw data from API and save to MinIO
    |       └── Dockerfile
    ├── dbt/
    |   └── smart_view/
    │       ├── dbt_project.yml
    │       ├── profiles.yml
    |       └── models/
    │           ├── sources.yml
    │           ├── schema.yml
    │           ├── standardize/
    │           ├── golden/
    |           └── insights/
    └── spark
        ├── spark-minio-processor.py        # PySpark script to process data into MinIO
        └── spark-iceberg-processor.py      # PySpark script to process data into Iceberg/MinIO
```

## Deployment

### Prerequisites

- Linux environment
- Docker
- Docker Compose
- 32 GB RAM and 16-core CPU (can be changed in the config file — read the article for details).

### Build and Deploy

- Run `colima start --cpu 4 --memory 4 --disk 64 --vm-type=qemu` (for MacOS)
- Run `docker-compose down -v --remove-orphans`
- Run `docker-compose up -d --build`

This starts:
- Spark Master (accessible at http://localhost:8080)
- Spark Worker
- MinIO (accessible at http://localhost:9000 for API, http://localhost:9001 for console)

## Getting Started

- Log in to MinIO console with admin/password and create a bucket named `mercury` (first time only).
- Submit `spark-minio-job.py` for testing
  ```sh
  docker exec -it spark-master spark-submit \
  --master spark://spark-master:7077 \
  /opt/bitnami/spark/apps/spark-minio-processor.py
  ```

There are two data lake logics: Copy-on-Write (CoW) vs Merge-on-Read (MoR). The default is already CoW.

**Copy-on-Write (CoW)**
- Updates create entirely new data files
- Simple implementation, consistent reads
- Writes are expensive (rewrites entire files)
- Reads are fast (no merge needed)
- Better for read-heavy workloads

**Merge-on-Read (MoR)**
- Updates stored as separate delta/log files
- Writes are fast (just append changes)
- Reads are slower (must merge base + deltas)
- Better for write-heavy workloads
- Requires periodic compaction

File formats such as Parquet in a data lake are immutable by nature, meaning once a file is written, it cannot be modified. However, lakehouse table formats need ways to handle updates, deletions, and insertions efficiently while maintaining the benefits of the underlying immutable storage format.

```sql
-- Create table with CoW (default in Iceberg)
CREATE TABLE catalog.db.table (
    id BIGINT,
    data STRING
) USING iceberg
TBLPROPERTIES (
    'write.update.mode'='copy-on-write',
    'write.delete.mode'='copy-on-write'
);

-- Create table with MoR
CREATE TABLE catalog.db.table (
    id BIGINT,
    data STRING
) USING iceberg
TBLPROPERTIES (
    'write.update.mode'='merge-on-read',
    'write.delete.mode'='merge-on-read'
);
```

Also, can use a mixed mode of CoW and MoR like this:

```sql
-- Create table with MoR
CREATE TABLE catalog.db.table (
    id BIGINT,
    data STRING
) USING iceberg
TBLPROPERTIES (
    'write.update.mode'='merge-on-read',
    'write.delete.mode'='copy-on-write'
);
```