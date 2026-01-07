import { useState } from "react";
import { InvoiceList } from "@/features/finance/InvoiceList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { openFormInNewWindow } from "@/lib/formUtils";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { DollarSign, TrendingUp, BarChart3, FileText, PieChart, CreditCard } from "lucide-react";

export default function Finance() {
  const [activeNav, setActiveNav] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const invoicesMetadata = getFormMetadata("invoices");

  const { data: invoices = [] } = useQuery<any[]>({
    queryKey: ["/api/invoices"],
    retry: false
  });

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500", formId: null },
    { id: "invoices", label: "Invoices", icon: FileText, color: "text-green-500", formId: "invoices" },
    { id: "expenses", label: "Expenses", icon: DollarSign, color: "text-orange-500", formId: "expenses" },
    { id: "budgets", label: "Budgets", icon: PieChart, color: "text-purple-500", formId: "budgets" },
    { id: "reports", label: "Reports", icon: TrendingUp, color: "text-pink-500", formId: null },
    { id: "payments", label: "Payments", icon: CreditCard, color: "text-cyan-500", formId: "payments" },
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
        <h1 className="text-3xl font-bold flex items-center gap-2"><DollarSign className="h-8 w-8" />Finance & Accounting</h1>
        <p className="text-muted-foreground text-sm">Manage invoices, expenses, budgets, and financial reports</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleIconClick(item.formId)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${!item.formId ? "hover:border-primary hover-elevate" : "hover:bg-primary/10 hover:border-primary hover-elevate"
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
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">${(invoices.length * 50000).toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Revenue</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">{invoices.length}</p><p className="text-xs text-muted-foreground">Total Invoices</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">92%</p><p className="text-xs text-muted-foreground">Collection Rate</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-2xl font-semibold">$125K</p><p className="text-xs text-muted-foreground">Monthly Budget</p></CardContent></Card>
        </div>
      )}

      {activeNav === "invoices" && (
        <InvoiceList />
      )}

      {activeNav === "expenses" && (
        <Card><CardHeader><CardTitle>Expenses</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Track and manage business expenses</p></CardContent></Card>
      )}

      {activeNav === "budgets" && (
        <Card><CardHeader><CardTitle>Budgets</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Create and monitor departmental budgets</p></CardContent></Card>
      )}

      {activeNav === "reports" && (
        <Card><CardHeader><CardTitle>Financial Reports</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Generate financial reports and analysis</p></CardContent></Card>
      )}

      {activeNav === "payments" && (
        <Card><CardHeader><CardTitle>Payments</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Manage customer and vendor payments</p></CardContent></Card>
      )}
    </div>
  );
}
