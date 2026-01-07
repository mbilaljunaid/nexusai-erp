import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Loader2 } from "lucide-react";

interface Supplier {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
}

export function SupplierList() {
    const [search, setSearch] = useState("");
    const tenantId = "tenant-1";

    const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
        queryKey: [`/api/erp/${tenantId}/procurement/suppliers`],
    });

    const createSupplierMutation = useMutation({
        mutationFn: async (newSup: Partial<Supplier>) => {
            return apiRequest("POST", `/api/erp/${tenantId}/procurement/suppliers`, newSup);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/erp/${tenantId}/procurement/suppliers`] });
        },
    });

    const handleCreateMockSupplier = () => {
        createSupplierMutation.mutate({
            name: `Supplier ${Math.floor(Math.random() * 100)}`,
            email: `contact@supplier${Math.floor(Math.random() * 100)}.com`,
            phone: `+1-555-${Math.floor(Math.random() * 10000)}`,
            status: "ACTIVE",
        });
    };

    if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-10" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Suppliers</h2>
                <Button onClick={handleCreateMockSupplier} disabled={createSupplierMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supplier
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search suppliers..."
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
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((sup) => (
                                <TableRow key={sup.id}>
                                    <TableCell className="font-medium">{sup.name}</TableCell>
                                    <TableCell>{sup.email}</TableCell>
                                    <TableCell>{sup.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant={sup.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {sup.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {suppliers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No suppliers found
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
