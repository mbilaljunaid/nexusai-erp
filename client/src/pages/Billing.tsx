import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { Check, AlertCircle, Download, CreditCard, BarChart3, FileText, Settings } from "lucide-react";

export default function Billing() {
  const [activeNav, setActiveNav] = useState("plans");
  
  const navItems = [
    { id: "plans", label: "Plans", icon: CreditCard, color: "text-blue-500" },
    { id: "usage", label: "Usage", icon: BarChart3, color: "text-green-500" },
    { id: "invoices", label: "Invoices", icon: FileText, color: "text-purple-500" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-orange-500" },
  ];

  const plans = [
    {
      id: "freemium",
      name: "Freemium",
      price: "$0",
      period: "/month",
      seats: 3,
      apiCalls: "10K",
      aiCredits: "100",
      storage: "1GB",
      features: ["Dashboard", "CRM", "Projects", "Email Support"],
      current: false,
    },
    {
      id: "starter",
      name: "Starter",
      price: "$299",
      period: "/month",
      seats: 10,
      apiCalls: "100K",
      aiCredits: "5K",
      storage: "50GB",
      features: ["SSO", "Webhooks", "Advanced Analytics", "Phone Support"],
      current: true,
      popular: true,
    },
    {
      id: "professional",
      name: "Professional",
      price: "$999",
      period: "/month",
      seats: 50,
      apiCalls: "1M",
      aiCredits: "50K",
      storage: "500GB",
      features: ["Custom Integrations", "Dedicated Account Manager", "24/7 Support"],
      current: false,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      seats: "Unlimited",
      apiCalls: "10M",
      aiCredits: "500K",
      storage: "5TB",
      features: ["On-Premises", "Custom SLA", "Dedicated Support"],
      current: false,
    },
  ];

  const invoices = [
    { id: "INV-2024-001", date: "Nov 1, 2024", amount: "$299.00", status: "paid" },
    { id: "INV-2024-002", date: "Dec 1, 2024", amount: "$299.00", status: "paid" },
    { id: "INV-2025-001", date: "Jan 1, 2025", amount: "$299.00", status: "due" },
  ];

  const usage = [
    { metric: "API Calls", used: 45234, limit: 100000, percentage: 45 },
    { metric: "AI Credits", used: 2450, limit: 5000, percentage: 49 },
    { metric: "Storage", used: 23.5, limit: 50, percentage: 47 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">Manage your plan, invoices, and usage</p>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "plans" && (
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.popular ? "ring-2 ring-blue-500" : ""}`}
                data-testid={`plan-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-4">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Seats:</span> {plan.seats}
                    </div>
                    <div>
                      <span className="font-medium">API Calls:</span> {plan.apiCalls}/month
                    </div>
                    <div>
                      <span className="font-medium">AI Credits:</span> {plan.aiCredits}/month
                    </div>
                    <div>
                      <span className="font-medium">Storage:</span> {plan.storage}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.current ? (
                    <Badge className="w-full justify-center">Current Plan</Badge>
                  ) : (
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"} data-testid={`button-upgrade-${plan.id}`}>
                      Choose Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
      )}

      {activeNav === "usage" && (
        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Usage (January 2025)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {usage.map((item, idx) => (
                <div key={idx} data-testid={`usage-${item.metric.replace(/\s/g, "-").toLowerCase()}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{item.metric}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.used.toLocaleString()} / {item.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.percentage > 90
                          ? "bg-red-500"
                          : item.percentage > 75
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.percentage}% used</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Upgrade recommended</p>
                <p className="text-sm text-blue-700 mt-1">
                  You're using 49% of your AI credits. Consider upgrading to avoid overage charges.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "invoices" && (
        <div className="space-y-4 mt-6">
          {invoices.map((invoice) => (
            <Card key={invoice.id} data-testid={`invoice-${invoice.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{invoice.id}</h4>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{invoice.amount}</span>
                    <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                      {invoice.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeNav === "settings" && (
        <div className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/26</p>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <input type="text" defaultValue="Acme Corp" className="w-full p-2 border rounded mt-1" data-testid="input-company" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" defaultValue="billing@acme.com" className="w-full p-2 border rounded mt-1" data-testid="input-billing-email" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <input type="text" defaultValue="123 Main St" className="w-full p-2 border rounded mt-1" data-testid="input-address" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked data-testid="checkbox-invoice-emails" />
                <span className="text-sm">Send invoice emails</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked data-testid="checkbox-usage-alerts" />
                <span className="text-sm">Alert me when approaching usage limits</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" data-testid="checkbox-promotional" />
                <span className="text-sm">Send promotional emails</span>
              </label>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
