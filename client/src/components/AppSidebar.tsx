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
  FolderKanban,
  BarChart3,
  Settings as SettingsIcon,
  Activity,
  Sparkles,
  DollarSign,
  Zap,
  ChevronDown,
  Shield,
  Package,
  Briefcase,
  ShoppingCart,
  Factory,
  BookOpen,
  CheckSquare,
  Cpu,
  MessageCircle,
  Truck,
  Calendar,
  Store,
  Smartphone,
  CreditCard,
  Database,
} from "lucide-react";

const platformNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "ERP & Finance", icon: DollarSign, href: "/erp" },
  { title: "ERP Advanced", icon: DollarSign, href: "/erp-advanced", badge: "Premium" },
  { title: "Inventory", icon: Package, href: "/inventory", badge: "NEW" },
  { title: "Manufacturing", icon: Factory, href: "/manufacturing", badge: "New" },
  { title: "EPM", icon: BarChart3, href: "/epm", badge: "New" },
  { title: "CRM & Sales", icon: Users, href: "/crm" },
  { title: "CRM Advanced", icon: Users, href: "/crm-advanced", badge: "Premium" },
  { title: "Projects", icon: FolderKanban, href: "/projects" },
  { title: "HR & Talent", icon: Briefcase, href: "/hr" },
  { title: "HR Advanced", icon: Briefcase, href: "/hr-advanced", badge: "Premium" },
  { title: "Service & Support", icon: Package, href: "/service" },
  { title: "Field Service", icon: Truck, href: "/field-service", badge: "New" },
  { title: "Marketing", icon: Sparkles, href: "/marketing" },
];

const crmDetailItems = [
  { title: "Lead Details", icon: Users, href: "/lead-detail", badge: "PHASE1" },
  { title: "Opportunities", icon: TrendingUp, href: "/opportunities", badge: "PHASE1" },
  { title: "Sales Pipeline", icon: BarChart3, href: "/sales-pipeline", badge: "PHASE1" },
  { title: "Revenue Forecast", icon: TrendingUp, href: "/forecast", badge: "PHASE1" },
  { title: "Accounts", icon: Users, href: "/accounts", badge: "PHASE1" },
  { title: "Account Hierarchy", icon: Users, href: "/account-hierarchy", badge: "PHASE1" },
  { title: "Contacts", icon: Users, href: "/contacts", badge: "PHASE1" },
  { title: "Activity Timeline", icon: Activity, href: "/activity-timeline", badge: "PHASE1" },
  { title: "Lead Scoring", icon: Sparkles, href: "/lead-scoring", badge: "PHASE1" },
  { title: "Convert Lead", icon: TrendingUp, href: "/lead-conversion", badge: "PHASE1" },
];

const erpDetailItems = [
  { title: "Invoices", icon: DollarSign, href: "/invoices", badge: "PHASE1" },
  { title: "Purchase Orders", icon: Package, href: "/purchase-orders", badge: "PHASE1" },
  { title: "Vendors", icon: Users, href: "/vendors", badge: "PHASE1" },
  { title: "General Ledger", icon: BarChart3, href: "/general-ledger", badge: "PHASE1" },
  { title: "Financial Reports", icon: BarChart3, href: "/financial-reports", badge: "PHASE1" },
];

const manufacturingDetailItems = [
  { title: "Work Orders", icon: Package, href: "/work-orders", badge: "PHASE1" },
  { title: "MRP Planning", icon: Factory, href: "/mrp", badge: "PHASE1" },
  { title: "Shop Floor", icon: Factory, href: "/shop-floor", badge: "PHASE1" },
  { title: "Quality Control", icon: CheckSquare, href: "/quality-control", badge: "PHASE1" },
];

const digitialNavItems = [
  { title: "Website Builder", icon: Zap, href: "/website" },
  { title: "Email Management", icon: Package, href: "/email" },
  { title: "E-Commerce", icon: ShoppingCart, href: "/ecommerce" },
];

const analyticsNavItems = [
  { title: "Analytics & BI", icon: BarChart3, href: "/analytics" },
  { title: "Backend Integration", icon: Database, href: "/backend-integration", badge: "Live" },
  { title: "Compliance & Audit", icon: Shield, href: "/compliance" },
];

const aiNavItems = [
  { title: "AI Copilot", icon: Sparkles, href: "/copilot", badge: "AI" },
  { title: "AI Chat", icon: MessageCircle, href: "/ai-chat", badge: "AI" },
  { title: "Planning & Forecasting", icon: Calendar, href: "/planning", badge: "AI" },
];

const marketplaceNavItems = [
  { title: "Marketplace", icon: Store, href: "/marketplace", badge: "New" },
  { title: "Mobile Sync", icon: Smartphone, href: "/mobile-sync", badge: "Sync" },
  { title: "Billing & Payments", icon: CreditCard, href: "/billing" },
];

const advancedNavItems = [
  { title: "Form Builder", icon: BookOpen, href: "/forms" },
  { title: "UAT Automation", icon: CheckSquare, href: "/uat" },
  { title: "Advanced Features", icon: Cpu, href: "/advanced", badge: "Beta" },
  { title: "Industry Config", icon: Factory, href: "/industry-config" },
];

const systemNavItems = [
  { title: "Process Mapping", icon: Activity, href: "/bpm" },
  { title: "Integration Hub", icon: Zap, href: "/integrations" },
  { title: "System Health", icon: Activity, href: "/health" },
  { title: "Settings", icon: SettingsIcon, href: "/settings" },
];

const adminNavItems = [
  { title: "Platform Admin", icon: Shield, href: "/admin/platform", badge: "Platform" },
  { title: "Tenant Admin", icon: Users, href: "/admin/tenant", badge: "Tenant" },
];

const industryNavItems = [
  { title: "Manufacturing", href: "/industry/manufacturing" },
  { title: "Retail & E-Commerce", href: "/industry/retail" },
  { title: "Financial Services", href: "/industry/finservices" },
  { title: "Healthcare", href: "/industry/healthcare" },
  { title: "Construction", href: "/industry/construction" },
  { title: "View All Industries →", href: "/industries" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [industriesExpanded, setIndustriesExpanded] = useState(false);

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
      
      <SidebarContent className="space-y-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Platforms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Digital & Web</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {digitialNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Analytics & Governance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">AI & Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Marketplace & Mobile</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {marketplaceNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Advanced & Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {advancedNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel className="text-xs uppercase tracking-wide">Industries</SidebarGroupLabel>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setIndustriesExpanded(!industriesExpanded)}
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${industriesExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          {industriesExpanded && (
            <SidebarGroupContent>
              <SidebarMenu>
                {industryNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location === item.href}
                      className="text-xs"
                    >
                      <Link href={item.href}>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
