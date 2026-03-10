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
    GitBranch,
    TrendingUp,
    Calculator,
    Send,
    Bell,
    UserPlus,
    History,
    Scale,
    Network
} from "lucide-react";

const hrMenu = [
    {
        label: "Talent Core",
        items: [
            { title: "Dashboard", url: "/hr", icon: Users },
            { title: "New Hire Wizard", url: "/hr/hire", icon: UserPlus },
            { title: "Person Management", url: "/hr/employees", icon: Users2 },
            { title: "Person Spotlight", url: "/hr/employees/spotlight/EMP-10042", icon: Search },
            { title: "Competency Management", url: "/hr/talent/competencies", icon: Award },
            { title: "Performance Reviews", url: "/hr/performance", icon: ClipboardList },
            { title: "Calibration Board", url: "/hr/performance/calibration", icon: CheckCircle },
            { title: "360° Feedback", url: "/hr/performance/360-feedback", icon: Users },
            { title: "Doc Routing Config", url: "/hr/talent/performance/routing", icon: Settings },
            { title: "Comp Integration", url: "/hr/talent/performance/comp-sync", icon: DollarSign },
            { title: "Succession Planning", url: "/hr/succession", icon: GitBranch },
            { title: "Succession Org Chart", url: "/hr/succession/org-chart", icon: GitBranch },
            { title: "Risk of Loss Matrix", url: "/hr/succession/risk-board", icon: AlertTriangle },
            { title: "Succession Alerts", url: "/hr/succession/notifications", icon: Bell },
            { title: "Goal Cascade", url: "/hr/talent/goal-cascade", icon: TrendingUp },
            { title: "Seniority Tracking", url: "/hr/seniority-tracking", icon: Clock },
            { title: "DateTrack Manager", url: "/hr/datetrack", icon: History },
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
            { title: "My Interviews", url: "/hr/recruitment/my-interviews", icon: ClipboardList },
            { title: "Offer Management", url: "/hr/recruitment/offers", icon: Handshake },
            { title: "Career Site Builder", url: "/hr/recruitment/career-site", icon: Sparkles },
            { title: "Candidate Merge", url: "/hr/recruitment/candidate-merge", icon: Users2 },
            { title: "Job Board Publishing", url: "/hr/recruitment/job-boards", icon: Send },
            { title: "Interview Scoring", url: "/hr/recruitment/interview-scoring", icon: CheckCircle },
            { title: "Approval Rules", url: "/hr/recruitment/approval-rules", icon: Scale },
            { title: "Onboarding Checklist", url: "/hr/recruitment/onboarding-checklist", icon: ClipboardList },
            { title: "Onboarding Tracker", url: "/hr/recruitment/onboarding-tracker", icon: CheckCircle },
            { title: "AI Matching", url: "/hr/recruitment/matching", icon: Brain },
            { title: "Analytics Dashboard", url: "/hr/recruitment/analytics-dashboard", icon: BarChart3 },
            { title: "Analytics (Legacy)", url: "/hr/recruitment/analytics", icon: LineChart },
        ]
    },
    {
        label: "Learning & Development",
        items: [
            { title: "My Learning", url: "/hr/learning/me", icon: GraduationCap },
            { title: "Communities", url: "/hr/learning/communities", icon: Users },
            { title: "External CPE Credit", url: "/hr/learning/external-credit", icon: FileCheck },
            { title: "AI Recommendations", url: "/hr/learning/recommendations", icon: Sparkles },
            { title: "Team Dashboard", url: "/hr/learning/team", icon: Users2 },
            { title: "Instructor", url: "/hr/learning/instructor", icon: Award },
        ]
    },
    {
        label: "Learning Admin",
        items: [
            { title: "Course Catalog", url: "/hr/learning/admin", icon: Database },
            { title: "Assessments", url: "/hr/learning/admin/assessments", icon: FileCheck },
            { title: "Compliance Renewals", url: "/hr/learning/compliance", icon: AlertTriangle },
            { title: "Learning Paths", url: "/hr/learning/admin/curricula", icon: GitBranch },
            { title: "Skills Integration", url: "/hr/learning/skill-sync", icon: Database },
        ]
    },
    {
        label: "Analytics & Insights",
        items: [
            { title: "HR Analytics", url: "/hr/analytics", icon: BarChart3 },
            { title: "Predictive Analytics", url: "/hr/analytics/predictive", icon: TrendingUp },
            { title: "Reports", url: "/hr/reports", icon: FileText },
            { title: "EEO-1 Reporting", url: "/hr/reports/eeo-establishment", icon: FileCheck },
        ]
    },
    {
        label: "Time & Labor (WFM)",
        items: [
            { title: "My Time", url: "/hr/wfm/me/time", icon: Clock },
            { title: "Shift Bidding", url: "/hr/wfm/shift-bidding", icon: Sparkles },
            { title: "Leave Balances", url: "/hr/wfm/me/balances", icon: CalendarDays },
        ]
    },
    {
        label: "WFM: Manager Tools",
        items: [
            { title: "Team Schedule", url: "/hr/wfm/team/schedule", icon: Calendar },
            { title: "Approvals", url: "/hr/wfm/team/approvals", icon: CheckCircle },
            { title: "Timekeeper Console", url: "/hr/wfm/timekeeper", icon: ClipboardList },
            { title: "Time Card Audit", url: "/hr/wfm/timecard-audit", icon: CheckCircle },
        ]
    },
    {
        label: "WFM: Admin & Analytics",
        items: [
            { title: "Shift Configuration", url: "/hr/wfm/admin/shifts", icon: Settings },
            { title: "Holiday Calendar", url: "/hr/wfm/admin/holidays", icon: CalendarDays },
            { title: "Time Periods", url: "/hr/wfm/admin/time-periods", icon: CalendarDays },
            { title: "Time Rules", url: "/hr/wfm/admin/time-rules", icon: ClipboardList },
            { title: "Absence Setup", url: "/hr/wfm/absence/setup", icon: Calendar },
            { title: "FMLA Workbench", url: "/hr/wfm/fmla", icon: ClipboardList },
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
            { title: "Total Compensation", url: "/hr/compensation/total-rewards", icon: DollarSign },
            { title: "Equity Awards", url: "/hr/compensation/equity", icon: LineChart },
            { title: "Delegations", url: "/hr/self-service/delegation", icon: Handshake },
        ]
    },
    {
        label: "Setup & Config",
        items: [
            { title: "Workforce Config", url: "/hr/setup", icon: Settings },
            { title: "Workforce Structures", url: "/hr/setup/workforce-structures", icon: Settings },
            { title: "Tree Versioning", url: "/hr/setup/tree-versioning", icon: GitBranch },
            { title: "Document Records", url: "/hr/setup/document-records", icon: FileText },
            { title: "Grade Ladders", url: "/hr/setup/grade-ladders", icon: TrendingUp },
            { title: "Job Families & Profiles", url: "/hr/setup/job-families", icon: Network },
            { title: "Benefits Programs", url: "/hr/setup/benefits-programs", icon: DollarSign },
            { title: "Regulatory Calendar", url: "/hr/regulatory-calendar", icon: Calendar },
            { title: "Comp & Benefits", url: "/hr/compensation", icon: DollarSign },
            { title: "Comp Workbench", url: "/hr/compensation/workbench", icon: DollarSign },
            { title: "Eligibility Profiles", url: "/hr/compensation/eligibility-profiles", icon: Scale },
            { title: "Salary Ranges", url: "/hr/compensation/salary-ranges", icon: TrendingUp },
        ]
    },
    {
        label: "Payroll Admin",
        items: [
            { title: "Payroll Definition Setup", url: "/hr/payroll/definition-setup", icon: Settings },
            { title: "Statutory Tax Filing", url: "/hr/payroll/statutory-taxes", icon: FileText },
            { title: "Off-Cycle Payment", url: "/hr/payroll/off-cycle", icon: DollarSign },
            { title: "Payroll Simulator", url: "/hr/payroll/simulator", icon: Calculator },
        ]
    },
    {
        label: "Global HR Administration",
        items: [
            { title: "Employment Contracts", url: "/hr/employment-contracts", icon: FileCheck },
            { title: "Position Budgeting", url: "/hr/position-budgeting", icon: TrendingUp },
            { title: "Journey Templates", url: "/hr/journey-templates", icon: ClipboardList },
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
