import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, AlertTriangle, DollarSign } from "lucide-react";

export default function CreditManagementCollections() {
  const { data: creditData = [], isLoading } = useQuery({
    queryKey: ["/api/credit-management"]
    
  });

  const overdue = creditData.filter((c: any) => c.overdueDays >= 30).length;
  const totalDSO = creditData.reduce((sum: number, c: any) => sum + (parseFloat(c.dsodays) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Credit Management & Collections
        </h1>
        <p className="text-muted-foreground mt-2">Customer credit limits, holds, aging analysis, and collections</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Customers</p>
            <p className="text-2xl font-bold">{creditData.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Overdue ≥30 days</p>
                <p className="text-2xl font-bold">{overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-xs text-muted-foreground">Avg DSO</p>
                <p className="text-2xl font-bold">{creditData.length > 0 ? (totalDSO / creditData.length).toFixed(0) : 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">On Credit Hold</p>
            <p className="text-2xl font-bold text-red-600">{creditData.filter((c: any) => c.creditHold).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Aging Analysis (Invoices)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : creditData.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : creditData.map((c: any) => (
              <div key={c.id} className="p-2 border rounded text-sm hover-elevate flex justify-between" data-testid={`credit-${c.id}`}>
                <span className="font-semibold">{c.customer || "Customer"}</span>
                <Badge variant={c.overdueDays >= 60 ? "destructive" : c.overdueDays >= 30 ? "destructive" : "secondary"} className="text-xs">{c.overdueDays} days</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Credit Limits</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p>Loading...</p> : creditData.length === 0 ? <p className="text-muted-foreground text-center py-4">No data</p> : creditData.slice(0, 5).map((c: any) => {
              const usage = ((parseFloat(c.currentBalance) || 0) / (parseFloat(c.creditLimit) || 1)) * 100;
              return (
                <div key={c.id} className="p-2 border rounded text-sm hover-elevate" data-testid={`limit-${c.id}`}>
                  <p className="font-semibold text-xs">{c.customer || "Customer"}</p>
                  <p className="text-xs text-muted-foreground">${c.currentBalance || 0} / ${c.creditLimit || 0} ({usage.toFixed(0)}%)</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
