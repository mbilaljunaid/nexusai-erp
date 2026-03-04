import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

export default function IntegrationHubNew() {
  const { data: integrations = [] } = useQuery<any[]>({ queryKey: ["/api/integration/connections"] });
  const active = integrations.filter((i: any) => i.status === "active").length;

  return (
    <StandardPage
      title="IntegraHub"
      description="Connect third-party applications"
    >
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Connections</p><p className="text-2xl font-bold">{integrations.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Active</p><p className="text-2xl font-bold text-green-600">{active}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Failed</p><p className="text-2xl font-bold text-red-600">0</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Integrations</CardTitle></CardHeader><CardContent><div className="space-y-2">{integrations.map((i: any) => (<div key={i.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{i.name}</p><p className="text-sm text-muted-foreground">{i.type}</p></div><Badge variant={i.status === "active" ? "default" : "secondary"}>{i.status}</Badge></div>))}</div></CardContent></Card>
    </StandardPage>
  );
}
