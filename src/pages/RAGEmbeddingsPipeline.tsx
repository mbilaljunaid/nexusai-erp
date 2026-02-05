import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Zap, BarChart3, Activity, Settings, Grid3x3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { IconNavigation } from "@/components/IconNavigation";

interface EmbeddingJob {
  id: string;
  name: string;
  status: "processing" | "completed" | "failed";
  vectors: number;
  documents: number;
}

export default function RAGEmbeddingsPipeline() {
  const [activeNav, setActiveNav] = useState("jobs");
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

  const navItems = [
    { id: "jobs", label: "Jobs", icon: Database, color: "text-blue-500" },
    { id: "vectors", label: "Vector Index", icon: Grid3x3, color: "text-purple-500" },
    { id: "config", label: "Config", icon: Settings, color: "text-gray-500" },
  ];

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
      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "jobs" && (
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <Card key={job.id} className="hover-elevate cursor-pointer"><CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{job.name}</p>
                  <p className="text-sm text-muted-foreground">{job.vectors.toLocaleString()} vectors • {job.documents} docs</p></div>
                <Badge variant={job.status === "completed" ? "default" : "secondary"}>{job.status}</Badge>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      {activeNav === "vectors" && <Card><CardContent className="p-6"><p className="text-muted-foreground">Vector index management and optimization</p></CardContent></Card>}
      {activeNav === "config" && <Card><CardContent className="p-6"><p className="text-muted-foreground">Embedding model and pipeline configuration</p></CardContent></Card>}
    </div>
  );
}
