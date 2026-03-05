import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus, Trash2, TrendingUp, Navigation, Boxes, CheckCircle2, Save, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { EnterpriseContextSwitcher } from "@/components/enterprise/EnterpriseContextSwitcher";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function TransportationManagementSystem() {
  const { toast } = useToast();
  const [activeBuId, setActiveBuId] = useState<string | undefined>();
  const [activeInvOrgId, setActiveInvOrgId] = useState<string | undefined>();
  const [localShipments, setLocalShipments] = useState<any[]>([]);

  const buildHeaders = () => {
    const h: Record<string, string> = {};
    if (activeBuId) h["x-business-unit-id"] = activeBuId;
    if (activeInvOrgId) h["x-inventory-org-id"] = activeInvOrgId;
    return h;
  };

  const { data: shipments = [], isLoading } = useQuery<any>({
    queryKey: ["/api/transportation/shipments", activeBuId, activeInvOrgId],
    queryFn: () => fetch("/api/transportation/shipments", { headers: buildHeaders() }).then(r => r.json()).catch(() => []),
  });

  useEffect(() => {
    if (shipments) {
      setLocalShipments(shipments);
    }
  }, [shipments, activeBuId, activeInvOrgId]);

  const saveMutation = useMutation({
    mutationFn: async (updatedShipments: any[]) => {
      for (const shipment of updatedShipments) {
        if (!shipment.id || String(shipment.id).startsWith('temp-')) {
          await fetch("/api/transportation/shipments/plan", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...buildHeaders() },
            body: JSON.stringify({
              ...shipment,
              id: undefined,
              entBusinessUnitId: activeBuId || null,
              entInventoryOrgId: activeInvOrgId || null,
            })
          });
        } else {
          // The API may not have a PATCH/PUT endpoint for shipments explicitly named,
          // but standard patterns apply; we'll attempt a PATCH if needed, or rely on create/delete.
          await fetch(`/api/transportation/shipments/${shipment.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...buildHeaders() },
            body: JSON.stringify(shipment)
          }).catch(() => { });
        }
      }

      const deletedIds = shipments.filter((c: any) => !updatedShipments.find((uc) => uc.id === c.id)).map((c: any) => c.id);
      for (const id of deletedIds) {
        await fetch(`/api/transportation/shipments/${id}`, { method: "DELETE", headers: buildHeaders() });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transportation/shipments"] });
      toast({ title: "Shipments saved successfully" });
    },
  });

  const delivered = shipments.filter((s: any) => s.status === "delivered").length;
  const totalDistance = shipments.reduce((sum: number, s: any) => sum + (parseFloat(s.distance) || 0), 0);

  const columns: SpreadsheetColumn<any>[] = [
    {
      id: "shipmentId",
      header: "Shipment ID",
      width: "200px",
      cell: (row, index, updateRow) => (
        <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-medium" placeholder="ID" value={row.shipmentId || ''} onChange={(e) => updateRow("shipmentId", e.target.value)} />
      )
    },
    {
      id: "carrier",
      header: "Carrier",
      width: "150px",
      cell: (row, index, updateRow) => (
        <Select value={row.carrier || 'FedEx'} onValueChange={(val) => updateRow("carrier", val)}>
          <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="FedEx">FedEx</SelectItem>
            <SelectItem value="UPS">UPS</SelectItem>
            <SelectItem value="DHL">DHL</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      id: "loadType",
      header: "Load Type",
      width: "120px",
      cell: (row, index, updateRow) => (
        <Select value={row.loadType || 'FTL'} onValueChange={(val) => updateRow("loadType", val)}>
          <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="FTL">FTL</SelectItem>
            <SelectItem value="LTL">LTL</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      id: "distance",
      header: "Distance (km)",
      width: "150px",
      cell: (row, index, updateRow) => (
        <Input type="number" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right" placeholder="km" value={row.distance || ''} onChange={(e) => updateRow("distance", e.target.value)} />
      )
    },
    {
      id: "status",
      header: "Status",
      width: "150px",
      cell: (row, index, updateRow) => (
        <Select value={row.status || 'planned'} onValueChange={(val) => updateRow("status", val)}>
          <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in-transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      )
    }
  ];

  return (
    <StandardDashboard
      header={
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading">Transportation Management (TMS)</h1>
            <p className="text-muted-foreground mt-1">Global logistics orchestration, freight booking, and route optimization</p>
          </div>
          <div className="flex items-center gap-2">
            <EnterpriseContextSwitcher type="business-unit" value={activeBuId} onChange={setActiveBuId} />
            <EnterpriseContextSwitcher type="inventory-org" value={activeInvOrgId} onChange={setActiveInvOrgId} />
          </div>
        </div>
      }
    >
      <DashboardWidget title="Total Shipments" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <Boxes className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{shipments.length}</div>
            <p className="text-xs text-muted-foreground">Active manifests</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Delivered" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">{delivered}</div>
            <p className="text-xs text-muted-foreground">Proof of delivery</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Total Miles" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-indigo-100/50">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-indigo-600">{(totalDistance / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Cumulative distance</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="In Transit" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-amber-100/50">
            <Navigation className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">{shipments.filter((s: any) => s.status === "in-transit").length}</div>
            <p className="text-xs text-muted-foreground">Live tracking</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget colSpan={4} title="Master Shipment Directory" icon={Truck}>
        <div className="flex gap-2 mb-4 justify-end">
          <Button variant="outline" size="sm" onClick={() => setLocalShipments([...localShipments, { id: `temp-${Date.now()}`, shipmentId: '', carrier: 'FedEx', loadType: 'FTL', distance: '', status: 'planned' }])}>
            <Plus className="w-4 h-4 mr-2" /> Add Shipment
          </Button>
          <Button size="sm" onClick={() => saveMutation.mutate(localShipments)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Schedule
          </Button>
        </div>
        <div className="flex-1 overflow-hidden -mx-4 -mb-4 border-t">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading schedule...</div>
          ) : (
            <InteractiveSpreadsheet
              data={localShipments}
              columns={columns}
              onChange={setLocalShipments}
            />
          )}
        </div>
      </DashboardWidget>
    </StandardDashboard>
  );
}
