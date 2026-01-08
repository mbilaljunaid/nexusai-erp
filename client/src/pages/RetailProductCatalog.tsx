import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

export default function RetailProductCatalog() {
  const [search, setSearch] = useState("");
  const { data: products = [] } = useQuery<any[]>({ queryKey: ['/api/retail-products'] });
  
  const filtered = products.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Catalog</h1>
          <p className="text-muted-foreground mt-1">{products.length} products in catalog</p>
        </div>
        <Button data-testid="button-add-product"><Plus className="w-4 h-4 mr-2" />Add Product</Button>
      </div>

      <div className="flex gap-2 items-center">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
          data-testid="input-search-products"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p: any) => (
          <Card key={p.id} className="hover-elevate" data-testid={`card-product-${p.id}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">{p.sku}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-muted-foreground">Price:</span></p>
                <p className="font-semibold">₹{p.price}</p>
                <p><span className="text-muted-foreground">Stock:</span></p>
                <p className={p.quantity > 0 ? "font-semibold text-green-600" : "font-semibold text-red-600"}>{p.quantity}</p>
              </div>
              <p className="text-sm"><span className="text-muted-foreground">Category:</span> {p.category}</p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" data-testid="button-edit-product"><Edit2 className="w-3 h-3" /></Button>
                <Button size="sm" variant="destructive" data-testid="button-delete-product"><Trash2 className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
