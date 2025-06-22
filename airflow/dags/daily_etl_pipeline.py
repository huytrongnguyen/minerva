from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime

# Define the DAG and its schedule
with DAG(
    'daily_etl_pipeline',                   # Name of the DAG
    start_date=datetime(2023, 1, 1),        # Start date of the DAG
    schedule_interval='@daily',             # This means the DAG runs daily
    # Note: you can also specify a cron expression like '0 0 * * *' or '@daily'
    catchup=False                           # Prevent DAG runs from being created for past dates
) as dag:

    # Task 1: Ingest raw data
    ingest = BashOperator(
        task_id='ingest_raw_data',
        bash_command='python3 /scripts/ingest.py'  # Path to your ingestion script
    )

    # Task 2: Run dbt models
    run_dbt = BashOperator(
        task_id='run_dbt_models',
        bash_command='cd /dbt && dbt run --profiles-dir .'  # Run dbt models
    )

    # Task 3: Test dbt models
    test_dbt = BashOperator(
        task_id='test_dbt_models',
        bash_command='cd /dbt && dbt test --profiles-dir .'  # Run dbt tests
    )

    # Define task dependencies: ingest -> run_dbt -> test_dbt
    ingest >> run_dbt >> test_dbt