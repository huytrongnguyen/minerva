# Minerva

This project is a Spark 3.5.3 application built with Scala 2.12 and Java 17, using Gradle 7 as the build tool. It reads and writes data to a MinIO bucket and includes JUnit 5 tests. The application is deployed using Docker Compose, with Spark and MinIO services.

## Prerequisites

- Java 17: OpenJDK 17.
- Gradle: Version 7.6.6.
- Docker: Docker and Docker Compose for running MinIO and Spark.
- Git: For cloning the repository.
- Internet Access: To download dependencies and Docker images.

## Project Structure

minerva/
├── app
│   ├── build.gradle
│   ├── gradle.properties
│   └── src/
│       ├── main/
│       │   └── scala/minerva/SparkApp.scala
│       └── test/
│           └── scala/minerva/SparkAppTest.scala
└── docker-compose.yml

## Setup Environment

- Install Gradle 7, it will also install OpenJDK 17:
  - Install Gradle 7.6.6: `brew install gradle@7`
  - Verify installation: `gradle --v`
- Install Colima + Docker:
  ```sh
  brew install colima
  brew install docker
  ```

## Build the Project

- Refresh Dependencies: `gradle clean --refresh-dependencies`
- Run Tests: `gradle test`
  - The project includes a JUnit 5 test to verify DataFrame creation.
  - View test results in build/reports/tests/test/index.html if errors occur.
  - Note: Tests include JVM arguments to handle Java 17 module access issues.
- Build the JAR: `gradle build`
  - Output JAR: build/libs/app.jar.

## Deploy with Docker Compose

- Set Up MinIO:

  - Start Docker Compose services: `docker compose up -d`
  - Access MinIO UI at http://localhost:9001.
  - Log in with minioadmin:minioadmin.
  - Create a bucket named spark-bucket.
- Run the Spark Application:
  - The docker-compose.yml automatically runs the Spark application, which:
    - Creates a sample DataFrame.
    - Writes it to s3a://spark-bucket/output in MinIO.
    - Reads and displays the data.
  - Check logs: `docker-compose logs spark`
  - Verify output in MinIO UI (spark-bucket/output folder).
- Stop Services: `docker compose down`

## Run Locally (Optional)
- Run the application locally (requires MinIO running):./gradlew run
- Note: Ensure MinIO is accessible at http://localhost:9000 with spark-bucket created.

## Troubleshooting

- Test Failures:
  - Check build/reports/tests/test/index.html for detailed errors.
  - Ensure JAVA_HOME points to JDK 17.
  - Verify JVM arguments in build.gradle for Java 17 module access.
- Docker Issues:
  - Confirm MinIO is running: docker ps.
  - Check Spark logs: docker-compose logs spark.
  - Ensure spark-bucket exists in MinIO.
- Module Access Errors:
  - The build.gradle and docker-compose.yml include --add-exports and --add-opens to handle Java 17 restrictions. If errors persist, verify these arguments are applied.
- Spark 3.5.5:
  - If using Spark 3.5.5, update build.gradle dependencies and docker-compose.yml image (check Maven Central for availability).



## Notes

- Spark Version: Uses Spark 3.5.3 due to availability. For Spark 3.5.5, update build.gradle dependencies and Docker image if released.
- Java 17: Includes JVM arguments to resolve module access issues with Spark and Hadoop.
- MinIO: Configured with default credentials (minioadmin:minioadmin). Update in docker-compose.yml and SparkMinioApp.scala if changed.
- IDE: For IntelliJ, set Project SDK to JDK 17 and Gradle JVM to JDK 17 (Preferences > Build, Execution, Deployment > Gradle).

For issues, check logs or open an issue in the repository.