import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Copy, Send, CheckCircle2, FileText, DollarSign, Percent } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  discountPercent?: number;
}

interface Quote {
  id: string;
  opportunityId: string;
  lineItems: QuoteLineItem[];
  discountAmount: string;
  total: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  validUntil: string;
  createdAt: string;
}

export default function QuoteBuilder() {
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [draftLineItems, setDraftLineItems] = useState<QuoteLineItem[]>([
    { id: "1", description: "Product A", quantity: 1, unitPrice: "1000", discountPercent: 0 },
  ]);

  const { data: quotes = [] } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Quote>) => apiRequest("POST", "/api/quotes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      setDraftLineItems([{ id: "1", description: "", quantity: 1, unitPrice: "0" }]);
    },
  });

  const sendMutation = useMutation({
    mutationFn: (quoteId: string) => apiRequest("POST", `/api/quotes/${quoteId}/send`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/quotes"] }),
  });

  const calculateTotal = () => {
    const subtotal = draftLineItems.reduce((sum, item) => {
      const lineTotal = item.quantity * parseFloat(item.unitPrice || "0");
      const discount = lineTotal * ((item.discountPercent || 0) / 100);
      return sum + (lineTotal - discount);
    }, 0);
    return subtotal;
  };

  const stats = {
    total: quotes.length,
    sent: quotes.filter(q => q.status === "sent").length,
    accepted: quotes.filter(q => q.status === "accepted").length,
    totalValue: quotes.reduce((sum, q) => sum + parseFloat(q.total || "0"), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Quote Builder</h1>
          <p className="text-muted-foreground text-sm">Create and manage sales quotes with drag-drop pricing</p>
        </div>
        <Button onClick={() => createMutation.mutate({ lineItems: draftLineItems, total: calculateTotal().toString() })}>
          <Plus className="w-4 h-4 mr-2" />
          Create Quote
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Quotes</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-semibold">{stats.accepted}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover-elevate">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-semibold font-mono">${(stats.totalValue / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Quote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {draftLineItems.map((item, idx) => (
              <div key={item.id} className="flex gap-2 items-end">
                <Input placeholder="Description" value={item.description} onChange={(e) => {
                  const updated = [...draftLineItems];
                  updated[idx].description = e.target.value;
                  setDraftLineItems(updated);
                }} className="flex-1" />
                <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => {
                  const updated = [...draftLineItems];
                  updated[idx].quantity = parseInt(e.target.value) || 1;
                  setDraftLineItems(updated);
                }} className="w-20" />
                <Input placeholder="Unit Price" value={item.unitPrice} onChange={(e) => {
                  const updated = [...draftLineItems];
                  updated[idx].unitPrice = e.target.value;
                  setDraftLineItems(updated);
                }} className="w-24" />
                <Input type="number" placeholder="Discount %" value={item.discountPercent || 0} onChange={(e) => {
                  const updated = [...draftLineItems];
                  updated[idx].discountPercent = parseInt(e.target.value) || 0;
                  setDraftLineItems(updated);
                }} className="w-24" />
                <Button size="icon" variant="ghost" onClick={() => setDraftLineItems(draftLineItems.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button onClick={() => setDraftLineItems([...draftLineItems, { id: `${Date.now()}`, description: "", quantity: 1, unitPrice: "0" }])} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Line Item
          </Button>
          <div className="flex justify-end gap-4 pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold font-mono">${calculateTotal().toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="drafts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
        </TabsList>

        {["draft", "sent", "accepted"].map((status) => (
          <TabsContent key={status} value={status === "draft" ? "drafts" : status} className="space-y-4">
            {quotes
              .filter((q) => q.status === status)
              .map((quote) => (
                <Card key={quote.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Quote {quote.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{quote.lineItems.length} line items</p>
                        <div className="flex gap-2 mt-2">
                          <Badge>{quote.status}</Badge>
                          <Badge variant="outline">${parseFloat(quote.total).toLocaleString()}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Copy className="w-4 h-4" />
                        </Button>
                        {quote.status === "draft" && (
                          <Button size="sm" onClick={() => sendMutation.mutate(quote.id)}>
                            <Send className="w-4 h-4 mr-1" />
                            Send
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
