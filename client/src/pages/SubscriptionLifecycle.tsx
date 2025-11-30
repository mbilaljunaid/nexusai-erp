import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionLifecycle() {
  const { toast } = useToast();
  const [newChange, setNewChange] = useState({ changeId: "", subscriberId: "", changeType: "upgrade", fromPlan: "", toPlan: "", status: "pending" });

  const { data: changes = [], isLoading } = useQuery({
    queryKey: ["/api/subscription-changes"],
    queryFn: () => fetch("/api/subscription-changes").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/subscription-changes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-changes"] });
      setNewChange({ changeId: "", subscriberId: "", changeType: "upgrade", fromPlan: "", toPlan: "", status: "pending" });
      toast({ title: "Change created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/subscription-changes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-changes"] });
      toast({ title: "Change deleted" });
    },
  });

  const completed = changes.filter((c: any) => c.status === "completed").length;
  const pending = changes.filter((c: any) => c.status === "pending").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitBranch className="h-8 w-8" />
          Subscription Lifecycle Management
        </h1>
        <p className="text-muted-foreground mt-2">Plan upgrades, downgrades, add-ons, and subscription modifications</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Changes</p>
            <p className="text-2xl font-bold">{changes.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Completion %</p>
            <p className="text-2xl font-bold">{changes.length > 0 ? ((completed / changes.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-change">
        <CardHeader><CardTitle className="text-base">Create Subscription Change</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Change ID" value={newChange.changeId} onChange={(e) => setNewChange({ ...newChange, changeId: e.target.value })} data-testid="input-chid" className="text-sm" />
            <Input placeholder="Subscriber ID" value={newChange.subscriberId} onChange={(e) => setNewChange({ ...newChange, subscriberId: e.target.value })} data-testid="input-subid" className="text-sm" />
            <Select value={newChange.changeType} onValueChange={(v) => setNewChange({ ...newChange, changeType: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="upgrade">Upgrade</SelectItem>
                <SelectItem value="downgrade">Downgrade</SelectItem>
                <SelectItem value="addon">Add-on</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="To Plan" value={newChange.toPlan} onChange={(e) => setNewChange({ ...newChange, toPlan: e.target.value })} data-testid="input-toplan" className="text-sm" />
            <Button onClick={() => createMutation.mutate(newChange)} disabled={createMutation.isPending || !newChange.changeId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Changes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : changes.length === 0 ? <p className="text-muted-foreground text-center py-4">No changes</p> : changes.map((c: any) => (
            <div key={c.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`change-${c.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{c.changeId}</p>
                <p className="text-xs text-muted-foreground">{c.subscriberId} • {c.changeType}: {c.toPlan}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={c.status === "completed" ? "default" : "secondary"} className="text-xs">{c.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-${c.id}`} className="h-7 w-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
