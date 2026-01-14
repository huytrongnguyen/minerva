# Guide

## Install Prerequisites on Mac

- Install Homebrew if not already: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- Install Colima: `brew install colima`
- Start Colima with resource limits: `colima start --cpu 8 --memory 12 --disk 50` (allocates 8 CPUs, 12GB RAM, 50GB disk—adjust based on your 10-core setup).
- Install Docker CLI: `brew install docker docker-compose`
- Verify: `docker ps` should work via Colima.

## Set Up Docker Compose

- Create `docker-compose.yml` in your project dir
- Add `init-db.sh` (for multi-DB Postgres init). Make it executable: `chmod +x init-db.sh`.
- Run: `docker-compose up -d`
- Access: MinIO console at http://localhost:9001 (login: admin/password). Create a bucket like `lakehouse`.
- Postgres: Connect via DBeaver.
- Spark UI: http://localhost:8080
- Airflow UI: http://localhost:8081 (default login: admin/admin). Init DB first: `docker-compose exec airflow airflow db init` (creates tables in 'airflow' DB).