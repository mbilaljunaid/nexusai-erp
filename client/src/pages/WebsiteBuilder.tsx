import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IconNavigation } from "@/components/IconNavigation";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout, Palette, Eye, Download, Plus, Zap, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WebsiteBuilder() {
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState("pages");
  const [newPage, setNewPage] = useState({ name: "", status: "draft", template: "blank" });

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["/api/website-pages-builder"],
    queryFn: () => fetch("/api/website-pages-builder").then(r => r.json()).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/website-pages-builder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-pages-builder"] });
      setNewPage({ name: "", status: "draft", template: "blank" });
      toast({ title: "Page created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/website-pages-builder/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-pages-builder"] });
      toast({ title: "Page deleted" });
    },
  });

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

      <Card data-testid="card-new-page">
        <CardHeader><CardTitle className="text-base">Create Website Page</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Page name" value={newPage.name} onChange={(e) => setNewPage({ ...newPage, name: e.target.value })} data-testid="input-name" />
            <Select value={newPage.template} onValueChange={(v) => setNewPage({ ...newPage, template: v })}>
              <SelectTrigger data-testid="select-template"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">Blank</SelectItem>
                <SelectItem value="landing">Landing</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newPage.status} onValueChange={(v) => setNewPage({ ...newPage, status: v })}>
              <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate(newPage)} disabled={createMutation.isPending || !newPage.name} className="w-full" data-testid="button-create-page">
            <Plus className="w-4 h-4 mr-2" /> Create Page
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">{pages.length}</p><p className="text-xs text-muted-foreground">Total Pages</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">{pages.filter((p: any) => p.status === "published").length}</p><p className="text-xs text-muted-foreground">Published</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">{pages.reduce((s: number, p: any) => s + (p.views || 0), 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Views</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-semibold">98%</p><p className="text-xs text-muted-foreground">Uptime</p></CardContent></Card>
      </div>

      <IconNavigation items={navItems} activeId={activeNav} onSelect={setActiveNav} />

      {activeNav === "pages" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Website Pages</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? <p>Loading...</p> : pages.length === 0 ? <p className="text-muted-foreground text-center py-4">No pages</p> : pages.map((page: any) => (
              <div key={page.id} className="p-3 border rounded-lg hover-elevate flex items-start justify-between" data-testid={`page-${page.id}`}>
                <div>
                  <h3 className="font-semibold">{page.name}</h3>
                  <p className="text-sm text-muted-foreground">Template: {page.template} • {page.views || 0} views</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={page.status === "published" ? "default" : "secondary"}>{page.status}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(page.id)} data-testid={`button-delete-${page.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {activeNav === "templates" && <Card><CardHeader><CardTitle className="text-base">Templates</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Professional templates for various industries</p></CardContent></Card>}
      {activeNav === "design" && <Card><CardHeader><CardTitle className="text-base">Design Tools</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Advanced design and customization tools</p></CardContent></Card>}
      {activeNav === "publish" && <Card><CardHeader><CardTitle className="text-base">Publish</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Publish and deploy your website</p><Button size="sm" className="mt-4">Deploy Now</Button></CardContent></Card>}
    </div>
  );
}
