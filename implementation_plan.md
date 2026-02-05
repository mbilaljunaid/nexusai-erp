# EPM Planning Phase 3: Operational Planning

# Goal Description
Expand EPM capabilities into Operational Planning, specifically targeting **Project Financials** and **S&OP (Sales & Operations Planning)**. This phase bridges the gap between high-level financial budgeting and granular operational execution.

## User Review Required
> [!NOTE]
> We are introducing a new `PlanProduct` dimension for S&OP. This will require schema updates similar to Phase 2.

## Proposed Changes

### Domain 7: Project Financials
We will implement a dedicated `ProjectFinanceService` to handle:
- **Revenue Recognition**: Percentage of Completion (POC) method.
    - Formula: `recognizedRevenue = totalContractValue * (actualCost / estimatedTotalCost)`
- **Project Margin Analysis**: Calculating profitability per project.

**Files:**
#### [NEW] [project-finance.service.ts](file:///Users/mbjunaid/My Projects/nexusai-erp-2/backend/src/modules/epm/project-finance.service.ts)

### Domain 8: S&OP Alignment
We will lay the foundation for Demand Planning.
- **New Dimension**: `PlanProduct` (SKU level planning).
- **Service**: `DemandPlanningService` for calculating Gross Margin.

**Files:**
#### [NEW] [plan-product.entity.ts](file:///Users/mbjunaid/My Projects/nexusai-erp-2/backend/src/modules/epm/entities/plan-product.entity.ts)
#### [NEW] [demand-planning.service.ts](file:///Users/mbjunaid/My Projects/nexusai-erp-2/backend/src/modules/epm/demand-planning.service.ts)

## Verification Plan

### Automated Tests
- **Project Revenue Rec**: Create a test script to seed a project with Total Value and Costs, then trigger the POC calculation and verify the generated `PlanUnit` for Revenue.
- **S&OP**: Test gross margin calculation flow.

### Manual Verification
- None required for this backend-focused phase.
