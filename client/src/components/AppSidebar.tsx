import { useLocation, Link } from "wouter";
import { useState, useCallback } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRBAC } from "@/components/RBACContext";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  Sparkles,
  DollarSign,
  Zap,
  ChevronDown,
  Shield,
  Factory,
  Package,
  Briefcase,
  Store,
  MessageCircle,
  Cog,
  Brain,
  TrendingUp,
  Workflow,
  GitBranch,
  ShoppingCart,
  GraduationCap,
  Bell,
  Grid3x3,
  LayoutGrid,
  Database,

  Lock,
  Radio,
  Truck,
  Workflow as WorkflowIcon,
  Building,
  LogOut,
  BookOpen,
  ArrowRightLeft,
  RefreshCw,
} from "lucide-react";

type UserRole = "admin" | "editor" | "viewer";

interface MenuItem {
  title: string;
  icon?: any;
  href: string;
  allowedRoles?: UserRole[];
}

const coreBusinessModules: MenuItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Processes", icon: WorkflowIcon, href: "/processes" },
  { title: "CRM", icon: Users, href: "/crm", allowedRoles: ["admin", "editor"] },
  { title: "ERP", icon: DollarSign, href: "/erp", allowedRoles: ["admin", "editor"] },
  { title: "HR", icon: Briefcase, href: "/hr", allowedRoles: ["admin", "editor"] },
  { title: "Projects", icon: Zap, href: "/projects", allowedRoles: ["admin", "editor"] },
];

const operationsModules: MenuItem[] = [
  { title: "Operations", icon: Cog, href: "/operations", allowedRoles: ["admin", "editor"] },
  { title: "Admin", icon: Shield, href: "/admin", allowedRoles: ["admin"] },
  { title: "General", icon: Grid3x3, href: "/general", allowedRoles: ["admin", "editor"] },
];

const financeModules: MenuItem[] = [
  { title: "General Ledger", icon: BookOpen, href: "/gl/journals", allowedRoles: ["admin", "editor"] },
  { title: "Budget Manager", icon: BarChart3, href: "/gl/budgets", allowedRoles: ["admin", "editor"] },
  { title: "Financial Reporting", icon: BarChart3, href: "/gl/reports", allowedRoles: ["admin", "editor"] },
  { title: "Trial Balance", icon: LayoutGrid, href: "/gl/trial-balance", allowedRoles: ["admin", "editor"] },
  { title: "CVR Manager", icon: Shield, href: "/gl/cvr", allowedRoles: ["admin", "editor"] },


  { title: "Data Access", icon: Lock, href: "/gl/data-access", allowedRoles: ["admin", "editor"] },
  { title: "Period Close", icon: BookOpen, href: "/gl/period-close", allowedRoles: ["admin", "editor"] },
  { title: "Intercompany", icon: ArrowRightLeft, href: "/gl/intercompany", allowedRoles: ["admin", "editor"] },
  { title: "Revaluation", icon: RefreshCw, href: "/gl/revaluation", allowedRoles: ["admin", "editor"] },
  { title: "Accounts Payable", icon: DollarSign, href: "/finance/accounts-payable", allowedRoles: ["admin", "editor"] },
  { title: "Accounts Receivable", icon: TrendingUp, href: "/finance/accounts-receivable", allowedRoles: ["admin", "editor"] },
  { title: "Procurement", icon: ShoppingCart, href: "/procurement", allowedRoles: ["admin", "editor"] },
  { title: "Governance", icon: Lock, href: "/governance", allowedRoles: ["admin"] },
];

const intelligenceModules: MenuItem[] = [
  { title: "Analytics", icon: BarChart3, href: "/analytics" },
  { title: "AI", icon: Sparkles, href: "/ai", allowedRoles: ["admin", "editor"] },
  { title: "Developer", icon: GitBranch, href: "/developer", allowedRoles: ["admin"] },
];

const operationalModules: MenuItem[] = [
  { title: "Service", icon: Package, href: "/service", allowedRoles: ["admin", "editor"] },
  { title: "Manufacturing", icon: Factory, href: "/manufacturing", allowedRoles: ["admin", "editor"] },
  { title: "Logistics", icon: Truck, href: "/logistics", allowedRoles: ["admin", "editor"] },
];

const automationModules: MenuItem[] = [
  { title: "Workflow", icon: Workflow, href: "/workflow", allowedRoles: ["admin", "editor"] },
  { title: "Automation", icon: Brain, href: "/automation", allowedRoles: ["admin"] },
  { title: "Communication", icon: Bell, href: "/communication", allowedRoles: ["admin", "editor"] },
];

const educationModules: MenuItem[] = [
  { title: "Education", icon: GraduationCap, href: "/education" },
  { title: "Marketing", icon: TrendingUp, href: "/marketing", allowedRoles: ["admin", "editor"] },
];

const adminOnlyModules: MenuItem[] = [
  { title: "User Management", icon: Users, href: "/user-management", allowedRoles: ["admin"] },
  { title: "Tenant Admin", icon: Building, href: "/tenant-admin", allowedRoles: ["admin"] },
  { title: "System Config", icon: SettingsIcon, href: "/system-configuration", allowedRoles: ["admin"] },
  { title: "Deploy Industry", icon: Factory, href: "/industry-setup", allowedRoles: ["admin"] },
  { title: "View Deployments", icon: Database, href: "/industry-deployments", allowedRoles: ["admin"] },
];

function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case "admin":
      return "bg-red-500 text-white";
    case "editor":
      return "bg-blue-500 text-white";
    case "viewer":
      return "bg-gray-500 text-white";
    default:
      return "";
  }
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Administrator";
    case "editor":
      return "Editor";
    case "viewer":
      return "Viewer";
    default:
      return role;
  }
}

export function AppSidebar() {
  const [location] = useLocation();
  const { userRole, userId, logout } = useRBAC();
  const [, navigate] = useLocation();
  const [coreExpanded, setCoreExpanded] = useState(true);
  const [opsExpanded, setOpsExpanded] = useState(true);
  const [finExpanded, setFinExpanded] = useState(userRole === "admin" || userRole === "editor");
  const [intExpanded, setIntExpanded] = useState(true);
  const [opModExpanded, setOpModExpanded] = useState(userRole === "admin" || userRole === "editor");
  const [autoExpanded, setAutoExpanded] = useState(false);
  const [eduExpanded, setEduExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(userRole === "admin");

  const filterByRole = (items: MenuItem[]): MenuItem[] => {
    return items.filter((item) => {
      if (!item.allowedRoles) return true;
      return item.allowedRoles.includes(userRole);
    });
  };

  const renderMenuGroup = (
    title: string,
    items: MenuItem[],
    expanded: boolean,
    setExpanded: (val: boolean) => void
  ) => {
    const filteredItems = filterByRole(items);
    if (filteredItems.length === 0) return null;

    return (
      <SidebarGroup>
        <div className="flex items-center justify-between px-2">
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">{title}</SidebarGroupLabel>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => setExpanded(!expanded)}
            data-testid={`button-expand-${title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </Button>
        </div>
        {expanded && (
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link to={item.href}>
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>
    );
  };

  const getUserInitials = () => {
    if (!userId || userId === "guest") return "G";
    return userId
      .split(/[\s._-]/)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-base">NexusAIFirst</h1>
            <p className="text-xs text-muted-foreground">Enterprise Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-2 overflow-y-auto">
        {renderMenuGroup("Core Business", coreBusinessModules, coreExpanded, setCoreExpanded)}
        {renderMenuGroup("Operations & Admin", operationsModules, opsExpanded, setOpsExpanded)}
        {renderMenuGroup("Finance & Compliance", financeModules, finExpanded, setFinExpanded)}
        {renderMenuGroup("Intelligence & Integration", intelligenceModules, intExpanded, setIntExpanded)}
        {renderMenuGroup("Service & Supply", operationalModules, opModExpanded, setOpModExpanded)}
        {renderMenuGroup("Workflow & Automation", automationModules, autoExpanded, setAutoExpanded)}
        {renderMenuGroup("Education & Marketing", educationModules, eduExpanded, setEduExpanded)}
        {userRole === "admin" && renderMenuGroup("Platform Admin", adminOnlyModules, adminExpanded, setAdminExpanded)}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userId || "Guest"}</p>
            <Badge className={`text-xs ${getRoleBadgeColor(userRole)}`}>
              {getRoleLabel(userRole)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            data-testid="button-logout"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
