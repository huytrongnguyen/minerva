#!/usr/bin/env bash
set -euo pipefail # fail fast on errors

# Usage: spark-ingest.sh <product_id> <event_date> <models>
# Example: spark-ingest.sh gem 2026-01-14 shared/curated/daily_installs.sql

product_id=$1
event_date=$2
models=$3

# driver runs in Airflow → use 2g to leave room for others
# avoid dynamic alloc in local
# optimized for Mac M4: 2 workers × 2 cores × 2g memory

spark-submit \
  --name "minerva::ingest::$product_id::$event_date::$models" \
  --master local[*] \
  --deploy-mode client \
  --driver-memory 2g \
  --executor-memory 2g \
  --num-executors 2 \
  --executor-cores 2 \
  --conf spark.hadoop.fs.s3a.endpoint=http://minio:9000 \
  --conf spark.hadoop.fs.s3a.access.key=admin \
  --conf spark.hadoop.fs.s3a.secret.key=password \
  --conf spark.hadoop.fs.s3a.path.style.access=true \
  --conf spark.hadoop.fs.s3a.connection.ssl.enabled=false \
  --conf spark.hadoop.fs.s3a.impl=org.apache.hadoop.fs.s3a.S3AFileSystem \
  --conf spark.dynamicAllocation.enabled=false \
  --conf spark.sql.shuffle.partitions=8 \
  --conf spark.sql.adaptive.enabled=true \
  --conf spark.sql.adaptive.coalescePartitions.enabled=true \
  --conf spark.sql.sources.partitionOverwriteMode=dynamic \
  --jars /opt/airflow/libs/hadoop-aws-3.3.4.jar,/opt/airflow/libs/aws-java-sdk-bundle-1.12.262.jar \
  /opt/airflow/processor/spark_processor.py product_id=$product_id event_date=$event_date models=$models
