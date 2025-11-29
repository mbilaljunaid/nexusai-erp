import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, FileText, User, Calendar } from "lucide-react";

export default function ActivityTimeline() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Timeline</h1>
        <p className="text-muted-foreground mt-1">All interactions and activities across your organization</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activities</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { type: "Email", subject: "Follow-up on proposal", time: "2 hours ago", icon: Mail, user: "You", account: "Acme Corp" },
            { type: "Call", subject: "Discussed requirements", time: "Yesterday", icon: Phone, user: "John Doe", account: "Global Inc" },
            { type: "Task", subject: "Send contract", time: "2 days ago", icon: FileText, user: "Sarah", account: "TechStart" },
            { type: "Meeting", subject: "Quarterly business review", time: "3 days ago", icon: Calendar, user: "Manager", account: "Enterprise Co" },
          ].map((act, idx) => (
            <div key={idx} className="flex gap-4 p-3 border rounded">
              <div className="flex-shrink-0">
                <act.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{act.type}: {act.subject}</p>
                <p className="text-sm text-muted-foreground mt-1">{act.account} · {act.user}</p>
              </div>
              <span className="text-xs text-muted-foreground">{act.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
