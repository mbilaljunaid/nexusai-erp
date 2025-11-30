import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Trash2, Edit } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProductCatalog() {
  const { toast } = useToast();
  const [newProduct, setNewProduct] = useState({ sku: "", name: "", category: "Apparel", price: "0", cost: "0", status: "draft" });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: () => fetch("/api/products").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setNewProduct({ sku: "", name: "", category: "Apparel", price: "0", cost: "0", status: "draft" });
      toast({ title: "Product created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted" });
    },
  });

  const active = products.filter((p: any) => p.status === "active").length;
  const avgMargin = products.length > 0 ? (products.reduce((sum: number, p: any) => sum + ((parseFloat(p.price) - parseFloat(p.cost)) / parseFloat(p.price) * 100 || 0), 0) / products.length).toFixed(0) : 0;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          Product Catalog & Merchandising
        </h1>
        <p className="text-muted-foreground mt-2">SKU management, variants, categories, and attributes</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold">{products.length}</p>
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
            <p className="text-xs text-muted-foreground">Avg Margin</p>
            <p className="text-2xl font-bold">{avgMargin}%</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">${(products.reduce((sum: number, p: any) => sum + (parseFloat(p.price) || 0), 0) / 1000000).toFixed(2)}M</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-product">
        <CardHeader><CardTitle className="text-base">Add Product</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="SKU" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} data-testid="input-sku" className="text-sm" />
            <Input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} data-testid="input-name" className="text-sm" />
            <Input placeholder="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} data-testid="input-price" className="text-sm" />
            <Input placeholder="Cost" type="number" value={newProduct.cost} onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })} data-testid="input-cost" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newProduct)} disabled={createMutation.isPending || !newProduct.sku} size="sm" data-testid="button-add-product">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Products</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : products.length === 0 ? <p className="text-muted-foreground text-center py-4">No products</p> : products.map((p: any) => {
            const margin = parseFloat(p.price) > 0 ? ((parseFloat(p.price) - parseFloat(p.cost)) / parseFloat(p.price) * 100).toFixed(0) : 0;
            return (
              <div key={p.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`product-${p.id}`}>
                <div className="flex-1">
                  <p className="font-semibold">{p.sku} - {p.name}</p>
                  <p className="text-xs text-muted-foreground">${p.price} | Cost ${p.cost} | {margin}% margin</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-xs">{p.status}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-${p.id}`} className="h-7 w-7">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
