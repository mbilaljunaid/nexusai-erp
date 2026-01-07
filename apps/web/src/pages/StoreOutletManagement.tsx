import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StoreOutletManagement() {
  const { toast } = useToast();
  const [newStore, setNewStore] = useState({ storeCode: "", storeName: "", city: "", country: "" });

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["/api/stores"],
    queryFn: () => fetch("/api/stores").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/stores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      setNewStore({ storeCode: "", storeName: "", city: "", country: "" });
      toast({ title: "Store created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/stores/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      toast({ title: "Store deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapPin className="h-8 w-8" />
          Store & Outlet Management
        </h1>
        <p className="text-muted-foreground mt-2">Multi-location management, store hierarchy, and operational controls</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Stores</p>
            <p className="text-2xl font-bold">{stores.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{stores.filter((s: any) => s.status === "active").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Cities</p>
            <p className="text-2xl font-bold">{new Set(stores.map((s: any) => s.city)).size}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Countries</p>
            <p className="text-2xl font-bold">{new Set(stores.map((s: any) => s.country)).size}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-store">
        <CardHeader><CardTitle className="text-base">Add Store</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Store Code" value={newStore.storeCode} onChange={(e) => setNewStore({ ...newStore, storeCode: e.target.value })} data-testid="input-code" className="text-sm" />
            <Input placeholder="Store Name" value={newStore.storeName} onChange={(e) => setNewStore({ ...newStore, storeName: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="City" value={newStore.city} onChange={(e) => setNewStore({ ...newStore, city: e.target.value })} data-testid="input-city" className="text-sm" />
            <Input placeholder="Country" value={newStore.country} onChange={(e) => setNewStore({ ...newStore, country: e.target.value })} data-testid="input-country" className="text-sm" />
            <Button disabled={createMutation.isPending || !newStore.storeCode} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Stores</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : stores.length === 0 ? <p className="text-muted-foreground text-center py-4">No stores</p> : stores.map((s: any) => (
            <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`store-${s.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{s.storeCode} - {s.storeName}</p>
                <p className="text-xs text-muted-foreground">{s.city}, {s.country}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="default" className="text-xs">{s.status || "active"}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${s.id}`} className="h-7 w-7">
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
