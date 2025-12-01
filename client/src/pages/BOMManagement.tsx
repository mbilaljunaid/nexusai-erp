import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BOMManagement() {
  const { toast } = useToast();
  const [newBOM, setNewBOM] = useState({ name: "", product: "Product-A", version: "1.0", status: "draft" });

  const { data: boms = [], isLoading } = useQuery({
    queryKey: ["/api/bom"],
    queryFn: () => fetch("/api/bom").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/bom", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bom"] });
      setNewBOM({ name: "", product: "Product-A", version: "1.0", status: "draft" });
      toast({ title: "BOM created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/bom/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bom"] });
      toast({ title: "BOM deleted" });
    },
  });

  const activeBOMs = boms.filter((b: any) => b.status === "active").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          Bill of Materials (BOM)
        </h1>
        <p className="text-muted-foreground mt-2">Manage BOMs and product component definitions</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total BOMs</p>
            <p className="text-2xl font-bold">{boms.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{activeBOMs}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-yellow-600">{boms.length - activeBOMs}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-bom">
        <CardHeader><CardTitle className="text-base">Create BOM</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="BOM Name" value={newBOM.name} onChange={(e) => setNewBOM({ ...newBOM, name: e.target.value })} data-testid="input-name" />
            <Select value={newBOM.product} onValueChange={(v) => setNewBOM({ ...newBOM, product: v })}>
              <SelectTrigger data-testid="select-product"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Product-A">Product-A</SelectItem>
                <SelectItem value="Product-B">Product-B</SelectItem>
                <SelectItem value="Product-C">Product-C</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Version" value={newBOM.version} onChange={(e) => setNewBOM({ ...newBOM, version: e.target.value })} data-testid="input-version" />
            <Select value={newBOM.status} onValueChange={(v) => setNewBOM({ ...newBOM, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="obsolete">Obsolete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newBOM)} disabled={createMutation.isPending || !newBOM.name} className="w-full" data-testid="button-create-bom">
            <Plus className="w-4 h-4 mr-2" /> Create BOM
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">BOMs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : boms.length === 0 ? <p className="text-muted-foreground text-center py-4">No BOMs</p> : boms.map((b: any) => (
            <div key={b.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`bom-${b.id}`}>
              <div>
                <p className="font-semibold text-sm">{b.name}</p>
                <p className="text-xs text-muted-foreground">v{b.version} • {b.product}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={b.status === "active" ? "default" : "secondary"}>{b.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(b.id)} data-testid={`button-delete-${b.id}`}>
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
