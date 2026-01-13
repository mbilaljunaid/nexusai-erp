import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Factory, Zap, BoxesIcon, TrendingUp, BarChart3, Settings } from "lucide-react";
import ManufacturingDashboard from "./manufacturing/ManufacturingDashboard";
import WorkOrderList from "./manufacturing/WorkOrderList";

export default function Manufacturing() {
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "orders", label: "Work Orders", icon: Factory, color: "text-green-500" },
    { id: "production", label: "Production", icon: Zap, color: "text-yellow-500" },
    { id: "inventory", label: "Inventory", icon: BoxesIcon, color: "text-purple-500" },
    { id: "quality", label: "Quality", icon: TrendingUp, color: "text-pink-500" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${activeNav === item.id
                ? "bg-primary/10 border-primary shadow-sm"
                : "hover:bg-muted hover:border-primary/50"
              }`}
            data-testid={`button-icon-${item.id}`}
          >
            <item.icon className={`w-6 h-6 ${item.color}`} />
            <span className="text-sm font-medium text-center">{item.label}</span>
          </button>
        ))}
      </div>

      {activeNav === "overview" && <ManufacturingDashboard />}

      {activeNav === "orders" && <WorkOrderList />}

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
