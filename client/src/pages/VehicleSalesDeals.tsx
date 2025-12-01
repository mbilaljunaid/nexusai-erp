import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Handshake, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VehicleSalesDeals() {
  const { toast } = useToast();
  const [newDeal, setNewDeal] = useState({ dealId: "", customerId: "", vin: "", salePrice: "0", status: "pending" });

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["/api/auto-deals"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/auto-deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-deals"] });
      setNewDeal({ dealId: "", customerId: "", vin: "", salePrice: "0", status: "pending" });
      toast({ title: "Deal created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/auto-deals/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-deals"] });
      toast({ title: "Deal deleted" });
    }
  });

  const completed = deals.filter((d: any) => d.status === "completed").length;
  const totalSales = deals.reduce((sum: number, d: any) => sum + (parseFloat(d.salePrice) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Handshake className="h-8 w-8" />
          Vehicle Sales & Deal Closing
        </h1>
        <p className="text-muted-foreground mt-2">Quotation, deal structuring, F&I packages, approvals, and contracts</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Deals</p>
            <p className="text-2xl font-bold">{deals.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{deals.filter((d: any) => d.status === "pending").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">${(totalSales / 1000000).toFixed(1)}M</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-deal">
        <CardHeader><CardTitle className="text-base">Create Deal</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Deal ID" value={newDeal.dealId} onChange={(e) => setNewDeal({ ...newDeal, dealId: e.target.value })} data-testid="input-did" className="text-sm" />
            <Input placeholder="Customer ID" value={newDeal.customerId} onChange={(e) => setNewDeal({ ...newDeal, customerId: e.target.value })} data-testid="input-cid" className="text-sm" />
            <Input placeholder="VIN" value={newDeal.vin} onChange={(e) => setNewDeal({ ...newDeal, vin: e.target.value })} data-testid="input-vin" className="text-sm" />
            <Input placeholder="Sale Price" type="number" value={newDeal.salePrice} onChange={(e) => setNewDeal({ ...newDeal, salePrice: e.target.value })} data-testid="input-price" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newDeal)} disabled={createMutation.isPending || !newDeal.dealId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Deals</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : deals.length === 0 ? <p className="text-muted-foreground text-center py-4">No deals</p> : deals.map((d: any) => (
            <div key={d.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`deal-${d.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{d.dealId}</p>
                <p className="text-xs text-muted-foreground">{d.vin} • ${d.salePrice}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={d.status === "completed" ? "default" : "secondary"} className="text-xs">{d.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(d.id)} data-testid={`button-delete-${d.id}`} className="h-7 w-7">
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
