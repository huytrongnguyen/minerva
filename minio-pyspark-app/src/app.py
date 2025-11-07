from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

JARS_PATH = f'{path.dirname(__file__)}/../libs'
JARS = [
  f'{JARS_PATH}/hadoop-aws-3.3.2.jar',
  f'{JARS_PATH}/aws-java-sdk-bundle-1.12.792.jar',
  f'{JARS_PATH}/iceberg-spark-runtime-3.5_2.12-1.6.1.jar',
]

# ----------------------------------------------------------------------
# MinIO / S3A configuration
# ----------------------------------------------------------------------
MINIO_ENDPOINT    = 'http://localhost:9000'
MINIO_ACCESS_KEY  = 'admin'
MINIO_SECRET_KEY  = 'password'
BUCKET            = 'lakehouse'

# ----------------------------------------------------------------------
# Iceberg catalog (Hadoop catalog stored in MinIO)
# ----------------------------------------------------------------------
CATALOG_NAME      = 'local'
LAKEHOUSE_PATH    = f's3a://{BUCKET}/{CATALOG_NAME}'

# Initialize SparkSession with MinIO/S3A and Iceberg configurations
spark: SparkSession = (
  SparkSession.builder
  .appName('PySparkMinIO') # Setting the application name
  .master('local[*]') # Specifying the master URL (e.g., local mode)
  .config('spark.sql.sources.partitionOverwriteMode', 'dynamic') # Required for overwriting ONLY the required partitioned folders, and not the entire root folder
  .config('spark.jars', ','.join(JARS))
  # MinIO/S3A configs
  .config('spark.hadoop.fs.s3a.endpoint', MINIO_ENDPOINT)
  .config('spark.hadoop.fs.s3a.access.key', MINIO_ACCESS_KEY)
  .config('spark.hadoop.fs.s3a.secret.key', MINIO_SECRET_KEY)
  .config('spark.hadoop.fs.s3a.path.style.access', 'true')
  .config('spark.hadoop.fs.s3a.impl', 'org.apache.hadoop.fs.s3a.S3AFileSystem')
  # Iceberg
  .config(f'spark.sql.catalog.{CATALOG_NAME}', 'org.apache.iceberg.spark.SparkCatalog')
  .config(f'spark.sql.catalog.{CATALOG_NAME}.type', 'hadoop')
  .config(f'spark.sql.catalog.{CATALOG_NAME}.warehouse', LAKEHOUSE_PATH)
  # S3A Committer (FIXES version-hint.file)
  .config('spark.hadoop.fs.s3a.committer.name', 'partitioned')
  .config('spark.hadoop.fs.s3a.committer.staging.conflict-mode', 'replace')
  .getOrCreate() # Gets an existing SparkSession or creates a new one
)

# Now set S3A configs directly on Hadoop conf (work with hadoop-aws-3.3.6)
# hadoop_conf = spark._jsc.hadoopConfiguration()
# hadoop_conf.set('fs.s3a.endpoint', 'http://localhost:9000')
# hadoop_conf.set('fs.s3a.access.key', 'admin')
# hadoop_conf.set('fs.s3a.secret.key', 'password')
# hadoop_conf.set('fs.s3a.path.style.access', 'true')
# hadoop_conf.set('fs.s3a.path.connection.ssl.enabled', 'false')
# hadoop_conf.set('fs.s3a.impl', 'org.apache.hadoop.fs.s3a.S3AFileSystem')
# hadoop_conf.set('fs.s3a.aws.credentials.provider', 'org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider')
# hadoop_conf.set('fs.s3a.connection.timeout', '60') # Overrides for timeouts, etc.
# hadoop_conf.set('fs.s3a.connection.establish.timeout', '60')
# hadoop_conf.set('fs.s3a.threads.keepalivetime', '60')
# hadoop_conf.set('fs.s3a.multipart.purge.age', '86400')

# Register UDF
udf_path = f'{path.dirname(__file__)}/udf.py'
spark.sparkContext.addPyFile(udf_path)
spark.udf.register('xml_string_to_json_string', xml_string_to_json_string, StringType())

# Sample DataFrame
data = [('Alice', 34), ('Bob', 45), ('Charlie', 29)]
schema = StructType([
  StructField('name', StringType(), True),
  StructField('age', IntegerType(), True)
])
df = spark.createDataFrame(data, schema)

# Write as Parquet to MinIO bucket (bucket must exist)
parquet_path = f's3a://lakehouse/data/sample'
df.coalesce(1).write.format('parquet').mode('overwrite').save(parquet_path)
print(f'Parquet written to {parquet_path}')

# Create and write to Iceberg table in MinIO
iceberg_table = 'local.default.my_iceberg_table'
spark.sql(f'CREATE TABLE IF NOT EXISTS {iceberg_table} (name STRING, age INT) USING iceberg')
df.writeTo(iceberg_table).append()
print(f'Iceberg table written to {iceberg_table}')

# Verify by reading back
df_parquet = spark.read.parquet(parquet_path)
df_parquet.show()

df_iceberg = spark.read.table(iceberg_table)
df_iceberg.show()

spark.stop() # Stop the SparkSession when done
