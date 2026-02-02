import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, Calendar, StickyNote, CheckCircle, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Interaction } from "@shared/schema";

interface ActivityTimelineProps {
    entityType: "lead" | "contact" | "account" | "opportunity";
    entityId: string;
}

export function ActivityTimeline({ entityType, entityId }: ActivityTimelineProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("note");

    // Form State
    const [summary, setSummary] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");

    const { data: interactions = [], isLoading } = useQuery<Interaction[]>({
        queryKey: ["/api/crm/interactions", entityType, entityId],
        queryFn: () => apiRequest("GET", `/api/crm/interactions?entityType=${entityType}&entityId=${entityId}`).then(res => res.json())
    });

    const createMutation = useMutation({
        mutationFn: async (type: string) => {
            return apiRequest("POST", "/api/crm/interactions", {
                entityType,
                entityId,
                type,
                summary: summary || `${type.charAt(0).toUpperCase() + type.slice(1)} logged`,
                description,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            });
        },
        onSuccess: () => {
            toast({ title: "Activity Logged", description: "The interaction has been saved." });
            setSummary("");
            setDescription("");
            setDueDate("");
            queryClient.invalidateQueries({ queryKey: ["/api/crm/interactions", entityType, entityId] });
        },
        onError: (err) => {
            console.error(err);
            toast({ title: "Error", description: "Failed to log activity", variant: "destructive" });
        }
    });

    const handleSubmit = (type: string) => {
        createMutation.mutate(type);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "call": return <Phone className="h-4 w-4 text-blue-500" />;
            case "email": return <Mail className="h-4 w-4 text-green-500" />;
            case "meeting": return <Calendar className="h-4 w-4 text-purple-500" />;
            case "task": return <CheckCircle className="h-4 w-4 text-orange-500" />;
            default: return <StickyNote className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">Log Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-5 mb-4">
                            <TabsTrigger value="note" className="flex gap-2"><StickyNote className="h-4 w-4" /> Note</TabsTrigger>
                            <TabsTrigger value="call" className="flex gap-2"><Phone className="h-4 w-4" /> Call</TabsTrigger>
                            <TabsTrigger value="email" className="flex gap-2"><Mail className="h-4 w-4" /> Email</TabsTrigger>
                            <TabsTrigger value="meeting" className="flex gap-2"><Calendar className="h-4 w-4" /> Event</TabsTrigger>
                            <TabsTrigger value="task" className="flex gap-2"><CheckCircle className="h-4 w-4" /> Task</TabsTrigger>
                        </TabsList>

                        <div className="space-y-4">
                            <Input
                                placeholder="Subject / Summary"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                            />

                            <Textarea
                                placeholder={`Describe the ${activeTab}...`}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[100px]"
                            />

                            {(activeTab === "task" || activeTab === "meeting") && (
                                <div className="flex gap-2 items-center">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="datetime-local"
                                        className="max-w-[250px]"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end">
                                <Button
                                    onClick={() => handleSubmit(activeTab)}
                                    disabled={createMutation.isPending || (!summary && !description)}
                                >
                                    {createMutation.isPending ? "Saving..." : "Log Activity"}
                                </Button>
                            </div>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Timeline</h3>

                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading history...</div>
                ) : interactions.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg bg-muted/20 text-muted-foreground">
                        No activities found. Log your first interaction above.
                    </div>
                ) : (
                    <div className="relative space-y-0 pl-4 border-l-2 border-muted ml-2">
                        {interactions.map((interaction) => (
                            <div key={interaction.id} className="relative pb-8 pl-6 group">
                                <div className="absolute -left-[31px] bg-background p-1 rounded-full border border-muted group-hover:border-primary transition-colors">
                                    {getIcon(interaction.type)}
                                </div>

                                <div className="bg-card border rounded-lg p-4 shadow-sm group-hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold capitalize text-sm">{interaction.type}</span>
                                            <span className="text-muted-foreground text-xs">•</span>
                                            <span className="font-medium text-sm">{interaction.summary}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap" title={new Date(interaction.createdAt || "").toLocaleString()}>
                                            {interaction.createdAt && formatDistanceToNow(new Date(interaction.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>

                                    {interaction.description && (
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{interaction.description}</p>
                                    )}

                                    {interaction.dueDate && (
                                        <div className="mt-2 pt-2 border-t flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                            <Clock className="h-3 w-3" />
                                            Due: {format(new Date(interaction.dueDate), "PPP p")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
