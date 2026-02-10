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
import {
    Users,
    Users2,
    Briefcase,
    GraduationCap,
    FileText,
    Settings,
    Database,
    Clock,
    BarChart3,
    Award,
    Brain,
    Kanban,
    Calendar,
    Handshake,
    LineChart,
    Search
} from "lucide-react";

const hrMenu = [
    {
        label: "Talent Core",
        items: [
            { title: "Dashboard", url: "/hr", icon: Users },
            { title: "Person Management", url: "/hr/employees", icon: Users2 },
            { title: "Payroll Workbench", url: "/hr/payroll", icon: Award },
        ]
    },
    {
        label: "Recruitment (ATS)",
        items: [
            { title: "Job Openings", url: "/hr/recruitment", icon: Briefcase },
            { title: "Pipeline Board", url: "/hr/recruitment/pipeline", icon: Kanban },
            { title: "Candidate Search", url: "/hr/recruitment/candidates", icon: Search },
            { title: "Interview Schedule", url: "/hr/recruitment/interviews", icon: Calendar },
            { title: "Offer Management", url: "/hr/recruitment/offers", icon: Handshake },
            { title: "AI Matching", url: "/hr/recruitment/matching", icon: Brain },
            { title: "Analytics", url: "/hr/recruitment/analytics", icon: LineChart },
        ]
    },
    {
        label: "Development",
        items: [
            { title: "Performance", url: "/hr/performance", icon: FileText },
            { title: "Learning (LMS)", url: "/talent/learning", icon: GraduationCap },
            { title: "Talent Pool", url: "/hr/talent-pool", icon: Users },
        ]
    },
    {
        label: "Workforce",
        items: [
            { title: "My Time", url: "/wfm/my-time", icon: Clock },
            { title: "Team Schedule", url: "/wfm/schedule", icon: Clock },
        ]
    }
];

export function HrSidebar() {
    const [location] = useLocation();

    return (
        <Sidebar className="border-r bg-sidebar border-sidebar-border w-64" collapsible="none">
            <div className="flex h-12 items-center px-4 border-b border-sidebar-border">
                <h2 className="text-lg font-semibold tracking-tight text-sidebar-foreground">Human Capital</h2>
            </div>
            <SidebarContent>
                {hrMenu.map((group) => (
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
