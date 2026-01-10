{{
  insert_into({
    'location': '{{targets.warehouse.location}}/{{product_id}}/users/activity/event_date={{event_date}}',
  })
}}

with in_app_events as (
  select *
  from {{
    source({
      'name': 'in_app_events',
      'type': 'csv',
      'options': {
        'header': 'true'
      },
      'location': '{{targets.warehouse.location}}/{{product_id}}/appsflyer/in_app_events_report/app_id={{vars.app_ids}}/event_date={{event_date}}',
    })
  }}
)
, registration as (
  select  product_id, event_date, user_id, event_time as registration_time, install_id
  from in_app_events
  where event_name = 'registration'
)
, new_user as (
  select  product_id, event_date, user_id, install_time, registration_time, matching_time
        , install_id, media_source, campaign_id, country_code, platform
  from (
    select  product_id, event_date, user_id, install_time, registration_time, current_timestamp() as matching_time
          , install_id, media_source, campaign_id, country_code, platform
          , row_number() over (partition by product_id, event_date, user_id order by install_time) as rn
    from registration left join install using (product_id, install_id)
  )
  where rn = 1
)
, login as (
  select  product_id, event_date, user_id, min(event_time) as first_login_time, max(event_time) as last_login_time
  from {{
    source({
      'name': 'users_login',
      'location': '{{datastore.location}}/users/login/event_date={{event_date}}',
    })
  }}
  group by product_id, event_date, user_id
)
, purchase as (
  select  product_id, event_date, user_id, min(event_time) as first_purchase_time, max(event_time) as last_purchase_time
  from {{
    source({
      'name': 'users_purchase',
      'location': '{{datastore.location}}/users/purchase/event_date={{event_date}}',
    })
  }}
  group by product_id, event_date, user_id
)

select user_id, install_time, registration_time
      , first_login_time, last_login_time, first_purchase_time, last_purchase_time
      , install_id, media_source, campaign_id, country_code, platform, matching_time
      , product_id, event_date
from new_user
full join login using (product_id, event_date, user_id)
full join purchase using (product_id, event_date, user_id)