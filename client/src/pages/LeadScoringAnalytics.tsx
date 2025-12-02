import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LeadScoringAnalytics() {
  const { toast } = useToast();
  const [newInsight, setNewInsight] = useState({ metric: "", value: "" });

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ["/api/lead-scoring-insights"],
    queryFn: () => fetch("/api/lead-scoring-insights").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/lead-scoring-insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-scoring-insights"] });
      setNewInsight({ metric: "", value: "" });
      toast({ title: "Insight added" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/lead-scoring-insights/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-scoring-insights"] });
      toast({ title: "Insight deleted" });
    },
  });

  const avgScore = insights.length > 0 ? (insights.reduce((sum: number, i: any) => sum + parseFloat(i.value || 0), 0) / insights.length).toFixed(1) : "0";

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Lead Scoring Analytics</h1>
        <p className="text-muted-foreground mt-1">AI lead scoring insights and performance</p>
      </div>

      <Card data-testid="card-new-insight">
        <CardHeader><CardTitle className="text-base">Add Insight</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Metric" value={newInsight.metric} onChange={(e) => setNewInsight({ ...newInsight, metric: e.target.value })} data-testid="input-metric" />
            <Input placeholder="Value" value={newInsight.value} onChange={(e) => setNewInsight({ ...newInsight, value: e.target.value })} data-testid="input-value" />
          </div>
          <Button disabled={createMutation.isPending || !newInsight.metric} className="w-full" data-testid="button-add-insight">
            <Plus className="w-4 h-4 mr-2" /> Add Insight
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Lead Score</p>
            <p className="text-3xl font-bold mt-1">{avgScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Model Accuracy</p>
            <p className="text-3xl font-bold mt-1">87.3%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Insights</p>
            <p className="text-3xl font-bold mt-1">{insights.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Insights</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : insights.length === 0 ? <p className="text-muted-foreground text-center py-4">No insights</p> : insights.map((i: any) => (
            <div key={i.id} className="flex items-center justify-between p-2 border rounded" data-testid={`insight-${i.id}`}>
              <div>
                <p className="font-semibold text-sm">{i.metric}</p>
                <p className="text-xs text-muted-foreground">{i.value}</p>
              </div>
              <Button size="icon" variant="ghost" data-testid={`button-delete-${i.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
