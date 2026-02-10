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
    Search,
    CalendarDays,
    CheckCircle,
    AlertTriangle,
    DollarSign,
    Sparkles,
    ClipboardList,
    FileCheck,
    GitBranch
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
        label: "Learning & Development",
        items: [
            { title: "My Learning", url: "/hr/learning/me", icon: GraduationCap },
            { title: "Communities", url: "/hr/learning/communities", icon: Users },
            { title: "Team Dashboard", url: "/hr/learning/team", icon: Users2 },
            { title: "Instructor", url: "/hr/learning/instructor", icon: Award },
        ]
    },
    {
        label: "Learning Admin",
        items: [
            { title: "Course Catalog", url: "/hr/learning/admin", icon: Database },
            { title: "Assessments", url: "/hr/learning/admin/assessments", icon: FileCheck },
            { title: "Learning Paths", url: "/hr/learning/admin/curricula", icon: GitBranch },
        ]
    },
    {
        label: "Time & Labor (WFM)",
        items: [
            { title: "My Time", url: "/hr/wfm/me/time", icon: Clock },
            { title: "Leave Balances", url: "/hr/wfm/me/balances", icon: CalendarDays },
        ]
    },
    {
        label: "WFM: Manager Tools",
        items: [
            { title: "Team Schedule", url: "/hr/wfm/team/schedule", icon: Calendar },
            { title: "Approvals", url: "/hr/wfm/team/approvals", icon: CheckCircle },
            { title: "Timekeeper Console", url: "/hr/wfm/timekeeper", icon: ClipboardList },
        ]
    },
    {
        label: "WFM: Admin & Analytics",
        items: [
            { title: "Shift Configuration", url: "/hr/wfm/admin/shifts", icon: Settings },
            { title: "Holiday Calendar", url: "/hr/wfm/admin/holidays", icon: CalendarDays },
            { title: "Labor Analytics", url: "/hr/wfm/analytics", icon: BarChart3 },
            { title: "Violations", url: "/hr/wfm/violations", icon: AlertTriangle },
            { title: "AI Workforce Insights", url: "/hr/wfm/insights", icon: Sparkles },
            { title: "Payroll Transfer", url: "/hr/wfm/payroll", icon: DollarSign },
        ]
    },
    {
        label: "Self-Service",
        items: [
            { title: "Employee (ESS)", url: "/hr/self-service/me", icon: Users },
            { title: "My Team (MSS)", url: "/hr/self-service/team", icon: Users2 },
            { title: "Personal Info", url: "/hr/self-service/profile", icon: FileText },
            { title: "Time Card", url: "/hr/self-service/time", icon: Clock },
            { title: "Delegations", url: "/hr/self-service/delegation", icon: Handshake },
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
