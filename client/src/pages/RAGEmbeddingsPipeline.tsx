import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Zap, BarChart3, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface EmbeddingJob {
  id: string;
  name: string;
  status: "processing" | "completed" | "failed";
  vectors: number;
  documents: number;
}

export default function RAGEmbeddingsPipeline() {
  const { data: jobs = [] } = useQuery<EmbeddingJob[]>({
    queryKey: ["/api/rag/embeddings"],
    retry: false,
  });

  const stats = {
    total: jobs.length,
    processing: jobs.filter((j: any) => j.status === "processing").length,
    completed: jobs.filter((j: any) => j.status === "completed").length,
    vectors: jobs.reduce((sum: number, j: any) => sum + (j.vectors || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-semibold">RAG Embeddings Pipeline</h1>
        <p className="text-muted-foreground text-sm">Vector DB and semantic search infrastructure</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-blue-500" />
            <div><p className="text-2xl font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Jobs</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-yellow-500" />
            <div><p className="text-2xl font-semibold">{stats.processing}</p>
              <p className="text-xs text-muted-foreground">Processing</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-green-500" />
            <div><p className="text-2xl font-semibold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Complete</p></div>
          </div>
        </CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <div><p className="text-2xl font-semibold">{(stats.vectors / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Vectors</p></div>
          </div>
        </CardContent></Card>
      </div>
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="vectors">Vector Index</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs">
          {jobs.map((job: any) => (
            <Card key={job.id}><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{job.name}</p>
                  <p className="text-sm text-muted-foreground">{job.vectors.toLocaleString()} vectors • {job.documents} docs</p></div>
                <Badge variant={job.status === "completed" ? "default" : "secondary"}>{job.status}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="vectors"><p className="text-muted-foreground">Vector index management and optimization</p></TabsContent>
        <TabsContent value="config"><p className="text-muted-foreground">Embedding model and pipeline configuration</p></TabsContent>
      </Tabs>
    </div>
  );
}
