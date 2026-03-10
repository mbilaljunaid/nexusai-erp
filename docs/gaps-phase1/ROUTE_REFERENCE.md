# Route Reference Guide

Quick reference for finding routes in the codebase.

## Finding a Route

All routes are now organized by module in `client/src/routes/`:

### By Feature Area

**Customer Relationship Management (CRM)**
→ `CrmRoutes.tsx` (21 routes)
- /crm, /crm/leads, /crm/opportunities, etc.

**Finance & Accounting**
→ `FinanceRoutes.tsx` (68 routes)
- /finance, /gl, /ap, /ar, /banking, etc.

**Supply Chain & Manufacturing**
→ `ScmRoutes.tsx` (38 routes)
- /scm, /procurement, /inventory, /warehouse, etc.

**Human Resources**
→ `HrRoutes.tsx` (24 routes)
- /hr, /employees, /payroll, /attendance, etc.

**Project Management**
→ `ProjectRoutes.tsx` (7 routes)
- /projects, /ppm, /tasks, etc.

**Customer Portal**
→ `PortalRoutes.tsx` (14 routes)
- /portal, /portal/tickets, etc.

**Public/Unauthenticated**
→ `PublicRoutes.tsx` (58 routes)
- /login, /register, /features, /docs, etc.

**Administration**
→ `AdminRoutes.tsx` (16 routes)
- /admin, /settings, /users, /roles, etc.

**Order Management**
→ `OrderRoutes.tsx` (11 routes)
- /order-management/*

**Industries**
→ `IndustryRoutes.tsx` (41 routes)
- /industry/*

**Analytics**
→ `AnalyticsRoutes.tsx` (9 routes)
- /analytics/*

**Compliance**
→ `ComplianceRoutes.tsx` (7 routes)
- /compliance/*

**Construction**
→ `ConstructionRoutes.tsx` (7 routes)
- /construction/*

**Maintenance**
→ `MaintenanceRoutes.tsx` (11 routes)
- /maintenance/*

**Service**
→ `ServiceRoutes.tsx` (5 routes)
- /service/*

**Reports**
→ `ReportRoutes.tsx` (4 routes)
- /reports/*

**Marketing**
→ `MarketingRoutes.tsx` (3 routes)
- /marketing/*

**ERP Core**
→ `ErpRoutes.tsx` (3 routes)
- /erp, /erp-module

**Dashboard**
→ `DashboardRoutes.tsx` (1 route)
- /dashboard

## Adding a New Route

1. Determine which module the route belongs to
2. Open the appropriate route file (e.g., `CrmRoutes.tsx`)
3. Add the route following the existing pattern:
```tsx
<Route path="/crm/new-feature" component={NewFeature} />
```

4. Create the page component in `client/src/pages/[module]/`
5. Lazy-load it at the top of the route file
