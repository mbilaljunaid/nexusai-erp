import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export default function ComplianceDashboardNew() {
  const { data: controls = [] } = useQuery<any[]>({ queryKey: ["/api/compliance/controls"] });
  const effective = controls.filter((c: any) => c.status === "effective").length;
  const atRisk = controls.filter((c: any) => c.status === "at_risk").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Shield className="w-8 h-8" />Compliance & Risk</h1>
        <p className="text-muted-foreground">Monitor compliance controls</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Controls</p><p className="text-2xl font-bold">{controls.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Effective</p><p className="text-2xl font-bold text-green-600">{effective}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">At Risk</p><p className="text-2xl font-bold text-red-600">{atRisk}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Controls</CardTitle></CardHeader><CardContent><div className="space-y-2">{controls.map((c: any) => (<div key={c.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{c.name}</p><p className="text-sm text-muted-foreground">{c.framework}</p></div><Badge variant={c.status === "effective" ? "default" : "destructive"}>{c.status}</Badge></div>))}</div></CardContent></Card>
    </div>
  );
}
