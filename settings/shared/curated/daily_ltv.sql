{{
  create_or_replace_table({
    'type': 'jdbc',
    'name': 'ztmp_daily_ltv',
    'location': '{{settings_dir}}/{{product_id}}/curated_cred.json',
    'postprocess': '{{settings_dir}}/shared/curated/f_daily_ltv.sql',
  })
}}

with users_purchase as (
  select  product_id, user_id, to_date(first_purchase_time) as purchase_date, total_amount
  from {{
    source({
      'name': 'users_purchase',
      'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/purchase/partition_date={{date_range(33,1)}}',
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
  where datediff('{{event_date}}', registration_time) between 0 and 30
)

select  product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , coalesce(sum(distinct(case when nru_datediff <= 1 then total_amount end)), 0) as rev_nru01
      , coalesce(sum(distinct(case when nru_datediff <= 7 then total_amount end)), 0) as rev_nru07
      , coalesce(sum(distinct(case when nru_datediff <= 30 then total_amount end)), 0) as rev_nru30
from (select  product_id, event_date, agency, media_source, campaign_id, country_code, platform
            , datediff(purchase_date, event_date) as nru_datediff, total_amount
      from user_profile left join users_purchase using(product_id, user_id))
group by product_id, event_date, agency, media_source, campaign_id, country_code, platform
