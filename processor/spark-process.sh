#!/usr/bin/env bash
set -euo pipefail # fail fast on errors

# Usage: spark-process.sh <product_id> <event_date> <models>
# Example: spark-process.sh gem 2026-01-14 shared/curated/daily_installs.sql

product_id=$1
event_date=$2
models=$3
libs=""

if [ $# -gt 3 ]
then
  libs=",$4"
fi

model_paths="/opt/airflow/models"

# driver runs in Airflow → use 2g to leave room for others
# avoid dynamic alloc in local
# optimized for Mac M4: 2 workers × 2 cores × 2g memory

spark-submit \
  --name "minerva::process::$product_id::$event_date::$models" \
  --master local[*] \
  --deploy-mode client \
  --driver-memory 2g \
  --executor-memory 2g \
  --conf spark.hadoop.fs.s3a.endpoint=http://minio:9000 \
  --conf spark.hadoop.fs.s3a.access.key=admin \
  --conf spark.hadoop.fs.s3a.secret.key=password \
  --conf spark.hadoop.fs.s3a.path.style.access=true \
  --conf spark.hadoop.fs.s3a.impl=org.apache.hadoop.fs.s3a.S3AFileSystem \
  --conf spark.hadoop.fs.s3a.connection.ssl.enabled=false \
  --conf spark.hadoop.fs.s3a.aws.credentials.provider=org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider \
  --conf spark.sql.shuffle.partitions=8 \
  --conf spark.sql.adaptive.enabled=true \
  --conf spark.sql.adaptive.coalescePartitions.enabled=true \
  --conf spark.sql.sources.partitionOverwriteMode=dynamic \
  --conf spark.sql.extensions=org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions \
  --conf spark.sql.catalog.iceberg=org.apache.iceberg.spark.SparkCatalog \
  --conf spark.sql.catalog.iceberg.type=rest \
  --conf spark.sql.catalog.iceberg.uri=http://lakekeeper:8181/catalog \
  --conf spark.sql.catalog.iceberg.warehouse=lakehouse \
  --conf spark.sql.catalog.iceberg.io-impl=org.apache.iceberg.hadoop.HadoopFileIO \
  --conf spark.sql.iceberg.merge-schema=true \
  --conf spark.sql.iceberg.check-ordering=false \
  --jars /opt/airflow/libs/hadoop-aws-3.3.4.jar,/opt/airflow/libs/aws-java-sdk-bundle-1.12.262.jar,/opt/airflow/libs/iceberg-spark-runtime-3.5_2.12-1.7.2.jar$libs \
  /opt/airflow/jobs/spark_processor.py model_paths=$model_paths product_id=$product_id event_date=$event_date models=$models
