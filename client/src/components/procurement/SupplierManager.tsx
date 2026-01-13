import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function SupplierManager() {
    const { toast } = useToast();
    const [newSupplier, setNewSupplier] = useState({ supplierName: "", supplierNumber: "" });

    const { data: suppliers = [], isLoading: supLoading } = useQuery<any[]>({
        queryKey: ["/api/procurement/suppliers"],
        queryFn: () => fetch("/api/procurement/suppliers").then(r => r.json()).catch(() => [])
    });

    const createSupplierMutation = useMutation({
        mutationFn: (data: any) => fetch("/api/procurement/suppliers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/suppliers"] });
            setNewSupplier({ supplierName: "", supplierNumber: "" });
            toast({ title: "Supplier created" });
        }
    });

    const deleteSupplierMutation = useMutation({
        mutationFn: (id: string) => fetch(`/api/procurement/suppliers/${id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/procurement/suppliers"] });
            toast({ title: "Supplier deleted" });
        }
    });

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Add New Supplier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            placeholder="Supplier Name"
                            value={newSupplier.supplierName}
                            onChange={(e) => setNewSupplier({ ...newSupplier, supplierName: e.target.value })}
                        />
                        <Input
                            placeholder="Supplier Number"
                            value={newSupplier.supplierNumber}
                            onChange={(e) => setNewSupplier({ ...newSupplier, supplierNumber: e.target.value })}
                        />
                    </div>
                    <Button
                        disabled={createSupplierMutation.isPending || !newSupplier.supplierName}
                        className="w-full"
                        onClick={() => createSupplierMutation.mutate(newSupplier)}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Create Supplier
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Suppliers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {supLoading ? <p>Loading...</p> : suppliers.length === 0 ? <p className="text-muted-foreground">No suppliers</p> : suppliers.map((s: any) => (
                        <div key={s.id} className="p-3 border rounded-lg hover-elevate flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold">{s.supplierName}</h4>
                                <p className="text-xs text-muted-foreground">#{s.supplierNumber}</p>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => deleteSupplierMutation.mutate(s.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
