import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GeneralLedger() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">General Ledger</h1>
        <p className="text-muted-foreground mt-1">View all journal entries and account transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Debits</p>
            <p className="text-3xl font-bold mt-1">$2.5M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Credits</p>
            <p className="text-3xl font-bold mt-1">$2.5M</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-3xl font-bold mt-1">$0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Entries</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { date: "Jan 20", account: "Sales Revenue", debit: "", credit: "$5,000", desc: "Invoice INV-001" },
              { date: "Jan 19", account: "Accounts Receivable", debit: "$5,000", credit: "", desc: "Invoice INV-001" },
              { date: "Jan 18", account: "Expenses", debit: "$1,200", credit: "", desc: "Supplies" },
            ].map((entry, idx) => (
              <div key={idx} className="flex justify-between p-2 border rounded text-sm">
                <div><p className="font-medium">{entry.account}</p><p className="text-xs text-muted-foreground">{entry.desc}</p></div>
                <div className="text-right">
                  <p>{entry.date}</p>
                  <p>{entry.debit && `Dr: ${entry.debit}`} {entry.credit && `Cr: ${entry.credit}`}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
