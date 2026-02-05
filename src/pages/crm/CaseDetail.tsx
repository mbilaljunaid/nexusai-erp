
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { User, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CaseDetail() {
    const { id } = useParams();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [comment, setComment] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: [`/api/crm/cases/${id}`],
        queryFn: async () => {
            const res = await fetch(`/api/crm/cases/${id}`);
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    const commentMutation = useMutation({
        mutationFn: async (body: string) => {
            await fetch(`/api/crm/cases/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/crm/cases/${id}`] });
            setComment("");
        }
    });

    const statusMutation = useMutation({
        mutationFn: async (status: string) => {
            await fetch(`/api/crm/cases/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/crm/cases/${id}`] });
            toast({ title: "Status Updated" });
        }
    });

    if (isLoading) return <div className="p-8">Loading case...</div>;

    const ticket = data?.case;
    const comments = data?.comments || [];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 h-[calc(100vh-2rem)] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">Case #{ticket?.id?.slice(0, 8)}</h1>
                        <Badge variant={ticket?.status === 'Closed' ? 'secondary' : 'default'}>{ticket?.status}</Badge>
                        <Badge variant="outline">{ticket?.priority}</Badge>
                    </div>
                    <p className="text-xl mt-2 font-medium">{ticket?.subject}</p>
                </div>
                <div className="flex gap-2">
                    {ticket?.status !== 'Closed' && (
                        <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => statusMutation.mutate("Closed")}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Close Ticket
                        </Button>
                    )}
                    {ticket?.status === 'Closed' && (
                        <Button
                            variant="outline"
                            onClick={() => statusMutation.mutate("Open")}
                        >
                            Re-open Ticket
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left: Details */}
                <Card className="col-span-1 h-full overflow-auto">
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                            <p className="mt-1 text-sm whitespace-pre-wrap">{ticket?.description || "No description provided."}</p>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Contact Info</h3>
                            <div className="mt-2 space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{data?.contact?.firstName} {data?.contact?.lastName}</span>
                                </div>
                                <p className="text-muted-foreground pl-6">{data?.account?.name}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <h3 className="text-muted-foreground">Origin</h3>
                                <p>{ticket?.origin}</p>
                            </div>
                            <div>
                                <h3 className="text-muted-foreground">Created</h3>
                                <p>{new Date(ticket?.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Comments Feed */}
                <Card className="col-span-2 h-full flex flex-col">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Activity Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {comments.length === 0 && (
                                    <div className="text-center text-muted-foreground py-8">No activity yet.</div>
                                )}
                                {comments.map((c: any) => (
                                    <div key={c.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                            <User className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">System User</span>
                                                <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="bg-muted/50 p-3 rounded-md text-sm">
                                                {c.body}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t bg-background">
                            <div className="flex gap-2">
                                <Textarea
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Type a reply..."
                                    className="min-h-[80px]"
                                />
                                <Button
                                    className="h-auto"
                                    disabled={!comment.trim() || commentMutation.isPending}
                                    onClick={() => commentMutation.mutate(comment)}
                                >
                                    Reply
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Knowledge Base Suggestions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            Suggested Solutions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SuggestedArticles subject={currentCase?.subject} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SuggestedArticles({ subject }: { subject: string }) {
    const { data: articles } = useQuery({
        queryKey: ["/api/crm/knowledge/suggest", subject],
        queryFn: () => fetch(`/api/crm/knowledge/suggest?query=${encodeURIComponent(subject)}`).then(r => r.json()),
        enabled: !!subject
    });

    if (!articles || articles.length === 0) return <p className="text-sm text-muted-foreground">No articles found.</p>;

    return (
        <div className="space-y-3">
            {articles.map((article: any) => (
                <div key={article.id} className="border-b last:border-0 pb-2">
                    <p className="font-medium text-sm hover:underline cursor-pointer text-blue-600">{article.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{article.content}</p>
                </div>
            ))}
        </div>
    );
}
