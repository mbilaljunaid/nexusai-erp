import { useState, useEffect } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

export default function StockPickingPacking() {
  const { toast } = useToast();
  const [localTasks, setLocalTasks] = useState<any[]>([]);

  const { data: tasks = [], isLoading } = useQuery<any>({
    queryKey: ["/api/pick-pack-tasks"],
    queryFn: () => fetch("/api/pick-pack-tasks").then(r => r.json()).catch(() => []),
  });

  useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  const saveMutation = useMutation({
    mutationFn: async (updatedTasks: any[]) => {
      for (const t of updatedTasks) {
        if (!t.id || String(t.id).startsWith('temp-')) {
          await fetch('/api/pick-pack-tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...t, id: undefined }) }).catch(() => { });
        } else {
          await apiRequest('PATCH', `/api/pick-pack-tasks/${t.id}`, t).catch(() => { });
        }
      }

      const deletedIds = tasks.filter((c: any) => !updatedTasks.find((uc: any) => uc.id === c.id)).map((c: any) => c.id);
      for (const id of deletedIds) {
        await fetch(`/api/pick-pack-tasks/${id}`, { method: 'DELETE' }).catch(() => { });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pick-pack-tasks"] });
      toast({ title: "Tasks saved successfully" });
    },
  });

  const completed = tasks.filter((t: any) => t.status === "completed").length;
  const pending = tasks.filter((t: any) => t.status === "pending").length;

  return (
    <StandardPage
      title="Stock Picking & Packing"
      description="Order picking, packing, quality verification, and dispatch preparation"
    >
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Pick/Pack Tasks</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocalTasks([...localTasks, { id: `temp-${Date.now()}`, orderId: "", productId: "", quantity: "1", status: "pending", taskType: "pick" }])}>
              <Plus className="w-4 h-4 mr-2" /> Add Task
            </Button>
            <Button size="sm" onClick={() => saveMutation.mutate(localTasks)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md bg-card">
            <InteractiveSpreadsheet
              data={localTasks}
              columns={[
                {
                  id: "orderId",
                  header: "Order ID",
                  width: "200px",
                  cell: (row, index, updateRow) => (
                    <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="Order ID" value={row.orderId || ''} onChange={(e) => updateRow("orderId", e.target.value)} />
                  )
                },
                {
                  id: "productId",
                  header: "Product ID",
                  width: "200px",
                  cell: (row, index, updateRow) => (
                    <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="Product ID" value={row.productId || ''} onChange={(e) => updateRow("productId", e.target.value)} />
                  )
                },
                {
                  id: "quantity",
                  header: "Quantity",
                  width: "120px",
                  cell: (row, index, updateRow) => (
                    <Input type="number" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="1" value={row.quantity || ''} onChange={(e) => updateRow("quantity", e.target.value)} />
                  )
                },
                {
                  id: "taskType",
                  header: "Type",
                  width: "150px",
                  cell: (row, index, updateRow) => (
                    <Select value={row.taskType || 'pick'} onValueChange={(val) => updateRow("taskType", val)}>
                      <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pick">Pick</SelectItem>
                        <SelectItem value="pack">Pack</SelectItem>
                        <SelectItem value="verify">Verify</SelectItem>
                      </SelectContent>
                    </Select>
                  )
                },
                {
                  id: "status",
                  header: "Status",
                  width: "150px",
                  cell: (row, index, updateRow) => (
                    <Select value={row.status || 'pending'} onValueChange={(val) => updateRow("status", val)}>
                      <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )
                }
              ]}
              onChange={setLocalTasks}
            />
          </div>
        </CardContent>
      </Card>
    </StandardPage >
  );
}
