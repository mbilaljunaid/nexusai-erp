import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TopBar } from './TopBar';

const meta = {
  title: 'Components/TopBar',
  component: TopBar,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [org, setOrg] = useState('Acme Corp');

    return (
      <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
        <TopBar currentOrg={org} onOrgChange={setOrg} />
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">TopBar Component</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Current Organization: <strong>{org}</strong>
          </p>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>✓ Click the search bar to open Command Palette (Cmd+K)</p>
            <p>✓ Click "Create" button for quick actions dropdown</p>
            <p>✓ Click building icon to switch organizations</p>
            <p>✓ Click bell icon to see notifications (2 unread)</p>
            <p>✓ Click avatar for user menu</p>
            <p>✓ Try dark mode toggle</p>
          </div>
        </div>
      </div>
    );
  },
};

export const WithNotifications: Story = {
  render: () => (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <TopBar />
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Notifications Feature</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Click the bell icon (with red dot) to see notifications:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>✓ Invoice Approved (5 min ago) - success badge</li>
          <li>✓ Payment Due (15 min ago) - warning badge</li>
          <li>✓ Lead Assigned (1 hour ago) - info badge, already read</li>
          <li>✓ Mark as read button (check icon)</li>
          <li>✓ Action buttons (View, Pay Now, etc.)</li>
          <li>✓ Delete notification button</li>
          <li>✓ Unread count badge</li>
        </ul>
      </div>
    </div>
  ),
};

export const QuickActions: Story = {
  render: () => (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <TopBar />
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Click the blue "Create" button to see quick actions:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>✓ Create Invoice</li>
          <li>✓ Create Lead</li>
          <li>✓ View Approvals</li>
          <li>✓ AI Assistant</li>
        </ul>
      </div>
    </div>
  ),
};

export const OrgSwitcher: Story = {
  render: () => {
    const [org, setOrg] = useState('Tech Industries');

    return (
      <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
        <TopBar currentOrg={org} onOrgChange={setOrg} />
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Organization Switcher</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Current: <strong>{org}</strong>
          </p>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Click the building icon to switch between organizations:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>• Acme Corp</li>
            <li>• Tech Industries (current)</li>
            <li>• Global Solutions</li>
          </ul>
        </div>
      </div>
    );
  },
};

export const UserMenu: Story = {
  render: () => (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
      <TopBar />
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">User Menu</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Click the avatar (JD) in the top right corner to open user menu:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>✓ User info (John Doe / john@acmecorp.com)</li>
          <li>✓ My Profile</li>
          <li>✓ Account Settings</li>
          <li>✓ Logout</li>
        </ul>
      </div>
    </div>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-slate-900 min-h-screen">
      <TopBar />
      <div className="p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Dark Mode TopBar</h2>
        <p className="text-slate-400 mb-4">
          All components adapt to dark mode styling with proper contrast and colors.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          <li>✓ Search bar dark background</li>
          <li>✓ Icons properly visible</li>
          <li>✓ Dropdowns with dark theme</li>
          <li>✓ All text contrast meets WCAG AA</li>
        </ul>
      </div>
    </div>
  ),
};
