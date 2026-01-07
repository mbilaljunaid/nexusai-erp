import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
export default function ProcurementAutomation() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Zap className="w-8 h-8" />Procurement Automation</h1><p className="text-muted-foreground">Automate procurement workflows and approvals</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">POs Processed</p><p className="text-2xl font-bold">1.2K</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Automated</p><p className="text-2xl font-bold text-green-600">94%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Avg Time</p><p className="text-2xl font-bold">2.3h</p></CardContent></Card>
      </div>
    </div>
  );
}
