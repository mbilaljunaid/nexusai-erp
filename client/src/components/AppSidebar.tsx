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
} from "lucide-react";

const platformNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "ERP & Finance", icon: DollarSign, href: "/erp" },
  { title: "ERP Advanced", icon: DollarSign, href: "/erp-advanced", badge: "Premium" },
  { title: "Inventory", icon: Package, href: "/inventory", badge: "NEW" },
  { title: "Manufacturing", icon: Factory, href: "/manufacturing", badge: "New" },
  { title: "EPM", icon: BarChart3, href: "/epm", badge: "New" },
  { title: "CRM & Sales", icon: Users, href: "/crm" },
  { title: "CRM Advanced", icon: Users, href: "/crm-advanced", badge: "Premium" },
  { title: "Projects", icon: FolderKanban, href: "/projects" },
  { title: "HR & Talent", icon: Briefcase, href: "/hr" },
  { title: "HR Advanced", icon: Briefcase, href: "/hr-advanced", badge: "Premium" },
  { title: "Service & Support", icon: Package, href: "/service" },
  { title: "Field Service", icon: Truck, href: "/field-service", badge: "New" },
  { title: "Marketing", icon: Sparkles, href: "/marketing" },
];

const crmDetailItems = [
  { title: "Lead Details", icon: Users, href: "/lead-detail", badge: "PHASE1" },
  { title: "Opportunities", icon: TrendingUp, href: "/opportunities", badge: "PHASE1" },
  { title: "Sales Pipeline", icon: BarChart3, href: "/sales-pipeline", badge: "PHASE1" },
  { title: "Revenue Forecast", icon: TrendingUp, href: "/forecast", badge: "PHASE1" },
  { title: "Accounts", icon: Users, href: "/accounts", badge: "PHASE1" },
  { title: "Account Hierarchy", icon: Users, href: "/account-hierarchy", badge: "PHASE1" },
  { title: "Contacts", icon: Users, href: "/contacts", badge: "PHASE1" },
  { title: "Activity Timeline", icon: Activity, href: "/activity-timeline", badge: "PHASE1" },
  { title: "Lead Scoring", icon: Sparkles, href: "/lead-scoring", badge: "PHASE1" },
  { title: "Convert Lead", icon: TrendingUp, href: "/lead-conversion", badge: "PHASE1" },
];

const erpDetailItems = [
  { title: "Invoices", icon: DollarSign, href: "/invoices", badge: "PHASE1" },
  { title: "Purchase Orders", icon: Package, href: "/purchase-orders", badge: "PHASE1" },
  { title: "Vendors", icon: Users, href: "/vendors", badge: "PHASE1" },
  { title: "General Ledger", icon: BarChart3, href: "/general-ledger", badge: "PHASE1" },
  { title: "Financial Reports", icon: BarChart3, href: "/financial-reports", badge: "PHASE1" },
];

const manufacturingDetailItems = [
  { title: "Work Orders", icon: Package, href: "/work-orders", badge: "PHASE1" },
  { title: "MRP Planning", icon: Factory, href: "/mrp", badge: "PHASE1" },
  { title: "Shop Floor", icon: Factory, href: "/shop-floor", badge: "PHASE1" },
  { title: "Quality Control", icon: CheckSquare, href: "/quality-control", badge: "PHASE1" },
];

const hrDetailItems = [
  { title: "Employee Directory", icon: Users, href: "/employees", badge: "PHASE2" },
  { title: "Organization Chart", icon: Users, href: "/org-chart", badge: "PHASE2" },
  { title: "Leave Requests", icon: Calendar, href: "/leave-request", badge: "PHASE2" },
  { title: "Leave Approval", icon: CheckSquare, href: "/leave-approval", badge: "PHASE2" },
  { title: "Attendance", icon: Calendar, href: "/attendance", badge: "PHASE2" },
  { title: "Payroll", icon: DollarSign, href: "/payroll", badge: "PHASE2" },
  { title: "Compensation", icon: DollarSign, href: "/compensation", badge: "PHASE2" },
  { title: "Performance Reviews", icon: BarChart3, href: "/performance-reviews", badge: "PHASE2" },
  { title: "Talent Pool", icon: Users, href: "/talent-pool", badge: "PHASE2" },
  { title: "HR Analytics", icon: BarChart3, href: "/hr-analytics", badge: "PHASE2" },
];

const serviceDetailItems = [
  { title: "Service Tickets", icon: Package, href: "/service-tickets", badge: "PHASE2" },
  { title: "Ticket Dashboard", icon: BarChart3, href: "/ticket-dashboard", badge: "PHASE2" },
  { title: "SLA Tracking", icon: Activity, href: "/sla-tracking", badge: "PHASE2" },
  { title: "Knowledge Base", icon: BookOpen, href: "/knowledge-base", badge: "PHASE2" },
  { title: "Customer Portal", icon: Users, href: "/customer-portal", badge: "PHASE2" },
  { title: "Service Analytics", icon: BarChart3, href: "/service-analytics", badge: "PHASE2" },
  { title: "Team Utilization", icon: Activity, href: "/team-utilization", badge: "PHASE2" },
  { title: "Response Analytics", icon: BarChart3, href: "/response-analytics", badge: "PHASE2" },
];

const advancedAnalyticsItems = [
  { title: "Dashboard Builder", icon: BarChart3, href: "/dashboard-builder", badge: "PHASE2" },
  { title: "Report Builder", icon: BarChart3, href: "/report-builder", badge: "PHASE2" },
  { title: "Data Explorer", icon: Database, href: "/data-explorer", badge: "PHASE2" },
  { title: "Sales Analytics", icon: BarChart3, href: "/sales-analytics", badge: "PHASE2" },
  { title: "Financial Analytics", icon: BarChart3, href: "/financial-analytics", badge: "PHASE2" },
  { title: "Operational Analytics", icon: BarChart3, href: "/operational-analytics", badge: "PHASE2" },
  { title: "Predictive Analytics", icon: BarChart3, href: "/predictive-analytics", badge: "PHASE2" },
  { title: "Lead Scoring Analytics", icon: Sparkles, href: "/lead-scoring-analytics", badge: "PHASE2" },
  { title: "Revenue Forecasting", icon: TrendingUp, href: "/revenue-forecasting", badge: "PHASE2" },
  { title: "Churn Risk Analysis", icon: BarChart3, href: "/churn-risk", badge: "PHASE2" },
  { title: "Export Manager", icon: Download, href: "/export-manager", badge: "PHASE2" },
  { title: "Scheduled Reports", icon: Calendar, href: "/scheduled-reports", badge: "PHASE2" },
];

const workflowItems = [
  { title: "Workflow Builder", icon: Zap, href: "/workflow-builder", badge: "PHASE3" },
  { title: "Templates", icon: BookOpen, href: "/workflow-templates", badge: "PHASE3" },
  { title: "Execution History", icon: Activity, href: "/workflow-execution", badge: "PHASE3" },
];

const apiConfigItems = [
  { title: "API Management", icon: Cpu, href: "/api-management", badge: "PHASE3" },
  { title: "Webhooks", icon: Zap, href: "/webhooks", badge: "PHASE3" },
  { title: "API Logs", icon: BarChart3, href: "/api-logs", badge: "PHASE3" },
  { title: "Rate Limiting", icon: Shield, href: "/rate-limiting", badge: "PHASE3" },
];

const adminConfigItems = [
  { title: "System Settings", icon: SettingsIcon, href: "/system-settings", badge: "PHASE3" },
  { title: "Users", icon: Users, href: "/user-management", badge: "PHASE3" },
  { title: "Roles", icon: Shield, href: "/role-management", badge: "PHASE3" },
  { title: "Permissions", icon: Shield, href: "/permission-matrix", badge: "PHASE3" },
];

const dataConfigItems = [
  { title: "Custom Fields", icon: Database, href: "/custom-fields", badge: "PHASE3" },
  { title: "Data Import/Export", icon: Download, href: "/data-import", badge: "PHASE3" },
  { title: "Data Cleanup", icon: Zap, href: "/data-cleanup", badge: "PHASE3" },
  { title: "Audit Logs", icon: Activity, href: "/audit-logs", badge: "PHASE3" },
];

const securityItems = [
  { title: "OAuth", icon: Shield, href: "/oauth-management", badge: "PHASE3" },
  { title: "SSO", icon: Shield, href: "/sso", badge: "PHASE3" },
  { title: "2FA", icon: Shield, href: "/two-factor-auth", badge: "PHASE3" },
  { title: "Access Control", icon: Shield, href: "/access-control", badge: "PHASE3" },
];

const systemItems = [
  { title: "Health Check", icon: Activity, href: "/health-check", badge: "PHASE3" },
  { title: "Performance", icon: BarChart3, href: "/performance-monitoring", badge: "PHASE3" },
  { title: "System Logs", icon: Activity, href: "/system-logs", badge: "PHASE3" },
  { title: "Backup/Restore", icon: Download, href: "/backup-restore", badge: "PHASE3" },
];

const digitialNavItems = [
  { title: "Website Builder", icon: Zap, href: "/website" },
  { title: "Email Management", icon: Package, href: "/email" },
  { title: "E-Commerce", icon: ShoppingCart, href: "/ecommerce" },
];

const analyticsNavItems = [
  { title: "Analytics & BI", icon: BarChart3, href: "/analytics" },
  { title: "Backend Integration", icon: Database, href: "/backend-integration", badge: "Live" },
  { title: "Compliance & Audit", icon: Shield, href: "/compliance" },
];

const aiNavItems = [
  { title: "AI Copilot", icon: Sparkles, href: "/copilot", badge: "AI" },
  { title: "AI Chat", icon: MessageCircle, href: "/ai-chat", badge: "AI" },
  { title: "Planning & Forecasting", icon: Calendar, href: "/planning", badge: "AI" },
];

const marketplaceNavItems = [
  { title: "Marketplace", icon: Store, href: "/marketplace", badge: "New" },
  { title: "Mobile Sync", icon: Smartphone, href: "/mobile-sync", badge: "Sync" },
  { title: "Billing & Payments", icon: CreditCard, href: "/billing" },
];

const advancedNavItems = [
  { title: "Form Builder", icon: BookOpen, href: "/forms" },
  { title: "UAT Automation", icon: CheckSquare, href: "/uat" },
  { title: "Advanced Features", icon: Cpu, href: "/advanced", badge: "Beta" },
  { title: "Industry Config", icon: Factory, href: "/industry-config" },
];

const systemNavItems = [
  { title: "Process Mapping", icon: Activity, href: "/bpm" },
  { title: "Integration Hub", icon: Zap, href: "/integrations" },
  { title: "System Health", icon: Activity, href: "/health" },
  { title: "Settings", icon: SettingsIcon, href: "/settings" },
];

const adminNavItems = [
  { title: "Platform Admin", icon: Shield, href: "/admin/platform", badge: "Platform" },
  { title: "Tenant Admin", icon: Users, href: "/admin/tenant", badge: "Tenant" },
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
  const [industriesExpanded, setIndustriesExpanded] = useState(false);

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
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Platforms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Digital & Web</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {digitialNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Analytics & Governance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">AI & Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Marketplace & Mobile</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {marketplaceNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Advanced & Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {advancedNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">CRM Details (Phase 1)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {crmDetailItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">ERP Details (Phase 1)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {erpDetailItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Manufacturing Details (Phase 1)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manufacturingDetailItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">HR Details (Phase 2)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hrDetailItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.href} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Service Details (Phase 2)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {serviceDetailItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.href} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Advanced Analytics (Phase 2)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {advancedAnalyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.href} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Workflow (Phase 3)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.href} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.href}><item.icon className="h-4 w-4" /><span className="text-sm">{item.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">API Config (Phase 3)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {apiConfigItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.href} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.href}><item.icon className="h-4 w-4" /><span className="text-sm">{item.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Admin (Phase 3)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminConfigItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.href} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.href}><item.icon className="h-4 w-4" /><span className="text-sm">{item.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Data Config (Phase 3)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dataConfigItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.href} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.href}><item.icon className="h-4 w-4" /><span className="text-sm">{item.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Security (Phase 3)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {securityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.href} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.href}><item.icon className="h-4 w-4" /><span className="text-sm">{item.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">System (Phase 3)</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.href} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.href}><item.icon className="h-4 w-4" /><span className="text-sm">{item.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between px-2">
            <SidebarGroupLabel className="text-xs uppercase tracking-wide">Industries</SidebarGroupLabel>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setIndustriesExpanded(!industriesExpanded)}
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
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
