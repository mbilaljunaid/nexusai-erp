import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Plus, FileText, CheckCircle2, Play, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface BillingEvent {
    id: string;
    projectId: string;
    taskId?: string;
    taskName?: string;
    eventType: "TM_ITEM" | "FIXED_MILESTONE" | "MANUAL";
    eventDate: string;
    amount: number;
    currency: string;
    description: string;
    billedFlag: boolean;
    invoiceId?: string;
    selected?: boolean;
}

export default function BillingEventsManager() {
    const { projectId } = useParams<{ projectId: string }>();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [events, setEvents] = useState<BillingEvent[]>([]);
    const [filterType, setFilterType] = useState<string>("ALL");

    // Fetch unbilled events
    const { data: rawEvents = [], refetch: refetchEvents } = useQuery<BillingEvent[]>({
        queryKey: ["billing-events", projectId],
        queryFn: async () => {
            const res = await fetch(`/api/ppm/billing/${projectId}/events`);
            const data = await res.json();
            return data.map((event: any) => ({ ...event, selected: false }));
        },
        enabled: !!projectId
    });

    // Generate T&M events mutation
    const generateEventsMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/ppm/billing/${projectId}/generate-events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) throw new Error("Failed to generate billing events");
            return res.json();
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["billing-events"] });
            toast({
                title: "Events Generated",
                description: `${result.eventsGenerated} new billing events created.`
            });
        }
    });

    // Generate invoice mutation
    const generateInvoiceMutation = useMutation({
        mutationFn: async (eventIds: string[]) => {
            const res = await fetch(`/api/ppm/billing/${projectId}/generate-invoice`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventIds })
            });
            if (!res.ok) throw new Error("Failed to generate invoice");
            return res.json();
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["billing-events"] });
            toast({
                title: "Invoice Created",
                description: `Draft invoice ${result.invoiceNumber} created successfully.`
            });
        }
    });

    const toggleSelection = (id: string) => {
        setEvents(prev =>
            prev.map(event =>
                event.id === id ? { ...event, selected: !event.selected } : event
            )
        );
    };

    const toggleSelectAll = () => {
        const allSelected = events.every(e => e.selected);
        setEvents(prev =>
            prev.map(event => ({ ...event, selected: !allSelected }))
        );
    };

    const selectedEvents = events.filter(e => e.selected);
    const totalAmount = selectedEvents.reduce((sum, e) => sum + e.amount, 0);

    // Apply filters
    const filteredEvents = rawEvents.filter(event => {
        if (filterType === "ALL") return true;
        return event.eventType === filterType;
    });

    // Update local state when raw events change
    useState(() => {
        setEvents(filteredEvents);
    });

    return (
        <StandardPage
            title="Billing Events Manager"
            description="Generate and manage billable events for project invoicing."
            breadcrumbs={[
                { label: "Projects", href: "/projects" },
                { label: "Billing Events" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase">Unbilled Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900">{rawEvents.filter(e => !e.billedFlag).length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase">T&M Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">
                                {rawEvents.filter(e => e.eventType === "TM_ITEM").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-purple-800 uppercase">Milestones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900">
                                {rawEvents.filter(e => e.eventType === "FIXED_MILESTONE").length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-50 border-orange-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-orange-800 uppercase">Total Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-900">
                                ${rawEvents.reduce((sum, e) => sum + e.amount, 0).toFixed(0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" /> Billing Events
                                </CardTitle>
                                <CardDescription>Select events to include in a draft invoice.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => generateEventsMutation.mutate()}
                                    disabled={generateEventsMutation.isPending}
                                >
                                    <Zap className="h-4 w-4 mr-2" />
                                    {generateEventsMutation.isPending ? "Generating..." : "Generate T&M Events"}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => generateInvoiceMutation.mutate(selectedEvents.map(e => e.id))}
                                    disabled={selectedEvents.length === 0 || generateInvoiceMutation.isPending}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    {generateInvoiceMutation.isPending ? "Creating..." : `Create Invoice (${selectedEvents.length})`}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium">Filter:</label>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Events</SelectItem>
                                    <SelectItem value="TM_ITEM">Time & Material</SelectItem>
                                    <SelectItem value="FIXED_MILESTONE">Fixed Milestones</SelectItem>
                                    <SelectItem value="MANUAL">Manual Entries</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Events Table */}
                        {filteredEvents.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No unbilled events found. Generate T&M events or create manual billing events.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={events.length > 0 && events.every(e => e.selected)}
                                                    onCheckedChange={toggleSelectAll}
                                                />
                                            </TableHead>
                                            <TableHead>Event Type</TableHead>
                                            <TableHead>Task</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEvents.map((event) => (
                                            <TableRow key={event.id} className={event.selected ? "bg-blue-50" : ""}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={event.selected}
                                                        onCheckedChange={() => toggleSelection(event.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        event.eventType === "TM_ITEM" ? "default" :
                                                            event.eventType === "FIXED_MILESTONE" ? "secondary" : "outline"
                                                    }>
                                                        {event.eventType === "TM_ITEM" ? "T&M" :
                                                            event.eventType === "FIXED_MILESTONE" ? "Milestone" : "Manual"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs">{event.taskName || "—"}</TableCell>
                                                <TableCell className="text-sm">{event.description}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {format(new Date(event.eventDate), "MMM dd, yyyy")}
                                                </TableCell>
                                                <TableCell className="text-right font-mono font-medium">
                                                    ${event.amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    {event.billedFlag ? (
                                                        <Badge variant="outline" className="gap-1">
                                                            <CheckCircle2 className="h-3 w-3" /> Billed
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <Play className="h-3 w-3" /> Ready
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Selection Summary */}
                                {selectedEvents.length > 0 && (
                                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                                        <CardContent className="pt-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""} selected
                                                    </p>
                                                    <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                                                </div>
                                                <Button onClick={() => generateInvoiceMutation.mutate(selectedEvents.map(e => e.id))}>
                                                    <FileText className="h-4 w-4 mr-2" /> Create Draft Invoice
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StandardPage>
    );
}
