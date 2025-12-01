import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users2 } from "lucide-react";

export default function EducationHR() {
  const employees = [
    { id: "EMP001", name: "Dr. Sharma", role: "Faculty", dept: "CSE", status: "ACTIVE" }
    { id: "EMP002", name: "Ananya Patel", role: "Admin Staff", dept: "Admin", status: "ACTIVE" }
  ];
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold">HR & Workforce</h1></div><Button data-testid="button-add-employee"><Plus className="h-4 w-4 mr-2" /> Add Employee</Button></div>
      <div className="grid gap-4">
        {employees.map(e => (
          <Card key={e.id} className="hover-elevate" data-testid={`card-employee-${e.id}`}>
            <CardContent className="pt-6"><div className="flex justify-between items-start"><div><h3 className="font-semibold">{e.name}</h3><p className="text-sm text-muted-foreground">{e.role} • {e.dept}</p></div><Badge>{e.status}</Badge></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
