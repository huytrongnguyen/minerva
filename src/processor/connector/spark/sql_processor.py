from typing import Any
from datetime import datetime, timedelta
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType

from settings.job_settings import JobSettings
from settings.product_settings import ProductSettings
from settings.model_settings import ModelLayout, ModelSettings
from shared.string_utils import jinja_env, parse

from .adapter import load_data, save_data

def run(sql_model: str, spark: SparkSession, product_settings: ProductSettings, job_settings: JobSettings):
  model = ModelLayout([], [])

  vars = product_settings.__dict__ | {
    'product_id': job_settings.product_id,
    'event_date': job_settings.event_date
  }

  jinja_env.globals['source'] = lambda params: source(spark, ModelSettings(**params), vars)
  jinja_env.globals['insert_into'] = lambda params: insert_into(model, ModelSettings(**params))
  jinja_env.globals['date_range'] = lambda minus_days, plus_days: date_range(job_settings.event_date, minus_days, plus_days)

  sql_query = parse(sql_model, vars)
  # print(f'sql_query = {sql_query}')

  target_data = spark.sql(sql_query)

  save_data(target_data, model.targets[0], vars)

def source(spark: SparkSession, source_model: ModelSettings, vars: dict[str, Any]) -> str:
  source_data = load_data(spark, source_model, vars)
  if source_data == None: source_data = spark.createDataFrame([], StructType([]))

  source_data.createOrReplaceTempView(source_model.name)

  return source_model.name

def insert_into(model: ModelLayout, target_model: ModelSettings) -> str:
  model.targets.append(target_model)
  return ''

def date_range(date_string: str, days_to_subtract: int, days_to_add: int) -> list[str]:
  date_format = '%Y-%m-%d'
  event_date = datetime.strptime(date_string, date_format)

  start_date = event_date - timedelta(days=days_to_subtract)
  end_date = event_date - timedelta(days=days_to_add)

  date_list = []
  current_date = start_date
  while current_date <= end_date:
    date_list.append(current_date.strftime(date_format))
    current_date += timedelta(days=1)

  return date_list
