# Mercury Processor

This project is a Spark 3.5.3 application built with Python 3.9 and Java 17. It reads and writes data to a MinIO bucket. The application is deployed using Docker Compose with Colima as the Docker runtime on macOS or Linux.

## Prerequisites

- **Java 17**: Amazon Corretto 17.
- **Python**: Python 3.9.
- **Colima**: Version 0.7.0 or later for Docker runtime.
- **Docker CLI**: For running Docker commands.

## Project Structure

```
processor/
├── src
│   └── app.py
├── test/
│   └── app-test-suite.py
├── requirements.txt
└── docker-compose.yml
```

## Setup Environment

### Install Java 17

- Install Java 17: `brew install --cask corretto@17`
- Verify Java version: `java -version`

### Install Python dependencies

- Verify installation: `python3 --version`
  - Ensure Python version is 3.9
- Install dependencies
  ```sh
  pip3 install -r requirements.txt
  ```

### Install Colima and Docker CLI:
- Install Colima: `brew install colima`
- Install Docker CLI: `brew install docker`
- Start Colima with sufficient resources for Spark and MinIO: `colima start --cpu 10 --memory 24 --disk 128`
  - Adjust CPU/memory based on your system.
  - Use --mount if volume access issues occur (see Troubleshooting).
- Verify Docker is running: `docker ps`

## Troubleshoot

### Work with Python 3.14

- Set up a virtual environment: `python3 -m venv myenv`
- Start the virtual environment: `source myenv/bin/activate`
- Install your package: `pip3 install -r requirements.txt`
- Deactivate when finished: `deactivate`

### Work with MinIO



S3A filesystem (spark.hadoop.fs.s3a.*), need to be set before the SparkContext is created, as they are used by the Hadoop filesystem layer and cannot be modified dynamically after the SparkContext is initialized

```sh
SPARK_LOCAL_HOSTNAME=localhost spark-submit \
  --conf spark.hadoop.fs.s3a.endpoint=http://localhost:9000 \
  --conf spark.hadoop.fs.s3a.access.key=admin \
  --conf spark.hadoop.fs.s3a.secret.key=password \
  --conf spark.hadoop.fs.s3a.path.style.access=true \
  --conf spark.hadoop.fs.s3a.connection.ssl.enabled=false \
  --conf spark.hadoop.fs.s3a.impl=org.apache.hadoop.fs.s3a.S3AFileSystem \
  --conf spark.hadoop.fs.s3a.aws.credentials.provider=org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider \
  --conf spark.hadoop.fs.s3a.connection.timeout=60 \
  --conf spark.hadoop.fs.s3a.connection.establish.timeout=60 \
  --conf spark.hadoop.fs.s3a.threads.keepalivetime=60 \
  --conf spark.hadoop.fs.s3a.multipart.purge.age=86400 \
  --conf spark.hadoop.fs.obs.multipart.purge.age=86400 \
  --jars ../../../libs/hadoop-aws-3.3.4.jar,../../../libs/aws-java-sdk-bundle-1.12.262.jar \
  src/app.py
```

**Override all of S3A's built-in "60s" string defaults with pure longs in seconds**

```sh
--conf spark.hadoop.fs.s3a.connection.timeout=60 \
--conf spark.hadoop.fs.s3a.connection.establish.timeout=60 \
--conf spark.hadoop.fs.s3a.threads.keepalivetime=60 \
--conf spark.hadoop.fs.s3a.multipart.purge.age=86400 \
--conf spark.hadoop.fs.obs.multipart.purge.age=86400 \
```

Reference: https://github.com/open-metadata/OpenMetadata/issues/22843