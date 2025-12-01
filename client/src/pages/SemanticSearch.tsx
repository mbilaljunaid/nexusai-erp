import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { Search, BarChart3, TrendingUp, Zap, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SearchResult {
  id: string;
  query: string;
  resultCount: number;
  avgRelevance: number;
  executionTime: number;
}

export default function SemanticSearch() {
  const [activeNav, setActiveNav] = useState("searches");
  const { data: searches = [] } = useQuery<SearchResult[]>({
    queryKey: ["/api/search/semantic"]
    retry: false
  });

  const stats = {
    total: (searches || []).length
    avgRelevance: (searches || []).length > 0 
      ? (((searches || []).reduce((sum: number, s: any) => sum + (s.avgRelevance || 0), 0) / (searches || []).length) * 100).toFixed(0)
      : 0
    totalResults: (searches || []).reduce((sum: number, s: any) => sum + (s.resultCount || 0), 0)
    avgTime: (searches || []).length > 0
      ? (((searches || []).reduce((sum: number, s: any) => sum + (s.executionTime || 0), 0) / (searches || []).length)).toFixed(0)
      : 0
  };

  const navItems = [
    { id: "searches", label: "Searches", icon: Search, color: "text-blue-500" }
    { id: "performance", label: "Performance", icon: TrendingUp, color: "text-green-500" }
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-purple-500" }
    { id: "config", label: "Configuration", icon: Settings, color: "text-orange-500" }
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Semantic Search</h1>
        <p className="text-muted-foreground text-sm">Vector-based search and retrieval</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Search className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-semibold">{stats.total}</p><p className="text-xs text-muted-foreground">Searches</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-green-500" /><div><p className="text-2xl font-semibold">{stats.avgRelevance}%</p><p className="text-xs text-muted-foreground">Avg Relevance</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-semibold">{(stats.totalResults).toLocaleString()}</p><p className="text-xs text-muted-foreground">Results</p></div></div></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-3"><Zap className="h-5 w-5 text-red-500" /><div><p className="text-2xl font-semibold">{stats.avgTime}ms</p><p className="text-xs text-muted-foreground">Avg Time</p></div></div></CardContent></Card>
      </div>
      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />
      {activeNav === "searches" && (
        <div className="space-y-3">
          {(searches || []).map((search: any) => (
            <Card key={search.id} className="hover-elevate cursor-pointer"><CardContent className="p-4"><div className="flex justify-between items-center"><div><p className="font-semibold text-sm">{search.query}</p><p className="text-xs text-muted-foreground">{search.resultCount} results</p></div><Badge>{search.avgRelevance}%</Badge></div></CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "performance" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Search performance metrics</p></CardContent></Card>}
      {activeNav === "analytics" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Search analytics and trends</p></CardContent></Card>}
      {activeNav === "config" && <Card><CardContent className="p-4"><p className="text-muted-foreground">Search configuration settings</p><Button size="sm" className="mt-4">Configure</Button></CardContent></Card>}
    </div>
  );
}
