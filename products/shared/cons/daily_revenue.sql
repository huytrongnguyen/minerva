{{
  insert_into({
    'location': '{{datastore.location}}/cons/daily_revenue/event_date={{event_date}}',
  })
}}
with purchase as (
  select  product_id, user_id, to_date(event_time) as event_date, revenue_value, revenue_currency as currency_code
  from {{
    source({
      'name': 'users_purchase',
      'location': '{{datastore.location}}/users/purchase/event_date={{event_date}}',
    })
  }}
)
, user_profile as (
  select  product_id, user_id
        , coalesce(media_source, 'na') as media_source
        , coalesce(campaign_id, 'na') as campaign_id
        , coalesce(country_code, 'na') as country_code
        , coalesce(platform, 'na') as platform
  from {{
    source({
      'name': 'user_profile',
      'location': '{{datastore.location}}/user_profile',
    })
  }}
)

select  media_source, campaign_id, country_code, platform, currency_code
      , coalesce(sum(revenue_value), 0) as revenue_value
      , product_id, event_date
from (
  select  product_id, user_id, event_date, revenue_value, currency_code
        , media_source, campaign_id, country_code, platform, first_purchase_date
  from purchase left join user_profile using(product_id, user_id)
)
group by product_id, event_date, media_source, campaign_id, country_code, platform, currency_code