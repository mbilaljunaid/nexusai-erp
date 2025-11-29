import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Check, AlertCircle, DollarSign, Calendar } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface APInvoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  poId: string;
  amount: string;
  matchStatus: "unmatched" | "2way" | "3way";
  status: "draft" | "submitted" | "matched" | "approved" | "paid";
  createdAt: string;
}

export default function VendorInvoiceEntry() {
  const [newInvoice, setNewInvoice] = useState({ invoiceNumber: "", vendorId: "", poId: "", amount: "" });

  const { data: invoices = [] } = useQuery<APInvoice[]>({
    queryKey: ["/api/ap-invoices"],
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<APInvoice>) => apiRequest("POST", "/api/ap-invoices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ap-invoices"] });
      setNewInvoice({ invoiceNumber: "", vendorId: "", poId: "", amount: "" });
    },
  });

  const matchMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/ap-invoices/${id}/match`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/ap-invoices"] }),
  });

  const stats = {
    total: invoices.length,
    unmatched: invoices.filter(i => i.matchStatus === "unmatched").length,
    matched: invoices.filter(i => i.matchStatus === "3way").length,
    totalAmount: invoices.reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0),
  };

  const getMatchBadgeColor = (status: string) => {
    if (status === "3way") return "default";
    if (status === "2way") return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">AP Invoice Entry</h1>
          <p className="text-muted-foreground text-sm">Match vendor invoices to POs and receipts (3-way matching)</p>
        </div>
        <Button onClick={() => createMutation.mutate(newInvoice)}>
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.unmatched}</p>
                <p className="text-xs text-muted-foreground">Unmatched</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.matched}</p>
                <p className="text-xs text-muted-foreground">3-Way Matched</p>
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

      <Card>
        <CardHeader>
          <CardTitle>New Vendor Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Invoice #" value={newInvoice.invoiceNumber} onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })} />
            <Input placeholder="Vendor ID" value={newInvoice.vendorId} onChange={(e) => setNewInvoice({ ...newInvoice, vendorId: e.target.value })} />
            <Input placeholder="PO #" value={newInvoice.poId} onChange={(e) => setNewInvoice({ ...newInvoice, poId: e.target.value })} />
            <Input type="number" placeholder="Amount" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })} />
          </div>
          <Button className="w-full" onClick={() => createMutation.mutate(newInvoice)}>
            Submit for Matching
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="unmatched" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unmatched">Unmatched ({stats.unmatched})</TabsTrigger>
          <TabsTrigger value="matched">3-Way Matched ({stats.matched})</TabsTrigger>
        </TabsList>

        {["unmatched", "matched"].map((matchStatus) => (
          <TabsContent key={matchStatus} value={matchStatus} className="space-y-4">
            {invoices
              .filter((inv) => (matchStatus === "unmatched" ? inv.matchStatus === "unmatched" : inv.matchStatus === "3way"))
              .map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{invoice.invoiceNumber}</p>
                          <Badge variant={getMatchBadgeColor(invoice.matchStatus)}>
                            {invoice.matchStatus === "3way" ? "3-Way Matched" : "Unmatched"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Vendor: {invoice.vendorId} | PO: {invoice.poId}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-semibold font-mono">${parseFloat(invoice.amount).toLocaleString()}</p>
                        {invoice.matchStatus === "unmatched" && (
                          <Button size="sm" onClick={() => matchMutation.mutate(invoice.id)}>
                            <Check className="w-4 h-4 mr-1" />
                            Match
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
