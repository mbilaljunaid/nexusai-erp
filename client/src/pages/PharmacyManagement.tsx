import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PharmacyManagement() {
  const { toast } = useToast();
  const [newOrder, setNewOrder] = useState({ orderId: "", patientId: "", medicationId: "", dose: "", status: "pending" });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/healthcare-pharmacy"],
    queryFn: () => fetch("/api/healthcare-pharmacy").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/healthcare-pharmacy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-pharmacy"] });
      setNewOrder({ orderId: "", patientId: "", medicationId: "", dose: "", status: "pending" });
      toast({ title: "Medication order created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/healthcare-pharmacy/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/healthcare-pharmacy"] });
      toast({ title: "Order deleted" });
    },
  });

  const dispensed = orders.filter((o: any) => o.status === "dispensed").length;
  const administered = orders.filter((o: any) => o.status === "administered").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Pill className="h-8 w-8" />
          Pharmacy & Medication Management
        </h1>
        <p className="text-muted-foreground mt-2">Medication orders, eMAR, dispensing, administration, and interaction checks</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{orders.filter((o: any) => o.status === "pending").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Dispensed</p>
            <p className="text-2xl font-bold text-blue-600">{dispensed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Administered</p>
            <p className="text-2xl font-bold text-green-600">{administered}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-order">
        <CardHeader><CardTitle className="text-base">Order Medication</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Order ID" value={newOrder.orderId} onChange={(e) => setNewOrder({ ...newOrder, orderId: e.target.value })} data-testid="input-oid" className="text-sm" />
            <Input placeholder="Patient ID" value={newOrder.patientId} onChange={(e) => setNewOrder({ ...newOrder, patientId: e.target.value })} data-testid="input-pid" className="text-sm" />
            <Input placeholder="Medication ID" value={newOrder.medicationId} onChange={(e) => setNewOrder({ ...newOrder, medicationId: e.target.value })} data-testid="input-medid" className="text-sm" />
            <Input placeholder="Dose" value={newOrder.dose} onChange={(e) => setNewOrder({ ...newOrder, dose: e.target.value })} data-testid="input-dose" className="text-sm" />
            <Button disabled={createMutation.isPending || !newOrder.orderId} size="sm" data-testid="button-order">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Orders</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : orders.length === 0 ? <p className="text-muted-foreground text-center py-4">No orders</p> : orders.map((o: any) => (
            <div key={o.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`order-${o.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{o.orderId}</p>
                <p className="text-xs text-muted-foreground">{o.medicationId} • Dose: {o.dose}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={o.status === "administered" ? "default" : "secondary"} className="text-xs">{o.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${o.id}`} className="h-7 w-7">
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
