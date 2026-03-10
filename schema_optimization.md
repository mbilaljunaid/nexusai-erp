# Schema Optimization & ORM Streamlining Plan

## 1. Executive Summary: "Drizzle-First" Consolidation

**Decision**: **KEEP Drizzle ORM** as the single Source of Truth. **PHASE OUT TypeORM** completely.
**Timeline**: Phased migration to ensure zero downtime.

### Why Drizzle?
1.  **Performance**: Lightweight, SQL-like, fast startup (no metadata scan hangs).
2.  **Type Safety**: Superior inference via `drizzle-orm` + `zod`.
3.  **Schema Authority**: `shared/schema` already defines 100% of the ERP data model (98+ files).
4.  **Stability**: Solving the "Hybrid" state eliminates the double-connection pool issues and "undefined column" errors seen in TypeORM.

---

## 2. Component Analysis

| Module | Current State | Target State | Complexity |
| :--- | :--- | :--- | :--- |
| **Finance (GL)** | **Hybrid** (Migrated Services + Legacy Entities) | **Drizzle** | Low (Mostly Done) |
| **Project Accounting** | **Drizzle** (New `ProjectService`) | **Drizzle** | Done |
| **Cost Management** | **Drizzle** (`SlaService`) | **Drizzle** | Low (Cleanup) |
| **Inventory** | **Drizzle** (Migrated Repos) | **Drizzle** | Done |
| **Procurement** | **TypeORM** (Heavy usage) | **Drizzle** | High |
| **HR / Payroll** | **TypeORM** (Complex Relations) | **Drizzle** | High |
| **EPM (Planning)** | **TypeORM** (Complex Hierarchies) | **Drizzle** | High |
| **CRM** | **Hybrid** | **Drizzle** | Medium |
| **Auth / Users** | **TypeORM** (Passport/JWT Integration) | **Drizzle** | Critical |

---

## 3. Implementation Plan

### Phase 1: Infrastructure & Core Validations (Completed)
- [x] Create `DatabaseModule` with `DrizzleProvider`.
- [x] Establish `shared/schema` as the definition source.
- [x] Demonstrate "Safe Service Migration" pattern (Finance/Projects).

### Phase 2: High-Impact Module Migration (Current Focus)
**Goal**: Migrate heavy transactional modules to remove bulk of TypeORM overhead.
*   [ ] **Procurement**:
    *   Migrate `PurchaseOrderService` and `RequisitionService`.
    *   Replace `PO` and `Requisition` entities with Drizzle schema.
*   [ ] **CRM**:
    *   Migrate `LeadService` and `OpportunityService`.
*   [ ] **EPM (Enterprise Planning)**:
    *   Migrate `BudgetService` (High data volume, benefits from Drizzle performance).

### Phase 3: Complex Domain Migration
**Goal**: tackle deeply nested and relational domains.
*   [ ] **HR & Payroll**:
    *   Migrate Employee/Person structures.
    *   Refactor `PayrollService`.
*   [ ] **Authorization (RBAC)**:
    *   Move `Users`, `Roles`, `Permissions` to Drizzle.
    *   Update `AuthModule` (Passport strategies).

### Phase 4: The "Kill Switch" (Cleanup)
**Goal**: Remove TypeORM entirely.
*   [ ] Remove `TypeOrmModule` from `AppModule`.
*   [ ] Uninstall `@nestjs/typeorm`, `typeorm`.
*   [ ] Delete `backend/src/**/entities/*.entity.ts`.
*   [ ] Search and destroy any `@InjectRepository`.

---

## 4. Migration Guide (Pattern)

#### 1. The "Safe Service" Pattern
Refactor services one by one without breaking the app.
```typescript
// BEFORE (TypeORM)
constructor(@InjectRepository(User) repo) {}

// AFTER (Drizzle)
constructor(@Inject(DRIZZLE_DB) db) {}
// Use db.select().from(schema.users)...
```

#### 2. Handling Relations
Use Drizzle's "Relational Queries" (RDBMS-like) to replace TypeORM's object graph mapping.
```typescript
// TypeORM
repo.find({ relations: ['profile'] })

// Drizzle
db.query.users.findMany({ with: { profile: true } })
```

---

## 5. Next Steps
1.  **Approval**: Confirm this plan to proceed with **Procurement** migration next.
2.  **Execution**: We will systematically apply the "Safe Service Migration" pattern to the remaining modules.
