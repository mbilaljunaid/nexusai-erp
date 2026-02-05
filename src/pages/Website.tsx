import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Globe, FileText, BarChart3, Layers } from "lucide-react";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";

export default function Website() {
  const [activeNav, setActiveNav] = useState("overview");

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3, color: "text-blue-500" },
    { id: "websites", label: "Websites", icon: Globe, color: "text-purple-500" },
    { id: "pages", label: "Pages", icon: FileText, color: "text-green-500" },
    { id: "analytics", label: "Analytics", icon: Layers, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2"><Globe className="h-8 w-8" />Website Builder</h1>
          <p className="text-muted-foreground text-sm">Create and manage websites, landing pages, and digital presence</p>
        </div>
        <Button data-testid="button-create-website">
          <Plus className="h-4 w-4 mr-2" />
          Create Website
        </Button>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">5</p><p className="text-xs text-muted-foreground">Active Websites</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">42</p><p className="text-xs text-muted-foreground">Total Pages</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">125K</p><p className="text-xs text-muted-foreground">Monthly Visitors</p></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="space-y-1"><p className="text-2xl font-semibold">3.2%</p><p className="text-xs text-muted-foreground">Bounce Rate</p></div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Website Capabilities</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Drag & Drop Builder", description: "No-code website designer" },
                  { name: "Templates", description: "Pre-designed website templates" },
                  { name: "Forms & CRM Integration", description: "Capture leads and integrate with CRM" },
                  { name: "E-Commerce", description: "Built-in shopping cart and payments" },
                  { name: "SEO Optimization", description: "SEO tools and analytics" },
                  { name: "Domain & Hosting", description: "Domain management and hosting" },
                ].map((capability) => (
                  <Button key={capability.name} variant="outline" className="h-auto flex flex-col items-start justify-start p-4">
                    <span className="font-medium">{capability.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{capability.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "websites" && (
        <Card><CardHeader><CardTitle className="text-base">Your Websites</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Websites module loading. Create and manage multiple websites with drag-and-drop builder.</p><Button size="sm" className="mt-4">+ New Website</Button></CardContent></Card>
      )}

      {activeNav === "pages" && (
        <Card><CardHeader><CardTitle className="text-base">Page Management</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Page management module loading. Create landing pages, product pages, and custom pages.</p></CardContent></Card>
      )}

      {activeNav === "analytics" && (
        <Card><CardHeader><CardTitle className="text-base">Website Analytics</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-sm">Analytics module loading. Track visitors, conversions, and user behavior.</p></CardContent></Card>
      )}
    </div>
  );
}
