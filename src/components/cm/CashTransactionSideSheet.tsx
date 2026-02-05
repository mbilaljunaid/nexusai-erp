import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Transaction {
    id: string;
    amount: string;
    transactionDate: string;
    reference?: string;
    description?: string;
    status: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    accountId: string;
    transaction?: Transaction | null;
}

export default function CashTransactionSideSheet({ open, onClose, accountId, transaction }: Props) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        amount: '',
        transactionDate: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
    });

    useEffect(() => {
        if (transaction) {
            setFormData({
                amount: transaction.amount,
                transactionDate: new Date(transaction.transactionDate).toISOString().split('T')[0],
                reference: transaction.reference || '',
                description: transaction.description || '',
            });
        } else {
            setFormData({
                amount: '',
                transactionDate: new Date().toISOString().split('T')[0],
                reference: '',
                description: '',
            });
        }
    }, [transaction, open]);

    const saveTransaction = useMutation({
        mutationFn: async (data: any) => {
            if (transaction) {
                const res = await apiRequest('PATCH', `/api/cm/transactions/${transaction.id}`, data);
                return res.json();
            } else {
                const res = await apiRequest('POST', '/api/cm/transactions', data);
                return res.json();
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/cm/accounts', accountId, 'transactions'] });
            toast({ title: 'Success', description: `Transaction ${transaction ? 'updated' : 'created'} successfully` });
            onClose();
        },
        onError: (error) => {
            toast({ title: 'Error', description: 'Failed to save transaction', variant: 'destructive' });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveTransaction.mutate({
            bankAccountId: accountId, // Required for creation, ignored largely for update but kept for safety
            amount: formData.amount,
            date: formData.transactionDate,
            reference: formData.reference,
            description: formData.description,
            // Only defaults for new
            ...(!transaction && {
                sourceModule: 'MANUAL',
                sourceId: 'MANUAL',
                status: 'Unreconciled',
            })
        });
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{transaction ? 'Edit Transaction' : 'Add Manual Transaction'}</DialogTitle>
                    <DialogClose />
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Transaction Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.transactionDate}
                            onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reference">Reference</Label>
                        <Input
                            id="reference"
                            value={formData.reference}
                            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                            placeholder="e.g. TXN-001"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Transaction details..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={saveTransaction.isPending}>
                            {saveTransaction.isPending ? 'Saving...' : (transaction ? 'Update' : 'Create')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
