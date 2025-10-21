with combine as (
  select  product_id, install_id
        , media_source, campaign, campaign_id, country_code, platform
        , install_time
  from installs
  union (
    select  product_id, install_id
          , media_source, campaign, campaign_id, country_code, platform
          , install_time
    from device_profile
  )
)
, qualify as (
  select  product_id, install_id
        , media_source, campaign, campaign_id, country_code, platform
        , install_time, row_number() over(partition by product_id, install_id order by install_time) as rn
  from combine
)

select  product_id, install_id
      , media_source, campaign, campaign_id, country_code, platform
      , install_time
from qualify
where rn = 1
