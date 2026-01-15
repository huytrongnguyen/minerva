{{
  create_or_replace_table({
    'partition_by': ['event_name','event_date'],
    'location': '{{lakehouse.location}}/{{product_id}}/raw/appsflyer',
  })
}}
select  *, to_date(event_time) as event_date
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