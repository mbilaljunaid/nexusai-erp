import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function OpportunitiesNew() {
  const { data: opportunities = [] } = useQuery<any[]>({ queryKey: ["/api/crm/opportunities"] });

  const totalValue = opportunities.reduce((sum, o: any) => sum + parseFloat(o.value || 0), 0);
  const wonCount = opportunities.filter((o: any) => o.status === "won").length;

  const stageColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    qualified: "default",
    proposal: "default",
    negotiation: "secondary",
    won: "outline",
    lost: "destructive",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="w-8 h-8" />
          Sales Opportunities
        </h1>
        <p className="text-muted-foreground">Manage your sales pipeline</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Pipeline Value</p>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Opportunities</p>
            <p className="text-2xl font-bold">{opportunities.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Won</p>
            <p className="text-2xl font-bold text-green-600">{wonCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {opportunities.map((opp: any) => (
              <div key={opp.id} className="flex items-center justify-between p-3 border rounded hover-elevate">
                <div className="flex-1">
                  <p className="font-semibold">{opp.name}</p>
                  <p className="text-sm text-muted-foreground">{opp.account}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${opp.value}</p>
                  <Badge variant={stageColors[opp.status] || "default"}>{opp.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
