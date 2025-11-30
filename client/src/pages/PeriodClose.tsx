import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare } from "lucide-react";

export default function PeriodClose() {
  const tasks = [
    { id: "t1", task: "GL Reconciliation", module: "Finance", status: "completed", dueDate: "2025-11-30" },
    { id: "t2", task: "AR Aging Review", module: "Receivables", status: "in-progress", dueDate: "2025-11-30" },
    { id: "t3", task: "Payroll Final", module: "HR", status: "not_started", dueDate: "2025-12-01" },
  ];
  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><CheckSquare className="h-8 w-8" />Period Close</h1><p className="text-muted-foreground mt-2">Manage end-of-period close tasks</p></div>
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Tasks</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold text-green-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">In Progress</p><p className="text-2xl font-bold text-blue-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Not Started</p><p className="text-2xl font-bold text-red-600">1</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Close Checklist</CardTitle></CardHeader><CardContent className="space-y-3">{tasks.map((t) => (<div key={t.id} className="p-3 border rounded-lg hover-elevate" data-testid={`task-${t.id}`}><div className="flex justify-between mb-2"><h3 className="font-semibold">{t.task}</h3><Badge variant={t.status === "completed" ? "default" : t.status === "in-progress" ? "secondary" : "outline"}>{t.status}</Badge></div><p className="text-sm text-muted-foreground">Module: {t.module} • Due: {t.dueDate}</p></div>))}</CardContent></Card>
    </div>
  );
}
