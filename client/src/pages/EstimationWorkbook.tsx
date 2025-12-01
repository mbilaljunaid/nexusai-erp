import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EstimationWorkbook() {
  const { toast } = useToast();
  const [newEst, setNewEst] = useState({ project: "Project-A", description: "", qty: "100", rate: "500", margin: "15", status: "draft" });

  const { data: estimates = [], isLoading } = useQuery({
    queryKey: ["/api/estimations"],
    queryFn: () => fetch("/api/estimations").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/estimations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimations"] });
      setNewEst({ project: "Project-A", description: "", qty: "100", rate: "500", margin: "15", status: "draft" });
      toast({ title: "Estimate created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/estimations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimations"] });
      toast({ title: "Estimate deleted" });
    },
  });

  const totalAmount = estimates.reduce((sum: number, e: any) => sum + ((parseFloat(e.qty) || 0) * (parseFloat(e.rate) || 0)), 0);
  const approved = estimates.filter((e: any) => e.status === "approved").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calculator className="h-8 w-8" />
          Estimation Workbook
        </h1>
        <p className="text-muted-foreground mt-2">Material, labor, and equipment rate estimation</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Estimates</p>
            <p className="text-2xl font-bold">{estimates.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approved}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">${(totalAmount / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Margin</p>
            <p className="text-2xl font-bold">{estimates.length > 0 ? (estimates.reduce((sum: number, e: any) => sum + (parseFloat(e.margin) || 0), 0) / estimates.length).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-estimate">
        <CardHeader><CardTitle className="text-base">Add Estimate Line</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-6 gap-2">
            <Input placeholder="Description" value={newEst.description} onChange={(e) => setNewEst({ ...newEst, description: e.target.value })} data-testid="input-desc" className="text-sm" />
            <Input placeholder="Qty" type="number" value={newEst.qty} onChange={(e) => setNewEst({ ...newEst, qty: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Input placeholder="Rate" type="number" value={newEst.rate} onChange={(e) => setNewEst({ ...newEst, rate: e.target.value })} data-testid="input-rate" className="text-sm" />
            <Input placeholder="Margin %" type="number" value={newEst.margin} onChange={(e) => setNewEst({ ...newEst, margin: e.target.value })} data-testid="input-margin" className="text-sm" />
            <Select value={newEst.status} onValueChange={(v) => setNewEst({ ...newEst, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newEst)} disabled={createMutation.isPending} size="sm" data-testid="button-add-est">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Estimates</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : estimates.length === 0 ? <p className="text-muted-foreground text-center py-4">No estimates</p> : estimates.map((e: any) => {
            const amount = (parseFloat(e.qty) || 0) * (parseFloat(e.rate) || 0);
            const withMargin = amount * (1 + (parseFloat(e.margin) || 0) / 100);
            return (
              <div key={e.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`est-${e.id}`}>
                <div className="flex-1">
                  <p className="font-semibold">{e.description}</p>
                  <p className="text-xs text-muted-foreground">{e.qty}x ${e.rate} = ${amount.toFixed(0)} → ${withMargin.toFixed(0)} (+{e.margin}%)</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={e.status === "approved" ? "default" : "secondary"} className="text-xs">{e.status}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(e.id)} data-testid={`button-delete-${e.id}`} className="h-7 w-7">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
