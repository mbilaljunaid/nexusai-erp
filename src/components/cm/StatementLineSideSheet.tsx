import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/formatters';

interface StatementLine {
    id: string;
    date: string;
    description: string;
    amount: number;
    balance: number;
}

interface Props {
    open: boolean;
    line: StatementLine | null;
    onClose: () => void;
}

export default function StatementLineSideSheet({ open, line, onClose }: Props) {
    if (!line) return null;
    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Statement Line Details</DialogTitle>
                    <DialogClose />
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <p><strong>Date:</strong> {line.date}</p>
                    <p><strong>Description:</strong> {line.description}</p>
                    <p><strong>Amount:</strong> {formatCurrency(line.amount)}</p>
                    <p><strong>Balance:</strong> {formatCurrency(line.balance)}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
