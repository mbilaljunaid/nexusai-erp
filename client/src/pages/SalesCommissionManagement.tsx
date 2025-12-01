import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SalesCommissionManagement() {
  const { toast } = useToast();
  const [newComm, setNewComm] = useState({ salesRep: "", territory: "", commissionRate: "5", period: "monthly", status: "accrued" });

  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ["/api/commissions"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/commissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commissions"] });
      setNewComm({ salesRep: "", territory: "", commissionRate: "5", period: "monthly", status: "accrued" });
      toast({ title: "Commission created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/commissions/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commissions"] });
      toast({ title: "Commission deleted" });
    }
  });

  const paid = commissions.filter((c: any) => c.status === "paid").length;
  const avgRate = commissions.length > 0 ? (commissions.reduce((sum: number, c: any) => sum + (parseFloat(c.commissionRate) || 0), 0) / commissions.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8" />
          Sales Territory & Commission Management
        </h1>
        <p className="text-muted-foreground mt-2">Territory allocation, quotas, commission rules, and payouts</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Commissions</p>
            <p className="text-2xl font-bold">{commissions.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold text-green-600">{paid}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Accrued</p>
            <p className="text-2xl font-bold text-blue-600">{commissions.length - paid}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Rate</p>
            <p className="text-2xl font-bold">{avgRate}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-comm">
        <CardHeader><CardTitle className="text-base">Create Commission Rule</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-6 gap-2">
            <Input placeholder="Sales Rep" value={newComm.salesRep} onChange={(e) => setNewComm({ ...newComm, salesRep: e.target.value })} data-testid="input-rep" className="text-sm" />
            <Input placeholder="Territory" value={newComm.territory} onChange={(e) => setNewComm({ ...newComm, territory: e.target.value })} data-testid="input-territory" className="text-sm" />
            <Input placeholder="Rate %" type="number" value={newComm.commissionRate} onChange={(e) => setNewComm({ ...newComm, commissionRate: e.target.value })} data-testid="input-rate" className="text-sm" />
            <Select value={newComm.period} onValueChange={(v) => setNewComm({ ...newComm, period: v })}>
              <SelectTrigger data-testid="select-period" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newComm.status} onValueChange={(v) => setNewComm({ ...newComm, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="accrued">Accrued</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newComm)} disabled={createMutation.isPending || !newComm.salesRep} size="sm" data-testid="button-add-comm">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Commissions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : commissions.length === 0 ? <p className="text-muted-foreground text-center py-4">No commissions</p> : commissions.map((c: any) => (
            <div key={c.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`comm-${c.id}`}>
              <div>
                <p className="font-semibold">{c.salesRep}</p>
                <p className="text-xs text-muted-foreground">{c.territory} • {c.commissionRate}% • {c.period}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={c.status === "paid" ? "default" : "secondary"} className="text-xs">{c.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-${c.id}`} className="h-7 w-7">
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
