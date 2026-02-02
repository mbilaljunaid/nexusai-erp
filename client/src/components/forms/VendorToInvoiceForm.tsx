import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Vendor {
  id: string;
  vendorName: string;
  vendorCode: string;
  paymentTerms: string;
  status: string;
  category: string;
}

export function VendorToInvoiceForm({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const { toast } = useToast();
  const [invoiceNumber, setInvoiceNumber] = useState(`SI-${Date.now()}`);
  const [amount, setAmount] = useState("0");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const invoiceAmount = parseFloat(amount);
      
      // Create supplier invoice
      const invoice: any = await apiRequest("POST", "/api/invoices", {
        invoiceNumber,
        vendorId: vendor.id,
        vendorName: vendor.vendorName,
        amount: invoiceAmount,
        invoiceDate,
        dueDate,
        paymentTerms: vendor.paymentTerms,
        status: "draft",
        type: "supplier",
        linkedVendorId: vendor.id
      });

      // Create GL entry for AP (Accounts Payable)
      await apiRequest("POST", "/api/ledger", {
        accountCode: "2100",
        description: `AP: Invoice from ${vendor.vendorName}`,
        debit: 0,
        credit: invoiceAmount,
        invoiceId: invoice?.id,
        linkedVendorId: vendor.id
      });

      // Create offsetting expense entry based on vendor category
      const expenseAccount = vendor.category === "Materials" ? "5400" : "5000";
      await apiRequest("POST", "/api/ledger", {
        accountCode: expenseAccount,
        description: `Expense: ${vendor.vendorName} - ${vendor.category}`,
        debit: invoiceAmount,
        credit: 0,
        invoiceId: invoice?.id,
        linkedVendorId: vendor.id
      });

      return invoice;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Supplier invoice created for ${vendor.vendorName}`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create supplier invoice",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Vendor Supplier Invoice
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Create supplier invoice from vendor with AP GL entry</p>
      </div>

      <Card className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vendor:</span>
              <Badge variant="default">{vendor.vendorName}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vendor Code:</span>
              <span className="text-sm font-mono">{vendor.vendorCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Category:</span>
              <Badge variant="secondary">{vendor.category}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Payment Terms:</span>
              <span className="text-sm">{vendor.paymentTerms}</span>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice-number">Invoice Number</Label>
              <Input
                id="invoice-number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                data-testid="input-invoice-number"
              />
            </div>
            <div>
              <Label htmlFor="amount">Invoice Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-amount"
              />
            </div>
            <div>
              <Label htmlFor="invoice-date">Invoice Date</Label>
              <Input
                id="invoice-date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                data-testid="input-invoice-date"
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
                Creates supplier invoice with AP GL entry (2100) and expense GL entry based on vendor category for full procurement cycle tracking.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => createInvoiceMutation.mutate()} disabled={createInvoiceMutation.isPending} className="flex-1" data-testid="button-create-invoice">
          {createInvoiceMutation.isPending ? "Creating..." : "Create Supplier Invoice"}
        </Button>
        <Button onClick={onClose} variant="outline" data-testid="button-cancel">
          Cancel
        </Button>
      </div>
    </div>
  );
}
