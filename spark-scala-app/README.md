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
│       │   └── App.scala
│       └── test/scala/minerva/
│           └── AppSuite.scala
├── settings.gradle
└── docker-compose.yml
```

## Setup Environment

### Install Gradle 7.6 (including OpenJDK 17):

- Install Gradle 7.6.6: `brew install gradle@7`
- Verify installation: `gradle -v`
  - Ensure JVM version is 17.
- Set JAVA_HOME: `export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home`
- Add to your shell profile:
  ```sh
  echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
  source ~/.zshrc
  ```
- Verify Java version: `java -v`
- Set up Gradle wrapper: `gradle wrapper --gradle-version 7.6`
- Ensure gradle.properties includes:
  ```properties
  org.gradle.jvmargs=-Xmx2g -XX:MaxPermSize=512m
  org.gradle.java.home=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
  ```

### Install Python dependencies (Optional)

- Verify installation: `python3 --version`
  - Ensure Python version is 3.9
- Install dependencies
  ```sh
  pip3 install -r requirements.txt
  ```

### Install Colima and Docker CLI

- Install Colima: `brew install colima`
- Install Docker CLI: `brew install docker`
- Start Colima with sufficient resources for Spark and MinIO: `colima start --cpu 10 --memory 24 --disk 128`
  - Adjust CPU/memory based on your system.
  - Use --mount if volume access issues occur (see Troubleshooting).
- Verify Docker is running: `docker ps`

## Build the Project

- Refresh Dependencies: `gradle clean --refresh-dependencies`
- Run Tests: `gradle test` or `python3 -m pytest -s test/minerva/app-suite.py`
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
