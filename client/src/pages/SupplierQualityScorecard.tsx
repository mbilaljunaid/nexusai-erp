import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

export default function SupplierQualityScorecard() {
  const { data: scorecards = [], isLoading } = useQuery({
    queryKey: ["/api/supplier-scorecards"],
    queryFn: () => fetch("/api/supplier-scorecards").then(r => r.json()).catch(() => []),
  });

  const excellent = scorecards.filter((s: any) => (parseFloat(s.score) || 0) >= 90).length;
  const avgScore = scorecards.length > 0 ? (scorecards.reduce((sum: number, s: any) => sum + (parseFloat(s.score) || 0), 0) / scorecards.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="h-8 w-8" />
          Supplier Quality & Performance Scorecard
        </h1>
        <p className="text-muted-foreground mt-2">On-time delivery, defect rates, responsiveness, and vendor ratings</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Suppliers</p>
            <p className="text-2xl font-bold">{scorecards.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Excellent (≥90%)</p>
            <p className="text-2xl font-bold text-green-600">{excellent}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Score</p>
            <p className="text-2xl font-bold">{avgScore}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Needs Attention</p>
            <p className="text-2xl font-bold text-yellow-600">{scorecards.length - excellent}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Supplier Performance</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : scorecards.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : scorecards.map((s: any) => {
            const score = parseFloat(s.score) || 0;
            return (
              <div key={s.id} className="p-3 border rounded hover-elevate" data-testid={`scorecard-${s.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-sm">{s.supplierName || "Supplier"}</p>
                  <Badge variant={score >= 90 ? "default" : score >= 75 ? "secondary" : "destructive"} className="text-xs">{score}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">OTD: {s.onTimeDelivery || 0}% • Defect: {s.defectRate || 0}% • Lead Time: {s.leadTime || 0}d</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
