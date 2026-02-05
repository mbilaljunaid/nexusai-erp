import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileText, ArrowLeftRight, CheckCircle2 } from "lucide-react";

interface CostDistribution {
    id: string;
    amount: string;
    drAccount: string;
    crAccount: string;
    status: string;
    lineType: string;
    accountingDate: string;
    expenditureItemDate: string;
    projectName: string;
    taskNumber: string;
}

interface SlaResponse {
    items: CostDistribution[];
    total: number;
}

export default function SlaEventMonitor() {
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);

    const { data: results, isLoading } = useQuery<SlaResponse>({
        queryKey: ['/api/ppm/sla/distributions', page, pageSize, searchTerm],
        queryFn: async ({ queryKey }) => {
            const [url, p, ps, search] = queryKey;
            const offset = (Number(p) - 1) * Number(ps);
            const res = await fetch(`${url}?limit=${ps}&offset=${offset}${search ? `&projectId=${search}` : ''}`);
            if (!res.ok) throw new Error("Failed to fetch SLA data");
            return res.json();
        }
    });

    const columns: Column<CostDistribution>[] = [
        { header: "Accounting Date", accessorKey: "accountingDate", cell: (item) => new Date(item.accountingDate).toLocaleDateString() },
        {
            header: "Line Type", accessorKey: "lineType", cell: (item) => (
                <Badge variant="outline" className="font-mono">{item.lineType}</Badge>
            )
        },
        {
            header: "Amount", accessorKey: "amount", cell: (item) => (
                <span className="font-mono font-medium">${parseFloat(item.amount).toLocaleString()}</span>
            )
        },
        {
            header: "Debit Account", accessorKey: "drAccount", cell: (item) => (
                <div className="font-mono text-[10px] break-all max-w-[200px]">{item.drAccount || 'Unassigned'}</div>
            )
        },
        {
            header: "Credit Account", accessorKey: "crAccount", cell: (item) => (
                <div className="font-mono text-[10px] break-all max-w-[200px]">{item.crAccount || 'Unassigned'}</div>
            )
        },
        {
            header: "Status", accessorKey: "status", cell: (item) => (
                <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    {item.status}
                </div>
            )
        },
        {
            header: "Source", cell: (item) => (
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.projectName} / {item.taskNumber}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">SLA Event Monitor</h2>
                    <p className="text-muted-foreground">Subledger Accounting events and journal entries</p>
                </div>
                <Button variant="outline"><FileText className="h-4 w-4 mr-2" /> Export Journal</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {results?.total || 0} Events
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Journal Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="font-medium">All Posted</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="font-medium">Operational</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-none bg-transparent">
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by Project ID..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <StandardTable
                    data={results?.items || []}
                    columns={columns}
                    isLoading={isLoading}
                    page={page}
                    pageSize={pageSize}
                    totalItems={results?.total}
                    onPageChange={setPage}
                />
            </Card>
        </div>
    );
}
