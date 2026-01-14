insert overwrite user_activity partition (partition_column = 'event_date')

with installs as (
  select  install_id, event_time as install_time, media_source, campaign_id, country_code, platform
        , product_id
  from device_installs
  where event_date between date_sub({{var('event_date')}}, 7) and {{var('event_date')}}
)
, registration as (
  select  user_id, install_id, event_time as registration_time
        , product_id, event_date
  from user_registration
  where event_date = {{var('event_date')}}
)
, login as (
  select  user_id, min(event_time) as first_login_time, max(event_time) as last_login_time
        , product_id, event_date
  from user_login
  where event_date = {{var('event_date')}}
  group by user_id, product_id, event_date
)
, purchase as (
  select  user_id, min(event_time) as first_purchase_time, max(event_time) as last_purchase_time
        , product_id, event_date
  from user_purchase
  where event_date = {{var('event_date')}}
  group by user_id, product_id, event_date
)
, new_user as (
  select  user_id, install_time, registration_time, current_timestamp() as matching_time
        , install_id, media_source, campaign_id, country_code, platform
        , product_id, event_date
  from registration left join install using (product_id, install_id)
  qualify row_number() over (partition by product_id, event_date, user_id order by install_time) = 1
)

select user_id, install_time, registration_time, matching_time
      , first_login_time, last_login_time, first_purchase_time, last_purchase_time
      , install_id, media_source, campaign_id, country_code, platform
      , product_id, event_date
from new_user
full join login using (user_id, product_id, event_date)
full join purchase using (user_id, product_id, event_date)