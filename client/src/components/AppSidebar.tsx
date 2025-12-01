import { useLocation, Link } from "wouter";
import { useState } from "react";
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
  Database,
  Lock,
  Radio,
  Truck,
} from "lucide-react";

// MAIN MODULES - All 22 modules
const coreBusinessModules = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "CRM", icon: Users, href: "/crm" },
  { title: "ERP", icon: DollarSign, href: "/erp" },
  { title: "HR", icon: Briefcase, href: "/hr" },
  { title: "Projects", icon: Zap, href: "/projects" },
];

const operationsModules = [
  { title: "Operations", icon: Cog, href: "/operations" },
  { title: "Admin", icon: Shield, href: "/admin" },
  { title: "General", icon: Grid3x3, href: "/general" },
  { title: "Finance", icon: DollarSign, href: "/finance" },
];

const financeModules = [
  { title: "Procurement", icon: ShoppingCart, href: "/procurement" },
  { title: "Governance", icon: Lock, href: "/governance" },
];

const intelligenceModules = [
  { title: "Analytics", icon: BarChart3, href: "/analytics" },
  { title: "AI", icon: Sparkles, href: "/ai" },
  { title: "Developer", icon: GitBranch, href: "/developer" },
];

const operationalModules = [
  { title: "Service", icon: Package, href: "/service" },
  { title: "Manufacturing", icon: Factory, href: "/manufacturing" },
  { title: "Logistics", icon: Truck, href: "/logistics" },
];

const automationModules = [
  { title: "Workflow", icon: Workflow, href: "/workflow" },
  { title: "Automation", icon: Brain, href: "/automation" },
  { title: "Communication", icon: Bell, href: "/communication" },
];

const educationModules = [
  { title: "Education", icon: GraduationCap, href: "/education" },
  { title: "Marketing", icon: TrendingUp, href: "/marketing" },
];

const industrySetupItems = [
  { title: "Deploy Industry", href: "/industry-setup" },
  { title: "View Deployments", href: "/industry-deployments" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [coreExpanded, setCoreExpanded] = useState(true);
  const [opsExpanded, setOpsExpanded] = useState(true);
  const [finExpanded, setFinExpanded] = useState(true);
  const [intExpanded, setIntExpanded] = useState(true);
  const [opModExpanded, setOpModExpanded] = useState(true);
  const [autoExpanded, setAutoExpanded] = useState(false);
  const [eduExpanded, setEduExpanded] = useState(false);
  const [industrySetupExpanded, setIndustrySetupExpanded] = useState(false);

  const renderMenuGroup = (title: string, items: any[], expanded: boolean, setExpanded: any) => (
    <SidebarGroup>
      <div className="flex items-center justify-between px-2">
        <SidebarGroupLabel className="text-xs uppercase tracking-wide">{title}</SidebarGroupLabel>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5"
          onClick={() => setExpanded(!expanded)}
          data-testid={`button-expand-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      {expanded && (
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={location === item.href}
                  data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Link href={item.href}>
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

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-base">NexusAI</h1>
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

        {renderMenuGroup("Industry Setup", industrySetupItems, industrySetupExpanded, setIndustrySetupExpanded)}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Admin</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}