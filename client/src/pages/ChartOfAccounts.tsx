import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ChartOfAccounts() {
  const { toast } = useToast();
  const [newAccount, setNewAccount] = useState({ accountCode: "", accountName: "", accountType: "Asset", description: "" });

  const { data: accounts = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/finance/chart-of-accounts"],  { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/chart-of-accounts"] });
      setNewAccount({ accountCode: "", accountName: "", accountType: "Asset", description: "" });
      toast({ title: "Account created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/finance/chart-of-accounts/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/chart-of-accounts"] });
      toast({ title: "Account deleted" });
    }
  });

  const accountTypeColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Asset: "default"
    Liability: "secondary"
    Equity: "destructive"
    Revenue: "default"
    Expense: "secondary"
  };

  const groupedAccounts = {
    Asset: accounts.filter((a: any) => a.accountType === "Asset")
    Liability: accounts.filter((a: any) => a.accountType === "Liability")
    Equity: accounts.filter((a: any) => a.accountType === "Equity")
    Revenue: accounts.filter((a: any) => a.accountType === "Revenue")
    Expense: accounts.filter((a: any) => a.accountType === "Expense")
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="w-8 h-8" />
          Chart of Accounts
        </h1>
        <p className="text-muted-foreground">Manage your general ledger account structure</p>
      </div>

      <Card data-testid="card-new-account">
        <CardHeader><CardTitle className="text-base">Add Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Account Code" value={newAccount.accountCode} onChange={(e) => setNewAccount({ ...newAccount, accountCode: e.target.value })} data-testid="input-code" />
            <Input placeholder="Account Name" value={newAccount.accountName} onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })} data-testid="input-name" />
            <Select value={newAccount.accountType} onValueChange={(v) => setNewAccount({ ...newAccount, accountType: v })}>
              <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Asset">Asset</SelectItem>
                <SelectItem value="Liability">Liability</SelectItem>
                <SelectItem value="Equity">Equity</SelectItem>
                <SelectItem value="Revenue">Revenue</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Description" value={newAccount.description} onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })} data-testid="input-description" />
          </div>
          <Button onClick={() => createMutation.mutate(newAccount)} disabled={createMutation.isPending || !newAccount.accountCode} className="w-full" data-testid="button-add-account">
            <Plus className="w-4 h-4 mr-2" /> Add Account
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {isLoading ? <p>Loading...</p> : accounts.length === 0 ? <p className="text-muted-foreground text-center py-4">No accounts</p> : Object.entries(groupedAccounts).map(([type, typeAccounts]: any) => (
          <div key={type}>
            <h2 className="text-lg font-semibold mb-3">{type}s ({typeAccounts.length})</h2>
            <div className="grid gap-3">
              {typeAccounts.map((account: any) => (
                <Card key={account.id} className="hover-elevate" data-testid={`account-${account.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{account.accountCode} - {account.accountName}</p>
                        <p className="text-sm text-muted-foreground">{account.description}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant={accountTypeColors[type] || "default"}>{type}</Badge>
                        <Badge variant={account.isActive ? "default" : "secondary"}>
                          {account.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(account.id)} data-testid={`button-delete-${account.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
