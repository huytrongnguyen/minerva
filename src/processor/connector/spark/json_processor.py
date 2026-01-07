from typing import Any
from functools import reduce
from pyspark.sql import SparkSession, DataFrame, Column, Window
from pyspark.sql.functions import lit, col, row_number

from settings.job_settings import JobSettings
from settings.product_settings import ProductSettings
from settings.model_settings import ModelLayout, ModelSettings, ColumnSettings, AggregationSettings
from shared import file_utils, string_utils

from .data_store import load_data, save_data, merge_data
from .functions import invoke_column_function, invoke_group_by_function, invoke_order_by_column, invoke_partition_by_column, invoke_query_function

def run(model: ModelLayout, spark: SparkSession, product_settings: ProductSettings, job_settings: JobSettings):
  vars = product_settings.__dict__ | {
    'product_id': job_settings.product_id,
    'event_date': job_settings.event_date
  }

  if len(model.sources) > 1: # multi sources to single target
    return
  else: # single source to multi targets
    source_model = ModelSettings(**model.sources[0])
    source_data = load_data(spark, source_model, vars)
    if source_data == None:
      return
    
    if 'preprocess' in source_model.__dict__ and source_model.preprocess != '':
      sql_file = string_utils.parse(f'{job_settings.config_dir}/{source_model.preprocess}', vars)
      sql_query = file_utils.load_text(sql_file)
      source_data = spark.sql(sql_query, source_data = source_data)
    
    for target in model.targets:
      target_model = ModelSettings(**target)
      if target_model.merge and target_model.sql_model: # merge source into target
  #       target_data = load_data(spark, target_model, vars)
  #       if target_data == None:
          return

  #       source_data.createOrReplaceTempView(source_model.name)
  #       target_data.createOrReplaceTempView(target_model.name)
  #       sql = file_utils.load_text(f'{job_settings.config_dir}/{target_model.sql_model}')
  #       target_data = execute_query(spark, sql)
  #       merge_data(spark, target_data, target_model, vars)
      else:
        target_data = transform_dataset(source_data, target_model, vars)
        # save_data(target_data, target_model, vars)

def transform_dataset(source_data: DataFrame, target_model: ModelSettings, vars: dict[str, Any]) -> DataFrame:
  if 'columns' not in target_model.__dict__:
    return source_data
  target_columns = [ColumnSettings(**column) for column in target_model.columns]
  target_data = reduce(lambda data, column: transform_column(data, column, vars), target_columns, source_data)
  target_data = target_data.selectExpr(*[column.alias or column.name for column in target_columns if not column.drop])
  target_data.printSchema()
  target_data.where("campaign_id is not null").show(5, False)
#   if target_model.query is not None and len(target_model.query) > 0: target_data = reduce(lambda data, func: invoke_query_function(data, func), target_model.query, target_data)
#   if target_model.agg: target_data = aggregate(target_data, AggregationSettings(**target_model.agg))
#   return target_data

def transform_column(data: DataFrame, target_column: ColumnSettings, vars: dict[str, Any]) -> DataFrame:
  col_name = target_column.name
  if col_name not in data.columns:
    print(f'Column "{col_name}" does not exist, try to create an empty column.')
    data = data.withColumn(col_name, lit(None).cast(target_column.type))

  if target_column.funcs:
    data = reduce(lambda data, func: data.withColumn(col_name, invoke_column_function(col(col_name), func, vars)), target_column.funcs, data)

  if target_column.alias: data = data.withColumnRenamed(target_column.name, target_column.alias)

  return data

# def aggregate(data: DataFrame, agg: AggregationSettings) -> DataFrame:
#   if agg.type == 'group_by': return group_by(data, agg)
#   elif agg.type == 'partition_by': return partition_by(data, agg)
#   else:
#     print(f'"{agg.type}" is not defined.')
#     return data

# def group_by(data: DataFrame, agg: AggregationSettings) -> DataFrame:
#   agg_columns: list[Column] = [invoke_group_by_function(ColumnSettings(**metric)) for metric in agg.metrics]
#   return data.groupby(agg.dimensions).agg(*agg_columns)

# def partition_by(data: DataFrame, agg: AggregationSettings) -> DataFrame:
#   partition = Window.partitionBy(*agg.dimensions)
#   order_columns = [invoke_order_by_column(func) for func in agg.order_by]
#   data = data.withColumn('rn', row_number().over(partition.orderBy(*order_columns)))

#   if agg.metrics:
#     data = reduce(lambda data, metric: invoke_partition_by_column(data, metric.name, metric.funcs[0], partition, order_columns), agg.metrics, data)

#   data = data.where('rn = 1')

#   return data.selectExpr(*[metric.name for metric in agg.metrics]) if agg.metrics else data.drop('rn')

# def execute_query(spark: SparkSession, query: str) -> DataFrame:
#   target_data = spark.sql(query)
#   return target_data
