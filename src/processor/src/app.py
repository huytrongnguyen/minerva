import sys

from pyspark.sql import SparkSession
from shared import json_utils
from settings import job_settings

def main():
    if len(sys.argv) < 2:
        raise ValueError('No arguments passed.')

    settings = job_settings.JobSettings.parse(sys.argv[1:])
    name = f'minerva::{settings.product_id}::{settings.action}::{settings.layouts}::{settings.event_date}'
    print(f'Job name: {name}')

    product_settings = json_utils.load_from_file(f'{settings.config_dir}/{settings.product_id}/profile.json')
    print(product_settings)

    # Initialize Spark session with MinIO configurations
    spark = SparkSession.builder.appName(name).getOrCreate()
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

    # spark.read.format('csv')\
    #     .load('/appsflyer/{id123456789,com.appsflyer.referrersender}/2025-01-01/installs_report')\
    #     .createOrReplaceTempView('appsflyer_installs_report')

    # data = spark.sql('''
    #     select  'tos' as product_id
    #           , to_date(event_time) as event_date
    #           , appsflyer_id as install_id
    #           , cast(install_time as timestamp) as event_time
    #           , media_source
    #           , campaign
    #           , af_c_id as campaign_id
    #           , af_cost_model as cost_model
    #           , cast(af_cost_value as double) as cost_value
    #           , af_cost_currency as cost_currency
    #           , country_code
    #           , platform
    #           ,
    #     from appsflyer_installs_report
    # ''')

    # data.coalesce(1).write.format('parquet').mode('overwrite')\
    #     .save('/datastore/tos/devices/installs/2025-01-01')


    # Write data to MinIO
    # df.write.mode("overwrite").parquet("s3a://spark-bucket/output")

    # Read data from MinIO
    # read_df = spark.read.parquet("s3a://spark-bucket/output")
    # read_df.show()

    # Stop Spark session
    spark.stop()

if __name__ == "__main__":
    main()