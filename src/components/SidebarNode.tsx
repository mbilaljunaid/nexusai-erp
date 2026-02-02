import { Link, useLocation } from "react-router-dom";
import { SidebarNode } from "@/types/sidebar";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarNodeProps {
  node: SidebarNode;
  level?: number;
}

export function SidebarNodeRenderer({ node, level = 0 }: SidebarNodeProps) {
  const location = useLocation();
  const isActive = node.path ? location.pathname === node.path : false;
  const hasChildren = node.children && node.children.length > 0;

  // SECTION: Top-level grouping
  if (node.type === "section") {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{node.title}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {node.children?.map((child) => (
              <SidebarNodeRenderer key={child.id} node={child} level={level + 1} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  // GROUP: Collapsible menu with children
  if (node.type === "group" && hasChildren) {
    return (
      <Collapsible defaultOpen={node.expanded} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={node.title}>
              {node.icon && <node.icon />}
              <span>{node.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {node.children?.map((child) => (
                <SidebarNodeRenderer key={child.id} node={child} level={level + 1} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  // LINK: Leaf node navigation item
  if (node.type === "link") {
    const isChild = level > 1;

    if (isChild) {
      return (
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={isActive}>
            <Link to={node.path || "#"}>
              <span>{node.title}</span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      );
    }

    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={node.title}>
          <Link to={node.path || "#"}>
            {node.icon && <node.icon />}
            <span>{node.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return null;
}
