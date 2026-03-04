import { useState, useEffect } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

export default function NCRManagement() {
  const { toast } = useToast();
  const [localNCRs, setLocalNCRs] = useState<any[]>([]);

  const { data: ncrs = [], isLoading } = useQuery({
    queryKey: ["/api/ncr"],
    queryFn: () => fetch("/api/ncr").then(r => r.json()).catch(() => []),
  });

  useEffect(() => {
    if (ncrs) {
      setLocalNCRs(ncrs);
    }
  }, [ncrs]);

  const saveMutation = useMutation({
    mutationFn: async (updatedNCRs: any[]) => {
      for (const n of updatedNCRs) {
        if (!n.id || String(n.id).startsWith('temp-')) {
          await fetch('/api/ncr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...n, id: undefined }) }).catch(() => { });
        } else {
          await apiRequest('PATCH', `/api/ncr/${n.id}`, n).catch(() => { });
        }
      }

      const deletedIds = ncrs.filter((c: any) => !updatedNCRs.find((uc: any) => uc.id === c.id)).map((c: any) => c.id);
      for (const id of deletedIds) {
        await fetch(`/api/ncr/${id}`, { method: 'DELETE' }).catch(() => { });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ncr"] });
      toast({ title: "NCRs saved successfully" });
    },
  });

  const criticalCount = ncrs.filter((n: any) => n.severity === "critical").length;
  const closedCount = ncrs.filter((n: any) => n.status === "closed").length;

  return (
    <StandardPage
      title="Non-Conformance Reports"
      description="Manage quality issues and corrective actions"
    >

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total NCRs</p>
            <p className="text-2xl font-bold">{ncrs.length}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Closed</p>
            <p className="text-2xl font-bold text-green-600">{closedCount}</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="text-2xl font-bold text-yellow-600">{ncrs.length - closedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Non-Conformance Reports (NCRs)</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocalNCRs([...localNCRs, { id: `temp-${Date.now()}`, product: "Product-A", defectCode: "DEF-001", severity: "medium", status: "open" }])}>
              <Plus className="w-4 h-4 mr-2" /> Add NCR
            </Button>
            <Button size="sm" onClick={() => saveMutation.mutate(localNCRs)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md bg-white">
            <InteractiveSpreadsheet
              data={localNCRs}
              columns={[
                {
                  id: "product",
                  header: "Product",
                  width: "250px",
                  cell: (row, index, updateRow) => (
                    <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="Product name" value={row.product || ''} onChange={(e) => updateRow("product", e.target.value)} />
                  )
                },
                {
                  id: "defectCode",
                  header: "Defect Code",
                  width: "200px",
                  cell: (row, index, updateRow) => (
                    <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="Defect Code" value={row.defectCode || ''} onChange={(e) => updateRow("defectCode", e.target.value)} />
                  )
                },
                {
                  id: "severity",
                  header: "Severity",
                  width: "150px",
                  cell: (row, index, updateRow) => (
                    <Select value={row.severity || 'medium'} onValueChange={(val) => updateRow("severity", val)}>
                      <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Severity" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  )
                },
                {
                  id: "status",
                  header: "Status",
                  width: "150px",
                  cell: (row, index, updateRow) => (
                    <Select value={row.status || 'open'} onValueChange={(val) => updateRow("status", val)}>
                      <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  )
                }
              ]}
              onChange={setLocalNCRs}
            />
          </div>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
