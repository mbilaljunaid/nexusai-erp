import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react";

export default function AdvancedAnalytics() {
  const { data: metrics = [] } = useQuery<any[]>({ queryKey: ["/api/analytics/advanced"] });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><LineChart className="w-8 h-8" />Advanced Analytics</h1>
        <p className="text-muted-foreground">Business intelligence and insights</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Datasets</p><p className="text-2xl font-bold">128</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Reports</p><p className="text-2xl font-bold">45</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Key Metrics</CardTitle></CardHeader><CardContent><div className="space-y-2">{metrics.map((m: any) => (<div key={m.id} className="flex justify-between items-center p-3 border rounded"><div><p className="font-semibold">{m.name}</p><p className="text-sm text-muted-foreground">{m.value}</p></div></div>))}</div></CardContent></Card>
    </div>
  );
}
