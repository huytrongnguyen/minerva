-- reset value to prevent issue double total value in case unique key is changed
update daily_activity_metrics set installs = 0
where event_date in (select distinct event_date from ztmp_daily_installs);
update monthly_activity_metrics set installs = 0
where event_month in (select distinct to_char(event_date, 'YYYY-MM') from ztmp_daily_installs);

-- update daily metrics
insert into daily_activity_metrics (
        product_id, event_date, media_source, campaign_id, country_code, platform
      , installs, created_at
)
select  product_id, event_date, media_source, campaign_id, country_code, platform
      , installs, now() as created_at
from ztmp_daily_installs
on conflict (product_id, event_date, media_source, campaign_id, country_code, platform) do update
set installs = excluded.installs, updated_at = now();

-- update monthly metrics
insert into monthly_activity_metrics (
        product_id, event_month, media_source, campaign_id, country_code, platform
      , installs, created_at
)
select  product_id, event_month, media_source, campaign_id, country_code, platform
      , sum(installs) as installs, now() as created_at
from (
    select  product_id, to_char(event_date, 'YYYY-MM') as event_month
          , media_source, campaign_id, platform, country_code
          , installs
    from daily_activity_metrics
    where to_char(event_date, 'YYYY-MM') = substring('{{event_date}}' from 1 for 7)
) as activity
group by product_id, event_month, media_source, campaign_id, country_code, platform
on conflict (product_id, event_month, media_source, campaign_id, country_code, platform) do update
set installs = excluded.installs, updated_at = now();