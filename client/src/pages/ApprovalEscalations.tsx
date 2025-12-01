import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ApprovalEscalations() {
  const { toast } = useToast();
  const [newEscalation, setNewEscalation] = useState({ rule: "", trigger: "overdue", action: "notify_manager", days: "2" });

  const { data: escalations = [], isLoading } = useQuery({
    queryKey: ["/api/escalation-rules"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/escalation-rules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/escalation-rules"] });
      setNewEscalation({ rule: "", trigger: "overdue", action: "notify_manager", days: "2" });
      toast({ title: "Escalation rule created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/escalation-rules/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/escalation-rules"] });
      toast({ title: "Escalation rule deleted" });
    }
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertCircle className="h-8 w-8" />
          Approval Escalations
        </h1>
        <p className="text-muted-foreground mt-2">Define escalation rules for pending approvals</p>
      </div>

      <Card data-testid="card-new-escalation">
        <CardHeader><CardTitle className="text-base">Create Escalation Rule</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Rule name" value={newEscalation.rule} onChange={(e) => setNewEscalation({ ...newEscalation, rule: e.target.value })} data-testid="input-rule" />
            <Select value={newEscalation.trigger} onValueChange={(v) => setNewEscalation({ ...newEscalation, trigger: v })}>
              <SelectTrigger data-testid="select-trigger"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="stalled">Stalled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newEscalation.action} onValueChange={(v) => setNewEscalation({ ...newEscalation, action: v })}>
              <SelectTrigger data-testid="select-action"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="notify_manager">Notify Manager</SelectItem>
                <SelectItem value="reassign">Reassign</SelectItem>
                <SelectItem value="auto_approve">Auto-Approve</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Days" type="number" value={newEscalation.days} onChange={(e) => setNewEscalation({ ...newEscalation, days: e.target.value })} data-testid="input-days" />
          </div>
          <Button onClick={() => createMutation.mutate(newEscalation)} disabled={createMutation.isPending || !newEscalation.rule} className="w-full" data-testid="button-create-rule">
            <Plus className="w-4 h-4 mr-2" /> Create Rule
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Rules</p>
            <p className="text-2xl font-bold">{escalations.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Overdue Triggers</p>
            <p className="text-2xl font-bold text-yellow-600">{escalations.filter((e: any) => e.trigger === "overdue").length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{escalations.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Escalation Rules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : escalations.length === 0 ? <p className="text-muted-foreground text-center py-4">No escalation rules</p> : escalations.map((e: any) => (
            <div key={e.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`escalation-${e.id}`}>
              <div className="flex-1">
                <h3 className="font-semibold">{e.rule}</h3>
                <p className="text-sm text-muted-foreground">Trigger: {e.trigger} • Action: {e.action} • After {e.days} days</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(e.id)} data-testid={`button-delete-${e.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
