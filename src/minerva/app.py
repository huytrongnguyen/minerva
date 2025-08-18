from pyspark.sql import SparkSession
from pyspark.sql.functions import col

def main():
    # Initialize Spark session with MinIO configurations
    spark = SparkSession.builder \
        .appName("SparkApp") \
        .master("local[*]") \
        .config("spark.hadoop.fs.s3a.endpoint", "http://minio:9000") \
        .config("spark.hadoop.fs.s3a.access.key", "admin") \
        .config("spark.hadoop.fs.s3a.secret.key", "password") \
        .config("spark.hadoop.fs.s3a.path.style.access", "true") \
        .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem") \
        .getOrCreate()

    # Create sample DataFrame
    data = [("Alice", 25), ("Bob", 30), ("Cathy", 28)]
    df = spark.createDataFrame(data, ["name", "age"])

    # Write data to MinIO
    df.write.mode("overwrite").parquet("s3a://spark-bucket/output")

    # Read data from MinIO
    read_df = spark.read.parquet("s3a://spark-bucket/output")
    read_df.show()

    # Stop Spark session
    spark.stop()

if __name__ == "__main__":
    main()