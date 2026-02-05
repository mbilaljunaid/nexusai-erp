import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StandardTable, type Column } from "@/components/ui/StandardTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Import, CheckCircle2, AlertTriangle, FileText, ArrowRight } from "lucide-react";

interface PendingTransaction {
    id: number;
    source: string;
    date: string;
    description: string;
    amount: string;
    currency: string;
    projectName: string;
    taskNumber: string;
}

export default function TransactionImport() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isImporting, setIsImporting] = useState(false);

    const { data: transactions, isLoading } = useQuery<PendingTransaction[]>({
        queryKey: ['/api/ppm/transactions/pending'],
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/ppm/transactions/import", { method: "POST" });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Import Successful",
                description: `Imported ${data.count} items (AP: ${data.details.ap}, Inv: ${data.details.inventory}, Labor: ${data.details.labor})`,
            });
            queryClient.invalidateQueries({ queryKey: ['/api/ppm/transactions/pending'] });
            queryClient.invalidateQueries({ queryKey: ['/api/ppm/expenditures'] });
        },
        onError: (error: Error) => {
            toast({
                title: "Import Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const handleImport = async () => {
        setIsImporting(true);
        await mutation.mutateAsync();
        setIsImporting(false);
    };

    const columns: Column<PendingTransaction>[] = [
        { header: "Date", accessorKey: "date", cell: (item) => new Date(item.date).toLocaleDateString() },
        {
            header: "Source", accessorKey: "source", cell: (item) => (
                <Badge variant="outline" className="font-mono">{item.source}</Badge>
            )
        },
        { header: "Description", accessorKey: "description" },
        {
            header: "Amount", accessorKey: "amount", cell: (item) => (
                <span className="font-mono font-medium">${parseFloat(item.amount).toLocaleString()} {item.currency}</span>
            )
        },
        {
            header: "Project / Task", cell: (item) => (
                <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{item.projectName}</span>
                    <span className="mx-1">/</span>
                    {item.taskNumber}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Transaction Import</h2>
                    <p className="text-muted-foreground">Review and import pending entries from Accounts Payable and Inventory</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><FileText className="h-4 w-4 mr-2" /> Exceptions</Button>
                    <Button
                        onClick={handleImport}
                        disabled={isLoading || isImporting || !transactions?.length}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isImporting ? (
                            "Importing..."
                        ) : (
                            <>
                                <Import className="h-4 w-4 mr-2" />
                                Import {transactions?.length || 0} Items
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/50">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-500 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" /> Pending Validation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-400">
                            {transactions?.length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${transactions?.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Import Readiness</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="font-medium">Ready to Process</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-0 shadow-none bg-transparent">
                <StandardTable
                    data={transactions || []}
                    columns={columns}
                    isLoading={isLoading}
                    pageSize={20}
                />
            </Card>
        </div>
    );
}
