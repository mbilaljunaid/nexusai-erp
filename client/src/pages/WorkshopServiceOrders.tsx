import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wrench, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WorkshopServiceOrders() {
  const { toast } = useToast();
  const [newRO, setNewRO] = useState({ roId: "", vin: "", complaint: "", status: "booked" });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/auto-service-orders"],
    queryFn: () => fetch("/api/auto-service-orders").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/auto-service-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-service-orders"] });
      setNewRO({ roId: "", vin: "", complaint: "", status: "booked" });
      toast({ title: "Service order created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/auto-service-orders/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-service-orders"] });
      toast({ title: "Service order deleted" });
    },
  });

  const inService = orders.filter((o: any) => o.status === "in-service").length;
  const completed = orders.filter((o: any) => o.status === "completed").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wrench className="h-8 w-8" />
          Workshop & Service Order Management
        </h1>
        <p className="text-muted-foreground mt-2">Appointment booking, repair orders, job cards, technician assignment, and QC</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total ROs</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">In Service</p>
            <p className="text-2xl font-bold text-blue-600">{inService}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completion %</p>
            <p className="text-2xl font-bold">{orders.length > 0 ? ((completed / orders.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-ro">
        <CardHeader><CardTitle className="text-base">Create Service Order</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="RO ID" value={newRO.roId} onChange={(e) => setNewRO({ ...newRO, roId: e.target.value })} data-testid="input-roid" className="text-sm" />
            <Input placeholder="VIN" value={newRO.vin} onChange={(e) => setNewRO({ ...newRO, vin: e.target.value })} data-testid="input-vin" className="text-sm" />
            <Input placeholder="Complaint" value={newRO.complaint} onChange={(e) => setNewRO({ ...newRO, complaint: e.target.value })} data-testid="input-complaint" className="text-sm" />
            <Input placeholder="Status" disabled value={newRO.status} data-testid="input-status" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newRO)} disabled={createMutation.isPending || !newRO.roId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Service Orders</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : orders.length === 0 ? <p className="text-muted-foreground text-center py-4">No orders</p> : orders.map((o: any) => (
            <div key={o.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`ro-${o.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{o.roId}</p>
                <p className="text-xs text-muted-foreground">{o.vin} • {o.complaint}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={o.status === "completed" ? "default" : "secondary"} className="text-xs">{o.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(o.id)} data-testid={`button-delete-${o.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
