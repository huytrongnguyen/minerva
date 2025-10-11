from typing import Any
from pyspark.sql import SparkSession
from shared import file_utils, string_utils
from settings.job_settings import JobSettings
from settings.model_settings import ModelLayout
from settings.product_settings import ProductSettings

def run(spark: SparkSession, models: list[str], productSettings: ProductSettings, jobSettings: JobSettings):
  settings = productSettings.__dict__ | { 'product_id': jobSettings.product_id, 'event_date': jobSettings.event_date }

  for file_name in models:
    file_path = f'{jobSettings.config_dir}/{jobSettings.product_id}/{file_name}'
    if file_path.endswith('.sql'):
      sql = file_utils.load_text(file_path)
      process_sql_model(spark, sql, settings)
    elif file_path.endswith('.json'):
      model = ModelLayout(**file_utils.load_json(file_path))
      process_model(spark, model, settings)
    else:
      print(f'Unknown file type of {file_path}')

def process_sql_model(spark: SparkSession, sql: str, settings: dict[str, Any]):
  print(f'sql = {sql}')

def process_model(spark: SparkSession, model: ModelLayout, settings: dict[str, Any]):
  print(f'model = {model}')
  if len(model.sources) > 1:
    print('multi sources')
  else:
    source = model.sources[0]
    print(f'source = {source}')
    print(f'source.location = {source["location"]}')
    location = string_utils.parse(source['location'], settings)
    print(f'location = {location}')