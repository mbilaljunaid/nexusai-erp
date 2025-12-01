import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomsCompliance() {
  const { toast } = useToast();
  const [newDecl, setNewDecl] = useState({ declarationId: "", shipmentId: "", hsCode: "", country: "", status: "pending" });

  const { data: declarations = [], isLoading } = useQuery({
    queryKey: ["/api/tl-customs"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/tl-customs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tl-customs"] });
      setNewDecl({ declarationId: "", shipmentId: "", hsCode: "", country: "", status: "pending" });
      toast({ title: "Declaration created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/tl-customs/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tl-customs"] });
      toast({ title: "Declaration deleted" });
    }
  });

  const cleared = declarations.filter((d: any) => d.status === "cleared").length;
  const pending = declarations.filter((d: any) => d.status === "pending").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Customs, Trade & Global Compliance
        </h1>
        <p className="text-muted-foreground mt-2">Export/import declarations, customs docs, trade screening, and duties calculation</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Declarations</p>
            <p className="text-2xl font-bold">{declarations.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Cleared</p>
            <p className="text-2xl font-bold text-green-600">{cleared}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Clearance %</p>
            <p className="text-2xl font-bold">{declarations.length > 0 ? ((cleared / declarations.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-decl">
        <CardHeader><CardTitle className="text-base">Create Declaration</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Declaration ID" value={newDecl.declarationId} onChange={(e) => setNewDecl({ ...newDecl, declarationId: e.target.value })} data-testid="input-declid" className="text-sm" />
            <Input placeholder="Shipment ID" value={newDecl.shipmentId} onChange={(e) => setNewDecl({ ...newDecl, shipmentId: e.target.value })} data-testid="input-sid" className="text-sm" />
            <Input placeholder="HS Code" value={newDecl.hsCode} onChange={(e) => setNewDecl({ ...newDecl, hsCode: e.target.value })} data-testid="input-hscode" className="text-sm" />
            <Input placeholder="Country" value={newDecl.country} onChange={(e) => setNewDecl({ ...newDecl, country: e.target.value })} data-testid="input-country" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newDecl)} disabled={createMutation.isPending || !newDecl.declarationId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Declarations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : declarations.length === 0 ? <p className="text-muted-foreground text-center py-4">No declarations</p> : declarations.map((d: any) => (
            <div key={d.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`decl-${d.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{d.declarationId}</p>
                <p className="text-xs text-muted-foreground">HS: {d.hsCode} • Country: {d.country}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={d.status === "cleared" ? "default" : "secondary"} className="text-xs">{d.status}</Badge>
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
