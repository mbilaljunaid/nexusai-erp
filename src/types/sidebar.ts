import { LucideIcon } from "lucide-react";

export type SidebarNodeType = "section" | "group" | "link";

export interface SidebarNode {
  id: string;
  title: string;
  type: SidebarNodeType;
  icon?: LucideIcon;
  path?: string;
  children?: SidebarNode[];
  expanded?: boolean;
  permissionId?: string;
  allowedRoles?: string[];
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

export interface SidebarConfig {
  sections: SidebarNode[];
}
