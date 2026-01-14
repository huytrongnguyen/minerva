{{
  create_or_replace_table({
    'partition_by': ['event_date'],
    'location': '{{lakehouse.location}}/{{product_id}}/devices/installs',
  })
}}
select  *, to_date(event_time) as event_date
from {{
  source({
    'name': 'install_reports',
    'location': '{{ingested.location}}/{{product_id}}/appsflyer/installs_report/app_id={{app_ids}}/event_date=2024-05-20',
    'type': 'csv',
    'options': {
      'header': 'true'
    }
  })
}}