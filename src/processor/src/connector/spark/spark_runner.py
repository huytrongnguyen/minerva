from pyspark.sql import SparkSession

from settings.job_settings import JobSettings
from settings.product_settings import ProductSettings

from . import loader, standardizer

def run(product_settings: ProductSettings, job_settings: JobSettings):
  name = f'minerva::{job_settings.product_id}::{job_settings.event_date}::{job_settings.action}::{job_settings.models}'
  spark = SparkSession.builder.appName(name).getOrCreate()

  if job_settings.action == 'load': loader.run(spark, product_settings, job_settings)
  elif job_settings.action == 'standardize': standardizer.run(spark, product_settings, job_settings)
  else: print(f'Unknown action: {job_settings.action}')

  spark.stop()
