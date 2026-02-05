import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  Target, // CRM
  Briefcase, // Projects
  Layers, // ERP/Core
  Users, // HR
  DollarSign, // Finance
  Package, // SCM
  Factory, // Mfg
  Headphones, // Service
  BarChart3, // Analytics
  Lock, // Admin
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "CRM", url: "/crm", icon: Target },
  { title: "Finance", url: "/finance", icon: DollarSign },
  { title: "SCM", url: "/scm", icon: Package },
  { title: "HR", url: "/hr", icon: Users },
  { title: "Projects", url: "/projects", icon: Briefcase },
  { title: "Mfg", url: "/manufacturing", icon: Factory },
  { title: "Service", url: "/service", icon: Headphones },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Admin", url: "/admin", icon: Lock },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar
      collapsible="none"
      className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r bg-sidebar border-sidebar-border"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Layers className="size-4" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {mainNavItems.map((item) => {
            const isActive = location.startsWith(item.url) || (item.url === "/dashboard" && location === "/");
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={{
                    children: item.title,
                    hidden: false,
                  }}
                  isActive={isActive}
                  asChild
                  className="h-12 w-12 justify-center" // Ensure square for rail
                >
                  <Link to={item.url}>
                    <item.icon className={cn("size-5", isActive && "text-primary")} />
                    <span className="sr-only">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

