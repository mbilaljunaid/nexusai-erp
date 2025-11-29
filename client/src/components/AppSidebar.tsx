import { useLocation, Link } from "wouter";
import { useState } from "react";
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
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  BarChart3,
  Settings as SettingsIcon,
  Activity,
  Sparkles,
  DollarSign,
  Zap,
  ChevronDown,
  Shield,
  Package,
  Briefcase,
  ShoppingCart,
  Factory,
  BookOpen,
  CheckSquare,
  Cpu,
  MessageCircle,
  Truck,
  Calendar,
  Store,
  Smartphone,
  CreditCard,
  Database,
  TrendingUp,
  Download,
  Clock,
  FileText,
} from "lucide-react";

// BUSINESS CATEGORY ITEMS
const businessMainItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "CRM & Sales", icon: Users, href: "/crm" },
  { title: "ERP & Finance", icon: DollarSign, href: "/erp" },
  { title: "HR & Talent", icon: Briefcase, href: "/hr" },
  { title: "Manufacturing", icon: Factory, href: "/manufacturing" },
  { title: "Service & Support", icon: Package, href: "/service" },
];

const businessDetailItems = [
  // CRM
  { title: "Lead Details", icon: Users, href: "/lead-detail", badge: "CRM" },
  { title: "Opportunities", icon: TrendingUp, href: "/opportunities", badge: "CRM" },
  { title: "Sales Pipeline", icon: BarChart3, href: "/sales-pipeline", badge: "CRM" },
  { title: "Accounts", icon: Users, href: "/accounts", badge: "CRM" },
  { title: "Contacts", icon: Users, href: "/contacts", badge: "CRM" },
  { title: "Activity Timeline", icon: Activity, href: "/activity-timeline", badge: "CRM" },
  // ERP
  { title: "Invoices", icon: DollarSign, href: "/invoices", badge: "ERP" },
  { title: "Purchase Orders", icon: Package, href: "/purchase-orders", badge: "ERP" },
  { title: "Inventory", icon: Package, href: "/inventory", badge: "ERP" },
  { title: "Vendors", icon: Users, href: "/vendors", badge: "ERP" },
  { title: "General Ledger", icon: BarChart3, href: "/general-ledger", badge: "ERP" },
  // Manufacturing
  { title: "Work Orders", icon: Package, href: "/work-orders", badge: "MFG" },
  { title: "MRP Planning", icon: Factory, href: "/mrp", badge: "MFG" },
  { title: "Shop Floor", icon: Factory, href: "/shop-floor", badge: "MFG" },
  // HR
  { title: "Employee Directory", icon: Users, href: "/employees", badge: "HR" },
  { title: "Leave Requests", icon: Calendar, href: "/leave-request", badge: "HR" },
  { title: "Payroll", icon: DollarSign, href: "/payroll", badge: "HR" },
  // Service
  { title: "Service Tickets", icon: Package, href: "/service-tickets", badge: "SVC" },
  { title: "SLA Tracking", icon: Activity, href: "/sla-tracking", badge: "SVC" },
  // Digital
  { title: "Website Builder", icon: Zap, href: "/website", badge: "WEB" },
  { title: "E-Commerce", icon: ShoppingCart, href: "/ecommerce", badge: "WEB" },
  { title: "Marketing", icon: Sparkles, href: "/marketing", badge: "WEB" },
];

// INTELLIGENCE CATEGORY ITEMS
const intelligenceItems = [
  { title: "AI Copilot", icon: Sparkles, href: "/copilot", badge: "AI" },
  { title: "AI Chat", icon: MessageCircle, href: "/ai-chat", badge: "AI" },
  { title: "Analytics & BI", icon: BarChart3, href: "/analytics", badge: "BI" },
  { title: "Dashboard Builder", icon: BarChart3, href: "/dashboard-builder", badge: "BI" },
  { title: "Report Builder", icon: BarChart3, href: "/report-builder", badge: "BI" },
  { title: "Data Explorer", icon: Database, href: "/data-explorer", badge: "BI" },
  { title: "Predictive Analytics", icon: BarChart3, href: "/predictive-analytics", badge: "AI" },
  { title: "Lead Scoring", icon: Sparkles, href: "/lead-scoring", badge: "AI" },
  { title: "Revenue Forecast", icon: TrendingUp, href: "/forecast", badge: "BI" },
  { title: "AI Recommendations", icon: Sparkles, href: "/recommendation-engine", badge: "AI" },
];

// ENTERPRISE CATEGORY ITEMS
const enterpriseItems = [
  { title: "Platform Admin", icon: Shield, href: "/admin/platform", badge: "ADMIN" },
  { title: "Tenant Admin", icon: Users, href: "/admin/tenant", badge: "ADMIN" },
  { title: "User Management", icon: Users, href: "/user-management", badge: "ADMIN" },
  { title: "Roles & Permissions", icon: Shield, href: "/permission-matrix", badge: "ADMIN" },
  { title: "OAuth", icon: Shield, href: "/oauth-management", badge: "SEC" },
  { title: "SSO", icon: Shield, href: "/sso", badge: "SEC" },
  { title: "2FA", icon: Shield, href: "/two-factor-auth", badge: "SEC" },
  { title: "Advanced Permissions", icon: Shield, href: "/advanced-permissions", badge: "SEC" },
  { title: "Encryption", icon: Shield, href: "/advanced-encryption", badge: "SEC" },
  { title: "Marketplace", icon: Store, href: "/marketplace", badge: "MKT" },
  { title: "Mobile Sync", icon: Smartphone, href: "/mobile-sync", badge: "MKT" },
  { title: "Billing & Payments", icon: CreditCard, href: "/billing", badge: "MKT" },
];

// OPERATIONS CATEGORY ITEMS
const operationsItems = [
  { title: "Workflow Builder", icon: Zap, href: "/workflow-builder", badge: "OPS" },
  { title: "Workflow Templates", icon: BookOpen, href: "/workflow-templates", badge: "OPS" },
  { title: "API Management", icon: Cpu, href: "/api-management", badge: "API" },
  { title: "Webhooks", icon: Zap, href: "/webhooks", badge: "API" },
  { title: "Integration Hub", icon: Zap, href: "/integrations", badge: "OPS" },
  { title: "Custom Fields", icon: Database, href: "/custom-fields", badge: "OPS" },
  { title: "Data Import/Export", icon: Download, href: "/data-import", badge: "OPS" },
  { title: "Audit Logs", icon: Activity, href: "/audit-logs", badge: "OPS" },
  { title: "System Health", icon: Activity, href: "/health-check", badge: "OPS" },
  { title: "Performance Monitoring", icon: BarChart3, href: "/performance-monitoring", badge: "OPS" },
  { title: "System Logs", icon: Activity, href: "/system-logs", badge: "OPS" },
  { title: "Procurement", icon: Package, href: "/procurement", badge: "OPS" },
  { title: "Supply Chain", icon: TrendingUp, href: "/supply-chain", badge: "OPS" },
  { title: "Time Tracking", icon: Clock, href: "/time-tracking", badge: "OPS" },
  { title: "Expense Tracking", icon: DollarSign, href: "/expense-tracking", badge: "OPS" },
];

// CONFIGURATION CATEGORY ITEMS
const configurationItems = [
  { title: "System Settings", icon: SettingsIcon, href: "/system-settings", badge: "CONFIG" },
  { title: "Form Builder", icon: BookOpen, href: "/forms", badge: "CONFIG" },
  { title: "Process Mapping", icon: Activity, href: "/bpm", badge: "CONFIG" },
  { title: "Advanced Features", icon: Cpu, href: "/advanced", badge: "CONFIG" },
  { title: "Industry Config", icon: Factory, href: "/industry-config", badge: "CONFIG" },
];

const industryNavItems = [
  { title: "Manufacturing", href: "/industry/manufacturing" },
  { title: "Retail & E-Commerce", href: "/industry/retail" },
  { title: "Financial Services", href: "/industry/finservices" },
  { title: "Healthcare", href: "/industry/healthcare" },
  { title: "Construction", href: "/industry/construction" },
  { title: "View All Industries →", href: "/industries" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [businessExpanded, setBusinessExpanded] = useState(true);
  const [intelligenceExpanded, setIntelligenceExpanded] = useState(true);
  const [enterpriseExpanded, setEnterpriseExpanded] = useState(false);
  const [operationsExpanded, setOperationsExpanded] = useState(false);
  const [configExpanded, setConfigExpanded] = useState(false);
  const [industriesExpanded, setIndustriesExpanded] = useState(false);

  const renderMenuGroup = (title: string, items: any[], expanded: boolean, setExpanded: any) => (
    <SidebarGroup>
      <div className="flex items-center justify-between px-2">
        <SidebarGroupLabel className="text-xs uppercase tracking-wide">{title}</SidebarGroupLabel>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5"
          onClick={() => setExpanded(!expanded)}
          data-testid={`button-expand-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      {expanded && (
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={location === item.href}
                  data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Link href={item.href}>
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span className="text-sm">{item.title}</span>
                    {item.badge && <span className="text-xs ml-auto bg-primary/20 text-primary px-2 py-0.5 rounded">{item.badge}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-base">NexusAI</h1>
            <p className="text-xs text-muted-foreground">Enterprise Platform</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="space-y-2">
        {renderMenuGroup("Business", businessMainItems.concat(businessDetailItems), businessExpanded, setBusinessExpanded)}
        {renderMenuGroup("Intelligence", intelligenceItems, intelligenceExpanded, setIntelligenceExpanded)}
        {renderMenuGroup("Enterprise", enterpriseItems, enterpriseExpanded, setEnterpriseExpanded)}
        {renderMenuGroup("Operations", operationsItems, operationsExpanded, setOperationsExpanded)}
        {renderMenuGroup("Configuration", configurationItems, configExpanded, setConfigExpanded)}

        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel className="text-xs uppercase tracking-wide">Industries</SidebarGroupLabel>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setIndustriesExpanded(!industriesExpanded)}
              data-testid="button-expand-industries"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${industriesExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          {industriesExpanded && (
            <SidebarGroupContent>
              <SidebarMenu>
                {industryNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location === item.href}
                      className="text-xs"
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={item.href}>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">JD</AvatarFallback>
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