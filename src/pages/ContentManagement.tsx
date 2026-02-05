import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function ContentManagement() {
  const { data: pages = [] } = useQuery<any[]>({ queryKey: ["/api/content/pages"] });
  const published = pages.filter((p: any) => p.status === "published").length;
  const draft = pages.filter((p: any) => p.status === "draft").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><FileText className="w-8 h-8" />Content Management</h1>
        <p className="text-muted-foreground">Manage website content and pages</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Total Pages</p><p className="text-2xl font-bold">{pages.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Published</p><p className="text-2xl font-bold text-green-600">{published}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-muted-foreground text-sm">Draft</p><p className="text-2xl font-bold text-blue-600">{draft}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Pages</CardTitle></CardHeader><CardContent><div className="space-y-2">{pages.map((p: any) => (<div key={p.id} className="flex justify-between items-center p-3 border rounded hover-elevate"><div><p className="font-semibold">{p.title}</p><p className="text-sm text-muted-foreground">{p.slug}</p></div><Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge></div>))}</div></CardContent></Card>
    </div>
  );
}
