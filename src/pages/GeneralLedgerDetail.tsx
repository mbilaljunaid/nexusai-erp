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

function GLEntryForm() {
  return (
    <div className="border rounded bg-muted/50 p-8 border-dashed text-center">
      <p className="text-muted-foreground">GL Entry Form Placeholder</p>
    </div>
  );
}

export default function GeneralLedgerDetail() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: glEntries = [] } = useQuery<any[]>({ queryKey: ["/api/ledger"], retry: false });

  return (
    <StandardPage title="General Ledger" description="Search, view, and create GL entries">
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
                placeholder="Search GL entries..."
                fields={[{ key: "account", label: "Account", type: "text" }]}
                onSearch={(filters) => setSearchQuery(filters.account || "")}
              />
            </div>
            <Button>+ New Entry</Button>
          </div>

          <div className="space-y-2">
            {((glEntries || []) as any).filter((e: any) => (e.account || "").toLowerCase().includes(searchQuery.toLowerCase())).map((e: any, idx: number) => (
              <Card key={idx} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold">{e.account}</p><p className="text-sm text-muted-foreground">{e.description}</p></div><Badge>${(e.amount || 0).toLocaleString()}</Badge></div></CardContent></Card>
            ))}
          </div>

          <div className="mt-8 border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">+ Add New GL Entry</h2>
            <GLEntryForm />
          </div>
        </div>
    </StandardPage>
  );
}
