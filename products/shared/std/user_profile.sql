{{
  insert_into({
    'location': '{{datastore.location}}/user_profile',
  })
}}

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
