import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  department: string;
  period: string;
}

export function BudgetToVarianceReportForm({ budget, onClose }: { budget: Budget; onClose: () => void }) {
  const { toast } = useToast();
  const variance = budget.spent - budget.amount;
  const variancePercent = ((variance / budget.amount) * 100).toFixed(1);

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/finance/variance-reports", {
        budgetId: budget.id,
        budgetName: budget.name,
        budgetAmount: budget.amount,
        actualSpent: budget.spent,
        variance,
        variancePercent: parseFloat(variancePercent),
        department: budget.department,
        period: budget.period,
        status: variance > 0 ? "OVER_BUDGET" : "ON_TRACK",
        linkedBudgetId: budget.id
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Variance report generated for ${budget.name}`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Budget Variance Analysis
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Generate variance report for budget vs actuals</p>
      </div>

      <Card className={variance > 0 ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800" : "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Budget:</span>
              <Badge variant="default">{budget.name}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Budgeted</p>
                <p className="text-lg font-semibold">${budget.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Actual</p>
                <p className="text-lg font-semibold">${budget.spent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Variance</p>
                <p className={`text-lg font-semibold ${variance > 0 ? "text-red-600" : "text-green-600"}`}>
                  {variance > 0 ? "+" : ""}{variance.toLocaleString()} ({variancePercent}%)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              This creates a variance report linked to the budget for financial analysis and compliance tracking. Supports budget vs actuals comparison and departmental accountability.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => generateReportMutation.mutate()} disabled={generateReportMutation.isPending} className="flex-1" data-testid="button-generate-report">
          {generateReportMutation.isPending ? "Generating..." : "Generate Variance Report"}
        </Button>
        <Button onClick={onClose} variant="outline" data-testid="button-cancel">
          Cancel
        </Button>
      </div>
    </div>
  );
}
