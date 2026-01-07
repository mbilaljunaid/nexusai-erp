import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><TrendingUp className="w-8 h-8" />Revenue Forecasting</h1>
        <p className="text-muted-foreground mt-1">Advanced revenue projections and scenarios</p>
      </div>

      <Card data-testid="card-new-forecast">
        <CardHeader><CardTitle className="text-base">Create Forecast</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Select value={newForecast.period} onValueChange={(v) => setNewForecast({ ...newForecast, period: v })}>
              <SelectTrigger data-testid="select-period"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Baseline revenue" type="number" value={newForecast.baseline} onChange={(e) => setNewForecast({ ...newForecast, baseline: e.target.value })} data-testid="input-baseline" />
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
          <Button disabled={createMutation.isPending || !newForecast.baseline} className="w-full" data-testid="button-create-forecast">
            <Plus className="w-4 h-4 mr-2" /> Create Forecast
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? <p>Loading...</p> : forecasts.length === 0 ? <p className="text-muted-foreground text-center py-4">No forecasts</p> : forecasts.slice(0, 3).map((f: any) => (
          <Card key={f.id} data-testid={`forecast-${f.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{f.period} Forecast</p>
                  <p className="text-3xl font-bold mt-1">${(f.baseline / 1000000).toFixed(1)}M</p>
                  <Badge className="mt-2" variant="secondary">{f.confidence || 85}% confidence</Badge>
                </div>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${f.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
