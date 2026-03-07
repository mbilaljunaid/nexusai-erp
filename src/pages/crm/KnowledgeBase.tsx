import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Search, ThumbsUp, Eye, Edit, Star, TrendingUp, Users } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Label } from "@/components/ui/label";
import { formatNumber } from '@/lib/formatters';

interface KnowledgeArticle {
    id: string;
    title: string;
    summary: string;
    content: string;
    category: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    author: string;
    views: number;
    likes: number;
    helpfulVotes: number;
    createdAt: string;
    updatedAt: string;
}

interface Category {
    id: string;
    name: string;
    articleCount: number;
}

export default function KnowledgeBase() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch articles
    const { data: articles = [] } = useQuery<KnowledgeArticle[]>({
        queryKey: ["kb-articles", searchQuery],
        queryFn: async () => {
            const res = await fetch(`/api/crm/service/kb/articles?search=${searchQuery}`);
            return res.json();
        }
    });

    // Fetch categories
    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ["kb-categories"],
        queryFn: async () => {
            const res = await fetch("/api/crm/service/kb/categories");
            return res.json();
        }
    });

    // Save article mutation
    const saveArticleMutation = useMutation({
        mutationFn: async (article: Partial<KnowledgeArticle>) => {
            const method = article.id ? "PUT" : "POST";
            const url = article.id
                ? `/api/crm/service/kb/articles/${article.id}`
                : "/api/crm/service/kb/articles";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(article)
            });
            if (!res.ok) throw new Error("Failed to save");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kb-articles"] });
            toast({
                title: "Article Saved",
                description: "Knowledge article saved successfully"
            });
            setSelectedArticle(null);
            setIsEditing(false);
        }
    });

    // Vote helpful mutation
    const voteHelpfulMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/crm/service/kb/articles/${id}/vote`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to vote");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kb-articles"] });
        }
    });

    const publishedArticles = articles.filter(a => a.status === "PUBLISHED");
    const draftArticles = articles.filter(a => a.status === "DRAFT");
    const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
    const topArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);



    return (
        <StandardPage
            title="Knowledge Base"
            description="Manage self-service articles and documentation"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Service", href: "/crm/service" },
                { label: "Knowledge Base" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                Total Articles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{articles.length}</div>
                            <div className="text-xs text-blue-700">{publishedArticles.length} published</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                Total Views
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">{formatNumber(totalViews)}</div>
                            <div className="text-xs text-purple-700">All time</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">{categories.length}</div>
                            <div className="text-xs text-green-700">Topics covered</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-500/10 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                                <Edit className="h-3 w-3" />
                                Drafts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">{draftArticles.length}</div>
                            <div className="text-xs text-amber-700">Pending</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search knowledge base..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={() => { setSelectedArticle({ status: "DRAFT", views: 0, likes: 0, helpfulVotes: 0 } as KnowledgeArticle); setIsEditing(true); }}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        New Article
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Articles List */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Articles</CardTitle>
                                <CardDescription>Browse and manage knowledge base content</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {articles.map((article) => (
                                        <Card key={article.id} className="border-l-4 border-l-blue-500">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <CardTitle className="text-lg">{article.title}</CardTitle>
                                                            <StatusBadge status={article.status} />
                                                        </div>
                                                        <CardDescription className="mt-2 line-clamp-2">
                                                            {article.summary}
                                                        </CardDescription>
                                                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="h-3 w-3" />
                                                                {article.views} views
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <ThumbsUp className="h-3 w-3" />
                                                                {article.helpfulVotes} helpful
                                                            </div>
                                                            <div>•</div>
                                                            <div>{article.category}</div>
                                                            <div>•</div>
                                                            <div>By {article.author}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedArticle(article)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => { setSelectedArticle(article); setIsEditing(true); }}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    {article.status === "PUBLISHED" && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => voteHelpfulMutation.mutate(article.id)}
                                                        >
                                                            <ThumbsUp className="h-4 w-4 mr-1" />
                                                            Helpful
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {articles.length === 0 && (
                                        <div className="text-center text-muted-foreground py-8">
                                            No articles found. Create your first article to get started.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Categories */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Categories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <div key={category.id} className="flex items-center justify-between text-sm">
                                            <span>{category.name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {category.articleCount}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Articles */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Top Articles
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {topArticles.map((article, idx) => (
                                        <div key={article.id} className="space-y-1">
                                            <div className="flex items-start gap-2">
                                                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium line-clamp-2">{article.title}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                        <Eye className="h-3 w-3" />
                                                        {formatNumber(article.views)} views
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Article Viewer/Editor */}
                {selectedArticle && !isEditing && (
                    <Card className="border-t-4 border-t-blue-500">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
                                    <CardDescription className="mt-2">
                                        {selectedArticle.category} • By {selectedArticle.author} • {selectedArticle.updatedAt}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={selectedArticle.status} />
                                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setSelectedArticle(null)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none">
                                <p>{selectedArticle.content}</p>
                            </div>
                            <div className="flex items-center gap-6 mt-6 pt-6 border-t">
                                <div className="flex items-center gap-2 text-sm">
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">{selectedArticle.views}</span> views
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">{selectedArticle.helpfulVotes}</span> helpful votes
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Article Editor */}
                {isEditing && selectedArticle && (
                    <Card className="border-t-4 border-t-purple-500">
                        <CardHeader>
                            <CardTitle>
                                {selectedArticle.id ? "Edit Article" : "New Article"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Title</Label>
                                <Input defaultValue={selectedArticle.title} placeholder="Article title" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Category</Label>
                                    <Select defaultValue={selectedArticle.category}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Select defaultValue={selectedArticle.status}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DRAFT">Draft</SelectItem>
                                            <SelectItem value="PUBLISHED">Published</SelectItem>
                                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Summary</Label>
                                <Textarea rows={2} defaultValue={selectedArticle.summary} placeholder="Brief summary..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Content</Label>
                                <Textarea rows={10} defaultValue={selectedArticle.content} placeholder="Full article content..." />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => { setSelectedArticle(null); setIsEditing(false); }}>
                                    Cancel
                                </Button>
                                <Button onClick={() => saveArticleMutation.mutate(selectedArticle)}>
                                    Save Article
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
