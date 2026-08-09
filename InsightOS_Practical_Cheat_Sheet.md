# InsightOS — Practical Hackathon Presentation & Q&A Cheat Sheet

---

## 1. PROJECT OVERVIEW

- **What is InsightOS?** An AI-powered Business Intelligence platform designed for small and medium retail businesses in India (clothing stores, pharmacies, restaurants, grocery shops).
- **What problem does it solve?** Retailers lose money silently due to out-of-stock products, expired inventory, low profit margins, and underperforming stores. They have CSV sales data but lack the tools or technical skills to analyze it.
- **Who is it for?** Indian SMB retail owners and multi-store managers who don't have dedicated data analysts or expensive BI software.
- **How does it solve the problem?** Users upload their existing POS and inventory CSV files. InsightOS normalizes the data, runs 12 quantitative business rules to flag exact financial losses in rupees (₹), and uses IBM Granite AI to provide natural-language answers and action plans.
- **What makes it different?** Runs 100% in the browser with zero backend or database setup, combines deterministic math with IBM Granite AI reasoning, features a smart expiry discounting engine, and requires zero technical configuration.

### 30-Second Elevator Pitch
"Small retailers in India lose lakhs every year to stockouts, expired inventory, and low margins because they can't analyze their raw CSV data. **InsightOS** is a zero-backend BI platform where business owners simply upload their POS CSV files to instantly discover what's wrong, how much money they're losing, and get step-by-step action plans. Powered by **IBM Granite AI**, it provides data-grounded answers to natural-language business questions — running free, private, and 100% inside the browser."

---

## 2. KEY FEATURES

1. **Fuzzy CSV Data Ingestion** — Normalizes messy CSV headers from any POS system automatically (e.g., "MRP" or "Sales Amt" → "revenue"). *Why it matters:* Business owners can upload files directly without manually reformatting columns.
2. **5-KPI Executive Dashboard** — Displays gross revenue, net profit, units sold, stockout count, and expiry risk count at a glance. *Why it matters:* Gives owners instant financial visibility across all outlets.
3. **Automated Problem Detection Engine** — Scans transactions using 12 business rules to detect stockouts, low margins (<15%), and underperforming stores (<70% of chain average). *Why it matters:* Proactively surfaces hidden losses without requiring pivot tables.
4. **Smart Expiry Risk & Dynamic Discounting** — Calculates days to expiry and recommends clearance discounts (40% flash discount for ≤15 days; 20% bundle discount for 16–45 days) with capital recovery estimates. *Why it matters:* Directly reduces inventory waste and recovers capital before products spoil.
5. **ABC Product Classification** — Groups products into Class A (top 80% revenue), Class B (next 15%), and Class C (bottom 5%) based on the Pareto Principle. *Why it matters:* Helps owners focus inventory capital on top-performing hero items.
6. **Geospatial Store Heatmap** — Displays store performance on an interactive map with revenue scaling and risk color-coding (healthy/warning/critical). *Why it matters:* Identifies geographic patterns in store performance instantly.
7. **IBM Granite AI Copilot** — Chat interface that injects live store analytics into IBM Granite prompts for contextual business advice. *Why it matters:* Enables non-technical users to ask plain-English strategy questions and receive data-grounded answers.

---

## 3. TECHNOLOGY STACK

| Technology | Used For | Why We Chose It | Alternative Considered |
| ---------- | -------- | --------------- | ---------------------- |
| **React 19** | Frontend UI Framework | Declarative component architecture; ideal for multi-tab dashboards. | Vue.js (smaller ecosystem for map/chart integration) |
| **TypeScript** | Type Safety | Enforces strict data contracts for complex financial & analytics interfaces. | Plain JavaScript (high risk of runtime type errors) |
| **Vite** | Build Tool & Dev Server | Sub-second HMR and built-in API proxying to bypass browser CORS for local AI. | Webpack (slower build times and complex config) |
| **TailwindCSS** | UI Styling | Rapid utility-first styling for dark theme and glassmorphism cards. | Vanilla CSS (slower development iteration) |
| **Recharts** | Data Visualizations | Declarative React charting library that renders directly from data arrays. | D3.js (overkill and requires low-level SVG manipulation) |
| **React-Leaflet** | Store Heatmap | Open-source map library requiring zero API keys or usage billing. | Google Maps (requires credit card & API key setup) |
| **PapaParse** | CSV Parsing | Handles client-side CSV parsing, malformed lines, and quoted text cleanly. | SheetJS (heavier library than needed for plain CSVs) |
| **IBM Granite** | AI Copilot (LLM) | Enterprise-focused LLM; runs locally via Ollama or via watsonx cloud API. | OpenAI GPT-4 (expensive API fees and data privacy risks) |

---

## 4. IBM TECHNOLOGY

- **Which IBM Technology?** IBM Granite LLM (`granite3-dense:8b` locally via Ollama / `ibm/granite-13b-chat-v2` via IBM watsonx.ai cloud API).
- **What it does:** Powers the AI Copilot chat interface, answering natural-language executive questions like "Which store should I expand?" or "Why are my profit margins low?".
- **Why we chose it:** IBM Granite is engineered for enterprise factual accuracy, reducing hallucination risk. Running `granite3-dense:8b` locally via Ollama allows 100% free, private execution on consumer hardware.
- **How it connects:** 
  1. The user asks a question in `AIChat.tsx`.
  2. `aiService.ts` constructs a prompt containing the user's query **plus live business metrics** (total chain revenue, margin %, stockout counts, per-store performance JSON).
  3. The request is sent to local Ollama via Vite proxy (`/ollama/api/generate`). If Ollama is offline, it falls back to the IBM watsonx cloud API using IAM token authentication.
- **Handling incorrect AI output:** All critical financial metrics, stockout alerts, and expiry warnings are calculated by our **deterministic rules engine**, NOT the AI. The AI is restricted to the chat tab and is grounded with live data to prevent hallucinations.

---

## 5. ARCHITECTURE

### Actual System Flow:
**User → React 19 Frontend → PapaParse / CSV Normalizer → Deterministic Rules Engine (dataAnalysis.ts) → Recharts / Leaflet UI & IBM Granite AI Copilot**

- **Frontend (React 19 + Vite):** Single Page Application rendering the 5 dashboard views.
- **CSV Normalizer (`csvNormalizer.ts`):** Cleans header strings and maps arbitrary CSV columns to canonical fields.
- **Rules Engine (`dataAnalysis.ts`):** Calculates store margins, growth rates, ABC classes, and expiry risk alerts in client-side JavaScript.
- **AI Layer (`aiService.ts`):** Contextual prompt builder that communicates with local Ollama or IBM watsonx cloud API.
- **Database:** *None.* All state lives in browser memory for zero server cost and total data privacy.

---

## 6. AI PIPELINE

### Important Flow:
**CSV File Upload → Header Normalization → Deterministic Rules Analysis → Context-Injected Prompt → IBM Granite LLM → Natural Language Insights**

- **How AI Contributes:** The deterministic rules engine finds *what* happened (e.g., "Bengaluru store margin is 12%"). The IBM Granite AI Copilot explains *why* and advises *what to do* in plain English based on the full business context.
- **Why Do We Need AI?** Business owners don't want to spend time reading multiple charts or deciphering metrics. AI allows non-technical users to ask natural-language questions and receive tailored strategic recommendations instantly.

---

## 7. COMPETITORS

| Competitor | InsightOS Advantage |
| ---------- | ------------------- |
| **Excel / Google Sheets** | InsightOS automatically surfaces hidden problems and calculates rupee losses; Excel requires manual pivot tables and formulas. |
| **Power BI / Tableau** | InsightOS is zero-cost, zero-setup, pre-built for retail, and requires no data analyst or DAX knowledge. |
| **Existing POS Systems** | POS systems only record raw transactions; InsightOS sits downstream to provide predictive intelligence and expiry discounting. |
| **Generic AI (ChatGPT)** | ChatGPT lacks business data and visuals; InsightOS grounds IBM Granite with live CSV analytics, charts, and maps. |

---

## 8. TOP JUDGE QUESTIONS

1. **Q: What problem are you solving?**  
   *Short Answer:* Indian SMB retailers lose lakhs annually from stockouts, expired stock, and unmonitored low margins because raw CSV data is too hard to analyze manually.
2. **Q: How does InsightOS solve this?**  
   *Short Answer:* Users upload POS CSVs, our engine automatically detects operational risks, calculates exact rupee losses, and IBM Granite AI gives plain-English action steps.
3. **Q: What is the core innovation?**  
   *Short Answer:* Combining deterministic mathematical rule alerts with IBM Granite AI strategic reasoning in a zero-backend, 100% client-side architecture.
4. **Q: How does the CSV normalizer work?**  
   *Short Answer:* It cleans column header strings (lowercases, strips symbols) and matches them against predefined alias arrays (e.g., "MRP" → "revenue").
5. **Q: How do you calculate expiry risk?**  
   *Short Answer:* It checks days to expiry against reference dates: ≤15 days triggers a 40% flash clearance recommendation; 16–45 days triggers a 20% bundle recommendation.
6. **Q: Which IBM technology is used?**  
   *Short Answer:* IBM Granite LLM — `granite3-dense:8b` locally via Ollama, falling back to `ibm/granite-13b-chat-v2` on IBM watsonx cloud API.
7. **Q: How do you prevent AI hallucinations?**  
   *Short Answer:* All dashboard numbers and alerts are calculated by strict JavaScript math. The AI only operates in the Q&A chat and is injected with live data.
8. **Q: Why is there no backend or database?**  
   *Short Answer:* It's a deliberate design choice: zero server hosting costs, instant client-side execution, and total data privacy since CSV data stays in the browser.
9. **Q: How do you protect user data privacy?**  
   *Short Answer:* Data lives only in browser React state. With local Ollama, even AI processing is done 100% offline on the user's machine.
10. **Q: What is ABC Classification?**  
    *Short Answer:* A supply-chain method sorting products by revenue: Class A (top 80% revenue), Class B (next 15%), and Class C (bottom 5%).
11. **Q: How is store risk status determined?**  
    *Short Answer:* Flagged as 'critical' if profit margin is below 15% or growth rate is below -10%; 'warning' if margin is below 22%.
12. **Q: Why use Leaflet instead of Google Maps?**  
    *Short Answer:* Leaflet is open-source, lightweight, and works client-side without API keys or usage billing.
13. **Q: What is your business model?**  
    *Short Answer:* Freemium SaaS: single-store basic dashboard is free; multi-store analytics and AI Copilot subscription at ₹999–2,999/month.
14. **Q: How fast is the analytics engine?**  
    *Short Answer:* Sub-millisecond for typical datasets; handles up to 100,000 rows in under a second using React `useMemo` hooks.
15. **Q: What makes this suitable for India?**  
    *Short Answer:* Pre-configured with Indian Rupee (₹) formatting (Lakhs/Crores), Indian city maps, and support for common Indian POS export formats.

---

## 9. HARD QUESTIONS

1. **⚠️ Why not just use Excel?**  
   *Short Answer:* Excel shows data, but requires manual pivot tables and formulas. InsightOS automatically surfaces problems, calculates rupee losses, and suggests clearance discounts without any manual effort.
2. **⚠️ Why not Power BI?**  
   *Short Answer:* Power BI costs ₹15,000+/month, requires Azure infrastructure, and needs a trained data analyst. InsightOS is free, zero-setup, and built specifically for non-technical retail owners.
3. **⚠️ Why IBM Granite instead of GPT-4?**  
   *Short Answer:* Granite is enterprise-focused for factual accuracy, runs locally for free via Ollama (zero API cost), keeps business data private, and aligns with IBM ecosystem requirements.
4. **⚠️ What if the AI gives an incorrect result?**  
   *Short Answer:* Dashboard numbers and alert calculations come from pure JavaScript math, not AI. The AI is limited to strategic chat advice, where it is grounded with real computed data.
5. **⚠️ Isn't this just an AI wrapper?**  
   *Short Answer:* No. If you remove the AI completely, 80% of the platform (KPI cards, automated rule alerts, ABC analysis, heatmaps, charts) still functions perfectly.

---

## 10. LIMITATIONS & FUTURE ROADMAP

### 3 Current Limitations:
1. **No Data Persistence:** Data lives in React state and resets to sample data when the browser is refreshed.
2. **Single-User / No Authentication:** Lacks user accounts and multi-tenant access control in the current prototype.
3. **AI Latency on CPU:** Running local 8B Granite on CPU without GPU acceleration takes 15–30 seconds per response.

### 3 Future Improvements:
1. **Database & Auth Integration:** Add PostgreSQL + OAuth2 (IBM App ID) for persistent multi-store accounts.
2. **Direct POS API Integrations:** Connect via webhooks to POS systems (Petpooja, Marg ERP) for real-time streaming data instead of manual CSV uploads.
3. **Predictive Demand Forecasting:** Implement time-series ML models for automated inventory reorder forecasting.

---

## 11. 8-SLIDE PRESENTATION STRUCTURE

- **Slide 1: Title & Elevator Pitch**
  - InsightOS: AI-Powered BI for Indian Retail
  - Zero-backend, zero-cost intelligence
  - Converts raw POS CSVs into actionable rupee insights
- **Slide 2: The Problem**
  - ₹92,000 crore annual food/inventory waste in India
  - Small retailers suffer silent losses from stockouts & low margins
  - Excel and POS tools generate data but no actionable intelligence
- **Slide 3: The Solution**
  - Upload CSV → Instant automated business analysis
  - 12 retail business rules surface exact rupee losses
  - Smart Expiry Engine recommends 40%/20% clearance discounts
- **Slide 4: Key Features**
  - 5-KPI Executive Dashboard + Multi-Store Risk Matrix
  - ABC Product Classification (80/20 Rule)
  - Interactive Recharts & Geospatial Leaflet Store Heatmap
- **Slide 5: Technology Stack**
  - React 19 + TypeScript + Vite (Client-side architecture)
  - Recharts + React-Leaflet + PapaParse
  - Local-first execution with zero infrastructure costs
- **Slide 6: AI & IBM Granite Integration**
  - IBM Granite LLM (`granite3-dense:8b` local / `13b-chat-v2` cloud)
  - Contextual prompt injection with live computed store metrics
  - Data-grounded executive Q&A with zero database dependencies
- **Slide 7: Business Impact & Competitor Advantage**
  - Recovered capital from near-expiry inventory clearance
  - Zero cost & zero technical skill vs. Power BI (₹15K/mo)
  - Freemium SaaS business model (₹999–2,999/month)
- **Slide 8: Roadmap & Conclusion**
  - Phase 1: Browser Prototype (Today) → Phase 2: DB + Auth → Phase 3: POS APIs
  - InsightOS turns idle retail data into actionable business profit

---

## 12. QUICK REVISION BEFORE PRESENTATION

- **Project in 1 sentence:** InsightOS is a zero-backend BI platform that turns raw retail CSV data into actionable business alerts and IBM Granite AI insights.
- **Problem:** Indian SMB retailers lose lakhs to stockouts, expired inventory, and low margins because they can't analyze CSV data.
- **Solution:** Upload CSV → automated 12-rule problem detection + expiry clearance discounts + IBM Granite AI Copilot.
- **Key Features:** 5-KPI Dashboard, Expiry Risk Discounting (40%/20%), ABC Classification, Recharts, Leaflet Store Heatmap, IBM Granite AI Chat.
- **Tech Stack:** React 19, TypeScript, Vite, TailwindCSS, Recharts, React-Leaflet, PapaParse, IBM Granite.
- **IBM Tech:** IBM Granite LLM (`granite3-dense:8b` via Ollama / `13b-chat-v2` via watsonx cloud API).
- **Architecture:** User → React 19 SPA → Fuzzy CSV Normalizer → JavaScript Rules Engine → Recharts/Leaflet UI & IBM Granite AI.
- **AI Role:** Explains *why* problems happen and gives plain-English strategic advice using live store metrics injected into prompts.
- **Main Innovation:** Combining deterministic rule-based math with IBM Granite AI in a client-side, zero-backend platform.
- **Main Advantage:** Free, private, zero-setup, pre-built for retail vs expensive Power BI or manual Excel.
- **Main Limitation:** No backend database (data resets on refresh).
- **Future Improvement:** Add PostgreSQL database, user authentication, and direct POS API webhooks.
- **Top 5 Q&A:**
  1. *Why not Excel?* InsightOS automates problem detection and calculates rupee losses automatically; Excel requires manual work.
  2. *Why not Power BI?* InsightOS is free, zero-setup, and requires no data analyst or DAX knowledge.
  3. *Why IBM Granite?* Enterprise factual accuracy, runs locally for free via Ollama, keeps data private.
  4. *What if AI hallucinates?* Dashboard metrics come from JavaScript math, not AI. AI chat is grounded with live computed data.
  5. *Is it an AI wrapper?* No. 80% of the platform (KPIs, alerts, maps, charts) works even if AI is disconnected.
