import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package2, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GoodsReceiptPutaway() {
  const { toast } = useToast();
  const [newReceipt, setNewReceipt] = useState({ poId: "", productId: "", quantity: "100", warehouseId: "WH-001", status: "received" });

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ["/api/goods-receipt"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/goods-receipt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goods-receipt"] });
      setNewReceipt({ poId: "", productId: "", quantity: "100", warehouseId: "WH-001", status: "received" });
      toast({ title: "Receipt created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/goods-receipt/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goods-receipt"] });
      toast({ title: "Receipt deleted" });
    }
  });

  const putaway = receipts.filter((r: any) => r.status === "putaway").length;
  const pending = receipts.filter((r: any) => r.status === "received").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package2 className="h-8 w-8" />
          Goods Receipt & Putaway
        </h1>
        <p className="text-muted-foreground mt-2">Inbound receiving, quality check, and warehouse putaway operations</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Receipts</p>
            <p className="text-2xl font-bold">{receipts.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending QC</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Putaway</p>
            <p className="text-2xl font-bold text-green-600">{putaway}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Units</p>
            <p className="text-2xl font-bold">{(receipts.reduce((sum: number, r: any) => sum + (parseFloat(r.quantity) || 0), 0) / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-receipt">
        <CardHeader><CardTitle className="text-base">Record Goods Receipt</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="PO ID" value={newReceipt.poId} onChange={(e) => setNewReceipt({ ...newReceipt, poId: e.target.value })} data-testid="input-poid" className="text-sm" />
            <Input placeholder="Product ID" value={newReceipt.productId} onChange={(e) => setNewReceipt({ ...newReceipt, productId: e.target.value })} data-testid="input-prodid" className="text-sm" />
            <Input placeholder="Quantity" type="number" value={newReceipt.quantity} onChange={(e) => setNewReceipt({ ...newReceipt, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Select value={newReceipt.status} onValueChange={(v) => setNewReceipt({ ...newReceipt, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="qc-pending">QC Pending</SelectItem>
                <SelectItem value="putaway">Putaway</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newReceipt)} disabled={createMutation.isPending || !newReceipt.poId} size="sm" data-testid="button-record">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Receipts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : receipts.length === 0 ? <p className="text-muted-foreground text-center py-4">No receipts</p> : receipts.map((r: any) => (
            <div key={r.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`receipt-${r.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{r.poId}</p>
                <p className="text-xs text-muted-foreground">{r.productId} • {r.quantity} units • {r.warehouseId}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={r.status === "putaway" ? "default" : "secondary"} className="text-xs">{r.status}</Badge>
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
