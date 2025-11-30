import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PortalManagement() {
  const { toast } = useToast();
  const [newPortal, setNewPortal] = useState({ portalName: "", portalType: "External", userCount: "" });

  const { data: portals = [], isLoading } = useQuery({
    queryKey: ["/api/portals"],
    queryFn: () => fetch("/api/portals").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/portals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portals"] });
      setNewPortal({ portalName: "", portalType: "External", userCount: "" });
      toast({ title: "Portal created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/portals/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portals"] });
      toast({ title: "Portal deleted" });
    },
  });

  const totalUsers = portals.reduce((sum: number, p: any) => sum + (parseInt(p.userCount) || 0), 0);
  const activeSessions = Math.round(totalUsers * 0.23);

  return (
    <div className="space-y-6 p-4" data-testid="portal-management">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="h-8 w-8" />Portal Management</h1>
        <p className="text-muted-foreground mt-2">Manage customer, vendor, and employee portals</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3" data-testid="card-total-portals">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Portals</p>
            <p className="text-2xl font-bold">{portals.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-total-users">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{(totalUsers / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-active-sessions">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active Sessions</p>
            <p className="text-2xl font-bold text-blue-600">{activeSessions}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-uptime">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="text-2xl font-bold">99.9%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-portal">
        <CardHeader>
          <CardTitle className="text-base">Create Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Portal name" value={newPortal.portalName} onChange={(e) => setNewPortal({ ...newPortal, portalName: e.target.value })} data-testid="input-portal-name" />
            <Select value={newPortal.portalType} onValueChange={(v) => setNewPortal({ ...newPortal, portalType: v })}>
              <SelectTrigger data-testid="select-portal-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="External">External</SelectItem>
                <SelectItem value="Internal">Internal</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="User count" type="number" value={newPortal.userCount} onChange={(e) => setNewPortal({ ...newPortal, userCount: e.target.value })} data-testid="input-user-count" />
          </div>
          <Button onClick={() => createMutation.mutate(newPortal)} disabled={createMutation.isPending || !newPortal.portalName} className="w-full" data-testid="button-create-portal">
            <Plus className="w-4 h-4 mr-2" /> Create Portal
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Portal Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : portals.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No portals created</div>
          ) : (
            portals.map((p: any) => (
              <div key={p.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`portal-item-${p.id}`}>
                <div className="flex-1">
                  <h3 className="font-semibold">{p.portalName}</h3>
                  <p className="text-sm text-muted-foreground">Users: {p.userCount} • Status: active</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge>{p.portalType}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-${p.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
