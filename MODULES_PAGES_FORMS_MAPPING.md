# NexusAI - Modules, Pages, Forms & Navigation Mapping

## ACTUAL SYSTEM ARCHITECTURE

**Last Updated**: December 1, 2025  
**Status**: Production Ready

---

## 🎯 REAL NUMBERS

| Item | Count | Details |
|------|-------|---------|
| **Authenticated Core Modules** | 4 | CRM, ERP, HR, Projects |
| **Public Module Showcases** | 15 | For marketing/demo purposes |
| **Actual Forms Used** | 11 | Directly imported and used by core modules |
| **Total Form Files** | 23 | All form components in codebase |
| **Public Pages** | 9 | Landing, About, Blog, Industries, Modules, Login, Demo, etc. |
| **Authenticated Pages** | 4 | /dashboard, /crm, /erp, /hr, /projects |
| **Sub-Pages per Module** | 6-14 | Dynamic routing via /:module/:page pattern |
| **Total Industry Pack Pages** | 885+ | Configured in metadata (not all implemented) |

---

## CORE AUTHENTICATED MODULES (4 Total)

### 1. CRM Module

| Module | Base Route | Sub-Pages | Forms Used | Form Fields & Validations |
|--------|-----------|-----------|-----------|---------------------------|
| **CRM** | `/crm` | Overview, Leads, Opportunities, Accounts, Contacts, Campaigns, Pipeline, Analytics, Settings | **LeadEntryForm** | **Fields**: name (required), email (required, valid email), company (optional), score (0-100, optional), status (required, dropdown: new/qualified/converted) **Validation**: Name and Email mandatory |

---

### 2. ERP Module

| Module | Base Route | Sub-Pages | Forms Used | Form Fields & Validations |
|--------|-----------|-----------|-----------|---------------------------|
| **ERP** | `/erp` | Overview, GL, AP, AR, Inventory, PO, Quality, Suppliers, Settings | **5 Forms** | |
| | | GL | **GLEntryForm** | **Fields**: accountCode (required, unique), description (required), accountType (required, dropdown: Asset/Liability/Equity/Revenue/Expense), debitAmount (optional, numeric), creditAmount (optional, numeric) **Validation**: Code and description required; either debit or credit must be provided |
| | | AP/AR | **InvoiceEntryForm** | **Fields**: invoiceNumber (required, unique), customerId (required), amount (required, numeric, positive), dueDate (required, future date), status (required, dropdown: draft/submitted/approved/paid) **Validation**: Invoice number and amount mandatory, amount must be positive |
| | | Inventory | **AdjustmentEntryForm** | **Fields**: productCode (required), productName (required), quantity (required, numeric, positive), warehouseLocation (required), adjustmentReason (required, dropdown: Receipt/Issue/Adjustment), referenceNumber (optional) **Validation**: Code, name, quantity, location, reason required |
| | | PO | **PurchaseOrderForm** | **Fields**: poNumber (required, unique), vendorId (required), lineItems (required, array), totalAmount (required, numeric, positive), poDate (required), expectedDeliveryDate (required), status (required, dropdown: Draft/Released/Received) **Validation**: Number, vendor, line items, amount, dates required |
| | | Suppliers | **VendorEntryForm** | **Fields**: vendorName (required), vendorCode (required, unique), contactPerson (required), email (required, valid format), phone (required), address (required), paymentTerms (required, dropdown), rating (1-5, optional) **Validation**: All marked fields mandatory |

---

### 3. HR Module

| Module | Base Route | Sub-Pages | Forms Used | Form Fields & Validations |
|--------|-----------|-----------|-----------|---------------------------|
| **HR** | `/hr` | Overview, Employees, Recruitment, Payroll, Performance, Leave, Training, Succession, Engagement, Compensation, Attendance, Analytics, Policies, Onboarding | **4 Forms** | |
| | | Employees | **EmployeeEntryForm** | **Fields**: name (required), email (required, valid format, unique), department (required, dropdown), role (required), salary (required, numeric, positive), joinDate (required, past date), employmentType (required, dropdown: Full-time/Part-time/Contract) **Validation**: All marked fields mandatory |
| | | Payroll | **PayrollForm** | **Fields**: employeeId (required), payPeriod (required, format: MM/YYYY), baseSalary (required, numeric, positive), deductions (optional, numeric), bonuses (optional, numeric), netPay (calculated, readonly), status (required, dropdown: Draft/Processed/Approved/Paid) **Validation**: Employee, period, salary required |
| | | Performance | **PerformanceRatingForm** | **Fields**: employeeId (required), rating (required, 1-5 scale), reviewerName (required), reviewDate (required), comments (optional), objectives (optional, array) **Validation**: Employee, rating, reviewer, date required |
| | | Leave | **LeaveRequestForm** | **Fields**: employeeId (required), leaveType (required, dropdown: Sick/Casual/Planned/Unpaid), startDate (required, future date), endDate (required, >= startDate), numberOfDays (calculated, readonly), reason (required, text), attachments (optional) **Validation**: All marked fields mandatory; endDate >= startDate |

---

### 4. Projects Module

| Module | Base Route | Sub-Pages | Forms Used | Form Fields & Validations |
|--------|-----------|-----------|-----------|---------------------------|
| **Projects** | `/projects` | Overview, Kanban, Tasks, Resources, Sprints, Timeline, Analytics, Settings | **TaskEntryForm** | **Fields**: title (required), project (required, dropdown), assignee (required), priority (required, dropdown: Low/Medium/High/Critical), status (required, dropdown: Todo/In Progress/Review/Done), startDate (required), dueDate (required, >= startDate), description (optional), dependencies (optional), estimatedHours (optional, numeric) **Validation**: Title, project, assignee, priority, status, dates required |

---

## AUTHENTICATION HUB

| Page | Route | Authentication | Protected | Notes |
|------|-------|-----------------|-----------|-------|
| Dashboard | `/dashboard` | Required | Yes | Redirects unauthenticated users to /login |
| Login | `/login` | N/A | No | Public access, form: email (required), password (required, min 8 chars) |

---

## PUBLIC PAGES (No Authentication)

| Page Name | Route | Type | Purpose |
|-----------|-------|------|---------|
| Landing | `/` | Public | Platform overview |
| About | `/about` | Public | Company information |
| Blog | `/blog` | Public | Articles and resources |
| Use Cases | `/use-cases` | Public | Customer success stories |
| Industries | `/industries` | Public | 43 industry solutions |
| Industry Detail | `/industry/:slug` | Public | Specific industry details |
| Login | `/login` | Public | User authentication |
| Demo | `/demo` | Public | Demo environment creation |
| Module Detail | `/module/:slug` | Public | Individual module showcase |

---

## FORMS BREAKDOWN

### FORMS ACTUALLY USED (11 Total)

| Form Name | Used In Module | Purpose | File Location |
|-----------|-----------------|---------|----------------|
| **LeadEntryForm** | CRM | Create new sales leads | `client/src/components/forms/LeadEntryForm.tsx` |
| **GLEntryForm** | ERP | General ledger entries | `client/src/components/forms/GLEntryForm.tsx` |
| **InvoiceEntryForm** | ERP | Invoice management (AP/AR) | `client/src/components/forms/InvoiceEntryForm.tsx` |
| **AdjustmentEntryForm** | ERP | Inventory adjustments | `client/src/components/forms/AdjustmentEntryForm.tsx` |
| **PurchaseOrderForm** | ERP | Purchase order creation | `client/src/components/forms/PurchaseOrderForm.tsx` |
| **VendorEntryForm** | ERP | Supplier management | `client/src/components/forms/VendorEntryForm.tsx` |
| **EmployeeEntryForm** | HR | Employee onboarding | `client/src/components/forms/EmployeeEntryForm.tsx` |
| **PayrollForm** | HR | Payroll processing | `client/src/components/forms/PayrollForm.tsx` |
| **PerformanceRatingForm** | HR | Performance reviews | `client/src/components/forms/PerformanceRatingForm.tsx` |
| **LeaveRequestForm** | HR | Leave management | `client/src/components/forms/LeaveRequestForm.tsx` |
| **TaskEntryForm** | Projects | Task creation and tracking | `client/src/components/forms/TaskEntryForm.tsx` |

### FORMS NOT USED (12 Total - in codebase but not actively imported)

| Form Name | Status | Location |
|-----------|--------|----------|
| BomForm | Unused | `client/src/components/forms/BomForm.tsx` |
| BudgetEntryForm | Unused | `client/src/components/forms/BudgetEntryForm.tsx` |
| CampaignEntryForm | Unused | `client/src/components/forms/CampaignEntryForm.tsx` |
| CustomerEntryForm | Unused | `client/src/components/forms/CustomerEntryForm.tsx` |
| ExpenseEntryForm | Unused | `client/src/components/forms/ExpenseEntryForm.tsx` |
| ForecastSubmissionForm | Unused | `client/src/components/forms/ForecastSubmissionForm.tsx` |
| OpportunityForm | Unused | `client/src/components/forms/OpportunityForm.tsx` |
| ProductEntryForm | Unused | `client/src/components/forms/ProductEntryForm.tsx` |
| RequisitionForm | Unused | `client/src/components/forms/RequisitionForm.tsx` |
| ScenarioBuilderForm | Unused | `client/src/components/forms/ScenarioBuilderForm.tsx` |
| ServiceTicketForm | Unused | `client/src/components/forms/ServiceTicketForm.tsx` |
| TimesheetForm | Unused | `client/src/components/forms/TimesheetForm.tsx` |

---

## PUBLIC MODULE SHOWCASES (15 - for Marketing/Demo)

These are displayed on `/module/:slug` pages but do NOT have functional backend implementations yet.

| Module Slug | Module Name | Navigation |
|------------|------------|-----------|
| erp-core | ERP Core | `/module/erp-core` |
| crm | CRM & Sales | `/module/crm` |
| hr | Human Resources & Payroll | `/module/hr` |
| projects | Project Management | `/module/projects` |
| epm | Enterprise Performance Management | `/module/epm` |
| finance | Finance & Accounting | `/module/finance` |
| inventory | Inventory Management | `/module/inventory` |
| compliance | Governance & Compliance | `/module/compliance` |
| bpm | Business Process Management | `/module/bpm` |
| website | Website & Portal | `/module/website` |
| email | Email & Communication | `/module/email` |
| analytics | BI & Analytics | `/module/analytics` |
| ai-copilot | AI Assistant & Copilot | `/module/ai-copilot` |
| consolidation | Financial Consolidation | `/module/consolidation` |
| financial-close | Financial Close | `/module/financial-close` |

---

## NAVIGATION PATTERNS

### Authenticated User Routes
```
/login (email, password) 
  ↓
/dashboard (protected)
  ├→ /crm (optional sub-pages: /crm/:page)
  ├→ /erp (optional sub-pages: /erp/:page)
  ├→ /hr (optional sub-pages: /hr/:page)
  └→ /projects (optional sub-pages: /projects/:page)
```

### Public Visitor Routes
```
/ (landing)
  ├→ /industries → /industry/:slug
  ├→ /use-cases
  ├→ /about
  ├→ /blog
  ├→ /module/:slug (15 different modules)
  └→ /login → /dashboard
```

---

## API ENDPOINTS (Form Submissions)

| Form | Method | Endpoint | Module |
|------|--------|----------|--------|
| LeadEntryForm | POST | `/api/leads` | CRM |
| GLEntryForm | POST | `/api/ledger` | ERP |
| InvoiceEntryForm | POST | `/api/invoices` | ERP |
| AdjustmentEntryForm | POST | `/api/adjustments` | ERP |
| PurchaseOrderForm | POST | `/api/purchase-orders` | ERP |
| VendorEntryForm | POST | `/api/vendors` | ERP |
| EmployeeEntryForm | POST | `/api/employees` | HR |
| PayrollForm | POST | `/api/payroll` | HR |
| PerformanceRatingForm | POST | `/api/performance-ratings` | HR |
| LeaveRequestForm | POST | `/api/leave-requests` | HR |
| TaskEntryForm | POST | `/api/tasks` | Projects |

---

## ACCESS CONTROL MATRIX

| Route | Type | Auth Required | Sidebar | Rendering |
|-------|------|--------------|---------|-----------|
| `/dashboard` | Authenticated | Yes | Yes | AuthenticatedLayout |
| `/crm*` | Authenticated | Yes | Yes | AuthenticatedLayout |
| `/erp*` | Authenticated | Yes | Yes | AuthenticatedLayout |
| `/hr*` | Authenticated | Yes | Yes | AuthenticatedLayout |
| `/projects*` | Authenticated | Yes | Yes | AuthenticatedLayout |
| `/` | Public | No | No | PublicLayout |
| `/about`, `/blog`, `/use-cases` | Public | No | No | PublicLayout |
| `/industries`, `/industry/:slug` | Public | No | No | PublicLayout |
| `/module/:slug` | Public | No | No | PublicLayout |
| `/login` | Public | No | No | PublicLayout |
| `/demo` | Public | No | No | PublicLayout |

---

## SUMMARY STATISTICS

| Metric | Actual Count |
|--------|--------------|
| Authenticated Modules | 4 |
| Forms Currently Used | 11 |
| Forms in Codebase (Unused) | 12 |
| Public Module Showcases | 15 |
| Module Sub-Pages | 42+ |
| Public Pages | 9 |
| Configured Industry Pages | 885+ |
| Dynamic Route Patterns | 3 |
| API Endpoints for Forms | 11 |

---

## PRODUCTION READINESS

✅ **Core Authenticated Modules**: CRM, ERP, HR, Projects - All operational  
✅ **Form Implementation**: 11 forms fully implemented and working  
✅ **Authentication**: Login, session persistence, protected routes  
✅ **Public Pages**: 9 pages for marketing and demo  
✅ **Module Showcase**: 15 modules for marketing (no backend yet)  
✅ **API Integration**: All 11 forms connected to REST endpoints  
✅ **Routing**: Dynamic sub-page routing working for all modules  

---

**CORRECTED**: This document reflects ACTUAL implementation, not projected architecture.
