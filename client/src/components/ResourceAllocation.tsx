import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, AlertTriangle } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  capacity: number;
  allocated: number;
  tasks: number;
  aiSuggestion?: string;
}

interface ResourceAllocationProps {
  members?: TeamMember[];
}

export function ResourceAllocation({ members }: ResourceAllocationProps) {
  // Fallback data for demo/preview when no API data provided
  const defaultMembers: TeamMember[] = members || [
    {
      id: "1",
      name: "Alex Chen",
      initials: "AC",
      role: "Senior Developer",
      capacity: 40,
      allocated: 38,
      tasks: 8,
    },
    {
      id: "2",
      name: "Maria Garcia",
      initials: "MG",
      role: "Designer",
      capacity: 40,
      allocated: 45,
      tasks: 12,
      aiSuggestion: "Overallocated - reassign 2 tasks to reduce workload",
    },
    {
      id: "3",
      name: "James Wilson",
      initials: "JW",
      role: "Developer",
      capacity: 40,
      allocated: 28,
      tasks: 5,
      aiSuggestion: "Available capacity - can take on 3 more tasks",
    },
    {
      id: "4",
      name: "Emily Brown",
      initials: "EB",
      role: "Project Manager",
      capacity: 40,
      allocated: 36,
      tasks: 6,
    },
  ];

  return (
    <Card data-testid="card-resource-allocation">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base">Team Workload</CardTitle>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Optimized
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {defaultMembers.map((member) => {
          const utilization = (member.allocated / member.capacity) * 100;
          const isOverallocated = utilization > 100;
          const isUnderutilized = utilization < 70;

          return (
            <div key={member.id} className="space-y-2" data-testid={`resource-${member.id}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">
                    {member.allocated}/{member.capacity}h
                  </p>
                  <p className="text-xs text-muted-foreground">{member.tasks} tasks</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Progress 
                  value={Math.min(utilization, 100)} 
                  className={`h-2 ${isOverallocated ? '[&>div]:bg-red-500' : isUnderutilized ? '[&>div]:bg-yellow-500' : ''}`}
                />
                {isOverallocated && (
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                )}
              </div>

              {member.aiSuggestion && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-primary/5 text-xs">
                  <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">{member.aiSuggestion}</p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
