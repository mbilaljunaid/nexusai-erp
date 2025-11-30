import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { LeadEntryForm } from "@/components/forms/LeadEntryForm";

export default function LeadsDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: leads = [] } = useQuery({ queryKey: ["/api/leads"], retry: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/crm">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">Leads</h1>
          <p className="text-muted-foreground text-sm">Search, view, and create leads</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search leads by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
          <Button>+ New Lead</Button>
        </div>

        <div className="space-y-2">
          {((leads || []) as any).filter((l: any) => (l.name || "").toLowerCase().includes(searchQuery.toLowerCase())).map((l: any) => (
            <Card key={l.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">{l.name}</p><p className="text-sm text-muted-foreground">{l.email}</p></div><Badge>{l.status}</Badge></div></CardContent></Card>
          ))}
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">+ Add New Lead</h2>
          <LeadEntryForm />
        </div>
      </div>
    </div>
  );
}
