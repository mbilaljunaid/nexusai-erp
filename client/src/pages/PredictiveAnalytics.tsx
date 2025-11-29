import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, AlertTriangle, BarChart3, Brain, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { IconNavigation } from "@/components/IconNavigation";

interface Prediction {
  id: string;
  name: string;
  forecast: number;
  confidence: number;
  accuracy: number;
  hasAnomaly: boolean;
}

export default function PredictiveAnalytics() {
  const [activeNav, setActiveNav] = useState("forecasts");
  const { data: predictions = [] } = useQuery<Prediction[]>({
    queryKey: ["/api/predictions"],
    retry: false,
  });

  const stats = {
    total: predictions.length,
    highConfidence: predictions.filter((p: any) => p.confidence >= 0.8).length,
    anomalies: predictions.filter((p: any) => p.hasAnomaly).length,
    accuracy: ((predictions.reduce((sum: number, p: any) => sum + (p.accuracy || 0), 0) / (predictions.length || 1)) * 100).toFixed(0),
  };

  const navItems = [
    { id: "forecasts", label: "Forecasts", icon: TrendingUp, color: "text-green-500" },
    { id: "anomalies", label: "Anomalies", icon: AlertCircle, color: "text-red-500" },
    { id: "models", label: "Models", icon: Brain, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Predictive Analytics</h1>
        <p className="text-muted-foreground text-sm">ML forecasting and anomaly detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Models</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold">{stats.highConfidence}</p>
              <p className="text-xs text-muted-foreground">High Confidence</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{stats.anomalies}</p>
              <p className="text-xs text-muted-foreground">Anomalies</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{stats.accuracy}%</p>
              <p className="text-xs text-muted-foreground">Avg Accuracy</p></div>
          </div>
        </CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "forecasts" && (
        <div className="space-y-3">
          {predictions.map((pred: any) => (
            <Card key={pred.id} className="hover-elevate cursor-pointer"><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{pred.name}</p>
                  <p className="text-sm text-muted-foreground">Forecast: ${(pred.forecast / 1000000).toFixed(1)}M • Confidence: {(pred.confidence * 100).toFixed(0)}%</p></div>
                <Badge>{(pred.confidence * 100).toFixed(0)}%</Badge>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "anomalies" && <Card><CardContent className="p-6"><p className="text-muted-foreground">Detected anomalies and outliers</p></CardContent></Card>}
      {activeNav === "models" && <Card><CardContent className="p-6"><p className="text-muted-foreground">ML model configuration and training</p></CardContent></Card>}
    </div>
  );
}
