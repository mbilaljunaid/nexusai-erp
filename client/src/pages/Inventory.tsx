import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Warehouse, AlertTriangle, TrendingDown } from "lucide-react";

export default function Inventory() {
  const [viewType, setViewType] = useState("items");

  const { data: items = [] } = useQuery<any[]>({ queryKey: ["/api/inventory/items"] });
  const { data: warehouses = [] } = useQuery<any[]>({ queryKey: ["/api/inventory/warehouses"] });

  const lowStockItems = items.filter((item: any) => item.quantity <= item.reorderLevel);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">Track items and warehouse locations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Warehouses</p>
                <p className="text-2xl font-bold">{warehouses.length}</p>
              </div>
              <Warehouse className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={viewType === "items" ? "default" : "outline"}
          onClick={() => setViewType("items")}
          data-testid="button-view-items"
        >
          Items
        </Button>
        <Button
          variant={viewType === "warehouses" ? "default" : "outline"}
          onClick={() => setViewType("warehouses")}
          data-testid="button-view-warehouses"
        >
          Warehouses
        </Button>
      </div>

      {viewType === "items" && (
        <div className="space-y-3">
          {items.map((item: any) => (
            <Card key={item.id} data-testid={`card-item-${item.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{item.itemName}</h4>
                    <p className="text-xs text-muted-foreground">Code: {item.itemCode}</p>
                  </div>
                  <Badge variant={item.quantity > item.reorderLevel ? "default" : "destructive"}>
                    {item.quantity} units
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Category</span>
                    <p className="font-medium">{item.category}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Reorder Level</span>
                    <p className="font-medium">{item.reorderLevel}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Unit Cost</span>
                    <p className="font-medium">${item.unitCost}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Warehouse</span>
                    <p className="font-medium">{item.warehouse}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewType === "warehouses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map((wh: any) => (
            <Card key={wh.id} data-testid={`card-warehouse-${wh.id}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-green-600" />
                  {wh.warehouseName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">Location</span>
                  <p className="text-sm font-medium">{wh.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Capacity</span>
                    <p className="text-lg font-bold">{wh.capacity}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Occupancy</span>
                    <p className="text-lg font-bold">{wh.occupancy}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
