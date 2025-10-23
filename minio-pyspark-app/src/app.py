from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

def main():
  # Initialize Spark session
  spark: SparkSession = (
    SparkSession.builder
    .appName("PySparkMinIO") # Setting the application name
    .master("local[*]") # Specifying the master URL (e.g., local mode)
    .getOrCreate() # Gets an existing SparkSession or creates a new one
  )

  # Sample DataFrame
  data = [("Alice", 34), ("Bob", 45), ("Charlie", 29)]
  schema = StructType([
    StructField("name", StringType(), True),
    StructField("age", IntegerType(), True)
  ])
  df = spark.createDataFrame(data, schema)

  # Write as Parquet to MinIO bucket (bucket must exist)
  path = f"s3a://lakehouse/local/sample"
  df.coalesce(1).write.format('parquet').mode("overwrite").save(path)

  # Verify by reading back
  read_df = spark.read.parquet(path)
  read_df.show()

  spark.stop() # Stop the SparkSession when done

if __name__ == "__main__":
  main()