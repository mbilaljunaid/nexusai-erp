import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus } from "lucide-react";
import { AnomaliesWidget } from "@/components/gl/AnomaliesWidget";

export default function JournalEntries() {
  const entries = [
    { id: "je1", date: "Nov 30, 2025", description: "Sales revenue", debit: "$0", credit: "$50,000", account: "4000", status: "approved" },
    { id: "je2", date: "Nov 29, 2025", description: "Expense entry", debit: "$15,000", credit: "$0", account: "6100", status: "pending" },
    { id: "je3", date: "Nov 28, 2025", description: "Asset acquisition", debit: "$25,000", credit: "$25,000", account: "1500", status: "approved" },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Journal Entries
        </h1>
        <p className="text-muted-foreground mt-2">Create and manage journal entries</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-create-entry">
            <Plus className="h-4 w-4" />
            Create Journal Entry
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Metric Cards */}
        <div className="md:col-span-2 grid grid-cols-3 gap-3">
          <Card className="p-3">
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">{entries.length}</p>
            </CardContent>
          </Card>
          <Card className="p-3">
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600">{entries.filter(e => e.status === "pending").length}</p>
            </CardContent>
          </Card>
          <Card className="p-3">
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Total Posted</p>
              <p className="text-2xl font-bold">${entries.length * 10000}</p>
            </CardContent>
          </Card>
        </div>
        {/* Anomaly Detection Widget (Takes 1/3 space) */}
        <div className="md:col-span-1 row-span-2">
          <AnomaliesWidget />
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Entries</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="p-3 border rounded-lg hover-elevate" data-testid={`entry-${entry.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{entry.description}</h3>
                <Badge variant={entry.status === "approved" ? "default" : "secondary"}>{entry.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Date: {entry.date} • Account: {entry.account} • Debit: {entry.debit} • Credit: {entry.credit}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
