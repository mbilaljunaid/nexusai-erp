import { formatDate } from "@/lib/dateUtils";
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { InteractiveSpreadsheet } from "@/components/ui/InteractiveSpreadsheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download } from "lucide-react";
import { StandardPage } from "@/components/layout/StandardPage";

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

    const columns = [
        { id: "date", header: "Date", width: "150px", cell: (item: any) => <div className="px-2 h-full flex items-center">{formatDate(item.date)}</div> },
        {
            id: "projectName", header: "Project", width: "250px", cell: (item: any) => (
                <div className="px-2 h-full flex flex-col justify-center">
                    <div className="font-medium">{item.projectName}</div>
                    <div className="text-xs text-muted-foreground">{item.projectNumber}</div>
                </div>
            )
        },
        { id: "taskNumber", header: "Task", width: "150px", cell: (item: any) => <div className="px-2 h-full flex items-center">{item.taskNumber}</div> },
        { id: "expenditureType", header: "Exp Type", width: "200px", cell: (item: any) => <div className="px-2 h-full flex items-center">{item.expenditureType}</div> },
        { id: "quantity", header: "Qty", width: "100px", cell: (item: any) => <div className="px-2 h-full flex items-center justify-end w-full">{parseFloat(item.quantity).toFixed(2)}</div> },
        { id: "rawCost", header: "Raw Cost", width: "150px", cell: (item: any) => <div className="px-2 h-full flex items-center justify-end font-medium w-full">${parseFloat(item.rawCost).toLocaleString()}</div> },
        { id: "burdenedCost", header: "Burdened", width: "150px", cell: (item: any) => <div className="px-2 h-full flex items-center justify-end w-full">{item.burdenedCost ? `$${parseFloat(item.burdenedCost).toLocaleString()}` : '-'}</div> },
        {
            id: "status", header: "Status", width: "150px", cell: (item: any) => (
                <div className="px-2 h-full flex items-center">
                    <Badge variant={item.status === 'COSTED' || item.status === 'DISTRIBUTED' ? 'default' : 'secondary'}>
                        {item.status}
                    </Badge>
                </div>
            )
        },
        {
            id: "source", header: "Source", width: "150px", cell: (item: any) => (
                <div className="px-2 h-full flex items-center">
                    <Badge variant="outline" className="opacity-80">
                        {item.source}
                    </Badge>
                </div>
            )
        }
    ];

    const totalPages = results ? Math.ceil(results.total / pageSize) : 0;

    return (
        <StandardPage title="Page Title">
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

                <div className="bg-card w-full rounded-md border shadow-sm">
                    <InteractiveSpreadsheet
                        data={results?.items || []}
                        columns={columns}
                        onChange={() => { }}
                        virtualized={true}
                        containerHeight="600px"
                    />
                </div>

                {results && (
                    <div className="mt-4 text-xs text-muted-foreground text-center">
                        Showing {results.items.length} of {results.total} records
                    </div>
                )}
            </Card>
        </StandardPage>
    );
}
