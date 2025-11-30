import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function FleetDriverManagement() {
  const { toast } = useToast();
  const [newDriver, setNewDriver] = useState({ driverId: "", name: "", license: "", status: "active" });

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["/api/tl-drivers"],
    queryFn: () => fetch("/api/tl-drivers").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/tl-drivers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tl-drivers"] });
      setNewDriver({ driverId: "", name: "", license: "", status: "active" });
      toast({ title: "Driver added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/tl-drivers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tl-drivers"] });
      toast({ title: "Driver deleted" });
    },
  });

  const active = drivers.filter((d: any) => d.status === "active").length;
  const inactive = drivers.filter((d: any) => d.status === "inactive").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Fleet & Driver Management
        </h1>
        <p className="text-muted-foreground mt-2">Vehicle maintenance, driver rosters, HOS tracking, fuel logging, and safety dashboards</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Drivers</p>
            <p className="text-2xl font-bold">{drivers.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{active}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{inactive}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active %</p>
            <p className="text-2xl font-bold">{drivers.length > 0 ? ((active / drivers.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-driver">
        <CardHeader><CardTitle className="text-base">Add Driver</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Driver ID" value={newDriver.driverId} onChange={(e) => setNewDriver({ ...newDriver, driverId: e.target.value })} data-testid="input-did" className="text-sm" />
            <Input placeholder="Name" value={newDriver.name} onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="License #" value={newDriver.license} onChange={(e) => setNewDriver({ ...newDriver, license: e.target.value })} data-testid="input-lic" className="text-sm" />
            <Input placeholder="Status" disabled value="active" data-testid="input-status" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newDriver)} disabled={createMutation.isPending || !newDriver.driverId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Drivers</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : drivers.length === 0 ? <p className="text-muted-foreground text-center py-4">No drivers</p> : drivers.map((d: any) => (
            <div key={d.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`driver-${d.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{d.driverId} - {d.name}</p>
                <p className="text-xs text-muted-foreground">License: {d.license}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={d.status === "active" ? "default" : "secondary"} className="text-xs">{d.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(d.id)} data-testid={`button-delete-${d.id}`} className="h-7 w-7">
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
