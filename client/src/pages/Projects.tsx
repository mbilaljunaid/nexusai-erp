import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
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
import { ProjectToGLForm } from "@/components/forms/ProjectToGLForm";
import { IconNavigation } from "@/components/IconNavigation";
import { Search, Filter, FolderKanban, CheckCircle2, Clock, AlertTriangle, Sparkles, LayoutGrid, ListTodo, Users, Settings, Zap, BarChart3, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useRoute } from "wouter";

import ProjectsDashboard from "./projects/ProjectsDashboard";
import ProjectList from "./projects/ProjectList";
import TaskList from "./projects/TaskList";
import ProjectFinancialDetail from "./projects/ProjectFinancialDetail";
import AccountingDashboard from "./projects/AccountingDashboard";
import ExpenditureInquiry from "./projects/ExpenditureInquiry";
import BurdenManager from "./projects/BurdenManager";
import AssetWorkbench from "./projects/AssetWorkbench";
import SlaEventMonitor from "./projects/SlaEventMonitor";
import TransactionImport from "./projects/TransactionImport";

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
  const [match, params] = useRoute("/projects/:page");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeNav, setActiveNav] = useState("overview");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    if (params?.page) {
      setActiveNav(params.page);
    }
  }, [params?.page]);

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutGrid, color: "text-blue-500" },
    { id: "kanban", label: "Kanban", icon: FolderKanban, color: "text-purple-500" },
    { id: "tasks", label: "Tasks", icon: ListTodo, color: "text-green-500" },
    { id: "resources", label: "Resources", icon: Users, color: "text-orange-500" },
    { id: "sprints", label: "Sprints", icon: Zap, color: "text-pink-500" },
    { id: "timeline", label: "Timeline", icon: Clock, color: "text-cyan-500" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, color: "text-indigo-500" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-slate-500" },
  ];

  const projects: Project[] = [
    { id: "1", name: "Website Redesign", description: "Complete overhaul of the company website with new branding", status: "on_track", progress: 65, tasks: { total: 24, completed: 16 }, team: [{ name: "Alex Chen", initials: "AC" }, { name: "Maria Garcia", initials: "MG" }], dueDate: "Dec 30, 2024" },
    { id: "2", name: "Mobile App Development", description: "Native mobile app for iOS and Android platforms", status: "at_risk", progress: 40, tasks: { total: 48, completed: 19 }, team: [{ name: "James Wilson", initials: "JW" }], dueDate: "Jan 15, 2025" },
  ];

  const tasks: Task[] = [
    { id: "1", title: "Design homepage mockups", status: "done", priority: "high", assignee: { name: "Maria Garcia", initials: "MG" }, project: "Website Redesign" },
    { id: "2", title: "Implement user authentication", status: "in_progress", priority: "urgent", assignee: { name: "James Wilson", initials: "JW" }, dueDate: "Dec 14", project: "Mobile App" },
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

  const { data: summary } = useQuery<any>({
    queryKey: ['/api/ppm/summary'],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2"><FolderKanban className="h-8 w-8" />Project Portfolio Management</h1>
          <p className="text-muted-foreground text-sm">Manage projects, costs, and performance across the enterprise</p>
        </div>
        <AddTaskDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">{summary?.projectCount || '0'}</p><p className="text-xs text-muted-foreground">Total Projects</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">${parseFloat(summary?.totalBudget || "0").toLocaleString()}</p><p className="text-xs text-muted-foreground">Budget Portfolio</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">${parseFloat(summary?.totalBurdenedCost || "0").toLocaleString()}</p><p className="text-xs text-muted-foreground">Actual Cost (ITD)</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">1.02</p><p className="text-xs text-muted-foreground">Avg. Portfolio CPI</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {navItems.map((item) => (
          <Link key={item.id} to={item.id === "overview" ? "/projects" : `/projects/${item.id}`}>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary hover-elevate cursor-pointer transition-all">
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-sm font-medium text-center">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {(activeNav === "overview" || activeNav === "kanban" || activeNav === "tasks" || activeNav === "resources") && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 w-64" data-testid="input-search-projects" />
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
      )}

      {activeNav === "overview" && (
        <div className="space-y-6">
          <ProjectsDashboard />
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
            <ProjectList />
          </div>
        </div>
      )}

      {activeNav === "kanban" && <KanbanBoard />}

      {activeNav === "tasks" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Project Tasks</h2>
            <AddTaskDialog />
          </div>
          <TaskList />
        </div>
      )}

      {activeNav === "resources" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourceAllocation />
          <Card><CardHeader><CardTitle className="text-base">Team Capacity</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Resource allocation and utilization tracking</p></CardContent></Card>
        </div>
      )}

      {activeNav === "sprints" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Sprint Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Organize work into sprints and iterations</p><Button size="sm" className="mt-4">+ Create Sprint</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "timeline" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Project Timeline</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Gantt chart and timeline view</p><Button size="sm" className="mt-4">+ View Timeline</Button></CardContent></Card>
        </div>
      )}

      {activeNav === "analytics" && (
        <div className="space-y-4">
          {(() => {
            const queryParams = new URLSearchParams(window.location.search);
            const projectId = queryParams.get("id");

            if (projectId) {
              return <ProjectFinancialDetail projectId={projectId} />;
            }

            return (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Portfolio Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">Select a project below to view detailed Earned Value performance metrics and financial health.</p>
                  </CardContent>
                </Card>
                <ProjectList />
              </div>
            );
          })()}
        </div>
      )}

      {activeNav === "settings" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Project Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure workflows and team roles</p></CardContent></Card>
        </div>
      )}

      {/* Accounting Persona Routes */}
      {activeNav === "accounting" && <AccountingDashboard />}

      {activeNav === "costs" && <ExpenditureInquiry />}

      {activeNav === "assets" && <AssetWorkbench />}

      {activeNav === "burden" && <BurdenManager />}

      {activeNav === "sla" && <SlaEventMonitor />}

      {activeNav === "import" && <TransactionImport />}
    </div>
  );
}
