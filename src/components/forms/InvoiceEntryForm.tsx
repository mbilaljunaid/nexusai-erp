import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function InvoiceEntryForm() {
  const { toast } = useToast();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("draft");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSaveInvoice = async () => {
    if (!invoiceNumber || !amount) {
      toast({ title: "Error", description: "Invoice Number and Amount are required", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        invoiceNumber,
        customerId: customerId || undefined,
        amount,
        dueDate: dueDate || undefined,
        status
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to create invoice");

      setSuccessMessage("Invoice saved successfully!");
      toast({ title: "Success", description: "Invoice created" });

      // Reset form
      setInvoiceNumber("");
      setCustomerId("");
      setAmount("");
      setDueDate("");
      setStatus("draft");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold">Add Invoice</h2>
        <p className="text-sm text-muted-foreground mt-1">Create and process vendor invoices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-2024-001"
                className="text-sm"
                data-testid="input-invoice-number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="CUST-001"
                className="text-sm"
                data-testid="input-invoice-customer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000.00"
                step="0.01"
                className="text-sm"
                data-testid="input-invoice-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-sm"
                data-testid="input-invoice-duedate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSaveInvoice}
              disabled={isLoading}
              data-testid="button-save-invoice"
            >
              {isLoading ? "Saving..." : successMessage ? "Saved!" : "Save Invoice"}
            </Button>
            <Button variant="outline">Cancel</Button>
          </div>

          {successMessage && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm text-green-900 dark:text-green-100 ml-2">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
