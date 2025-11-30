import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileText } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ReportBuilder() {
  const { toast } = useToast();
  const [newReport, setNewReport] = useState({ name: "", type: "Sales", frequency: "Monthly" });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/analytics/reports"],
    queryFn: () => fetch("/api/analytics/reports").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/analytics/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/reports"] });
      setNewReport({ name: "", type: "Sales", frequency: "Monthly" });
      toast({ title: "Report created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/analytics/reports/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/reports"] });
      toast({ title: "Report deleted" });
    },
  });

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="w-8 h-8" />Report Builder</h1>
          <p className="text-muted-foreground mt-1">Create and schedule custom reports</p>
        </div>
      </div>

      <Card data-testid="card-new-report">
        <CardHeader><CardTitle className="text-base">Create Report</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Report name" value={newReport.name} onChange={(e) => setNewReport({ ...newReport, name: e.target.value })} data-testid="input-name" />
            <Select value={newReport.type} onValueChange={(v) => setNewReport({ ...newReport, type: v })}>
              <SelectTrigger data-testid="select-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newReport.frequency} onValueChange={(v) => setNewReport({ ...newReport, frequency: v })}>
              <SelectTrigger data-testid="select-frequency"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newReport)} disabled={createMutation.isPending || !newReport.name} className="w-full" data-testid="button-new-report">
            <Plus className="w-4 h-4 mr-2" /> Create Report
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? <p>Loading...</p> : reports.length === 0 ? <p className="text-muted-foreground text-center py-4">No reports</p> : reports.map((rep: any) => (
          <Card key={rep.id} className="hover:shadow-lg transition" data-testid={`report-${rep.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{rep.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{rep.type} • {rep.frequency}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(rep.id)} data-testid={`button-delete-${rep.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
