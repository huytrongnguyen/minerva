{{
  insert_into({
    'location': '{{datastore.location}}/cons/daily_retention/event_date={{event_date}}',
  })
}}
with activity_7 as (
  select  distinct product_id, user_id, to_date(first_login_time) as login_date
  from {{
    source({
      'name': 'users_activity',
      'location': '{{datastore.location}}/users/activity/event_date={{date_range(8,1)}}',
    })
  }}
)
, user_profile as (
  select  product_id, user_id
        , coalesce(media_source, 'na') as media_source
        , coalesce(campaign_id, 'na') as campaign_id
        , coalesce(country_code, 'na') as country_code
        , coalesce(platform, 'na') as platform
        , to_date(coalesce(registration_time, first_login_time)) as event_date
        , datediff('{{event_date}}', to_date(coalesce(registration_time, first_login_time))) as login_diff
  from {{
    source({
      'name': 'user_profile',
      'location': '{{datastore.location}}/user_profile',
    })
  }}
  where datediff('{{event_date}}', to_date(coalesce(registration_time, first_login_time))) in (1, 2, 3, 4, 5, 6, 7)
)

select  media_source, campaign_id, country_code, platform
      , coalesce(count(distinct(case when nru_diff = 1 then user_id end)), 0) as r01
      , coalesce(count(distinct(case when nru_diff = 2 then user_id end)), 0) as r02
      , coalesce(count(distinct(case when nru_diff = 3 then user_id end)), 0) as r03
      , coalesce(count(distinct(case when nru_diff = 4 then user_id end)), 0) as r04
      , coalesce(count(distinct(case when nru_diff = 5 then user_id end)), 0) as r05
      , coalesce(count(distinct(case when nru_diff = 6 then user_id end)), 0) as r06
      , coalesce(count(distinct(case when nru_diff = 7 then user_id end)), 0) as r07
      , product_id, event_date
from (
  select  product_id, user_id, event_date, login_diff, purchase_diff, login_month, purchase_month, event_month
        , media_source, campaign_id, country_code, platform, first_login_date, first_purchase_date
        , datediff(login_date, event_date) as nru_diff
  from user_profile left join activity_7 using(product_id, user_id)
)
group by product_id, event_date, media_source, campaign_id, country_code, platform