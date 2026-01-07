import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingDown, TrendingUp, Clock } from "lucide-react";

export default function MRPDashboardFull() {
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ["/api/mrp"],
    queryFn: () => fetch("/api/mrp").then(r => r.json()).catch(() => []),
  });

  const buyRecs = recommendations.filter((r: any) => r.type === "buy").length;
  const makeRecs = recommendations.filter((r: any) => r.type === "make").length;
  const exceptionCount = recommendations.filter((r: any) => r.exception).length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingDown className="h-8 w-8" />
          MRP Planning Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Material Requirements Planning analysis and recommendations</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Recommendations</p>
            <p className="text-2xl font-bold">{recommendations.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Buy Orders</p>
                <p className="text-2xl font-bold">{buyRecs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Make Orders</p>
                <p className="text-2xl font-bold">{makeRecs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Exceptions</p>
                <p className="text-2xl font-bold">{exceptionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">MRP Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : recommendations.length === 0 ? <p className="text-muted-foreground text-center py-4">No recommendations</p> : recommendations.map((r: any) => (
            <div key={r.id} className="p-3 border rounded-lg hover-elevate" data-testid={`rec-${r.id}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{r.item || "Item"}</p>
                  <p className="text-xs text-muted-foreground">Qty: {r.quantity}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={r.type === "buy" ? "secondary" : "default"}>{r.type}</Badge>
                  {r.exception && <Badge variant="destructive">Exception</Badge>}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
