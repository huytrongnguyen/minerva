import sys

from pyspark.sql import SparkSession
from shared import json_utils
from settings import job_settings

def main():
    if len(sys.argv) < 2:
        raise ValueError('No arguments passed.')

    settings = job_settings.JobSettings.parse(sys.argv[1:])
    name = f'mercury::{settings.product_id}::{settings.layouts}::{settings.report_date}'
    print(f'Job name: {name}')

    product_settings = json_utils.load_from_file(f'{settings.config_dir}/{settings.product_id}/profile.json')
    print(product_settings)

    # Initialize Spark session with MinIO configurations
    spark = SparkSession.builder.appName(name).master("local[*]") \
        .getOrCreate()
        # .config("spark.hadoop.fs.s3a.endpoint", "http://minio:9000") \
        # .config("spark.hadoop.fs.s3a.access.key", "admin") \
        # .config("spark.hadoop.fs.s3a.secret.key", "password") \
        # .config("spark.hadoop.fs.s3a.path.style.access", "true") \
        # .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem") \
        # .getOrCreate()

    # Create sample DataFrame
    # data = [("Alice", 25), ("Bob", 30), ("Cathy", 28)]
    # df = spark.createDataFrame(data, ["name", "age"])
    # df.show()

    # Write data to MinIO
    # df.write.mode("overwrite").parquet("s3a://spark-bucket/output")

    # Read data from MinIO
    # read_df = spark.read.parquet("s3a://spark-bucket/output")
    # read_df.show()

    # Stop Spark session
    spark.stop()

if __name__ == "__main__":
    main()