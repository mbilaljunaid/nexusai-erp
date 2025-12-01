import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AccountDirectory() {
  const { toast } = useToast();
  const [newAccount, setNewAccount] = useState({ name: "", industry: "", employees: "", revenue: "" });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["/api/crm/accounts"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/crm/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/accounts"] });
      setNewAccount({ name: "", industry: "", employees: "", revenue: "" });
      toast({ title: "Account created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/crm/accounts/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm/accounts"] });
      toast({ title: "Account deleted" });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage customer accounts and relationships</p>
        </div>
      </div>

      <Card data-testid="card-new-account">
        <CardHeader><CardTitle className="text-base">Add Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Name" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} data-testid="input-name" />
            <Input placeholder="Industry" value={newAccount.industry} onChange={(e) => setNewAccount({ ...newAccount, industry: e.target.value })} data-testid="input-industry" />
            <Input placeholder="Employees" type="number" value={newAccount.employees} onChange={(e) => setNewAccount({ ...newAccount, employees: e.target.value })} data-testid="input-employees" />
            <Input placeholder="Revenue" value={newAccount.revenue} onChange={(e) => setNewAccount({ ...newAccount, revenue: e.target.value })} data-testid="input-revenue" />
          </div>
          <Button onClick={() => createMutation.mutate(newAccount)} disabled={createMutation.isPending || !newAccount.name} className="w-full" data-testid="button-create-account">
            <Plus className="w-4 h-4 mr-2" /> Add Account
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search accounts..." className="pl-10" data-testid="input-search" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? <p>Loading...</p> : accounts.length === 0 ? <p className="text-muted-foreground">No accounts</p> : (accounts.map((acc: any) => (
          <Card key={acc.id} className="hover:shadow-lg transition" data-testid={`account-${acc.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-blue-600">{acc.name}</h3>
                  <p className="text-sm text-muted-foreground">{acc.industry}</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs"><strong>Employees:</strong> {acc.employees}</p>
                    <p className="text-xs"><strong>Revenue:</strong> {acc.revenue}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(acc.id)} data-testid={`button-delete-${acc.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>
    </div>
  );
}
