import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function CustomersDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const customers = [{id: 1, name: "TechCorp Inc", industry: "Technology", revenue: "100M"}, {id: 2, name: "RetailCo", industry: "Retail", revenue: "50M"}];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/crm">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">Customers</h1>
          <p className="text-muted-foreground text-sm">Search, view, and manage customer accounts</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
          <Button>+ New Customer</Button>
        </div>

        <div className="space-y-2">
          {customers.filter((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((c: any) => (
            <Card key={c.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">{c.name}</p><p className="text-sm text-muted-foreground">{c.industry}</p></div><Badge>{c.revenue}</Badge></div></CardContent></Card>
          ))}
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">+ Add New Customer</h2>
          <CustomerEntryForm />
        </div>
      </div>
    </div>
  );
}
