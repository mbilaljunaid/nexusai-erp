import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";

export default function CampaignsDashboard() {
  const { data: campaigns = [] } = useQuery<any[]>({ queryKey: ["/api/marketing/campaigns"] });
  const active = campaigns.filter((c: any) => c.status === "active").length;
  const completed = campaigns.filter((c: any) => c.status === "completed").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Megaphone className="w-8 h-8" />Marketing Campaigns</h1>
        <p className="text-muted-foreground">Manage marketing initiatives</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Campaigns</p><p className="text-2xl font-bold">{campaigns.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Active</p><p className="text-2xl font-bold text-blue-600">{active}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Completed</p><p className="text-2xl font-bold text-green-600">{completed}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Campaigns</CardTitle></CardHeader><CardContent><div className="space-y-2">{campaigns.map((c: any) => (<div key={c.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{c.name}</p><p className="text-sm text-muted-foreground">Budget: ${c.budget}</p></div><Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge></div>))}</div></CardContent></Card>
    </div>
  );
}
