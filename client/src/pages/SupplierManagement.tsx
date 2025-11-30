import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function SupplierManagement() {
  const { data: suppliers = [] } = useQuery<any[]>({ queryKey: ["/api/procurement/suppliers"] });
  const active = suppliers.filter((s: any) => s.status === "active").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Users className="w-8 h-8" />Supplier Management</h1>
        <p className="text-muted-foreground">Manage vendor relationships</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Suppliers</p><p className="text-2xl font-bold">{suppliers.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Active</p><p className="text-2xl font-bold text-green-600">{active}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Spend YTD</p><p className="text-2xl font-bold">$4.5M</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Suppliers</CardTitle></CardHeader><CardContent><div className="space-y-2">{suppliers.map((s: any) => (<div key={s.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{s.name}</p><p className="text-sm text-muted-foreground">{s.category}</p></div><Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge></div>))}</div></CardContent></Card>
    </div>
  );
}
