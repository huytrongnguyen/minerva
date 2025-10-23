import pytest
from os import path
from pyspark.sql import SparkSession

@pytest.fixture(scope="session")
def spark():
  spark = SparkSession.builder \
      .appName("Minerva") \
      .master("local[*]") \
      .config("spark.ui.enabled", "false") \
      .getOrCreate()
  yield spark
  spark.stop()

def test_should_load_data_success(spark: SparkSession):
  from src.settings.job_settings import JobSettings

  root_dir = path.dirname(__file__) + '/../../..'
  settings = JobSettings(**{
    'product_id': 'tos',
    'event_date': '2024-05-22',
  })
  # file_path = f'{root_dir}/data/{settings.product_id}/devices/installs/event_date={settings.event_date}'
  file_path = f'{root_dir}/data/{settings.product}/cons/daily_installs'
  df = spark.read.parquet(file_path)
  df.printSchema()
  df.where("media_source = 'na'").show(5, False)

# def test_should_load_and_save_data_success(spark):
#   from src.connector.spark.data_store import load_data, save_data
#   from src.settings.model_settings import ModelLayout, ModelSettings
#   from src.shared import file_utils

#   root_dir = path.dirname(__file__) + '/../../..'
#   model_file_path = f'{root_dir}/minerva/products/test/raw/install_reports.json'
#   model = ModelLayout(**file_utils.load_json(model_file_path))
#   settings = {
#     'product_id': 'test',
#     'event_date': '2025-10-11',
#     'datastore': {
#       'location': f'{root_dir}/data'
#     }
#   }

#   df = load_data(spark, ModelSettings(**model.sources[0]), settings)
#   df = df.withColumnRenamed('raw_date', 'event_date')
#   save_data(df, ModelSettings(**model.targets[0]), settings)

# def test_should_standardize_data_success(spark: SparkSession):
#   from src.connector.spark import standardizer
#   from src.settings.job_settings import JobSettings
#   from src.settings.product_settings import ProductSettings
#   from src.shared import file_utils

#   root_dir = path.dirname(__file__) + '/../../..'
#   settings = JobSettings(**{
#     'product_id': 'tos',
#     'event_date': '2024-05-22',
#     'action': 'standardize',
#     'models': 'shared/std/installs.json',
#     'config_dir': f'{root_dir}/minerva/products',
#   })
#   product_settings = ProductSettings(**file_utils.load_json(f'{settings.config_dir}/{settings.product_id}/profile.json'))

#   standardizer.run(spark, product_settings, settings)

#   df = spark.read.parquet(f'{root_dir}/data/{settings.product_id}/devices/installs/event_date={settings.event_date}')
#   df.printSchema()
#   df.where('media_source is not null').show(5, False)
