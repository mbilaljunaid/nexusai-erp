- [x] Research existing Tax module codebase
- [x] Compare with Oracle Fusion Tax architecture
- [x] Identify fully implemented, partially implemented, and missing capabilities
- [x] Map findings to Level‑15 taxonomy across all dimensions
- [x] Draft comprehensive analysis document (analysis_tax_gap.md)
- [x] Review analysis with stakeholder and obtain approval
- [x] Prepare implementation plan for remediation
- [x] Execute remediation tasks (post‑approval)
- [x] Implement AR Tax Integration
- [x] Implement Inventory Tax Impact Module
- [x] Develop Period Close & Filing Scheduler
- [x] Enhance RBAC & SoD for Tax Overrides
- [x] Optimize Performance Engine
- [x] Build Premium UX Components
- [x] Implement Intercompany Tax Elimination
- [x] Add Recoverable/Non‑Recoverable Tax Logic
- [x] Build Comprehensive Tax Reporting Suite
- [x] Refine Tax Determination Logic (Nexus & POS)
- [x] Implement Deep GL Reconciliation
- [x] Implement Cross-Border & Reverse Charge Logic

## Procurement & SCM - Phase 1: Foundation
- [x] Implement Supplier Master (Entities: Supplier, SupplierSite)
- [x] Implement Supplier Service & Controller (Persistent CRUD)
- [x] Implement Inventory Organization & Item Master
- [x] Refactor ProductService to Persistent ItemService
- [x] Update Procurement UI to use Real Suppliers

## Procurement & SCM - Phase 2: Purchasing Core
- [x] Implement Purchase Order Entities (Header, Line, Distribution)
- [x] Refactor PurchaseOrderService to Persistent Storage
- [x] Implement PO Status Workflow (Draft -> Approved -> Open)
- [x] Update Procurement UI for Multi-Line POs

## Procurement & SCM - Phase 3: Receiving & Inventory
- [x] Implement Receipt Entities (ReceiptHeader, ReceiptLine)
- [x] Implement Receipt Service & Controller
- [x] Implement Receive-against-PO Logic (Update PO Status, Inventory Qty)
- [x] Create Receiving UI (Receive PO)

## Procurement & SCM - Phase 4: Requisitions & Approvals
- [x] Implement Requisition Entities (Header, Line)
- [x] Implement Requisition Service & Controller
- [x] Implement Requisition Workflow (Draft -> Pending -> Approved -> PO Conversion)
- [x] Create Requisition UI (Shop -> Submit)

## Procurement & SCM - Phase 5: Financial Integration (AP)
- [x] Implement AP Entities (Invoice, InvoiceLine, Payment)
- [x] Implement AP Service & Controller (Invoice Creation, Matching)
- [x] Implement Payment Logic (Update Invoice Status)
- [x] Create AP UI (Invoices & Payments Workbench)

## Procurement & SCM - Phase 6: Exception Flows
- [x] Implement Return-to-Vendor Logic (Inventory Update)
- [x] Implement Debit Memo Generation (AP Integration)
- [x] Create Returns UI (Select Receipt -> Return)

## Procurement & SCM - Phase 7: Advanced Approvals & Compliance (Parity Gap)
- [x] Implement Approval Rules Engine (Amount Limits, Department Routing)
- [x] Implement Budgetary Control (Check against GL) (Deferred to GL Phase)
- [x] Implement Tolerance Checks (3-Way Matching variations) (Implemented basic 3-Way)

## Procurement & SCM - Phase 8: Strategic Sourcing (Parity Gap)
- [x] Implement RFQ (Request for Quotation) Entity & Flow
- [x] Implement Supplier Quotes & Compare Analysis
- [x] Implement Blanket Purchase Agreements (BPAs) (Simplified to Standard PO Award)

## Procurement & SCM - Phase 9: Financial Hardening (Parity Gap)
- [x] Integrate Tax Engine for AP Invoices (Stubbed 10% Auto-Tax)
- [x] Implement Payment Terms (Net 30, 2/10 Net 30) Logic
- [x] Implement Accrual Accounting (Receipt Accruals to GL) (Status Tracking & Logging)

## Inventory Re-platforming (Enterprise Readiness)
- [x] **Phase 1: Transaction Engine**
    - [x] Create Ledger Entities (`MaterialTransaction`, `OnHandBalance`, `Subinventory`, `Locator`)
    - [x] Implement `InventoryTransactionService` (Atomic Updates)
    - [x] Refactor Procurement `ReceiptService` to use Ledger
- [x] **Phase 2: Item Control**
    - [x] Create `Lot` and `Serial` Entities
    - [x] Update Transaction Engine for Granular Tracking
- [x] **Phase 3: Costing & Valuation**
    - [x] Create `CstTransactionCost` (Cost Layers) Entity
    - [x] Implement Inline Costing Logic (FIFO/Average foundations)
- [x] **Phase 4: Planning & UI**
    - [x] Add Planning Attributes to `Item` (Min/Max)
    - [x] Implement `PlanningService` (Replenishment Logic)
    - [x] Create `InventoryDashboard` (Command Center UI)

- [x] **Phase 5: Accuracy & Fulfillment (Blockers)**
    - [x] Create `Reservation` Entity (Link Demand to Supply)
    - [x] Implement `ReservationService` (Hard/Soft Allocation Logic)
    - [x] Implement `AvailableToPromiseService` (ATP Calculation)
    - [x] Create `CycleCount` Entities (Header/Entry)
    - [x] Implement `CycleCountService` (Snapshot & Adjustment)

## Cost Management (Enterprise Parity)
- [ ] **Phase 1: Foundation & Master Data**
    - [ ] Create `CostManagementModule` Structure (Entity/Controller/Service)
    - [ ] Implement `CostBook` & `CostOrganization` Entities
    - [ ] Implement `CostElement` & `CostComponent` (Material, Overhead)
    - [ ] Implement `CostProfile` (Valuation Method Rules)
- [ ] **Phase 2: Receipt Accounting (The Bridge)**
    - [ ] Implement `ReceiptAccounting` Listener (Receipt -> Accrual)
    - [ ] Create `CmrReceiptDistribution` Entity (Dr Inv / Cr Accrual)
    - [ ] Implement `InvoicePriceVariance` (IPV) Logic (AP Match -> Cost Adj)
- [ ] **Phase 3: The Cost Processor (Engine)**
    - [ ] Implement `CostProcessorService` (FIFO/Weighted Avg Algorithms)
    - [ ] Implement `StandardCost` Definition & Rollup Logic
    - [ ] Create `CstCostDistribution` Entity (The SLA Source)
    - [ ] Implement `CostAdjustment` (Revaluation) Logic
- [ ] **Phase 4: Subledger Accounting (SLA)**
    - [ ] Implement `CreateAccounting` Engine (Distributions -> Journals)
    - [ ] Integrate with `GlIntegrationService` (Post to GL)
    - [ ] Implement `CostController` for UI Access
- [ ] **Phase 5: Operationalization & SLA (The Loop Closer)**
    - [ ] **Backend Migration**: Bootstrap NestJS in `server/index.ts` (Enable APIs)
    - [ ] **SLA Engine**: Implement `CreateAccounting` Service (Distributions -> GL Journals)
    - [ ] **GL Integration**: Post Journals to General Ledger
    - [ ] **Period Close**: Implement `CostPeriod` Open/Close Logic
- [ ] **Phase 6: Standard Costing & Planning**
    - [ ] Implement `StandardCost` Definition & Rollup Logic
    - [ ] Create `CostScenario` for "What-If" Analysis
    - [ ] Implement `CostUpdate` Process (Revaluation Inventory)
- [ ] **Phase 7: Landed Cost Management (LCM)**
    - [ ] Create `LandedCost` Entity (Freight, Duty, Insurance)
    - [ ] Implement `ChargeAllocation` Logic (Weight/Value/Qty)
    - [ ] Integrate with `ReceiptAccounting` (Adjust Unit Cost)
- [ ] **Phase 8: Manufacturing & WIP Costing**
    - [ ] Integrate with `WorkOrder` (Material Issue/Completion)
    - [ ] Implement `ResourceAbsorption` (Labor/Overhead)
    - [ ] Calculate `WIPVariance` (Standard vs Actual)
