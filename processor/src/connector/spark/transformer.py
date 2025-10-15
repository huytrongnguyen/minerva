from typing import Any
from pyspark.sql import DataFrame, Column
from pyspark.sql.functions import lit, to_date, col, expr

from src.settings.model_settings import ColumnSettings, ModelSettings
from src.shared import string_utils

def process(source_data: DataFrame, target_model: ModelSettings, settings: dict[str, Any]) -> DataFrame:
  target_data = source_data

  target_columns = [ColumnSettings(**column) for column in target_model.columns]

  for column in target_columns:
    target_data = add_column_if_not_exists(target_data, column)
    target_data = with_column(target_data, column, settings)
    if column.alias: target_data = target_data.withColumnRenamed(column.name, column.alias)

  column_names = [column.alias or column.name for column in target_columns if not column.drop]
  return target_data.selectExpr(*column_names)

def add_column_if_not_exists(data: DataFrame, target_column: ColumnSettings) -> DataFrame:
  if target_column.name in data.columns:
    return data

  print(f'Column "{target_column.name}" does not exist, try to create an empty column.')
  return data.withColumn(target_column.name, lit(None).cast(target_column.type))

def with_column(data: DataFrame, target_column: ColumnSettings, settings: dict[str, Any]):
  if not target_column.transform:
    return data

  target_data = data
  column = col(target_column.name)
  for func in target_column.transform:
    column = transform_column(column, func, settings)
    if column is not None: target_data = target_data.withColumn(target_column.name, column)
  return target_data

def transform_column(column: Column, func: str, settings: dict[str, Any]):
  (name, args) = string_utils.parse_function_name_and_arguments(func)
  # predefined spark functions
  if name == 'cast': return column.cast(args[0])
  elif name == 'to_date': return to_date(column)
  elif name == 'col': return col(args[0])
  elif name == 'expr': return expr(args[0])
  # custom functions
  elif name == 'set_product_id': return lit(settings.get('product_id'))
  elif name == 'set_event_date': return lit(settings.get('event_date'))
  else:
    print(f'Function "{name}" was not declared.')
    return None
