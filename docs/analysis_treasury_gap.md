
# 🧠 Treasury & Cash Management Level-15 Canonical Analysis — [UPDATE 2026-01-15-19:55]

## 1. Delta Changes & Latest Findings (Treasury Deep-Dive)

I have performed a forensic audit of `TreasuryService.ts`, `BankingTreasury.tsx`, and the `shared/schema/cash.ts` to assess Tier-1 parity for Corporate Treasury.

| Standard Level | Status | Implementation Detail | Reference |
| :--- | :--- | :--- | :--- |
| **Dimension 10 - Risk** | ❌ Missing | **Hedge Accounting** and **FX Deal Tracking** (Forwards/Swaps) are absent. | N/A |
| **Dimension 13 - Audit** | 🔒 Lock | **SoD (Trader vs Back Office)** is not enforced for treasury instruments. | N/A |
| **Dimension 17 - UX** | ⚠️ Partial | `BankingTreasury.tsx` is a generic list; lacks **Deal Workbench**. | `BankingTreasury.tsx` |
| **Dimension 9 - AI** | ❌ Missing | **Liquidity Anomaly Detection** is a UI placeholder; no backend logic. | `CashManagementPage.tsx` |

## 2. Updated Feature Parity Heatmap (Consolidated Treasury & CM)

| Feature Area | Oracle Fusion Parity (Baseline) | Current Implementation | Status | Gap |
| :--- | :--- | :--- | :--- | :--- |
| **Debt Management** | Amortized Cost, Fixed/Float, P&I Calc | None | ❌ Missing | **Critical** |
| **Investments** | Mark-to-Market, Maturity Tracking | None | ❌ Missing | **Critical** |
| **FX Hedging** | Forward Contracts, Swap Linkage | Revaluation only; no deals | ⚠️ Partial | **High** |
| **In-house Banking** | Intercompany Netting & Settlements | ZBA Sweeps (Physical movement) | ⚠️ Partial | Medium |
| **Risk Analytics** | Duration, Convexity, Sensitivity | Metrics cards (Placeholder) | ❌ Missing | High |
| **Payment Hub** | ISO 20022, SWIFT gpi, SAN Integration | ISO 20022 XML (pain.001) | ✅ Ready | Low |

---


## 3. Level-15 Canonical Decomposition: Dimension 1 (Form / UI Level)

- **Status**: **Partial**
- **Oracle Fusion Reference**: Treasury Management Dashboard / Bank Account Workbench
- **Decomposition**:
    - **Level 1 — Module Domain**: Treasury & Cash Management
    - **Level 2 — Sub-Domain**: Bank Account Management
    - **Level 3 — Functional Capability**: Internal Bank Account Lifecycle
    - **Level 4 — Business Use Case**: View/Edit accounts, confirm signatories
    - **Level 5 — User Personas**: Treasury Manager, Finance Controller
    - **Level 6 — UI Surfaces**: `CashManagementPage.tsx`, `BankingPage.tsx` (Basic)
    - **Level 7 — UI Components**: `BankAccountList.tsx`, `BankAccountSideSheet.tsx`
    - **Level 8 — Configuration / Setup**: `cash_bank_accounts` schema fields
    - **Level 9 — Master Data**: `cash_banks`, `cash_bank_branches`
    - **Level 10 — Transactional Objects**: Bank Balances (Current/Historical)
    - **Level 11 — Workflow & Controls**: Maker-Checker via `approveBankAccount`
    - **Level 12 — Accounting Rules**: GL Mapping for Cash vs Clearing accounts
    - **Level 13 — AI Automation**: LLM-assisted account categorization (Planned)
    - **Level 14 — Security & Audit**: RBAC on Account IDs; Data Access Sets
    - **Level 15 — Scalability**: Server-side pagination in `ReconciliationWorkbench`

## 4. Level-15 Canonical Decomposition: Dimension 9 (Liquidity & Forecasting Intelligence)

- **Status**: **Partial**
- **Oracle Fusion Reference**: Cash Position Workbench / Cash Forecast Models
- **Decomposition**:
    - **Level 1 — Module Domain**: Treasury Intelligence
    - **Level 2 — Sub-Domain**: Liquidity Forecasting
    - **Level 3 — Functional Capability**: Scenario-based cash flow projections
    - **Level 4 — Business Use Case**: Net daily funding requirement analysis
    - **Level 5 — User Personas**: Treasurer, CFO
    - **Level 6 — UI Surfaces**: `CashManagementPage.tsx` (Dashboard Tab)
    - **Level 7 — UI Components**: `CashForecastChart.tsx`, `CashForecastWidget.tsx`
    - **Level 8 — Configuration / Setup**: Scenario multipliers in `CashForecastService`
    - **Level 9 — Master Data**: `cash_forecasts` (Manual Adjustments)
    - **Level 10 — Transactional Objects**: AP/AR due lines, manual adjustments
    - **Level 11 — Workflow & Controls**: Forecast locking/snapshots (Missing)
    - **Level 12 — Accounting Rules**: Valuation of future flows at current rates
    - **Level 13 — AI Automation**: Trend-based extrapolation (Placeholder in UI)
    - **Level 14 — Security & Audit**: Restricted forecast visibility by entity
    - **Level 15 — Performance**: On-the-fly aggregation; needs materialized caching for high volume

## 🧱 Dimension 10: Debt & Investment Lifecycle (TIER-1 CORE)
- **Status**: **Missing**
- **Oracle Fusion Reference**: Manage Debt / Manage Investments (Treasury Instruments)
- **Level-15 Decomposition**:
    - **Level 1 — Module Domain**: Corporate Treasury (Financing & Investing)
    - **Level 2 — Sub-Domain**: Treasury Instruments
    - **Level 3 — Functional Capability**: P&I (Principal & Interest) tracking, Amortization
    - **Level 4 — Business Use Case**: Managing a $5M Revolving Credit Line or Bond Portfolio
    - **Level 5 — User Personas**: Treasurer, Finance Controller
    - **Level 6 — UI Surfaces**: **MISSING** (Deal Workbench)
    - **Level 7 — UI Components**: Deal capture sheets, Amortization grids
    - **Level 8 — Configuration / Setup**: Interest type rules (Day count conventions, 30/360, etc.)
    - **Level 9 — Master Data**: Counterparties, Brokers, Issuers
    - **Level 10 — Transactional Objects**: `treasury_deals` (Debt/Inv), `treasury_installments`
    - **Level 11 — Workflow & Controls**: Dual-deal confirmation (Trader vs Settlements)
    - **Level 12 — Accounting Rules**: Amortized Cost vs Fair Value logic; SLA Posting
    - **Level 13 — AI Automation**: Automated maturity alerts; Optimistic investment suggestions
    - **Level 14 — Security & Audit**: Deal-level audit trail (Field audit: who changed the rate?)
    - **Level 15 — Performance & Ops**: Valuation engine for 10k+ active instruments

## 🧱 Dimension 11: FX Exposure, Hedging & Revaluation
- **Status**: **Partial**
- **Oracle Fusion Reference**: Manage FX Deals / Manage Hedge Relationships
- **Level-15 Decomposition**:
    - **Level 1 — Module Domain**: Risk Management
    - **Level 2 — Sub-Domain**: Foreign Exchange (FX)
    - **Level 3 — Functional Capability**: Hedging of balance sheet exposure
    - **Level 4 — Business Use Case**: Locking a rate for a $2M EUR payment due in 90 days
    - **Level 5 — User Personas**: Risk Manager
    - **Level 6 — UI Surfaces**: **MISSING** (FX Deal Workbench)
    - **Level 7 — UI Components**: Forward Rate Calculator, Hedge Linkage Side-panel
    - **Level 8 — Configuration / Setup**: Hedge accounting policies
    - **Level 9 — Master Data**: Forward Rates, Basis Point Spreads
    - **Level 10 — Transactional Objects**: `fx_deals` (Forwards, Swaps)
    - **Level 11 — Workflow & Controls**: Limit monitoring (Counterparty Exposure Limits)
    - **Level 12 — Accounting Rules**: Hedge effectiveness testing (Placeholder or logic)
    - **Level 13 — AI Automation**: Forecasted exposure detection & hedge recommendation
    - **Level 14 — Security & Audit**: Deal confirmation logs; Compliance reporting (IFRS 9 / FASB)
    - **Level 15 — Performance & Ops**: Real-time MtM (Mark-to-Market) valuation runs

## 🧱 Dimension 12: In-house Banking & Intercompany Netting
- **Status**: **Partial**
- **Oracle Fusion Reference**: Intercompany Netting & Settlement
- **Level-15 Decomposition**:
    - **Level 1 — Module Domain**: Internal Liquidity
    - **Level 2 — Sub-Domain**: In-house Banking
    - **Level 3 — Functional Capability**: Multilateral Netting (Settling AR/AP via Internal Ledger)
    - **Level 4 — Business Use Case**: Reducing cross-border wire fees by netting entity balances
    - **Level 5 — User Personas**: Treasury Operations Manager
    - **Level 6 — UI Surfaces**: Netting Workbench
    - **Level 7 — UI Components**: Netting Batch Grid, Hierarchy View
    - **Level 8 — Configuration / Setup**: Netting cycles, Participant agreements
    - **Level 9 — Master Data**: Intercompany Bank Accounts (Internal only)
    - **Level 10 — Transactional Objects**: `netting_batches`, `netting_lines`
    - **Level 11 — Workflow & Controls**: Disputed netting line management
    - **Level 12 — Accounting Rules**: Internal AP/AR settlement vs Intercompany Clearing
    - **Level 13 — AI Automation**: Automatic netting candidate detection
    - **Level 14 — Security & Audit**: Legal Entity isolation; Tax compliance trails
    - **Level 15 — Performance & Ops**: High-volume batch processing for global netting runs

## 6. Business Impact & Adoption Risk
1.  **Risk Management Failure**: Without a Debt/Investment module, users are forced to track financial instruments in legacy spreadsheets, leading to valuation errors and missing interest accruals.
2.  **Compliance Violation**: Missing Back-Office vs Front-Office segregation for Treasury deals is a major SOX compliance risk.
3.  **Liquidity Risk**: Forecasting currently ignores Debt Maturity dates—critical for managing large payout clusters.

## 🚀 Phased Remediation Plan (Build-Ready)

### Phase 1: Core Treasury Instruments (Debt & Investments)
- [ ] **Infrastructure**: Create `treasury_deals` schema supporting Debt, Investments, and FX Contracts.
- [ ] **Master Data**: Implement Counterparty registry (Bank vs Multi-lateral).
- [ ] **UI**: Build the `TreasuryWorkbench` for instrument entry and lifecycle tracking.
- [ ] **Logic**: Implement Interest Accrual engine for Fixed/Floating rates.

### Phase 2: FX Risk & Hedging Excellence
- [ ] **Deals**: Implement FX Forward & Swap contract tracking.
- [ ] **Accounting**: Auto-link FX Deals to Revaluation Gains/Losses for Hedge Accounting.
- [ ] **Valuation**: Build Mark-to-Market (MtM) engine for basic instruments.

### Phase 3: AI-Assisted Liquidity & Anomaly Detection
- [ ] **Real AI**: Implement "Anomaly Detection" for payments (finding outliers in history).
- [ ] **Predictive**: Integrate historical variance into forecasting logic (Actual vs Forecast feed).
- [ ] **Navigation**: Consolidate `BankingTreasury.tsx` and `BankingPayments.tsx` into a high-utility `TreasuryCommandCenter`.

---
**EXPLICIT STOP: DO NOT PROCEED TO BUILD UNTIL APPROVED.**
