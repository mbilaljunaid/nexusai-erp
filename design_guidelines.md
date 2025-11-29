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
- **Section Title:** text-base font-semibold (16px) - Tab headers, subsections
- **Body Large:** text-base font-medium (16px) - Primary content, form labels
- **Body:** text-sm (14px) - Table content, descriptions, list items
- **Body Small:** text-xs (12px) - Metadata, timestamps, secondary info
- **Label:** text-xs font-medium uppercase tracking-wide - Status badges, categories
- **Monospace Data:** text-sm font-mono - Currency, IDs, technical values

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

### Module-Specific Components

**ERP/Finance:**
- GL Entry form with account hierarchy selector
- Invoice tables with aging indicators
- Bank reconciliation matching interface
- Budget variance charts with drill-down
- Cost center hierarchical selector
- Multi-currency conversion displays
- Period close checklist and status tracking
- Journal consolidation workflow
- Reconciliation matching interface (2-way, 3-way)
- Financial statement builder (P&L, BS, CF)

**CRM/Sales:**
- Kanban pipeline board (draggable opportunities)
- Lead scoring progress bars with AI badge
- Sales pipeline waterfall chart
- Territory map visualization
- Account health scorecard (red/yellow/green)
- Opportunity risk indicators

**HR/Talent:**
- Org chart interactive visualization
- Employee profile tabs (personal, employment, performance, development)
- Recruitment kanban (application pipeline stages)
- Payroll processing status dashboard
- Goal alignment tree
- Performance review scorecard

**Project Management:**
- Gantt chart with dependencies
- Resource allocation heatmap
- Budget vs. actual spending trends
- Risk register with scores
- Task kanban board
- Milestone timeline

**Service & Support:**
- Ticket dashboard with SLA status (color-coded time remaining)
- Field service map with technician locations
- Knowledge base search with AI suggestions
- Ticket detail with activity timeline
- Customer sentiment analysis indicators
- Support case SLA compliance gauge

**Marketing Automation:**
- Campaign kanban by status
- Email template visual editor (drag-drop blocks)
- Lead nurture flow builder (visual workflow)
- Audience segment builder with rule conditions
- Campaign performance metrics (open/click rates)
- A/B test variant comparison

**Website & E-Commerce:**
- Page builder canvas with live preview
- Product catalog with inventory levels
- Shopping cart preview with totals
- Order detail with fulfillment timeline
- Customer segment cards
- Conversion funnel visualization

**Analytics & BI:**
- Dashboard canvas with widget library
- KPI scorecard cards (value, target, variance, trend)
- Interactive charts (line, bar, pie, waterfall)
- Report builder with dimension/metric selection
- Data grid with Excel-like editing
- Drill-down navigation

**EPM (Enterprise Performance Management):**
- Budget entry grid (hierarchical: Company → Dept → Cost Center → Account)
- Monthly/quarterly input fields with AI growth suggestions
- Forecast dashboard with accuracy metrics (MAPE, Tracking Signal)
- Scenario builder with driver-based adjustments
- Consolidation workflow: Collect → Validate → Match → FX → Eliminate
- Multi-entity hierarchy tree with ownership percentages
- FX translation dashboard with rate management
- Variance analysis dashboard (Budget vs Actual color-coded by threshold)
- Rolling forecast submission workflow with approvals
- What-if analysis with interactive sliders
- Waterfall charts showing impact breakdown
- Consolidation elimination entry form
- Plan cycle tracking and KPI dashboards

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
Each of 15+ industries has pre-built KPI dashboard:
- **Manufacturing (Discrete & Process):** Production efficiency, OEE, downtime, quality metrics, demand forecasting
- **Retail & E-Commerce:** Sales by location, inventory turnover, customer lifetime value, omni-channel performance
- **Financial Services:** Cash flow, AR aging, expense ratios, budget variance, risk scores, fraud detection
- **Healthcare & Life Sciences:** Patient census, billing status, compliance alerts, clinical data management
- **HR & Talent:** Headcount, turnover, open positions, engagement scores, attrition risk
- **Construction & Real Estate:** Project timeline variance, budget utilization, resource allocation, risk scoring
- **Education & Training:** Student performance, enrollment pipeline, curriculum coverage, assessment results
- **Wholesale & Distribution:** Demand forecasting, warehouse utilization, logistics efficiency, supplier performance
- **Telecommunications:** Network load prediction, service delivery KPIs, ticketing volume, field operations
- **Energy & Utilities:** Demand forecasting, distribution optimization, asset utilization, compliance metrics
- **Hospitality & Travel:** Occupancy rates, booking trends, guest experience scores, revenue per available room
- **Professional Services:** Project profitability, billable utilization, resource capacity, client satisfaction
- **Technology & IT Services:** Project delivery metrics, resource utilization, support ticket resolution
- **Media & Entertainment:** Content performance, audience engagement, revenue tracking, scheduling
- **Agriculture & Food Processing:** Yield forecasting, supply chain efficiency, quality metrics, inventory levels

**Industry-Aware Features:**
- Pre-built workflows specific to industry
- Industry-specific KPIs and metrics
- Compliance templates (GDPR, HIPAA, SOX, FDA, ISO)
- Regulatory requirement tracking
- Industry benchmark comparisons

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
- **Skeleton Loading:** Placeholder blocks while data loads

---

## Configuration vs. Data Forms Pattern

**Configuration Forms (Admin/Setup):**
- Accessed from Settings or module admin panels
- Field validation rules editor, workflow builders, KPI selectors
- Apply to entire organization/tenant
- Audit trails of changes
- Version history
- Examples: Chart of Accounts setup, Territory rules, SLA templates

**Data Entry Forms:**
- Primary workflow forms for end users
- Quick entry with AI auto-suggestions
- Bulk upload support
- Inline validation
- Smart defaults
- AI-assisted field population
- Examples: GL entry, Opportunity creation, Invoice entry

---

## Multi-Tenant Data Isolation Design

**Visual Indicators:**
- Active tenant badge in header (e.g., "Acme Corp (US)")
- Tenant-specific color scheme/branding
- Fiscal period selector (Finance modules)
- Legal entity filter (Compliance modules)

**Data Access Patterns:**
- All data filtered by active tenant at database level
- Cross-tenant searches blocked
- Audit logs show tenant context
- Backup/restore per tenant

**Tenant Admin Console:**
- User management (within tenant)
- Module access control
- Custom fields configuration
- Branding (logo, colors)
- Data retention policies
- Billing information

---

## Localization & Multi-Language Design

**Language Support:** 25+ languages including RTL (Arabic, Hebrew)

**Localization Points:**
1. UI labels, buttons, menu items (all translated)
2. Date/time display (locale-aware formatting)
3. Number formatting (1,234.56 vs 1.234,56)
4. Currency display and conversion
5. Tax configurations by region
6. Industry-specific regulations per country
7. Form field ordering (some cultures prefer different field sequence)
8. Right-to-left layout mirroring (Arabic, Hebrew)
9. AI content generation in user's language
10. Reports and data exports in locale format

**User Settings:**
- Language preference (saved to profile)
- Timezone selection (auto-populated from browser)
- Date format preference
- Number/currency format
- Measurement units (metric vs imperial)

---

## AI-First Design Patterns

**Global AI Copilot (Floating button, bottom-right)**
- Chat interface with context awareness
- Voice command support (optional)
- Persists across module navigation
- Shows conversation history

**Module-Level AI Insights:**
- Dashboard cards showing AI recommendations
- Contextual suggestions in forms
- Anomaly detection notifications
- Process optimization recommendations

**AI Auto-Features:**
- Field auto-population from related records
- Smart defaults based on historical patterns
- Predicted next steps/actions
- Suggested workflow routing
- Auto-reconciliation suggestions
- Predictive analytics and forecasting

**Confidence Indicators:**
- AI suggestions include confidence %
- "High confidence" vs "Low confidence" labels
- Explainability: "Why did AI suggest this?"

---

## Form Design Patterns

**Configuration Form (Visual):**
```
[Section Header - Styled Border]
  Field 1: [Input] [Helper text]
  Field 2: [Dropdown] [Helper text]
  
  [Rule Builder Card]
  [+ Add Rule] button
  
[Save] [Cancel] buttons
```

**Data Entry Form (Quick & Efficient):**
```
[Quick Entry Tab | Advanced Tab]

Quick Entry (Pre-filled from context):
  Field 1: [Input - Auto-focused]
  Field 2: [AI Suggestion chip]
  [Submit] [Learn More about AI]

Advanced Tab:
  Multiple field groups
  [Save as Template]
```

---

## Table Design Patterns (Standardized Across Modules)

**Header Row:**
- Sticky, with subtle shadow
- Sort indicators (↑↓ icon on sortable columns)
- Column visibility toggle menu
- Bulk select checkbox

**Data Rows:**
- Alternating row colors for readability
- Hover reveals quick actions (Edit, More menu)
- Color-coded status (using module-specific status colors)
- Monospace font for numerical data

**Empty States:**
- Icon + descriptive message
- CTA button ("Create first record", "Import data")
- Link to help/tutorial

**Pagination:**
- Show "X of Y records" or "Showing X-Y of Z"
- Previous/Next buttons
- Optional: Jump to page input

---

## Mobile Design Adaptation

**Navigation on Mobile:**
- Hamburger menu (sidebar becomes drawer)
- Bottom tab bar for main modules
- Search remains prominent in header

**Dashboard Cards:**
- Stack to single column
- Font sizes scaled down
- Charts remain readable (responsive SVG)

**Tables on Mobile:**
- Either: Horizontal scroll with bold column
- Or: Card view (each row becomes a card)
- Swipe actions for quick operations

**Forms on Mobile:**
- Single column layout
- Full-width inputs
- Large touch targets (min 44x44px)
- Mobile keyboard optimization (correct input types)

---

## Notification & Alert System Design

**Toast Notifications (Bottom-right, 4sec auto-dismiss):**
- Success (green): "Invoice posted successfully"
- Error (red): "Failed to save - check connection"
- Info (blue): "AI is analyzing this lead..."
- Warning (orange): "This customer has overdue invoices"

**Notification Bell (Persistent):**
- Badge count of unread
- Grouped notifications
- Clear all option
- Settings to manage frequency

**In-Modal Alerts:**
- Form validation errors (inline + banner)
- Confirmation dialogs for destructive actions
- AI processing progress (spinner or percentage)

**Email Notifications:**
- Critical alerts (immediate)
- Daily digest (low-priority items)
- Weekly summary
- User-configurable preferences

---

## Search & Discovery Design

**Global Search (Cmd+K or magnifying glass icon):**
- Autocomplete with module icons
- Recent searches
- "Search across all modules" toggle
- Detailed results page with filters

**Module-Level Filtering:**
- Sidebar filters (collapsible sections)
- Filter chips showing active filters (removable)
- "Save filter set" for frequently used filters
- "Clear all filters" button

**Smart Filters (AI-assisted):**
- "Show me..." natural language suggestions
- Based on user's role and history
- Example: "Show me all overdue invoices from manufacturing clients"

---

This design system supports 40+ modules across 15+ industries, maintains consistency across all experiences, and integrates AI capabilities throughout. Ready for implementation in React with Tailwind CSS.
