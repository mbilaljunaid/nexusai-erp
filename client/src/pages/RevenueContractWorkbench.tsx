import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
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
import type { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart,
    Activity,
    FileText,
    DollarSign
} from "lucide-react";
import { revenueContracts } from "@shared/schema/revenue";
// Infer type since we don't have explicit Zod export for Select yet, or use any for now to unblock
type RevenueContract = typeof revenueContracts.$inferSelect & {
    customerName?: string;
    ledgerName?: string;
};
import { useToast } from "@/hooks/use-toast";

export default function RevenueContractWorkbench() {
    const [page, setPage] = useState(1);
    const LIMIT = 10;
    const { toast } = useToast();

    const { data: result, isLoading } = useQuery({
        queryKey: ["revenueContracts", page],
        queryFn: async () => {
            const res = await fetch(`/api/revenue/contracts?page=${page}&limit=${LIMIT}`);
            if (!res.ok) {
                const error = await res.json();
                toast({
                    title: "Error fetching contracts",
                    description: error.error || "Unknown error",
                    variant: "destructive"
                });
                throw new Error("Failed to fetch contracts");
            }
            return res.json() as Promise<{ data: RevenueContract[], meta: { total: number, totalPages: number } }>;
        }
    });

    const contracts = result?.data || [];
    const meta = result?.meta;

    const columns: ColumnDef<RevenueContract>[] = [
        {
            header: "Contract #",
            accessorKey: "contractNumber",
            cell: (info: any) => (
                <Link href={`/revenue/contracts/${info.row.original.id}`}>
                    <a className="font-mono font-medium text-blue-600 hover:underline cursor-pointer">
                        {info.getValue()}
                    </a>
                </Link>
            )
        },
        {
            header: "Customer",
            accessorKey: "customerName",
            cell: (info: any) => info.getValue() || info.row.original.customerId || "Unknown"
        },
        {
            header: "Ledger",
            accessorKey: "ledgerName",
            cell: (info: any) => <span className="text-xs">{info.getValue() || info.row.original.ledgerId}</span>
        },
        {
            header: "Entity",
            accessorKey: "legalEntityId",
            cell: (info: any) => <Badge variant="outline">{info.getValue() || "PRIMARY"}</Badge>
        },
        {
            header: "Org",
            accessorKey: "orgId",
            cell: (info: any) => <span className="text-xs">{info.getValue() || "OU-01"}</span>
        },
        {
            header: "Ver",
            accessorKey: "versionNumber",
            cell: (info: any) => <Badge variant="secondary" className="px-1 text-[10px]">v{info.getValue() || 1}</Badge>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (info: any) => {
                const status = info.getValue();
                return (
                    <Badge variant={status === "Active" ? "default" : "secondary"}>
                        {status}
                    </Badge>
                );
            }
        },
        {
            header: "Total Price",
            accessorKey: "totalTransactionPrice",
            cell: (info: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(info.getValue() || 0))
        },
        {
            header: "Allocated",
            accessorKey: "totalAllocatedPrice",
            cell: (info: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(info.getValue() || 0))
        },
        {
            header: "Created",
            accessorKey: "createdAt",
            cell: (info: any) => new Date(info.getValue()).toLocaleDateString()
        },
        {
            header: "Actions",
            id: "actions",
            cell: (info: any) => (
                <Link href={`/revenue/contracts/${info.row.original.id}`}>
                    <Button variant="ghost" size="sm">
                        View Details
                    </Button>
                </Link>
            )
        }
    ];

    if (isLoading) {
        return <div className="p-8 space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>;
    }

    const activeCount = contracts?.filter((c) => c.status === 'Active').length || 0;
    const totalValue = contracts?.reduce((sum, c) => sum + Number(c.totalTransactionPrice || 0), 0) || 0;

    const processMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/revenue/jobs/process-events", { method: "POST" });
            if (!res.ok) throw new Error("Processing failed");
            return res.json();
        },
        onSuccess: (data: any) => {
            toast({
                title: "Allocation Complete",
                description: data.message || "Events processed successfully.",
            });
            // Refresh contracts
            queryClient.invalidateQueries({ queryKey: ["revenueContracts"] });
        },
        onError: () => {
            toast({
                title: "Processing Failed",
                description: "Failed to run allocation engine.",
                variant: "destructive"
            });
        }
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Revenue Contracts</h1>
                    <p className="text-muted-foreground mt-1">Asc 606 / IFRS 15 Management Workbench</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => processMutation.mutate()}
                        disabled={processMutation.isPending}
                    >
                        {processMutation.isPending ? "Processing..." : "Run Allocation Engine"}
                    </Button>
                    <Button>+ New Contract</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{meta?.total || contracts.length}</div>
                        <p className="text-xs text-muted-foreground">Across all pages</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active (Page)</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Value (Page)</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unallocated Revenue</CardTitle>
                        <BarChart className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contract List</CardTitle>
                    <CardDescription>Manage performance obligations and revenue schedules.</CardDescription>
                </CardHeader>
                <CardContent>
                    <StandardTable
                        data={contracts || []}
                        columns={columns}
                    />
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {meta?.totalPages || 1}
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= (meta?.totalPages || 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
