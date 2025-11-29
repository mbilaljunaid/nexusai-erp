import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconNavigation } from "@/components/IconNavigation";
import { Package, Truck, BookOpen, Users, BarChart3, Headset, MapPin, AlertCircle, Clock, SmilePlus, Users2 } from "lucide-react";

export default function Service() {
  const [activeNav, setActiveNav] = useState("overview");
  
  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "tickets", label: "Tickets", icon: Headset, color: "text-green-500" },
    { id: "field", label: "Field Service", icon: MapPin, color: "text-orange-500" },
    { id: "kb", label: "Knowledge Base", icon: BookOpen, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Service & Support</h1>
        <p className="text-muted-foreground text-sm">Manage customer support, tickets, and field service</p>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/service-tickets">
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-2xl font-semibold">342</p>
                      <p className="text-xs text-muted-foreground">Open Tickets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/sla-tracking">
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-2xl font-semibold">2.4h</p>
                      <p className="text-xs text-muted-foreground">Avg Response Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/service-analytics">
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <SmilePlus className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-semibold">94%</p>
                      <p className="text-xs text-muted-foreground">Satisfaction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/field-service">
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users2 className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-semibold">28</p>
                      <p className="text-xs text-muted-foreground">Engineers</p>
                    </div>
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
        </div>
      )}

      {activeNav === "tickets" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Ticketing system loading. Manage customer support requests and track resolution.</p>
          </CardContent>
        </Card>
      )}

      {activeNav === "field" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Field Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Field service module loading. Dispatch technicians and track on-site work.</p>
          </CardContent>
        </Card>
      )}

      {activeNav === "kb" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Knowledge Base</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Knowledge management loading. Create and share help articles with customers.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
