import { Injectable } from '@nestjs/common';

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'kpi' | 'chart' | 'table' | 'gauge';
  dataSource: string;
  refreshInterval: number;
  position: { row: number; col: number };
}

export interface Report {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'custom' | 'scheduled';
  format: 'pdf' | 'excel' | 'html';
  filters: Record<string, any>;
  createdDate: Date;
  lastRunDate?: Date;
  schedule?: string;
}

export interface DataPoint {
  timestamp: Date;
  value: number;
  dimension: string;
}

@Injectable()
export class AnalyticsService {
  private widgets: Map<string, DashboardWidget> = new Map();
  private reports: Map<string, Report> = new Map();
  private dataPoints: DataPoint[] = [];
  private reportCounter = 1;

  createWidget(widget: DashboardWidget): DashboardWidget {
    this.widgets.set(widget.id, widget);
    return widget;
  }

  getWidgets(): DashboardWidget[] {
    return Array.from(this.widgets.values());
  }

  createReport(report: Report): Report {
    const id = `RPT-${this.reportCounter++}`;
    report.id = id;
    this.reports.set(id, report);
    return report;
  }

  generateReport(reportId: string): {
    success: boolean;
    data?: Record<string, any>;
    message: string;
  } {
    const report = this.reports.get(reportId);
    if (!report) {
      return { success: false, message: 'Report not found' };
    }

    report.lastRunDate = new Date();

    const data = {
      title: report.name,
      generatedDate: new Date(),
      totalRecords: Math.floor(Math.random() * 10000),
      metrics: {
        revenue: Math.floor(Math.random() * 1000000),
        units: Math.floor(Math.random() * 10000),
        customers: Math.floor(Math.random() * 1000),
      },
    };

    return { success: true, data, message: 'Report generated successfully' };
  }

  recordDataPoint(dataPoint: DataPoint): DataPoint {
    this.dataPoints.push(dataPoint);
    return dataPoint;
  }

  getTimeSeries(dimension: string, days: number = 30): DataPoint[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.dataPoints.filter(
      (dp) => dp.dimension === dimension && dp.timestamp >= cutoff,
    );
  }

  calculateMetrics(dataPoints: DataPoint[]): {
    average: number;
    min: number;
    max: number;
    total: number;
  } {
    if (dataPoints.length === 0) {
      return { average: 0, min: 0, max: 0, total: 0 };
    }

    const values = dataPoints.map((dp) => dp.value);
    return {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      total: values.reduce((a, b) => a + b, 0),
    };
  }

  getKPI(kpiName: string): { value: number; target: number; status: string; trend: string } {
    // Simulated KPI data
    const kpis: Record<string, any> = {
      revenue: { value: 1250000, target: 1500000, status: 'tracking' },
      customerSatisfaction: { value: 92, target: 95, status: 'above' },
      employeeUtilization: { value: 78, target: 80, status: 'tracking' },
      projectCompletionRate: { value: 94, target: 95, status: 'below' },
    };

    const kpi = kpis[kpiName] || { value: 0, target: 0 };
    const trend = kpi.value > kpi.target ? 'up' : 'down';

    return {
      value: kpi.value,
      target: kpi.target,
      status: kpi.status || 'tracking',
      trend,
    };
  }
}
