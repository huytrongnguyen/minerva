import pytest
from pyspark.sql import SparkSession
from src.core.processor import process, load_data, save_data
from src.settings.model_settings import DataModel, ModelLayout
from src.shared import file_utils

@pytest.fixture(scope="session")
def spark():
  spark = SparkSession.builder \
      .appName("SparkApp") \
      .master("local[*]") \
      .config("spark.ui.enabled", "false") \
      .getOrCreate()
  yield spark
  spark.stop()

def test_load_data(spark):
  root_dir = '/Users/lionel/Documents/huytrongnguyen/sample'
  model_file_path = f'{root_dir}/products/test/std/installs.json'
  model = ModelLayout(**file_utils.load_json(model_file_path))
  settings = {
    'product_id': 'test',
    'event_date': '2025-10-11',
    'datastore': {
      'location': root_dir
    }
  }

  # process(spark, model, settings)
  df = load_data(spark, DataModel(**model.sources[0]), settings)
  df = df.withColumnRenamed('raw_date', 'event_date')
  save_data(df, DataModel(**model.targets[0]), settings)
  # df.printSchema()

  # df.where("platform = 'android'").show(1, False)
  # df.where("platform = 'ios'").show(1, False)
