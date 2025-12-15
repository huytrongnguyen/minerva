# Executive Summary

**Real-Time LTV & Campaign Optimization Platform**  

Internal tool focuses on real-time LTV prediction and campaign optimization to drive player acquisition, retention, and monetization.

## The Opportunity

Our studio currently spends millions every year on user acquisition, yet we still make most campaign decisions on CPI and D7 ROAS alone — while the real money is made (or lost) on Day 30–180 LTV.  
Today we are flying half-blind:  
- We discover a cohort is unprofitable weeks or months too late  
- We cannot predict which players will become whales in the first hours  
- Marketing, LiveOps and Product teams work off different spreadsheets  

A single, real-time data platform solves all three problems at once and turns data into the studio’s biggest competitive advantage.

## The Solution

Build an internal **Real-Time Player Value Platform** on our existing open-source stack (MinIO + Delta Lake + Spark + Airflow + Postgres + Tableau + Kafka) that delivers:

1. Accurate Day-7 and Day-30 LTV predictions within hours of install (target ≥ 85 % accuracy)  
2. Fully automated campaign kill/scale/pause decisions based on predicted ROAS  
3. A single Tableau source-of-truth used daily by UA, LiveOps, Product and C-level  

## Expected Business Impact (Conservative 12-Month Projection)

| Metric                        | Current | With Platform | Delta          |
|-------------------------------|---------|---------------|----------------|
| Average ROAS (paid channels)  | 0.9×    | 1.4×–1.8×     | +55–100 %      |
| Yearly marketing waste saved  | –       | $1.2 M – $2.5 M|                |
| Incremental revenue from better cohorts | – | $3 M – $6 M+ |                |
| Payback period of entire program | –     | 4–6 months    |                |

Even a 30 % ROAS improvement pays for the entire platform multiple times over in Year 1.

## Program Snapshot
- Total duration: 12 months (Dec 2025 – Dec 2026)  
- MVP live: April 2026 (accurate pLTV + first dashboard)  
- Full closed-loop automation: October 2026  
- Team: 2–3 engineers + 1 data scientist + 0.5 analyst (mostly internal hires)  
- Total budget Year 1: ≈ $420 k (people + infra)  
- Tech stack: 100 % existing

## Business Case + ROI Model  

#### 1. Current Situation (2025 baseline – conservative real numbers you can replace with yours)

| Item                              | Annual Value (USD) |
|-----------------------------------|--------------------|
| Total paid UA spend               | $8,000,000         |
| Average blended ROAS today        | 0.90×              |
| Revenue from paid users           | $7,200,000         |
| Current marketing waste (underperforming cohorts) | ~$2,000,000+ per year |
| Time to detect a bad cohort       | 30–60 days         |
| Manual Excel / BI workhours       | ~2,500 hours/year  |

#### 2. What the Platform Delivers (proven industry benchmarks)

| Improvement Lever                     | Conservative | Realistic | Aggressive |
|---------------------------------------|--------------|-----------|------------|
| ROAS uplift from predictive kill/scale | +25 %        | +45 %     | +80 %      |
| Additional revenue from better cohorts| +$2.0 M      | $3.6 M    | $6.4 M     |
| Reduction of wasted spend             | –$1.0 M      | –$1.8 M   | –$3.2 M    |
| Net financial impact Year 1           | +$3.0 M      | +$5.4 M   | +$9.6 M    |

#### 3. Year-1 Investment (all-in)

| Item                                      | Cost (USD) |
|-------------------------------------------|------------|
| 2 × Data Engineer (internal or contractor)| $260 k     |
| 1 × Data Scientist (mid-senior)           | $130 k     |
| 0.5 × UA / Marketing Analyst              | $ 50 k     |
| Infra (Kafka + extra Spark capacity)      | $ 20 k     |
| Contingency & tools                       | $ 10 k     |
| **Total Year 1**                          | **$470 k** |

#### 4. ROI & Payback Calculation

| Scenario       | Net Gain Year 1 | Payback Period | 3-Year NPV (8 % discount) |
|----------------|-----------------|----------------|---------------------------|
| Conservative   | +$2.53 M        | 2.2 months     | +$14.1 M                  |
| Realistic      | +$4.93 M        | 1.1 months     | +$26.8 M                  |
| Aggressive     | +$9.13 M        | <1 month       | +$48.0 M                  |

#### 5. Non-Financial Benefits (impossible to buy on the market)

- Zero dependency on third-party black-box tools (Tenjin, AppsFlyer ROAS module, etc.)  
- Full ownership of models and data → sustainable competitive moat  
- Real-time decisions instead of weekly Excel → faster iteration cycles  
- Single source of truth → ends “whose numbers are right?” debates”
