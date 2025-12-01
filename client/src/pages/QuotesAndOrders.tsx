import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function QuotesAndOrders() {
  const { toast } = useToast();
  const [newQuote, setNewQuote] = useState({ number: "", customer: "", amount: "", type: "quote", status: "draft" });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/crm/quotes"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/crm/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/quotes"] });
      setNewQuote({ number: "", customer: "", amount: "", type: "quote", status: "draft" });
      toast({ title: "Quote created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/crm/quotes/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/quotes"] });
      toast({ title: "Quote deleted" });
    }
  });

  const totalQuotes = items.filter((i: any) => i.type === "quote").length;
  const totalOrders = items.filter((i: any) => i.type === "order").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="h-8 w-8" />Quotes & Orders</h1>
        <p className="text-muted-foreground mt-2">Manage quotes and convert to orders</p>
      </div>

      <Card data-testid="card-new-quote">
        <CardHeader><CardTitle className="text-base">Create Quote/Order</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <Input placeholder="Number" value={newQuote.number} onChange={(e) => setNewQuote({ ...newQuote, number: e.target.value })} data-testid="input-number" />
            <Input placeholder="Customer" value={newQuote.customer} onChange={(e) => setNewQuote({ ...newQuote, customer: e.target.value })} data-testid="input-customer" />
            <Input placeholder="Amount" type="number" value={newQuote.amount} onChange={(e) => setNewQuote({ ...newQuote, amount: e.target.value })} data-testid="input-amount" />
            <Select value={newQuote.type} onValueChange={(v) => setNewQuote({ ...newQuote, type: v })}>
              <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="quote">Quote</SelectItem>
                <SelectItem value="order">Order</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newQuote.status} onValueChange={(v) => setNewQuote({ ...newQuote, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newQuote)} disabled={createMutation.isPending || !newQuote.number} className="w-full" data-testid="button-create-quote">
            <Plus className="h-4 w-4 mr-2" /> Create Quote/Order
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Quotes</p><p className="text-2xl font-bold">{totalQuotes}</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">{totalOrders}</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Quote Value</p><p className="text-2xl font-bold">${items.filter((i: any) => i.type === "quote").reduce((sum: number, i: any) => sum + parseFloat(i.amount || 0), 0) / 1000}K</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Order Value</p><p className="text-2xl font-bold">${items.filter((i: any) => i.type === "order").reduce((sum: number, i: any) => sum + parseFloat(i.amount || 0), 0) / 1000}K</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Quotes & Orders</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : items.length === 0 ? <p className="text-muted-foreground text-center py-4">No quotes/orders</p> : items.map((item: any) => (
            <div key={item.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`quote-order-${item.id}`}>
              <div>
                <h3 className="font-semibold">{item.number}</h3>
                <p className="text-sm text-muted-foreground">Customer: {item.customer} • Amount: ${item.amount}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="outline">{item.type}</Badge>
                <Badge variant={item.status === "approved" ? "default" : "secondary"}>{item.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(item.id)} data-testid={`button-delete-${item.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
