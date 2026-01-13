{{
  create_or_replace_table({
    'location': '{{targets.warehouse.location}}/{{product_id}}/user_profile',
  })
}}

with qualify as (
  select  product_id, user_id, install_time, register_time
        , agency, media_source, campaign_id, country_code, platform, install_id
        , row_number() over(partition by product_id, user_id order by register_time) as rn
        , min(first_login_time) over(partition by product_id, user_id) as first_login_time
        , max(last_login_time) over(partition by product_id, user_id) as last_login_time
        , sum(session_count) over(partition by product_id, user_id) as session_count
        , min(first_payment_time) over(partition by product_id, user_id) as first_payment_time
        , max(last_payment_time) over(partition by product_id, user_id) as last_payment_time
        , sum(revenue_usd) over(partition by product_id, user_id) as revenue_usd
        , sum(number_of_payments) over(partition by product_id, user_id) as number_of_payments
  from {{
    source({
      'name': 'users_snapshot',
      'location': '{{targets.warehouse.location}}/{{product_id}}/users/snapshot/event_date={{event_date}}',
    })
  }}
)

select  product_id, user_id, install_time, register_time
      , agency, media_source, campaign_id, country_code, platform, install_id
      , first_login_time, last_login_time, session_count
      , first_payment_time, last_payment_time, revenue_usd, number_of_payments
from qualify
where rn = 1
