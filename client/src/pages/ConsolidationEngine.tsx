import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitMerge, Database, LinkIcon, AlertCircle, Settings, Link2 as MappingIcon, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { IconNavigation } from "@/components/IconNavigation";

interface Consolidation {
  id: string;
  name: string;
  status: string;
  entityCount: number;
  period: string;
}

export default function ConsolidationEngine() {
  const [activeNav, setActiveNav] = useState("consolidations");
  const { data: consolidations = [] } = useQuery<Consolidation[]>({
    queryKey: ["/api/consolidations"],
    retry: false,
  });

  const stats = {
    total: consolidations.length,
    inProgress: consolidations.filter((c: any) => c.status === "in_progress").length,
    completed: consolidations.filter((c: any) => c.status === "completed").length,
    entities: consolidations.reduce((sum: number, c: any) => sum + (c.entityCount || 0), 0),
  };

  const navItems = [
    { id: "consolidations", label: "Consolidations", icon: GitMerge, color: "text-blue-500" },
    { id: "eliminations", label: "Eliminations", icon: Trash2, color: "text-red-500" },
    { id: "mappings", label: "Mappings", icon: MappingIcon, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Consolidation Engine</h1>
        <p className="text-muted-foreground text-sm">Multi-entity consolidation and eliminations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <GitMerge className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Runs</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <div><p className="text-2xl font-semibold">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <LinkIcon className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{stats.entities}</p>
              <p className="text-xs text-muted-foreground">Entities</p></div>
          </div>
        </CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "consolidations" && (
        <div className="space-y-3">
          {consolidations.map((con: any) => (
            <Card key={con.id} className="hover-elevate cursor-pointer"><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{con.name}</p>
                  <p className="text-sm text-muted-foreground">{con.entityCount} entities • Period: {con.period}</p></div>
                <Badge variant={con.status === "completed" ? "default" : "secondary"}>{con.status}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "eliminations" && <Card><CardContent className="p-6"><p className="text-muted-foreground">Inter-company eliminations and adjustments</p></CardContent></Card>}
      {activeNav === "mappings" && <Card><CardContent className="p-6"><p className="text-muted-foreground">Entity and account mappings</p></CardContent></Card>}
    </div>
  );
}
