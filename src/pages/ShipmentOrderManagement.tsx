import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Trash2, Navigation, CheckCircle2, Clock, Truck, Save, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ShipmentOrderManagement() {
  const { toast } = useToast();
  const [localShipments, setLocalShipments] = useState<any[]>([]);

  const { data: shipments = [], isLoading } = useQuery<any>({
    queryKey: ["/api/tl-shipments"],
    queryFn: () => fetch("/api/tl-shipments").then(r => r.json()).catch(() => []),
  });

  useEffect(() => {
    if (shipments) {
      setLocalShipments(shipments);
    }
  }, [shipments]);

  const saveMutation = useMutation({
    mutationFn: async (updatedShipments: any[]) => {
      for (const shipment of updatedShipments) {
        if (!shipment.id || String(shipment.id).startsWith('temp-')) {
          await fetch("/api/tl-shipments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...shipment, id: undefined }) });
        } else {
          await apiRequest("PATCH", `/api/tl-shipments/${shipment.id}`, shipment).catch(() => { });
        }
      }

      const deletedIds = shipments.filter((c: any) => !updatedShipments.find((uc) => uc.id === c.id)).map((c: any) => c.id);
      for (const id of deletedIds) {
        await fetch(`/api/tl-shipments/${id}`, { method: "DELETE" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tl-shipments"] });
      toast({ title: "Shipment orders saved successfully" });
    },
  });

  const active = shipments.filter((s: any) => s.status === "in-transit").length;
  const delivered = shipments.filter((s: any) => s.status === "delivered").length;
  const pending = shipments.filter((s: any) => s.status === "pending").length;

  return (
    <StandardPage
      title="Shipment Order Management"
      description="Global logistics execution, order consolidation, and multi-modal shipment orchestration"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-blue-100/50">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight">{shipments.length}</div>
                  <p className="text-xs text-muted-foreground">Master manifests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-indigo-100/50">
                  <Navigation className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-indigo-600">{active}</div>
                  <p className="text-xs text-muted-foreground">Live tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-emerald-100/50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-emerald-600">{delivered}</div>
                  <p className="text-xs text-muted-foreground">Completed routes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-amber-100/50">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-amber-600">{pending}</div>
                  <p className="text-xs text-muted-foreground">Awaiting dispatch</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-none shadow-lg">
          <CardHeader className="bg-muted/30 pb-4 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Global Logistics Registry</CardTitle>
              <CardDescription>Inline editable shipment order tracking sheet</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocalShipments([...localShipments, { id: `temp-${Date.now()}`, shipmentId: '', origin: '', destination: '', weight: '0', service: 'standard', status: 'pending' }])}>
                <Plus className="w-4 h-4 mr-2" />
                New Shipment
              </Button>
              <Button onClick={() => saveMutation.mutate(localShipments)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading registry...</div>
            ) : (
              <InteractiveSpreadsheet
                data={localShipments}
                columns={[
                  {
                    id: "shipmentId",
                    header: "Shipment Reference",
                    width: "200px",
                    cell: (row, index, updateRow) => (
                      <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-medium" placeholder="REF-000" value={row.shipmentId || ''} onChange={(e) => updateRow("shipmentId", e.target.value)} />
                    )
                  },
                  {
                    id: "origin",
                    header: "Origin Node",
                    width: "200px",
                    cell: (row, index, updateRow) => (
                      <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="City / Port" value={row.origin || ''} onChange={(e) => updateRow("origin", e.target.value)} />
                    )
                  },
                  {
                    id: "destination",
                    header: "Destination Node",
                    width: "200px",
                    cell: (row, index, updateRow) => (
                      <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="City / Port" value={row.destination || ''} onChange={(e) => updateRow("destination", e.target.value)} />
                    )
                  },
                  {
                    id: "weight",
                    header: "Gross Weight (kg)",
                    width: "150px",
                    cell: (row, index, updateRow) => (
                      <Input type="number" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right" placeholder="0" value={row.weight || ''} onChange={(e) => updateRow("weight", e.target.value)} />
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
                          <SelectItem value="in-transit">In Transit</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    )
                  }
                ]}
                onChange={setLocalShipments}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </StandardPage>
  );
}
