import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function APInvoices() {
  const { data: invoices = [] } = useQuery<any[]>({ queryKey: ["/api/finance/ap-invoices"] });

  const total = invoices.reduce((sum, i: any) => sum + parseFloat(i.invoiceAmount || 0), 0);
  const paid = invoices.reduce((sum, i: any) => sum + parseFloat(i.paidAmount || 0), 0);
  const pending = total - paid;

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    submitted: "default",
    approved: "default",
    paid: "outline",
    rejected: "destructive",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Accounts Payable
        </h1>
        <p className="text-muted-foreground">Manage vendor invoices and payments</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total AP</p>
            <p className="text-2xl font-bold">${total.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Paid</p>
            <p className="text-2xl font-bold text-green-600">${paid.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Pending</p>
            <p className="text-2xl font-bold text-orange-600">${pending.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-3 border rounded hover-elevate">
                <div className="flex-1">
                  <p className="font-semibold">{inv.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">{inv.vendorId}</p>
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
