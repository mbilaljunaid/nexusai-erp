import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { openFormInNewWindow } from "@/lib/formUtils";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { DollarSign, TrendingUp, BarChart3, FileText, PieChart, CreditCard, BookOpen, ArrowRightLeft, RefreshCw, Shield, Archive, Settings, Building2 } from "lucide-react";
import { GLMetrics } from "./gl/components/GLMetrics";

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
    { id: "gl", label: "General Ledger", icon: BookOpen, color: "text-indigo-500", formId: "gl_journals" },
    { id: "reporting", label: "Reporting", icon: BarChart3, color: "text-teal-500", formId: "gl_reports" },
    { id: "intercompany", label: "Intercompany", icon: ArrowRightLeft, color: "text-pink-500", formId: "gl_intercompany" },
    { id: "revaluation", label: "Revaluation", icon: RefreshCw, color: "text-amber-500", formId: "gl_revaluation" },
    { id: "budgets", label: "Budget Manager", icon: PieChart, color: "text-purple-500", formId: "gl_budgets" },
    { id: "cvr", label: "CVR Manager", icon: Shield, color: "text-red-500", formId: "gl_cvr" },
    { id: "period_close", label: "Period Close", icon: Archive, color: "text-emerald-500", formId: "gl_period_close" },
    { id: "ledger_setup", label: "Ledger Setup", icon: Settings, color: "text-slate-500", formId: "gl_ledger_setup" },
    { id: "legal_entities", label: "Legal Entities", icon: Building2, color: "text-orange-500", formId: "gl_legal_entities" },
    { id: "invoices", label: "Invoices", icon: FileText, color: "text-green-500", formId: "invoices" },
    { id: "expenses", label: "Expenses", icon: DollarSign, color: "text-orange-500", formId: "expenses" },
    { id: "payments", label: "Payments", icon: CreditCard, color: "text-cyan-500", formId: "payments" },
  ];

  const [, setLocation] = useLocation();

  const handleIconClick = (formId: string | null) => {
    if (formId === "gl_journals") {
      setLocation("/gl/journals");
      return;
    }
    if (formId === "gl_reports") {
      setLocation("/gl/reports");
      return;
    }
    if (formId === "gl_intercompany") {
      setLocation("/gl/intercompany");
      return;
    }
    if (formId === "gl_revaluation") {
      setLocation("/gl/revaluation");
      return;
    }
    if (formId === "gl_budgets") {
      setLocation("/gl/budgets");
      return;
    }
    if (formId === "gl_cvr") {
      setLocation("/gl/cvr");
      return;
    }
    if (formId === "gl_period_close") {
      setLocation("/gl/period-close");
      return;
    }
    if (formId === "gl_ledger_setup") {
      setLocation("/gl/ledger-setup");
      return;
    }
    if (formId === "gl_legal_entities") {
      setLocation("/gl/legal-entity-setup");
      return;
    }

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
        <div className="space-y-6">
          <GLMetrics />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-indigo-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield className="h-32 w-32" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Compliance & Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <p className="text-sm text-indigo-100/70">NexusAI GL is running with Oracle-grade Segment Value Security (SVS) and enhanced audit trails enabled.</p>
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-none text-white text-xs" onClick={() => setLocation("/gl/audit-logs")}>
                  View Audit Trail
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Archive className="h-32 w-32" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Period Close Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <p className="text-sm text-slate-400">Successfully close fiscal periods with automated diagnostics and exception reporting.</p>
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-none text-white text-xs" onClick={() => setLocation("/gl/period-close")}>
                  Go to Close Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeNav === "invoices" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-1">
              <CardTitle>Invoices</CardTitle>
              <Button onClick={() => openFormInNewWindow("invoices", "Invoices Form")} data-testid="button-add-invoices">
                + Add New
              </Button>
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
                            <p className="font-semibold">{inv.number || 'INV-001'}</p>
                            <p className="text-sm text-muted-foreground">{inv.customer || 'Customer'} • ${(inv.amount || 50000).toLocaleString()}</p>
                          </div>
                          <Badge>{inv.status || 'Pending'}</Badge>
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
        </div>
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
