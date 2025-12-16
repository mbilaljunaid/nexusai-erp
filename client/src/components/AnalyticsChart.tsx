import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

type ChartType = "area" | "bar" | "pie";
type TimeRange = "7d" | "30d" | "90d" | "1y";

interface AnalyticsChartProps {
  title: string;
  type?: ChartType;
  data?: Array<Record<string, unknown>>;
  dataKey?: string;
  xAxisKey?: string;
  showTimeRange?: boolean;
  showExport?: boolean;
}

const COLORS = ["hsl(217, 91%, 60%)", "hsl(142, 76%, 36%)", "hsl(271, 81%, 56%)", "hsl(36, 100%, 50%)", "hsl(339, 90%, 51%)"];

export function AnalyticsChart({
  title,
  type = "area",
  data: propData,
  dataKey = "value",
  xAxisKey = "name",
  showTimeRange = true,
  showExport = true,
}: AnalyticsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const { data: apiData } = useQuery<Array<Record<string, unknown>>>({
    queryKey: ['/api/dashboard/analytics', title, timeRange],
    enabled: !propData,
    staleTime: 60000,
  });

  const areaData = propData || apiData || [];
  const pieData = propData || apiData || [];

  const chartData = type === "pie" ? pieData : areaData;

  return (
    <Card data-testid={`card-chart-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {showTimeRange && type !== "pie" && (
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-24 h-8 text-xs" data-testid={`select-timerange-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
              </SelectContent>
            </Select>
          )}
          {showExport && (
            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-export-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "area" ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey={xAxisKey} 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke="hsl(217, 91%, 60%)"
                  fill="hsl(217, 91%, 60%)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            ) : type === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey={xAxisKey}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey={dataKey} fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px"
                  }}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
        {type === "pie" && chartData.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {chartData.map((entry: Record<string, unknown>, index: number) => (
              <div key={String(entry.name)} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground">{String(entry.name)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
