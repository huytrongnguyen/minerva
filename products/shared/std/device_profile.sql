{{
  insert_into({
    'location': '{{datastore.location}}/device_profile',
  })
}}

with combine as (
  select  install_id, install_time, media_source, campaign, campaign_id, country_code, platform, product_id
  from {{
    source({
      'name': 'devices_installs',
      'location': '{{datastore.location}}/devices/installs/event_date={{event_date}}',
    })
  }}
  union (
    select  install_id, install_time, media_source, campaign, campaign_id, country_code, platform
    from {{
      source({
        'name': 'device_profile',
        'location': '{{datastore.location}}/device_profile',
      })
    }}
  )
)
, qualify as (
  select  install_id, install_time, media_source, campaign, campaign_id, country_code, platform, product_id
        , row_number() over(partition by product_id, install_id order by install_time) as rn
  from combine
)

select  install_id, install_time, media_source, campaign, campaign_id, country_code, platform, product_id
from qualify
where rn = 1
