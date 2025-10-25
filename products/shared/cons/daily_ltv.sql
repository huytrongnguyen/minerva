{{
  insert_into({
    'location': '{{datastore.location}}/cons/daily_ltv/event_date={{event_date}}',
  })
}}
with purchase as (
  select  product_id, user_id, to_date(event_time) as purchase_date, revenue_value, revenue_currency as currency_code
  from {{
    source({
      'name': 'users_purchase',
      'location': '{{datastore.location}}/users/purchase/event_date={{date_range(91,1)}}',
    })
  }}
)
, purchase_90 as (
  select  product_id, user_id, purchase_date, currency_code
        , coalesce(sum(distinct(revenue_value)), 0) as revenue_value
  from purchase
  group by product_id, user_id, purchase_date, currency_code
)
, user_profile as (
  select  product_id, user_id
        , coalesce(media_source, 'na') as media_source
        , coalesce(campaign_id, 'na') as campaign_id
        , coalesce(country_code, 'na') as country_code
        , coalesce(platform, 'na') as platform
        , to_date(coalesce(registration_time, first_login_time)) as event_date
  from {{
    source({
      'name': 'user_profile',
      'location': '{{datastore.location}}/user_profile',
    })
  }}
  where datediff('{{event_date}}', to_date(coalesce(registration_time, first_login_time))) <= 90
)

select  media_source, campaign_id, country_code, platform
      , coalesce(sum(distinct(case when ltv_diff = 0 then revenue_value end)), 0) as ltv00
      , coalesce(sum(distinct(case when ltv_diff <= 30 then revenue_value end)), 0) as ltv30
      , coalesce(sum(distinct(case when ltv_diff <= 60 then revenue_value end)), 0) as ltv60
      , coalesce(sum(distinct(case when ltv_diff <= 90 then revenue_value end)), 0) as ltv90
      , product_id, event_date
from (
  select  product_id, user_id, event_date, currency_code, revenue_value
        , media_source, campaign_id, country_code, platform, first_purchase_date
        , datediff(purchase_date, event_date) as ltv_diff
  from user_profile left join purchase_90 using(product_id, user_id)
)
group by product_id, event_date, media_source, campaign_id, country_code, platform