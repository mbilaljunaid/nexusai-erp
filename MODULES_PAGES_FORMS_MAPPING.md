# NexusAI - Modules, Pages, Forms & Navigation Mapping

## Overview
- **Total Modules**: 15 Enterprise Modules
- **Total Pages**: 885+ (809 configured in metadata)
- **Total Forms**: 23 core forms
- **Authenticated Pages**: Dashboard, CRM, ERP, HR, Projects (with sub-pages)
- **Public Pages**: Landing, About, Blog, Use Cases, Industries, Modules, Login, Demo

---

## Core Authentication Module

| Module | Page | Navigation URL | Form | Form Fields & Validations | Status |
|--------|------|-----------------|------|---------------------------|--------|
| Authentication | Login | `/login` | NA | Email (required, valid email format), Password (required, min 8 chars) | Public |
| Authentication | Dashboard | `/dashboard` | NA | Protected route - redirects to login if not authenticated | Authenticated |

---

## CRM Module

| Module | Page | Sub-Page | Navigation URL | Form | Form Fields & Validations |
|--------|------|----------|-----------------|------|---------------------------|
| CRM | Overview | Overview | `/crm` | NA | Dashboard metrics display only |
| CRM | Leads | Leads | `/crm/leads` | LeadEntryForm | **Fields**: name (required), email (required, valid format), company (optional), score (0-100, optional), status (dropdown: new/qualified/converted) **Validation**: Name and Email mandatory |
| CRM | Opportunities | Opportunities | `/crm/opportunities` | OpportunityForm | **Fields**: title (required), account (required), stage (required, dropdown), amount (required, numeric), probability (0-100%), closeDate (required) **Validation**: All marked fields mandatory, amount must be positive |
| CRM | Accounts | Accounts/Customers | `/crm/accounts` or `/crm/customers` | CustomerEntryForm | **Fields**: companyName (required), industry (required), annualRevenue (optional, numeric), numberOfEmployees (optional), contactPerson (required) **Validation**: Company name and contact person required |
| CRM | Contacts | Contacts | `/crm/contacts` | CustomerEntryForm | **Fields**: firstName (required), lastName (required), email (required, valid format), phone (optional, format validation), title (optional) **Validation**: First name, last name, email mandatory |
| CRM | Campaigns | Campaigns | `/crm/campaigns` | CampaignEntryForm | **Fields**: campaignName (required), budget (required, numeric, positive), startDate (required), endDate (required, after startDate), channel (required, dropdown: Email/SMS/Social/Direct), targetAudience (required) **Validation**: Name, budget, dates, channel mandatory; endDate > startDate |
| CRM | Pipeline | Pipeline | `/crm/pipeline` | NA | View-only pipeline visualization |
| CRM | Analytics | Sales Analytics | `/crm/analytics` | NA | Dashboard metrics and reports only |
| CRM | Settings | Settings | `/crm/settings` | NA | Configuration page for CRM settings |

---

## ERP Module

| Module | Page | Sub-Page | Navigation URL | Form | Form Fields & Validations |
|--------|------|----------|-----------------|------|---------------------------|
| ERP | Overview | Overview | `/erp` | NA | Dashboard with financial metrics |
| ERP | General Ledger | GL Accounts | `/erp/gl` | GLEntryForm | **Fields**: accountCode (required, unique), description (required), accountType (required, dropdown: Asset/Liability/Equity/Revenue/Expense), debitAmount (optional, numeric), creditAmount (optional, numeric) **Validation**: Code and description required; either debit or credit must be provided |
| ERP | AP Invoices | AP | `/erp/ap` | InvoiceEntryForm | **Fields**: invoiceNumber (required, unique), customerId (required), amount (required, numeric, positive), dueDate (required, future date), status (required, dropdown: draft/submitted/approved/paid) **Validation**: Invoice number and amount mandatory, amount must be positive |
| ERP | AR Invoices | AR | `/erp/ar` | InvoiceEntryForm | **Fields**: invoiceNumber (required, unique), customerId (required), amount (required, numeric, positive), invoiceDate (required), dueDate (required), status (required, dropdown) **Validation**: All fields mandatory, dueDate >= invoiceDate |
| ERP | Inventory | Inventory | `/erp/inventory` | AdjustmentEntryForm | **Fields**: productCode (required), productName (required), quantity (required, numeric, positive), warehouseLocation (required), adjustmentReason (required, dropdown: Receipt/Issue/Adjustment), referenceNumber (optional) **Validation**: Code, name, quantity, location, reason required |
| ERP | Purchase Orders | PO | `/erp/po` | PurchaseOrderForm | **Fields**: poNumber (required, unique), vendorId (required), lineItems (required, array), totalAmount (required, numeric, positive), poDate (required), expectedDeliveryDate (required), status (required, dropdown: Draft/Released/Received) **Validation**: Number, vendor, line items, amount, dates required |
| ERP | Quality Control | QC | `/erp/quality` | AdjustmentEntryForm | **Fields**: batchNumber (required), productCode (required), testedQuantity (required, numeric), defectiveQuantity (required, numeric <= tested), qcStatus (required, dropdown: Pass/Fail/Rework), notes (optional) **Validation**: Batch, product, quantities required |
| ERP | Suppliers | Suppliers | `/erp/suppliers` | VendorEntryForm | **Fields**: vendorName (required), vendorCode (required, unique), contactPerson (required), email (required, valid format), phone (required), address (required), paymentTerms (required, dropdown), rating (1-5, optional) **Validation**: All marked fields mandatory |
| ERP | Settings | Settings | `/erp/settings` | NA | Configuration for financial and inventory parameters |

---

## HR Module

| Module | Page | Sub-Page | Navigation URL | Form | Form Fields & Validations |
|--------|------|----------|-----------------|------|---------------------------|
| HR | Overview | Overview | `/hr` | NA | Dashboard with HR metrics |
| HR | Employees | Employees | `/hr/employees` | EmployeeEntryForm | **Fields**: name (required), email (required, valid format, unique), department (required, dropdown), role (required), salary (required, numeric, positive), joinDate (required, past date), employmentType (required, dropdown: Full-time/Part-time/Contract) **Validation**: All marked fields mandatory |
| HR | Recruitment | Recruitment | `/hr/recruitment` | NA | Recruitment dashboard and applicant tracking |
| HR | Payroll | Payroll | `/hr/payroll` | PayrollForm | **Fields**: employeeId (required), payPeriod (required, format: MM/YYYY), baseSalary (required, numeric, positive), deductions (optional, numeric), bonuses (optional, numeric), netPay (calculated, readonly), status (required, dropdown: Draft/Processed/Approved/Paid) **Validation**: Employee, period, salary required |
| HR | Performance | Performance | `/hr/performance` | PerformanceRatingForm | **Fields**: employeeId (required), rating (required, 1-5 scale), reviewerName (required), reviewDate (required), comments (optional), objectives (optional, array) **Validation**: Employee, rating, reviewer, date required |
| HR | Leave Management | Leave | `/hr/leave` | LeaveRequestForm | **Fields**: employeeId (required), leaveType (required, dropdown: Sick/Casual/Planned/Unpaid), startDate (required, future date), endDate (required, >= startDate), numberOfDays (calculated, readonly), reason (required, text), attachments (optional) **Validation**: All marked fields mandatory; endDate >= startDate |
| HR | Training | Training | `/hr/training` | NA | Training programs and course catalog |
| HR | Succession Planning | Succession | `/hr/succession` | NA | Succession planning dashboard |
| HR | Engagement | Engagement | `/hr/engagement` | NA | Employee engagement surveys and metrics |
| HR | Compensation | Compensation | `/hr/compensation` | NA | Compensation review and benchmarking |
| HR | Attendance | Attendance | `/hr/attendance` | TimesheetForm | **Fields**: employeeId (required), workDate (required, past/current date), hoursWorked (required, numeric, 0-24), breakTime (optional, numeric), notes (optional), approvalStatus (required, dropdown: Pending/Approved/Rejected) **Validation**: Employee, date, hours required |
| HR | Analytics | Analytics | `/hr/analytics` | NA | HR analytics and reporting dashboard |
| HR | Policies | Policies | `/hr/policies` | NA | HR policies and documentation |
| HR | Onboarding | Onboarding | `/hr/onboarding` | NA | Employee onboarding workflow |

---

## Projects Module

| Module | Page | Sub-Page | Navigation URL | Form | Form Fields & Validations |
|--------|------|----------|-----------------|------|---------------------------|
| Projects | Overview | Overview | `/projects` | NA | Project dashboard and metrics |
| Projects | Kanban | Kanban Board | `/projects/kanban` | NA | Kanban board view (drag-drop only) |
| Projects | Tasks | Tasks | `/projects/tasks` | TaskEntryForm | **Fields**: title (required), project (required, dropdown), assignee (required), priority (required, dropdown: Low/Medium/High/Critical), status (required, dropdown: Todo/In Progress/Review/Done), startDate (required), dueDate (required, >= startDate), description (optional), dependencies (optional), estimatedHours (optional, numeric) **Validation**: Title, project, assignee, priority, status, dates required |
| Projects | Resources | Resources | `/projects/resources` | NA | Resource allocation and capacity planning view |
| Projects | Sprints | Sprints | `/projects/sprints` | NA | Sprint planning and management |
| Projects | Timeline | Timeline | `/projects/timeline` | NA | Gantt chart timeline view |
| Projects | Analytics | Analytics | `/projects/analytics` | NA | Project analytics and reporting |
| Projects | Settings | Settings | `/projects/settings` | NA | Project configuration settings |

---

## Additional Core Forms

### Forms without direct page assignment (Used across multiple pages):

| Form Name | Purpose | Form Fields & Validations | Usage |
|-----------|---------|---------------------------|-------|
| GLEntryForm | General Ledger transactions | accountCode (req), description (req), type (req), debitAmount, creditAmount | ERP > GL Accounts |
| InvoiceEntryForm | Invoice management (AP/AR) | invoiceNumber (req, unique), customerId (req), amount (req, positive), dueDate (req), status (req) | ERP > AP, ERP > AR |
| LeadEntryForm | Lead management | name (req), email (req, valid), company (opt), score (0-100), status (req) | CRM > Leads |
| OpportunityForm | Opportunity tracking | title (req), account (req), stage (req), amount (req, positive), probability (0-100), closeDate (req) | CRM > Opportunities |
| CustomerEntryForm | Customer/Account management | companyName (req), industry (req), annualRevenue, numberOfEmployees, contactPerson (req) | CRM > Accounts |
| CampaignEntryForm | Campaign management | campaignName (req), budget (req, positive), startDate (req), endDate (req > startDate), channel (req), targetAudience (req) | CRM > Campaigns |
| EmployeeEntryForm | Employee onboarding | name (req), email (req, unique), department (req), role (req), salary (req, positive), joinDate (req, past), employmentType (req) | HR > Employees |
| PayrollForm | Payroll processing | employeeId (req), payPeriod (req), baseSalary (req, positive), deductions, bonuses, netPay (calc), status (req) | HR > Payroll |
| PerformanceRatingForm | Performance reviews | employeeId (req), rating (req, 1-5), reviewerName (req), reviewDate (req), comments, objectives | HR > Performance |
| LeaveRequestForm | Leave management | employeeId (req), leaveType (req), startDate (req, future), endDate (req >= startDate), numberOfDays (calc), reason (req) | HR > Leave |
| TaskEntryForm | Project task management | title (req), project (req), assignee (req), priority (req), status (req), startDate (req), dueDate (req >= startDate), description, dependencies, estimatedHours | Projects > Tasks |
| PurchaseOrderForm | Purchase orders | poNumber (req, unique), vendorId (req), lineItems (req, array), totalAmount (req, positive), poDate (req), expectedDeliveryDate (req), status (req) | ERP > Purchase Orders |
| VendorEntryForm | Supplier management | vendorName (req), vendorCode (req, unique), contactPerson (req), email (req, valid), phone (req), address (req), paymentTerms (req), rating (1-5) | ERP > Suppliers |
| AdjustmentEntryForm | Inventory adjustments | productCode (req), productName (req), quantity (req, positive), warehouseLocation (req), adjustmentReason (req), referenceNumber | ERP > Inventory, ERP > Quality |
| TimesheetForm | Time tracking | employeeId (req), workDate (req), hoursWorked (req, 0-24), breakTime, notes, approvalStatus (req) | HR > Attendance |
| ProductEntryForm | Product catalog | productCode (req, unique), productName (req), category (req), price (req, positive), costPrice (req, positive), stockLevel (req, numeric) | ERP > Inventory |
| BudgetEntryForm | Budget planning | budgetCode (req, unique), department (req), budgetAmount (req, positive), fiscalYear (req), status (req), owner (req) | Finance module |
| RequisitionForm | Requisition management | requisitionNumber (req, unique), department (req), itemDescription (req), quantity (req, positive), priority (req), requestDate (req), requiredByDate (req) | Procurement module |
| BomForm | Bill of Materials | bomNumber (req, unique), productCode (req), components (req, array with qty), version (req), status (req), notes | Manufacturing module |
| ServiceTicketForm | Service management | ticketNumber (req, unique), customerName (req), issueDescription (req), priority (req), status (req), assignedTo (req), targetResolutionDate (req) | Service & Support |
| ExpenseEntryForm | Expense management | expenseType (req), amount (req, positive), date (req), vendor (req), category (req), description, receipt (optional file) | Finance module |
| ForecastSubmissionForm | Financial forecasting | forecastPeriod (req), department (req), revenue (req, numeric), expense (req, numeric), assumptions (req), submittedBy (req) | Finance module |
| ScenarioBuilderForm | What-if analysis | scenarioName (req), baselineData (req), variables (req, array), assumptions (req) | Analytics module |

---

## 15 Enterprise Modules Available

### Public Module Detail Pages (via `/module/:slug`):

| Module Slug | Module Name | Core Features | Navigation URL |
|-------------|------------|----------------|-----------------|
| erp-core | ERP Core | General Ledger, Inventory, Manufacturing, Supply Chain | `/module/erp-core` |
| crm | CRM & Sales | Lead Management, Opportunity Pipeline, Account Management | `/module/crm` |
| hr | Human Resources & Payroll | Recruitment, Payroll, Performance Management, Leave | `/module/hr` |
| projects | Project Management | Kanban, Tasks, Resources, Sprints | `/module/projects` |
| epm | Enterprise Performance Management | Budgeting, Forecasting, Consolidation | `/module/epm` |
| finance | Finance & Accounting | AP/AR, Invoicing, Financial Reports | `/module/finance` |
| inventory | Inventory Management | Stock Control, Warehouse Management | `/module/inventory` |
| compliance | Governance & Compliance | Risk Management, Audit Logs, Compliance Reports | `/module/compliance` |
| bpm | Business Process Management | Workflow Builder, Process Automation | `/module/bpm` |
| website | Website & Portal | Customer Portal, Self-Service | `/module/website` |
| email | Email & Communication | Email Integration, Notifications | `/module/email` |
| analytics | BI & Analytics | Dashboard Builder, Report Builder, Data Explorer | `/module/analytics` |
| ai-copilot | AI Assistant & Copilot | Smart Recommendations, Predictive Analytics | `/module/ai-copilot` |
| consolidation | Financial Consolidation | Multi-entity Consolidation, Currency Translation | `/module/consolidation` |
| financial-close | Financial Close | Period Close Automation, Reconciliation | `/module/financial-close` |

---

## Public Pages (No Authentication Required)

| Page Name | Navigation URL | Form | Description |
|-----------|-----------------|------|-------------|
| Landing Page | `/` | NA | Enterprise platform overview |
| Industries | `/industries` | NA | 43 industry solutions showcase |
| Industry Detail | `/industry/:slug` | NA | Specific industry solution details |
| About Us | `/about` | NA | Company information |
| Blog | `/blog` | NA | Blog articles and resources |
| Use Cases | `/use-cases` | NA | Customer success stories |
| Module Showcase | `/module/:slug` | NA | Individual module features and benefits |
| Login | `/login` | NA | User authentication (Email: required, Password: required, min 8 chars) |
| Demo Management | `/demo` | Demo Request Form | Create and manage demo environments |

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **Authenticated Modules** | 5 (CRM, ERP, HR, Projects, Dashboard) |
| **Public Modules** | 15 (for showcase) |
| **Total Pages** | 885+ configured |
| **Core Executable Forms** | 23 |
| **Public Landing Pages** | 9 |
| **Dynamic Route Patterns** | `/module/:slug`, `/industry/:slug`, `/:module/:page` |
| **Form Fields (Approx)** | 200+ total field definitions |
| **Validation Rules** | 150+ validation constraints |

---

## Navigation Patterns

### Authenticated User Flow
```
/login → /dashboard → /crm | /erp | /hr | /projects
                     ↓
                  /:module → /:module/:page → FormComponent
```

### Public Visitor Flow
```
/ → /industries → /industry/:slug
  → /module/:slug
  → /about | /blog | /use-cases
  → /login → /dashboard
```

### API Endpoints (Corresponding to Forms)
```
POST /api/leads → LeadEntryForm
POST /api/invoices → InvoiceEntryForm
POST /api/employees → EmployeeEntryForm
POST /api/tasks → TaskEntryForm
POST /api/payroll → PayrollForm
POST /api/leave-requests → LeaveRequestForm
POST /api/purchase-orders → PurchaseOrderForm
POST /api/vendors → VendorEntryForm
POST /api/ledger → GLEntryForm
```

---

## Access Control

| Page Type | Authentication | Sidebar | CSS Variables | Route |
|-----------|-----------------|---------|---------------|-------|
| Authenticated | Required | Yes | Standard | `/dashboard`, `/crm*`, `/erp*`, `/hr*`, `/projects*` |
| Public | Not Required | No | Theme-Aware CSS Vars | `/`, `/about`, `/blog`, `/industries`, `/module/*`, `/industry/*`, `/login`, `/demo` |

---

**Last Updated**: December 1, 2025  
**Status**: Production Ready - All 809 pages configured, 23 forms operational, full CRUD API endpoints available
