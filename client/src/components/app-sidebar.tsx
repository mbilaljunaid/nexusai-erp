import { Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Users,
  ShoppingCart,
  Briefcase,
  Settings,
  FileText,
  Zap,
  Brain,
  Layers,
  Home,
  TrendingUp,
  Package,
  DollarSign,
  Factory,
  Truck,
  Headphones,
  Target,
  Lock,
  Database,
  Code,
  Workflow,
} from "lucide-react";

export function AppSidebar() {
  const menuItems = [
    {
      label: "Core",
      items: [
        { title: "Dashboard", url: "/", icon: Home },
        { title: "CRM", url: "/crm", icon: Target },
        { title: "Projects", url: "/projects", icon: Briefcase },
        { title: "ERP", url: "/erp", icon: Layers },
        { title: "HR", url: "/hr", icon: Users },
      ],
    },
    {
      label: "Finance & Accounting",
      items: [
        { title: "Chart of Accounts", url: "/chart-of-accounts", icon: FileText },
        { title: "General Ledger", url: "/general-ledger", icon: DollarSign },
        { title: "AP Invoices", url: "/ap-invoices", icon: FileText },
        { title: "AR Invoices", url: "/ar-invoices", icon: FileText },
        { title: "Bank Reconciliation", url: "/finance-bank-reconciliation", icon: DollarSign },
        { title: "Invoice Generator", url: "/invoice-generator", icon: FileText },
        { title: "Budget Planning", url: "/budget-planning", icon: DollarSign },
        { title: "Financial Reports", url: "/financial-reports", icon: BarChart3 },
        { title: "Cost Optimization", url: "/cost-optimization", icon: TrendingUp },
      ],
    },
    {
      label: "HR & Payroll",
      items: [
        { title: "Employees", url: "/employees", icon: Users },
        { title: "Employees List", url: "/employees-list", icon: Users },
        { title: "Payroll", url: "/payroll", icon: DollarSign },
        { title: "Payroll Processing", url: "/payroll-processing", icon: DollarSign },
        { title: "Payroll Runs", url: "/payroll-runs", icon: DollarSign },
        { title: "Payroll Engine", url: "/payroll-engine", icon: DollarSign },
        { title: "Leave Request", url: "/leave-request", icon: Zap },
        { title: "Leave Workflows", url: "/leave-workflows", icon: Workflow },
        { title: "Leave Approval", url: "/leave-approval", icon: Zap },
        { title: "Performance Reviews", url: "/performance-reviews", icon: TrendingUp },
        { title: "Performance Management", url: "/performance-management", icon: TrendingUp },
        { title: "Onboarding", url: "/onboarding-automation", icon: Users },
        { title: "Org Chart", url: "/org-chart", icon: Users },
        { title: "Employee Engagement", url: "/employee-engagement", icon: Users },
        { title: "Succession Planning", url: "/succession-planning", icon: Target },
        { title: "Capacity Planning", url: "/capacity-planning", icon: BarChart3 },
      ],
    },
    {
      label: "Sales & CRM",
      items: [
        { title: "Opportunities", url: "/opportunities", icon: Target },
        { title: "Opportunities (New)", url: "/opportunities-sales", icon: Target },
        { title: "Leads", url: "/leads", icon: Target },
        { title: "Accounts", url: "/account-directory", icon: Briefcase },
        { title: "Contacts", url: "/contact-directory", icon: Users },
        { title: "Lead Scoring", url: "/lead-scoring-dashboard", icon: Target },
        { title: "Lead Conversion", url: "/lead-conversion", icon: TrendingUp },
        { title: "Sales Analytics", url: "/sales-analytics", icon: BarChart3 },
        { title: "Revenue Forecasting", url: "/revenue-forecasting", icon: TrendingUp },
      ],
    },
    {
      label: "Projects & Agile",
      items: [
        { title: "Epics", url: "/epics", icon: Briefcase },
        { title: "Stories", url: "/stories", icon: Briefcase },
        { title: "Sprints", url: "/sprints", icon: Zap },
        { title: "Kanban Board", url: "/kanban-board", icon: BarChart3 },
        { title: "Agile Board", url: "/agile-board", icon: BarChart3 },
        { title: "Task Management", url: "/task-management", icon: FileText },
        { title: "Workflow Builder", url: "/workflow-builder", icon: Workflow },
        { title: "Workflow Designer", url: "/workflow-designer", icon: Workflow },
      ],
    },
    {
      label: "Manufacturing",
      items: [
        { title: "Work Orders", url: "/work-order", icon: Factory },
        { title: "MRP Dashboard", url: "/mrp-dashboard", icon: BarChart3 },
        { title: "Shop Floor", url: "/shop-floor", icon: Factory },
        { title: "Quality Control", url: "/quality-control", icon: Lock },
      ],
    },
    {
      label: "Supply Chain",
      items: [
        { title: "RFQs", url: "/rfqs", icon: Truck },
        { title: "Purchase Orders", url: "/purchase-orders", icon: Package },
        { title: "Goods Receipt", url: "/goods-receipt", icon: Package },
        { title: "Supplier Invoices", url: "/supplier-invoices", icon: FileText },
        { title: "3-Way Match", url: "/three-way-match", icon: Truck },
        { title: "Inventory", url: "/inventory", icon: Package },
        { title: "Warehouse Management", url: "/warehouse-management", icon: Package },
        { title: "Supplier Management", url: "/supplier-management", icon: Truck },
      ],
    },
    {
      label: "Service & Support",
      items: [
        { title: "Tickets", url: "/service-tickets", icon: Headphones },
        { title: "Ticket Dashboard", url: "/ticket-dashboard", icon: BarChart3 },
        { title: "Knowledge Base", url: "/knowledge-base", icon: Brain },
        { title: "SLA Tracking", url: "/sla-tracking", icon: Target },
        { title: "Service Analytics", url: "/service-analytics", icon: BarChart3 },
        { title: "Customer Portal", url: "/customer-portal", icon: ShoppingCart },
      ],
    },
    {
      label: "Marketing & Growth",
      items: [
        { title: "Campaigns", url: "/campaign-management", icon: Target },
        { title: "Lead Scoring Analytics", url: "/lead-scoring-analytics", icon: Target },
        { title: "Growth Metrics", url: "/growth-metrics", icon: TrendingUp },
        { title: "Predictive Analytics", url: "/predictive-analytics", icon: Brain },
      ],
    },
    {
      label: "Analytics & BI",
      items: [
        { title: "Dashboard Builder", url: "/dashboard-builder", icon: BarChart3 },
        { title: "Report Builder", url: "/report-builder", icon: FileText },
        { title: "Data Explorer", url: "/data-explorer", icon: Database },
        { title: "Business Intelligence", url: "/business-intelligence", icon: Brain },
        { title: "Advanced Analytics", url: "/advanced-analytics", icon: Brain },
        { title: "Financial Analytics", url: "/financial-analytics", icon: BarChart3 },
        { title: "Operational Analytics", url: "/operational-analytics", icon: BarChart3 },
        { title: "Churn Risk Analysis", url: "/churn-risk-analysis", icon: TrendingUp },
      ],
    },
    {
      label: "Governance & Compliance",
      items: [
        { title: "Compliance Dashboard", url: "/compliance-dashboard", icon: Lock },
        { title: "Data Governance", url: "/data-governance", icon: Database },
        { title: "Risk Management", url: "/risk-management", icon: Lock },
        { title: "Change Management", url: "/change-management", icon: Workflow },
        { title: "Audit Logs", url: "/audit-logs", icon: FileText },
        { title: "Compliance Reports", url: "/compliance-reports", icon: FileText },
      ],
    },
    {
      label: "AI & Integration",
      items: [
        { title: "AI Assistant", url: "/ai-assistant-advanced", icon: Brain },
        { title: "Integration Hub", url: "/integration-hub", icon: Code },
        { title: "API Management", url: "/api-management", icon: Code },
        { title: "Webhooks", url: "/webhooks", icon: Code },
        { title: "Virtual Assistant", url: "/virtual-assistant", icon: Brain },
        { title: "Semantic Search", url: "/semantic-search", icon: Brain },
      ],
    },
    {
      label: "Admin & Settings",
      items: [
        { title: "User Management", url: "/user-management", icon: Users },
        { title: "Role Management", url: "/role-management", icon: Lock },
        { title: "System Settings", url: "/system-settings", icon: Settings },
        { title: "Security Management", url: "/security-management", icon: Lock },
        { title: "Multi-Tenancy", url: "/multi-tenancy", icon: Layers },
        { title: "Audit Trails", url: "/audit-trails", icon: FileText },
        { title: "Data Governance", url: "/data-governance", icon: Database },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
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
