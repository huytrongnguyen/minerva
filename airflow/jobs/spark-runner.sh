#!/usr/bin/env bash
set -euo pipefail # fail fast on errors

# Usage: spark-runner.sh <product_id> <event_date> <models>
# Example: spark-runner.sh gem 2026-01-14 shared/curated/daily_installs.sql

ICEBERG_HOME=/home/iceberg

product_id=$1
event_date=$2
models=$3
libs=""

if [ $# -gt 3 ]
then
  libs=$4
fi

# driver runs in Airflow → don't go higher 5g
# avoid dynamic alloc in local

spark-submit \
  --name "minerva::$product_id::$event_date::$models" \
  --master spark://jupyter:7077 \
  --deploy-mode client \
  --driver-memory 5g \
  --executor-memory 4g \
  --num-executors 2 \
  --executor-cores 3 \
  --conf spark.hadoop.fs.s3a.endpoint=http://minio:9000 \
  --conf spark.hadoop.fs.s3a.access.key=admin \
  --conf spark.hadoop.fs.s3a.secret.key=password \
  --conf spark.hadoop.fs.s3a.path.style.access=true \
  --conf spark.hadoop.fs.s3a.impl=org.apache.hadoop.fs.s3a.S3AFileSystem \
  --conf spark.dynamicAllocation.enabled=false \
  --conf spark.sql.shuffle.partitions=12 \
  --conf spark.sql.adaptive.enabled=true \
  --conf spark.sql.adaptive.coalescePartitions.enabled=true \
  --conf spark.sql.sources.partitionOverwriteMode=dynamic \
  --jars $libs \
  -- /opt/airflow/processor/spark_processor.py product_id=$product_id event_date=$event_date models=$models
