import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download } from "lucide-react";

interface ExpenditureItem {
    id: string;
    date: string;
    projectNumber: string;
    projectName: string;
    taskNumber: string;
    expenditureType: string;
    quantity: string;
    rawCost: string;
    burdenedCost: string;
    status: string;
    source: string;
}

interface ExpenditureResponse {
    items: ExpenditureItem[];
    total: number;
}

export default function ExpenditureInquiry() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: results, isLoading } = useQuery<ExpenditureResponse>({
        queryKey: ['/api/ppm/expenditures', page, pageSize, searchQuery],
    });

    const columns: Column<ExpenditureItem>[] = [
        { header: "Date", accessorKey: "date", cell: (item) => new Date(item.date).toLocaleDateString() },
        {
            header: "Project", accessorKey: "projectName", cell: (item) => (
                <div>
                    <div className="font-medium">{item.projectName}</div>
                    <div className="text-xs text-muted-foreground">{item.projectNumber}</div>
                </div>
            )
        },
        { header: "Task", accessorKey: "taskNumber" },
        { header: "Exp Type", accessorKey: "expenditureType" },
        { header: "Qty", accessorKey: "quantity", cell: (item) => parseFloat(item.quantity).toFixed(2) },
        { header: "Raw Cost", accessorKey: "rawCost", cell: (item) => `$${parseFloat(item.rawCost).toLocaleString()}` },
        { header: "Burdened", accessorKey: "burdenedCost", cell: (item) => item.burdenedCost ? `$${parseFloat(item.burdenedCost).toLocaleString()}` : '-' },
        {
            header: "Status", accessorKey: "status", cell: (item) => (
                <Badge variant={item.status === 'COSTED' || item.status === 'DISTRIBUTED' ? 'default' : 'secondary'}>
                    {item.status}
                </Badge>
            )
        },
        {
            header: "Source", accessorKey: "source", cell: (item) => (
                <Badge variant="outline" className="opacity-80">
                    {item.source}
                </Badge>
            )
        }
    ];

    const totalPages = results ? Math.ceil(results.total / pageSize) : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Expenditure Inquiry</h2>
                    <p className="text-muted-foreground">View and audit project costs across the portfolio</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export</Button>
                </div>
            </div>

            <Card className="border-0 shadow-none bg-transparent">
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by project or task..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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

                {results && (
                    <div className="mt-4 text-xs text-muted-foreground text-center">
                        Showing {results.items.length} of {results.total} records
                    </div>
                )}
            </Card>
        </div>
    );
}
