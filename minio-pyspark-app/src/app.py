from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

# Initialize Spark session
spark: SparkSession = (
  SparkSession.builder
  .appName("PySparkMinIO") # Setting the application name
  .master("local[*]") # Specifying the master URL (e.g., local mode)
  .config("spark.jars", "../libs/hadoop-aws-3.3.6.jar,../libs/aws-java-sdk-bundle-1.12.792.jar")
  .config("spark.sql.extensions", "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions")
  .config("spark.sql.catalog.lakehouse", "org.apache.iceberg.spark.SparkCatalog")
  .config("spark.sql.catalog.lakehouse.type", "hadoop")
  .config("spark.sql.catalog.lakehouse.warehouse", "s3a://lakehouse")
  .getOrCreate() # Gets an existing SparkSession or creates a new one
)

# Now set S3A configs directly on Hadoop conf
hadoop_conf = spark._jsc.hadoopConfiguration()
hadoop_conf.set("fs.s3a.endpoint", "http://localhost:9000")
hadoop_conf.set("fs.s3a.access.key", "admin")
hadoop_conf.set("fs.s3a.secret.key", "password")
hadoop_conf.set("fs.s3a.path.style.access", "true")
hadoop_conf.set("fs.s3a.path.connection.ssl.enabled", "false")
hadoop_conf.set("fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem")
hadoop_conf.set("fs.s3a.aws.credentials.provider", "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider")
hadoop_conf.set("fs.s3a.connection.timeout", "60") # Overrides for timeouts, etc.
hadoop_conf.set("fs.s3a.connection.establish.timeout", "60")
hadoop_conf.set("fs.s3a.threads.keepalivetime", "60")
hadoop_conf.set("fs.s3a.multipart.purge.age", "86400")

# Sample DataFrame
data = [("Alice", 34), ("Bob", 45), ("Charlie", 29)]
schema = StructType([
  StructField("name", StringType(), True),
  StructField("age", IntegerType(), True)
])
df = spark.createDataFrame(data, schema)

# Write as Parquet to MinIO bucket (bucket must exist)
parquet_path = f"s3a://lakehouse/local/sample"
df.coalesce(1).write.format('parquet').mode("overwrite").save(parquet_path)
print(f"Parquet written to {parquet_path}")

# Create and write to Iceberg table in MinIO
iceberg_table = "lakehouse.default.my_iceberg_table"
spark.sql(f"CREATE TABLE IF NOT EXISTS {iceberg_table} (name STRING, age INT) USING iceberg")
df.writeTo(iceberg_table).append()
print(f"Iceberg table written to {iceberg_table}")

# Verify by reading back
df_parquet = spark.read.parquet(parquet_path)
df_parquet.show()

df_iceberg = spark.read.table(iceberg_table)
df_iceberg.show()

spark.stop() # Stop the SparkSession when done
