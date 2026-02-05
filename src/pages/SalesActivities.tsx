import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus } from "lucide-react";

export default function SalesActivities() {
  const activities = [
    { id: "sa1", type: "Call", customer: "Acme Corp", subject: "Follow-up on proposal", owner: "Alice", dueDate: "2025-11-28", priority: "high", completed: false },
    { id: "sa2", type: "Email", customer: "Global Industries", subject: "Send contract for review", owner: "Bob", dueDate: "2025-11-27", priority: "high", completed: false },
    { id: "sa3", type: "Meeting", customer: "StartUp Labs", subject: "Demo scheduled", owner: "Carol", dueDate: "2025-11-26", priority: "normal", completed: true },
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CheckSquare className="h-8 w-8" />
          Sales Activities
        </h1>
        <p className="text-muted-foreground mt-2">Track calls, emails, and meetings</p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <Button className="w-full gap-2" data-testid="button-add-activity">
            <Plus className="h-4 w-4" />
            Log Activity
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-600">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold text-green-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">High Priority</p><p className="text-2xl font-bold text-red-600">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">3</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Activity List</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="p-3 border rounded-lg hover-elevate" data-testid={`activity-${activity.id}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{activity.subject}</h3>
                <div className="flex gap-2">
                  <Badge variant="outline">{activity.type}</Badge>
                  <Badge variant={activity.priority === "high" ? "destructive" : "secondary"}>{activity.priority}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Customer: {activity.customer} • Owner: {activity.owner} • Due: {activity.dueDate} • {activity.completed ? "✓ Completed" : "Pending"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
