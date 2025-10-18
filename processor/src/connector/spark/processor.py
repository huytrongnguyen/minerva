from typing import Any
from pyspark.sql import SparkSession, DataFrame

from settings.job_settings import JobSettings
from settings.model_settings import ModelSettings, ModelLayout
from settings.product_settings import ProductSettings
from shared import file_utils

from .data_store import load_data, save_data, merge_data
from .transformer import transform_dataset

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
      process(spark, model, settings, job_settings)
    else:
      print(f'Unknown file type of {file_path}')

def process_sql(spark: SparkSession, sql: str, settings: dict[str, Any]):
  print(f'sql = {sql}')

def process(spark: SparkSession, model: ModelLayout, settings: dict[str, Any], job_settings: JobSettings):
  if len(model.sources) > 1: # multi sources to single target
    print('multi sources')
  else: # single source to multi targets
    source_model = ModelSettings(**model.sources[0])
    source_data = load_data(spark, source_model, settings)
    if source_data == None:
      return

    for target in model.targets:
      target_model = ModelSettings(**target)
      if target_model.merge and target_model.sql_model: # merge source into target
        target_data = load_data(spark, target_model, settings)
        if target_data == None:
          return

        source_data.createOrReplaceTempView(source_model.name)
        target_data.createOrReplaceTempView(target_model.name)
        sql = file_utils.load_text(f'{job_settings.config_dir}/{target_model.sql_model}')
        target_data = execute_query(spark, sql)
        merge_data(spark, target_data, target_model, settings)
      else:
        target_data = transform_dataset(source_data, target_model, settings)
        save_data(target_data, target_model, settings)

def execute_query(spark: SparkSession, query: str) -> DataFrame:
  target_data = spark.sql(query)
  return target_data