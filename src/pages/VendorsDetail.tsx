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

function VendorEntryForm() {
  return (
    <div className="border rounded bg-muted/50 p-8 border-dashed text-center">
      <p className="text-muted-foreground">Vendor Entry Form Placeholder</p>
    </div>
  );
}

export default function VendorsDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: vendors = [] } = useQuery<any[]>({ queryKey: ["/api/vendors"], retry: false });

  return (
    <StandardPage title="Vendors/Suppliers" description="Search, view, and manage suppliers">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/erp">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <ContextualSearch
                placeholder="Search vendors..."
                fields={[{ key: "name", label: "Vendor Name", type: "text" }]}
                onSearch={(filters) => setSearchQuery(filters.name || "")}
              />
            </div>
            <Button>+ New Vendor</Button>
          </div>

          <div className="space-y-2">
            {((vendors || []) as any).filter((v: any) => (v.name || "").toLowerCase().includes(searchQuery.toLowerCase())).map((v: any, idx: number) => (
              <Card key={idx} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">{v.name}</p><p className="text-sm text-muted-foreground">{v.location}</p></div><Badge>{v.rating}/5</Badge></div></CardContent></Card>
            ))}
          </div>

          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">+ Add New Vendor</h2>
            <VendorEntryForm />
          </div>
        </div>
      </div>
    </StandardPage>
  );
}
