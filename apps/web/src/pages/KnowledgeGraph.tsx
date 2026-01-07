import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { Network, Database, Zap, TrendingUp, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface KnowledgeEntity {
  id: string;
  name: string;
  type: string;
  relationships: number;
  confidence: number;
}

export default function KnowledgeGraph() {
  const [activeNav, setActiveNav] = useState("entities");
  const { data: entities = [] } = useQuery<KnowledgeEntity[]>({
    queryKey: ["/api/knowledge-graph/entities"],
    retry: false,
  });

  const stats = {
    total: (entities || []).length,
    relationships: (entities || []).reduce((sum: number, e: any) => sum + (e.relationships || 0), 0),
    avgConfidence: (entities || []).length > 0
      ? (((entities || []).reduce((sum: number, e: any) => sum + (e.confidence || 0), 0) / (entities || []).length) * 100).toFixed(0)
      : 0,
  };

  const navItems = [
    { id: "entities", label: "Entities", icon: Database, color: "text-blue-500" },
    { id: "graph", label: "Visualization", icon: Network, color: "text-green-500" },
    { id: "relationships", label: "Relationships", icon: TrendingUp, color: "text-purple-500" },
    { id: "config", label: "Configuration", icon: Settings, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Knowledge Graph</h1>
        <p className="text-muted-foreground text-sm">Entity relationships and semantic connections</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Database className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.total}</p><p className="text-xs text-muted-foreground">Entities</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Network className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.relationships}</p><p className="text-xs text-muted-foreground">Relationships</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Zap className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-semibold">{stats.avgConfidence}%</p><p className="text-xs text-muted-foreground">Avg Confidence</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-red-500" /><div><p className="text-2xl font-semibold">{(stats.relationships / Math.max(stats.total, 1)).toFixed(1)}</p><p className="text-xs text-muted-foreground">Avg Degree</p></div></div></CardContent></Card>
      </div>
      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />
      {activeNav === "entities" && (
        <div className="space-y-3">
          {(entities || []).map((entity: any) => (
            <Card key={entity.id} className="hover-elevate"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="font-semibold">{entity.name}</p><p className="text-sm text-muted-foreground">{entity.type}</p></div><Badge>{(entity.relationships)} links</Badge></div></CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "graph" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Knowledge graph visualization</p></CardContent></Card>}
      {activeNav === "relationships" && <Card><CardContent className="p-4"><p className="text-muted-foreground">{stats.relationships} relationships mapped</p></CardContent></Card>}
      {activeNav === "config" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Configure entity types and relationships</p><Button size="sm" className="mt-4">Configure</Button></CardContent></Card>}
    </div>
  );
}
