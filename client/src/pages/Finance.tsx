import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { IconNavigation } from "@/components/IconNavigation";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { GLEntryForm } from "@/components/forms/GLEntryForm";
import { InvoiceEntryForm } from "@/components/forms/InvoiceEntryForm";
import { ExpenseEntryForm } from "@/components/forms/ExpenseEntryForm";
import { BudgetEntryForm } from "@/components/forms/BudgetEntryForm";
import { DollarSign, TrendingUp, BarChart3, FileText, PieChart, Settings, Zap, Users, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function Finance() {
  const [activeNav, setActiveNav] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const invoicesMetadata = getFormMetadata("invoices");
  
  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/invoices"],
    retry: false
  });

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "invoices", label: "Invoices", icon: FileText, color: "text-green-500" },
    { id: "expenses", label: "Expenses", icon: DollarSign, color: "text-orange-500" },
    { id: "budgets", label: "Budgets", icon: PieChart, color: "text-purple-500" },
    { id: "reports", label: "Reports", icon: TrendingUp, color: "text-pink-500" },
    { id: "payments", label: "Payments", icon: CreditCard, color: "text-cyan-500" },
    { id: "ledger", label: "General Ledger", icon: Zap, color: "text-indigo-500" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><DollarSign className="w-8 h-8" />Finance & Accounting</h1>
        <p className="text-muted-foreground text-sm">Manage invoices, expenses, budgets, and financial reporting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">$856K</p><p className="text-xs text-muted-foreground">Monthly Revenue</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">$234K</p><p className="text-xs text-muted-foreground">Monthly Expenses</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">$622K</p><p className="text-xs text-muted-foreground">Net Income</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">72.7%</p><p className="text-xs text-muted-foreground">Gross Margin</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {navItems.map((item) => (
          <Link key={item.id} to={item.id === "overview" ? "/finance" : `/finance/${item.id}`}>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary hover-elevate cursor-pointer transition-all">
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-sm font-medium text-center">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {activeNav === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle className="text-base">Income Statement</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Revenue: $856K</p><p className="text-sm">Expenses: $234K</p><p className="text-sm font-semibold">Net Income: $622K</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Balance Sheet</CardTitle></CardHeader><CardContent><div className="space-y-2"><p className="text-sm">Assets: $2.4M</p><p className="text-sm">Liabilities: $1.2M</p><p className="text-sm font-semibold">Equity: $1.2M</p></div></CardContent></Card>
        </div>
      )}

      {activeNav === "invoices" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1">
              <CardTitle>Invoices</CardTitle>
              <SmartAddButton formMetadata={invoicesMetadata} onClick={() => {}} />
            </CardHeader>
            <CardContent className="space-y-4">
              <FormSearchWithMetadata
                formMetadata={invoicesMetadata}
                value={searchQuery}
                onChange={setSearchQuery}
                data={invoices}
                onFilter={setFilteredInvoices}
              />
              <div className="space-y-2">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv: any, idx: number) => (
                    <Card key={inv.id || idx} className="hover-elevate cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{inv.invoiceNumber || `Invoice ${idx + 1}`}</p>
                            <p className="text-sm text-muted-foreground">{inv.customerId || 'Customer'}</p>
                          </div>
                          <Badge>${Number(inv.amount || 0).toLocaleString()}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No invoices found</p>
                )}
              </div>
            </CardContent>
          </Card>
          <InvoiceEntryForm />
        </div>
      )}

      {activeNav === "expenses" && <div className="space-y-4"><ExpenseEntryForm /></div>}

      {activeNav === "budgets" && <div className="space-y-4"><BudgetEntryForm /></div>}

      {activeNav === "reports" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Financial Reports</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Access P&L, Balance Sheet, Cash Flow, and more</p><Button size="sm" className="mt-4">+ Generate Report</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "payments" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Payment Processing</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Pending: 12 | Processed: 234 | Failed: 2</p><Button size="sm" className="mt-4">+ Process Payment</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "ledger" && <div className="space-y-4"><GLEntryForm /></div>}

      {activeNav === "settings" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Finance Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure accounting policies and reporting standards</p></CardContent></Card>
        </div>
      )}
    </div>
  );
}
