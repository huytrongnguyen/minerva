# Product Vision & SMART Goals  

## Product Vision (North Star)

> “We empower every decision-maker in the studio — from UA to LiveOps to C-level — with real-time, accurate player lifetime value predictions and automated campaign actions, so we acquire only profitable players, maximize ROAS, and grow revenue predictably and sustainably.”

To empower our game studio with a unified, real-time data intelligence platform that predicts player lifetime value with high accuracy and automates campaign optimization, enabling data-driven decisions that maximize ROAS, boost player retention, and accelerate sustainable growth across all titles.

### Product Strategy

- **Target Users** → Internal: UA/marketing teams (campaign optimizers), product/LiveOps (retention/monetization), data analysts/engineers, and leadership (for oversight).
- **Value Proposition** → Provide actionable, real-time insights that turn raw data into profitable decisions—predicting high-value players early, automating optimizations to reduce manual work, and delivering measurable ROI uplifts (e.g., 20-50% ROAS improvement, as seen in studios using Tenjin or Pecan).
- **Differentiation** → Custom-built for your studio's games/genres (unlike off-the-shelf like GameAnalytics), with seamless integration into existing workflows and advanced real-time ML (vs. batch processing in many tools).
- **Go-to-Market (Internal)** → Phase 1: Pilot on 1-2 games with champions from each team. Phase 2: Full rollout with training and feedback loops. Measure success via adoption metrics and business impact.
- **Risks & Mitigations** → Data quality/sparsity → Start with hybrid models. Team resistance → Involve stakeholders early and showcase quick wins. Tech debt → Use modular architecture (e.g., serverless + open-source ML).
- **Success Metrics** → Primary: ROAS uplift, revenue from optimized campaigns. Secondary: Platform usage, prediction accuracy, time saved on manual analysis.

#### SMART Goals

1. **Launch MVP**: Develop and deploy a minimum viable platform with core real-time LTV prediction (using Day 1-7 data) and basic campaign ROAS dashboards, integrated with existing telemetry and one major ad network (e.g., Meta or Google), by Q4 2026.
2. **Accuracy Target**: Achieve 85%+ accuracy in predictive LTV (pLTV) forecasts at Day 30 (measured against actuals), validated on at least two live games, by end of Q2 2027.
3. **Adoption Goal**: Secure 80% adoption across key teams (UA/marketing, product, LiveOps) with at least 50 active users logging in weekly, measured via platform analytics, within 6 months of launch.
4. **Business Impact**: Deliver a 20% improvement in ROAS for optimized campaigns (compared to baseline) through automated bidding/recommendations, generating at least $500K in incremental revenue uplift across piloted titles by end of 2027.
5. **Scalability**: Process 1M+ daily events in real-time with <5-second latency for predictions, supporting up to 5 concurrent games, by mid-2027.


| # | SMART Goal (Specific – Measurable – Achievable – Relevant – Time-bound)                                                                                                   | Target Date | Owner            | Success Looks Like |
|---|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|------------------|--------------------|
| 1 | Deploy the platform MVP with ≥ 85 % accurate Day-30 pLTV predictions (MAPE ≤ 15 %) for all new installs across all live games                                       | 30 Apr 2026 | Data Science     | Model validation report signed off; dashboard shows predictions |
| 2 | Achieve ≥ 80 % weekly active users in Tableau among UA, LiveOps and Product teams (minimum 50 distinct logins/week)                                          | 31 May 2026 | Product / Analyst| Tableau server logs + adoption survey |
| 3 | Deliver ≥ 25 % blended ROAS uplift versus 2025 baseline on all managed paid channels through predictive kill/scale automation                                          | 31 Dec 2026 | UA Manager       | Finance-verified revenue & spend numbers |
| 4 | Automate ≥ 70 % of daily/weekly campaign decisions (pause, scale, bid change) that today are done manually in spreadsheets or ad UIs                               | 31 Oct 2026 | Data Engineering | Audit log of API calls vs manual actions |
| 5 | Reduce average time-to-detect an unprofitable cohort from 45 days → ≤ 7 days                                                                                      | 30 Jun 2026 | All              | Weekly cohort report history |
| 6 | Process 100 % of game events in near-real-time (end-to-end latency ≤ 30 minutes) with 99.9 % uptime                                                                | 31 Oct 2026 | Data Engineering | Monitoring dashboard (Airflow + Grafana) |
