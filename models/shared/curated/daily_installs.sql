{{
  create_or_replace_table({
    'type': 'jdbc',
    'name': 'ztmp_daily_installs',
    'location': '{{model_paths}}/{{product_id}}/curated_cred.json',
    'postprocess': '{{model_paths}}/shared/curated/f_daily_installs.sql',
  })
}}

with install as (
  select  '{{product_id}}' as product_id
        , to_date('{{event_date}}') as event_date
        , coalesce(af_prt, 'na') as agency
        , coalesce(media_source, 'na') as media_source
        , coalesce(substring(sha(af_c_id), 0, 12), 'na') as campaign_id
        , coalesce(upper(country_code), 'na') as country_code
        , coalesce(lower(platform), 'na') as platform
        , appsflyer_id
        , to_date(install_time) as install_date
  from {{
    source({
      'name': 'appsflyer_installs',
      'location': '{{lakehouse.location}}/{{product_id}}/raw/appsflyer/installs_report/partition_date={{event_date}}',
    })
  }}
)

select  product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , coalesce(count(distinct(appsflyer_id)), 0) as installs
from install
where datediff(event_date,install_date) = 0
group by product_id, event_date, agency, media_source, campaign_id, country_code, platform
