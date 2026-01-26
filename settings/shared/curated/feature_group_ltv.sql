{{
  create_or_replace_table({
    'location': '{{lakehouse.location}}/{{product_id}}/curated/feature_group_ltv',
  })
}}

with user_activity as (
  select  product_id, user_id, to_date(first_login_time) as event_date, session_count, level
  from {{
    source({
      'name': 'user_activity',
      'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/activity/partition_date={{date_range(31,1)}}',
    })
  }}
)
, user_purchase as (
  select  product_id, user_id, to_date(first_purchase_time) as event_date, total_amount
  from {{
    source({
      'name': 'uers_purchase',
      'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/purchase/partition_date={{date_range(31,1)}}',
    })
  }}
)
, daily_snapshot as (
  select  product_id, user_id, event_date, session_count, level, total_amount
  from user_activity a full join user_purchase p using (product_id, user_id, event_date)
)
, daily_snapshot_with_user_profile as (
  select  product_id, user_id, to_date(install_time) as install_date
        , agency, media_source, campaign_id, country_code, platform
        , datediff(event_date, install_time) as day_since_install
        , (unix_timestamp(first_purchase_time) - unix_timestamp(install_time)) / 3600 as hours_to_first_purchase -- Time to first purchase (in hours)
        , daily_snapshot.session_count, daily_snapshot.level, daily_snapshot.total_amount
  from {{
    source({
      'name': 'user_profile',
      'location': '{{lakehouse.location}}/{{product_id}}/curated/user_profile',
    })
  }}
  left join daily_snapshot using (product_id, user_id)
  where install_time is not null and first_purchase_time is not null and datediff(event_date, install_time) <= 30
)
, user_base as (
  -- Get unique players who have at least some data in the last 30+ days
  select distinct user_id from daily_snapshot_with_user_profile where day_since_install >= 30
)
, user_features as (
  -- Aggregate features per player (only from D0 to D30)
  select  product_id, user_id, install_date, agency, media_source, campaign_id, country_code, platform
        , hours_to_first_purchase
        -- Retention flags (binary)
        , max(case when day_since_install = 1 then 1 else 0 end) as retention_d01
        , max(case when day_since_install = 3 then 1 else 0 end) as retention_d03
        , max(case when day_since_install = 7 then 1 else 0 end) as retention_d07
        , max(case when day_since_install = 14 then 1 else 0 end) as retention_d14
        -- Session & progression metrics (D1-D7 window)
        , sum(case when day_since_install <= 7 then session_count end) as d1_d7_sessions
        , avg(case when day_since_install <= 7 then session_count end) as avg_d1_d7_sessions_per_day
        , max(case when day_since_install <= 7 then level else 0 end) as max_level_d7
        -- Monetization features
        , sum(case when day_since_install <= 7 then total_amount end) as total_amount_7d
        , sum(case when day_since_install <= 30 then total_amount end) as total_amount_30d -- This is the TARGET for LTV modeling!
        , max(case when day_since_install <= 30 then total_amount end) as max_amount_30d
        , count(case when total_amount > 0 then 1 end) as num_of_purchase_days_30d
        , to_date('{{event_date}}') as partition_date
  from user_base left join daily_snapshot_with_user_profile using (user_id)
  where day_since_install >= 1
  group by product_id, user_id, install_date, agency, media_source, campaign_id, country_code, platform, hours_to_first_purchase
)

select * from user_features
where total_amount_30d is not null -- Ensure we have target