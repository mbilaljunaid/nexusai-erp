import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookMarked, MessageCircle, Eye, ThumbsUp, Library, Activity, Star } from "lucide-react";
import { StandardDashboard, DashboardWidget } from "@/components/layout/StandardDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function KnowledgeManagement() {
  const [viewType, setViewType] = useState("articles");
  const { data: articles = [], isLoading: articlesLoading } = useQuery<any[]>({ queryKey: ["/api/knowledge/articles"] });
  const { data: comments = [], isLoading: commentsLoading } = useQuery<any[]>({ queryKey: ["/api/knowledge/comments"] });

  const totalViews = articles.reduce((sum: number, a: any) => sum + (a.views || 0), 0);
  const isLoading = articlesLoading || commentsLoading;

  return (
    <StandardDashboard
      header={
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Knowledge Management</h1>
          <p className="text-muted-foreground mt-1">Enterprise knowledge base, standard operating procedures, and collaboration hub</p>
        </div>
      }
    >
      <DashboardWidget title="Articles" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-blue-100/50">
            <BookMarked className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{articles.length}</div>
            <p className="text-xs text-muted-foreground">Published SOPs</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Total Views" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-emerald-100/50">
            <Eye className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">{(totalViews / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Knowledge engagement</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Comments" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-purple-100/50">
            <MessageCircle className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-purple-600">{comments.length}</div>
            <p className="text-xs text-muted-foreground">Peer collaborations</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Activity Score" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-amber-100/50">
            <Activity className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">8.4</div>
            <p className="text-xs text-muted-foreground">Index vs Benchmark</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Content Navigator" colSpan={4} action={
        <div className="flex gap-2 bg-muted p-1 rounded-md">
          <Button size="sm" variant={viewType === "articles" ? "default" : "ghost"} className="h-7 text-[10px] px-3 uppercase font-semibold" onClick={() => setViewType("articles")}>
            Articles
          </Button>
          <Button size="sm" variant={viewType === "comments" ? "default" : "ghost"} className="h-7 text-[10px] px-3 uppercase font-semibold" onClick={() => setViewType("comments")}>
            Comments
          </Button>
        </div>
      } icon={Library}>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {viewType === "articles" ? (
              <div className="space-y-3">
                {articles.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No articles found</p>
                ) : (
                  articles.map((article: any) => (
                    <div key={article.id} className="p-4 border rounded-xl hover:bg-accent/30 transition-all border-l-4 border-l-blue-500 shadow-sm" data-testid={`card-article-${article.id}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-base">{article.title}</h4>
                        <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-tighter">{article.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.content}</p>
                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-accent/50 rounded">
                          <Eye className="h-3.5 w-3.5" /> {article.views}
                        </span>
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-accent/50 rounded">
                          <ThumbsUp className="h-3.5 w-3.5" /> {article.helpful} Helpful
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comments.length === 0 ? (
                  <p className="col-span-2 text-center py-8 text-muted-foreground">No comments found</p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="p-4 border rounded-lg bg-accent/30 flex flex-col justify-between h-full" data-testid={`card-comment-${comment.id}`}>
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                            {comment.author?.[0]}
                          </div>
                          <span className="text-xs font-bold">{comment.author}</span>
                        </div>
                        <p className="text-sm italic text-muted-foreground">"{comment.comment}"</p>
                      </div>
                      <div className="flex items-center justify-between border-t pt-3 mt-auto">
                        <div className="flex gap-0.5">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < comment.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">#REF-{comment.id}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </DashboardWidget>
    </StandardDashboard>
  );
}
