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
    # bash_command=f'/opt/airflow/jobs/spark-process.sh gem 2024-05-24 shared/raw/appsflyer/installs_report.sql,shared/raw/appsflyer/in_app_events_report.sql',
    # bash_command=f'/opt/airflow/jobs/spark-process.sh gem 2024-05-24 shared/enriched/user_registration.sql,shared/enriched/user_activity.sql,shared/enriched/user_purchase.sql',
    # bash_command=f'/opt/airflow/jobs/spark-process.sh gem 2024-05-23 shared/enriched/reload_user_profile.sql',
    # bash_command=f'/opt/airflow/jobs/spark-process.sh gem 2024-05-24 shared/enriched/user_profile.sql',
    # bash_command=f'/opt/airflow/jobs/spark-process.sh gem 2024-05-23 shared/curated/daily_installs.sql /opt/airflow/libs/postgresql-42.7.8.jar',
    # bash_command=f'/opt/airflow/jobs/spark-process.sh gem 2024-05-23 shared/curated/daily_activity.sql /opt/airflow/libs/postgresql-42.7.8.jar',
    # bash_command=f'/opt/airflow/jobs/spark-process.sh gem 2024-05-24 shared/curated/daily_retention.sql /opt/airflow/libs/postgresql-42.7.8.jar',
    # bash_command=f'/opt/airflow/jobs/spark-process.sh gem 2024-05-24 shared/curated/daily_ltv.sql /opt/airflow/libs/postgresql-42.7.8.jar',
    bash_command=f'/opt/airflow/jobs/spark-process.sh gem 2024-06-01 shared/bak/migrate_user_profile.sql',
    dag=dag,
  )
