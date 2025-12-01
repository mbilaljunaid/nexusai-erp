import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Trash2, CheckCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WIPTracking() {
  const { toast } = useToast();
  const [newWIP, setNewWIP] = useState({ workOrder: "WO-001", operation: "Assembly", status: "queued" });

  const { data: wipItems = [], isLoading } = useQuery({
    queryKey: ["/api/wip"],
    queryFn: () => fetch("/api/wip").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/wip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wip"] });
      setNewWIP({ workOrder: "WO-001", operation: "Assembly", status: "queued" });
      toast({ title: "WIP item created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/wip/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wip"] });
      toast({ title: "WIP item deleted" });
    },
  });

  const completed = wipItems.filter((w: any) => w.status === "completed").length;
  const running = wipItems.filter((w: any) => w.status === "running").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Zap className="h-8 w-8" />
          WIP Tracking
        </h1>
        <p className="text-muted-foreground mt-2">Track work-in-process across operations</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total WIP</p>
            <p className="text-2xl font-bold">{wipItems.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Running</p>
            <p className="text-2xl font-bold text-blue-600">{running}</p>
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
            <p className="text-2xl font-bold">{wipItems.length > 0 ? ((completed / wipItems.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-wip">
        <CardHeader><CardTitle className="text-base">Add WIP Item</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <input placeholder="Work Order" value={newWIP.workOrder} onChange={(e) => setNewWIP({ ...newWIP, workOrder: e.target.value })} className="px-3 py-2 border rounded" data-testid="input-wo" />
            <input placeholder="Operation" value={newWIP.operation} onChange={(e) => setNewWIP({ ...newWIP, operation: e.target.value })} className="px-3 py-2 border rounded" data-testid="input-op" />
            <Select value={newWIP.status} onValueChange={(v) => setNewWIP({ ...newWIP, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => createMutation.mutate(newWIP)} disabled={createMutation.isPending} className="w-full" data-testid="button-add-wip">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">WIP Items</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>Loading...</p> : wipItems.length === 0 ? <p className="text-muted-foreground text-center py-4">No WIP items</p> : wipItems.map((w: any) => (
            <div key={w.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`wip-${w.id}`}>
              <div className="flex items-start gap-2 flex-1">
                {w.status === "completed" && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />}
                <div>
                  <p className="font-semibold text-sm">{w.workOrder} - {w.operation}</p>
                  <p className="text-xs text-muted-foreground">{w.status}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={w.status === "completed" ? "default" : "secondary"}>{w.status}</Badge>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(w.id)} data-testid={`button-delete-${w.id}`}>
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
