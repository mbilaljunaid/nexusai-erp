import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

export default function AdmissionsEnrollment() {
  const applications = [
    { id: "APP001", name: "Amit Kumar", program: "B.Tech CS", status: "APPROVED", appliedDate: "2025-01-15" }
    { id: "APP002", name: "Neha Singh", program: "B.Tech ECE", status: "PENDING", appliedDate: "2025-01-16" }
  ];
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold">Admissions & Enrollment</h1></div><Button data-testid="button-new-application"><Plus className="h-4 w-4 mr-2" /> New Application</Button></div>
      <div className="grid gap-4">
        {applications.map(a => (
          <Card key={a.id} className="hover-elevate" data-testid={`card-application-${a.id}`}>
            <CardContent className="pt-6"><div className="flex justify-between items-start"><div><h3 className="font-semibold">{a.name}</h3><p className="text-sm text-muted-foreground">{a.program}</p><p className="text-sm">{a.appliedDate}</p></div><Badge variant={a.status === "APPROVED" ? "default" : "secondary"}>{a.status}</Badge></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
