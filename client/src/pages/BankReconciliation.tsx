import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, AlertCircle, DollarSign, Upload, Percent } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "unmatched" | "matched" | "exception";
  glEntry?: string;
}

interface ReconciliationRun {
  id: string;
  bankBalance: string;
  glBalance: string;
  difference: string;
  matchedCount: number;
  status: "in_progress" | "complete";
  createdAt: string;
}

export default function BankReconciliation() {
  const { data: runs = [] } = useQuery<ReconciliationRun[]>({
    queryKey: ["/api/bank-reconciliation"],
    retry: false,
  });

  const { data: transactions = [] } = useQuery<BankTransaction[]>({
    queryKey: ["/api/bank-transactions"],
    retry: false,
  });

  const reconcileMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bank-reconciliation/run", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-reconciliation"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bank-transactions"] });
    },
  });

  const matchMutation = useMutation({
    mutationFn: (txnId: string) => apiRequest("POST", `/api/bank-transactions/${txnId}/match`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/bank-transactions"] }),
  });

  const lastRun = runs[0];
  const unmatched = transactions.filter(t => t.status === "unmatched").length;
  const matched = transactions.filter(t => t.status === "matched").length;
  const exceptions = transactions.filter(t => t.status === "exception").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold">Bank Reconciliation</h1>
          <p className="text-muted-foreground text-sm">Match bank statements to GL entries</p>
        </div>
        <Button onClick={() => reconcileMutation.mutate()}>
          <Upload className="w-4 h-4 mr-2" />
          Run Reconciliation
        </Button>
      </div>

      {lastRun && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-semibold font-mono">${parseFloat(lastRun.bankBalance).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Bank Balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-semibold font-mono">${parseFloat(lastRun.glBalance).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">GL Balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {Math.abs(parseFloat(lastRun.difference)) < 0.01 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                )}
                <div>
                  <p className="text-2xl font-semibold font-mono">${parseFloat(lastRun.difference).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Difference</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover-elevate">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Percent className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-semibold">{((matched / transactions.length) * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Matched</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="unmatched" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unmatched">Unmatched ({unmatched})</TabsTrigger>
          <TabsTrigger value="matched">Matched ({matched})</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions ({exceptions})</TabsTrigger>
        </TabsList>

        {["unmatched", "matched", "exception"].map((status) => (
          <TabsContent key={status} value={status === "exception" ? "exceptions" : status} className="space-y-4">
            {transactions
              .filter((txn) => txn.status === status)
              .map((txn) => (
                <Card key={txn.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{txn.description}</p>
                        <p className="text-sm text-muted-foreground">{txn.date} | GL: {txn.glEntry || "N/A"}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-2xl font-semibold font-mono">${parseFloat(txn.amount).toLocaleString()}</p>
                        <Badge variant={status === "matched" ? "default" : "secondary"}>
                          {status.toUpperCase()}
                        </Badge>
                        {status === "unmatched" && (
                          <Button size="sm" onClick={() => matchMutation.mutate(txn.id)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Match
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
