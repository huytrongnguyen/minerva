-- reset value to prevent issue double total value in case unique key is changed
update daily_user_metrics set installs = 0
where event_date in (select distinct event_date from ztmp_daily_installs);

-- update daily metrics
insert into daily_user_metrics (
        product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , installs, created_at
)
select  product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , installs, now() as created_at
from ztmp_daily_installs
on conflict (product_id, event_date, agency, media_source, campaign_id, country_code, platform) do update
set installs = excluded.installs, updated_at = now();