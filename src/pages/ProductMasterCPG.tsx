import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Plus, Trash2, Save } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProductMasterCPG() {
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cpg-products"],
    queryFn: () => fetch("/api/cpg-products").then(r => r.json()),
  });

  const active = products.filter((p: any) => p.status === "active").length;

  const saveMutation = useMutation({
    mutationFn: async (data: any[]) => {
      // Bulk save mock: In a real app we'd send the array or handle individual saves
      for (const item of data) {
        if (item.id && !item.id.toString().startsWith("temp-")) {
          await fetch(`/api/cpg-products/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
        } else {
          const { id, ...createData } = item;
          await fetch("/api/cpg-products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createData) });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cpg-products"] });
      toast({ title: "Products saved successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/cpg-products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cpg-products"] });
      toast({ title: "Product deleted" });
    },
  });

  const addProductLine = () => {
    const newProducts = [...products, {
      id: `temp-${Date.now()}`,
      sku: "",
      name: "",
      packSize: "",
      upc: "",
      status: "draft"
    }];
    queryClient.setQueryData(["/api/cpg-products"], newProducts);
  };

  return (
    <StandardPage
      title="Product Master CPG"
      description="SKU registry, UPC/EAN/GTIN, pack sizes, variants, shelf-life, storage conditions, regulatory flags"
    >
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total SKUs</p>
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
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-yellow-600">{products.length - active}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Launch %</p>
            <p className="text-2xl font-bold">
              {products.length > 0 ? ((active / products.length) * 100).toFixed(0) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Product Registry</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addProductLine}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              <Button
                onClick={() => saveMutation.mutate(products)}
                disabled={saveMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading products...</p>
          ) : (
            <InteractiveSpreadsheet
              data={products}
              columns={[
                {
                  id: "sku",
                  header: "SKU",
                  width: "150px",
                  cell: (row, index, updateRow) => (
                    <Input
                      className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-mono font-semibold"
                      value={row.sku || ''}
                      onChange={(e) => updateRow("sku", e.target.value)}
                      placeholder="e.g. SKU-123"
                    />
                  )
                },
                {
                  id: "name",
                  header: "Product Name",
                  width: "250px",
                  cell: (row, index, updateRow) => (
                    <Input
                      className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent"
                      value={row.name || ''}
                      onChange={(e) => updateRow("name", e.target.value)}
                      placeholder="Product Name"
                    />
                  )
                },
                {
                  id: "packSize",
                  header: "Pack Size",
                  width: "120px",
                  cell: (row, index, updateRow) => (
                    <Input
                      className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right"
                      value={row.packSize || ''}
                      onChange={(e) => updateRow("packSize", e.target.value)}
                      placeholder="e.g. 12x500ml"
                    />
                  )
                },
                {
                  id: "upc",
                  header: "UPC/EAN",
                  width: "150px",
                  cell: (row, index, updateRow) => (
                    <Input
                      className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-mono"
                      value={row.upc || ''}
                      onChange={(e) => updateRow("upc", e.target.value)}
                      placeholder="Barcode digits"
                      maxLength={14}
                    />
                  )
                },
                {
                  id: "status",
                  header: "Status",
                  width: "120px",
                  cell: (row, index, updateRow) => (
                    <Select value={row.status || "draft"} onValueChange={(val) => updateRow("status", val)}>
                      <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="discontinued">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                  )
                },
                {
                  id: "actions",
                  header: "",
                  width: "60px",
                  cell: (row) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (row.id && !row.id.toString().startsWith('temp-')) {
                          deleteMutation.mutate(row.id);
                        } else {
                          const newData = products.filter((p: any) => p.id !== row.id);
                          queryClient.setQueryData(["/api/cpg-products"], newData);
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )
                }
              ]}
              onChange={(newData) => {
                queryClient.setQueryData(["/api/cpg-products"], newData);
              }}
            />
          )}
        </CardContent>
      </Card>
    </StandardPage>
  );
}
