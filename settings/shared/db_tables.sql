create table daily_user_metrics (
  id bigint not null default unique_rowid(),
  product_id text not null,
  event_date date not null,
  agency text not null,
  media_source text not null,
  campaign_id text not null,
  country_code text not null,
  platform text not null,

  installs bigint default 0,

  nru bigint default 0,
  npu bigint default 0,
  dau bigint default 0,
  pu bigint default 0,
  mau bigint default 0,
  mpu bigint default 0,

  ruser01 bigint default 0,
  ruser07 bigint default 0,
  ruser30 bigint default 0,

  rev double precision default 0,
  rev_npu double precision default 0,
  rev_nru00 bigint default 0,
  rev_nru01 bigint default 0,
  rev_nru07 bigint default 0,
  rev_nru30 bigint default 0,

  created_at timestamp,
  updated_at timestamp,
  primary key (event_date, id)
) partition by range (event_date) (
  partition daily_user_metrics_2024 values from ('2024-01-01') to ('2025-01-01')
);
create unique index daily_user_metrics_uniq_idx on daily_user_metrics(product_id, event_date, agency, media_source, campaign_id, country_code, platform);
create index daily_user_metrics_event_date_index on daily_user_metrics(event_date);