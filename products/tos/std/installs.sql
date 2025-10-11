{{
  insert_overwrite({
    'path': '{{ location("datastore") }}/{{ vars("product_id") }}/devices/installs/{{ event_date }}',
    'type': 'parquet'
  })
}}

select  '{{ vars("product_id") }}' as product_id
      , to_date(event_time) as event_date
      , appsflyer_id as install_id
      , cast(install_time as timestamp) as event_time
      , media_source
      , campaign
      , af_c_id as campaign_id
      , af_cost_model as cost_model
      , cast(af_cost_value as double) as cost_value
      , af_cost_currency as cost_currency
      , country_code
      , platform
from {{
  source({
    'name': 'appsflyer_installs_report'
    'path': '{{ location("inputs.appsflyer") }}/{{ vars("product_id") }}/{{ event_date }}/installs_report',
    'type': 'csv'
  })
}}