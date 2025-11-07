# PySpark 3.5.5 MinIO File/Iceberg Integration

## Prerequisites

To implement a PySpark application with Spark 3.5.5 for reading/writing files or Apache Iceberg tables to MinIO (S3-compatible storage), ensure the following:

- **Install PySpark 3.5.5**: Use `pip install pyspark==3.5.5`. This includes the core Spark libraries.
- **Hadoop AWS Dependencies**: For S3/MinIO access, download `hadoop-aws-3.3.2.jar` (matching Spark's Hadoop version) and `aws-java-sdk-bundle-1.12.792.jar` from Apache mirrors, and include them in your Spark classpath (e.g., via --jars in spark-submit or SPARK_HOME/jars).
- **MinIO Setup**: Run MinIO locally (e.g., via Docker: `docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"`) with default credentials (access key: `admin`, secret key: `password`). Create a bucket (e.g., `lakehouse`).
- **Iceberg**: For Iceberg support, download `iceberg-spark-runtime-3.5_2.12-1.6.1.jar` (latest stable as of 2025) and add it to your classpath. Iceberg 1.6.1 is compatible with Spark 3.5.x.
- **Running the App**: Save the code as `app.py` and run with `spark-submit --packages org.apache.iceberg:iceberg-spark-runtime-3.5_2.12:1.6.1 app.py` (adjust for your setup).