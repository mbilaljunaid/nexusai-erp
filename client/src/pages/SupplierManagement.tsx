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

export default function SupplierManagement() {
  const { toast } = useToast();
  const [newSupplier, setNewSupplier] = useState({ supplierName: "", category: "Electronics", rating: "3" });

  const { data: suppliers = [], isLoading } = useQuery<any[]>({ 
    queryKey: ["/api/procurement/suppliers"],
    queryFn: () => fetch("/api/procurement/suppliers").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/procurement/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procurement/suppliers"] });
      setNewSupplier({ supplierName: "", category: "Electronics", rating: "3" });
      toast({ title: "Supplier added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/procurement/suppliers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/procurement/suppliers"] });
      toast({ title: "Supplier removed" });
    },
  });

  const active = suppliers.filter((s: any) => s.status === "active").length;

  return (
    <div className="space-y-4 p-4" data-testid="supplier-management">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Users className="w-8 h-8" />Supplier Management</h1>
        <p className="text-muted-foreground">Manage vendor relationships</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card data-testid="card-total-suppliers"><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Suppliers</p><p className="text-2xl font-bold">{suppliers.length}</p></CardContent></Card>
        <Card data-testid="card-active"><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Active</p><p className="text-2xl font-bold text-green-600">{active}</p></CardContent></Card>
        <Card data-testid="card-spend"><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Spend YTD</p><p className="text-2xl font-bold">$4.5M</p></CardContent></Card>
      </div>

      <Card data-testid="card-new-supplier">
        <CardHeader><CardTitle className="text-base">Add Supplier</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Supplier name" value={newSupplier.supplierName} onChange={(e) => setNewSupplier({ ...newSupplier, supplierName: e.target.value })} data-testid="input-supplier-name" />
            <Select value={newSupplier.category} onValueChange={(v) => setNewSupplier({ ...newSupplier, category: v })}>
              <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                <SelectItem value="Packaging">Packaging</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newSupplier.rating} onValueChange={(v) => setNewSupplier({ ...newSupplier, rating: v })}>
              <SelectTrigger data-testid="select-rating"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Star</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={createMutation.isPending || !newSupplier.supplierName} className="w-full" data-testid="button-add-supplier">
            <Plus className="w-4 h-4 mr-2" /> Add Supplier
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Suppliers</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? (
              <p>Loading...</p>
            ) : suppliers.length === 0 ? (
              <p className="text-muted-foreground">No suppliers created</p>
            ) : (
              suppliers.map((s: any) => (
                <div key={s.id} className="flex justify-between items-center p-3 border rounded hover-elevate" data-testid={`supplier-${s.id}`}>
                  <div>
                    <p className="font-semibold">{s.supplierName || s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.category}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status || "active"}</Badge>
                    <Button size="icon" variant="ghost" data-testid={`button-delete-${s.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
