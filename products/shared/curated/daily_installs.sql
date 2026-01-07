{{
  insert_into({
    'location': '{{datastore.location}}/cons/daily_installs/event_date={{event_date}}',
  })
}}
with installs as (
  select  coalesce(media_source, 'na') as media_source
        , coalesce(campaign_id, 'na') as campaign_id
        , coalesce(country_code, 'na') as country_code
        , coalesce(platform, 'na') as platform
        , install_id
        , product_id
        , event_date
  from {{
    source({
      'name': 'devices_installs',
      'location': '{{datastore.location}}/devices/installs/event_date={{event_date}}',
    })
  }}
)

select  media_source, campaign_id, country_code, platform
      , coalesce(count(distinct(install_id)), 0) as installs
      , product_id, event_date
from installs
group by product_id, event_date, media_source, campaign_id, country_code, platform
