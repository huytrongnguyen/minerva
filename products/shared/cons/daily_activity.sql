{{
  insert_into({
    'location': '{{datastore.location}}/cons/daily_activity/event_date={{event_date}}',
  })
}}
with activity as (
  select  product_id, user_id, '{{event_date}}' as event_date
        , to_date(first_login_time) as login_date
        , to_date(first_purchase_time) as purchase_date
        , date_format(first_login_time, 'yyyy-MM') as login_month
        , date_format(first_purchase_time, 'yyyy-MM') as purchase_month
        , datediff('{{event_date}}', to_date(first_login_time)) as login_diff
        , datediff('{{event_date}}', to_date(first_purchase_time)) as purchase_diff
  from {{
    source({
      'name': 'users_activity',
      'location': '{{datastore.location}}/users/activity/event_date={{date_range(31,1)}}',
    })
  }}
)
, activity_30 as (
  select  product_id, user_id, event_date, login_diff, purchase_diff, login_month, purchase_month
        , to_date(event_date) as event_month
  from activity
  where (0 <= login_diff and login_diff < 30) or (0 <= purchase_diff and purchase_diff < 30)
)
, user_profile as (
  select  product_id, user_id
        , coalesce(media_source, 'na') as media_source
        , coalesce(campaign_id, 'na') as campaign_id
        , coalesce(country_code, 'na') as country_code
        , coalesce(platform, 'na') as platform
        , to_date(coalesce(, first_login_time)) as first_login_date
        , to_date(first_purchase_time) as first_purchase_date
  from {{
    source({
      'name': 'user_profile',
      'location': '{{datastore.location}}/user_profile',
    })
  }}
)

select  media_source, campaign_id, country_code, platform
      , coalesce(count(distinct(case when event_date = first_login_date then user_id end)), 0) as nru
      , coalesce(count(distinct(case when event_date = first_purchase_date then user_id end)), 0) as npu
      , coalesce(count(distinct(case when login_diff = 0 then user_id end)), 0) as dau
      , coalesce(count(distinct(case when login_diff < 30 then user_id end)), 0) as a30
      , coalesce(count(distinct(case when purchase_diff = 0 then user_id end)), 0) as pu
      , coalesce(count(distinct(case when purchase_diff < 30 then user_id end)), 0) as pu30
      , coalesce(count(distinct(case when login_month = event_month then user_id end)), 0) as mau
      , coalesce(count(distinct(case when purchase_month = event_month then user_id end)), 0) as mpu
      , product_id, event_date
from (
  select  product_id, user_id, event_date, login_diff, purchase_diff, login_month, purchase_month, event_month
        , media_source, campaign_id, country_code, platform, first_login_date, first_purchase_date
  from activity left join user_profile using(product_id, user_id)
)
group by product_id, event_date, media_source, campaign_id, country_code, platform