import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { GLEntryForm } from "@/components/forms/GLEntryForm";
import { PurchaseOrderForm } from "@/components/forms/PurchaseOrderForm";
import { DollarSign, Package, BarChart3, FileText, Warehouse, TrendingUp, Settings, ShoppingCart, Zap, Users } from "lucide-react";

export default function ERP() {
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "gl", label: "General Ledger", icon: DollarSign, color: "text-green-500" },
    { id: "ap", label: "Accounts Payable", icon: FileText, color: "text-orange-500" },
    { id: "ar", label: "Accounts Receivable", icon: TrendingUp, color: "text-purple-500" },
    { id: "inventory", label: "Inventory", icon: Warehouse, color: "text-yellow-500" },
    { id: "po", label: "Purchase Orders", icon: ShoppingCart, color: "text-pink-500" },
    { id: "quality", label: "Quality Control", icon: Zap, color: "text-cyan-500" },
    { id: "suppliers", label: "Suppliers", icon: Users, color: "text-indigo-500" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><Warehouse className="w-8 h-8" />ERP & Finance</h1>
        <p className="text-muted-foreground text-sm">Manage financials, inventory, procurement, and supply chain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">$2.4M</p><p className="text-xs text-muted-foreground">Total Assets</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">$856K</p><p className="text-xs text-muted-foreground">Monthly Revenue</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">$523K</p><p className="text-xs text-muted-foreground">Inventory Value</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">342</p><p className="text-xs text-muted-foreground">POs This Month</p></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle className="text-base">Financial Summary</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Assets: $2.4M</p><p className="text-sm">Liabilities: $1.2M</p><p className="text-sm">Equity: $1.2M</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">KPIs</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Gross Margin: 42%</p><p className="text-sm">Current Ratio: 1.8x</p><p className="text-sm">Inventory Turnover: 4.2x</p></div></CardContent></Card>
        </div>
      )}

      {activeNav === "gl" && <div className="space-y-4"><GLEntryForm /></div>}

      {activeNav === "ap" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Accounts Payable</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Outstanding: $342K | 1,234 invoices</p><Button size="sm" className="mt-4">+ Record Invoice</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "ar" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Accounts Receivable</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Outstanding: $512K | 892 invoices | 94% collection rate</p><Button size="sm" className="mt-4">+ Record Payment</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "inventory" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Inventory Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">2,456 items | Value: $523K | Turnover: 4.2x</p><Button size="sm" className="mt-4">+ Adjust Stock</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "po" && <div className="space-y-4"><PurchaseOrderForm /></div>}

      {activeNav === "quality" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Quality Control</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Defect rate: 0.8% | Approved: 98.2%</p><Button size="sm" className="mt-4">+ Quality Check</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "suppliers" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Supplier Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">128 active suppliers | Avg rating: 4.2/5</p><Button size="sm" className="mt-4">+ New Supplier</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "settings" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>ERP Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure financials, inventory, and supply chain</p></CardContent></Card>
        </div>
      )}
    </div>
  );
}
