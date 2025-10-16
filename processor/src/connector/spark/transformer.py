from functools import reduce
from typing import Any
from pyspark.sql import DataFrame, Column
from pyspark.sql.functions import lit, to_date, col, expr

from settings.model_settings import ColumnSettings, ModelSettings
from shared import string_utils

def process(source_data: DataFrame, target_model: ModelSettings, settings: dict[str, Any]) -> DataFrame:
  target_columns = [ColumnSettings(**column) for column in target_model.columns]
  target_data = reduce(lambda data, column: process_column(data, column, settings), target_columns, source_data)
  return target_data.selectExpr(*[column.alias or column.name for column in target_columns if not column.drop])

def process_column(data: DataFrame, target_column: ColumnSettings, settings: dict[str, Any]) -> DataFrame:
  col_name = target_column.name
  if col_name not in data.columns:
    print(f'Column "{col_name}" does not exist, try to create an empty column.')
    data = data.withColumn(col_name, lit(None).cast(target_column.type))

  if target_column.transform:
    data = reduce(lambda data, func: data.withColumn(col_name, transform_column(col_name, func, settings)), target_column.transform, data)

  if target_column.alias: data = data.withColumnRenamed(target_column.name, target_column.alias)

  return data

def transform_column(column_name: str, func: str, settings: dict[str, Any]) -> Column:
  column = col(column_name)

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
    return column
