import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PricingRebatesEngine() {
  const { toast } = useToast();
  const [newRebate, setNewRebate] = useState({ customer: "", tierQty: "1000", rebateRate: "5", period: "monthly", status: "active" });

  const { data: rebates = [], isLoading } = useQuery({
    queryKey: ["/api/rebates"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/rebates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rebates"] });
      setNewRebate({ customer: "", tierQty: "1000", rebateRate: "5", period: "monthly", status: "active" });
      toast({ title: "Rebate tier created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/rebates/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rebates"] });
      toast({ title: "Rebate deleted" });
    }
  });

  const active = rebates.filter((r: any) => r.status === "active").length;
  const totalLiability = rebates.reduce((sum: number, r: any) => sum + (parseFloat(r.tierQty) * parseFloat(r.rebateRate) / 100 || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Pricing, Rebates & Trade Promotions
        </h1>
        <p className="text-muted-foreground mt-2">Volume tiers, tier pricing, rebate accruals, and settlement</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Tiers</p>
            <p className="text-2xl font-bold">{rebates.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{active}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Rebate Liability</p>
            <p className="text-2xl font-bold">${(totalLiability / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Rate</p>
            <p className="text-2xl font-bold">{rebates.length > 0 ? (rebates.reduce((sum: number, r: any) => sum + (parseFloat(r.rebateRate) || 0), 0) / rebates.length).toFixed(1) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-rebate">
        <CardHeader><CardTitle className="text-base">Create Rebate Tier</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-6 gap-2">
            <Input placeholder="Customer" value={newRebate.customer} onChange={(e) => setNewRebate({ ...newRebate, customer: e.target.value })} data-testid="input-customer" className="text-sm" />
            <Input placeholder="Tier Qty" type="number" value={newRebate.tierQty} onChange={(e) => setNewRebate({ ...newRebate, tierQty: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Input placeholder="Rebate %" type="number" value={newRebate.rebateRate} onChange={(e) => setNewRebate({ ...newRebate, rebateRate: e.target.value })} data-testid="input-rate" className="text-sm" />
            <Select value={newRebate.period} onValueChange={(v) => setNewRebate({ ...newRebate, period: v })}>
              <SelectTrigger data-testid="select-period" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newRebate.status} onValueChange={(v) => setNewRebate({ ...newRebate, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newRebate)} disabled={createMutation.isPending || !newRebate.customer} size="sm" data-testid="button-add-rebate">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Rebate Tiers</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : rebates.length === 0 ? <p className="text-muted-foreground text-center py-4">No tiers</p> : rebates.map((r: any) => (
            <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`rebate-${r.id}`}>
              <div>
                <p className="font-semibold">{r.customer}</p>
                <p className="text-xs text-muted-foreground">{r.tierQty} units • {r.rebateRate}% • {r.period}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={r.status === "active" ? "default" : "secondary"} className="text-xs">{r.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
