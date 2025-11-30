import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { Layout, Palette, Eye, Download, Plus, Zap } from "lucide-react";

export default function WebsiteBuilder() {
  const [activeNav, setActiveNav] = useState("pages");

  const pages = [
    { id: "1", name: "Home", status: "published", views: 2547, lastEdited: "2 hours ago" },
    { id: "2", name: "About Us", status: "published", views: 1234, lastEdited: "5 hours ago" },
    { id: "3", name: "Products", status: "draft", views: 0, lastEdited: "1 day ago" },
    { id: "4", name: "Pricing", status: "published", views: 892, lastEdited: "3 days ago" },
    { id: "5", name: "Contact", status: "published", views: 456, lastEdited: "1 week ago" },
  ];

  const navItems = [
    { id: "pages", label: "Pages", icon: Layout, color: "text-blue-500" },
    { id: "templates", label: "Templates", icon: Palette, color: "text-purple-500" },
    { id: "design", label: "Design", icon: Eye, color: "text-green-500" },
    { id: "publish", label: "Publish", icon: Zap, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Website Builder</h1>
          <p className="text-muted-foreground mt-2">Drag-and-drop website creation</p>
        </div>
        <Button data-testid="button-create-page">
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">{pages.length}</p><p className="text-xs text-muted-foreground">Total Pages</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">{pages.filter(p => p.status === "published").length}</p><p className="text-xs text-muted-foreground">Published</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">{pages.reduce((s, p) => s + p.views, 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Views</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">98%</p><p className="text-xs text-muted-foreground">Uptime</p></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "pages" && (
        <div className="space-y-3">
          {pages.map((page) => (
            <Card key={page.id} data-testid={`card-page-${page.id}`} className="hover-elevate">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Layout className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{page.name}</h3>
                      <p className="text-sm text-muted-foreground">{page.views} views • Edited {page.lastEdited}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={page.status === "published" ? "default" : "secondary"}>{page.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {activeNav === "templates" && <Card><CardHeader><CardTitle className="text-base">Templates</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Professional templates for various industries</p></CardContent></Card>}
      {activeNav === "design" && <Card><CardHeader><CardTitle className="text-base">Design Tools</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Advanced design and customization tools</p></CardContent></Card>}
      {activeNav === "publish" && <Card><CardHeader><CardTitle className="text-base">Publish</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Publish and deploy your website</p><Button size="sm" className="mt-4">Deploy Now</Button></CardContent></Card>}
    </div>
  );
}
