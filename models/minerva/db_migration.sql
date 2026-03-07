-- migration: remove dataset_name from product_datatable and product_datacolumn

alter table product_datatable drop column dataset_name;
drop index if exists product_datatable_uniq_idx;
create unique index product_datatable_uniq_idx on product_datatable(product_id, table_name);

alter table product_datacolumn drop column dataset_name;
drop index if exists product_datacolumn_uniq_idx;
create unique index product_datacolumn_uniq_idx on product_datacolumn(product_id, table_name, column_name);
