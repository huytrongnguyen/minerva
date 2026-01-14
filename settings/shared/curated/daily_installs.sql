{{
  insert_into({
    'type': 'jdbc',
    'postprocess': 'shared/curated/f_daily_installs.sql',
    'location': '{{targets.reporting.location}}/{{product_id}}.json',
  })
}}
with installs_report as (
  select  '{{product_id}}' as product_id
        , to_date('{{event_date}}') as event_date
        , coalesce(af_prt, 'na') as agency
        , coalesce(media_source, 'na') as media_source
        , coalesce(af_c_id, 'na') as campaign_id
        , coalesce(upper(country_code), 'na') as country_code
        , coalesce(lower(platform), 'na') as platform
        , appsflyer_id
        , to_date('{{install_time}}') as install_date
  from {{
    source({
      'type': 'csv',
      'option': { 'header': 'true' },
      'name': 'installs_report',
      'location': '{{targets.warehouse.location}}/{{product_id}}/appsflyer/installs_report/app_id={{vars.app_ids}}/event_date={{event_date}}',
    })
  }}
)

select  product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , coalesce(count(distinct(install_id)), 0) as installs
from installs_report
where datediff(event_date,install_date) = 0
group by product_id, event_date, agency, media_source, campaign_id, country_code, platform
