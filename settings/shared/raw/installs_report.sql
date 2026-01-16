{{
  create_or_replace_table({
    'partition_by': ['partition_date'],
    'location': '{{lakehouse.location}}/{{product_id}}/raw/appsflyer/installs_report',
  })
}}
select  *, to_date(event_time) as partition_date
from {{
  source({
    'name': 'install_reports',
    'location': '{{ingested.location}}/{{product_id}}/appsflyer/installs_report/app_id={{app_ids}}/event_date={{event_date}}',
    'type': 'csv',
    'options': {
      'header': 'true'
    }
  })
}}