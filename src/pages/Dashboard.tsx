import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRBAC } from "@/components/RBACContext";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import {
  BarChart3,
  Users,
  Briefcase,
  Settings,
  FileText,
  Zap,
  Package,
  DollarSign,
  Factory,
  Truck,
  Headphones,
  Target,
  Lock,
  Database,
  Workflow,
  Home,
  Shield,
  Activity,
  Building,
  UserCheck,
  Wrench,
  Hammer,
  ArrowRightLeft,
  Megaphone,
  ShoppingCart,
  TrendingUp,
  Sparkles,
  Cog,
  Warehouse,
  Globe,
  Heart,
  Wifi,
  Hotel,
  ShoppingBag,
  Boxes,
  Car,
  Landmark,
  Flame,
  GraduationCap,
  LayoutDashboard,
  User,
  History as HistoryIcon,
  LucideIcon,
} from "lucide-react";

interface ModuleItem {
  title: string;
  url: string;
  icon: LucideIcon;
  description?: string;
}

interface ModuleSection {
  title: string;
  items: ModuleItem[];
}

const coreBusinessModules: ModuleSection = {
  title: "Core Business",
  items: [
    { title: "CRM & Sales", url: "/crm", icon: Target, description: "Customer Relationship Management" },
    { title: "Finance", url: "/finance", icon: DollarSign, description: "Finance & Accounting" },
    { title: "EPM", url: "/epm", icon: TrendingUp, description: "Enterprise Performance Management" },
    { title: "HR & Talent", url: "/hr", icon: Briefcase, description: "Human Resources" },
    { title: "Projects", url: "/projects", icon: Zap, description: "Project Portfolio Management" },
    { title: "Construction", url: "/construction", icon: Hammer, description: "Construction Management" },
    { title: "Order Management", url: "/order-management", icon: ShoppingCart, description: "Sales Orders & Fulfillment" },
    { title: "Intercompany", url: "/intercompany", icon: ArrowRightLeft, description: "Intercompany Transactions" },
    { title: "Leasing", url: "/finance/leases", icon: Building, description: "Lease Portfolio Management" },
    { title: "Marketing", url: "/marketing", icon: Megaphone, description: "Campaigns & Engagement" },
    { title: "Processes", url: "/processes", icon: Workflow, description: "End-to-End Business Flows" },
  ],
};

const operationsModules: ModuleSection = {
  title: "Operations & Admin",
  items: [
    { title: "Operations", url: "/operations", icon: Cog, description: "Operations Overview" },
    { title: "Supply Chain", url: "/scm", icon: Package, description: "SCM & Procurement" },
    { title: "Cost Management", url: "/scm/costing/dashboard", icon: DollarSign, description: "Costing & Margins" },
    { title: "Inventory", url: "/inventory", icon: Warehouse, description: "Stock & Items" },
    { title: "Warehouse (WMS)", url: "/scm/wms/dashboard", icon: Warehouse, description: "Warehouse Operations" },
    { title: "Manufacturing", url: "/manufacturing/dashboard", icon: Factory, description: "Production & Shop Floor" },
    { title: "Transport & Logistics", url: "/transportation", icon: Truck, description: "Fleet & Freight" },
    { title: "Maintenance", url: "/maintenance", icon: Wrench, description: "Asset Maintenance & PM" },
    { title: "Workforce Mgmt", url: "/wfm/my-time", icon: Activity, description: "Time & Attendance" },
    { title: "Service", url: "/service", icon: Headphones, description: "Helpdesk & Tickets" },
    { title: "Master Data", url: "/mdm", icon: Database, description: "MDM & Data Governance" },
  ],
};

const intelligenceModules: ModuleSection = {
  title: "Intelligence & Governance",
  items: [
    { title: "Analytics", url: "/analytics", icon: BarChart3, description: "Dashboards & BI" },
    { title: "Reports", url: "/reports", icon: FileText, description: "Report Builder" },
    { title: "Compliance & Risk", url: "/compliance/dashboard", icon: Shield, description: "Risk & Compliance" },
    { title: "Audit Trails", url: "/compliance/audit", icon: HistoryIcon, description: "Activity Logs" },
    { title: "Security Profiles", url: "/compliance/security", icon: Lock, description: "Access & Permissions" },
  ],
};

const portalModules: ModuleSection = {
  title: "Portals",
  items: [
    { title: "Customer Portal", url: "/portal", icon: Globe, description: "Customer Self-Service" },
    { title: "Supplier Portal", url: "/portal/supplier", icon: Truck, description: "Supplier Collaboration" },
  ],
};

const industryModules: ModuleSection = {
  title: "Industry Verticals",
  items: [
    { title: "Healthcare", url: "/industry/healthcare/patients", icon: Heart, description: "Patient & Clinical Mgmt" },
    { title: "Telecom", url: "/industry/telecom/network-oss", icon: Wifi, description: "Network & Billing" },
    { title: "Hospitality", url: "/industry/hospitality/reservations", icon: Hotel, description: "Reservations & Guest CRM" },
    { title: "Retail & Commerce", url: "/industry/retail/pos", icon: ShoppingBag, description: "POS & Omnichannel" },
    { title: "Logistics", url: "/industry/logistics/shipping", icon: Boxes, description: "Shipping & Cold Chain" },
    { title: "Automotive", url: "/industry/automotive/production", icon: Car, description: "Production & Sales" },
    { title: "Banking & Finance", url: "/industry/banking/core", icon: Landmark, description: "Core Banking & Loans" },
    { title: "Insurance", url: "/industry/insurance/policies", icon: Shield, description: "Policies & Claims" },
    { title: "Government", url: "/industry/government/citizen", icon: Landmark, description: "Citizen Services" },
    { title: "Education", url: "/industry/education/dashboard", icon: GraduationCap, description: "Admissions & Faculty" },
    { title: "Energy & Utilities", url: "/industry/energy/grid", icon: Flame, description: "Grid Ops & Trading" },
  ],
};

const platformModules: ModuleSection = {
  title: "Platform",
  items: [
    { title: "Admin Console", url: "/admin", icon: Shield, description: "Platform Administration" },
    { title: "Settings", url: "/system-configuration", icon: Settings, description: "System Configuration" },
  ],
};

const selfServiceModules: ModuleSection = {
  title: "Me & My Team",
  items: [
    { title: "My Dashboard", url: "/me", icon: User, description: "Self-Service Portal" },
    { title: "My Team", url: "/my-team", icon: Users, description: "Manager Self-Service" },
  ],
};

function ModuleSectionGrid({ section, adminOnly = false }: { section: ModuleSection; adminOnly?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
        {adminOnly && <Badge variant="outline" className="text-xs">Admin</Badge>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {section.items.map((item) => (
          <Link key={item.url} to={item.url}>
            <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full group">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="p-2.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{item.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="space-y-8 p-6">
      <OnboardingChecklist />
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Command Center
          </h1>
          <Badge variant="default" className="bg-red-500">Admin</Badge>
        </div>
        <p className="text-muted-foreground">Full platform access — all modules and configurations</p>
      </div>

      <ModuleSectionGrid section={selfServiceModules} />
      <ModuleSectionGrid section={coreBusinessModules} />
      <ModuleSectionGrid section={operationsModules} />
      <ModuleSectionGrid section={intelligenceModules} />
      <ModuleSectionGrid section={portalModules} />
      <ModuleSectionGrid section={industryModules} />
      <ModuleSectionGrid section={platformModules} adminOnly />
    </div>
  );
}

function EditorDashboard() {
  return (
    <div className="space-y-8 p-6">
      <OnboardingChecklist />
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCheck className="w-8 h-8 text-primary" />
            Workspace
          </h1>
          <Badge variant="default" className="bg-blue-500">Editor</Badge>
        </div>
        <p className="text-muted-foreground">Manage your organization's operations and team</p>
      </div>

      <ModuleSectionGrid section={selfServiceModules} />
      <ModuleSectionGrid section={coreBusinessModules} />
      <ModuleSectionGrid section={operationsModules} />
      <ModuleSectionGrid section={intelligenceModules} />
      <ModuleSectionGrid section={portalModules} />
      <ModuleSectionGrid section={industryModules} />
    </div>
  );
}

function ViewerDashboard() {
  return (
    <div className="space-y-8 p-6">
      <OnboardingChecklist />
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="w-8 h-8 text-primary" />
            My Dashboard
          </h1>
          <Badge variant="secondary">Viewer</Badge>
        </div>
        <p className="text-muted-foreground">Your personal workspace and quick access</p>
      </div>

      <ModuleSectionGrid section={selfServiceModules} />
      <ModuleSectionGrid section={{
        title: "Quick Access",
        items: [
          { title: "Analytics", url: "/analytics", icon: BarChart3, description: "Dashboards & BI" },
          { title: "Reports", url: "/reports", icon: FileText, description: "Report Builder" },
          { title: "Timesheets", url: "/wfm/my-time", icon: Activity, description: "Track work hours" },
        ],
      }} />
    </div>
  );
}

export default function Dashboard() {
  const { userRole } = useRBAC();

  if (userRole === "admin") return <AdminDashboard />;
  if (userRole === "editor") return <EditorDashboard />;
  return <ViewerDashboard />;
}
