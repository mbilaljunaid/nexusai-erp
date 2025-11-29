import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModuleNav } from "@/components/ModuleNav";
import { DollarSign, Plus, Package, Users, BarChart3 } from "lucide-react";

export default function ERP() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">ERP & Finance</h1>
        <p className="text-muted-foreground text-sm">Manage financials, procurement, inventory, and assets</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="gl" data-testid="tab-gl">General Ledger</TabsTrigger>
          <TabsTrigger value="ap" data-testid="tab-ap">Accounts Payable</TabsTrigger>
          <TabsTrigger value="ar" data-testid="tab-ar">Accounts Receivable</TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "General Ledger", description: "Chart of accounts, journals, and consolidated reporting" },
                  { name: "Accounts Payable", description: "Vendor invoices, payments, and reconciliation" },
                  { name: "Accounts Receivable", description: "Customer invoices, collections, and aging" },
                  { name: "Fixed Assets", description: "Asset tracking, depreciation, and maintenance" },
                  { name: "Inventory Management", description: "Stock tracking, valuation, and movements" },
                  { name: "Multi-Entity", description: "Cross-company consolidation and eliminations" },
                ].map((module) => (
                  <Button key={module.name} variant="outline" className="h-auto flex flex-col items-start justify-start p-4">
                    <span className="font-medium">{module.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{module.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gl">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">GL module coming soon. Manage chart of accounts, create and post journals, and run financial reports.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ap">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Accounts Payable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">AP module coming soon. Manage vendor invoices, schedule payments, and reconcile with POs.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ar">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Accounts Receivable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">AR module coming soon. Manage customer invoices, track collections, and analyze aging reports.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Inventory module coming soon. Track stock levels, manage valuation methods, and optimize reorder points.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ModuleNav
        title="ERP Modules"
        items={[
          { title: "Invoices", icon: DollarSign, href: "/invoices" },
          { title: "Purchase Orders", icon: Package, href: "/purchase-orders" },
          { title: "Inventory", icon: Package, href: "/inventory" },
          { title: "Vendors", icon: Users, href: "/vendors" },
          { title: "General Ledger", icon: BarChart3, href: "/general-ledger" },
          { title: "Financial Reports", icon: BarChart3, href: "/financial-reports" },
        ]}
      />
    </div>
  );
}
