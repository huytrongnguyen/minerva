from typing import Any, Optional
from pyspark.sql import SparkSession, DataFrame
from src.shared import file_utils, string_utils
from src.settings.job_settings import JobSettings
from src.settings.model_settings import DataModel, ModelLayout
from src.settings.product_settings import ProductSettings

def run(spark: SparkSession, models: list[str], productSettings: ProductSettings, jobSettings: JobSettings):
  settings = productSettings.__dict__ | {
    'product_id': jobSettings.product_id,
    'event_date': jobSettings.event_date
  }

  for file_name in models:
    file_path = f'{jobSettings.config_dir}/{jobSettings.product_id}/{file_name}'
    if file_path.endswith('.sql'):
      sql = file_utils.load_text(file_path)
      process_sql(spark, sql, settings)
    elif file_path.endswith('.json'):
      model = ModelLayout(**file_utils.load_json(file_path))
      process(spark, model, settings)
    else:
      print(f'Unknown file type of {file_path}')

def process_sql(spark: SparkSession, sql: str, settings: dict[str, Any]):
  print(f'sql = {sql}')

def process(spark: SparkSession, model: ModelLayout, settings: dict[str, Any]):
  if len(model.sources) > 1:
    print('multi sources')
  else:
    df = load_data(spark, DataModel(**model.sources[0]), settings)
    if df == None:
      print(f'No data received')
      return
    else:
      df.printSchema()
      df.show(5, False)

    # for target in model.targets:
    #   process(model.sources[0], target, settings)

# def process(source: DataModel, target: DataModel, settings: dict[str, Any]):
#   print(f'target = {target}')


def load_data(spark: SparkSession, model: DataModel, settings: dict[str, Any]) -> Optional[DataFrame]:
  if (model.caseSensitive):
    spark.conf.set('spark.sql.caseSensitive', 'true')

  path = string_utils.parse(model.location, settings)
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

def save_data(data: DataFrame, model: DataModel, settings: dict[str, Any]):
  path = string_utils.parse(model.location, settings)
  print(f'Save data to "{path}" as {model.type}, numPartitions = {model.numPartitions}, partitionColumn = {model.partitionColumns}, columns = {"|".join(data.columns)}')

  writer = data.coalesce(model.numPartitions).write.format(model.type).options(**model.options).mode('overwrite')
  if len(model.partitionColumns) > 0:
    writer = writer.partitionBy(model.partitionColumns)

  writer.save(path)