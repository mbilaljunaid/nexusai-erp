

# Audit: Unreachable Pages, Missing Navigation, and 404 Errors

## Summary

After cross-referencing all route definitions (20 route files), the global sidebar navigation (`src/config/navigation.ts`), the Dashboard module grid, and live browser testing, here are the findings organized into two categories.

---

## PART 1: Sidebar/Dashboard Links That Lead to 404 Pages

These are paths listed in navigation menus or the Dashboard that have **no matching route definition** and will show a 404 or the Landing Page when clicked.

### Global Sidebar (navigation.ts) - 4 broken links
| Sidebar Label | Path | Status |
|---|---|---|
| Processes | `/processes` | No route exists anywhere |
| Operations | `/operations` | No route exists anywhere |
| AI Assistant | `/ai` | No route exists anywhere |
| Settings | `/system-configuration` | No route exists anywhere |

### Dashboard Quick Links - 6 broken links
| Link Label | Path | Dashboard Role | Status |
|---|---|---|---|
| Processes | `/process-hub` | Editor | No route (sidebar uses `/processes`, also broken) |
| Security | `/security-settings` | Admin | No route exists |
| Audit Logs | `/audit-logs` | Admin | No route (actual path is `/compliance/audit`) |
| View All Alerts | `/system-alerts` | Admin | No route exists |
| My Tasks | `/tasks` | Viewer | No route exists |
| HR Portal | `/hr/employee-self-service` | Viewer | No route (actual path is `/me`) |
| Timesheets | `/hr/time-tracking` | Viewer | No route (actual path is `/me/time-card` or `/wfm/my-time`) |

### Manufacturing base path - 404
| Path | Status |
|---|---|
| `/manufacturing` | ScmRoutes only has `/manufacturing/dashboard`, `/manufacturing/bom`, etc. -- the base `/manufacturing` path has no route, so the sidebar link shows 404 |

### SCM base path - 404
| Path | Status |
|---|---|
| `/scm` | ScmRoutes has no `/scm` base route. Only `/scm/fulfillment`, `/scm/costing/*` exist. Sidebar link to Supply Chain shows 404 |

---

## PART 2: Built Pages With No Menu/Dashboard Entry

These are pages that have **valid route definitions** and render content, but are **not reachable** from any sidebar menu item or Dashboard module grid. Users can only reach them by knowing the URL.

### Entire Module Route Trees (no sidebar entry for sub-pages)

**Order Management** (11 routes, zero sidebar/nav entries)
- `/order-management`, `/order-management/create`, `/order-management/:id`, `/order-management/fulfillment`, `/order-management/returns`, `/order-management/config`, `/order-management/pricing`, plus 4 legacy routes

**MDM / Master Data Management** (15 routes, zero sidebar/nav entries)
- `/mdm`, `/mdm/governance`, `/mdm/duplicates`, `/mdm/parties`, `/mdm/reference-data`, `/mdm/items`, `/mdm/dq-dashboard`, `/mdm/change-requests`, `/mdm/import`, plus config sub-routes

**Portal** (14 routes, zero sidebar/nav entries)
- `/portal/*` (customer portal), `/portal/supplier/*` (supplier portal)

**Marketing** (2 routes, zero sidebar/nav entries)
- `/marketing`, `/marketing-module`

**ERP** (2 routes, zero sidebar/nav entries)
- `/erp`, `/erp-module`

**Reports** (2 routes, zero sidebar/nav entries)
- `/reports`, `/reports/:module`

**Service** (4 routes, zero sidebar/nav entries -- sidebar has "Service" in `app-sidebar.tsx` but NOT in `navigation.ts` which is the active sidebar)
- `/service`, `/service/tickets`, `/service/ticket/:id`, `/ticket-dashboard`

### Industry Vertical Pages (41 routes, zero sidebar entries)
All `/industry/*` routes including Healthcare (9), Telecom (8), Hospitality (10), Retail (6), Logistics (8)

### Standalone Orphan Pages (routed in App.tsx but no nav entry)
| Path | Page |
|---|---|
| `/intercompany` | Intercompany Workbench |
| `/intercompany/reconciliation` | Intercompany Reconciliation |
| `/intercompany/netting` | Netting Workbench |
| `/intercompany/allocations` | Allocations Workbench |
| `/me/payslips` | My Payslips |
| `/me/benefits/enroll` | Benefits Enrollment |
| `/me/delegation` | Delegation Workbench |
| `/me/payroll/deductions` | Voluntary Deductions |
| `/me/compliance/forms` | Statutory Forms |
| `/wfm/*` (12 routes) | Workforce Management (time, schedule, shifts, violations, etc.) |
| `/rewards/compensation` | Compensation Dashboard |
| `/rewards/payroll` | Payroll Workbench |
| `/talent/learning/*` (8 routes) | Learning Management System |
| `/hr/recruitment/*` (5 routes) | Recruitment sub-pages |
| `/hr/analytics/*` (5 routes) | HR Analytics sub-pages |

### Finance Sub-Pages Not in FinanceSidebar
Many finance routes exist but are not in the sidebar menu, including:
- `/finance/billing/*` (6 routes -- billing workbench, rules, profiles, anomalies, subscriptions)
- `/finance/sla/*` (3 routes)
- `/finance/tax`, `/finance/expense-management`
- `/revenue/*` (13 routes -- revenue management module)
- `/gl/config/*` (12+ config sub-routes)

---

## PART 3: Proposed Fix Plan

### Phase 1 -- Fix 404s from existing navigation (Critical)
1. Add missing route for `/manufacturing` (redirect to `/manufacturing/dashboard`)
2. Add missing route for `/scm` (create an SCM landing/dashboard page or redirect)
3. Add route for `/processes` pointing to the existing Processes pages in `src/pages/processes/`
4. Add route for `/operations` (create landing page or redirect to SCM)
5. Add route for `/ai` pointing to `AIAssistant.tsx`
6. Add route for `/system-configuration` pointing to `Settings` page
7. Fix Dashboard broken links: `/process-hub` to `/processes`, `/security-settings`, `/audit-logs` to `/compliance/audit`, `/tasks`, `/hr/employee-self-service` to `/me`, `/hr/time-tracking` to `/wfm/my-time`

### Phase 2 -- Add navigation entries for orphaned modules
8. Add Order Management, MDM, Service, Marketing, Reports, Intercompany to the global sidebar or as sub-items
9. Add Industry verticals as a sidebar section or sub-menu
10. Add WFM, Rewards, Learning, Recruitment sub-pages to the HR domain sidebar
11. Add Revenue, Billing, SLA, Intercompany routes to the Finance domain sidebar

### Phase 3 -- Clean up duplicate sidebar files
12. Remove or consolidate `src/components/app-sidebar.tsx` (old rail sidebar) vs `src/components/AppSidebar.tsx` (active sidebar used by GlobalLayout)

