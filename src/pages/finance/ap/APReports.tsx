import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandardTable, Column } from "@/components/ui/StandardTable";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Download, Filter } from "lucide-react";

export default function APReports() {
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [auditFilters, setAuditFilters] = useState({
        startDate: "",
        endDate: "",
        action: ""
    });

    // Aging Report
    const { data: agingData, isLoading: agingLoading } = useQuery({
        queryKey: ["/api/ap/reports/aging"],
        queryFn: () => fetch("/api/ap/reports/aging").then(r => r.json())
    });

    // Audit Trail
    const { data: auditData, isLoading: auditLoading } = useQuery({
        queryKey: ["/api/ap/reports/audit-trail", auditFilters],
        queryFn: () => {
            const params = new URLSearchParams();
            if (auditFilters.startDate) params.append("startDate", auditFilters.startDate);
            if (auditFilters.endDate) params.append("endDate", auditFilters.endDate);
            if (auditFilters.action) params.append("action", auditFilters.action);

            return fetch(`/api/ap/reports/audit-trail?${params}`).then(r => r.json());
        }
    });

    const agingColumns: Column<any>[] = [
        { header: "Supplier", accessorKey: "supplierName", className: "font-medium" },
        {
            header: "Current",
            accessorKey: "current",
            cell: (row) => `$${parseFloat(row.current || 0).toLocaleString()}`
        },
        {
            header: "1-30 Days",
            accessorKey: "days30",
            cell: (row) => `$${parseFloat(row.days30 || 0).toLocaleString()}`
        },
        {
            header: "31-60 Days",
            accessorKey: "days60",
            cell: (row) => `$${parseFloat(row.days60 || 0).toLocaleString()}`
        },
        {
            header: "61-90 Days",
            accessorKey: "days90",
            cell: (row) => `$${parseFloat(row.days90 || 0).toLocaleString()}`
        },
        {
            header: "90+ Days",
            accessorKey: "over90",
            cell: (row) => (
                <span className="font-semibold text-red-600">
                    ${parseFloat(row.over90 || 0).toLocaleString()}
                </span>
            )
        },
        {
            header: "Total",
            accessorKey: "total",
            cell: (row) => (
                <span className="font-bold">
                    ${parseFloat(row.total || 0).toLocaleString()}
                </span>
            )
        }
    ];

    const auditColumns: Column<any>[] = [
        {
            header: "Timestamp",
            accessorKey: "timestamp",
            cell: (row) => new Date(row.timestamp).toLocaleString()
        },
        { header: "User", accessorKey: "userId" },
        {
            header: "Action",
            accessorKey: "action",
            cell: (row) => <Badge>{row.action}</Badge>
        },
        { header: "Entity Type", accessorKey: "entityType" },
        { header: "Entity ID", accessorKey: "entityId", className: "font-mono text-sm" },
        { header: "Details", accessorKey: "details" }
    ];

    const exportAging = () => {
        const csv = [
            ["Supplier", "Current", "1-30 Days", "31-60 Days", "61-90 Days", "90+ Days", "Total"],
            ...(agingData || []).map((row: any) => [
                row.supplierName,
                row.current,
                row.days30,
                row.days60,
                row.days90,
                row.over90,
                row.total
            ])
        ].map(row => row.join(",")).join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ap-aging-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
    };

    return (
        <StandardPage
            title="AP Reports"
            description="Aging analysis and audit trail"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "AP", href: "/finance/ap" },
                { label: "Reports" }
            ]}
        >
            <Tabs defaultValue="aging" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="aging">Aging Report</TabsTrigger>
                    <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                </TabsList>

                <TabsContent value="aging" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>AP Aging Summary</CardTitle>
                                    <CardDescription>Outstanding payables by aging bucket</CardDescription>
                                </div>
                                <Button onClick={exportAging} variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <StandardTable
                                data={agingData || []}
                                columns={agingColumns}
                                totalItems={agingData?.length || 0}
                                page={1}
                                onPageChange={() => { }}
                                pageSize={100}
                                isLoading={agingLoading}
                                filterColumn="supplierName"
                                filterPlaceholder="Search supplier..."
                            />
                        </CardContent>
                    </Card>

                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Current</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${(agingData?.reduce((sum: number, row: any) => sum + parseFloat(row.current || 0), 0) || 0).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">1-30 Days</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${(agingData?.reduce((sum: number, row: any) => sum + parseFloat(row.days30 || 0), 0) || 0).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">31-90 Days</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    ${(agingData?.reduce((sum: number, row: any) => sum + parseFloat(row.days60 || 0) + parseFloat(row.days90 || 0), 0) || 0).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">90+ Days</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    ${(agingData?.reduce((sum: number, row: any) => sum + parseFloat(row.over90 || 0), 0) || 0).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="audit" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Trail</CardTitle>
                            <CardDescription>Complete history of AP transactions and changes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Filters */}
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={auditFilters.startDate}
                                        onChange={(e) => setAuditFilters({ ...auditFilters, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={auditFilters.endDate}
                                        onChange={(e) => setAuditFilters({ ...auditFilters, endDate: e.target.value })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="action">Action</Label>
                                    <Input
                                        id="action"
                                        placeholder="e.g., CREATE, UPDATE"
                                        value={auditFilters.action}
                                        onChange={(e) => setAuditFilters({ ...auditFilters, action: e.target.value })}
                                    />
                                </div>
                                <Button variant="outline">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Apply Filters
                                </Button>
                            </div>

                            <StandardTable
                                data={auditData || []}
                                columns={auditColumns}
                                totalItems={auditData?.length || 0}
                                page={page}
                                onPageChange={setPage}
                                pageSize={pageSize}
                                isLoading={auditLoading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
