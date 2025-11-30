import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { OpportunityForm } from "@/components/forms/OpportunityForm";

export default function OpportunitiesDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const opportunities = [{id: 1, name: "Enterprise Deal", value: 250000, stage: "proposal"}, {id: 2, name: "SMB Package", value: 45000, stage: "negotiation"}];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/crm">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">Opportunities</h1>
          <p className="text-muted-foreground text-sm">Search, view, and create sales opportunities</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search opportunities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
          <Button>+ New Opportunity</Button>
        </div>

        <div className="space-y-2">
          {opportunities.filter((o: any) => o.name.toLowerCase().includes(searchQuery.toLowerCase())).map((o: any) => (
            <Card key={o.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">{o.name}</p><p className="text-sm text-muted-foreground">{o.stage}</p></div><Badge>${(o.value / 1000).toFixed(0)}K</Badge></div></CardContent></Card>
          ))}
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">+ Add New Opportunity</h2>
          <OpportunityForm />
        </div>
      </div>
    </div>
  );
}
