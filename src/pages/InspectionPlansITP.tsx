import { useState, useEffect } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function InspectionPlansITP() {
  const { toast } = useToast();
  const [localPlans, setLocalPlans] = useState<any[]>([]);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["/api/inspection-plans"],
    queryFn: () => fetch("/api/inspection-plans").then(r => r.json()).catch(() => []),
  });

  useEffect(() => {
    if (plans) {
      setLocalPlans(plans);
    }
  }, [plans]);

  const saveMutation = useMutation({
    mutationFn: async (updatedPlans: any[]) => {
      for (const plan of updatedPlans) {
        if (!plan.id || String(plan.id).startsWith('temp-')) {
          await fetch("/api/inspection-plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...plan, id: undefined }) });
        } else {
          await apiRequest("PATCH", `/api/inspection-plans/${plan.id}`, plan).catch(() => { });
        }
      }

      const deletedIds = plans.filter((c: any) => !updatedPlans.find((uc) => uc.id === c.id)).map((c: any) => c.id);
      for (const id of deletedIds) {
        await fetch(`/api/inspection-plans/${id}`, { method: "DELETE" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspection-plans"] });
      toast({ title: "Inspection plans saved successfully" });
    },
  });

  const active = plans.filter((p: any) => p.status === "active").length;
  const avgSampleSize = plans.length > 0 ? (plans.reduce((sum: number, p: any) => sum + (parseFloat(p.sampleSize) || 0), 0) / plans.length).toFixed(0) : 0;

  const columns: SpreadsheetColumn<any>[] = [
    {
      id: "partNumber",
      header: "Part Number",
      width: "200px",
      cell: (row, index, updateRow) => (
        <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-medium" placeholder="Part #" value={row.partNumber || ''} onChange={(e) => updateRow("partNumber", e.target.value)} />
      )
    },
    {
      id: "itpType",
      header: "Inspection Type",
      width: "150px",
      cell: (row, index, updateRow) => (
        <Select value={row.itpType || 'incoming'} onValueChange={(val) => updateRow("itpType", val)}>
          <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="incoming">Incoming</SelectItem>
            <SelectItem value="in-process">In-Process</SelectItem>
            <SelectItem value="final">Final</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      id: "sampleSize",
      header: "Sample Size",
      width: "120px",
      cell: (row, index, updateRow) => (
        <Input type="number" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right" placeholder="0" value={row.sampleSize || ''} onChange={(e) => updateRow("sampleSize", e.target.value)} />
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
          </SelectContent>
        </Select>
      )
    }
  ];

  return (
    <StandardPage
      title="Inspection Plans (ITP)"
      breadcrumbs={[{ label: "Manufacturing", href: "/manufacturing" }, { label: "Inspection Plans" }]}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-none">
          Inspection Plans (ITP)
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-2xl text-slate-600">Incoming, in-process, final inspections, and SPC monitoring</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Plans</p>
            <p className="text-2xl font-bold">{plans.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{active}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Sample Size</p>
            <p className="text-2xl font-bold">{avgSampleSize}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{plans.length - active}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-none shadow-lg">
        <CardHeader className="bg-muted/30 pb-4 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Inspection Plans Grid</CardTitle>
            <CardDescription>Inline editable spreadsheet for quality test plans</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocalPlans([...localPlans, { id: `temp-${Date.now()}`, partNumber: '', itpType: 'incoming', sampleSize: '5', status: 'draft' }])}>
              <Plus className="w-4 h-4 mr-2" /> Add Plan
            </Button>
            <Button onClick={() => saveMutation.mutate(localPlans)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading plans...</div>
          ) : (
            <InteractiveSpreadsheet
              data={localPlans}
              columns={columns}
              onChange={setLocalPlans}
            />
          )}
        </CardContent>
      </Card>
    </StandardPage>
  );
}
