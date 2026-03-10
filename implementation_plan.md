# EPM Planning Phase 6: Hyper-Scalability & Advanced AI

# Goal Description
Address the "Future Enhancements" identified in the Tier-1 Gap Analysis to ensure the system can handle Year-2 scaling (>100M rows) and provide Fortune-500 grade predictive analytics.

## User Review Required
> [!IMPORTANT]
> **Architecture Change (DB)**: Moving `PlanUnit` to a specialized Time-Series database (TimescaleDB) or identifying it as a Hyper-Table. For now, we will Implement **Postgres Partitioning** as the immediate step to support 100M+ rows without introducing a new infrastructure component (ClickHouse) immediately.
> **Architecture Change (AI)**: Introducing a Python Bridge. We will use a Sidecar pattern (FastAPI service) or local execution via `python-shell` if deployment complexity must be kept low. **Recommendation: Local Python Shell for simplicity in Monolith.**

## Proposed Changes

### 1. Advanced AI (Python Integration)
- **Objective**: Move beyond Linear Regression (JS) to ARIMA/Prophet (Python).
- **Implementation**:
    - Create `ml/forecast.py`: Python script accepting JSON input (History) and outputting Forecast.
    - Update `PredictiveForecastingService`: Use `child_process` to spawn python script and parse results.

**Files:**
#### [NEW] [backend/src/scripts/forecast.py](file:///Users/mbjunaid/My Projects/nexusai-erp-2/backend/src/scripts/forecast.py)
#### [MODIFY] [predictive-forecasting.service.ts](file:///Users/mbjunaid/My Projects/nexusai-erp-2/backend/src/modules/epm/predictive-forecasting.service.ts)

### 2. Hyper-Scalability (Data Layout)
- **Objective**: Optimize `PlanUnit` for massive scale.
- **Implementation**:
    - Implement **Table Partitioning** by `Year` (Period).
    - Add Database Indexes for common query patterns (Entity + Account).

**Files:**
#### [NEW] [backend/src/migrations/1700000000000-PartitionPlanUnit.ts](file:///Users/mbjunaid/My Projects/nexusai-erp-2/backend/src/migrations/1700000000000-PartitionPlanUnit.ts)

## Verification Plan

### Automated Tests
- **AI**: Verify Python script returns a Prophet-like curve (Seasonality check).
- **DB**: Verify Partition creation and Insert routing.
