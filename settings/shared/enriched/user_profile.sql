{{
  insert_into({
    'location': '{{datastore.location}}/user_profile',
  })
}}

with users_registration as (
  select  product_id, user_id, install_time, install_id
        , agency, media_source, campaign_id, country_code, platform, os_version, device_model
        , registration_time
  from (
    select  product_id, user_id, install_time, install_id
          , agency, media_source, campaign_id, country_code, platform, os_version, device_model
          , registration_time, row_number() over (partition by product_id, user_id order by registration_time) as rn
    from {{
      source({
        'name': 'users_registration',
        'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/registration/partition_date={{event_date}}',
      })
    }}
  )
  where rn = 1
)
, users_activity as (
  select  product_id, user_id
        , min(first_login_time) as first_login_time
        , max(last_login_time) as last_login_time
        , sum(session_count) as session_count
        , max(level) as level
  from {{
    source({
      'name': 'users_activity',
      'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/activity/partition_date={{event_date}}',
    })
  }}
  group by product_id, user_id
)
, users_purchase as (
  select  product_id, user_id
        , min(first_purchase_time) as first_purchase_time
        , max(last_purchase_time) as last_purchase_time
        , sum(number_of_purchases) as number_of_purchases
        , sum(revenue_usd) as revenue_usd
  from {{
    source({
      'name': 'users_purchase',
      'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/purchase/partition_date={{event_date}}',
    })
  }}
  group by product_id, user_id
)

select  product_id, user_id, install_time, install_id
      , agency, media_source, campaign_id, country_code, platform, os_version, device_model
      , registration_time, first_login_time, last_login_time, session_count, level
      , first_purchase_time, last_purchase_time, number_of_purchases, revenue_usd
from users_registration
full join users_activity using (product_id, user_id)
full join users_purchase using (product_id, user_id)

with combine as (
  select  product_id, user_id, install_time, registration_time
        , first_login_time, last_login_time, first_purchase_time, last_purchase_time
        , install_id, media_source, campaign_id, country_code, platform, matching_time
  from {{
    source({
      'name': 'users_activity',
      'location': '{{datastore.location}}/users/activity/event_date={{event_date}}',
    })
  }}
  union (
    select  product_id, user_id, install_time, registration_time
        , first_login_time, last_login_time, first_purchase_time, last_purchase_time
        , install_id, media_source, campaign_id, country_code, platform, matching_time
    from {{
      source({
        'name': 'user_profile',
        'location': '{{datastore.location}}/user_profile',
      })
    }}
  )
)
, qualify as (
  select  product_id, user_id, install_time, matching_time
        , install_id, media_source, campaign, campaign_id, country_code, platform
        , rank() over(partition by product_id, user_id order by registration_time) as rank
        , row_number() over(partition by product_id, user_id, registration_time order by matching_time desc) as rn
        , min(registration_time) over(partition by product_id, user_id) as registration_time
        , min(first_login_time) over(partition by product_id, user_id) as first_login_time
        , max(last_login_time) over(partition by product_id, user_id) as last_login_time
        , min(first_purchase_time) over(partition by product_id, user_id) as first_purchase_time
        , max(last_purchase_time) over(partition by product_id, user_id) as last_purchase_time
  from combine
)

select  user_id, install_time, registration_time
      , first_login_time, last_login_time, first_purchase_time, last_purchase_time
      , media_source, campaign_id, country_code, platform, install_id, matching_time, product_id
from qualify
where rank = 1 and rn = 1
