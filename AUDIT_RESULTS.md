# Comprehensive Codebase Audit Results

Generated on: 2026-02-09

---

## Executive Summary

| Category | Count |
|----------|-------|
| `@ts-nocheck` suppressions | **24 files** (server) + **2 files** (src) |
| `@ts-ignore` usages | **3 instances** (src) |
| TODO/FIXME comments | **~30 files** across src |
| Hardcoded/mock data in pages | **8+ page files** with inline arrays |
| Mock data in backend services | **~22 files** across server/backend |
| Assumption comments | **28 files** with uncertain implementations |
| API endpoints called from frontend | **1,048 files** referencing `/api/` |
| `.catch(() => [])` silent error swallows | **385+ queryFn patterns** |
| Backend unreachable in preview | **ALL API calls** return HTML instead of JSON |
| Broken import paths (scripts/) | **135 unique TS errors** |

---

## CRITICAL: Breaks Functionality

### C1. Backend API Completely Unreachable in Preview
- **Impact**: Every single `/api/` call returns the HTML index page (200 OK with `text/html`), not JSON.
- **Evidence**: Network requests show `/api/auth/user` and `/api/finance/gl/ledgers` both return the full HTML page.
- **Affected**: All 1,048+ files making API calls. Every table, chart, and form in the app shows empty data.
- **Root Cause**: The external Node.js/NestJS backend is not running in the Lovable preview environment.

### C2. Authentication Flow Returns HTML, Not JSON
- **Files**: `src/components/RBACContext.tsx`, `src/hooks/useAuth.ts`
- **Issue**: `/api/auth/user` returns HTML. The auth system had to be patched with content-type checks to avoid crashing.
- **Status**: Partially mitigated with client-side fallback, but fragile.

### C3. Silent Data Failures Across 385+ Pages
- **Pattern**: `queryFn: () => fetch("/api/...").then(r => r.json()).catch(() => [])`
- **Impact**: When API returns HTML, `.json()` throws, catch swallows the error, UI silently shows "no data."
- **Sample files** (of 385+):
  - `src/pages/StoreOutletManagement.tsx` → `/api/stores`
  - `src/pages/WorkshopServiceOrders.tsx` → `/api/auto-service-orders`
  - `src/pages/eBatchRecord.tsx` → `/api/pharma-ebr`
  - `src/pages/FleetDriverManagement.tsx` → `/api/tl-drivers`
  - `src/pages/FreightRateCalculation.tsx` → `/api/freight-rates`

### C4. Broken Import Paths in 135+ Files
From previous TSC audit (still valid):
- 60+ `scripts/verify_*.ts` files reference non-existent service paths
- `server/modules/finance/routes.ts` imports missing `RevenueRecognitionService`
- `server/modules/scm/procurementRoutes.ts` imports missing `ProcurementService`
- `server/services/AnomalyDetectionService.ts` imports non-existent `stddev` from drizzle-orm
- `server/services/BulkImportService.ts` imports missing `InsertOrganization`, `InsertPerson`

---

## HIGH: Missing Features / Non-Functional

### H1. Pages with Hardcoded Inline Mock Data (No API Calls)
These pages render data from const arrays, not from any API:

| File | Mock Data |
|------|-----------|
| `src/pages/TasksDetail.tsx` | 2 hardcoded tasks |
| `src/pages/CustomersDetail.tsx` | 2 hardcoded customers |
| `src/pages/EmployeesDetail.tsx` | 2 hardcoded employees |
| `src/pages/ExpensesDetail.tsx` | 2 hardcoded expenses |
| `src/pages/PayrollDetail.tsx` | 2 hardcoded payrolls |
| `src/pages/BOMDetail.tsx` | 2 hardcoded BOMs |
| `src/pages/WorkflowExecution.tsx` | 2 hardcoded months |
| `src/pages/PerformanceMonitoring.tsx` | 2 hardcoded data points |
| `src/pages/admin/TenantAdmin.tsx` | Hardcoded tenant users |
| `src/components/KanbanBoard.tsx` | Default mock columns/tasks |
| `src/components/examples/LeadCard.tsx` | Mock lead object |
| `src/pages/projects/TaskList.tsx` | 4 hardcoded tasks |

### H2. 24 Server Files with `@ts-nocheck` (Type Safety Disabled)

| File | Module |
|------|--------|
| `server/modules/finance/routes.ts` | GL/Finance routing |
| `server/modules/finance/finance.service.ts` | Core finance service |
| `server/modules/finance/consolidation.service.ts` | Consolidation |
| `server/modules/crm/accounts-routes.ts` | CRM accounts |
| `server/modules/crm/campaigns-routes.ts` | CRM campaigns |
| `server/modules/crm/commissions-routes.ts` | CRM commissions |
| `server/modules/crm/contracts-routes.ts` | CRM contracts |
| `server/modules/crm/quotas-routes.ts` | CRM quotas |
| `server/modules/billing/BillingService.ts` | Billing |
| `server/modules/manufacturing/manufacturing.controller.ts` | Manufacturing |
| `server/modules/manufacturing/services/ManufacturingService.ts` | Manufacturing |
| `server/modules/manufacturing/services/ManufacturingCostingService.ts` | Costing |
| `server/modules/manufacturing/services/ManufacturingPlanningService.ts` | Planning |
| `server/modules/manufacturing/services/ManufacturingProcessService.ts` | Process |
| `server/modules/inventory/wms-shipping.service.ts` | WMS Shipping |
| `server/modules/hr/services/AorService.ts` | HR AOR |
| `server/modules/hr/services/ComplianceService.ts` | HR Compliance |
| `server/modules/hr/services/AnonymizationService.ts` | HR Anonymization |
| `server/middleware/audit.ts` | Audit middleware |
| `server/middleware/rls.ts` | Row-level security |
| `server/middleware/tenant.ts` | Multi-tenancy |
| `server/modules/lcm/lcm.service.ts` | LCM (mid-file) |

### H3. Backend Services Using In-Memory Arrays (No Database)
These NestJS services store data in `private array = []` — all data lost on restart:

| File | Entity |
|------|--------|
| `backend/src/modules/service/ticket.service.ts` | Tickets |
| `backend/src/modules/inventory/product.service.ts` | Products |
| `backend/src/modules/marketing/campaign.service.ts` | Campaigns |

### H4. AI Service Returns Stubs Only
- **File**: `backend/src/modules/ai/ai.service.ts`
- `analyzeEntry()` → always returns `{ isAnomaly: false, confidence: 0.95 }`
- `generateInsight()` → returns `"Insight generation coming soon"`
- `searchKnowledgeBase()` → returns `[]`

### H5. OCR Service Returns Mock Data
- **File**: `server/services/OCRService.ts`
- Always returns "Starbucks Coffee" / $15.75 regardless of input.

### H6. Forms Missing Create Buttons
- `src/components/hr/workforce-structures/GradesTab.tsx` — `{/* TODO: Add Create Button */}`
- `src/components/hr/workforce-structures/JobsTab.tsx` — `{/* TODO: Add Create Button */}`
- `src/components/hr/workforce-structures/PositionsTab.tsx` — `{/* TODO: Add Create Button */}`

### H7. AOR Management Component is a Stub
- **File**: `src/components/hr/AorManagement.tsx`
- Uses `const aors: any[] = []` — no API call, no CRUD functionality.

---

## MEDIUM: Incomplete Implementations

### M1. Mock Data in Server Services

| File | What's Mocked |
|------|---------------|
| `server/services/CardFeedService.ts` | `mockTransactions` array |
| `server/services/ai.ts` | NLP parser, intent extraction, all AI actions |
| `server/modules/inventory/wms-task.service.ts` | Unit cost hardcoded to `$50.00` |
| `server/modules/intercompany/intercompany.invoice.service.ts` | AR/AP invoice IDs are string concatenations |
| `backend/src/modules/epm/epm-security.service.ts` | Hardcoded security policies |
| `backend/src/modules/epm/gl-integration.service.ts` | Mock parsing of code combination IDs |
| `backend/src/modules/erp/tax-reporting.service.ts` | `mockFetchGLTaxBalance()` simulates GL |

### M2. Assumption Comments (Uncertain Code)
28 files contain comments like "Assuming endpoint exists", indicating code may not work:

| File | Assumption |
|------|------------|
| `src/components/maintenance/PartRequirementList.tsx` | "Assuming WMS module exists" |
| `src/components/construction/ConstructionDailyLogDetail.tsx` | "assuming the endpoints exist" |
| `src/pages/billing/BillingProfileManager.tsx` | "I'll assume we can fetch all profiles" |
| `src/pages/crm/CommissionPlanManager.tsx` | "Assuming we have a users endpoint" |
| `src/pages/crm/AccountDetail.tsx` | "Assuming cases endpoint supports filtering" |
| `src/pages/leases/LeaseDisclosureReport.tsx` | "Assuming list endpoint returns all" |
| `src/components/supplier-portal/CreateASNModal.tsx` | "assume we can pass lines if available" |
| `src/pages/learning/instructor/InstructorDashboard.tsx` | "Assuming this path" for StandardTable |

### M3. `@ts-ignore` in Frontend Components

| File | Line | Context |
|------|------|---------|
| `src/components/forms/OpportunityForm.tsx` | 50 | Ignoring type check on formData.accountId |
| `src/components/cash/ReconciliationWorkbench.tsx` | 248 | Ignoring StandardTable generic type issues |
| `src/components/cash/ReconciliationWorkbench.tsx` | 271 | Same StandardTable issue |

### M4. Dual Backend Architecture Conflict
The project has **two separate backends**:
1. **Express/Drizzle** (`server/`) — primary, has routes and services
2. **NestJS/Drizzle** (`backend/`) — secondary, some services use in-memory arrays

Neither is confirmed running in the preview environment.

### M5. Dummy API Key in Production Code
- `server/services/ai.ts:11` — `apiKey: process.env.OPENAI_API_KEY || "dummy-key"`

---

## LOW: TODOs and Cleanup

### L1. TODO Comments in Frontend

| File | Line | Comment |
|------|------|---------|
| `src/pages/crm/Account360.tsx` | 35 | "Add backend filters" |
| `src/components/hr/workforce-structures/GradesTab.tsx` | 36 | "Add Create Button" |
| `src/components/hr/workforce-structures/JobsTab.tsx` | 37 | "Add Create Button" |
| `src/components/hr/workforce-structures/PositionsTab.tsx` | 40 | "Add Create Button" |
| `src/components/KanbanBoard.tsx` | 45 | "remove mock functionality" |
| `src/pages/admin/TenantAdmin.tsx` | 53 | "remove mock functionality" |
| `src/components/examples/LeadCard.tsx` | 4 | "remove mock functionality" |

### L2. Obsolete Verification Scripts
60+ `scripts/verify_*.ts` files reference non-existent service paths and deprecated TypeORM imports. These should be pruned or updated.

### L3. `scripts/audit_codebase.ts` Exists but Not Integrated
A local audit script exists but cannot be run in the Lovable environment.

---

## Recommendations (Priority Order)

1. **Enable Lovable Cloud** to get a working backend (database + auth + edge functions) in the preview
2. **Migrate critical API routes** to edge functions or connect the external backend
3. **Replace silent `.catch(() => [])` patterns** with proper error handling showing user feedback
4. **Wire hardcoded pages** (TasksDetail, CustomersDetail, etc.) to real data sources
5. **Remove `@ts-nocheck`** from security-critical middleware (audit, rls, tenant)
6. **Replace in-memory NestJS services** with database-backed implementations
7. **Implement real OCR and AI services** or clearly mark them as demo-only
8. **Prune obsolete verification scripts** (60+ broken files in `scripts/`)
9. **Consolidate dual backend** into a single architecture
