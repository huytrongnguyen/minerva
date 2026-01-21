-- reset value to prevent issue double total value in case unique key is changed
update daily_user_metrics
set ruser01 = 0, ruser07 = 0, ruser30 = 0
where event_date in (select distinct event_date from ztmp_daily_retention);

-- update daily metrics
insert into daily_user_metrics (
        product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , ruser01, ruser07, ruser30, created_at
)
select  product_id, event_date, agency, media_source, campaign_id, country_code, platform
      , ruser01, ruser07, ruser30, now() as created_at
from ztmp_daily_retention
on conflict (product_id, event_date, agency, media_source, campaign_id, country_code, platform) do update
set ruser01 = excluded.ruser01, ruser07 = excluded.ruser07, ruser30 = excluded.ruser30, updated_at = now();