import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

function VendorEntryForm() {
  return (
    <div className="p-4 border rounded bg-muted/50 border-dashed text-center">
      <p className="text-muted-foreground">Vendor Entry Form Placeholder</p>
    </div>
  );
}

export default function VendorsDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: vendors = [] } = useQuery<any[]>({ queryKey: ["/api/vendors"], retry: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/erp">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">Vendors/Suppliers</h1>
          <p className="text-muted-foreground text-sm">Search, view, and manage suppliers</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
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
  );
}
