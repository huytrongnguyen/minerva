# HoYoverse (miHoYo) Gaming Data Strategy: Data-Informed Player Insights and Operational Excellence

HoYoverse (Genshin Impact, Honkai: Star Rail, Zenless Zone Zero: $5B+ Genshin lifetime revenue, 300M+ players) is **extremely secretive**—no public tech blogs like Supercell. Data drives **live ops mastery** (banners = $18-22M each, 6-8 events/mo) and **closed-beta retention testing**. Custom "big data platform" unifies telemetry for personalization/churn (privacy-gated). Scale: Millions DAU, petabyte infra via hybrid AWS/Alibaba Cloud.

HoYoverse (miHoYo's global brand) adopts a **data-informed approach** focused on enhancing player experiences, content tuning, monetization, and long-term engagement in live-service games like Genshin Impact, Honkai: Star Rail, and Zenless Zone Zero. Analytics support player behavior analysis, persona segmentation, churn prediction, and global strategy—prioritizing immersive worlds while using data for monitoring, modeling, and risk control (e.g., anti-bot, security). Emphasis on cross-functional collaboration between analysts, designers, and developers.

### Core Data Strategies and Use Cases

1. **Player Behavior & Retention Analysis**  
   Global data prediction, persona analysis, churn attribution; mathematical modeling for version/activity effectiveness.

2. **Content Tuning & Monetization**  
   Monitoring systems for anomalies; case analysis supporting design, balancing, and revenue strategies.

3. **A/B Testing & Experimentation**  
   End-to-end event tracking; tests for features (payment, UX); performance evaluation.

4. **Live Ops & Community Insights**  
   Daily data monitoring; player feedback integration; community opinion analysis.

5. **Risk & Security**  
   Data-driven solutions for account/payment security, anti-bot; malicious behavior analytics.

6. **Marketing & Globalization**  
   User journey analysis; targeted strategies informed by behavior data.

### Teams and Culture

- **Data Analytics Teams**: Roles in Singapore/Montreal/global for game-specific (e.g., Genshin, Honkai: Star Rail) and globalization analysts; fresh grads to seniors.
- **Data Engineering**: Building/optimizing big data infrastructure.
- **Data Science**: ML for risk models, mining.
Culture: Passion for games; strong communication with designers/developers; sensitivity to data anomalies; cross-functional (analysts embedded with product/ops). Hiring emphasizes SQL/Python, modeling, and game experience.

HoYoverse's strategies remain more private than Western peers, focusing on internal tools and Alibaba Cloud for scalable, stable support of blockbuster live-service titles.

## 1. Telemetry & Event Ingestion (Custom SDK + UID Backbone)

Privacy policy reveals **server-authoritative gameplay/crash telemetry** (UID hashed backbone). Client-side via Unity SDK (IL2CPP encrypted).

| Layer | Tech/Details | Scale |
|-------|--------------|-------|
| **Client/Gameplay** | Custom SDK (Unity-based, encrypted metadata) | Bugs/errors/crashes (stack trace, UID, login time, version, abnormal processes); gameplay for personalization (consent-gated). |
| **Server/Backend** | Custom big data pipelines | Diagnosis data, revenue/risk reconciliation (SDK platform jobs mention). |
| **ID Backbone** | UID (HoYoverse Account) | Cross-game (Genshin/HSR/ZZZ), hashed for privacy. Links betas → live. |

## 2. Architecture (Hybrid Cloud Big Data Platform + Alibaba/AWS)

"One-stop data solution": access → processing → viz → application. Cloud-native evolution for global servers.

```
Unity Clients → Custom SDK → Backend Servers (AWS Global Accel + 12+ DCs)
                     ↓
Big Data Platform (Alibaba Cloud-native: ingestion → lake → ML)
                     ↓
Processing: Custom pipelines (revenue/risk SDK)
                     ↓
ML/Analytics: Churn/recs/personalization (GDC scalable AI)
                     ↓
Activation: Live ops (banners/events), dashboards
Observability: Custom (global low-latency)
```

| Layer | Tech | Why HoYoverse Choice |
|-------|------|----------------------|
| **Ingestion** | Custom SDK + backend APIs | Global sim-launch (Genshin: simultaneous servers). Privacy: UID + consent. |
| **Storage** | Big data lake (Alibaba/S3 hybrid?) | Petabytes for 300M players. |
| **Processing** | Cloud-native pipelines | Revenue/risk mgmt, event tuning. |
| **ML/Serving** | Custom scalable AI (GDC) | Personalization, balancing (abyss/events). |
| **Governance** | Privacy-gated (consent for gameplay data) | No 3P, UID anonymized. |

## 3. Key Metrics & Golden Funnel

**Live Ops Focus**: Banners (6-8/mo, $18-22M each), events (Genshin 8/mo > HSR 6/mo). Closed betas test retention (D1 strong, D30 low ~4-15%).

- Retention: Betas (selection bias), D1 best-in-class (RPGs), D30 low (grind/stale endgame).
- Monet: Banner peaks cannibalize (HSR ate Genshin but no net gain).
- Funnel: Prereg → beta → launch (40M Genshin wk1 downloads). **Enjoyment**: Narrative/combat accessibility (auto-play, skippable).

## 4. Governance & Privacy (Strict Consent + Global Compliance)

- **PII**: UID, crashes only (no raw personal). Gameplay opt-in.
- **Council**: Implied (jobs: risk mgmt platform).
- **Ethics**: No beta monet tests (theory + prior data). AI investment heavy (layoffs elsewhere).

## 5. Roadmap (Cloud-Native Big Data Evolution)

From Alibaba blogs/GDC: Legacy → global cloud-native.

| Phase | Timeline (Inferred) | Milestone |
|-------|---------------------|-----------|
| **Launch** | 2020 (Genshin) | Custom backend for global sim-open. |
| **Scale** | 2021-23 | Alibaba cloud-native big data (processing/viz). |
| **Multi-Game** | 2023-25 (HSR/ZZZ) | UID cross-game, SDK revenue/risk. |
| **AI/Maturity** | 2025+ | Scalable AI (GDC), live ops optimization. |

**Org**: Big Data Platform Group (jobs). Embedded per-game + central infra.

## Artifacts Integrated

- **Privacy Policy**: Telemetry list.
- **Alibaba Blog**: Cloud-native practices diagram.
- **GDC Vault**: AI system slides (paywall, but title confirms scalable ML).
- **Naavik**: Live ops revenue data/charts.
- **Jobs**: "Big data platform" quotes.
