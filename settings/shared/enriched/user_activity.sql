{{
  create_or_replace_table({
    'partition_by': ['partition_date'],
    'location': '{{lakehouse.location}}/{{product_id}}/enriched/user/activity',
  })
}}

with in_app_events as (
  select *, '{{product_id}}' as product_id, customer_user_id as user_id, to_date('{{event_date}}') as partition_date
  from {{
    source({
      'name': 'in_app_events',
      'location': '{{lakehouse.location}}/{{product_id}}/raw/appsflyer/in_app_events_report/partition_date={{event_date}}',
    })
  }}
)
, complete_registration as (
  select  product_id, user_id, install_time, install_id
        , agency, media_source, campaign_id, country_code, platform, os_version, device_model
        , registration_time, partition_date
  from (
    select  product_id, user_id, cast(install_time as timestamp), appsflyer_id as install_id
          , af_prt as agency, media_source, af_c_id as campaign_id, upper(country_code) as country_code
          , lower(platform) as platform, os_version, device_model
          , cast(event_time as timestamp) as registration_time, partition_date
          , row_number() over (partition by product_id, user_id, partition_date order by event_time) as rn
    from in_app_events
    where (event_name = 'af_role_create' or event_name = 'af_first_role_create') and user_id is not null
  )
  where rn = 1
)
, login as (
  select  product_id, user_id, count(event_time) as session_count
        , min(cast(event_time as timestamp)) as first_login_time, max(cast(event_time as timestamp)) as last_login_time
        , partition_date
  from in_app_events
  where (event_name = 'af_login_success' or event_name = 'af_first_login_success') and user_id is not null
  group by product_id, user_id, partition_date
)
, level as (
  select  product_id, user_id, max(level) as level, partition_date
  from (
    select  product_id, partition_date, user_id, cast(regexp_replace(event_name, 'af_level_', '') as int) as level
    from in_app_events
    where event_name like 'af_level_%' and user_id is not null
  )
  group by product_id, user_id, partition_date
)

select  product_id, user_id, install_time, install_id, agency, media_source, campaign_id, country_code, platform, os_version, device_model
      , coalesce(registration_time, first_login_time) as registration_time, first_login_time, last_login_time, session_count, level, partition_date
from complete_registration
full join login using (product_id, user_id, partition_date)
full join level using (product_id, user_id, partition_date)