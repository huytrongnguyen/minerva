insert overwrite user_login partition (partition_column = 'event_date')
select  customer_user_id as user_id
      , cast(event_time as timestamp) as event_time
      , {{var('product_id')}} as product_id
      , to_date(event_time) as event_date
from appsflyer_installs_report
where to_date(event_time) = {{var('event_date')}}
and app_id in {{var('app_id')}}
and event_name = 'af_login'