from pyspark.sql import SparkSession
from core import processor
from settings.job_settings import JobSettings
from settings.product_settings import ProductSettings


def run(spark: SparkSession, models: list[str], productSettings: ProductSettings, jobSettings: JobSettings):
  processor.run(spark, models, productSettings, jobSettings)