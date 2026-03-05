import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardPage } from '@/components/layout/StandardPage';
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";

export default function TimesheetManagement() {
  const { toast } = useToast();
  const [localTimesheets, setLocalTimesheets] = useState<any[]>([]);

  const { data: timesheets = [], isLoading } = useQuery<any>({
    queryKey: ["/api/timesheets"],
    queryFn: () => fetch("/api/timesheets").then(r => r.json()).catch(() => []),
  });

  useEffect(() => {
    if (timesheets) {
      setLocalTimesheets(timesheets);
    }
  }, [timesheets]);

  const saveMutation = useMutation({
    mutationFn: async (updatedTimesheets: any[]) => {
      for (const ts of updatedTimesheets) {
        if (!ts.id || String(ts.id).startsWith('temp-')) {
          await fetch("/api/timesheets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...ts, id: undefined }) });
        } else {
          await apiRequest("PATCH", `/api/timesheets/${ts.id}`, ts).catch(() => { });
        }
      }

      const deletedIds = timesheets.filter((c: any) => !updatedTimesheets.find((uc) => uc.id === c.id)).map((c: any) => c.id);
      for (const id of deletedIds) {
        await fetch(`/api/timesheets/${id}`, { method: "DELETE" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      toast({ title: "Timesheets saved successfully" });
    },
  });

  const columns: SpreadsheetColumn<any>[] = [
    {
      id: "user",
      header: "Employee",
      width: "200px",
      cell: (row, index, updateRow) => (
        <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent font-medium" placeholder="Employee Name" value={row.user || ''} onChange={(e) => updateRow("user", e.target.value)} />
      )
    },
    {
      id: "week",
      header: "Week",
      width: "150px",
      cell: (row, index, updateRow) => (
        <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="e.g. W42" value={row.week || ''} onChange={(e) => updateRow("week", e.target.value)} />
      )
    },
    {
      id: "project",
      header: "Project",
      width: "200px",
      cell: (row, index, updateRow) => (
        <Input className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent" placeholder="Project Name" value={row.project || ''} onChange={(e) => updateRow("project", e.target.value)} />
      )
    },
    {
      id: "hours",
      header: "Hours",
      width: "120px",
      cell: (row, index, updateRow) => (
        <Input type="number" step="0.5" className="h-9 w-full border-0 focus-visible:ring-0 bg-transparent text-right" placeholder="0.0" value={row.hours || ''} onChange={(e) => updateRow("hours", e.target.value)} />
      )
    },
    {
      id: "approval",
      header: "Status",
      width: "150px",
      cell: (row, index, updateRow) => (
        <Select value={row.approval || 'pending'} onValueChange={(val) => updateRow("approval", val)}>
          <SelectTrigger className="h-9 w-full border-0 focus:ring-0 bg-transparent"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      )
    }
  ];

  return (
    <StandardPage
      title="Timesheet Management"
      description="Track and manage project timesheets"
      breadcrumbs={[{ label: "WFM", href: "/wfm" }, { label: "Timesheet Management" }]}
    >
      <div className="space-y-6">
        <Card className="mt-6 border-none shadow-lg">
          <CardHeader className="bg-muted/30 pb-4 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Timesheet Entry Grid</CardTitle>
              <CardDescription>Inline editable spreadsheet for rapid time entry</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocalTimesheets([...localTimesheets, { id: `temp-${Date.now()}`, user: '', week: '', project: '', hours: '', approval: 'pending' }])}>
                <Plus className="w-4 h-4 mr-2" /> Add Row
              </Button>
              <Button onClick={() => saveMutation.mutate(localTimesheets)} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Timesheets
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading timesheets...</div>
            ) : (
              <InteractiveSpreadsheet
                data={localTimesheets}
                columns={columns}
                onChange={setLocalTimesheets}
                virtualized={true} // High-volume entry capability
              />
            )}
          </CardContent>
        </Card>
      </div>
    </StandardPage>
  );
}
