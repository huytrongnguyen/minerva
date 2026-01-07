from typing import Any, Optional
from pyspark.sql import SparkSession, DataFrame, DataFrameWriter

from settings.model_settings import ModelSettings
from shared import string_utils

def load_data(spark: SparkSession, model: ModelSettings, vars: dict[str, Any]) -> Optional[DataFrame]:
  if (model.case_sensitive):
    spark.conf.set('spark.sql.caseSensitive', 'true')

  path = string_utils.parse(model.location, vars)
  print(f'Load {model.type} data from "{path}"')

  try:
    df: DataFrame = spark.read.format(model.type).options(**model.options).load(path)
    if df.head(1):
      return df
    else:
      print(f'Empty from "{path}"')
      return None
  except Exception as ex:
    print(f'Cannot load {model.type} data from "{path}" caused by: ${ex}')
    return None

def save_data(data: DataFrame, model: ModelSettings, vars: dict[str, Any]):
  path = string_utils.parse(model.location, vars)
  print(f'Save data to "{path}" as {model.type}, num_partitions = {model.num_partitions}, partition_by = {model.partition_by}, columns = {"|".join(data.columns)}')

  writer: DataFrameWriter = data.coalesce(model.num_partitions).write.format(model.type).options(**model.options).mode('overwrite')
  if len(model.partition_by) > 0:
    writer = writer.partitionBy(model.partition_by)

  writer.save(path)

def merge_data(spark: SparkSession, data: DataFrame, model: ModelSettings, vars: dict[str, Any]):
  if model.merge and model.temp_location:
    temp_path = string_utils.parse(model.temp_location, vars)
    data.write.parquet(temp_path, 'overwrite')
    data = spark.read.parquet(temp_path)

  save_data(data, model, vars)