import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ChurnRiskAnalysis() {
  const { toast } = useToast();
  const [newRisk, setNewRisk] = useState({ customer: "", risk: "Medium", score: "" });

  const { data: risks = [], isLoading } = useQuery({
    queryKey: ["/api/churn-risks"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/churn-risks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/churn-risks"] });
      setNewRisk({ customer: "", risk: "Medium", score: "" });
      toast({ title: "Churn risk added" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/churn-risks/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/churn-risks"] });
      toast({ title: "Churn risk deleted" });
    }
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Churn Risk Analysis</h1>
        <p className="text-muted-foreground mt-1">Customer churn prediction and prevention</p>
      </div>

      <Card data-testid="card-new-risk">
        <CardHeader><CardTitle className="text-base">Add Churn Risk</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Customer" value={newRisk.customer} onChange={(e) => setNewRisk({ ...newRisk, customer: e.target.value })} data-testid="input-customer" />
            <Select value={newRisk.risk} onValueChange={(v) => setNewRisk({ ...newRisk, risk: v })}>
              <SelectTrigger data-testid="select-risk"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Score" type="number" value={newRisk.score} onChange={(e) => setNewRisk({ ...newRisk, score: e.target.value })} data-testid="input-score" />
          </div>
          <Button onClick={() => createMutation.mutate(newRisk)} disabled={createMutation.isPending || !newRisk.customer} className="w-full" data-testid="button-add-risk">
            <Plus className="w-4 h-4 mr-2" /> Add Risk
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          {isLoading ? <p>Loading...</p> : risks.length === 0 ? <p className="text-muted-foreground text-center py-4">No churn risks</p> : risks.map((item: any) => (
            <div key={item.id} className="p-3 border rounded flex items-start justify-between" data-testid={`risk-${item.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{item.customer}</p>
                <p className="text-sm text-muted-foreground">Risk Score: {item.score}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge className={item.risk === "High" ? "bg-red-100 text-red-800" : item.risk === "Medium" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}>{item.risk} Risk</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(item.id)} data-testid={`button-delete-${item.id}`}>
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
