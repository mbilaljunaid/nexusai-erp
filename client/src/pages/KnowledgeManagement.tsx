import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookMarked, MessageCircle, Eye, ThumbsUp } from "lucide-react";

export default function KnowledgeManagement() {
  const [viewType, setViewType] = useState("articles");
  const { data: articles = [] } = useQuery<any[]>({ queryKey: ["/api/knowledge/articles"] });
  const { data: comments = [] } = useQuery<any[]>({ queryKey: ["/api/knowledge/comments"] });

  const totalViews = articles.reduce((sum: number, a: any) => sum + (a.views || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Management</h1>
        <p className="text-muted-foreground mt-2">Manage knowledge base articles and comments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Articles</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
              <BookMarked className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Comments</p>
                <p className="text-2xl font-bold">{comments.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant={viewType === "articles" ? "default" : "outline"} onClick={() => setViewType("articles")} data-testid="button-view-articles">
          Articles
        </Button>
        <Button variant={viewType === "comments" ? "default" : "outline"} onClick={() => setViewType("comments")} data-testid="button-view-comments">
          Comments
        </Button>
      </div>

      {viewType === "articles" && (
        <div className="space-y-3">
          {articles.map((article: any) => (
            <Card key={article.id} data-testid={`card-article-${article.id}`}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">{article.title}</h4>
                  <p className="text-sm text-muted-foreground">{article.content?.substring(0, 100)}...</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> {article.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" /> {article.helpful}
                      </span>
                    </div>
                    <Badge variant="outline">{article.category}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewType === "comments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comments.map((comment: any) => (
            <Card key={comment.id} data-testid={`card-comment-${comment.id}`}>
              <CardHeader>
                <CardTitle className="text-sm">{comment.author}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{comment.comment}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Rating: {comment.rating}★</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
