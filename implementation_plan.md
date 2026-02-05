# EPM Planning Phase 5: Extended Domains (ESG, Treasury, Strategic)

# Goal Description
Extend the EPM module to cover "Extended" planning domains required for full Enterprise Compliance.
- **ESG**: Planning for Carbon, DEI, and Social Impact.
- **Treasury**: Cash forecasting and liquidity planning.
- **Strategic**: Long-Range Planning (LRP) support.

## User Review Required
> [!NOTE]
> **ESG Data Model**: We will introduce a new `PlanEsgMetric` entity. This differs from `PlanUnit` as it tracks non-financial units (KG CO2, Count, %) without necessarily tying to a GL Account, though integration is possible.

## Proposed Changes

### Domain 1: ESG & Non-Financials
- **Entity**: `PlanEsgMetric` (Dimension: Metric Code, Type, Unit)
- **Service**: `EsgPlanningService`
    - Logic: `Carbon = Activity * Emission Factor`
    - Logic: `Diversity % = Target Headcount / Total Headcount`

**Files:**
#### [NEW] [plan-esg-metric.entity.ts](file:///Users/mbjunaid/My Projects/nexusai-erp-2/backend/src/modules/epm/entities/plan-esg-metric.entity.ts)
#### [NEW] [esg-planning.service.ts](file:///Users/mbjunaid/My Projects/nexusai-erp-2/backend/src/modules/epm/esg-planning.service.ts)

### Domain 2: Treasury & Strategic
- **Service**: `TreasuryPlanningService`
    - Logic: `Closing Cash = Opening + Collections - Disbursements`
    - Note: Will re-use `PlanUnit` but with specialized Cash Flow Account Types.

**Files:**
#### [NEW] [treasury-planning.service.ts](file:///Users/mbjunaid/My Projects/nexusai-erp-2/backend/src/modules/epm/treasury-planning.service.ts)

## Verification Plan

### Automated Tests
- **ESG**: Verify Carbon Calc (1000 km * 0.2 factor = 200kg).
- **Treasury**: Verify Cash Roll-forward.

### Manual Verification
- None required (API/Script level verification sufficient).
