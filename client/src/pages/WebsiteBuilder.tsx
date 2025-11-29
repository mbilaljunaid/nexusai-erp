import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, Palette, Eye, Download, Plus } from "lucide-react";

export default function WebsiteBuilder() {
  const pages = [
    { id: "1", name: "Home", status: "published", views: 2547, lastEdited: "2 hours ago" },
    { id: "2", name: "About Us", status: "published", views: 1234, lastEdited: "5 hours ago" },
    { id: "3", name: "Products", status: "draft", views: 0, lastEdited: "1 day ago" },
    { id: "4", name: "Pricing", status: "published", views: 892, lastEdited: "3 days ago" },
    { id: "5", name: "Contact", status: "published", views: 456, lastEdited: "1 week ago" },
  ];

  const templates = [
    { name: "Minimal", category: "Corporate", preview: "Minimalist design" },
    { name: "Commerce", category: "E-Commerce", preview: "Product showcase" },
    { name: "Agency", category: "Creative", preview: "Portfolio layout" },
    { name: "SaaS", category: "Tech", preview: "Feature-focused" },
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

      <Tabs defaultValue="pages" className="w-full">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4 mt-6">
          {pages.map((page) => (
            <Card key={page.id} data-testid={`card-page-${page.id}`}>
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
                    <Badge variant={page.status === "published" ? "default" : "secondary"}>
                      {page.status}
                    </Badge>
                    <Button size="sm" variant="outline" data-testid={`button-edit-page-${page.id}`}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, idx) => (
              <Card key={idx} className="hover-elevate cursor-pointer" data-testid={`template-${template.name.toLowerCase()}`}>
                <CardContent className="pt-6">
                  <div className="h-32 bg-muted rounded mb-4 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">{template.preview}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </div>
                    <Button size="sm">Use</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="design" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Brand Color</label>
                <div className="flex gap-2 mt-2">
                  <input type="color" defaultValue="#3b82f6" className="w-10 h-10 rounded cursor-pointer" data-testid="input-brand-color" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Font Family</label>
                <select className="w-full p-2 border rounded mt-2" data-testid="select-font">
                  <option>Inter</option>
                  <option>Helvetica</option>
                  <option>Times New Roman</option>
                </select>
              </div>
              <Button>Save Design</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
