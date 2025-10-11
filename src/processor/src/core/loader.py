from pyspark.sql import SparkSession
from settings.job_settings import JobSettings
from settings.product_settings import ProductSettings


def run(spark: SparkSession, models: list[str], productSettings: ProductSettings, jobSettings: JobSettings):
  print(models)

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