# Enterprise Scoping — Modules 5, 7, 20, 22

## Database
- [/] Create migration `20260302_scoping_5_7_20_22.sql`
- [ ] Run `supabase db push`

## Backend
- [ ] Construction routes — `x-business-unit-id` filtering on GET/POST contracts
- [ ] Lease routes — `x-business-unit-id` + `x-legal-entity-id` on GET/POST leases
- [ ] Maintenance controller — `x-inventory-org-id` on GET/POST work-orders
- [ ] EAM routes — pass `invOrgId` alongside tenantId

## Frontend
- [ ] CostDashboard — BU + InvOrg switcher
- [ ] LeasePortfolioWorkbench — BU switcher
- [ ] MaintenanceWorkbench — InvOrg switcher
- [ ] ConstructionLanding — BU switcher

## Verification
- [ ] `tsc --noEmit` zero new errors
- [ ] Confirm DB columns exist
