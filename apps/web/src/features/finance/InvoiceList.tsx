import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Loader2 } from "lucide-react";

interface Invoice {
    id: string;
    customerName: string;
    amount: number;
    status: string;
    dueDate: string;
}

export function InvoiceList() {
    const [search, setSearch] = useState("");
    const tenantId = "tenant-1";

    const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
        queryKey: [`/api/erp/${tenantId}/finance/invoices`],
    });

    const createInvoiceMutation = useMutation({
        mutationFn: async (newInv: Partial<Invoice>) => {
            return apiRequest("POST", `/api/erp/${tenantId}/finance/invoices`, newInv);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/erp/${tenantId}/finance/invoices`] });
        },
    });

    const handleCreateMockInvoice = () => {
        createInvoiceMutation.mutate({
            customerName: `Customer ${Math.floor(Math.random() * 50)}`,
            amount: Math.floor(Math.random() * 5000),
            status: "DRAFT",
            dueDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        });
    };

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Finance: Invoices</h1>
                <Button onClick={handleCreateMockInvoice} disabled={createInvoiceMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search invoices..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Due Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.filter(i => i.customerName.toLowerCase().includes(search.toLowerCase())).map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-medium">{inv.customerName}</TableCell>
                                    <TableCell>${Number(inv.amount).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={inv.status === 'PAID' ? 'default' : 'outline'}>
                                            {inv.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{inv.dueDate}</TableCell>
                                </TableRow>
                            ))}
                            {invoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No invoices found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
