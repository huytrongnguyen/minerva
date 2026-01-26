{{
  create_or_replace_table({
    'type': 'jdbc',
    'name': 'ztmp_daily_activity',
    'location': '{{settings_dir}}/{{product_id}}/curated_cred.json',
    'postprocess': '{{settings_dir}}/shared/curated/f_daily_activity.sql',
  })
}}

with user_activity as (
  select  product_id, user_id, to_date(first_login_time) as login_date
  from {{
    source({
      'name': 'user_activity',
      'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/activity/partition_date={{event_date}}',
    })
  }}
)
, user_purchase as (
  select  product_id, user_id, to_date(first_purchase_time) as purchase_date, total_amount
  from {{
    source({
      'name': 'user_purchase',
      'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/purchase/partition_date={{event_date}}',
    })
  }}
)
, user_daily_snapshot as (
  select  product_id, user_id, to_date('{{event_date}}') as event_date
        , login_date, purchase_date, total_amount
  from user_activity full join user_purchase using (product_id, user_id)
)
, user_profile as (
  select  product_id, user_id
        , coalesce(agency, 'na') as agency
        , coalesce(media_source, 'na') as media_source
        , coalesce(campaign_id, 'na') as campaign_id
        , coalesce(country_code, 'na') as country_code
        , coalesce(platform, 'na') as platform
        , to_date(registration_time) as register_date, to_date(first_purchase_time) as first_purchase_date
  from {{
    source({
      'name': 'user_profile',
      'location': '{{lakehouse.location}}/{{product_id}}/curated/user_profile',
    })
  }}
)

select  product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , coalesce(count(distinct(case when event_date = register_date then user_id end)), 0) as nru
      , coalesce(count(distinct(case when event_date = first_purchase_date then user_id end)), 0) as npu
      , coalesce(count(distinct(case when event_date = login_date then user_id end)), 0) as dau
      , coalesce(count(distinct(case when event_date = purchase_date then user_id end)), 0) as pu
      , coalesce(sum(total_amount), 0) as rev
      , coalesce(sum(case when event_date = first_purchase_date then total_amount end), 0) as rev_npu
      , coalesce(sum(case when register_date = first_purchase_date then total_amount end), 0) as rev_nru00
from (select  product_id, user_id, agency, media_source, campaign_id, country_code, platform
            , register_date, first_purchase_date
            , event_date, login_date, purchase_date, total_amount
      from user_daily_snapshot left join user_profile using(product_id, user_id))
group by product_id, event_date, agency, media_source, campaign_id, country_code, platform