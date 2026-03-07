import { cn } from "@/lib/utils";
import { useState } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EnterpriseContextSwitcher, buildScopeHeaders } from "@/components/enterprise/EnterpriseContextSwitcher";
import { StandardPage } from '@/components/layout/StandardPage';
import { formatNumber } from '@/lib/formatters';

export default function ProjectBudgetManagement() {
  const { toast } = useToast();
  const [buId, setBuId] = useState<string | undefined>();
  const [newBudget, setNewBudget] = useState({ project: "", category: "Labor", allocated: "", actual: "" });

  const scopeHeaders = buildScopeHeaders({ "business-unit": buId });

  const { data: budgets = [], isLoading } = useQuery<any>({
    queryKey: ["/api/project-budgets", buId],
    queryFn: () =>
      fetch("/api/project-budgets", { headers: scopeHeaders })
        .then(r => r.json())
        .catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/project-budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...scopeHeaders },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-budgets", buId] });
      setNewBudget({ project: "", category: "Labor", allocated: "", actual: "" });
      toast({ title: "Budget created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/project-budgets/${id}`, { method: "DELETE", headers: scopeHeaders }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-budgets", buId] });
      toast({ title: "Budget deleted" });
    },
  });

  const totalAllocated = budgets.reduce((s: number, b: any) => s + Number(b.allocated ?? 0), 0);
  const totalActual = budgets.reduce((s: number, b: any) => s + Number(b.actual ?? 0), 0);
  const remaining = totalAllocated - totalActual;
  const utilization = totalAllocated > 0 ? ((totalActual / totalAllocated) * 100).toFixed(1) : "0.0";

  return (
    <StandardPage
      title={
        <div className="flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Project Budget Management
        </div>
      }
      description="Monitor project budgets and costs"
      actions={
        <EnterpriseContextSwitcher
          type="business-unit"
          value={buId}
          onChange={setBuId}
        />
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-3">
          <Card className="p-3">
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Total Allocated</p>
              <p className="text-2xl font-bold">${formatNumber(totalAllocated)}</p>
            </CardContent>
          </Card>
          <Card className="p-3">
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">${formatNumber(totalActual)}</p>
            </CardContent>
          </Card>
          <Card className="p-3">
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className={cn(`text-2xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`)}>${formatNumber(remaining)}</p>
            </CardContent>
          </Card>
          <Card className="p-3">
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Budget Utilization</p>
              <p className="text-2xl font-bold">{utilization}%</p>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-new-budget">
          <CardHeader><CardTitle className="text-base">Add Budget</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <Input placeholder="Project" value={newBudget.project} onChange={(e) => setNewBudget({ ...newBudget, project: e.target.value })} data-testid="input-project" />
              <Select value={newBudget.category} onValueChange={(v) => setNewBudget({ ...newBudget, category: v })}>
                <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Labor">Labor</SelectItem>
                  <SelectItem value="Materials">Materials</SelectItem>
                  <SelectItem value="Overhead">Overhead</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Allocated" type="number" value={newBudget.allocated} onChange={(e) => setNewBudget({ ...newBudget, allocated: e.target.value })} data-testid="input-allocated" />
              <Input placeholder="Actual" type="number" value={newBudget.actual} onChange={(e) => setNewBudget({ ...newBudget, actual: e.target.value })} data-testid="input-actual" />
            </div>
            <Button
              disabled={createMutation.isPending || !newBudget.project}
              className="w-full"
              data-testid="button-create-budget"
              onClick={() => createMutation.mutate(newBudget)}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Budget
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Budget Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <TableSkeleton rows={4} />
            ) : budgets.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No budgets</p>
            ) : (
              budgets.map((budget: any) => {
                const variance = (parseFloat(budget.actual || 0) - parseFloat(budget.allocated || 0));
                const status = variance > 0 ? "over" : "on-track";
                return (
                  <div key={budget.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`budget-${budget.id}`}>
                    <div className="flex-1">
                      <h3 className="font-semibold">{budget.project}</h3>
                      <p className="text-sm text-muted-foreground">Category: {budget.category} • Allocated: ${budget.allocated} • Actual: ${budget.actual}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge variant={status === "on-track" ? "default" : "destructive"}>{status}</Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-delete-${budget.id}`}
                        onClick={() => deleteMutation.mutate(budget.id)} aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </StandardPage>
  );
}
