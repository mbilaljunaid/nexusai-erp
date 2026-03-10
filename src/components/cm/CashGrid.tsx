import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/dateUtils";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Upload } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CashTransaction {
    id: string;
    transactionDate: string;
    description?: string;
    reference?: string;
    amount: string;
    status: string;
    sourceModule: string;
}

interface Props {
    accountId: string;
    legalEntityId?: string | null;
    onAddTransaction?: () => void;
    onEditTransaction?: (transaction: CashTransaction) => void;
    onImportStatement?: () => void;
}

export default function CashGrid({ accountId, legalEntityId, onAddTransaction, onEditTransaction, onImportStatement }: Props) {
    const { data: transactions, isLoading } = useQuery<CashTransaction[]>({
        queryKey: ['/api/cm/accounts', accountId, 'transactions', legalEntityId ?? 'all'],
        enabled: !!accountId,
        queryFn: async () => {
            const headers: Record<string, string> = {};
            if (legalEntityId) headers['x-legal-entity-id'] = legalEntityId;
            const res = await fetch(`/api/cm/accounts/${accountId}/transactions`, { headers });
            if (!res.ok) throw new Error('Failed to fetch transactions');
            return res.json();
        },
    });

    if (isLoading) {
        return <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Cash Transactions</h3>
                <div className="space-x-2">
                    {onImportStatement && (
                        <Button size="sm" variant="outline" onClick={onImportStatement}>
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                        </Button>
                    )}
                    <Button size="sm" onClick={onAddTransaction}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-300 bg-card">
                <Table className="min- text-sm">
                    <TableHeader className="bg-muted border-b">
                        <TableRow>
                            <TableHead className="px-4 py-3 text-left font-medium text-muted-foreground">Date</TableHead>
                            <TableHead className="px-4 py-3 text-left font-medium text-muted-foreground">Reference</TableHead>
                            <TableHead className="px-4 py-3 text-left font-medium text-muted-foreground">Description</TableHead>
                            <TableHead className="px-4 py-3 text-left font-medium text-muted-foreground">Source</TableHead>
                            <TableHead className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</TableHead>
                            <TableHead className="px-4 py-3 text-center font-medium text-muted-foreground">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-200">
                        {transactions?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                        {transactions?.map((row) => (
                            <TableRow
                                key={row.id}
                                className="hover:bg-slate-500/10 transition-colors cursor-pointer"
                                onClick={() => onEditTransaction && onEditTransaction(row)}
                            >
                                <TableCell className="px-4 py-2 text-foreground dark:text-slate-200">
                                    {formatDate(row.transactionDate)}
                                </TableCell>
                                <TableCell className="px-4 py-2 text-muted-foreground font-mono text-xs">{row.reference || '-'}</TableCell>
                                <TableCell className="px-4 py-2 text-foreground/90">{row.description || '-'}</TableCell>
                                <TableCell className="px-4 py-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {row.sourceModule}
                                    </span>
                                </TableCell>
                                <TableCell className={cn(`px-4 py-2 text-right font-medium ${Number(row.amount) < 0 ? 'text-red-600' : 'text-green-600'
                                    }`)}>
                                    {formatCurrency(Number(row.amount))}
                                </TableCell>
                                <TableCell className="px-4 py-2 text-center">
                                    <span className={cn(`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.status === 'Reconciled' || row.status === 'Cleared'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`)}>
                                        {row.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Placeholder */}
            {transactions && transactions.length > 0 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs text-muted-foreground">Showing {transactions.length} records</p>
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
