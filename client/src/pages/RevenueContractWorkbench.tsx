import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandardTable, type ColumnDef } from "@/components/ui/StandardTable";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart,
    Activity,
    FileText,
    DollarSign
} from "lucide-react";
import type { RevenueContract } from "@shared/schema/revenue";
import { useToast } from "@/hooks/use-toast";

export default function RevenueContractWorkbench() {
    const [filter, setFilter] = useState("all");
    const { toast } = useToast();

    const { data: contracts, isLoading } = useQuery({
        queryKey: ["revenueContracts"],
        queryFn: async () => {
            const res = await fetch("/api/revenue/contracts");
            if (!res.ok) {
                const error = await res.json();
                toast({
                    title: "Error fetching contracts",
                    description: error.error || "Unknown error",
                    variant: "destructive"
                });
                throw new Error("Failed to fetch contracts");
            }
            return res.json() as Promise<RevenueContract[]>;
        }
    });

    const columns: ColumnDef<RevenueContract>[] = [
        {
            header: "Contract #",
            accessorKey: "contractNumber",
            cell: (info) => <span className="font-mono font-medium">{info.getValue()}</span>
        },
        {
            header: "Customer",
            accessorKey: "customerId", // Ideally fetched with name
            cell: (info) => info.getValue() || "Unknown"
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (info) => {
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
            cell: (info) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(info.getValue() || 0))
        },
        {
            header: "Allocated",
            accessorKey: "totalAllocatedPrice",
            cell: (info) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(info.getValue() || 0))
        },
        {
            header: "Created",
            accessorKey: "createdAt",
            cell: (info) => new Date(info.getValue()).toLocaleDateString()
        },
        {
            header: "Actions",
            id: "actions",
            cell: (info) => (
                <Button variant="ghost" size="sm" onClick={() => window.location.href = `/revenue/contracts/${info.row.original.id}`}>
                    View Details
                </Button>
            )
        }
    ];

    if (isLoading) {
        return <div className="p-8 space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>;
    }

    const activeCount = contracts?.filter((c) => c.status === 'Active').length || 0;
    const totalValue = contracts?.reduce((sum, c) => sum + Number(c.totalTransactionPrice || 0), 0) || 0;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Revenue Contracts</h1>
                    <p className="text-muted-foreground mt-1">Asc 606 / IFRS 15 Management Workbench</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Run Allocation Engine</Button>
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
                        <div className="text-2xl font-bold">{contracts?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transaction Value</CardTitle>
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
                    <CardDescription>Manaage performance obligations and revenue schedules.</CardDescription>
                </CardHeader>
                <CardContent>
                    <StandardTable
                        data={contracts || []}
                        columns={columns}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
