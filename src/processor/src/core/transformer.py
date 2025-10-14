import re
from typing import Any
from pyspark.sql import DataFrame, Column
from pyspark.sql.functions import lit, col, to_date
from src.settings.model_settings import DataColumn, DataModel
from src.shared import string_utils

def process(source_data: DataFrame, target: DataModel, settings: dict[str, Any]):
  target_data = source_data

  target_columns = [DataColumn(**column) for column in target.columns]

  for column in target_columns:
    # add column if not existed
    if (column.name not in target_data.columns):
      print(f'Column "{column.name}" does not exist, try to create an empty column.')
      target_data.withColumn(column.name, lit(None).cast(column.type))

    # chain column processing
    if column.transform:
      target_column = col(column.name)
      for func in column.transform:
        target_column = with_column(target_column, func, settings)
        if target_column is not None: target_data = target_data.withColumn(column.name, target_column)

    # rename column
    if column.alias: target_data = target_data.withColumnRenamed(column.name, column.alias)

  column_names = [column.alias or column.name for column in target_columns if not column.drop]
  target_data = target_data.selectExpr(*column_names)

  target_data.printSchema()
  target_data.show(5, False)

  print(f'Try to save data to "{string_utils.parse(target.location, settings)}"')

def with_column(column: Column, func: str, settings: dict[str, Any]):
  (name, args) = get_function_name_and_arguments(func)
  # predefined spark functions
  if name == 'cast': return column.cast(args[0])
  elif name == 'to_date': return to_date(column)
  elif name == 'col': return col(args[0])
  # custom functions
  elif name == 'set_product_id': return lit(settings.get('product_id'))
  elif name == 'set_event_date': return lit(settings.get('event_date'))
  else:
    print(f'Function "{name}" was not declared.')
    return None

def get_function_name_and_arguments(func: str) -> tuple[str, list[str]]:
  match = re.match(r'(.*?)\((.*)\)', func)
  if match: return (match.group(1).strip(), [match.group(2).strip()])
  else: return (func, [])
