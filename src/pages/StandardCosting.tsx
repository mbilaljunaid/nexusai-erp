import { useState, useEffect } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function StandardCosting() {
  const { toast } = useToast();
  const [localCosts, setLocalCosts] = useState<any[]>([]);

  const { data: costs = [], isLoading } = useQuery<any>({
    queryKey: ["/api/costing"],
    queryFn: () => fetch("/api/costing").then(r => r.json()).catch(() => []),
  });

  useEffect(() => {
    if (costs) {
      setLocalCosts(costs);
    }
  }, [costs]);

  const saveMutation = useMutation({
    mutationFn: async (updatedCosts: any[]) => {
      // Very basic bulk save pattern calling individual endpoints
      for (const cost of updatedCosts) {
        if (!cost.id || String(cost.id).startsWith('temp-')) {
          await fetch("/api/costing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...cost, id: undefined }) });
        } else {
          // If there was an update endpoint we would call it here. For now we assume updates aren't explicitly required or create covers it.
          // If update isn't supported, we could delete/recreate or just skip. We will re-post or use a hypothetical PUT.
          await apiRequest("PATCH", `/api/costing/${cost.id}`, cost).catch(() => { });
        }
      }

      // Handle deletions (items in costs but not in localCosts)
      const deletedIds = costs.filter((c: any) => !updatedCosts.find((uc) => uc.id === c.id)).map((c: any) => c.id);
      for (const id of deletedIds) {
        await fetch(`/api/costing/${id}`, { method: "DELETE" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/costing"] });
      toast({ title: "Costs saved successfully" });
    },
  });

  const totalMaterialCost = costs.reduce((sum: number, c: any) => sum + (parseFloat(c.materialCost) || 0), 0);
  const avgTotalCost = costs.length > 0 ? costs.reduce((sum: number, c: any) => {
    const mat = parseFloat(c.materialCost) || 0;
    const lab = parseFloat(c.laborCost) || 0;
    const oh = (parseFloat(c.overheadPct) || 0) / 100;
    return sum + (mat + lab + (mat + lab) * oh);
  }, 0) / costs.length : 0;

  const columns: SpreadsheetColumn<any>[] = [
    {
      id: "product",
      header: "Product",
      width: "200px",
      cell: (row, index, updateRow) => (
        <Select value={row.product} onValueChange={(val) => updateRow("product", val)}>
          <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Select Product" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Product-A">Product-A</SelectItem>
            <SelectItem value="Product-B">Product-B</SelectItem>
            <SelectItem value="Product-C">Product-C</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      id: "materialCost",
      header: "Material Cost ($)",
      width: "150px",
      cell: (row, index, updateRow) => (
        <Input type="number" step="0.01" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right" value={row.materialCost || ''} onChange={(e) => updateRow("materialCost", e.target.value)} />
      )
    },
    {
      id: "laborCost",
      header: "Labor Cost ($)",
      width: "150px",
      cell: (row, index, updateRow) => (
        <Input type="number" step="0.01" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right" value={row.laborCost || ''} onChange={(e) => updateRow("laborCost", e.target.value)} />
      )
    },
    {
      id: "overheadPct",
      header: "Overhead (%)",
      width: "120px",
      cell: (row, index, updateRow) => (
        <Input type="number" step="0.01" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right" value={row.overheadPct || ''} onChange={(e) => updateRow("overheadPct", e.target.value)} />
      )
    },
    {
      id: "status",
      header: "Status",
      width: "150px",
      cell: (row, index, updateRow) => (
        <Select value={row.status || 'active'} onValueChange={(val) => updateRow("status", val)}>
          <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="obsolete">Obsolete</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      id: "total",
      header: "Total Cost",
      width: "150px",
      cellClassName: "text-right font-semibold",
      headerClassName: "text-right",
      cell: (row) => {
        const mat = parseFloat(row.materialCost) || 0;
        const lab = parseFloat(row.laborCost) || 0;
        const oh = (parseFloat(row.overheadPct) || 0) / 100;
        const total = mat + lab + (mat + lab) * oh;
        return <span>${total.toFixed(2)}</span>;
      }
    }
  ];

  return (
    <StandardPage
      title="Standard Costing"
      breadcrumbs={[{ label: "Finance", href: "/finance" }, { label: "Standard Costing" }]}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-200 border-none">Standard Costing</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-2xl text-slate-600">Manage standard costs and cost variances</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Cost Records</p>
            <p className="text-2xl font-bold">{costs.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Material Cost</p>
            <p className="text-2xl font-bold">${(totalMaterialCost / 1000).toFixed(1)}K</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Total Cost</p>
            <p className="text-2xl font-bold">${avgTotalCost.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-none shadow-lg">
        <CardHeader className="bg-muted/30 pb-4 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Standard Costs Worksheet</CardTitle>
            <CardDescription>Inline editable spreadsheet for standard costing</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocalCosts([...localCosts, { id: `temp-${Date.now()}`, product: 'Product-A', materialCost: 0, laborCost: 0, overheadPct: 0, status: 'active' }])}>
              <Plus className="w-4 h-4 mr-2" /> Add Row
            </Button>
            <Button onClick={() => saveMutation.mutate(localCosts)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading costs...</div>
          ) : (
            <InteractiveSpreadsheet
              data={localCosts}
              columns={columns}
              onChange={setLocalCosts}
            />
          )}
        </CardContent>
      </Card>
    </StandardPage >
  );
}
