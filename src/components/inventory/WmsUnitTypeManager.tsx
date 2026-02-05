
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Plus, Trash2, Package } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function WmsUnitTypeManager() {
    const [isOpen, setIsOpen] = useState(false);
    const warehouseId = "UNIT-TYPE-TEST"; // Context
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Form
    const [formData, setFormData] = useState({
        code: '', description: '', length: '', width: '', height: '', maxWeight: ''
    });

    const { data: unitTypes, isLoading } = useQuery({
        queryKey: ['wmsUnitTypes'],
        queryFn: async () => {
            const res = await fetch(`/api/wms/unit-types?warehouseId=${warehouseId}`);
            if (!res.ok) throw new Error("Failed to fetch unit types");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const payload = { ...data, warehouseId };
            const res = await fetch('/api/wms/unit-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to create unit type");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wmsUnitTypes'] });
            setIsOpen(false);
            setFormData({ code: '', description: '', length: '', width: '', height: '', maxWeight: '' });
            toast({ title: "Unit Type Created" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/wms/unit-types/${id}`, { method: 'DELETE' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wmsUnitTypes'] });
            toast({ title: "Unit Type Deleted" });
        }
    });

    return (
        <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Package className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold tracking-tight">Handling Unit Types</h2>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Define Handling Unit Type</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Code (e.g. PALLET-STD)</label>
                                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Length (cm)</label>
                                    <Input type="number" value={formData.length} onChange={(e) => setFormData({ ...formData, length: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Width (cm)</label>
                                    <Input type="number" value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Height (cm)</label>
                                    <Input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Max Weight (kg)</label>
                                <Input type="number" value={formData.maxWeight} onChange={(e) => setFormData({ ...formData, maxWeight: e.target.value })} />
                            </div>
                            <Button className="w-full" onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Saving..." : "Save Type"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Dimensions (L x W x H)</TableHead>
                            <TableHead>Max Weight</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow> :
                            unitTypes?.length === 0 ? <TableRow><TableCell colSpan={5}>No unit types defined.</TableCell></TableRow> :
                                unitTypes?.map((ut: any) => (
                                    <TableRow key={ut.id}>
                                        <TableCell className="font-medium">{ut.code}</TableCell>
                                        <TableCell>{ut.description}</TableCell>
                                        <TableCell>{ut.length} x {ut.width} x {ut.height} cm</TableCell>
                                        <TableCell>{ut.maxWeight} kg</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(ut.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
