# Implementation Plan - Revenue Intelligence (Phase E)

This phase introduces AI-driven insights for the Revenue Management module, enabling finance teams to predict future revenue and identify risky contracts.

## User Review Required
> [!NOTE]
> This phase adds "Read-Only" intelligence features. No changes to core accounting logic or schema are required, making this a safe, high-value addition.

## Proposed Changes

### Backend Logic
#### [MODIFY] server/modules/revenue/RevenueService.ts
- Add `analyzeContractRisk(contractId)` method.
- Logic:
    - **High Liability Risk**: Contract Liability > 80% of Total Value (Stalled projects).
    - **Churn Risk**: No billing events for > 90 days on active contract.
    - **Revenue Spikes**: Single month recognition > 30% of total contract.

#### [MODIFY] server/modules/revenue/revenue.controller.ts
- Expose `GET /api/revenue/intelligence/forecast` (uses `RevenueForecastingService`).
- Expose `GET /api/revenue/intelligence/risk-analysis` (uses new `analyzeContractRisk`).

### Frontend UI
#### [NEW] client/src/pages/revenue/RevenueIntelligence.tsx
- **Forecast Chart**: Visualizes 12-month historical vs. 6-month predicted revenue.
- **Risk Radar**: List of contracts flagged by the Risk Agent.
- **Key Metrics**: "Predicted Quarter End", "High Risk Contracts".

## Verification Plan

### Automated Tests
- Run `scripts/verify_revenue_intelligence.ts`
    - Seed historical revenue data.
    - Seed a "Risky Contract" (e.g., active but no billings).
    - Assert Forecast returns valid regression points.
    - Assert Risk Analysis flags the risky contract.
