# Industry Pack: MANUFACTURING (Phase 1)

**Version:** 1.0.0
**Status:** READY FOR DEV
**Domain:** `apps/manufacturing`

---

## 1. Domain Model (Database Schema)

### Entity Relationship Diagram (ERD)
*   **WorkCenter** (Machine/Station) 1--* **ProductionOrder**
*   **ProductionOrder** 1--* **BOM** (Bill of Materials)
*   **BOM** 1--* **BOMItem** (Component)
*   **ProductionOrder** 1--* **QualityCheck**

### Database Schema (PostgreSQL)

```sql
CREATE SCHEMA IF NOT EXISTS mfg_production;

-- 1. Work Centers (Machines)
CREATE TABLE mfg_production.work_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL, 
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, MAINTENANCE, DOWN
  capacity_per_hour DECIMAL(10,2) DEFAULT 0,
  cost_per_hour DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bill of Materials (BOM)
CREATE TABLE mfg_production.boms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  product_item_id UUID NOT NULL, -- FK to Core Inventory
  name VARCHAR(255) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Production Orders
CREATE TABLE mfg_production.production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  product_item_id UUID NOT NULL,
  bom_id UUID REFERENCES mfg_production.boms(id),
  quantity DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'PLANNED', -- PLANNED, RELEASED, IN_PROGRESS, COMPLETED, CANCELLED
  priority VARCHAR(20) DEFAULT 'MEDIUM' -- LOW, MEDIUM, HIGH
);
```

---

## 2. API Services & Controllers (Backend)

**Service:** `ManufacturingService`
**Path:** `apps/manufacturing/src/modules/production/production.service.ts`

```typescript
// sample method signature
async createProductionOrder(tenantId: string, data: CreateOrderDto): Promise<ProductionOrder> {
  // 1. Validate BOM existence
  // 2. Check Inventory (Raw Materials) availability via ERP Service
  // 3. Allocate Work Center Capacity
  // 4. Create Order
}
```

---

## 3. AI Action Schemas (Agentic Capabilities)

The AI Agent can autonomously manage production scheduling and optimization.

### Action 1: `create_production_order`
**Intent:** "Schedule production for 500 widgets next week."

```json
{
  "domain": "MANUFACTURING",
  "module": "production_planning",
  "action": "create_production_order",
  "parameters": {
    "product_name": "Widget X",
    "quantity": 500,
    "start_date": "2026-01-15T08:00:00Z",
    "priority": "HIGH"
  },
  "requiresApproval": true
}
```

### Action 2: `optimize_schedule`
**Intent:** "Optimize the schedule to reduce downtime on Line 1."

```json
{
  "domain": "MANUFACTURING",
  "module": "production_scheduling",
  "action": "optimize_schedule",
  "parameters": {
    "work_center_code": "LINE-1",
    "optimization_goal": "MINIMIZE_DOWNTIME"
  },
  "reasoning": "Detected 4 hours of idle time on Tuesday due to material shortage."
}
```

---

## 4. Frontend Architecture (React)

**Folder Path:** `apps/web/src/features/manufacturing`

### Component Map
1.  **Dashboard:** `ManufacturingDashboard.tsx`
    *   *Widgets:* OEE (Overall Equipment Effectiveness), Active Orders, Defect Rate.
2.  **Order List:** `ProductionOrderList.tsx`
    *   *Columns:* Order #, Product, Qty, Status, Progress Bar.
3.  **Gantt Chart:** `ProductionScheduler.tsx`
    *   *Lib:* `dhtmlx-gantt` or custom SVG implementation.
4.  **BOM Editor:** `BOMDesigner.tsx`
    *   *Feature:* Drag-and-drop component tree.

---

## 5. Seed Data (Tenant 1 Demo)

```json
{
  "work_centers": [
    { "name": "Assembly Line Alpha", "code": "WC-001", "status": "ACTIVE" },
    { "name": "Painting Station", "code": "WC-002", "status": "MAINTENANCE" }
  ],
  "production_orders": [
    { "order_number": "PO-1001", "product": "IPhone 15 Case", "qty": 5000, "status": "IN_PROGRESS" },
    { "order_number": "PO-1002", "product": "Samsung S24 Case", "qty": 3000, "status": "PLANNED" }
  ]
}
```

---

## 6. RBAC & Governance

| Role | Permissions |
| :--- | :--- |
| **Plant Manager** | `production:create`, `production:approve`, `work_center:manage` |
| **Operator** | `production:view`, `production:update_progress` |
| **Planner** | `production:schedule`, `bom:edit` |

**Audit Log Rule:** All status changes from `IN_PROGRESS` to `COMPLETED` must perform a Quality Check validation.
