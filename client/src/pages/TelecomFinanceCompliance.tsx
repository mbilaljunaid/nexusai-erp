import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Briefcase, CreditCard, CheckCircle2, AlertCircle, List } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function TelecomFinanceCompliance() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/telecom-finance"],
    queryFn: () => fetch("/api/telecom-finance").then(r => r.json()).catch(() => []),
  });

  const totalRevenue = transactions.reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);
  const posted = transactions.filter((t: any) => t.status === "posted").length;
  const pending = transactions.filter((t: any) => t.status === "pending").length;

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Finance, Tax & Compliance</h1>
          <p className="text-muted-foreground mt-1">GL integration, tax reporting, revenue recognition, and audit trails</p>
        </div>
      }
    >
      <DashboardWidget title="Total Revenue" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <CreditCard className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">${(totalRevenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Across all transactions</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Posted" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">{posted}</div>
            <p className="text-xs text-muted-foreground">Completed entries</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Pending" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-amber-100/50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">{pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Transactions" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-slate-100/50">
            <List className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Total count</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget colSpan={4} title="Recent Transactions">
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No transactionsFound</p>
          ) : (
            transactions.slice(0, 10).map((t: any) => (
              <div key={t.id} className="p-3 border rounded-lg text-sm hover:bg-accent/50 transition-colors flex justify-between items-center" data-testid={`txn-${t.id}`}>
                <div className="flex-1">
                  <p className="font-semibold">{t.invoiceId || "Transaction"}</p>
                  <p className="text-xs text-muted-foreground">GL: {t.glAccount} • Tax: ${(t.taxAmount || 0).toFixed(2)}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={t.status === "posted" ? "default" : "secondary"} className="text-xs font-mono">
                    ${t.amount}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardWidget>
    </StandardDashboard>
  );
}
