import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CommandPalette, type CommandItem } from './CommandPalette';

const sampleCommands: CommandItem[] = [
  // Actions
  {
    id: 'create-invoice',
    title: 'Create Invoice',
    subtitle: 'New invoice in Accounts Payable',
    category: 'Actions',
    tag: 'AP',
    icon: '📄',
    keystroke: '⌘I',
    action: 'createInvoice',
  },
  {
    id: 'create-bill',
    title: 'Create Bill',
    subtitle: 'New vendor bill',
    category: 'Actions',
    tag: 'AP',
    icon: '💰',
    keystroke: '⌘B',
    action: 'createBill',
  },
  {
    id: 'create-lead',
    title: 'Create Lead',
    subtitle: 'New sales lead',
    category: 'Actions',
    tag: 'CRM',
    icon: '👤',
    action: 'createLead',
  },
  // Pages
  {
    id: 'page-ap-invoices',
    title: 'Invoices',
    subtitle: 'Accounts Payable invoices list',
    category: 'Pages',
    tag: 'AP',
    icon: '📋',
    href: '/ap/invoices',
  },
  {
    id: 'page-crm-contacts',
    title: 'Contacts',
    subtitle: 'CRM contacts database',
    category: 'Pages',
    tag: 'CRM',
    icon: '👥',
    href: '/crm/contacts',
  },
  // Records
  {
    id: 'record-acme-corp',
    title: 'Acme Corporation',
    subtitle: 'Vendor record',
    category: 'Records',
    tag: 'Vendor',
    icon: '🏢',
    href: '/vendors/acme-corp',
  },
  {
    id: 'record-inv-5234',
    title: 'INV-5234',
    subtitle: '$12,500 - Pending approval',
    category: 'Records',
    tag: 'Invoice',
    icon: '📄',
    href: '/invoices/5234',
  },
  // Reports
  {
    id: 'report-ap-aging',
    title: 'AP Aging Report',
    subtitle: 'Aged payables analysis',
    category: 'Reports',
    tag: 'Finance',
    icon: '⏰',
    href: '/reports/ap-aging',
  },
];

const meta = {
  title: 'Components/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default: Open with all commands
export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);
    const [results, setResults] = useState<string[]>([]);

    return (
      <div className="w-full h-screen bg-slate-100 dark:bg-slate-800">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">Command Palette Demo</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Try searching for "invoice", "create", "vendor", etc. Press Cmd+K or click the search button to open.
          </p>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isOpen ? 'Close' : 'Open'} Palette
          </button>

          {results.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Recent Actions:</h2>
              <ul className="space-y-2">
                {results.map((result, idx) => (
                  <li key={idx} className="px-4 py-2 bg-white dark:bg-slate-700 rounded-md">
                    {result}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isOpen && (
          <CommandPalette
            items={sampleCommands}
            onExecute={(item) => setResults((prev) => [...prev, `Executed: ${item.title}`])}
            onNavigate={(href) => setResults((prev) => [...prev, `Navigated to: ${href}`])}
          />
        )}
      </div>
    );
  },
};

// Search Results: Filtered view
export const SearchResults: Story = {
  render: () => {
    return (
      <div className="w-full h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <CommandPalette
          items={sampleCommands}
          onExecute={(item) => console.log('Executed:', item)}
          onNavigate={(href) => console.log('Navigate to:', href)}
        />
      </div>
    );
  },
};

// Empty State
export const EmptyResults: Story = {
  render: () => {
    return (
      <div className="w-full h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <CommandPalette
          items={[]}
          onExecute={(item) => console.log('Executed:', item)}
        />
      </div>
    );
  },
};

// Keyboard Navigation Demo
export const KeyboardNavigation: Story = {
  render: () => {
    const [navigated, setNavigated] = useState<string>('');

    return (
      <div className="w-full h-screen bg-slate-100 dark:bg-slate-800 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Keyboard Navigation Demo</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Try: ↑↓ arrows to navigate, Enter to select, Escape to close
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <CommandPalette
              items={sampleCommands}
              onExecute={(item) => setNavigated(`Selected: ${item.title}`)}
              onNavigate={(href) => setNavigated(`Navigated: ${href}`)}
            />
          </div>

          {navigated && (
            <div className="w-64 bg-white dark:bg-slate-700 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Last Action:</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{navigated}</p>
            </div>
          )}
        </div>
      </div>
    );
  },
};

// Grouped Results
export const GroupedResults: Story = {
  render: () => {
    return (
      <div className="w-full h-screen bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <div className="text-center mb-4 absolute top-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Results grouped by category: Actions, Pages, Records, Reports
          </h2>
        </div>
        <CommandPalette
          items={sampleCommands}
          onExecute={(item) => console.log('Executed:', item)}
          onNavigate={(href) => console.log('Navigate to:', href)}
        />
      </div>
    );
  },
};
