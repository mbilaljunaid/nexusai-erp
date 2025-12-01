import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FileText } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ComplianceReports() {
  const { toast } = useToast();
  const [newReport, setNewReport] = useState({ name: "", framework: "GDPR", format: "PDF" });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["/api/compliance/reports"]
    
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/compliance/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json())
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/reports"] });
      setNewReport({ name: "", framework: "GDPR", format: "PDF" });
      toast({ title: "Report created" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/compliance/reports/${id}`, { method: "DELETE" })
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance/reports"] });
      toast({ title: "Report deleted" });
    }
  });

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="w-8 h-8" />Compliance Reports</h1>
        <p className="text-muted-foreground mt-1">Generate compliance and regulatory reports</p>
      </div>

      <Card data-testid="card-new-report">
        <CardHeader><CardTitle className="text-base">Create Report</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Report name" value={newReport.name} onChange={(e) => setNewReport({ ...newReport, name: e.target.value })} data-testid="input-name" />
            <Select value={newReport.framework} onValueChange={(v) => setNewReport({ ...newReport, framework: v })}>
              <SelectTrigger data-testid="select-framework"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="GDPR">GDPR</SelectItem>
                <SelectItem value="SOC2">SOC 2</SelectItem>
                <SelectItem value="ISO27001">ISO 27001</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newReport.format} onValueChange={(v) => setNewReport({ ...newReport, format: v })}>
              <SelectTrigger data-testid="select-format"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="Excel">Excel</SelectItem>
                <SelectItem value="CSV">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newReport)} disabled={createMutation.isPending || !newReport.name} className="w-full" data-testid="button-create-report">
            <Plus className="w-4 h-4 mr-2" /> Create Report
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? <p>Loading...</p> : reports.length === 0 ? <p className="text-muted-foreground text-center py-4">No reports</p> : reports.map((report: any) => (
          <Card key={report.id} data-testid={`report-${report.id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{report.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Framework: {report.framework} • Format: {report.format}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(report.id)} data-testid={`button-delete-${report.id}`}>
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
