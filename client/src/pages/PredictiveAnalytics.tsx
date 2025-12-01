import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, AlertTriangle, BarChart3, Brain, AlertCircle, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { IconNavigation } from "@/components/IconNavigation";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Prediction {
  id: string;
  name: string;
  forecast: number;
  confidence: number;
  accuracy: number;
  hasAnomaly: boolean;
}

export default function PredictiveAnalytics() {
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState("forecasts");
  const [newPrediction, setNewPrediction] = useState({ modelName: "", algorithm: "regression", confidence: "0.85" });

  const { data: predictions = [], isLoading } = useQuery<Prediction[]>({
    queryKey: ["/api/predictions"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/predictions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/predictions"] });
      setNewPrediction({ modelName: "", algorithm: "regression", confidence: "0.85" });
      toast({ title: "Model created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/predictions/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/predictions"] });
      toast({ title: "Model deleted" });
    }
  });

  const stats = {
    total: predictions.length
    highConfidence: predictions.filter((p: any) => p.confidence >= 0.8).length
    anomalies: predictions.filter((p: any) => p.hasAnomaly).length
    accuracy: ((predictions.reduce((sum: number, p: any) => sum + (p.accuracy || 0), 0) / (predictions.length || 1)) * 100).toFixed(0)
  };

  const navItems = [
    { id: "forecasts", label: "Forecasts", icon: TrendingUp, color: "text-green-500" }
    { id: "anomalies", label: "Anomalies", icon: AlertCircle, color: "text-red-500" }
    { id: "models", label: "Models", icon: Brain, color: "text-purple-500" }
  ];

  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-semibold flex items-center gap-2"><Brain className="w-8 h-8" />Predictive Analytics</h1>
        <p className="text-muted-foreground text-sm">ML forecasting and anomaly detection</p>
      </div>

      <Card data-testid="card-new-model">
        <CardHeader><CardTitle className="text-base">Create ML Model</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Model name" value={newPrediction.modelName} onChange={(e) => setNewPrediction({ ...newPrediction, modelName: e.target.value })} data-testid="input-model-name" />
            <Select value={newPrediction.algorithm} onValueChange={(v) => setNewPrediction({ ...newPrediction, algorithm: v })}>
              <SelectTrigger data-testid="select-algorithm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="regression">Regression</SelectItem>
                <SelectItem value="classification">Classification</SelectItem>
                <SelectItem value="clustering">Clustering</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newPrediction.confidence} onValueChange={(v) => setNewPrediction({ ...newPrediction, confidence: v })}>
              <SelectTrigger data-testid="select-confidence"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0.7">70%</SelectItem>
                <SelectItem value="0.8">80%</SelectItem>
                <SelectItem value="0.9">90%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newPrediction)} disabled={createMutation.isPending || !newPrediction.modelName} className="w-full" data-testid="button-create-model">
            <Plus className="w-4 h-4 mr-2" /> Create Model
          </Button>
        </CardContent>
      </Card>

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
        <Card>
          <CardHeader><CardTitle className="text-base">Predictive Models</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? <p>Loading...</p> : predictions.length === 0 ? <p className="text-muted-foreground text-center py-4">No models</p> : predictions.map((pred: any) => (
              <div key={pred.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`model-${pred.id}`}>
                <div>
                  <p className="font-semibold">{pred.name}</p>
                  <p className="text-sm text-muted-foreground">Forecast: ${(pred.forecast / 1000000).toFixed(1)}M • Confidence: {(pred.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge>{(pred.confidence * 100).toFixed(0)}%</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(pred.id)} data-testid={`button-delete-${pred.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {activeNav === "anomalies" && <Card><CardContent className="p-6"><p className="text-muted-foreground">Detected anomalies and outliers</p></CardContent></Card>}
      {activeNav === "models" && <Card><CardContent className="p-6"><p className="text-muted-foreground">ML model configuration and training</p></CardContent></Card>}
    </div>
  );
}
