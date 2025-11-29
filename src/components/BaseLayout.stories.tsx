import type { Meta, StoryObj } from '@storybook/react';
import { BaseLayout } from './BaseLayout';

const meta = {
  title: 'Components/BaseLayout',
  component: BaseLayout,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BaseLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Layout Demo</h2>
        <p>This is a demo of the base layout with sidebar, topbar, and footer.</p>
      </div>
    ),
  },
};
