import { formatDate, formatDateTime } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { User, MessageSquare, CheckCircle, Clock, BookOpen, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StandardPage } from "@/components/layout/StandardPage";
import { cn } from "@/lib/utils";

export default function CaseDetail() {
    const params = useParams() as { id?: string };
    const id = params.id;
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [comment, setComment] = useState("");

    const { data, isLoading } = useQuery<any>({
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

    const { data: entitlements = [] } = useQuery<any>({
        queryKey: ["/api/crm/service-entitlements"],
        queryFn: async () => {
            const res = await fetch("/api/crm/service-entitlements");
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    if (isLoading) return <div className="p-8">Loading case...</div>;

    const ticket = data?.case;
    const comments = data?.comments || [];
    const accountId = data?.account?.id;

    // Find active entitlement for this account
    const activeEntitlement = entitlements.find((e: any) => e.accountId === accountId && e.status === 'active');
    const slaLevel = activeEntitlement?.slaLevel || 'Standard';
    const isPremiumSLA = ['Silver', 'Gold', 'Platinum'].includes(slaLevel);

    return (
        <StandardPage
            title={`Case #${ticket?.id?.slice(0, 8) || ''}`}
            description={ticket?.subject}
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Cases", href: "/crm/cases" },
                { label: `Case #${ticket?.id?.slice(0, 8) || ''}` }
            ]}
            actions={
                <div className="flex items-center gap-3">
                    <Badge variant={ticket?.status === 'Closed' ? 'secondary' : 'default'}>{ticket?.status}</Badge>
                    <Badge variant="outline">{ticket?.priority}</Badge>
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
            }
            className="flex flex-col h-[calc(100vh-2rem)]"
        >
            <div className="grid grid-cols-3 gap-6 flex-1 min-h-0 mt-6">
                {/* Left Column: Details & SLAs */}
                <div className="col-span-1 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-6">
                    <Card className="shrink-0 border-muted">
                        <CardHeader className="pb-3 border-b bg-slate-50/50">
                            <CardTitle className="text-base flex justify-between items-center">
                                Details
                                {activeEntitlement && (
                                    <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                                        <ShieldCheck className="w-3 h-3 mr-1" />
                                        {activeEntitlement.contractNumber}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                                <p className="mt-1 text-sm whitespace-pre-wrap">{ticket?.description || "No description provided."}</p>
                            </div>
                            <Separator />
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Contact Info</h3>
                                <div className="mt-2 space-y-1 text-sm">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-primary" />
                                        <span className="font-semibold">{data?.contact?.firstName} {data?.contact?.lastName}</span>
                                    </div>
                                    <p className="text-muted-foreground pl-6 font-medium">{data?.account?.name}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h3 className="text-muted-foreground font-medium">Origin</h3>
                                    <p className="font-semibold">{ticket?.origin}</p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground font-medium">Created</h3>
                                    <p className="font-semibold">{formatDate(ticket?.createdAt)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SLA Milestones Card */}
                    <Card className="shrink-0 border-muted relative overflow-hidden">
                        {isPremiumSLA && (
                            <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                                <div className="absolute top-0 right-0 w-2 h-full bg-amber-500/20" />
                                <div className="absolute top-0 right-0 w-full h-2 bg-amber-500/20" />
                            </div>
                        )}
                        <CardHeader className="pb-3 border-b bg-slate-50/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className={cn("h-4 w-4", isPremiumSLA ? "text-amber-500" : "text-indigo-500")} />
                                SLA Milestones
                            </CardTitle>
                            <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider",
                                isPremiumSLA
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-white"
                            )}>
                                {slaLevel} SLA
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* First Response SLA */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold leading-none">First Response</span>
                                    {ticket?.status === 'Closed' ? (
                                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs"><ShieldCheck className="h-3.5 w-3.5" /> Met</span>
                                    ) : (
                                        <span className={cn("font-bold flex items-center gap-1 text-xs", isPremiumSLA ? "text-amber-600" : "text-rose-600")}>
                                            <AlertTriangle className="h-3.5 w-3.5" /> {isPremiumSLA ? '6m remaining' : '14m remaining'}
                                        </span>
                                    )}
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all",
                                        ticket?.status === 'Closed' ? 'bg-emerald-500 w-full' :
                                            isPremiumSLA ? 'bg-amber-500 w-[92%]' : 'bg-rose-500 w-[85%]'
                                    )} />
                                </div>
                            </div>

                            {/* Resolution SLA */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold leading-none">Resolution Time</span>
                                    {ticket?.status === 'Closed' ? (
                                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs"><ShieldCheck className="h-3.5 w-3.5" /> Met</span>
                                    ) : (
                                        <span className={cn("font-bold flex items-center gap-1 text-xs", isPremiumSLA ? "text-amber-600" : "text-amber-600")}>
                                            <Clock className="h-3.5 w-3.5" /> {isPremiumSLA ? '1h 12m' : '4h 12m'} remaining
                                        </span>
                                    )}
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full transition-all",
                                        ticket?.status === 'Closed' ? 'bg-emerald-500 w-[60%]' :
                                            isPremiumSLA ? 'bg-amber-500 w-[55%]' : 'bg-amber-500 w-[30%]'
                                    )} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Knowledge Base Suggestions */}
                    <Card className="shrink-0 mb-8">
                        <CardHeader className="pb-3 border-b bg-slate-50/50">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                Suggested Solutions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <SuggestedArticles subject={ticket?.subject || ""} />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Comments Feed */}
                <Card className="col-span-2 h-full flex flex-col shadow-sm border-none ring-1 ring-slate-200">
                    <CardHeader className="pb-3 border-b bg-slate-50/50">
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
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">System User</span>
                                                <span className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</span>
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
                                    className="min-h-20"
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
            </div>
        </StandardPage>
    );
}

function SuggestedArticles({ subject }: { subject: string }) {
    const { data: articles } = useQuery<any>({
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
