import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

export default function TelecomFinanceCompliance() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/telecom-finance"]
    
  });

  const totalRevenue = transactions.reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);
  const posted = transactions.filter((t: any) => t.status === "posted").length;
  const pending = transactions.filter((t: any) => t.status === "pending").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="h-8 w-8" />
          Finance, Tax & Compliance
        </h1>
        <p className="text-muted-foreground mt-2">GL integration, tax reporting, revenue recognition, and audit trails</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Posted</p>
            <p className="text-2xl font-bold text-green-600">{posted}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Transactions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : transactions.length === 0 ? <p className="text-muted-foreground text-center py-4">No transactions</p> : transactions.slice(0, 10).map((t: any) => (
            <div key={t.id} className="p-2 border rounded text-sm hover-elevate flex justify-between items-center" data-testid={`txn-${t.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{t.invoiceId || "Transaction"}</p>
                <p className="text-xs text-muted-foreground">GL: {t.glAccount} • Tax: ${(t.taxAmount || 0).toFixed(2)}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={t.status === "posted" ? "default" : "secondary"} className="text-xs">${t.amount}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
