# Codebase Audit Results

Generated on: 2026-02-07T06:04:55.842Z

### Summary
- **Files Searched**: 1920
- **Total Issues Found**: 80

### Top 5 Files with Issues
- **src/components/cash/ReconciliationWorkbench.tsx**: 2 issues
- **src/components/cm/ImportStatementDialog.tsx**: 2 issues
- **src/components/examples/LeadCard.tsx**: 2 issues
- **src/components/examples/TaskCard.tsx**: 2 issues
- **src/pages/CustomerDetails.tsx**: 2 issues

## Detailed Findings
### src/components/cash/ReconciliationWorkbench.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 248 | TS Ignore | `/* @ts-ignore - Generic Type inference issue in some environments */` |
| 271 | TS Ignore | `/* @ts-ignore */` |

### src/components/cm/ImportStatementDialog.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 37 | Assumption | `// Assuming we need custom fetch for FormData to let browser set boundary.` |
| 61 | Assumption | `queryClient.invalidateQueries({ queryKey: ['/api/cm/accounts', accountId, 'statement-lines'] }); // Assuming this key` |

### src/components/examples/LeadCard.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 4 | TODO/FIXME | `// todo: remove mock functionality` |
| 5 | Mock/Dummy Data | `const mockLead = {` |

### src/components/examples/TaskCard.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 4 | TODO/FIXME | `// todo: remove mock functionality` |
| 5 | Mock/Dummy Data | `const mockTask = {` |

### src/pages/CustomerDetails.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 21 | Assumption | `// Assuming generic entity fetch or similar.` |
| 24 | Assumption | `// We can use the portal/me logic pattern but for admin.` |

### src/pages/crm/AccountDetail.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 35 | TODO/FIXME | `// TODO: Add accountId filter to contacts endpoint in future.` |
| 49 | Assumption | `// Assuming cases endpoint supports filtering or we mock it for now as part of Account 360 structure` |

### src/pages/gl/CloseDashboard.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 17 | TODO/FIXME | `const [selectedPeriod, setSelectedPeriod] = useState("Jan-2026"); // TODO: Dynamic` |
| 64 | TODO/FIXME | `body: JSON.stringify({ ledgerId: selectedLedger, fromPeriodName: selectedPeriod, toPeriodName: "Feb-2026" }) // TODO: Next period logic` |

### src/pages/tax/TaxDashboardTab.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 24 | Mock/Dummy Data | `const mockMetrics = [` |
| 55 | Mock/Dummy Data | `const mockTransactions = [` |

### src/pages/wfm/AccrualTesting.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 10 | Mock/Dummy Data | `const MOCK_TENANT_ID = "test-tenant-wfm-001";` |
| 11 | Mock/Dummy Data | `const MOCK_PERSON_ID = "3ebd9ddb-1566-418d-a0d6-9c773861acc4"; // Same as MyTime mock` |

### src/pages/wfm/ManagerApprovals.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 15 | Mock/Dummy Data | `const MOCK_TENANT_ID = "test-tenant-wfm-001";` |
| 16 | Mock/Dummy Data | `const MOCK_MANAGER_ID = "manager-user-001";` |

### src/pages/wfm/PayrollTransfer.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 14 | Mock/Dummy Data | `const MOCK_TENANT_ID = "test-tenant-wfm-001";` |
| 15 | Mock/Dummy Data | `const MOCK_ADMIN_ID = "admin-user-001";` |

### src/__tests__/PublicProcessPages.test.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 25 | Hardcoded Data | `const steps = [{ id: 1, name: 'Step 1' }];` |

### src/components/ActivityFeed.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 48 | TODO/FIXME | `// todo: remove mock functionality` |

### src/components/AddTaskDialog.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 60 | TODO/FIXME | `// todo: remove mock functionality - integrate with AI` |

### src/components/AnalyticsChart.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 53 | TODO/FIXME | `// todo: remove mock functionality` |

### src/components/GlobalSearch.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 49 | TODO/FIXME | `// todo: remove mock functionality` |

### src/components/KanbanBoard.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 45 | TODO/FIXME | `// todo: remove mock functionality` |

### src/components/LeadTable.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 49 | TODO/FIXME | `// todo: remove mock functionality` |

### src/components/ResourceAllocation.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 23 | TODO/FIXME | `// todo: remove mock functionality` |

### src/components/SystemHealth.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 55 | TODO/FIXME | `// todo: remove mock functionality` |

### src/components/TenantSwitcher.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 26 | TODO/FIXME | `// todo: remove mock functionality` |

### src/components/ar/CreateTransactionDialog.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 91 | TODO/FIXME | `// TODO: Add Routes. For now, we will fail.` |

### src/components/construction/ConstructionDailyLogDetail.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 62 | Assumption | `// Assuming endpoint will be added: GET /api/construction/daily-logs/:id/labor` |

### src/components/finance/JournalEntryGrid.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 110 | Assumption | `// Assuming we implemented a custom endpoint for this transaction.` |

### src/components/forms/OpportunityForm.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 50 | TS Ignore | `// @ts-ignore` |

### src/components/hr/workforce-structures/CreateLegalEmployerDialog.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 20 | Assumption | `import { Textarea } from "@/components/ui/textarea"; // Assuming you have this` |

### src/components/maintenance/PartRequirementList.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 55 | Assumption | `queryKey: ["/api/wms/inventory-stub"], // Assuming WMS module exists, otherwise use stub` |

### src/components/maintenance/QualityComponents.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 123 | Assumption | `body: JSON.stringify({ results, status: "PASS" }) // Assuming pass for now, add logic later` |

### src/components/nav/CrmSidebar.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 24 | Assumption | `{ title: "Opportunities", url: "/crm/opportunities", icon: Target }, // Assuming route exists or will exist` |

### src/context/LedgerContext.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 25 | Assumption | `// Assuming listGlLedgers endpoint exists (it was in storage.ts interface)` |

### src/pages/BOMDetail.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 12 | Hardcoded Data | `const boms = [{id: 1, name: "Widget A BOM", version: "1.0", items: 12}, {id: 2, name: "Widget B BOM", version: "2.1", items: 8}];` |

### src/pages/CustomersDetail.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 19 | Hardcoded Data | `const customers = [{ id: 1, name: "TechCorp Inc", industry: "Technology", revenue: "100M" }, { id: 2, name: "RetailCo", industry: "Retail", revenue: "50M" }];` |

### src/pages/Ecommerce.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 58 | TODO/FIXME | `// todo: remove mock functionality` |

### src/pages/EmployeesDetail.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 19 | Hardcoded Data | `const employees = [{ id: 1, name: "Sarah Johnson", dept: "Engineering", email: "sarah@company.com" }, { id: 2, name: "John Smith", dept: "Sales", email: "john@company.com" }];` |

### src/pages/ExpensesDetail.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 19 | Hardcoded Data | `const expenses = [{ id: 1, name: "Office Supplies", amount: 2500 }, { id: 2, name: "Travel", amount: 5000 }];` |

### src/pages/Health.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 42 | TODO/FIXME | `// todo: remove mock functionality` |

### src/pages/LearningManagement.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 57 | Assumption | `// Assuming context middleware provides user, but for now we might need a fallback if not logged in` |

### src/pages/PayrollDetail.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 12 | Hardcoded Data | `const payrolls = [{id: 1, name: "Dec 2024 Payroll", employees: 245, amount: 875000}, {id: 2, name: "Nov 2024 Payroll", employees: 243, amount: 850000}];` |

### src/pages/PerformanceMonitoring.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 5 | Hardcoded Data | `const data = [{ time: "10:00", latency: 45 }, { time: "11:00", latency: 38 }];` |

### src/pages/TasksDetail.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 19 | Hardcoded Data | `const tasks = [{ id: 1, title: "Design homepage", status: "done", priority: "high" }, { id: 2, title: "Implement auth", status: "in_progress", priority: "urgent" }];` |

### src/pages/WorkflowExecution.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 5 | Hardcoded Data | `const execData = [{ month: "Jan", executions: 120 }, { month: "Feb", executions: 145 }];` |

### src/pages/admin/PlatformAdmin.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 448 | TODO/FIXME | `// todo: remove mock functionality` |

### src/pages/admin/TenantAdmin.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 53 | TODO/FIXME | `// todo: remove mock functionality` |

### src/pages/billing/BillingWorkbench.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 36 | Assumption | `queryKey: ["/api/customers"], // Assuming this exists or using profiles` |

### src/pages/crm/Account360.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 35 | TODO/FIXME | `// TODO: Add backend filters for these, currently fetching all might be inefficient if list is huge` |

### src/pages/learning/instructor/InstructorDashboard.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 3 | Assumption | `import { StandardTable, Column } from "@/components/ui/StandardTable"; // Assuming this path` |

### src/pages/leases/LeaseDisclosureReport.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 14 | Assumption | `const res = await fetch(\`/api/lease/leases\`); // Assuming list endpoint returns all` |

### src/pages/maintenance/Asset360View.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 11 | Mock/Dummy Data | `const mockTelemetry = [` |

### src/pages/wfm/HolidayCalendar.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 11 | Mock/Dummy Data | `const MOCK_TENANT_ID = "test-tenant-wfm-001";` |

### src/pages/wfm/MyTime.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 14 | Mock/Dummy Data | `const MOCK_USER = {` |

### src/pages/wfm/ShiftConfiguration.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 14 | Mock/Dummy Data | `const MOCK_TENANT_ID = "test-tenant-wfm-001";` |

### src/pages/wfm/TeamSchedule.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 13 | Mock/Dummy Data | `const MOCK_TENANT_ID = "test-tenant-wfm-001";` |

### src/pages/wfm/TimekeeperConsole.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 14 | Mock/Dummy Data | `const MOCK_TENANT_ID = "test-tenant-wfm-001";` |

### src/pages/wfm/ViolationsDashboard.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 10 | Mock/Dummy Data | `const MOCK_TENANT_ID = "test-tenant-wfm-001";` |

### src/pages/wfm/WfmAnalytics.tsx
| Line | Type | Code Snippet |
|---|---|---|
| 9 | Mock/Dummy Data | `const MOCK_TENANT_ID = "test-tenant-wfm-001";` |

### backend/src/modules/cost-management/cost-anomaly.service.ts
| Line | Type | Code Snippet |
|---|---|---|
| 37 | TODO/FIXME | `// TODO: Filter by Org via Scenario -> Org` |

### backend/src/modules/cost-management/lcm.service.ts
| Line | Type | Code Snippet |
|---|---|---|
| 21 | Assumption | `// Assuming receipt has lines and link to PO.` |

### backend/src/modules/epm/driver.service.ts
| Line | Type | Code Snippet |
|---|---|---|
| 16 | Assumption | `// Assuming table is plan_drivers and has code, name, value columns.` |

### backend/src/modules/epm/gl-integration.service.ts
| Line | Type | Code Snippet |
|---|---|---|
| 48 | Assumption | `// Assuming CodeCombination Breakdown: Seg1=Entity, Seg2=Dept, Seg3=Account` |

### backend/src/modules/epm/predictive-forecasting.service.ts
| Line | Type | Code Snippet |
|---|---|---|
| 127 | Assumption | `// Assuming legacy Drizzle usage had it, Drizzle schema *should* have it if I mapped properly.` |

### backend/src/modules/epm/project-finance.service.ts
| Line | Type | Code Snippet |
|---|---|---|
| 33 | Assumption | `// Assuming "5xxxx" are expense accounts. In real app, use Account Type='EXPENSE'` |

### backend/src/modules/erp/tax-reporting.service.ts
| Line | Type | Code Snippet |
|---|---|---|
| 88 | Assumption | `// We can actually call taxEngine to get the expected amount and return it to simulate perfection` |

### backend/src/modules/inventory/inventory-transaction.service.ts
| Line | Type | Code Snippet |
|---|---|---|
| 128 | Assumption | `if (lotId) filters.push(eq(schema.inventoryOnHandQuantities.lotNumber, lotId)); // Assuming lotId maps to lotNumber or ID logic needs alignment. Schema has lotNumber. Assuming simple mapping for now.` |

### backend/src/modules/inventory/reservation.service.ts
| Line | Type | Code Snippet |
|---|---|---|
| 70 | Assumption | `if (lotId) onHandFilters.push(eq(schema.inventoryOnHandQuantities.lotNumber, lotId)); // Assuming lotId maps to lotNumber` |

### backend/src/modules/inventory/serial.service.ts
| Line | Type | Code Snippet |
|---|---|---|
| 16 | Assumption | `serialNumber: data.serialNumber, // Assuming input has serialNumber` |

### backend/src/modules/procurement/ap.service.ts
| Line | Type | Code Snippet |
|---|---|---|
| 48 | Assumption | `siteId: dto.siteId, // Assuming passed in DTO` |

### backend/src/modules/procurement/requisition.service.ts
| Line | Type | Code Snippet |
|---|---|---|
| 165 | Assumption | `// Assuming for MVP we convert to 1 PO or need Logic to pick supplier.` |

### backend/src/modules/procurement/supplier.controller.ts
| Line | Type | Code Snippet |
|---|---|---|
| 3 | Assumption | `// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Assuming Auth exists` |

### shared/schema/projects.ts
| Line | Type | Code Snippet |
|---|---|---|
| 83 | TODO/FIXME | `status: varchar("status").default("todo"), // todo, in_progress, review, done` |

