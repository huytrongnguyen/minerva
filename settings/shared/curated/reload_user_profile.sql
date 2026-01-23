{{
  create_or_replace_table({
    'location': '{{lakehouse.location}}/{{product_id}}/curated/user_profile',
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
        'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/registration',
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
      'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/activity',
    })
  }}
  group by product_id, user_id
)
, users_purchase as (
  select  product_id, user_id, first_purchase_time, last_purchase_time
        , total_trans, total_amount, min_amount, max_amount, first_amount, last_amount
  from (
    select  product_id, user_id
        , min(first_purchase_time) over (partition by product_id, user_id) as first_purchase_time
        , max(last_purchase_time) over (partition by product_id, user_id) as last_purchase_time
        , sum(total_trans) over (partition by product_id, user_id) as total_trans
        , sum(total_amount) over (partition by product_id, user_id) as total_amount
        , min(min_amount) over (partition by product_id, user_id) as min_amount
        , max(max_amount) over (partition by product_id, user_id) as max_amount
        , first(first_amount) over (partition by product_id, user_id order by first_purchase_time range between unbounded preceding and unbounded following) as first_amount
        , last(last_amount) over (partition by product_id, user_id order by first_purchase_time range between unbounded preceding and unbounded following) as last_amount
        , row_number() over (partition by product_id, user_id order by first_purchase_time) as rn
    from {{
      source({
        'name': 'users_purchase',
        'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/purchase',
      })
    }}
  )
  where rn = 1
)

select  product_id, user_id, install_time, install_id
      , agency, media_source, campaign_id, country_code, platform, os_version, device_model
      , registration_time, first_login_time, last_login_time, session_count, level
      , first_purchase_time, last_purchase_time, total_trans, total_amount, min_amount, max_amount, first_amount, last_amount
from users_registration
full join users_activity using (product_id, user_id)
full join users_purchase using (product_id, user_id)
