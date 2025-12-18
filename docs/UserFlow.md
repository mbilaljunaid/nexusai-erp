# NexusAIFirst - Comprehensive User Flow Documentation

## Table of Contents

1. [Overview](#overview)
2. [Global Concepts](#global-concepts)
3. [Core Navigation Map](#core-navigation-map)
4. [Module Catalog](#module-catalog)
5. [Form Library](#form-library)
6. [API Surface](#api-surface)
7. [Business Processes & Workflows](#business-processes--workflows)
8. [Integrations](#integrations)
9. [Role-Based Access Control](#role-based-access-control)
10. [Data Flows](#data-flows)
11. [AI Copilot Interactions](#ai-copilot-interactions)

---

## Overview

**NexusAIFirst** is a production-ready Enterprise Resource Planning (ERP) platform designed to manage and automate core business processes across 42 industry verticals and 27 enterprise modules.

### Platform Statistics
- **Pages**: 200+ frontend pages
- **API Endpoints**: 150+ REST endpoints
- **Forms**: 812+ configurable forms
- **Business Processes**: 18 end-to-end processes
- **Industry Templates**: 42 vertical-specific configurations
- **Enabled Modules**: 27 enterprise modules

### Domain
- Production: `nexusaifirst.cloud`

---

## Global Concepts

### Authentication & Session Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User → Landing Page → Login → Session Created → Dashboard    │
│                           ↓                                     │
│                    Replit Auth (OAuth)                         │
│                           ↓                                     │
│              Session stored in PostgreSQL                       │
│              (connect-pg-simple session store)                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Authentication Methods
| Method | Endpoint | Description |
|--------|----------|-------------|
| Replit OAuth | `/api/login` | Primary authentication via Replit |
| Session Check | `/api/auth/user` | Verify current session |
| Logout | `/api/logout` | Terminate session |

### Multi-Tenancy Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     MULTI-TENANT STRUCTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Platform Admin                                                │
│       └── Tenant 1 (Company A)                                 │
│              ├── Users (admin, editor, viewer)                 │
│              ├── Industry Deployment (Healthcare)              │
│              └── Enabled Modules                               │
│       └── Tenant 2 (Company B)                                 │
│              ├── Users                                         │
│              ├── Industry Deployment (Manufacturing)           │
│              └── Enabled Modules                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Role-Based Access Control (RBAC)

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **admin** | Full CRUD, system config, user management | All modules + Admin Console |
| **editor** | Create, Read, Update on assigned modules | Assigned modules only |
| **viewer** | Read-only access | View data, no modifications |

### Theme System
- **Light Mode**: Default light theme
- **Dark Mode**: Full dark theme support
- **System Mode**: Auto-detect from OS preference
- **12 Accent Colors**: Rose, Orange, Amber, Emerald, Teal, Cyan, Blue, Indigo, Violet, Purple, Fuchsia, Pink

---

## Core Navigation Map

### Public Routes (No Authentication Required)

```
/                       → Landing Page (Hero, Features, CTA)
├── /about              → About NexusAIFirst
├── /features           → Feature overview
├── /features/:slug     → Individual feature details
├── /modules            → Module catalog
├── /industries         → Industry templates (42 industries)
├── /industries/:id     → Industry detail page
├── /pricing            → Subscription plans
├── /partners           → Partner program
├── /blog               → Blog articles
├── /blog/:id           → Individual blog post
├── /contact            → Contact form
├── /careers            → Job listings
├── /use-cases          → Use case examples
├── /open-source        → Open source information
├── /license            → License details
├── /privacy            → Privacy policy
├── /terms              → Terms of service
├── /legal              → Legal information
├── /login              → Authentication page
└── /public/processes   → Public process documentation
    ├── /procure-to-pay
    ├── /order-to-cash
    ├── /hire-to-retire
    ├── /month-end-consolidation
    ├── /compliance-risk
    ├── /inventory-management
    ├── /fixed-asset-lifecycle
    ├── /production-planning
    ├── /mrp
    ├── /quality-assurance
    ├── /contract-management
    ├── /budget-planning
    ├── /demand-planning
    ├── /capacity-planning
    ├── /warehouse-management
    ├── /customer-returns
    ├── /vendor-performance
    └── /subscription-billing
```

### Authenticated Routes (Login Required)

```
/dashboard              → Main dashboard with widgets
├── /crm                → CRM overview
│   ├── /leads          → Lead management
│   ├── /leads/:id      → Lead detail
│   ├── /opportunities  → Opportunity pipeline
│   ├── /opportunities/:id → Opportunity detail
│   ├── /contacts       → Contact directory
│   ├── /accounts       → Account management
│   └── /campaigns      → Marketing campaigns
├── /erp                → ERP overview
│   ├── /inventory      → Inventory management
│   ├── /purchase-orders → Purchase orders
│   ├── /vendors        → Vendor management
│   ├── /invoices       → Invoice list
│   └── /quotes         → Quote builder
├── /hr                 → HR overview
│   ├── /employees      → Employee directory
│   ├── /org-chart      → Organization chart
│   ├── /leave-request  → Leave management
│   ├── /attendance     → Attendance tracking
│   ├── /payroll        → Payroll processing
│   └── /performance    → Performance reviews
├── /finance            → Finance overview
│   ├── /general-ledger → General ledger
│   ├── /ap-invoices    → Accounts payable
│   ├── /ar-invoices    → Accounts receivable
│   ├── /chart-of-accounts → Chart of accounts
│   ├── /journal-entries → Journal entries
│   └── /financial-reports → Financial reports
├── /projects           → Project management
│   ├── /agile-board    → Kanban/Agile board
│   ├── /task-management → Task management
│   └── /team-collaboration → Team tools
├── /manufacturing      → Manufacturing
│   ├── /work-orders    → Work orders
│   ├── /mrp-dashboard  → MRP dashboard
│   ├── /shop-floor     → Shop floor control
│   ├── /bom-management → Bill of materials
│   └── /quality-control → Quality control
├── /service            → Service & Support
│   ├── /tickets        → Ticket dashboard
│   ├── /sla-tracking   → SLA monitoring
│   ├── /knowledge-base → Knowledge base
│   └── /customer-portal → Customer portal
├── /analytics          → Analytics & BI
│   ├── /dashboard-builder → Custom dashboards
│   ├── /report-builder → Report builder
│   ├── /data-explorer  → Data exploration
│   └── /export-manager → Data exports
├── /settings           → User settings
│   ├── /appearance     → Theme settings
│   ├── /notifications  → Notification preferences
│   └── /security       → Security settings
└── /admin              → Admin console (admin role only)
    ├── /platform-admin → Platform administration
    ├── /tenant-admin   → Tenant management
    ├── /roles          → Role management
    ├── /users          → User management
    ├── /api-gateway    → API gateway config
    └── /audit-logs     → Audit trail
```

### Process Hub Routes (Authenticated)

```
/processes              → Process Hub (all 18 processes)
├── /procure-to-pay     → Procure-to-Pay process
├── /order-to-cash      → Order-to-Cash process
├── /hire-to-retire     → Hire-to-Retire process
├── /month-end          → Month-End Consolidation
├── /compliance-risk    → Compliance & Risk
├── /inventory          → Inventory Management
├── /fixed-assets       → Fixed Asset Lifecycle
├── /production-planning → Production Planning
├── /mrp                → Material Requirements Planning
├── /quality-assurance  → Quality Assurance
├── /contract-management → Contract Management
├── /budget-planning    → Budget Planning
├── /demand-planning    → Demand Planning
├── /capacity-planning  → Capacity Planning
├── /warehouse          → Warehouse Management
├── /customer-returns   → Customer Returns (RMA)
├── /vendor-performance → Vendor Performance
└── /subscription-billing → Subscription Billing
```

---

## Module Catalog

### 27 Enabled Modules

#### Core Business Modules

| Module | Description | Key Features |
|--------|-------------|--------------|
| **Projects** | Project & portfolio management | Kanban, Gantt, sprints, resource allocation |
| **Tasks** | Task management & tracking | Assignments, deadlines, dependencies |
| **Workflows** | Workflow automation | Visual builder, triggers, approvals |
| **ERP** | Enterprise resource planning | Inventory, orders, vendors, assets |
| **EPM** | Enterprise performance management | Budgeting, forecasting, consolidation |
| **CRM** | Customer relationship management | Leads, opportunities, pipeline |
| **Finance** | Financial management | GL, AP/AR, invoicing, reports |
| **HR** | Human resources | Employees, org chart, policies |
| **Payroll** | Payroll processing | Pay runs, deductions, taxes |

#### Analytics & Intelligence

| Module | Description | Key Features |
|--------|-------------|--------------|
| **Analytics** | Business intelligence | Dashboards, KPIs, trends |
| **Automation** | Process automation | Rules, triggers, scheduled jobs |
| **R&D** | Research & development | Product development, innovation |

#### Communication & Content

| Module | Description | Key Features |
|--------|-------------|--------------|
| **Emails** | Email management | Templates, campaigns, tracking |
| **Documents** | Document management | Storage, versioning, sharing |
| **Community** | Community & forums | Discussions, Q&A, knowledge |

#### Supply Chain & Operations

| Module | Description | Key Features |
|--------|-------------|--------------|
| **SCM** | Supply chain management | Procurement, logistics, vendors |
| **Quality** | Quality management | Inspections, NCRs, audits |
| **Compliance** | Compliance & governance | Policies, controls, audits |

#### Sales & Marketing

| Module | Description | Key Features |
|--------|-------------|--------------|
| **Marketing** | Marketing automation | Campaigns, leads, analytics |
| **E-Commerce** | Online commerce | Catalog, cart, checkout |

#### Service & Support

| Module | Description | Key Features |
|--------|-------------|--------------|
| **Service** | Service management | Tickets, SLAs, knowledge base |
| **Field Service** | Field service operations | Scheduling, dispatch, mobile |
| **Training** | Learning management | Courses, certifications, tracking |

#### Platform & Integration

| Module | Description | Key Features |
|--------|-------------|--------------|
| **Marketplace** | App marketplace | Extensions, integrations |
| **API** | API management | Gateway, versioning, docs |
| **DevOps** | Developer tools | CI/CD, monitoring, logs |
| **Asset Management** | Asset tracking | Equipment, maintenance, depreciation |

---

### 42 Industry Templates

#### Industry Categories

| Category | Industries |
|----------|------------|
| **Healthcare** | Healthcare, Pharmaceuticals, Biotech, Medical Devices, Veterinary |
| **Manufacturing** | Manufacturing, Construction, Logistics, Automotive, Aerospace, Oil & Gas |
| **Retail & Commerce** | Retail, Hospitality, Food & Beverage, Fashion, Consumer Goods |
| **Financial Services** | Banking, Insurance, Investment, FinTech, Accounting |
| **Professional Services** | Legal, Consulting, Architecture, Marketing Agency, HR Services |
| **Technology** | Technology, Telecommunications, Cybersecurity, Gaming, AI/ML |
| **Public Sector** | Education, Government, Nonprofit, Public Health, Utilities |
| **Real Estate** | Real Estate, Property Management, Commercial RE |
| **Media & Entertainment** | Media, Sports, Film Production |
| **Transportation** | Airlines, Shipping, Trucking |
| **Agriculture** | Agriculture, Agribusiness |

---

## Form Library

### Form Categories (812+ Forms)

#### CRM Forms

| Form ID | Form Name | Fields | Validation | API Endpoint |
|---------|-----------|--------|------------|--------------|
| `leads` | Lead Capture | name, email, company, phone, source, status | Required: name, email | `POST /api/leads` |
| `contacts` | Contact Management | firstName, lastName, email, phone, company, title | Required: firstName, email | `POST /api/contacts` |
| `opportunities` | Opportunity Entry | name, value, stage, probability, closeDate, accountId | Required: name, value | `POST /api/opportunities` |
| `accounts` | Account Registration | name, industry, website, billingAddress, type | Required: name | `POST /api/accounts` |

#### Finance Forms

| Form ID | Form Name | Fields | Validation | API Endpoint |
|---------|-----------|--------|------------|--------------|
| `invoices` | Invoice Creation | customerId, items[], dueDate, terms, tax | Required: customerId, items | `POST /api/invoices` |
| `quotes` | Quote Builder | customerId, items[], validUntil, terms, discount | Required: customerId | `POST /api/quotes` |
| `expenses` | Expense Entry | category, amount, date, description, receipt | Required: category, amount | `POST /api/expenses` |
| `journal-entries` | Journal Entry | date, debit, credit, account, description | Balanced: debit = credit | `POST /api/journal-entries` |

#### HR Forms

| Form ID | Form Name | Fields | Validation | API Endpoint |
|---------|-----------|--------|------------|--------------|
| `employees` | Employee Onboarding | firstName, lastName, email, department, role, startDate, salary | Required: firstName, email | `POST /api/employees` |
| `leave-request` | Leave Request | type, startDate, endDate, reason, approverId | Required: type, dates | `POST /api/leave-requests` |
| `performance-review` | Performance Review | employeeId, rating, goals[], feedback, reviewDate | Required: employeeId, rating | `POST /api/performance-reviews` |
| `payroll` | Payroll Entry | employeeId, period, grossPay, deductions, netPay | Required: employeeId, period | `POST /api/payroll` |

#### Manufacturing Forms

| Form ID | Form Name | Fields | Validation | API Endpoint |
|---------|-----------|--------|------------|--------------|
| `work-orders` | Work Order | product, quantity, startDate, dueDate, priority, workCenter | Required: product, quantity | `POST /api/work-orders` |
| `bom` | Bill of Materials | productId, components[], quantities[], operations[] | Required: productId | `POST /api/bom` |
| `production-orders` | Production Order | bomId, quantity, scheduledDate, status | Required: bomId, quantity | `POST /api/production-orders` |
| `quality-inspection` | Quality Inspection | workOrderId, inspector, results[], passedFailed, notes | Required: workOrderId | `POST /api/quality-inspections` |

#### Inventory Forms

| Form ID | Form Name | Fields | Validation | API Endpoint |
|---------|-----------|--------|------------|--------------|
| `inventory` | Inventory Item | sku, name, category, quantity, unitCost, reorderPoint | Required: sku, name | `POST /api/inventory` |
| `purchase-orders` | Purchase Order | supplierId, items[], deliveryDate, terms | Required: supplierId, items | `POST /api/purchase-orders` |
| `goods-receipt` | Goods Receipt | poId, receivedItems[], receivedDate, inspector | Required: poId | `POST /api/goods-receipts` |
| `suppliers` | Supplier Registration | name, contactEmail, phone, address, paymentTerms | Required: name, email | `POST /api/suppliers` |

#### Project Forms

| Form ID | Form Name | Fields | Validation | API Endpoint |
|---------|-----------|--------|------------|--------------|
| `projects` | Project Creation | name, description, startDate, endDate, budget, managerId | Required: name | `POST /api/projects` |
| `tasks` | Task Entry | title, description, projectId, assigneeId, dueDate, priority | Required: title | `POST /api/tasks` |
| `milestones` | Milestone | name, projectId, dueDate, deliverables[] | Required: name, projectId | `POST /api/milestones` |
| `time-entries` | Time Entry | taskId, userId, hours, date, notes | Required: taskId, hours | `POST /api/time-entries` |

#### Service Forms

| Form ID | Form Name | Fields | Validation | API Endpoint |
|---------|-----------|--------|------------|--------------|
| `tickets` | Support Ticket | subject, description, priority, category, customerId | Required: subject | `POST /api/tickets` |
| `knowledge-articles` | Knowledge Article | title, content, category, tags[], status | Required: title, content | `POST /api/knowledge-articles` |
| `sla-config` | SLA Configuration | name, responseTime, resolutionTime, priority, escalation | Required: name | `POST /api/sla-configs` |

### Dynamic Form System

The platform uses a dynamic form routing system:

```
GET  /api/:formId          → List all records for form type
POST /api/:formId          → Create new record
PATCH /api/:formId/:id     → Update existing record
DELETE /api/:formId/:id    → Delete record
```

Supported dynamic form IDs include all entity types from the schema.

### Complete Database Schema (100+ Tables)

The platform uses PostgreSQL with Drizzle ORM. Below is the complete list of database tables:

#### Core System Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `sessions` | Session storage | sid, sess, expire |
| `users` | User accounts | id, email, username, role, tenantId, profileImageUrl |
| `tenants` | Multi-tenant orgs | id, name, industry, plan, status |
| `form_data` | Dynamic form storage | id, formId, data (JSONB), status, submittedBy |

#### CRM Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `leads` | Sales leads | id, name, email, company, status, source, assignedTo |
| `projects` | CRM projects | id, name, description, status, ownerId |

#### Finance Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `invoices` | Invoice records | id, customerId, items[], total, status, dueDate |
| `general_ledger` | GL entries | id, account, debit, credit, date, description |
| `expenses` | Expense records | id, category, amount, date, userId, receipt |

#### HR Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `employees` | Employee master | id, firstName, lastName, email, department, salary |
| `payroll` | Payroll records | id, employeeId, period, grossPay, deductions, netPay |

#### Manufacturing Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `work_orders` | Work orders | id, product, quantity, status, workCenterId |
| `bom` | Bill of materials | id, productId, components[], quantities[] |
| `work_centers` | Work centers | id, name, capacity, status |
| `production_orders` | Production orders | id, bomId, quantity, scheduledDate |

#### Inventory Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `inventory` | Inventory items | id, sku, name, quantity, unitCost, reorderPoint |
| `suppliers` | Supplier master | id, name, contactEmail, paymentTerms |
| `purchase_orders` | Purchase orders | id, supplierId, items[], status, deliveryDate |

#### Project Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `projects2` | Projects v2 | id, name, description, startDate, endDate, budget |

#### Education Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `education_students` | Student records | id, name, email, enrollmentDate |
| `education_courses` | Course catalog | id, name, description, instructor |
| `education_enrollments` | Enrollments | id, studentId, courseId, status |
| `education_assignments` | Assignments | id, courseId, title, dueDate |
| `education_grades` | Grade records | id, studentId, assignmentId, grade |
| `education_billing` | Billing records | id, studentId, amount, status |
| `education_events` | Campus events | id, title, date, location |
| `education_attendance` | Attendance | id, studentId, courseId, date, present |

#### AI & Copilot Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `copilot_conversations` | Conversation history | id, userId, context, createdAt |
| `copilot_messages` | Chat messages | id, conversationId, role, content |

#### Analytics & Reporting Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `smart_views` | Saved views | id, name, formId, filters, columns |
| `reports` | Report definitions | id, name, type, config, schedule |
| `revenue_forecasts` | Revenue forecasts | id, period, amount, confidence |
| `budget_allocations` | Budget items | id, department, category, amount |
| `time_series_data` | Time series | id, metric, timestamp, value |
| `forecast_models` | ML models | id, name, type, parameters |
| `scenarios` | What-if scenarios | id, name, baselineId, variables |
| `scenario_variables` | Scenario vars | id, scenarioId, name, value |
| `dashboard_widgets` | Dashboard config | id, type, config, position |

#### Marketplace Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `marketplace_developers` | Developer profiles | id, userId, companyName, website |
| `marketplace_categories` | App categories | id, name, description, icon |
| `marketplace_apps` | Published apps | id, name, developerId, status, price |
| `marketplace_app_versions` | App versions | id, appId, version, changelog |
| `marketplace_installations` | App installs | id, appId, tenantId, installedAt |
| `marketplace_transactions` | Transactions | id, appId, userId, amount, type |
| `marketplace_subscriptions` | Subscriptions | id, appId, userId, plan, status |
| `marketplace_reviews` | App reviews | id, appId, userId, rating, comment |
| `marketplace_payouts` | Developer payouts | id, developerId, amount, status |
| `marketplace_commission_settings` | Commission config | id, rate, minAmount, maxAmount |
| `marketplace_audit_logs` | Audit trail | id, action, entityId, userId |
| `marketplace_licenses` | License keys | id, appId, tenantId, key, expires |
| `marketplace_app_dependencies` | Dependencies | id, appId, dependsOn, version |

#### Industry & Deployment Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `industries` | Industry templates | id, name, category, modules[] |
| `industry_deployments` | Tenant deployments | id, tenantId, industryId, config |
| `industry_app_recommendations` | App suggestions | id, industryId, appId, priority |

#### Gamification Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `user_dashboard_widgets` | User widgets | id, userId, widgetType, config |
| `user_badges` | Earned badges | id, userId, badgeId, earnedAt |
| `badge_definitions` | Badge types | id, name, description, criteria |
| `user_activity_points` | Activity points | id, userId, points, activity |
| `developer_spotlight` | Featured devs | id, developerId, startDate, endDate |

#### Notification Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `user_notifications` | Notifications | id, userId, type, message, read |

#### Community Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `community_spaces` | Forum spaces | id, name, slug, description |
| `community_posts` | Forum posts | id, spaceId, userId, title, content |
| `community_comments` | Post comments | id, postId, userId, content |
| `community_votes` | Votes | id, userId, targetId, type, value |
| `user_trust_levels` | Trust system | id, userId, level, score |
| `reputation_events` | Reputation log | id, userId, event, points |
| `reputation_dimensions` | Rep dimensions | id, name, weight |
| `community_badge_progress` | Badge progress | id, userId, badgeId, progress |
| `community_moderation_actions` | Mod actions | id, moderatorId, targetId, action |
| `community_rate_limits` | Rate limits | id, userId, action, count, window |
| `community_space_memberships` | Memberships | id, userId, spaceId, role |
| `community_flags` | Content flags | id, reporterId, targetId, reason |
| `user_earned_badges` | Community badges | id, userId, badgeId, earnedAt |
| `community_vote_events` | Vote events | id, userId, voteId, timestamp |
| `community_vote_anomalies` | Vote anomalies | id, userId, type, severity |
| `community_ai_recommendations` | AI mod recs | id, flagId, action, confidence |

#### Service Marketplace Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `service_categories` | Service cats | id, name, description |
| `service_packages` | Service packages | id, providerId, name, price |
| `service_orders` | Service orders | id, packageId, buyerId, status |
| `service_reviews` | Provider reviews | id, orderId, rating, comment |
| `job_postings` | Job listings | id, userId, title, budget, status |
| `job_proposals` | Job proposals | id, jobId, userId, amount, message |

#### Training Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `training_resources` | Training content | id, title, type, url, submittedBy |
| `training_resource_likes` | Likes | id, resourceId, userId |
| `training_filter_requests` | Filter requests | id, userId, filterType, value |

#### Mobile & Sync Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `mobile_devices` | Registered devices | id, userId, deviceId, platform |
| `offline_syncs` | Offline sync log | id, deviceId, lastSync, pending |

#### Security & Admin Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `audit_logs` | Audit trail | id, userId, action, entity, details |
| `apps` | Internal apps | id, name, type, config |
| `app_reviews` | App reviews | id, appId, userId, rating |
| `app_installations` | Installations | id, appId, tenantId |
| `connectors` | Integration connectors | id, name, type, config |
| `connector_instances` | Connector instances | id, connectorId, tenantId |
| `webhook_events` | Webhook log | id, type, payload, status |
| `abac_rules` | ABAC policies | id, resource, action, conditions |
| `encrypted_fields` | Field encryption | id, tableName, fieldName, algorithm |
| `contact_submissions` | Contact forms | id, name, email, message |
| `partners` | Partner directory | id, name, type, status |
| `user_feedback` | User feedback | id, userId, type, content, rating |

---

## API Surface

### API Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                             │
├─────────────────────────────────────────────────────────────────┤
│   Rate Limiting → Authentication → RBAC → Request Handler      │
│                                                                 │
│   Middleware Stack:                                            │
│   1. CORS (origin: *)                                          │
│   2. JSON Body Parser (50mb limit)                             │
│   3. Session Management (connect-pg-simple)                    │
│   4. Authentication Check (isPlatformAuthenticated)            │
│   5. RBAC Enforcement (enforceRBAC)                            │
│   6. Request Validation (Zod schemas)                          │
│   7. Route Handler                                             │
│   8. Error Handler                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Complete API Reference (168 Endpoints)

#### Authentication & Session (4 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/user` | Optional | Get current user session |
| GET | `/api/login` | No | Initiate OAuth login |
| GET | `/api/callback` | No | OAuth callback handler |
| GET | `/api/logout` | Yes | Terminate session |

#### Dashboard (6 endpoints)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/dashboard/admin-stats` | Yes | admin | Platform-wide statistics |
| GET | `/api/dashboard/tenant-stats` | Yes | any | Tenant-specific stats |
| GET | `/api/dashboard/my-tasks` | Yes | any | User's assigned tasks |
| GET | `/api/dashboard/system-alerts` | Yes | admin | System alerts |
| GET | `/api/dashboard/tenant-overview` | Yes | any | Tenant overview |
| GET | `/api/dashboard/widgets` | Yes | any | User's dashboard widgets |
| POST | `/api/dashboard/widgets` | Yes | any | Create widget |
| PATCH | `/api/dashboard/widgets/:id` | Yes | any | Update widget |
| DELETE | `/api/dashboard/widgets/:id` | Yes | any | Delete widget |
| PUT | `/api/dashboard/widgets/reorder` | Yes | any | Reorder widgets |

#### CRM (6 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/crm/metrics` | Yes | CRM dashboard metrics |
| GET | `/api/crm/opportunities` | Yes | List opportunities |
| GET | `/api/leads` | Yes | List all leads |
| POST | `/api/leads` | Yes | Create lead |
| PATCH | `/api/leads/:id` | Yes | Update lead |
| DELETE | `/api/leads/:id` | Yes | Delete lead |

#### Finance (12 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/invoices` | Yes | List invoices |
| POST | `/api/invoices` | Yes | Create invoice |
| POST | `/api/invoices/:id/send` | Yes | Send invoice |
| GET | `/api/quotes` | Yes | List quotes |
| POST | `/api/quotes` | Yes | Create quote |
| GET | `/api/general-ledger` | Yes | GL entries |
| POST | `/api/journal-entries` | Yes | Create journal entry |
| GET | `/api/expenses` | Yes | List expenses |
| POST | `/api/expenses` | Yes | Create expense |
| GET | `/api/payments/products` | No | List pricing plans |
| POST | `/api/payments/checkout` | Yes | Create checkout session |
| GET | `/api/payments/status` | Yes | Check payment status |

#### HR & Payroll (10 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/employees` | Yes | List employees |
| POST | `/api/employees` | Yes | Create employee |
| GET | `/api/payroll` | Yes | List payroll records |
| POST | `/api/payroll` | Yes | Create payroll entry |
| GET | `/api/leave-requests` | Yes | List leave requests |
| POST | `/api/leave-requests` | Yes | Submit leave request |
| PATCH | `/api/leave-requests/:id` | Yes | Approve/reject leave |
| GET | `/api/attendance` | Yes | Attendance records |
| GET | `/api/performance-reviews` | Yes | Performance reviews |
| POST | `/api/performance-reviews` | Yes | Create review |

#### Inventory & Supply Chain (12 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/inventory` | Yes | List inventory items |
| POST | `/api/inventory` | Yes | Create inventory item |
| PATCH | `/api/inventory/:id` | Yes | Update inventory |
| GET | `/api/purchase-orders` | Yes | List POs |
| POST | `/api/purchase-orders` | Yes | Create PO |
| GET | `/api/suppliers` | Yes | List suppliers |
| POST | `/api/suppliers` | Yes | Create supplier |
| GET | `/api/goods-receipts` | Yes | List receipts |
| POST | `/api/goods-receipts` | Yes | Create receipt |
| GET | `/api/bom` | Yes | List BOMs |
| POST | `/api/bom` | Yes | Create BOM |
| GET | `/api/work-centers` | Yes | List work centers |

#### Manufacturing (8 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/work-orders` | Yes | List work orders |
| POST | `/api/work-orders` | Yes | Create work order |
| PATCH | `/api/work-orders/:id` | Yes | Update work order |
| GET | `/api/production-orders` | Yes | List production orders |
| POST | `/api/production-orders` | Yes | Create production order |
| GET | `/api/quality-inspections` | Yes | List inspections |
| POST | `/api/quality-inspections` | Yes | Create inspection |
| GET | `/api/mrp/dashboard` | Yes | MRP dashboard data |

#### Projects & Tasks (10 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | Yes | List projects |
| POST | `/api/projects` | Yes | Create project |
| PATCH | `/api/projects/:id` | Yes | Update project |
| DELETE | `/api/projects/:id` | Yes | Delete project |
| GET | `/api/tasks` | Yes | List tasks |
| POST | `/api/tasks` | Yes | Create task |
| PATCH | `/api/tasks/:id` | Yes | Update task |
| DELETE | `/api/tasks/:id` | Yes | Delete task |
| GET | `/api/sprints` | Yes | List sprints |
| POST | `/api/sprints` | Yes | Create sprint |

#### AI Copilot (4 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/copilot/chat` | No | Simple chat (info mode) |
| POST | `/api/copilot/contextual-chat` | Conditional | Context-aware chat with actions |
| GET | `/api/copilot/actions-log` | Yes | View AI action audit log |

#### Marketplace (28 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/marketplace/categories` | No | List categories |
| GET | `/api/marketplace/apps` | No | List apps |
| GET | `/api/marketplace/apps/:id` | No | App details |
| POST | `/api/marketplace/developers/register` | Yes | Register as developer |
| GET | `/api/marketplace/my-developer` | Yes | My developer profile |
| POST | `/api/marketplace/apps` | Yes | Submit app |
| PUT | `/api/marketplace/apps/:id` | Yes | Update app |
| POST | `/api/marketplace/apps/:id/submit` | Yes | Submit for review |
| POST | `/api/marketplace/apps/:id/approve` | admin | Approve app |
| POST | `/api/marketplace/apps/:id/reject` | admin | Reject app |
| POST | `/api/marketplace/apps/:id/install` | Yes | Install app |
| DELETE | `/api/marketplace/apps/:id/uninstall` | Yes | Uninstall app |
| GET | `/api/marketplace/my-apps` | Yes | My apps |
| GET | `/api/marketplace/my-installs` | Yes | My installations |
| GET | `/api/marketplace/apps/:id/reviews` | No | App reviews |
| POST | `/api/marketplace/apps/:id/reviews` | Yes | Submit review |
| GET | `/api/marketplace/admin/pending-apps` | admin | Pending reviews |
| GET | `/api/marketplace/commission-settings` | admin | Commission config |
| PUT | `/api/marketplace/commission-settings/:id` | admin | Update commission |
| GET | `/api/marketplace/audit-logs` | admin | Audit logs |
| POST | `/api/marketplace/licenses` | Yes | Create license |
| GET | `/api/marketplace/licenses` | Yes | List licenses |
| GET | `/api/marketplace/licenses/:id/validate` | Yes | Validate license |
| PUT | `/api/marketplace/licenses/:id/suspend` | admin | Suspend license |
| GET | `/api/marketplace/payouts` | Yes | List payouts |
| POST | `/api/marketplace/payouts/generate` | admin | Generate payouts |
| PUT | `/api/marketplace/payouts/:id/process` | admin | Process payout |
| PUT | `/api/marketplace/payouts/:id/complete` | admin | Complete payout |

#### Community (32 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/community/spaces` | No | List community spaces |
| GET | `/api/community/spaces/:id` | No | Space details |
| POST | `/api/community/spaces/:id/join` | Yes | Join space |
| DELETE | `/api/community/spaces/:id/leave` | Yes | Leave space |
| GET | `/api/community/posts` | No | List posts |
| GET | `/api/community/posts/:id` | No | Post details |
| POST | `/api/community/posts` | Yes | Create post |
| PATCH | `/api/community/posts/:id` | Yes | Update post |
| DELETE | `/api/community/posts/:id` | Yes | Delete post |
| GET | `/api/community/posts/:id/comments` | No | List comments |
| POST | `/api/community/posts/:id/comments` | Yes | Add comment |
| PATCH | `/api/community/comments/:id` | Yes | Update comment |
| DELETE | `/api/community/comments/:id` | Yes | Delete comment |
| POST | `/api/community/posts/:id/vote` | Yes | Vote on post |
| POST | `/api/community/comments/:id/vote` | Yes | Vote on comment |
| POST | `/api/community/flag` | Yes | Flag content |
| GET | `/api/community/reputation/:userId` | No | User reputation |
| GET | `/api/community/leaderboard` | No | Community leaderboard |
| GET | `/api/community/badges` | No | Available badges |
| GET | `/api/community/my-badges` | Yes | User's badges |
| GET | `/api/community/marketplace/jobs` | No | List jobs |
| GET | `/api/community/marketplace/jobs/:id` | No | Job details |
| POST | `/api/community/marketplace/jobs` | Yes | Post job |
| PATCH | `/api/community/marketplace/jobs/:id` | Yes | Update job |
| DELETE | `/api/community/marketplace/jobs/:id` | Yes | Delete job |
| POST | `/api/community/marketplace/jobs/:id/proposals` | Yes | Submit proposal |
| GET | `/api/community/marketplace/jobs/:id/proposals` | Yes | View proposals |
| PATCH | `/api/community/marketplace/proposals/:id` | Yes | Update proposal |
| POST | `/api/community/marketplace/proposals/:id/accept` | Yes | Accept proposal |
| GET | `/api/community/marketplace/my-jobs` | Yes | My posted jobs |
| GET | `/api/community/marketplace/my-proposals` | Yes | My proposals |
| GET | `/api/community/search` | No | Search community |

#### Data Operations (8 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/export/:formId` | Yes | Export data (CSV/Excel/PDF) |
| POST | `/api/import/:formId` | Yes | Import data |
| GET | `/api/smartviews` | Yes | List saved views |
| POST | `/api/smartviews` | Yes | Create smart view |
| DELETE | `/api/smartviews/:viewId` | Yes | Delete view |
| GET | `/api/reports` | Yes | List reports |
| POST | `/api/reports` | Yes | Create report |
| GET | `/api/reports/:reportId/export` | Yes | Export report |

#### Administration (15+ endpoints)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/tenants` | Yes | admin | List tenants |
| POST | `/api/tenants` | Yes | admin | Create tenant |
| GET | `/api/industries` | No | - | List industries |
| GET | `/api/industry-deployments` | Yes | admin | List deployments |
| POST | `/api/industry-deployments` | Yes | admin | Create deployment |
| GET | `/api/partners` | Yes | admin | List partners |
| POST | `/api/partners/apply` | No | - | Partner application |
| GET | `/api/contact/submissions` | Yes | admin | Contact form submissions |
| GET | `/api/admin/training` | Yes | admin | Training admin |
| PATCH | `/api/admin/training/:id` | Yes | admin | Update training |

#### Webhooks & Integrations (5 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/webhook` | No | LemonSqueezy webhook |
| GET | `/api/integrations` | Yes | List integrations |
| POST | `/api/integrations` | Yes | Create integration |
| GET | `/api/webhooks` | Yes | List webhooks |
| POST | `/api/webhooks` | Yes | Create webhook |

#### Gamification & Badges (4 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/gamification/badges` | Yes | Get user badges |
| GET | `/api/gamification/leaderboard` | No | Global leaderboard |
| GET | `/api/gamification/badge-definitions` | No | All badge types |
| GET | `/api/developers/spotlight` | No | Featured developers |

#### Notifications (4 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | Yes | List notifications |
| PATCH | `/api/notifications/:id/read` | Yes | Mark as read |
| POST | `/api/notifications/mark-all-read` | Yes | Mark all read |
| GET | `/api/notifications/unread-count` | Yes | Unread count |

#### Training & Content (10 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/training` | No | List training resources |
| GET | `/api/training/filters` | No | Get filter options |
| GET | `/api/training/:id` | No | Resource details |
| POST | `/api/training` | Yes | Submit resource |
| POST | `/api/training/:id/like` | Yes | Like resource |
| GET | `/api/training/:id/liked` | Yes | Check if liked |
| POST | `/api/training/filter-request` | Yes | Request filter |
| GET | `/api/admin/training` | admin | Admin view |
| PATCH | `/api/admin/training/:id` | admin | Approve/reject |
| GET | `/api/contributor/training` | Yes | My submissions |

#### Dynamic Form APIs (5 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/:formId` | Yes | List all form records |
| POST | `/api/:formId` | Yes | Create form record |
| PATCH | `/api/:formId/:id` | Yes | Update form record |
| DELETE | `/api/:formId/:id` | Yes | Delete form record |
| GET | `/api/export/:formId` | Yes | Export form data |

**Dynamic Form IDs**: The following formId values are supported via the dynamic routing:
- `leads`, `contacts`, `accounts`, `opportunities` (CRM)
- `invoices`, `quotes`, `expenses`, `journal-entries` (Finance)
- `employees`, `payroll`, `leave-requests` (HR)
- `inventory`, `purchase-orders`, `suppliers`, `goods-receipts` (SCM)
- `work-orders`, `production-orders`, `bom` (Manufacturing)
- `projects`, `tasks`, `milestones` (Projects)
- `tickets`, `knowledge-articles` (Service)

#### Demos & Contact (4 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/demos/industries` | No | Industries for demo |
| GET | `/api/demos/list` | No | Demo listings |
| POST | `/api/demos/request` | No | Request demo |
| POST | `/api/contact` | No | Contact form |

#### Feedback (2 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/feedback` | No | Submit feedback |
| GET | `/api/feedback` | admin | View feedback |

#### Community Moderation (8 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/community/flag` | Yes | Flag content |
| GET | `/api/community/moderation/queue` | Yes | Moderation queue |
| POST | `/api/community/moderation/action` | Yes | Take action |
| GET | `/api/community/moderation/anomalies` | Yes | View anomalies |
| POST | `/api/community/moderation/detect-anomalies` | Yes | Run detection |
| POST | `/api/community/moderation/ai-analyze/:flagId` | Yes | AI analysis |
| GET | `/api/community/moderation/ai-recommendations` | Yes | AI recommendations |
| GET | `/api/community/moderation/history` | Yes | Action history |

#### Marketplace Advanced (15 endpoints)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| DELETE | `/api/marketplace/apps/:id/uninstall` | Yes | - | Uninstall app |
| GET | `/api/marketplace/my-apps` | Yes | - | My apps |
| GET | `/api/marketplace/my-installs` | Yes | - | My installations |
| GET | `/api/marketplace/admin/pending-apps` | Yes | admin | Pending reviews |
| GET | `/api/marketplace/commission-settings` | Yes | admin | Commission config |
| PUT | `/api/marketplace/commission-settings/:id` | Yes | admin | Update commission |
| GET | `/api/marketplace/audit-logs` | Yes | admin | Audit logs |
| POST | `/api/marketplace/licenses` | Yes | - | Create license |
| GET | `/api/marketplace/licenses` | Yes | - | List licenses |
| GET | `/api/marketplace/licenses/:id/validate` | Yes | - | Validate license |
| PUT | `/api/marketplace/licenses/:id/suspend` | Yes | admin | Suspend license |
| GET | `/api/marketplace/payouts` | Yes | - | List payouts |
| POST | `/api/marketplace/payouts/generate` | Yes | admin | Generate payouts |
| PUT | `/api/marketplace/payouts/:id/process` | Yes | admin | Process payout |
| PUT | `/api/marketplace/payouts/:id/complete` | Yes | admin | Complete payout |

---

## Business Processes & Workflows

### 18 End-to-End Business Processes

#### 1. Procure-to-Pay (P2P)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROCURE-TO-PAY PROCESS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Purchase      2. Supplier     3. Purchase    4. Goods      │
│     Requisition      Selection       Order          Receipt    │
│        ↓               ↓              ↓              ↓        │
│  5. Invoice       6. 3-Way        7. Payment     8. Supplier   │
│     Receipt          Match           Processing     Analytics  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Purchase Requisition, RFQ, Purchase Order, Goods        │
│        Receipt, Vendor Invoice, Payment Voucher                │
│ APIs: /api/purchase-orders, /api/suppliers, /api/goods-receipts│
│       /api/invoices, /api/payments                             │
│ GL Mappings: AP, Inventory, Expense accounts                   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Forms:**
- Purchase Requisition → Approval Workflow
- RFQ (Request for Quote)
- Purchase Order (PO)
- Goods Receipt Note (GRN)
- Vendor Invoice
- Payment Voucher

#### 2. Order-to-Cash (O2C)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER-TO-CASH PROCESS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Quote/      2. Sales        3. Order        4. Pick/Pack/  │
│     Proposal       Order           Fulfillment     Ship        │
│        ↓            ↓               ↓              ↓          │
│  5. Invoice     6. Payment      7. Revenue      8. Customer    │
│     Generation     Collection      Recognition     Analytics   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Quote, Sales Order, Delivery Order, Invoice, Receipt    │
│ APIs: /api/quotes, /api/sales-orders, /api/invoices,          │
│       /api/shipments, /api/payments                            │
│ GL Mappings: AR, Revenue, Inventory, COGS                      │
└─────────────────────────────────────────────────────────────────┘
```

#### 3. Hire-to-Retire (H2R)

```
┌─────────────────────────────────────────────────────────────────┐
│                    HIRE-TO-RETIRE PROCESS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Recruitment  2. Hiring      3. Onboarding   4. Performance │
│     & Selection     Decision       & Training      Management  │
│        ↓             ↓              ↓              ↓          │
│  5. Compensation 6. Development 7. Succession   8. Offboarding│
│     & Benefits      & Learning     Planning        & Exit      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Job Requisition, Application, Offer Letter, Employee    │
│        Profile, Leave Request, Performance Review, Exit Form   │
│ APIs: /api/employees, /api/payroll, /api/leave-requests,       │
│       /api/performance-reviews, /api/training                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 4. Month-End Consolidation

```
┌─────────────────────────────────────────────────────────────────┐
│                MONTH-END CONSOLIDATION PROCESS                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Period       2. Accruals    3. Intercompany 4. Currency    │
│     Close           & Deferrals    Eliminations    Translation │
│        ↓              ↓              ↓              ↓         │
│  5. Trial        6. Financial   7. Variance     8. Reporting   │
│     Balance         Statements     Analysis        & Disclosure│
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Period Close Checklist, Accrual Entry, Elimination      │
│        Entry, Variance Report, Financial Statements            │
│ APIs: /api/journal-entries, /api/general-ledger,               │
│       /api/financial-reports, /api/consolidation               │
└─────────────────────────────────────────────────────────────────┘
```

#### 5. Compliance & Risk Management

```
┌─────────────────────────────────────────────────────────────────┐
│                 COMPLIANCE & RISK PROCESS                       │
├─────────────────────────────────────────────────────────────────┤
│  1. Policy        2. Risk         3. Control      4. Audit     │
│     Definition       Assessment      Implementation   Planning  │
│        ↓               ↓              ↓              ↓        │
│  5. Compliance    6. Exception    7. Remediation  8. Reporting │
│     Monitoring       Tracking        Actions         & Dashboard│
├─────────────────────────────────────────────────────────────────┤
│ Forms: Policy Template, Risk Register, Control Matrix, Audit   │
│ APIs: /api/compliance, /api/risk-assessments, /api/audits      │
└─────────────────────────────────────────────────────────────────┘
```

#### 6. Inventory Management

```
┌─────────────────────────────────────────────────────────────────┐
│                 INVENTORY MANAGEMENT PROCESS                    │
├─────────────────────────────────────────────────────────────────┤
│  1. Item          2. Stock        3. Reorder      4. Cycle     │
│     Master           Receipt         Point Trigger   Count     │
│        ↓               ↓              ↓              ↓        │
│  5. Allocation    6. Transfer     7. Adjustment   8. Analytics │
│     & Reserve        Orders          Processing      & Reports │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Item Master, Stock Receipt, Transfer Order, Adjustment  │
│ APIs: /api/inventory, /api/stock-transfers, /api/adjustments   │
└─────────────────────────────────────────────────────────────────┘
```

#### 7. Fixed Asset Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                 FIXED ASSET LIFECYCLE PROCESS                   │
├─────────────────────────────────────────────────────────────────┤
│  1. Asset         2. Capitaliz-   3. Depreciation 4. Maintenance│
│     Acquisition      ation           Scheduling      Tracking  │
│        ↓               ↓              ↓              ↓        │
│  5. Revaluation   6. Impairment   7. Disposal/    8. Reporting │
│     Processing       Testing         Retirement      & Audit   │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Asset Acquisition, Depreciation Schedule, Disposal Form │
│ APIs: /api/assets, /api/depreciation, /api/asset-disposals     │
└─────────────────────────────────────────────────────────────────┘
```

#### 8. Production Planning

```
┌─────────────────────────────────────────────────────────────────┐
│                 PRODUCTION PLANNING PROCESS                     │
├─────────────────────────────────────────────────────────────────┤
│  1. Demand        2. Capacity     3. Master       4. Production│
│     Forecast         Analysis        Schedule        Order     │
│        ↓               ↓              ↓              ↓        │
│  5. Work Order    6. Resource     7. Schedule     8. KPI       │
│     Generation       Assignment      Optimization    Tracking  │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Demand Forecast, Capacity Plan, Production Schedule     │
│ APIs: /api/production-orders, /api/work-orders, /api/schedules │
└─────────────────────────────────────────────────────────────────┘
```

#### 9. Material Requirements Planning (MRP)

```
┌─────────────────────────────────────────────────────────────────┐
│                      MRP PROCESS                                │
├─────────────────────────────────────────────────────────────────┤
│  1. BOM           2. Inventory    3. Net          4. Planned   │
│     Explosion        Check           Requirements    Orders    │
│        ↓               ↓              ↓              ↓        │
│  5. Purchase      6. Work Order   7. Pegging      8. Exception │
│     Requisitions     Generation      Analysis        Messages  │
├─────────────────────────────────────────────────────────────────┤
│ Forms: BOM, MRP Parameters, Planned Order, Purchase Requisition│
│ APIs: /api/bom, /api/mrp/run, /api/planned-orders              │
└─────────────────────────────────────────────────────────────────┘
```

#### 10. Quality Assurance

```
┌─────────────────────────────────────────────────────────────────┐
│                 QUALITY ASSURANCE PROCESS                       │
├─────────────────────────────────────────────────────────────────┤
│  1. Inspection    2. Sample       3. Test         4. Results   │
│     Planning         Collection      Execution       Recording │
│        ↓               ↓              ↓              ↓        │
│  5. NCR           6. CAPA         7. Disposition  8. Quality   │
│     Creation         Assignment      Decision        Metrics   │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Inspection Plan, NCR Form, CAPA Form, Quality Report    │
│ APIs: /api/quality-inspections, /api/ncr, /api/capa            │
└─────────────────────────────────────────────────────────────────┘
```

#### 11. Contract Management

```
┌─────────────────────────────────────────────────────────────────┐
│                 CONTRACT MANAGEMENT PROCESS                     │
├─────────────────────────────────────────────────────────────────┤
│  1. Contract      2. Negotiation  3. Approval     4. Execution │
│     Drafting         & Review        Workflow        & Signing │
│        ↓               ↓              ↓              ↓        │
│  5. Milestone     6. Compliance   7. Renewal/     8. Analytics │
│     Tracking         Monitoring      Amendment       & Reports │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Contract Template, Amendment Form, Renewal Notice       │
│ APIs: /api/contracts, /api/contract-milestones, /api/amendments│
└─────────────────────────────────────────────────────────────────┘
```

#### 12. Budget Planning

```
┌─────────────────────────────────────────────────────────────────┐
│                 BUDGET PLANNING PROCESS                         │
├─────────────────────────────────────────────────────────────────┤
│  1. Budget        2. Department   3. Consolidation 4. Approval │
│     Templates        Submissions     & Review         Workflow │
│        ↓               ↓              ↓              ↓        │
│  5. Allocation    6. Monitoring   7. Variance     8. Reforecast│
│     & Release        & Tracking      Analysis        Cycles   │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Budget Template, Allocation Form, Variance Report       │
│ APIs: /api/budgets, /api/budget-allocations, /api/forecasts    │
└─────────────────────────────────────────────────────────────────┘
```

#### 13. Demand Planning

```
┌─────────────────────────────────────────────────────────────────┐
│                 DEMAND PLANNING PROCESS                         │
├─────────────────────────────────────────────────────────────────┤
│  1. Historical    2. Statistical  3. Market       4. Consensus │
│     Data Analysis    Forecasting     Intelligence    Planning  │
│        ↓               ↓              ↓              ↓        │
│  5. Forecast      6. Scenario     7. S&OP         8. Performance│
│     Adjustment       Planning        Integration     Tracking  │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Forecast Entry, Scenario Model, Consensus Meeting Notes │
│ APIs: /api/forecasts, /api/scenarios, /api/demand-plans        │
└─────────────────────────────────────────────────────────────────┘
```

#### 14. Capacity Planning

```
┌─────────────────────────────────────────────────────────────────┐
│                 CAPACITY PLANNING PROCESS                       │
├─────────────────────────────────────────────────────────────────┤
│  1. Resource      2. Demand       3. Capacity     4. Bottleneck│
│     Inventory        Loading         Calculation     Analysis  │
│        ↓               ↓              ↓              ↓        │
│  5. Optimization  6. Shift        7. Outsourcing  8. Reporting │
│     Planning         Planning        Decisions       Dashboard │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Resource Register, Capacity Plan, Shift Schedule        │
│ APIs: /api/capacity, /api/resources, /api/shift-plans          │
└─────────────────────────────────────────────────────────────────┘
```

#### 15. Warehouse Management

```
┌─────────────────────────────────────────────────────────────────┐
│                 WAREHOUSE MANAGEMENT PROCESS                    │
├─────────────────────────────────────────────────────────────────┤
│  1. Inbound       2. Put-Away     3. Location     4. Pick      │
│     Receiving        Processing      Assignment      Wave Plan │
│        ↓               ↓              ↓              ↓        │
│  5. Packing       6. Shipping     7. Cycle        8. WMS       │
│     & Labeling       Dispatch        Counting        Analytics │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Inbound Receipt, Put-Away Task, Pick List, Ship Label   │
│ APIs: /api/warehouse, /api/locations, /api/shipments           │
└─────────────────────────────────────────────────────────────────┘
```

#### 16. Customer Returns (RMA)

```
┌─────────────────────────────────────────────────────────────────┐
│                 CUSTOMER RETURNS PROCESS                        │
├─────────────────────────────────────────────────────────────────┤
│  1. RMA           2. Return       3. Inspection   4. Disposition│
│     Request          Authorization   & Grading       Decision  │
│        ↓               ↓              ↓              ↓        │
│  5. Credit        6. Replacement  7. Inventory    8. Analytics │
│     Memo             Processing      Update          & Reports │
├─────────────────────────────────────────────────────────────────┤
│ Forms: RMA Request, Inspection Report, Credit Memo, Replacement│
│ APIs: /api/rma, /api/returns, /api/credit-memos                │
└─────────────────────────────────────────────────────────────────┘
```

#### 17. Vendor Performance

```
┌─────────────────────────────────────────────────────────────────┐
│                 VENDOR PERFORMANCE PROCESS                      │
├─────────────────────────────────────────────────────────────────┤
│  1. KPI           2. Data         3. Scorecard    4. Evaluation│
│     Definition       Collection      Calculation     Review    │
│        ↓               ↓              ↓              ↓        │
│  5. Feedback      6. Development  7. Tier         8. Strategic │
│     Session          Plans           Classification  Planning  │
├─────────────────────────────────────────────────────────────────┤
│ Forms: Vendor Scorecard, Evaluation Form, Development Plan     │
│ APIs: /api/vendor-performance, /api/scorecards, /api/evaluations│
└─────────────────────────────────────────────────────────────────┘
```

#### 18. Subscription Billing

```
┌─────────────────────────────────────────────────────────────────┐
│                 SUBSCRIPTION BILLING PROCESS                    │
├─────────────────────────────────────────────────────────────────┤
│  1. Plan          2. Customer     3. Usage        4. Invoice   │
│     Setup            Subscription    Metering        Generation│
│        ↓               ↓              ↓              ↓        │
│  5. Payment       6. Dunning      7. Renewal/     8. Revenue   │
│     Processing       Management      Churn           Recognition│
├─────────────────────────────────────────────────────────────────┤
│ Forms: Subscription Plan, Usage Record, Invoice, Payment Form  │
│ APIs: /api/subscriptions, /api/usage, /api/billing             │
└─────────────────────────────────────────────────────────────────┘
```

### Workflow Automation

#### Approval Workflows

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPROVAL WORKFLOW ENGINE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Trigger Event → Condition Check → Route to Approver           │
│                       ↓                   ↓                    │
│              Parallel Approval    Sequential Approval          │
│                       ↓                   ↓                    │
│              All Approve?          Next Level                  │
│                  ↓     ↓               ↓                       │
│               Approved  Rejected   Escalation                  │
│                                                                 │
│  Configuration Options:                                         │
│  - Amount-based routing (e.g., >$10K needs VP approval)        │
│  - Role-based routing (Manager → Director → VP)                │
│  - Department-based routing                                    │
│  - Time-based escalation                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Supported Workflow Types

| Workflow Type | Trigger | Actions |
|---------------|---------|---------|
| Purchase Approval | PO created | Route by amount, notify, approve/reject |
| Leave Approval | Leave request submitted | Route to manager, approve/reject |
| Expense Approval | Expense submitted | Amount-based routing, policy check |
| Invoice Approval | Invoice received | 3-way match, exception handling |
| Document Approval | Document uploaded | Review workflow, version control |
| Contract Approval | Contract drafted | Legal review, signature routing |

---

## Integrations

### Built-in Integrations

#### Payment Processing (LemonSqueezy)

```
┌─────────────────────────────────────────────────────────────────┐
│                   PAYMENT INTEGRATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NexusAIFirst ←→ LemonSqueezy                                  │
│                                                                 │
│  Checkout Flow:                                                │
│  1. User selects plan → /api/payments/checkout                 │
│  2. Redirect to LemonSqueezy checkout                          │
│  3. Webhook notification → /api/payments/webhook               │
│  4. Subscription activated                                     │
│                                                                 │
│  Products:                                                      │
│  - Starter: $29/month (3 users, 5GB storage)                   │
│  - Professional: $79/month (10 users, 25GB)                    │
│  - Enterprise: $199/month (unlimited)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**LemonSqueezy Configuration:**

| Setting | Description |
|---------|-------------|
| `LEMONSQUEEZY_API_KEY` | API key for LemonSqueezy integration |
| `LEMONSQUEEZY_STORE_ID` | Store identifier |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook signature verification |

**Webhook Events Handled:**
- `subscription_created` - New subscription activated
- `subscription_updated` - Plan change, renewal
- `subscription_cancelled` - Subscription terminated
- `subscription_payment_success` - Successful payment
- `subscription_payment_failed` - Failed payment (triggers dunning)

**Error Handling:**
- Failed payments trigger email notifications
- Subscription downgrades after 3 failed attempts
- Automatic retry with exponential backoff

#### AI Integration (OpenAI)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI INTEGRATION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Environment Variables:                                         │
│  - AI_INTEGRATIONS_OPENAI_BASE_URL                             │
│  - AI_INTEGRATIONS_OPENAI_API_KEY                              │
│                                                                 │
│  AI Copilot Features:                                          │
│  - Multi-agent architecture (Auditor, Planner, Executor)       │
│  - Context-aware responses                                      │
│  - Action execution (create entities via storage layer)        │
│  - RBAC-enforced actions                                       │
│  - Audit logging                                               │
│                                                                 │
│  Supported Actions:                                             │
│  - Create/update projects, tasks, leads, invoices              │
│  - Query data across modules                                   │
│  - Generate reports and analytics                              │
│  - Provide guidance and recommendations                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**OpenAI Configuration:**

| Setting | Description | Default |
|---------|-------------|---------|
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI API base URL | Replit AI Integrations |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | API key for authentication | Auto-provisioned |
| Model | GPT model used | gpt-4o |
| Max Tokens | Maximum response tokens | 4096 |
| Temperature | Response creativity | 0.7 |

**Multi-Agent Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-AGENT SYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Message → │                                              │
│                 ↓                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AUDITOR AGENT                              │   │
│  │  - System state audit                                   │   │
│  │  - Module mapping (27 modules)                         │   │
│  │  - Constraint detection                                │   │
│  │  - Gap analysis                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                 ↓                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              PLANNER AGENT                              │   │
│  │  - Intent classification                               │   │
│  │  - Execution plan design                               │   │
│  │  - RBAC validation (admin/editor/viewer)               │   │
│  │  - Dependency resolution                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                 ↓                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              EXECUTOR AGENT                             │   │
│  │  - Action execution via storage layer                  │   │
│  │  - Cross-module coordination                           │   │
│  │  - Audit logging (user, action, entity, outcome)       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                 ↓                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              VERIFIER AGENT                             │   │
│  │  - State validation                                    │   │
│  │  - Memory reconciliation                               │   │
│  │  - Conflict handling                                   │   │
│  │  - Factual feedback generation                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                 ↓                                              │
│  ← Response to User                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Supported AI Actions (CRUD Operations):**

| Module | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Projects | Yes | Yes | Yes | No |
| Tasks | Yes | Yes | Yes | No |
| Leads | Yes | Yes | Yes | No |
| Invoices | Yes | Yes | No | No |
| Employees | No | Yes | No | No |
| Inventory | No | Yes | Yes | No |

**Error Handling:**
- API rate limiting with exponential backoff
- Fallback to simpler responses on timeout
- Context persistence to localStorage (max 50 messages)
- Graceful degradation when AI unavailable

#### Authentication (Replit Auth)

```
┌─────────────────────────────────────────────────────────────────┐
│                 REPLIT AUTH INTEGRATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  OAuth 2.0 Flow:                                               │
│  1. User clicks Login                                          │
│  2. Redirect to Replit OAuth                                   │
│  3. User authorizes                                            │
│  4. Callback with auth code                                    │
│  5. Exchange for user info                                     │
│  6. Create/update user in database                             │
│  7. Create session                                             │
│                                                                 │
│  Session Management:                                            │
│  - Storage: PostgreSQL (connect-pg-simple)                     │
│  - Cookie: connect.sid                                         │
│  - Expiry: Configurable (default 24h)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Authentication Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Browser                     Server                   Replit   │
│    │                           │                         │     │
│    │──── GET /api/login ──────→│                         │     │
│    │                           │──── OAuth Redirect ────→│     │
│    │←── 302 Redirect ─────────│                         │     │
│    │                                                     │     │
│    │───────────────── User Authorizes ─────────────────→│     │
│    │                                                     │     │
│    │←────── GET /api/callback?code=xxx ──────────────────│     │
│    │                           │                         │     │
│    │                           │←── User Info (OpenID) ─│     │
│    │                           │                         │     │
│    │                           │── Create/Update User ──│     │
│    │                           │── Create Session ──────│     │
│    │                           │                         │     │
│    │←── 302 Redirect + Cookie ─│                         │     │
│    │                           │                         │     │
└─────────────────────────────────────────────────────────────────┘
```

**Session Configuration:**

| Setting | Value | Description |
|---------|-------|-------------|
| Cookie Name | `connect.sid` | Session identifier cookie |
| Storage | PostgreSQL | Session data persistence |
| Secret | `SESSION_SECRET` | Cookie signing secret |
| Secure | Production only | HTTPS-only cookies |
| httpOnly | Yes | Prevents XSS access |
| maxAge | 24 hours | Session expiration |
| sameSite | lax | CSRF protection |

**User Data Mapping (Replit → NexusAIFirst):**

| Replit Profile Field | NexusAIFirst Field | Type | Required | Notes |
|---------------------|-------------------|------|----------|-------|
| `sub` | `replitId` | string | Yes | Unique Replit user identifier |
| `preferred_username` | `username` | string | Yes | Display name in UI |
| `email` | `email` | string | No | Contact email, may be null |
| `profile_image` | `profileImageUrl` | string | No | Avatar URL, fallback to initials |
| - | `id` | serial | Auto | Internal database primary key |
| - | `role` | enum | Default: viewer | RBAC role (admin/editor/viewer) |
| - | `tenantId` | integer | Assigned | Multi-tenant organization ID |
| - | `createdAt` | timestamp | Auto | Account creation timestamp |
| - | `lastLoginAt` | timestamp | Auto | Last successful login |

**RBAC Role Assignment Logic:**
- First user in tenant → Assigned `admin` role
- Subsequent users → Assigned `viewer` role by default
- Role upgrades require admin action via Admin Console
- Platform admins can override any tenant's role assignments

**Error Handling Scenarios:**

| Error Scenario | HTTP Status | User Message | System Action |
|----------------|-------------|--------------|---------------|
| OAuth denial (user cancels) | 302 | "Login cancelled" | Redirect to landing page |
| Invalid authorization code | 400 | "Authentication failed" | Log error, show retry option |
| Replit API timeout | 503 | "Service temporarily unavailable" | Retry with backoff, fallback |
| Token exchange failure | 401 | "Could not verify identity" | Log details, redirect to login |
| Session store failure | 500 | "Login error occurred" | Alert ops, use memory fallback |
| Missing required fields | 400 | "Profile incomplete" | Request additional info |
| Duplicate replitId | 409 | N/A (transparent) | Merge with existing account |
| Session expired | 401 | "Session expired" | Redirect to /api/login |
| Cookie tampered | 403 | "Security error" | Destroy session, log incident |

**Logging and Monitoring:**
- All auth events logged to `audit_logs` table
- Failed attempts tracked for rate limiting (5 per minute)
- Session creation/destruction logged with IP and user agent
- OAuth errors forwarded to monitoring dashboard

### Third-Party Integration Points

| Integration Category | Available Connectors |
|---------------------|---------------------|
| **CRM** | Salesforce, HubSpot, Zoho CRM |
| **ERP** | SAP, Oracle, Microsoft Dynamics |
| **Accounting** | QuickBooks, Xero, Sage |
| **E-Commerce** | Shopify, WooCommerce, Magento |
| **Communication** | Slack, Microsoft Teams, Discord |
| **Email** | SendGrid, Mailchimp, Mailgun |
| **Cloud Storage** | AWS S3, Google Cloud, Azure |
| **Analytics** | Google Analytics, Mixpanel, Amplitude |

### Webhook System

```
Outgoing Webhooks:
- Entity created/updated/deleted events
- Workflow status changes
- Payment events
- User activity events

Incoming Webhooks:
- Payment gateway callbacks
- Third-party integration events
- External system notifications
```

---

## Role-Based Access Control

### Permission Matrix

| Resource | Admin | Editor | Viewer |
|----------|-------|--------|--------|
| Dashboard | Full | Full | View |
| CRM - Leads | CRUD | CRUD | View |
| CRM - Opportunities | CRUD | CRUD | View |
| Finance - Invoices | CRUD | CRUD | View |
| Finance - GL | CRUD | CRU | View |
| HR - Employees | CRUD | CRU | View |
| HR - Payroll | CRUD | View | No Access |
| Manufacturing | CRUD | CRUD | View |
| Projects | CRUD | CRUD | View |
| Reports | CRUD | CRU | View |
| Admin Console | Full | No Access | No Access |
| User Management | Full | No Access | No Access |
| System Settings | Full | No Access | No Access |
| AI Copilot - Info | Full | Full | Full |
| AI Copilot - Actions | Full | Full | No Access |

### Role Hierarchy

```
Platform Admin
    └── Tenant Admin
          ├── Admin (full tenant access)
          ├── Manager (department access + approvals)
          ├── Editor (create/update access)
          └── Viewer (read-only access)
```

### Conditional Access Rules

| Condition | Access Rule |
|-----------|------------|
| Own records only | Users can only see/edit their own created records |
| Department-based | Access restricted to user's department |
| Amount threshold | Approvals required above certain amounts |
| Time-based | Access restricted during business hours |
| Geographic | Access from approved locations only |

---

## Data Flows

### Frontend to Backend Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  React Component                                                │
│       ↓                                                        │
│  TanStack Query (useQuery/useMutation)                         │
│       ↓                                                        │
│  apiRequest (lib/queryClient.ts)                               │
│       ↓                                                        │
│  HTTP Request (fetch)                                          │
│       ↓                                                        │
│  ═══════════════ Network ═══════════════                       │
│       ↓                                                        │
│  Express Router (server/routes.ts)                             │
│       ↓                                                        │
│  Middleware Stack                                              │
│  - Session validation                                          │
│  - RBAC check                                                  │
│  - Request validation (Zod)                                    │
│       ↓                                                        │
│  Storage Layer (server/storage.ts)                             │
│       ↓                                                        │
│  Drizzle ORM                                                   │
│       ↓                                                        │
│  PostgreSQL Database                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Entity Relationships

```
User
  ├── has many → Projects
  ├── has many → Tasks (assigned)
  ├── has many → Leads (created)
  ├── belongs to → Tenant
  └── has role → Role

Tenant
  ├── has many → Users
  ├── has many → Industry Deployments
  └── has many → All business entities

Project
  ├── has many → Tasks
  ├── has many → Milestones
  ├── has many → Time Entries
  └── belongs to → User (owner)

Invoice
  ├── belongs to → Customer
  ├── has many → Line Items
  └── belongs to → User (created by)

Work Order
  ├── belongs to → Production Order
  ├── belongs to → Work Center
  └── has many → Quality Inspections
```

---

## AI Copilot Interactions

### Multi-Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   AI COPILOT ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Input → Mode Detection                                   │
│                    ↓                                           │
│           ┌───────────────┐                                    │
│           │ Info Mode     │ ← No auth required                 │
│           │ (questions)   │                                    │
│           └───────┬───────┘                                    │
│                   │                                            │
│           ┌───────┴───────┐                                    │
│           │ Action Mode   │ ← Auth required                    │
│           │ (create/edit) │                                    │
│           └───────────────┘                                    │
│                   ↓                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              MULTI-AGENT PROCESSING                     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  AUDITOR AGENT                                          │   │
│  │  - System audit                                         │   │
│  │  - Module mapping                                       │   │
│  │  - Constraint detection                                 │   │
│  │  - Gap analysis                                         │   │
│  │           ↓                                             │   │
│  │  PLANNER AGENT                                          │   │
│  │  - Intent classification                                │   │
│  │  - Execution plan design                                │   │
│  │  - RBAC validation                                      │   │
│  │  - Dependency resolution                                │   │
│  │           ↓                                             │   │
│  │  EXECUTOR AGENT                                         │   │
│  │  - Action execution via storage layer                   │   │
│  │  - Cross-module coordination                            │   │
│  │  - Audit logging                                        │   │
│  │           ↓                                             │   │
│  │  VERIFIER AGENT                                         │   │
│  │  - State validation                                     │   │
│  │  - Memory reconciliation                                │   │
│  │  - Conflict handling                                    │   │
│  │  - Factual feedback                                     │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                   ↓                                            │
│  Response + Action Result                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Supported AI Actions

| Action Type | Entity | Example Command | API Called |
|-------------|--------|-----------------|------------|
| Create | Project | "Create a new marketing project" | POST /api/projects |
| Create | Task | "Add a task to review the budget" | POST /api/tasks |
| Create | Lead | "Create a lead for John Smith" | POST /api/leads |
| Create | Invoice | "Generate an invoice for $5,000" | POST /api/invoices |
| Query | Dashboard | "Show me today's sales metrics" | GET /api/crm/metrics |
| Report | Analytics | "Generate a monthly revenue report" | GET /api/reports |
| Update | Task | "Mark task #42 as complete" | PATCH /api/tasks/:id |

### AI Copilot Access Flow

```
1. User clicks AI Copilot button (bottom-right corner)
2. Chat panel opens
3. User types message
4. System detects mode (info vs action)
5. If action mode:
   a. Check authentication
   b. If not authenticated → Error: "Please log in"
   c. If authenticated → Process with multi-agent system
6. Execute action via storage layer
7. Log action to audit trail
8. Return response with action details
```

### Context Persistence

- Conversation history stored in localStorage (max 50 messages)
- Context includes: current page, user role, tenant, recent actions
- Session-only authentication (role from server session)

---

## Appendix

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Session encryption key | Yes |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API key | For AI features |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI base URL | For AI features |
| `LEMONSQUEEZY_API_KEY` | Payment processing key | For payments |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook verification | For payments |
| `REPLIT_DEPLOYMENT_URL` | Deployment URL | Auto-set |

### Database Schema Summary

| Table | Description | Key Fields |
|-------|-------------|------------|
| `users` | User accounts | id, email, role, tenantId |
| `sessions` | Session storage | sid, sess, expire |
| `tenants` | Multi-tenant orgs | id, name, industry |
| `projects` | Project records | id, name, status, userId |
| `tasks` | Task items | id, title, projectId, assigneeId |
| `leads` | CRM leads | id, name, email, status |
| `invoices` | Invoice records | id, customerId, total, status |
| `employees` | HR employee data | id, name, department, salary |
| `inventory` | Inventory items | id, sku, name, quantity |
| `work_orders` | Manufacturing WOs | id, product, quantity, status |

### Quick Reference URLs

| Resource | URL |
|----------|-----|
| Landing Page | `/` |
| Dashboard | `/dashboard` |
| CRM Module | `/crm` |
| ERP Module | `/erp` |
| HR Module | `/hr` |
| Process Hub | `/processes` |
| Admin Console | `/admin` |
| Settings | `/settings` |
| API Documentation | `/docs/api` |
| Training Content | `/training` |

---

*Document Version: 1.0*
*Last Updated: December 2025*
*Platform: NexusAIFirst Enterprise ERP*
