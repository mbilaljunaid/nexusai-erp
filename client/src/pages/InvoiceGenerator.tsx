import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { FileText, Plus, Download, Send, CheckCircle2, Clock, AlertCircle, DollarSign, BarChart3 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  amount: string;
  dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue";
  items: { description: string; quantity: number; unitPrice: string }[];
  createdAt: string;
}

export default function InvoiceGenerator() {
  const [activeNav, setActiveNav] = useState("list");
  
  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Invoice>) => apiRequest("POST", "/api/invoices", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/invoices"] }),
  });

  const sendMutation = useMutation({
    mutationFn: (invoiceId: string) => apiRequest("POST", `/api/invoices/${invoiceId}/send`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/invoices"] }),
  });

  const navItems = [
    { id: "list", label: "Invoices", icon: FileText, color: "text-blue-500" },
    { id: "templates", label: "Templates", icon: Download, color: "text-purple-500" },
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-green-500" },
    { id: "settings", label: "Settings", icon: DollarSign, color: "text-orange-500" },
  ];

  const stats = {
    total: invoices.length,
    sent: invoices.filter(i => i.status === "sent" || i.status === "paid").length,
    overdue: invoices.filter(i => i.status === "overdue").length,
    totalAmount: invoices.reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2"><FileText className="h-8 w-8" />Invoice Generator</h1>
          <p className="text-muted-foreground text-sm">Create, send, and track customer invoices</p>
        </div>
        <Button onClick={() => createMutation.mutate({ invoiceNumber: `INV-${Date.now()}`, amount: "0" })}>
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/invoice-list">
          <Card className="cursor-pointer hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Send className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold font-mono">${(stats.totalAmount / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Total Amount</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "list" && (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover-elevate cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">Due: {invoice.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">${invoice.amount}</p>
                    <Badge variant={invoice.status === "paid" ? "default" : invoice.status === "overdue" ? "destructive" : "secondary"}>{invoice.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeNav === "templates" && (
        <Card><CardHeader><CardTitle className="text-base">Invoice Templates</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Professional invoice templates</p></CardContent></Card>
      )}

      {activeNav === "analytics" && (
        <Card><CardHeader><CardTitle className="text-base">Invoice Analytics</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Revenue tracking and payment analysis</p></CardContent></Card>
      )}

      {activeNav === "settings" && (
        <Card><CardHeader><CardTitle className="text-base">Invoice Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure invoice numbering and payment terms</p></CardContent></Card>
      )}
    </div>
  );
}
