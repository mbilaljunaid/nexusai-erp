import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function MultiTenancyConfig() {
  const { data: tenants = [] } = useQuery<any[]>({ queryKey: ["/api/admin/tenants"] });
  const active = tenants.filter((t: any) => t.status === "active").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Building2 className="w-8 h-8" />Multi-Tenancy</h1>
        <p className="text-muted-foreground">Manage multiple customer instances</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Tenants</p><p className="text-2xl font-bold">{tenants.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Active</p><p className="text-2xl font-bold text-green-600">{active}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Storage Used</p><p className="text-2xl font-bold">2.4TB</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Tenant Instances</CardTitle></CardHeader><CardContent><div className="space-y-2">{tenants.map((t: any) => (<div key={t.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{t.name}</p><p className="text-sm text-muted-foreground">{t.domain}</p></div></div>))}</div></CardContent></Card>
    </div>
  );
}
