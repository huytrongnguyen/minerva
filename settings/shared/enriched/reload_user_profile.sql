{{
  create_or_replace_table({
    'location': '{{lakehouse.location}}/{{product_id}}/enriched/user_profile',
  })
}}

with users_activity as (
  select  product_id, user_id, install_time, install_id
        , agency, media_source, campaign_id, country_code, platform, os_version, device_model
        , registration_time, first_login_time, last_login_time, session_count, level
  from (
    select  product_id, user_id, install_time, install_id
          , agency, media_source, campaign_id, country_code, platform, os_version, device_model
          , registration_time, row_number() over (partition by product_id, user_id order by registration_time) as rn
          , min(first_login_time) over(partition by product_id, user_id) as first_login_time
          , max(last_login_time) over(partition by product_id, user_id) as last_login_time
          , sum(session_count) over(partition by product_id, user_id) as session_count
          , max(level) over(partition by product_id, user_id) as level
    from {{
      source({
        'name': 'users_activity',
        'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/activity',
      })
    }}
  )
  where rn = 1
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
      'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/purchase',
    })
  }}
  group by product_id, user_id
)

select  product_id, user_id, install_time, install_id
      , agency, media_source, campaign_id, country_code, platform, os_version, device_model
      , registration_time, first_login_time, last_login_time, session_count, level
      , first_purchase_time, last_purchase_time, number_of_purchases, revenue_usd
from users_activity
full join users_purchase using (product_id, user_id)
