import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  plan: "starter" | "professional" | "enterprise";
  status: "active" | "paused" | "cancelled" | "expired";
  users: number;
  storage: number;
  startDate: string;
  renewalDate: string;
  amount: number;
  autoRenew: boolean;
}

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: "sub-1",
      tenantId: "tenant-1",
      tenantName: "Acme Corporation",
      plan: "enterprise",
      status: "active",
      users: 150,
      storage: 500,
      startDate: "2024-01-01",
      renewalDate: "2025-01-01",
      amount: 5000,
      autoRenew: true,
    },
    {
      id: "sub-2",
      tenantId: "tenant-2",
      tenantName: "Global Industries",
      plan: "professional",
      status: "active",
      users: 50,
      storage: 100,
      startDate: "2024-06-15",
      renewalDate: "2025-06-15",
      amount: 1500,
      autoRenew: true,
    },
    {
      id: "sub-3",
      tenantId: "tenant-3",
      tenantName: "Tech Solutions",
      plan: "starter",
      status: "paused",
      users: 10,
      storage: 20,
      startDate: "2024-09-01",
      renewalDate: "2025-09-01",
      amount: 300,
      autoRenew: false,
    },
  ]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlan, setFilterPlan] = useState<string>("all");

  useEffect(() => {
    document.title = "Subscription Management | NexusAIFirst";
  }, []);

  const handleChangeStatus = (id: string, newStatus: Subscription["status"]) => {
    setSubscriptions(
      subscriptions.map((sub) => (sub.id === id ? { ...sub, status: newStatus } : sub))
    );
  };

  const handleToggleAutoRenew = (id: string) => {
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === id ? { ...sub, autoRenew: !sub.autoRenew } : sub
      )
    );
  };

  const handleDeleteSubscription = (id: string) => {
    if (confirm("Delete this subscription?")) {
      setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
    }
  };

  const filtered = subscriptions.filter((sub) => {
    const statusMatch = filterStatus === "all" || sub.status === filterStatus;
    const planMatch = filterPlan === "all" || sub.plan === filterPlan;
    return statusMatch && planMatch;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    revenue: subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + s.amount, 0),
    expiring: subscriptions.filter(
      (s) =>
        new Date(s.renewalDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 &&
        s.status === "active"
    ).length,
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "professional":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "starter":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "paused":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "expired":
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage tenant subscriptions, plans, and billing cycles
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Subscriptions</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Monthly Revenue</p>
          <p className="text-2xl font-bold text-blue-600">${stats.revenue.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Expiring Soon</p>
          <p className="text-2xl font-bold text-orange-600">{stats.expiring}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32" data-testid="select-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Plan</label>
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="w-32" data-testid="select-plan-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No subscriptions found</p>
          </Card>
        ) : (
          filtered.map((sub) => (
            <Card key={sub.id} className="p-6 hover-elevate" data-testid={`subscription-card-${sub.id}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Tenant & Plan Info */}
                <div>
                  <h3 className="font-bold text-lg mb-2">{sub.tenantName}</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Badge className={getPlanColor(sub.plan)}>
                        {sub.plan.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(sub.status)}>
                        {sub.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">ID: {sub.id}</p>
                  </div>
                </div>

                {/* Middle: Usage & Dates */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Users</p>
                    <p className="font-semibold">{sub.users} users</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Storage</p>
                    <p className="font-semibold">{sub.storage} GB</p>
                  </div>
                  <div className="text-xs text-muted-foreground pt-2">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Renews: {new Date(sub.renewalDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="space-y-3">
                  <div className="bg-muted/50 p-3 rounded">
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="text-2xl font-bold">${sub.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-2">per month</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Select
                      value={sub.status}
                      onValueChange={(val: any) => handleChangeStatus(sub.id, val)}
                    >
                      <SelectTrigger className="w-24 text-xs" data-testid={`select-status-${sub.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="cancelled">Cancel</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAutoRenew(sub.id)}
                      data-testid={`button-toggle-renew-${sub.id}`}
                    >
                      {sub.autoRenew ? "Auto-Renew ON" : "Auto-Renew OFF"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDeleteSubscription(sub.id)}
                      data-testid={`button-delete-sub-${sub.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
