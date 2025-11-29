import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SecondarySidebar, type SidebarSection } from './SecondarySidebar';

const projectModuleSections: SidebarSection[] = [
  {
    id: 'active-projects',
    label: 'Active Projects',
    icon: '📌',
    children: [
      { id: 'project-1', label: 'Web Redesign', href: '/projects/web-redesign', icon: '🌐' },
      { id: 'project-2', label: 'Mobile App', href: '/projects/mobile-app', icon: '📱' },
      { id: 'project-3', label: 'Analytics Dashboard', href: '/projects/analytics', icon: '📊' },
    ],
  },
  {
    id: 'planning',
    label: 'Planning',
    icon: '📋',
    children: [
      { id: 'roadmap', label: 'Roadmap', href: '/projects/roadmap', icon: '🗺️' },
      { id: 'milestones', label: 'Milestones', href: '/projects/milestones', icon: '🎯' },
      { id: 'timeline', label: 'Timeline', href: '/projects/timeline', icon: '⏳' },
    ],
  },
  {
    id: 'collaboration',
    label: 'Collaboration',
    icon: '👥',
    children: [
      { id: 'team', label: 'Team Members', href: '/projects/team', icon: '👨‍💼' },
      { id: 'tasks', label: 'Tasks', href: '/projects/tasks', icon: '✓' },
      { id: 'comments', label: 'Comments', href: '/projects/comments', icon: '💬' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: '📈',
    children: [
      { id: 'progress', label: 'Progress', href: '/projects/reports/progress', icon: '📊' },
      { id: 'budget', label: 'Budget', href: '/projects/reports/budget', icon: '💰' },
    ],
  },
];

const financeAPSections: SidebarSection[] = [
  {
    id: 'transactions',
    label: 'Transactions',
    icon: '📝',
    children: [
      { id: 'invoices', label: 'Invoices', href: '/finance/ap/invoices', icon: '📄' },
      { id: 'bills', label: 'Bills', href: '/finance/ap/bills', icon: '💰' },
      { id: 'payments', label: 'Payments', href: '/finance/ap/payments', icon: '✓' },
      { id: 'expense-reports', label: 'Expense Reports', href: '/finance/ap/expenses', icon: '💳' },
    ],
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: '📊',
    children: [
      { id: 'aging-report', label: 'Aging Report', href: '/finance/ap/reports/aging', icon: '⏰' },
      { id: 'vendor-analysis', label: 'Vendor Analysis', href: '/finance/ap/reports/vendors', icon: '🏢' },
      { id: 'cash-flow', label: 'Cash Flow', href: '/finance/ap/reports/cash-flow', icon: '💵' },
      { id: 'compliance', label: 'Compliance', href: '/finance/ap/reports/compliance', icon: '✅' },
    ],
  },
  {
    id: 'configuration',
    label: 'Configuration',
    icon: '⚙️',
    children: [
      { id: 'vendors', label: 'Vendor Master', href: '/finance/ap/config/vendors', icon: '🏢' },
      { id: 'payment-terms', label: 'Payment Terms', href: '/finance/ap/config/terms', icon: '📅' },
      { id: 'gl-accounts', label: 'GL Accounts', href: '/finance/ap/config/accounts', icon: '🔢' },
      { id: 'tax-config', label: 'Tax Configuration', href: '/finance/ap/config/tax', icon: '🏛️' },
    ],
  },
  {
    id: 'workflows',
    label: 'Workflows & Automation',
    icon: '⚡',
    children: [
      { id: 'approval-rules', label: 'Approval Rules', href: '/finance/ap/workflows/approval', icon: '✋' },
      { id: 'auto-matching', label: 'Auto-Matching', href: '/finance/ap/workflows/matching', icon: '🤖' },
      { id: 'escalation', label: 'Escalation', href: '/finance/ap/workflows/escalation', icon: '⏱️' },
    ],
  },
];

const meta = {
  title: 'Components/SecondarySidebar',
  component: SecondarySidebar,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SecondarySidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Desktop Project Module Story
export const ProjectModule: Story = {
  render: () => {
    const [activeSectionId, setActiveSectionId] = useState<string>('project-1');

    return (
      <div className="flex h-screen">
        <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-8">
          <h1 className="text-3xl font-bold mb-4">Main Content Area</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Selected: {activeSectionId}. Try clicking items in the sidebar →
          </p>
        </div>
        <SecondarySidebar
          activeModule="Projects"
          activeSectionId={activeSectionId}
          onSelect={setActiveSectionId}
          onNavigate={(href) => console.log('Navigate to:', href)}
          sections={projectModuleSections}
        />
      </div>
    );
  },
};

// Desktop Finance (AP) Module Story
export const FinanceAPModule: Story = {
  render: () => {
    const [activeSectionId, setActiveSectionId] = useState<string>('invoices');

    return (
      <div className="flex h-screen">
        <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-8">
          <h1 className="text-3xl font-bold mb-4">Finance - Accounts Payable</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Selected: {activeSectionId}. Comprehensive AP module with transactions, reporting, config, and workflows.
          </p>
          <div className="mt-6 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <p>✓ Nested menu groups with indentation</p>
            <p>✓ Expandable/collapsible sections</p>
            <p>✓ Active item highlighting</p>
            <p>✓ Icons for visual hierarchy</p>
          </div>
        </div>
        <SecondarySidebar
          activeModule="Finance → Accounts Payable"
          activeSectionId={activeSectionId}
          onSelect={setActiveSectionId}
          onNavigate={(href) => console.log('Navigate to:', href)}
          sections={financeAPSections}
        />
      </div>
    );
  },
};

// Mobile Slide-Over Story
export const MobileSlideOver: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    const [activeSectionId, setActiveSectionId] = useState<string>('invoices');

    return (
      <div className="w-full h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Mobile View</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Sidebar appears as a slide-over drawer on mobile
          </p>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {isOpen ? 'Close' : 'Open'} Sidebar
          </button>
        </div>

        {/* Mobile view */}
        <div className="lg:hidden">
          <SecondarySidebar
            activeModule="Finance → AP"
            activeSectionId={activeSectionId}
            onSelect={setActiveSectionId}
            onNavigate={(href) => console.log('Navigate to:', href)}
            sections={financeAPSections}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Collapsed State Story
export const CollapsedState: Story = {
  render: () => {
    const [activeSectionId, setActiveSectionId] = useState<string>('');

    return (
      <div className="flex h-screen">
        <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-8">
          <h1 className="text-3xl font-bold mb-4">Main Content</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sidebar is collapsed (hidden on desktop, use store toggle in real app)
          </p>
        </div>
        <SecondarySidebar
          activeModule="Projects"
          activeSectionId={activeSectionId}
          onSelect={setActiveSectionId}
          sections={projectModuleSections}
        />
      </div>
    );
  },
};

// With All Sections Expanded
export const AllExpanded: Story = {
  render: () => {
    const [activeSectionId, setActiveSectionId] = useState<string>('invoices');

    return (
      <div className="flex h-screen bg-white dark:bg-slate-900">
        <div className="flex-1 p-8 overflow-auto">
          <h1 className="text-3xl font-bold mb-4">Content Area</h1>
          <p className="text-slate-600 dark:text-slate-400">All menu sections expanded by default</p>
        </div>
        <SecondarySidebar
          activeModule="Finance - AP"
          activeSectionId={activeSectionId}
          onSelect={setActiveSectionId}
          sections={financeAPSections}
        />
      </div>
    );
  },
};
