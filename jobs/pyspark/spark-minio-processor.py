from pyspark.sql import SparkSession
from pyspark.sql.functions import col

def main():
    # Initialize Spark session with MinIO configurations
    spark = SparkSession.builder \
        .appName("Mercury") \
        .config("spark.hadoop.fs.s3a.endpoint", "http://minio:9000") \
        .config("spark.hadoop.fs.s3a.access.key", "admin") \
        .config("spark.hadoop.fs.s3a.secret.key", "password") \
        .config("spark.hadoop.fs.s3a.path.style.access", "true") \
        .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem") \
        .getOrCreate()

    # Sample data
    data = [("Alice", 25), ("Bob", 30), ("Cathy", 28)]
    columns = ["Name", "Age"]
    df = spark.createDataFrame(data, columns)

    # Write data to MinIO
    output_path = "s3a://mercury/output/data.parquet"
    df.write.mode("overwrite").parquet(output_path)

    # Read data from MinIO
    read_df = spark.read.parquet(output_path)

    # Perform a simple transformation
    transformed_df = read_df.filter(col("Age") > 25)

    # Write transformed data back to MinIO
    transformed_output_path = "s3a://mercury/output/transformed_data.parquet"
    transformed_df.write.mode("overwrite").parquet(transformed_output_path)

    # Show results
    transformed_df.show()

    # Stop Spark session
    spark.stop()

if __name__ == "__main__":
    main()