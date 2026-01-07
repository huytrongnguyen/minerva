{{
  insert_into({
    'location': '{{datastore.location}}/users/purchase/event_date={{event_date}}',
  })
}}
select  customer_user_id as user_id
      , cast(event_time as timestamp)
      , cast(event_revenue as double) as revenue_value
      , event_revenue_currency as revenue_currency
      , '{{product_id}}' as product_id
      , to_date(event_time) as event_date
from {{
  source({
    'name': 'in_app_events_report',
    'location': '{{inputs.appsflyer.location}}/in_app_events_report/event_date={{event_date}}',
    'type': 'csv',
    'options': {
      'header': 'true'
    }
  })
}}
where event_name = 'af_purchase'