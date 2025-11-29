import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";

export default function GeneralLedger() {
  const { data: entries = [] } = useQuery<any[]>({ queryKey: ["/api/finance/general-ledger"] });

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

      <Card>
        <CardHeader>
          <CardTitle>Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {entries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No entries yet</p>
            ) : (
              entries.map((entry: any) => (
                <div key={entry.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-semibold">{entry.description}</p>
                    <p className="text-sm text-muted-foreground">{entry.accountId}</p>
                  </div>
                  <div className="flex gap-4">
                    {entry.debitAmount > 0 && <p className="text-green-600">${entry.debitAmount}</p>}
                    {entry.creditAmount > 0 && <p className="text-red-600">${entry.creditAmount}</p>}
                    <Badge variant={entry.isPosted ? "default" : "secondary"}>
                      {entry.isPosted ? "Posted" : "Draft"}
                    </Badge>
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
