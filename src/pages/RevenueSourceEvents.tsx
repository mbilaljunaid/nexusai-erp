import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Upload,
    Play,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    Plus,
    RefreshCw,
    Download,
    Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DatePickerField } from '@/components/forms/DatePickerField';

interface SourceEvent {
    id: string;
    sourceSystem: string;
    sourceId: string;
    eventType: string;
    eventDate: string;
    itemId?: string;
    amount: string;
    currency: string;
    processingStatus: string;
    contractId?: string;
    errorMessage?: string;
    createdAt: string;
}


const eventSchema = z.object({
    sourceSystem: z.string().min(1, "Source System is required"),
    sourceId: z.string().min(1, "Source ID is required"),
    eventType: z.string().min(1, "Event Type is required"),
    eventDate: z.string().min(1, "Event Date is required"),
    amount: z.coerce.number().min(0, "Amount must be positive"),
    currency: z.string().min(1, "Currency is required"),
    itemId: z.string().optional()
});

export default function RevenueSourceEvents() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const form = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            sourceSystem: "API",
            sourceId: "",
            eventType: "Booking",
            eventDate: format(new Date(), "yyyy-MM-dd"),
            amount: 0,
            currency: "USD",
            itemId: ""
        }
    });

    // Fetch source events
    const { data: events = [], isLoading } = useQuery<SourceEvent[]>({
        queryKey: ["/api/revenue/events"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/events");
            if (!res.ok) return [];
            return res.json();
        },
        refetchInterval: 10000 // Refresh every 10 seconds
    });

    // Process events mutation
    const processEventsMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/revenue/jobs/process-events", { method: "POST" });
            if (!res.ok) throw new Error("Processing failed");
            return res.json();
        },
        onSuccess: (data: any) => {
            toast({
                title: "Processing Complete",
                description: `Processed ${data.results?.length || 0} events.`
            });
            queryClient.invalidateQueries({ queryKey: ["/api/revenue/events"] });
        },
        onError: () => {
            toast({
                title: "Processing Failed",
                description: "Failed to process events.",
                variant: "destructive"
            });
        }
    });

    // Create event mutation
    const createEventMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/revenue/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create event");
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Event Created",
                description: "Revenue source event has been queued for processing."
            });
            queryClient.invalidateQueries({ queryKey: ["/api/revenue/events"] });
            setIsCreateDialogOpen(false);
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to create event.",
                variant: "destructive"
            });
        }
    });

    const onSubmit = (data: z.infer<typeof eventSchema>) => {
        createEventMutation.mutate({
            ...data,
            itemId: data.itemId || null,
            amount: data.amount.toString()
        });

    };

    const filteredEvents = events.filter(event =>
        filterStatus === "all" || event.processingStatus === filterStatus
    );

    const statusCounts = {
        total: events.length,
        pending: events.filter(e => e.processingStatus === "Pending").length,
        processed: events.filter(e => e.processingStatus === "Processed").length,
        error: events.filter(e => e.processingStatus === "Error").length
    };

    return (
        <StandardPage
            title="Revenue Source Events"
            description="Ingest and process revenue events from operational systems"
            actions={
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => processEventsMutation.mutate()}
                        disabled={processEventsMutation.isPending || statusCounts.pending === 0}
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Process Queue ({statusCounts.pending})
                    </Button>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Manual Event
                    </Button>
                </div>
            }
        >

            {/* Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts.total}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
                        <p className="text-xs text-muted-foreground">Awaiting processing</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Processed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{statusCounts.processed}</div>
                        <p className="text-xs text-muted-foreground">Successfully processed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Errors</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{statusCounts.error}</div>
                        <p className="text-xs text-muted-foreground">Require attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Event Queue</CardTitle>
                            <CardDescription>
                                Revenue events from billing, order management, and usage systems
                            </CardDescription>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select
                                className="border rounded-md px-3 py-1.5 text-sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                aria-label="Filter events by status"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Processed">Processed</option>
                                <option value="Error">Error</option>
                                <option value="Ignored">Ignored</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="list">
                        <TabsList>
                            <TabsTrigger value="list">Event List</TabsTrigger>
                            <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
                            <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
                        </TabsList>

                        <TabsContent value="list" className="mt-4">
                            {isLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : filteredEvents.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No events found</p>
                                    <p className="text-sm mt-1">
                                        {filterStatus !== "all"
                                            ? "Try changing the filter"
                                            : "Create a manual event or upload a batch to get started"}
                                    </p>
                                </div>
                            ) : (
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Source</TableHead>
                                                <TableHead>Source ID</TableHead>
                                                <TableHead>Event Type</TableHead>
                                                <TableHead>Event Date</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead>Contract</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredEvents.map((event) => (
                                                <TableRow key={event.id} className="hover:bg-slate-50">
                                                    <TableCell>
                                                        <Badge variant="outline">{event.sourceSystem}</Badge>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">
                                                        {event.sourceId}
                                                    </TableCell>
                                                    <TableCell>{event.eventType}</TableCell>
                                                    <TableCell className="text-sm">
                                                        {format(new Date(event.eventDate), "MMM dd, yyyy")}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {event.currency} {parseFloat(event.amount).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {event.contractId ? (
                                                            <Badge variant="secondary">{event.contractId.slice(0, 8)}</Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                event.processingStatus === "Processed"
                                                                    ? "default"
                                                                    : event.processingStatus === "Pending"
                                                                        ? "secondary"
                                                                        : event.processingStatus === "Error"
                                                                            ? "destructive"
                                                                            : "outline"
                                                            }
                                                        >
                                                            {event.processingStatus === "Pending" && <Clock className="h-3 w-3 mr-1" />}
                                                            {event.processingStatus === "Processed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                            {event.processingStatus === "Error" && <AlertCircle className="h-3 w-3 mr-1" />}
                                                            {event.processingStatus}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {event.processingStatus === "Error" && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm">
                                                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{event.errorMessage || "View error"}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="upload" className="mt-4">
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="font-medium mb-2">Bulk Event Upload</p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Upload CSV/Excel file with revenue events from Order Management or Billing systems
                                </p>
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Select File
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="mapping" className="mt-4">
                            <div className="text-center py-12 text-muted-foreground">
                                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Field Mapping Configuration</p>
                                <p className="text-sm mt-1">
                                    Map source system fields to revenue event attributes
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Create Event Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Manual Revenue Event</DialogTitle>
                        <DialogDescription>
                            Manually create a revenue source event for processing
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <FormField control={form.control} name="sourceSystem" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source System *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="API">API / Manual</SelectItem>
                                                <SelectItem value="OrderManagement">Order Management</SelectItem>
                                                <SelectItem value="Billing">Billing System</SelectItem>
                                                <SelectItem value="Usage">Usage Tracking</SelectItem>
                                                <SelectItem value="Subscription">Subscription Platform</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="sourceId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Source ID *</FormLabel>
                                        <FormControl><Input placeholder="e.g., SO-12345" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="eventType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Booking">Booking</SelectItem>
                                                <SelectItem value="Shipment">Shipment</SelectItem>
                                                <SelectItem value="Consumption">Consumption</SelectItem>
                                                <SelectItem value="Invoice">Invoice</SelectItem>
                                                <SelectItem value="Usage">Usage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="eventDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Date *</FormLabel>
                                        <FormControl><DatePickerField {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="amount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount *</FormLabel>
                                        <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="currency" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                                <SelectItem value="JPY">JPY</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="itemId" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Item ID (Optional)</FormLabel>
                                        <FormControl><Input placeholder="e.g., PROD-001" {...field} value={field.value || ""} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => { setIsCreateDialogOpen(false); form.reset(); }}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createEventMutation.isPending}>
                                    {createEventMutation.isPending ? "Creating..." : "Create Event"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </StandardPage>
    );
}
