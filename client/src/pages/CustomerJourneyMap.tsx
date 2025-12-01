import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomerJourneyMap() {
  const { toast } = useToast();
  const [newStage, setNewStage] = useState({ stage: "", count: "", conversion: "" });

  const { data: stages = [], isLoading } = useQuery({
    queryKey: ["/api/journey-stages"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/journey-stages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journey-stages"] });
      setNewStage({ stage: "", count: "", conversion: "" });
      toast({ title: "Journey stage added" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/journey-stages/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journey-stages"] });
      toast({ title: "Journey stage deleted" });
    }
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Customer Journey Map</h1>
        <p className="text-muted-foreground mt-1">Track customer interactions across channels</p>
      </div>

      <Card data-testid="card-new-stage">
        <CardHeader><CardTitle className="text-base">Add Journey Stage</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Stage" value={newStage.stage} onChange={(e) => setNewStage({ ...newStage, stage: e.target.value })} data-testid="input-stage" />
            <Input placeholder="Count" type="number" value={newStage.count} onChange={(e) => setNewStage({ ...newStage, count: e.target.value })} data-testid="input-count" />
            <Input placeholder="Conversion %" value={newStage.conversion} onChange={(e) => setNewStage({ ...newStage, conversion: e.target.value })} data-testid="input-conversion" />
          </div>
          <Button onClick={() => createMutation.mutate(newStage)} disabled={createMutation.isPending || !newStage.stage} className="w-full" data-testid="button-add-stage">
            <Plus className="w-4 h-4 mr-2" /> Add Stage
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? <p>Loading...</p> : stages.length === 0 ? <p className="text-muted-foreground text-center py-4">No journey stages</p> : stages.map((s: any) => (
          <Card key={s.id} data-testid={`stage-${s.id}`} className="hover-elevate">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{s.stage}</h3>
                  <p className="text-sm text-muted-foreground">{s.count} leads • {s.conversion}% conversion</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(s.id)} data-testid={`button-delete-${s.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
