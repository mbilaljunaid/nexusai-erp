import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AuditTrails() {
  const { data: logs = [] } = useQuery<any[]>({ queryKey: ["/api/audit/logs"] });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Shield className="w-8 h-8" />Audit Trails</h1>
        <p className="text-muted-foreground">Monitor system activity and changes</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Events Logged</p><p className="text-2xl font-bold">{logs.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Last 24h</p><p className="text-2xl font-bold">523</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Recent Audit Logs</CardTitle></CardHeader><CardContent><div className="space-y-2">{logs.map((l: any) => (<div key={l.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{l.action}</p><p className="text-sm text-muted-foreground">{l.user} • {l.timestamp}</p></div></div>))}</div></CardContent></Card>
    </div>
  );
}
