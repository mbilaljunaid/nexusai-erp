import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { IconNavigation } from "@/components/IconNavigation";
import { Package, Plus, Search, AlertTriangle, TrendingDown, BarChart3, Warehouse } from "lucide-react";

export default function InventoryManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNav, setActiveNav] = useState("stock-levels");

  const { data: inventory = [] } = useQuery({ queryKey: ["/api/inventory"] });

  const navItems = [
    { id: "stock-levels", label: "Stock Levels", icon: Package, color: "text-blue-500" },
    { id: "reorder-points", label: "Reorder Points", icon: AlertTriangle, color: "text-orange-500" },
    { id: "warehouses", label: "Warehouses", icon: Warehouse, color: "text-purple-500" },
  ];

  const inventoryMetrics = [
    { title: "Total SKUs", value: "2,847", icon: Package, change: "+5%" },
    { title: "Low Stock Items", value: "34", icon: AlertTriangle, change: "-12%" },
    { title: "Stockout Risk", value: "8", icon: TrendingDown, change: "+2%" },
    { title: "Inventory Value", value: "$847K", icon: BarChart3, change: "+8.2%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Package className="h-8 w-8" />Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Monitor stock levels, reorder points, and warehouse allocation</p>
        </div>
        <Button data-testid="button-add-inventory">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

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

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "stock-levels" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base">Current Stock Levels</CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
                  <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent><p className="text-muted-foreground">2,847 items tracked</p></CardContent>
          </Card>
        </div>
      )}

      {activeNav === "reorder-points" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Reorder Points Configuration</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">34 items need attention</p><Badge variant="destructive" className="mt-2">Low Stock</Badge></CardContent>
          </Card>
        </div>
      )}

      {activeNav === "warehouses" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Warehouse Allocation</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">12 warehouses managed</p></CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
