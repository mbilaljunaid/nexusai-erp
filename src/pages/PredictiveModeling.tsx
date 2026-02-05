import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PredictiveModeling() {
  const { toast } = useToast();
  const [newModel, setNewModel] = useState({ name: "", module: "Finance", algorithm: "linear", status: "active" });

  const { data: models = [], isLoading } = useQuery({
    queryKey: ["/api/predictive-models"],
    queryFn: () => fetch("/api/predictive-models").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/predictive-models", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/predictive-models"] });
      setNewModel({ name: "", module: "Finance", algorithm: "linear", status: "active" });
      toast({ title: "Predictive model created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/predictive-models/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/predictive-models"] });
      toast({ title: "Predictive model deleted" });
    },
  });

  const activeModels = models.filter((m: any) => m.status === "active");
  const avgAccuracy = models.length > 0 ? (models.reduce((sum: number, m: any) => sum + (m.accuracy || 0), 0) / models.length).toFixed(1) : "0";

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8" />
          Predictive Modeling
        </h1>
        <p className="text-muted-foreground mt-2">Create and manage AI predictive models</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Models</p>
            <p className="text-2xl font-bold">{models.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeModels.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
            <p className="text-2xl font-bold">{avgAccuracy}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Training Status</p>
            <p className="text-2xl font-bold text-blue-600">Ready</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-model">
        <CardHeader><CardTitle className="text-base">Create Model</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Model name" value={newModel.name} onChange={(e) => setNewModel({ ...newModel, name: e.target.value })} data-testid="input-name" />
            <Select value={newModel.module} onValueChange={(v) => setNewModel({ ...newModel, module: v })}>
              <SelectTrigger data-testid="select-module"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="CRM">CRM</SelectItem>
                <SelectItem value="Inventory">Inventory</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newModel.algorithm} onValueChange={(v) => setNewModel({ ...newModel, algorithm: v })}>
              <SelectTrigger data-testid="select-algorithm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear Regression</SelectItem>
                <SelectItem value="random_forest">Random Forest</SelectItem>
                <SelectItem value="neural_net">Neural Network</SelectItem>
                <SelectItem value="svm">SVM</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newModel.status} onValueChange={(v) => setNewModel({ ...newModel, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={createMutation.isPending || !newModel.name} className="w-full" data-testid="button-create-model">
            <Plus className="w-4 h-4 mr-2" /> Create Model
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Active Models</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : models.length === 0 ? <p className="text-muted-foreground text-center py-4">No models</p> : models.map((m: any) => (
            <div key={m.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`model-${m.id}`}>
              <div className="flex-1">
                <h3 className="font-semibold">{m.name}</h3>
                <p className="text-sm text-muted-foreground">Module: {m.module} • Algorithm: {m.algorithm} • Accuracy: {m.accuracy || "N/A"}%</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={m.status === "active" ? "default" : m.status === "training" ? "secondary" : "outline"}>{m.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${m.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
