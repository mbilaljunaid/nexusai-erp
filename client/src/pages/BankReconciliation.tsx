import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export default function BankReconciliation() {
  const { data: bankAccounts = [] } = useQuery<any[]>({ queryKey: ["/api/finance/bank-accounts"] });
  const { data: reconciliations = [] } = useQuery<any[]>({ queryKey: ["/api/finance/bank-reconciliations"] });

  const totalBalance = bankAccounts.reduce((sum, b: any) => sum + parseFloat(b.accountBalance || 0), 0);
  const reconciledCount = reconciliations.filter((r: any) => r.status === "reconciled").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="w-8 h-8" />
          Bank Reconciliation
        </h1>
        <p className="text-muted-foreground">Reconcile bank statements with your records</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Bank Accounts</p>
            <p className="text-2xl font-bold">{bankAccounts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Balance</p>
            <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Reconciled</p>
            <p className="text-2xl font-bold text-green-600">{reconciledCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bank Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bankAccounts.map((bank: any) => (
              <div key={bank.id} className="flex items-center justify-between p-3 border rounded hover-elevate">
                <div>
                  <p className="font-semibold">{bank.bankName}</p>
                  <p className="text-sm text-muted-foreground">{bank.accountNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${bank.accountBalance}</p>
                  <Badge variant={bank.isActive ? "default" : "secondary"}>
                    {bank.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reconciliations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reconciliations.map((rec: any) => (
              <div key={rec.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-semibold">Statement Balance: ${rec.statementBalance}</p>
                  <p className="text-sm text-muted-foreground">Book Balance: ${rec.bookBalance}</p>
                </div>
                <Badge variant={rec.status === "reconciled" ? "default" : rec.status === "error" ? "destructive" : "secondary"}>
                  {rec.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
