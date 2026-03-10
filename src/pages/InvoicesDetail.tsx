import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { ContextualSearch } from "@/components/ContextualSearch";

function InvoiceEntryForm() {
  return (
    <div className="border rounded bg-muted/50 p-8 border-dashed text-center">
      <p className="text-muted-foreground">Invoice Entry Form Placeholder</p>
    </div>
  );
}

export default function InvoicesDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: invoices = [] } = useQuery<any[]>({ queryKey: ["/api/invoices"], retry: false });

  return (
    <StandardPage title="Invoices" description="Search, view, and create invoices">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/finance">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <ContextualSearch
                placeholder="Search invoices..."
                fields={[{ key: "id", label: "Invoice ID", type: "text" }]}
                onSearch={(filters) => setSearchQuery(filters.id || "")}
              />
            </div>
            <Button>+ New Invoice</Button>
          </div>

          <div className="space-y-2">
            {((invoices || []) as any).filter((i: any) => (i.id || "").toString().toLowerCase().includes(searchQuery.toLowerCase())).map((i: any, idx: number) => (
              <Card key={idx} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">Invoice {i.id}</p><p className="text-sm text-muted-foreground">{i.vendorId || i.customerId}</p></div><Badge>${(i.amount || 0).toLocaleString()}</Badge></div></CardContent></Card>
            ))}
          </div>

          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">+ Add New Invoice</h2>
            <InvoiceEntryForm />
          </div>
        </div>
      </div>
    </StandardPage>
  );
}
