import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProcurementManagement() {
  const { toast } = useToast();
  const [newPO, setNewPO] = useState({ poNumber: "", supplier: "", amount: "", status: "pending" });

  const { data: pos = [], isLoading } = useQuery({
    queryKey: ["/api/procurement/purchase-orders"],
    queryFn: () => fetch("/api/procurement/purchase-orders").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/procurement/purchase-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] });
      setNewPO({ poNumber: "", supplier: "", amount: "", status: "pending" });
      toast({ title: "PO created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/procurement/purchase-orders/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procurement/purchase-orders"] });
      toast({ title: "PO deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4" data-testid="procurement-management">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><ShoppingCart className="h-8 w-8" />Procurement Management</h1>
        <p className="text-muted-foreground mt-1">Supplier and purchase order management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-active-pos">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active POs</p>
            <p className="text-3xl font-bold mt-1">{pos.filter((p: any) => p.status === "pending").length}</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-pos">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total POs</p>
            <p className="text-3xl font-bold mt-1">{pos.length}</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-spend">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Spend</p>
            <p className="text-3xl font-bold mt-1">${(pos.reduce((sum: number, p: any) => sum + parseFloat(p.amount || "0"), 0) / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-po">
        <CardHeader><CardTitle className="text-base">Create Purchase Order</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="PO Number" value={newPO.poNumber} onChange={(e) => setNewPO({ ...newPO, poNumber: e.target.value })} data-testid="input-po-number" />
            <Input placeholder="Supplier" value={newPO.supplier} onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })} data-testid="input-supplier" />
            <Input placeholder="Amount" type="number" value={newPO.amount} onChange={(e) => setNewPO({ ...newPO, amount: e.target.value })} data-testid="input-amount" />
            <Select value={newPO.status} onValueChange={(v) => setNewPO({ ...newPO, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={createMutation.isPending || !newPO.poNumber} className="w-full" data-testid="button-create-po">
            <Plus className="w-4 h-4 mr-2" /> Create PO
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Purchase Orders</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p>Loading...</p>
          ) : pos.length === 0 ? (
            <p className="text-muted-foreground">No POs created</p>
          ) : (
            pos.map((po: any) => (
              <div key={po.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`po-${po.id}`}>
                <div>
                  <p className="font-semibold">{po.poNumber}</p>
                  <p className="text-sm text-muted-foreground">{po.supplier} • ${po.amount}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge>{po.status}</Badge>
                  <Button size="icon" variant="ghost" data-testid={`button-delete-${po.id}`}>
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
