{{ config(materialized='view') }}

select  bundle_id
      , app_id
      , customer_user_id as user_id
      , event_time as payment_time
      , appsflyer_id as install_id
      , platform
      , device_model
      , os_version
      , country_code
      , ip
      , event_source
      , event_value
      , event_revenue as revenue
      , event_revenue_currency as revenue_currency
from {{ source('appsflyer', 'in_app_events') }}
where event_time is not null and event_name = 'af_purchase'