# NexusAI vs Oracle Fusion: Module-by-Module Parity Assessment
## PART 5: Order Management | Billing/Revenue | Global Trade | Risk/GRC | MDM | Analytics/BI | Functional Setup
*Page / Form / Field / Granular Level Comparison*

Legend: ✅ = Exists in NexusAI | ⚠️ = Partial / Simplified | ❌ = Missing entirely

---

## Module 35 — Order Management (Oracle OM Cloud)
**Oracle Equivalent:** Oracle Order Management Cloud / Distributed Order Orchestration (DOO)

### NexusAI Pages Currently Existing
- ✅ [OrderWorkbench.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/order/OrderWorkbench.tsx) (4.7KB) — Order list with search, status badge, pagination
- ✅ [OrderEntry.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/order/OrderEntry.tsx) (11.8KB) — Create Sales Order form with line items, customer, currency
- ✅ [OrderConfigManager.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/order/OrderConfigManager.tsx) (10.9KB) — Order types (Standard/Return/Transfer/Drop Ship) + Hold definitions
- ✅ [order/PriceListManager.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/order/PriceListManager.tsx) (6.3KB) — Pricing lists management
- ✅ [order/ReturnsWorkbench.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/order/ReturnsWorkbench.tsx) (3KB) — Returns management
- ✅ [order/ShipmentWorkbench.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/order/ShipmentWorkbench.tsx) (3.8KB) — Shipment workbench
- ✅ [SalesOrderManagement.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/SalesOrderManagement.tsx) (9KB) — Legacy B2B sales orders list (separate component)
- ✅ Schema: [order_management.ts](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/shared/schema/order_management.ts) — Order headers, lines, types, holds defined
- ✅ [OrderFulfillment.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/OrderFulfillment.tsx) / [OrdersLogistics.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/OrdersLogistics.tsx)

### Oracle Pages/Forms NexusAI is Missing or Partial
| Oracle Form | NexusAI Status | Gap Description |
|---|---|---|
| **Order Orchestration (DOO) Fulfillment Coordinator** | ❌ Missing | Oracle's core innovation: multi-source fulfillment rules — order line routes to warehouse A vs drop-shipper B vs transfer order based on ATP, proximity, and cost. NexusAI has no orchestration engine. |
| **ATP (Available-to-Promise) Check** | ❌ Missing | Oracle queries real-time inventory across all organizations at order entry. Shows available qty, expected shipment date. NexusAI order entry has no ATP call. |
| **Drop Ship / Back-to-Back PO** | ⚠️ Partial | `TransactionType = Drop Ship` selectable in OrderConfigManager. Missing: actual back-end logic to auto-create a PO to supplier when an order line is drop-shipped. |
| **Order Hold Management (Release Engine)** | ⚠️ Partial | Hold types defined in OrderConfigManager. Missing: automated hold application rules (e.g., "Credit Hold when balance exceeds limit") and one-click release-all workflow. |
| **Blanket Sales Agreement (BSA)** | ❌ Missing | Oracle's long-term pricing commitment: customer agrees to buy 1,000 units at $50/unit over 12 months. Each release order draws against the BSA. No BSA concept in NexusAI. |
| **Order Change Management (Versioning)** | ❌ Missing | Oracle tracks every change to a booked order as a numbered revision. NexusAI has no order revision/change log. |
| **Post-Sales Amendment (Amend Fulfilled Lines)** | ❌ Missing | Oracle allows amending shipped quantities, changing ship-to address post-shipment with credit memo logic. |

### Key Field-Level Gaps (Sales Order Header Form)
| Oracle Field | NexusAI Status |
|---|---|
| Order Number (auto-sequence) | ✅ |
| Order Type (Standard/Return/Transfer) | ✅ |
| Customer / Bill-To / Ship-To | ⚠️ Ship-To missing from OrderEntry |
| Currency + Exchange Rate Date | ⚠️ Currency exists, FX date missing |
| Payment Terms | ❌ Missing from order form |
| Requested Ship Date / Promised Date | ❌ Missing |
| Shipping Method / Carrier | ❌ Missing |
| Purchase Order # (Customer's PO) | ❌ Missing |
| Salesperson / Sales Team | ❌ Missing |
| Order Source (Manual / EDI / API) | ❌ Missing |
| Tax Exemption Certificate | ❌ Missing |
| blanket Agreement Reference | ❌ Missing |

### Key Field-Level Gaps (Sales Order Line)
| Oracle Field | NexusAI Status |
|---|---|
| Item / Description | ✅ |
| Quantity + UOM | ✅ Qty exists, UOM missing |
| Unit Price / List Price | ✅ |
| Discount % / Discount Amount | ❌ Missing |
| Extended Amount | ✅ (calculated) |
| Fulfillment Method (Warehouse / Drop Ship) | ⚠️ Type selectable, not at line level |
| Shipping Warehouse (Source Org) | ❌ Missing |
| Tax Code / Tax Amount | ❌ Missing |
| Schedule Ship Date | ❌ Missing |
| Line Status (Entered / Booked / Shipped / Closed) | ✅ Status badge exists |
| Return Reason Code | ❌ Missing |

---

## Module 36 — Billing & Revenue Recognition (Oracle RMCS)
**Oracle Equivalent:** Oracle Revenue Management Cloud Service (RMCS) + Oracle Billing

### NexusAI Pages Currently Existing
**Billing Sub-system (`billing/` directory — 13 files):**
- ✅ [BillingWorkbench.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/billing/BillingWorkbench.tsx) (10KB) — Run Auto-Invoice engine, pending billing events, AI anomaly scan
- ✅ [BillingDashboard.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/billing/BillingDashboard.tsx) (10.1KB) — KPIs, charts
- ✅ [BillingProfileManager.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/billing/BillingProfileManager.tsx) (11.4KB) — Customer billing profile setup (frequency, method, template)
- ✅ [BillingRulesManager.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/billing/BillingRulesManager.tsx) (8.8KB) — Billing rule configurations
- ✅ [SubscriptionLifecycleManager.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/billing/SubscriptionLifecycleManager.tsx) (25.7KB) — **Very rich**: Create/renew/cancel subscriptions, MRR tracking, billing frequency, product lines
- ✅ [UsageMeteringDashboard.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/billing/UsageMeteringDashboard.tsx) (19.3KB) — Usage-based billing metering
- ✅ [DunningConfigManager.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/billing/DunningConfigManager.tsx) (16.8KB) — Dunning configuration
- ✅ [CreditMemoWorkbench.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/billing/CreditMemoWorkbench.tsx) (21.8KB) — Credit memos / adjustments
- ✅ [BillingAnomalyDashboard.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/billing/BillingAnomalyDashboard.tsx) (9.3KB) — AI-powered anomaly detection
- ✅ [RevenueWaterfallDashboard.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/billing/RevenueWaterfallDashboard.tsx) (13.1KB) — Revenue waterfall visualization

**Revenue Recognition Sub-system:**
- ✅ [RevenueContractWorkbench.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/RevenueContractWorkbench.tsx) (11.1KB) — ASC 606/IFRS 15 contracts, allocation engine, paginated list
- ✅ [RevenueContractDetail.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/RevenueContractDetail.tsx) — Contract detail view
- ✅ [RevenueRuleManager.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/RevenueRuleManager.tsx) — Revenue recognition rules engine
- ✅ [RevenueSSPManager.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/RevenueSSPManager.tsx) — Standalone Selling Price management
- ✅ [RevenueWaterfall.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/RevenueWaterfall.tsx) / [RevenueAccountingSetup.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/RevenueAccountingSetup.tsx) / [RevenuePeriodClose.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/RevenuePeriodClose.tsx)
- ✅ [DeferredRevenueMatrix.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/DeferredRevenueMatrix.tsx) / [RevenueAuditConsole.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/RevenueAuditConsole.tsx) / [RevenueSourceEvents.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/RevenueSourceEvents.tsx)
- ✅ Schemas: [billing.ts](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/shared/schema/billing.ts) / [billing_enterprise.ts](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/shared/schema/billing_enterprise.ts) / [billing_subscription.ts](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/shared/schema/billing_subscription.ts) / [revenue.ts](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/shared/schema/revenue.ts) / [revenue_accounting.ts](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/shared/schema/revenue_accounting.ts) / [revenue_rules.ts](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/shared/schema/revenue_rules.ts) / [revenue_periods.ts](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/shared/schema/revenue_periods.ts)

### Oracle Pages/Forms NexusAI is Missing or Partial
| Oracle Form | NexusAI Status | Gap Description |
|---|---|---|
| **Invoice Template Builder (WYSIWYG)** | ❌ Missing | Oracle allows dragging fields onto a PDF invoice template with custom logo, terms text, column ordering. NexusAI generates invoices but without a configurable layout builder. |
| **Revenue POB (Performance Obligation) Builder** | ⚠️ Partial | RevenuRuleManager exists. Missing: Oracle's guided wizard to identify and document each distinct performance obligation within a contract (e.g., "Software License" + "Support" + "Implementation"). |
| **Variable Consideration Estimation** | ❌ Missing | Oracle handles discounts, rebates, royalties, and penalties as variable consideration that must be estimated using expected value or most-likely amount under ASC 606. |
| **Milestone Billing Events** | ⚠️ Partial | BillingEventsManager exists in projects. Missing: Oracle's project-linked milestone billing where an event (e.g., "Phase 1 Complete" sign-off) triggers a billing event automatically. |
| **Deferred Revenue Rollforward Report** | ⚠️ Partial | DeferredRevenueMatrix exists. Missing: the period-over-period opening balance → deferrals → recognized → closing balance disclosure format used by auditors. |
| **Contract Modification Handling** | ❌ Missing | When Oracle contracts are modified (scope or price changes), ASC 606 requires prospective or cumulative catch-up adjustment. No contract modification workflow exists. |
| **Multi-Element Arrangement (Bundle Allocation)** | ⚠️ Partial | SSP Manager exists. Missing: automated relative SSP allocation engine that splits the transaction price across performance obligations by their stand-alone selling price ratios. |

### Key Field-Level Gaps (Revenue Contract Form)
| Oracle Field | NexusAI Status |
|---|---|
| Contract Number | ✅ |
| Customer / Account | ✅ |
| Legal Entity / BU / Ledger | ✅ |
| Contract Start / End Date | ✅ |
| Total Transaction Price | ✅ |
| Total Allocated Price | ✅ |
| Version Number | ✅ |
| Performance Obligations List | ⚠️ Rules exist, POB detail UI partial |
| SSP per POB | ⚠️ SSPManager exists, auto-allocation partial |
| Revenue Recognition Method (Time/Event/Output/Input) | ⚠️ Rules-based, method selector not explicit |
| Contract Modification Date/Reason | ❌ Missing |
| Variable Consideration Constraint | ❌ Missing |

### Key Field-Level Gaps (Subscription Contract Form)
| Oracle Field | NexusAI Status |
|---|---|
| Contract Number | ✅ |
| Customer | ✅ |
| Start Date | ✅ |
| Billing Frequency (Monthly/Quarterly/Annual) | ✅ |
| Product Lines (Item / Qty / Price) | ✅ |
| MRR | ✅ (auto-calculated) |
| TCV | ✅ (auto-calculated) |
| End Date / Renewal Date | ✅ |
| Status (Active/Draft/Cancelled) | ✅ |
| Termination Date / Reason | ✅ |
| Mid-term Upgrade / Downgrade | ❌ Missing — no amendment flow |
| Co-term (align to master contract date) | ❌ Missing |
| Auto-renew flag + notification lead time | ❌ Missing |

---

## Module 37 — Global Trade Management (Oracle GTM)
**Oracle Equivalent:** Oracle Global Trade Management Cloud

### NexusAI Pages Currently Existing
- ✅ [scm/GlobalTradeDashboard.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/scm/GlobalTradeDashboard.tsx) (3.7KB) — Navigation hub: KPIs (Open Shipments, Compliance Score, Customs Holds), links to LCM and logistics pages
- ✅ [TradeComplianceDashboard.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/TradeComplianceDashboard.tsx) (6.1KB) — Simple HS code / country / duty % CRUD with status (cleared/held/pending)
- ✅ [TradePromotions.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/TradePromotions.tsx) — Trade promotions management
- ✅ [CustomsCompliance.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/CustomsCompliance.tsx) — Customs compliance page
- ✅ [transportation/DangerousGoodsCompliance.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/transportation/DangerousGoodsCompliance.tsx) — Hazmat / IATA compliance
- ✅ LCM (Landed Cost Management) pages under `/scm/lcm/` sub-directory

### Oracle Pages/Forms NexusAI is Missing or Partial
| Oracle Form | NexusAI Status | Gap Description |
|---|---|---|
| **HS Code Classification Engine** | ⚠️ Partial | TradeComplianceDashboard allows manually assigning HS codes to records. Missing: Oracle's guided classification tree that narrows down from chapter → heading → subheading with tariff schedule lookup. |
| **Export License Management** | ❌ Missing | Oracle manages export licenses (EAR, ITAR, dual-use goods) — links items to license numbers, tracks utilization vs. license ceiling, alerts on approaching limits. |
| **Denied Party Screening (DPS)** | ❌ Missing | Oracle screens customers, suppliers, and vessel names against OFAC/BIS/EU watch lists in real-time. No screening engine exists in NexusAI. |
| **Import Duty Calculator** | ❌ **CRITICAL** | Oracle applies tariff schedules based on HS code, country of origin, trade agreement (FTA), and declared value to compute accurate import duties. NexusAI stores a flat `dutyPct` field with no calculation engine. |
| **Free Trade Agreement (FTA) Management** | ❌ Missing | Oracle manages preferential duty rates under USMCA, EU-UK TCA, ASEAN FTAs. Tracks certificate of origin eligibility, rules of origin, and substantial transformation. |
| **Customs Entry Filing (ACE/AES Integration)** | ❌ Missing | Oracle directly interfaces with U.S. CBP's AES for export filing and ACE for import entry. Creates ISF filings (10+2 data) electronically. |
| **Shipment Screening (C-TPAT / AEO)** | ❌ Missing | Oracle's security and compliance screening for C-TPAT (US) and AEO (EU) trusted trader programs. |
| **Country of Origin Determination** | ❌ Missing | Rules of origin engine: which manufacturing steps are sufficient to confer origin? Critical for preferential tariff claims. |

### Key Field-Level Gaps (Trade Compliance Record)
| Oracle Field | NexusAI Status |
|---|---|
| HS Code | ✅ (manual entry) |
| Country of Import / Export | ✅ (country field) |
| Duty Rate % | ✅ (manual flat rate) |
| Status (Cleared/Held/Pending) | ✅ |
| Trade Agreement / FTA Applied | ❌ Missing |
| Country of Origin | ❌ Missing |
| Export License Number | ❌ Missing |
| DPS Screening Status | ❌ Missing |
| Certificate of Origin # | ❌ Missing |
| Customs Entry # | ❌ Missing |
| Broker Reference | ❌ Missing |
| Tariff Schedule Lookup | ❌ Missing |
| Incoterms | ❌ Missing |

---

## Module 38 — Risk Management / GRC (Oracle Risk Management Cloud)
**Oracle Equivalent:** Oracle Risk Management Cloud (formerly Oracle GRC)

### NexusAI Pages Currently Existing
- ✅ [compliance/RiskRegisterPage.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/compliance/RiskRegisterPage.tsx) (11.8KB) — Full risk register: Risk ID, name, category (Financial/IT Security/Compliance/Operational/Strategic/HR/Reputational), likelihood (1–5 scale), impact (1–5), inherent score, residual score, control linkage, owner, review date
- ✅ [compliance/ControlAssessmentWorkbench.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/compliance/ControlAssessmentWorkbench.tsx) (16KB) — SOX/non-SOX control assessment: Control ID, process area, risk rating, tester, testing method (walkthroughs/sample/full population/self-assessment), sample size, exceptions found, effectiveness rating
- ✅ [compliance/AuditFindingWorkbench.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/compliance/AuditFindingWorkbench.tsx) (11.3KB) — Audit findings management
- ✅ [compliance/ComplianceControlsPage.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/compliance/ComplianceControlsPage.tsx) (5.9KB) — Control library
- ✅ [compliance/ComplianceSoxPage.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/compliance/ComplianceSoxPage.tsx) (5.4KB) — SOX compliance dashboard
- ✅ [compliance/ComplianceDashboard.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/compliance/ComplianceDashboard.tsx) (3.4KB)
- ✅ [RiskManagement.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/RiskManagement.tsx) (7.6KB) — Legacy basic risk list
- ✅ [ComplianceGovernance.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/ComplianceGovernance.tsx) / [ComplianceAudit.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/ComplianceAudit.tsx) / [ComplianceReporting.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/ComplianceReporting.tsx)

### Oracle Pages/Forms NexusAI is Missing or Partial
| Oracle Form | NexusAI Status | Gap Description |
|---|---|---|
| **Risk-Control Matrix Mapping (RCSM)** | ⚠️ Partial | RiskRegisterPage links a count of "mitigating controls" but no formal many-to-many Risk ↔ Control mapping table. Oracle's RCSM explicitly maps each risk to one or more controls with a coverage assessment. |
| **Automated SOX PCAOB Evidence Collection** | ❌ Missing | Oracle automatically collects evidence screenshots, system report exports, and query outputs to prove a control operated. NexusAI shows a paper-clip placeholder but no actual evidence upload/storage workflow. |
| **Remediation Tracking (Issue-to-Close)** | ⚠️ Partial | AuditFindingWorkbench exists. Missing: formal remediation workflow with due dates, assignees, escalation, and automated closure based on re-test results. |
| **Continuous Control Monitoring (CCM)** | ❌ Missing | Oracle continuously monitors ERP transactions for policy violations (e.g., "PO created after Goods Receipt = out-of-order PO"). Alerts fire automatically. No transaction monitoring engine in NexusAI. |
| **Segregation of Duties (SoD) Analysis** | ❌ Missing | Oracle analyzes user role assignments to identify SoD conflicts (e.g., a user who can both Create Invoices AND Approve Payments). No SoD rulebook or conflict detection engine. |
| **Regulatory Framework Library (COSO, ISO 31000)** | ❌ Missing | Oracle ships with COSO, ISO 31000, COBIT frameworks pre-loaded, each with control objectives and test procedures. No framework library in NexusAI. |
| **Risk Heat Map (Interactive)** | ❌ Missing | Oracle renders a 5×5 impact/likelihood heat map that is clickable to drill into risks at each cell. NexusAI shows risk scores in a table only. |

### Key Field-Level Gaps (Risk Register Form)
| Oracle Field | NexusAI Status |
|---|---|
| Risk ID | ✅ |
| Risk Name / Description | ✅ |
| Risk Category | ✅ (7 categories) |
| Likelihood (1–5 with label) | ✅ |
| Impact (1–5 with label) | ✅ |
| Inherent Score | ✅ (auto-calculated) |
| Residual Score | ✅ (auto-calculated) |
| Risk Owner | ✅ |
| Last Review Date | ✅ |
| Status | ✅ |
| Associated Controls (linked) | ⚠️ Count only, not linked |
| Regulatory Framework Reference | ❌ Missing |
| Risk Appetite Threshold | ❌ Missing |
| Risk Response (Accept/Mitigate/Transfer/Avoid) | ❌ Missing |
| Inherent → Residual Trend | ❌ Missing |

### Key Field-Level Gaps (Control Assessment Form)
| Oracle Field | NexusAI Status |
|---|---|
| Control ID | ✅ |
| Control Name | ✅ |
| Process Area | ✅ |
| SOX Relevant Flag | ✅ |
| Risk Rating (Critical/High/Medium/Low) | ✅ |
| Testing Method | ✅ (4 methods) |
| Sample Size | ✅ |
| Tester / Assessor | ✅ |
| Exceptions Found | ✅ |
| Effectiveness (Effective / w/ Exceptions / Ineffective) | ✅ |
| Evidence Attachments | ⚠️ Placeholder only — no upload |
| PCAOB Attribute Testing | ❌ Missing |
| Operator Error Rate | ⚠️ Field in seed data only |
| Sign-off / Approval | ❌ Missing |

---

## Module 39 — Data Quality / MDM (Oracle CDH / MDM)
**Oracle Equivalent:** Oracle Customer Data Hub (CDH) / Customer Data Management

### NexusAI Pages Currently Existing
- ✅ [mdm/DataQualityDashboard.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/mdm/DataQualityDashboard.tsx) (9KB) — Records managed, quality score, open duplicate sets, active policies; breakdown by Completeness / Uniqueness / Validity / Consistency
- ✅ [mdm/DuplicateDetectionWorkbench.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/mdm/DuplicateDetectionWorkbench.tsx) (16.3KB) — Run match batch, review duplicate sets, side-by-side party comparison, merge/resolve with survivor selection
- ✅ [mdm/MatchRuleBuilder.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/mdm/MatchRuleBuilder.tsx) (12.7KB) — Configure matching rules (fuzzy name, exact email, phone normalization)
- ✅ [mdm/SurvivorshipRuleBuilder.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/mdm/SurvivorshipRuleBuilder.tsx) (12KB) — Define which source system wins on merge conflicts
- ✅ [mdm/AdvancedMatchWorkbench.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/mdm/AdvancedMatchWorkbench.tsx) (17.9KB) — Advanced probabilistic matching
- ✅ [mdm/ChangeRequestWorkbench.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/mdm/ChangeRequestWorkbench.tsx) (16.7KB) — Master data change requests with approval
- ✅ [mdm/BulkImportWizard.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/mdm/BulkImportWizard.tsx) (13.8KB) — Bulk data import with validation
- ✅ [mdm/ItemMasterUI.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/mdm/ItemMasterUI.tsx) (14.7KB) — Item master data management
- ✅ [mdm/LocationManager.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/mdm/LocationManager.tsx) (12.5KB) — Location/address master
- ✅ [mdm/MDMAuditViewer.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/mdm/MDMAuditViewer.tsx) (14.3KB) — Audit log for master data changes
- ✅ [mdm/DataLineageViewer.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/mdm/DataLineageViewer.tsx) (10KB) — Data lineage/provenance tracking

### Oracle Pages/Forms NexusAI is Missing or Partial
| Oracle Form | NexusAI Status | Gap Description |
|---|---|---|
| **Hub Spoke Architecture (Golden Record)** | ⚠️ Partial | DuplicateDetectionWorkbench merges records. Missing: Oracle's persistent "golden record" concept — one canonical master linked to all source system instances, updated as sources change. |
| **Real-Time Data Quality Validation (on-save)** | ⚠️ Partial | BulkImportWizard validates on import. Missing: real-time format/completeness validation when individual records are saved anywhere in the system (CRM leads, AR customers, etc.). |
| **Oracle Address Verification (eLocation)** | ❌ Missing | Oracle integrates with postal services to validate & standardize addresses (USPS, Canada Post). NexusAI stores free-text addresses. |
| **Party Merge Cross-Module Impact** | ⚠️ Partial | Merge updates party record. Missing: Oracle's cascade that updates all references to merged parties across AR, AP, CRM, HR at merge time. |
| **Relationship Graph (Party Hierarchy)** | ❌ Missing | Oracle CDH visualizes hierarchical relationships: Corporate Parent → Subsidiaries → Sites → Contacts. NexusAI has no relationship graph. |
| **Data Stewardship Workflow** | ⚠️ Partial | ChangeRequestWorkbench exists. Missing: formal escalation paths when data quality exceptions require domain expert sign-off before writing to production golden record. |

### Key Field-Level Gaps (Duplicate Detection Form)
| Oracle Field | NexusAI Status |
|---|---|
| Party Name (fuzzy match) | ✅ |
| Email (exact match) | ✅ |
| Phone (normalized match) | ✅ |
| Match Score % | ✅ |
| Record Count in Set | ✅ |
| Survivor Selection | ✅ |
| Merge / Ignore actions | ✅ |
| Party Type (Person/Org) | ✅ |
| Source System of Record | ⚠️ Shown, not weighted |
| Address Match Score | ❌ Missing |
| Tax ID / DUNS Match | ❌ Missing |
| Post-merge AR/AP reference update | ❌ Missing |

---

## Module 40 — Analytics / Business Intelligence (Oracle OTBI)
**Oracle Equivalent:** Oracle Transactional Business Intelligence (OTBI) / Oracle Analytics Cloud (OAC)

### NexusAI Pages Currently Existing
- ✅ [Analytics.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/Analytics.tsx) (13KB) — Main analytics page: KPI cards (Revenue, Margin, Customers, Avg Order Value), Line/Bar/Pie charts using Recharts, tab-based: Dashboard | Reports | Data. Report generation (Financial Summary, Sales Analysis, Customer Metrics). OLAP query endpoint called.
- ✅ [AdvancedAnalytics.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/AdvancedAnalytics.tsx) (9.6KB) — AI dashboards, ML model registry (accuracy, status, retrain), ARIMA forecasting engine
- ✅ [PredictiveAnalytics.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/PredictiveAnalytics.tsx) — Predictive analytics models
- ✅ [FinancialAnalytics.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/FinancialAnalytics.tsx) / [HRAnalyticsDashboard.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/HRAnalyticsDashboard.tsx)
- ✅ [ProcessAnalytics.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/ProcessAnalytics.tsx) / [OperationalAnalytics.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/OperationalAnalytics.tsx)
- ✅ Module-specific analytics: [finance/ar/ArAnalytics.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/finance/ar/ArAnalytics.tsx), [wms/WarehouseAnalytics.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/wms/WarehouseAnalytics.tsx), [crm/CrmAnalyticsDashboard.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/crm/CrmAnalyticsDashboard.tsx), [analytics/HRPredictiveAnalytics.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/analytics/HRPredictiveAnalytics.tsx)
- ✅ Backend: ARIMA forecast API (`/api/analytics/forecast-advanced`), OLAP query endpoint (`/api/analytics/olap/query`), dashboard summary endpoint

### Oracle Pages/Forms NexusAI is Missing or Partial
| Oracle Form | NexusAI Status | Gap Description |
|---|---|---|
| **Subject Area Explorer (OTBI Metadata Browser)** | ❌ Missing | Oracle OTBI presents a catalog of 400+ pre-built subject areas (GL Balance, AR Aging, PO Lines, etc.) with drag-and-drop column picker. No metadata-driven report builder in NexusAI. |
| **Self-Service Report Builder (Ad Hoc)** | ❌ **CRITICAL** | Business users build custom reports by dragging dimensions and measures. NexusAI offers a fixed set of 4 report types with no user-configurable columns/filters. |
| **Dashboard Personalization (Row-Level Security)** | ❌ Missing | Oracle applies row-level security to analytics — a regional VP only sees their BU's data automatically. NexusAI analytics shows all data to all users. |
| **Scheduled Report Bursting** | ❌ Missing | Oracle schedules reports to run at midnight and burst results to individual email inboxes. No scheduled delivery system in NexusAI. |
| **Drill-Through to Source Transaction** | ⚠️ Partial | Some pages link to source records. Missing: Oracle's universal click-through from any metric in any report to the underlying transactional rows. |
| **Data Visualization Canvas (OAC Workbook)** | ❌ Missing | Oracle Analytics Cloud's canvas for multi-visualization workbooks with filter panels, brushing/linking between charts. NexusAI uses static Recharts components. |
| **Oracle Essbase Calculation Engine (OLAP Cubes)** | ❌ **CRITICAL** | Underlying OLAP server for multidimensional aggregation. NexusAI calls `/api/analytics/olap/query` but no Essbase-equivalent cube server is implemented. |
| **Write-Back to ERP (Planning Integration)** | ❌ Missing | Oracle allows analysts to write corrected values back from analytics workbooks to the EPM planning layer. |

### Key Field-Level Gaps (Analytics Dashboard)
| Oracle Field | NexusAI Status |
|---|---|
| KPI Cards (Revenue, Margin, etc.) | ✅ |
| Line / Bar / Pie Charts (Recharts) | ✅ |
| ARIMA Time-Series Forecasting | ✅ (backend endpoint) |
| ML Model Registry | ✅ (accuracy, retrain) |
| Report Types (Financial, Sales, Customer) | ✅ (fixed 4 types) |
| Export to PDF / Excel | ⚠️ Button exists, no actual export engine |
| Custom Report Builder (ad-hoc columns/filters) | ❌ Missing |
| Subject Area / Data Catalog | ❌ Missing |
| Row-Level Security on Analytics | ❌ Missing |
| Report Scheduling / Bursting | ❌ Missing |
| Embedded Dashboard in other modules | ⚠️ Module-specific pages exist but not embedded inline |
| Conditional Formatting Rules | ❌ Missing |

---

## Module 41 — Functional Setup Manager (Oracle FSM)
**Oracle Equivalent:** Oracle Functional Setup Manager Cloud

### NexusAI Pages Currently Existing
- ✅ [system/FunctionalSetupDashboard.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/system/FunctionalSetupDashboard.tsx) (3.9KB) — Navigation hub: KPI tiles (Features Enabled 148, Business Units 34, Active Users 1,240, Security Profiles 22). Links to: Manage Offerings, Business Units, Legal Entities, Security Profiles, Ledger Setup, Workforce Structures, Workflow Config, System Analytics, Document Records
- ✅ Extensive module-specific setup pages spread across the application (GL: 10 setup pages, HR: 8 setup pages, AP/AR: 5 each, Tax: 3, Inventory: 2, etc.)
- ✅ [IndustrySetup.tsx](file:///Users/mbjunaid/My%20Projects/nexusai-erp-2/src/pages/IndustrySetup.tsx) — Industry-specific configuration
- ✅ Feature flag system (documented in NexusAI infrastructure KI)

### Oracle Pages/Forms NexusAI is Missing or Partial
| Oracle Form | NexusAI Status | Gap Description |
|---|---|---|
| **Implementation Project Manager** | ❌ Missing | Oracle FSM provides a guided "Implementation Project" that sequences setup tasks in dependency order across all modules. A project shows % complete per module and which setup steps are mandatory vs. optional. |
| **Setup Task List (Sequenced)** | ❌ Missing | Oracle sequences setup tasks: "You must complete Ledger Setup before Chart of Accounts before Journal Sources." NexusAI's setup pages are accessible in any order without a dependency checklist. |
| **Offering Enablement (Opt-In / Opt-Out)** | ⚠️ Partial | `system-configuration` link exists in FunctionalSetupDashboard. Missing: Oracle's precise "Enable Offering" toggle that activates/deactivates entire functional pillars (Payables, Procurement, etc.) including all their setup tasks and UI visibility. |
| **Business Process Hierarchy (BPMN Viewer)** | ❌ Missing | Oracle FSM presents the full business process hierarchy: Order to Cash → Sales Order → Fulfillment → Billing → Revenue. A hierarchical tree where each node links to the relevant configuration pages. |
| **Configuration Export / Import (FBDI)** | ❌ Missing | Oracle allows exporting an entire configuration as a ZIP (FBDI package) and importing it into a fresh environment for rapid deployment. No config portability in NexusAI. |
| **Rollback / Reset to Default** | ❌ Missing | Oracle allows reverting a setup step to Oracle-delivered defaults. No rollback mechanism in NexusAI. |
| **Testing Task List (Sandbox Verification)** | ❌ Missing | Oracle FSM includes a test script generator that produces test case steps derived from the configured setup, helping QA teams verify the configuration is complete. |

### Key Field-Level Gaps (Functional Setup Dashboard / Setup Task)
| Oracle Field | NexusAI Status |
|---|---|
| Features Enabled Count | ✅ (static KPI) |
| Business Units | ✅ (linked) |
| Legal Entities | ✅ (linked) |
| Security Profiles | ✅ (linked) |
| Module-specific Setup Links | ✅ (extensive per-module pages) |
| Setup Completion % per Module | ❌ Missing |
| Prerequisite / Dependency Validation | ❌ Missing |
| Offering Enable/Disable Toggle | ⚠️ Generic system-config link only |
| Implementation Project Tracker | ❌ Missing |
| Setup Audit Log (who changed what setup) | ❌ Missing |
| Multi-Environment Deployment (Prod/Test/Dev) | ❌ Missing |
| Guided Setup Wizard | ❌ Missing |

---

## SUMMARY TABLE — Modules 35–41 Parity Assessment

| # | Module | Oracle Equivalent | UI Parity | Backend/Engine Parity | Priority | Key Gap |
|---|---|---|---|---|---|---|
| 35 | Order Management | Oracle OM Cloud | ⚠️ 55% | ⚠️ 45% | HIGH | ATP check, DOO orchestration engine, BSA, order versioning |
| 36 | Billing / Revenue | Oracle RMCS | ✅ 82% | ✅ 72% | LOW | Contract mod handling, variable consideration, mid-term amendments |
| 37 | Global Trade | Oracle GTM | ❌ 25% | ❌ 10% | HIGH | DPS screening, FTA management, export licensing, duty calculator |
| 38 | Risk / GRC | Oracle Risk Mgmt | ⚠️ 65% | ⚠️ 50% | MEDIUM | CCM engine, SoD analysis, evidence upload, heat map |
| 39 | Data Quality/MDM | Oracle CDH | ✅ 72% | ✅ 65% | MEDIUM | Golden record persistence, address verification, relationship graph |
| 40 | Analytics / BI | Oracle OTBI/OAC | ⚠️ 42% | ❌ 20% | HIGH | Ad-hoc report builder, subject areas, row-level security, OLAP cube |
| 41 | Functional Setup | Oracle FSM | ❌ 22% | ❌ 15% | HIGH | Implementation project, setup sequencing, FBDI export, offering toggles |

---

## Critical Gap Summary

### CRITICAL Blockers (architectural changes required):
1. **Module 37 — Global Trade**: No implementation engine at all. HS code lookup, FTA duty calculation, DPS denied-party screening, AES/ACE filing all require dedicated service integrations.
2. **Module 40 — Analytics**: The ad-hoc report builder and OLAP semantic layer are foundational Oracle capabilities that require significant infrastructure (a BI server or equivalent).
3. **Module 41 — Functional Setup**: No guided implementation orchestration; current pages are accessible ad-hoc without sequencing or completion tracking.

### HIGH Priority Feature Gaps:
1. **Module 35 — Order Management**: ATP check and DOO Fulfillment Coordinator require tight inventory integration and a rules engine.
2. **Module 38 — Risk/GRC**: Continuous Control Monitoring (CCM) requires transaction-event stream processing.
3. **Module 39 — MDM**: Golden record persistence and cross-module merge cascade are architectural requirements.

### Strengths (at/near Oracle parity):
- **Module 36 — Billing/Revenue**: NexusAI's strongest suite outside of the financial modules. The subscription lifecycle, revenue contract workbench, SSP management, and revenue waterfall reporting are genuinely Oracle-competitive.
- **Module 39 — MDM**: The MDM sub-directory with 11 purpose-built workbenches (match rules, survivorship, duplicate detection, change requests, bulk import, data lineage) is a strong implementation.
- **Module 38 — Risk/GRC**: The Risk Register and Control Assessment Workbench are field-complete for the core Oracle GRC use cases.

---
*End of Part 5 — Covers Modules 35–41 (rows 236–242 of the master parity table). Combined with Parts 1–4, this constitutes the complete 41-module parity assessment.*
