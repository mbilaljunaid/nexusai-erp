import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Network, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EDIMarketplaceConnectors() {
  const { toast } = useToast();
  const [newConn, setNewConn] = useState({ partner: "", type: "edi", status: "active" });

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["/api/edi-connectors"],
    queryFn: () => fetch("/api/edi-connectors").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/edi-connectors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/edi-connectors"] });
      setNewConn({ partner: "", type: "edi", status: "active" });
      toast({ title: "Connector created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/edi-connectors/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/edi-connectors"] });
      toast({ title: "Connector deleted" });
    },
  });

  const active = connections.filter((c: any) => c.status === "active").length;
  const ediCount = connections.filter((c: any) => c.type === "edi").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Network className="h-8 w-8" />
          EDI & Marketplace Connectors
        </h1>
        <p className="text-muted-foreground mt-2">EDI 850/855/856/810, ASN tracking, API connectors, and marketplace integrations</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Connectors</p>
            <p className="text-2xl font-bold">{connections.length}</p>
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
            <p className="text-xs text-muted-foreground">EDI Connectors</p>
            <p className="text-2xl font-bold text-blue-600">{ediCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">API/Marketplace</p>
            <p className="text-2xl font-bold text-purple-600">{connections.length - ediCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-conn">
        <CardHeader><CardTitle className="text-base">Add Connector</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <Input placeholder="Trading Partner" value={newConn.partner} onChange={(e) => setNewConn({ ...newConn, partner: e.target.value })} data-testid="input-partner" className="text-sm" />
            <Select value={newConn.type} onValueChange={(v) => setNewConn({ ...newConn, type: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="edi">EDI (850/855/856)</SelectItem>
                <SelectItem value="api">API REST</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="sftp">SFTP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newConn.status} onValueChange={(v) => setNewConn({ ...newConn, status: v })}>
              <SelectTrigger data-testid="select-status" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newConn)} disabled={createMutation.isPending || !newConn.partner} size="sm" data-testid="button-add-conn">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Connectors</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : connections.length === 0 ? <p className="text-muted-foreground text-center py-4">No connectors</p> : connections.map((c: any) => (
            <div key={c.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`conn-${c.id}`}>
              <div>
                <p className="font-semibold">{c.partner}</p>
                <p className="text-xs text-muted-foreground">{c.type}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-xs">{c.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-${c.id}`} className="h-7 w-7">
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
