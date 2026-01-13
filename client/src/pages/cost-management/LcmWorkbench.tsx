import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Link as LinkIcon } from 'lucide-react';

export default function LcmWorkbench() {
    const charges = [
        { id: '1', po: 'PO-3001', charge: 'Freight', basis: 'Quantity', amount: 50.00, status: 'Allocated' },
        { id: '2', po: 'PO-3001', charge: 'Insurance', basis: 'Value', amount: 20.00, status: 'Allocated' },
        { id: '3', po: 'PO-3002', charge: 'Duty', basis: 'Value', amount: 150.00, status: 'Pending' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Landed Cost Workbench</h1>
                    <p className="text-muted-foreground">Manage trade charges and allocate to receipts.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Charge
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Unallocated Charges</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Input placeholder="Search PO..." />
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>PO Number</TableHead>
                                        <TableHead>Charge Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {charges.filter(c => c.status === 'Pending').map(charge => (
                                        <TableRow key={charge.id}>
                                            <TableCell>{charge.po}</TableCell>
                                            <TableCell>{charge.charge}</TableCell>
                                            <TableCell>${charge.amount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="ghost"><LinkIcon className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {charges.filter(c => c.status === 'Pending').length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">No pending charges</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Allocations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PO Number</TableHead>
                                    <TableHead>Charge</TableHead>
                                    <TableHead>Basis</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {charges.filter(c => c.status === 'Allocated').map(charge => (
                                    <TableRow key={charge.id}>
                                        <TableCell>{charge.po}</TableCell>
                                        <TableCell>{charge.charge}</TableCell>
                                        <TableCell>{charge.basis}</TableCell>
                                        <TableCell><span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-100 rounded-full">Done</span></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
