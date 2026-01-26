insert overwrite user_purchase partition (partition_column = 'event_date')
select  customer_user_id as user_id
      , cast(event_time as timestamp) as event_time
      , cast(event_revenue as double) as revenue_value
      , event_revenue_currency as revenue_currency
      , {{var('product_id')}} as product_id
      , to_date(event_time) as event_date
from appsflyer_installs_report
where to_date(event_time) = {{var('event_date')}}
and app_id in {{var('app_id')}}
and event_name = 'af_purchase'