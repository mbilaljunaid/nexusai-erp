# Design Guidelines: NexusAI - Ultimate AI-First Enterprise Platform

## Design Approach

**Selected Approach:** Enterprise SaaS Design System - Modern Material Design 3 with Industry-Aware Module Navigation

**Rationale:** This is a comprehensive, multi-domain enterprise platform serving 15+ industries with 40+ integrated modules. The design must balance complexity with clarity, support rapid module switching, and showcase AI capabilities across all functions. Drawing from enterprise patterns (Salesforce, Oracle Cloud, NetSuite) combined with modern SaaS efficiency (Linear, Notion, Slack).

**Core Principles:**
- **Industry-Aware Navigation:** Quick access to industry-specific modules and solutions
- **Modular Architecture:** Clear separation and grouping of ERP, CRM, HR, Finance, Project, etc.
- **AI-First Design:** AI capabilities surface contextually in every module
- **Information Clarity:** Dense but scannable data hierarchies with clear action paths
- **Unified Experience:** Consistent interactions across all 40+ modules
- **Dark/Light Mode:** Professional appearance that adapts to user preference
- **Accessibility:** Full keyboard navigation, screen reader support, high contrast

---

## Navigation & Module Structure

### Primary Navigation (Sidebar)

**Top Section - Core Platforms (Collapsible Groups):**
- **Dashboard** - Cross-module unified overview with industry KPIs
- **ERP/Finance** - GL, AP/AR, Assets, Procurement, Inventory
- **CRM/Sales** - Leads, Opportunities, Accounts, CPQ, Territory Management
- **Project & Portfolio** - Projects, Tasks, Resources, Portfolio Analysis
- **HRMS/Talent** - Employees, Recruitment, Payroll, L&D, Performance
- **Service & Support** - Ticketing, Field Service, Knowledge Base, Chat
- **Marketing & Web** - Campaigns, Automation, Website Builder, E-Commerce
- **Analytics & BI** - Dashboards, Reports, Predictive Analytics, KPIs
- **Collaboration** - Chat, Wiki, Documents, Calendar, Tasks
- **Compliance & Audit** - Governance, Audit Trails, Compliance Monitoring

**Mid Section - Industry Solutions:**
- **Manufacturing** - Production, Maintenance, Quality, Demand Planning
- **Retail & E-Commerce** - POS, Omni-channel, Inventory, Loyalty
- **Wholesale & Distribution** - Logistics, Warehousing, Procurement
- **Financial Services** - Risk, Portfolio, Loans, Regulatory Compliance
- **Healthcare** - Patient Mgmt, Clinical Data, Billing, Regulatory
- **Construction & Real Estate** - Projects, Budgeting, Property Mgmt
- **Education** - Student Mgmt, Curriculum, Assessments, Admissions
- **And 8+ more industries...**

**Bottom Section - System:**
- **Business Process Mapping** - Visual workflow designer, optimization engine
- **Integration Hub** - Connectors, APIs, Automation workflows
- **System Health** - Self-healing monitoring, diagnostics
- **Settings** - Localization, Security, AI Preferences, Profile

### Secondary Navigation (Breadcrumb + Module Switcher)
- Show current module path
- Quick module search/switcher (Cmd+K)
- AI Context indicator

---

## Typography

**Font Stack:**
- **Primary:** Inter 300-700 - clarity across data-dense interfaces
- **Monospace:** JetBrains Mono 400-600 - numerical data, codes, IDs

**Hierarchy:**
- **Page Title:** text-3xl font-semibold (30px) - Major section header (ERP, CRM, etc.)
- **Module Header:** text-2xl font-semibold (24px) - Module-specific headers
- **Card Title:** text-lg font-semibold (18px) - Widget/card headers
- **Body Large:** text-base font-medium (16px) - Primary content, form labels
- **Body:** text-sm (14px) - Table content, descriptions
- **Body Small:** text-xs (12px) - Metadata, timestamps, secondary info
- **Label:** text-xs font-medium uppercase tracking-wide - Status badges, categories

---

## Layout System

**Spacing:** 2, 3, 4, 6, 8, 12, 16 (Tailwind units)

**Common Patterns:**
- Component padding: p-4 to p-6
- Section spacing: space-y-6 or space-y-8
- Card padding: p-6
- Form spacing: space-y-4
- Grid gaps: gap-4 to gap-6
- Page margins: px-6 to px-8

**Sidebar + Main Structure:**
- Sidebar: Fixed 16rem (w-64) desktop, collapsible mobile
- Main content: flex-1 with max-width container
- Header: Fixed h-14, sticky with subtle shadow

**Module-Specific Layouts:**
- **Dashboard:** 12-column grid for flexible metric cards and charts
- **Data Tables:** Full-width with horizontal scroll, alternating row colors
- **Forms:** Two-column on desktop, single-column mobile
- **Detail Pages:** 70/30 split (detail + sidebar) or full-width tabs

---

## Component Library

### Module Cards (Cross-Module Navigation)
- Icon + Module Name + Quick Stats + Status
- Hover shows quick actions
- Accessible from dashboard and module switcher

### Data Tables (Standardized Across Modules)
- Sticky header with sort indicators
- Row actions on hover (Edit, More)
- Bulk selection with toolbar
- Column visibility toggle
- Pagination with configurable row count
- Empty states with helpful CTAs

### Forms (Configuration & Data Entry)
- Labels above inputs (not floating)
- Consistent h-10 to h-12 input heights
- Grouped sections with subtle borders
- Error states: red border + message below
- Helper text: text-xs below input
- Validation on blur/submit with clear messaging

### Status Indicators (Industry-Specific)
- ERP: Draft, Posted, Reviewed, Approved, Paid, Shipped
- CRM: New, Contacted, Qualified, Proposal, Won, Lost
- HR: Active, Offer, Inactive, Retired
- Project: On Track, At Risk, Delayed, Completed
- Color scheme consistent across all modules

### AI Components
- **Copilot Suggestions:** Distinct visual treatment with sparkle icon
- **Predicted Insights:** "AI Forecast" badge with confidence level
- **Auto-Actions:** Show "AI Generated" label with option to edit/approve
- **Recommended Next Steps:** Card with icon, description, CTA

---

## Color System

### Base Colors
- **Background:** Light: 0 0% 100% | Dark: 220 13% 9%
- **Surface (Cards):** Light: 0 0% 98% | Dark: 220 13% 11%
- **Primary (AI/Actions):** 217 91% 60% (Blue) - Represents AI-first nature
- **Secondary (Secondary Actions):** 220 8% 90%

### Status Colors (Consistent Across Modules)
- **Success/Approved:** 142 76% 36% (Green)
- **Warning/At Risk:** 36 100% 50% (Orange)
- **Error/Critical:** 0 84% 60% (Red)
- **Info/Neutral:** 220 13% 75% (Gray-Blue)
- **Pending/Draft:** 271 81% 56% (Purple)

### Module Color Coding (Optional)
- ERP/Finance: Teal - 187 100% 42%
- CRM/Sales: Blue - 217 91% 60%
- HR/Talent: Green - 142 76% 36%
- Projects: Orange - 36 100% 50%
- Compliance: Red - 0 84% 60%
- Analytics: Purple - 271 81% 56%
- Marketing: Pink - 339 90% 51%
- Service: Cyan - 198 93% 60%

---

## Animations

**Minimal, purposeful transitions (200-300ms):**
- Sidebar collapse/expand: 200ms ease
- Modal open/close: 200ms scale from 95% to 100%
- Menu open: 150ms fade in
- Toast notifications: 300ms slide from right
- Data loading: Skeleton screens (no spinners on tables)
- Hover: Instant (no delay)

---

## Responsive Design

**Breakpoints:**
- Mobile: < 640px (Single column, stacked)
- Tablet: 640px - 1024px (Two columns)
- Desktop: > 1024px (Three+ columns, full layout)

**Sidebar Behavior:**
- Desktop: Always visible
- Tablet: Collapsible to icons (w-16)
- Mobile: Hidden behind hamburger, full-width drawer

---

## Dark Mode

**Implementation:**
1. CSS custom properties in :root and .dark
2. Explicit light/dark variants for all visuals
3. Reduced contrast in dark mode for eyes
4. Toggle in header (previously: SidebarTrigger, now: Global Header)
5. localStorage sync for persistence

**Key Adjustments:**
- Backgrounds darker for reduced eye strain
- Text lighter for readability
- Borders subtly visible without glare
- Status colors slightly adjusted (less saturation in dark)

---

## Enterprise-Specific Patterns

### Multi-Tenant/Multi-Company Navigation
- Company/Tenant switcher in header
- Fiscal period selector for Finance modules
- Legal entity filter for Compliance modules
- Role-based menu filtering (users see only accessible modules)

### Workflow Indicators
- Current step highlighted in workflow visualization
- Approval chains show pending/completed
- Escalation paths clearly visible
- SLA status with time remaining (color-coded)

### Industry-Specific Dashboards
Each industry has pre-built KPI dashboard:
- **Manufacturing:** Production efficiency, OEE, downtime, quality metrics
- **Retail:** Sales by location, inventory turnover, customer lifetime value
- **Finance:** Cash flow, AR aging, Expense ratios, Budget variance
- **Healthcare:** Patient census, billing status, compliance alerts
- **HR:** Headcount, turnover, open positions, engagement scores

---

## Accessibility

**WCAG 2.1 AA Compliance:**
- Color not only means of communication (icons + text)
- Sufficient color contrast (4.5:1 for text)
- Keyboard navigation on all interactive elements
- Focus indicators clearly visible
- Screen reader support (semantic HTML, aria labels)
- All forms accessible via keyboard
- Images have alt text
- Links have descriptive text

---

## Performance Considerations

- **Module Lazy Loading:** Only load visible module data
- **Virtual Scrolling:** For tables with 1000+ rows
- **Progressive Enhancement:** Basic functionality works without JS
- **Asset Optimization:** Images optimized, fonts preloaded
- **Caching Strategy:** Local caching for frequently accessed data

---

This design system supports rapid expansion from 2-3 modules to 40+, maintains consistency across industries, and keeps AI capabilities visible and accessible throughout the platform.
