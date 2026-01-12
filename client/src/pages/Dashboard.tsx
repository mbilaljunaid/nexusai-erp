import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { useRBAC } from "@/components/RBACContext";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { DashboardWidgets } from "@/components/DashboardWidgets";
import {
  BarChart3,
  Users,
  ShoppingCart,
  Briefcase,
  Settings,
  FileText,
  Zap,
  Brain,
  Layers,
  TrendingUp,
  Package,
  DollarSign,
  Factory,
  Truck,
  Headphones,
  Target,
  Lock,
  Database,
  Code,
  Workflow,
  Home,
  Shield,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  UserCheck,
  ClipboardList,
  Archive,
  PieChart,
} from "lucide-react";

interface AdminStats {
  totalTenants: string;
  activeUsers: string;
  systemUptime: string;
  apiCalls24h: string;
}

interface SystemAlert {
  type: string;
  message: string;
  time: string;
}

interface TenantOverview {
  name: string;
  users: number;
  status: string;
}

function AdminDashboard() {
  const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/dashboard/admin-stats"],
  });

  const { data: systemAlerts = [], isLoading: alertsLoading } = useQuery<SystemAlert[]>({
    queryKey: ["/api/dashboard/system-alerts"],
  });

  const { data: tenantOverview = [], isLoading: tenantsLoading } = useQuery<TenantOverview[]>({
    queryKey: ["/api/dashboard/tenant-overview"],
  });

  const platformStats = [
    { label: "Total Tenants", value: statsLoading ? "..." : (adminStats?.totalTenants || "12"), icon: Building, color: "text-blue-500" },
    { label: "Active Users", value: statsLoading ? "..." : (adminStats?.activeUsers || "1,245"), icon: Users, color: "text-green-500" },
    { label: "System Uptime", value: statsLoading ? "..." : (adminStats?.systemUptime || "99.9%"), icon: Server, color: "text-emerald-500" },
    { label: "API Calls (24h)", value: statsLoading ? "..." : (adminStats?.apiCalls24h || "2.4M"), icon: Activity, color: "text-purple-500" },
  ];

  const defaultAlerts = [
    { type: "warning", message: "High memory usage on Node 3", time: "5 min ago" },
    { type: "info", message: "Scheduled maintenance in 2 days", time: "1 hour ago" },
    { type: "success", message: "Database backup completed", time: "3 hours ago" },
  ];

  const defaultTenants = [
    { name: "Acme Corp", users: 245, status: "active" },
    { name: "TechStart Inc", users: 89, status: "active" },
    { name: "Global Logistics", users: 312, status: "active" },
  ];

  const displayAlerts = systemAlerts.length > 0 ? systemAlerts : defaultAlerts;
  const displayTenants = tenantOverview.length > 0 ? tenantOverview : defaultTenants;

  const adminQuickLinks = [
    { title: "GL Config", url: "/gl/config", icon: Database, color: "text-indigo-600" },
    { title: "User Management", url: "/user-management", icon: Users, color: "text-blue-600" },
    { title: "System Config", url: "/system-configuration", icon: Settings, color: "text-gray-600" },
    { title: "Tenant Admin", url: "/tenant-admin", icon: Building, color: "text-purple-600" },
    { title: "Security", url: "/security-settings", icon: Shield, color: "text-red-600" },
    { title: "Period Close", url: "/gl/period-close", icon: Archive, color: "text-emerald-600" },
    { title: "Audit Logs", url: "/audit-logs", icon: FileText, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8 p-6">
      <OnboardingChecklist />

      <Breadcrumb items={[]} />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            Platform Administration
          </h1>
          <Badge variant="default" className="bg-red-500">Admin</Badge>
        </div>
        <p className="text-muted-foreground text-lg">Platform-wide management and system oversight</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="admin-platform-stats">
        {platformStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              System Alerts
            </h2>
            <div className="space-y-3">
              {displayAlerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  {alert.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />}
                  {alert.type === "info" && <Clock className="w-5 h-5 text-blue-500 mt-0.5" />}
                  {alert.type === "success" && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/system-alerts">
              <Button variant="outline" size="sm" className="mt-4" data-testid="button-view-all-alerts">
                View All Alerts
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-500" />
              Tenant Overview
            </h2>
            <div className="space-y-3">
              {displayTenants.map((tenant) => (
                <div key={tenant.name} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">{tenant.users} users</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">{tenant.status}</Badge>
                </div>
              ))}
            </div>
            <Link to="/tenant-admin">
              <Button variant="outline" size="sm" className="mt-4" data-testid="button-manage-tenants">
                Manage Tenants
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Admin Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {adminQuickLinks.map((link) => (
            <Link key={link.url} to={link.url}>
              <Card className="hover:shadow-md hover:border-primary transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                  <link.icon className={`w-6 h-6 ${link.color}`} />
                  <p className="text-sm font-medium">{link.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-amber-600" />
            <div>
              <h3 className="font-semibold mb-2">Administrator Access</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You have full platform access. All system configurations, user management, and tenant administration are available.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/user-management">
                  <Button size="sm" data-testid="button-user-management">User Management</Button>
                </Link>
                <Link to="/system-configuration">
                  <Button size="sm" variant="outline" data-testid="button-system-config">System Config</Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TenantStats {
  teamMembers: string;
  activeProjects: string;
  openTasks: string;
  completedThisMonth: string;
}

function EditorDashboard() {
  const { data: stats, isLoading } = useQuery<TenantStats>({
    queryKey: ["/api/dashboard/tenant-stats"],
  });

  const tenantStats = [
    { label: "Team Members", value: isLoading ? "..." : (stats?.teamMembers || "28"), icon: Users, color: "text-blue-500" },
    { label: "Active Projects", value: isLoading ? "..." : (stats?.activeProjects || "12"), icon: Briefcase, color: "text-purple-500" },
    { label: "Open Tasks", value: isLoading ? "..." : (stats?.openTasks || "47"), icon: ClipboardList, color: "text-orange-500" },
    { label: "Completed This Month", value: isLoading ? "..." : (stats?.completedThisMonth || "156"), icon: CheckCircle, color: "text-green-500" },
  ];

  const modules = [
    { title: "CRM", url: "/crm", icon: Target, color: "text-blue-500", description: "Customer Relationship Management" },
    { title: "Projects", url: "/projects", icon: Briefcase, color: "text-purple-500", description: "Project Management" },
    { title: "HR", url: "/hr", icon: Users, color: "text-orange-500", description: "Human Resources" },
    { title: "Finance", url: "/finance", icon: DollarSign, color: "text-yellow-500", description: "Finance & Accounting" },
    { title: "Manufacturing", url: "/manufacturing", icon: Factory, color: "text-red-500", description: "Manufacturing & Production" },
    { title: "Supply Chain", url: "/inventory", icon: Package, color: "text-cyan-500", description: "Supply Chain & Logistics" },
  ];

  const quickLinks = [
    { title: "Processes", url: "/process-hub", icon: Workflow, color: "text-blue-600" },
    { title: "Period Close", url: "/gl/period-close", icon: Archive, color: "text-emerald-600" },
    { title: "GL Reports", url: "/gl/reports", icon: FileText, color: "text-green-600" },
    { title: "GL Config", url: "/gl/config", icon: Database, color: "text-indigo-600" },
    { title: "Team", url: "/hr/employees", icon: Users, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8 p-6">
      <OnboardingChecklist />

      <Breadcrumb items={[]} />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <UserCheck className="w-10 h-10 text-primary" />
            Tenant Dashboard
          </h1>
          <Badge variant="default" className="bg-blue-500">Editor</Badge>
        </div>
        <p className="text-muted-foreground text-lg">Manage your organization's operations and team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="editor-tenant-stats">
        {tenantStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">Business Modules</h2>
          <p className="text-muted-foreground mb-4">Access and manage your organization's core systems</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <Link key={module.url} to={module.url}>
              <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <module.icon className={`w-6 h-6 ${module.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.url} to={link.url}>
              <Card className="hover:shadow-md hover:border-primary transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                  <link.icon className={`w-6 h-6 ${link.color}`} />
                  <p className="text-sm font-medium">{link.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <DashboardWidgets />

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Editor Access</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You can create, edit, and manage content within your organization. For administrative actions, contact your platform administrator.
          </p>
          <Link to="/process-hub">
            <Button size="sm" data-testid="button-explore-processes">Explore Processes</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

interface MyTask {
  id?: string;
  title: string;
  status: string;
  due: string;
}

function ViewerDashboard() {
  const { data: myTasks = [], isLoading: tasksLoading } = useQuery<MyTask[]>({
    queryKey: ["/api/dashboard/my-tasks"],
  });

  const defaultTasks = [
    { id: "1", title: "Review Q4 Report", status: "pending", due: "Today" },
    { id: "2", title: "Submit Expense Claims", status: "pending", due: "Tomorrow" },
    { id: "3", title: "Complete Training Module", status: "in_progress", due: "Dec 20" },
  ];

  const displayTasks = myTasks.length > 0 ? myTasks : defaultTasks;

  const quickModules = [
    { title: "My Tasks", url: "/tasks", icon: ClipboardList, color: "text-blue-500", description: "View your pending tasks" },
    { title: "HR Portal", url: "/hr/employee-self-service", icon: Users, color: "text-orange-500", description: "Self-service HR portal" },
    { title: "Timesheets", url: "/hr/time-tracking", icon: Clock, color: "text-green-500", description: "Track your work hours" },
    { title: "Reports", url: "/reports", icon: FileText, color: "text-purple-500", description: "View available reports" },
  ];

  return (
    <div className="space-y-8 p-6">
      <OnboardingChecklist />

      <Breadcrumb items={[]} />

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Home className="w-10 h-10 text-primary" />
            My Dashboard
          </h1>
          <Badge variant="secondary">Viewer</Badge>
        </div>
        <p className="text-muted-foreground text-lg">Your personal workspace and quick access to key features</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-500" />
            My Tasks
          </h2>
          <div className="space-y-3">
            {displayTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  {task.status === "pending" && <Clock className="w-5 h-5 text-amber-500" />}
                  {task.status === "in_progress" && <Activity className="w-5 h-5 text-blue-500" />}
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                  </div>
                </div>
                <Badge variant={task.status === "pending" ? "outline" : "default"}>
                  {task.status === "pending" ? "Pending" : "In Progress"}
                </Badge>
              </div>
            ))}
          </div>
          <Link to="/tasks">
            <Button variant="outline" size="sm" className="mt-4" data-testid="button-view-all-tasks">
              View All Tasks
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickModules.map((module) => (
            <Link key={module.url} to={module.url}>
              <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <module.icon className={`w-6 h-6 ${module.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Need More Access?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Contact your team administrator to request additional permissions or access to more modules.
          </p>
          <Link to="/help">
            <Button size="sm" variant="outline" data-testid="button-get-help">Get Help</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { userRole } = useRBAC();

  if (userRole === "admin") {
    return <AdminDashboard />;
  }

  if (userRole === "editor") {
    return <EditorDashboard />;
  }

  return <ViewerDashboard />;
}
