# NexusAI Enterprise Platform — Complete Form Designs

## Design Principles for All Forms

**Configuration Forms** (Admin/Setup):
- Left sidebar with sections/categories
- Main area with structured fields
- Save/Cancel buttons at bottom
- Audit trail of changes
- Versioning support

**Data Entry Forms** (User workflows):
- Quick entry + Advanced tabs
- AI auto-suggestions inline
- Required field validation
- Bulk upload support
- Save as template option

---

## 1. ERP / FINANCE MODULE FORMS

### Configuration Forms

#### 1.1 Chart of Accounts Setup
```
[Form Type: Configuration]

Sections (Left Sidebar):
- Chart Structure
- Account Templates
- Hierarchies
- Bulk Import

Main Content:
[Add Account Button]

Account Entry (Expandable rows):
├─ Account Code (Text, max 20, required, unique)
├─ Account Name (Text, max 100, required)
├─ Account Type (Dropdown: Asset, Liability, Equity, Revenue, Expense)
├─ Category (Dropdown: Current/Non-current for Assets, etc.)
├─ Parent Account (Hierarchical selector - optional)
├─ Description (Textarea, 500 chars)
├─ Account Status (Radio: Active/Inactive/Archived)
├─ Balance Type (Radio: Debit/Credit)
├─ Default Tax Code (Dropdown)
├─ Enable for GL Entry (Toggle)
├─ Enable for Budget (Toggle)
├─ Reporting Category (Multi-select: P&L, Balance Sheet, Cash Flow)
└─ Notes (Textarea, 250 chars)

Right Sidebar:
- AI Suggestions: "Copy Apple Inc. Chart" button
- Recent Templates (Quick select)
- Validation Warnings (Real-time)

Bottom:
[Import from CSV] [Save Chart] [Save as Template] [Cancel]
```

#### 1.2 Tax Rules Configuration
```
[Form Type: Configuration]

Sections:
- Tax Rates by Jurisdiction
- Tax Code Mapping
- Filing Requirements
- Tax Groups

Tax Rule Entry (Table view):
├─ Tax Code (Text, required, unique)
├─ Tax Name (Text, required)
├─ Jurisdiction (Dropdown: US, UK, EU, etc.)
├─ Region/State (Dropdown, conditional on jurisdiction)
├─ Tax Type (Dropdown: VAT, GST, Sales Tax, Income Tax, etc.)
├─ Tax Rate (%) (Number, 0-100, 2 decimals, required)
├─ Effective From (Date picker)
├─ Effective To (Date picker, optional)
├─ Applies To (Multi-select: Goods, Services, Both)
├─ GL Account for Tax Payable (Account selector)
├─ GL Account for Tax Expense (Account selector)
├─ Filing Frequency (Dropdown: Monthly, Quarterly, Annual)
├─ Filing Due Days (Number)
├─ Status (Radio: Active/Inactive)
└─ Notes (Textarea, 250 chars)

AI Features:
- "Fetch current tax rates from IRS/HMRC" button
- Auto-suggest GL accounts based on tax type

Bottom:
[Add Row] [Bulk Import] [Save] [Cancel]
```

#### 1.3 Approval Workflows
```
[Form Type: Configuration]

Sections:
- Workflow Name
- Triggers & Conditions
- Approval Steps
- Notifications

Workflow Details:
├─ Workflow Name (Text, required)
├─ Description (Textarea)
├─ Document Type (Dropdown: GL Entry, Invoice, PO, JE, etc.)
├─ Trigger Condition (Dropdown: Amount > X, Status = Y, Requestor = Z)
  └─ Trigger Value (Number/Text/User selector, conditional)

Approval Steps (Expandable rows):
│
├─ Step 1:
│  ├─ Step Name (Text)
│  ├─ Approver (User Multi-select OR Role multi-select)
│  ├─ Approval Required # (Number, default 1)
│  ├─ Parallel/Sequential (Radio buttons)
│  ├─ Escalation Days (Number, default 5)
│  ├─ Escalate To (User/Role selector)
│  └─ Notification Template (Dropdown)
│
└─ [+ Add Approval Step]

Status Options (Checkbox list):
├─ Auto-approve if < amount (Number, optional)
├─ Allow requestor to recall (Toggle)
├─ Require rejection reason (Toggle)
└─ Send notifications (Toggle)

Bottom:
[Test Workflow] [Save] [Save as Template] [Cancel]
```

#### 1.4 Cost Centers Configuration
```
[Form Type: Configuration]

Sections:
- Cost Center Hierarchy
- Department Mapping
- Manager Assignment
- Budget Allocation

Cost Center Details (Tree view on left):
├─ Cost Center Code (Text, max 10, required, unique)
├─ Cost Center Name (Text, required)
├─ Department (Dropdown)
├─ Manager (User selector)
├─ Parent Cost Center (Hierarchical selector, optional)
├─ Cost Center Type (Dropdown: Department, Project, Function, Region)
├─ Status (Radio: Active/Inactive)
├─ Budget Owner (User selector)
├─ Allocations (Percentage breakdown to other centers, optional)
└─ Description (Textarea, 250 chars)

Right Sidebar:
- Hierarchy preview
- Budget allocation visualization
- Team members list

Bottom:
[Add Child Center] [Import Hierarchy] [Save] [Cancel]
```

#### 1.5 Inventory Rules Configuration
```
[Form Type: Configuration]

Sections:
- Valuation Methods
- Stock Categories
- Reorder Rules
- Warehouse Policies

Inventory Rule Entry (Table):
├─ Item Category (Dropdown)
├─ SKU Pattern (Text, regex optional)
├─ Valuation Method (Radio: FIFO, LIFO, Weighted Avg, Standard Cost)
├─ Standard Cost (Number, conditional if Standard Cost selected)
├─ Reorder Point (Number)
├─ Reorder Quantity (Number)
├─ Lead Time Days (Number)
├─ Max Stock Level (Number)
├─ Safety Stock (Number)
├─ Primary Warehouse (Dropdown)
├─ Track Serial Number (Toggle)
├─ Track Batch Number (Toggle)
├─ Shelf Life Days (Number, optional)
├─ Allows Negative Stock (Toggle)
├─ Cost Center for Variance (Dropdown)
└─ Notes (Textarea)

AI Features:
- "Suggest reorder points based on historical demand" button
- "Analyze slow-moving inventory" link

Bottom:
[Analyze Stock] [Import Rules] [Save] [Cancel]
```

### Data Entry Forms

#### 1.6 GL Entry (Journal Entry)
```
[Form Type: Data Entry | Quick Entry / Advanced tabs]

QUICK ENTRY TAB:
├─ Entry Date (Date picker, default today, required)
├─ Period (Dropdown, auto-populated based on date)
├─ Journal (Dropdown: General, Payroll, Sales, Purchase, etc.)
├─ Reference (Text, max 30, optional)
├─ Description (Text, max 200, required)
│
Lines (Expandable table, min 2 rows):
│ ├─ Account (Account selector with search, required)
│ ├─ Debit (Number, 2 decimals)
│ ├─ Credit (Number, 2 decimals)
│ ├─ Cost Center (Dropdown, optional)
│ └─ Memo (Text, 100 chars)
│
├─ Entry Notes (Textarea, 500 chars)
├─ Attachments (File uploader, max 5 files)
│
AI Features:
├─ "AI auto-suggest accounts" button (shows top 3 matches)
├─ Debit/Credit validation in real-time
└─ "Post Journal" button with validation

ADVANCED TAB:
├─ Same fields as Quick Entry
├─ Additional fields:
│  ├─ Department (Dropdown)
│  ├─ Project (Dropdown, optional)
│  ├─ Cost Allocation (Multi-select with percentages)
│  └─ Inter-company Flag (Toggle)
│
└─ [Save as Template] [Save Draft] [Post Journal] [Cancel]

Right Sidebar:
- Debit/Credit balance indicator
- Account balance preview (on hover)
- AI Insights: "Similar entries posted last month"
```

#### 1.7 Invoice Entry (AP)
```
[Form Type: Data Entry]

Header Section:
├─ Vendor (Vendor search/selector, required)
├─ Invoice Number (Text, required, check duplicate)
├─ Invoice Date (Date picker, required)
├─ Due Date (Date picker, required)
├─ PO Number (PO selector, optional, auto-fill from PO)

Amount Section:
├─ Amount (Calculated, read-only)
├─ Tax Amount (Calculated/Manual toggle)
├─ Tax Code (Dropdown, optional)
├─ Discount (Number, optional, with reason dropdown)
└─ Net Amount (Calculated, read-only)

Line Items (Expandable rows):
│ ├─ GL Account (Account selector, required)
│ ├─ Description (Text, required)
│ ├─ Quantity (Number, optional)
│ ├─ Unit Price (Number, optional)
│ ├─ Amount (Number, required)
│ ├─ Cost Center (Dropdown, optional)
│ └─ Project (Dropdown, optional)
│
├─ [+ Add Line Item]

Additional Details:
├─ Payment Terms (Dropdown: Net 30, Net 60, etc.)
├─ Payment Method (Dropdown: Check, Wire, ACH, Card)
├─ Currency (Dropdown, default from vendor)
├─ Notes (Textarea, 500 chars)
├─ Attachments (File uploader - invoice PDF)

AI Features:
├─ "Extract from PDF" button (OCR invoice data)
├─ "Match to Open PO" button
└─ Duplicate invoice warning

Bottom:
[Save Draft] [Submit for Approval] [Post] [Cancel]

Right Sidebar:
- Vendor balance
- Recent invoices from vendor
- Payment history
```

#### 1.8 Purchase Order (PO) Entry
```
[Form Type: Data Entry]

Header:
├─ Vendor (Vendor selector, required)
├─ PO Number (Auto-generated or manual, unique)
├─ PO Date (Date picker, default today)
├─ Required By Date (Date picker, required)
├─ Delivery Address (Address selector/editor)

Line Items:
│ ├─ Item Code (Item/Product selector)
│ ├─ Description (Text, auto-filled from item)
│ ├─ Quantity (Number, required)
│ ├─ Unit (Dropdown: EA, BOX, PALLET, etc.)
│ ├─ Unit Price (Number, required)
│ ├─ Line Total (Calculated)
│ └─ Cost Center (Dropdown)
│
├─ [+ Add Line Item] [Import from BOM]

Totals:
├─ Subtotal (Calculated)
├─ Tax (Calculated)
├─ Shipping (Number, optional)
├─ Other Charges (Number, optional)
└─ Grand Total (Calculated)

Additional:
├─ Payment Terms (Dropdown)
├─ Shipping Method (Dropdown)
├─ Special Instructions (Textarea)
├─ Attachments (Files)

AI Features:
- "Find best price from alternative vendors" link
- "Suggest quantity based on stock levels" button

Bottom:
[Save Draft] [Send to Vendor (Email)] [Approve] [Cancel]
```

---

## 2. EPM (ENTERPRISE PERFORMANCE MANAGEMENT) FORMS

### Configuration Forms

#### 2.1 Planning Templates
```
[Form Type: Configuration]

Template Details:
├─ Template Name (Text, required, unique)
├─ Description (Textarea)
├─ Industry (Dropdown, optional)
├─ Department (Dropdown, optional)
├─ Template Type (Radio: Budget, Forecast, Scenario)
├─ Version (Auto-incremented, read-only)

Structure:
├─ Planning Period (Dropdown: Monthly, Quarterly, Annual)
├─ Number of Periods (Number, default 12)
├─ Budget Type (Multi-select: Revenue, Headcount, CAPEX, OPEX, etc.)

Assumptions Section:
│ ├─ Revenue Growth % (Number)
│ ├─ Cost Inflation % (Number)
│ ├─ Headcount Growth % (Number)
│ ├─ Cost per Employee (Number)
│ └─ [+ Add Assumption]

Locked/Editable Cells:
├─ Lock certain accounts (Multi-select)
├─ Lock certain cost centers (Multi-select)
├─ Restrict to certain roles (Role multi-select)

Default Assignments:
├─ Budget Owner (User selector)
├─ Approver (User selector)
├─ Notification Recipients (User multi-select)

Bottom:
[Test Template] [Save as Draft] [Publish] [Cancel]
```

#### 2.2 Allocation Rules
```
[Form Type: Configuration]

Rule Details:
├─ Rule Name (Text, required)
├─ Description (Textarea)
├─ Allocation Type (Dropdown: By Headcount, By Revenue, By Cost, Custom)
├─ Frequency (Dropdown: Monthly, Quarterly, Annual)
├─ Active (Toggle)

Rule Logic (Visual builder):
│
├─ IF (Condition dropdown):
│  ├─ Department = [Multi-select]
│  ├─ Cost Center = [Multi-select]
│  └─ Period = [Date range]
│
├─ THEN Allocate (Amount/Percentage):
│  ├─ Allocation Base (Dropdown: Revenue, Headcount, Units, etc.)
│  ├─ Amount (Number, conditional if fixed allocation)
│  └─ Distribution Method (Dropdown: Equal Split, Proportional, Custom)
│
└─ TO (Target accounts):
   ├─ Cost Centers (Multi-select, required)
   └─ Allocation percentages (Number array, must sum to 100%)

Audit Trail:
├─ Last Run Date (Read-only)
├─ Records Allocated (Read-only counter)
└─ Next Scheduled Run (Read-only)

Bottom:
[Test Rule] [Schedule] [Save] [Cancel]
```

#### 2.3 KPI Definitions
```
[Form Type: Configuration]

KPI Details:
├─ KPI Name (Text, required, unique)
├─ KPI ID (Auto-generated, read-only)
├─ Description (Textarea)
├─ Category (Dropdown: Financial, Operational, Customer, Employee)
├─ Unit (Dropdown: $, %, #, Days, Hours, etc.)

Formula:
├─ Formula Editor (Visual/Text toggle):
│  └─ Drag-drop fields or write formula
│      Example: (Revenue - COGS) / Revenue
├─ Data Source (Dropdown: GL, Sales, HR, Projects, etc.)
├─ Recalculation Frequency (Dropdown: Real-time, Daily, Weekly, Monthly)

Targets & Benchmarks:
├─ Target Value (Number)
├─ Prior Year Value (Number, auto-filled)
├─ Industry Benchmark (Number, optional)
├─ Variance Threshold (Number, for alerts)
├─ Responsible Party (User selector)

Comparisons:
├─ Compare to Forecast (Toggle)
├─ Compare to Prior Year (Toggle)
├─ Compare to Budget (Toggle)
├─ Compare to Prior Month (Toggle)

Visualizations:
├─ Chart Type (Dropdown: Line, Bar, Gauge, etc.)
├─ Default Period (Dropdown: YTD, Last 12M, etc.)
└─ Decimal Places (Number, default 2)

Bottom:
[Test KPI] [Save] [Save as Template] [Cancel]
```

### Data Entry Forms

#### 2.4 Budget Entry
```
[Form Type: Data Entry | Quick Entry / Advanced]

QUICK ENTRY TAB:

Header:
├─ Budget Cycle (Dropdown, required)
├─ Department (Dropdown, required)
├─ Cost Center (Cascading dropdown, required)
├─ Budget Version (Read-only)
├─ Period (Dropdown: Monthly, Quarterly, Annual)

Comparison Columns (Read-only):
├─ Last Year Actual (Calculated)
├─ Current YTD Actual (Calculated)
├─ Budget vs Actual % (Calculated)

Budget Entry Grid (Monthly or Quarterly):
│ ├─ Jan | Feb | Mar | ... | Dec | Annual Total
│ ├─ GL Account 1:  [Input] | [Input] | [Input] | ... | [Total]
│ ├─ GL Account 2:  [Input] | [Input] | [Input] | ... | [Total]
│ └─ ... (with AI suggestions for growth rates)

AI Features:
├─ "Suggest based on +5% growth" button per row
├─ "Copy last year" button
└─ "AI-optimize allocation" for auto-distribution

Notes/Assumptions:
├─ Budget Narrative (Textarea, 1000 chars)
├─ Key Assumptions (Multi-line text)
└─ Attachments (Supporting docs)

ADVANCED TAB:
├─ All Quick Entry fields
├─ Additional cost center breakdowns
├─ Project allocation (if applicable)
├─ Detailed line items with descriptions

Bottom:
[Save Draft] [Request Review] [Submit] [Cancel]

Right Sidebar:
- Budget status (% complete)
- Approvers queue
- Deadline countdown
```

#### 2.5 Forecast Submission
```
[Form Type: Data Entry]

Header:
├─ Forecast Cycle (Dropdown, required)
├─ Forecast Quarter (Dropdown, auto-calculated)
├─ Department (Dropdown, required)
├─ Forecast Scenario (Radio: Optimistic, Base, Conservative)
├─ Submitted by (Auto-filled user)

Forecast Data (Similar grid to Budget Entry):
│ ├─ Previous Forecast Values (Read-only)
│ ├─ Current Quarter actuals (Read-only)
│ ├─ Q1 Forecast [Input]
│ ├─ Q2 Forecast [Input]
│ ├─ Q3 Forecast [Input]
│ └─ Q4 Forecast [Input]

Variance Explanations (Auto-required if >5% variance):
├─ Line Item (Read-only)
├─ Variance % (Read-only, calculated)
├─ Explanation (Textarea, required if >5%)
└─ Root Cause (Dropdown: Market, Internal, Timing, Other)

Confidence Level:
├─ Overall Confidence (Radio: High, Medium, Low)
└─ Confidence Justification (Textarea)

Additional Info:
├─ Key Drivers (Textarea)
├─ Risks (Textarea)
├─ Opportunities (Textarea)
└─ Attachments (Supporting analysis)

Bottom:
[Save Draft] [Submit] [Submit & Lock] [Cancel]
```

#### 2.6 Scenario Upload
```
[Form Type: Data Entry | Upload / Manual Entry tabs]

UPLOAD TAB:
├─ Scenario Name (Text, required)
├─ Scenario Description (Textarea)
├─ File Upload (CSV/Excel uploader)
├─ Column Mapping (Auto-detect or manual mapping)
├─ Preview (Table preview of uploaded data)
│
└─ [Validate] [Import]

MANUAL ENTRY TAB:
├─ Scenario Details (same as upload)
├─ Adjustment Type (Radio: Percentage / Absolute)
├─ Adjustment Value (Number, required)
├─ Apply To (Multi-select: Accounts, Cost Centers, Departments)

Scenario Builder (Visual):
├─ Base Scenario (Dropdown selector)
├─ Adjustment Options:
│  ├─ Revenue adjustment (Number)
│  ├─ COGS adjustment (Number)
│  ├─ OPEX adjustment (Number)
│  └─ Tax rate adjustment (Number)
│
├─ Driver-based (Conditional rules):
│  ├─ IF Revenue +10% THEN COGS adjusts +6%
│  └─ [+ Add Driver Rule]

Results Preview:
├─ Impact on Revenue (Calculated)
├─ Impact on Gross Profit (Calculated)
├─ Impact on EBITDA (Calculated)
├─ Impact on Net Income (Calculated)
└─ Margin % changes (Calculated)

Bottom:
[Run Sensitivity] [Compare] [Save as Scenario] [Cancel]
```

---

## 3. CRM / SALES FORMS

### Configuration Forms

#### 3.1 Sales Process Configuration
```
[Form Type: Configuration]

Process Details:
├─ Process Name (Text, required)
├─ Description (Textarea)
├─ Industry (Dropdown, optional)

Sales Stages (Ordered list, drag-to-reorder):
│ ├─ Stage 1 Name: [Text input]
│ │  ├─ Probability % [Number, 0-100]
│ │  ├─ Expected Duration [Number, days]
│ │  ├─ Required Fields [Multi-select checkboxes]
│ │  └─ Auto-Actions on Stage Entry [Multi-select]
│ │
│ ├─ Stage 2 Name: [Text input]
│ └─ ... (repeat for all stages)
│
└─ [+ Add Stage] [Remove Stage]

Workflows:
├─ Approval Required [Toggle]
├─ Approval Threshold (Amount, conditional)
├─ Approvers (Role/User multi-select, conditional)
├─ Escalation Rules (Dropdown)

Notifications:
├─ Notify Owner on Stage Change [Toggle]
├─ Notify Manager [Toggle]
├─ Custom Notification Rules [Checkbox list]

Bottom:
[Save] [Make Default] [Cancel]
```

#### 3.2 Territory Rules
```
[Form Type: Configuration]

Territory Details:
├─ Territory Name (Text, required)
├─ Manager (User selector)
├─ Region (Dropdown or map selector)
├─ Geographic Boundaries (Map/coordinates or text)
├─ Potential Revenue (Number)

Rules (Visual builder):
├─ Assign leads by: (Radio options)
│  ├─ Industry
│  ├─ Company Size
│  ├─ Geographic Region
│  └─ Custom Field
│
├─ Assignment Method:
│  ├─ Round Robin (Radio)
│  ├─ Capacity Based (Radio)
│  └─ Custom Logic (Radio)

Rep Assignment:
├─ Sales Reps (User multi-select with allocation %)
├─ Accounts (Account multi-select, optional)
├─ Products (Product multi-select, optional)

Targets:
├─ Territory Target (Number)
├─ Number of Reps (Number)
├─ Quota per Rep (Calculated)

Bottom:
[Test Rules] [Save] [Cancel]
```

#### 3.3 Discount Rules
```
[Form Type: Configuration]

Rule Details:
├─ Rule Name (Text, required)
├─ Description (Textarea)
├─ Active (Toggle)
├─ Effective From (Date)
├─ Effective To (Date, optional)

Conditions (Visual builder):
├─ IF (Dropdown: Product, Customer, Order Amount, Qty, etc.)
├─ Condition (Dropdown: Equals, >, <, Contains, In List, etc.)
├─ Value (Input, conditional on condition type)
│
└─ AND/OR (Radio, repeat for multiple conditions)

Discount:
├─ Discount Type (Radio: Percentage / Absolute Amount)
├─ Discount Value (Number, required)
├─ Min Discount (Number, optional)
├─ Max Discount (Number, optional)

Approvals:
├─ Requires Approval if > (Number, optional)
├─ Approver (User/Role selector, conditional)

Limitations:
├─ Max Uses (Number, optional)
├─ Max per Customer (Number, optional)
├─ Exclude Reps (User multi-select, optional)
└─ Stackable (Toggle)

Bottom:
[Test Discount] [Save] [Duplicate] [Cancel]
```

#### 3.4 Product Catalog
```
[Form Type: Configuration]

Product Details:
├─ Product Code (Text, required, unique)
├─ Product Name (Text, required)
├─ Description (Textarea)
├─ Category (Dropdown/Tree selector)
├─ Status (Radio: Active, Inactive, Discontinued)

Pricing:
├─ List Price (Number, required)
├─ Standard Cost (Number, optional)
├─ Margin % (Calculated)
├─ Discount % Allowed (Number)
├─ Volume Discounts (Expandable table)

Variants (Optional):
├─ Variant 1: [Size, Color, etc.]
├─ Price Override (Number, optional per variant)
└─ [+ Add Variant]

Sales Info:
├─ Sales Family (Dropdown)
├─ Related Products (Product multi-select)
├─ Document Attachment (Template, contract, etc.)

Support:
├─ Service Hours (Number)
├─ Warranty Period (Number, months)
├─ Support Plan (Dropdown)

Bottom:
[Save] [Save & Add Another] [Cancel]
```

### Data Entry Forms

#### 3.5 Lead Entry
```
[Form Type: Data Entry | Quick / Advanced]

QUICK ENTRY:
├─ First Name (Text, required)
├─ Last Name (Text, required)
├─ Email (Email, required, validate)
├─ Phone (Phone, required)
├─ Company (Company selector or new company entry)
├─ Job Title (Text)
├─ Lead Source (Dropdown, required)
├─ Status (Dropdown: New, Contacted, Qualified, etc.)

Score & Value:
├─ Estimated Deal Value (Number, optional)
├─ Lead Score (Read-only, AI-calculated)
└─ Next Action (Dropdown: Call, Email, Meeting, etc.)

ADVANCED TAB:
├─ All Quick fields
├─ Industry (Dropdown)
├─ Number of Employees (Number)
├─ Website URL (URL)
├─ LinkedIn Profile (URL)
├─ Address (Full address)
├─ Best Contact Time (Time picker)
├─ Language (Dropdown)
├─ Preferred Communication (Radio: Email, Phone, SMS)
├─ Tags (Multi-select)
├─ Assigned To (User selector)
├─ Notes (Textarea)
├─ Attachments (Files)

AI Features:
├─ "Auto-score lead" button (shows scoring explanation)
├─ "Find similar leads" link
└─ AI Score badge

Bottom:
[Save Draft] [Save & Convert to Opportunity] [Cancel]
```

#### 3.6 Opportunity Entry
```
[Form Type: Data Entry]

Header:
├─ Opportunity Name (Text, required)
├─ Account (Account selector, required)
├─ Stage (Dropdown, required)
├─ Probability % (Number or auto-calculated)
├─ Amount (Currency, required)

Key Details:
├─ Close Date (Date, required)
├─ Expected Revenue (Calculated: Amount × Probability)
├─ Owner (User selector)
├─ Competition (Multi-select: Competitor names)

Products/Services:
│ ├─ Product (Product selector)
│ ├─ Quantity (Number)
│ ├─ Unit Price (Number)
│ └─ Line Total (Calculated)
│
└─ [+ Add Line Item]

Custom Fields:
├─ Project Type (Dropdown)
├─ Decision Process (Radio: Individual, Committee, etc.)
├─ Decision Criteria (Multi-select)
├─ Pain Points (Textarea)

Risk & Mitigation:
├─ Risk Level (Radio: Low, Medium, High)
├─ Risk Description (Textarea)
├─ Mitigation Plan (Textarea)

Activities:
├─ Next Step (Textarea, required)
├─ Next Step Date (Date picker)
├─ Notes (Textarea)

Bottom:
[Save Draft] [Save & Send Proposal] [Cancel]

Right Sidebar:
- Account details
- Contact info
- Recent activities
- AI Recommendations: "Similar opp closed in 14 days"
```

#### 3.7 Account Entry
```
[Form Type: Data Entry]

Header:
├─ Account Name (Text, required, unique)
├─ Account Number (Auto-generated or manual)
├─ Type (Dropdown: Prospect, Customer, Vendor, Partner)

Company Details:
├─ Industry (Dropdown)
├─ Website URL (URL)
├─ LinkedIn URL (URL)
├─ Parent Account (Account selector, optional)
├─ Number of Employees (Number)
├─ Annual Revenue (Currency)
├─ Account Status (Radio: Active, Inactive, Dissolved)

Contact & Address:
├─ Billing Address (Address fields)
├─ Shipping Address (Address fields)
├─ Main Phone (Phone)
├─ Main Email (Email)
├─ Tax ID (Text)

Business Details:
├─ Fiscal Year End (Date)
├─ Account Owner (User selector)
├─ Preferred Contact Method (Dropdown)
├─ Business Hours (Time range)
├─ Primary Product Category (Dropdown)
├─ Annual Contract Value (Currency)

Relationships:
├─ Related Accounts (Account multi-select)
├─ Competitors (Account multi-select)
├─ Partners (Account multi-select)

Health & Engagement:
├─ Account Health (Radio: Healthy, At Risk, Inactive)
├─ Engagement Level (Radio: High, Medium, Low)
├─ Last Interaction Date (Date picker)

Notes & Documents:
├─ Description (Textarea)
├─ Attachments (Files)

Bottom:
[Save] [Add Contact] [Create Opportunity] [Cancel]
```

#### 3.8 Contact Entry
```
[Form Type: Data Entry]

Header:
├─ First Name (Text, required)
├─ Last Name (Text, required)
├─ Account (Account selector, required)

Contact Info:
├─ Email (Email, required)
├─ Phone (Phone)
├─ Mobile (Phone)
├─ Office Location (Dropdown/Text)

Professional Info:
├─ Job Title (Text, required)
├─ Department (Dropdown)
├─ Reports To (Contact selector, optional)
├─ Function (Dropdown: Technical, Financial, User, etc.)

Communication Preferences:
├─ Preferred Method (Dropdown: Email, Phone, SMS)
├─ Best Time to Contact (Time)
├─ Language (Dropdown)
├─ Do Not Contact (Toggle)

Engagement:
├─ Lead Score (Read-only)
├─ Engagement Level (Radio)
├─ Last Activity (Date, read-only)

Relationships:
├─ Decision Influence (Dropdown: Influencer, Decision Maker, etc.)
├─ Linked Opportunities (Opportunity multi-select)
├─ Linked Leads (Lead multi-select)

Personal:
├─ LinkedIn Profile (URL)
├─ Twitter Handle (Text)
├─ Birthday (Date, optional)

Notes:
├─ Notes (Textarea)
├─ Attachments (Files)

Bottom:
[Save] [Send Email] [Log Call] [Cancel]
```

#### 3.9 Quote Entry
```
[Form Type: Data Entry]

Header:
├─ Quote Number (Auto-generated, read-only)
├─ Quote Date (Date, default today)
├─ Account (Account selector, required)
├─ Contact (Contact selector, required)
├─ Opportunity (Opportunity selector, optional)
├─ Expires On (Date, required)

Quote Details:
├─ Quote Owner (User selector)
├─ Billing Address (Address selector)
├─ Shipping Address (Address selector)
├─ Payment Terms (Dropdown)
├─ Currency (Dropdown)

Line Items:
│ ├─ Product/Service (Selector)
│ ├─ Description (Text, auto-filled)
│ ├─ Quantity (Number)
│ ├─ Unit Price (Number)
│ ├─ Discount % (Number)
│ ├─ Line Total (Calculated)
│ └─ Notes (Text, 100 chars)
│
├─ [+ Add Line Item]

Totals:
├─ Subtotal (Calculated)
├─ Discount (Number, optional)
├─ Discount Amount (Calculated)
├─ Tax (Calculated, based on tax code)
├─ Grand Total (Calculated)
└─ Deposit Required (Number, optional)

Additional:
├─ Terms & Conditions (Text area, template selector)
├─ Special Notes (Textarea)
├─ Attachments (Files)
├─ Email Template (Selector)

Bottom:
[Save Draft] [Preview PDF] [Send via Email] [Convert to Order] [Cancel]
```

---

## 4. PROJECT & PORTFOLIO MANAGEMENT FORMS

### Configuration Forms

#### 4.1 Project Templates
```
[Form Type: Configuration]

Template Details:
├─ Template Name (Text, required)
├─ Description (Textarea)
├─ Industry (Dropdown)
├─ Project Type (Dropdown: Software, Construction, Marketing, etc.)
├─ Complexity (Radio: Low, Medium, High)

Project Structure:
├─ Number of Phases (Number)
├─ Default Duration (Number, days)
├─ Typical Resources (Number)

Phases (Expandable):
│ ├─ Phase 1: [Phase name, duration, tasks]
│ └─ ... (repeat)

Tasks (Template):
│ ├─ Task Name
│ ├─ Duration (Days)
│ ├─ Assigned Role
│ ├─ Deliverables
│ └─ Dependencies

Budget:
├─ Labor Cost (Number)
├─ Material Cost (Number)
├─ Equipment Cost (Number)
├─ Contingency % (Number)

Approvals:
├─ Approval Workflow (Dropdown)
├─ Budget Authority (User)

Bottom:
[Save as Template] [Use Template] [Cancel]
```

#### 4.2 Resource Pools
```
[Form Type: Configuration]

Pool Details:
├─ Pool Name (Text, required)
├─ Description (Textarea)
├─ Department (Dropdown)
├─ Manager (User selector)

Resources (Table):
│ ├─ Resource Name (User selector)
│ ├─ Role (Dropdown: Developer, Designer, PM, etc.)
│ ├─ Allocation % (Number, 0-100)
│ ├─ Cost per Hour (Number)
│ └─ Start Date (Date)
│
├─ [+ Add Resource]

Capacity Planning:
├─ Total Available Hours (Calculated)
├─ Assigned Hours (Calculated)
├─ Available Capacity (Calculated)

Skills Matrix:
├─ Skill (Dropdown)
├─ Proficiency Level (Radio: Beginner, Intermediate, Expert)
└─ [+ Add Skill]

Bottom:
[View Capacity] [Allocate] [Save] [Cancel]
```

#### 4.3 Billing Rules
```
[Form Type: Configuration]

Rule Details:
├─ Rule Name (Text, required)
├─ Rule Type (Radio: Time & Materials, Fixed Fee, Retainer, etc.)

Conditions:
├─ Project Type (Dropdown)
├─ Client Segment (Dropdown)
├─ Minimum Amount (Number, optional)

Billing Details:
├─ Bill By (Radio: Hours, Days, Weeks, Milestones)
├─ Markup % (Number)
├─ Minimum Billable Unit (Radio: 0.25 hrs, 0.5 hrs, 1 hr)
├─ Rounding Method (Dropdown: Round Up, Round Down, No Rounding)

Rate Configuration:
├─ Role-based rates (Expandable):
│  ├─ Role (Dropdown)
│  ├─ Rate (Number)
│  └─ Effective From (Date)

Exclusions:
├─ Non-billable activities (Multi-select)
├─ Non-billable resources (User multi-select)

Approvals:
├─ Requires Approval (Toggle)
├─ Approver (User selector, conditional)

Bottom:
[Save] [Test] [Cancel]
```

### Data Entry Forms

#### 4.4 Project Entry
```
[Form Type: Data Entry]

Header:
├─ Project Name (Text, required, unique)
├─ Project Code (Auto-generated or manual, unique)
├─ Client/Account (Account selector, required)
├─ Project Status (Dropdown: Planning, Active, On Hold, Completed)

Key Details:
├─ Start Date (Date, required)
├─ End Date (Date, required)
├─ Project Manager (User selector, required)
├─ Expected Revenue (Currency)
├─ Budget (Currency, required)

Scope:
├─ Description (Textarea)
├─ Objectives (Multi-line text)
├─ Deliverables (Multi-line text)
├─ Scope Exclusions (Textarea)

Resources:
├─ Resource Pool (Selector, optional)
├─ Team Members (User multi-select)
├─ Required Skills (Multi-select)

Classification:
├─ Project Type (Dropdown)
├─ Priority (Radio: Low, Medium, High, Critical)
├─ Department (Dropdown)
├─ Industry (Dropdown)

Governance:
├─ Approval Required (Toggle)
├─ Sponsor (User selector, optional)
├─ Budget Authority (User selector)

Phase/Milestone Setup:
├─ Includes Phases (Toggle)
├─ Phase Names (Multi-line, conditional)

Additional:
├─ Notes (Textarea)
├─ Attachments (Files)

Bottom:
[Save Draft] [Activate] [Cancel]

Right Sidebar:
- Budget breakdown
- Team summary
- Milestone preview
```

#### 4.5 Task Entry
```
[Form Type: Data Entry]

Header:
├─ Task Name (Text, required)
├─ Project (Project selector, required)
├─ Phase (Phase selector, if applicable)
├─ Task Status (Dropdown: Not Started, In Progress, On Hold, Completed)

Scheduling:
├─ Start Date (Date, required)
├─ Due Date (Date, required)
├─ Duration (Number, calculated from dates)
├─ Priority (Radio: Low, Medium, High, Critical)

Assignment:
├─ Assigned To (User selector, required)
├─ Resource Allocation % (Number, 0-100)
├─ Secondary Assigned (User multi-select, optional)

Details:
├─ Description (Textarea)
├─ Deliverables (Textarea)
├─ Acceptance Criteria (Textarea)

Effort & Budget:
├─ Estimated Effort (Number, hours)
├─ Actual Effort (Number, hours, read-only until completed)
├─ Task Budget (Currency, optional)
├─ Billable (Toggle)

Dependencies:
├─ Predecessor Tasks (Task multi-select, optional)
├─ Dependency Type (Dropdown: FS, SS, FF, SF if applicable)
└─ Lag/Lead (Number, days, optional)

Budget:
├─ Budget Amount (Currency, optional)
├─ Cost Category (Dropdown, optional)

Notes:
├─ Notes (Textarea)
├─ Attachments (Files)

Bottom:
[Save Draft] [Save & Open Subtasks] [Cancel]
```

#### 4.6 Time Tracking Entry
```
[Form Type: Data Entry]

Header:
├─ Date (Date picker, default today)
├─ Resource/Employee (User selector, auto-filled for logged-in user)
├─ Project (Project selector, required)
├─ Task (Task selector, required, cascading from project)

Time Entry:
├─ Hours Worked (Number, required, decimal allowed)
├─ Description (Textarea, required, 200 chars min)
├─ Activity Type (Dropdown: Development, Review, Testing, Documentation, Admin, etc.)
├─ Cost Code (Dropdown, optional)

Additional:
├─ Billable (Toggle, default based on task)
├─ Overtime (Toggle, optional)
├─ Work Location (Dropdown: Office, Remote, Client Site, optional)

Approval:
├─ Status (Read-only: Draft, Submitted, Approved)
├─ Approver Notes (Read-only, if approved)

Bottom:
[Save Draft] [Submit] [Submit & Create Another] [Cancel]

Bulk Entry Option:
├─ Weekly timesheet grid (7 columns for days)
├─ Project/Task rows
├─ Daily hours entry
└─ [Submit Week] [Cancel]
```

#### 4.7 Expense Entry
```
[Form Type: Data Entry]

Header:
├─ Date (Date picker)
├─ Project (Project selector, required)
├─ Task (Task selector, optional, cascading)
├─ Submitted By (Auto-filled user)

Expense Details:
├─ Expense Type (Dropdown: Travel, Meals, Equipment, Materials, Other)
├─ Category (Dropdown, conditional on type)
├─ Amount (Currency, required)
├─ Currency (Dropdown, if multi-currency)
├─ Billable (Toggle)

Details:
├─ Vendor (Text or Vendor selector)
├─ Description (Textarea, required, 500 chars)
├─ Payment Method (Dropdown: Credit Card, Cash, Other)

Supporting:
├─ Receipt/Invoice (File uploader, required)
├─ Business Justification (Textarea, required if >$500)
├─ Project Cost Code (Dropdown)

Approval:
├─ Approver (Auto-assigned based on amount)
├─ Status (Read-only: Draft, Submitted, Approved, Rejected)

Bottom:
[Save Draft] [Submit] [Cancel]

Bulk Expense Entry:
├─ Multiple expense rows (Add/Remove rows)
├─ [Submit All] [Cancel]
```

---

## 5. HRMS / PAYROLL / TALENT FORMS

### Configuration Forms

#### 5.1 Leave Policies
```
[Form Type: Configuration]

Policy Details:
├─ Policy Name (Text, required)
├─ Description (Textarea)
├─ Country (Dropdown)
├─ Active (Toggle)

Leave Types (Expandable rows):
│ ├─ Leave Type (Dropdown: Annual, Sick, Maternity, Bereavement, etc.)
│ ├─ Annual Entitlement (Number of days)
│ ├─ Carryover Allowed (Toggle)
│ ├─ Carryover Limit (Number, conditional)
│ ├─ Expiry Period (Number, months, optional)
│ ├─ Requires Documentation (Toggle)
│ ├─ Approval Needed (Toggle)
│ ├─ Minimum Duration (Number, days, optional)
│ ├─ Maximum Duration (Number, days, optional)
│ ├─ Blackout Dates (Date range, optional)
│ └─ Pay During Leave (Toggle)
│
└─ [+ Add Leave Type]

Accrual Settings:
├─ Accrual Type (Radio: Annual, Accrued per Month, etc.)
├─ Accrual Rate (Number, conditional)
├─ Pro-rata on Joining (Toggle)
├─ Pro-rata Calculation (Radio: Days, Months, Calendar Year)

Approvals:
├─ Approver Role (Role selector)
├─ Escalation Days (Number)

Compliance:
├─ Regulatory Requirement (Text)
├─ Tax Implication (Text)

Bottom:
[Save] [Save as Template] [Cancel]
```

#### 5.2 Payroll Rules
```
[Form Type: Configuration]

Rule Details:
├─ Rule Name (Text, required)
├─ Country (Dropdown)
├─ Effective From (Date)
├─ Effective To (Date, optional)

Earnings (Expandable):
│ ├─ Earning Type (Dropdown: Salary, Bonus, Overtime, etc.)
│ ├─ Code (Text)
│ ├─ Description (Text)
│ ├─ Frequency (Dropdown: Monthly, Weekly, Per Hour, etc.)
│ ├─ Calculation (Text/Formula)
│ ├─ Tax Exempt (Toggle)
│ ├─ Subject to Social Security (Toggle)
│ └─ GL Account (Account selector)
│
└─ [+ Add Earning]

Deductions (Expandable):
│ ├─ Deduction Type (Dropdown: Health Insurance, Retirement, Tax, etc.)
│ ├─ Code (Text)
│ ├─ Pre-tax/Post-tax (Radio)
│ ├─ Calculation Method (Radio: Fixed Amount, Percentage, etc.)
│ ├─ Amount (Number, conditional)
│ ├─ Percentage (Number, conditional)
│ └─ GL Account (Account selector)
│
└─ [+ Add Deduction]

Taxes:
├─ Tax Code (Text)
├─ Tax Rate (Number)
├─ Tax Table (Upload CSV/use calculator)
├─ Surtax (Number, optional)
├─ Filing Frequency (Dropdown)

Compliance:
├─ Regulatory Template (Dropdown)
├─ Auditable (Toggle)

Bottom:
[Test Calculation] [Save] [Cancel]
```

#### 5.3 Performance Templates
```
[Form Type: Configuration]

Template Details:
├─ Template Name (Text, required)
├─ Review Frequency (Dropdown: Annual, Semi-annual, Quarterly)
├─ Description (Textarea)

Rating Scale:
├─ Rating Type (Radio: Numeric, Behavioral, Hybrid)
├─ Scale (Dropdown: 3-point, 5-point, 10-point)
├─ Rating Labels (Multi-line: Exemplary, Competent, etc.)

Performance Dimensions (Expandable):
│ ├─ Dimension 1: [Technical Skills]
│ │  ├─ Weight (Number, %)
│ │  └─ Assessment Questions (Textarea)
│ ├─ Dimension 2: [Leadership]
│ │  ├─ Weight (Number, %)
│ │  └─ Assessment Questions (Textarea)
│ └─ ... (repeat)
│
└─ [+ Add Dimension]

Goals Section:
├─ Number of Goals (Number)
├─ SMART Framework (Toggle)
├─ Alignment to Company Goals (Toggle)

Competencies:
├─ Required Competencies (Multi-select)
├─ Assessment Method (Dropdown: Self, Manager, 360, etc.)

Feedback:
├─ 360 Feedback Required (Toggle)
├─ Peer Feedback Required (Toggle)
├─ Direct Report Feedback Required (Toggle)

Review Process:
├─ Approver (Role selector)
├─ Calibration Session (Toggle)
├─ Moderation (Toggle)

Bottom:
[Save as Template] [Use Template] [Cancel]
```

#### 5.4 Learning Paths
```
[Form Type: Configuration]

Path Details:
├─ Learning Path Name (Text, required)
├─ Description (Textarea)
├─ Role Target (Role selector)
├─ Seniority Level (Dropdown: Entry, Mid, Senior)
├─ Duration (Number, months)

Curriculum (Sequenced modules):
│ ├─ Module 1: [Course name]
│ │  ├─ Course ID (Selector)
│ │  ├─ Duration (Number, hours)
│ │  ├─ Mandatory (Toggle)
│ │  ├─ Sequence Position (Number, auto)
│ │  ├─ Prerequisite (Multi-select)
│ │  └─ Assessment Required (Toggle)
│ │
│ ├─ Module 2: [Course name]
│ └─ ... (repeat)
│
└─ [+ Add Module] [Remove Module]

Completion Requirements:
├─ All Courses (Toggle)
├─ Minimum Score (Number, %, optional)
├─ Time to Complete (Number, months)
├─ Renewal Frequency (Dropdown: Annual, Bi-annual, etc.)

Competencies Gained:
├─ Competency (Multi-select)
├─ Proficiency Level (Dropdown: Beginner, Intermediate, Expert)

Ownership:
├─ Learning Owner (User selector)
├─ Approval Required (Toggle)
├─ Approver (User selector, conditional)

Bottom:
[Publish] [Save as Draft] [Cancel]
```

### Data Entry Forms

#### 5.5 Employee Entry
```
[Form Type: Data Entry]

Personal Details:
├─ First Name (Text, required)
├─ Last Name (Text, required)
├─ Email (Email, required, unique)
├─ Phone (Phone)
├─ Date of Birth (Date, optional)
├─ Gender (Dropdown, optional)
├─ Marital Status (Dropdown, optional)

Address:
├─ Current Address (Address fields)
├─ Permanent Address (Address fields, optional)

Employment:
├─ Employee ID (Auto-generated, read-only)
├─ Hire Date (Date, required)
├─ Employment Type (Dropdown: Full-time, Part-time, Contract, etc.)
├─ Status (Radio: Active, Inactive, On Leave, Terminated)
├─ Department (Dropdown, required)
├─ Manager (User selector, required)
├─ Job Title (Text, required)
├─ Reports To (User selector, auto-filled)

Compensation:
├─ Salary (Currency, required)
├─ Pay Frequency (Dropdown: Monthly, Bi-weekly, etc.)
├─ Cost Center (Dropdown)
├─ Grade (Dropdown, optional)

Skills:
├─ Skills (Multi-select)
├─ Proficiency Levels (Dropdown per skill)

Government IDs:
├─ SSN/Tax ID (Text, encrypted)
├─ Passport Number (Text, optional)
├─ National ID (Text, optional)

Emergency Contact:
├─ Name (Text)
├─ Relationship (Dropdown)
├─ Phone (Phone)
├─ Address (Address)

Additional:
├─ Work Phone (Phone)
├─ Work Email (Email, auto-derived)
├─ Photo (Image uploader)
├─ Attachments (Files)

Bottom:
[Save Draft] [Activate] [Cancel]
```

#### 5.6 Leave Request
```
[Form Type: Data Entry]

Header:
├─ Employee (Auto-filled user)
├─ Leave Type (Dropdown, required)
├─ Leave Policy (Auto-selected based on leave type)
├─ Status (Read-only: Draft, Submitted, Approved, Rejected)

Dates:
├─ From Date (Date picker, required)
├─ To Date (Date picker, required)
├─ Number of Days (Calculated)
├─ Part Day (Toggle, optional)
├─ Half Days (Dropdown, conditional: AM/PM)

Details:
├─ Reason (Textarea, optional)
├─ Contact During Leave (Phone, optional)
├─ Alternate Contact (User selector, if applicable)
├─ Handover Notes (Textarea, if multi-day)

Approval:
├─ Approver (Auto-assigned based on policy)
├─ Approval Notes (Read-only, if already reviewed)

Balance:
├─ Current Balance (Number, read-only)
├─ Balance After Leave (Calculated)

Bottom:
[Save Draft] [Submit] [Cancel]
```

#### 5.7 Timesheet Entry
```
[Form Type: Data Entry]

Header:
├─ Employee (Auto-filled)
├─ Week Starting (Date picker, required)
├─ Status (Read-only: Draft, Submitted, Approved)

Weekly Grid (7 columns):
│   Mon | Tue | Wed | Thu | Fri | Sat | Sun
│
├─ Project/Task 1: [Input] | [Input] | ... | [Total for row]
├─ Project/Task 2: [Input] | [Input] | ... | [Total for row]
├─ ... (repeat for each project/task)
│
├─ Daily Total: [Read-only] | [Read-only] | ... | [Total hours]

Leave/Absence:
├─ Leave (Multi-select by date)
├─ Absence (Multi-select by date)
├─ Overtime Hours (Number)

Notes:
├─ Weekly Summary (Textarea)
├─ Comments (Textarea)

Bottom:
[Save Draft] [Submit for Approval] [Cancel]

Mobile Alternative (Single Entry):
├─ Date (Date picker)
├─ Project/Task (Selector)
├─ Hours (Number)
├─ [+ Add Day] [Submit]
```

#### 5.8 Performance Rating
```
[Form Type: Data Entry]

Header:
├─ Employee (User selector, required)
├─ Review Period (Date range, auto-populated)
├─ Reviewer (User, auto-filled)
├─ Review Type (Dropdown: Self, Manager, 360, Calibration)
├─ Status (Read-only: Draft, Submitted, Approved)

Performance Dimensions (Based on template):
│
├─ Dimension 1: Technical Skills
│  ├─ Rating (Radio buttons: 1-5 or custom scale)
│  ├─ Evidence/Comments (Textarea, 500 chars)
│  └─ Score (Calculated based on weight)
│
├─ Dimension 2: Leadership
│  ├─ Rating (Radio buttons)
│  ├─ Evidence/Comments (Textarea)
│  └─ Score (Calculated)
│
└─ ... (repeat for all dimensions)

Goals Achievement:
├─ Goal 1: [Achieved %] (Slider, 0-100)
│  └─ Comments (Textarea)
├─ Goal 2: [Achieved %]
│  └─ Comments (Textarea)
└─ ... (repeat)

360 Feedback Summary (If 360 review):
├─ Peer Feedback Average (Read-only, calculated)
├─ Direct Report Feedback Average (Read-only, calculated)

Overall Rating:
├─ Overall Performance Rating (Auto-calculated OR Manual if allowed)
├─ Strengths (Textarea)
├─ Development Areas (Textarea)
├─ Career Development Plan (Textarea)
├─ Recommended Actions (Multi-select)

Recommendations:
├─ Promotion Recommended (Radio: Yes, No, Maybe)
├─ Salary Increase % (Number, optional)
├─ Bonus Amount (Currency, optional)
├─ Training Recommended (Multi-select)

Bottom:
[Save Draft] [Submit] [Approve] [Cancel]
```

---

## 6. SERVICE & SUPPORT FORMS

### Configuration Forms

#### 6.1 SLA Templates
```
[Form Type: Configuration]

Template Details:
├─ Template Name (Text, required)
├─ Description (Textarea)
├─ Industry (Dropdown)
├─ Service Level (Dropdown: Premium, Standard, Basic)

SLA Rules (Expandable by Priority):
│
├─ Priority: Critical
│  ├─ Response Time (Number, hours, required)
│  ├─ Resolution Time (Number, hours, required)
│  ├─ Escalation Time (Number, hours)
│  ├─ Escalate To (Role/User selector)
│  ├─ Business Hours Only (Toggle)
│  └─ Penalty (Currency, optional)
│
├─ Priority: High
│  ├─ Response Time (Number, hours)
│  ├─ Resolution Time (Number, hours)
│  ├─ ... (repeat fields)
│
├─ Priority: Medium
├─ Priority: Low
└─ ... (repeat for each priority)

Holidays & Exceptions:
├─ Holiday Calendar (Calendar selector)
├─ Blackout Dates (Date range multi-select)
├─ Service Maintenance Windows (Time slots)

Escalation:
├─ Escalation Levels (Number, 1-5)
├─ Level 1 Escalate To (Role/User)
├─ Level 2 Escalate To (Role/User)
├─ ... (repeat)

Notifications:
├─ Notify on Breach (Toggle)
├─ Notify Owner (Toggle)
├─ Notify Manager (Toggle)
├─ Escalation Notification (Toggle)

Reporting:
├─ Include in SLA Reports (Toggle)
├─ Calculation Method (Dropdown: Business Hours, Calendar Hours)

Bottom:
[Save as Template] [Use Template] [Cancel]
```

#### 6.2 Escalation Rules
```
[Form Type: Configuration]

Rule Details:
├─ Rule Name (Text, required)
├─ Description (Textarea)
├─ Active (Toggle)

Trigger Conditions (Visual builder):
├─ IF Condition (Dropdown):
│  ├─ Priority = Critical
│  ├─ Response SLA Breached
│  ├─ Resolution SLA Breached
│  ├─ Ticket Aging > [X] hours
│  └─ Status = [Specific Status]
│
├─ AND Condition (Radio to add more)

Escalation Actions:
├─ Escalate To (Role/User selector)
├─ Change Priority (Dropdown, optional)
├─ Change Status (Dropdown, optional)
├─ Assign To (User selector, optional)
├─ Send Notification (Toggle with template)
├─ Add Notes (Text)

Repeat Escalation:
├─ Repeat Escalation (Toggle)
├─ Repeat Every (Number, hours)
├─ Max Repeat (Number, times, optional)
├─ Next Escalate To (Role/User, conditional)

Approval:
├─ Requires Approval (Toggle)
├─ Approver (User selector, conditional)

Bottom:
[Test Rule] [Save] [Cancel]
```

#### 6.3 KB Categories
```
[Form Type: Configuration]

Category Tree (Hierarchical):
│
├─ Category 1: Getting Started
│  ├─ Sub-category 1.1: Account Setup
│  ├─ Sub-category 1.2: Profile Management
│  └─ ... (repeat)
│
├─ Category 2: Troubleshooting
├─ Category 3: Billing
└─ ... (repeat)

Per-Category Settings:
├─ Category Name (Text, required)
├─ Category Icon (Icon selector)
├─ Description (Textarea)
├─ Parent Category (Dropdown, if sub-category)
├─ Visibility (Radio: Public, Internal, Private)
├─ Featured (Toggle)
├─ Sort Order (Number)
├─ Owner (User selector)
├─ Auto-publish Articles (Toggle)
└─ Status (Radio: Active, Inactive, Archive)

Bottom:
[Save] [Delete] [Reorder] [Cancel]
```

### Data Entry Forms

#### 6.4 Ticket Entry
```
[Form Type: Data Entry]

Header:
├─ Ticket Number (Auto-generated, read-only)
├─ Subject (Text, required)
├─ Status (Dropdown: New, In Progress, On Hold, Resolved, Closed)

Customer Info:
├─ Customer (Account or Contact selector, required)
├─ Customer Name (Auto-filled or manual)
├─ Email (Email, auto-filled or manual)
├─ Phone (Phone, optional)

Ticket Details:
├─ Category (Dropdown, required)
├─ Subcategory (Dropdown, cascading)
├─ Priority (Dropdown: Critical, High, Medium, Low)
├─ Type (Dropdown: Issue, Feature Request, General Inquiry)
├─ Description (Textarea, required, 500 chars min)

Assignment:
├─ Assigned To (User selector)
├─ Support Team (Team selector, optional)
├─ Escalation Level (Read-only, if escalated)

SLA & Timing:
├─ SLA Applied (Read-only)
├─ Response Due (Read-only, calculated)
├─ Resolution Due (Read-only, calculated)
├─ First Response Sent (Read-only)

Related Info:
├─ Related Tickets (Ticket multi-select, optional)
├─ Knowledge Base Articles (Article multi-select, optional)
├─ Attachments (File uploader)

Channels:
├─ Channel (Dropdown: Email, Chat, Phone, Social, etc.)
├─ Source (Read-only)
├─ Customer Sentiment (Read-only, if AI-analyzed)

Bottom:
[Save] [Save & Assign] [Cancel]

Right Sidebar:
- Customer history
- Similar tickets
- KB suggestions
- SLA status (color-coded)
```

#### 6.5 Service Log / Activity Entry
```
[Form Type: Data Entry]

Header:
├─ Ticket (Ticket selector, required)
├─ Date (Date picker, default today)
├─ Time (Time picker)
├─ Activity Type (Dropdown: Email Sent, Call Logged, Note Added, etc.)

Activity Details:
├─ Description (Textarea, required, 500 chars)
├─ Internal Note (Toggle)
├─ Visible to Customer (Toggle, conditional)

Call/Interaction Details (If interaction):
├─ Contact Person (Contact selector)
├─ Duration (Number, minutes)
├─ Outcome (Dropdown: Resolved, Escalated, Scheduled Callback, etc.)

Work Performed:
├─ Work Description (Textarea)
├─ Time Spent (Number, hours)
├─ Next Action (Dropdown)
├─ Next Action Date (Date, conditional)

Attachments:
├─ Files (File uploader)

Bottom:
[Save & Close Ticket] [Save & Continue] [Cancel]
```

#### 6.6 Feedback Form (Customer Satisfaction)
```
[Form Type: Data Entry | Post-resolution survey]

Header:
├─ Ticket Number (Auto-populated)
├─ Date Submitted (Date, auto-filled)
├─ Customer (Auto-filled)

Satisfaction Questions (Radio/Star):
│
├─ Overall Satisfaction (1-5 stars or similar)
├─ Quality of Solution (1-5)
├─ Support Agent Helpfulness (1-5)
├─ Resolution Time (1-5)
├─ Clarity of Communications (1-5)

Comments:
├─ What did we do well? (Textarea)
├─ What could we improve? (Textarea)
├─ Would you recommend our support? (Radio: Yes, No, Maybe)

Follow-up:
├─ May we contact you? (Toggle)
├─ Preferred Contact Method (Dropdown, conditional)
├─ Contact Email (Email, conditional)
├─ Contact Phone (Phone, conditional)

Additional:
├─ Tags (Multi-select)
├─ Attachments (Screenshot, file)

Bottom:
[Submit] [Cancel]

AI Features:
- Sentiment analysis on comments
- Auto-categorization of feedback themes
```

---

## 7. MARKETING AUTOMATION FORMS

### Configuration Forms

#### 7.1 Campaign Templates
```
[Form Type: Configuration]

Template Details:
├─ Template Name (Text, required)
├─ Description (Textarea)
├─ Campaign Type (Dropdown: Email, SMS, Social, Landing Page, etc.)
├─ Industry (Dropdown, optional)

Email Template (If email campaign):
├─ Subject Line (Text, required, with personalization tokens)
├─ Preview Text (Text, optional)
├─ From Name (Text)
├─ From Email (Email)
├─ Reply-To (Email, optional)

Template Builder:
├─ Email Body (WYSIWYG HTML editor)
│  ├─ Drag-drop components: Header, Body, CTA Button, Footer
│  ├─ Personalization tokens: {{FirstName}}, {{CompanyName}}, etc.
│  ├─ Dynamic content blocks (conditional)
│  └─ Link tracking enabled (Toggle)

Audience:
├─ Default Segment (Segment selector)
├─ Exclusions (Segment multi-select)

Sending:
├─ Send Time Optimization (Toggle)
├─ Frequency Cap (Number, per contact)
├─ Retry Logic (Radio: Yes/No, conditional days)

Tracking:
├─ Track Opens (Toggle)
├─ Track Clicks (Toggle)
├─ Track Conversions (Toggle)
├─ Conversion Event (Dropdown, conditional)

A/B Testing:
├─ A/B Test Setup (Toggle)
├─ Test Variable (Dropdown: Subject Line, Send Time, Content, etc.)
├─ Winner Criteria (Dropdown: Open Rate, Click Rate, etc.)
└─ Test Duration (Number, hours)

Bottom:
[Preview] [Save as Template] [Use Template] [Cancel]
```

#### 7.2 Audience Segments
```
[Form Type: Configuration]

Segment Details:
├─ Segment Name (Text, required, unique)
├─ Description (Textarea)
├─ Segment Type (Radio: Static, Dynamic)
├─ Owner (User selector)

Segment Rules (Visual builder, for Dynamic segments):
│
├─ Rule 1:
│  ├─ Field (Dropdown: Lead Score, Company Size, Industry, etc.)
│  ├─ Operator (Dropdown: =, >, <, Contains, In List, etc.)
│  ├─ Value (Input, conditional on operator)
│  └─ Condition Type (Radio: AND/OR)
│
├─ Rule 2:
│  ├─ Field (Dropdown)
│  ├─ Operator (Dropdown)
│  ├─ Value (Input)
│  └─ Condition Type (Radio: AND/OR)
│
└─ [+ Add Rule]

Member Count:
├─ Estimated Members (Read-only, for dynamic)
├─ Actual Members (Read-only, for static)
├─ Last Updated (Read-only)

Refresh:
├─ Refresh Frequency (Dropdown: Real-time, Hourly, Daily, Weekly)
├─ Next Refresh (Read-only)

Exclusions:
├─ Exclude Segments (Segment multi-select)
├─ Do Not Contact List (Toggle)

Metadata:
├─ Tags (Multi-select)
├─ Scope (Radio: Company, Department, etc.)

Bottom:
[View Members] [Test Segment] [Save] [Cancel]
```

#### 7.3 Journey Maps
```
[Form Type: Configuration]

Journey Details:
├─ Journey Name (Text, required)
├─ Description (Textarea)
├─ Trigger (Dropdown: Lead Created, Form Submitted, Date, etc.)
├─ Entry Segment (Segment selector, required)

Journey Canvas (Visual flow builder):
│
├─ Start Node
├─ Action Node (Email, SMS, Task, etc.)
├─ Decision Node (If-Then branching)
├─ Wait Node (Delay X days/hours)
├─ End Node
│
└─ Connectors (Drag-drop to build flow)

Node Properties (When selected):
├─ Action Type (Dropdown: Send Email, Create Task, Update Field, etc.)
├─ Action Details (Conditional fields)
├─ Wait Duration (Number + Unit, for wait nodes)
├─ Decision Logic (IF field = value, then path A else path B)
├─ Exit Conditions (Optional)

Timing:
├─ Start Date (Date picker)
├─ End Date (Date picker, optional)
├─ Active (Toggle)

Performance Goals:
├─ Conversion Goal (Selector)
├─ Goal Metric (Dropdown: Click, Conversion, etc.)
├─ Target Conversion Rate (%)

Bottom:
[Preview Flow] [Test] [Activate] [Cancel]
```

### Data Entry Forms

#### 7.4 Lead Upload (Bulk Import)
```
[Form Type: Data Entry]

Upload Details:
├─ Campaign Name (Text, optional)
├─ Lead Source (Dropdown)
├─ File Upload (CSV/Excel uploader, drag-drop enabled)

Column Mapping (Auto-detect or manual):
├─ File Preview (Table preview of first 5 rows)
├─ Column Mapping:
│  ├─ Column A → First Name (Dropdown)
│  ├─ Column B → Last Name (Dropdown)
│  ├─ Column C → Email (Dropdown)
│  ├─ Column D → Phone (Dropdown)
│  └─ ... (repeat for all columns)

Validation:
├─ Skip rows with missing email (Toggle)
├─ Skip duplicates (Toggle)
├─ Validation Rules (Multi-select: Email format, Phone format, etc.)

Deduplication:
├─ Check Against (Multi-select: Existing leads, Contacts, etc.)
├─ Update existing if found (Toggle)

Enrichment:
├─ Enable lead scoring (Toggle)
├─ Enable enrichment (Toggle, if connected to enrichment service)

Data Quality:
├─ Valid Records (Read-only, count)
├─ Invalid Records (Read-only, count)
├─ Preview Issues (Alert box with issues)

Bottom:
[Validate] [Import] [Cancel]
```

#### 7.5 Campaign Execution
```
[Form Type: Data Entry]

Campaign Details:
├─ Campaign Name (Text, required)
├─ Template (Campaign template selector, required)
├─ Owner (User selector)
├─ Campaign Status (Read-only: Draft, Ready, Sending, Sent, Archived)

Audience:
├─ Target Segment (Segment selector, required)
├─ Exclusion Segments (Segment multi-select, optional)
├─ Estimated Recipients (Read-only, calculated)

Message Personalization:
├─ Subject Line Preview (Read-only, with personalization)
├─ Body Preview (Read-only, scrollable)
├─ From Name (Text, optional override)

Sending Settings:
├─ Send Method (Radio: Send Now, Schedule)
├─ Send Date/Time (Date + Time pickers, if scheduled)
├─ Time Zone (Dropdown)
├─ Send Time Optimization (Toggle)

Tracking & Compliance:
├─ Track Opens (Toggle)
├─ Track Clicks (Toggle)
├─ Include Unsubscribe Link (Toggle)
├─ Include Preference Center (Toggle)

Approval:
├─ Requires Approval (Read-only, if configured)
├─ Approvers (User multi-select, if required)
├─ Approval Status (Read-only)

Summary:
├─ Recipients (Number, read-only)
├─ Exclusions (Number, read-only)
├─ Final Send Count (Number, read-only)

Bottom:
[Save Draft] [Preview] [Request Approval] [Send Now] [Cancel]
```

---

## Additional Modules (Summary Form Listings)

### 8. Website Builder Forms
- Page Content Entry (WYSIWYG editor)
- Product Entry (SKU, Name, Images, Description, Pricing)
- Form Builder (Drag-drop fields)
- SEO Settings (Title, Meta, Keywords, Canonical URL)
- Template Setup (Name, Layout, Color scheme, Responsive settings)

### 9. Email Management Forms
- Email Account Setup (IMAP/SMTP config, OAuth)
- Email Compose (To/Cc/Bcc, Subject, Body editor, Attachments, CRM link)
- Email Template Creation (Name, Category, HTML editor, Variables)
- Auto-Response Rule (Conditions, Reply template, Status)
- Distribution List Setup (Members, Permissions, Sync schedule)

### 10. E-Commerce Forms
- Product Catalog Entry (Name, SKU, Category, Pricing, Inventory, Images, SEO)
- Order Entry (Customer, Items, Shipping, Billing, Payment method, Fulfillment)
- Customer Entry (Name, Email, Address, Payment methods, Preferences)
- Promotion Entry (Type, Rules, Duration, Usage limits, Approval)
- Inventory Adjustment (Item, Qty, Reason, Location, Approval)

### 11. Analytics & BI Forms
- Dashboard Configuration (Name, Widgets, Layout, Filters, Drill-downs)
- KPI Entry (Metric, Formula, Target, Comparison, Visualization)
- Data Source Setup (Connection, Query, Refresh schedule, Permissions)
- Report Builder (Name, Data source, Dimensions, Metrics, Filters, Export format)

### 12. Finance Closing Forms
- Journal Entry (Date, Amount, GL accounts, Memo)
- Consolidation Rules (Entity mapping, FX rates, Elimination rules)
- Close Checklist (Task name, Owner, Due date, Status, Notes)
- Reconciliation Matching (GL account, Bank transactions, Adjustments)

### 13. Integration & Automation Forms
- Connector Setup (Name, Type, Authentication, Test connection)
- Workflow Template (Name, Trigger, Steps, Actions, Error handling)
- Data Mapping (Source field, Target field, Transformation)
- Event Trigger Setup (Event type, Conditions, Action, Frequency)

### 14. BPM (Business Process Mapping) Forms
- Process Template (Name, Owner, Steps, Roles, Approvals, KPIs)
- Process Instance (Process template, Variables, Start trigger)
- Approval Request (Process step, Approver, Notes, Attachments)

### 15. Compliance & Governance Forms
- Compliance Template (Standard, Rules, Audit schedule, Penalties)
- Risk Assessment (Risk name, Category, Probability, Impact, Mitigation)
- Corrective Action Plan (Issue, Root cause, Action, Owner, Due date)
- Audit Log Viewer (Transaction filter, User filter, Date range, Export)

---

## Form Design Standards (Applied to ALL Forms)

**Input Fields:**
- Labels above inputs
- Placeholder text for guidance
- Red asterisk (*) for required fields
- Inline validation on blur
- Error messages below field in red

**Dropdowns:**
- Search-enabled if >10 options
- Grouped options if applicable
- Clear visual distinction for selected value

**Date/Time Pickers:**
- Calendar pop-up with keyboard shortcuts
- Time picker with AM/PM
- Default to today's date or current time
- Timezone awareness for time fields

**Multi-Select:**
- Chips/tags showing selected items
- Search to add more items
- Remove icon (X) on each chip
- Max items limit (if applicable)

**File Uploads:**
- Drag-drop zone highlighted on hover
- Max file size displayed
- Accepted formats listed
- Progress indicator during upload

**Buttons:**
- Primary action button (solid color)
- Secondary buttons (outline)
- Destructive actions (red, with confirmation)
- Disabled state when form incomplete

**Sections:**
- Clear section headers
- Collapsible sections for advanced options
- Visual dividers between sections

**AI Features (Where applicable):**
- Sparkles icon to indicate AI suggestion
- Confidence % shown with recommendations
- "Why?" button to explain AI suggestion
- Option to accept/reject/edit suggestion

