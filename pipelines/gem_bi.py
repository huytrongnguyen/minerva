from airflow import DAG
from datetime import datetime
from functions.shared import create_dag, empty_operator, spark_submit_operator, spark_submit_operator_with_postgres

product_id = 'gem'
event_date = '{{ ds }}'

with create_dag(
  dag_id = f'{product_id}_bi',
  start_date = datetime(2024, 5, 24),
  schedule = '0 1 * * *',
  extend = { 'end_date': datetime(2024, 7, 1), 'tags': ['player360', 'ltv', 'attribution'] }
) as dag:

  start = empty_operator(dag, 'start')
  ingest = spark_submit_operator(dag, 'ingest', product_id, event_date, 'shared/raw/appsflyer/installs_report.sql,shared/raw/appsflyer/in_app_events_report.sql')
  standardize_user_telemetry = spark_submit_operator(dag, 'standardize_user_telemetry', product_id, event_date, 'shared/enriched/user_registration.sql,shared/enriched/user_activity.sql,shared/enriched/user_purchase.sql')
  build_user_profile = spark_submit_operator(dag, 'build_user_profile', product_id, event_date, 'shared/curated/user_profile.sql')
  consolidate_daily_installs = spark_submit_operator_with_postgres(dag, 'consolidate_daily_installs', product_id, event_date, 'shared/curated/daily_installs.sql')
  consolidate_daily_activity = spark_submit_operator_with_postgres(dag, 'consolidate_daily_activity', product_id, event_date, 'shared/curated/daily_activity.sql')
  consolidate_daily_retention = spark_submit_operator_with_postgres(dag, 'consolidate_daily_retention', product_id, event_date, 'shared/curated/daily_retention.sql')
  consolidate_daily_ltv = spark_submit_operator_with_postgres(dag, 'consolidate_daily_ltv', product_id, event_date, 'shared/curated/daily_ltv.sql')
  end = empty_operator(dag, 'end')

  start >> ingest >> standardize_user_telemetry >> build_user_profile >> [consolidate_daily_installs, consolidate_daily_retention]
  consolidate_daily_installs >> consolidate_daily_activity >> end
  consolidate_daily_retention >> consolidate_daily_ltv >> end

