# Minerva

An in-house metrics platform that offers, among other things, a centralised and participative source of truth for analytics, reporting and experimentation across the company.

Marketing might calculate it one way, the product team another, leading to a battle of conflicting dashboards and eroding trust in the data itself. This is precisely the chaos that a centralised metrics platform like Mercury was designed to tame.

By creating a single, governed source of truth for business logic, a metrics store ensures that when anyone asks a question about the data, they get one consistent, reliable answer.

## Minerva Logic

The abstractions of metrics from the end user seems to be achieved through two **layers of definitions** (config files) that, starting from origin data, are used to build a **unified metric layer** by providing instructions on how to query the underlying data.

## Data Production

From an infrastructure perspective, Minerva is built on top of open-source projects. It uses Airflow for workflow orchestration, Apache Spark as the compute engine, and Postgres for consumption. From metric creation through computation, serving, consumption, and eventually deprecation, Minerva covers the full life cycle of a metric.

- **Metrics Definition**: Minerva defines key business metrics, dimensions, and other metadata in a centralized Github repository that can be viewed and updated by anyone at the company.
- **Validated Workflow**: The Minerva development flow enforces best data engineering practices such as code review, static validation, and test runs.
- **DAG Orchestration**: Minerva performs data denormalization efficiently by maximizing data reuse and intermediate joined results.
- **Computation Runtime**: Minerva has a sophisticated computation flow that can automatically self-heal after job failures and has built-in checks to ensure data quality.
- **Metrics / Metadata Serving**: Minerva provides a unified data API to serve both aggregated and raw metrics on demand.
- **Flexible Backfills**: Minerva version controls data definitions, so major changes to the datasets are automatically tracked and backfilled.
- **Data Management**: Minerva has built-in capabilities such as cost attribution, GDPR selective deletion, data access control, and an auto-deprecation policy.
- **Data Retention**: Minerva establishes usage-based retention and garbage collection, so expensive but infrequently utilized datasets are removed.

## Data Consumption

Minerva’s product vision is to allow users to “define metrics once, use them everywhere”. That is, a metric created in Minerva should be easily accessed in company dashboarding tools, tracked in our A/B testing framework, or processed by our anomaly detection algorithms to spot business anomalies, just to name a few.

## Design Principles

- **Standardized**: Data is defined unambiguously in a single place. Anyone can look up definitions without confusion.
- **Declarative**: Users define the “what” and not the “how”. The processes by which the metrics are calculated, stored, or served are entirely abstracted away from end users.
- **Scalable**: Minerva must be both computationally and operationally scalable.
- **Consistent**: Data is always consistent. If definition or business logic is changed, backfills occur automatically and data remains up-to-date.
- **Highly available**: Existing datasets are replaced by new datasets with zero downtime and minimal interruption to data consumption.
- **Well tested**: Users can prototype and validate their changes extensively well before they are merged into production.

## A Metric-Centric Approach

When data consumers use data to frame a business question, they typically think in terms of metrics and dimensions. For example, a business leader may wonder what percentage of bookings (a metric) is made up of long-term stays (a dimension). To answer this question, she needs to find the right set of tables from which to query (where), apply the necessary joins or filters (how), and then finally aggregate the events (how) to arrive at an answer that is, hopefully, correct.

While many traditional BI tools attempt to abstract this work on behalf of their users, most of their data-serving logic still relies heavily on the users to figure out the “where” and the “how”. We aspired to build a better user experience — one in which users simply ask for metrics and dimension cuts, and receive the answers without having to worry about the “where” or the “how”. This vision, what we call a “metric-centric approach”, turned out to be a difficult engineering challenge.