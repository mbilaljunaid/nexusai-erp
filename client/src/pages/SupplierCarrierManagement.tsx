import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SupplierCarrierManagement() {
  const { toast } = useToast();
  const [newSupplier, setNewSupplier] = useState({ supplierId: "", name: "", type: "carrier", rating: "4.5" });

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["/api/suppliers-carriers"],
    queryFn: () => fetch("/api/suppliers-carriers").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/suppliers-carriers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers-carriers"] });
      setNewSupplier({ supplierId: "", name: "", type: "carrier", rating: "4.5" });
      toast({ title: "Supplier added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/suppliers-carriers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers-carriers"] });
      toast({ title: "Supplier deleted" });
    },
  });

  const carriers = suppliers.filter((s: any) => s.type === "carrier").length;
  const avgRating = suppliers.length > 0 ? (suppliers.reduce((sum: number, s: any) => sum + (parseFloat(s.rating) || 0), 0) / suppliers.length).toFixed(1) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Supplier & Carrier Management
        </h1>
        <p className="text-muted-foreground mt-2">Vendor contracts, SLAs, scorecards, and performance tracking</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Suppliers</p>
            <p className="text-2xl font-bold">{suppliers.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Carriers</p>
            <p className="text-2xl font-bold text-blue-600">{carriers}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Rating</p>
            <p className="text-2xl font-bold text-yellow-600">{avgRating}/5</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{suppliers.filter((s: any) => s.active !== false).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-supplier">
        <CardHeader><CardTitle className="text-base">Add Supplier/Carrier</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="ID" value={newSupplier.supplierId} onChange={(e) => setNewSupplier({ ...newSupplier, supplierId: e.target.value })} data-testid="input-id" className="text-sm" />
            <Input placeholder="Name" value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Rating" type="number" min="0" max="5" step="0.1" value={newSupplier.rating} onChange={(e) => setNewSupplier({ ...newSupplier, rating: e.target.value })} data-testid="input-rating" className="text-sm" />
            <Input placeholder="Type" value={newSupplier.type} disabled data-testid="input-type" className="text-sm" />
            <Button disabled={createMutation.isPending || !newSupplier.supplierId} size="sm" data-testid="button-add">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Suppliers & Carriers</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : suppliers.length === 0 ? <p className="text-muted-foreground text-center py-4">No suppliers</p> : suppliers.map((s: any) => (
            <div key={s.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`supplier-${s.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{s.supplierId} - {s.name}</p>
                <p className="text-xs text-muted-foreground">{s.type} • Rating: {s.rating}/5</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="default" className="text-xs">{s.type}</Badge>
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
