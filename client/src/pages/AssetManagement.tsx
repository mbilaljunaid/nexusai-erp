import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { Package, Plus, Trash2 } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AssetManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const formMetadata = getFormMetadata("assetManagement");
  const { toast } = useToast();
  const [newAsset, setNewAsset] = useState({ assetName: "", category: "Equipment", cost: "", status: "active" });

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["/api/finance/fixed-assets"],
    queryFn: () => fetch("/api/finance/fixed-assets").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/finance/fixed-assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/fixed-assets"] });
      setNewAsset({ assetName: "", category: "Equipment", cost: "", status: "active" });
      toast({ title: "Asset created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/finance/fixed-assets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/fixed-assets"] });
      toast({ title: "Asset deleted" });
    },
  });

  const totalValue = assets.reduce((sum: number, a: any) => sum + parseFloat(a.cost || 0), 0);

  return (
    <div className="space-y-6 p-4" data-testid="asset-management">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Package className="h-8 w-8" />Asset Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage organizational assets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-total-assets"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Assets</p><p className="text-3xl font-bold mt-1">{assets.length}</p></CardContent></Card>
        <Card data-testid="card-utilization"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Utilization</p><p className="text-3xl font-bold mt-1">87%</p></CardContent></Card>
        <Card data-testid="card-value"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Value</p><p className="text-3xl font-bold mt-1">${(totalValue / 1000000).toFixed(1)}M</p></CardContent></Card>
      </div>

      <Card data-testid="card-new-asset">
        <CardHeader><CardTitle className="text-base">Add Asset</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Asset name" value={newAsset.assetName} onChange={(e) => setNewAsset({ ...newAsset, assetName: e.target.value })} data-testid="input-asset-name" />
            <Select value={newAsset.category} onValueChange={(v) => setNewAsset({ ...newAsset, category: v })}>
              <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Cost" type="number" value={newAsset.cost} onChange={(e) => setNewAsset({ ...newAsset, cost: e.target.value })} data-testid="input-cost" />
            <Select value={newAsset.status} onValueChange={(v) => setNewAsset({ ...newAsset, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newAsset)} disabled={createMutation.isPending || !newAsset.assetName} className="w-full" data-testid="button-create-asset">
            <Plus className="w-4 h-4 mr-2" /> Add Asset
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
          ) : assets.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No assets</p>
          ) : (
            assets.map((asset: any) => (
              <div key={asset.id} className="flex items-center justify-between p-3 border rounded hover-elevate" data-testid={`asset-${asset.id}`}>
                <div>
                  <p className="font-semibold">{asset.assetName}</p>
                  <p className="text-sm text-muted-foreground">{asset.category}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <p className="font-semibold">${asset.cost}</p>
                  <Badge>{asset.status}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(asset.id)} data-testid={`button-delete-${asset.id}`}>
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
