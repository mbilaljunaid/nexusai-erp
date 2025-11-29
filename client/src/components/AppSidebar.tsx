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
} from "lucide-react";

const platformNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "ERP & Finance", icon: DollarSign, href: "/erp" },
  { title: "ERP Advanced", icon: DollarSign, href: "/erp-advanced", badge: "Premium" },
  { title: "Manufacturing", icon: Factory, href: "/manufacturing", badge: "New" },
  { title: "EPM", icon: BarChart3, href: "/epm", badge: "New" },
  { title: "CRM & Sales", icon: Users, href: "/crm" },
  { title: "CRM Advanced", icon: Users, href: "/crm-advanced", badge: "Premium" },
  { title: "Projects", icon: FolderKanban, href: "/projects" },
  { title: "HR & Talent", icon: Briefcase, href: "/hr" },
  { title: "HR Advanced", icon: Briefcase, href: "/hr-advanced", badge: "Premium" },
  { title: "Service & Support", icon: Package, href: "/service" },
  { title: "Marketing", icon: Sparkles, href: "/marketing" },
];

const digitialNavItems = [
  { title: "Website Builder", icon: Zap, href: "/website" },
  { title: "Email Management", icon: Package, href: "/email" },
  { title: "E-Commerce", icon: ShoppingCart, href: "/ecommerce" },
];

const analyticsNavItems = [
  { title: "Analytics & BI", icon: BarChart3, href: "/analytics" },
  { title: "Compliance & Audit", icon: Shield, href: "/compliance" },
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
