
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function KnowledgeBaseDashboard() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newItem, setNewItem] = useState({ title: "", category: "General", content: "", tags: "" });

    const { data: articles = [] } = useQuery({
        queryKey: ["/api/crm/knowledge", search],
        queryFn: () => fetch(`/api/crm/knowledge?query=${search}`).then(r => r.json())
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/crm/knowledge", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/crm/knowledge"] });
            setIsCreateOpen(false);
            setNewItem({ title: "", category: "General", content: "", tags: "" });
            toast({ title: "Article Published" });
        }
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                    <p className="text-muted-foreground mt-2">Manage articles, solutions, and FAQs.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Article
                </Button>
            </div>

            <div className="flex items-center gap-2 max-w-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article: any) => (
                    <Card key={article.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline">{article.category}</Badge>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{article.status}</Badge>
                            </div>
                            <CardTitle className="mt-2 text-lg group-hover:text-primary">{article.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                {article.content}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                {(article.tags || []).map((tag: string) => (
                                    <span key={tag} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">#{tag}</span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Knowledge Article</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <Textarea className="min-h-[200px]" value={newItem.content} onChange={e => setNewItem({ ...newItem, content: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tags (comma separated)</Label>
                            <Input value={newItem.tags} onChange={e => setNewItem({ ...newItem, tags: e.target.value })} placeholder="password, login, reset" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={() => createMutation.mutate(newItem)}>Publish</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
