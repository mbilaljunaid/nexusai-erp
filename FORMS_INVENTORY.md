# NexusAI Forms Inventory - Complete List by Module

## 📋 Summary
- **Total Forms**: 24
- **Total Modules**: 8
- **Status**: Mixed (some with full schema integration, others need field expansion)

---

## 🔴 CRM & SALES MODULE
**File**: `client/src/pages/CRM.tsx`
**Base URL**: `/crm`

| Form Name | File | Status | Fields | API Endpoint |
|-----------|------|--------|--------|--------------|
| Lead Entry Form | `LeadEntryForm.tsx` | ✅ UPDATED | name, email, company, score, status | `/api/leads` |
| Opportunity Form | `OpportunityForm.tsx` | ⚠️ BASIC | name, description, stage, value | `/api/opportunities` |
| Customer Entry Form | `CustomerEntryForm.tsx` | ⚠️ BASIC | name, email, company, phone | `/api/customers` |
| Campaign Entry Form | `CampaignEntryForm.tsx` | ⚠️ BASIC | name, type, budget, startDate, endDate | `/api/campaigns` |

**Search Implementation**: ✅ Smart search by name, email, company (Lead tab)

---

## 💰 ERP & FINANCE MODULE
**File**: `client/src/pages/ERP.tsx`
**Base URL**: `/erp`

| Form Name | File | Status | Fields | API Endpoint |
|-----------|------|--------|--------|--------------|
| Invoice Entry Form | `InvoiceEntryForm.tsx` | ✅ UPDATED | invoiceNumber, customerId, amount, dueDate, status | `/api/invoices` |
| GL Entry Form | `GLEntryForm.tsx` | ⚠️ BASIC | accountCode, description, accountType, balance | `/api/ledger` |
| Purchase Order Form | `PurchaseOrderForm.tsx` | ⚠️ BASIC | poNumber, vendor, amount, deliveryDate | `/api/purchase-orders` |
| Adjustment Entry Form | `AdjustmentEntryForm.tsx` | ⚠️ BASIC | accountCode, adjustmentType, amount | `/api/adjustments` |
| Vendor Entry Form | `VendorEntryForm.tsx` | ⚠️ BASIC | vendorName, email, phone, paymentTerms | `/api/vendors` |
| Expense Entry Form | `ExpenseEntryForm.tsx` | ⚠️ BASIC | description, amount, category, date | `/api/expenses` |
| Budget Entry Form | `BudgetEntryForm.tsx` | ⚠️ BASIC | department, budgetAmount, fiscalYear | `/api/budgets` |

**Search Implementation**: ✅ Smart search by invoice number, customer, amount (AP tab)

---

## 👥 HR & TALENT MANAGEMENT MODULE
**File**: `client/src/pages/HR.tsx`
**Base URL**: `/hr`

| Form Name | File | Status | Fields | API Endpoint |
|-----------|------|--------|--------|--------------|
| Employee Entry Form | `EmployeeEntryForm.tsx` | ✅ UPDATED | name, email, department, role, salary | `/api/employees` |
| Payroll Form | `PayrollForm.tsx` | ⚠️ BASIC | employeeId, baseSalary, deductions, taxAmount | `/api/payroll` |
| Performance Rating Form | `PerformanceRatingForm.tsx` | ⚠️ BASIC | employeeId, rating, feedback, period | `/api/performance` |
| Leave Request Form | `LeaveRequestForm.tsx` | ⚠️ BASIC | employeeId, leaveType, startDate, endDate | `/api/leave-requests` |
| Timesheet Form | `TimesheetForm.tsx` | ⚠️ BASIC | employeeId, weekStartDate, hoursPerDay | `/api/timesheets` |

**Search Implementation**: ✅ Smart search by name, email, department (Employee tab)

---

## 📦 PROJECTS & TASK MANAGEMENT MODULE
**File**: `client/src/pages/Projects.tsx`
**Base URL**: `/projects`

| Form Name | File | Status | Fields | API Endpoint |
|-----------|------|--------|--------|--------------|
| Task Entry Form | `TaskEntryForm.tsx` | ⚠️ BASIC | title, description, assignedTo, dueDate, priority | `/api/tasks` |

**Search Implementation**: ❌ Not implemented yet

---

## 🏭 MANUFACTURING MODULE
**File**: `client/src/pages/Manufacturing.tsx`
**Base URL**: `/manufacturing`

| Form Name | File | Status | Fields | API Endpoint |
|-----------|------|--------|--------|--------------|
| BOM Form | `BomForm.tsx` | ⚠️ BASIC | bomNumber, productId, lineItems, version | `/api/bom` |

**Search Implementation**: ❌ Not implemented yet

---

## 🛠️ SERVICE & SUPPORT MODULE
**File**: `client/src/pages/Service.tsx`
**Base URL**: `/service`

| Form Name | File | Status | Fields | API Endpoint |
|-----------|------|--------|--------|--------------|
| Service Ticket Form | `ServiceTicketForm.tsx` | ⚠️ BASIC | ticketId, customerId, issue, priority, status | `/api/service-tickets` |

**Search Implementation**: ❌ Not implemented yet
**Status**: No forms currently imported in Service page (needs implementation)

---

## 📊 MARKETING MODULE
**File**: `client/src/pages/Marketing.tsx`
**Base URL**: `/marketing`

| Form Name | File | Status | Fields | API Endpoint |
|-----------|------|--------|--------|--------------|
| Campaign Entry Form | `CampaignEntryForm.tsx` | ⚠️ BASIC | name, type, budget, startDate, endDate | `/api/campaigns` |

**Search Implementation**: ❌ Not implemented yet

---

## 💼 FINANCE MODULE
**File**: `client/src/pages/Finance.tsx`
**Base URL**: `/finance`

| Form Name | File | Status | Fields | API Endpoint |
|-----------|------|--------|--------|--------------|
| GL Entry Form | `GLEntryForm.tsx` | ⚠️ BASIC | accountCode, description, accountType, balance | `/api/ledger` |
| Invoice Entry Form | `InvoiceEntryForm.tsx` | ✅ UPDATED | invoiceNumber, customerId, amount, dueDate, status | `/api/invoices` |
| Expense Entry Form | `ExpenseEntryForm.tsx` | ⚠️ BASIC | description, amount, category, date | `/api/expenses` |
| Budget Entry Form | `BudgetEntryForm.tsx` | ⚠️ BASIC | department, budgetAmount, fiscalYear | `/api/budgets` |

**Search Implementation**: ❌ Not implemented yet

---

## 📄 ADDITIONAL FORMS (Not Yet Assigned to Modules)

| Form Name | File | Status | Notes |
|-----------|------|--------|-------|
| Requisition Form | `RequisitionForm.tsx` | ⚠️ BASIC | PR submission form |
| Scenario Builder Form | `ScenarioBuilderForm.tsx` | ⚠️ BASIC | What-if analysis |
| Forecast Submission Form | `ForecastSubmissionForm.tsx` | ⚠️ BASIC | Financial forecasting |
| Product Entry Form | `ProductEntryForm.tsx` | ⚠️ BASIC | Product master data |

---

## 📈 Form Status Legend

| Status | Meaning | Next Step |
|--------|---------|-----------|
| ✅ UPDATED | Full schema integration, working API connection, proper validation | Deploy & test |
| ⚠️ BASIC | Minimal fields, generic form structure, needs schema alignment | Expand fields to match DB schema |
| ❌ NOT IMPLEMENTED | Form file exists but not imported or used in any module | Add to module pages |

---

## 🎯 Priority Fixes Needed

### High Priority (Core Modules)
1. **ERP GL Entry Form** - Expand to include all ledger fields (account hierarchy, GL codes, balances)
2. **ERP Purchase Order Form** - Add line items, shipping details, tax calculations
3. **HR Payroll Form** - Expand with complete payroll cycle fields (gross, deductions, net)
4. **Projects Task Form** - Add project association, subtasks, time tracking

### Medium Priority (Secondary Modules)
5. Manufacturing BOM Form - Add material breakdown, quantities, unit costs
6. Service Ticket Form - Add to Service module page, implement search
7. Marketing Campaign Form - Expand with channels, targeting, budget allocation

### Low Priority (Nice to Have)
8. Product Entry, Requisition, Scenario Builder forms
9. Additional search implementations for remaining modules

---

## 🔧 Database Schema Alignment

All forms should map to these core entities:

### Leads
```typescript
{
  id: varchar (PK)
  name: varchar
  email: varchar
  company: varchar
  score: numeric
  status: varchar
  createdAt: timestamp
}
```

### Invoices
```typescript
{
  id: varchar (PK)
  invoiceNumber: varchar
  customerId: varchar
  amount: numeric
  dueDate: timestamp
  status: varchar
  createdAt: timestamp
}
```

### Employees
```typescript
{
  id: varchar (PK)
  name: varchar
  email: varchar
  department: varchar
  role: varchar
  salary: numeric
  createdAt: timestamp
}
```

---

## ✨ Recently Completed

✅ LeadEntryForm - Full schema integration, API working  
✅ InvoiceEntryForm - Full schema integration, API working  
✅ EmployeeEntryForm - Full schema integration, API working  
✅ CRM Search - Smart filtering by name, email, company  
✅ ERP Search - Smart filtering by invoice number, customer, amount  
✅ HR Search - Smart filtering by name, email, department  
✅ Dashboard - Connected to real `/api/leads` and `/api/invoices` data  

---

**Last Updated**: November 30, 2025  
**Total Forms**: 24  
**Fully Integrated**: 3  
**Needs Work**: 21
