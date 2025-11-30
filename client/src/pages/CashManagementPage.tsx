import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";

export default function CashManagementPage() {
  const transactions = [
    { id: "ct1", date: "Nov 30, 2025", type: "Receipt", amount: "$50,000", account: "1010", status: "reconciled" },
    { id: "ct2", date: "Nov 29, 2025", type: "Payment", amount: "$25,000", account: "2050", status: "pending" },
    { id: "ct3", date: "Nov 28, 2025", type: "Transfer", amount: "$15,000", account: "1020", status: "reconciled" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Cash Management
        </h1>
        <p className="text-muted-foreground mt-2">Monitor cash position and reconciliation</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Cash Balance</p>
            <p className="text-2xl font-bold">$1.5M</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Today Receipts</p>
            <p className="text-2xl font-bold text-green-600">$50,000</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Today Payments</p>
            <p className="text-2xl font-bold text-red-600">$25,000</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">$15,000</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {transactions.map((trans) => (
            <div key={trans.id} className="flex items-center justify-between p-3 border rounded-lg hover-elevate" data-testid={`transaction-${trans.id}`}>
              <div className="flex-1">
                <p className="font-medium text-sm">{trans.type}</p>
                <p className="text-xs text-muted-foreground">Account: {trans.account} • {trans.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{trans.amount}</p>
                <Badge variant={trans.status === "reconciled" ? "default" : "secondary"}>{trans.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
