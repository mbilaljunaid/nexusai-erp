import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Beaker, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function BatchOrdersManagement() {
  const { toast } = useToast();
  const [localBatches, setLocalBatches] = useState<any[]>([]);

  const { data: batches = [], isLoading } = useQuery<any>({
    queryKey: ["/api/batch-orders"],
    queryFn: () => fetch("/api/batch-orders").then(r => r.json()).catch(() => []),
  });

  useEffect(() => {
    if (batches) {
      setLocalBatches(batches);
    }
  }, [batches]);

  const saveMutation = useMutation({
    mutationFn: async (updatedBatches: any[]) => {
      for (const batch of updatedBatches) {
        if (!batch.id || String(batch.id).startsWith('temp-')) {
          await fetch("/api/batch-orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...batch, id: undefined }) });
        } else {
          await apiRequest("PATCH", `/api/batch-orders/${batch.id}`, batch).catch(() => { });
        }
      }

      const deletedIds = batches.filter((c: any) => !updatedBatches.find((uc) => uc.id === c.id)).map((c: any) => c.id);
      for (const id of deletedIds) {
        await fetch(`/api/batch-orders/${id}`, { method: "DELETE" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch-orders"] });
      toast({ title: "Batch orders saved successfully" });
    },
  });

  const completed = batches.filter((b: any) => b.status === "completed").length;
  const inProgress = batches.filter((b: any) => b.status === "in-progress").length;

  return (
    <StandardPage
      title="Batch Manufacturing Execution"
      description="Batch orders, material issue, operation recording, and yield tracking"
    >
      <div className="space-y-6">

        <div className="grid grid-cols-4 gap-3">
          <Card className="p-3">
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Total Batches</p>
              <p className="text-2xl font-bold">{batches.length}</p>
            </CardContent>
          </Card>
          <Card className="p-3">
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
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
              <p className="text-2xl font-bold">{batches.length > 0 ? ((completed / batches.length) * 100).toFixed(0) : 0}%</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-none shadow-lg">
          <CardHeader className="bg-muted/30 pb-4 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Batch Orders Grid</CardTitle>
              <CardDescription>Inline editable spreadsheet for manufacturing batch execution</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocalBatches([...localBatches, { id: `temp-${Date.now()}`, batchId: '', formulaId: '', quantity: '100', status: 'planned' }])}>
                <Plus className="w-4 h-4 mr-2" /> Add Batch
              </Button>
              <Button onClick={() => saveMutation.mutate(localBatches)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading batch orders...</div>
            ) : (
              <InteractiveSpreadsheet
                data={localBatches}
                columns={[
                  {
                    id: "batchId",
                    header: "Batch ID",
                    width: "200px",
                    cell: (row, index, updateRow) => (
                      <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-medium" placeholder="Batch #" value={row.batchId || ''} onChange={(e) => updateRow("batchId", e.target.value)} />
                    )
                  },
                  {
                    id: "formulaId",
                    header: "Formula ID",
                    width: "200px",
                    cell: (row, index, updateRow) => (
                      <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="Formula #" value={row.formulaId || ''} onChange={(e) => updateRow("formulaId", e.target.value)} />
                    )
                  },
                  {
                    id: "quantity",
                    header: "Quantity",
                    width: "150px",
                    cell: (row, index, updateRow) => (
                      <Input type="number" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right" placeholder="0" value={row.quantity || ''} onChange={(e) => updateRow("quantity", e.target.value)} />
                    )
                  },
                  {
                    id: "status",
                    header: "Status",
                    width: "150px",
                    cell: (row, index, updateRow) => (
                      <Select value={row.status || 'planned'} onValueChange={(val) => updateRow("status", val)}>
                        <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )
                  }
                ]}
                onChange={setLocalBatches}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </StandardPage>
  );
}
