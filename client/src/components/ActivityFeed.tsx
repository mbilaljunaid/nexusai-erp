import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Phone, 
  Mail, 
  CheckSquare, 
  UserPlus, 
  FileText,
  Sparkles,
  MessageSquare
} from "lucide-react";

interface Activity {
  id: string;
  type: "call" | "email" | "task" | "lead" | "note" | "ai";
  user: { name: string; initials: string };
  action: string;
  target: string;
  timestamp: string;
}

const activityIcons = {
  call: Phone,
  email: Mail,
  task: CheckSquare,
  lead: UserPlus,
  note: FileText,
  ai: Sparkles,
};

const activityColors = {
  call: "bg-green-500/10 text-green-600 dark:text-green-400",
  email: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  task: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  lead: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  note: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  ai: "bg-primary/10 text-primary",
};

interface ActivityFeedProps {
  activities?: Activity[];
  maxHeight?: string;
}

export function ActivityFeed({ activities, maxHeight = "400px" }: ActivityFeedProps) {
  // todo: remove mock functionality
  const defaultActivities: Activity[] = activities || [
    {
      id: "1",
      type: "ai",
      user: { name: "AI Assistant", initials: "AI" },
      action: "identified high-value lead",
      target: "Sarah Johnson (Score: 87)",
      timestamp: "2 min ago",
    },
    {
      id: "2",
      type: "call",
      user: { name: "Alex Chen", initials: "AC" },
      action: "logged a call with",
      target: "TechCorp Inc.",
      timestamp: "15 min ago",
    },
    {
      id: "3",
      type: "task",
      user: { name: "Maria Garcia", initials: "MG" },
      action: "completed task",
      target: "Send Q4 proposal",
      timestamp: "1 hour ago",
    },
    {
      id: "4",
      type: "email",
      user: { name: "John Doe", initials: "JD" },
      action: "sent email to",
      target: "12 leads in pipeline",
      timestamp: "2 hours ago",
    },
    {
      id: "5",
      type: "lead",
      user: { name: "AI Assistant", initials: "AI" },
      action: "auto-created lead from",
      target: "Website form submission",
      timestamp: "3 hours ago",
    },
    {
      id: "6",
      type: "note",
      user: { name: "Alex Chen", initials: "AC" },
      action: "added note to",
      target: "Website Redesign project",
      timestamp: "4 hours ago",
    },
  ];

  return (
    <Card data-testid="card-activity-feed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Badge variant="secondary" className="text-xs">
            <MessageSquare className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ height: maxHeight }}>
          <div className="px-6 pb-4 space-y-4">
            {defaultActivities.map((activity) => {
              const Icon = activityIcons[activity.type];
              return (
                <div key={activity.id} className="flex gap-3" data-testid={`activity-${activity.id}`}>
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`text-xs ${activity.type === "ai" ? "bg-primary/10 text-primary" : "bg-muted"}`}>
                        {activity.type === "ai" ? <Sparkles className="h-3 w-3" /> : activity.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 p-1 rounded-full ${activityColors[activity.type]}`}>
                      <Icon className="h-2.5 w-2.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user.name}</span>
                      {" "}{activity.action}{" "}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
