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
} from "lucide-react";

// MAIN MODULES - Clean sidebar navigation
const mainModules = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "CRM & Sales", icon: Users, href: "/crm", badge: "9 pages" },
  { title: "ERP & Finance", icon: DollarSign, href: "/erp", badge: "9 pages" },
  { title: "Projects", icon: Zap, href: "/projects", badge: "4 pages" },
  { title: "HR & Talent", icon: Briefcase, href: "/hr", badge: "14 pages" },
  { title: "Manufacturing", icon: Factory, href: "/manufacturing", badge: "4 pages" },
  { title: "Service & Support", icon: Package, href: "/service", badge: "8 pages" },
];

const intelligenceModules = [
  { title: "AI Copilot", icon: Sparkles, href: "/copilot" },
  { title: "AI Chat", icon: MessageCircle, href: "/ai-chat" },
  { title: "Analytics & BI", icon: BarChart3, href: "/analytics" },
];

const enterpriseModules = [
  { title: "Admin", icon: Shield, href: "/admin/platform" },
  { title: "Marketplace", icon: Store, href: "/marketplace" },
  { title: "Integrations", icon: Zap, href: "/integrations" },
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
  const [mainExpanded, setMainExpanded] = useState(true);
  const [intelligenceExpanded, setIntelligenceExpanded] = useState(true);
  const [enterpriseExpanded, setEnterpriseExpanded] = useState(false);
  const [industriesExpanded, setIndustriesExpanded] = useState(false);

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
                    {item.badge && <span className="text-xs ml-auto text-muted-foreground">{item.badge}</span>}
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
      
      <SidebarContent className="space-y-2">
        {renderMenuGroup("Business Modules", mainModules, mainExpanded, setMainExpanded)}
        {renderMenuGroup("Intelligence", intelligenceModules, intelligenceExpanded, setIntelligenceExpanded)}
        {renderMenuGroup("Enterprise", enterpriseModules, enterpriseExpanded, setEnterpriseExpanded)}

        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel className="text-xs uppercase tracking-wide">Industries</SidebarGroupLabel>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setIndustriesExpanded(!industriesExpanded)}
              data-testid="button-expand-industries"
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
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
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