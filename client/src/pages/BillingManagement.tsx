import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select
  SelectContent
  SelectItem
  SelectTrigger
  SelectValue
} from "@/components/ui/select";
import { Download, Eye, Send, Plus, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "refunded";
  dueDate: string;
  issuedDate: string;
  description: string;
}

export default function BillingManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "INV-001"
      tenantId: "tenant-1"
      tenantName: "Acme Corporation"
      amount: 5000
      status: "paid"
      dueDate: "2024-12-15"
      issuedDate: "2024-11-15"
      description: "Enterprise Plan - Monthly"
    }
    {
      id: "INV-002"
      tenantId: "tenant-2"
      tenantName: "Global Industries"
      amount: 1500
      status: "pending"
      dueDate: "2024-12-20"
      issuedDate: "2024-11-20"
      description: "Professional Plan - Monthly"
    }
    {
      id: "INV-003"
      tenantId: "tenant-3"
      tenantName: "Tech Solutions"
      amount: 300
      status: "overdue"
      dueDate: "2024-11-20"
      issuedDate: "2024-10-20"
      description: "Starter Plan - Monthly"
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("current");

  useEffect(() => {
    document.title = "Billing Management | NexusAI";
  }, []);

  const stats = {
    totalRevenue: invoices
      .filter((i) => i.status !== "refunded")
      .reduce((sum, i) => sum + i.amount, 0)
    paid: invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0)
    pending: invoices.filter((i) => i.status === "pending").reduce((sum, i) => sum + i.amount, 0)
    overdue: invoices.filter((i) => i.status === "overdue").reduce((sum, i) => sum + i.amount, 0)
  };

  const filtered = invoices.filter((inv) => filterStatus === "all" || inv.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "overdue":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "refunded":
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
      default:
        return "";
    }
  };

  const handleDownloadInvoice = (id: string) => {
    alert(`Downloading invoice ${id}...`);
  };

  const handleSendReminder = (id: string, email: string) => {
    alert(`Sending payment reminder for ${id} to ${email}...`);
  };

  const chartData = [
    { month: "Aug", revenue: 12000, paid: 11500, pending: 500 }
    { month: "Sep", revenue: 15000, paid: 14800, pending: 200 }
    { month: "Oct", revenue: 13500, paid: 13000, pending: 500 }
    { month: "Nov", revenue: 14200, paid: 13500, pending: 700 }
    { month: "Dec", revenue: 16800, paid: 15000, pending: 1800 }
  ];

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing Management</h1>
          <p className="text-muted-foreground">
            Manage invoices, payments, and billing analytics
          </p>
        </div>
        <Button data-testid="button-new-invoice">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-2">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            Current month
          </p>
        </Card>
        <Card className="p-4 border-green-200 dark:border-green-900">
          <p className="text-sm text-muted-foreground">Paid</p>
          <p className="text-2xl font-bold text-green-600">${stats.paid.toLocaleString()}</p>
        </Card>
        <Card className="p-4 border-yellow-200 dark:border-yellow-900">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">${stats.pending.toLocaleString()}</p>
        </Card>
        <Card className="p-4 border-red-200 dark:border-red-900">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-red-600">${stats.overdue.toLocaleString()}</p>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32" data-testid="select-invoice-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Period</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Invoices</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold">Invoice ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Tenant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filtered.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                    data-testid={`invoice-row-${invoice.id}`}
                  >
                    <td className="py-4 px-4 font-mono font-semibold">{invoice.id}</td>
                    <td className="py-4 px-4">{invoice.tenantName}</td>
                    <td className="py-4 px-4 font-semibold">${invoice.amount.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          data-testid={`button-download-${invoice.id}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendReminder(invoice.id, "tenant@email.com")}
                          data-testid={`button-remind-${invoice.id}`}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-view-${invoice.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
