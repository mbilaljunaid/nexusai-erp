import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { queryClient } from "@/lib/queryClient";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandardTable } from "@/components/ui/StandardTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    FileEdit,
    ArrowUpRight,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function RevenueContractDetail() {
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [modValue, setModValue] = useState("");
    const [modReason, setModReason] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: contract, isLoading } = useQuery({
        queryKey: ["revenueContract", id],
        queryFn: async () => {
            const res = await fetch(`/api/revenue/contracts/${id}`);
            if (!res.ok) throw new Error("Failed to fetch contract");
            return res.json();
        }
    });

    const modifyMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/revenue/contracts/${id}/modify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    newTotalValue: parseFloat(modValue),
                    reason: modReason
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Modification failed");
            }
            return res.json();
        },
        onSuccess: (data: any) => {
            toast({
                title: "Modification Successful",
                description: `Catch-up amount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.catchupAmount)}`,
            });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["revenueContract", id] });
        },
        onError: (error: any) => {
            toast({
                title: "Modification Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    if (isLoading) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;
    if (!contract) return <div className="p-8 text-center">Contract not found</div>;

    const pobColumns: any[] = [
        { header: "Name", accessorKey: "name" },
        { header: "Method", accessorKey: "satisfactionMethod" },
        {
            header: "Allocated Price",
            accessorKey: "allocatedPrice",
            cell: (info: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(info.getValue() || "0"))
        },
        {
            header: "Dates",
            cell: (info: any) => {
                const start = info.row.original.startDate;
                const end = info.row.original.endDate;
                return start ? `${format(new Date(start), "MMM yy")} - ${format(new Date(end), "MMM yy")}` : "N/A";
            }
        }
    ];

    const recognitionColumns: any[] = [
        { header: "Period", accessorKey: "periodName" },
        {
            header: "Amount",
            accessorKey: "amount",
            cell: (info: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(info.getValue() || "0"))
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (info: any) => {
                const status = info.getValue();
                return <Badge variant={status === "Posted" ? "default" : "outline"}>{status}</Badge>
            }
        },
        { header: "Type", accessorKey: "eventType" }
    ];

    return (
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{contract.contractNumber}</h1>
                        <Badge variant="secondary">{contract.status}</Badge>
                    </div>
                    <p className="text-muted-foreground">Contract Details & Revenue Lifecycle</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                            <FileEdit className="h-4 w-4 mr-2" />
                            Record Modification
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Contract Modification (ASC 606)</DialogTitle>
                            <DialogDescription>
                                Significant changes to transaction price or scope require catch-up adjustments.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="total">New Total Contract Value</Label>
                                <Input
                                    id="total"
                                    type="number"
                                    value={modValue}
                                    onChange={(e) => setModValue(e.target.value)}
                                    placeholder={contract.totalAllocatedPrice}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reason">Modification Reason</Label>
                                <Input
                                    id="reason"
                                    value={modReason}
                                    onChange={(e) => setModReason(e.target.value)}
                                    placeholder="e.g. Price increase, Service scope expansion"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button
                                onClick={() => modifyMutation.mutate()}
                                disabled={modifyMutation.isPending}
                            >
                                {modifyMutation.isPending ? "Processing..." : "Apply Modification"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1 font-medium"><DollarSign className="h-4 w-4" /> Total Transaction Price</CardDescription>
                        <CardTitle className="text-2xl">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(contract.totalAllocatedPrice || "0"))}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1 font-medium"><Calendar className="h-4 w-4" /> Sign Date</CardDescription>
                        <CardTitle className="text-2xl">{contract.contractSignDate ? format(new Date(contract.contractSignDate), "MMM dd, yyyy") : "N/A"}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1 font-medium"><CheckCircle2 className="h-4 w-4" /> Recognition Status</CardDescription>
                        <CardTitle className="text-2xl">{contract.revenueRecognitions?.filter((r: any) => r.status === "Posted").length} / {contract.revenueRecognitions?.length} Periods</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b">
                    <CardTitle>Performance Obligations (POBs)</CardTitle>
                    <CardDescription>Unit level delivery items for this contract.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <StandardTable
                        data={contract.performanceObligations || []}
                        columns={pobColumns}
                    />
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b">
                    <CardTitle>Recognition Schedules</CardTitle>
                    <CardDescription>Scheduled revenue realization across fiscal periods.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <StandardTable
                        data={contract.revenueRecognitions || []}
                        columns={recognitionColumns}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
