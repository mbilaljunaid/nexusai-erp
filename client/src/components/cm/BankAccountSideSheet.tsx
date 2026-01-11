import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

interface BankAccount {
    id: string;
    name: string;
    iban: string;
    swiftCode: string;
    balance: number;
}

interface Props {
    open: boolean;
    account: BankAccount | null;
    onClose: () => void;
}

export default function BankAccountSideSheet({ open, account, onClose }: Props) {
    if (!account) return null;
    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Bank Account Details</DialogTitle>
                    <DialogClose />
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <p><strong>Name:</strong> {account.name}</p>
                    <p><strong>IBAN:</strong> {account.iban}</p>
                    <p><strong>SWIFT:</strong> {account.swiftCode}</p>
                    <p><strong>Balance:</strong> {account.balance.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
