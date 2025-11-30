import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, BarChart3, Brain, TrendingUp, Calendar, Settings } from "lucide-react";

export default function AdvancedAnalytics() {
  const [viewType, setViewType] = useState("dashboards");

  const { data: dashboards = [] } = useQuery<any[]>({ queryKey: ["/api/analytics/advanced-dashboards"] });
  const { data: models = [] } = useQuery<any[]>({ queryKey: ["/api/analytics/models"] });
  const { data: forecasts = [] } = useQuery<any[]>({ queryKey: ["/api/analytics/forecast"] });

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboards.map((dash: any) => (
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
                <div className="text-xs text-muted-foreground">
                  Refresh: Every {dash.refreshInterval}s
                </div>
                <Button size="sm" className="w-full" data-testid={`button-open-dashboard-${dash.id}`}>
                  Open Dashboard
                </Button>
              </CardContent>
            </Card>
          ))}
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
