import { AnalyticsChart } from "../AnalyticsChart";

export default function AnalyticsChartExample() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnalyticsChart title="Revenue Trend" type="area" dataKey="value" />
      <AnalyticsChart title="Lead Pipeline" type="pie" />
    </div>
  );
}
