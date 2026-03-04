import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";


export default function EducationCRM() {
  const interactions = [
    { id: "INT001", student: "Rajesh Kumar", type: "Inquiry", status: "RESOLVED", date: "2025-01-20" },
    { id: "INT002", student: "Priya Singh", type: "Complaint", status: "OPEN", date: "2025-01-21" },
  ];
  return (
    <StandardPage title="Student Engagement & CRM">
      <div className="flex justify-between items-center"><div></div><Button data-testid="button-new-interaction"><Plus className="h-4 w-4 mr-2" /> New Interaction</Button></div>
      <div className="grid gap-4">
        {interactions.map(i => (
          <Card key={i.id} className="hover-elevate" data-testid={`card-interaction-${i.id}`}>
            <CardContent className="pt-6"><div className="flex justify-between items-start"><div><h3 className="font-semibold">{i.student}</h3><p className="text-sm text-muted-foreground">{i.type}</p><p className="text-sm">{i.date}</p></div><Badge variant={i.status === "RESOLVED" ? "default" : "secondary"}>{i.status}</Badge></div></CardContent>
          </Card>
        ))}
      </div>
    </StandardPage>
  );
}
