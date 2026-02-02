import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Receipt, TrendingUp } from "lucide-react";

export default function ExpenseManagement() {
  const [viewType, setViewType] = useState("reports");
  const { data: reports = [] } = useQuery<any[]>({ queryKey: ["/api/expenses/reports"] });
  const { data: items = [] } = useQuery<any[]>({ queryKey: ["/api/expenses/items"] });

  const totalExpenses = reports.reduce((sum: number, r: any) => sum + parseFloat(r.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expense Management</h1>
        <p className="text-muted-foreground mt-2">Track and manage employee expenses</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Expenses</p>
              <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant={viewType === "reports" ? "default" : "outline"} data-testid="button-view-reports">
          <Receipt className="h-4 w-4 mr-2" />
          Reports ({reports.length})
        </Button>
        <Button variant={viewType === "items" ? "default" : "outline"} data-testid="button-view-items">
          <TrendingUp className="h-4 w-4 mr-2" />
          Items ({items.length})
        </Button>
      </div>

      {viewType === "reports" && (
        <div className="space-y-3">
          {reports.map((report: any) => (
            <Card key={report.id} data-testid={`card-report-${report.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{report.reportNumber}</h4>
                    <p className="text-sm text-muted-foreground">Employee: {report.employeeId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${report.totalAmount}</p>
                    <Badge variant={report.status === "approved" ? "default" : "outline"}>{report.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewType === "items" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item: any) => (
            <Card key={item.id} data-testid={`card-item-${item.id}`}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="font-semibold">{item.category}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-lg font-bold">${item.amount}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
