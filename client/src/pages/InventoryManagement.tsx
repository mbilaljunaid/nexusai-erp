import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingDown,
  Zap,
  BarChart3,
} from "lucide-react";

export default function InventoryManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch inventory data
  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const inventoryMetrics = [
    { title: "Total SKUs", value: "2,847", icon: Package, change: "+5%" },
    { title: "Low Stock Items", value: "34", icon: AlertTriangle, change: "-12%" },
    { title: "Stockout Risk", value: "8", icon: TrendingDown, change: "+2%" },
    { title: "Inventory Value", value: "$847K", icon: BarChart3, change: "+8.2%" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor stock levels, reorder points, and warehouse allocation
          </p>
        </div>
        <Button data-testid="button-add-inventory">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventoryMetrics.map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold mt-2">{metric.value}</p>
                  <p className={`text-xs mt-2 ${metric.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {metric.change}
                  </p>
                </div>
                <metric.icon className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stock-levels" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock-levels">Stock Levels</TabsTrigger>
          <TabsTrigger value="reorder-points">Reorder Points</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouse Allocation</TabsTrigger>
        </TabsList>

        {/* Stock Levels Tab */}
        <TabsContent value="stock-levels" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base">Current Stock Levels</CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
                  <Input
                    placeholder="Search items..."
                    className="pl-10 w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-inventory"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { sku: "SKU-001", name: "Widget A", stock: 245, min: 50, status: "optimal" },
                  { sku: "SKU-002", name: "Widget B", stock: 12, min: 50, status: "low" },
                  { sku: "SKU-003", name: "Gadget X", stock: 0, min: 30, status: "critical" },
                  { sku: "SKU-004", name: "Gadget Y", stock: 156, min: 100, status: "optimal" },
                  { sku: "SKU-005", name: "Component Z", stock: 42, min: 75, status: "low" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-sm">{item.stock} units</p>
                        <p className="text-xs text-muted-foreground">Min: {item.min}</p>
                      </div>
                      <Badge
                        className={`${
                          item.status === "optimal"
                            ? "bg-green-100 text-green-800"
                            : item.status === "low"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid={`button-adjust-stock-${item.sku}`}
                      >
                        Adjust
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reorder Points Tab */}
        <TabsContent value="reorder-points" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Set Reorder Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { sku: "SKU-001", name: "Widget A", currentMin: 50, recommended: 75 },
                  { sku: "SKU-002", name: "Widget B", currentMin: 50, recommended: 120 },
                  { sku: "SKU-003", name: "Gadget X", currentMin: 30, recommended: 80 },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 border rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-edit-reorder-${item.sku}`}>
                        Edit
                      </Button>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Current</p>
                        <p className="font-semibold">{item.currentMin} units</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Recommended</p>
                        <p className="font-semibold text-blue-600">{item.recommended} units</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warehouse Allocation Tab */}
        <TabsContent value="warehouses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Warehouse Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { warehouse: "Main Warehouse (SF)", capacity: "80%", items: 1200, status: "optimal" },
                  { warehouse: "East Coast Hub (NYC)", capacity: "65%", items: 890, status: "optimal" },
                  { warehouse: "West Coast (LA)", capacity: "92%", items: 450, status: "warning" },
                  { warehouse: "Central Hub (Chicago)", capacity: "55%", items: 307, status: "optimal" },
                ].map((wh, idx) => (
                  <div key={idx} className="p-3 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{wh.warehouse}</p>
                        <p className="text-sm text-muted-foreground mt-1">{wh.items} items stored</p>
                      </div>
                      <Badge className={wh.status === "optimal" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                        {wh.capacity}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${wh.status === "optimal" ? "bg-green-600" : "bg-amber-600"}`}
                        style={{ width: wh.capacity }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`button-manage-warehouse-${idx}`}
                    >
                      Manage Allocation
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
