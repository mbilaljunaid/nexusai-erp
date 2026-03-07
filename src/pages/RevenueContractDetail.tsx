import { useState } from "react";
import { StandardPage } from "@/components/layout/StandardPage";
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
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
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
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueContractTimeline } from "@/components/revenue/RevenueContractTimeline";

export default function RevenueContractDetail() {
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [modValue, setModValue] = useState("");
    const [modReason, setModReason] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: contract, isLoading } = useQuery<any>({
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

    const pobColumns = [
        { id: "name", header: "Name", width: "250px", cell: (info: any) => <div className="px-2 h-full flex items-center">{info.name}</div> },
        { id: "satisfactionMethod", header: "Method", width: "150px", cell: (info: any) => <div className="px-2 h-full flex items-center">{info.satisfactionMethod}</div> },
        {
            id: "allocatedPrice",
            header: "Allocated Price",
            width: "150px",
            cell: (info: any) => <div className="px-2 h-full flex items-center">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(info.allocatedPrice || "0"))}</div>
        },
        {
            id: "dates",
            header: "Dates",
            width: "250px",
            cell: (info: any) => {
                const start = info.startDate;
                const end = info.endDate;
                return <div className="px-2 h-full flex items-center">{start ? `${format(new Date(start), "MMM yy")} - ${format(new Date(end), "MMM yy")}` : "N/A"}</div>;
            }
        }
    ];

    const recognitionColumns = [
        { id: "periodName", header: "Period", width: "150px", cell: (info: any) => <div className="px-2 h-full flex items-center">{info.periodName}</div> },
        {
            id: "amount",
            header: "Amount",
            width: "150px",
            cell: (info: any) => <div className="px-2 h-full flex items-center">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(info.amount || "0"))}</div>
        },
        {
            id: "status",
            header: "Status",
            width: "150px",
            cell: (info: any) => (
                <div className="px-2 h-full flex items-center">
                    <Badge variant={info.status === "Posted" ? "default" : "outline"}>{info.status}</Badge>
                </div>
            )
        },
        { id: "eventType", header: "Type", width: "150px", cell: (info: any) => <div className="px-2 h-full flex items-center">{info.eventType}</div> }
    ];

    return (
        <StandardPage
            title="RevenueContractDetail"
            description=""
            className="p-6 space-y-6 bg-slate-50/50 min-h-screen"
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/revenue/contracts">
                            <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground hover:text-slate-900 dark:text-slate-200">
                                ← Back
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-200">{contract.contractNumber}</h1>
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

            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="schedule">Recognition Schedule</TabsTrigger>
                    <TabsTrigger value="audit">Audit & History</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-white border-b">
                            <CardTitle>Performance Obligations (POBs)</CardTitle>
                            <CardDescription>Unit level delivery items for this contract.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 h-[400px]">
                            <InteractiveSpreadsheet
                                data={contract.performanceObligations || []}
                                columns={pobColumns}
                                onChange={() => { }}
                                virtualized={true}
                                containerHeight="400px"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule" className="mt-4">
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-white border-b">
                            <CardTitle>Recognition Schedules</CardTitle>
                            <CardDescription>Scheduled revenue realization across fiscal periods.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 h-[400px]">
                            <InteractiveSpreadsheet
                                data={contract.revenueRecognitions || []}
                                columns={recognitionColumns}
                                onChange={() => { }}
                                virtualized={true}
                                containerHeight="400px"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audit" className="mt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <RevenueContractTimeline contractId={id} />
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Log</CardTitle>
                                <CardDescription>Detailed field-level audit trail.</CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground flex items-center justify-center h-48 border-dashed border-2 rounded m-6">
                                Detailed field changes not available in this view.
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
