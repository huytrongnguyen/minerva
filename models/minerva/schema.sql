drop table if exists product;
create table product (
  product_id text,
  product_name text,
  start_date date,
  primary key (product_id)
);