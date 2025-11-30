import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskCard, type Task } from "@/components/TaskCard";
import { ResourceAllocation } from "@/components/ResourceAllocation";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { IconNavigation } from "@/components/IconNavigation";
import { 
  Search, 
  Filter, 
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  LayoutGrid,
  ListTodo,
  Users
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "on_track" | "at_risk" | "delayed";
  progress: number;
  tasks: { total: number; completed: number };
  team: { name: string; initials: string }[];
  dueDate: string;
}

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutGrid, color: "text-blue-500" },
    { id: "kanban", label: "Kanban", icon: FolderKanban, color: "text-purple-500" },
    { id: "tasks", label: "All Tasks", icon: ListTodo, color: "text-green-500" },
    { id: "resources", label: "Resources", icon: Users, color: "text-orange-500" },
  ];

  // todo: remove mock functionality
  const projects: Project[] = [
    {
      id: "1",
      name: "Website Redesign",
      description: "Complete overhaul of the company website with new branding",
      status: "on_track",
      progress: 65,
      tasks: { total: 24, completed: 16 },
      team: [
        { name: "Alex Chen", initials: "AC" },
        { name: "Maria Garcia", initials: "MG" },
        { name: "Emily Brown", initials: "EB" },
      ],
      dueDate: "Dec 30, 2024",
    },
    {
      id: "2",
      name: "Mobile App Development",
      description: "Native mobile app for iOS and Android platforms",
      status: "at_risk",
      progress: 40,
      tasks: { total: 48, completed: 19 },
      team: [
        { name: "James Wilson", initials: "JW" },
        { name: "Alex Chen", initials: "AC" },
      ],
      dueDate: "Jan 15, 2025",
    },
    {
      id: "3",
      name: "CRM Integration",
      description: "Integrate new CRM system with existing tools",
      status: "on_track",
      progress: 80,
      tasks: { total: 18, completed: 14 },
      team: [
        { name: "Maria Garcia", initials: "MG" },
      ],
      dueDate: "Dec 20, 2024",
    },
    {
      id: "4",
      name: "Q4 Marketing Campaign",
      description: "Holiday season marketing push across all channels",
      status: "delayed",
      progress: 25,
      tasks: { total: 32, completed: 8 },
      team: [
        { name: "Emily Brown", initials: "EB" },
        { name: "John Doe", initials: "JD" },
      ],
      dueDate: "Dec 15, 2024",
    },
  ];

  const tasks: Task[] = [
    { id: "1", title: "Design homepage mockups", status: "done", priority: "high", assignee: { name: "Maria Garcia", initials: "MG" }, project: "Website Redesign" },
    { id: "2", title: "Implement user authentication", status: "in_progress", priority: "urgent", assignee: { name: "James Wilson", initials: "JW" }, dueDate: "Dec 14", project: "Mobile App" },
    { id: "3", title: "Review API documentation", status: "todo", priority: "medium", assignee: { name: "Alex Chen", initials: "AC" }, dueDate: "Dec 16", project: "CRM Integration", aiGenerated: true },
    { id: "4", title: "Create email templates", status: "in_progress", priority: "high", assignee: { name: "Emily Brown", initials: "EB" }, dueDate: "Dec 15", project: "Marketing" },
    { id: "5", title: "Set up CI/CD pipeline", status: "review", priority: "medium", assignee: { name: "James Wilson", initials: "JW" }, project: "Mobile App" },
    { id: "6", title: "Write unit tests", status: "todo", priority: "high", dueDate: "Dec 18", project: "Website Redesign", aiGenerated: true },
  ];

  const statusConfig = {
    on_track: { label: "On Track", color: "bg-green-500/10 text-green-600 dark:text-green-400", icon: CheckCircle2 },
    at_risk: { label: "At Risk", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", icon: AlertTriangle },
    delayed: { label: "Delayed", color: "bg-red-500/10 text-red-600 dark:text-red-400", icon: Clock },
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-muted-foreground text-sm">Manage projects and tasks with intelligent allocation</p>
        </div>
        <AddTaskDialog />
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
                data-testid="input-search-projects"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32" data-testid="select-project-status">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on_track">On Track</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>

      {activeNav === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => {
              const config = statusConfig[project.status];
              const StatusIcon = config.icon;
              return (
                <Card key={project.id} className="hover-elevate" data-testid={`card-project-${project.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <FolderKanban className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{project.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={config.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {project.team.slice(0, 3).map((member, i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {member.initials}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {project.team.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                              +{project.team.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {project.tasks.completed}/{project.tasks.total} tasks
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{project.dueDate}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Project Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm font-medium">Mobile App Development is at risk</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Current velocity suggests the project may miss its deadline by 2 weeks. Consider reassigning 2 tasks from James Wilson to reduce bottleneck.
                </p>
              </div>
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <p className="text-sm font-medium">Q4 Marketing Campaign needs attention</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Only 25% complete with 5 days until deadline. Recommend reducing scope or extending deadline.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "kanban" && (
        <KanbanBoard />
      )}

      {activeNav === "tasks" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {activeNav === "resources" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourceAllocation />
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Resource Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm font-medium">Optimal task reassignment available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Moving "Implement user authentication" from James Wilson to Alex Chen would improve overall team velocity by 12%.
                </p>
                <Button variant="outline" size="sm" className="mt-2">Apply Suggestion</Button>
              </div>
              <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                <p className="text-sm font-medium">Team capacity improving</p>
                <p className="text-xs text-muted-foreground mt-1">
                  With current task completion rate, team capacity will normalize by end of week.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
