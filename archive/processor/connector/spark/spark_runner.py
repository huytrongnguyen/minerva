from pyspark.sql import SparkSession

from settings.job_settings import JobSettings
from settings.product_settings import ProductSettings
from settings.model_settings import ModelLayout
from shared import file_utils

from . import json_processor, sql_processor

def run(product_settings: ProductSettings, job_settings: JobSettings):
  name = f'minerva::{job_settings.product_id}::{job_settings.event_date}::{job_settings.models}'

  config = {
    'spark.driver.memory': '5g', # controls the heap size, everything (driver + executors) runs in a single JVM process in local mode
    # 'spark.driver.cores': '2',
    # 'spark.executor.memory': '4g',
    # 'spark.executor.instances': '5',
    # 'spark.executor.cores': '4',
    'spark.sql.adaptive.enabled': 'true',
    'spark.sql.sources.partitionOverwriteMode': 'dynamic',
    # 'spark.jars': '../libs/hadoop-aws-3.3.6.jar,../libs/aws-java-sdk-bundle-1.12.792.jar',
    # 'spark.sql.extensions': 'org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions',
    # 'spark.sql.catalog.lakehouse': 'org.apache.iceberg.spark.SparkCatalog',
    # 'spark.sql.catalog.lakehouse.type': 'hadoop',
    # 'spark.sql.catalog.lakehouse.warehouse': 's3a://lakehouse',
  }

  if job_settings.libs:
    config['spark.jars'] = job_settings.libs

  # Initialize Spark session
  spark: SparkSession = (
    SparkSession.builder
    .appName(name) # Setting the application name
    .master('local[*]') # Specifying the master URL (e.g., local mode), use all cores in local mode
    .config(map=config)
    .getOrCreate() # Gets an existing SparkSession or creates a new one
  )

  # # Now set S3A configs directly on Hadoop conf
  # hadoop_conf = spark._jsc.hadoopConfiguration()
  # hadoop_conf.set("fs.s3a.endpoint", "http://localhost:9000")
  # hadoop_conf.set("fs.s3a.access.key", "admin")
  # hadoop_conf.set("fs.s3a.secret.key", "password")
  # hadoop_conf.set("fs.s3a.path.style.access", "true")
  # hadoop_conf.set("fs.s3a.path.connection.ssl.enabled", "false")
  # hadoop_conf.set("fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem")
  # hadoop_conf.set("fs.s3a.aws.credentials.provider", "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider")
  # hadoop_conf.set("fs.s3a.connection.timeout", "60") # Overrides for timeouts, etc.
  # hadoop_conf.set("fs.s3a.connection.establish.timeout", "60")
  # hadoop_conf.set("fs.s3a.threads.keepalivetime", "60")
  # hadoop_conf.set("fs.s3a.multipart.purge.age", "86400")

  for file_name in job_settings.models.split(','):
    file_path = f'{job_settings.config_dir}/{file_name}'
    if file_path.endswith('.json'):
      model = ModelLayout(**file_utils.load_json(file_path))
      json_processor.run(model, spark, product_settings, job_settings)
    elif file_path.endswith('.sql'):
      sql = file_utils.load_text(file_path)
      sql_processor.run(sql, spark, product_settings, job_settings)
    else:
      print(f'Unknown file type of {file_path}')

  spark.stop()
