import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Clock, CheckCircle, XCircle, TrendingUp, User, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ContextualSearch } from "@/components/ContextualSearch";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { getStatusVariant } from "@/lib/statusUtils";
import { Label } from "@/components/ui/label";

interface ServiceCase {
    id: string;
    caseNumber: string;
    subject: string;
    description: string;
    status: "NEW" | "IN_PROGRESS" | "WAITING" | "RESOLVED" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    type: "TECHNICAL" | "BILLING" | "GENERAL" | "FEATURE_REQUEST";
    customer: string;
    assignedTo?: string;
    createdAt: string;
    slaDeadline?: string;
    slaStatus?: "ON_TIME" | "AT_RISK" | "BREACHED";
}

export default function CaseManagement() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedCase, setSelectedCase] = useState<ServiceCase | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch cases
    const { data: cases = [] } = useQuery<ServiceCase[]>({
        queryKey: ["service-cases"],
        queryFn: async () => {
            const res = await fetch("/api/crm/service/cases");
            return res.json();
        }
    });

    // Update case mutation
    const updateCaseMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<ServiceCase> }) => {
            const res = await fetch(`/api/crm/service/cases/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error("Failed to update");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["service-cases"] });
            toast({
                title: "Case Updated",
                description: "Case updated successfully"
            });
            setSelectedCase(null);
            setIsEditing(false);
        }
    });

    const newCases = cases.filter(c => c.status === "NEW");
    const inProgressCases = cases.filter(c => c.status === "IN_PROGRESS");
    const resolvedCases = cases.filter(c => c.status === "RESOLVED" || c.status === "CLOSED");
    const criticalCases = cases.filter(c => c.priority === "CRITICAL");
    const breachedSLA = cases.filter(c => c.slaStatus === "BREACHED");


    return (
        <StandardPage
            title="Case Management"
            description="Track and manage customer support cases with SLA monitoring"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Service", href: "/crm/service" },
                { label: "Cases" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                New Cases
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{newCases.length}</div>
                            <div className="text-xs text-blue-700">Unassigned</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-500/10 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                In Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">{inProgressCases.length}</div>
                            <div className="text-xs text-purple-700">Active</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Critical
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-900 dark:text-red-200">{criticalCases.length}</div>
                            <div className="text-xs text-red-700">Urgent attention</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-500/10 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                SLA Breach
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">{breachedSLA.length}</div>
                            <div className="text-xs text-amber-700">Past deadline</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Resolved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">{resolvedCases.length}</div>
                            <div className="text-xs text-green-700">Completed</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-72">
                            <ContextualSearch
                                placeholder="Search cases..."
                                fields={[{ key: "query", label: "Search", type: "text" }]}
                                onSearch={() => { }}
                            />
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={() => { setSelectedCase({ status: "NEW" } as ServiceCase); setIsEditing(true); }}>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        New Case
                    </Button>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="all">All ({cases.length})</TabsTrigger>
                        <TabsTrigger value="new">New ({newCases.length})</TabsTrigger>
                        <TabsTrigger value="in-progress">In Progress ({inProgressCases.length})</TabsTrigger>
                        <TabsTrigger value="critical">Critical ({criticalCases.length})</TabsTrigger>
                        <TabsTrigger value="resolved">Resolved ({resolvedCases.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        <Card>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Case #</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Assigned To</TableHead>
                                            <TableHead>SLA</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cases.map((caseItem) => (
                                            <TableRow key={caseItem.id}>
                                                <TableCell className="font-mono font-medium">{caseItem.caseNumber}</TableCell>
                                                <TableCell className="max-w-xs">
                                                    <div className="font-medium">{caseItem.subject}</div>
                                                    <div className="text-xs text-muted-foreground">{caseItem.type}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        {caseItem.customer}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={caseItem.priority} />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={caseItem.status} />
                                                </TableCell>
                                                <TableCell>{caseItem.assignedTo || <span className="text-muted-foreground">—</span>}</TableCell>
                                                <TableCell>
                                                    {caseItem.slaDeadline ? (
                                                        <StatusBadge status={caseItem.slaStatus} label={caseItem.slaDeadline} />
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => { setSelectedCase(caseItem); setIsEditing(true); }}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="new">
                        <div className="grid gap-4">
                            {newCases.map((caseItem) => (
                                <Card key={caseItem.id} className="border-l-4 border-l-blue-500">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg">{caseItem.caseNumber}</CardTitle>
                                                    <StatusBadge status={caseItem.priority} />
                                                </div>
                                                <CardDescription className="mt-1">{caseItem.subject}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                Customer: <span className="font-medium">{caseItem.customer}</span> •
                                                Type: <span className="font-medium">{caseItem.type}</span>
                                            </div>
                                            <Button size="sm" onClick={() => { setSelectedCase(caseItem); setIsEditing(true); }}>
                                                Assign & Start
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {newCases.length === 0 && (
                                <Card className="border-dashed">
                                    <CardContent className="pt-6">
                                        <EmptyState compact title="No new cases" />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="in-progress">
                        <div className="grid gap-4">
                            {inProgressCases.map((caseItem) => (
                                <Card key={caseItem.id} className="border-l-4 border-l-purple-500">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg">{caseItem.caseNumber}</CardTitle>
                                                    <StatusBadge status={caseItem.priority} />
                                                    {caseItem.slaStatus && (
                                                        <StatusBadge status={caseItem.slaStatus} label={`SLA: ${caseItem.slaStatus.replace('_', ' ')}`} />
                                                    )}
                                                </div>
                                                <CardDescription className="mt-1">{caseItem.subject}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm">
                                                <div className="text-muted-foreground">Assigned to: <span className="font-medium text-foreground">{caseItem.assignedTo}</span></div>
                                                {caseItem.slaDeadline && (
                                                    <div className="text-muted-foreground mt-1">Deadline: <span className="font-medium text-foreground">{caseItem.slaDeadline}</span></div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline">
                                                    <MessageSquare className="h-4 w-4 mr-1" />
                                                    Update
                                                </Button>
                                                <Button size="sm" onClick={() => updateCaseMutation.mutate({ id: caseItem.id, updates: { status: "RESOLVED" } })}>
                                                    Resolve
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {inProgressCases.length === 0 && (
                                <Card className="border-dashed">
                                    <CardContent className="pt-6">
                                        <EmptyState compact title="No cases in progress" />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="critical">
                        <div className="grid gap-4">
                            {criticalCases.map((caseItem) => (
                                <Card key={caseItem.id} className="border-l-4 border-l-red-500 bg-red-500/10">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg">{caseItem.caseNumber}</CardTitle>
                                                    <StatusBadge status={caseItem.priority} />
                                                    <StatusBadge status={caseItem.status} />
                                                </div>
                                                <CardDescription className="mt-1">{caseItem.subject}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm">
                                                <div className="font-medium text-red-900 dark:text-red-200">Requires immediate attention</div>
                                                <div className="text-muted-foreground">Customer: {caseItem.customer}</div>
                                            </div>
                                            <Button size="sm" variant="destructive">
                                                Escalate
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {criticalCases.length === 0 && (
                                <Card className="border-dashed">
                                    <CardContent className="pt-6">
                                        <EmptyState compact title="No critical cases" />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="resolved">
                        <div className="grid gap-4">
                            {resolvedCases.slice(0, 10).map((caseItem) => (
                                <Card key={caseItem.id} className="border-l-4 border-l-green-500">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg">{caseItem.caseNumber}</CardTitle>
                                                    <StatusBadge status={caseItem.status} />
                                                </div>
                                                <CardDescription className="mt-1">{caseItem.subject}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                            {resolvedCases.length === 0 && (
                                <Card className="border-dashed">
                                    <CardContent className="pt-6">
                                        <EmptyState compact title="No resolved cases" />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Case Editor (simplified) */}
                {isEditing && selectedCase && (
                    <Card className="border-t-4 border-t-blue-500">
                        <CardHeader>
                            <CardTitle>
                                {selectedCase.id ? `Case ${selectedCase.caseNumber}` : "New Case"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Subject</Label>
                                    <Input defaultValue={selectedCase.subject} placeholder="Brief description" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Customer</Label>
                                    <Input defaultValue={selectedCase.customer} placeholder="Customer name" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Priority</Label>
                                    <Select defaultValue={selectedCase.priority}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="CRITICAL">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Type</Label>
                                    <Select defaultValue={selectedCase.type}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TECHNICAL">Technical</SelectItem>
                                            <SelectItem value="BILLING">Billing</SelectItem>
                                            <SelectItem value="GENERAL">General</SelectItem>
                                            <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label className="text-sm font-medium">Description</Label>
                                    <Textarea rows={4} defaultValue={selectedCase.description} placeholder="Detailed description..." />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => { setSelectedCase(null); setIsEditing(false); }}>
                                    Cancel
                                </Button>
                                <Button onClick={() => updateCaseMutation.mutate({ id: selectedCase.id, updates: selectedCase })}>
                                    Save Case
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
