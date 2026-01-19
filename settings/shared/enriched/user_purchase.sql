{{
  create_or_replace_table({
    'partition_by': ['partition_date'],
    'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/purchase',
  })
}}

with in_app_events as (
  select *, '{{product_id}}' as product_id, substring(sha(customer_user_id), 0, 12) as user_id, to_date('{{event_date}}') as partition_date
  from {{
    source({
      'name': 'in_app_events',
      'location': '{{lakehouse.location}}/{{product_id}}/raw/appsflyer/in_app_events_report/partition_date={{event_date}}',
    })
  }}
)
, purchase as (
  select  product_id, user_id, partition_date
        , event_revenue_currency as currency, cast(event_time as timestamp) as event_time
        , cast(event_revenue as double) as revenue, cast(event_revenue_usd as double) as amount
  from in_app_events
  where event_name = 'af_purchase' and event_revenue is not null and user_id is not null
)

select  product_id, user_id, currency, revenue, first_purchase_time, last_purchase_time
      , total_trans, total_amount, min_amount, max_amount, first_amount, last_amount, partition_date
from (
  select  product_id, user_id, currency
        , sum(revenue) over (partition by product_id, user_id, currency) as revenue
        , min(event_time) over (partition by product_id, user_id, currency) as first_purchase_time
        , max(event_time) over (partition by product_id, user_id, currency) as last_purchase_time
        , count(event_time) over (partition by product_id, user_id, currency) as total_trans
        , sum(amount) over (partition by product_id, user_id, currency) as total_amount
        , min(amount) over (partition by product_id, user_id, currency) as min_amount
        , max(amount) over (partition by product_id, user_id, currency) as max_amount
        , first(amount) over (partition by product_id, user_id, currency order by event_time range between unbounded preceding and unbounded following) as first_amount
        , last(amount) over (partition by product_id, user_id, currency order by event_time range between unbounded preceding and unbounded following) as last_amount
        , partition_date
        , row_number() over (partition by product_id, user_id, currency order by event_time) as rn
  from purchase
)
where rn = 1
