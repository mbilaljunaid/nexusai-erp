import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { BarChart3, Mail, Share2, TrendingUp } from "lucide-react";

export default function Marketing() {
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "campaigns", label: "Campaigns", icon: Mail, color: "text-purple-500" },
    { id: "email", label: "Email", icon: Mail, color: "text-green-500" },
    { id: "social", label: "Social", icon: Share2, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2"><TrendingUp className="h-8 w-8" />Marketing Automation</h1>
        <p className="text-muted-foreground text-sm">Create campaigns, nurture leads, and track engagement</p>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">18</p><p className="text-xs text-muted-foreground">Active Campaigns</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">28.5%</p><p className="text-xs text-muted-foreground">Avg Open Rate</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">4.2%</p><p className="text-xs text-muted-foreground">Click Rate</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">$245K</p><p className="text-xs text-muted-foreground">Pipeline Generated</p></div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Marketing Modules</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Email Campaigns", description: "Design, send, and track email campaigns" },
                  { name: "Lead Nurturing", description: "Automated drip campaigns and workflows" },
                  { name: "Social Media", description: "Schedule and manage social posts" },
                  { name: "Landing Pages", description: "Create conversion-optimized pages" },
                  { name: "Analytics", description: "Track engagement and ROI" },
                  { name: "Segmentation", description: "Target audiences with precision" },
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

      {activeNav === "campaigns" && (
        <Card><CardHeader><CardTitle className="text-base">Campaigns</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Campaign management loading. Create multi-channel marketing campaigns.</p><Button size="sm" className="mt-4">+ New Campaign</Button></CardContent></Card>
      )}

      {activeNav === "email" && (
        <Card><CardHeader><CardTitle className="text-base">Email Marketing</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Email module loading. Design and send targeted email campaigns.</p></CardContent></Card>
      )}

      {activeNav === "social" && (
        <Card><CardHeader><CardTitle className="text-base">Social Media</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Social media module loading. Manage your social presence.</p></CardContent></Card>
      )}
    </div>
  );
}
