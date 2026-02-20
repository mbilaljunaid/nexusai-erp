import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Sparkles, LineChart, ArrowUpRight, BarChart2, GitBranch } from "lucide-react";
import { useNexusAI } from "@/contexts/NexusAIContext";
import { useToast } from "@/hooks/use-toast";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ForecastPoint {
  period: string;
  amount: number;
  type?: "Forecast";
}

interface HistoryPoint {
  x: number;
  y: number;
  period: string;
}

interface ForecastResponse {
  history: HistoryPoint[];
  forecast: ForecastPoint[];
  model: { slope: number; intercept: number } | null;
  message?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n);

export default function RevenueForecasting() {
  const { toast } = useToast();
  const { open, sendMessage } = useNexusAI();
  const [months, setMonths] = useState("6");
  const [contractId, setContractId] = useState("");

  const { data, isLoading, isError, refetch } = useQuery<ForecastResponse>({
    queryKey: ["/api/revenue/forecast", months, contractId],
    queryFn: async () => {
      const params = new URLSearchParams({ months });
      if (contractId.trim()) params.set("contractId", contractId.trim());
      const res = await fetch(`/api/revenue/forecast?${params}`);
      if (!res.ok) throw new Error("Failed to fetch revenue forecast");
      return res.json();
    },
  });

  const totalHistorical = data?.history.reduce((s, h) => s + h.y, 0) ?? 0;
  const totalForecast = data?.forecast.reduce((s, f) => s + f.amount, 0) ?? 0;
  const trend = data?.model?.slope ?? 0;
  const lastHistoricalPeriod = data?.history[data.history.length - 1]?.period ?? "—";
  const nextPeriod = data?.forecast[0]?.period ?? "—";

  return (
    <StandardDashboard
      header={
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading">Revenue Forecasting</h1>
            <p className="text-muted-foreground mt-1">
              Linear-regression ML forecast from live recognition data · ASC 606 aligned
            </p>
          </div>
          <Button
            onClick={() => {
              open();
              sendMessage(
                `Analyze the revenue forecast. Historical total: ${fmt(totalHistorical)}. Projected next ${months} months: ${fmt(totalForecast)}. Slope: ${trend.toFixed(2)} per period. Provide executive summary and risks.`
              );
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg"
          >
            <LineChart className="h-4 w-4" />
            NexusAI Insights
          </Button>
        </div>
      }
    >
      {/* Controls */}
      <DashboardWidget title="Forecast Configuration" colSpan={4} icon={GitBranch}>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1 flex-1 min-w-[140px]">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Projection Horizon</label>
            <Select value={months} onValueChange={(v) => { setMonths(v); }}>
              <SelectTrigger data-testid="select-months"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Months</SelectItem>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="9">9 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Contract Filter <span className="text-slate-400">(optional)</span>
            </label>
            <input
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Contract ID or leave blank for all"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              data-testid="input-contract-id"
            />
          </div>
          <Button onClick={() => refetch()} disabled={isLoading} data-testid="button-run-forecast">
            {isLoading ? "Computing..." : "Run Forecast"}
          </Button>
        </div>
      </DashboardWidget>

      {/* KPI Summary */}
      {isLoading ? (
        [1, 2, 3, 4].map((i) => (
          <DashboardWidget key={i} colSpan={1}><Skeleton className="h-24 w-full" /></DashboardWidget>
        ))
      ) : isError ? (
        <DashboardWidget colSpan={4}>
          <p className="text-center text-destructive py-8 font-medium">Failed to load forecast. Please ensure revenue recognition data is available.</p>
        </DashboardWidget>
      ) : (
        <>
          <DashboardWidget colSpan={1} title="Historical Revenue" icon={BarChart2}>
            <div className="text-3xl font-bold tracking-tight">{fmt(totalHistorical)}</div>
            <p className="text-xs text-muted-foreground mt-1">Last period: <span className="font-mono">{lastHistoricalPeriod}</span></p>
          </DashboardWidget>

          <DashboardWidget colSpan={1} title={`${months}-Month Forecast`} icon={TrendingUp}>
            <div className="text-3xl font-bold tracking-tight text-indigo-600">{fmt(totalForecast)}</div>
            <p className="text-xs text-muted-foreground mt-1">Starts: <span className="font-mono">{nextPeriod}</span></p>
          </DashboardWidget>

          <DashboardWidget colSpan={1} title="Trend Slope" icon={Activity}>
            <div className={`text-3xl font-bold tracking-tight ${trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {trend >= 0 ? "+" : ""}{trend.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground ml-1">/period</span>
            </div>
            <Badge variant="secondary" className="mt-2 text-[10px]">
              {trend > 5 ? "Strong Growth" : trend > 0 ? "Moderate Growth" : trend === 0 ? "Flat" : "Declining"}
            </Badge>
          </DashboardWidget>

          <DashboardWidget colSpan={1} title="Model Confidence" icon={Sparkles}>
            <div className="text-3xl font-bold tracking-tight text-amber-600">
              {data?.model ? "Linear" : "N/A"}
            </div>
            {data?.model && (
              <p className="text-xs text-muted-foreground mt-1">
                y = <span className="font-mono">{data.model.slope.toFixed(2)}x + {data.model.intercept.toFixed(2)}</span>
              </p>
            )}
            {data?.message && <p className="text-xs text-amber-600 mt-1">{data.message}</p>}
          </DashboardWidget>

          {/* History Table */}
          {data?.history && data.history.length > 0 && (
            <DashboardWidget title="Historical Recognition" colSpan={2} icon={BarChart2}>
              <div className="overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 px-3 font-medium">Period</th>
                      <th className="text-right py-2 px-3 font-medium">Amount</th>
                      <th className="text-right py-2 px-3 font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.history.map((h, i) => (
                      <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-2 px-3 font-mono text-xs">{h.period || `Period ${i + 1}`}</td>
                        <td className="py-2 px-3 text-right font-medium">{fmt(h.y)}</td>
                        <td className="py-2 px-3 text-right">
                          <Badge variant="outline" className="text-[10px]">Actual</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardWidget>
          )}

          {/* Forecast Table */}
          {data?.forecast && data.forecast.length > 0 && (
            <DashboardWidget title="ML Projected Periods" colSpan={2} icon={TrendingUp}>
              <div className="overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 px-3 font-medium">Period</th>
                      <th className="text-right py-2 px-3 font-medium">Projected</th>
                      <th className="text-right py-2 px-3 font-medium">Δ vs Last</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.forecast.map((f, i) => {
                      const prev = i === 0
                        ? (data.history[data.history.length - 1]?.y ?? 0)
                        : data.forecast[i - 1].amount;
                      const delta = f.amount - prev;
                      const deltaFmt = `${delta >= 0 ? "+" : ""}${fmt(delta)}`;
                      return (
                        <tr key={i} className="border-b hover:bg-indigo-50/30 transition-colors">
                          <td className="py-2 px-3 font-mono text-xs">{f.period}</td>
                          <td className="py-2 px-3 text-right font-semibold text-indigo-700">{fmt(f.amount)}</td>
                          <td className={`py-2 px-3 text-right text-xs font-medium ${delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {deltaFmt}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Totals row */}
              <div className="border-t pt-3 mt-2 flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Total Projected</span>
                <span className="font-bold text-indigo-700">{fmt(totalForecast)}</span>
              </div>
            </DashboardWidget>
          )}

          {(!data?.history?.length && !data?.forecast?.length) && (
            <DashboardWidget colSpan={4}>
              <div className="text-center py-12 space-y-2">
                <Activity className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground font-medium">No recognition data found.</p>
                <p className="text-xs text-muted-foreground">Process revenue source events to generate forecast data.</p>
              </div>
            </DashboardWidget>
          )}
        </>
      )}
    </StandardDashboard>
  );
}
