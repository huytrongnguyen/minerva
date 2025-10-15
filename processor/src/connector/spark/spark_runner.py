from pyspark.sql import SparkSession

from src.connector.spark import loader
from src.connector.spark import standardizer
from src.settings.job_settings import JobSettings
from src.settings.product_settings import ProductSettings

def run(product_settings: ProductSettings, job_settings: JobSettings):
  # Initialize Spark session with MinIO configurations
  name = f'minerva::{job_settings.product_id}::{job_settings.action}::{job_settings.models}::{job_settings.event_date}'
  spark = SparkSession.builder.appName(name).getOrCreate()
    # .config("spark.hadoop.fs.s3a.endpoint", "http://minio:9000") \
    # .config("spark.hadoop.fs.s3a.access.key", "admin") \
    # .config("spark.hadoop.fs.s3a.secret.key", "password") \
    # .config("spark.hadoop.fs.s3a.path.style.access", "true") \
    # .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem") \
    # .getOrCreate()

  if job_settings.action == 'load': loader.run(spark, product_settings, job_settings)
  elif job_settings.action == 'standardize': standardizer.run(spark, product_settings, job_settings)
  else: print(f'Unknown action: {job_settings.action}')

  # Stop Spark session
  spark.stop()