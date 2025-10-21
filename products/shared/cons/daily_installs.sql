{{insert_into("{{datastore.location}}/cons/daily_installs/event_date={{event_date}}")}}
select  product_id
      , to_date(event_time) as event_date
      , coalesce(media_source, 'na')
      , coalesce(campaign_id, 'na')
      , coalesce(country_code, 'na')
      , coalesce(platform, 'na')
      , count(distinct(install_id)) as installs
from {{source("{{datastore.location}}/devices/installs/event_date={{event_date}}")}}