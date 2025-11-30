import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { GLEntryForm } from "@/components/forms/GLEntryForm";
import { PurchaseOrderForm } from "@/components/forms/PurchaseOrderForm";
import AdjustmentEntryForm from "@/components/forms/AdjustmentEntryForm";
import VendorEntryForm from "@/components/forms/VendorEntryForm";
import { InvoiceEntryForm } from "@/components/forms/InvoiceEntryForm";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DollarSign, Package, BarChart3, FileText, Warehouse, TrendingUp, Settings, ShoppingCart, Zap, Users } from "lucide-react";
import { Link } from "wouter";

export default function ERP() {
  const [activeNav, setActiveNav] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: glEntries = [] } = useQuery({ queryKey: ["/api/ledger"], retry: false });
  const { data: invoices = [] } = useQuery({ queryKey: ["/api/invoices"], retry: false });
  const { data: pos = [] } = useQuery({ queryKey: ["/api/purchase-orders"], retry: false });
  const { data: vendors = [] } = useQuery({ queryKey: ["/api/vendors"], retry: false });

  const filteredInvoices = ((invoices as any[]) || []).filter((inv: any) => {
    const query = searchQuery.toLowerCase();
    return (
      (inv.invoiceNumber || "").toLowerCase().includes(query) ||
      (inv.customerId || "").toLowerCase().includes(query) ||
      (inv.amount || "").toString().includes(query)
    );
  });

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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {navItems.map((item) => {
          let routePath = item.id === "overview" ? "/erp" : `/erp/${item.id}`;
          return (
            <Link key={item.id} to={routePath}>
              <div className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary hover-elevate cursor-pointer transition-all">
                <item.icon className={`w-6 h-6 ${item.color}`} />
                <span className="text-sm font-medium text-center">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {activeNav === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle className="text-base">Financial Summary</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Assets: $2.4M</p><p className="text-sm">Liabilities: $1.2M</p><p className="text-sm">Equity: $1.2M</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">KPIs</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Gross Margin: 42%</p><p className="text-sm">Current Ratio: 1.8x</p><p className="text-sm">Inventory Turnover: 4.2x</p></div></CardContent></Card>
        </div>
      )}

      {activeNav === "gl" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search ledger entries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
            <Button>+ New Entry</Button>
          </div>
          <div className="space-y-2">
            {((glEntries || []) as any).filter((e: any) => (e.account || "").toLowerCase().includes(searchQuery.toLowerCase())).map((e: any, idx: number) => (
              <Card key={idx} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">{e.account}</p><p className="text-sm text-muted-foreground">{e.description}</p></div><Badge>${(e.amount || 0).toLocaleString()}</Badge></div></CardContent></Card>
            ))}
          </div>
          <GLEntryForm />
        </div>
      )}

      {activeNav === "ap" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by invoice number, customer, or amount..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" data-testid="input-search-invoices" /></div>
            <Button data-testid="button-add-invoice">+ Add Invoice</Button>
          </div>
          <div className="space-y-2">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((i: any, idx: number) => (
                <Card key={i.id || idx} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">{i.invoiceNumber}</p><p className="text-sm text-muted-foreground">{i.customerId}</p></div><Badge>${Number(i.amount || 0).toLocaleString()}</Badge></div></CardContent></Card>
              ))
            ) : (
              <Card><CardContent className="p-4"><p className="text-muted-foreground">No invoices found</p></CardContent></Card>
            )}
          </div>
          <InvoiceEntryForm />
        </div>
      )}

      {activeNav === "ar" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search receivables..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
            <Button>+ New Invoice</Button>
          </div>
          <div className="space-y-2">
            {((invoices || []) as any).filter((i: any) => (i.customerId || "").toLowerCase().includes(searchQuery.toLowerCase())).map((i: any, idx: number) => (
              <Card key={idx} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">Invoice {i.id}</p><p className="text-sm text-muted-foreground">{i.customerId}</p></div><Badge>${(i.amount || 0).toLocaleString()}</Badge></div></CardContent></Card>
            ))}
          </div>
          <InvoiceEntryForm />
        </div>
      )}

      {activeNav === "inventory" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search inventory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
            <Button>+ Adjust Stock</Button>
          </div>
          <div className="space-y-2">
            {[{id: 1, name: "Widget A", qty: 145, value: 14500}, {id: 2, name: "Widget B", qty: 89, value: 8900}].filter((i: any) => i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((i: any) => (
              <Card key={i.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">{i.name}</p><p className="text-sm text-muted-foreground">Qty: {i.qty}</p></div><Badge>${i.value.toLocaleString()}</Badge></div></CardContent></Card>
            ))}
          </div>
          <AdjustmentEntryForm />
        </div>
      )}

      {activeNav === "po" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search POs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
            <Button>+ New PO</Button>
          </div>
          <div className="space-y-2">
            {((pos || []) as any).filter((p: any) => (p.id || "").toString().toLowerCase().includes(searchQuery.toLowerCase())).map((p: any, idx: number) => (
              <Card key={idx} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">PO {p.id}</p><p className="text-sm text-muted-foreground">{p.vendor}</p></div><Badge>${(p.amount || 0).toLocaleString()}</Badge></div></CardContent></Card>
            ))}
          </div>
          <PurchaseOrderForm />
        </div>
      )}

      {activeNav === "quality" && <div className="space-y-4"><AdjustmentEntryForm /></div>}

      {activeNav === "suppliers" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search suppliers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
            <Button>+ New Supplier</Button>
          </div>
          <div className="space-y-2">
            {((vendors || []) as any).filter((v: any) => (v.name || "").toLowerCase().includes(searchQuery.toLowerCase())).map((v: any, idx: number) => (
              <Card key={idx} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between"><div><p className="font-semibold">{v.name}</p><p className="text-sm text-muted-foreground">{v.location}</p></div><Badge>{v.rating}/5</Badge></div></CardContent></Card>
            ))}
          </div>
          <VendorEntryForm />
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
