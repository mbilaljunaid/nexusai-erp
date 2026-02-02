import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Handshake, Plus, Trash2, BadgeDollarSign, Clock, CheckCircle2, FileText, Activity } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function VehicleSalesDeals() {
  const { toast } = useToast();
  const [newDeal, setNewDeal] = useState({ dealId: "", customerId: "", vin: "", salePrice: "0", status: "pending" });

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["/api/auto-deals"],
    queryFn: () => fetch("/api/auto-deals").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/auto-deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-deals"] });
      setNewDeal({ dealId: "", customerId: "", vin: "", salePrice: "0", status: "pending" });
      toast({ title: "Deal created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/auto-deals/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-deals"] });
      toast({ title: "Deal deleted" });
    },
  });

  const completed = deals.filter((d: any) => d.status === "completed").length;
  const totalSales = deals.reduce((sum: number, d: any) => sum + (parseFloat(d.salePrice) || 0), 0);
  const pendingCount = deals.filter((d: any) => d.status === "pending").length;

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Vehicle Sales & Deal Closing</h1>
          <p className="text-muted-foreground mt-1">DMS orchestration, multi-party deal structuring, F&I integration, and contract management</p>
        </div>
      }
    >
      <DashboardWidget title="Active Pipeline" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <Handshake className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{deals.length}</div>
            <p className="text-xs text-muted-foreground">Total deal flow</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Pending Approvals" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-amber-100/50">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting F&I</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Closed Deals" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">{completed}</div>
            <p className="text-xs text-muted-foreground">Finalized contracts</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Gross Proceeds" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100/50">
            <BadgeDollarSign className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600">${(totalSales / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Cumulative value</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Structure New Deal" colSpan={4} icon={Plus}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deal Number</label>
            <Input placeholder="DEAL-000" value={newDeal.dealId} onChange={(e) => setNewDeal({ ...newDeal, dealId: e.target.value })} data-testid="input-did" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer Ref</label>
            <Input placeholder="CUST-ID" value={newDeal.customerId} onChange={(e) => setNewDeal({ ...newDeal, customerId: e.target.value })} data-testid="input-cid" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock VIN</label>
            <Input placeholder="17-Digit VIN" value={newDeal.vin} onChange={(e) => setNewDeal({ ...newDeal, vin: e.target.value })} data-testid="input-vin" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sale Price</label>
            <Input placeholder="0.00" type="number" value={newDeal.salePrice} onChange={(e) => setNewDeal({ ...newDeal, salePrice: e.target.value })} data-testid="input-price" />
          </div>
          <Button onClick={() => createMutation.mutate(newDeal)} disabled={createMutation.isPending || !newDeal.dealId} className="w-full" data-testid="button-create">
            {createMutation.isPending ? <Activity className="h-4 w-4 animate-spin" /> : "Initiate Closing"}
          </Button>
        </div>
      </DashboardWidget>

      <DashboardWidget colSpan={4} title="Dealership Ledger" icon={FileText}>
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : deals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-medium">No deals staged in the contemporary window</p>
          ) : (
            deals.map((d: any) => (
              <div key={d.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4" data-testid={`deal-${d.id}`}>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{d.dealId}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-tighter">
                      VIN: {d.vin?.substring(0, 8)}...
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Customer: {d.customerId} • Sale Price: ${parseFloat(d.salePrice).toLocaleString()}</p>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <Badge variant={d.status === "completed" ? "default" : "secondary"} className="text-[10px] uppercase font-mono">
                    {d.status}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteMutation.mutate(d.id)} data-testid={`button-delete-${d.id}`}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardWidget>
    </StandardDashboard>
  );
}
