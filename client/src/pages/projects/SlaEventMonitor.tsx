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

export default function SlaEventMonitor() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: distributions, isLoading } = useQuery<CostDistribution[]>({
        queryKey: ['/api/ppm/sla/distributions'],
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
                <div className="font-mono text-xs">{item.drAccount}</div>
            )
        },
        {
            header: "Credit Account", accessorKey: "crAccount", cell: (item) => (
                <div className="font-mono text-xs">{item.crAccount}</div>
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
                <div className="text-xs text-muted-foreground">
                    {item.projectName} / {item.taskNumber}
                </div>
            )
        }
    ];

    const filteredData = distributions?.filter(item =>
        item.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.drAccount.includes(searchTerm) ||
        item.crAccount.includes(searchTerm)
    ) || [];

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
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Debits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${filteredData.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Events Processed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredData.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Journal Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="font-medium">Up to Date</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-none bg-transparent">
                <div className="flex items-center gap-2 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search accounts or projects..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <StandardTable
                    data={filteredData}
                    columns={columns}
                    isLoading={isLoading}
                    pageSize={20}
                />
            </Card>
        </div>
    );
}
