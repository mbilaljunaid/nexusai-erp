import type { Meta, StoryObj } from '@storybook/react';
import { PrimarySidebar } from './PrimarySidebar';

const meta = {
  title: 'Components/PrimarySidebar',
  component: PrimarySidebar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PrimarySidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
