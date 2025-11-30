import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";

export default function WarehouseManagement() {
  const { data: warehouses = [] } = useQuery<any[]>({ queryKey: ["/api/warehouse/locations"] });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Building className="w-8 h-8" />Warehouse Management</h1>
        <p className="text-muted-foreground">Manage warehouse locations and inventory</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Warehouses</p><p className="text-2xl font-bold">{warehouses.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Capacity Used</p><p className="text-2xl font-bold">72%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Stock Value</p><p className="text-2xl font-bold">$1.2M</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Warehouse Locations</CardTitle></CardHeader><CardContent><div className="space-y-2">{warehouses.map((w: any) => (<div key={w.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{w.name}</p><p className="text-sm text-muted-foreground">{w.location}</p></div><Badge>{w.status}</Badge></div>))}</div></CardContent></Card>
    </div>
  );
}
