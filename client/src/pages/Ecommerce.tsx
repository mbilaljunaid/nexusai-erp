import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";

export default function Ecommerce() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">E-Commerce</h1>
          <p className="text-muted-foreground text-sm">Online store, products, orders, and payments</p>
        </div>
        <Button data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
          <TabsTrigger value="customers" data-testid="tab-customers">Customers</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold font-mono">$125K</p>
                  <p className="text-xs text-muted-foreground">Revenue (This Month)</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">342</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">1,245</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">3.8%</p>
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">E-Commerce Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Product Catalog", description: "Manage products, variants, and inventory" },
                  { name: "Shopping Cart", description: "Customizable checkout experience" },
                  { name: "Payment Processing", description: "Stripe, PayPal, and more" },
                  { name: "Order Management", description: "Track and fulfill orders" },
                  { name: "Customer Management", description: "Loyalty and customer profiles" },
                  { name: "Shipping & Logistics", description: "Integration with carriers" },
                  { name: "Marketing Tools", description: "Discounts, coupons, and campaigns" },
                  { name: "Analytics", description: "Sales, traffic, and customer insights" },
                ].map((capability) => (
                  <Button key={capability.name} variant="outline" className="h-auto flex flex-col items-start justify-start p-4">
                    <span className="font-medium">{capability.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{capability.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Product catalog module coming soon. Manage products, categories, variants, and inventory.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Order management module coming soon. Track, process, and fulfill customer orders.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Customer module coming soon. Manage customer profiles, loyalty, and engagement.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">E-Commerce Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Analytics module coming soon. Track sales, traffic, and customer behavior.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
