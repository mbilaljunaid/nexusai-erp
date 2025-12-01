import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Lightbulb } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RecommendationEngine() {
  const { toast } = useToast();
  const [newRec, setNewRec] = useState({ recommendation: "", category: "sales", confidence: "0.85" });

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ["/api/recommendations"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/recommendations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      setNewRec({ recommendation: "", category: "sales", confidence: "0.85" });
      toast({ title: "Recommendation created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/recommendations/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({ title: "Recommendation deleted" });
    }
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Lightbulb className="w-8 h-8" />AI Recommendation Engine</h1>
        <p className="text-muted-foreground mt-1">Intelligent suggestions and insights</p>
      </div>

      <Card data-testid="card-new-recommendation">
        <CardHeader><CardTitle className="text-base">Create Recommendation</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Recommendation" value={newRec.recommendation} onChange={(e) => setNewRec({ ...newRec, recommendation: e.target.value })} data-testid="input-recommendation" />
            <Select value={newRec.category} onValueChange={(v) => setNewRec({ ...newRec, category: v })}>
              <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newRec.confidence} onValueChange={(v) => setNewRec({ ...newRec, confidence: v })}>
              <SelectTrigger data-testid="select-confidence"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0.7">70%</SelectItem>
                <SelectItem value="0.8">80%</SelectItem>
                <SelectItem value="0.9">90%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newRec)} disabled={createMutation.isPending || !newRec.recommendation} className="w-full" data-testid="button-create-recommendation">
            <Plus className="w-4 h-4 mr-2" /> Create Recommendation
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">AI Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : recommendations.length === 0 ? <p className="text-muted-foreground text-center py-4">No recommendations</p> : recommendations.map((r: any) => (
            <div key={r.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`recommendation-${r.id}`}>
              <div>
                <h3 className="font-semibold">{r.recommendation}</h3>
                <p className="text-sm text-muted-foreground">Category: {r.category}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge>{(r.confidence * 100).toFixed(0)}%</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(r.id)} data-testid={`button-delete-${r.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
