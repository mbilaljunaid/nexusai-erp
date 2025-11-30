import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

export default function AccountReconciliation() {
  const reconciliations = [
    { id: "r1", account: "Cash", glBalance: "$50,000", subledger: "$50,000", variance: "$0", status: "reconciled" },
    { id: "r2", account: "Accounts Receivable", glBalance: "$125,000", subledger: "$123,500", variance: "$1,500", status: "exception" },
    { id: "r3", account: "Inventory", glBalance: "$275,000", subledger: "$275,000", variance: "$0", status: "reconciled" },
  ];
  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><BarChart3 className="h-8 w-8" />Account Reconciliation</h1><p className="text-muted-foreground mt-2">GL and subledger reconciliation</p></div>
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Accounts</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Reconciled</p><p className="text-2xl font-bold text-green-600">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Exceptions</p><p className="text-2xl font-bold text-red-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Variance</p><p className="text-2xl font-bold">$1.5K</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Account Status</CardTitle></CardHeader><CardContent className="space-y-3">{reconciliations.map((r) => (<div key={r.id} className="p-3 border rounded-lg hover-elevate" data-testid={`recon-${r.id}`}><div className="flex justify-between mb-2"><h3 className="font-semibold">{r.account}</h3><Badge variant={r.status === "reconciled" ? "default" : "destructive"}>{r.status}</Badge></div><p className="text-sm text-muted-foreground">GL: {r.glBalance} • Subledger: {r.subledger} • Variance: {r.variance}</p></div>))}</CardContent></Card>
    </div>
  );
}
