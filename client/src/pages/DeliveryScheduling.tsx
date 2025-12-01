import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DeliveryScheduling() {
  const { toast } = useToast();
  const [newDelivery, setNewDelivery] = useState({ shipment: "SHP-001", date: "", time: "09:00", customer: "Cust-A", status: "scheduled" });

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["/api/delivery-scheduling"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/delivery-scheduling", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-scheduling"] });
      setNewDelivery({ shipment: "SHP-001", date: "", time: "09:00", customer: "Cust-A", status: "scheduled" });
      toast({ title: "Delivery scheduled" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/delivery-scheduling/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-scheduling"] });
      toast({ title: "Delivery deleted" });
    }
  });

  const deliveredCount = deliveries.filter((d: any) => d.status === "delivered").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8" />
          Delivery Scheduling
        </h1>
        <p className="text-muted-foreground mt-2">Schedule delivery dates and times</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Deliveries</p>
            <p className="text-2xl font-bold">{deliveries.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600">{deliveries.length - deliveredCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-delivery">
        <CardHeader><CardTitle className="text-base">Schedule Delivery</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Input placeholder="Shipment" value={newDelivery.shipment} onChange={(e) => setNewDelivery({ ...newDelivery, shipment: e.target.value })} data-testid="input-shipment" />
            <Input placeholder="Date" type="date" value={newDelivery.date} onChange={(e) => setNewDelivery({ ...newDelivery, date: e.target.value })} data-testid="input-date" />
            <Input placeholder="Time" type="time" value={newDelivery.time} onChange={(e) => setNewDelivery({ ...newDelivery, time: e.target.value })} data-testid="input-time" />
            <Input placeholder="Customer" value={newDelivery.customer} onChange={(e) => setNewDelivery({ ...newDelivery, customer: e.target.value })} data-testid="input-customer" />
            <Select value={newDelivery.status} onValueChange={(v) => setNewDelivery({ ...newDelivery, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newDelivery)} disabled={createMutation.isPending || !newDelivery.date} className="w-full" data-testid="button-schedule">
            <Plus className="w-4 h-4 mr-2" /> Schedule
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Deliveries</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : deliveries.length === 0 ? <p className="text-muted-foreground text-center py-4">No deliveries</p> : deliveries.map((d: any) => (
            <div key={d.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`delivery-${d.id}`}>
              <div>
                <p className="font-semibold text-sm">{d.shipment} to {d.customer}</p>
                <p className="text-xs text-muted-foreground">{d.date} at {d.time}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={d.status === "delivered" ? "default" : "secondary"}>{d.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(d.id)} data-testid={`button-delete-${d.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
