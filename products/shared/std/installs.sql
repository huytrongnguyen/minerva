{{
  insert_into({
    'location': '{{datastore.location}}/devices/installs/event_date={{event_date}}',
  })
}}
select  '{{product_id}}' as product_id
      , appsflyer_id as install_id
      , cast(install_time as timestamp)
      , media_source
      , campaign
      , af_c_id as campaign_id
      , af_cost_model as cost_model
      , cast(af_cost_value as double) as cost_value
      , af_cost_currency as cost_currency
      , country_code
      , platform
      , to_date(event_time) as event_date
from {{
  source({
    'name': 'install_reports',
    'location': '{{inputs.appsflyer.location}}/install_reports/event_date={{event_date}}',
    'type': 'csv',
    'options': {
      'header': 'true'
    }
  })
}}