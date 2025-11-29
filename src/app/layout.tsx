import type { Metadata } from 'next';
import { BaseLayout } from '@/components/BaseLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'ERP Shell - AI-First Enterprise Platform',
  description: 'Modern enterprise ERP UI shell built with Next.js 14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BaseLayout>{children}</BaseLayout>
      </body>
    </html>
  );
}
