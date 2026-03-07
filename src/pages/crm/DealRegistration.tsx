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
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, DollarSign } from "lucide-react";
import { ContextualSearch } from "@/components/ContextualSearch";
import { DatePicker } from '@/components/ui/DatePicker';
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatNumber } from "@/lib/formatters";

interface DealRegistration {
    id: string;
    dealName: string;
    customerName: string;
    partnerName: string;
    estimatedValue: number;
    expectedCloseDate: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
    productType: string;
    description: string;
    submittedBy: string;
    submittedDate: string;
    reviewedBy?: string;
    reviewedDate?: string;
    rejectionReason?: string;
}

export default function DealRegistration() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedDeal, setSelectedDeal] = useState<DealRegistration | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch deal registrations
    const { data: deals = [] } = useQuery<DealRegistration[]>({
        queryKey: ["deal-registrations"],
        queryFn: async () => {
            const res = await fetch("/api/crm/partners/deal-registrations");
            return res.json();
        }
    });

    // Approve/reject mutations
    const approveDealMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/crm/partners/deal-registrations/${id}/approve`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Failed to approve");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deal-registrations"] });
            toast({
                title: "Deal Approved",
                description: "Deal registration has been approved"
            });
        }
    });

    const rejectDealMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            const res = await fetch(`/api/crm/partners/deal-registrations/${id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason })
            });
            if (!res.ok) throw new Error("Failed to reject");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["deal-registrations"] });
            toast({
                title: "Deal Rejected",
                description: "Deal registration has been rejected"
            });
        }
    });

    const pendingDeals = deals.filter(d => d.status === "PENDING");
    const approvedDeals = deals.filter(d => d.status === "APPROVED");
    const rejectedDeals = deals.filter(d => d.status === "REJECTED");
    const totalValue = pendingDeals.reduce((sum, d) => sum + d.estimatedValue, 0);



    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING": return <Clock className="h-4 w-4" />;
            case "APPROVED": return <CheckCircle className="h-4 w-4" />;
            case "REJECTED": return <XCircle className="h-4 w-4" />;
            case "EXPIRED": return <AlertCircle className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <StandardPage
            title="Deal Registration"
            description="Manage partner deal registrations and approvals"
            breadcrumbs={[
                { label: "CRM", href: "/crm" },
                { label: "Partners", href: "/crm/partners" },
                { label: "Deal Registration" }
            ]}
        >
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-amber-500/10 border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Pending Review
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">{pendingDeals.length}</div>
                            <div className="text-xs text-amber-700">Awaiting approval</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-500/10 border-green-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-green-800 uppercase flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Approved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900 dark:text-green-200">{approvedDeals.length}</div>
                            <div className="text-xs text-green-700">Deals protected</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/10 border-blue-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Pipeline Value
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">${formatNumber(totalValue / 1000, 0)}K</div>
                            <div className="text-xs text-blue-700">Pending deals</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-500/10 border-red-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-red-800 uppercase flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Rejected
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-900 dark:text-red-200">{rejectedDeals.length}</div>
                            <div className="text-xs text-red-700">Not approved</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-72">
                            <ContextualSearch
                                placeholder="Search deals..."
                                fields={[{ key: "query", label: "Search", type: "text" }]}
                                onSearch={() => { }}
                            />
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={() => { setSelectedDeal({ status: "PENDING" } as DealRegistration); setIsEditing(true); }}>
                        <FileText className="h-4 w-4 mr-2" />
                        Register Deal
                    </Button>
                </div>

                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="pending">Pending ({pendingDeals.length})</TabsTrigger>
                        <TabsTrigger value="approved">Approved ({approvedDeals.length})</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected ({rejectedDeals.length})</TabsTrigger>
                        <TabsTrigger value="all">All ({deals.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending">
                        <div className="grid gap-4">
                            {pendingDeals.map((deal) => (
                                <Card key={deal.id} className="border-l-4 border-l-amber-500">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg">{deal.dealName}</CardTitle>
                                                    <StatusBadge status={deal.status} />
                                                </div>
                                                <CardDescription className="mt-2">
                                                    Customer: <span className="font-medium">{deal.customerName}</span> •
                                                    Partner: <span className="font-medium">{deal.partnerName}</span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <div className="text-muted-foreground">Est. Value</div>
                                                    <div className="font-semibold text-lg">${formatNumber(deal.estimatedValue / 1000, 0)}K</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted-foreground">Expected Close</div>
                                                    <div className="font-medium">{deal.expectedCloseDate}</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted-foreground">Product</div>
                                                    <div className="font-medium">{deal.productType}</div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {deal.description}
                                            </div>
                                            <div className="text-xs text-muted-foreground border-t pt-2">
                                                Submitted by {deal.submittedBy} on {deal.submittedDate}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => approveDealMutation.mutate(deal.id)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => rejectDealMutation.mutate({ id: deal.id, reason: "Duplicate registration" })}
                                                    className="text-red-600 border-red-200 hover:bg-red-500/10"
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setSelectedDeal(deal)}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {pendingDeals.length === 0 && (
                                <Card className="border-dashed">
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        No pending deal registrations
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="approved">
                        <div className="grid gap-4">
                            {approvedDeals.map((deal) => (
                                <Card key={deal.id} className="border-l-4 border-l-green-500">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg">{deal.dealName}</CardTitle>
                                                    <StatusBadge status={deal.status} />
                                                </div>
                                                <CardDescription className="mt-2">
                                                    {deal.customerName} • {deal.partnerName}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm">
                                            <div>
                                                <div className="font-semibold text-lg">${formatNumber(deal.estimatedValue / 1000, 0)}K</div>
                                                <div className="text-muted-foreground">Close: {deal.expectedCloseDate}</div>
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground">
                                                Approved by {deal.reviewedBy} on {deal.reviewedDate}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="rejected">
                        <div className="grid gap-4">
                            {rejectedDeals.map((deal) => (
                                <Card key={deal.id} className="border-l-4 border-l-red-500 bg-red-500/10">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg">{deal.dealName}</CardTitle>
                                                    <StatusBadge status={deal.status} />
                                                </div>
                                                <CardDescription className="mt-2">
                                                    {deal.customerName} • {deal.partnerName}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Estimated Value:</span>
                                                <span className="font-medium">${formatNumber(deal.estimatedValue / 1000, 0)}K</span>
                                            </div>
                                            {deal.rejectionReason && (
                                                <div className="mt-3 p-3 bg-red-500/10 border border-red-100 rounded">
                                                    <div className="font-medium text-red-900 dark:text-red-200 mb-1">Rejection Reason:</div>
                                                    <div className="text-red-800">{deal.rejectionReason}</div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="all">
                        <Card>
                            <CardContent className="pt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Deal Name</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Partner</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Value</TableHead>
                                            <TableHead>Close Date</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deals.map((deal) => (
                                            <TableRow key={deal.id}>
                                                <TableCell className="font-medium">{deal.dealName}</TableCell>
                                                <TableCell>{deal.customerName}</TableCell>
                                                <TableCell>{deal.partnerName}</TableCell>
                                                <TableCell>
                                                    <StatusBadge status={deal.status} />
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    ${formatNumber(deal.estimatedValue / 1000, 0)}K
                                                </TableCell>
                                                <TableCell>{deal.expectedCloseDate}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setSelectedDeal(deal)}
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
                </Tabs>

                {/* Deal Detail Viewer */}
                {selectedDeal && !isEditing && (
                    <Card className="border-t-4 border-t-blue-500">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{selectedDeal.dealName}</CardTitle>
                                    <CardDescription className="mt-2">
                                        Registration Details
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={selectedDeal.status} />
                                    <Button size="sm" variant="ghost" onClick={() => setSelectedDeal(null)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Customer</div>
                                    <div className="font-medium">{selectedDeal.customerName}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Partner</div>
                                    <div className="font-medium">{selectedDeal.partnerName}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Estimated Value</div>
                                    <div className="font-semibold text-lg">${formatNumber(selectedDeal.estimatedValue / 1000, 0)}K</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Expected Close</div>
                                    <div className="font-medium">{selectedDeal.expectedCloseDate}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-sm text-muted-foreground">Product Type</div>
                                    <div className="font-medium">{selectedDeal.productType}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-sm text-muted-foreground">Description</div>
                                    <div className="mt-1">{selectedDeal.description}</div>
                                </div>
                            </div>
                            <div className="border-t pt-4 text-sm text-muted-foreground">
                                Submitted by {selectedDeal.submittedBy} on {selectedDeal.submittedDate}
                                {selectedDeal.reviewedBy && (
                                    <div className="mt-1">
                                        Reviewed by {selectedDeal.reviewedBy} on {selectedDeal.reviewedDate}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Deal Registration Form */}
                {isEditing && selectedDeal && (
                    <Card className="border-t-4 border-t-purple-500">
                        <CardHeader>
                            <CardTitle>Register New Deal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Deal Name</label>
                                    <Input defaultValue={selectedDeal.dealName} placeholder="Opportunity name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Customer Name</label>
                                    <Input defaultValue={selectedDeal.customerName} placeholder="Customer company" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Partner Name</label>
                                    <Input defaultValue={selectedDeal.partnerName} placeholder="Partner company" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Product Type</label>
                                    <Input defaultValue={selectedDeal.productType} placeholder="e.g., Enterprise License" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Estimated Value ($)</label>
                                    <Input type="number" defaultValue={selectedDeal.estimatedValue} placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Expected Close Date</label>
                                    <DatePicker onChange={() => { }} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea rows={4} defaultValue={selectedDeal.description} placeholder="Deal details and context..." />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => { setSelectedDeal(null); setIsEditing(false); }}>
                                    Cancel
                                </Button>
                                <Button onClick={() => { setSelectedDeal(null); setIsEditing(false); }}>
                                    Submit Registration
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </StandardPage>
    );
}
