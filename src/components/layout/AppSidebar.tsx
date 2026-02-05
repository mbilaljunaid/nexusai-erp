import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Briefcase,
  Database,
  BarChart,
  Grid,
  ShieldCheck,
  Building,
  UserCheck,
  Package,
  Layers,
  History,
  LifeBuoy,
  LogOut,
  User,
  CreditCard,
  DollarSign,
  PieChart,
  Truck,
  Box,
  ClipboardList
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const [location] = useLocation();

  const navigation = [
    {
      title: "Core Operations",
      items: [
        { title: "Dashboard", url: "/", icon: LayoutDashboard },
        { title: "Project Management", url: "/projects", icon: Briefcase },
        { title: "HR & Payroll", url: "/hr", icon: Users },
        { title: "Finance & Accounting", url: "/finance", icon: DollarSign },
        { title: "CRM & Sales", url: "/crm", icon: BarChart },
        { title: "Supply Chain", url: "/supply-chain", icon: Truck },
        { title: "WMS", url: "/wms", icon: Box },
        { title: "Inventory", url: "/inventory", icon: Package },
      ],
    },
    {
      title: "Governance & Compliance",
      items: [
        { title: "Audit Protocols", url: "/audit", icon: ShieldCheck },
        { title: "Reconciliation", url: "/reconciliation", icon: FileText },
        { title: "Global Compliance", url: "/compliance", icon: Building },
        { title: "Access Control", url: "/access-control", icon: UserCheck },
      ],
    },
    {
      title: "Reporting & Analytics",
      items: [
        { title: "Financial Reports", url: "/reports/financial", icon: PieChart },
        { title: "System Analytics", url: "/analytics", icon: Grid },
      ],
    },
    {
      title: "Settings",
      items: [
        { title: "General Settings", url: "/settings", icon: Settings },
        { title: "Database Management", url: "/database", icon: Database },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="h-5 w-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">NexusAI ERP</span>
            <span className="truncate text-xs text-muted-foreground">Enterprise Edition</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location === item.url || location.startsWith(`${item.url}/`);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="rounded-lg">{user?.name?.slice(0, 2)?.toUpperCase() || "CN"}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">{user?.name || "CurrentUser"}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email || "user@nexus.ai"}</span>
                  </div>
                  <Settings className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="rounded-lg">{user?.name?.slice(0, 2)?.toUpperCase() || "CN"}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name || "CurrentUser"}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email || "user@nexus.ai"}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
