import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, GripVertical, Trash2, Download, Save, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ReportSpreadsheet } from "./ReportSpreadsheet";

interface ReportBuilderProps {
  module: string;
}

interface ReportField {
  id: string;
  label: string;
  field: string;
  type: "text" | "number" | "date" | "currency";
}

const MODULE_TEMPLATES = {
  crm: {
    transactional: [
      { name: "Lead Conversion Report", fields: ["id", "name", "status", "source", "value"] },
      { name: "Customer Contact Directory", fields: ["contact_name", "email", "phone", "company"] },
    ],
    periodical: [
      { name: "Monthly Sales Pipeline", fields: ["stage", "count", "total_value"] },
      { name: "Lead Source Analysis", fields: ["source", "leads", "conversion_rate"] },
    ],
  },
  finance: {
    transactional: [
      { name: "General Ledger Report", fields: ["account", "debit", "credit", "balance"] },
      { name: "Invoice Register", fields: ["invoice_no", "customer", "amount", "date", "status"] },
    ],
    periodical: [
      { name: "Income Statement", fields: ["account", "amount", "percentage"] },
      { name: "Budget vs Actual", fields: ["category", "budget", "actual", "variance"] },
    ],
  },
  supply_chain: {
    transactional: [
      { name: "Purchase Order Summary", fields: ["po_no", "vendor", "amount", "date", "status"] },
      { name: "Goods Receipt", fields: ["receipt_no", "po_no", "item", "qty", "date"] },
    ],
    periodical: [
      { name: "Vendor Performance", fields: ["vendor", "po_count", "on_time", "quality_score"] },
      { name: "Inventory Valuation", fields: ["item", "qty", "unit_cost", "total_value"] },
    ],
  },
  manufacturing: {
    transactional: [
      { name: "Work Order Status", fields: ["wo_no", "description", "status", "start_date", "end_date"] },
      { name: "BOM Costing", fields: ["item", "material_cost", "labor_cost", "total"] },
    ],
    periodical: [
      { name: "Production Report", fields: ["shift", "output", "defects", "efficiency"] },
      { name: "Equipment Utilization", fields: ["equipment", "hours_used", "capacity", "utilization_pct"] },
    ],
  },
  hr: {
    transactional: [
      { name: "Employee Directory", fields: ["emp_id", "name", "department", "role", "email"] },
      { name: "Attendance Log", fields: ["employee", "date", "status", "hours"] },
    ],
    periodical: [
      { name: "Payroll Summary", fields: ["employee", "base_salary", "deductions", "net"] },
      { name: "Headcount Report", fields: ["department", "total", "new_hires", "attrition"] },
    ],
  },
  projects: {
    transactional: [
      { name: "Project Task Report", fields: ["task_id", "title", "assignee", "status", "due_date"] },
      { name: "Time Entry", fields: ["employee", "project", "task", "hours", "date"] },
    ],
    periodical: [
      { name: "Project Status", fields: ["project", "completion_pct", "budget", "spent"] },
      { name: "Resource Utilization", fields: ["resource", "allocated", "used", "utilization_pct"] },
    ],
  },
};

export function ReportBuilder({ module }: ReportBuilderProps) {
  const [open, setOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState<"transactional" | "periodical">("transactional");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [fields, setFields] = useState<ReportField[]>([]);
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery<any[]>({
    queryKey: ["/api/reports", module],
  });

  const createReportMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", "/api/reports", {
        name: reportName,
        module,
        type: reportType,
        config: { columns: fields },
        template: false,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports", module] });
      toast({ title: "Report created", description: `"${reportName}" saved successfully` });
      setReportName("");
      setFields([]);
      setOpen(false);
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: (reportId: string) => apiRequest("DELETE", `/api/reports/${reportId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports", module] });
      toast({ title: "Report deleted" });
    },
  });

  const exportReportMutation = useMutation({
    mutationFn: (data: { reportId: string; format: "pdf" | "csv" | "docx" }) =>
      fetch(`/api/reports/${data.reportId}/export?format=${data.format}`).then((r) => r.blob()),
    onSuccess: (blob, data) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report.${data.format}`;
      a.click();
      toast({ title: "Export successful" });
    },
  });

  const templates = (MODULE_TEMPLATES as any)[module]?.[reportType] || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-report">
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>Design a custom report or use a template</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Report name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                data-testid="input-report-name"
              />
              <div className="grid grid-cols-2 gap-4">
                <Select value={reportType} onValueChange={(v: any) => setReportType(v)}>
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="periodical">Periodical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {templates.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Select Template</label>
                  <div className="grid gap-2 mt-2">
                    {templates.map((t: any) => (
                      <Card
                        key={t.name}
                        className="p-3 cursor-pointer hover-elevate"
                        onClick={() => {
                          setSelectedTemplate(t.name);
                          setFields(
                            t.fields.map((f: string, i: number) => ({
                              id: i.toString(),
                              label: f.charAt(0).toUpperCase() + f.slice(1),
                              field: f,
                              type: "text" as const,
                            }))
                          );
                        }}
                        data-testid={`card-template-${t.name}`}
                      >
                        <p className="font-medium text-sm">{t.name}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Report Columns</label>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 p-2 bg-muted rounded"
                      data-testid={`field-${field.id}`}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{field.label}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setFields(fields.filter((f) => f.id !== field.id))}
                        data-testid={`button-remove-field-${field.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => createReportMutation.mutate({})}
                disabled={!reportName || fields.length === 0 || createReportMutation.isPending}
                className="w-full"
                data-testid="button-save-report"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {reports.length > 0 ? (
          reports.map((report: any) => (
            <Card key={report.id} className="hover-elevate" data-testid={`card-report-${report.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{report.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {report.type} • {report.config?.columns?.length || 0} columns
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={viewingReportId === report.id} onOpenChange={(isOpen) => setViewingReportId(isOpen ? report.id : null)}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-view-report-${report.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-screen overflow-auto">
                        <DialogHeader>
                          <DialogTitle>{report.name}</DialogTitle>
                        </DialogHeader>
                        <ReportSpreadsheet data={[]} columns={report.config?.columns || []} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportReportMutation.mutate({ reportId: report.id, format: "pdf" })}
                      data-testid={`button-export-pdf-${report.id}`}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportReportMutation.mutate({ reportId: report.id, format: "csv" })}
                      data-testid={`button-export-csv-${report.id}`}
                    >
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportReportMutation.mutate({ reportId: report.id, format: "docx" })}
                      data-testid={`button-export-docx-${report.id}`}
                    >
                      DOCX
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteReportMutation.mutate(report.id)}
                      data-testid={`button-delete-report-${report.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No reports yet. Create one to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Spreadsheet View Dialog */}
      {viewingReportId && (
        <div className="hidden">
          {/* Dialog is handled above */}
        </div>
      )}
    </div>
  );
}
