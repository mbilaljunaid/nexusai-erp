import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Landmark, Building2, Send, History, Wallet, Activity } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function BankingPage() {
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/banking-default'],
    queryFn: () => fetch("/api/banking-default").then(r => r.json()).catch(() => []),
  });

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Core Banking & Ledger</h1>
          <p className="text-muted-foreground mt-1">Real-time position monitoring, account orchestration, and transactional integrity management</p>
        </div>
      }
    >
      <DashboardWidget title="Liquidity Position" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <Landmark className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{data.length}</div>
            <p className="text-xs text-muted-foreground">Active Nodes</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Settlement Status" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100/50">
            <Send className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600">99.9%</div>
            <p className="text-xs text-muted-foreground">Success velocity</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Network Integrity" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <History className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">Online</div>
            <p className="text-xs text-muted-foreground">Mainnet Status</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Asset Reserve" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-amber-100/50">
            <Wallet className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">Basel III</div>
            <p className="text-xs text-muted-foreground">Compliance Rating</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget
        colSpan={4}
        title="Institutional Ledger"
        icon={Building2}
        action={<Button size="sm"><Plus className="w-4 h-4 mr-2" />Provision Account</Button>}
      >
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : data.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 font-medium">No ledger entries detected in the primary partition</p>
          ) : (
            data.map((item: any, idx: number) => (
              <div key={item.id || idx} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4" data-testid={`card-item-${item.id || idx}`}>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{item.name || item.accountId || item.id}</p>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-tighter">
                      ID: {item.id}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valuation: ₹{parseFloat(item.amount || item.balance || 0).toLocaleString()} •
                    Auth Date: {item.date || item.createdAt?.split("T")[0] || "Contemporary"}
                  </p>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <Badge variant={item.status === "Active" ? "default" : "secondary"} className="text-[10px] uppercase font-mono">
                    {item.status || "Provisioned"}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                    <Activity className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardWidget>
    </StandardDashboard>
  );
}
