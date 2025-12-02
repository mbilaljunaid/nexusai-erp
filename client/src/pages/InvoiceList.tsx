import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { FormDialog } from "@/components/FormDialog";
import { Download } from "lucide-react";

export default function InvoiceList() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const { data: invoices = [] } = useQuery<any[]>({ queryKey: ["/api/invoices"] });
  const formMetadata = getFormMetadata("invoice");

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Paid": "bg-green-100 text-green-800",
      "Pending": "bg-amber-100 text-amber-800",
      "Overdue": "bg-red-100 text-red-800",
      "Draft": "bg-gray-100 text-gray-800",
      "sent": "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={formMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage customer invoices and payments</p>
        </div>
        <SmartAddButton formMetadata={formMetadata} onClick={() => setShowForm(true)} />
      </div>

      <div className="flex gap-2">
        <FormSearchWithMetadata
          formMetadata={formMetadata}
          value={searchQuery}
          onChange={setSearchQuery}
          data={invoices}
          onFilter={setFilteredInvoices}
        />
        <Button variant="outline" size="icon" data-testid="button-export"><Download className="h-4 w-4" /></Button>
      </div>

      <div className="grid gap-4">
        {filteredInvoices.length > 0 ? filteredInvoices.map((inv: any) => (
          <Card key={inv.id} className="hover:bg-muted/50 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{inv.invoiceNumber} - {inv.customerId}</p><p className="text-sm text-muted-foreground">Amount: ${inv.amount}</p></div>
                <div className="text-right"><p className="font-bold text-lg">${inv.amount}</p><Badge className={getStatusColor(inv.status)}>{inv.status}</Badge></div>
              </div>
            </CardContent>
          </Card>
        )) : <Card><CardContent className="p-4"><p className="text-muted-foreground">No invoices found</p></CardContent></Card>}
      </div>

      <FormDialog isOpen={showForm} onOpenChange={setShowForm} formId="invoice" formTitle="Add Invoice" formDescription="Create a new invoice" />
    </div>
  );
}
