'use client';

import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  status?: { label: string; color: 'green' | 'blue' | 'yellow' | 'red' };
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  status,
  actions,
}: PageHeaderProps) {
  const statusColors = {
    green: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
  };

  return (
    <div className="sticky top-16 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="px-8 py-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 mb-3" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {idx > 0 && <ChevronRightIcon className="w-4 h-4 text-slate-400" aria-hidden="true" />}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 rounded"
                    data-testid={`breadcrumb-${idx}`}
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-sm text-slate-600 dark:text-slate-400" aria-current={idx === breadcrumbs.length - 1 ? 'page' : undefined}>
                    {crumb.label}
                  </span>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white" data-testid="page-title">
                {title}
              </h1>
              {status && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status.color]}`}
                  data-testid="page-status"
                >
                  {status.label}
                </span>
              )}
            </div>
            {description && (
              <p className="text-slate-600 dark:text-slate-400">{description}</p>
            )}
          </div>

          {/* Action Buttons */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
