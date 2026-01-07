import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { openFormInNewWindow } from "@/lib/formUtils";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { Factory, Zap, BoxesIcon, TrendingUp, BarChart3, Settings } from "lucide-react";

export default function Manufacturing() {
  const [activeNav, setActiveNav] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const ordersMetadata = getFormMetadata("workOrders");
  
  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/work-orders"],
    retry: false
  });

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500", formId: null },
    { id: "orders", label: "Work Orders", icon: Factory, color: "text-green-500", formId: "workOrders" },
    { id: "production", label: "Production", icon: Zap, color: "text-yellow-500", formId: null },
    { id: "inventory", label: "Inventory", icon: BoxesIcon, color: "text-purple-500", formId: "inventory" },
    { id: "quality", label: "Quality", icon: TrendingUp, color: "text-pink-500", formId: null },
    { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500", formId: null },
  ];

  const handleIconClick = (formId: string | null) => {
    if (formId) {
      openFormInNewWindow(formId, `${formId.charAt(0).toUpperCase() + formId.slice(1)} Form`);
    } else {
      setActiveNav("overview");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Factory className="h-8 w-8" />Manufacturing</h1>
        <p className="text-muted-foreground text-sm">Manage production, work orders, and manufacturing operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleIconClick(item.formId)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
              !item.formId ? "hover:border-primary hover-elevate" : "hover:bg-primary/10 hover:border-primary hover-elevate"
            }`}
            data-testid={`button-icon-${item.id}`}
          >
            <item.icon className={`w-6 h-6 ${item.color}`} />
            <span className="text-sm font-medium text-center">{item.label}</span>
          </button>
        ))}
      </div>

      {activeNav === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">{orders.length}</p><p className="text-xs text-muted-foreground">Active Work Orders</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">87%</p><p className="text-xs text-muted-foreground">Capacity Utilization</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">2.1 days</p><p className="text-xs text-muted-foreground">Avg Lead Time</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">98.5%</p><p className="text-xs text-muted-foreground">Quality Rate</p></CardContent></Card>
        </div>
      )}

      {activeNav === "orders" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1">
              <CardTitle>Work Orders</CardTitle>
              <Button onClick={() => openFormInNewWindow("workOrders", "Work Orders Form")} data-testid="button-add-orders">
                + Add New
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSearchWithMetadata
                formMetadata={ordersMetadata}
                value={searchQuery}
                onChange={setSearchQuery}
                data={orders}
                onFilter={setFilteredOrders}
              />
              <div className="space-y-2">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order: any, idx: number) => (
                    <Card key={order.id || idx} className="hover-elevate cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{order.number || 'WO-001'}</p>
                            <p className="text-sm text-muted-foreground">{order.product || 'Product'} • {order.quantity || 0} units</p>
                          </div>
                          <Badge>{order.status || 'Pending'}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No work orders found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "production" && (
        <Card><CardHeader><CardTitle>Production Planning</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Plan and schedule production runs</p></CardContent></Card>
      )}

      {activeNav === "inventory" && (
        <Card><CardHeader><CardTitle>Inventory</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage raw materials and finished goods</p></CardContent></Card>
      )}

      {activeNav === "quality" && (
        <Card><CardHeader><CardTitle>Quality Control</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Monitor product quality and compliance</p></CardContent></Card>
      )}

      {activeNav === "settings" && (
        <Card><CardHeader><CardTitle>Manufacturing Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure manufacturing parameters</p></CardContent></Card>
      )}
    </div>
  );
}
