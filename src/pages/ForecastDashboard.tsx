import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ForecastDashboard() {
  const { toast } = useToast();
  const [newForecast, setNewForecast] = useState({ forecastName: "", period: "Q1", value: "", confidence: "medium" });

  const { data: forecasts = [], isLoading } = useQuery({
    queryKey: ["/api/forecasts"],
    queryFn: () => fetch("/api/forecasts").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/forecasts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forecasts"] });
      setNewForecast({ forecastName: "", period: "Q1", value: "", confidence: "medium" });
      toast({ title: "Forecast created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/forecasts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forecasts"] });
      toast({ title: "Forecast deleted" });
    },
  });

  const forecastData = [
    { month: "Jan", forecast: 450, actual: 380 },
    { month: "Feb", forecast: 520, actual: 480 },
    { month: "Mar", forecast: 680, actual: 650 },
    { month: "Apr", forecast: 720, actual: null },
    { month: "May", forecast: 850, actual: null },
    { month: "Jun", forecast: 920, actual: null },
  ];

  const stageWiseData = [
    { stage: "Prospecting", forecast: 120 },
    { stage: "Qualification", forecast: 180 },
    { stage: "Needs Analysis", forecast: 320 },
    { stage: "Proposal", forecast: 750 },
    { stage: "Negotiation", forecast: 540 },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><TrendingUp className="w-8 h-8" />Revenue Forecast</h1>
        <p className="text-muted-foreground mt-1">6-month revenue projection based on pipeline</p>
      </div>

      <Card data-testid="card-new-forecast">
        <CardHeader><CardTitle className="text-base">Create Forecast</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Forecast name" value={newForecast.forecastName} onChange={(e) => setNewForecast({ ...newForecast, forecastName: e.target.value })} data-testid="input-name" />
            <Select value={newForecast.period} onValueChange={(v) => setNewForecast({ ...newForecast, period: v })}>
              <SelectTrigger data-testid="select-period"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Value" type="number" value={newForecast.value} onChange={(e) => setNewForecast({ ...newForecast, value: e.target.value })} data-testid="input-value" />
            <Select value={newForecast.confidence} onValueChange={(v) => setNewForecast({ ...newForecast, confidence: v })}>
              <SelectTrigger data-testid="select-confidence"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newForecast)} disabled={createMutation.isPending || !newForecast.forecastName} className="w-full" data-testid="button-create-forecast">
            <Plus className="w-4 h-4 mr-2" /> Create Forecast
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Q1 Forecast</p><p className="text-3xl font-bold mt-1">$1.65M</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Pipeline Value</p><p className="text-3xl font-bold mt-1">$2.91M</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Weighted Forecast</p><p className="text-3xl font-bold mt-1">$1.45M</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Forecasts</p><p className="text-3xl font-bold mt-1">{forecasts.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Forecast Registry</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : forecasts.length === 0 ? <p className="text-muted-foreground text-center py-4">No forecasts</p> : forecasts.map((f: any) => (
            <div key={f.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`forecast-${f.id}`}>
              <div>
                <h3 className="font-semibold">{f.forecastName}</h3>
                <p className="text-sm text-muted-foreground">Period: {f.period} • Value: ${f.value}M • Confidence: {f.confidence}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(f.id)} data-testid={`button-delete-${f.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">6-Month Forecast Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="forecast" stroke="#3b82f6" name="Forecast" strokeWidth={2} />
              <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Forecast by Stage</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageWiseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="forecast" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
