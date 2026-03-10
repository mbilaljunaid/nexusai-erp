import { useQuery } from "@tanstack/react-query";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { useEnterpriseStore } from "@/lib/enterpriseStore";

export default function BillingLogistics() {
  const { businessUnitId } = useEnterpriseStore();
  const { data: billing = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/logistics-billing", businessUnitId],
    queryFn: () => fetch("/api/logistics-billing", {
      headers: businessUnitId ? { "x-business-unit-id": businessUnitId } : undefined
    }).then(r => r.json()),
  });

  const paid = billing.filter((b: any) => b.status === "paid").length;
  const totalRev = billing.reduce((sum: number, b: any) => sum + (parseFloat(b.amount) || 0), 0);

  return (
    <StandardPage
      title="Billing & Finance"
      description="Invoices, payments, collections, costing, revenue analysis"
    >
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Invoices</p>
            <p className="text-2xl font-bold">{billing.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold text-green-600">{paid}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-600">${(totalRev / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Collection %</p>
            <p className="text-2xl font-bold">{billing.length > 0 ? ((paid / billing.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : billing.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No invoices</p>
          ) : (
            billing.slice(0, 10).map((b: any) => (
              <div key={b.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`inv-${b.id}`}>
                <div className="flex-1">
                  <p className="font-semibold">{b.invoiceId}</p>
                  <p className="text-xs text-muted-foreground">${b.amount}</p>
                </div>
                <Badge variant={b.status === "paid" ? "default" : "secondary"} className="text-xs">{b.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </StandardPage>
  );
}
