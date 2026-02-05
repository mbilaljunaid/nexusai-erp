
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Send, User } from "lucide-react";

interface CaseCommentsProps {
    caseId: string;
}

export function CaseComments({ caseId }: CaseCommentsProps) {
    const [commentBody, setCommentBody] = useState("");
    const queryClient = useQueryClient();

    const { data: comments = [], isLoading } = useQuery<any[]>({
        queryKey: [`/cases/${caseId}/comments`],
        queryFn: async () => {
            const res = await apiRequest("GET", `/cases/${caseId}/comments`);
            return res.json();
        }
    });

    const mutation = useMutation({
        mutationFn: async (body: string) => {
            const res = await apiRequest("POST", `/cases/${caseId}/comments`, {
                body,
                isPublic: true // Default to public for now
            });
            return res.json();
        },
        onSuccess: () => {
            setCommentBody("");
            queryClient.invalidateQueries({ queryKey: [`/cases/${caseId}/comments`] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentBody.trim()) return;
        mutation.mutate(commentBody);
    };

    if (isLoading) return <div>Loading comments...</div>;

    return (
        <div className="flex flex-col h-[500px]">
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {comments.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No comments yet.</p>
                    )}
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="bg-muted p-3 rounded-lg text-sm">
                                    {comment.body}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 px-1">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t mt-auto">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                        placeholder="Write a comment..."
                        className="min-h-[80px]"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <Button type="submit" disabled={mutation.isPending || !commentBody.trim()} className="self-end">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
