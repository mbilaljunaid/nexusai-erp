import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VehicleFleetManagement() {
  const { toast } = useToast();
  const [newVehicle, setNewVehicle] = useState({ vehicleId: "", type: "box-truck", capacity: "5000", status: "available", mileage: "0" });

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["/api/fleet-vehicles"],
    queryFn: () => fetch("/api/fleet-vehicles").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/fleet-vehicles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet-vehicles"] });
      setNewVehicle({ vehicleId: "", type: "box-truck", capacity: "5000", status: "available", mileage: "0" });
      toast({ title: "Vehicle added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/fleet-vehicles/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fleet-vehicles"] });
      toast({ title: "Vehicle deleted" });
    },
  });

  const available = vehicles.filter((v: any) => v.status === "available").length;
  const inUse = vehicles.filter((v: any) => v.status === "in-use").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Truck className="h-8 w-8" />
          Vehicle Fleet Management
        </h1>
        <p className="text-muted-foreground mt-2">Fleet tracking, maintenance scheduling, fuel management, and driver assignment</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Vehicles</p>
            <p className="text-2xl font-bold">{vehicles.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-green-600">{available}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">In Use</p>
            <p className="text-2xl font-bold text-blue-600">{inUse}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Utilization</p>
            <p className="text-2xl font-bold">{vehicles.length > 0 ? ((inUse / vehicles.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-vehicle">
        <CardHeader><CardTitle className="text-base">Add Vehicle</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Vehicle ID" value={newVehicle.vehicleId} onChange={(e) => setNewVehicle({ ...newVehicle, vehicleId: e.target.value })} data-testid="input-vid" className="text-sm" />
            <Select value={newVehicle.type} onValueChange={(v) => setNewVehicle({ ...newVehicle, type: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="box-truck">Box Truck</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="trailer">Trailer</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Capacity (lbs)" type="number" value={newVehicle.capacity} onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })} data-testid="input-cap" className="text-sm" />
            <Input placeholder="Mileage" type="number" value={newVehicle.mileage} onChange={(e) => setNewVehicle({ ...newVehicle, mileage: e.target.value })} data-testid="input-mileage" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newVehicle)} disabled={createMutation.isPending || !newVehicle.vehicleId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Fleet</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : vehicles.length === 0 ? <p className="text-muted-foreground text-center py-4">No vehicles</p> : vehicles.map((v: any) => (
            <div key={v.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`vehicle-${v.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{v.vehicleId}</p>
                <p className="text-xs text-muted-foreground">{v.type} • Cap: {v.capacity}lbs • Mileage: {v.mileage}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={v.status === "available" ? "default" : "secondary"} className="text-xs">{v.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(v.id)} data-testid={`button-delete-${v.id}`} className="h-7 w-7">
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
