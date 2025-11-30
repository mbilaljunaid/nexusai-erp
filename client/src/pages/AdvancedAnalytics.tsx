import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, BarChart3, Brain, TrendingUp, Calendar, Settings, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdvancedAnalytics() {
  const { toast } = useToast();
  const [viewType, setViewType] = useState("dashboards");
  const [newDash, setNewDash] = useState({ name: "", owner: "" });

  const { data: dashboards = [], isLoading: dashLoading } = useQuery<any[]>({ 
    queryKey: ["/api/analytics/advanced-dashboards"],
    queryFn: () => fetch("/api/analytics/advanced-dashboards").then(r => r.json()).catch(() => []),
  });
  const { data: models = [], isLoading: modelsLoading } = useQuery<any[]>({ 
    queryKey: ["/api/analytics/models"],
    queryFn: () => fetch("/api/analytics/models").then(r => r.json()).catch(() => []),
  });
  const { data: forecasts = [], isLoading: forecastsLoading } = useQuery<any[]>({ 
    queryKey: ["/api/analytics/forecast"],
    queryFn: () => fetch("/api/analytics/forecast").then(r => r.json()).catch(() => []),
  });

  const createDashMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/analytics/advanced-dashboards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/advanced-dashboards"] });
      setNewDash({ name: "", owner: "" });
      toast({ title: "Dashboard created" });
    },
  });

  const deleteDashMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/analytics/advanced-dashboards/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/advanced-dashboards"] });
      toast({ title: "Dashboard deleted" });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        <p className="text-muted-foreground mt-2">AI-powered dashboards, predictive models, and forecasting</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={viewType === "dashboards" ? "default" : "outline"}
          onClick={() => setViewType("dashboards")}
          className="gap-2"
          data-testid="button-view-dashboards"
        >
          <BarChart3 className="h-4 w-4" />
          Dashboards ({dashboards.length})
        </Button>
        <Button
          variant={viewType === "models" ? "default" : "outline"}
          onClick={() => setViewType("models")}
          className="gap-2"
          data-testid="button-view-models"
        >
          <Brain className="h-4 w-4" />
          Models ({models.length})
        </Button>
        <Button
          variant={viewType === "forecast" ? "default" : "outline"}
          onClick={() => setViewType("forecast")}
          className="gap-2"
          data-testid="button-view-forecast"
        >
          <TrendingUp className="h-4 w-4" />
          Forecast ({forecasts.length})
        </Button>
      </div>

      {viewType === "dashboards" && (
        <div className="space-y-4">
          <Card data-testid="card-new-advanced-dash">
            <CardHeader><CardTitle className="text-base">Create Dashboard</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Name" value={newDash.name} onChange={(e) => setNewDash({ ...newDash, name: e.target.value })} data-testid="input-name" />
                <Input placeholder="Owner" value={newDash.owner} onChange={(e) => setNewDash({ ...newDash, owner: e.target.value })} data-testid="input-owner" />
              </div>
              <Button onClick={() => createDashMutation.mutate(newDash)} disabled={createDashMutation.isPending || !newDash.name} className="w-full" data-testid="button-create-dashboard">
                <Plus className="w-4 h-4 mr-2" /> Create Dashboard
              </Button>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashLoading ? <p>Loading...</p> : dashboards.map((dash: any) => (
              <Card key={dash.id} data-testid={`card-dashboard-${dash.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      {dash.name}
                    </span>
                    <Badge variant="outline">{dash.dashboardType}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Owner:</span>
                    <div className="text-sm font-medium">{dash.owner}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Widgets:</span>
                    <div className="flex gap-1 mt-1">
                      {dash.widgets?.map((widget: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="capitalize">{widget}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" data-testid={`button-open-dashboard-${dash.id}`}>
                      Open Dashboard
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteDashMutation.mutate(dash.id)} data-testid={`button-delete-${dash.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {viewType === "models" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model: any) => (
            <Card key={model.id} data-testid={`card-model-${model.id}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    {model.modelName}
                  </span>
                  <Badge>{model.modelType}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Accuracy</span>
                    <div className="text-xl font-bold">{model.accuracy}%</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Status</span>
                    <Badge variant="default" className="mt-1">{model.status}</Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last trained: {new Date(model.lastTrainDate).toLocaleDateString()}
                </div>
                <Button size="sm" variant="outline" className="w-full" data-testid={`button-retrain-${model.id}`}>
                  Retrain Model
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewType === "forecast" && (
        <div className="space-y-3">
          {forecasts.map((forecast: any) => (
            <Card key={forecast.id} data-testid={`card-forecast-${forecast.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {forecast.forecastPeriod}
                    </h4>
                    <p className="text-sm text-muted-foreground">{forecast.metric}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-2xl font-bold">{forecast.predictedValue}</div>
                    <div className="text-xs text-muted-foreground">
                      Confidence: {forecast.confidenceInterval}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
