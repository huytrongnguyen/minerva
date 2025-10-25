{{
  insert_into({
    'location': '{{datastore.location}}/cons/daily_cost/event_date={{event_date}}',
  })
}}
with installs as (
  select  coalesce(media_source, 'na') as media_source
        , coalesce(campaign_id, 'na') as campaign_id
        , coalesce(country_code, 'na') as country_code
        , coalesce(platform, 'na') as platform
        , coalesce(cost_currency, 'na') as currency_code
        , cost_value
        , product_id
        , event_date
  from {{
    source({
      'name': 'devices_installs',
      'location': '{{datastore.location}}/devices/installs/event_date={{event_date}}',
    })
  }}
)

select  media_source, campaign_id, country_code, platform, currency_code
      , coalesce(sum(distinct(cost_value)), 0) as cost_value
      , product_id, event_date
from installs
group by product_id, event_date, media_source, campaign_id, country_code, platform, currency_code