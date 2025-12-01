import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Radio, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function NetworkInventoryOSS() {
  const { toast } = useToast();
  const [newNode, setNewNode] = useState({ nodeId: "", nodeType: "cell-tower", location: "", capacity: "1000", utilization: "0" });

  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["/api/network-nodes"],
    queryFn: () => fetch("/api/network-nodes").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/network-nodes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-nodes"] });
      setNewNode({ nodeId: "", nodeType: "cell-tower", location: "", capacity: "1000", utilization: "0" });
      toast({ title: "Network node added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/network-nodes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/network-nodes"] });
      toast({ title: "Node deleted" });
    },
  });

  const active = nodes.filter((n: any) => n.status === "active").length;
  const avgUtil = nodes.length > 0 ? (nodes.reduce((sum: number, n: any) => sum + (parseFloat(n.utilization) || 0), 0) / nodes.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Radio className="h-8 w-8" />
          Network Inventory & OSS
        </h1>
        <p className="text-muted-foreground mt-2">Network elements, topology, capacity, and maintenance scheduling</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Nodes</p>
            <p className="text-2xl font-bold">{nodes.length}</p>
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
            <p className="text-xs text-muted-foreground">Avg Utilization</p>
            <p className="text-2xl font-bold">{avgUtil}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Alerts</p>
            <p className="text-2xl font-bold text-red-600">{nodes.filter((n: any) => (parseFloat(n.utilization) || 0) > 80).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-node">
        <CardHeader><CardTitle className="text-base">Add Network Node</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Node ID" value={newNode.nodeId} onChange={(e) => setNewNode({ ...newNode, nodeId: e.target.value })} data-testid="input-nid" className="text-sm" />
            <Input placeholder="Node Type" value={newNode.nodeType} disabled data-testid="input-type" className="text-sm" />
            <Input placeholder="Location" value={newNode.location} onChange={(e) => setNewNode({ ...newNode, location: e.target.value })} data-testid="input-location" className="text-sm" />
            <Input placeholder="Capacity" type="number" value={newNode.capacity} onChange={(e) => setNewNode({ ...newNode, capacity: e.target.value })} data-testid="input-cap" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newNode)} disabled={createMutation.isPending || !newNode.nodeId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Nodes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : nodes.length === 0 ? <p className="text-muted-foreground text-center py-4">No nodes</p> : nodes.map((n: any) => (
            <div key={n.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`node-${n.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{n.nodeId}</p>
                <p className="text-xs text-muted-foreground">{n.location} • Cap: {n.capacity} • Util: {n.utilization}%</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={n.status === "active" ? "default" : "secondary"} className="text-xs">{n.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(n.id)} data-testid={`button-delete-${n.id}`} className="h-7 w-7">
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
