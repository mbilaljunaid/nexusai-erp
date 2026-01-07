import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BoxIcon, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReplenishmentPlanning() {
  const { toast } = useToast();
  const [newReplen, setNewReplen] = useState({ productId: "", supplierId: "", quantity: "100", status: "suggested" });

  const { data: replenishments = [], isLoading } = useQuery({
    queryKey: ["/api/replenishment-plan"],
    queryFn: () => fetch("/api/replenishment-plan").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/replenishment-plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/replenishment-plan"] });
      setNewReplen({ productId: "", supplierId: "", quantity: "100", status: "suggested" });
      toast({ title: "Replenishment planned" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/replenishment-plan/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/replenishment-plan"] });
      toast({ title: "Plan deleted" });
    },
  });

  const ordered = replenishments.filter((r: any) => r.status === "ordered").length;
  const totalQty = replenishments.reduce((sum: number, r: any) => sum + (parseFloat(r.quantity) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BoxIcon className="h-8 w-8" />
          Replenishment Planning
        </h1>
        <p className="text-muted-foreground mt-2">Stock planning, purchase orders, and supplier management</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Plans</p>
            <p className="text-2xl font-bold">{replenishments.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Ordered</p>
            <p className="text-2xl font-bold text-green-600">{ordered}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Qty</p>
            <p className="text-2xl font-bold">{(totalQty / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Suggested</p>
            <p className="text-2xl font-bold text-yellow-600">{replenishments.length - ordered}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-replen">
        <CardHeader><CardTitle className="text-base">Create Replenishment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Product ID" value={newReplen.productId} onChange={(e) => setNewReplen({ ...newReplen, productId: e.target.value })} data-testid="input-prodid" className="text-sm" />
            <Input placeholder="Supplier ID" value={newReplen.supplierId} onChange={(e) => setNewReplen({ ...newReplen, supplierId: e.target.value })} data-testid="input-supid" className="text-sm" />
            <Input placeholder="Quantity" type="number" value={newReplen.quantity} onChange={(e) => setNewReplen({ ...newReplen, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Select value={newReplen.status} onValueChange={(v) => setNewReplen({ ...newReplen, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="suggested">Suggested</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={createMutation.isPending || !newReplen.productId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Plans</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : replenishments.length === 0 ? <p className="text-muted-foreground text-center py-4">No plans</p> : replenishments.map((r: any) => (
            <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`plan-${r.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{r.productId}</p>
                <p className="text-xs text-muted-foreground">Supplier: {r.supplierId} • Qty: {r.quantity}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={r.status === "ordered" ? "default" : "secondary"} className="text-xs">{r.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${r.id}`} className="h-7 w-7">
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
