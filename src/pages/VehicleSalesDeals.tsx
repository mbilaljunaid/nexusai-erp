import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Handshake, Plus, Trash2, BadgeDollarSign, Clock, CheckCircle2, FileText, Save, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function VehicleSalesDeals() {
  const { toast } = useToast();
  const [localDeals, setLocalDeals] = useState<any[]>([]);

  const { data: deals = [], isLoading } = useQuery<any>({
    queryKey: ["/api/auto-deals"],
    queryFn: () => fetch("/api/auto-deals").then(r => r.json()).catch(() => []),
  });

  useEffect(() => {
    if (deals) {
      setLocalDeals(deals);
    }
  }, [deals]);

  const saveMutation = useMutation({
    mutationFn: async (updatedDeals: any[]) => {
      for (const deal of updatedDeals) {
        if (!deal.id || String(deal.id).startsWith('temp-')) {
          await fetch("/api/auto-deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...deal, id: undefined }) });
        } else {
          await apiRequest("PATCH", `/api/auto-deals/${deal.id}`, deal).catch(() => { });
        }
      }

      const deletedIds = deals.filter((c: any) => !updatedDeals.find((uc) => uc.id === c.id)).map((c: any) => c.id);
      for (const id of deletedIds) {
        await fetch(`/api/auto-deals/${id}`, { method: "DELETE" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-deals"] });
      toast({ title: "Auto deals saved successfully" });
    },
  });

  const completed = deals.filter((d: any) => d.status === "completed").length;
  const totalSales = deals.reduce((sum: number, d: any) => sum + (parseFloat(d.salePrice) || 0), 0);
  const pendingCount = deals.filter((d: any) => d.status === "pending").length;

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Vehicle Sales & Deal Closing</h1>
          <p className="text-muted-foreground mt-1">DMS orchestration, multi-party deal structuring, F&I integration, and contract management</p>
        </div>
      }
    >
      <DashboardWidget title="Active Pipeline" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-/15">
            <Handshake className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{deals.length}</div>
            <p className="text-xs text-muted-foreground">Total deal flow</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Pending Approvals" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-/15">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting F&I</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Closed Deals" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-/15">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">{completed}</div>
            <p className="text-xs text-muted-foreground">Finalized contracts</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Gross Proceeds" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-/15">
            <BadgeDollarSign className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600">${(totalSales / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Cumulative value</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget colSpan={4} title="Dealership Ledger" icon={FileText}>
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => setLocalDeals([...localDeals, { id: `temp-${Date.now()}`, dealId: '', customerId: '', vin: '', salePrice: '0', status: 'pending' }])}>
            <Plus className="w-4 h-4 mr-2" /> New Deal
          </Button>
          <Button size="sm" onClick={() => saveMutation.mutate(localDeals)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Ledger
          </Button>
        </div>
        <div className="flex-1 overflow-hidden -mx-4 -mb-4 mt-2 border-t">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading ledger...</div>
          ) : (
            <InteractiveSpreadsheet
              data={localDeals}
              columns={[
                {
                  id: "dealId",
                  header: "Deal Number",
                  width: "150px",
                  cell: (row, index, updateRow) => (
                    <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-medium" placeholder="DEAL-000" value={row.dealId || ''} onChange={(e) => updateRow("dealId", e.target.value)} />
                  )
                },
                {
                  id: "customerId",
                  header: "Customer Ref",
                  width: "200px",
                  cell: (row, index, updateRow) => (
                    <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="CUST-ID" value={row.customerId || ''} onChange={(e) => updateRow("customerId", e.target.value)} />
                  )
                },
                {
                  id: "vin",
                  header: "Stock VIN",
                  width: "250px",
                  cell: (row, index, updateRow) => (
                    <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="17-Digit VIN" value={row.vin || ''} onChange={(e) => updateRow("vin", e.target.value)} />
                  )
                },
                {
                  id: "salePrice",
                  header: "Sale Price",
                  width: "150px",
                  cell: (row, index, updateRow) => (
                    <Input type="number" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right" placeholder="0.00" value={row.salePrice || ''} onChange={(e) => updateRow("salePrice", e.target.value)} />
                  )
                },
                {
                  id: "status",
                  header: "Status",
                  width: "150px",
                  cell: (row, index, updateRow) => (
                    <Select value={row.status || 'pending'} onValueChange={(val) => updateRow("status", val)}>
                      <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )
                }
              ]}
              onChange={setLocalDeals}
            />
          )}
        </div>
      </DashboardWidget>
    </StandardDashboard>
  );
}
