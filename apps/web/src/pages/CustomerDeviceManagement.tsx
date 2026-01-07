import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDeviceManagement() {
  const { toast } = useToast();
  const [newDevice, setNewDevice] = useState({ deviceId: "", subscriberId: "", imei: "", simId: "", status: "active" });

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["/api/devices-sims"],
    queryFn: () => fetch("/api/devices-sims").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/devices-sims", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices-sims"] });
      setNewDevice({ deviceId: "", subscriberId: "", imei: "", simId: "", status: "active" });
      toast({ title: "Device added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/devices-sims/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices-sims"] });
      toast({ title: "Device deleted" });
    },
  });

  const active = devices.filter((d: any) => d.status === "active").length;
  const inactive = devices.filter((d: any) => d.status === "inactive").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Smartphone className="h-8 w-8" />
          Customer Device & SIM Management
        </h1>
        <p className="text-muted-foreground mt-2">Device provisioning, SIM activation, and equipment lifecycle</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Devices</p>
            <p className="text-2xl font-bold">{devices.length}</p>
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
            <p className="text-xs text-muted-foreground">Activation %</p>
            <p className="text-2xl font-bold">{devices.length > 0 ? ((active / devices.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-device">
        <CardHeader><CardTitle className="text-base">Add Device/SIM</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Device ID" value={newDevice.deviceId} onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })} data-testid="input-devid" className="text-sm" />
            <Input placeholder="Subscriber ID" value={newDevice.subscriberId} onChange={(e) => setNewDevice({ ...newDevice, subscriberId: e.target.value })} data-testid="input-subid" className="text-sm" />
            <Input placeholder="IMEI" value={newDevice.imei} onChange={(e) => setNewDevice({ ...newDevice, imei: e.target.value })} data-testid="input-imei" className="text-sm" />
            <Input placeholder="SIM ID" value={newDevice.simId} onChange={(e) => setNewDevice({ ...newDevice, simId: e.target.value })} data-testid="input-simid" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newDevice)} disabled={createMutation.isPending || !newDevice.deviceId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Devices</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : devices.length === 0 ? <p className="text-muted-foreground text-center py-4">No devices</p> : devices.map((d: any) => (
            <div key={d.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`device-${d.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{d.deviceId}</p>
                <p className="text-xs text-muted-foreground">Sub: {d.subscriberId} • IMEI: {d.imei} • SIM: {d.simId}</p>
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
