import { useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, LogOut } from "lucide-react";
import { navigationConfig } from "@/config/navigation";
import { SidebarNodeRenderer } from "@/components/SidebarNode";
import { SidebarNode } from "@/types/sidebar";

type UserRole = "admin" | "editor" | "viewer";

function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case "admin":
      return "bg-destructive text-destructive-foreground";
    case "editor":
      return "bg-primary text-primary-foreground";
    case "viewer":
      return "bg-muted text-muted-foreground";
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
  const navigate = useNavigate();
  
  // TODO: Replace with actual auth context
  const userRole: UserRole = "admin";
  const userId: string = "demo.user";

  const handleLogout = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const getUserInitials = () => {
    if (!userId || userId === "guest" as string) return "G";
    return userId
      .split(/[\s._-]/)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filterNodes = useCallback((nodes: SidebarNode[]): SidebarNode[] => {
    return nodes
      .filter((node) => {
        if (!node.allowedRoles) return true;
        return node.allowedRoles.includes(userRole);
      })
      .map((node) => {
        if (node.children) {
          return { ...node, children: filterNodes(node.children) };
        }
        return node;
      })
      .filter((node) => {
        if ((node.type === "section" || node.type === "group") && node.children) {
          return node.children.length > 0;
        }
        return true;
      });
  }, [userRole]);

  const filteredNavigation = useMemo(() => filterNodes(navigationConfig), [filterNodes]);

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
        {filteredNavigation.map((node) => (
          <SidebarNodeRenderer key={node.id} node={node} />
        ))}
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
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
