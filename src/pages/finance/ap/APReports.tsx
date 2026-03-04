import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { StandardPage } from "@/components/layout/StandardPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveSpreadsheet, SpreadsheetColumn } from "@/components/ui/InteractiveSpreadsheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Download, Filter, Building2 } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";

function useActiveBu() {
    return useMemo(() => ({
        id: localStorage.getItem("nexus_active_bu") || null,
        name: localStorage.getItem("nexus_active_bu_name") || localStorage.getItem("nexus_active_bu") || "All Business Units"
    }), []);
}

export default function APReports() {
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const activeBu = useActiveBu();
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

    const agingColumns: SpreadsheetColumn<any>[] = [
        { header: "Supplier", id: "supplierName", width: "150px", cell: (r) => <span className="font-medium">{r.supplierName}</span> },
        {
            header: "Current",
            id: "current", width: "150px",
            cell: (row) => `$${parseFloat(row.current || 0).toLocaleString()}`
        },
        {
            header: "1-30 Days",
            id: "days30", width: "150px",
            cell: (row) => `$${parseFloat(row.days30 || 0).toLocaleString()}`
        },
        {
            header: "31-60 Days",
            id: "days60", width: "150px",
            cell: (row) => `$${parseFloat(row.days60 || 0).toLocaleString()}`
        },
        {
            header: "61-90 Days",
            id: "days90", width: "150px",
            cell: (row) => `$${parseFloat(row.days90 || 0).toLocaleString()}`
        },
        {
            header: "90+ Days",
            id: "over90", width: "150px",
            cell: (row) => (
                <span className="font-semibold text-red-600">
                    ${parseFloat(row.over90 || 0).toLocaleString()}
                </span>
            )
        },
        {
            header: "Total",
            id: "total", width: "150px",
            cell: (row) => (
                <span className="font-bold">
                    ${parseFloat(row.total || 0).toLocaleString()}
                </span>
            )
        }
    ];

    const auditColumns: SpreadsheetColumn<any>[] = [
        {
            header: "Timestamp",
            id: "timestamp", width: "150px",
            cell: (row) => new Date(row.timestamp).toLocaleString()
        },
        { header: "User", id: "userId", width: "150px", cell: (r) => r.userId },
        {
            header: "Action",
            id: "action", width: "150px",
            cell: (row) => <Badge>{row.action}</Badge>
        },
        { header: "Entity Type", id: "entityType", width: "150px", cell: (r) => r.entityType },
        { header: "Entity ID", id: "entityId", width: "150px", cell: (r) => <span className="font-mono text-sm">{r.entityId}</span> },
        { header: "Details", id: "details", width: "150px", cell: (r) => r.details }
    ];

    const exportData = (agingData || []).map((row: any) => ({
        "Supplier": row.supplierName,
        "Current": row.current,
        "1-30 Days": row.days30,
        "31-60 Days": row.days60,
        "61-90 Days": row.days90,
        "90+ Days": row.over90,
        "Total": row.total
    }));

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
            {/* BU Context Banner */}
            <div className="flex items-center gap-2 px-1 mb-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Report scope:</span>
                <Badge variant="secondary" className="font-mono text-xs">
                    {activeBu.id ? activeBu.name : "All Business Units"}
                </Badge>
                {!activeBu.id && (
                    <span className="text-xs text-amber-600">(No BU selected — showing all BU data)</span>
                )}
            </div>
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
                                <ExportButton
                                    data={exportData}
                                    filename={`ap-aging-${new Date().toISOString().split("T")[0]}`}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <InteractiveSpreadsheet
                                data={agingData || []}
                                columns={agingColumns}
                                isLoading={agingLoading}
                                onChange={() => { }} containerHeight="600px"
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

                            <InteractiveSpreadsheet
                                data={auditData || []}
                                columns={auditColumns}
                                isLoading={auditLoading}
                                onChange={() => { }} containerHeight="600px"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </StandardPage>
    );
}
