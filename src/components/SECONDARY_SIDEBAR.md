# SecondarySidebar Component

A context-aware, modular sidebar that displays module-specific navigation with nested groups, perfect for enterprise applications like ERP systems.

## Features

✅ **Nested Navigation Groups** - Organize sections hierarchically with collapsible groups
✅ **Desktop Layout** - Right-aligned sidebar with smooth animations
✅ **Mobile Slide-Over** - Full-screen drawer on mobile devices (< 1024px)
✅ **Active State Management** - Visual feedback for selected items
✅ **Dark Mode Support** - Seamless light/dark theme integration
✅ **Accessibility** - ARIA labels, keyboard navigation, semantic HTML
✅ **Type-Safe** - Full TypeScript support with interfaces

## Props

```typescript
interface SecondarySidebarProps {
  activeModule?: string;           // Module title displayed at top (e.g., "Finance → AP")
  activeSectionId?: string;        // Currently selected item ID
  onSelect?: (sectionId: string) => void;  // Callback when item is selected
  onNavigate?: (href: string) => void;     // Callback when navigation link clicked
  sections?: SidebarSection[];     // Menu structure (defaults provided)
  isOpen?: boolean;                // Mobile drawer open/closed state
  onClose?: () => void;            // Mobile drawer close callback
}

interface SidebarSection {
  id: string;
  label: string;
  icon?: string;                   // Emoji or icon
  children?: SidebarItem[];        // Nested items
}

interface SidebarItem {
  id: string;
  label: string;
  href?: string;                   // Navigation link
  icon?: string;                   // Emoji or icon
}
```

## Usage Examples

### Basic Setup

```tsx
import { SecondarySidebar } from '@/components/SecondarySidebar';
import { useState } from 'react';

export function ModulePage() {
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  return (
    <div className="flex">
      <main className="flex-1 p-8">
        {/* Main content */}
      </main>
      <SecondarySidebar
        activeModule="Finance → Accounts Payable"
        activeSectionId={activeSectionId}
        onSelect={setActiveSectionId}
        onNavigate={(href) => router.push(href)}
      />
    </div>
  );
}
```

### With Custom Sections

```tsx
const customSections: SidebarSection[] = [
  {
    id: 'orders',
    label: 'Orders',
    icon: '📦',
    children: [
      { id: 'list', label: 'Order List', href: '/orders', icon: '📋' },
      { id: 'create', label: 'Create Order', href: '/orders/new', icon: '➕' },
    ],
  },
  // More sections...
];

<SecondarySidebar
  activeModule="Procurement"
  sections={customSections}
  activeSectionId={activeSectionId}
  onSelect={setActiveSectionId}
/>
```

### Mobile Slide-Over

```tsx
const [sidebarOpen, setSidebarOpen] = useState(false);

// Button to toggle
<button onClick={() => setSidebarOpen(!sidebarOpen)}>Menu</button>

// Drawer on mobile, sidebar on desktop
<SecondarySidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  // ... other props
/>
```

## Styling

### CSS Classes Used

- `.sidebar-item` - Hover effect for sidebar items (defined in globals.css)
- Tailwind classes for responsive behavior:
  - `hidden lg:flex` - Hidden on mobile, visible on desktop
  - `fixed lg:relative` - Mobile drawer positioning
  - `transition-*` - Smooth animations

### Theme Support

- Light mode: `bg-white text-slate-900`
- Dark mode: `dark:bg-slate-900 dark:text-slate-50`
- Active items: `bg-blue-100 dark:bg-blue-900/30`

## Mobile Behavior

**Under 1024px**:
- Sidebar transforms into a slide-over drawer
- Full-height overlay appears when open
- XMark icon closes the drawer
- Smooth slide-in animation from left
- Overlay prevents interaction with main content

**1024px and above**:
- Fixed right-side panel
- Always visible (unless hidden via UIStore toggle)
- No overlay
- Compact vertical layout

## State Management

The component uses `useUIStore()` from Zustand:
- `secondarySidebarOpen` - Desktop sidebar visibility
- `toggleSecondarySidebar()` - Toggle visibility

For mobile, manage state with `isOpen` prop and `onClose` callback.

## Accessibility Features

- ✅ Semantic `<nav>` element
- ✅ `aria-label` on close button
- ✅ `data-testid` attributes for testing
- ✅ Keyboard navigation support
- ✅ Clear focus states
- ✅ Color contrast meets WCAG AA

## Testing

### Unit Tests (Jest/Vitest)

```typescript
describe('SecondarySidebar', () => {
  it('renders sections', () => {
    render(<SecondarySidebar sections={mockSections} />);
    expect(screen.getByTestId('section-transactions')).toBeInTheDocument();
  });

  it('highlights active item', () => {
    render(
      <SecondarySidebar
        sections={mockSections}
        activeSectionId="invoices"
      />
    );
    expect(screen.getByTestId('item-invoices')).toHaveClass('bg-blue-100');
  });

  it('calls onSelect when item clicked', () => {
    const onSelect = jest.fn();
    render(
      <SecondarySidebar sections={mockSections} onSelect={onSelect} />
    );
    fireEvent.click(screen.getByTestId('item-invoices'));
    expect(onSelect).toHaveBeenCalledWith('invoices');
  });
});
```

### E2E Tests (Cypress)

```typescript
describe('SecondarySidebar', () => {
  it('expands/collapses sections', () => {
    cy.get('[data-testid="section-transactions"]').click();
    cy.get('[data-testid="item-invoices"]').should('be.visible');
  });

  it('mobile drawer slides open/closed', () => {
    cy.viewport('iphone-x');
    cy.get('[data-testid="secondary-sidebar-mobile"]').should('not.exist');
    // Open drawer
    cy.get('[data-testid="sidebar-overlay"]').click();
    cy.get('[data-testid="secondary-sidebar-mobile"]').should('be.visible');
  });
});
```

## Storybook Stories

Available stories demonstrate various configurations:

1. **ProjectModule** - Projects with team, milestones, and reports
2. **FinanceAPModule** - Finance AP with transactions, reporting, config, workflows
3. **MobileSlideOver** - Mobile drawer behavior
4. **CollapsedState** - Hidden sidebar state
5. **AllExpanded** - All sections expanded by default

Run: `npm run storybook`

## Performance Considerations

- **Memoization**: Component is inherently lightweight
- **Bundle Size**: ~3kb gzipped (mostly TypeScript interfaces)
- **Render Optimization**: Uses React state, no unnecessary re-renders
- **Mobile Detection**: Single resize listener with cleanup

## Troubleshooting

### Sidebar not showing on desktop
- Check `useUIStore` state: `secondarySidebarOpen` should be true
- Verify viewport is >= 1024px (toggle resize)

### Mobile drawer not sliding
- Ensure parent has `position: relative` or is viewport
- Check z-index conflicts with other fixed elements

### Active item not highlighting
- Confirm `activeSectionId` matches item's `id`
- Verify item is within expanded section

## Future Enhancements

- [ ] Drag-to-reorder sections
- [ ] Persistent section expansion state (localStorage)
- [ ] Search/filter functionality
- [ ] Breadcrumb navigation
- [ ] Context menu on right-click
- [ ] Keyboard shortcuts for section navigation

---

**Component Path**: `src/components/SecondarySidebar.tsx`
**Stories Path**: `src/components/SecondarySidebar.stories.tsx`
**TypeScript**: Fully typed with exported interfaces
