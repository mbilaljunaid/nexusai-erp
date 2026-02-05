import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TimesheetEntry {
  id: number;
  date: string;
  project: string;
  task: string;
  hours: string;
  notes: string;
}

export function TimesheetForm() {
  const { toast } = useToast();
  const [week, setWeek] = useState("");
  const [entries, setEntries] = useState<TimesheetEntry[]>([
    { id: 1, date: "", project: "", task: "", hours: "", notes: "" }
  ]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/hr/timesheets", {
        weekStarting: week,
        entries: entries.map(e => ({
          date: e.date,
          projectId: e.project,
          taskName: e.task,
          hours: parseFloat(e.hours) || 0,
          notes: e.notes
        }))
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Timesheet submitted successfully" });
      setWeek("");
      setEntries([{ id: 1, date: "", project: "", task: "", hours: "", notes: "" }]);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit timesheet", variant: "destructive" });
    }
  });

  const addEntry = () => {
    setEntries(prev => [...prev, {
      id: Math.max(...prev.map(e => e.id), 0) + 1,
      date: "",
      project: "",
      task: "",
      hours: "",
      notes: ""
    }]);
  };

  const removeEntry = (id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateEntry = (id: number, field: string, value: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const totalHours = entries.reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Timesheet
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Log working hours and project time</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Timesheet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="week">Week Starting *</Label>
              <Input
                id="week"
                type="date"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john">John Doe</SelectItem>
                  <SelectItem value="jane">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Badge>Draft</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">Time Entries</h3>
              <Button size="sm" onClick={addEntry} className="gap-1">
                <Plus className="w-4 h-4" /> Add Row
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Project</th>
                    <th className="text-left py-2 px-2">Task</th>
                    <th className="text-right py-2 px-2">Hours</th>
                    <th className="text-left py-2 px-2">Notes</th>
                    <th className="text-center py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-b">
                      <td className="py-2 px-2">
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
                          className="text-xs"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Select value={entry.project} onValueChange={(v) => updateEntry(entry.id, "project", v)}>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Project" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="proj1">Project Alpha</SelectItem>
                            <SelectItem value="proj2">Project Beta</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          placeholder="Task"
                          value={entry.task}
                          onChange={(e) => updateEntry(entry.id, "task", e.target.value)}
                          className="text-xs"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="0"
                          value={entry.hours}
                          onChange={(e) => updateEntry(entry.id, "hours", e.target.value)}
                          className="text-xs text-right"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          placeholder="Notes"
                          value={entry.notes}
                          onChange={(e) => updateEntry(entry.id, "notes", e.target.value)}
                          className="text-xs"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEntry(entry.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-muted">
                    <td colSpan={3} className="py-2 px-2">Total Hours</td>
                    <td className="py-2 px-2 text-right">{totalHours.toFixed(1)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button variant="outline">Save as Draft</Button>
            <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Submitting..." : "Submit Timesheet"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
