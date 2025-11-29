import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitMerge, Database, LinkIcon, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ConsolidationEngine() {
  const { data: consolidations = [] } = useQuery({
    queryKey: ["/api/consolidations"],
    retry: false,
  });

  const stats = {
    total: consolidations.length,
    inProgress: consolidations.filter((c: any) => c.status === "in_progress").length,
    completed: consolidations.filter((c: any) => c.status === "completed").length,
    entities: consolidations.reduce((sum: number, c: any) => sum + (c.entityCount || 0), 0),
  };

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

      <Tabs defaultValue="consolidations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consolidations">Consolidations</TabsTrigger>
          <TabsTrigger value="eliminations">Eliminations</TabsTrigger>
          <TabsTrigger value="mappings">Mappings</TabsTrigger>
        </TabsList>
        <TabsContent value="consolidations">
          {consolidations.map((con: any) => (
            <Card key={con.id}><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{con.name}</p>
                  <p className="text-sm text-muted-foreground">{con.entityCount} entities • Period: {con.period}</p></div>
                <Badge variant={con.status === "completed" ? "default" : "secondary"}>{con.status}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="eliminations"><p className="text-muted-foreground">Inter-company eliminations and adjustments</p></TabsContent>
        <TabsContent value="mappings"><p className="text-muted-foreground">Entity and account mappings</p></TabsContent>
      </Tabs>
    </div>
  );
}
