from pyspark.sql import SparkSession

from settings.job_settings import JobSettings
from settings.product_settings import ProductSettings

from .data_store import load_data, save_data, merge_data

def run(sql: str, spark: SparkSession, product_settings: ProductSettings, job_settings: JobSettings):
  settings = product_settings.__dict__ | {
    'product_id': job_settings.product_id,
    'event_date': job_settings.event_date
  }

  print(f'sql = {sql}')
  print(f'settings = {settings}')