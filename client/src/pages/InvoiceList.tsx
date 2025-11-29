import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download } from "lucide-react";

export default function InvoiceList() {
  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Paid": "bg-green-100 text-green-800",
      "Pending": "bg-amber-100 text-amber-800",
      "Overdue": "bg-red-100 text-red-800",
      "Draft": "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage customer invoices and payments</p>
        </div>
        <Button data-testid="button-new-invoice"><Plus className="h-4 w-4 mr-2" />New Invoice</Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoices..." className="pl-10" data-testid="input-search" />
        </div>
        <Button variant="outline" size="icon" data-testid="button-export"><Download className="h-4 w-4" /></Button>
      </div>

      <div className="grid gap-4">
        {[
          { id: "INV-001", customer: "Acme Corp", amount: "$5,250", status: "Paid", date: "Jan 15" },
          { id: "INV-002", customer: "Global Inc", amount: "$8,900", status: "Pending", date: "Jan 20" },
          { id: "INV-003", customer: "TechStart", amount: "$2,100", status: "Overdue", date: "Dec 25" },
          { id: "INV-004", customer: "StartupXYZ", amount: "$1,500", status: "Draft", date: "Today" },
        ].map((inv) => (
          <Card key={inv.id} className="hover:bg-muted/50 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{inv.id} - {inv.customer}</p>
                  <p className="text-sm text-muted-foreground">Due: {inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{inv.amount}</p>
                  <Badge className={getStatusColor(inv.status)}>{inv.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
