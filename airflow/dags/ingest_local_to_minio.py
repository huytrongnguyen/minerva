from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime

with DAG(
    dag_id='ingest_local_to_minio',
    start_date=datetime(2026, 1, 14),
    schedule='@once',
    catchup=False,
    tags=['ingest', 'spark', 'minio'],
) as dag:

  event_date = '{{ macros.ds_add(ds, 0) }}'

  spark_ingest = BashOperator(
    task_id='run_spark_ingest_script',
    bash_command=f'/opt/airflow/jobs/spark-runner.sh gem {event_date} shared/enriched/reload_user_profile.sql',
    dag=dag,
  )

  spark_ingest