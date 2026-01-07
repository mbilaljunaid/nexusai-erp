import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default function InventoryDashboard() {
  const { data: inventory = [] } = useQuery<any[]>({ queryKey: ["/api/inventory/items"] });
  const lowStock = inventory.filter((i: any) => parseFloat(i.quantity || 0) < parseFloat(i.reorderLevel || 100));
  const totalValue = inventory.reduce((sum, i: any) => sum + (parseFloat(i.quantity || 0) * parseFloat(i.unitPrice || 0)), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Package className="w-8 h-8" />Inventory Management</h1>
        <p className="text-muted-foreground">Track stock levels and movements</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">SKUs</p><p className="text-2xl font-bold">{inventory.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Value</p><p className="text-2xl font-bold">${totalValue.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Low Stock</p><p className="text-2xl font-bold text-orange-600">{lowStock.length}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Inventory Items</CardTitle></CardHeader><CardContent><div className="space-y-2">{inventory.map((item: any) => (<div key={item.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{item.sku}</p><p className="text-sm text-muted-foreground">{item.warehouseId}</p></div><div className="text-right"><p className="font-semibold">{item.quantity} units</p><Badge variant={parseFloat(item.quantity) < parseFloat(item.reorderLevel) ? "destructive" : "default"}>{parseFloat(item.quantity) < parseFloat(item.reorderLevel) ? "Low" : "OK"}</Badge></div></div>))}</div></CardContent></Card>
    </div>
  );
}
