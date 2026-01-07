import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContextualSearch } from "@/components/ContextualSearch";
import { generateBreadcrumbs, getSearchFields } from "@/lib/pageConfig";

export default function FinanceInvoicesDetail() {
  const [searchFilters, setSearchFilters] = useState<Record<string, string>>({});
  const [invoices] = useState([
    { id: "INV-001", type: "invoice", status: "pending", amount: "$5,000" },
    { id: "INV-002", type: "invoice", status: "approved", amount: "$8,500" },
    { id: "INV-003", type: "invoice", status: "paid", amount: "$3,200" },
  ]);

  const filteredInvoices = invoices.filter((inv) => {
    if (searchFilters.id && !inv.id.toLowerCase().includes(searchFilters.id.toLowerCase())) return false;
    if (searchFilters.status && inv.status !== searchFilters.status) return false;
    if (searchFilters.type && inv.type !== searchFilters.type) return false;
    return true;
  });

  const breadcrumbs = generateBreadcrumbs("Finance", "Invoices");
  const searchFields = getSearchFields("Finance");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbs} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Invoices</h1>
          <p className="text-muted-foreground text-sm">Manage invoices and billing</p>
        </div>
        <Button data-testid="button-new-invoice">
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <ContextualSearch
        fields={searchFields}
        onSearch={setSearchFilters}
        placeholder="Search invoices..."
        testId="search-invoices"
      />

      <div className="space-y-2">
        {filteredInvoices.map((inv) => (
          <Card key={inv.id} className="hover-elevate">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold" data-testid={`text-invoice-${inv.id}`}>{inv.id}</p>
                  <p className="text-sm text-muted-foreground">{inv.amount}</p>
                </div>
                <Badge 
                  variant={inv.status === "paid" ? "default" : inv.status === "approved" ? "secondary" : "outline"}
                  data-testid={`badge-status-${inv.id}`}
                >
                  {inv.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
