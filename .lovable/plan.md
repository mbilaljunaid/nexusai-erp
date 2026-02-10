
# Plan: Expand NexusAI Tool Registry Across All Modules

## Overview
Add ~55 new tools to the NexusAI tool executor, bringing the total from 33 to ~88 tools. This covers every major ERP module with RBAC-gated access. No new backend services are created -- tools wrap existing services.

## Files to Modify

### 1. `shared/schema/roles.ts` -- Add ~25 New Permissions

New permission constants:

```text
TREASURY_READ, TREASURY_WRITE
TAX_READ, TAX_WRITE
REVENUE_READ, REVENUE_WRITE
EPM_READ, EPM_WRITE
PAYROLL_READ, PAYROLL_WRITE
BENEFITS_READ
RECRUIT_READ, RECRUIT_WRITE
PERF_READ, PERF_WRITE
EXPENSE_READ, EXPENSE_WRITE
FIELD_SERVICE_READ, FIELD_SERVICE_WRITE
CONSTRUCTION_READ, CONSTRUCTION_WRITE
MAINTENANCE_READ, MAINTENANCE_WRITE
MDM_READ, MDM_WRITE
NETTING_READ, NETTING_WRITE
ORDER_READ, ORDER_WRITE
CAMPAIGN_READ, CAMPAIGN_WRITE
COMMISSION_READ
CONTRACT_READ, CONTRACT_WRITE
TRANSPORT_READ
AUDIT_READ
REPORTING_READ
ALLOCATION_READ, ALLOCATION_WRITE
LEASE_WRITE (add to existing LEASE_READ)
LCM_WRITE (add to existing LCM_READ)
```

Role mapping updates:
- ADMIN: gets all (automatic via `Object.values`)
- GL_MANAGER: gets most READ + WRITE for finance-adjacent modules, READ for operational
- GL_USER: gets READ for most, WRITE for a subset
- GL_VIEWER: gets READ-only for applicable modules

### 2. `server/services/nexus-tool-executor.ts` -- Add ~55 New Tools

Each tool follows the existing pattern:
- Add entry to `TOOL_PERMISSION_MAP`
- Add `case` in `executeToolAction` switch
- Implement function that calls existing service via dynamic import

New tools by module:

**Treasury (5)**
- `get_cash_position` -- reads bank balances
- `create_fx_deal` -- creates FX spot/forward deal
- `get_market_rates` -- fetches treasury rates
- `check_risk_limits` -- evaluates counterparty/VaR limits
- `generate_iso20022` -- generates payment XML

**Consolidation (2)**
- `run_consolidation` -- executes multi-ledger consolidation
- `check_consolidation_status` -- checks consolidation run status

**Tax (3)**
- `calculate_tax` -- calculates tax for a transaction amount
- `get_tax_filing_status` -- checks tax period status
- `generate_tax_report` -- generates tax summary

**Revenue Recognition (2)**
- `check_revenue_recognition` -- checks revenue status for a contract
- `generate_revenue_waterfall` -- generates revenue waterfall report

**EPM / Budgeting (2)**
- `get_budget_vs_actual` -- compares budget to actuals
- `create_forecast_scenario` -- creates budget forecast

**Payroll (3)**
- `run_payroll_preview` -- previews payroll calculations
- `get_payroll_summary` -- gets payroll run summary
- `detect_payroll_anomalies` -- detects payroll anomalies

**Benefits (2)**
- `check_benefits_enrollment` -- checks enrollment status
- `get_benefits_summary` -- summarizes benefits costs

**Recruitment (3)**
- `create_requisition` -- creates job requisition
- `parse_resume` -- extracts skills from resume text
- `get_recruitment_pipeline` -- gets pipeline statistics

**Performance (2)**
- `get_performance_review` -- gets employee performance data
- `create_goal` -- creates a performance goal

**Succession (2)**
- `get_succession_plan` -- gets succession plan for position
- `assess_readiness` -- assesses candidate readiness

**Expenses (3)**
- `validate_expense` -- validates expense against policies
- `get_expense_summary` -- summarizes expenses
- `import_card_transactions` -- imports corporate card feed

**Field Service (2)**
- `create_field_work_order` -- creates field service job
- `get_field_schedule` -- gets technician schedule

**Construction (3)**
- `get_construction_risk` -- project risk overview
- `get_construction_cost` -- project cost summary
- `track_construction_progress` -- milestone status

**Maintenance / EAM (3)**
- `create_maintenance_wo` -- creates maintenance work order
- `get_maintenance_schedule` -- gets PM schedule
- `check_meter_readings` -- checks asset meters

**MDM / Data Quality (3)**
- `search_parties` -- searches master data parties
- `check_data_quality` -- runs data quality score
- `get_duplicate_sets` -- gets duplicate candidate sets

**Netting (2)**
- `run_netting_proposal` -- generates intercompany netting proposal
- `check_netting_status` -- checks netting agreement status

**Order Management (2)**
- `create_sales_order` -- creates a sales order
- `check_order_status` -- checks order fulfillment status

**Campaigns / Marketing (2)**
- `get_campaign_stats` -- gets campaign performance
- `create_campaign` -- creates a marketing campaign

**Commission (1)**
- `calculate_commission` -- calculates sales commission

**Contracts (2)**
- `create_contract` -- creates a new contract
- `check_contract_expiry` -- checks contracts approaching expiry

**Transportation / Freight (2)**
- `get_carrier_rates` -- compares carrier shipping rates
- `track_shipment` -- gets shipment tracking status

**Governance / Audit (2)**
- `get_audit_trail` -- gets audit trail for an entity
- `create_change_request` -- submits a governed change request

**Allocations (1)**
- `run_allocation` -- executes cost allocation rule

**Reporting (2)**
- `generate_gl_report` -- generates GL trial balance/income statement
- `generate_ar_aging` -- generates AR aging report

### 3. `src/config/ai-capabilities.ts` -- Add ~24 New Module Entries

Each entry registers:
- Module name and description
- Applicable routes
- Contextual insights (suggested prompts)
- Tool definitions with parameters

New capability entries for: Treasury, Consolidation, Tax, Revenue Recognition, EPM/Budgeting, Payroll, Benefits, Recruitment, Performance, Succession, Expenses, Field Service, Construction, Maintenance, MDM/Data Quality, Netting, Order Management, Campaigns, Commission, Contracts, Transportation, Governance/Audit, Allocations, Reporting.

## Implementation Sequence

1. Update `shared/schema/roles.ts` with all new permissions and role mappings
2. Expand `server/services/nexus-tool-executor.ts` with all 55 new tools (permission map + switch cases + implementations)
3. Expand `src/config/ai-capabilities.ts` with 24 new module capability entries

## Tool Count Summary

| Category | Count |
|----------|-------|
| Existing tools | 33 |
| New tools | ~55 |
| Total | ~88 |
| New permissions | ~25 |
| New capability modules | ~24 |
