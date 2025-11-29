import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChartOfAccounts() {
  const { data: accounts = [] } = useQuery<any[]>({ queryKey: ["/api/finance/chart-of-accounts"] });

  const accountTypeColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Asset: "default",
    Liability: "secondary",
    Equity: "destructive",
    Revenue: "default",
    Expense: "secondary",
  };

  const groupedAccounts = {
    Asset: accounts.filter((a: any) => a.accountType === "Asset"),
    Liability: accounts.filter((a: any) => a.accountType === "Liability"),
    Equity: accounts.filter((a: any) => a.accountType === "Equity"),
    Revenue: accounts.filter((a: any) => a.accountType === "Revenue"),
    Expense: accounts.filter((a: any) => a.accountType === "Expense"),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            Chart of Accounts
          </h1>
          <p className="text-muted-foreground">Manage your general ledger account structure</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> New Account
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedAccounts).map(([type, typeAccounts]: any) => (
          <div key={type}>
            <h2 className="text-lg font-semibold mb-3">{type}s ({typeAccounts.length})</h2>
            <div className="grid gap-3">
              {typeAccounts.map((account: any) => (
                <Card key={account.id} className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{account.accountCode} - {account.accountName}</p>
                        <p className="text-sm text-muted-foreground">{account.description}</p>
                      </div>
                      <div className="space-x-2">
                        <Badge variant={accountTypeColors[type] || "default"}>{type}</Badge>
                        <Badge variant={account.isActive ? "default" : "secondary"}>
                          {account.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
