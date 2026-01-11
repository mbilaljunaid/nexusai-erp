import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

interface ReconciliationDetail {
    id: string;
    date: string;
    description: string;
    status: string;
    matchedLines: number;
}

interface Props {
    open: boolean;
    detail: ReconciliationDetail | null;
    onClose: () => void;
}

export default function ReconciliationDetailSideSheet({ open, detail, onClose }: Props) {
    if (!detail) return null;
    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Reconciliation Detail</DialogTitle>
                    <DialogClose />
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <p><strong>Date:</strong> {detail.date}</p>
                    <p><strong>Description:</strong> {detail.description}</p>
                    <p><strong>Status:</strong> {detail.status}</p>
                    <p><strong>Matched Lines:</strong> {detail.matchedLines}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
