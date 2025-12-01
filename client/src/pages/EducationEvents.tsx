import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";

export default function EducationEvents() {
  const events = [
    { id: "EVT001", name: "Tech Fest 2025", date: "2025-03-10", capacity: 500, registered: 234 }
    { id: "EVT002", name: "Debate Championship", date: "2025-02-28", capacity: 100, registered: 67 }
  ];
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold">Events & Activities</h1></div><Button data-testid="button-create-event"><Plus className="h-4 w-4 mr-2" /> Create Event</Button></div>
      <div className="grid gap-4">
        {events.map(e => (
          <Card key={e.id} className="hover-elevate" data-testid={`card-event-${e.id}`}>
            <CardContent className="pt-6"><div className="flex justify-between items-start"><div><h3 className="font-semibold">{e.name}</h3><p className="text-sm text-muted-foreground">{e.date}</p><p className="text-sm">{e.registered}/{e.capacity} Registered</p></div></div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
