# Analysis: Supplier Portal & Procurement Contracts Gap (Oracle Fusion Parity)

## Merged “Gap Analysis + Feature Parity Heatmap” (Updated: 2026-01-16)

| Dimension | Oracle Fusion Parity Feature | Status | Gap / Technical Debt | NexusAI Artifact |
|:---|:---|:---:|:---|:---|
| **SLM** | Supplier Self-Registration | ✅ 100% | Full multi-step onboarding implemented. | `ExternalSupplierRegistration.tsx`, `SupplierPortalService` |
| **SLM** | Qualification & Onboarding | ✅ 100% | Integrated document management for certifications. | `SupplierOnboardingWorkbench.tsx`, `Documents.tsx` |
| **iSupplier** | **External Collaboration Portal** | ✅ 100% | Fixed previous gap: External Login, Dashboard, Orders, ASNs. | `supplierPortalExternal.ts`, `Dashboard.tsx` |
| **iSupplier** | ASN (Advanced Shipment Notice) | ✅ 100% | Schema, Backend, and Multi-line UI implemented. | `asn_headers`, `ASNs.tsx`, `CreateASNModal.tsx` |
| **iSupplier** | Self-Service Invoicing (Flip PO) | ✅ 100% | "Create Invoice" from PO flow verified. | `InvoiceService.tsx`, `Orders.tsx` (Action) |
| **PCM** | Contract Authoring & Repository | ✅ 100% | Master data, clauses, and internal workbench ready. | `procurementContracts`, `ContractWorkbench.tsx` |
| **PCM** | AI Clause Compliance Analysis | ✅ 100% | GPT-4 comparison of amended vs standard clauses. | `ContractService.analyzeContractCompliance` |
| **PCM** | Contract Consumption Tracking | ✅ 100% | Spend validation and UI dashboard integration implemented. | `validatePOCompliance`, `ContractWorkbench` (Consumption Tab) |
| **Performance**| Scorecards & KPIs | ✅ 100% | On-Time Delivery and Quality scores driven by real data. | `ScorecardService.ts`, `Performance.tsx` |
| **Sourcing** | RFQ & Negotiation | ✅ 100% | Strategic sourcing lifecycle and winner-to-contract flow. | `SourcingWorkbench.tsx`, `SourcingService.ts` |

---

## [ROOT] LEVEL-15 CANONICAL DECOMPOSITION

### Dimension 1: Supplier Lifecycle Management (SLM)
*   **Level 1 — Module Domain**: Supplier Collaboration & Contract Management
*   **Level 2 — Sub-Domain**: Supplier Lifecycle Management
*   **Level 3 — Functional Capability**: Master Data & Onboarding
*   **Level 4 — Business Use Case**: Prospective vendor applies -> Internal verification -> Approved for procurement.
*   **Level 5 — User Personas**: Prospective Supplier, Procurement Officer.
*   **Level 6 — UI Surfaces**: `ExternalSupplierRegistration.tsx` (Public Entry), `SupplierOnboardingWorkbench.tsx` (Admin Approval).
*   **Level 7 — UI Components**: StandardTable (Internal), Multi-step Stepper (External), Bank Detail Inputs.
*   **Level 8 — Configuration Screens**: Registration approval rules (currently service-injected).
*   **Level 9 — Master Data Screens**: `SupplierManager.tsx`, `SupplierSiteManager.tsx`.
*   **Level 10 — Transactional Objects**: `supplier_onboarding_requests`.
*   **Level 11 — Workflow & Controls**: Reject/Approve transition state with reviewer audit.
*   **Level 12 — Accounting Rules**: N/A (Pre-transactional).
*   **Level 13 — AI / Automation**: AI tax ID validation (planned).
*   **Level 14 — Security & Compliance**: Public access restricted to onboarding routes; PII encryption.
*   **Level 15 — Scalability & Ops**: Server-side pagination on onboarding queue.

### Dimension 2: iSupplier Collaboration (External Portal)
*   **Level 1 — Module Domain**: Supplier Collaboration & Contract Management
*   **Level 2 — Sub-Domain**: iSupplier Portal
*   **Level 3 — Functional Capability**: Self-Service Transactions
*   **Level 4 — Business Use Case**: Supplier acknowledges PO -> Ships goods (ASN) -> Flips to Invoice.
*   **Level 5 — User Personas**: Supplier User, Supplier Admin.
*   **Level 6 — UI Surfaces**: `Dashboard.tsx`, `Orders.tsx`, `ASNs.tsx`.
*   **Level 7 — UI Components**: StatCards (KPIs), ActionButtons (Ack/Invoice), StandardTable (Searchable grids).
*   **Level 8 — Configuration Screens**: `SupplierPortalLayout.tsx` (Sidebar routing controls).
*   **Level 9 — Master Data Screens**: `supplier_user_identities` portal management.
*   **Level 10 — Transactional Objects**: `purchase_orders` (External View), `asn_headers`, `ap_invoices`.
*   **Level 11 — Workflow & Controls**: PO Status Lock (Acknowledged POs can't be re-acked).
*   **Level 12 — Accounting Rules**: Pay-on-Receipt (Auto-Accrual potential from ASN).
*   **Level 13 — AI / Automation**: NexusAI Copilot for payment status inquiries.
*   **Level 14 — Security & Compliance**: `requireSupplierAuth` middleware (Token-based isolation).
*   **Level 15 — Scalability & Ops**: Server-side filtering on Orders and Invoices (StandardTable).

### Dimension 3: Procurement Contract Management (PCM)
*   **Level 1 — Module Domain**: Supplier Collaboration & Contract Management
*   **Level 2 — Sub-Domain**: Procurement Contracts
*   **Level 3 — Functional Capability**: Contract Lifecycle & Compliance
*   **Level 4 — Business Use Case**: Authoring MSA with standard clauses -> AI risk analysis -> Enforcement on PO.
*   **Level 5 — User Personas**: Category Manager, Legal Officer.
*   **Level 6 — UI Surfaces**: `ContractWorkbench.tsx`.
*   **Level 7 — UI Components**: Clause Library Picker, Multi-form contract header.
*   **Level 8 — Configuration Screens**: Contract Type mappings, Clause categories.
*   **Level 9 — Master Data Screens**: `contract_clauses` repository.
*   **Level 10 — Transactional Objects**: `procurement_contracts`, `contract_terms`.
*   **Level 11 — Workflow & Controls**: Amendment version tracking (internal logic).
*   **Level 12 — Accounting Rules**: Contract Spend Consumption (Total Amount Limit vs. Linked POs).
*   **Level 13 — AI / Automation**: `analyzeContractCompliance` (AI flag of risk in amended text).
*   **Level 14 — Security & Compliance**: Segregation of Duties (Authoring vs Approval).
*   **Level 15 — Scalability & Ops**: Clause library keyword search optimization.

---

## PHASED REMEDIATION PLAN (COMPLETE)

### Phase 6: Contract Consumption Visibility (✅ Complete)
1. **[PCM]** Add "Spend vs. Limit" progress bar to `ContractWorkbench.tsx`.
2. **[PCM]** Show "Linked POs" drill-down list inside the Contract details side-sheet.
3. **[PCM]** Implement "Compliance Alert" icon on PO Workbench if it breaches contract limits.

### Phase 7: Document Management & E-Signature (✅ Complete)
1. **[SLM]** Add "Document Upload" for Supplier Certifications (W-9, Insurance).
2. **[PCM]** Implement PDF generation for finalized contracts using `pdfkit`.
3. **[PCM]** Integrate E-signature status tracking.

### Phase 8: Negotiation & Sourcing (✅ Complete)
1. **[NEW]** Create `SourcingWorkbench.tsx` for internal RFQ creation.
2. **[iSupplier]** Create `Sourcing.tsx` for external suppliers to submit quotes.
3. **[PCM]** Auto-convert winning quote into a Procurement Contract.

---

## BUSINESS IMPACT & ADOPTION RISK
*   **Business Impact**: Full self-service drastically reduces "Where is my payment?" calls and ensures spend is contract-compliant.
*   **Adoption Risk**: Supplier onboarding requires clear communication; external training materials needed.
*   **Oracle Alignment**: NexusAI now mirrors the Fusion pattern of separate SLM, iSupplier, and PCM workbenches.

---

## COMPLETED PHASES (VERIFIED 100% PARITY)

### Phase 1-8: Strategic SCM & Procurement Excellence
- ✅ **Supplier Onboarding**: Multi-step registration & approval.
- ✅ **iSupplier Portal**: PO, ASN, and Invoice management.
- ✅ **Contract Lifecycle**: Clause library, AI compliance analysis, and PDF generation.
- ✅ **Consumption Tracking**: Real-time spend vs. limit validation.
- ✅ **Performance**: Data-driven scorecards (Delivery & Quality).
- ✅ **Negotiation & Sourcing**: Full RFQ-to-Contract strategic lifecycle.

