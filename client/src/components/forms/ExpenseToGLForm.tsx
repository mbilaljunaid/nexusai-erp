import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Expense {
  id: string;
  expenseId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: string;
}

export function ExpenseToGLForm({ expense, onClose }: { expense: Expense; onClose: () => void }) {
  const { toast } = useToast();
  const [glAccount, setGlAccount] = useState("5000");
  const [amount, setAmount] = useState(expense.amount.toString());

  const createGLMutation = useMutation({
    mutationFn: async () => {
      const glAmount = parseFloat(amount);
      // Map expense category to GL account
      const accountMap: Record<string, string> = {
        "Travel": "5200",
        "Meals": "5300",
        "Office Supplies": "5400",
        "Technology": "5500",
        "Utilities": "5600",
        "Other": "5000"
      };

      return apiRequest("POST", "/api/ledger", {
        accountCode: accountMap[expense.category] || glAccount,
        description: `Expense: ${expense.description}`,
        debit: glAmount,
        credit: 0,
        expenseId: expense.id,
        linkedExpenseId: expense.id,
        status: "posted"
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `GL entry created for expense ${expense.expenseId}`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create GL entry",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Receipt className="w-6 h-6" />
          Expense to GL Entry
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Record expense in general ledger for accounting</p>
      </div>

      <Card className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expense:</span>
              <Badge variant="default">{expense.expenseId}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Description:</span>
              <span className="text-sm">{expense.description}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Category:</span>
              <Badge variant="secondary">{expense.category}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Amount:</span>
              <span className="font-semibold">${parseFloat(amount).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">GL Account Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account">GL Account Code</Label>
              <Input
                id="account"
                value={glAccount}
                onChange={(e) => setGlAccount(e.target.value)}
                placeholder="5000"
                data-testid="input-account"
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
          </div>
          <p className="text-xs text-muted-foreground">
            • Travel: 5200 • Meals: 5300 • Office Supplies: 5400 • Technology: 5500 • Utilities: 5600
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => createGLMutation.mutate()} disabled={createGLMutation.isPending} className="flex-1" data-testid="button-create-gl">
          {createGLMutation.isPending ? "Creating..." : "Create GL Entry"}
        </Button>
        <Button onClick={onClose} variant="outline" data-testid="button-cancel">
          Cancel
        </Button>
      </div>
    </div>
  );
}
