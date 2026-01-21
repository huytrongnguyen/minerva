import sys, json, logging
from typing import Any, Optional, Dict, List
from functools import reduce

from pyspark.sql import SparkSession, DataFrame, DataFrameWriter
from pyspark.sql.types import StructType

from entity import JobSettings, ModelSettings
from utils import date_range, jinja_env
from python_processor import execute_query

# Initialize the logger
logger = logging.getLogger(__name__)
logging.basicConfig(
  level=logging.INFO,
  format='%(levelname)s %(module)s:%(lineno)d %(message)s'
)

def handler(event: Dict[str, str]):
  """
  Main Lambda handler function
  Parameters:
      event: Dict containing the Lambda function event data
      context: Lambda runtime context
  Returns:
      Dict containing status message
  """

  try:
    job_settings = JobSettings(**event)
    product_info: Dict[str, Any] = load_json(f'{job_settings.settings_dir}/{job_settings.product_id}/info.json')

    # Initialize Spark session
    spark: SparkSession = (
      SparkSession.builder
      .getOrCreate() # Gets an existing SparkSession or creates a new one
    )

    spark.sparkContext.setLogLevel('INFO') # make Spark log visible in Airflow

    for file_name in job_settings.models.split(','):
      file_path = f'{job_settings.settings_dir}/{file_name}'
      sql = load_text(file_path)
      process(sql, spark, product_info, job_settings)

    spark.stop()

    return {
      'status_code': 200,
      'message': 'Processed successfully'
    }
  except Exception as e:
    logger.error(f'Error processing: {str(e)}')
    raise

#region ===== SQL Model =====
def process(sql_model: str, spark: SparkSession, product_info: Dict[str, Any], job_settings: JobSettings):
  targets: List[ModelSettings] = []

  vars = {
    'product_id': job_settings.product_id,
    'event_date': job_settings.event_date,
    'settings_dir': job_settings.settings_dir,
  }
  vars = {**product_info, **vars}

  jinja_env.globals['source'] = lambda params: source(spark, ModelSettings(**params), vars)
  jinja_env.globals['create_or_replace_table'] = lambda params: target(targets, ModelSettings(**params))
  jinja_env.globals['date_range'] = lambda before, after = 0: f"{{{','.join(date_range(job_settings.event_date, before, after))}}}"

  sql_query = jinja_env.from_string(sql_model).render(**vars)
  target_data = spark.sql(sql_query)
  save_data(target_data, targets[0], vars)

def source(spark: SparkSession, model: ModelSettings, vars: Dict[str, Any]) -> str:
  data = load_data(spark, model, vars)
  if data == None and model.default_when_blank:
    logger.warning('`default_when_blank` is enabled, try to create empty DataFrame')
    data = spark.createDataFrame([], StructType([]))

  data.createOrReplaceTempView(model.name)
  return model.name

def target(targets: List[ModelSettings], target_model: ModelSettings) -> str:
  targets.append(target_model)
  return ''
#endregion

#region ===== Adapter =====
def load_data(spark: SparkSession, model: ModelSettings, vars: Dict[str, Any]) -> Optional[DataFrame]:
  if (model.case_sensitive):
    spark.conf.set('spark.sql.caseSensitive', 'true')

  path = jinja_env.from_string(model.location).render(**vars)
  logger.info(f'Load {model.type} data from "{path}"')

  try:
    data: DataFrame = spark.read.format(model.type).options(**model.options).load(path)
    if data.head(1):
      return data
    else:
      logger.warning(f'Empty from "{path}"')
      return None
  except Exception as ex:
    logger.error(f'Cannot load {model.type} data from "{path}" caused by: ${ex}')
    return None

def save_data(data: DataFrame, model: ModelSettings, vars: Dict[str, Any]):
  if model.type == 'jdbc':
    save_data_with_jdbc(data, model, vars)
  else:
    path = jinja_env.from_string(model.location).render(**vars)
    logger.info(f'Save data to "{path}" as {model.type}, num_partitions = {model.num_partitions}, partition_by = {model.partition_by}, columns = {"|".join(data.columns)}')

    writer: DataFrameWriter = data.coalesce(model.num_partitions).write.format(model.type).options(**model.options).mode('overwrite')
    if len(model.partition_by) > 0:
      writer = writer.partitionBy(model.partition_by)

    writer.save(path)

def save_data_with_jdbc(data: DataFrame, model: ModelSettings, vars: Dict[str, Any]):
  path = jinja_env.from_string(model.location).render(**vars)
  cred = load_json(path)
  options = {
    'driver': cred['driver'],
    'url': cred['url'],
    'dbtable': model.name,
    'user': cred['user'],
    'password': cred['password'],
    'batchsize': '10000',
  }
  data.write.format(model.type).options(**options).mode('overwrite').save()

  logger.info(f"Save data to {model.name}")

  if model.postprocess:
    sql_file = jinja_env.from_string(model.postprocess).render(**vars)
    sql_query = load_text(sql_file)
    execute_query(sql_query, cred)
#endregion

#region ===== Utils =====
def load_text(file_path: str) -> str:
  logger.info(f'Load text from {file_path}')
  text = ''
  with open(file_path, 'r') as file:
    text = file.read()
  return text

def load_json(file_path: str) -> Dict[str, Any]:
  logger.info(f'Load json from {file_path}')
  data = {}
  try:
    with open(file_path, 'r') as json_file:
      data = json.load(json_file)
  except Exception as e:
    logger.error(f'Error while loading json from {file_path}: {str(e)}')

  return data

def convert_args_to_dict(args: List[str]) -> Dict[str, str]:
  def combine_dict(dict: Dict[str, str], arg: str) -> Dict[str, str]:
    arr = arg.split('=')
    dict[arr[0]] = arr[1]
    return dict

  return reduce(lambda dict, arg: combine_dict(dict, arg), args, {})
#endregion

if __name__ == "__main__":
  if len(sys.argv) < 2:
    raise ValueError('No arguments passed.')

  event = convert_args_to_dict(sys.argv[1:])
  handler(event)
