from typing import Any
from jinja2 import Environment
from pyspark.sql import SparkSession
from shared import file_utils
from settings.job_settings import JobSettings
from settings.model_settings import ModelLayout
from settings.product_settings import ProductSettings

def run(spark: SparkSession, models: list[str], productSettings: ProductSettings, jobSettings: JobSettings):
  # Set up Jinja environment
  template_engine = Environment()
  template_context = productSettings.__dict__ | { 'product_id': jobSettings.product_id, 'event_date': jobSettings.event_date }

  for file_name in models:
    file_path = f'{jobSettings.config_dir}/{jobSettings.product_id}/{file_name}'
    if file_path.endswith('.sql'):
      sql = file_utils.load_text(file_path)
      process_sql_model(spark, sql, template_engine, template_context)
    elif file_path.endswith('.json'):
      model = ModelLayout(**file_utils.load_json(file_path))
      process_model(spark, model, template_engine, template_context)
    else:
      print(f'Unknown file type of {file_path}')

def process_sql_model(spark: SparkSession, sql: str, template_engine: Environment, template_context: dict[str, Any]):
  print(f'sql = {sql}')

def process_model(spark: SparkSession, model: ModelLayout, template_engine: Environment, template_context: dict[str, Any]):
  print(f'model = {model}')
  if len(model.sources) > 1:
    print('multi sources')
  else:
    source = model.sources[0]
    print(f'source = {source}')
    print(f'source.location = {source["location"]}')
    location = template_engine.from_string(source['location']).render(**template_context)
    print(f'location = {location}')