create table product_info (
  product_id text not null,
  product_name text,
  data_owner text,
  start_date date,
  data_producer text,
  sql_dialect text,
  endpoint text,
  client_id text,
  client_secret text,
  created_at timestamp default now(),
  updated_at timestamp,
  primary key (product_id)
);

create table product_dataset (
  id bigint not null default unique_rowid(),
  product_id text not null,
  dataset_name text not null,
  created_at timestamp default now(),
  updated_at timestamp,
  primary key (id)
);
create unique index product_dataset_uniq_idx on product_dataset(product_id, dataset_name);


create table product_datatable (
  id bigint not null default unique_rowid(),
  product_id text not null,
  table_name text not null,
  table_display_name text,
  table_semantic_name text,
  table_desc text,
  created_at timestamp default now(),
  updated_at timestamp,
  primary key (id)
);
create unique index product_datatable_uniq_idx on product_datatable(product_id, table_name);

create table product_datacolumn (
  id bigint not null default unique_rowid(),
  product_id text not null,
  table_name text not null,
  column_name text not null,
  column_display_name text,
  column_semantic_name text,
  column_type text,
  column_desc text,
  created_at timestamp default now(),
  updated_at timestamp,
  primary key (id)
);
create unique index product_datacolumn_uniq_idx on product_datacolumn(product_id, table_name, column_name);

create table product_dashboard (
  dashboard_id bigint not null default unique_rowid(),
  product_id text not null,
  dashboard_name text not null,
  is_folder bool default false,
  dashboard_order int default 1,
  reports jsonb,
  parent_id bigint,
  created_at timestamp default now(),
  created_by text default 'root',
  updated_at timestamp,
  updated_by text,
  primary key (dashboard_id)
);
create index product_dashboard_product_id_idx on product_dashboard(product_id);
