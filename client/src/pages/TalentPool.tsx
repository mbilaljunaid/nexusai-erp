import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TalentPool() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Talent Pool & Succession Planning</h1>
        <p className="text-muted-foreground mt-1">Identify and develop future leaders</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">High-Potential Employees</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { emp: "Sarah Chen", current: "Senior Engineer", potential: "VP Engineering", readiness: "12 months" },
            { emp: "Mike Rodriguez", current: "Sales Manager", potential: "VP Sales", readiness: "18 months" },
            { emp: "Jessica Lee", current: "Analyst", potential: "Manager", readiness: "6 months" },
          ].map((emp, idx) => (
            <div key={idx} className="p-3 border rounded">
              <p className="font-semibold">{emp.emp}</p>
              <p className="text-sm text-muted-foreground">{emp.current} → {emp.potential}</p>
              <Badge className="mt-2 bg-blue-100 text-blue-800">Ready in {emp.readiness}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
