import sys

from pyspark.sql import SparkSession
from src.core import loader
from src.core import standardizer
from src.shared import file_utils
from src.settings.job_settings import JobSettings
from src.settings.product_settings import ProductSettings

def main():
  if len(sys.argv) < 2:
    raise ValueError('No arguments passed.')

  settings = JobSettings.parse(sys.argv[1:])
  product_settings = ProductSettings(**file_utils.load_json(f'{settings.config_dir}/{settings.product_id}/profile.json'))

  # Initialize Spark session with MinIO configurations
  name = f'minerva::{settings.product_id}::{settings.action}::{settings.models}::{settings.event_date}'
  spark = SparkSession.builder.appName(name).getOrCreate()
    # .config("spark.hadoop.fs.s3a.endpoint", "http://minio:9000") \
    # .config("spark.hadoop.fs.s3a.access.key", "admin") \
    # .config("spark.hadoop.fs.s3a.secret.key", "password") \
    # .config("spark.hadoop.fs.s3a.path.style.access", "true") \
    # .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem") \
    # .getOrCreate()

  if settings.action == 'load':
    loader.run(spark, product_settings, settings)
  elif settings.action == 'standardize':
    standardizer.run(spark, product_settings, settings)
  else:
    print(f'Unknown action: {settings.action}')

  # Stop Spark session
  spark.stop()

if __name__ == "__main__":
  main()