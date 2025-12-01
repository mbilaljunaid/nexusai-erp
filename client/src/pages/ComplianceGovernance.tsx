import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ComplianceGovernance() {
  const { toast } = useToast();
  const [newRule, setNewRule] = useState({ ruleName: "", jurisdiction: "", riskLevel: "medium" });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["/api/compliance-rules"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data) => fetch("/api/compliance-rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance-rules"] });
      setNewRule({ ruleName: "", jurisdiction: "", riskLevel: "medium" });
      toast({ title: "Compliance rule created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/compliance-rules/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance-rules"] });
      toast({ title: "Rule deleted" });
    }
  });

  const metrics = {
    active: rules.filter((r: any) => r.status === "active").length
    highRisk: rules.filter((r: any) => r.riskLevel === "high").length
    compliance: rules.length > 0 ? Math.round(((rules.length - rules.filter((r: any) => r.riskLevel === "high").length) / rules.length) * 100) : 100
  };

  return (
    <div className="space-y-6 p-4" data-testid="compliance-governance">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckCircle2 className="h-8 w-8" />
          Compliance & Governance
        </h1>
        <p className="text-muted-foreground mt-2">Manage regulatory compliance, policies, and governance rules</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3" data-testid="card-active-rules">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active Rules</p>
            <p className="text-2xl font-bold">{metrics.active}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-high-risk">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">High Risk Rules</p>
            <p className="text-2xl font-bold text-red-600">{metrics.highRisk}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-compliance-score">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Compliance Score</p>
            <p className="text-2xl font-bold text-green-600">{metrics.compliance}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-rule">
        <CardHeader>
          <CardTitle className="text-base">Create Compliance Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Rule name" value={newRule.ruleName} onChange={(e) => setNewRule({ ...newRule, ruleName: e.target.value })} data-testid="input-rule-name" />
            <Input placeholder="Jurisdiction (GDPR, SOX, etc)" value={newRule.jurisdiction} onChange={(e) => setNewRule({ ...newRule, jurisdiction: e.target.value })} data-testid="input-jurisdiction" />
            <Select value={newRule.riskLevel} onValueChange={(v) => setNewRule({ ...newRule, riskLevel: v })}>
              <SelectTrigger data-testid="select-risk-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newRule)} disabled={createMutation.isPending || !newRule.ruleName} className="w-full" data-testid="button-create-rule">
            <Plus className="w-4 h-4 mr-2" /> Create Rule
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compliance Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No compliance rules found</div>
          ) : (
            rules.map((r: any) => (
              <div key={r.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`rule-item-${r.id}`}>
                <div className="flex-1">
                  <div className="font-semibold">{r.ruleName}</div>
                  <p className="text-sm text-muted-foreground">Jurisdiction: {r.jurisdiction}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={r.riskLevel === "high" ? "destructive" : r.riskLevel === "medium" ? "secondary" : "default"}>
                    {r.riskLevel}
                  </Badge>
                  <Badge variant={r.status === "active" ? "default" : "secondary"}>{r.status}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
