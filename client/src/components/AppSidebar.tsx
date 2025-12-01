import { useLocation, Link } from "wouter";
import { useState, useMemo } from "react";
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
import { LayoutDashboard, ChevronDown, Sparkles } from "lucide-react";
import { formMetadataRegistry } from "@/lib/formMetadata";

export function AppSidebar() {
  const [location] = useLocation();
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Organize all forms by module
  const moduleMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    
    Object.values(formMetadataRegistry).forEach((form) => {
      const module = form.module || "General";
      if (!map[module]) {
        map[module] = [];
      }
      map[module].push(form);
    });

    // Sort modules alphabetically and sort forms within each module
    const sorted: Record<string, any[]> = {};
    Object.keys(map)
      .sort()
      .forEach((key) => {
        sorted[key] = map[key].sort((a, b) => a.name.localeCompare(b.name));
      });

    return sorted;
  }, []);

  const toggleModule = (moduleName: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-md bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-base">NexusAI</h1>
              <p className="text-xs text-muted-foreground">Enterprise Platform</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="space-y-1">
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard"}
                  data-testid="nav-dashboard"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-sm">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* All Modules */}
        {Object.entries(moduleMap).map(([moduleName, forms]) => (
          <SidebarGroup key={moduleName}>
            <div className="flex items-center justify-between px-2">
              <SidebarGroupLabel className="text-xs uppercase tracking-wide">
                {moduleName}
              </SidebarGroupLabel>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => toggleModule(moduleName)}
                data-testid={`button-expand-${moduleName.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${
                    expandedModules[moduleName] ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>

            {expandedModules[moduleName] && (
              <SidebarGroupContent>
                <SidebarMenu>
                  {forms.map((form) => (
                    <SidebarMenuItem key={form.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === form.page}
                        data-testid={`nav-${form.id}`}
                      >
                        <Link href={form.page}>
                          <span className="text-sm">{form.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              JD
            </AvatarFallback>
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
