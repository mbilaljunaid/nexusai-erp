# Schema Optimization & ORM Streamlining Plan

## 1. Current State Assessment

The NexusAI ERP currently operates in a "hybrid" mode, which is the primary source of infrastructure instability:
*   **Drizzle ORM**: Source of Truth for schema definition (~98 files in `shared/schema/*`). Handles complex PostgreSQL types and Zod validation generation.
*   **TypeORM**: Secondary, partial implementation used within the NestJS Bridge modules. Definitions are often out of sync (e.g., `CRM Lead` has 54 columns in Drizzle but only 10 in TypeORM).
*   **Conflict**: Mixed database connection pools, metadata initialization hangs during NestJS bootstrap, and "double-entry" schema maintenance.

## 2. Recommended Strategy: "Drizzle-First" Consolidation

**Verdict**: **KEEP Drizzle** as the single Source of Truth. **MERGE/REPLACE TypeORM** functionality into Drizzle.

### Why Drizzle?
1.  **SQL-Native Performance**: No runtime overhead of a heavy ORM metadata engine.
2.  **Schema Completeness**: Already covers 100% of the ERP domain model.
3.  **Type Safety**: Superior TypeScript inference without the need for redundant class-based entity decorators.
4.  **Zod Integration**: Seamlessly generates frontend/API validation schemas from database definitions.
5.  **NestJS Compatibility**: Drizzle can be injected as a standard NestJS Provider, replacing the need for `@nestjs/typeorm`.

---

## 3. Implementation Plan (Phased)

### Phase 1: Infrastructure Preparation
*   [ ] **Create Unified DB Provider**: Implement a NestJS `DatabaseModule` that exports a Drizzle `db` instance.
*   [ ] **Standardize Migrations**: Consolidate `server/migrations` (SQL) and Drizzle Kit migrations into a single `npm run db:push` / `npm run db:generate` workflow.
*   [ ] **Connection Management**: Ensure both the core Express server and the NestJS Bridge share the same `pg` pool to avoid connection exhaustion.

### Phase 2: Domain Migration
*   [ ] **Entity Extraction**: Systematically replace TypeORM entities (`*.entity.ts`) with Drizzle schema imports.
*   [ ] **Repository Refactoring**:
    *   Transition `@InjectRepository(Entity)` to `@Inject(DATABASE_CONNECTION)`.
    *   Use Drizzle's `db.query` or `db.select` syntax, which provides better type safety than TypeORM's query builder.
*   [ ] **Service Migration**: Update `InventoryService`, `FinanceService`, etc., to use the unified Drizzle instance.

### Phase 3: Cleanup & Optimization
*   [ ] **Remove TypeORM Dependencies**: Uninstall `@nestjs/typeorm` and `typeorm`.
*   [ ] **Metadata Elimination**: Delete all legacy TypeORM entity files.
*   [ ] **Constraint Audit**: Use Drizzle Kit to verify that all foreign keys and indices in the 98 schema files are correctly applied to the Postgres instance.

---

## 4. Risks & Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Breaking NestJS DI** | High | Use a standard Provider pattern for Drizzle to ensure zero disruption to module scoping. |
| **Complexity of Join Logic** | Medium | Leverage Drizzle's Relational Queries (`db.query.table.findMany({ with: ... })`) for TypeORM-like nested data fetching. |
| **Out-of-sync Migrations** | Low | Standardize on Drizzle Kit as the sole migration engine. |

## 5. Next Steps for User

> [!IMPORTANT]
> This plan focuses on **Structural Integrity**. By moving to a single ORM, we eliminate the initialization hangs observed during server startup and ensure that any schema change in `shared/schema` is immediately reflected across the entire application.

**Approved?** If so, we can begin Phase 1 by creating the unified NestJS Database Provider.
