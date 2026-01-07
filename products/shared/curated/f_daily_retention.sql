-- reset value to prevent issue double total value in case unique key is changed
update daily_activity_metrics
set r01 = 0, r02 = 0, r03 = 0, r04 = 0, r05 = 0, r06 = 0, r07 = 0
where event_date in (select distinct event_date from ztmp_daily_retention);

-- update daily metrics
insert into daily_activity_metrics (
        product_id, event_date, media_source, campaign_id, country_code, platform
      , installs, created_at
)
select  product_id, event_date, media_source, campaign_id, country_code, platform
      , installs, now() as created_at
from ztmp_daily_retention
on conflict (product_id, event_date, media_source, campaign_id, country_code, platform) do update
set r01 = excluded.r01, r02 = excluded.r02, r03 = excluded.r03, r04 = excluded.r04
  , r05 = excluded.r05, r06 = excluded.r06, r07 = excluded.r07, updated_at = now();
