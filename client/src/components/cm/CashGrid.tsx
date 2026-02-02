import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Upload } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
    onAddTransaction?: () => void;
    onEditTransaction?: (transaction: CashTransaction) => void;
    onImportStatement?: () => void;
}

export default function CashGrid({ accountId, onAddTransaction, onEditTransaction, onImportStatement }: Props) {
    const { data: transactions, isLoading } = useQuery<CashTransaction[]>({
        queryKey: ['/api/cm/accounts', accountId, 'transactions'],
        enabled: !!accountId,
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

            <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Reference</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-600">Source</th>
                            <th className="px-4 py-3 text-right font-medium text-slate-600">Amount</th>
                            <th className="px-4 py-3 text-center font-medium text-slate-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {transactions?.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                    No transactions found.
                                </td>
                            </tr>
                        )}
                        {transactions?.map((row) => (
                            <tr
                                key={row.id}
                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => onEditTransaction && onEditTransaction(row)}
                            >
                                <td className="px-4 py-2 text-slate-900">
                                    {new Date(row.transactionDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 text-slate-600 font-mono text-xs">{row.reference || '-'}</td>
                                <td className="px-4 py-2 text-slate-700">{row.description || '-'}</td>
                                <td className="px-4 py-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {row.sourceModule}
                                    </span>
                                </td>
                                <td className={`px-4 py-2 text-right font-medium ${Number(row.amount) < 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    {Number(row.amount).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.status === 'Reconciled' || row.status === 'Cleared'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            {transactions && transactions.length > 0 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs text-slate-500">Showing {transactions.length} records</p>
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
