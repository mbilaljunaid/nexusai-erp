import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function ERPModule() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ERP Module</h1>
          <p className="text-muted-foreground">Manage inventory, orders, and supply chain</p>
        </div>
        <Button data-testid="button-create-order">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Inventory</p>
                <p className="text-2xl font-bold mt-1">1,250</p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Orders</p>
                <p className="text-2xl font-bold mt-1">18</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Purchase Orders</p>
              <p className="text-2xl font-bold mt-1">42</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fulfillment Rate</p>
                <p className="text-2xl font-bold mt-1">94%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { sku: "SKU-001", name: "Widget A", quantity: 5 },
              { sku: "SKU-045", name: "Component B", quantity: 8 },
              { sku: "SKU-103", name: "Part C", quantity: 3 },
            ].map((item) => (
              <div key={item.sku} className="flex justify-between p-2 rounded hover:bg-muted">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                </div>
                <Badge variant="destructive">{item.quantity} units</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Sales Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { so: "SO-001", amount: "$15,000", status: "shipped" },
              { so: "SO-002", amount: "$22,500", status: "processing" },
              { so: "SO-003", amount: "$8,750", status: "pending" },
            ].map((order) => (
              <div key={order.so} className="flex justify-between p-2 rounded hover:bg-muted">
                <div>
                  <p className="text-sm font-medium">{order.so}</p>
                  <Badge variant="outline" className="text-xs">{order.status}</Badge>
                </div>
                <span className="font-mono text-sm">{order.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
