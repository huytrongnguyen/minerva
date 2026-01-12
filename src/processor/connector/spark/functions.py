from typing import Any
from pyspark.sql import DataFrame, Column, Window
from pyspark.sql.functions import to_date, upper, lower
from pyspark.sql.functions import lit, to_date, col, expr, upper, lower, datediff
from pyspark.sql.functions import datediff, regexp_replace
from pyspark.sql.functions import count, sum, avg, min, max, count_distinct, collect_list, collect_set, first, last

from settings.model_settings import ColumnSettings
from shared import string_utils

def invoke_column_function(column: Column, func: str, settings: dict[str, Any]) -> Column:
  (name, args) = string_utils.parse_function_name_and_arguments(func)
  # predefined spark functions
  if name == 'cast': return column.cast(args[0])
  elif name == 'to_date': return to_date(column)
  elif name == 'upper': return upper(column)
  elif name == 'lower': return lower(column)
  elif name == 'col': return col(args[0])
  elif name == 'expr': return expr(args[0])
  elif name == 'datediff': return datediff(args[0], args[1])
  elif name == 'regexp_replace': return regexp_replace(column, args[0], args[1])
  # custom functions
  elif name == 'set': return lit(settings.get(args[0]))
  else:
    print(f'Function "{name}" is not defined.')
    return column

def invoke_query_function(data: DataFrame, func) -> DataFrame:
  (name, args) = string_utils.parse_function_name_and_arguments(func)
  # predefined spark functions
  if name == 'where' or name == 'filter': return data.where(args[0])
  elif name == 'drop_duplicates': return data.drop_duplicates(args)
  elif name == 'fillna': return data.fillna(args[0], args[1:])
  else:
    print(f'Function "{name}" is not defined.')
    return data

def invoke_group_by_function(target_column: ColumnSettings) -> Column:
  col_name = target_column.name
  func = target_column.funcs[0]
  (name, args) = string_utils.parse_function_name_and_arguments(func)
  # predefined spark functions
  if name == 'count': return count(args[0]).alias(col_name)
  elif name == 'sum': return sum(args[0]).alias(col_name)
  elif name == 'avg': return avg(args[0]).alias(col_name)
  elif name == 'min': return min(args[0]).alias(col_name)
  elif name == 'max': return max(args[0]).alias(col_name)
  elif name == 'count_distinct': return count_distinct(args[0]).alias(col_name)
  elif name == 'collect_list': return collect_list(args[0]).alias(col_name)
  elif name == 'collect_set': return collect_set(args[0]).alias(col_name)
  else:
    print(f'Function "{name}" is not defined.')
    return col(col_name)

def invoke_order_by_column(func: str) -> Column:
  (order, col_names) = string_utils.parse_function_name_and_arguments(func)
  if order == 'asc': return col(col_names[0]).asc()
  elif order == 'desc': return col(col_names[0]).desc()
  else: return col(order).asc()

def invoke_partition_by_column(data: DataFrame, target_column: ColumnSettings, partition: Window, order_columns: list[Column]) -> DataFrame:
  col_name = target_column.name
  func = target_column.funcs[0]
  (name, args) = string_utils.parse_function_name_and_arguments(func)
  # predefined spark functions
  if name == 'count': return data.withColumn(col_name, count(args[0]).over(partition))
  elif name == 'sum': return data.withColumn(col_name, sum(args[0]).over(partition))
  elif name == 'avg': return data.withColumn(col_name, avg(args[0]).over(partition))
  elif name == 'min': return data.withColumn(col_name, min(args[0]).over(partition))
  elif name == 'max': return data.withColumn(col_name, max(args[0]).over(partition))
  elif name == 'first': return data.withColumn(col_name, first(args[0], ignorenulls = True).over(partition.orderBy(order_columns).rowsBetween(Window.unboundedPreceding, Window.unboundedFollowing)))
  elif name == 'last': return data.withColumn(col_name, last(args[0], ignorenulls = True).over(partition.orderBy(order_columns).rowsBetween(Window.unboundedPreceding, Window.unboundedFollowing)))
  elif name == 'collect_list': return data.withColumn(col_name, collect_list(args[0]).over(partition))
  elif name == 'collect_set': return data.withColumn(col_name, collect_set(args[0]).over(partition))
  else:
    print(f'Function "{name}" is not defined.')
    return col(col_name)