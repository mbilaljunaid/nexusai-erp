import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export default function HealthcarePage() {
  const [search, setSearch] = useState("");
  const endpoint = window.location.pathname.replace("/", "").replace(/-/g, "-").toLowerCase();
  const { data = [] } = useQuery({ queryKey: [`/api/healthcare-${endpoint.split("healthcare")[1] || "default"}`] });

  const filtered = data.filter((item: any) =>
    (item.name || item.firstName || item.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold capitalize">{endpoint.replace("healthcare-", "").replace(/-/g, " ")}</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} records</p>
        </div>
        <Button data-testid="button-add"><Plus className="w-4 h-4 mr-2" />Add</Button>
      </div>

      <div className="flex gap-2 items-center">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
          data-testid="input-search"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((item: any, idx: number) => (
          <Card key={item.id || idx} className="hover-elevate" data-testid={`card-item-${item.id || idx}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>{item.name || item.firstName || item.title || "Item"}</CardTitle>
                <Badge>{item.status || "Active"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-sm">
              <p><span className="text-muted-foreground">ID:</span> {item.id || "—"}</p>
              <p><span className="text-muted-foreground">Type:</span> {item.type || item.department || "—"}</p>
              <p><span className="text-muted-foreground">Date:</span> {item.date || item.createdAt?.split("T")[0] || "—"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
