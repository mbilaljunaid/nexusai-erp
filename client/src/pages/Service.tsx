import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ModuleNav } from "@/components/ModuleNav";
import { Package, Truck, BookOpen, Users, BarChart3 } from "lucide-react";

export default function Service() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Service & Support</h1>
        <p className="text-muted-foreground text-sm">Manage customer support, tickets, and field service</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets" data-testid="tab-tickets">Tickets</TabsTrigger>
          <TabsTrigger value="field" data-testid="tab-field">Field Service</TabsTrigger>
          <TabsTrigger value="kb" data-testid="tab-kb">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/service-tickets">
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold">342</p>
                    <p className="text-xs text-muted-foreground">Open Tickets</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/sla-tracking">
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold">2.4h</p>
                    <p className="text-xs text-muted-foreground">Avg Response Time</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/service-analytics">
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold">94%</p>
                    <p className="text-xs text-muted-foreground">Satisfaction Score</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/field-service">
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold">28</p>
                    <p className="text-xs text-muted-foreground">Field Engineers</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Ticketing", description: "Issue tracking, SLA management, and routing" },
                  { name: "Field Service", description: "Dispatch, tracking, and mobile access" },
                  { name: "Knowledge Base", description: "Self-service articles and FAQs" },
                  { name: "Chat & Messaging", description: "Real-time customer communication" },
                  { name: "Omnichannel", description: "Email, phone, chat, social in one place" },
                  { name: "Customer Portal", description: "Self-service for customers" },
                ].map((module) => (
                  <Button key={module.name} variant="outline" className="h-auto flex flex-col items-start justify-start p-4">
                    <span className="font-medium">{module.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{module.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Ticketing system coming soon. Manage customer support requests and track resolution.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="field">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Field Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Field service module coming soon. Dispatch technicians and track on-site work.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kb">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">Knowledge management coming soon. Create and share help articles with customers.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ModuleNav
        title="Service Modules"
        items={[
          { title: "Service Tickets", icon: Package, href: "/service-tickets" },
          { title: "Ticket Dashboard", icon: BarChart3, href: "/ticket-dashboard" },
          { title: "SLA Tracking", icon: Package, href: "/sla-tracking" },
          { title: "Knowledge Base", icon: BookOpen, href: "/knowledge-base" },
          { title: "Customer Portal", icon: Users, href: "/customer-portal" },
          { title: "Field Service", icon: Truck, href: "/field-service" },
        ]}
      />
    </div>
  );
}
