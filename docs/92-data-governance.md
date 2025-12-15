# Data Governance Charter  

### Our 10 Non-Negotiable Governance Principles

| # | Rule | What It Means in Practice | Violation = |
|---|------|----------------------------|------------|
| 1 | **Players own their data** | We are only the custodian. Full transparency page in-game + website | Immediate escalation to CEO |
| 2 | **Zero raw PII ever lands** | Email, payment info, exact location, real name → hashed or encrypted at ingestion (Kafka anonymizer) | Pipeline auto-shutdown |
| 3 | **EternalPlayerID is sacred** | One-way SHA-256 + yearly salt rotation. Once live, never changed | Fireable offense |
| 4 | **Minors are untouchable** | Age <16 (or local law) → auto-flagged → zero behavioral targeting, zero spend prediction, hard caps | Daily monitored, monthly ethics review |
| 5 | **Personalization is opt-in only** | “Use my playstyle to make the game better for me” toggle. Off by default for new players | Feature kill switch |
| 6 | **Right to be forgotten = <72 h full deletion** | Kafka → Snowflake → Redis → backups → proof-of-deletion PDF generated automatically | Legal SLA |
| 7 | **Whale protection is mandatory** | >$1,000 in 24 h or >$5,000 lifetime → human review + optional cool-down | Trust & Safety owns |
| 8 | **All AI decisions are explainable & overrideable** | Churn model, spend prediction, toxicity ban → model card + “why me?” button in-game | ML governance veto |
| 9 | **Schema changes need Council sign-off** | No new telemetry field without documented purpose + privacy impact assessment | Pipeline blocked |
| 10 | **We publish everything** | Annual transparency report + public “What data we collect and why” page (like Riot/Epic) | Comms owns |

### Governance Council (the group that can say NO)

| Permanent Members | Role |
|-------------------|------|
| Data Protection Officer (chair) | Final veto |
| General Counsel | Legal sign-off |
| Head of Security | Breach response |
| Head of Live Ops | Player impact |
| Head of Monetization | Revenue guardrails |
| Me (Data Strategist) | Execution |
| Rotating Game Director | Creativity voice |

### Data Classification & Access Matrix (what every role can actually see)

| Data Type | Example | Designer | Analyst | Monetization | ML Team | External Vendor |
|-----------|---------|----------|---------|--------------|---------|-----------------|
| Tier 1 PII | Raw email, payment | Never | Never | Never | Never | Never |
| Tier 2 Sensitive | Exact spend, device ID, chat text | Aggregated only | Hashed + approval | Buckets only | Pseudonymized | Never |
| Tier 3 Gameplay | Kills, playtime, progression | Full access | Full | Full | Full | Aggregated only |
