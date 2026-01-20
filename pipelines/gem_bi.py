from datetime import datetime
from functions.shared import create_dag, spark_submit_operator
# from airflow import DAG

product_id = 'gem'
event_date = '{{ ds }}'

with create_dag(
  product_id = product_id,
  dag_type = 'bi',
  start_date = datetime(2024, 5, 23),
  schedule = '0 1 * * *',
  extend = { 'end_date': datetime(2024, 6, 30), 'tags': ['player360', 'ltv', 'attribution'] }
) as dag:

  ingest = spark_submit_operator(dag, 'ingest', product_id, event_date, 'shared/raw/appsflyer/installs_report.sql,shared/raw/appsflyer/in_app_events_report.sql')
  standardize_user_telemetry = spark_submit_operator(dag, 'standardize_user_telemetry', product_id, event_date, 'shared/enriched/user_registration.sql,shared/enriched/user_activity.sql,shared/enriched/user_purchase.sql')
  build_user_profile = spark_submit_operator(dag, 'build_user_profile', product_id, event_date, 'shared/enriched/user_profile.sql')

  ingest >> standardize_user_telemetry >> build_user_profile

