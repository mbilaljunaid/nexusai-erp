import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
export default function SuccessionPlanning() {
  return (
    <div className="space-y-4">
      <div><h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><Target className="w-8 h-8" />Succession Planning</h1><p className="text-muted-foreground">Identify and develop future leaders</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Key Positions</p><p className="text-2xl font-bold">12</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Ready Now</p><p className="text-2xl font-bold text-green-600">8</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">In Development</p><p className="text-2xl font-bold">4</p></CardContent></Card>
      </div>
    </div>
  );
}
