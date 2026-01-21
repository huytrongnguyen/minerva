{{
  create_or_replace_table({
    'type': 'jdbc',
    'name': 'ztmp_daily_retention',
    'location': '{{settings_dir}}/{{product_id}}/curated_cred.json',
    'postprocess': '{{settings_dir}}/shared/curated/f_daily_retention.sql',
  })
}}

with users_activity as (
  select  product_id, user_id, to_date(first_login_time) as login_date
  from {{
    source({
      'name': 'users_activity',
      'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/activity/partition_date={{date_range(33,1)}}',
    })
  }}
)
, user_profile as (
  select  product_id, user_id
        , coalesce(agency, 'na') as agency
        , coalesce(media_source, 'na') as media_source
        , coalesce(campaign_id, 'na') as campaign_id
        , coalesce(country_code, 'na') as country_code
        , coalesce(platform, 'na') as platform
        , to_date(registration_time) as event_date
  from {{
    source({
      'name': 'user_profile',
      'location': '{{lakehouse.location}}/{{product_id}}/enriched/user_profile',
    })
  }}
  where datediff('{{event_date}}', registration_time) in (1, 7, 30)
)

select  product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , coalesce(count(distinct(case when nru_datediff = 1 then user_id end)), 0) as ruser01
      , coalesce(count(distinct(case when nru_datediff = 7 then user_id end)), 0) as ruser07
      , coalesce(count(distinct(case when nru_datediff = 30 then user_id end)), 0) as ruser30
from (select  product_id, event_date, agency, media_source, campaign_id, country_code, platform
            , datediff(login_date, event_date) as nru_datediff, user_id
      from user_profile left join users_activity using(product_id, user_id))
group by product_id, event_date, agency, media_source, campaign_id, country_code, platform
