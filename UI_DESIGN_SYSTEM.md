# NexusAI Enterprise UI/UX Design System

## Design Philosophy

**Principles**:
1. **Enterprise First**: Built for 8-hour workdays, not gaming
2. **Data Density with Clarity**: Show lots of data without overwhelming
3. **Accessibility by Default**: WCAG 2.1 AAA compliant
4. **Performance**: Every interaction < 100ms
5. **Consistency**: Predictable patterns across 250+ pages

---

## Visual Language

### Color System (Light & Dark Modes)

#### Primary Actions
- **Primary Blue**: #3B82F6 / hsl(217, 91%, 60%)
  - Used for: Buttons, links, active states, highlights
  - Dark mode: #60A5FA / hsl(217, 97%, 65%)

#### State Colors
- **Success Green**: #10B981 / hsl(160, 84%, 39%)
- **Warning Amber**: #F59E0B / hsl(45, 93%, 47%)
- **Danger Red**: #EF4444 / hsl(0, 84%, 60%)
- **Info Cyan**: #06B6D4 / hsl(188, 94%, 44%)

#### Neutrals
- **Background**: #FFFFFF / #111827
- **Surface**: #F9FAFB / #1F2937
- **Border**: #E5E7EB / #374151
- **Text Primary**: #111827 / #F9FAFB
- **Text Secondary**: #6B7280 / #D1D5DB
- **Text Tertiary**: #9CA3AF / #9CA3AF

### Typography

```
Headlines:
- H1: 32px, 700, Line-height 1.2
- H2: 28px, 700, Line-height 1.25
- H3: 24px, 600, Line-height 1.25
- H4: 20px, 600, Line-height 1.35

Body:
- Body Large: 16px, 400, Line-height 1.5
- Body Regular: 14px, 400, Line-height 1.5
- Body Small: 12px, 400, Line-height 1.5

UI:
- Label: 14px, 500, Line-height 1.4
- Badge: 12px, 500, Line-height 1.4
```

### Spacing System (4px grid)

```
xs: 4px (0.25rem)
sm: 8px (0.5rem)
md: 16px (1rem)
lg: 24px (1.5rem)
xl: 32px (2rem)
2xl: 48px (3rem)
```

### Borders & Shadows

- **Border Radius**:
  - Buttons/Inputs: 6px
  - Cards: 8px
  - Modals: 12px
  - Badges: 4px

- **Shadows**:
  - Elevated: 0 1px 3px rgba(0,0,0,0.1)
  - Floating: 0 10px 15px rgba(0,0,0,0.1)
  - Modal: 0 20px 25px rgba(0,0,0,0.15)

---

## Component Library

### Buttons
**Variants**: Primary, Secondary, Ghost, Outline, Danger
**Sizes**: sm (32px), md (40px), lg (48px), icon (40px)
**States**: Default, Hover, Active, Disabled, Loading

**Usage**:
- Primary: Main actions (Save, Submit, Create)
- Secondary: Alternative actions (Cancel, Duplicate)
- Ghost: Low-emphasis actions (View, Download)
- Outline: Medium-emphasis actions (Edit, Delete)
- Danger: Destructive actions (Delete, Remove)

### Forms
**Components**:
- Text Input: 40px height, 6px radius
- Textareas: Resizable, min-height 80px
- Selects: Searchable, multi-select support
- Checkboxes & Radios: 18px size
- Toggle Switches: 44px width, 24px height
- Date Pickers: Calendar UI with time support
- Rich Text Editor: Markdown + formatting toolbar

**Validation**:
- Show inline errors (red text below field)
- Border color changes to danger red
- Optional asterisk for required fields
- Helper text in muted color

### Tables
**Large Data Support**:
- Virtualization for 1000+ rows
- Column sorting (ASC/DESC)
- Column filtering (text, date range, select)
- Row selection (checkbox)
- Pagination (10, 25, 50, 100 rows)
- Column resizing (drag handles)
- Export to CSV/Excel

**Density Options**:
- Compact: 32px row height
- Normal: 48px row height
- Spacious: 64px row height

### Cards
**Types**:
- Elevated: Raised with shadow
- Flat: No shadow, border only
- Filled: Background color

**Common Elements**:
```
CardHeader: Title + Subtitle + Actions
CardContent: Main content area
CardFooter: Actions or metadata
```

### Dialogs & Modals
**Types**:
- Confirmation: Yes/No/Cancel
- Form: Input fields + Submit
- Alert: Message + Action
- Success: Checkmark + Message

**Behavior**:
- Click outside closes (if not critical)
- Escape key closes
- Focus trap inside modal
- Smooth enter/exit animation

### Data Display
**Badges**: Status indicators
- Default, Primary, Success, Warning, Danger
- With or without close button (removable)

**Progress Bars**: Loading indicators
- Linear: 0-100%, color coded by value
- Circular: Loading spinner

**Status Indicators**:
- Dot color + label text
- Animated pulse for "active"

---

## Layout Patterns

### Page Structure
```
┌─────────────────────────────────────────┐
│  Breadcrumb / Title + Actions           │
├─────────────────────────────────────────┤
│  Filters / Search                       │
├─────────────────────────────────────────┤
│                                         │
│  Main Content Area                      │
│  (Table / Grid / Detail View)           │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  Pagination                             │
└─────────────────────────────────────────┘
```

### Card Grid Layout
- Desktop: 4 columns (300px each)
- Tablet: 2 columns
- Mobile: 1 column
- Gap: 16px (md spacing)

### Master-Detail Pattern
```
Master (Left):          Detail (Right):
┌──────────┐           ┌──────────────┐
│ List     │           │ Title        │
│ Item 1   │━━━━━━━━━→ │ Content      │
│ Item 2   │           │ Actions      │
│ Item 3   │           └──────────────┘
└──────────┘
```

---

## Interaction Patterns

### Hover Effects
- **Buttons**: 5% background lightness change
- **Cards**: 5px elevation increase (shadow)
- **Rows**: 2% background change
- **Links**: Color change + underline

### Focus States
- 3px solid blue outline
- 4px offset from element
- Visible on keyboard navigation

### Loading States
- Skeleton loading (placeholder content)
- Animated spinner (circular)
- Progress percentage (for uploads)
- Optimistic UI updates (instant feedback)

### Error States
- Red border on form fields
- Error message below field
- Toast notification for system errors
- Inline error badges for validation

### Success States
- Green checkmark icon
- Toast notification
- Animated success state (2s display)

---

## Mobile Optimization

### Touch Targets
- Minimum 44x44px (iOS), 48x48px (Android)
- Spacing between targets: 8px minimum

### Navigation
- Bottom tab bar for main sections
- Hamburger menu for secondary navigation
- Large back button (top left)
- Search icon (top right)

### Forms
- Large text inputs (18px+)
- Auto-suggest on focus
- Hide keyboard after submission
- Single column layout
- Full-width buttons

### Lists
- Larger row height (56px+)
- Swipe actions (delete, archive)
- Pull-to-refresh
- Infinite scroll vs pagination

---

## Accessibility Standards

### WCAG 2.1 AAA Compliance

**Color Contrast**:
- Text: 7:1 (AAA) minimum
- UI Components: 3:1 (AA) minimum
- All text remains readable in grayscale

**Keyboard Navigation**:
- All interactive elements accessible via Tab key
- Logical tab order (left-to-right, top-to-bottom)
- Escape key closes modals/dropdowns
- Enter/Space activates buttons

**Screen Reader Support**:
- Semantic HTML (use proper heading levels)
- ARIA labels for complex components
- Alternative text for images
- Form label associations
- Live regions for dynamic content

**Focus Management**:
- Visible focus indicators (blue outline)
- Focus trap in modals
- Focus restore after modal closes
- Skip to main content link

---

## Performance Standards

### Target Metrics
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Lighthouse Score: 95+
- Core Web Vitals: Green across all metrics

### Optimization Strategies
- Code splitting by route
- Image optimization (WebP, lazy loading)
- CSS-in-JS with critical CSS extraction
- Font subsetting (only needed characters)
- Minify & compress all assets
- Service worker for offline mode

---

## Naming Conventions

### Component File Structure
```
components/
├── ui/                    # shadcn components
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
├── Common/               # Reusable across app
│   ├── DataTable.tsx
│   ├── FilterBuilder.tsx
│   └── ...
└── [Module]/             # Module-specific
    ├── LeadCard.tsx
    ├── OpportunityDetail.tsx
    └── ...
```

### CSS Class Naming
```
[component]-[element]--[modifier]

Example:
- lead-card (component)
- lead-card__header (element)
- lead-card__header--active (modifier)
```

### Color Variable Naming
```
--color-[type]-[level]

Examples:
- --color-primary-base
- --color-success-light
- --color-danger-dark
- --color-text-secondary
```

---

## Design Checklist

Before handing off to developer:

- [ ] Wireframes completed for all page layouts
- [ ] High-fidelity mocks with all states
- [ ] Color palette finalized for light/dark mode
- [ ] Typography scale applied consistently
- [ ] Spacing grid consistently applied
- [ ] All icons match style guide
- [ ] Hover/active/focus states defined
- [ ] Loading states designed
- [ ] Error states designed
- [ ] Success states designed
- [ ] Mobile responsiveness verified
- [ ] Accessibility checklist completed
- [ ] Performance considerations noted
- [ ] Component library updated
- [ ] Design system documentation complete

