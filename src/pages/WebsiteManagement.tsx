import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WebsiteManagement() {
  const { toast } = useToast();
  const [newPage, setNewPage] = useState({ pageName: "", pageUrl: "", status: "draft" });

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["/api/website-pages"],
    queryFn: () => fetch("/api/website-pages").then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/website-pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-pages"] });
      setNewPage({ pageName: "", pageUrl: "", status: "draft" });
      toast({ title: "Page created" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/website-pages/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-pages"] });
      toast({ title: "Page deleted" });
    },
  });

  const metrics = {
    total: pages.length,
    published: pages.filter((p: any) => p.status === "published").length,
    draft: pages.filter((p: any) => p.status === "draft").length,
    traffic: "12.5K",
  };

  return (
    <div className="space-y-6 p-4" data-testid="website-management">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><Globe className="h-8 w-8" />Website Management</h1>
        <p className="text-muted-foreground mt-2">Manage website pages and content</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3" data-testid="card-total-pages">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Total Pages</p>
            <p className="text-2xl font-bold">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-published">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Published</p>
            <p className="text-2xl font-bold text-green-600">{metrics.published}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-draft">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-yellow-600">{metrics.draft}</p>
          </CardContent>
        </Card>
        <Card className="p-3" data-testid="card-traffic">
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">Traffic</p>
            <p className="text-2xl font-bold">{metrics.traffic}</p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-new-page">
        <CardHeader>
          <CardTitle className="text-base">Create Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Page name" value={newPage.pageName} onChange={(e) => setNewPage({ ...newPage, pageName: e.target.value })} data-testid="input-page-name" />
            <Input placeholder="Page URL" value={newPage.pageUrl} onChange={(e) => setNewPage({ ...newPage, pageUrl: e.target.value })} data-testid="input-page-url" />
            <Select value={newPage.status} onValueChange={(v) => setNewPage({ ...newPage, status: v })}>
              <SelectTrigger data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button disabled={createMutation.isPending || !newPage.pageName} className="w-full" data-testid="button-create-page">
            <Plus className="w-4 h-4 mr-2" /> Create Page
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Website Pages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : pages.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No pages created</div>
          ) : (
            pages.map((p: any) => (
              <div key={p.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between" data-testid={`page-item-${p.id}`}>
                <div>
                  <h3 className="font-semibold">{p.pageName}</h3>
                  <p className="text-sm text-muted-foreground">URL: {p.pageUrl}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge>
                  <Button size="icon" variant="ghost" data-testid={`button-delete-${p.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
