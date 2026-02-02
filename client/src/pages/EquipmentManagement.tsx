import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wrench, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EquipmentManagement() {
  const { toast } = useToast();
  const [newEq, setNewEq] = useState({ equipmentId: "", type: "Excavator", location: "Site-A", hourMeter: "0", status: "operational", fuelCost: "50" });

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ["/api/equipment"],
    queryFn: () => fetch("/api/equipment").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/equipment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      setNewEq({ equipmentId: "", type: "Excavator", location: "Site-A", hourMeter: "0", status: "operational", fuelCost: "50" });
      toast({ title: "Equipment added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/equipment/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({ title: "Equipment deleted" });
    },
  });

  const operational = equipment.filter((e: any) => e.status === "operational").length;
  const totalHours = equipment.reduce((sum: number, e: any) => sum + (parseFloat(e.hourMeter) || 0), 0);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wrench className="h-8 w-8" />
          Equipment & Plant Management
        </h1>
        <p className="text-muted-foreground mt-2">Equipment allocation, maintenance, fuel logs, and utilization</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Equipment</p>
            <p className="text-2xl font-bold">{equipment.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Operational</p>
            <p className="text-2xl font-bold text-green-600">{operational}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold">{(totalHours / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Hours/Unit</p>
            <p className="text-2xl font-bold">{equipment.length > 0 ? (totalHours / equipment.length).toFixed(0) : 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-eq">
        <CardHeader><CardTitle className="text-base">Add Equipment</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Equipment ID" value={newEq.equipmentId} onChange={(e) => setNewEq({ ...newEq, equipmentId: e.target.value })} data-testid="input-id" className="text-sm" />
            <Input placeholder="Type" value={newEq.type} onChange={(e) => setNewEq({ ...newEq, type: e.target.value })} data-testid="input-type" className="text-sm" />
            <Input placeholder="Location" value={newEq.location} onChange={(e) => setNewEq({ ...newEq, location: e.target.value })} data-testid="input-loc" className="text-sm" />
            <Input placeholder="Hour Meter" type="number" value={newEq.hourMeter} onChange={(e) => setNewEq({ ...newEq, hourMeter: e.target.value })} data-testid="input-hours" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newEq)} disabled={createMutation.isPending || !newEq.equipmentId} size="sm" data-testid="button-add-eq">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Equipment</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : equipment.length === 0 ? <p className="text-muted-foreground text-center py-4">No equipment</p> : equipment.map((e: any) => (
            <div key={e.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`eq-${e.id}`}>
              <div>
                <p className="font-semibold">{e.equipmentId} - {e.type}</p>
                <p className="text-xs text-muted-foreground">{e.location} • {e.hourMeter}h • ${e.fuelCost}/shift</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={e.status === "operational" ? "default" : "secondary"} className="text-xs">{e.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(e.id)} data-testid={`button-delete-${e.id}`} className="h-7 w-7">
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
