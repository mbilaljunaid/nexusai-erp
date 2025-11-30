import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus } from "lucide-react";

export default function QuotesAndOrders() {
  const items = [
    { id: "q1", type: "quote", number: "QT-2025-001", customer: "Acme Corp", amount: "$150,000", status: "draft", owner: "Alice", date: "2025-11-25" },
    { id: "q2", type: "order", number: "ORD-2025-101", customer: "Global Industries", amount: "$500,000", status: "approved", owner: "Bob", date: "2025-11-20" },
    { id: "q3", type: "quote", number: "QT-2025-002", customer: "StartUp Labs", amount: "$75,000", status: "sent", owner: "Carol", date: "2025-11-15" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Quotes & Orders
        </h1>
        <p className="text-muted-foreground mt-2">Manage quotes and convert to orders</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6 flex gap-2">
          <Button className="flex-1 gap-2" data-testid="button-create-quote">
            <Plus className="h-4 w-4" />
            Create Quote
          </Button>
          <Button className="flex-1 gap-2" data-testid="button-create-order">
            <Plus className="h-4 w-4" />
            Create Order
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Quotes</p><p className="text-2xl font-bold">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Quote Value</p><p className="text-2xl font-bold">$225K</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Order Value</p><p className="text-2xl font-bold">$500K</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Quotes & Orders</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="p-3 border rounded-lg hover-elevate" data-testid={`quote-order-${item.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{item.number}</h3>
                <div className="flex gap-2">
                  <Badge variant="outline">{item.type}</Badge>
                  <Badge variant={item.status === "approved" ? "default" : "secondary"}>{item.status}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Customer: {item.customer} • Amount: {item.amount} • Owner: {item.owner} • Date: {item.date}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
