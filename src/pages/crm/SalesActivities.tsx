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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Phone, Mail, CheckSquare, Plus, CheckCircle, Search, Filter } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime, formatDate } from "@/lib/dateUtils";
import { Label } from "@/components/ui/label";

interface SalesActivity {
    id: string;
    type: "CALL" | "EMAIL" | "MEETING" | "TASK";
    subject: string;
    description: string;
    status: "OPEN" | "COMPLETED" | "CANCELLED";
    priority: "HIGH" | "MEDIUM" | "LOW";
    dueDate: string;
    assignedTo: string;
    relatedTo: {
        type: "CONTACT" | "ACCOUNT" | "OPPORTUNITY" | "LEAD";
        id: string;
        name: string;
    };
    durationMinutes?: number;
}

export default function SalesActivities() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("ALL");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const [newActivity, setNewActivity] = useState<Partial<SalesActivity>>({
        type: "TASK",
        priority: "MEDIUM",
        status: "OPEN"
    });

    const activities: SalesActivity[] = [
        {
            id: "act-01",
            type: "CALL",
            subject: "Follow up on Q3 Proposal",
            description: "Call John regarding the revised pricing sent yesterday.",
            status: "OPEN",
            priority: "HIGH",
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            assignedTo: "Sarah Jenkins",
            relatedTo: { type: "OPPORTUNITY", id: "opp-123", name: "Acme Corp Expansion" }
        },
        {
            id: "act-02",
            type: "MEETING",
            subject: "Product Demo",
            description: "Full suite demo for technical stakeholders.",
            status: "COMPLETED",
            priority: "HIGH",
            dueDate: new Date(Date.now() - 172800000).toISOString(),
            assignedTo: "Sarah Jenkins",
            relatedTo: { type: "CONTACT", id: "con-456", name: "Emily Chen" },
            durationMinutes: 60
        },
        {
            id: "act-03",
            type: "EMAIL",
            subject: "Send Case Studies",
            description: "Send manufacturing case studies",
            status: "OPEN",
            priority: "MEDIUM",
            dueDate: new Date().toISOString(),
            assignedTo: "Mike Ross",
            relatedTo: { type: "LEAD", id: "ld-789", name: "Stark Industries" }
        }
    ];

    const createActivityMutation = useMutation({
        mutationFn: async (activity: Partial<SalesActivity>) => {
            return new Promise(resolve => setTimeout(resolve, 500));
        },
        onSuccess: () => {
            toast({
                title: "Activity Created",
                description: "New sales activity logged successfully."
            });
            setIsCreateDialogOpen(false);
            setNewActivity({ type: "TASK", priority: "MEDIUM", status: "OPEN" });
        }
    });

    const completeActivityMutation = useMutation({
        mutationFn: async (id: string) => {
            return new Promise(resolve => setTimeout(resolve, 500));
        },
        onSuccess: () => {
            toast({
                title: "Activity Completed",
                description: "Marked activity as complete."
            });
        }
    })

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "CALL": return <Phone className="h-4 w-4 text-blue-500" />;
            case "EMAIL": return <Mail className="h-4 w-4 text-purple-500" />;
            case "MEETING": return <Calendar className="h-4 w-4 text-amber-500" />;
            case "TASK": default: return <CheckSquare className="h-4 w-4 text-green-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "HIGH": return "text-red-700 border-red-200 bg-red-50";
            case "MEDIUM": return "text-amber-700 border-amber-200 bg-amber-50";
            case "LOW": return "text-slate-700 border-slate-200 bg-slate-50";
            default: return "";
        }
    };

    const filteredActivities = activities.filter(a => {
        const matchesSearch = a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.relatedTo.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "ALL" || a.type === filterType;
        return matchesSearch && matchesType;
    });

    const openActivities = filteredActivities.filter(a => a.status === "OPEN");
    const completedActivities = filteredActivities.filter(a => a.status === "COMPLETED");

    return (
        <StandardPage
            title="Sales Activities"
            description="Manage your calls, emails, meetings, and tasks"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Sales", href: "/crm/sales" },
                { label: "Activities" }
            ]}
            actions={
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Log Activity
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Log Sales Activity</DialogTitle>
                            <DialogDescription>Record a touchpoint or schedule a future task.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Activity Type</Label>
                                    <Select
                                        value={newActivity.type}
                                        onValueChange={(v: any) => setNewActivity({ ...newActivity, type: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TASK">Task</SelectItem>
                                            <SelectItem value="CALL">Call</SelectItem>
                                            <SelectItem value="EMAIL">Email</SelectItem>
                                            <SelectItem value="MEETING">Meeting</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select
                                        value={newActivity.priority}
                                        onValueChange={(v: any) => setNewActivity({ ...newActivity, priority: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="LOW">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input
                                    placeholder="e.g. Follow up call..."
                                    value={newActivity.subject || ""}
                                    onChange={(e) => setNewActivity({ ...newActivity, subject: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Related Record Type</Label>
                                    <Select
                                        value={newActivity.relatedTo?.type}
                                        onValueChange={(v: any) => setNewActivity({ ...newActivity, relatedTo: { type: v, id: "", name: "" } })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPPORTUNITY">Opportunity</SelectItem>
                                            <SelectItem value="CONTACT">Contact</SelectItem>
                                            <SelectItem value="ACCOUNT">Account</SelectItem>
                                            <SelectItem value="LEAD">Lead</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Record Title</Label>
                                    <Input
                                        placeholder="Search..."
                                        disabled={!newActivity.relatedTo?.type}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date / Scheduled Time</Label>
                                <Input type="datetime-local" />
                            </div>
                            <div className="space-y-2">
                                <Label>Notes / Description</Label>
                                <Textarea
                                    rows={3}
                                    placeholder="Add any relevant details..."
                                    value={newActivity.description || ""}
                                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                            <Button onClick={() => createActivityMutation.mutate(newActivity)}>Save Activity</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            }
        >
            <div className="space-y-6">

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Due Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                                {openActivities.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Overdue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-900 dark:text-red-200">0</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-500/10 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                                <Phone className="h-3 w-3" /> Calls Scheduled
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                                {openActivities.filter(a => a.type === "CALL").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <CheckSquare className="h-3 w-3" /> Completed this Week
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                                {completedActivities.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks, meetings..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="All Activity Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="CALL">Calls Only</SelectItem>
                            <SelectItem value="MEETING">Meetings Only</SelectItem>
                            <SelectItem value="EMAIL">Emails Only</SelectItem>
                            <SelectItem value="TASK">Tasks Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Open Activities List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Open Activities</CardTitle>
                        <CardDescription>Your upcoming and pending tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]"></TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Related To</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {openActivities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No open activities found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    openActivities.map(activity => (
                                        <TableRow key={activity.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="p-2 rounded-full bg-background border flex items-center justify-center w-10 h-10">
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{activity.subject}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">{activity.description}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">{activity.relatedTo.name}</div>
                                                <div className="text-xs text-muted-foreground">{activity.relatedTo.type}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm whitespace-nowrap">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    {formatDateTime(activity.dueDate)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getPriorityColor(activity.priority)}>
                                                    {activity.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" onClick={() => completeActivityMutation.mutate(activity.id)}>
                                                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                                    Complete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Completed Activities History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]"></TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Related To</TableHead>
                                    <TableHead>Completed Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {completedActivities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No completed activities to show.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    completedActivities.map(activity => (
                                        <TableRow key={activity.id} className="opacity-75">
                                            <TableCell>
                                                <div className="p-2 rounded-full bg-background border flex items-center justify-center w-10 h-10">
                                                    {getActivityIcon(activity.type)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium line-through">{activity.subject}</div>
                                                <div className="text-xs text-muted-foreground">{activity.description}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{activity.relatedTo.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{formatDate(activity.dueDate)}</div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status="completed" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
