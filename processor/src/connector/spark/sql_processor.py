from typing import Any
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType

from settings.job_settings import JobSettings
from settings.product_settings import ProductSettings
from settings.model_settings import ModelLayout, ModelSettings
from shared.string_utils import jinja_env, parse

from .data_store import load_data, save_data, merge_data

def run(sql_model: str, spark: SparkSession, product_settings: ProductSettings, job_settings: JobSettings):
  model = ModelLayout([], [])

  vars = product_settings.__dict__ | {
    'product_id': job_settings.product_id,
    'event_date': job_settings.event_date
  }

  jinja_env.globals['source'] = lambda params: source(spark, ModelSettings(**params), vars)
  jinja_env.globals['insert_into'] = lambda params: insert_into(model, ModelSettings(**params))

  sql_query = parse(sql_model, vars)

  print(f'sql = {sql_query}')

  target_data = spark.sql(sql_query)
  target_data.printSchema()
  target_data.show(5, False)

  save_data(target_data, model.targets[0], vars)

def source(spark: SparkSession, source_model: ModelSettings, vars: dict[str, Any]) -> str:
  source_data = load_data(spark, source_model, vars)
  if source_data == None: source_data = spark.createDataFrame([], StructType([]))
  source_data.createOrReplaceTempView(source_model.name)
  return source_model.name

def insert_into(model: ModelLayout, target_model: ModelSettings) -> str:
  model.targets.append(target_model)
  return ''
