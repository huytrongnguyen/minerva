from typing import Any
from pyspark.sql import SparkSession
from src.core import transformer
from src.core.data_store import load_data
from src.settings.job_settings import JobSettings
from src.settings.model_settings import DataModel, ModelLayout
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
    df = load_data(spark, DataModel(**model.sources[0]), settings)
    if df == None:
      print(f'No data received')
      return
    else:
      for target in model.targets:
        transformer.process(df, DataModel(**target), settings)

# def process(source: DataModel, target: DataModel, settings: dict[str, Any]):
#   print(f'target = {target}')
