import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconNavigation } from "@/components/IconNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ShoppingCart, Package, Truck, CreditCard, Users, TrendingUp, Star, BarChart3 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  rating: number;
  sales: number;
  status: "active" | "draft" | "archived";
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  items: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  paymentStatus: "pending" | "completed" | "failed";
  shippingStatus: "pending" | "processing" | "shipped" | "delivered";
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: "active" | "inactive";
}

export default function Ecommerce() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: ShoppingCart, color: "text-blue-500" },
    { id: "products", label: "Products", icon: Package, color: "text-purple-500" },
    { id: "orders", label: "Orders", icon: Truck, color: "text-green-500" },
    { id: "customers", label: "Customers", icon: Users, color: "text-orange-500" },
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-pink-500" },
  ];

  // todo: remove mock functionality
  const products: Product[] = [
    { id: "1", name: "Premium Widget", sku: "WID-001", category: "Widgets", price: 29.99, cost: 12, stock: 245, rating: 4.8, sales: 1250, status: "active", image: "" },
    { id: "2", name: "Deluxe Gadget", sku: "GAD-002", category: "Gadgets", price: 49.99, cost: 20, stock: 89, rating: 4.6, sales: 856, status: "active", image: "" },
    { id: "3", name: "Standard Component", sku: "COM-003", category: "Components", price: 19.99, cost: 8, stock: 542, rating: 4.2, sales: 2100, status: "active", image: "" },
    { id: "4", name: "Premium Bundle", sku: "BUN-001", category: "Bundles", price: 89.99, cost: 35, stock: 45, rating: 4.9, sales: 420, status: "active", image: "" },
    { id: "5", name: "Limited Edition", sku: "LIM-001", category: "Special", price: 199.99, cost: 80, stock: 12, rating: 5, sales: 89, status: "active", image: "" },
  ];

  const orders: Order[] = [
    { id: "1", orderNumber: "ORD-10001", customer: "John Smith", total: 129.97, items: 3, status: "delivered", date: "2024-12-08", paymentStatus: "completed", shippingStatus: "delivered" },
    { id: "2", orderNumber: "ORD-10002", customer: "Sarah Johnson", total: 79.99, items: 2, status: "shipped", date: "2024-12-09", paymentStatus: "completed", shippingStatus: "shipped" },
    { id: "3", orderNumber: "ORD-10003", customer: "Michael Brown", total: 199.99, items: 1, status: "processing", date: "2024-12-10", paymentStatus: "completed", shippingStatus: "processing" },
    { id: "4", orderNumber: "ORD-10004", customer: "Emily Davis", total: 59.99, items: 2, status: "pending", date: "2024-12-10", paymentStatus: "pending", shippingStatus: "pending" },
    { id: "5", orderNumber: "ORD-10005", customer: "James Wilson", total: 349.97, items: 5, status: "shipped", date: "2024-12-09", paymentStatus: "completed", shippingStatus: "shipped" },
  ];

  const customers: Customer[] = [
    { id: "1", name: "John Smith", email: "john@example.com", phone: "+1-555-0101", totalOrders: 12, totalSpent: 1240, lastOrder: "2024-12-08", status: "active" },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com", phone: "+1-555-0102", totalOrders: 8, totalSpent: 890, lastOrder: "2024-12-09", status: "active" },
    { id: "3", name: "Michael Brown", email: "michael@example.com", phone: "+1-555-0103", totalOrders: 15, totalSpent: 2100, lastOrder: "2024-12-10", status: "active" },
    { id: "4", name: "Emily Davis", email: "emily@example.com", phone: "+1-555-0104", totalOrders: 3, totalSpent: 240, lastOrder: "2024-12-10", status: "inactive" },
  ];

  const stats = {
    revenue: 4250,
    orders: 125,
    customers: 342,
    avgOrderValue: 34,
    conversionRate: 3.8,
    cartAbandonmentRate: 68,
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusConfig = {
    active: "bg-green-500/10 text-green-600",
    draft: "bg-yellow-500/10 text-yellow-600",
    archived: "bg-gray-500/10 text-gray-600",
    pending: "bg-blue-500/10 text-blue-600",
    processing: "bg-yellow-500/10 text-yellow-600",
    shipped: "bg-purple-500/10 text-purple-600",
    delivered: "bg-green-500/10 text-green-600",
    cancelled: "bg-red-500/10 text-red-600",
    completed: "bg-green-500/10 text-green-600",
    failed: "bg-red-500/10 text-red-600",
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">E-Commerce</h1>
          <p className="text-muted-foreground text-sm">Online store, products, orders, and customer management</p>
        </div>
        <Button data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-2xl font-semibold font-mono">${(stats.revenue / 1000).toFixed(1)}K</p>
              </div>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-500" />
                <p className="text-2xl font-semibold">{stats.orders}</p>
              </div>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <p className="text-2xl font-semibold">{stats.customers}</p>
              </div>
              <p className="text-xs text-muted-foreground">Customers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-2xl font-semibold font-mono">${stats.avgOrderValue}</p>
              <p className="text-xs text-muted-foreground">Avg Order Value</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-2xl font-semibold">{stats.conversionRate}%</p>
              <p className="text-xs text-muted-foreground">Conversion</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-2xl font-semibold">{stats.cartAbandonmentRate}%</p>
              <p className="text-xs text-muted-foreground">Cart Abandonment</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <IconNavigation items={navItems} activeId={selectedTab} onSelect={setSelectedTab} />

      {selectedTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-md border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">${order.total}</p>
                        <Badge className={`text-xs capitalize ${statusConfig[order.status as "pending" | "processing" | "shipped" | "delivered" | "cancelled"]}`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products.slice(0, 4).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-md border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">${product.price}</p>
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {product.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
      )}

      {selectedTab === "products" && (
        <>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Product</th>
                      <th className="px-4 py-3 text-left font-medium">Category</th>
                      <th className="px-4 py-3 text-left font-medium">Price</th>
                      <th className="px-4 py-3 text-left font-medium">Stock</th>
                      <th className="px-4 py-3 text-left font-medium">Sales</th>
                      <th className="px-4 py-3 text-left font-medium">Rating</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{product.name}</td>
                        <td className="px-4 py-3 text-sm">{product.category}</td>
                        <td className="px-4 py-3 font-mono">${product.price}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className={product.stock < 50 ? "bg-yellow-500/10 text-yellow-600" : ""}>
                            {product.stock}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono">{product.sales}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {product.rating}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusConfig[product.status as keyof typeof statusConfig]}>
                            {product.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {selectedTab === "orders" && (
        <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Order</th>
                      <th className="px-4 py-3 text-left font-medium">Customer</th>
                      <th className="px-4 py-3 text-left font-medium">Total</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Payment</th>
                      <th className="px-4 py-3 text-left font-medium">Shipping</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                        <td className="px-4 py-3">{order.customer}</td>
                        <td className="px-4 py-3 font-mono">${order.total}</td>
                        <td className="px-4 py-3 text-xs">{order.date}</td>
                        <td className="px-4 py-3">
                          <Badge className={statusConfig[order.paymentStatus as keyof typeof statusConfig]} variant="secondary">
                            {order.paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusConfig[order.shippingStatus as keyof typeof statusConfig]} variant="secondary">
                            {order.shippingStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
      )}

      {selectedTab === "customers" && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Email</th>
                      <th className="px-4 py-3 text-left font-medium">Phone</th>
                      <th className="px-4 py-3 text-left font-medium">Orders</th>
                      <th className="px-4 py-3 text-left font-medium">Total Spent</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{customer.name}</td>
                        <td className="px-4 py-3 text-xs">{customer.email}</td>
                        <td className="px-4 py-3 text-xs">{customer.phone}</td>
                        <td className="px-4 py-3 font-mono">{customer.totalOrders}</td>
                        <td className="px-4 py-3 font-mono">${customer.totalSpent}</td>
                        <td className="px-4 py-3">
                          <Badge className={customer.status === "active" ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                            {customer.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
      )}

      {selectedTab === "analytics" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">E-Commerce Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Analytics loading with detailed sales charts, customer insights, and product performance metrics.</p>
            </CardContent>
          </Card>
      )}
    </div>
  );
}
