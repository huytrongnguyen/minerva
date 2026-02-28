import sys, json, logging, psycopg2
from typing import Any, Optional, Dict, List
from datetime import datetime, timedelta
from functools import reduce
from dataclasses import dataclass, field
from jinja2 import Environment
from psycopg2 import Error
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

from pyspark.sql import SparkSession, DataFrame, DataFrameWriter
from pyspark.sql.types import StructType

#region ===== Helper Classes =====
@dataclass
class JobSettings:
  models: str
  product_id: Optional[str] = ''
  event_date: Optional[str] = ''
  model_paths: Optional[str] = '/opt/airflow/models'

@dataclass
class SourceOrTargetSettings:
  location: str
  name: Optional[str] = None
  type: Optional[str] = 'parquet'
  # load options
  case_sensitive: Optional[bool] = False
  options: Optional[Dict[str, str]] = field(default_factory=dict)
  preprocess: Optional[str] = ''
  default_when_blank: Optional[bool] = False
  # save options
  num_partitions: Optional[int] = 1
  partition_by: Optional[List[str]] = field(default_factory=list)
  merge: Optional[bool] = False
  postprocess: Optional[str] = ''
  #transform:
  sql_model: Optional[str] = ''
  #variables
  vars: Optional[Dict[str, str]] = field(default_factory=dict)

@dataclass
class JsonModel:
  sources: List[SourceOrTargetSettings]
  targets: List[SourceOrTargetSettings]
#endregion

# Initialize the logger
logger = logging.getLogger(__name__)
logging.basicConfig(
  level=logging.INFO,
  format='%(levelname)s %(module)s:%(lineno)d %(message)s'
)

# Initialize Jinja
jinja_env = Environment()

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
    product_info: Dict[str, Any] = load_json(f'{job_settings.model_paths}/{job_settings.product_id}/info.json')

    # Initialize Spark session
    spark: SparkSession = (
      SparkSession.builder
      .getOrCreate() # Gets an existing SparkSession or creates a new one
    )

    spark.sparkContext.setLogLevel('INFO') # make Spark log visible in Airflow

    for file_name in job_settings.models.split(','):
      file_path = f'{job_settings.model_paths}/{file_name}'
      if file_path.endswith('.sql'):
        sql_model = load_text(file_path)
        process_sql_model(sql_model, spark, product_info, job_settings)
      elif file_path.endswith('.json'):
        json_model = JsonModel(**load_json(file_path))
        process_json_model(json_model, spark, product_info, job_settings)
      else:
        print(f'Unknown file type of {file_path}')

    spark.stop()

    return {
      'status_code': 200,
      'message': 'Processed successfully'
    }
  except Exception as e:
    logger.error(f'Error processing: {str(e)}')
    raise

#region ===== SQL Model =====
def process_sql_model(model: str, spark: SparkSession, product_info: Dict[str, Any], job_settings: JobSettings):
  targets: List[SourceOrTargetSettings] = []

  vars = {
    'product_id': job_settings.product_id,
    'event_date': job_settings.event_date,
    'model_paths': job_settings.model_paths,
  }
  vars = {**product_info, **vars}

  jinja_env.globals['source'] = lambda params: source(spark, SourceOrTargetSettings(**params), vars)
  jinja_env.globals['create_or_replace_table'] = lambda params: target(targets, SourceOrTargetSettings(**params))
  jinja_env.globals['date_range'] = lambda before, after = 0: f"{{{','.join(date_range(job_settings.event_date, before, after))}}}"

  sql_query = jinja_env.from_string(model).render(**vars)
  target_data = spark.sql(sql_query)
  save_data(target_data, targets[0], vars)

def source(spark: SparkSession, source_settings: SourceOrTargetSettings, vars: Dict[str, Any]) -> str:
  vars = {**source_settings.vars, **vars}
  data = load_data(spark, source_settings, vars)
  if data == None and source_settings.default_when_blank:
    logger.warning('`default_when_blank` is enabled, try to create empty DataFrame')
    data = spark.createDataFrame([], StructType([]))

  data.createOrReplaceTempView(source_settings.name)
  return source_settings.name

def target(targets: List[SourceOrTargetSettings], target_model: SourceOrTargetSettings) -> str:
  targets.append(target_model)
  return ''
#endregion

#region ===== JSON Model =====
def process_json_model(model: JsonModel, spark: SparkSession, product_info: Dict[str, Any], job_settings: JobSettings):
  vars = {
    'product_id': job_settings.product_id,
    'event_date': job_settings.event_date,
    'model_paths': job_settings.model_paths,
  }
  vars = {**product_info, **vars}

  for item in model.sources:
    source(spark, SourceOrTargetSettings(**item), vars)

  for item in model.targets:
    target_settings = SourceOrTargetSettings(**item)
    file_path = jinja_env.from_string(target_settings.sql_model).render(**vars)
    sql_model = load_text(file_path)
    sql_query = jinja_env.from_string(sql_model).render(**vars)
    target_data = spark.sql(sql_query)
    save_data(target_data, target_settings, vars)
#endregion

#region ===== Adapter =====
def load_data(spark: SparkSession, source_settings: SourceOrTargetSettings, vars: Dict[str, Any]) -> Optional[DataFrame]:
  if (source_settings.case_sensitive):
    spark.conf.set('spark.sql.caseSensitive', 'true')

  path = jinja_env.from_string(source_settings.location).render(**vars)
  logger.info(f'Load "{source_settings.name}" data in "{source_settings.type}" format from "{path}"')

  try:
    data: DataFrame = load_data_with_jdbc(spark, path, source_settings, vars) if source_settings.type == 'jdbc' else spark.read.format(source_settings.type).options(**source_settings.options).load(path)
    if data.head(1):
      return data
    else:
      logger.warning(f'Empty data when loading "{source_settings.name}" data in "{source_settings.type}" format from "{path}"')
      return data
  except Exception as ex:
    logger.error(f'Cannot load "{source_settings.name}" data in "{source_settings.type}" format from "{path}" caused by: ${ex}')
    return None

def load_data_with_jdbc(spark: SparkSession, path: str, source_settings: SourceOrTargetSettings, vars: Dict[str, Any]) -> DataFrame:
  cred = load_json(path)

  dbtable = source_settings.name
  if source_settings.preprocess:
    sql_file = jinja_env.from_string(source_settings.preprocess).render(**vars)
    sql_query = load_text(sql_file)
    dbtable = f'({jinja_env.from_string(sql_query).render(**vars)}) as {source_settings.name}'

  logger.info(f'dbtable = {dbtable}')

  options = {
    'driver': cred['driver'],
    'url': cred['url'],
    'dbtable': dbtable, # Can be table name or subquery
    'user': cred['user'],
    'password': cred['password'],
    'fetchsize': '10000',
    **source_settings.options
  }

  return spark.read.format(source_settings.type).options(**options).load()

def save_data(data: DataFrame, target_settings: SourceOrTargetSettings, vars: Dict[str, Any]):
  if target_settings.type == 'jdbc':
    save_data_with_jdbc(data, target_settings, vars)
  else:
    path = jinja_env.from_string(target_settings.location).render(**vars)
    logger.info(f'Save data to "{path}" as {target_settings.type}, num_partitions = {target_settings.num_partitions}, partition_by = {target_settings.partition_by}, columns = {"|".join(data.columns)}')

    writer: DataFrameWriter = data.coalesce(target_settings.num_partitions).write.format(target_settings.type).options(**target_settings.options).mode('overwrite')
    if len(target_settings.partition_by) > 0:
      writer = writer.partitionBy(target_settings.partition_by)

    writer.save(path)

def save_data_with_jdbc(data: DataFrame, target_settings: SourceOrTargetSettings, vars: Dict[str, Any]):
  path = jinja_env.from_string(target_settings.location).render(**vars)
  cred = load_json(path)
  options = {
    'driver': cred['driver'],
    'url': cred['url'],
    'dbtable': target_settings.name,
    'user': cred['user'],
    'password': cred['password'],
    'batchsize': '10000',
  }
  data.write.format(target_settings.type).options(**options).mode('overwrite').save()

  logger.info(f"Save data to {target_settings.name}")

  if target_settings.postprocess:
    sql_file = jinja_env.from_string(target_settings.postprocess).render(**vars)
    sql_query = load_text(sql_file)
    execute_query(sql_query, cred)
#endregion

#region ===== Utils =====
def render_template(template: str, vars: Dict[str, Any]): return jinja_env.from_string(template).render(**vars)

def date_range(base: str, before: int, after: int = 0) -> List[str]:
  base_date = datetime.strptime(base, '%Y-%m-%d')
  return [(base_date + timedelta(days = x)).strftime('%Y-%m-%d') for x in range(-before, after + 1)]

def execute_query(query: str, cred: Dict[str, str]):
  try:
    conn = psycopg2.connect(cred['conn_string'])
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    cursor.execute(query)
  except (Exception, Error) as error:
    print('Error while connecting: ', error)
  finally:
    # Always close cursor and connection to avoid leaks
    if 'cursor' in locals():
        cursor.close()
    if 'conn' in locals():
      conn.close()
      print('Connection closed.')

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
