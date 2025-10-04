insert overwrite device_installs partition (partition_column = 'event_date')
select  appsflyer_id as install_id
      , cast(install_time as timestamp) as event_time
      , media_source
      , campaign
      , af_c_id as campaign_id
      , af_cost_model as cost_model
      , cast(af_cost_value as double) as cost_value
      , af_cost_currency as cost_currency
      , country_code
      , platform
      , {{var('product_id')}} as product_id
      , to_date(event_time) as event_date
from appsflyer_installs_report
where to_date(event_time) = {{var('event_date')}}
and app_id in {{var('app_id')}}