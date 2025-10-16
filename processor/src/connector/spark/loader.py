from pyspark.sql import SparkSession

from settings.job_settings import JobSettings
from settings.product_settings import ProductSettings

def run(spark: SparkSession, product_settings: ProductSettings, job_settings: JobSettings):
  print(job_settings.models)

  # Create sample DataFrame
  # data = [("Alice", 25), ("Bob", 30), ("Cathy", 28)]
  # df = spark.createDataFrame(data, ["name", "age"])
  # df.show()

  # Write data to MinIO
  # df.write.mode("overwrite").parquet("s3a://spark-bucket/output")

  # Read data from MinIO
  # read_df = spark.read.parquet("s3a://spark-bucket/output")
  # read_df.show()