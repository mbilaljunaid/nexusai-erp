import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Settings,
  Shield,
  Database,
  Building2,
  UserPlus,
  MoreVertical,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin: string;
}

export default function TenantAdmin() {
  const [tenantName] = useState("Acme Corp");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // todo: remove mock functionality
  const users: TenantUser[] = [
    {
      id: "user-1",
      name: "John Doe",
      email: "john@acme.com",
      role: "Tenant Admin",
      status: "active",
      lastLogin: "Today at 2:30 PM",
    },
    {
      id: "user-2",
      name: "Sarah Smith",
      email: "sarah@acme.com",
      role: "Finance Manager",
      status: "active",
      lastLogin: "Today at 10:15 AM",
    },
    {
      id: "user-3",
      name: "Mike Johnson",
      email: "mike@acme.com",
      role: "Sales Manager",
      status: "active",
      lastLogin: "Yesterday",
    },
    {
      id: "user-4",
      name: "Lisa Chen",
      email: "lisa@acme.com",
      role: "HR Manager",
      status: "inactive",
      lastLogin: "5 days ago",
    },
  ];

  const tenantStats = {
    users: 245,
    modules: 8,
    storage: 450,
    monthlySpend: "$8,500",
    plan: "Enterprise",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Tenant Admin - {tenantName}</h1>
        <p className="text-muted-foreground text-sm">Manage users, settings, and configuration for your organization</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">Users & Roles</TabsTrigger>
          <TabsTrigger value="modules" data-testid="tab-modules">Modules</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          <TabsTrigger value="billing" data-testid="tab-billing">Billing & Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">{tenantStats.users}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">{tenantStats.modules}</p>
                  <p className="text-xs text-muted-foreground">Active Modules</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold">{tenantStats.storage}GB</p>
                  <p className="text-xs text-muted-foreground">Storage Used</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold font-mono">{tenantStats.monthlySpend}</p>
                  <p className="text-xs text-muted-foreground">Monthly Spend</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <Badge variant="secondary" className="w-fit">{tenantStats.plan}</Badge>
                  <p className="text-xs text-muted-foreground mt-2">Current Plan</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage & Quota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Storage</span>
                  <span className="font-mono">450GB / 1TB</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>User Seats</span>
                  <span className="font-mono">245 / 500</span>
                </div>
                <Progress value={49} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>API Requests (Month)</span>
                  <span className="font-mono">2.3M / 10M</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>AI Credits Used</span>
                  <span className="font-mono">12,500 / 50,000</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-sm">
                <p className="font-medium">Upcoming upgrade recommended</p>
                <p className="text-xs text-muted-foreground mt-1">You're approaching 50% of your API request limit. Consider upgrading your plan.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Input placeholder="Search users..." className="max-w-sm" data-testid="input-search-users" />
            <Button data-testid="button-add-user">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Email</th>
                  <th className="px-4 py-2 text-left font-medium">Role</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Last Login</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50" data-testid={`row-user-${user.id}`}>
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 text-xs">{user.role}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={user.status === "active" ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}
                      >
                        {user.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{user.lastLogin}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" data-testid={`button-user-actions-${user.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Enabled Modules</CardTitle>
              <CardDescription>Manage which modules are available for your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "ERP & Finance", enabled: true },
                  { name: "CRM & Sales", enabled: true },
                  { name: "Project Management", enabled: true },
                  { name: "HR & Talent", enabled: true },
                  { name: "Service & Support", enabled: true },
                  { name: "Marketing Automation", enabled: false },
                  { name: "Analytics & BI", enabled: true },
                  { name: "BPM & Workflow", enabled: true },
                ].map((module) => (
                  <div key={module.name} className="flex items-center justify-between p-3 rounded-md border">
                    <span className="text-sm font-medium">{module.name}</span>
                    <Switch checked={module.enabled} data-testid={`switch-module-${module.name.toLowerCase()}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input defaultValue={tenantName} data-testid="input-org-name" />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select defaultValue="manufacturing">
                  <SelectTrigger data-testid="select-industry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail & E-Commerce</SelectItem>
                    <SelectItem value="finance">Financial Services</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select defaultValue="est">
                  <SelectTrigger data-testid="select-timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time</SelectItem>
                    <SelectItem value="cst">Central Time</SelectItem>
                    <SelectItem value="pst">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable AI Copilot</p>
                  <p className="text-xs text-muted-foreground">Use AI features for this organization</p>
                </div>
                <Switch defaultChecked data-testid="switch-ai-copilot" />
              </div>
              <Button data-testid="button-save-settings">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-md border-2 border-primary bg-primary/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">Enterprise Plan</p>
                    <p className="text-sm text-muted-foreground">$8,500 / month</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Up to 500 users
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    1TB storage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    10M API requests / month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    50K AI credits / month
                  </li>
                </ul>
              </div>
              <Button variant="outline" className="w-full" data-testid="button-upgrade-plan">
                Upgrade or Change Plan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage this Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Storage</span>
                  <span className="font-mono">450GB / 1,000GB</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>API Requests</span>
                  <span className="font-mono">2.3M / 10M</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>AI Credits</span>
                  <span className="font-mono">12,500 / 50,000</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
