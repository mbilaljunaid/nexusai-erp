import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Opportunity {
  id: string;
  name: string;
  accountName?: string;
  amount: number;
  stage: string;
  probability: number;
}

export function ConvertOpportunityToInvoiceForm({ opportunity, onClose }: { opportunity: Opportunity; onClose: () => void }) {
  const { toast } = useToast();
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`);
  const [customerId, setCustomerId] = useState(opportunity.accountName || "");
  const [amount, setAmount] = useState(opportunity.amount.toString());
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState(`Converted from opportunity: ${opportunity.name}`);

  const convertMutation = useMutation({
    mutationFn: async () => {
      // Create invoice linked to opportunity
      const invoice: any = await apiRequest("POST", "/api/invoices", {
        invoiceNumber,
        customerId,
        amount: parseFloat(amount),
        dueDate,
        description,
        linkedOpportunityId: opportunity.id,
        status: "draft"
      });

      // Also create GL entry for revenue recognition
      await apiRequest("POST", "/api/ledger", {
        accountCode: "4000",
        description: `Revenue from ${opportunity.name}`,
        debit: 0,
        credit: parseFloat(amount),
        invoiceId: invoice?.id,
        linkedOpportunityId: opportunity.id
      });

      return invoice;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Opportunity converted to invoice successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to convert opportunity",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ArrowRight className="w-6 h-6" />
          Convert Opportunity to Invoice
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Convert won opportunity to revenue invoice and GL entry</p>
      </div>

      <Card className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Opportunity:</span>
              <Badge variant="default">{opportunity.name}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Amount:</span>
              <span className="font-semibold">${opportunity.amount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Linked To:</span>
              <span className="text-sm">{opportunity.accountName || "New Customer"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Details</CardTitle>
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
              <Label htmlFor="customer-id">Customer Name</Label>
              <Input
                id="customer-id"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                data-testid="input-customer-id"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
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
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              data-testid="input-description"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => convertMutation.mutate()} disabled={convertMutation.isPending} className="flex-1" data-testid="button-convert">
          {convertMutation.isPending ? "Converting..." : "Convert to Invoice"}
        </Button>
        <Button onClick={onClose} variant="outline" data-testid="button-cancel">
          Cancel
        </Button>
      </div>
    </div>
  );
}
