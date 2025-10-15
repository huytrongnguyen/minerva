from pyspark.sql import SparkSession

from src.connector.spark import processor
from src.settings.job_settings import JobSettings
from src.settings.product_settings import ProductSettings

def run(spark: SparkSession, product_settings: ProductSettings, job_settings: JobSettings):
  processor.run(spark, product_settings, job_settings)