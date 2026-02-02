import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
export default function QualityAssuranceHub() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><CheckCircle className="w-8 h-8" />Quality Assurance</h1><p className="text-muted-foreground">Manage quality control and testing</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Tests</p><p className="text-2xl font-bold">1,234</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Pass Rate</p><p className="text-2xl font-bold text-green-600">96%</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Defects</p><p className="text-2xl font-bold">12</p></CardContent></Card>
      </div>
    </div>
  );
}
