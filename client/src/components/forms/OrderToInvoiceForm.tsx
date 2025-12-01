import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  amount: number;
  status: string;
  orderDate: string;
}

export function OrderToInvoiceForm({ order, onClose }: { order: Order; onClose: () => void }) {
  const { toast } = useToast();
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`);
  const [amount, setAmount] = useState(order.amount.toString());
  const [dueDate, setDueDate] = useState("");

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const invoiceAmount = parseFloat(amount);
      
      // Create invoice
      const invoice: any = await apiRequest("POST", "/api/invoices", {
        invoiceNumber,
        customerId: order.customer,
        amount: invoiceAmount,
        dueDate,
        description: `Invoice from Order ${order.orderNumber}`,
        linkedOrderId: order.id,
        status: "draft"
      });

      // Create GL entry for revenue (AR debit, Revenue credit)
      await apiRequest("POST", "/api/ledger", {
        accountCode: "1200",
        description: `AR from Order: ${order.orderNumber}`,
        debit: invoiceAmount,
        credit: 0,
        invoiceId: invoice?.id,
        linkedOrderId: order.id
      });

      // Create revenue GL entry
      await apiRequest("POST", "/api/ledger", {
        accountCode: "4000",
        description: `Revenue from Order: ${order.orderNumber}`,
        debit: 0,
        credit: invoiceAmount,
        invoiceId: invoice?.id,
        linkedOrderId: order.id
      });

      return invoice;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Invoice created from order ${order.orderNumber}`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          Convert Order to Invoice
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Create invoice from fulfilled order with AR + Revenue GL entries</p>
      </div>

      <Card className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Order:</span>
              <Badge variant="default">{order.orderNumber}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Customer:</span>
              <span className="text-sm">{order.customer}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Order Amount:</span>
              <span className="font-semibold">${parseFloat(amount).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Order Date:</span>
              <span className="text-sm">{order.orderDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoice-num">Invoice Number</Label>
              <Input
                id="invoice-num"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                data-testid="input-invoice-number"
              />
            </div>
            <div>
              <Label htmlFor="invoice-amount">Amount</Label>
              <Input
                id="invoice-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>
            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                data-testid="input-due-date"
              />
            </div>
          </div>

          <Card className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Creates invoice + AR GL entry (1200) + Revenue GL entry (4000) for complete order-to-cash visibility.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => createInvoiceMutation.mutate()} disabled={createInvoiceMutation.isPending} className="flex-1" data-testid="button-create-invoice">
          {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
        </Button>
        <Button onClick={onClose} variant="outline" data-testid="button-cancel">
          Cancel
        </Button>
      </div>
    </div>
  );
}
