# Minerva

This project is a Spark 3.5.3 application built with Scala 2.12 and Java 17, using Gradle 7.6 as the build tool. It reads and writes data to a MinIO bucket and includes JUnit 5 tests. The application is deployed using Docker Compose with Colima as the Docker runtime on macOS or Linux.

## Prerequisites

- **Java 17**: OpenJDK 17.
- **Gradle**: Version 7.6 for Java 17 compatibility.
- **Colima**: Version 0.7.0 or later for Docker runtime.
- **Docker CLI**: For running Docker commands.

## Project Structure

```
minerva/
├── app
│   ├── build.gradle
│   └── src/
│       ├── main/scala/minerva/
│       │   └── SparkApp.scala
│       └── test/scala/minerva/
│           └── SparkAppTest.scala
├── gradle.properties
├── settings.gradle
└── docker-compose.yml
```

## Setup Environment

### Install Gradle 7.6 (including OpenJDK 17):

- Install Gradle 7.6.6: `brew install gradle@7`
- Verify installation: `gradle -v`
  - Ensure JVM version is 17.
- Set JAVA_HOME: `export JAVA_HOME=/path/to/jdk-17`
- Add to your shell profile: 
  ```sh
  echo 'export JAVA_HOME=/path/to/jdk-17' >> ~/.zshrc
  source ~/.zshrc
  ```
- Verify Java version: `java -v`
- Set up Gradle wrapper: `gradle wrapper --gradle-version 7.6`
- Ensure gradle.properties includes:
  ```properties
  org.gradle.jvmargs=-Xmx2g -XX:MaxPermSize=512m
  org.gradle.java.home=/path/to/jdk-17
  ```
  - Replace /path/to/jdk-17 with your JDK 17 path.

### Install Colima and Docker CLI:
- Install Colima: `brew install colima`
- Install Docker CLI: `brew install docker`
- Start Colima with sufficient resources for Spark and MinIO: `colima start --cpu 6 --memory 12 --disk 20`
  - Adjust CPU/memory based on your system.
  - Use --mount if volume access issues occur (see Troubleshooting).
- Verify Docker is running: `docker ps`

## Build the Project

- Refresh Dependencies: `gradle clean --refresh-dependencies`
- Run Tests: `gradle test`
  - The project includes a JUnit 5 test to verify DataFrame creation.
  - View test results in build/reports/tests/test/index.html if errors occur.
  - Note: Tests include JVM arguments to handle Java 17 module access issues.
- Build the JAR: `gradle build`
  - Output JAR: build/libs/app.jar.

## Deploy with Docker Compose and Colima

### Set Up MinIO:

- Start Docker Compose services: `docker compose up -d`
- Access MinIO UI at http://localhost:9001 (use 192.168.5.2 if localhost fails, as Colima uses this IP by default).
- Log in with minioadmin:minioadmin.
- Create a bucket named spark-bucket.

### Run the Spark Cluster:
- The docker-compose.yml sets up a Spark cluster with:
  - 1 master node (spark-master) on ports 8080 (UI) and 7077 (cluster communication).
  - 2 worker nodes (spark-worker-1, spark-worker-2) on ports 8081 and 8082.
  - A submit node (spark-submit) to run the application, which:
    - Creates a sample DataFrame.
    - Writes it to s3a://spark-bucket/output in MinIO.
    - Reads and displays the data.
- Check cluster status in Spark UI: http://localhost:8080 (or 192.168.5.2:8080).
- Check logs: 
  ```sh
  docker-compose logs spark-master
  docker-compose logs spark-worker-1
  docker-compose logs spark-worker-2
  docker-compose logs spark-submit
  ```
- Verify output in MinIO UI (spark-bucket/output folder).

### Stop Services: 

```sh
docker compose down
colima stop
```

## Run Locally (Optional)
- Run the application locally (requires MinIO running):./gradlew run
- Note: Ensure MinIO is accessible at http://192.168.5.2:9000 (Colima’s default IP) with spark-bucket created. Update SparkMinioApp.scala to use http://192.168.5.2:9000 if needed.

## Troubleshooting

- Test Failures:
  - Check build/reports/tests/test/index.html for detailed errors.
  - Ensure JAVA_HOME points to JDK 17.
  - Verify JVM arguments in build.gradle for Java 17 module access.
- Colima Networking Issues:
  - If MinIO UI is inaccessible at http://localhost:9001, try http://192.168.5.2:9001.
  - Update SparkMinioApp.scala to use http://192.168.5.2:9000 for MinIO endpoint if Spark fails to connect.
  - Run Colima with --network-address for host networking: `colima start --network-address`
- Volume Mount Issues:
  - If build/libs or src/main/scala aren’t accessible in Docker, run Colima with a mount: 
    ```sh
    colima start --mount /path/to/spark-minio-app:w
    ```
  - Ensure project directory is in a writable location (e.g., ~/projects).
- Resource Constraints:
  - If Spark jobs fail due to memory/CPU limits, increase Colima resources:
    ```sh
    colima stop
    colima start --cpu 8 --memory 16
    ```
- Docker Errors:
  - Check Colima status: colima status.
  - Restart Colima: colima stop && colima start.
  - Verify Docker context: docker context ls (should use colima).
- Module Access Errors:
  - The build.gradle and docker-compose.yml include --add-exports and --add-opens to handle Java 17 restrictions. If errors persist, verify these arguments are applied.
- Spark 3.5.5:
  - If using Spark 3.5.5, update build.gradle dependencies and docker-compose.yml image (check Maven Central for availability).
- Cluster Issues:
  - If workers don’t connect to the master, check logs (docker-compose logs spark-master) and ensure SPARK_MASTER_URL=spark://spark-master:7077.
  - If the job hangs, add extra_hosts to all Spark services in docker-compose.yml:
    ```yaml
    extra_hosts:
      - "host.docker.internal:192.168.5.2"
    ```

## Notes

- Spark Version: Uses Spark 3.5.3 due to availability. For Spark 3.5.5, update build.gradle dependencies and Docker image if released.
- Apache Spark: Uses apache/spark:3.5.3-scala2.12-java17-python3-ubuntu, maintained by the Apache Spark community, ideal for development and production.
- MinIO: Uses minio/minio:latest for the latest features. For production, consider minio/minio:RELEASE.2025-07-31T02-24-37Z to avoid breaking changes.
- Java 17: Includes JVM arguments to resolve module access issues with Spark and Hadoop.
- Gradle 7.6: Chosen for Java 17 compatibility, avoiding potential issues with Gradle 8.x and newer Java versions.
- Colima: Replaces Docker Desktop for lightweight Docker runtime. Ensure Colima is running before using Docker commands.
- MinIO: Configured with default credentials (minioadmin:minioadmin). Update in docker-compose.yml and App.scala if changed.
- IDE: For IntelliJ, set Project SDK to JDK 17 and Gradle JVM to JDK 17 (Preferences > Build, Execution, Deployment > Gradle).

For issues, check logs or open an issue in the repository.