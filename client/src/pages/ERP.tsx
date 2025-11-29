import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModuleNav } from "@/components/ModuleNav";
import { IconNavigation } from "@/components/IconNavigation";
import { DollarSign, Plus, Package, Users, BarChart3, FileText, Percent, Calendar, LayoutList, TrendingUp, Warehouse } from "lucide-react";

export default function ERP() {
  const [activeNav, setActiveNav] = useState("overview");
  
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutList, color: "text-blue-500" },
    { id: "gl", label: "General Ledger", icon: BarChart3, color: "text-green-500" },
    { id: "ap", label: "Payable", icon: FileText, color: "text-orange-500" },
    { id: "ar", label: "Receivable", icon: TrendingUp, color: "text-purple-500" },
    { id: "inventory", label: "Inventory", icon: Warehouse, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">ERP & Finance</h1>
        <p className="text-muted-foreground text-sm">Manage financials, procurement, inventory, and assets</p>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/general-ledger">
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold font-mono">$2.4M</p>
                    <p className="text-xs text-muted-foreground">Total Assets</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/financial-reports">
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold font-mono">$856K</p>
                    <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/purchase-orders">
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold font-mono">$342K</p>
                    <p className="text-xs text-muted-foreground">Outstanding AP</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/inventory">
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold font-mono">$125K</p>
                    <p className="text-xs text-muted-foreground">Inventory Value</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <ModuleNav
            title="ERP Modules"
            items={[
              { title: "Vendor Invoices", icon: FileText, href: "/vendor-invoice-entry" },
              { title: "Bank Reconciliation", icon: DollarSign, href: "/bank-reconciliation" },
              { title: "Payment Scheduling", icon: Calendar, href: "/payment-scheduling" },
              { title: "Aging Report", icon: Percent, href: "/aging-report" },
              { title: "General Ledger", icon: DollarSign, href: "/general-ledger" },
              { title: "Inventory", icon: Package, href: "/inventory" },
            ]}
          />
        </div>
      )}

      {activeNav === "gl" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">General Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">GL module coming soon. Manage chart of accounts, create and post journals, and run financial reports.</p>
          </CardContent>
        </Card>
      )}

      {activeNav === "ap" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accounts Payable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">AP module coming soon. Manage vendor invoices, schedule payments, and reconcile with POs.</p>
          </CardContent>
        </Card>
      )}

      {activeNav === "ar" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accounts Receivable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">AR module coming soon. Manage customer invoices, track collections, and analyze aging reports.</p>
          </CardContent>
        </Card>
      )}

      {activeNav === "inventory" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventory Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Inventory module coming soon. Track stock levels, manage valuation methods, and optimize reorder points.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
