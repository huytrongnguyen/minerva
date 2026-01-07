from pyspark.sql import SparkSession

from settings.job_settings import JobSettings
from settings.product_settings import ProductSettings

from . import processor
# from . import loader, standardizer

def run(product_settings: ProductSettings, job_settings: JobSettings):
  name = f'minerva::{job_settings.product_id}::{job_settings.event_date}::{job_settings.action}::{job_settings.models}'

  # Initialize Spark session
  spark: SparkSession = (
    SparkSession.builder
    .appName(name) # Setting the application name
    .master('local[*]') # Specifying the master URL (e.g., local mode), use all cores in local mode
    .config('spark.driver.memory', '5g') # controls the heap size, everything (driver + executors) runs in a single JVM process in local mode
    # .config('spark.driver.cores', '2')
    # .config('spark.executor.memory', '4g')
    # .config('spark.executor.instances', '5')
    # .config('spark.executor.cores', '4')
    .config('spark.sql.adaptive.enabled', 'true')
    .config('spark.sql.sources.partitionOverwriteMode', 'dynamic')
    .getOrCreate() # Gets an existing SparkSession or creates a new one
  )

  processor.run(spark, product_settings, job_settings)
  # if job_settings.action == 'load': loader.run(spark, product_settings, job_settings)
  # elif job_settings.action == 'standardize': standardizer.run(spark, product_settings, job_settings)
  # else: print(f'Unknown action: {job_settings.action}')

  spark.stop()
