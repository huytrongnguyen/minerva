{{
  create_or_replace_table({
    'partition_by': ['partition_date'],
    'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/purchase',
  })
}}

with in_app_events as (
  select *, '{{product_id}}' as product_id, customer_user_id as user_id, to_date('{{event_date}}') as partition_date
  from {{
    source({
      'name': 'in_app_events',
      'location': '{{lakehouse.location}}/{{product_id}}/raw/appsflyer/in_app_events_report/partition_date={{event_date}}',
    })
  }}
)

select  product_id, user_id, event_revenue_currency as currency
      , min(cast(event_time as timestamp)) as first_purchase_time, max(cast(event_time as timestamp)) as last_purchase_time
      , count(event_time) as number_of_purchases, sum(event_revenue) as revenue, sum(event_revenue_usd) as revenue_usd
      , partition_date
from in_app_events
where event_name = 'af_purchase' and event_revenue is not null and user_id is not null
group by product_id, user_id, event_revenue_currency, partition_date
