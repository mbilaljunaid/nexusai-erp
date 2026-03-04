import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { ContextualSearch } from "@/components/ContextualSearch";
import { Link } from "wouter";
import { PurchaseOrderForm } from "@/components/forms/PurchaseOrderForm";

export default function PurchaseOrdersDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: pos = [] } = useQuery<any[]>({ queryKey: ["/api/purchase-orders"], retry: false });

  return (
    <StandardPage
      title="Purchase Orders"
      description="Search, view, and create purchase orders"
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <Link to="/erp">
         <p className="text-muted-foreground text-sm">Search, view, and create purchase orders</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <ContextualSearch 
            placeholder="Search POs..." 
            fields={[{ key: "query", label: "Search", type: "text" }]}
            onSearch={(f) => setSearchQuery(f.query || "")}
          />
          <Button>+ New PO</Button>
        </div>

        <div className="space-y-2">
          {((pos || []) as any).filter((p: any) => (p.id || "").toString().toLowerCase().includes(searchQuery.toLowerCase())).map((p: any, idx: number) => (
            <Card key={idx} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">PO {p.id}</p><p className="text-sm text-muted-foreground">{p.vendor}</p></div><Badge>${(p.amount || 0).toLocaleString()}</Badge></div></CardContent></Card>
          ))}
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">+ Add New Purchase Order</h2>
          <PurchaseOrderForm />
        </div>
      </div>
    </StandardPage >
  );
}
