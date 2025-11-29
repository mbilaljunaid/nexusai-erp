import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BarChart3, TrendingUp, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SearchResult {
  id: string;
  query: string;
  resultCount: number;
  avgRelevance: number;
  executionTime: number;
}

export default function SemanticSearch() {
  const { data: searches = [] } = useQuery<SearchResult[]>({
    queryKey: ["/api/search/semantic"],
    retry: false,
  });

  const stats = {
    total: searches.length,
    avgRelevance: searches.length > 0 
      ? (searches.reduce((sum: number, s: any) => sum + (s.avgRelevance || 0), 0) / searches.length * 100).toFixed(0)
      : 0,
    totalResults: searches.reduce((sum: number, s: any) => sum + (s.resultCount || 0), 0),
    avgTime: searches.length > 0
      ? (searches.reduce((sum: number, s: any) => sum + (s.executionTime || 0), 0) / searches.length).toFixed(0)
      : 0,
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">Semantic Search</h1>
        <p className="text-muted-foreground text-sm">Vector-based search and retrieval</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Searches</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold">{stats.avgRelevance}%</p>
              <p className="text-xs text-muted-foreground">Avg Relevance</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{(stats.totalResults).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Results</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-red-500" />
            <div><p className="text-2xl font-semibold">{stats.avgTime}ms</p>
              <p className="text-xs text-muted-foreground">Avg Time</p></div>
          </div>
        </CardContent></Card>
      </div>
      <Tabs defaultValue="searches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="searches">Searches</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>
        <TabsContent value="searches">
          {searches.map((search: any) => (
            <Card key={search.id}><CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div><p className="font-semibold">"{search.query}"</p>
                  <p className="text-sm text-muted-foreground">{search.resultCount} results • {search.executionTime}ms</p></div>
                <Badge>{(search.avgRelevance * 100).toFixed(0)}% relevant</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="performance"><p className="text-muted-foreground">Search performance metrics and latency analysis</p></TabsContent>
        <TabsContent value="config"><p className="text-muted-foreground">Semantic search model and configuration</p></TabsContent>
      </Tabs>
    </div>
  );
}
