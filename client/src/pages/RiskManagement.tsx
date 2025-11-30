import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
export default function RiskManagement() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><AlertTriangle className="w-8 h-8" />Risk Management</h1><p className="text-muted-foreground">Identify and mitigate business risks</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Risk Items</p><p className="text-2xl font-bold">67</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Mitigated</p><p className="text-2xl font-bold text-green-600">52</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">High Priority</p><p className="text-2xl font-bold text-red-600">3</p></CardContent></Card>
      </div>
    </div>
  );
}
