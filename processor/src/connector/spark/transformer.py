from functools import reduce
from typing import Any
from pyspark.sql import DataFrame, Column, Window
from pyspark.sql.functions import lit, to_date, col, expr
from pyspark.sql.functions import count, sum, avg, min, max, count_distinct, collect_list, collect_set, row_number, first, last

from settings.model_settings import AggregationSettings, ColumnSettings, ModelSettings
from shared import string_utils

def transform_dataset(source_data: DataFrame, target_model: ModelSettings, settings: dict[str, Any]) -> DataFrame:
  target_columns = [ColumnSettings(**column) for column in target_model.columns]
  target_data = reduce(lambda data, column: transform_column(data, column, settings), target_columns, source_data)
  target_data = target_data.selectExpr(*[column.alias or column.name for column in target_columns if not column.drop])
  if target_model.query is not None and len(target_model.query) > 0: target_data = reduce(lambda data, func: invoke_query_function(data, func), target_model.query, target_data)
  if target_model.agg: target_data = aggregate(target_data, AggregationSettings(**target_model.agg))
  return target_data

def transform_column(data: DataFrame, target_column: ColumnSettings, settings: dict[str, Any]) -> DataFrame:
  col_name = target_column.name
  if col_name not in data.columns:
    print(f'Column "{col_name}" does not exist, try to create an empty column.')
    data = data.withColumn(col_name, lit(None).cast(target_column.type))

  if target_column.funcs:
    data = reduce(lambda data, func: data.withColumn(col_name, invoke_column_function(col(col_name), func, settings)), target_column.funcs, data)

  if target_column.alias: data = data.withColumnRenamed(target_column.name, target_column.alias)

  return data

def invoke_column_function(column: Column, func: str, settings: dict[str, Any]) -> Column:
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
    print(f'Function "{name}" is not defined.')
    return column

def invoke_query_function(data: DataFrame, func) -> DataFrame:
  (name, args) = string_utils.parse_function_name_and_arguments(func)
  # predefined spark functions
  if name == 'where' or name == 'filter': return data.where(args[0])
  elif name == 'drop_duplicates': return data.dropDuplicates(args)
  elif name == 'fillna': return data.fillna(args[0], args[1:])
  else:
    print(f'Function "{name}" is not defined.')
    return data

def aggregate(data: DataFrame, agg: AggregationSettings) -> DataFrame:
  if agg.type == 'group_by': return group_by(data, agg)
  elif agg.type == 'partition_by': return partition_by(data, agg)
  else:
    print(f'"{agg.type}" is not defined.')
    return data

def group_by(data: DataFrame, agg: AggregationSettings) -> DataFrame:
  agg_columns: list[Column] = [invoke_group_by_function(ColumnSettings(**metric)) for metric in agg.metrics]
  return data.groupby(agg.dimensions).agg(*agg_columns)

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

def partition_by(data: DataFrame, agg: AggregationSettings) -> DataFrame:
  partition = Window.partitionBy(*agg.dimensions)
  order_columns = [invoke_order_by_column(func) for func in agg.order_by]
  data = data.withColumn('rn', row_number().over(partition.orderBy(*order_columns)))

  if agg.metrics:
    data = reduce(lambda data, metric: invoke_partition_by_column(data, metric.name, metric.funcs[0], partition, order_columns), agg.metrics, data)

  data = data.where('rn = 1')

  return data.selectExpr(*[metric.name for metric in agg.metrics]) if agg.metrics else data.drop('rn')

def invoke_order_by_column(func: str) -> Column:
  (order, col_name) = string_utils.parse_function_name_and_arguments(func)
  if order == 'asc': return col(col_name).asc()
  elif order == 'desc': return col(col_name).desc()
  else: return col(col_name).asc()

def invoke_partition_by_column(data: DataFrame, col_name: str, func: str, partition: Window, order_columns: list[Column]) -> DataFrame:
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