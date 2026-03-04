import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

export default function SecurityManagement() {
  const { data: policies = [] } = useQuery<any[]>({ queryKey: ["/api/security/policies"] });
  const active = policies.filter((p: any) => p.status === "active").length;

  return (
    <StandardPage
      title="Securitagement"
      description="Manage security policies and access"
    >
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Policies</p><p className="text-2xl font-bold">{policies.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Active</p><p className="text-2xl font-bold text-green-600">{active}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Threats</p><p className="text-2xl font-bold text-red-600">0</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Security Policies</CardTitle></CardHeader><CardContent><div className="space-y-2">{policies.map((p: any) => (<div key={p.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{p.name}</p><p className="text-sm text-muted-foreground">{p.type}</p></div><Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge></div>))}</div></CardContent></Card>
    </StandardPage>
  );
}
