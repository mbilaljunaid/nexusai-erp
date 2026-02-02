import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus, Trash2, Calendar, Target, ShieldCheck, Activity } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function RevenueForecasting() {
  const { toast } = useToast();
  const [newForecast, setNewForecast] = useState({ period: "Q2", baseline: "", confidence: "85" });

  const { data: forecasts = [], isLoading } = useQuery({
    queryKey: ["/api/analytics/forecast"],
    queryFn: () => fetch("/api/analytics/forecast").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/analytics/forecast", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/forecast"] });
      setNewForecast({ period: "Q2", baseline: "", confidence: "85" });
      toast({ title: "Forecast created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/analytics/forecast/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/forecast"] });
      toast({ title: "Forecast deleted" });
    },
  });

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Revenue Forecasting</h1>
          <p className="text-muted-foreground mt-1">Advanced revenue projections, scenario modeling, and predictive analytics</p>
        </div>
      }
    >
      <DashboardWidget title="Create New Forecast" colSpan={4} icon={Plus}>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Period</label>
            <Select value={newForecast.period} onValueChange={(v) => setNewForecast({ ...newForecast, period: v })}>
              <SelectTrigger data-testid="select-period"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Baseline Revenue</label>
            <Input placeholder="Enter amount" type="number" value={newForecast.baseline} onChange={(e) => setNewForecast({ ...newForecast, baseline: e.target.value })} data-testid="input-baseline" />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confidence Level</label>
            <Select value={newForecast.confidence} onValueChange={(v) => setNewForecast({ ...newForecast, confidence: v })}>
              <SelectTrigger data-testid="select-confidence"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="70">70%</SelectItem>
                <SelectItem value="80">80%</SelectItem>
                <SelectItem value="85">85%</SelectItem>
                <SelectItem value="90">90%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => createMutation.mutate(newForecast)}
            disabled={createMutation.isPending || !newForecast.baseline}
            className="md:w-auto w-full px-8"
            data-testid="button-create-forecast"
          >
            {createMutation.isPending ? "Generating..." : "Generate Forecast"}
          </Button>
        </div>
      </DashboardWidget>

      {isLoading ? (
        Array(4).fill(0).map((_, i) => (
          <DashboardWidget key={i} colSpan={1}>
            <Skeleton className="h-24 w-full" />
          </DashboardWidget>
        ))
      ) : forecasts.length === 0 ? (
        <DashboardWidget colSpan={4}>
          <p className="text-muted-foreground text-center py-8 font-medium">No active forecasts found. Generate one to see projections.</p>
        </DashboardWidget>
      ) : (
        forecasts.map((f: any) => (
          <DashboardWidget
            key={f.id}
            colSpan={1}
            title={`${f.period} Forecast`}
            action={
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(f.id)} data-testid={`button-delete-${f.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold tracking-tight">${(f.baseline / 1000000).toFixed(1)}M</div>
                <div className="p-2 rounded-full bg-blue-100/50">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[10px] uppercase">{f.confidence || 85}% Confidence</Badge>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">AI Projecton</span>
              </div>
            </div>
          </DashboardWidget>
        ))
      )}
    </StandardDashboard>
  );
}
