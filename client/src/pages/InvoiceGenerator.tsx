import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Download, Send, CheckCircle2, Clock, AlertCircle, DollarSign, Calendar } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

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
          <h1 className="text-3xl font-semibold">Invoice Generator</h1>
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
              <AlertCircle className="h-5 w-5 text-orange-500" />
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

      <Tabs defaultValue="draft" className="space-y-4">
        <TabsList>
          <TabsTrigger value="draft" data-testid="tab-draft">Draft</TabsTrigger>
          <TabsTrigger value="sent" data-testid="tab-sent">Sent</TabsTrigger>
          <TabsTrigger value="paid" data-testid="tab-paid">Paid</TabsTrigger>
        </TabsList>

        {["draft", "sent", "paid"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {invoices
              .filter((inv) => (status === "draft" ? inv.status === "draft" : status === "sent" ? inv.status === "sent" : inv.status === "paid"))
              .map((invoice) => (
                <Card key={invoice.id} className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">Customer: {invoice.customerId}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge>{invoice.status.toUpperCase()}</Badge>
                          <Badge variant="outline">${parseFloat(invoice.amount).toLocaleString()}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                        {invoice.status === "draft" && (
                          <Button size="sm" onClick={() => sendMutation.mutate(invoice.id)}>
                            <Send className="w-4 h-4 mr-1" />
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {invoices.filter((inv) => (status === "draft" ? inv.status === "draft" : status === "sent" ? inv.status === "sent" : inv.status === "paid")).length === 0 && (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">No invoices in {status} status</CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
