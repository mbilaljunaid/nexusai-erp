import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export type DomainMenu = {
    label: string;
    items: {
        title: string;
        url: string;
        icon?: React.ElementType;
    }[];
};

export function DomainSidebar({ menu, title }: { menu: DomainMenu[]; title: string }) {
    const [location] = useLocation();

    return (
        <Sidebar className="border-r bg-sidebar border-sidebar-border w-64" collapsible="none">
            <div className="flex h-12 items-center px-4 border-b border-sidebar-border">
                <h2 className="text-lg font-semibold tracking-tight text-sidebar-foreground">{title}</h2>
            </div>
            <SidebarContent>
                {menu.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton asChild isActive={location === item.url}>
                                            <Link to={item.url}>
                                                {item.icon && <item.icon className="h-4 w-4" />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    );
}
