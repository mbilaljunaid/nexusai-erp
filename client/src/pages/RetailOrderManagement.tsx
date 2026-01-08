import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OrderToInvoiceForm } from "@/components/forms/OrderToInvoiceForm";

export default function Page() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { data = [] } = useQuery<any[]>({ queryKey: [`/api/retail-${window.location.pathname}`] });

  if (selectedOrder) {
    return (
      <div className="p-6">
        <OrderToInvoiceForm 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Retail Orders & Invoicing</h1>
        <Button data-testid="button-new"><Plus className="w-4 h-4 mr-2" />New Order</Button>
      </div>
      <Card className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Click "Convert to Invoice" on fulfilled orders to automatically create invoices with AR and Revenue GL entries for complete order-to-cash tracking.
          </p>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {[
          { id: "1", orderNumber: "ORD-001", customer: "Acme Corp", amount: 45000, status: "Fulfilled", orderDate: "2024-12-01" },
          { id: "2", orderNumber: "ORD-002", customer: "Tech Solutions", amount: 32500, status: "Fulfilled", orderDate: "2024-11-28" },
          { id: "3", orderNumber: "ORD-003", customer: "Global Industries", amount: 67200, status: "Processing", orderDate: "2024-11-25" },
        ].map((order) => (
          <Card key={order.id} data-testid={`card-order-${order.id}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{order.customer}</p>
                </div>
                <Badge variant={order.status === "Fulfilled" ? "default" : "secondary"}>{order.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-sm">
              <p><span className="text-muted-foreground">Amount:</span> ${order.amount.toLocaleString()}</p>
              <p><span className="text-muted-foreground">Date:</span> {order.orderDate}</p>
              <p><span className="text-muted-foreground">Status:</span> {order.status}</p>
            </CardContent>
            {order.status === "Fulfilled" && (
              <CardContent className="pt-3 border-t">
                <Button size="sm" className="w-full" data-testid={`button-convert-${order.id}`}>
                  Convert to Invoice
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
