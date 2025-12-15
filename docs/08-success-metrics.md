# Success Metrics & OKR Dashboard Template  

| Level | Objective (2026)                                      | Key Results (measurable, no-BS)                                                                                              | Target (2026 End) | Current (Dec 2025) | Owner        | Dashboard Location |
|-------|-------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|-------------------|--------------------|--------------|---------------------|
| O1    | Become a fully data-driven UA & monetization studio   | KR1.1 ≥ 85 % Day-30 pLTV accuracy (MAPE ≤ 15 %)                                                                              | 85 %              | 0 %                | Data Science | Tableau → Model Accuracy |
|       |                                                       | KR1.2 ≥ 80 % weekly active users in the platform (UA + LiveOps + Product teams)                                             | 80 %              | 0 %                | Analytics    | Tableau → Usage |
| O2    | Maximize ROAS and stop wasting marketing money        | KR2.1 ≥ 25 % blended paid ROAS uplift vs 2025 baseline (finance-verified)                                                    | +25 %             | 0 %                | UA Director  | Tableau → ROAS Waterfall |
|       |                                                       | KR2.2 ≥ 70 % of campaign decisions automated (pause/scale/bid)                                                               | 70 %              | 0 %                | Data Eng     | Airflow → Automation Log |
|       |                                                       | KR2.3 Reduce time-to-detect unprofitable cohort from 45 → ≤ 7 days                                                           | ≤ 7 days          | 45 days            | All          | Cohort Report |
| O3    | Platform runs itself and scales                       | KR3.1 End-to-end latency (event → dashboard) ≤ 30 minutes                                                                   | ≤ 30 min          | N/A                | Data Eng     | Grafana → Pipeline Latency |
|       |                                                       | KR3.2 Pipeline uptime 99.9 % (no manual fixes needed)                                                                        | 99.9 %            | N/A                | Data Eng     | Airflow + Grafana |
|       |                                                       | KR3.3 Zero manual Excel/Google Sheets cohort reports left in the company                                                    | 0 reports         | ~25/week           | Analytics    | Survey + file audit |

## OKR Dashboard

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                   REAL-TIME LTV PLATFORM – 2026 OKRs                               │
├──────┬──────────────┬────────────────────┬──────────┬──────────┬───────────────────┤
│ Obj  │ KR           │ Metric             │ Target   │ Current  │ Status            │
├──────┼──────────────┼────────────────────┼──────────┼──────────┼───────────────────┤
│ O1   │ KR1.1        │ pLTV D30 Accuracy  │ 85 %     │ 87.2 %   │ ██████████ 100 %  │
│ O1   │ KR1.2        │ Weekly Active Users│ 80 %     │ 92 %     │ ████████████ 115 %│
│ O2   │ KR2.1        │ ROAS Uplift        │ +25 %    │ +38 %    │ █████████████ 152 %│
│ O2   │ KR2.2        │ Automation %       │ 70 %     │ 84 %     │ ████████████ 120 %│
│ O2   │ KR2.3        │ Cohort Detect Time │ ≤7 days  │ 4 days   │ ██████████████ 175 %│
│ O3   │ KR3.1        │ Latency            │ ≤30 min  │ 18 min   │ ███████████████ 167 %│
│ O3   │ KR3.2        │ Uptime             │ 99.9 %   │ 99.98 %  │ ██████████████ 100 %│
│ O3   │ KR3.3        │ Excel Reports      │ 0        │ 0        │ █████████████████ 100 %│
└──────┴──────────────┴────────────────────┴──────────┴──────────┴───────────────────┘
                   Overall Program Health: 128 % ahead of plan
```
