import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Plus, Package, Users, BarChart3, FileText, Percent, Calendar, LayoutList, TrendingUp, Warehouse } from "lucide-react";

export default function ERP() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><Warehouse className="w-8 h-8" />ERP & Finance</h1>
        <p className="text-muted-foreground text-sm">Manage financials, procurement, inventory, and assets</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="gl" data-testid="tab-gl">GL</TabsTrigger>
          <TabsTrigger value="ap" data-testid="tab-ap">AP</TabsTrigger>
          <TabsTrigger value="ar" data-testid="tab-ar">AR</TabsTrigger>
          <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/general-ledger">
              <Card className="cursor-pointer hover-elevate" data-testid="card-total-assets">
                <CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold font-mono">$2.4M</p><p className="text-xs text-muted-foreground">Total Assets</p></div></CardContent>
              </Card>
            </Link>
            <Link href="/financial-reports">
              <Card className="cursor-pointer hover-elevate" data-testid="card-monthly-revenue">
                <CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold font-mono">$856K</p><p className="text-xs text-muted-foreground">Monthly Revenue</p></div></CardContent>
              </Card>
            </Link>
            <Link href="/purchase-orders">
              <Card className="cursor-pointer hover-elevate" data-testid="card-outstanding-ap">
                <CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold font-mono">$342K</p><p className="text-xs text-muted-foreground">Outstanding AP</p></div></CardContent>
              </Card>
            </Link>
            <Link href="/inventory">
              <Card className="cursor-pointer hover-elevate" data-testid="card-inventory-value">
                <CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold font-mono">$523K</p><p className="text-xs text-muted-foreground">Inventory Value</p></div></CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="gl" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-base">Chart of Accounts</CardTitle></CardHeader><CardContent><div className="space-y-2"><Badge>Assets: 150</Badge><Badge variant="secondary">Liabilities: 89</Badge><Badge variant="secondary">Equity: 45</Badge></div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Recent Transactions</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Daily transaction volume: 450+</p></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="ap" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Invoices</p><p className="text-2xl font-bold">1,234</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Outstanding</p><p className="text-2xl font-bold">$342K</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Avg Days</p><p className="text-2xl font-bold">28</p></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="ar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Invoices</p><p className="text-2xl font-bold">892</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Outstanding</p><p className="text-2xl font-bold">$512K</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Collection Rate</p><p className="text-2xl font-bold text-green-600">94%</p></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Items</p><p className="text-2xl font-bold">2,456</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Inventory Value</p><p className="text-2xl font-bold">$523K</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Turnover</p><p className="text-2xl font-bold">4.2x</p></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
