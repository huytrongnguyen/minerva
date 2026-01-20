from typing import Any, Dict
from airflow.operators.empty import EmptyOperator
from airflow.operators.bash import BashOperator
from airflow import DAG

from datetime import timedelta
from datetime import datetime

def create_dag(product_id: str, dag_type: str, start_date: datetime, schedule: str, extend: Dict[str, Any]):
  return DAG(
    dag_id = f'{product_id}_{dag_type}',
    default_args = { 'owner': 'minerva', 'start_date': start_date, 'depends_on_past': True, 'wait_for_downstream': True, **extend },
    schedule = schedule,
    tags = extend['tags'] if 'tags' in extend else [],
    max_active_runs = 1,
    catchup = True)

def empty_operator(dag, task_id):
  return EmptyOperator(task_id = task_id, dag = dag)

def spark_submit_operator(dag: DAG, task_id: str, product_id: str, event_date: str, models: str, retries = 0, retry_delay = 15):
  return BashOperator(
    task_id = task_id,
    bash_command = f'/opt/airflow/processor/spark-process.sh {product_id} {event_date} {models}',
    dag = dag, retries = retries, retry_delay = timedelta(minutes = retry_delay)
  )
