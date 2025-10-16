from pyspark.sql import SparkSession

from settings.job_settings import JobSettings
from settings.product_settings import ProductSettings

from . import processor

def run(spark: SparkSession, product_settings: ProductSettings, job_settings: JobSettings):
  processor.run(spark, product_settings, job_settings)