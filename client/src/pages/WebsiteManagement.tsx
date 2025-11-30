import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

export default function WebsiteManagement() {
  const pages = [
    { id: "p1", name: "Home", url: "/", status: "published" },
    { id: "p2", name: "Products", url: "/products", status: "published" },
    { id: "p3", name: "Blog", url: "/blog", status: "draft" },
  ];
  return (
    <div className="space-y-6 p-4">
      <div><h1 className="text-3xl font-bold flex items-center gap-2"><Globe className="h-8 w-8" />Website Management</h1><p className="text-muted-foreground mt-2">Manage website pages and content</p></div>
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Total Pages</p><p className="text-2xl font-bold">3</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Published</p><p className="text-2xl font-bold text-green-600">2</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Draft</p><p className="text-2xl font-bold text-yellow-600">1</p></CardContent></Card>
        <Card className="p-3"><CardContent className="pt-0"><p className="text-xs text-muted-foreground">Traffic</p><p className="text-2xl font-bold">12.5K</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base">Website Pages</CardTitle></CardHeader><CardContent className="space-y-3">{pages.map((p) => (<div key={p.id} className="p-3 border rounded-lg hover-elevate" data-testid={`page-${p.id}`}><div className="flex justify-between mb-2"><h3 className="font-semibold">{p.name}</h3><Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge></div><p className="text-sm text-muted-foreground">URL: {p.url}</p></div>))}</CardContent></Card>
    </div>
  );
}
