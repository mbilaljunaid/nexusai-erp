'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface KPI {
  id: string;
  label: string;
  value: string;
  change: string;
  color: 'green' | 'blue' | 'yellow' | 'red';
}

const kpiColorMap = {
  green: 'border-l-green-500 bg-green-50 dark:bg-green-900/10',
  blue: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
  yellow: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
  red: 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
};

const textColorMap = {
  green: 'text-green-700 dark:text-green-300',
  blue: 'text-blue-700 dark:text-blue-300',
  yellow: 'text-yellow-700 dark:text-yellow-300',
  red: 'text-red-700 dark:text-red-300',
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const res = await fetch('/api/analytics/dashboard');
        const data = await res.json();
        setKpis(data.kpis);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  return (
    <div>
      <PageHeader
        title="Analytics Dashboard"
        description="Key performance indicators and business metrics"
        breadcrumbs={[
          { label: 'Analytics', href: '/analytics' },
          { label: 'Dashboard' },
        ]}
        status={{ label: 'Real-time', color: 'green' }}
      />

      <div className="px-8 py-6 space-y-6">
        {/* KPI Cards Grid */}
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi) => {
                const isPositive = kpi.change.startsWith('+');

                return (
                  <div
                    key={kpi.id}
                    className={`border-l-4 rounded-lg p-6 ${kpiColorMap[kpi.color]}`}
                    data-testid={`kpi-card-${kpi.id}`}
                  >
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {kpi.label}
                    </p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {kpi.value}
                      </p>
                      <span
                        className={`flex items-center gap-1 text-sm font-semibold ${
                          isPositive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                        data-testid={`kpi-change-${kpi.id}`}
                      >
                        {isPositive ? (
                          <ArrowUpIcon className="w-4 h-4" />
                        ) : (
                          <ArrowDownIcon className="w-4 h-4" />
                        )}
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
                Revenue vs Expenses
              </h3>
              <div
                className="bg-slate-100 dark:bg-slate-700 rounded-lg h-64 flex items-center justify-center"
                data-testid="chart-placeholder"
              >
                <div className="text-center">
                  <p className="text-slate-500 dark:text-slate-400 mb-2">Chart Placeholder</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Recharts integration ready
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Departments */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
                  Top Departments by Cost
                </h3>
                <div className="space-y-3" data-testid="top-depts">
                  {['Engineering', 'Sales', 'Product', 'Marketing'].map((dept) => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">{dept}</span>
                      <div className="flex-1 mx-3 bg-slate-200 dark:bg-slate-700 rounded h-2">
                        <div
                          className="bg-blue-500 h-2 rounded"
                          style={{
                            width: `${Math.random() * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-slate-500">
                        ${Math.floor(Math.random() * 500) + 100}k
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
                  Recent Activities
                </h3>
                <div className="space-y-3" data-testid="recent-activities">
                  {[
                    { action: 'Invoice approved', time: '2 hours ago' },
                    { action: 'Employee onboarded', time: '5 hours ago' },
                    { action: 'Report generated', time: '1 day ago' },
                    { action: 'Budget updated', time: '2 days ago' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 dark:text-white font-medium truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
