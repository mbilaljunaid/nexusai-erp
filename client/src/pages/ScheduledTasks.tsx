import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ScheduledTasks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scheduled Tasks</h1>
        <p className="text-muted-foreground mt-1">Configure automated scheduled jobs</p>
      </div>
      <div className="grid gap-4">
        {[
          { task: "Daily Cleanup", schedule: "02:00 AM", status: "Active" },
          { task: "Weekly Report", schedule: "Sunday 10:00 AM", status: "Active" },
        ].map((task) => (
          <Card key={task.task}>
            <CardContent className="pt-6">
              <h3 className="font-semibold">{task.task}</h3>
              <p className="text-sm text-muted-foreground">Scheduled for {task.schedule}</p>
              <Badge className="mt-2 bg-green-100 text-green-800">{task.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
