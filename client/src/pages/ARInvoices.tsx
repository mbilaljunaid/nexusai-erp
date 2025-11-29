import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

export default function ARInvoices() {
  const { data: invoices = [] } = useQuery<any[]>({ queryKey: ["/api/finance/ar-invoices"] });

  const total = invoices.reduce((sum, i: any) => sum + parseFloat(i.invoiceAmount || 0), 0);
  const received = invoices.reduce((sum, i: any) => sum + parseFloat(i.receivedAmount || 0), 0);
  const outstanding = total - received;

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    issued: "default",
    overdue: "destructive",
    paid: "outline",
    cancelled: "secondary",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <CreditCard className="w-8 h-8" />
          Accounts Receivable
        </h1>
        <p className="text-muted-foreground">Track customer payments and collections</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total AR</p>
            <p className="text-2xl font-bold">${total.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Received</p>
            <p className="text-2xl font-bold text-green-600">${received.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Outstanding</p>
            <p className="text-2xl font-bold text-orange-600">${outstanding.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-3 border rounded hover-elevate">
                <div className="flex-1">
                  <p className="font-semibold">{inv.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">{inv.customerId}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${inv.invoiceAmount}</p>
                  <Badge variant={statusColors[inv.status] || "default"}>{inv.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
