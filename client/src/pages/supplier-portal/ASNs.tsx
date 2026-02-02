import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { CreateASNModal } from "@/components/supplier-portal/CreateASNModal";

export default function SupplierASNs() {
    const token = localStorage.getItem("supplier_token");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: asns, isLoading } = useQuery({
        queryKey: ["/api/portal/supplier/asns"],
        queryFn: async () => {
            const res = await fetch("/api/portal/supplier/asns", {
                headers: { "x-portal-token": token || "" }
            });
            if (!res.ok) throw new Error("Failed to fetch ASNs");
            return res.json();
        }
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Shipments (ASN)</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create ASN
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Shipment History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ASN Number</TableHead>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Shipped Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {asns?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No shipments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                asns?.map((asn: any) => (
                                    <TableRow key={asn.id}>
                                        <TableCell className="font-medium">{asn.asnNumber}</TableCell>
                                        <TableCell>{asn.poNumber}</TableCell>
                                        <TableCell>{asn.shippedDate ? format(new Date(asn.shippedDate), 'MMM d, yyyy') : '-'}</TableCell>
                                        <TableCell><Badge variant="secondary">{asn.status}</Badge></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CreateASNModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        </div>
    );
}
