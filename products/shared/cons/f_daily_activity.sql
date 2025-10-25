-- reset value to prevent issue double total value in case unique key is changed
update daily_activity_metrics
set nru = 0, npu = 0, dau = 0, pu = 0, a30 = 0, pu30 = 0, mau = 0, mpu = 0
where event_date in (select distinct event_date from ztmp_daily_activity);
update monthly_activity_metrics set nru = 0
where event_month in (select distinct to_char(event_date, 'YYYY-MM') from ztmp_daily_activity);

-- update daily metrics
insert into daily_activity_metrics (
        product_id, event_date, media_source, campaign_id, country_code, platform
      , installs, created_at
)
select  product_id, event_date, media_source, campaign_id, country_code, platform
      , installs, now() as created_at
from ztmp_daily_activity
on conflict (product_id, event_date, media_source, campaign_id, country_code, platform) do update
set nru = excluded.nru, npu = excluded.npu, dau = excluded.dau, pu = excluded.pu
  , a30 = excluded.a30, pu30 = excluded.pu30, mau = excluded.mau, mpu = excluded.mpu, updated_at = now();

-- update monthly metrics
insert into monthly_activity_metrics (
        product_id, event_month, media_source, campaign_id, country_code, platform
      , nru, npu, created_at
)
select  product_id, event_month, media_source, campaign_id, country_code, platform
      , sum(nru) as nru, sum(npu) as npu, now() as created_at
from (
    select  product_id, to_char(event_date, 'YYYY-MM') as event_month
          , media_source, campaign_id, platform, country_code
          , nru, npu
    from daily_activity_metrics
    where to_char(event_date, 'YYYY-MM') = substring('{{event_date}}' from 1 for 7)
) as activity
group by product_id, event_month, media_source, campaign_id, country_code, platform
on conflict (product_id, event_month, media_source, campaign_id, country_code, platform) do update
set nru = excluded.nru, npu = excluded.npu, updated_at = now();