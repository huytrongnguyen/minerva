from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime

with DAG(
    dag_id='ingest_local_to_minio',
    start_date=datetime(2026, 1, 14),
    schedule=None, # manual trigger
    catchup=False,
    tags=['ingest', 'spark', 'minio'],
) as dag:

  event_date = '{{ ds }}'

  spark_ingest = BashOperator(
    task_id='spark_ingest',
    bash_command=f'/opt/airflow/jobs/spark-ingest.sh gem {event_date} shared/raw/installs_report.sql',
    dag=dag,
  )
