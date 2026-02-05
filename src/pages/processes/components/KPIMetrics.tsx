import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICard {
  label: string;
  value: string | number;
  target: string | number;
  status: 'good' | 'warning' | 'alert';
  trend?: 'up' | 'down' | 'stable';
}

interface KPIMetricsProps {
  metrics: KPICard[];
  layout?: 'grid' | 'row';
}

const statusStyles = {
  good: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  alert: 'bg-red-50 border-red-200'
};

const statusBadge = {
  good: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  alert: 'bg-red-100 text-red-800'
};

export function KPIMetrics({ metrics, layout = 'grid' }: KPIMetricsProps) {
  const gridClass = layout === 'grid' ? 'grid-cols-3' : 'grid-cols-1';

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {metrics.map((metric, idx) => (
        <Card key={idx} className={`p-4 border-2 ${statusStyles[metric.status]}`} data-testid={`kpi-card-${idx}`}>
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">{metric.label}</h4>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge[metric.status]}`}>
              {metric.status === 'good' ? '✓' : metric.status === 'warning' ? '⚠' : '✕'}
            </span>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            <div className="text-xs text-muted-foreground">Target: {metric.target}</div>
          </div>
          {metric.trend && (
            <div className="flex items-center gap-1 text-xs">
              {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
              {metric.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
              {metric.trend === 'stable' && <Minus className="w-3 h-3 text-gray-600" />}
              <span className="text-muted-foreground">
                {metric.trend === 'up' ? 'Improving' : metric.trend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
