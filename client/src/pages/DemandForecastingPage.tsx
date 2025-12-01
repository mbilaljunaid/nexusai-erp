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

export default function DemandForecastingPage() {
  const { toast } = useToast();
  const [newForecast, setNewForecast] = useState({ item: "", period: "Q1", quantity: "", method: "Time Series" });

  const { data: forecasts = [], isLoading } = useQuery({
    queryKey: ["/api/demand-forecasts"],
    queryFn: () => fetch("/api/demand-forecasts").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/demand-forecasts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demand-forecasts"] });
      setNewForecast({ item: "", period: "Q1", quantity: "", method: "Time Series" });
      toast({ title: "Forecast created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/demand-forecasts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/demand-forecasts"] });
      toast({ title: "Forecast deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Demand Forecasting
        </h1>
        <p className="text-muted-foreground mt-2">Predict future demand and optimize inventory</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
            <p className="text-2xl font-bold text-green-600">95.7%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Items Tracked</p>
            <p className="text-2xl font-bold">156</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Forecast Periods</p>
            <p className="text-2xl font-bold">8</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-forecast">
        <CardHeader><CardTitle className="text-base">Create Forecast</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Item/SKU" value={newForecast.item} onChange={(e) => setNewForecast({ ...newForecast, item: e.target.value })} data-testid="input-item" />
            <Select value={newForecast.period} onValueChange={(v) => setNewForecast({ ...newForecast, period: v })}>
              <SelectTrigger data-testid="select-period"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Quantity" type="number" value={newForecast.quantity} onChange={(e) => setNewForecast({ ...newForecast, quantity: e.target.value })} data-testid="input-quantity" />
            <Select value={newForecast.method} onValueChange={(v) => setNewForecast({ ...newForecast, method: v })}>
              <SelectTrigger data-testid="select-method"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Time Series">Time Series</SelectItem>
                <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                <SelectItem value="Regression">Regression</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newForecast)} disabled={createMutation.isPending || !newForecast.item} className="w-full" data-testid="button-create-forecast">
            <Plus className="w-4 h-4 mr-2" /> Create Forecast
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Demand Forecasts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : forecasts.length === 0 ? <p className="text-muted-foreground text-center py-4">No forecasts</p> : forecasts.map((forecast: any) => (
            <div key={forecast.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`forecast-${forecast.id}`}>
              <div>
                <h3 className="font-semibold">{forecast.item}</h3>
                <p className="text-sm text-muted-foreground">Period: {forecast.period} • Qty: {forecast.quantity} • Method: {forecast.method}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(forecast.id)} data-testid={`button-delete-${forecast.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
