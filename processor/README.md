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

**Work with Python 3.14**

- Set up a virtual environment: `python3 -m venv myenv`
- Start the virtual environment: `source myenv/bin/activate`
- Install your package: `pip3 install -r requirements.txt`
- Deactivate when finished: `deactivate`

### Install Colima and Docker CLI:
- Install Colima: `brew install colima`
- Install Docker CLI: `brew install docker`
- Start Colima with sufficient resources for Spark and MinIO: `colima start --cpu 10 --memory 24 --disk 128`
  - Adjust CPU/memory based on your system.
  - Use --mount if volume access issues occur (see Troubleshooting).
- Verify Docker is running: `docker ps`