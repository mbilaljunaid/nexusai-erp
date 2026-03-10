import { useState, useEffect } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";

export default function SubcontractorManagement() {
  const { toast } = useToast();
  const [localSubs, setLocalSubs] = useState<any[]>([]);

  const { data: subs = [], isLoading } = useQuery<any>({
    queryKey: ["/api/subcontractors"],
    queryFn: () => fetch("/api/subcontractors").then(r => r.json()).catch(() => []),
  });

  useEffect(() => {
    if (subs) {
      setLocalSubs(subs);
    }
  }, [subs]);

  const saveMutation = useMutation({
    mutationFn: async (updatedSubs: any[]) => {
      for (const s of updatedSubs) {
        if (!s.id || String(s.id).startsWith('temp-')) {
          await fetch('/api/subcontractors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...s, id: undefined }) }).catch(() => { });
        } else {
          await apiRequest('PATCH', `/api/subcontractors/${s.id}`, s).catch(() => { });
        }
      }

      const deletedIds = subs.filter((c: any) => !updatedSubs.find((uc: any) => uc.id === c.id)).map((c: any) => c.id);
      for (const id of deletedIds) {
        await fetch(`/api/subcontractors/${id}`, { method: 'DELETE' }).catch(() => { });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subcontractors"] });
      toast({ title: "Subcontractors saved successfully" });
    },
  });

  const active = subs.filter((s: any) => s.status === "active").length;
  const totalValue = subs.reduce((sum: number, s: any) => sum + (parseFloat(s.contractValue) || 0), 0);

  return (
    <StandardPage
      title="Subcontractor Management"
      description="Contracts, payments, retention, and performance"
    >

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Subs</p>
            <p className="text-2xl font-bold">{subs.length}</p>
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
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">${(totalValue / 1000000).toFixed(2)}M</p>
          </CardContent>
        </Card>
        <Card className="p-3">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Avg Retention</p>
            <p className="text-2xl font-bold">{subs.length > 0 ? (subs.reduce((sum: number, s: any) => sum + (parseFloat(s.retentionPct) || 0), 0) / subs.length).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Subcontractors</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocalSubs([...localSubs, { id: `temp-${Date.now()}`, name: "", scope: "Concrete", contractValue: "100000", retentionPct: "10", status: "active" }])}>
              <Plus className="w-4 h-4 mr-2" /> Add Subcontractor
            </Button>
            <Button size="sm" onClick={() => saveMutation.mutate(localSubs)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md bg-card">
            <InteractiveSpreadsheet
              data={localSubs}
              columns={[
                {
                  id: "name",
                  header: "Name",
                  width: "250px",
                  cell: (row, index, updateRow) => (
                    <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="Name" value={row.name || ''} onChange={(e) => updateRow("name", e.target.value)} />
                  )
                },
                {
                  id: "scope",
                  header: "Scope",
                  width: "200px",
                  cell: (row, index, updateRow) => (
                    <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="Scope" value={row.scope || ''} onChange={(e) => updateRow("scope", e.target.value)} />
                  )
                },
                {
                  id: "contractValue",
                  header: "Contract Value",
                  width: "150px",
                  cell: (row, index, updateRow) => (
                    <Input type="number" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="100000" value={row.contractValue || ''} onChange={(e) => updateRow("contractValue", e.target.value)} />
                  )
                },
                {
                  id: "retentionPct",
                  header: "Retention %",
                  width: "120px",
                  cell: (row, index, updateRow) => (
                    <Input type="number" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="10" value={row.retentionPct || ''} onChange={(e) => updateRow("retentionPct", e.target.value)} />
                  )
                },
                {
                  id: "status",
                  header: "Status",
                  width: "150px",
                  cell: (row, index, updateRow) => (
                    <Select value={row.status || 'active'} onValueChange={(val) => updateRow("status", val)}>
                      <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )
                }
              ]}
              onChange={setLocalSubs}
            />
          </div>
        </CardContent>
      </Card>
    </StandardPage>
  );
}
