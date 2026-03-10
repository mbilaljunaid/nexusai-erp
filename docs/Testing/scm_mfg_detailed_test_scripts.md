# SCM & Manufacturing Detailed Testing Scripts
*Based on scm_mfg_testing_plan.md*

## Testing Mandates
1. **No Automation**: execution must be exclusively via manual browser UI testing. Do not use Playwright scripts or Data Seeding scripts.
2. **Standard Navigation**: Navigate exclusively via UI elements (dashboards, sidebars, menus). Direct URL access (`/scm/purchasing/requisitions`) is prohibited. Before initiating any test, verify that the required module page link is available in the sidebar/navigation and functional. If missing, it must be built first.
3. **Immediate Remediation rule**: If any UI component, form, button, or feature is broken, halt test execution immediately. Debug, resolve, and confirm the fix before proceeding to the next step.

## Enterprise Scoping Pre-validations
Before executing module-specific test steps, perform these enterprise validations:
- **Unit Testing (Data Scope)**: Open any multi-tenant standard ledger screen or list view. Open Network/Console logs. Verify every query automatically limits data using `where tenantId = X AND businessUnitId = Y` or equivalent scoping criteria.
- **E2E Context Isolation**: Validate that the UI correctly filters records. Log in as a User assigned **only** to Business Unit A. Attempt to view AP Invoices or POs created under Business Unit B. The view should be strictly isolated or restricted.
- **State Preservation**: In the UI Header/Context Selector, switch to Business Unit A (or Inventory Org X). Hard refresh the browser (F5 or Command+R). Verify that the selected context remains active and data continues filtering by it.

---

## Module 10: Procurement Detailed Test Scripts

**Scenario 1: Procure-to-Pay (P2P) Lifecycle**
1. **Purchase Requisitions**:
   - Navigate to the Procurement dashboard -> Purchase Requisitions.
   - Assert page renders correctly with the navigation context.
   - Click 'Create Requisition'. Fill in line items and submit. Ensure success toast appears.
2. **Buyer Work Area**:
   - Navigate to Procurement dashboard -> Buyer Work Area.
   - Locate the submitted PR and click action to 'Convert to PO'. Confirm conversion.
3. **Purchase Orders**:
   - Navigate to Procurement dashboard -> Purchase Orders list.
   - Open the newly created PO. Assert order headers, lines, and distributions load without server 500s.
4. **PO Change Order**:
   - In the open PO, click 'Create Change Order'. Mutate a line item quantity and submit for approval. Assert successful approval status.

**Scenario 2: Supplier Sourcing & Agreements**
1. **Supplier Management**:
   - Navigate to Procurement -> Supplier Management. Select a supplier and ensure the supplier profile (addresses, contacts) loads.
2. **Supplier Qualification**:
   - Navigate to Procurement -> Supplier Qualification. Fill and submit a new questionnaire.
3. **Supplier Negotiation Workbench**:
   - Navigate to Procurement -> Supplier Negotiation Workbench. Create a new RFQ scoring matrix. Enter weightings and Save.
4. **Blanket Purchase Agreement (BPA)**:
   - Navigate to Procurement -> BPAs. Create an agreement, verify releases map to it, and that percentage utilization progresses.

**Scenario 3: Advanced Procurement**
1. **Funds Check Dashboard**:
   - Navigate to Procurement -> Funds Check Dashboard. Perform an encumbrance test by entering an amount and verifying budget blocks.
2. **Punchout Catalog Setup**:
   - Navigate to Procurement -> Punchout Catalog Setup. Enter mock cXML gateway credentials and Save.
3. **PO Distribution Workbench**:
   - Navigate to Procurement -> PO Distribution Workbench. Open a distribution line and enter split charges (e.g., 50/50 cost centers). Save.
4. **Supplier ASN Portal**:
   - Navigate to Procurement -> Supplier ASN Portal. Submit an Advance Shipment Notice linked to the PO created earlier.
5. **Drop Ship B2B Workbench**:
   - Navigate to Procurement -> Drop Ship B2B Workbench. Verify routing indicators exist.
6. **Landed Cost Apportionment**:
   - Navigate to Procurement -> Landed Cost Apportionment. Allocate freight/customs overhead to a receipt and verify costing updates.

---

## Module 11: Inventory / PIM Detailed Test Scripts

**Scenario 1: Item Master Data**
1. **Item Directory & Profile**:
   - Navigate to Inventory -> Item Directory. Select an item or create a new one to open Item Profile.
2. **Item Master Org Tabs**:
   - Inside the Item Profile, switch between 'Purchasing', 'BOM', and 'Costing' tabs. Assert validation rules per tab execute correctly.
3. **Item Category Hierarchy**:
   - Navigate to Inventory -> Item Category Hierarchy. Expand and collapse tree nodes, assign an item to a leaf category.
4. **Item Relationships**:
   - View Item Relationships (e.g. substitutes/cross-references). Make sure adding a relationship saves to DB.

**Scenario 2: Stock Operations**
1. **Inventory List & On-Hand Balance**:
   - Navigate to Inventory -> Inventory List. Open OnHandBalanceInquiry for a specific item/subinventory.
2. **Stock & Inter-Org Transfers**:
   - Navigate to Inventory -> Stock Transfers. Execute a Subinventory Transfer. Then execute an InterOrgTransfer across two distinct inventory orgs. Validated reduced on-hand balance.
3. **Stock Picking & Packing**:
   - Navigate to Inventory -> Stock Picking Packing. Generate a pick slip, confirm pick, and pack items into a box.
4. **Min-Max Planning Setup**:
   - Navigate to Inventory -> MinMaxPlanningSetup. Input thresholds (min 10, max 50) and save.

**Scenario 3: Advanced Inventory**
1. **Lot/Serial Manager**: Navigate to Inventory -> LotSerialManager. Trace a specific lot number genealogy.
2. **Cycle Counting**: Navigate to Inventory -> CycleCountingAudit. Generate counting tasks, enter actual counts, and process variances.
3. **Material Status Controls**: Navigate to Inventory -> MaterialStatusControls. Assign a 'Hold' status to a lot. Attempt a transaction with it and assert validation blocks it.
4. **UOM Conversion**: Navigate to Inventory -> UOMConversionMatrix. Create an item-specific conversion (e.g., 1 Box = 12 EA).
5. **Consignment Stock**: Navigate to Inventory -> ConsignmentStockManager. Create usage transaction and assert billing payload triggers.
6. **Locator Picking Sequence**: Navigate to Inventory -> LocatorPickingSequence. Assign picking zones and ensure sorting rules work.
7. **ABC Classification**: Navigate to Inventory -> ABCClassificationSetup. Define rules/classes.
8. **Catch Weight Entry**: Navigate to Inventory -> CatchWeightEntry. Enter dual-UOM values (e.g., 1 box, 12.5 lbs) and verify recording.

---

## Module 12: Warehouse Management (WMS) Detailed Test Scripts

**Scenario 1: Inbound Operations**
1. Navigate to WMS -> Warehouse Dashboard. Check metric cards render properly.
2. Navigate to WMS -> DirectedPutawayRules. Set up capacity or zone rules.
3. Navigate to WMS -> GoodsReceiptPutaway. Scan/enter items to receive against a PO and system should suggest putaway locator based on rules.

**Scenario 2: Outbound Operations**
1. **Wave Planning**: Navigate to WMS -> WavePlanning. Group multiple orders into a single wave release.
2. **Task Dashboard & Interleaving**: Navigate to WMS -> TaskDashboard. Verify TaskInterleavingEngine optimizes task sequence.
3. **Mobile Warehouse screens**: Access MobileWarehouse. Simulate scanning operations on constrained UI view.
4. **Pack Station**: Navigate to WMS -> PackStation. Scan items against the outbound LPN.
5. **Shipping Workbench**: Navigate to WMS -> ShippingWorkbench. Print a hypothetical BoL and ship confirm the load.

**Scenario 3: Advanced WMS**
1. **Yard Management**: Navigate to WMS -> YardDockManagement. Assign a trailer to a dock door.
2. **Cross-Docking**: Navigate to WMS -> CrossDockingWorkbench. Auto-match an inbound receipt directly to an outbound staging lane.
3. **LPN Workbench**: Navigate to WMS -> LPNTransactionWorkbench. Perform an LPN split and LPN merge operation.
4. **Labor Performance**: Navigate to WMS -> WmsLaborPerformance. View picking rates for users.
5. **RMA Workbench**: Navigate to WMS -> RMAWorkbench. Accept a customer return and assign it to an inspection location.

---

## Module 13: Manufacturing Detailed Test Scripts

**Scenario 1: Engineering (BOM & Routings)**
1. Navigate to Manufacturing -> BOMDesigner. Add components to a parent assembly. Use drag/drop if available.
2. Navigate to Manufacturing -> RoutingEditor. Define sequential operations for a BOM.
3. Navigate to Manufacturing -> StandardOpLibrary. Create a reusable operation.
4. Navigate to Manufacturing -> ECOManagement. Create a new engineering change order version of a BOM.
5. Navigate to Manufacturing -> FormulaDesigner. Setup a process manufacturing formula with coproducts/byproducts.

**Scenario 2: Planning & Scheduling**
1. Navigate to Manufacturing -> MRPWorkbench. Run an MRPExplosionViewer on an assembly with subassemblies. Verify pegging.
2. Navigate to Manufacturing -> ProductionGantt. Drag and drop work orders to adjust ConstraintScheduler.
3. Navigate to Manufacturing -> CapacityPlanning & CalendarManager. Define shift hours and non-working days.

**Scenario 3: Shop Floor Execution**
1. Navigate to Manufacturing -> WorkOrderList. Select a planned order and release it.
2. Navigate to Manufacturing -> ShopFloorTerminal. Clock in as an operator, complete a quantity on an operation.
3. Navigate to Manufacturing -> WorkInstructionLibrary. Open an instruction PDF/SCORM link attached to an operation.
4. Navigate to Manufacturing -> QualityManager. Perform a VarianceAnalysis on actual vs standard material usage.
5. Navigate to Manufacturing -> OSPWorkbench. Initiate Outside Processing for a supplier step.
6. Navigate to Manufacturing -> KanbanReplenishmentSetup or ReworkOrderDispatcher. Create a rework order from scrap.
7. Navigate to Manufacturing -> ProductionAdherenceReport. Render data charts for expected vs actual yields.

---

## Module 14: Cost Management Detailed Test Scripts

**Scenario 1: Cost Setup & Execution**
1. Navigate to Cost Management -> Cost Dashboard. Verify metrics load via CostInsights.
2. Navigate to Cost Management -> StandardCosting. Create or update cost layers for an item.
3. Navigate to Cost Management -> CostRollupWorkbench. Execute rollup for a multi-level BOM and check resulting frozen cost.
4. Navigate to Cost Management -> CostMethodSetup. Switch an org from Standard to Average or FIFO.

**Scenario 2: Advanced Costing**
1. Navigate to Cost Management -> CostProcessorMonitor. Verify if any background queue processes are pending or errored.
2. Navigate to Cost Management -> ReceiptAccountingViewer. View AP accrual distributions generated upon PO receipt.
3. Navigate to Cost Management -> CostAdjustmentApprovalWorkbench. Propose a manual unit cost adjustment and approve.
4. Navigate to Cost Management -> CostVarianceReport. Group PPV (Purchase Price Variance) and MVP (Material Usage Variance).
5. Navigate to Cost Management -> TransferPricingSetup. Configure markups for inter-org transfers.
6. Navigate to Cost Management -> OverheadAbsorptionRules. Verify overhead allocation percentages and run PeriodCloseReconciliation.

---

## Module 15: Maintenance (EAM) Detailed Test Scripts

**Scenario 1: Asset Management**
1. Navigate to Maintenance -> AssetHierarchyTree. Expand parent-child asset structures. Click an asset to open Asset360View.
2. Navigate to Maintenance -> AssetWarrantyManager. Link a warranty contract to an asset and verify expiration dates.

**Scenario 2: Work Execution & Planning**
1. Navigate to Maintenance -> AssetHealthDashboard. Check metric alerts or the IoTSensorDashboard mappings.
2. Navigate to Maintenance -> PMDefinitionBuilder. Define a Preventive Maintenance interval. Check PMScheduler generation.
3. Navigate to Maintenance -> PMRouteManager. Group multiple assets into a single inspection route work order.
4. Navigate to Maintenance -> MaintenanceWorkbench. Assign technicians to a work order. Update status to Complete.
5. Navigate to Maintenance -> AdvancedSchedulingBoard. View the timeline resource allocator.

**Scenario 3: Reliability & Advanced**
1. Navigate to Maintenance -> FailureCodeConfig. Define problem/cause/resolution hierarchies. Enter an RCA via RCAWorkbench.
2. Navigate to Maintenance -> FMEAWorkbench. Document Failure Modes and Effects Analysis entries.
3. Navigate to Maintenance -> InspectionWorkflow / PermitWorkflow. Require a hot-work permit before allowing WO release.
4. Navigate to Maintenance -> MeterConfiguration. Set a running hours meter. Enter readings in MeterReadingModule.
5. Navigate to Maintenance -> CBMRulesEngine. Set up Condition Based Maintenance rules to trigger WOs on threshold breach.

---

## Module 16: Transportation (TMS) Detailed Test Scripts

**Scenario 1: Planning & Tendering**
1. Navigate to Transportation -> TransportationManagementSystem Dashboard.
2. Navigate to Transportation -> RoutePlanningWorkbench / RouteOptimization. Create a route considering distance/weight.
3. Navigate to Transportation -> MultiModalShipmentOptimizer. Mix Truckload and Rail options.
4. Navigate to Transportation -> LoadTendering. Broadcast a load to carriers and accept a tender response.

**Scenario 2: Execution & Visibility**
1. Navigate to Transportation -> FleetManagement / CarrierManager. Update a carrier's compliance documents.
2. Navigate to Transportation -> EDI214EventLog. Check mock EDI status updates for shipment tracking.
3. Navigate to Transportation -> DangerousGoodsCompliance. Check Hazmat document generation flags.

**Scenario 3: Settlement**
1. Navigate to Transportation -> CarrierRateWorkbench. Look up LTL rates. Verify CarrierScorecardDashboard metrics.
2. Navigate to Transportation -> FreightSettlementConsole. Auto-generate AP vouchers for delivered freight.
3. Navigate to Transportation -> FreightAudit / FreightClaimManagement. Dispute an overcharge line and submit a claim.

---

## Module 17: Project Portfolio Management (PPM) Detailed Test Scripts

**Scenario 1: Project Financials**
1. Navigate to PPM -> BudgetForecastingDashboard & AccountingDashboard. Establish a baseline budget for a new project.
2. Navigate to PPM -> RevenueRecognitionDashboard. Configure rules (e.g., % Complete).
3. Navigate to PPM -> FundingLimits. Set hard/soft limits on a project agreement and attempt to exceed them.

**Scenario 2: Cost Collection & Burdening**
1. Navigate to PPM -> NonLaborExpenseBatch. Submit miscellaneous hardware costs to a project task.
2. Navigate to PPM -> TimesheetIntegrationMonitor. Check mock hours applied to tasks.
3. Navigate to PPM -> CostBurdeningInterface & BurdenRuleBuilder. Apply fringe & overhead rates to raw labor costs.
4. Navigate to PPM -> CipWorkbench & CipConsolidationDashboard. Group costs and capitalize them to Fixed Assets.
5. Navigate to PPM -> InterprojectAllocation. Charge a shared project cost to multiple sub-projects.

**Scenario 3: Billing & Revenue**
1. Navigate to PPM -> BillingRulesManager. Define T&M (Time and Materials) rules.
2. Navigate to PPM -> BillingEventsManager. Manually insert a milestone billing event.
3. Navigate to PPM -> ProjectBillingWorkbench & DraftInvoiceWorkbench. Generate draft invoice, review, and approve it.
4. Navigate to PPM -> CrossChargeInvoicing. Execute intercompany billing for borrowed resources.

---
**END OF DETAILED SCRIPTS**
