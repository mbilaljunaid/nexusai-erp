# Analysis: Supplier Portal & Procurement Contracts Gap (Oracle Fusion Parity)

## Executive Summary: Tier-1 Readiness Audit
This document tracks the forensic analysis and remediation roadmap for the **Supplier Portal (iSupplier)** and **Procurement Contracts** modules. The objective is 100% parity with Oracle Fusion Cloud standards, achieving a Level-15 canonical state for all supplier collaboration and contract lifecycle dimensions.

**Tier-1 Readiness Status: 35% (PHASE: GAP REMEDIATION) ⚠️**
*   **Strengths**: Robust Backend Schemas (SCM/Contracts), AI-assisted Contract Analysis, Internal Onboarding Workflow.
*   **Critical Gaps**: **NO External Supplier Portal** (Simulated only), No iSupplier Self-Service (ASN, PO Ack), No Supplier Invoice Upload.
*   **Confusion Accounted**: `client/src/pages/portal` is for **AR Customers**, not **AP Suppliers**.

---

## Merged Gap Analysis + Feature Parity Heatmap (Updated: 2026-01-16)

| Dimension | Feature | Status | Gap / Technical Debt |
|-----------|---------|--------|----------------------|
| **1. Profiles** | Supplier Registration | ✅ Ready | `ExternalSupplierRegistration.tsx` + `SupplierPortalService` exist. |
| **1. Profiles** | Onboarding Workflow | ✅ Ready | Internal `SupplierOnboardingWorkbench` handles approvals. |
| **2. iSupplier** | **External Login** | ❌ Missing | No `SupplierPortalAuth`, no external dashboard routes. |
| **2. iSupplier** | PO Acknowledgment | ❌ Missing | No external UI for suppliers to acknowledge POs. |
| **2. iSupplier** | ASNs & Shipments | ❌ Missing | No ASN schema or UI. |
| **2. iSupplier** | Invoice Submission | ❌ Missing | No self-service invoice connection to AP. |
| **3. Contracts** | **Schema & Service** | ✅ Ready | `procurementContracts` table and `ContractService` exist. |
| **3. Contracts** | Contract Authoring | ✅ Ready | Internal `ContractWorkbench` exists. |
| **3. Contracts** | AI Compliance | ✅ Ready | `analyzeContractCompliance` (OpenAI) is implemented. |
| **3. Contracts** | Consumption Tracking | ⚠️ Partial | `validatePOCompliance` exists but needs UI integration. |
| **4. Performance**| Scorecards & KPIs | ⚠️ Partial | `SupplierPerformance` page exists; needs real data hookup. |

---

## Level-15 Canonical Decomposition

### Dimension 1: Supplier Lifecycle & Onboarding (SLM)
*   **Level 1 — Domain**: Supplier Collaboration
*   **Level 2 — Sub-Domain**: Supplier Lifecycle Management (SLM)
*   **Level 3 — Functional Capability**: Registration & Onboarding
*   **Level 4 — Business Use Case**: Prospective supplier registers through public link (`/supplier-register`).
*   **Level 5 — User Personas**: Prospective Supplier, Procurement Manager.
*   **Level 6 — UI Surfaces**: `ExternalSupplierRegistration.tsx` (Public), `SupplierOnboardingWorkbench.tsx` (Internal).
*   **Level 7 — UI Components**: Multi-step Form Stepper, Bank Details Form, Audit Log Grid.
*   **Level 8 — Configuration**: Registration approval rules (Hardcoded in service currently).
*   **Level 9 — Master Data**: `supplier_onboarding_requests`, `suppliers`, `supplier_sites`.
*   **Level 10 — Transactional Objects**: Onboarding Request (Pending -> Approved -> Rejected).
*   **Level 11 — Workflow & Controls**: Manual Approval via RBAC (`scm_write`).
*   **Level 12 — Accounting**: N/A (Pre-transactional).
*   **Level 13 — AI / Automation**: Basic validation; potential for AI Tax ID verification.
*   **Level 14 — Security**: Public endpoint (rate-limited), Internal View (RBAC enforced).
*   **Level 15 — Performance/Ops**: Single transaction per request; low load.

### Dimension 2: Procurement Contracts Management (PCM)
*   **Level 1 — Domain**: Contract Management
*   **Level 2 — Sub-Domain**: Buy-side Contracts
*   **Level 3 — Functional Capability**: Contract Authoring & Repository
*   **Level 4 — Business Use Case**: Creating a Master Service Agreement (MSA) with clauses.
*   **Level 5 — User Personas**: Buyer, Legal Counsel.
*   **Level 6 — UI Surfaces**: `ContractWorkbench.tsx` (Internal), `RevenueContractWorkbench.tsx` (Sales).
*   **Level 7 — UI Components**: Clause Library Picker, Rich Text Editor (missing), Diff View (AI).
*   **Level 8 — Configuration**: Contract Types (Standard/MSA).
*   **Level 9 — Master Data**: `contract_clauses` (Library), `contract_terms` (Instance).
*   **Level 10 — Transactional Objects**: `procurement_contracts` (Header), `contract_terms` (Lines).
*   **Level 11 — Workflow & Controls**: Amendment Versioning (Partial support in Service).
*   **Level 12 — Accounting**: Committed Spend Tracking (via PO link).
*   **Level 13 — AI / Automation**: `analyzeContractCompliance` using GPT-4 for clause deviation.
*   **Level 14 — Security**: RBAC (`scm_read`/`scm_write`).
*   **Level 15 — Performance/Ops**: SQL-based search; Full-text search needed for clauses.

### Dimension 3: iSupplier Portal (External Collaboration)
*   **Level 1 — Domain**: External Collaboration
*   **Level 2 — Sub-Domain**: iSupplier Portal
*   **Level 3 — Functional Capability**: Self-Service Transactions
*   **Level 4 — Business Use Case**: Supplier logs in to view Open POs, submit Invoice, create ASN.
*   **Level 5 — User Personas**: Supplier User, Supplier Admin.
*   **Level 6 — UI Surfaces**: **MISSING** (Needs `SupplierDashboard.tsx`, `SupplierPO.tsx`).
*   **Level 7 — UI Components**: **MISSING** (Secure Login, PO Grid, Invoice Upload).
*   **Level 8 — Configuration**: Portal Access Controls.
*   **Level 9 — Master Data**: `supplier_user_identities` (Exists).
*   **Level 10 — Transactional Objects**: PO Acknowledgment, ASN, Supplier Invoice.
*   **Level 11 — Workflow & Controls**: Supplier-side validation before submission.
*   **Level 12 — Accounting**: Pay-on-Receipt (Auto-Invoice) triggers.
*   **Level 13 — AI / Automation**: Chatbot for "When will I get paid?" (NexusAI Copilot).
*   **Level 14 — Security**: **CRITICAL GAP** - Need separate auth/router for external users (`/portal/supplier`).
*   **Level 15 — Performance/Ops**: High concurrency support for thousands of suppliers.

### Dimension 7: Integration Level (Procurement -> AP -> GL)
*   **Level 1 — Domain**: Cross-Module Integration
*   **Level 2 — Sub-Domain**: Source-to-Settle (S2S)
*   **Level 3 — Functional Capability**: Data Continuity
*   **Level 4 — Business Use Case**: Converting an approved Contract/PO into an Invoice and GL Accrual.
*   **Level 5 — User Personas**: Buyer, AP Clerk, Accountant.
*   **Level 6 — UI Surfaces**: `InvoiceWorkbench.tsx`, `PurchaseOrderManager.tsx`.
*   **Level 7 — UI Components**: Drill-down Links (PO -> Invoice).
*   **Level 8 — Configuration**: Account derivation rules.
*   **Level 9 — Master Data**: `ap_suppliers` (Finance View) vs `scm_suppliers` (Ops View) - **Need Unification**.
*   **Level 10 — Transactional Objects**: `ap_invoices` (Header), `ap_invoice_lines` (Lines).
*   **Level 11 — Workflow & Controls**: 3-Way Match (PO, Receipt, Invoice).
*   **Level 12 — Accounting**: Debit Accrual, Credit Liability.
*   **Level 13 — AI / Automation**: Automated matching.
*   **Level 14 — Security**: Segregation of Duties.
*   **Level 15 — Performance/Ops**: Batch processing.

---

## Remediation Roadmap & Task List

### Phase 1: Supplier Lifecycle (✅ 85% Complete)
1.  **[DONE]** Schema: `supplier_onboarding_requests`, `supplier_user_identities`.
2.  **[DONE]** Backend: `SupplierPortalService` (Reg, Approve, Token).
3.  **[DONE]** UI: `ExternalSupplierRegistration.tsx` (Public Form).
4.  **[DONE]** UI: `SupplierOnboardingWorkbench.tsx` (Internal Approval).
5.  **[TODO]** **Portal Access**: Verify public routing and rate limiting.

### Phase 2: Contracts Foundation (✅ 90% Complete)
1.  **[DONE]** Schema: `procurement_contracts`, `contract_clauses`.
2.  **[DONE]** Backend: `ContractService` + AI Analysis.
3.  **[DONE]** UI: `ContractWorkbench.tsx` (Internal).
4.  **[TODO]** **Integration**: Link PO creation to Contract Validation (`validatePOCompliance` is built but not called).

### Phase 3: iSupplier Portal (⚠️ 0% Complete - CRITICAL GAP)
1.  **[NEW] [backend]** Create `server/routes/supplierPortalExternal.ts` (Login, Me, MyPOs).
    *   Auth: distinct from internal Admin; use `portalToken` from `supplier_user_identities`.
2.  **[NEW] [ui]** Create `client/src/layouts/SupplierPortalLayout.tsx` (Distinct branding).
3.  **[NEW] [ui]** Create `client/src/pages/supplier-portal/Login.tsx`.
4.  **[NEW] [ui]** Create `client/src/pages/supplier-portal/Dashboard.tsx` (Widgets: Open POs, Unpaid Invoices).
5.  **[NEW] [ui]** Create `client/src/pages/supplier-portal/Orders.tsx` (with Acknowledge button).

### Phase 4: Transactional Parity (ASN & Invoicing)
1.  **[NEW] [schema]** Create `asn_headers` and `asn_lines` (Advanced Shipment Notice).
2.  **[NEW] [ui]** Create `ASNCreator.tsx` in Supplier Portal.
3.  **[NEW] [backend]** Implement `InvoiceService.createFromPO` (Flip PO to Invoice).

---

## Business Impact
- **Immediate**: Internal teams have tools (Onboarding/Contracts), but Suppliers are "blind" (No Portal).
- **Risk**: High operational overhead answering supplier emails about payment status.
- **Action**: **IMMEDIATELY START PHASE 3 (iSupplier Portal).**

**EXPLICIT STOP: AWAIT APPROVAL FOR PHASE 3 BUILD.**
