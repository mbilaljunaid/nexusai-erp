# Analysis: Supplier Portal & Procurement Contracts Gap (Oracle Fusion Parity)

## Executive Summary: Tier-1 Readiness Audit
This document tracks the forensic analysis and remediation roadmap for the **Supplier Portal (iSupplier)** and **Procurement Contracts** modules. The objective is 100% parity with Oracle Fusion Cloud standards, achieving a Level-15 canonical state for all supplier collaboration and contract lifecycle dimensions.

**Tier-1 Readiness Status: 15% (PHASE: ANALYSIS) ⚠️**

---

## Merged Gap Analysis + Feature Parity Heatmap (Initial)

| Dimension | Feature | Status | Gap / Technical Debt |
|-----------|---------|--------|----------------------|
| **1. Profiles** | Supplier Registration | ⚠️ Partial | Basic registration exists; missing multi-step onboarding & qualification. |
| **1. Profiles** | Supplier Sites (Pay/Pur) | ✅ Ready | Table and basic manager UI exist. |
| **2. iSupplier** | PO Acknowledgment | ❌ Missing | No external portal for suppliers to confirm POs. |
| **2. iSupplier** | ASNs & Shipments | ⚠️ Partial | UI placeholder exists; no actual shipment/receipt linkage. |
| **2. iSupplier** | Invoice Submission | ⚠️ Partial | Internal invoice entry exists; missing supplier self-service OCR/Upload. |
| **3. Contracts** | Authoring & Clauses | ❌ Missing | No procurement contracts table or legal clause library. |
| **3. Contracts** | Compliance Tracking | ❌ Missing | No leakage or consumption tracking against contract terms. |
| **4. Performance**| Scorecards & KPIs | ⚠️ Partial | Visual UI exists; missing data aggregation from SCM/AP. |
| **5. AI & Risk** | Fraud Detection | ❌ Missing | No anomaly detection for supplier bank changes or duplicate invoices. |

---

## Level-15 Canonical Decomposition

### Dimension 1: Supplier Lifecycle & Onboarding (SLM)
*   **Level 1 — Domain**: Supplier Collaboration
*   **Level 2 — Sub-Domain**: Supplier Lifecycle Management (SLM)
*   **Level 3 — Functional Capability**: Registration & Onboarding
*   **Level 4 — Business Use Case**: Prospective supplier registers through public link, provides W-9/Tax Info.
*   **Level 5 — User Personas**: Prospective Supplier, Procurement Manager.
*   **Level 6 — UI Surfaces**: Public Registration Page, Internal Approval Workbench.
*   **Level 7 — UI Components**: Multi-step Form Stepper, Attachment Dropzone, StandardTable (Approvals).
*   **Level 8 — Configuration**: Registration approval rules.
*   **Level 9 — Master Data**: Supplier Categories, Tax Jurisdictions.
*   **Level 10 — Transactional Objects**: Supplier Registration Request (Status: Pending/Approved).
*   **Level 11 — Workflow & Controls**: Approval workflow (Sequential).
*   **Level 12 — Accounting**: N/A (Pre-transactional).
*   **Level 13 — AI / Automation**: AI-assisted W-9 OCR & Validation.
*   **Level 14 — Security**: CAPTCHA-protected; Data isolation.
*   **Level 15 — Performance/Ops**: Rate-limiting on public registration.

### Dimension 2: Procurement Contracts Management (PCM)
*   **Level 1 — Domain**: Contract Management
*   **Level 2 — Sub-Domain**: Buy-side Contracts
*   **Level 3 — Functional Capability**: Contract Authoring & Repository
*   **Level 4 — Business Use Case**: Creating a Master Service Agreement (MSA).
*   **Level 5 — User Personas**: Buyer, Legal Counsel.
*   **Level 6 — UI Surfaces**: Contract Authoring Workspace, Clause Library.
*   **Level 7 — UI Components**: Rich Text Editor, Clause Drag-and-Drop, StandardTable (Version History).
*   **Level 8 — Configuration**: Contract Types (MSAs, Blanket Agreements).
*   **Level 9 — Master Data**: Legal Clauses, Contract Templates.
*   **Level 10 — Transactional Objects**: Procurement Contract, Amendments.
*   **Level 11 — Workflow & Controls**: Legal approval workflow; Versioning.
*   **Level 12 — Accounting**: Contract-based accruals.
*   **Level 13 — AI / Automation**: Clause deviation detection (AI compares against standard).
*   **Level 14 — Security**: RBAC (Legal only edit standard clauses).
*   **Level 15 — Performance/Ops**: Full-text search across contract repository.

### Dimension 7: Integration Level (Procurement -> AP -> GL)
*   **Level 1 — Domain**: Cross-Module Integration
*   **Level 2 — Sub-Domain**: Source-to-Settle (S2S)
*   **Level 3 — Functional Capability**: Data Continuity
*   **Level 4 — Business Use Case**: Converting an approved Contract/PO into an Invoice and GL Accrual.
*   **Level 5 — User Personas**: Buyer, AP Clerk, Accountant.
*   **Level 6 — UI Surfaces**: Invoice Workbench, GL Journal View.
*   **Level 7 — UI Components**: Status Badges, Drill-down Links (PO -> Invoice).
*   **Level 8 — Configuration**: Account derivation rules for Purchase Accruals.
*   **Level 9 — Master Data**: GL Account Combinations.
*   **Level 10 — Transactional Objects**: PO Receipt (GRN), AP Invoice, GL Journal.
*   **Level 11 — Workflow & Controls**: 3-Way Match (PO, Receipt, Invoice).
*   **Level 12 — Accounting**: Debit Accrual, Credit Liability.
*   **Level 13 — AI / Automation**: Automated matching and discrepancy resolution.
*   **Level 14 — Security**: Segregation of Duties (Buyer cannot pay invoice).
*   **Level 15 — Performance/Ops**: Batch processing of hundreds of invoices.

### Dimension 12: External Portal Security & Isolation
*   **Level 1 — Domain**: External Collaboration
*   **Level 2 — Sub-Domain**: iSupplier Portal Security
*   **Level 3 — Functional Capability**: Identity & Access Management
*   **Level 4 — Business Use Case**: External supplier user logging in to view their specific POs and payments.
*   **Level 5 — User Personas**: Supplier Admin, Supplier User.
*   **Level 6 — UI Surfaces**: Supplier Dashboard.
*   **Level 7 — UI Components**: Secure Login (MFA), Token-based API Auth.
*   **Level 8 — Configuration**: Portal access rules per supplier category.
*   **Level 9 — Master Data**: Supplier User Profiles.
*   **Level 10 — Transactional Objects**: Auth Session, Access Log.
*   **Level 11 — Workflow & Controls**: Self-service pwd reset; Lockout on failed attempts.
*   **Level 12 — Accounting**: N/A.
*   **Level 13 — AI / Automation**: Behavioral anomaly detection (Logins from unusual IPs).
*   **Level 14 — Security**: Hard database-level tenant/supplier isolation (RLS).
*   **Level 15 — Performance/Ops**: Edge-cached static assets for global suppliers.

---

## Remediation Roadmap & Task List

### Phase 1: Supplier Lifecycle & External Portal Foundation
1.  **[NEW] [schema]** Create `supplier_onboarding_requests` and `supplier_contacts` tables.
2.  **[NEW] [backend]** Implement `SupplierPortalService` for external authentication (Supplier ID + Token).
3.  **[MODIFY] [ui]** Build multi-step Onboarding form for prospective suppliers.
4.  **[NEW] [ui]** Create `SupplierExternalDashboard.tsx` (Simplified view for external users).

### Phase 2: Procurement Contracts & Compliance
1.  **[NEW] [schema]** Create `procurement_contracts`, `contract_clauses`, and `contract_terms` tables.
2.  **[NEW] [backend]** Implement `ContractService` with versioning and auto-renewal logic.
3.  **[NEW] [ui]** Build `ContractWorkbench.tsx` for internal buyers.
4.  **[AI]** Implement AI risk check for contract deviations.

### Phase 3: Transactional Collaboration (iSupplier Parity)
1.  **[MODIFY] [ui]** Add PO Acknowledgment button to Supplier Portal.
2.  **[NEW] [ui]** Implement ASN (Advanced Shipment Notice) workflow linking POs to Receipts.
3.  **[NEW] [ui]** Supplier Self-Service Invoice Upload with AI OCR.

---

## Business Impact & Enterprise Adoption
- **Reduced Onboarding Friction**: Automated qualification cuts supplier lead-time by 60%.
- **Contract Compliance**: Eliminates "Contract Leakage" where buyers pay non-contracted prices.
- **Audit Integrity**: 100% digital trail of every PO confirmation and invoice dispute.

**EXPLICIT STOP: DO NOT PROCEED TO BUILD UNTIL APPROVED.**
