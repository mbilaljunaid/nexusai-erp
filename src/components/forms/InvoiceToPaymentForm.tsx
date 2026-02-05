import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  dueDate: string;
  status: string;
}

export function InvoiceToPaymentForm({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const { toast } = useToast();
  const [paymentAmount, setPaymentAmount] = useState(invoice.amount.toString());
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(paymentAmount);
      
      // Create payment record
      const payment: any = await apiRequest("POST", "/api/finance/payments", {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer,
        paymentAmount: amount,
        paymentDate,
        paymentMethod,
        status: "completed",
        linkedInvoiceId: invoice.id
      });

      // Create GL entries for payment (Cash credit, AR debit)
      await apiRequest("POST", "/api/ledger", {
        accountCode: "1000",
        description: `Payment received for ${invoice.invoiceNumber}`,
        debit: amount,
        credit: 0,
        paymentId: payment?.id,
        linkedInvoiceId: invoice.id
      });

      // AR credit
      await apiRequest("POST", "/api/ledger", {
        accountCode: "1200",
        description: `AR reduction from payment ${invoice.invoiceNumber}`,
        debit: 0,
        credit: amount,
        paymentId: payment?.id,
        linkedInvoiceId: invoice.id
      });

      return payment;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Payment recorded for ${invoice.invoiceNumber}`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Record Invoice Payment
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Record payment and update AR with GL entries</p>
      </div>

      <Card className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Invoice:</span>
              <Badge variant="default">{invoice.invoiceNumber}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Customer:</span>
              <span className="text-sm">{invoice.customer}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Invoice Amount:</span>
              <span className="font-semibold">${invoice.amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Due Date:</span>
              <span className="text-sm">{invoice.dueDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                data-testid="input-payment-amount"
              />
            </div>
            <div>
              <Label htmlFor="payment-date">Payment Date</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                data-testid="input-payment-date"
              />
            </div>
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="select-payment-method"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>

          <Card className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-4">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Creates payment record + GL entries for Cash (1000) and AR (1200) with full audit trail.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => createPaymentMutation.mutate()} disabled={createPaymentMutation.isPending} className="flex-1" data-testid="button-record-payment">
          {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
        </Button>
        <Button onClick={onClose} variant="outline" data-testid="button-cancel">
          Cancel
        </Button>
      </div>
    </div>
  );
}
