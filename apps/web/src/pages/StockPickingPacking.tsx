import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StockPickingPacking() {
  const { toast } = useToast();
  const [newTask, setNewTask] = useState({ orderId: "", productId: "", quantity: "1", status: "pending", taskType: "pick" });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/pick-pack-tasks"],
    queryFn: () => fetch("/api/pick-pack-tasks").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/pick-pack-tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pick-pack-tasks"] });
      setNewTask({ orderId: "", productId: "", quantity: "1", status: "pending", taskType: "pick" });
      toast({ title: "Task created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/pick-pack-tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pick-pack-tasks"] });
      toast({ title: "Task deleted" });
    },
  });

  const completed = tasks.filter((t: any) => t.status === "completed").length;
  const pending = tasks.filter((t: any) => t.status === "pending").length;

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckSquare className="h-8 w-8" />
          Stock Picking & Packing
        </h1>
        <p className="text-muted-foreground mt-2">Order picking, packing, quality verification, and dispatch preparation</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Tasks</p>
            <p className="text-2xl font-bold">{tasks.length}</p>
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
            <p className="text-xs text-muted-foreground">Efficiency %</p>
            <p className="text-2xl font-bold">{tasks.length > 0 ? ((completed / tasks.length) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-task">
        <CardHeader><CardTitle className="text-base">Create Pick/Pack Task</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Order ID" value={newTask.orderId} onChange={(e) => setNewTask({ ...newTask, orderId: e.target.value })} data-testid="input-orderid" className="text-sm" />
            <Input placeholder="Product ID" value={newTask.productId} onChange={(e) => setNewTask({ ...newTask, productId: e.target.value })} data-testid="input-prodid" className="text-sm" />
            <Input placeholder="Quantity" type="number" value={newTask.quantity} onChange={(e) => setNewTask({ ...newTask, quantity: e.target.value })} data-testid="input-qty" className="text-sm" />
            <Select value={newTask.taskType} onValueChange={(v) => setNewTask({ ...newTask, taskType: v })}>
              <SelectTrigger data-testid="select-type" className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pick">Pick</SelectItem>
                <SelectItem value="pack">Pack</SelectItem>
                <SelectItem value="verify">Verify</SelectItem>
              </SelectContent>
            </Select>
            <Button disabled={createMutation.isPending || !newTask.orderId} size="sm" data-testid="button-create">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Tasks</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <p>Loading...</p> : tasks.length === 0 ? <p className="text-muted-foreground text-center py-4">No tasks</p> : tasks.map((t: any) => (
            <div key={t.id} className="p-2 border rounded text-sm hover-elevate flex items-center justify-between" data-testid={`task-${t.id}`}>
              <div className="flex-1">
                <p className="font-semibold">{t.orderId}</p>
                <p className="text-xs text-muted-foreground">{t.taskType}: {t.productId} • {t.quantity}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={t.status === "completed" ? "default" : "secondary"} className="text-xs">{t.status}</Badge>
                <Button size="icon" variant="ghost" data-testid={`button-delete-${t.id}`} className="h-7 w-7">
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
