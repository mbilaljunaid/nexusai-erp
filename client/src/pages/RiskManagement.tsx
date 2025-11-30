import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RiskManagement() {
  const { toast } = useToast();
  const [newRisk, setNewRisk] = useState({ riskDescription: "", likelihood: "medium", impact: "medium", riskCategory: "operational" });

  const { data: risks = [], isLoading } = useQuery({
    queryKey: ["/api/risk-register"],
    queryFn: () => fetch("/api/risk-register").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data) => fetch("/api/risk-register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-register"] });
      setNewRisk({ riskDescription: "", likelihood: "medium", impact: "medium", riskCategory: "operational" });
      toast({ title: "Risk created successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/risk-register/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risk-register"] });
      toast({ title: "Risk deleted" });
    },
  });

  const calculateRiskScore = (likelihood: string, impact: string) => {
    const scores = { low: 1, medium: 2, high: 3 };
    return (scores[likelihood as keyof typeof scores] * scores[impact as keyof typeof scores] * 2.5).toFixed(1);
  };

  const metrics = {
    total: risks.length,
    open: risks.filter((r: any) => r.status === "open").length,
    mitigated: risks.filter((r: any) => r.status === "mitigated").length,
    avgScore: risks.length > 0 ? (risks.reduce((sum: number, r: any) => sum + parseFloat(r.riskScore || 0), 0) / risks.length).toFixed(1) : "0",
  };

  return (
    <div className="space-y-6 p-4" data-testid="risk-management">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          Risk Management
        </h1>
        <p className="text-muted-foreground mt-2">Track, assess, and mitigate organizational risks</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3" data-testid="card-total-risks">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Risks</p>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-open-risks">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Open Risks</p>
            <p className="text-2xl font-bold text-red-600">{metrics.open}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-mitigated-risks">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Mitigated Risks</p>
            <p className="text-2xl font-bold text-green-600">{metrics.mitigated}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-avg-score">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Risk Score</p>
            <p className="text-2xl font-bold">{metrics.avgScore}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-risk">
        <CardHeader>
          <CardTitle className="text-base">Register New Risk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Risk description" value={newRisk.riskDescription} onChange={(e) => setNewRisk({ ...newRisk, riskDescription: e.target.value })} data-testid="input-risk-description" />
          <div className="grid grid-cols-3 gap-3">
            <Select value={newRisk.likelihood} onValueChange={(v) => setNewRisk({ ...newRisk, likelihood: v })}>
              <SelectTrigger data-testid="select-likelihood">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newRisk.impact} onValueChange={(v) => setNewRisk({ ...newRisk, impact: v })}>
              <SelectTrigger data-testid="select-impact">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newRisk.riskCategory} onValueChange={(v) => setNewRisk({ ...newRisk, riskCategory: v })}>
              <SelectTrigger data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newRisk)} disabled={createMutation.isPending || !newRisk.riskDescription} className="w-full" data-testid="button-create-risk">
            <Plus className="w-4 h-4 mr-2" /> Register Risk
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Risk Register</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : risks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No risks registered</div>
          ) : (
            risks.map((r: any) => {
              const score = r.riskScore || calculateRiskScore(r.likelihood, r.impact);
              return (
                <div key={r.id} className="p-3 border rounded-lg hover-elevate" data-testid={`risk-item-${r.id}`}>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold flex-1">{r.riskDescription}</h3>
                    <Badge variant={r.status === "open" ? "destructive" : "default"}>{r.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Likelihood: {r.likelihood} • Impact: {r.impact} • Score: {score}</p>
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
