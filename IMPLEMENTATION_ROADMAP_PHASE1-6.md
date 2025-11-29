# NexusAI: 16-Week Implementation Roadmap (Phase 1-6)
**Goal**: Achieve 100% enterprise feature parity (191 → 250+ pages)  
**Timeline**: 4 months (60 pages, ~80-120 dev-hours per phase)

---

## PHASE 1: Payments & CRM Extensions (Weeks 1-3) ⚡

### Objective
Enable transactional billing + complex sales workflows (CPQ/Quotes/Orders)

### Pages to Build (12 new)
1. **InvoiceGenerator.tsx** - Create invoices from quotes/orders
2. **PaymentFlow.tsx** - Stripe checkout integration
3. **QuoteBuilder.tsx** - Drag/drop product lines + pricing rules
4. **ApprovalWorkflow.tsx** - Quote/order approval routing
5. **PricebookManager.tsx** - Manage pricing tiers
6. **DiscountRules.tsx** - Setup discount schedules
7. **OrderTracking.tsx** - Track orders to delivery
8. **CommissionCalculator.tsx** - Sales rep payouts
9. **PaymentHistory.tsx** - Invoice/payment records
10. **InvoicePreview.tsx** - PDF preview
11. **RecurringBilling.tsx** - Subscription management
12. **RevenueRecognition.tsx** - AR revenue tracking

### Backend Tasks
- [ ] Stripe integration (`POST /api/payments/create`, `GET /api/invoices/:id`)
- [ ] Invoice generation engine (PDF + email)
- [ ] Quote → Order conversion workflow
- [ ] Approval routing logic
- [ ] Price book calculation engine
- [ ] Tax calculation (sales tax, VAT)

### Database Additions
```sql
-- Invoices
CREATE TABLE invoices (
  id, tenant_id, quote_id, order_id, amount, tax, 
  status, due_date, paid_date, payment_method
);

-- Quotes
CREATE TABLE quotes (
  id, tenant_id, opportunity_id, valid_until, 
  line_items_json, discount_amount, total
);

-- Pricing Rules
CREATE TABLE price_books (
  id, tenant_id, name, product_id, price, 
  min_qty, max_qty, discount_percent
);
```

### Acceptance Criteria
- [ ] Create quote with 5+ products, apply discounts
- [ ] Convert quote → order → invoice
- [ ] Send invoice via email (mock Stripe)
- [ ] Calculate sales tax correctly
- [ ] Approval workflow routes to manager

### Testing Path
1. Mock Stripe mode (don't charge)
2. Create quote: Lead → Opportunity → Quote
3. Apply discount rules
4. Send for approval
5. Convert to order
6. Generate invoice

---

## PHASE 2: ERP Workflows (Weeks 4-6) 📊

### Objective
Full AP/AR workflows + bank reconciliation (financial close automation)

### Pages to Build (14 new)
1. **VendorInvoiceEntry.tsx** - Match invoices to POs
2. **InvoiceMatching.tsx** - 2-way and 3-way matching
3. **PaymentScheduling.tsx** - Plan vendor payments
4. **DunningManagement.tsx** - AR dunning letters
5. **CollectionsWorkflow.tsx** - Track collections
6. **BankReconciliation.tsx** - Match statements to GL
7. **BankStatementImport.tsx** - CSV/MT940 import
8. **ReconciliationExceptions.tsx** - Flag mismatches
9. **AggingReport.tsx** - AR/AP aging analysis
10. **FixedAssetRegister.tsx** - Asset tracking
11. **DepreciationSchedule.tsx** - Calculate depreciation
12. **AssetDisposal.tsx** - Track asset sales
13. **IntercompanyTransactions.tsx** - Multi-entity transactions
14. **FinancialClosing.tsx** - Period close checklist

### Backend Tasks
- [ ] AP invoice matching (2-way, 3-way with PO)
- [ ] Bank statement parser (CSV/MT940)
- [ ] Bank reconciliation matching engine
- [ ] Aging calculation (30/60/90 days)
- [ ] Dunning letter generator
- [ ] Fixed asset depreciation calculator
- [ ] Intercompany elimination rules

### Database Additions
```sql
CREATE TABLE ap_invoices (
  id, tenant_id, vendor_id, po_id, invoice_num, 
  amount, matched_status, matched_date
);

CREATE TABLE bank_statements (
  id, tenant_id, bank_id, statement_date, 
  transactions_json, reconciled_balance
);

CREATE TABLE fixed_assets (
  id, tenant_id, name, cost, acquisition_date, 
  useful_life_years, depreciation_method, disposed
);
```

### Acceptance Criteria
- [ ] Match AP invoice to PO (3-way match)
- [ ] Import bank statement CSV
- [ ] Auto-match 80% of transactions
- [ ] Reconcile bank account to GL
- [ ] Generate aging report (AR/AP)
- [ ] Calculate asset depreciation

### Testing Path
1. Create PO → Receive goods → Enter AP invoice
2. Match invoice to PO (quantity/amount/receipt)
3. Import mock bank statement
4. Reconcile transactions
5. Review exceptions
6. Mark period ready for close

---

## PHASE 3: Projects & Automation (Weeks 7-9) 🔄

### Objective
Jira-competitive project management + workflow automation engine

### Pages to Build (16 new)
1. **AgileBoard.tsx** - Kanban with drag/drop
2. **SprintPlanning.tsx** - Create sprints, assign stories
3. **Backlog.tsx** - Prioritize issues
4. **BurndownChart.tsx** - Sprint progress tracking
5. **IssueCreation.tsx** - Bug/task/story forms
6. **WorkflowEditor.tsx** - Drag/drop state machine
7. **AutomationRules.tsx** - If/then rule builder
8. **TimeTracking.tsx** - Log work, timesheet approval
9. **GanttChart.tsx** - Timeline view
10. **DependencyGraph.tsx** - Link issues, identify risks
11. **ResourceAllocation.tsx** - Team capacity heatmap
12. **EpicManagement.tsx** - Group related stories
13. **ReleasePlanning.tsx** - Coordinate releases
14. **TestCaseManagement.tsx** - QA integration
15. **ReleaseNotes.tsx** - Auto-generate from issues
16. **VelocityTracking.tsx** - Team productivity metrics

### Backend Tasks
- [ ] Workflow engine (state machine)
- [ ] Automation rule evaluator (triggers/actions)
- [ ] Time tracking aggregation
- [ ] Burndown calculation
- [ ] Dependency graph traversal
- [ ] Capacity planning algorithm
- [ ] Notification delivery (issue updates)

### Database Additions
```sql
CREATE TABLE issues (
  id, project_id, type, status, priority, 
  assignee_id, story_points, estimate_hours
);

CREATE TABLE workflows (
  id, project_id, name, states_json, 
  transitions_json (from/to/conditions)
);

CREATE TABLE automation_rules (
  id, project_id, trigger_type, trigger_condition_json, 
  action_type, action_params_json
);

CREATE TABLE worklogs (
  id, issue_id, user_id, hours, date, description
);
```

### Acceptance Criteria
- [ ] Create issue, move through custom workflow
- [ ] Drag issue between board columns
- [ ] Create sprint, assign stories, track burndown
- [ ] Log time, approve timesheets
- [ ] Setup automation rule: Bug reopened → notify QA
- [ ] Generate release notes from closed issues

### Testing Path
1. Create project with custom workflow (Design → Dev → Test → Done)
2. Create sprint with 10 stories (5 story points each)
3. Drag issues through board
4. Log 4 hours on Issue #1
5. Setup automation: "Priority=High" → "Assign to Lead"
6. Verify assignment happened automatically

---

## PHASE 4: Payroll & HR Workflows (Weeks 10-12) 👥

### Objective
Full employee lifecycle + payroll processing engine

### Pages to Build (15 new)
1. **PayrollEngine.tsx** - Calculate gross/net pay
2. **TaxCalculation.tsx** - Federal/state/local tax
3. **PayslipGeneration.tsx** - Create payslips (PDF)
4. **LeaveApproval.tsx** - Request/approve time off
5. **OnboardingChecklist.tsx** - New hire workflow
6. **BenefitsEnrollment.tsx** - Select health/401k
7. **DirectDeposit.tsx** - Setup ACH transfers
8. **OfboardingWorkflow.tsx** - Exit process
9. **PerformanceReview.tsx** - Annual/360 reviews
10. **GoalTracking.tsx** - OKRs or MBO framework
11. **CompensationBanding.tsx** - Salary bands + grades
12. **SuccessionPlanning.tsx** - Identify replacements
13. **TrainingPrograms.tsx** - Course tracking
14. **AttendancePolicy.tsx** - Rules + enforcement
15. **EmployeePortal.tsx** - Self-service (view payslips, request leave)

### Backend Tasks
- [ ] Payroll calculation engine (gross/deductions/net)
- [ ] Tax engine (federal withholding, FICA, state)
- [ ] Leave balance tracking + accrual
- [ ] Payslip PDF generation
- [ ] ACH batch file generation
- [ ] Compliance reporting (1099, W2, FICA)
- [ ] Attrition risk scoring

### Database Additions
```sql
CREATE TABLE payroll_runs (
  id, tenant_id, period_start, period_end, 
  total_gross, total_tax, total_net, status
);

CREATE TABLE employee_payroll (
  id, employee_id, payroll_run_id, gross_pay, 
  federal_tax, fica, state_tax, net_pay
);

CREATE TABLE leave_requests (
  id, employee_id, leave_type, start_date, 
  end_date, status, approver_id
);

CREATE TABLE benefits_enrollment (
  id, employee_id, plan_id, coverage_type, 
  election_amount, effective_date
);
```

### Acceptance Criteria
- [ ] Create payroll run for 10 employees
- [ ] Calculate correct taxes (FICA, federal, state)
- [ ] Generate payslips (PDF)
- [ ] Export ACH file for bank
- [ ] Request leave, route to manager, update balance
- [ ] Enroll employee in benefits

### Testing Path
1. Hire Employee: John Doe, $60k salary, married, 2 kids
2. Run payroll for Jan (biweekly)
3. Verify: Gross=$2,307, FICA=$176, Federal=~$150, Net=$1,980
4. Generate payslip PDF
5. John requests 3 days PTO
6. Manager approves
7. Verify leave balance decremented

---

## PHASE 5: EPM & Advanced Analytics (Weeks 13-15) 📈

### Objective
Driver-based planning + consolidation engine + variance analysis

### Pages to Build (14 new)
1. **BudgetBuilder.tsx** - Top-down budget entry
2. **DriverRulesEngine.tsx** - Growth assumptions
3. **RollingForecast.tsx** - 12-month rolling plan
4. **ScenarioBuilder.tsx** - Create what-if scenarios
5. **ScenarioComparison.tsx** - Compare budgets
6. **ConsolidationEngine.tsx** - Multi-entity roll-up
7. **EliminationRules.tsx** - Intercompany elimination
8. **IntercompanyMatrix.tsx** - View elimination detail
9. **VarianceAnalysis.tsx** - Actual vs budget
10. **VarianceExplanation.tsx** - Drill into differences
11. **CapexPlanning.tsx** - Capital expenditure budgets
12. **CashFlowForecast.tsx** - Liquidity projection
13. **SensitivityAnalysis.tsx** - Break-even, sensitivity
14. **ConsolidatedStatements.tsx** - Financial statements

### Backend Tasks
- [ ] Driver-based budget calculation (grows 5%/yr)
- [ ] Scenario engine (save/compare multiple budgets)
- [ ] Consolidation algorithm (sum entities, eliminate)
- [ ] Elimination rules matcher (intercompany transactions)
- [ ] Variance calculation (actual vs budget %)
- [ ] Cash flow forecast (project future balances)
- [ ] Sensitivity analysis (what-if parameter changes)

### Database Additions
```sql
CREATE TABLE budgets (
  id, tenant_id, period, department_id, 
  account_id, amount, driver_json
);

CREATE TABLE scenarios (
  id, tenant_id, name, base_budget_id, 
  assumption_changes_json, created_date
);

CREATE TABLE consolidation_rules (
  id, tenant_id, from_entity_id, to_entity_id, 
  intercompany_account_id, elimination_type
);

CREATE TABLE variance_analysis (
  id, tenant_id, period, account_id, 
  budgeted_amount, actual_amount, variance_pct
);
```

### Acceptance Criteria
- [ ] Create budget with 50 line items
- [ ] Setup driver: "Revenue growth 5%/month"
- [ ] Roll forward 12-month forecast
- [ ] Create scenario: "Recession (growth=2%)"
- [ ] Consolidate 3 subsidiary companies
- [ ] Eliminate intercompany transactions
- [ ] Variance report shows budget vs actual

### Testing Path
1. Budget: Set 2024 headcount budget = 100 people
2. Driver: "Hire 2/month, $80k salary"
3. Jan forecast: 100 people, $8M expense
4. Feb forecast: 102 people, $8.13M expense
5. Scenario: "Conservative (hire 1/month)"
6. Compare scenarios
7. Consolidate parent + 2 subsidiaries
8. View consolidated P&L

---

## PHASE 6: AI & Polish (Week 16) 🚀

### Objective
RAG copilots + performance tuning + final optimization

### Pages to Build (8 new)
1. **FinanceCopilot.tsx** - Q&A on GL, cash, budgets
2. **SalesCopilot.tsx** - Next actions, forecasts
3. **HRCopilot.tsx** - Headcount, payroll questions
4. **ProjectCopilot.tsx** - Sprint status, blockers
5. **DocumentUploader.tsx** - Ingest contracts, invoices
6. **RAGSearch.tsx** - Vector search over docs
7. **PromptLibrary.tsx** - Save/manage prompts
8. **AIInferenceDashboard.tsx** - Cost, latency tracking

### Backend Tasks
- [ ] RAG pipeline: doc ingestion → embedding → vector DB
- [ ] Retrieval reranker (BM25 + semantic)
- [ ] Prompt templating + versioning
- [ ] Human-in-loop approvals (don't auto-post GL)
- [ ] Inference cost tracking
- [ ] Model versioning (track which model generated response)

### Database Additions
```sql
CREATE TABLE embeddings (
  id, tenant_id, source_type, source_id, 
  vector_json (1536 dims), metadata_json
);

CREATE TABLE ai_prompts (
  id, tenant_id, name, template, variables_json, 
  safety_level (public/sensitive/restricted)
);

CREATE TABLE ai_audit_log (
  id, tenant_id, user_id, action, prompt_hash, 
  response_hash, model_used, cost_usd, timestamp
);
```

### Acceptance Criteria
- [ ] Upload 10 documents (contracts, invoices, specs)
- [ ] Ask copilot: "What's our top risk?" (from documents)
- [ ] Copilot: Returns relevant docs + summary
- [ ] Setup rule: "GL posting needs approval if >$50k"
- [ ] Copilot suggests journal entry
- [ ] User approves → posts to GL
- [ ] Dashboard shows 47 inferences, $0.23 cost

### Testing Path
1. Upload invoice PDF
2. Ask: "What's the largest invoice from Acme Corp?"
3. Copilot retrieves + summarizes
4. Ask: "What's our total AR from them?"
5. Copilot queries GL + answers
6. Monitor inference dashboard

---

## Implementation Priority & Dependencies

```
Phase 1 (Weeks 1-3) ← START HERE
├─ Backend: Stripe, invoice generation
├─ Frontend: Quote builder, payment flow
└─ Dependencies: None

Phase 2 (Weeks 4-6) ← Depends on Phase 1 completion
├─ Backend: AP/AR matching, bank reconciliation
├─ Frontend: Invoice matching, aging reports
└─ Dependencies: Invoice table from Phase 1

Phase 3 (Weeks 7-9) ← Independent
├─ Backend: Workflow engine, automation rules
├─ Frontend: Agile board, burndown
└─ Dependencies: None (but impacts Phase 6)

Phase 4 (Weeks 10-12) ← Depends on HR infrastructure
├─ Backend: Payroll engine, tax calculations
├─ Frontend: Payslip generation, leave approval
└─ Dependencies: Employee table from HR module

Phase 5 (Weeks 13-15) ← Depends on GL from Phase 2
├─ Backend: Consolidation, variance analysis
├─ Frontend: Budget builder, scenario comparison
└─ Dependencies: GL, intercompany setup

Phase 6 (Week 16) ← Depends on ALL previous phases
├─ Backend: RAG pipeline, embeddings
├─ Frontend: Copilots, inference dashboard
└─ Dependencies: All other modules (to RAG over)
```

---

## Resource Allocation

### Backend Developer (80 hours total)
- **Phase 1**: 20 hrs (Stripe, invoice engine, price books)
- **Phase 2**: 25 hrs (AP/AR matching, bank recon)
- **Phase 3**: 15 hrs (workflow engine, automation)
- **Phase 4**: 20 hrs (payroll engine, tax logic)
- **Phase 5**: 15 hrs (consolidation, variance)
- **Phase 6**: 15 hrs (RAG, embeddings, copilots)

### Frontend Developer (80 hours total)
- **Phase 1**: 20 hrs (Quote builder, payment flow)
- **Phase 2**: 20 hrs (Invoice matching, aging reports)
- **Phase 3**: 20 hrs (Agile board, automation UI)
- **Phase 4**: 15 hrs (Payroll forms, leave approval)
- **Phase 5**: 12 hrs (Budget builder, scenarios)
- **Phase 6**: 10 hrs (Copilots, RAG search)

### UI/UX Designer (in parallel)
- Design all 60 pages while devs build
- Figma components ready before dev implementation
- Weekly design review + iteration

---

## Success Metrics

### By End of Phase 1 (Week 3)
- [ ] Quote created, approved, converted to order
- [ ] Invoice generated + PDF downloadable
- [ ] Mock Stripe payment processed
- [ ] 3 new pages in production

### By End of Phase 2 (Week 6)
- [ ] AP invoice 3-way matched
- [ ] Bank statement imported & reconciled
- [ ] AR aging report accurate
- [ ] Period close checklist available

### By End of Phase 3 (Week 9)
- [ ] Sprint board functional, drag/drop works
- [ ] Burndown chart tracking correctly
- [ ] Custom workflow: Design → Code → Test → Done
- [ ] Automation rule working (e.g., High priority → assign to lead)

### By End of Phase 4 (Week 12)
- [ ] Payroll calculated correctly (taxes match)
- [ ] Payslips generated as PDF
- [ ] Leave requests approved, balance updated
- [ ] Employee can view payslips in portal

### By End of Phase 5 (Week 15)
- [ ] Budget created with drivers
- [ ] 12-month rolling forecast updated
- [ ] Scenario comparison shows delta
- [ ] Consolidated P&L correct
- [ ] Variance analysis shows budget vs actual

### By End of Phase 6 (Week 16)
- [ ] Finance copilot answers GL questions
- [ ] Sales copilot suggests next actions
- [ ] HR copilot predicts attrition
- [ ] Documents ingested, searchable
- [ ] 250+ pages deployed
- [ ] **100% enterprise parity achieved** ✅

