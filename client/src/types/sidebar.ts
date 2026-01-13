import { LucideIcon } from "lucide-react";

export type SidebarNodeType = "section" | "group" | "link";

/**
 * Represents a node in the deterministic sidebar tree.
 * Modeled after Oracle/SAP navigation structures.
 */
export interface SidebarNode {
    id: string; // Unique identifier for the node
    title: string; // Display text
    type: SidebarNodeType;
    icon?: LucideIcon; // Optional icon for the node
    path?: string; // Route path (for links)
    children?: SidebarNode[]; // Recursive children
    expanded?: boolean; // Default expansion state
    permissionId?: string; // For future RBAC integration
    allowedRoles?: string[]; // RBAC roles

    // UI Hints
    badge?: string; // e.g., "New", "Beta"
    badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

/**
 * The root configuration object for the sidebar.
 */
export interface SidebarConfig {
    sections: SidebarNode[]; // Top-level sections (e.g., "Core ERP", "Analytics")
}
