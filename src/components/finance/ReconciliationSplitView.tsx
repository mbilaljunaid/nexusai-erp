import { cn } from "@/lib/utils";
import { useState} from"react";
import { useQuery, useMutation} from"@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle} from"@/components/ui/card";
import { Button} from"@/components/ui/button";
import { Badge} from"@/components/ui/badge";
import { Checkbox} from"@/components/ui/checkbox";
import { StandardTable} from"@/components/ui/StandardTable";
import { CashStatementLine, CashTransaction} from"@shared/schema";
import { useToast} from"@/hooks/use-toast";
import { queryClient} from"@/lib/queryClient";
import { Link2, Link2Off} from"lucide-react";
import { format} from"date-fns";

interface ReconciliationSplitViewProps {
    bankAccountId: string;
}

export function ReconciliationSplitView({ bankAccountId}: ReconciliationSplitViewProps) {
    const { toast} = useToast();
    const [selectedLines, setSelectedLines] = useState<string[]>([]);
    const [selectedTxns, setSelectedTxns] = useState<string[]>([]);

    const { data: linesData, isLoading: loadingLines} = useQuery<{ data: CashStatementLine[]}>({
        queryKey: [`/api/finance/cash/accounts/${bankAccountId}/statement-lines`],
   });

    const { data: txnsData, isLoading: loadingTxns} = useQuery<{ data: CashTransaction[]}>({
        queryKey: [`/api/finance/cash/accounts/${bankAccountId}/transactions`],
   });

    const manualMatchMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/finance/cash/reconcile/manual", {
                method:"POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                    bankAccountId,
                    lineIds: selectedLines,
                    transactionIds: selectedTxns
               }),
           });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
       },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/finance/cash/accounts/${bankAccountId}/statement-lines`]});
            queryClient.invalidateQueries({ queryKey: [`/api/finance/cash/accounts/${bankAccountId}/transactions`]});
            setSelectedLines([]);
            setSelectedTxns([]);
            toast({ title:"Matching Successful", description:"The items have been reconciled."});
       },
        onError: (error) => {
            toast({ variant:"destructive", title:"Matching Failed", description: error.message});
       }
   });

    const statementColumns = [
        {
            id:"select",
            header:"",
            cell: (row: CashStatementLine) => (
                <Checkbox
                    checked={selectedLines.includes(row.id)}
                    onCheckedChange={(checked) => {
                        setSelectedLines(prev => checked ? [...prev, row.id] : prev.filter(id => id !== row.id));
                   }}
                />
            ),
            width:"40px"
       },
        { header:"Date", accessorKey:"transactionDate" as any, cell: (row: CashStatementLine) => format(new Date(row.transactionDate),"MMM dd, yyyy")},
        { header:"Description", accessorKey:"description" as any},
        {
            header:"Amount",
            accessorKey:"amount" as any,
            cell: (row: CashStatementLine) => (
                <span className={Number(row.amount) < 0 ?"text-red-500" :"text-green-600"}>
                    {new Intl.NumberFormat('en-US', { style:'currency', currency:'USD'}).format(Number(row.amount))}
                </span>
            )
       },
    ];

    const transactionColumns = [
        {
            id:"select",
            header:"",
            cell: (row: CashTransaction) => (row.id ? (
                <Checkbox
                    checked={selectedTxns.includes(row.id)}
                    onCheckedChange={(checked) => {
                        setSelectedTxns(prev => checked ? [...prev, row.id!] : prev.filter(id => id !== row.id));
                   }}
                />
            ) : null),
            width:"40px"
       },
        { header:"Date", accessorKey:"transactionDate" as any, cell: (row: CashTransaction) => row.transactionDate ? format(new Date(row.transactionDate),"MMM dd, yyyy") :'--'},
        { header:"Ref", accessorKey:"reference" as any},
        {
            header:"Amount",
            accessorKey:"amount" as any,
            cell: (row: CashTransaction) => (
                <span className={Number(row.amount) < 0 ?"text-red-500" :"text-green-600"}>
                    {new Intl.NumberFormat('en-US', { style:'currency', currency:'USD'}).format(Number(row.amount))}
                </span>
            )
       },
        { header:"Source", accessorKey:"sourceModule" as any, cell: (row: CashTransaction) => <Badge variant="outline">{row.sourceModule}</Badge>},
    ];

    const linesTotal = selectedLines.reduce((sum, id) => {
        const line = linesData?.data.find(l => l.id === id);
        return sum + (line ? Number(line.amount) : 0);
   }, 0);

    const txnsTotal = selectedTxns.reduce((sum, id) => {
        const txn = txnsData?.data.find(t => t.id === id);
        return sum + (txn ? Number(txn.amount) : 0);
   }, 0);

    const difference = linesTotal - txnsTotal;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg sticky top-0 border shadow-sm">
                <div className="flex gap-8">
                    <div>
                        <p className="text-xs uppercase text-muted-foreground font-semibold">Statement Selection</p>
                        <p className="text-lg font-bold">{new Intl.NumberFormat('en-US', { style:'currency', currency:'USD'}).format(linesTotal)}</p>
                    </div>
                    <div className="flex items-center">
                        <Link2 className="text-muted-foreground h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs uppercase text-muted-foreground font-semibold">Internal Selection</p>
                        <p className="text-lg font-bold">{new Intl.NumberFormat('en-US', { style:'currency', currency:'USD'}).format(txnsTotal)}</p>
                    </div>
                    <div className="border-l pl-8">
                        <p className="text-xs uppercase text-muted-foreground font-semibold">Difference</p>
                        <p className={cn(`text-lg font-bold ${Math.abs(difference) < 0.01 ?"text-green-600" :"text-red-600"}`)}>
                            {new Intl.NumberFormat('en-US', { style:'currency', currency:'USD'}).format(difference)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedLines([]); setSelectedTxns([]);}}>
                        <Link2Off className="h-4 w-4 mr-2" /> Clear Selection
                    </Button>
                    <Button
                        disabled={selectedLines.length === 0 || selectedTxns.length === 0 || manualMatchMutation.isPending}
                        onClick={() => manualMatchMutation.mutate()}
                    >
                        Match Selected
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex justify-between">
                            Bank Statement Lines
                            <Badge variant="secondary">{linesData?.data.length || 0} items</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StandardTable
                            data={linesData?.data || []}
                            columns={statementColumns as any}
                            isLoading={loadingLines}
                            pageSize={50}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold flex justify-between">
                            Internal Cash Transactions
                            <Badge variant="secondary">{txnsData?.data.length || 0} items</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StandardTable
                            data={txnsData?.data || []}
                            columns={transactionColumns as any}
                            isLoading={loadingTxns}
                            pageSize={50}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
