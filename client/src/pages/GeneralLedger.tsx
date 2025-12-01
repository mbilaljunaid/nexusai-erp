import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GeneralLedger() {
  const { toast } = useToast();
  const [newEntry, setNewEntry] = useState({ description: "", accountId: "", debitAmount: "", creditAmount: "" });

  const { data: entries = [], isLoading } = useQuery<any[]>({ 
    queryKey: ["/api/finance/general-ledger"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/finance/general-ledger", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/general-ledger"] });
      setNewEntry({ description: "", accountId: "", debitAmount: "", creditAmount: "" });
      toast({ title: "Journal entry created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/finance/general-ledger/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finance/general-ledger"] });
      toast({ title: "Entry deleted" });
    }
  });

  const totalDebits = entries.reduce((sum, e: any) => sum + parseFloat(e.debitAmount || 0), 0);
  const totalCredits = entries.reduce((sum, e: any) => sum + parseFloat(e.creditAmount || 0), 0);
  const balance = totalDebits - totalCredits;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Wallet className="w-8 h-8" />
          General Ledger
        </h1>
        <p className="text-muted-foreground">View all journal entries and account balances</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Debits</p>
            <p className="text-2xl font-bold">${totalDebits.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Total Credits</p>
            <p className="text-2xl font-bold">${totalCredits.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Balance</p>
            <p className={`text-2xl font-bold ${balance === 0 ? "text-green-600" : "text-red-600"}`}>
              ${Math.abs(balance).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-entry">
        <CardHeader><CardTitle className="text-base">Create Journal Entry</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Description" value={newEntry.description} onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })} data-testid="input-description" />
            <Input placeholder="Account ID" value={newEntry.accountId} onChange={(e) => setNewEntry({ ...newEntry, accountId: e.target.value })} data-testid="input-account-id" />
            <Input placeholder="Debit" type="number" value={newEntry.debitAmount} onChange={(e) => setNewEntry({ ...newEntry, debitAmount: e.target.value })} data-testid="input-debit" />
            <Input placeholder="Credit" type="number" value={newEntry.creditAmount} onChange={(e) => setNewEntry({ ...newEntry, creditAmount: e.target.value })} data-testid="input-credit" />
          </div>
          <Button onClick={() => createMutation.mutate(newEntry)} disabled={createMutation.isPending || !newEntry.description} className="w-full" data-testid="button-create-entry">
            <Plus className="w-4 h-4 mr-2" /> Create Entry
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="text-center py-4">Loading...</p>
            ) : entries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No entries yet</p>
            ) : (
              entries.map((entry: any) => (
                <div key={entry.id} className="flex justify-between items-center p-3 border rounded hover-elevate" data-testid={`entry-${entry.id}`}>
                  <div>
                    <p className="font-semibold">{entry.description}</p>
                    <p className="text-sm text-muted-foreground">{entry.accountId}</p>
                  </div>
                  <div className="flex gap-4 items-center">
                    {entry.debitAmount > 0 && <p className="text-green-600">${entry.debitAmount}</p>}
                    {entry.creditAmount > 0 && <p className="text-red-600">${entry.creditAmount}</p>}
                    <Badge variant={entry.isPosted ? "default" : "secondary"}>
                      {entry.isPosted ? "Posted" : "Draft"}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(entry.id)} data-testid={`button-delete-${entry.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
