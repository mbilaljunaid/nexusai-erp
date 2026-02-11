import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Workflow, Play, Pause, GitBranch, Zap, Clock, Users, Mail, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface WorkflowStep {
    id: string;
    type: "EMAIL" | "WAIT" | "CONDITION" | "ACTION";
    config: any;
}

interface MarketingJourney {
    id: string;
    name: string;
    trigger: string;
    status: "ACTIVE" | "PAUSED" | "DRAFT";
    steps: WorkflowStep[];
    stats?: {
        enrolled: number;
        completed: number;
        active: number;
    };
}

export default function MarketingAutomation() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedJourney, setSelectedJourney] = useState<MarketingJourney | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch journeys
    const { data: journeys = [] } = useQuery<MarketingJourney[]>({
        queryKey: ["marketing-journeys"],
        queryFn: async () => {
            const res = await fetch("/api/crm/marketing/journeys");
            return res.json();
        }
    });

    // Save journey mutation
    const saveJourneyMutation = useMutation({
        mutationFn: async (journey: Partial<MarketingJourney>) => {
            const method = journey.id ? "PUT" : "POST";
            const url = journey.id
                ? `/api/crm/marketing/journeys/${journey.id}`
                : "/api/crm/marketing/journeys";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(journey)
            });
            if (!res.ok) throw new Error("Failed to save");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["marketing-journeys"] });
            toast({
                title: "Journey Saved",
                description: "Marketing journey saved successfully"
            });
            setSelectedJourney(null);
            setIsEditing(false);
        }
    });

    // Toggle journey status
    const toggleJourneyMutation = useMutation({
        mutationFn: async ({ id, action }: { id: string; action: "activate" | "pause" }) => {
            const res = await fetch(`/api/crm/marketing/journeys/${id}/${action}`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to toggle");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["marketing-journeys"] });
            toast({
                title: "Status Updated",
                description: "Journey status updated successfully"
            });
        }
    });

    const activeJourneys = journeys.filter(j => j.status === "ACTIVE");
    const draftJourneys = journeys.filter(j => j.status === "DRAFT");

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE": return "bg-green-100 text-green-800 border-green-200";
            case "PAUSED": return "bg-amber-100 text-amber-800 border-amber-200";
            case "DRAFT": return "bg-gray-100 text-gray-800 border-gray-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStepIcon = (type: string) => {
        switch (type) {
            case "EMAIL": return <Mail className="h-4 w-4" />;
            case "WAIT": return <Clock className="h-4 w-4" />;
            case "CONDITION": return <GitBranch className="h-4 w-4" />;
            case "ACTION": return <Zap className="h-4 w-4" />;
            default: return <CheckCircle className="h-4 w-4" />;
        }
    };

    return (
        <StandardPage
            title="Marketing Automation"
            description="Create and manage automated marketing journeys and workflows"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Marketing", href: "/crm/marketing" },
                { label: "Automation" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <Workflow className="h-3 w-3" />
                                Total Journeys
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{journeys.length}</div>
                            <div className="text-xs text-green-700">{activeJourneys.length} active</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Enrolled
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">
                                {journeys.reduce((sum, j) => sum + (j.stats?.enrolled || 0), 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-blue-700">Total contacts</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Completed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">
                                {journeys.reduce((sum, j) => sum + (j.stats?.completed || 0), 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-purple-700">Successfully finished</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                                <Play className="h-3 w-3" />
                                In Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900">
                                {journeys.reduce((sum, j) => sum + (j.stats?.active || 0), 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-amber-700">Currently running</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">
                        Automate nurture campaigns and customer onboarding
                    </div>
                    <Button onClick={() => { setSelectedJourney({ status: "DRAFT", steps: [] } as MarketingJourney); setIsEditing(true); }}>
                        <Workflow className="h-4 w-4 mr-2" />
                        New Journey
                    </Button>
                </div>

                {/* Journeys Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {journeys.map((journey) => {
                        const completionRate = journey.stats
                            ? ((journey.stats.completed / journey.stats.enrolled) * 100).toFixed(0)
                            : 0;

                        return (
                            <Card key={journey.id} className="border-l-4 border-l-green-500">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-lg">{journey.name}</CardTitle>
                                                <Badge className={getStatusColor(journey.status)}>
                                                    {journey.status}
                                                </Badge>
                                            </div>
                                            <CardDescription className="mt-2 flex items-center gap-2">
                                                <Zap className="h-3 w-3" />
                                                Trigger: {journey.trigger}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Workflow Steps */}
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">Workflow Steps ({journey.steps.length})</div>
                                        <div className="space-y-1">
                                            {journey.steps.slice(0, 3).map((step, idx) => (
                                                <div key={step.id} className="flex items-center gap-2 text-sm">
                                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-1">
                                                        {getStepIcon(step.type)}
                                                        <span className="text-muted-foreground">{step.type}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {journey.steps.length > 3 && (
                                                <div className="text-xs text-muted-foreground pl-8">
                                                    +{journey.steps.length - 3} more steps
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    {journey.stats && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Completion Rate</span>
                                                <span className="font-semibold">{completionRate}%</span>
                                            </div>
                                            <Progress value={Number(completionRate)} className="h-2" />
                                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                <div>
                                                    <div className="font-bold text-blue-700">{journey.stats.enrolled}</div>
                                                    <div className="text-muted-foreground">Enrolled</div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-amber-700">{journey.stats.active}</div>
                                                    <div className="text-muted-foreground">Active</div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-green-700">{journey.stats.completed}</div>
                                                    <div className="text-muted-foreground">Completed</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2 border-t">
                                        {journey.status === "ACTIVE" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => toggleJourneyMutation.mutate({ id: journey.id, action: "pause" })}
                                            >
                                                <Pause className="h-4 w-4 mr-1" />
                                                Pause
                                            </Button>
                                        )}
                                        {(journey.status === "PAUSED" || journey.status === "DRAFT") && (
                                            <Button
                                                size="sm"
                                                onClick={() => toggleJourneyMutation.mutate({ id: journey.id, action: "activate" })}
                                            >
                                                <Play className="h-4 w-4 mr-1" />
                                                Activate
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => { setSelectedJourney(journey); setIsEditing(true); }}
                                        >
                                            <GitBranch className="h-4 w-4 mr-1" />
                                            Edit Flow
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {journeys.length === 0 && (
                        <Card className="col-span-2 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <Workflow className="h-16 w-16 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Journeys Yet</h3>
                                <p className="text-sm text-muted-foreground max-w-md mb-4">
                                    Create automated workflows to nurture leads, onboard customers, or re-engage inactive contacts.
                                </p>
                                <Button onClick={() => { setSelectedJourney({ status: "DRAFT", steps: [] } as MarketingJourney); setIsEditing(true); }}>
                                    <Workflow className="h-4 w-4 mr-2" />
                                    Create First Journey
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Journey Editor (simplified) */}
                {isEditing && selectedJourney && (
                    <Card className="border-t-4 border-t-green-500">
                        <CardHeader>
                            <CardTitle>
                                {selectedJourney.id ? "Edit Journey" : "New Journey"}
                            </CardTitle>
                            <CardDescription>Configure your automated marketing workflow</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Journey Name</Label>
                                    <Input defaultValue={selectedJourney.name} placeholder="Welcome Journey" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Trigger Event</Label>
                                    <Select defaultValue={selectedJourney.trigger}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select trigger..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="contact_created">Contact Created</SelectItem>
                                            <SelectItem value="lead_converted">Lead Converted</SelectItem>
                                            <SelectItem value="opportunity_won">Opportunity Won</SelectItem>
                                            <SelectItem value="form_submitted">Form Submitted</SelectItem>
                                            <SelectItem value="email_clicked">Email Link Clicked</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Workflow Designer</Label>
                                <div className="border rounded-lg p-8 bg-muted/20 text-center text-muted-foreground">
                                    <Workflow className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Visual workflow builder would appear here</p>
                                    <p className="text-xs mt-1">Drag and drop steps to build your automation</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => { setSelectedJourney(null); setIsEditing(false); }}>
                                    Cancel
                                </Button>
                                <Button onClick={() => saveJourneyMutation.mutate(selectedJourney)}>
                                    Save Journey
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
