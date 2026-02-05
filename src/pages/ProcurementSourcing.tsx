import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProcurementSourcing() {
  const { toast } = useToast();
  const [newPO, setNewPO] = useState({ poId: "", supplierId: "", itemId: "", quantity: "0", status: "draft" });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/fb-procurement"],
    queryFn: () => fetch("/api/fb-procurement").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/fb-procurement", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-procurement"] });
      setNewPO({ poId: "", supplierId: "", itemId: "", quantity: "0", status: "draft" });
      toast({ title: "PO created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/fb-procurement/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fb-procurement"] });
      toast({ title: "PO deleted" });
    },
  });

  const completed = orders.filter((o: any) => o.status === "completed").length;
  const pending = orders.filter((o: any) => o.status === "draft").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Procurement & Sourcing
        </h1>
        <p className="text-muted-foreground mt-2">Supplier qualification, RFQ, PO management, and sustainability tracking</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total POs</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
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
            <p className="text-xs text-muted-foreground">Completion %</p>
            <p className="text-2xl font-bold">{orders.length > 0 ? ((completed / orders.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-po">
        <CardHeader><CardTitle className="text-base">Create Purchase Order</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="PO ID" value={newPO.poId} onChange={(e) => setNewPO({ ...newPO, poId: e.target.value })} data-testid="input-poid" className="text-sm" />
            <Input placeholder="Supplier ID" value={newPO.supplierId} onChange={(e) => setNewPO({ ...newPO, supplierId: e.target.value })} data-testid="input-sid" className="text-sm" />
            <Input placeholder="Item ID" value={newPO.itemId} onChange={(e) => setNewPO({ ...newPO, itemId: e.target.value })} data-testid="input-iid" className="text-sm" />
            <Input placeholder="Qty" type="number" value={newPO.quantity} onChange={(e) => setNewPO({ ...newPO, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Button disabled={createMutation.isPending || !newPO.poId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Purchase Orders</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : orders.length === 0 ? <p className="text-muted-foreground text-center py-4">No POs</p> : orders.map((o: any) => (
            <div key={o.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`po-${o.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{o.poId}</p>
                <p className="text-xs text-muted-foreground">Supplier: {o.supplierId} • Qty: {o.quantity}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={o.status === "completed" ? "default" : "secondary"} className="text-xs">{o.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${o.id}`} className="h-7 w-7">
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
