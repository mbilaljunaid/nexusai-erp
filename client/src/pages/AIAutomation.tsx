import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Brain } from "lucide-react";

export default function AIAutomation() {
  const workflows = [
    { id: "w1", name: "Lead Scoring", trigger: "New Contact Created", actions: "Score + Update CRM", status: "active" },
    { id: "w2", name: "Invoice Auto-Approval", trigger: "Invoice > $1K", actions: "AI Review + Route", status: "active" },
    { id: "w3", name: "Email Classification", trigger: "New Email", actions: "Classify + Auto-Reply", status: "draft" },
  ];
  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><Zap className="h-8 w-8" />AI & Automation</h1><p className="text-muted-foreground mt-2">Manage intelligent workflows and automations</p></div>
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Workflows</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Executions/Day</p><p className="text-2xl font-bold">1.2K</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Time Saved</p><p className="text-2xl font-bold">48h</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Active Workflows</CardTitle></CardHeader><CardContent className="space-y-3">{workflows.map((w) => (<div key={w.id} className="p-3 border rounded-lg hover-elevate" data-testid={`workflow-${w.id}`}><div className="flex justify-between mb-2"><h3 className="font-semibold">{w.name}</h3><Badge variant={w.status === "active" ? "default" : "secondary"}>{w.status}</Badge></div><p className="text-sm text-muted-foreground">Trigger: {w.trigger} • Actions: {w.actions}</p></div>))}</CardContent></Card>
    </div>
  );
}
