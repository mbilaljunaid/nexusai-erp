import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './PageHeader';
import { PlusIcon, ArrowDownTrayIcon, ZapIcon } from '@heroicons/react/24/outline';

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <PageHeader
        title="Invoices"
        description="Manage accounts payable invoices"
        breadcrumbs={[
          { label: 'Finance', href: '/finance' },
          { label: 'AP', href: '/finance/ap' },
          { label: 'Invoices' },
        ]}
        status={{ label: 'Active', color: 'green' }}
        actions={
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <PlusIcon className="w-5 h-5 inline mr-2" />
            New Invoice
          </button>
        }
      />
      <div className="px-8 py-6">
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Try scrolling down to see the sticky behavior of the PageHeader.
        </p>
        <div className="space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-lg">
              <p className="font-medium">Section {i + 1}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Dummy content to demonstrate sticky header behavior
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const WithMultipleActions: Story = {
  render: () => (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <PageHeader
        title="Employees"
        breadcrumbs={[
          { label: 'HR', href: '/hr' },
          { label: 'Employees' },
        ]}
        status={{ label: '156 Active', color: 'green' }}
        actions={
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Add Employee
            </button>
          </div>
        }
      />
      <div className="px-8 py-6">
        <p className="text-slate-600 dark:text-slate-400">
          Multiple action buttons example (Export + Add Employee)
        </p>
      </div>
    </div>
  ),
};

export const WithWarningStatus: Story = {
  render: () => (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <PageHeader
        title="Approvals Pending"
        description="Review and approve pending transactions"
        breadcrumbs={[
          { label: 'Dashboard' },
          { label: 'Approvals' },
        ]}
        status={{ label: 'Attention Required', color: 'yellow' }}
        actions={
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2">
            <ZapIcon className="w-5 h-5" />
            Review Now
          </button>
        }
      />
      <div className="px-8 py-6">
        <p className="text-slate-600 dark:text-slate-400">
          Yellow status indicator for warning states
        </p>
      </div>
    </div>
  ),
};

export const StickyDemoLongScroll: Story = {
  render: () => (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <PageHeader
        title="Analytics Dashboard"
        description="Key performance indicators and business metrics"
        breadcrumbs={[
          { label: 'Analytics', href: '/analytics' },
          { label: 'Dashboard' },
        ]}
        status={{ label: 'Real-time', color: 'blue' }}
      />
      <div className="px-8 py-6">
        <p className="text-slate-600 dark:text-slate-400 mb-6 font-semibold">
          📌 Scroll down to verify PageHeader stays sticky at top!
        </p>
        <div className="space-y-4">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Content Block {i + 1}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const MinimalHeader: Story = {
  render: () => (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <PageHeader title="Settings" />
      <div className="px-8 py-6">
        <p className="text-slate-600 dark:text-slate-400">
          Minimal header with just a title
        </p>
      </div>
    </div>
  ),
};
