import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Car, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VehicleInventoryManagement() {
  const { toast } = useToast();
  const [newVehicle, setNewVehicle] = useState({ vin: "", model: "", year: "2024", status: "available", price: "0" });

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["/api/auto-inventory"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/auto-inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-inventory"] });
      setNewVehicle({ vin: "", model: "", year: "2024", status: "available", price: "0" });
      toast({ title: "Vehicle added to inventory" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/auto-inventory/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auto-inventory"] });
      toast({ title: "Vehicle removed" });
    }
  });

  const available = vehicles.filter((v: any) => v.status === "available").length;
  const sold = vehicles.filter((v: any) => v.status === "sold").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Car className="h-8 w-8" />
          Vehicle Inventory Management
        </h1>
        <p className="text-muted-foreground mt-2">New & used vehicle inventory, allocation, pricing, and stock tracking</p>
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
            <p className="text-xs text-muted-foreground">Sold</p>
            <p className="text-2xl font-bold text-blue-600">{sold}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Inventory $</p>
            <p className="text-2xl font-bold">${(vehicles.reduce((sum: number, v: any) => sum + (parseFloat(v.price) || 0), 0) / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-vehicle">
        <CardHeader><CardTitle className="text-base">Add Vehicle</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="VIN" value={newVehicle.vin} onChange={(e) => setNewVehicle({ ...newVehicle, vin: e.target.value })} data-testid="input-vin" className="text-sm" />
            <Input placeholder="Model" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} data-testid="input-model" className="text-sm" />
            <Input placeholder="Year" type="number" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} data-testid="input-year" className="text-sm" />
            <Input placeholder="Price" type="number" value={newVehicle.price} onChange={(e) => setNewVehicle({ ...newVehicle, price: e.target.value })} data-testid="input-price" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newVehicle)} disabled={createMutation.isPending || !newVehicle.vin} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Vehicles</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : vehicles.length === 0 ? <p className="text-muted-foreground text-center py-4">No vehicles</p> : vehicles.map((v: any) => (
            <div key={v.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`vehicle-${v.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{v.vin}</p>
                <p className="text-xs text-muted-foreground">{v.model} {v.year} • ${v.price}</p>
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
