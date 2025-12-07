from pyspark.sql import SparkSession

from settings.job_settings import JobSettings
from settings.model_settings import ModelLayout
from settings.product_settings import ProductSettings
from shared import file_utils

from . import json_processor
from . import sql_processor

def run(spark: SparkSession, product_settings: ProductSettings, job_settings: JobSettings):
  for file_name in job_settings.models.split(','):
    file_path = f'{job_settings.config_dir}/{file_name}'
    if file_path.endswith('.sql'):
      sql = file_utils.load_text(file_path)
      sql_processor.run(sql, spark, product_settings, job_settings)
    elif file_path.endswith('.json'):
      model = ModelLayout(**file_utils.load_json(file_path))
      json_processor.run(model, spark, product_settings, job_settings)
    else:
      print(f'Unknown file type of {file_path}')
