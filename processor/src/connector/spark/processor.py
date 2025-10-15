from typing import Any
from pyspark.sql import SparkSession

from src.connector.spark import transformer
from src.connector.spark.data_store import load_data, save_data
from src.settings.job_settings import JobSettings
from src.settings.model_settings import ModelSettings, ModelLayout
from src.settings.product_settings import ProductSettings
from src.shared import file_utils

def run(spark: SparkSession, product_settings: ProductSettings, job_settings: JobSettings):
  settings = product_settings.__dict__ | {
    'product_id': job_settings.product_id,
    'event_date': job_settings.event_date
  }

  for file_name in job_settings.models.split(','):
    file_path = f'{job_settings.config_dir}/{file_name}'
    if file_path.endswith('.sql'):
      sql = file_utils.load_text(file_path)
      process_sql(spark, sql, settings)
    elif file_path.endswith('.json'):
      model = ModelLayout(**file_utils.load_json(file_path))
      process(spark, model, settings)
    else:
      print(f'Unknown file type of {file_path}')

def process_sql(spark: SparkSession, sql: str, settings: dict[str, Any]):
  print(f'sql = {sql}')

def process(spark: SparkSession, model: ModelLayout, settings: dict[str, Any]):
  if len(model.sources) > 1: # multi sources to single target
    print('multi sources')
  else: # single source to multi targets
    source_data = load_data(spark, ModelSettings(**model.sources[0]), settings)
    if source_data == None:
      print(f'No data received')
      return

    for target in model.targets:
      target_model = ModelSettings(**target)
      target_data = transformer.process(source_data, target_model, settings)
      # target_data.printSchema()
      # target_data.show(5, False)
      save_data(target_data, target_model, settings)
