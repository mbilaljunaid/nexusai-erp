# Design Guidelines: AI-First CRM & Project Management Platform

## Design Approach

**Selected Approach:** Design System - Material Design 3 with Modern Enterprise SaaS Influences

**Rationale:** This is a productivity-focused, information-dense enterprise application requiring efficiency, scalability, and professional trustworthiness. Drawing from Material Design 3's robust component system combined with modern SaaS patterns from Linear, Notion, and modern Salesforce.

**Core Principles:**
- Information clarity over visual flair
- Scannable data hierarchies with clear action paths
- Consistent, predictable interactions across modules
- AI capabilities surface contextually, never obtrusive
- Professional polish that builds enterprise trust

---

## Typography

**Font Stack:**
- **Primary:** Inter (via Google Fonts) - exceptional legibility for data-heavy interfaces
- **Monospace:** JetBrains Mono - for numerical data, IDs, technical values

**Hierarchy:**
- **Page Titles:** text-3xl font-semibold (30px) - Major section headers
- **Section Headers:** text-2xl font-semibold (24px) - Dashboard widgets, card groups
- **Subsections:** text-xl font-medium (20px) - Table headers, card titles
- **Body Large:** text-base font-medium (16px) - Primary content, form labels
- **Body:** text-sm (14px) - Table content, descriptions, metadata
- **Body Small:** text-xs (12px) - Secondary metadata, timestamps, badges
- **Micro:** text-xs font-medium uppercase tracking-wide - Category labels, status indicators

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 3, 4, 6, 8, 12, 16** for consistency

**Common Patterns:**
- Component padding: p-4 to p-6
- Section spacing: space-y-6 or space-y-8
- Card internal spacing: p-6
- Form field spacing: space-y-4
- Grid gaps: gap-4 to gap-6
- Page margins: px-6 to px-8

**Grid System:**
- Main dashboard: 12-column grid (grid-cols-12)
- Metric cards: 4-column on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Data tables: Full-width with responsive horizontal scroll
- Sidebar navigation: Fixed 256px (w-64) on desktop, drawer on mobile

**Container Strategy:**
- App shell: Fixed sidebar + flex-1 main content area
- Content max-width: max-w-7xl with px-6
- Modal/Dialog max-width: max-w-2xl to max-w-4xl based on content

---

## Component Library

### Navigation & Shell

**Top Navigation Bar:**
- Height: h-16
- Contains: Logo, global search, notifications, AI assistant toggle, user menu
- Search: Prominent with kbd shortcuts displayed (⌘K)
- Layout: Sticky with subtle shadow on scroll

**Sidebar Navigation:**
- Collapsible with icon-only compact mode
- Sections: Dashboard, CRM, Projects, Analytics, Settings
- Active state: Subtle background fill with left border accent
- Sub-navigation: Nested items with indent

### Dashboard Components

**Metric Cards:**
- Layout: Grid with 2-4 columns responsive
- Structure: Icon + Label + Large Value + Trend Indicator + Sparkline
- Padding: p-6, rounded-lg with subtle border
- Trend: Small arrow + percentage with micro text

**Charts & Analytics:**
- Full-width or 2-column grid layouts
- Headers: Title + date range selector + export action
- Card-based: p-6, clear legends, axis labels
- Use Chart.js or Recharts for consistency

**Activity Feed:**
- Timeline-style with left border accent
- Items: Avatar + Name + Action + Timestamp + Object
- Infinite scroll with loading states
- Spacing: space-y-3 between items

### CRM Module

**Lead/Contact Cards:**
- Compact card view for grid layouts
- Structure: Avatar/Logo + Name + Company + Status Badge + Lead Score (AI-powered with star rating)
- Quick actions: Call, Email, Task icons on hover
- Click: Opens detail slideover panel

**Detail Slideover:**
- Width: Fixed 640px from right edge
- Sections: Header + Tabs (Overview, Activity, Tasks, Notes) + Related items
- AI Insights: Dedicated expandable section with suggestions
- Scrollable content with sticky header

**Lead Scoring Visual:**
- Horizontal progress bar or circular gauge
- AI confidence indicator badge
- Explanatory tooltip on hover

### Project Management Module

**Task Lists:**
- Table view with sortable columns: Task, Assignee, Due Date, Priority, Status
- Row actions: Edit, Assign, Archive (icons, revealed on hover)
- Bulk selection with checkbox column
- Grouping: By project, assignee, or status with collapsible sections

**Kanban Board:**
- Columns: 3-5 status columns (To Do, In Progress, Review, Done)
- Cards: Compact with title, assignee avatar, due date, priority indicator
- Drag-and-drop with visual feedback
- Column max-height with internal scroll

**Resource Allocation View:**
- Timeline chart showing team member capacity (horizontal bars)
- AI-suggested optimal assignments highlighted
- Filters: Team, date range, project

**Project Cards:**
- Grid: 2-3 columns on desktop
- Structure: Project name + Progress bar + Team avatars + Key metrics (tasks, deadline)
- Status indicators: On track / At risk / Delayed with semantic meaning

### Forms & Inputs

**Form Layout:**
- Labels above inputs (not floating)
- Input height: h-10 to h-12 for comfortable touch targets
- Consistent spacing: space-y-4 between fields
- Grouping: Related fields in bordered sections with p-4

**Input Styling:**
- Border: 1px solid with rounded-md
- Focus: Ring with offset for accessibility
- Error states: Red border + error message below
- Helper text: text-xs below input

**Buttons:**
- Primary: px-4 py-2, rounded-md, font-medium
- Secondary: Same size, outlined variant
- Icon buttons: Square aspect ratio (h-10 w-10)
- Loading states: Spinner inside button with disabled state

### AI Assistant Components

**Chat Interface:**
- Fixed bottom-right corner or slideover panel
- Message bubbles: User (right-aligned) vs AI (left-aligned)
- Typing indicator with animated dots
- Quick suggestion chips for common queries
- Input: Multi-line with send button

**AI Insights Cards:**
- Distinct visual treatment (subtle gradient background or icon)
- Structure: Icon + Insight title + Description + CTA ("View details" / "Apply suggestion")
- Dismissible with × icon
- Spacing: Appear contextually in relevant sections

### Data Tables

**Structure:**
- Sticky header with sort indicators
- Alternating row backgrounds for scannability
- Row height: h-12 to h-14
- Pagination: Bottom with page numbers + rows per page selector
- Empty states: Centered with illustration + helpful CTA

**Table Actions:**
- Row-level: Hover shows action icons (Edit, Delete, More)
- Bulk: Checkbox selection with action toolbar appearing above table
- Column controls: Show/hide columns dropdown

### Dialogs & Modals

**Modal Styling:**
- Overlay: Semi-transparent backdrop
- Content: Centered, max-w-md to max-w-4xl based on content
- Padding: p-6 with clear close button (top-right)
- Footer: Sticky with action buttons right-aligned

**Confirmation Dialogs:**
- Icon + Title + Description + Primary/Secondary actions
- Destructive actions: Clear warning with emphasized cancel option

### Status & Notifications

**Badges:**
- Pill-shaped with rounded-full
- Sizes: px-2 py-0.5 (small), px-3 py-1 (medium)
- Text: text-xs font-medium uppercase

**Toast Notifications:**
- Top-right corner, stacked
- Auto-dismiss after 5s with progress bar
- Types: Success, Error, Warning, Info with corresponding icons

**Progress Indicators:**
- Linear: Full-width bar for page loading
- Circular: For button loading states
- Skeleton: For content placeholders (cards, tables)

### Search

**Global Search:**
- Full-width dropdown appearing below search bar
- Categorized results: Customers, Leads, Projects, Tasks
- Result item: Icon + Primary text + Secondary metadata + Keyboard nav support
- Recent searches shown when empty

---

## Animations

**Extremely Minimal - Use Only:**
- Sidebar collapse/expand: 200ms ease transition
- Dropdown menus: Fade in 150ms
- Modal open/close: Scale from 95% to 100%, 200ms
- Loading spinners: Continuous rotation
- Toast notifications: Slide in from right, 300ms

**No Animations For:**
- Hover states (instant)
- Page transitions
- Data updates
- Scroll effects

---

## Images

This is a productivity application - no hero images or marketing imagery needed. Use icons throughout for visual communication (Heroicons via CDN).

---

This design system prioritizes professional functionality, ensuring users can efficiently manage complex business operations while experiencing the platform's AI capabilities as helpful, unobtrusive intelligence.