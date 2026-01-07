import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { BomForm } from "@/components/forms/BomForm";

export default function BOMDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const boms = [{id: 1, name: "Widget A BOM", version: "1.0", items: 12}, {id: 2, name: "Widget B BOM", version: "2.1", items: 8}];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/manufacturing">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">Bill of Materials</h1>
          <p className="text-muted-foreground text-sm">Manage BOMs and component lists</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search BOMs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" /></div>
          <Button>+ New BOM</Button>
        </div>

        <div className="space-y-2">
          {boms.filter((b: any) => b.name.toLowerCase().includes(searchQuery.toLowerCase())).map((b: any) => (
            <Card key={b.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">{b.name}</p><p className="text-sm text-muted-foreground">v{b.version} • {b.items} items</p></div><Badge>{b.items}</Badge></div></CardContent></Card>
          ))}
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">+ Create New BOM</h2>
          <BomForm />
        </div>
      </div>
    </div>
  );
}
