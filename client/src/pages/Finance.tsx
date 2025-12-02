import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { IconNavigation } from "@/components/IconNavigation";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { InvoiceEntryForm } from "@/components/forms/InvoiceEntryForm";
import { ExpenseEntryForm } from "@/components/forms/ExpenseEntryForm";
import { BudgetEntryForm } from "@/components/forms/BudgetEntryForm";
import { BudgetToVarianceReportForm } from "@/components/forms/BudgetToVarianceReportForm";
import { InvoiceToPaymentForm } from "@/components/forms/InvoiceToPaymentForm";
import { ExpenseToGLForm } from "@/components/forms/ExpenseToGLForm";
import { DollarSign, TrendingUp, BarChart3, FileText, PieChart, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function Finance() {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const invoicesMetadata = getFormMetadata("invoices");
  
  const { data: invoices = [] } = useQuery<any[]>({
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
          {selectedInvoice ? (
            <InvoiceToPaymentForm invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-1">
                  <CardTitle>Invoices</CardTitle>
                  <SmartAddButton formMetadata={invoicesMetadata} onClick={() => setShowInvoiceForm(true)} />
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
                    {[
                      { id: "1", invoiceNumber: "INV-2024-001", customer: "Acme Corp", amount: 45000, dueDate: "2024-12-15", status: "Open" },
                      { id: "2", invoiceNumber: "INV-2024-002", customer: "Tech Solutions", amount: 32500, dueDate: "2024-12-10", status: "Open" },
                    ].map((inv: any) => (
                      <Card key={inv.id} className="hover-elevate">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{inv.invoiceNumber}</p>
                              <p className="text-sm text-muted-foreground">{inv.customer} • Due: {inv.dueDate}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge>${inv.amount.toLocaleString()}</Badge>
                              {inv.status === "Open" && (
                                <Button size="sm" onClick={() => setSelectedInvoice(inv)} data-testid={`button-payment-${inv.id}`}>
                                  Record Payment
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <InvoiceEntryForm />
            </>
          )}
        </div>
      )}

      {activeNav === "expenses" && (
        <div className="space-y-4">
          {selectedExpense ? (
            <ExpenseToGLForm expense={selectedExpense} onClose={() => setSelectedExpense(null)} />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Post Expense to GL</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Select an expense to post to general ledger</p>
                  <div className="space-y-2">
                    {[
                      { id: "1", expenseId: "EXP-001", description: "Conference Travel", amount: 3500, category: "Travel", date: "2024-12-01", status: "Approved" },
                      { id: "2", expenseId: "EXP-002", description: "Office Supplies", amount: 850, category: "Office Supplies", date: "2024-11-28", status: "Approved" },
                      { id: "3", expenseId: "EXP-003", description: "Cloud Services", amount: 2400, category: "Technology", date: "2024-11-25", status: "Approved" },
                    ].map((exp: any) => (
                      <div key={exp.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{exp.expenseId}</p>
                          <p className="text-sm text-muted-foreground">{exp.description} • ${exp.amount.toLocaleString()}</p>
                        </div>
                        <Button size="sm" onClick={() => setSelectedExpense(exp)} data-testid={`button-gl-expense-${exp.id}`}>
                          Post to GL
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <ExpenseEntryForm />
            </>
          )}
        </div>
      )}

      {activeNav === "budgets" && (
        <div className="space-y-4">
          {selectedBudget ? (
            <BudgetToVarianceReportForm budget={selectedBudget} onClose={() => setSelectedBudget(null)} />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Budget Variance Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Select a budget to generate variance report</p>
                  <div className="space-y-2">
                    {[
                      { id: "1", name: "Engineering", amount: 500000, spent: 480000, department: "Engineering", period: "Q4 2024" },
                      { id: "2", name: "Marketing", amount: 200000, spent: 215000, department: "Marketing", period: "Q4 2024" },
                      { id: "3", name: "Operations", amount: 350000, spent: 340000, department: "Operations", period: "Q4 2024" },
                    ].map((budget: any) => {
                      const variance = budget.spent - budget.amount;
                      return (
                        <div key={budget.id} className="p-3 border rounded-lg hover-elevate">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">{budget.name}</p>
                            <Badge variant={variance > 0 ? "destructive" : "default"}>
                              {variance > 0 ? "+" : ""}{variance.toLocaleString()}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>Budget: ${budget.amount.toLocaleString()}</span>
                            <span>Spent: ${budget.spent.toLocaleString()}</span>
                          </div>
                          <Button size="sm" onClick={() => setSelectedBudget(budget)} className="w-full" data-testid={`button-variance-${budget.id}`}>
                            Generate Report
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              <BudgetEntryForm />
            </>
          )}
        </div>
      )}

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
    </div>
  );
}
